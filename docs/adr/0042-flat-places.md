# 0042. Flat places are found by a walk, and given what the place has, drawn once and copied

Decided 2026-11-15 by the order 20 implementer, on the planner's order (order 20, section 2).

## Context
Order 17's review and the handover named flat areas: Bygdøy's halls, Vigelandsparken's plateau face, Bjørvika's
façades and shafts, Østensjøvannet's island soil, the stone under Akershus's quay. No one had looked at every
place of every level, at both sizes, by the same measure.

## Decision
- **The walk.** `apps/viking/tools/glance/walk.ts` plays each level's scripted route and gives the place where it
  first stands past every twentieth column (202 places in sixteen levels); `tools/shots.ts` takes each at
  1280 x 800 and 390 x 844. `tools/glance/flat.py` marks a picture where the largest plain area (one colour, a
  smooth gradient, one colour with a speck, or a tile repeated; small things leave holes in it) other than the
  sky is more than about a third of the view (0.3), or where the far backdrop is empty: on a wide view more than
  half of it plain sky, on a tall one (whose far layers are moved round him) the band over his head more than
  three fifths sky. Its marks are candidates, and were looked at; its contact sheets stay out of the repository.
- **What was given** (the hand-back and `apps/viking/tools/review/o20/flat.md` list each marked picture):
  - Korketrekkeren: the snow under the flats in wind-packed layers, a stone, a root, a lens of ice; the hillside
    under the run drifts, boulders under caps, buried saplings, a hare's tracks, the old fence's last posts.
  - Østensjøvannet: the island's bank in layers: reed roots, a band of peat, pebbles, pale clay, a shell.
  - Gamlebyen: Ekeberg's slope over the old town, under the far ridge: woods, a road, houses, windows lit.
  - Akershus: from the walls and the battery the hills stay on the horizon and the fjord spreads under them.
  - Slottet: the city and the hills behind Karl Johan rise with the street towards the palace (and with the
    view, high on the banners), so they stand over the crowd.
  - Vålerenga: the drift under the tower has the sledges' tracks, wind ripples, someone's steps, a buried fence.
  - Rådhuset: the clock tower's face has piers and bands of paler brick and a plaque; the promenade stands on
    the quay's granite in courses.
- **The rule for anything added.** It is scenery (ADR 0039): lower in saturation and contrast than every role,
  nothing that looks standable (no flat top over a shadow line), nothing in an enemy's or a pickup's colours
  (`render/palette.test.ts` holds it). It is drawn once and copied (`kept`, `keptStrips`, `stamp`, ADR 0036,
  0041): no place gains more than 300 rectangles a frame for it, and a tile drawn as a stamp costs fewer
  rectangles than the plain tile it replaces.
- **Far layers that rise.** `climbed(floor, most)` (`render/backdrop.ts`): how far the view has climbed above
  where it stands over the level's ground; a level may raise its far layers by it (`drawOsloHills` and
  `drawFjord` take a `lift`; the hills' slopes and the fjord's water run on down under it). Nothing changes on
  the ground, nor on an upright screen. Akershus uses it; Slottet raises its city and hills with the street.

## Consequences
- The places are no longer flat by the measure, but no one has seen them at speed.
- Left: Nordmarka's dark marks six pictures (the dark is the level's idea: only the headlamp's circle shows);
  Holmenkollen's far city sinks as he climbs the hill, by design, and one picture high on the hill is marked
  for its sky, which has its falling snow in it.
