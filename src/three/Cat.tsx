import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Mesh, MathUtils, Vector3 } from "three";
import { useInput } from "./controls/useInput";
import { areaAt, areaCenter, WORLD_RADIUS } from "./layout";
import { useGame, RACE_LAPS } from "../store/useGame";
import { audio } from "../audio/AudioManager";
import { swingRuntime } from "./swingRuntime";
import { catRuntime } from "./catRuntime";
import { carRuntime } from "./carRuntime";

let raceReportT = 0; // throttle store writes for the race clock

const WALK_SPEED = 6;
const RUN_SPEED = 11;
const TURN_RATE = 9;

type Mood = "idle" | "walk" | "run" | "sit" | "sleep";

/**
 * The player's fluffy cat: fully procedural geometry with layered animation.
 *
 * Three animation layers run every frame:
 *  1. locomotion  – position + heading from WASD / joystick, camera-relative.
 *  2. gait         – legs, body bob and tail driven by current speed.
 *  3. life          – blinking, breathing, ear twitches and autonomous moods
 *                     (sits / sleeps when left idle, perks up when you move).
 */
export default function Cat() {
  const { camera } = useThree();
  const { sample } = useInput();

  const root = useRef<Group>(null);
  const rig = useRef<Group>(null); // everything that bobs/squashes
  const head = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const earL = useRef<Mesh>(null);
  const earR = useRef<Mesh>(null);
  const lidL = useRef<Mesh>(null);
  const lidR = useRef<Mesh>(null);
  const legs = useRef<(Mesh | null)[]>([]);

  // mutable locomotion state kept out of React
  const state = useRef({
    pos: new Vector3(0, 0, 6),
    heading: Math.PI,
    speed: 0,
    walkPhase: 0,
    vy: 0,
    grounded: true,
    idleTime: 0,
    blinkTimer: 2,
    blinking: 0,
    mood: "idle" as Mood,
    areaTimer: 0,
  });

  // scratch vectors (avoid per-frame allocation)
  const scratch = useMemo(
    () => ({
      camForward: new Vector3(),
      camRight: new Vector3(),
      move: new Vector3(),
      desiredCam: new Vector3(),
      lookAt: new Vector3(),
      offset: new Vector3(),
    }),
    []
  );

  useFrame((stThree, delta) => {
    const s = state.current;
    const inp = sample();
    const phase = useGame.getState().phase;

    // ---- teleport request (from the games panel) --------------------------
    if (catRuntime.teleport) {
      s.pos.copy(catRuntime.teleport);
      s.speed = 0;
      s.idleTime = 0;
      catRuntime.teleport = null;
    }

    // ---- riding the swing -------------------------------------------------
    // When mounted, the cat is glued to the published seat transform and leans
    // with the arc; movement is disabled. Camera still orbits via drag.
    if (phase === "playing" && useGame.getState().riding === "swing") {
      const seat = swingRuntime.seat;
      s.pos.lerp(seat, 0.5);
      if (root.current) {
        root.current.position.set(seat.x, seat.y + 0.2, seat.z);
        root.current.rotation.set(swingRuntime.angle * 0.7, swingRuntime.yaw, 0);
      }
      // a little life: tail flick + happy blink so the cat isn't frozen
      if (tail.current) tail.current.rotation.z = Math.sin(stThree.clock.elapsedTime * 6) * 0.4;
      if (lidL.current && lidR.current) {
        const t = stThree.clock.elapsedTime;
        const lid = t % 3 < 0.12 ? 1 : 0;
        lidL.current.scale.y = MathUtils.lerp(lidL.current.scale.y, lid, 0.4);
        lidR.current.scale.y = MathUtils.lerp(lidR.current.scale.y, lid, 0.4);
      }
      // camera orbit around the swinging cat
      const d = 13;
      scratch.offset.set(
        Math.sin(inp.yaw) * Math.cos(inp.pitch) * d,
        Math.sin(inp.pitch) * d + 3.5,
        Math.cos(inp.yaw) * Math.cos(inp.pitch) * d
      );
      scratch.desiredCam.copy(s.pos).add(scratch.offset);
      camera.position.lerp(scratch.desiredCam, 1 - Math.pow(0.004, delta));
      scratch.lookAt.copy(s.pos).add(new Vector3(0, 1.2, 0));
      camera.lookAt(scratch.lookAt);
      return;
    }

    // ---- driving the race car --------------------------------------------
    if (phase === "playing" && useGame.getState().riding === "car") {
      const c = carRuntime;
      const ACCEL = 26, BRAKE = 34, MAX = 26, MAXREV = 8, DRAG = 0.7, TURN = 2.4;

      // throttle / brake / reverse (smooth, continuous)
      if (inp.forward > 0) c.speed += ACCEL * inp.forward * delta;
      else if (inp.forward < 0) c.speed += BRAKE * inp.forward * delta;
      else c.speed -= Math.sign(c.speed) * Math.min(Math.abs(c.speed), 8 * delta); // coast down
      c.speed -= c.speed * DRAG * delta;
      c.speed = MathUtils.clamp(c.speed, -MAXREV, MAX);

      // steering: A = left, D = right. Smoothed so it never feels twitchy.
      const steerGain = MathUtils.clamp(c.speed / 6, -1, 1);
      c.steer = MathUtils.lerp(c.steer, -inp.strafe, 1 - Math.pow(0.0001, delta));
      c.heading += c.steer * TURN * delta * steerGain;

      // integrate position along the heading
      const fx = Math.sin(c.heading);
      const fz = Math.cos(c.heading);
      c.pos.x += fx * c.speed * delta;
      c.pos.z += fz * c.speed * delta;
      c.wheelSpin += c.speed * delta * 2.2;

      // --- keep the car on the road by clamping to the centerline curve ---
      const S = c.samples;
      let frac = c.prevFrac;
      if (S.length > 2) {
        // find nearest centerline sample (coarse but cheap)
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < S.length; i++) {
          const ddx = c.pos.x - S[i].x;
          const ddz = c.pos.z - S[i].z;
          const d = ddx * ddx + ddz * ddz;
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        const p = S[best];
        const nxt = S[(best + 1) % S.length];
        // road tangent + left-normal
        let tx = nxt.x - p.x;
        let tz = nxt.z - p.z;
        const tl = Math.hypot(tx, tz) || 1;
        tx /= tl;
        tz /= tl;
        const nx = tz;
        const nz = -tx;
        // lateral offset of the car from the centerline
        const lat = (c.pos.x - p.x) * nx + (c.pos.z - p.z) * nz;
        const maxLat = c.half - 0.6;
        if (Math.abs(lat) > maxLat) {
          const pull = lat - Math.sign(lat) * maxLat;
          c.pos.x -= nx * pull; // slide back onto the road (keeps momentum → smooth)
          c.pos.z -= nz * pull;
          c.speed *= 0.985; // a touch of scrub, no harsh bounce
        }
        frac = best / S.length;
      }

      // --- lap progress on the closed curve ---
      if (Math.abs(c.speed) > 1.5 && !c.started) {
        c.started = true;
        c.startMs = performance.now();
        c.prevFrac = frac;
        c.progress = 0;
      }
      if (c.started) {
        let d = frac - c.prevFrac;
        if (d > 0.5) d -= 1; // wrap
        if (d < -0.5) d += 1;
        c.progress += d;
        c.prevFrac = frac;
        const g2 = useGame.getState();
        const lapsDone = Math.max(0, Math.floor(c.progress));
        const elapsed = performance.now() - c.startMs;
        if (!g2.raceFinished) {
          if (lapsDone >= RACE_LAPS) g2.finishRace(elapsed);
          else {
            raceReportT += delta;
            if (raceReportT > 0.1) {
              raceReportT = 0;
              g2.setRaceProgress(lapsDone, elapsed);
            }
          }
        }
      }

      // glue the cat into the driver seat (lean into turns a little)
      s.pos.set(c.pos.x, 0, c.pos.z);
      if (root.current) {
        root.current.position.set(c.pos.x, 0.62, c.pos.z);
        root.current.rotation.set(0, c.heading, -c.steer * 0.12);
      }

      // smooth chase camera behind the car
      const camDist = 16;
      const camH = 8;
      scratch.desiredCam.set(c.pos.x - fx * camDist, camH, c.pos.z - fz * camDist);
      camera.position.lerp(scratch.desiredCam, 1 - Math.pow(0.015, delta));
      scratch.lookAt.set(c.pos.x + fx * 6, 1.4, c.pos.z + fz * 6);
      camera.lookAt(scratch.lookAt);
      return;
    }

    // ---- 1. locomotion ----------------------------------------------------
    const wantMove = phase === "playing" && (inp.forward !== 0 || inp.strafe !== 0);

    // camera-relative ground basis.
    // The camera sits at cat + (sin,cos)*dist, so "into the screen" (forward,
    // the W key) is the *opposite* of that — hence the negative signs.
    scratch.camForward.set(-Math.sin(inp.yaw), 0, -Math.cos(inp.yaw)).normalize();
    scratch.camRight.set(Math.cos(inp.yaw), 0, -Math.sin(inp.yaw));
    scratch.move
      .set(0, 0, 0)
      .addScaledVector(scratch.camForward, inp.forward)
      .addScaledVector(scratch.camRight, inp.strafe);

    const targetSpeed = wantMove ? (inp.run ? RUN_SPEED : WALK_SPEED) : 0;
    s.speed = MathUtils.lerp(s.speed, targetSpeed, 1 - Math.pow(0.001, delta));

    if (scratch.move.lengthSq() > 0.0001) {
      scratch.move.normalize();
      s.heading = Math.atan2(scratch.move.x, scratch.move.z);
      s.pos.addScaledVector(scratch.move, s.speed * delta);
      s.idleTime = 0;
      s.mood = inp.run ? "run" : "walk";
    } else {
      s.idleTime += delta;
    }

    // gentle jump
    if (inp.jump && s.grounded && phase === "playing") {
      s.vy = 7.5;
      s.grounded = false;
      s.idleTime = 0;
    }
    s.vy -= 22 * delta;
    s.pos.y += s.vy * delta;
    if (s.pos.y <= 0) {
      s.pos.y = 0;
      s.vy = 0;
      s.grounded = true;
    }

    // keep within the world
    const flat = Math.hypot(s.pos.x, s.pos.z);
    if (flat > WORLD_RADIUS) {
      s.pos.x = (s.pos.x / flat) * WORLD_RADIUS;
      s.pos.z = (s.pos.z / flat) * WORLD_RADIUS;
    }

    // autonomous moods when idle: sit, then drift to sleep
    if (s.speed < 0.4 && s.grounded) {
      if (s.idleTime > 14) s.mood = "sleep";
      else if (s.idleTime > 6) s.mood = "sit";
      else s.mood = "idle";
    }

    // apply to the root group
    if (root.current) {
      root.current.position.copy(s.pos);
      root.current.rotation.y = MathUtils.lerp(
        root.current.rotation.y,
        s.heading,
        1 - Math.pow(0.0001, delta * (TURN_RATE / 9))
      );
    }

    // ---- 2. gait ----------------------------------------------------------
    s.walkPhase += s.speed * delta * 2.2;
    const stride = MathUtils.clamp(s.speed / WALK_SPEED, 0, 1.6);
    legs.current.forEach((leg, i) => {
      if (!leg) return;
      const offset = i < 2 ? 0 : Math.PI; // front pair vs back pair alternate
      const side = i % 2 === 0 ? 0 : Math.PI;
      leg.rotation.x = Math.sin(s.walkPhase + offset + side) * 0.6 * stride;
    });

    const sitting = s.mood === "sit" || s.mood === "sleep";
    if (rig.current) {
      // squash down when sitting/sleeping, bob while moving, breathe when still
      const sitY = sitting ? -0.25 : 0;
      const bob = Math.sin(s.walkPhase * 2) * 0.06 * stride;
      const breathe = Math.sin(performance.now() / 700) * 0.02;
      rig.current.position.y = MathUtils.lerp(rig.current.position.y, sitY + bob + breathe, 0.15);
      rig.current.scale.y = MathUtils.lerp(rig.current.scale.y, sitting ? 0.85 : 1, 0.1);
      rig.current.rotation.x = MathUtils.lerp(
        rig.current.rotation.x,
        s.mood === "sleep" ? 0.15 : 0,
        0.08
      );
    }

    // tail: lazy sway, faster when moving, curls when sleeping
    if (tail.current) {
      const sway = Math.sin(performance.now() / 500 + s.walkPhase) * (0.25 + stride * 0.4);
      tail.current.rotation.z = sway;
      tail.current.rotation.x = MathUtils.lerp(
        tail.current.rotation.x,
        s.mood === "sleep" ? -0.8 : -0.3,
        0.08
      );
    }

    // ---- 3. life: head, ears, blinking -----------------------------------
    if (head.current) {
      const tilt = s.mood === "sleep" ? 0.4 : Math.sin(performance.now() / 1500) * 0.05;
      head.current.rotation.z = MathUtils.lerp(head.current.rotation.z, tilt, 0.05);
      head.current.rotation.x = MathUtils.lerp(
        head.current.rotation.x,
        sitting ? -0.1 : 0.05,
        0.05
      );
    }
    // occasional ear twitch
    const twitch = Math.sin(performance.now() / 130) * (Math.random() > 0.997 ? 0.4 : 0);
    if (earL.current) earL.current.rotation.z = 0.3 + twitch;
    if (earR.current) earR.current.rotation.z = -0.3 - twitch;

    // blinking (and eyes held closed while sleeping)
    let lid: number;
    if (s.mood === "sleep") {
      lid = 1;
    } else {
      s.blinkTimer -= delta;
      if (s.blinking > 0) {
        s.blinking -= delta;
        if (s.blinking <= 0) s.blinkTimer = 1.5 + Math.random() * 4;
      } else if (s.blinkTimer <= 0) {
        s.blinking = 0.14; // start a quick blink
      }
      // triangular open->closed->open over the blink window
      lid = s.blinking > 0 ? 1 - Math.abs(s.blinking / 0.14 - 0.5) * 2 : 0;
    }
    if (lidL.current) lidL.current.scale.y = MathUtils.lerp(lidL.current.scale.y, lid, 0.6);
    if (lidR.current) lidR.current.scale.y = MathUtils.lerp(lidR.current.scale.y, lid, 0.6);

    // ---- camera follow ----------------------------------------------------
    const dist = 15; // pulled back for a calmer, more zoomed-out view
    scratch.offset.set(
      Math.sin(inp.yaw) * Math.cos(inp.pitch) * dist,
      Math.sin(inp.pitch) * dist + 4,
      Math.cos(inp.yaw) * Math.cos(inp.pitch) * dist
    );
    scratch.desiredCam.copy(s.pos).add(scratch.offset);
    if (phase === "ending") {
      // slow orbit around the heart tree for the ending
      const t = performance.now() / 5200;
      const c = areaCenter("heart");
      scratch.desiredCam.set(c.x + Math.cos(t) * 12, 6 + Math.sin(t * 0.5) * 1.5, c.z + Math.sin(t) * 12);
      scratch.lookAt.set(c.x, 2.5, c.z);
      camera.position.lerp(scratch.desiredCam, 0.02);
      camera.lookAt(scratch.lookAt);
    } else {
      camera.position.lerp(scratch.desiredCam, 1 - Math.pow(0.002, delta));
      scratch.lookAt.copy(s.pos).add(new Vector3(0, 1.4, 0));
      camera.lookAt(scratch.lookAt);
    }

    // ---- area + audio sync + ending trigger -------------------------------
    s.areaTimer += delta;
    if (s.areaTimer > 0.4) {
      s.areaTimer = 0;
      const area = areaAt(s.pos);
      const g = useGame.getState();
      if (area !== g.area) {
        g.setArea(area);
        audio.setMood(area);
      }
      // walking into the heart of the Heart Garden begins the ending
      if (area === "heart" && s.pos.distanceTo(areaCenter("heart")) < 4.5 && phase === "playing") {
        g.triggerEnding();
      }
    }
  });

  // soft, cute pastel cat materials
  const fur = "#fdeede"; // creamy white
  const furSoft = "#f7ddc4"; // gentle peach shading
  const belly = "#fffaf3";
  const pink = "#ff9ec2";
  const cheek = "#ffb3c8";

  return (
    <group ref={root} position={[0, 0, 6]} scale={1.15}>
      <group ref={rig}>
        {/* chunky rounded body */}
        <mesh castShadow position={[0, 0.55, 0]} scale={[1, 0.92, 1.2]}>
          <sphereGeometry args={[0.6, 28, 24]} />
          <meshStandardMaterial color={fur} roughness={0.9} />
        </mesh>
        {/* soft belly patch */}
        <mesh position={[0, 0.4, 0.35]} scale={[0.78, 0.82, 0.7]}>
          <sphereGeometry args={[0.5, 24, 20]} />
          <meshStandardMaterial color={belly} roughness={0.95} />
        </mesh>

        {/* fat fluffy tail (two segments) */}
        <group ref={tail} position={[0, 0.6, -0.62]}>
          <mesh castShadow position={[0, 0.25, -0.2]} rotation={[-0.5, 0, 0]}>
            <capsuleGeometry args={[0.16, 0.5, 8, 12]} />
            <meshStandardMaterial color={furSoft} roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 0.6, -0.28]}>
            <sphereGeometry args={[0.19, 16, 14]} />
            <meshStandardMaterial color={fur} roughness={0.9} />
          </mesh>
        </group>

        {/* stubby little legs */}
        {[
          [-0.28, 0.34],
          [0.28, 0.34],
          [-0.28, -0.3],
          [0.28, -0.3],
        ].map(([x, z], i) => (
          <mesh key={i} ref={(m) => (legs.current[i] = m)} castShadow position={[x, 0.18, z]}>
            <capsuleGeometry args={[0.16, 0.12, 6, 10]} />
            <meshStandardMaterial color={furSoft} roughness={0.9} />
          </mesh>
        ))}

        {/* BIG round head (chibi proportions) */}
        <group ref={head} position={[0, 1.05, 0.5]}>
          <mesh castShadow>
            <sphereGeometry args={[0.58, 28, 24]} />
            <meshStandardMaterial color={fur} roughness={0.9} />
          </mesh>

          {/* big rounded ears with pink inner */}
          <mesh ref={earL} position={[-0.34, 0.46, -0.02]} rotation={[0, 0, 0.35]}>
            <coneGeometry args={[0.22, 0.4, 16]} />
            <meshStandardMaterial color={fur} roughness={0.9} />
          </mesh>
          <mesh ref={earR} position={[0.34, 0.46, -0.02]} rotation={[0, 0, -0.35]}>
            <coneGeometry args={[0.22, 0.4, 16]} />
            <meshStandardMaterial color={fur} roughness={0.9} />
          </mesh>
          <mesh position={[-0.34, 0.44, 0.06]} rotation={[0, 0, 0.35]} scale={0.62}>
            <coneGeometry args={[0.22, 0.4, 16]} />
            <meshStandardMaterial color={pink} roughness={0.9} />
          </mesh>
          <mesh position={[0.34, 0.44, 0.06]} rotation={[0, 0, -0.35]} scale={0.62}>
            <coneGeometry args={[0.22, 0.4, 16]} />
            <meshStandardMaterial color={pink} roughness={0.9} />
          </mesh>

          {/* big sparkly eyes */}
          {[-0.22, 0.22].map((x, i) => (
            <group key={i} position={[x, 0.05, 0.46]}>
              <mesh scale={[0.85, 1.15, 0.7]}>
                <sphereGeometry args={[0.15, 20, 20]} />
                <meshStandardMaterial color="#3a2b33" roughness={0.25} />
              </mesh>
              {/* two highlights for that lively, dewy look */}
              <mesh position={[0.05, 0.06, 0.1]}>
                <sphereGeometry args={[0.05, 10, 10]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
              </mesh>
              <mesh position={[-0.03, -0.04, 0.11]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
              </mesh>
              {/* eyelid that scales down from the top to blink */}
              <mesh ref={i === 0 ? lidL : lidR} position={[0, 0.04, 0.05]} scale={[1, 0, 1]}>
                <sphereGeometry args={[0.17, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={fur} roughness={0.9} />
              </mesh>
            </group>
          ))}

          {/* rosy blush cheeks */}
          {[-0.34, 0.34].map((x) => (
            <mesh key={x} position={[x, -0.12, 0.4]} scale={[1, 0.7, 0.4]}>
              <sphereGeometry args={[0.12, 14, 12]} />
              <meshStandardMaterial color={cheek} roughness={0.9} transparent opacity={0.85} />
            </mesh>
          ))}

          {/* tiny nose + smile */}
          <mesh position={[0, -0.04, 0.57]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color={pink} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.14, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#a8788a" />
          </mesh>

          {/* whiskers — cylinders rotated to point sideways out of the cheeks */}
          {[-1, 1].map((s) =>
            [-0.05, 0.05].map((yy) => (
              <mesh
                key={`${s}-${yy}`}
                position={[s * 0.52, yy - 0.04, 0.42]}
                rotation={[0, 0, s * (Math.PI / 2) + yy]}
              >
                <cylinderGeometry args={[0.004, 0.004, 0.32, 4]} />
                <meshStandardMaterial color="#e8d8cc" />
              </mesh>
            ))
          )}
        </group>
      </group>
    </group>
  );
}
