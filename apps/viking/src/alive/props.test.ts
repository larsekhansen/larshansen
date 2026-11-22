import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DOORWAY, ENEMY, FACADE, GLASS, ICY, INK, LAMP, MASONRY, METAL, PAINT, PALETTE, PARADE, RIVER, ROLES, TRAM, WHITE } from "@larshansen/pixelkit/palette";
import { mix } from "@larshansen/pixelkit/paint";
import * as HILL from "@larshansen/pixelkit/swatches/hill";
import * as V from "@larshansen/pixelkit/swatches/park";
import * as SITE from "@larshansen/pixelkit/swatches/site";
import * as K from "@larshansen/pixelkit/swatches/sledge";
import { BUILT, loadLevel } from "../levels/index";
import { areaRecorder, deltaE, levelPaint, parseColour } from "../render/fields";
import { target } from "@larshansen/pixelkit/paint";
import { PROPS, panelDoor, type Stuff } from "./props";

// Order 28 (ADR 0051): the last flat things. Every prop at arm's length that a level draws is a textured piece of the props
// kit (`alive/props.ts`), of its place; no prop is neon (neon is the glamour's: ADR 0050); every material keeps order 26's
// band (three to five tones of one hue, its contrast below the figures'); and no prop comes nearer any role's colours than
// the flat drawing it replaced.

const rgb = (c: string) => parseColour(c)!.rgb;
const P = PALETTE;

/** The kinds each level must draw from the kit (its lamp posts, railings, walls, doors, boats: what the old flat drawing was). */
const EXPECTED: Record<string, string[]> = {
  langkaia: ["plank wall", "pontoons", "sauna cabin", "post", "leg", "ladder", "rail tube", "rowboat", "hut door"],
  akershus: ["fire basket"],
  radhuset: ["lamp square", "rail bars", "ferry", "gondola"],
  slottet: ["barrier", "baluster", "rail tube"],
  holmenkollen: ["post", "chair"],
  akerselva: ["log"],
  ekeberg: ["rail tube", "lamp old", "tram"],
  nabolaget: ["lamp old", "plank wall", "rail bars", "post", "tram"],
  vigelandsparken: ["lamp park", "gate pillar", "gate lantern"],
  korketrekkeren: ["light pole"],
  bjorvika: ["site fence", "container"],
  gamlebyen: ["lamp old"]
};

/**
 * What each level's props were drawn in before order 28 (their flat drawings' colours, read from the code at dbfea3d). The lane's
 * props may come no nearer any role than these did: every colour a level's props are drawn in now that its flat props were not
 * stands, role by role, at least as far off as the nearest of its flat props did, or 10 or more off (the palette test's
 * distance for anything that covers a field), whichever is less (as order 26 held the ground to the level's ground before it).
 */
