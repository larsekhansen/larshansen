import { describe, expect, test } from "bun:test";
import { skyFor, type SkyName } from "@larshansen/pixelkit/oslo";
import { ROLES } from "@larshansen/pixelkit/palette";
import { fresh, type Progress } from "../game/progress";
import { BUILT, ORDER, loadLevel } from "../levels/index";
import { kartDef } from "../levels/kart";
import { kartArt } from "../levels/kartArt";
import type { LevelDef } from "../levels/types";
import "./feel";
import { deltaE, parseColour } from "./fields";
import { census, colourOf, type Lit } from "./lightcensus";

// After dark every light is lit, and nothing else glows (order 32, ADR 0054; DESIGN's "Lights after dark").
//
// A thing that gives light in the real place (a lamp, a lantern, a torch, a lit window, a tram's or a train's or a ferry's
// windows, a sign lit from inside, a stage's lights, a fire basket, a stove's glow) registers its glass, flame or pane as a
// light (`light()`), so after dusk it is drawn in its own colour over the night's tint. Every scene is drawn across its whole
// length as a browser draws it, the passes of a frame in order (`render/lightcensus.ts`), and every light it registers is
// noted with what registered it and what a later pass draws over it.
//
// 1. Each scene lights exactly what its row below names, and nothing else: a new light is a decision (add its row and the
//    reason), and a light gone out is found.
// 2. Nothing drawn after a light on the street dims it (a see-through fill of a later pass over it, as Korketrekkeren's dusk
//    under the trees dimmed its lit trail's lamps): a light is its own colour over the dark. What stands in front of it may
//    hide it, as by day; a level's own dark (Nordmarka's, Vålerenga's lane) must let it through.
// 3. A pool of lamplight lies on what it lights: registered after the tiles, so they never cover it (Gamlebyen's lamps and
//    torches lit the ground under the cobbles).
// 4. A light's colour is warm and natural, never the glamour's neon but where the light is the glamour's own (the encore's
//    stage, its stop on the map, the invaders' neon signs, the welder's sparks), and never mistaken for what he takes, where
//    he stands or what he uses: at least 10 (CIEDE2000) from those roles' colours, but by name.

