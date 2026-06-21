import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { useGame } from "../../store/useGame";
import { pickInteraction } from "../../data/messages";
import { swingRuntime } from "../swingRuntime";

/** A cozy wooden bench you can click to read a little message. */
export function Bench({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
      onClick={(e) => {
        e.stopPropagation();
        useGame.getState().showMessage(pickInteraction("bench"));
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* seat (rounded slats) */}
      {[-0.18, 0, 0.18].map((z) => (
        <mesh key={z} castShadow position={[0, 0.45, z]}>
          <boxGeometry args={[1.9, 0.09, 0.14]} />
          <meshStandardMaterial color="#ffd9a0" roughness={0.8} />
        </mesh>
      ))}
      {/* backrest slats */}
      {[0.7, 0.92].map((y) => (
        <mesh key={y} castShadow position={[0, y, -0.28]}>
          <boxGeometry args={[1.9, 0.12, 0.08]} />
          <meshStandardMaterial color="#ffcf8f" roughness={0.8} />
        </mesh>
      ))}
      {/* a little heart on the backrest */}
      <mesh position={[0, 0.82, -0.33]} scale={0.13}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#ff7aa8" emissive="#ff4f86" emissiveIntensity={0.3} />
      </mesh>
      {/* legs + armrests */}
      {[-0.85, 0.85].map((x) => (
        <group key={x}>
          <mesh castShadow position={[x, 0.22, 0]}>
            <boxGeometry args={[0.12, 0.44, 0.6]} />
            <meshStandardMaterial color="#e7a17a" roughness={0.85} />
          </mesh>
          <mesh castShadow position={[x, 0.62, -0.28]}>
            <boxGeometry args={[0.12, 0.5, 0.1]} />
            <meshStandardMaterial color="#e7a17a" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A gently swinging swing — the seat sways forever on its own. */
const ROPE = 2.7;
const TOP_Y = 3.9;
const OMEGA = 1.55; // pendulum speed

/**
 * Playable swing mini-game.
 *
 * Click it (the cat hops on). While riding, tap SPACE in rhythm to "pump" and
 * build amplitude; the swing decays gently when you stop. The seat transform is
 * published to `swingRuntime` so the Cat rides along, and the peak height is
 * reported to the store as a best-score. Press E or the on-screen button to hop
 * off. When nobody's riding, it sways lazily on its own.
 */
export function Swing({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const seat = useRef<Group>(null);

  // keep the published base position + yaw in sync with our props
  swingRuntime.base.set(position[0], position[1], position[2]);
  swingRuntime.yaw = rotation;

  // SPACE to pump / E to dismount, but only while actually riding
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (useGame.getState().riding !== "swing") return;
      if (e.code === "Space") {
        e.preventDefault();
        swingRuntime.pumpRequested = true;
      }
      if (e.code === "KeyE") useGame.getState().dismountSwing();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useFrame((state, delta) => {
    const riding = useGame.getState().riding === "swing";
    const r = swingRuntime;

    if (riding) {
      // pump: a tap adds energy; the swing always bleeds a little
      if (r.pumpRequested) {
        r.amplitude = Math.min(1.35, r.amplitude + 0.16);
        r.pumpRequested = false;
      }
      r.amplitude *= 1 - 0.22 * delta;
      r.amplitude = Math.max(0.05, r.amplitude);
      r.phase += OMEGA * delta;
      r.angle = r.amplitude * Math.sin(r.phase);
      // height of the seat above its lowest point, in playful "cm"
      const cm = ROPE * (1 - Math.cos(r.amplitude)) * 100;
      useGame.getState().reportSwingHeight(cm);
    } else {
      // lazy idle sway
      r.amplitude += (0.28 - r.amplitude) * Math.min(1, delta * 2);
      r.phase += 1.3 * delta;
      r.angle = r.amplitude * Math.sin(r.phase);
    }

    if (seat.current) seat.current.rotation.x = r.angle;

    // publish world-space seat position for the Cat to ride.
    // The seat hangs at local (0,-ROPE,0) and the pivot rotates by `angle`
    // about X, so the seat lands at z = -ROPE*sin(angle) (note the sign — this
    // is what keeps the cat perfectly in phase with the visible seat).
    const yLocal = TOP_Y - ROPE * Math.cos(r.angle);
    const zLocal = -ROPE * Math.sin(r.angle);
    r.seat.set(
      position[0] + zLocal * Math.sin(rotation),
      position[1] + yLocal,
      position[2] + zLocal * Math.cos(rotation)
    );
  });

  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
      onClick={(e) => {
        e.stopPropagation();
        const g = useGame.getState();
        if (g.riding === "swing") return;
        g.showMessage(pickInteraction("swing"));
        g.mountSwing();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* A-frame legs (taller, splayed) */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh castShadow position={[s * 1.7, 1.95, 0.95]} rotation={[0.42, 0, s * 0.12]}>
            <cylinderGeometry args={[0.1, 0.12, 4.7, 12]} />
            <meshStandardMaterial color="#e7a17a" roughness={0.85} />
          </mesh>
          <mesh castShadow position={[s * 1.7, 1.95, -0.95]} rotation={[-0.42, 0, s * 0.12]}>
            <cylinderGeometry args={[0.1, 0.12, 4.7, 12]} />
            <meshStandardMaterial color="#e7a17a" roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* top bar */}
      <mesh position={[0, TOP_Y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 3.6, 12]} />
        <meshStandardMaterial color="#d98f6a" roughness={0.85} />
      </mesh>

      {/* a cute striped canopy roof over the top bar */}
      <group position={[0, TOP_Y + 0.55, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[(i - 3.5) * 0.46, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.46, 1.7, 0.06]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#ff9ec2" : "#fff3f7"} roughness={0.8} />
          </mesh>
        ))}
        {/* scalloped front trim */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`t${i}`} position={[(i - 3.5) * 0.46, -0.05, 0.85]}>
            <sphereGeometry args={[0.12, 10, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#fff3f7" : "#ff9ec2"} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* seat + ropes pivoting from the top bar */}
      <group ref={seat} position={[0, TOP_Y, 0]}>
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, -ROPE / 2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, ROPE, 6]} />
            <meshStandardMaterial color="#a9785c" />
          </mesh>
        ))}
        {/* plush rounded seat */}
        <mesh castShadow position={[0, -ROPE, 0]}>
          <boxGeometry args={[1.6, 0.22, 0.8]} />
          <meshStandardMaterial color="#ff7aa8" roughness={0.7} />
        </mesh>
        <mesh position={[0, -ROPE + 0.2, 0]} scale={0.18}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#fff" emissive="#ff4f86" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/** A paper lantern that glows warmly at night. */
export function Lantern({ position }: { position: [number, number, number] }) {
  const light = useRef<any>(null);
  useFrame((state) => {
    const night = useGame.getState().time;
    const dark = night < 0.22 || night > 0.8 ? 1 : 0.05;
    if (light.current) {
      light.current.intensity =
        MathUtils.lerp(light.current.intensity, dark * (1.4 + Math.sin(state.clock.elapsedTime * 3) * 0.15), 0.1);
    }
  });
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        useGame.getState().showMessage(pickInteraction("lantern"));
      }}
    >
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2, 6]} />
        <meshStandardMaterial color="#6b4f3a" />
      </mesh>
      <mesh castShadow position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.28, 16, 14]} />
        <meshStandardMaterial color="#ffd9a0" emissive="#ffb84d" emissiveIntensity={0.8} />
      </mesh>
      <pointLight ref={light} position={[0, 2.1, 0]} color="#ffcf8f" distance={8} intensity={0} />
    </group>
  );
}

