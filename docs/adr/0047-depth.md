# 0047. Depth: a plane that recedes, more speeds, things that drift, something in front now and then

Decided 2026-11-16 by the planner (order 23, section 3), from what Open Surge does (the research record,
`docs/games/research/2026-11-16-reference-games.md`, and `docs/games/GRAIN.md`'s "Depth"). Carried out by the order 23
implementer. Within ADR 0036's rule (what never changes is drawn once and copied) and order 22's haze.

## Decision
- **The receding plane** (`apps/viking/src/alive/depth.ts`, `plane`): a band of water or snow from the horizon to the lane
  cut into thin strips (two pixels at the top, growing to four to nine nearer him), each a little faster than the one above
  and (water) drifting a little faster, so the band reads as a plane running away. Each strip is drawn once into a kept
  texture and copied each frame: three copies a strip, no rectangles. Drawn inside its layer's pass, so the haze and the
  night's tint go over it as over the layer. Where: the fjord of `drawFjord` (Langkaia, Akershus, Rådhuset, Bygdøy and the
  line map, through a hook the first script carries, `DEPTH.fjord`, filled by `feel`'s file), Bjørvika's fjord, the lake at
  Østensjøvannet, Holmenkollen's snowfield under the ridges and Korketrekkeren's fjord under its hills. Not Akerselva's
  river or Gamlebyen's harbour: they are in the lane, drawn by the tiles, with no water behind it to recede.
- **More speeds**: a piece of a far layer may be drawn at a speed of its own on its layer's canvas (`spedX`, within half
  a pixel of where a canvas of its own would put it). Where a level had three speeds between the sky and the lane, the rows
  it has were split, every other one a little farther and slower and drawn first: the near trees or columns at 0.3 and 0.4,
  the middle roofs or spruces at 0.16 and 0.2 (Akerselva, Nordmarka, Slottet, Vålerenga, Vigelandsparken, Stortinget,
  Ekeberg's near park). With the planes' strips every level but Ekeberg (four) and Gamlebyen (two canvases, its far layer a
  drawing of the dawn) has five speeds or more. Nothing new was drawn for it.
- **Drift**: the sky's clouds already drift, each at its own pace by its size; a sailing boat crosses the fjord's plane at
  its own pace; Bjørvika's ferry and sail and the gulls over the water were there. Smoke, far birds over every level and the
  T-bane far away were not added.
- **Something in front of him** (`alive/fore.ts`): a lamp post, a mast, a trunk, reeds, passing between him and the screen
  at 1.75 times the camera's speed, near-black and plain, 3 to 14 art pixels wide (under a tenth of the narrowest view).
  Never where the stretch it crosses ahead of him (from three and a half tiles before where it passes him to six after)
  has a jump of the route, a pit or water, an enemy's patrol or a pickup: `alive/fore.test.ts` holds it from the level's own
  data and its route. That leaves room in nine levels (one to three things each); seven have none, their skilling, jumps and
  patrols too close together. On a touch screen nothing of it is drawn over the pad's buttons. Off with reduced motion: there
  every layer goes at the camera's speed, and a thing in front would only stand in the way.

## Consequences
- Rectangles a frame: the planes replace a column a pixel of flat water (and Bjørvika's nine bands of swell a column) with
  copies: Bjørvika's most from 14,391 to 9,497 at 390 x 844. The split rows draw as many as before, the slower half spaced
  as the row was (spaced at its own speed it put a third more on the screen, up to 760 rectangles more a frame). Every
  place of every level draws fewer than before order 23: `apps/viking/tools/review/o23/perf.md`.
- Pictures can show a plane only as two moments: the strips nearer him have slid further.

## Not chosen
- A canvas per speed: five stacked canvases already cost a composition each frame.
- A shadow of the haze on each strip: the layer's own haze goes over the plane, as over the rest of the layer.
