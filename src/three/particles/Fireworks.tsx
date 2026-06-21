import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, Color, Points } from "three";
import { useGame } from "../../store/useGame";

const COUNT = 320; // particle pool
const COLORS = ["#ff6f91", "#ffd36e", "#7fd7ff", "#d6a8ff", "#9be88f", "#ffffff"];

/**
 * Celebratory fireworks over the finish line. A fixed particle pool is recycled
 * into bursts while `raceFinished` is true, then fades out. Cheap: one Points
 * object, integrated on the CPU.
 */
export default function Fireworks({ position }: { position: [number, number, number] }) {
  const points = useRef<Points>(null);

  const { positions, colors, vel, life } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const life = new Float32Array(COUNT); // <=0 means dead/idle
    for (let i = 0; i < COUNT; i++) positions[i * 3 + 1] = -999; // hide initially
    return { positions, colors, vel, life };
  }, []);

  const burstTimer = useRef(0);
  const scratch = useMemo(() => new Color(), []);

  useFrame((_, dt) => {
    const finished = useGame.getState().raceFinished;
    const pts = points.current;
    if (!pts) return;
    const pos = pts.geometry.getAttribute("position") as BufferAttribute;
    const col = pts.geometry.getAttribute("color") as BufferAttribute;

    // launch a new burst every so often while celebrating
    if (finished) {
      burstTimer.current -= dt;
      if (burstTimer.current <= 0) {
        burstTimer.current = 0.55;
        launchBurst();
      }
    }

    // integrate live particles
    for (let i = 0; i < COUNT; i++) {
      if (life[i] <= 0) {
        if (pos.array[i * 3 + 1] !== -999) {
          pos.array[i * 3 + 1] = -999;
          pos.needsUpdate = true;
        }
        continue;
      }
      life[i] -= dt;
      vel[i * 3 + 1] -= 3.2 * dt; // gravity
      pos.array[i * 3] += vel[i * 3] * dt;
      pos.array[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos.array[i * 3 + 2] += vel[i * 3 + 2] * dt;
      pos.needsUpdate = true;
    }
    col.needsUpdate = true;

    function launchBurst() {
      const ox = position[0] + (Math.random() - 0.5) * 16;
      const oy = position[1] + 7 + Math.random() * 4;
      const oz = position[2] + (Math.random() - 0.5) * 12;
      scratch.set(COLORS[Math.floor(Math.random() * COLORS.length)]);
      let launched = 0;
      for (let i = 0; i < COUNT && launched < 55; i++) {
        if (life[i] > 0) continue;
        launched++;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const sp = 3 + Math.random() * 3;
        vel[i * 3] = Math.sin(phi) * Math.cos(theta) * sp;
        vel[i * 3 + 1] = Math.cos(phi) * sp;
        vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * sp;
        pos.array[i * 3] = ox;
        pos.array[i * 3 + 1] = oy;
        pos.array[i * 3 + 2] = oz;
        col.array[i * 3] = scratch.r;
        col.array[i * 3 + 1] = scratch.g;
        col.array[i * 3 + 2] = scratch.b;
        life[i] = 1.2 + Math.random() * 0.8;
      }
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.35}
        vertexColors
        transparent
        opacity={0.95}
        blending={AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
