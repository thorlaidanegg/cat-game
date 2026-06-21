/**
 * The heart of the world: heartfelt little messages.
 *
 * `loveNotes` are the ones found on scattered paper notes (picnic + everywhere).
 * `objectInteractions` are tied to specific things she can click in the world.
 */

export const loveNotes: string[] = [
  "I miss your smile ❤️",
  "You make every day brighter.",
  "I can't wait to see you again.",
  "Thank you for existing.",
  "You are my favorite person.",
  "Every little thing reminds me of you.",
  "You're the calm in all my noise.",
  "I'd cross any distance for you.",
  "You feel like home.",
  "My favorite hello, my hardest goodbye.",
  "I keep all your laughs in my pocket.",
  "You're the best part of my day, every day.",
  "Even the moon misses you when you're gone.",
  "I love the way you see the world.",
  "You make ordinary moments magical.",
  "I'm so proud of the person you are.",
  "You deserve every soft and gentle thing.",
  "I'd choose you in every lifetime.",
  "Your happiness is my favorite project.",
  "I think about you more than I should admit.",
  "You're my safe place.",
  "I love you on the loud days and the quiet ones.",
  "You are enough, exactly as you are.",
  "I saved a hug here for whenever you need it.",
  "You're my favorite notification.",
  "Distance just means I love you across more miles.",
  "I hope this little world holds you while I can't.",
  "You're the sweetest thought I have.",
  "I'd build a thousand worlds to make you smile.",
  "You make my heart feel like spring.",
  "Whatever you're worried about — I believe in you.",
  "You're allowed to rest here. I've got you.",
  "I love your sleepy voice and your big dreams.",
  "You are deeply, ridiculously loved.",
  "I miss holding your hand.",
  "You turn my bad days soft.",
  "Somewhere, I'm thinking of you right now.",
  "You're my favorite kind of forever.",
  "I love how kind you are, even when it's hard.",
  "You're worth every wait.",
  "I kept your favorite color in the sky for you.",
  "You make me want to be gentler with the world.",
  "I love you in a way that doesn't need words, but here are some.",
  "You're the wish I keep making.",
  "Take your time here. I'm not going anywhere.",
  "You're the reason I believe in cozy little things.",
  "I'd give you the last bite, always.",
  "You're my best good thing.",
  "I love you to the lake and back.",
  "If you're reading this, I'm missing you extra today.",
  "You + me, always figuring it out together.",
  "You're proof that good things are real.",
];

/** Special messages tied to specific objects in the world. */
export const objectInteractions = {
  flower: [
    "You are prettier than these.",
    "Picked this one just for you.",
    "Flowers grow toward the light, like I lean toward you.",
  ],
  bench: [
    "I wish you were sitting beside me.",
    "Rest here a while. I'll keep you company.",
  ],
  swing: [
    "One day we'll swing together.",
    "Higher! I'd push you all afternoon.",
  ],
  sky: [
    "No matter where we are, we're under the same sky.",
    "Make a wish on the next star — I already used mine on you.",
  ],
  tree: [
    "Our story keeps growing.",
    "Carved a little forever into this one.",
  ],
  lake: [
    "Skipped a stone and thought of you.",
    "Even the ducks think you're cute.",
  ],
  lantern: [
    "Lit this one so you're never in the dark.",
    "A tiny light, holding a tiny wish for you.",
  ],
  teddy: [
    "Hug him when you can't hug me.",
    "He's a stand-in. I'm the real thing, soon.",
  ],
} as const;

export type InteractionKind = keyof typeof objectInteractions;

/** Picks a stable-ish message for an interaction kind. */
export function pickInteraction(kind: InteractionKind): string {
  const arr = objectInteractions[kind];
  return arr[Math.floor(Math.random() * arr.length)];
}
