import { R } from "./paint";
import { DUST, FLAG, LAMP } from "./palette";

// Single pixels that fly and burn out: dust from a hard landing, fireworks, splashes, a rune's glint.

export interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

/** One step: every spark moves, falls a little, and burns down. Returns the ones still alight. */
export function stepSparks(sparks: Spark[]): Spark[] {
  return sparks.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    return --p.life > 0;
  });
}

/** Five grains of dust from his feet at (x, y), after a hard landing. */
export function dust(sparks: Spark[], x: number, y: number) {
  for (let i = 0; i < 5; i++) sparks.push({ x, y, vx: (i - 2) * 0.35, vy: -0.3 - Math.random() * 0.4, life: 18, color: DUST });
}

/** Three bursts in the colours of the flag, each where `at` puts it. */
export function fireworks(sparks: Spark[], at: (burst: number) => { x: number; y: number }) {
  const colors = [FLAG.red, FLAG.white, FLAG.blue, LAMP];
  for (let burst = 0; burst < 3; burst++) {
    const { x, y } = at(burst);
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const v = 0.6 + Math.random() * 0.5;
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.2, life: 50 + burst * 12, color: colors[(i + burst) % 4] });
    }
  }
}

/** In world pixels, on whatever canvas is the target. */
export function drawSparks(sparks: Spark[]) {
  for (const p of sparks) R(p.x, p.y, 1, 1, p.color);
}