const tar = [PAINT.tar, mix(PAINT.tar, INK, 0.35), mix(PAINT.tar, INK, 0.5), mix(PAINT.tar, WHITE, 0.15), mix(PAINT.tar, P.water, 0.5), INK, METAL.brass, P.woodDark, LAMP, METAL.pipe, METAL.pipeCap];
const lamp = [METAL.lampPost, METAL.lampHat, METAL.lampGlass];
/** The blue tram as it was drawn a column at a time before order 31 (Ekeberg's and Vålerenga's): its body, skirt, roof's edge and lamp-yellow windows. */
const tram = [TRAM.body, TRAM.skirt, mix(TRAM.body, WHITE, 0.3), LAMP];
const OLD: Record<string, string[]> = {
  langkaia: [PAINT.red, PAINT.redLine, PAINT.ochre, PAINT.ochreLine, PAINT.trim, ...tar, mix(P.woodDark, WHITE, 0.15), FACADE.marbleWall, WHITE, FACADE.marbleSeam, METAL.rail, P.wood, mix(P.wood, WHITE, 0.3)],
  akershus: [METAL.lampPost, mix(METAL.lampPost, WHITE, 0.3)],
  radhuset: [...lamp, METAL.castIron, PAINT.ferryWhite, PAINT.ferryShade, PAINT.ferryRed, GLASS.pane, WHITE, INK, METAL.pipe, mix(METAL.pipe, WHITE, 0.35), METAL.rail, PAINT.tbane, mix(PAINT.tbane, WHITE, 0.4)],
  slottet: [P.iron, PARADE.russ, INK, mix(MASONRY.worn, INK, 0.1), MASONRY.worn, METAL.castIron],
  // The chairlift's chairs as they were before order 32: a red seat lit on top, the hanger, back and footrest in the cable's grey.
  holmenkollen: [METAL.lampPost, ICY.rail, mix(ICY.rail, WHITE, 0.4), METAL.wire],
  // The river's logs as they were before order 32: bark lit on its top, darker fissures, the sawn ends and a ring.
  akerselva: [RIVER.log, RIVER.logLight, mix(RIVER.log, INK, 0.25), RIVER.logEnd, RIVER.logRing],
  stortinget: [PAINT.shopDoor, PAINT.shopDoorPanel, METAL.brass, DOORWAY.wood],
  ekeberg: [HILL.rail, ...lamp, LAMP, ...tram],
  nabolaget: [...lamp, LAMP, ...tram, PAINT.red, PAINT.redLine, PAINT.trim, PAINT.ochre, PAINT.ochreLine, PAINT.homeDoor, PAINT.homeDoorPanel, METAL.brass, DOORWAY.wood],
  vigelandsparken: [V.iron, mix(P.sail, WHITE, 0.3), P.sailStripe, V.granite, V.graniteLight, V.graniteShade],
  korketrekkeren: [METAL.lampPost, INK, K.lantern],
  bjorvika: [SITE.fence, WHITE, mix(SITE.fence, SITE.shore, 0.25), SITE.graniteDark, SITE.hut, SITE.hutDark, SITE.hutLight],
  gamlebyen: [METAL.lampPost]
};

/** The roles (ADR 0039, 0044) a prop must not come nearer than its old self: him, what hurts, where he stands, what he takes, a boss's "now", what he uses, the calm outline. */
const ROLE_NAMES = ["him", "enemy", "stand", "take", "now", "use", "calm"];

/** Every level's lane drawn as the palette test draws it, with the props kit noting what it drew and in what colours, and the doors besides. */
const inksOf: Record<string, Set<string>> = {};
async function drawEveryLevel() {
  PROPS.stuffs = new Set();
  const used: Record<string, Set<string>> = {};
  for (const st of BUILT) {
    PROPS.used = new Set();
    PROPS.inks = new Map();
    levelPaint(await loadLevel(st.id), "day");
    // Doors are drawn from the scene's doors, which the walk has none of: the kiosk's and the home's, shut and open.
    target(areaRecorder().ctx);
    for (const open of [false, true]) {
      const door = { id: "d", kind: "door", x: 0, w: 14, h: 30, bottom: 100, sign: "", name: "", href: null, soon: false, secret: false, open, shake: 0 };
      if (st.id === "stortinget") panelDoor(door, PAINT.shopDoor, PAINT.shopDoorPanel);
      if (st.id === "nabolaget") panelDoor(door, PAINT.homeDoor, PAINT.homeDoorPanel);
    }
    used[st.id] = PROPS.used;
    inksOf[st.id] = new Set([...PROPS.inks.values()].flatMap((x) => [...x]));
  }
  PROPS.used = undefined;
  PROPS.inks = undefined;
  return used;
}

