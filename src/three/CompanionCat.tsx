import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MathUtils, Vector3 } from "three";
import CatModel from "./CatModel";
import { catRuntime } from "./catRuntime";
import { carRuntime } from "./carRuntime";
import { WORLD_RADIUS } from "./layout";
import { useGame } from "../store/useGame";
import { pickCompanionLine } from "../data/messages";

/**
 * The companion cat — that's *you*. Not controllable: it lovingly follows her
 * cat around the park, trails a step behind, sits and watches while she plays
 * the swing/slide, and rides along on the back of the car during a race. Click
 * (pet) it for a sweet little message and a floating heart.
 */
export default function CompanionCat() {
  const root = useRef<Group>(null);
  const rig = useRef<Group>(null);
  const head = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const earL = useRef<Mesh>(null);
  const earR = useRef<Mesh>(null);
  const lidL = useRef<Mesh>(null);
  const lidR = useRef<Mesh>(null);
  const legs = useRef<(Mesh | null)[]>([]);
  const heart = useRef<Group>(null);

  const st = useRef({
    pos: new Vector3(1.6, 0, 7.5),
    heading: 0,
    speed: 0,
    walkPhase: 0,
    blinkTimer: 2,
    blinking: 0,
    heartT: 0, // >0 while a love-heart floats up after petting
  });

  const tmp = useMemo(
    () => ({ desired: new Vector3(), dir: new Vector3(), forward: new Vector3(), right: new Vector3() }),
    []
  );

  useFrame((three, delta) => {
    const s = st.current;
    const riding = useGame.getState().riding;
    const player = catRuntime.pos;

    let targetY = 0;
    let snap = false; // ride modes place the cat directly

    if (riding === "car") {
      // sit on the back of the car, facing forward — riding along together
      const h = carRuntime.heading;
      tmp.forward.set(Math.sin(h), 0, Math.cos(h));
      tmp.desired.copy(carRuntime.pos).addScaledVector(tmp.forward, -1.05);
      targetY = 0.55;
      snap = true;
      s.heading = h;
    } else if (riding === "swing" || riding === "slide") {
      // stand on the ground near the activity and watch (don't chase into the air)
      tmp.desired.set(player.x + 2.2, 0, player.z + 1.2);
      // face the player
      s.heading = Math.atan2(player.x - s.pos.x, player.z - s.pos.z);
    } else {
      // normal: trail a step behind-and-beside her
      tmp.forward.set(Math.sin(catRuntime.heading), 0, Math.cos(catRuntime.heading));
      tmp.right.set(Math.cos(catRuntime.heading), 0, -Math.sin(catRuntime.heading));
      tmp.desired
        .copy(player)
        .addScaledVector(tmp.forward, -2.0)
        .addScaledVector(tmp.right, 1.1);
    }

    if (snap) {
      s.pos.lerp(tmp.desired, 1 - Math.pow(0.0001, delta));
      s.speed = 0;
    } else {
      tmp.dir.subVectors(tmp.desired, s.pos);
      tmp.dir.y = 0;
      const dist = tmp.dir.length();
      const targetSpeed = dist > 4 ? 12 : dist > 1.1 ? 7 : 0;
      s.speed = MathUtils.lerp(s.speed, targetSpeed, 1 - Math.pow(0.002, delta));
      if (dist > 0.05 && targetSpeed > 0) {
        tmp.dir.normalize();
        s.pos.addScaledVector(tmp.dir, s.speed * delta);
        s.heading = Math.atan2(tmp.dir.x, tmp.dir.z);
      } else if (riding === "swing" || riding === "slide") {
        // keep facing the player while watching
        s.heading = Math.atan2(player.x - s.pos.x, player.z - s.pos.z);
      }
      // keep inside the world
      const flat = Math.hypot(s.pos.x, s.pos.z);
      if (flat > WORLD_RADIUS) {
        s.pos.x = (s.pos.x / flat) * WORLD_RADIUS;
        s.pos.z = (s.pos.z / flat) * WORLD_RADIUS;
      }
    }

    // apply transform
    if (root.current) {
      root.current.position.set(s.pos.x, targetY, s.pos.z);
      root.current.rotation.y = MathUtils.lerp(root.current.rotation.y, s.heading, 1 - Math.pow(0.0008, delta));
    }

    // gait + bob
    s.walkPhase += s.speed * delta * 2.2;
    const stride = MathUtils.clamp(s.speed / 7, 0, 1.5);
    legs.current.forEach((leg, i) => {
      if (!leg) return;
      const off = i < 2 ? 0 : Math.PI;
      const side = i % 2 === 0 ? 0 : Math.PI;
      leg.rotation.x = Math.sin(s.walkPhase + off + side) * 0.6 * stride;
    });
    if (rig.current) {
      const bob = Math.sin(s.walkPhase * 2) * 0.06 * stride + Math.sin(three.clock.elapsedTime * 1.4) * 0.02;
      rig.current.position.y = MathUtils.lerp(rig.current.position.y, bob, 0.15);
    }
    // happy tail wag (faster when close / idle, like an excited pet)
    if (tail.current) {
      tail.current.rotation.z = Math.sin(three.clock.elapsedTime * (5 + stride * 3)) * (0.3 + stride * 0.3);
      tail.current.rotation.x = -0.3;
    }
    // look toward the player with the head
    if (head.current) {
      const want = Math.atan2(player.x - s.pos.x, player.z - s.pos.z) - s.heading;
      head.current.rotation.y = MathUtils.lerp(head.current.rotation.y, MathUtils.clamp(want, -0.7, 0.7) * 0.5, 0.1);
    }

    // blinking
    let lid = 0;
    s.blinkTimer -= delta;
    if (s.blinking > 0) {
      s.blinking -= delta;
      if (s.blinking <= 0) s.blinkTimer = 1.5 + Math.random() * 4;
    } else if (s.blinkTimer <= 0) s.blinking = 0.14;
    if (s.blinking > 0) lid = 1 - Math.abs(s.blinking / 0.14 - 0.5) * 2;
    if (lidL.current) lidL.current.scale.y = MathUtils.lerp(lidL.current.scale.y, lid, 0.6);
    if (lidR.current) lidR.current.scale.y = MathUtils.lerp(lidR.current.scale.y, lid, 0.6);

    // floating love-heart after petting
    if (heart.current) {
      if (s.heartT > 0) {
        s.heartT -= delta;
        const k = 1 - s.heartT / 1.4;
        heart.current.visible = true;
        heart.current.position.set(0, 1.9 + k * 0.8, 0.3);
        heart.current.scale.setScalar(0.0001 + Math.sin(Math.min(1, k) * Math.PI) * 0.18);
      } else {
        heart.current.visible = false;
      }
    }
  });

  return (
    <group
      ref={root}
      position={[1.6, 0, 7.5]}
      scale={1.08}
      onClick={(e) => {
        e.stopPropagation();
        useGame.getState().showMessage(pickCompanionLine());
        st.current.heartT = 1.4;
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <group ref={rig}>
        <CatModel
          // a soft blue-grey "boy" palette so the pair is distinguishable
          colors={{ fur: "#cfe0f5", furSoft: "#b9cde8", belly: "#f2f7ff", pink: "#ffb3c8", cheek: "#ffc2d2" }}
          parts={{ head, tail, earL, earR, lidL, lidR, legs }}
          accessory={
            // a little bow tie on the chest
            <group position={[0, 0.66, 0.46]}>
              <mesh position={[-0.12, 0, 0]} rotation={[0, 0, 0.5]}>
                <coneGeometry args={[0.12, 0.22, 4]} />
                <meshStandardMaterial color="#ff6f91" roughness={0.6} />
              </mesh>
              <mesh position={[0.12, 0, 0]} rotation={[0, 0, -0.5]}>
                <coneGeometry args={[0.12, 0.22, 4]} />
                <meshStandardMaterial color="#ff6f91" roughness={0.6} />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#d94e72" />
              </mesh>
            </group>
          }
        />
      </group>

      {/* floating heart emote when petted */}
      <group ref={heart} visible={false}>
        <mesh position={[-0.09, 0.05, 0]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#ff7aa8" emissive="#ff4f86" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.09, 0.05, 0]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#ff7aa8" emissive="#ff4f86" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.17, 0.26, 12]} />
          <meshStandardMaterial color="#ff7aa8" emissive="#ff4f86" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