/** What each scene lights after dark, by the function that registers it (and its file), and what that is. */
const LIT: Record<string, Record<string, string>> = {
  langkaia: {
    "lit backdrop": "the city's windows over the fjord",
    "tbane alive/ground": "the T sign's white T at the T-bane's entrance",
    "opera levels/langkaia": "the Opera's foyer behind its glass",
    "pane props": "the sheds' windows",
    "printer levels/langkaia": "the 3D printer's lamp strip and hot end in Verkstedet's window",
    "clubHut alive/props": "the sauna club's hut, its window",
    "saunaCabin alive/props": "the sauna rafts' windows, their stoves' light",
    "mooring levels/langkaia": "the buoy's light and the motor boat's wheelhouse",
    "invasion alive/invasion": "the invaders' neon sign (the glamour's own)"
  },
  akershus: {
    "lit backdrop": "the city's windows",
    "tbane alive/ground": "the T sign",
    "block levels/akershus": "the castle's buildings' windows and dormers",
    "castle levels/akershus": "Akershus slott's window",
    "spire levels/akershus": "the keep's top floor's window",
    "keepInside levels/akershus": "the fire baskets inside the keep",
    "wallDetails levels/akershus": "the arrow slits, lit from inside",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  radhuset: {
    "lit backdrop": "the city's windows",
    "tbane alive/ground": "the T sign",
    "pane props": "the windows at arm's length",
    "terminal levels/radhuset": "the ferry terminal's ticket window",
    "passage levels/radhuset": "the lamps in the passage through the west tower",
    "lamp alive/props": "the square's lamp posts",
    "lampPool props": "their light on the square",
    "ferry levels/radhuset": "the island ferry's saloon",
    "townHallFaces levels/radhuset": "the reliefs' windows",
    "windows levels/radhuset": "the towers' tall windows",
    "lantern levels/radhuset": "the lantern on the clock tower's corner",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  slottet: {
    "lit backdrop": "the city's windows",
    "tbane alive/ground": "the T sign",
    "windowRow levels/slottet": "Karl Johan's windows",
    "townHouse levels/slottet": "the town houses' shop fronts",
    "grand levels/slottet": "the Grand Hotel's ground floor and balcony",
    "win levels/slottet": "the palace's windows",
    "palace levels/slottet": "the palace's middle and its pediment's windows",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  holmenkollen: {
    "lit backdrop": "the city far below",
    "tbane alive/ground": "the T sign",
    "jump levels/holmenkollen": "the jump tower's hut",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  akerselva: {
    "lit backdrop": "the city's windows",
    "tbane alive/ground": "the T sign",
    "verksted levels/akerselva": "Myrens verksted's windows",
    "bjolsen levels/akerselva": "the mill's windows",
    "hjula levels/akerselva": "Hjula's windows",
    "runesmia levels/akerselva": "Runesmia's forge in its door",
    "vaterland levels/akerselva": "Vaterland's houses",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  nordmarka: {
    "tbane alive/ground": "the T sign",
    "ullevalseter levels/nordmarka": "Ullevålseter's one lit window",
    "invasion alive/invasion": "the invaders' neon sign, through the dark"
  },
  stortinget: {
    "tbane alive/ground": "the T sign",
    "tube levels/stortinget": "the tube lamps on the ceilings and walls",
    "train levels/stortinget": "the trains' windows",
    "board levels/stortinget": "the departure boards",
    "kiosk levels/stortinget": "the kiosk's window",
    "tunnelWall levels/stortinget": "the tunnels' small lamps",
    "cavern levels/stortinget": "the cavern's great lamps on wires",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  ekeberg: {
    "lit backdrop": "the city below, the lamp posts along the park's paths",
    "tbane alive/ground": "the T sign",
    "gamlebyen levels/ekeberg": "the old wooden houses' windows",
    "viewpoint levels/ekeberg": "Ekebergrestauranten's long windows",
    "lamp alive/props": "the viewpoint's old lamp",
    "lampPool props": "its light on the deck",
    "tram levels/ekeberg": "the tram's windows",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  nabolaget: {
    "lit backdrop": "Ekeberg's and the city's lights",
    "tbane alive/ground": "the T sign",
    "houses levels/nabolaget": "the houses' windows along the roofs",
    "lamp alive/props": "the lane's lanterns behind the church",
    "church levels/nabolaget": "the church's arched windows",
    "street levels/nabolaget": "the terrace house's windows",
    "yellowHouse levels/nabolaget": "the yellow house: its windows, its door lamp and that lamp's light on its walls",
    "streetSign levels/nabolaget": "the street plate's white rule, catching the street's light",
    "letters levels/nabolaget": "the plate's white letters, catching it",
    "tram levels/nabolaget": "the tram's windows",
    "archWindow levels/nabolaget": "Kruttverket's arched windows",
    "kruttverket levels/nabolaget": "Kruttverket's door lamp and windows"
  },
  bygdoy: {
    "lit backdrop": "the city across the water",
    "tbane alive/ground": "the T sign",
    "radhusbrygga levels/bygdoy": "the ticket kiosk at Rådhusbrygga",
    "ferry levels/bygdoy": "the ferry's wheelhouse",
    "pier levels/bygdoy": "the pier's lamp",
    "lampPool props": "its light on the planks",
    "halls levels/bygdoy": "the museums' halls and windows"
  },
  vigelandsparken: {
    "lit backdrop": "Frogner's windows far off over the park (order 43)",
    "tbane alive/ground": "the T sign",
    "gateLantern levels/vigelandsparken": "the main gate's lanterns",
    "lamp alive/props": "the bridge's lanterns",
    "lampPool props": "their light on the bridge's deck",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  korketrekkeren: {
    "tbane alive/ground": "the T sign",
    "frognerseteren levels/korketrekkeren": "Frognerseteren's windows",
    "trailLights levels/korketrekkeren": "the lit trail's lamps, over the dusk under the trees",
    "poolAlong alive/props": "their light on the run",
    "crossing levels/korketrekkeren": "the crossing's lights as the barrier comes down",
    "midtstuen levels/korketrekkeren": "Midtstuen's shelter",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  ostensjovannet: {
    "tbane alive/ground": "the T sign",
    "farShore levels/ostensjovannet": "the sun coming up behind the far shore",
    "sunrise levels/ostensjovannet": "its light along the water",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  bjorvika: {
    "tbane alive/ground": "the T sign",
    "far levels/bjorvika": "the far shore's lights and their light on the fjord",
    "mid levels/bjorvika": "the new town's windows and the towers' cranes' warning lights",
    "crane levels/bjorvika": "the cranes' warning lights at their jibs' tips",
    "welder levels/bjorvika": "the welder's arc and its sparks (under the glamour, its fire)",
    "hut levels/bjorvika": "the site hut's window",
    "cab levels/bjorvika": "the top crane's cab",
    "facade levels/bjorvika": "the towers' faces, some windows lit",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  gamlebyen: {
    "lit backdrop": "Ekeberg's slope over the old town",
    "tbane alive/ground": "the T sign",
    "far levels/gamlebyen": "the town's lights on the far slope",
    "mid levels/gamlebyen": "the roofs' windows",
    "lamp alive/props": "the street's lamps",
    "torch levels/gamlebyen": "the torches",
    "pools levels/gamlebyen": "the lamps', the torches' and the hall door's light on the ground",
    "market levels/gamlebyen": "the market hall's firelight",
    "streak levels/gamlebyen": "the torches and the moon on the water",
    "reflections levels/gamlebyen": "the moon's glints on the harbour",
    "invasion alive/invasion": "the invaders' neon sign"
  },
  encore: {
    "tbane alive/ground": "the T sign",
    "lamp alive/props": "the park's lamp",
    "lampPool props": "its light on the path",
    "neon levels/encore": "the stage's neon (the glamour's own)",
    "tube levels/encore": "the lightning bolts' tubes",
    // The census draws the stage before the show: the lenses on the truss come on with it (`lights` in encore.ts).
    "beamLight levels/encore": "the cold spot on him before the show (not over the speaker stacks in front of it)"
  },
  kart: {
    "lit backdrop": "the city's windows",
    "runeStone levels/kartArt": "the empty rune slots' faint outline",
    "skyline levels/kartArt": "about half the windows of each station's skyline"
  },
  "kart (every rune)": {
    "lit backdrop": "the city's windows",
    "runeStone levels/kartArt": "the rune stones' gold, lit",
    "drawTick render/actors": "the ticks on them",
    "skyline levels/kartArt": "about half the windows of each station's skyline",
    "longship levels/kartArt": "the longship's stern lantern",
    "lanterns levels/kartArt": "the lanterns along both viaducts",
    "encoreStop levels/kartArt": "the encore's stop, its neon (the glamour's own) until seen"
  }
};

/** Light colours that come near a role or the glamour's neon, and why they may (ADR 0044: by shape and place, never a top edge or a coin). */
const NAMED: Record<string, string> = {
  "#ffa860": "the sun's disc low over Østensjøvannet's far shore (its lower rim, orange as a sun coming up is)",
  "#ff9452": "the sun's disc, its lowest rim",
  "#ffd36b": "the kit's lamp and window light (ADR 0044): small panes and glass on a wall, a post or a ceiling, never a top edge",
  "rgb(255, 214, 120)": "the kit's soft light: see-through, over a pane or a stove",
  "#fff0c0": "the sun's disc coming up behind Østensjøvannet's far shore, in the sky",
  "#ffe2a0": "the sun's disc",
  "#fff0b0": "a torch's hot core, on its post",
  "rgb(220, 228, 255)": "the empty rune slots' faint outline on the map (see-through)",
  "rgb(223, 232, 255)": "the cold spot on Loki before the show (see-through)",
  "#ffffff": "the T sign's white and the ticks on the map's rune stones"
};
/** Lights that are the glamour's own: neon is the invaders' (ADR 0050), and these are theirs. */
const GLAMOUR_OWN = new Set(["neon levels/encore", "tube levels/encore", "lights levels/encore", "beamLight levels/encore", "encoreStop levels/kartArt", "invasion alive/invasion", "welder levels/bjorvika"]);

async function scenes(): Promise<{ name: string; def: LevelDef }[]> {
  const all: Progress = { ...fresh(), cleared: [...ORDER], best: Object.fromEntries(ORDER.map((id) => [id, 60000])) };
  const out = [];
  for (const st of BUILT) out.push({ name: st.id, def: await loadLevel(st.id) });
  out.push({ name: "encore", def: await loadLevel("encore") });
  out.push({ name: "kart", def: kartDef(fresh(), kartArt) }, { name: "kart (every rune)", def: kartDef(all, kartArt) });
  return out;
}
const night = skyFor(new Date(2026, 0, 15, 12), "night");
/** A scene's own sky (Langkaia and the map, which follow the clock, at night). */
const own = (def: LevelDef) => skyFor(new Date(2026, 0, 15, 12), (def.sky === "winterday" ? "day" : (def.sky ?? "night")) as SkyName);

const found = new Map<string, Lit[]>();
async function lit(): Promise<Map<string, Lit[]>> {
  if (!found.size)
    for (const { name, def } of await scenes()) {
      const at = [...census(name, def, night)];
      // Under its own sky too, where that is not the night: what a level draws can change with it (Gamlebyen's dawn, the snow).
      if (def.sky && def.sky !== "night") at.push(...census(name, def, own(def)));
      found.set(name, at);
    }
  return found;
}

describe("after dark every light is lit, and nothing else glows (order 32)", () => {
  test("each scene lights exactly what its row names", async () => {
    const wrong: string[] = [];
    for (const [name, ls] of await lit()) {
      const whos = new Set(ls.map((l) => l.who));
      const want = LIT[name] ?? {};
      for (const w of whos) if (!want[w]) wrong.push(`${name}: ${w} lights (${ls.filter((l) => l.who === w).length}) and has no row`);
      for (const w of Object.keys(want)) if (!whos.has(w)) wrong.push(`${name}: ${w} (${want[w]}) lights nothing`);
    }
    expect(wrong).toEqual([]);
  }, 120_000);

  test("nothing drawn after a light on the street dims it: a light is its own colour over the dark", async () => {
    const dimmed: string[] = [];
    for (const [name, ls] of await lit()) for (const l of ls) if (l.dim > 0) dimmed.push(`${name}: ${l.who} at ${l.x},${l.y} (${l.w} x ${l.h}), ${Math.round(l.dim * 100)} % dimmed by ${l.dimmedBy.join(", ")}`);
    expect([...new Set(dimmed)]).toEqual([]);
  }, 120_000);

  test("a pool of lamplight lies on what it lights: never under the tiles", async () => {
    const under: string[] = [];
    for (const [name, ls] of await lit())
      for (const l of ls) {
        const pool = l.kind === "pool" || colourOf(l).startsWith("rgba(255, 186, 96,");
        if (pool && (l.coverOf.tiles ?? 0) > 0.1) under.push(`${name}: ${l.who} at ${l.x},${l.y}, ${Math.round((l.coverOf.tiles ?? 0) * 100)} % under the tiles`);
      }
    expect([...new Set(under)]).toEqual([]);
  }, 120_000);

  test("a light's colour is warm and natural, never the glamour's but its own, and never near what he takes, stands on or uses but by name", async () => {
    const rgb = (c: string) => parseColour(c)!.rgb;
    const solid = (c: string) => c.replace(/^rgba\((.*),\s*[\d.]+\)$/, "rgb($1)");
    const roles = ["take", "stand", "use"].flatMap((r) => ROLES.COLOURS[r].map((c) => [r, c] as const));
    const wrong: string[] = [];
    const table = new Map<string, string>();
    for (const [name, ls] of await lit())
      for (const l of ls) {
        const c = solid(colourOf(l));
        const near = roles.map(([r, rc]) => [r, rc, deltaE(rgb(c), rgb(rc))] as const).sort((a, b) => a[2] - b[2])[0];
        const neon = Math.min(...ROLES.glamour.map((n) => deltaE(rgb(c), rgb(n))));
        table.set(c, `${c}: nearest ${near[0]} ${near[1]} ${near[2].toFixed(1)}, the glamour ${neon.toFixed(1)}`);
        if (neon < 8 && !NAMED[c] && !GLAMOUR_OWN.has(l.who)) wrong.push(`${name}: ${l.who} lights in ${c}, ${neon.toFixed(1)} from the glamour's neon`);
        if (near[2] < 10 && !NAMED[c] && !GLAMOUR_OWN.has(l.who)) wrong.push(`${name}: ${l.who} lights in ${c}, ${near[2].toFixed(1)} from ${near[0]} ${near[1]}`);
      }
    console.log(`The lights' colours:\n  ${[...table.values()].sort().join("\n  ")}`);
    expect([...new Set(wrong)]).toEqual([]);
  }, 120_000);
});
