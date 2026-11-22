import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { ctx, target, view } from "@larshansen/pixelkit/paint";
import type { Body } from "@larshansen/pixelkit/physics";
import type { Board } from "@larshansen/pixelkit/text";
import { newPlay } from "../game/play";
import { NABOLAGET } from "../levels/nabolaget";
import type { View } from "../levels/types";
import { skyOf } from "./fields";
import { drawNight, drawNightKept } from "./night";

// Vålerenga's lane behind the church is dark again (order 33), drawn by `drawNightKept`: the still dark kept as paths, a path a
// darkness, filled under clips, where `drawNight` fills every piece of every row. A path of whole-pixel rectangles is filled as
// a rectangle is (checked in headless Firefox: byte for byte, source-over and destination-over, with an even-odd clip; a copy of
// a see-through piece is not), so if every pixel gets the same fills in the same order, the pictures are the same. This draws
// both into a stand-in canvas that keeps, for every pixel of the screen, the fills it got in order (their colour, alpha and how
// they are laid), at every place along the lane, both ways he can face, on a phone's screen and a desktop's.

/** A path of rectangles, as the page builds them. */
class Rects {
  rects: number[] = [];
  rect(x: number, y: number, w: number, h: number) {
    this.rects.push(x, y, w, h);
  }
  addPath(p: Rects) {
    this.rects.push(...p.rects);
  }
}

/** Each kind of fill (how it is laid, its alpha, its colour), numbered the same in every drawing. */
const ids = new Map<string, number>();

/** A canvas W x H that keeps every pixel's fills in order (as a fingerprint and a count), with translation, clips and save. */
function stage(W: number, H: number) {
  const prints = new Uint32Array(W * H).fill(0x811c9dc5);
  const counts = new Uint16Array(W * H);
  const seen = new Uint32Array(W * H);
  let fills = 0;
  let state: { tx: number; ty: number; clip: Uint8Array | null } = { tx: 0, ty: 0, clip: null };
  const stack: (typeof state)[] = [];
  /** Each pixel of the screen covered by the rectangles, by the rule: the even-odd rule counts. */
  const cover = (rects: number[], rule: string) => {
    const n = new Uint8Array(W * H);
    for (let i = 0; i < rects.length; i += 4) {
      const x0 = Math.max(0, rects[i] + state.tx);
      const x1 = Math.min(W, rects[i] + rects[i + 2] + state.tx);
      const y0 = Math.max(0, rects[i + 1] + state.ty);
      const y1 = Math.min(H, rects[i + 1] + rects[i + 3] + state.ty);
      for (let y = y0; y < y1; y++)
        if (rule === "evenodd") for (let x = x0; x < x1; x++) n[y * W + x] ^= 1;
        else n.fill(1, y * W + x0, y * W + Math.max(x0, x1));
    }
    return n;
  };
  const g = {
    fillStyle: "#000" as unknown,
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    canvas: { width: W, height: H },
    save() {
      stack.push({ ...state });
    },
    restore() {
      state = stack.pop()!;
    },
    translate(x: number, y: number) {
      state = { ...state, tx: state.tx + x, ty: state.ty + y };
    },
    clip(path: Rects, rule = "nonzero") {
      const m = cover(path.rects, rule);
      if (state.clip) for (let p = 0; p < m.length; p++) m[p] &= state.clip[p];
      state = { ...state, clip: m };
    },
    paint(rects: number[]) {
      const what = `${g.globalCompositeOperation}|${g.globalAlpha}|${String(g.fillStyle)}`;
      let id = ids.get(what);
      if (id === undefined) ids.set(what, (id = ids.size + 1));
      fills++;
      for (let i = 0; i < rects.length; i += 4) {
        const x0 = Math.max(0, rects[i] + state.tx);
        const x1 = Math.min(W, rects[i] + rects[i + 2] + state.tx);
        const y0 = Math.max(0, rects[i + 1] + state.ty);
        const y1 = Math.min(H, rects[i + 1] + rects[i + 3] + state.ty);
        for (let y = y0; y < y1; y++)
          for (let x = x0; x < x1; x++) {
            const p = y * W + x;
            // A path's pixel is filled once however many of its rectangles cover it (they never overlap here).
            if (seen[p] === fills || (state.clip && !state.clip[p])) continue;
            seen[p] = fills;
            prints[p] = Math.imul(prints[p] ^ id, 16777619);
            counts[p]++;
          }
      }
    },
    fill(path: Rects) {
      g.paint(path.rects);
    },
    fillRect(x: number, y: number, w: number, h: number) {
      g.paint([x, y, w, h]);
    },
    drawImage() {
      throw new Error("nothing is copied in the lane's dark");
    }
  };
  return { g: g as unknown as CanvasRenderingContext2D, prints, counts };
}

/** The page's view of Vålerenga at night with him at (x, y) facing `facing`, the camera on him as on an upright phone. */
let play: ReturnType<typeof newPlay> | null = null;
function placed(x: number, y: number, facing: 1 | -1, w: number, h: number) {
  const p = (play ??= newPlay(NABOLAGET, { pole: true }));
  Object.assign(view, { w, h, camX: Math.round(x - w / 2), camXf: Math.round(x - w / 2), camY: Math.round(y - (h * 2) / 3), camYf: Math.round(y - (h * 2) / 3), reduced: false });
  const v: View = { sky: skyOf(NABOLAGET, "night"), t: 900, alpha: 1, doors: new Map(), now: new Date(2026, 0, 15, 22), him: { x: x + PLAYER.w / 2, y: y + PLAYER.h / 2 }, flourish: null, facing, troll: null, flags: p.flags.map((f, i) => ({ ...f, raisedAt: p.raisedAt[i] })), enemies: p.enemies, boss: null, cleared: [], runeAt: null, grounds: null };
  const shown = { ...p.body, x, y } as Body;
  return { p, v, shown };
}

