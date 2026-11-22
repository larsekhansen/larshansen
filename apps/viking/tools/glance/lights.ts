// Every light a scene registers after dark (order 32, ADR 0054): each level, the encore and the map drawn across their whole length,
// as `src/render/lightcensus.ts` draws them (the passes of a frame in order, as a browser draws them), every `light()` noted with
// the function that registered it, its kind, its colour and where it is, and what a later pass on the street draws over it.
//
//   bun tools/glance/lights.ts [--sky=night|evening|twilight|own] [--levels=a,b] [--json]
//
// The table is one row a function a scene: how many lights it registered, their kinds and colours, its pass, the columns they
// stand in with an example (world x, y, w x h), and how many of them a later pass dims (see-through) or covers (opaque: a copy
// counts as covering its whole rectangle), with the most of a light's pixels either does.

import { TILE } from "@larshansen/pixelkit/config";
import { skyFor, type SkyName } from "@larshansen/pixelkit/oslo";
import { fresh, type Progress } from "../../src/game/progress";
import { BUILT, ORDER, loadLevel } from "../../src/levels/index";
import { kartDef } from "../../src/levels/kart";
import { kartArt } from "../../src/levels/kartArt";
import type { LevelDef } from "../../src/levels/types";
import "../../src/render/feel";
import { census, type Lit } from "../../src/render/lightcensus";

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const phase = opt("sky") ?? "night";
const only = opt("levels")?.split(",");

const all: Progress = { ...fresh(), cleared: [...ORDER], best: Object.fromEntries(ORDER.map((id) => [id, 60000])) };
const scenes: { name: string; def: LevelDef }[] = [];
for (const st of BUILT) scenes.push({ name: st.id, def: await loadLevel(st.id) });
scenes.push({ name: "encore", def: await loadLevel("encore") });
scenes.push({ name: "kart", def: kartDef(fresh(), kartArt) }, { name: "kart-all", def: kartDef(all, kartArt) });

const found: Lit[] = [];
for (const { name, def } of scenes) {
  if (only && !only.includes(name)) continue;
  // `own`: the scene's pinned sky (Langkaia and the map, which follow the clock, at night).
  const named = (phase === "own" ? (def.sky === "winterday" ? "day" : def.sky ?? "night") : phase) as SkyName;
  found.push(...census(name, def, skyFor(new Date(2026, 0, 15, 12), named)));
}

if (args.includes("--json")) console.log(JSON.stringify(found));
else {
  console.log(`# Lights registered at ${phase}: scene, who (function file), how many, kinds, colours, path, columns (an example), dimmed by, covered by`);
  const by = new Map<string, Lit[]>();
  for (const l of found) by.set(`${l.level}|${l.who}|${l.path}`, [...(by.get(`${l.level}|${l.who}|${l.path}`) ?? []), l]);
  for (const group of by.values()) {
    const l = group[0];
    const kinds = [...new Set(group.map((g) => g.kind))].join(",");
    const colours = [...new Set(group.map((g) => g.colour || "-"))].slice(0, 3).join(" ");
    const dimmed = group.filter((g) => g.dimmedBy.length);
    const covered = group.filter((g) => g.coveredBy.length);
    const xs = group.map((g) => Math.round(g.x / TILE));
    const most = (gs: Lit[], k: "dim" | "cover") => Math.round(100 * Math.max(...gs.map((g) => g[k])));
    console.log(
      [
        l.level,
        l.who,
        group.length,
        kinds,
        colours,
        l.path,
        `c${Math.min(...xs)}-${Math.max(...xs)} (${l.x},${l.y} ${l.w}x${l.h})`,
        dimmed.length ? `${dimmed.length}: ${[...new Set(dimmed.flatMap((d) => d.dimmedBy))].join(",")} (most ${most(dimmed, "dim")} %)` : "",
        covered.length ? `${covered.length}: ${[...new Set(covered.flatMap((d) => d.coveredBy))].join(",")} (most ${most(covered, "cover")} %)` : ""
      ].join("\t")
    );
  }
}
