import { R, view } from "@larshansen/pixelkit/paint";
import { LAMP, PALETTE } from "@larshansen/pixelkit/palette";

// Square particles, for the moments that should read at a glance: the curse taking him, a stone
// lighting, the key, a teleport, the finish, and dust at his feet. Whole art pixels, no rotation,
// no blur, drawn after the night tint so they show; each burst is seeded, so the same moment looks
// the same every time (and in a screenshot). Under reduced motion there are none.

const P = PALETTE;

export type Burst = "curse" | "stone" | "key" | "teleport" | "finish" | "dust";

interface Spec {
  n: number;
  speed: [number, number];
  /** Added to every particle's vertical speed: negative rises. */
  lift: number;
  life: [number, number];
  size: [number, number];
  /** Colours it runs through as it ages. */
  colors: readonly string[];
  /** Share of its speed kept each step. */
  drag: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Steps lived, and steps it lives. */
  age: number;
  life: number;
  size: number;
  spec: Spec;
}

const SPECS: Record<Burst, Spec> = {
  curse: { n: 22, speed: [0.7, 2.2], lift: 0, life: [26, 44], size: [1, 2], colors: [P.curseFlash, P.curseSpark, P.curseSpark, P.curseSparkDark], drag: 0.9 },
  stone: { n: 14, speed: [0.2, 0.7], lift: -0.45, life: [30, 50], size: [1, 1], colors: ["#ffffff", P.runeGlow, P.runeGlow], drag: 0.96 },
  key: { n: 12, speed: [0.4, 1.2], lift: -0.2, life: [24, 40], size: [1, 1], colors: ["#fff3b0", P.runeGlow, "#e8d27a"], drag: 0.92 },
  teleport: { n: 12, speed: [0.3, 0.9], lift: -0.35, life: [20, 34], size: [1, 1], colors: ["#e9f6ff", P.portalGlow, P.portalGlow], drag: 0.94 },
  finish: { n: 18, speed: [0.3, 1.1], lift: -0.3, life: [30, 50], size: [1, 2], colors: ["#ffffff", P.daylight, LAMP], drag: 0.95 },
  // In the colours of the floor in his torchlight, a little paler, so it shows.
  dust: { n: 3, speed: [0.1, 0.35], lift: -0.04, life: [14, 22], size: [1, 2], colors: [P.dust, P.dust, P.dustFaint], drag: 0.9 }
};

export interface Fx {
  /** A burst of `kind` at world (x, y); `seed` makes it the same every time. `away` sends it that way (dust, behind him). */
  burst(kind: Burst, x: number, y: number, seed: number, away?: { x: number; y: number }): void;
  step(): void;
  draw(): void;
  clear(): void;
  readonly count: number;
}

export function createFx(): Fx {
  const list: Particle[] = [];
  return {
    burst(kind, x, y, seed, away) {
      if (view.reduced) return;
      const spec = SPECS[kind];
      let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
      const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
      const between = ([a, b]: [number, number]) => a + (b - a) * rnd();
      for (let i = 0; i < spec.n; i++) {
        const a = away ? Math.atan2(away.y, away.x) + (rnd() - 0.5) * 1.6 : (i / spec.n) * Math.PI * 2 + rnd() * 0.6;
        const v = between(spec.speed);
        // Starting a little way out from the middle, so even the first frames read as a burst.
        const out = away ? 0 : 2 + rnd() * 2;
        list.push({
          x: x + Math.cos(a) * out + (rnd() - 0.5) * 2,
          y: y + Math.sin(a) * out + (rnd() - 0.5) * 2,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v + spec.lift,
          age: 0,
          life: Math.round(between(spec.life)),
          size: Math.round(between(spec.size)),
          spec
        });
      }
    },
    step() {
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.spec.drag;
        p.vy *= p.spec.drag;
        if (++p.age >= p.life) list.splice(i, 1);
      }
    },
    draw() {
      for (const p of list) {
        const colors = p.spec.colors;
        // Colours run from the first to the last as it ages; the last few steps it is a single pixel.
        const k = Math.min(colors.length - 1, Math.floor((p.age / p.life) * colors.length));
        const size = p.age > p.life - 6 ? 1 : p.size;
        R(Math.round(p.x), Math.round(p.y), size, size, colors[k]);
      }
    },
    clear() {
      list.length = 0;
    },
    get count() {
      return list.length;
    }
  };
}
