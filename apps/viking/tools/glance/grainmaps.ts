// The grain study's maps (order 22, part B: `src/grain/maps.ts`) as JSON, every pixel a colour, for a sheet of
// them made outside the page (`grainsheet.py`).
//
//   bun tools/glance/grainmaps.ts > maps.json

import * as M from "../../src/grain/maps";

type PixelMap = { rows: string[]; colours: Record<string, string> };
const out: Record<string, string[][]> = {};
const flat = (m: PixelMap) => m.rows.map((r) => [...r].map((ch) => (ch === "." ? "" : m.colours[ch])));
for (const [k, v] of Object.entries(M)) {
  if ((v as PixelMap).rows) out[k] = flat(v as PixelMap);
  else
    for (const [k2, v2] of Object.entries(v as object)) {
      if (Array.isArray(v2)) v2.forEach((m, i) => (out[`${k}.${k2}.${i}`] = flat(m)));
      else out[`${k}.${k2}`] = flat(v2 as PixelMap);
    }
}
console.log(JSON.stringify(out));