/** Two boards as the page lays them out: the sign in the lane, and one over the church's corner. */
const BOARDS: Board[] = [
  { text: "Vålerenga kirke", cx: 104 * TILE + 8, y: 17 * TILE - 30, w: 74, post: 17 * TILE },
  { text: "x", cx: 113 * TILE, y: 12 * TILE, w: 31 }
];

describe("Vålerenga's lane is dark again, kept (order 33)", () => {
  test("the kept dark is drawNight's, pixel for pixel, all along the lane, facing both ways, on a phone and a desktop", () => {
    const was = { view: { ...view }, ctx: ctx() };
    const P = globalThis as { Path2D?: unknown };
    const wrong: string[] = [];
    let compared = 0;
    let lit = 0;
    try {
      // An upright phone's screen at every place, as he walks the lane, stands on its ledges and climbs the church; a desktop's
      // where he walks it, with no boards (as the light census draws it). Every place differs from the last in where the camera
      // and the lamp fall on the still dark's pieces.
      const places: [number, number, number, number, Board[]][] = [];
      for (let x = 1236; x < 1900; x += 37) for (const y of [17, 13, 9]) places.push([240, 520, x, y * TILE - PLAYER.h, BOARDS]);
      for (let x = 1240; x < 1900; x += 83) places.push([640, 400, x, 17 * TILE - PLAYER.h, []]);
      for (const [w, h, x, y, boards] of places)
              for (const facing of [1, -1] as const) {
                const { v, shown, p } = placed(x, y, facing, w, h);
                const old = stage(w, h);
                target(old.g);
                drawNight(NABOLAGET, v, shown, boards, p.map);
                const kept = stage(w, h);
                target(kept.g);
                P.Path2D = Rects;
                try {
                  drawNightKept(NABOLAGET, v, shown, boards, p.map);
                } finally {
                  delete P.Path2D;
                }
                compared++;
                if (old.counts.some((c) => c > 1)) lit++;
                let bad = 0;
                let first = -1;
                for (let i = 0; i < old.prints.length; i++)
                  if (old.prints[i] !== kept.prints[i] || old.counts[i] !== kept.counts[i]) {
                    bad++;
                    if (first < 0) first = i;
                  }
                if (bad) wrong.push(`${w}x${h} at ${x},${y} facing ${facing}, ${boards.length} boards: ${bad} pixels differ, the first at ${first % w},${Math.floor(first / w)}`);
              }
    } finally {
      Object.assign(view, was.view);
      target(was.ctx);
    }
    console.log(`The lane's dark, kept and as drawNight draws it: ${compared} places compared, ${lit} with the lamp's pass over the dark`);
    expect(wrong.slice(0, 10)).toEqual([]);
    expect(lit).toBeGreaterThan(compared / 4);
  }, 300_000);

  test("with reduced motion the lane's night is still: the dark, its lights, the eyes and what is drawn over it, the clock running", () => {
    const was = { view: { ...view }, ctx: ctx() };
    const P = globalThis as { Path2D?: unknown };
    const moving: string[] = [];
    try {
      for (let x = 1240; x < 1900; x += 96)
        for (const kept of [false, true]) {
          const prints = new Set<string>();
          for (let t = 900; t < 925; t++) {
            const { v, shown, p } = placed(x, 17 * TILE - PLAYER.h, 1, 240, 520);
            view.reduced = true;
            v.t = t;
            const s = stage(240, 520);
            target(s.g);
            if (kept) P.Path2D = Rects;
            try {
              NABOLAGET.art.night!(v, shown, BOARDS, p.map);
            } finally {
              delete P.Path2D;
            }
            let h = 0;
            for (let i = 0; i < s.prints.length; i++) h = Math.imul(h ^ s.prints[i], 16777619);
            prints.add(String(h >>> 0));
          }
          if (prints.size > 1) moving.push(`at ${x}${kept ? ", kept" : ""}: ${prints.size} different pictures in 25 steps`);
        }
    } finally {
      Object.assign(view, was.view);
      target(was.ctx);
    }
    expect(moving).toEqual([]);
  }, 60_000);

  test("without paths (a stand-in canvas) or in its flourish, it is drawNight itself", () => {
    const was = { view: { ...view }, ctx: ctx() };
    try {
      for (const flourish of [null, 20]) {
        const { v, shown, p } = placed(1500, 17 * TILE - PLAYER.h, 1, 240, 520);
        v.flourish = flourish;
        const old = stage(240, 520);
        target(old.g);
        drawNight(NABOLAGET, v, shown, [], p.map);
        const kept = stage(240, 520);
        target(kept.g);
        if (flourish !== null) (globalThis as { Path2D?: unknown }).Path2D = Rects;
        try {
          drawNightKept(NABOLAGET, v, shown, [], p.map);
        } finally {
          delete (globalThis as { Path2D?: unknown }).Path2D;
        }
        expect([...kept.prints]).toEqual([...old.prints]);
      }
    } finally {
      Object.assign(view, was.view);
      target(was.ctx);
    }
  });
});