/** A big, bright, cute playground slide. */
export function Slide({
  position,
  rotation = 0,
  scale = 1.8,
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  const PH = 2.4; // platform height
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* top platform */}
      <mesh castShadow position={[0, PH, -1]}>
        <boxGeometry args={[1.5, 0.18, 1.5]} />
        <meshStandardMaterial color="#ffd36e" roughness={0.7} />
      </mesh>
      {/* little safety rails around the platform */}
      {[-0.66, 0.66].map((x) => (
        <mesh key={x} castShadow position={[x, PH + 0.45, -1]}>
          <boxGeometry args={[0.1, 0.7, 1.5]} />
          <meshStandardMaterial color="#ff9ec2" roughness={0.8} />
        </mesh>
      ))}
      {/* support posts */}
      {[
        [-0.62, -1.6],
        [0.62, -1.6],
        [-0.62, -0.4],
        [0.62, -0.4],
      ].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, PH / 2, z]}>
          <cylinderGeometry args={[0.09, 0.09, PH, 10]} />
          <meshStandardMaterial color="#a9d8ff" roughness={0.8} />
        </mesh>
      ))}

      {/* curved chute: a few angled segments for a swooping slide */}
      {[
        { y: PH - 0.15, z: 0.2, rot: -0.95, len: 1.4 },
        { y: PH - 1.0, z: 1.25, rot: -0.6, len: 1.4 },
        { y: PH - 1.7, z: 2.5, rot: -0.18, len: 1.6 },
      ].map((seg, i) => (
        <group key={i}>
          <mesh castShadow position={[0, seg.y, seg.z]} rotation={[seg.rot, 0, 0]}>
            <boxGeometry args={[1.1, 0.12, seg.len]} />
            <meshStandardMaterial color="#7fd7ff" roughness={0.35} metalness={0.15} />
          </mesh>
          {[-0.55, 0.55].map((x) => (
            <mesh key={x} position={[x, seg.y + 0.18, seg.z]} rotation={[seg.rot, 0, 0]}>
              <boxGeometry args={[0.1, 0.34, seg.len]} />
              <meshStandardMaterial color="#5cc8ff" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ladder */}
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, PH / 2, -1.95]}>
          <cylinderGeometry args={[0.06, 0.06, PH, 8]} />
          <meshStandardMaterial color="#d6a8ff" />
        </mesh>
      ))}
      {[0.5, 0.95, 1.4, 1.85].map((y) => (
        <mesh key={y} position={[0, y, -1.95]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 1.0, 6]} />
          <meshStandardMaterial color="#c08bff" />
        </mesh>
      ))}
    </group>
  );
}

/** A small arched bridge for the lake. */
export function Bridge({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.15, 4]} />
        <meshStandardMaterial color="#c98f63" roughness={0.9} />
      </mesh>
      {[-0.8, 0.8].map((x) =>
        [-1.6, 1.6].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.55, z]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
            <meshStandardMaterial color="#a9785c" />
          </mesh>
        ))
      )}
    </group>
  );
}
