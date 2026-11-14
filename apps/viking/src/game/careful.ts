import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { stepBody, type Intent } from "@larshansen/pixelkit/physics";
import { zonePush } from "@larshansen/pixelkit/zone";
import { enemyBox } from "./enemies";
import { extraGround, type Play } from "./play";

// Walking to a clicked or tapped spot in a level, carefully: a click is a way to stroll, not to
// play, so it never jumps, it stops at an edge rather than walk him off it into water or a pit (or
// down any drop), and it stops before an enemy rather than walk into it. The line map and the front
// page keep the kit's plain walk, hops and all.

const STILL: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };

/** The walk's keys for this step without its hops, or null when he must stop here: the next step and letting go would leave the ground, or something that hurts is just ahead. */
export function carefulStep(p: Play, k: Intent): Intent | null {
  const dir = k.right ? 1 : k.left ? -1 : 0;
  const walk = { ...k, jumpHeld: false, jumpPressed: false };
  if (dir === 0 || !p.body.onGround) return walk;
  return staysOnGround(p, walk) && !hurtsAhead(p, dir) ? walk : null;
}

/** Would he still be standing if he took this step and then let go? The body's own rules, a second and a half ahead (ice slides a long way). */
export function staysOnGround(p: Play, k: Intent): boolean {
  const b = { ...p.body };
  for (let i = 1; i <= 90; i++) {
    const t = p.t + i;
    stepBody(b, i === 1 ? k : STILL, p.map, {}, { carriers: extraGround(p, t), surfaceAt: p.def.surfaceAt ? (x, y) => p.def.surfaceAt!(x, y, t) : undefined, push: zonePush(p.def.zones, b, t) });
    if (!b.onGround) return false;
    if (Math.abs(b.vx) < 0.05) return true;
  }
  return true;
}

/** Something that hurts within two tiles ahead of him, at his height: an enemy, the troll, the last boss. */
export function hurtsAhead(p: Play, dir: 1 | -1): boolean {
  const b = p.body;
  const reach = { x: dir > 0 ? b.x : b.x - 2 * TILE, y: b.y - 4, w: PLAYER.w + 2 * TILE, h: PLAYER.h + 8 };
  const meets = (r: { x: number; y: number; w: number; h: number } | null) => !!r && r.x < reach.x + reach.w && r.x + r.w > reach.x && r.y < reach.y + reach.h && r.y + r.h > reach.y;
  if (p.enemies.some((e) => meets(enemyBox(e, p.t)))) return true;
  const ahead = { ...b, x: b.x + dir * 2 * TILE };
  return !!(p.troll && p.def.trollRules?.hurts(p.troll, p.t, ahead)) || !!(p.boss && p.boss.rules.hurts(p.boss.state, p.t, ahead));
}
