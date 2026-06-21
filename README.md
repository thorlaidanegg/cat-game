# A Tiny World For You ❤️

A cozy, dreamy, interactive 3D world — a little apology gift made with love.
Wander a soft pastel island as a fluffy cat, find handwritten love notes, pop
heart bubbles, watch the day turn to a starry night, and discover the glowing
Heart Garden at the end.

Built with **React + TypeScript + Three.js + React Three Fiber + drei +
postprocessing + GSAP + Framer Motion + Tailwind + Vite**.

## Run it

```bash
npm install
npm run dev      # open the printed http://localhost:5173 link
```

Production build:

```bash
npm run build
npm run preview
```

## How to play

- **Move:** `W A S D` / arrow keys · hold **Shift** to run · **Space** to hop
- **Look:** click-drag to orbit the camera
- **Mobile:** a touch joystick appears bottom-left; drag to move, drag elsewhere to look
- **Click things:** flowers (pick them 🌸), benches, trees, the swing, lanterns,
  the lake, and the little paper notes (each opens a love message ❤️)
- **Pop heart bubbles** floating over the meadow to collect hearts
- Use the 🕒 button (top-right) to switch from the auto day/night cycle to a
  manual time slider — try sunset and night for fireflies + stars
- Walk into the centre of the **Heart Garden** (far corner) to trigger the ending

## The world

One connected island with six themed areas, auto-detected as the cat walks
between them (each swaps the ambient music mood):

| Area | Highlights |
|------|-----------|
| Flower Meadow | swaying flowers, butterflies, heart-bubble mini-game, swing |
| Quiet Lake | reflective water, bobbing ducks, lily pads, bridge, night lanterns |
| Picnic Spot | blanket, cake, teddy, and the bulk of the 50+ love notes |
| Sakura Garden | pink blossom trees, falling petals, mushrooms |
| Stargazing Hill | telescope + blanket, best under the night sky |
| Heart Garden | the glowing heart tree — walk close to begin the ending |

## Architecture

```
src/
  store/useGame.ts        # single zustand store: phase, area, time, collectibles, messages
  data/messages.ts        # 50+ love notes + per-object interaction messages
  audio/AudioManager.ts   # procedural WebAudio ambient music, crossfades per area
  ui/                     # IntroLetter, HUD, NotePopup, EndingOverlay, Joystick, LoadingVeil
  three/
    Experience.tsx        # the Canvas: lighting, postprocessing (bloom/vignette/SMAA)
    SkyDayNight.tsx       # one source of truth for sun, sky, lights, stars, clouds
    Cat.tsx               # procedural cat: locomotion + gait + life (blink/ears/tail/moods)
    World.tsx             # composes every area + scattered props + particles
    Ground.tsx            # the grassy island + tinted area pads
    layout.ts             # area centres/radii + helpers (areaAt, seeded RNG)
    controls/             # keyboard + pointer-orbit input, shared mobile joystick vector
    props/                # Nature, Structures, Lake, Note, HeartTree
    particles/            # Butterflies, Fireflies, Petals, HeartBubbles
```

The render loop never allocates per-frame (scratch vectors are reused), the cat
is animated in three independent layers, and `AdaptiveDpr` + instanced petals
keep things smooth toward a 60 FPS target.

## A note on assets

Every model here is **procedural** — built from Three.js geometry with soft
pastel materials — so the project runs fully offline with **zero licensing
concerns** and stays light. If you'd like to drop in real `.glb` models later
(from Poly Pizza, Quaternius, Sketchfab CC, etc.), each prop is an isolated
component: replace the JSX inside `Cat.tsx`, `props/Nature.tsx`, etc. with a
`useGLTF()` load and everything else (controls, animation hooks, interactions)
keeps working.

Background music is **synthesised** with the Web Audio API (gentle, royalty-free
by construction). To use real tracks, swap the body of `AudioManager.playMood`
for `HTMLAudioElement` crossfades — the public surface stays the same.

Made with love. Distance is temporary. 💖