describe("the last flat things (order 28)", () => {
  test("every level draws its lamp posts, railings, walls, doors and boats from the props kit, and no level draws the kit's flat lamp post or panel door", async () => {
    const used = await drawEveryLevel();
    const missing: string[] = [];
    for (const [id, kinds] of Object.entries(EXPECTED)) for (const k of kinds) if (!used[id]?.has(k)) missing.push(`${id}: ${k}`);
    expect(missing).toEqual([]);
    // The flat drawers are the front page's (the kit's `lampPost`, `panelDoor`): no level of the viking game calls them.
    const dir = join(import.meta.dir, "../levels");
    const flat = readdirSync(dir)
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
      .filter((f) => /\b(lampPost|panelDoor)\b[^\n]*from "@larshansen\/pixelkit\/props"/.test(readFileSync(join(dir, f), "utf8")));
    expect(flat).toEqual([]);
  }, 120_000);

  test("every level that draws a prop has its old drawing's colours to stand against", () => {
    const drawing = Object.entries(inksOf).filter(([, inks]) => inks.size).map(([id]) => id);
    expect(drawing.length).toBeGreaterThanOrEqual(11);
    expect(drawing.filter((id) => !OLD[id])).toEqual([]);
  });

  test("no prop is neon: every colour a prop is drawn in stands 8 or more off the glamour's family", () => {
    const neon: string[] = [];
    for (const [kind, inks] of Object.entries(inksOf))
      for (const c of inks)
        for (const n of ROLES.glamour) {
          const d = deltaE(rgb(c), rgb(n));
          if (d < 8) neon.push(`${kind}: ${c} near ${n} (${d.toFixed(1)})`);
        }
    expect(neon).toEqual([]);
  });

  test("no level's props come nearer any role's colours than its flat props did, or than 10", () => {
    const near: string[] = [];
    const table: string[] = [];
    for (const [id, inks] of Object.entries(inksOf)) {
      const old = OLD[id];
      if (!old || !inks.size) continue;
      const parts: string[] = [];
      for (const role of ROLE_NAMES) {
        const colours = ROLES.COLOURS[role];
        const least = (cs: Iterable<string>) => Math.min(...[...cs].flatMap((c) => colours.map((r) => deltaE(rgb(c), rgb(r)))));
        const before = least(old);
        const after = least(inks);
        parts.push(`${role} ${before.toFixed(1)}→${after.toFixed(1)}`);
        const bound = Math.min(before, 10);
        for (const c of inks) {
          if (old.includes(c)) continue;
          const d = least([c]);
          if (d < bound - 0.05) near.push(`${id}: ${c} near ${role}, ${d.toFixed(2)} (its flat props ${before.toFixed(2)}, so at least ${bound.toFixed(2)})`);
        }
      }
      table.push(`${id}: ${parts.join(", ")}`);
    }
    console.log(`The props against the roles, level by level, the least distance of its flat props → of its props now (CIEDE2000):\n  ${table.join("\n  ")}`);
    expect(near).toEqual([]);
  });

  test("every material is three to five tones of one hue, its contrast below the figures' (order 26's band)", () => {
    const figures = Math.min(...[ENEMY.plum, ENEMY.orange, ENEMY.poison, ENEMY.pink, ENEMY.white].map((b) => deltaE(rgb(b), rgb(ENEMY.line))), deltaE(rgb(ROLES.him.tunic), rgb(ROLES.him.skin)));
    const wrong: string[] = [];
    const table: string[] = [];
    for (const s of PROPS.stuffs ?? new Set<Stuff>()) {
      const tones = [...new Set(s.ramp)];
      const span = deltaE(rgb(s.ramp[0]), rgb(s.ramp[s.ramp.length - 1]));
      table.push(`${s.name}: ${tones.length} tones, darkest to lightest ${span.toFixed(1)}`);
      if (tones.length < 3 || tones.length > 5) wrong.push(`${s.name}: ${tones.length} tones`);
      if (span > 40 || span >= figures) wrong.push(`${s.name}: darkest to lightest ${span.toFixed(1)} (the figures ${figures.toFixed(1)})`);
    }
    console.log(`The props' materials (the figures' contrast ${figures.toFixed(1)}):\n  ${table.sort().join("\n  ")}`);
    expect(wrong).toEqual([]);
  });
});
