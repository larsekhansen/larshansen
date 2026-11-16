// The tables of order 21's section 1 from `hand.ts`'s measurements: per screen state and size, how much of the
// screen's height the game's picture gets, what covers it, every touch target's size and its distance to the
// nearest other, and the rules' checks (a button over him and the ground ahead, the banner over him or what he
// meets, the help line naming keys).
//
//   bun tools/glance/hand-table.ts <outDir>/measure.jsonl > table.md

import { readFileSync } from "node:fs";

interface R {
  x: number;
  y: number;
  w: number;
  h: number;
}
const meets = (a: R, b: R) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
/** The gap between two rectangles: the larger of the gaps across and down (negative when they overlap). */
function gap(a: R, b: R): number {
  const dx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w));
  const dy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h));
  if (dx >= 0 && dy >= 0) return Math.hypot(dx, dy);
  return Math.max(dx, dy);
}
const KEYS = /arrow|space|shift|\bR\b|piltast|mellomrom|pil (opp|ned)|↑|↓/i;

const rows = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const out: string[] = [];
out.push("| state | size | picture | bar | pad band | over the picture | targets | smallest | nearest | button over him and ahead | banner over | help line |");
out.push("|---|---|---|---|---|---|---|---|---|---|---|---|");
const turns: string[] = [];
for (const row of rows) {
  if (!row.m) {
    out.push(`| ${row.name} | ${row.size.join("x")} | no measurement | | | | | | | | | |`);
    continue;
  }
  const one = (m: any) => {
    const H = m.vh;
    const bar = m.header.alpha >= 0.95 ? m.header.r.y + m.header.r.h : 0;
    const band = m.pad && m.pad.alpha >= 0.95 ? m.pad.r.h : 0;
    const pic = Math.max(0, H - bar - band);
    const over: string[] = [];
    if (m.help) over.push(`help line (${m.help.lines} line${m.help.lines === 1 ? "" : "s"})`);
    if (m.game?.banner) over.push("banner");
    const padTargets = m.targets.filter((t: any) => t.where === "pad");
    if (padTargets.length && !band) over.push(`${padTargets.length} buttons`);
    for (const c of m.cards) over.push(`${c.id === "finish" ? "card" : "board"}${c.overflow ? (c.scrolls === "auto" ? " (scrolls)" : " (cut)") : ""}`);
    const ts = m.targets as { where: string; label: string; r: R; dim: number }[];
    let small = ts.length ? ts.reduce((a, b) => (Math.min(b.r.w, b.r.h) < Math.min(a.r.w, a.r.h) ? b : a)) : null;
    let near = Infinity;
    let pair = "";
    for (let i = 0; i < ts.length; i++)
      for (let j = i + 1; j < ts.length; j++) {
        const g = gap(ts[i].r, ts[j].r);
        if (g < near) {
          near = g;
          pair = `${ts[i].label} / ${ts[j].label}`;
        }
      }
    const outside = ts.filter((t) => t.r.x < 0 || t.r.y < 0 || t.r.x + t.r.w > m.vw + 0.5 || t.r.y + t.r.h > H + 0.5).map((t) => t.label);
    let under = "";
    if (m.game?.region) {
      const hit = padTargets.filter((t: any) => meets(t.r, m.game.region)).map((t: any) => t.label);
      under = band ? (m.game.region.y + m.game.region.h > H - band ? "under the pad band" : "no") : hit.length ? `yes: ${hit.join(", ")}` : "no";
      if (m.game.region.y < bar) under += " (ahead under the bar)";
    }
    let banner = "";
    if (m.game?.banner) {
      const b = m.game.banner as R;
      const hits = new Set<string>();
      if (meets(b, m.game.him)) hits.add("him");
      for (const t of m.game.things) if (meets(b, t.r)) hits.add(t.kind);
      banner = hits.size ? [...hits].join(", ") : "nothing";
    }
    const help = m.help ? `${m.help.lines} line${m.help.lines === 1 ? "" : "s"}${KEYS.test(m.help.text) ? ", names keys" : ""}${m.game && meets(m.help.r, m.game.region) ? ", over him or ahead" : ""}` : "";
    return {
      cells: [
        `${Math.round(pic)} px, ${Math.round((pic / H) * 100)} %`,
        `${Math.round(bar)}`,
        band ? `${Math.round(band)}` : m.pad ? "over" : "none",
        over.join(", ") || "nothing",
        `${ts.length}, ${ts.filter((t) => t.r.w < 56 || t.r.h < 56).length} under 56${outside.length ? `, ${outside.length} off the screen` : ""}`,
        small ? `${Math.round(small.r.w)} x ${Math.round(small.r.h)} (${small.label})` : "",
        Number.isFinite(near) ? `${Math.round(near)} px (${pair})` : "",
        under,
        banner,
        help
      ],
      m
    };
  };
  const a = one(row.m.first);
  out.push(`| ${row.name} | ${row.size.join("x")}${row.turn ? ` → ${row.turn.join("x")}` : ""} | ${a.cells.join(" | ")} |`);
  if (row.m.second) {
    const b = one(row.m.second);
    out.push(`| ${row.name}, turned | ${row.turn.join("x")} | ${b.cells.join(" | ")} |`);
    const g1 = row.m.first.game;
    const g2 = row.m.second.game;
    const inView = (m: any) => m.game && m.game.him.x >= 0 && m.game.him.x + m.game.him.w <= m.vw && m.game.him.y >= (m.header.r.y + m.header.r.h) && m.game.him.y + m.game.him.h <= m.vh;
    turns.push(`| ${row.name} | ${row.size.join("x")} → ${row.turn.join("x")} | ${g1?.steps} → ${g2?.steps} | ${g1?.clock} → ${g2?.clock} | ${inView(row.m.first) ? "yes" : "no"} → ${inView(row.m.second) ? "yes" : "no"} | ${Math.round(row.m.second.header.r.w)} of ${row.m.second.vw} |`);
  }
}
console.log(out.join("\n"));
if (turns.length) {
  console.log("\nTurning the phone mid-level: the steps and the clock (the game did not start again), him in view below the bar, the bar's width.\n");
  console.log("| state | turned | steps | clock | him in view | bar |");
  console.log("|---|---|---|---|---|---|");
  console.log(turns.join("\n"));
}
