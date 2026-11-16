# Order 26: the measures

Measured 16 November 2026 on branch `the-ground` (from `origin/main` at `d4ccf99`, after order 25).

## No rule changed

The sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, with the edge at its 10 steps, on `origin/main` before any
change and on the branch after the textured set, the props and the deep fill: every run's record byte-identical (`cmp`).

| Level | md5 of the runs, before | md5, after | hearts a run ±2 / ±4 |
|---|---|---|---|
| Langkaia | `dd2406a1c3c0` | `dd2406a1c3c0` | 0.15 / 0.77 |
| Akershus | `49f3e97eed34` | `49f3e97eed34` | 0.52 / 0.97 |
| Stortinget | `d327a7905945` | `d327a7905945` | 1.28 / 1.78 |
| Bygdøy | `452e8abd9652` | `452e8abd9652` | 0.40 / 0.80 |

(Bygdøy's is order 25's.) No route, box, speed or timing was touched; nothing in `packages/` or `apps/landing` changed.

## Tests, build, budget, front page

- `bun test`: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 411 pass (408 after order 25, and 3 new: every solid
  tile of every level drawn from the textured set but the named, every material in its band, no new ground tone nearer a role
  than before), 0 fail anywhere. The viking suite took 194 s on a quiet Pi and 237 s with the perf walk running beside it.
- `tsc --noEmit` clean; `bun run build` clean.
- First script 59.06 kB gzipped (58.86 after order 25): the hooks (`TEXTURED` in `render/tiles.ts`, the boards in `main.ts`, the
  T-bane's entrance in `render/furniture.ts`, the far shore's spruce tips in `render/backdrop.ts`). `feel`'s file, which every
  scene waits for, 20.6 to 28.0 kB gzipped: the textured set, the hand flags and the flying cloth.
- The front page: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/`, taken twice (after section 2, and at the end on
  the final code, after the enemy palette gained its amber). In the kit only `swatches/enemy.ts` (the amber) and
  `swatches/roles.ts` (the amber among the enemy's colours) changed; the front page imports neither.
- The runs above were taken again on the final code (with sections 3b to 3d): still byte-identical.

## Rectangles a frame

Against order 23's table every place of every level draws fewer rectangles (the least fall 75, at Korketrekkeren's column 180;
the most 7,454, at Rådhuset's column 180); the most any place draws is 10,141 (Holmenkollen). Copies rose, up to 1,361 a frame
(Stortinget). The table and why: `perf.md`.

## Figures against the ground, before and after

From `../glance/ground.ts` (`../../src/alive/ground-before.json` on `d4ccf99`, `ground-after.json` on the branch): every level's tiles drawn
across its whole map by day, as the palette test draws them (the paint and the ledges' teal left out). For him (his tunic,
skin and helmet), the enemies' bodies and the calm outline: the least CIEDE2000 between a field of the ground (0.4 % or more of
it) and the figure's colours, and the middle of that distance over the ground's whole area; and the ground's value (HSV) from a
tenth to nine tenths of its area.

| Level | him, least | him, middle | enemy, least | enemy, middle | calm, least | calm, middle | the ground's value |
|---|---|---|---|---|---|---|---|
| langkaia | 10.5 → 10.5 | 10.5 → 12 | 16.6 → 16.6 | 31.3 → 30 | 23.4 → 23.4 | 43.9 → 42.8 | 0.35–0.53 → 0.42–0.55 |
| akershus | 10.5 → 10.5 | 14.7 → 14.7 | 27.1 → 26.8 | 30 → 30 | 31.5 → 31.5 | 43.9 → 42.8 | 0.29–0.55 → 0.29–0.49 |
| radhuset | 10.5 → 10.5 | 19 → 19 | 14.4 → 14.4 | 26.1 → 26.2 | 25.4 → 24.6 | 48.4 → 43.9 | 0.42–0.72 → 0.39–0.70 |
| slottet | 12.0 → 10.8 | 17.4 → 19.9 | 17.9 → 17.9 | 28.8 → 28.9 | 23.2 → 23.2 | 48.5 → 53.9 | 0.25–0.40 → 0.23–0.40 |
| holmenkollen | 12.0 → 16.9 | 28.8 → 30.3 | 18.8 → 17.7 | 20 → 20 | 11.9 → 12.2 | 12.3 → 12.3 | 0.90–0.94 → 0.87–1.00 |
| akerselva | 10.5 → 10.5 | 26.2 → 26.2 | 21.2 → 24.6 | 34.9 → 34.9 | 31.4 → 31.4 | 53.1 → 53.1 | 0.42–0.45 → 0.42–0.45 |
| nordmarka | 12.0 → 12.0 | 26.2 → 27.9 | 17.8 → 17.8 | 34.9 → 31.8 | 34.3 → 31.5 | 53.1 → 63 | 0.29–0.42 → 0.29–0.37 |
| stortinget | 5.4 → 5.4 | 11.5 → 14.2 | 22.6 → 22.6 | 27.9 → 27.9 | 31.5 → 31.5 | 38.8 → 45 | 0.30–0.42 → 0.30–0.42 |
| ekeberg | 14.4 → 14.4 | 25.6 → 25.6 | 25.7 → 25.7 | 30.3 → 30.3 | 32.2 → 32.2 | 56.1 → 56.1 | 0.35–0.48 → 0.35–0.48 |
| nabolaget | 13.6 → 13.6 | 21.9 → 21.9 | 18.5 → 18.5 | 28.5 → 28.5 | 18.4 → 18.4 | 55.8 → 55.8 | 0.29–0.29 → 0.23–0.29 |
| bygdoy | 4.8 → 7.7 | 18.8 → 18.8 | 15.5 → 15.5 | 27 → 27 | 31.5 → 31.5 | 42.7 → 42.7 | 0.42–0.57 → 0.42–0.57 |
| vigelandsparken | 10.5 → 10.5 | 27.3 → 27.2 | 19.3 → 18.5 | 32.3 → 33.1 | 25.3 → 25.3 | 60.4 → 59.7 | 0.31–0.60 → 0.33–0.58 |
| korketrekkeren | 20.7 → 18.4 | 28.4 → 28.8 | 18.4 → 18.4 | 21.2 → 21.6 | 11.6 → 11.6 | 12.1 → 11.6 | 0.89–0.94 → 0.89–0.92 |
| ostensjovannet | 10.5 → 10.5 | 24.4 → 24.5 | 21.8 → 24.6 | 38.6 → 38.6 | 31.5 → 31.5 | 53.3 → 54.7 | 0.31–0.45 → 0.31–0.45 |
| bjorvika | 9.7 → 9.7 | 10.9 → 10.9 | 20.5 → 20.5 | 20.5 → 22.4 | 25.9 → 23.2 | 42.1 → 42.1 | 0.42–0.56 → 0.33–0.56 |
| gamlebyen | 10.5 → 10.5 | 14.5 → 14.5 | 27.7 → 24.9 | 32.2 → 32.2 | 31.1 → 27.2 | 43.9 → 43.9 | 0.35–0.55 → 0.35–0.55 |

The middle distances hardly move (the materials keep their levels' tones; the new ones are mixes between them). Where a least
distance fell, the nearest colour is one the level already painted that now covers more of its ground, never a new tone (the
palette test holds every new tone at least as far from each role as the level's ground was before): Slottet's setts under the
street within 10.8 of his helmet's grey (12.0 before; the palette test holds his tunic's blue, not his helmet, against the
fields, as before); Holmenkollen's snow within 17.7 of the enemies' white (18.8) and 16.4 of the coin's glint (19.9);
Gamlebyen's light stone within 24.9 of the enemies' white and 27.2 of the calm outline (27.7, 31.1); Korketrekkeren's crust
within 18.4 of his helmet (20.7); Nordmarka's granite within 31.5 of the calm outline (34.3); Bjørvika's glass within 23.2 of
it (25.9); Akershus's earth within 26.8 of the enemies (27.1). His tunic's blue, the enemies' bodies and the calm outline stand
10 or more off every field of every level, as before (the palette test).

## How busy the surfaces are

The mean difference of lightness (CIE L*) between a pixel and its right and lower neighbours, over each surface's picture from
`../glance/groundsheet.ts` (the tile and the tiles round it, the sky left out), by day, before → after. For scale: an enemy's dark
line (L* 5.5) against the ground (L* 35 to 90) is 30 to 85, its warning red (L* 50) against that line 45.

- langkaia "M" 0.6→1.0, "B" 3.3→3.7, "H" 1.4→1.5, "Q" 4.5→3.7, "P" 1.7→1.8, "#" 3.6→3.1
- akershus "W" 7.5→8.3, "K" 4.0→6.5, "B" 6.0→5.1, "Q" 6.5→6.5, "#" 4.1→4.9
- radhuset "N" 3.3→3.3, "X" 2.3→4.8, "Q" 4.2→3.5, "#" 1.3→2.1
- slottet "P" 1.3→3.7, "#" 2.0→3.2, "U" 2.3→3.5
- holmenkollen "K" 1.6→4.8, "H" 2.0→3.2, "#" 1.3→2.6, "I" 1.5→2.8, "V" 0.5→1.9
- akerselva "K" 1.0→3.9, "#" 0.8→2.9
- nordmarka "K" 0.7→2.5, "#" 0.5→1.8
- stortinget "W" 1.8→3.5, "G" 1.5→2.5, "#" 1.3→2.4, "E" 1.9→3.0, "Z" 2.8→6.0
- ekeberg "K" 1.5→3.8, "#" 0.7→1.4, "D" 1.9→4.8, "A" 1.2→3.7
- nabolaget "T" 10.2→11.8, "#" 1.9→4.4, "R" 10.5→12.1, "H" 3.5→3.5, "W" 1.1→3.9, "K" 1.7→4.1, "B" 1.5→4.1
- bygdoy "H" 8.3→9.5, "L" 0.0→0.0, "B" 1.4→2.7, "Q" 4.1→3.4, "P" 1.4→2.2, "#" 1.3→1.1, "K" 1.3→2.0
- vigelandsparken "G" 1.2→4.0, "#" 1.0→2.4
- korketrekkeren "#" 1.5→1.8
- ostensjovannet "#" 1.0→1.2, "P" 1.3→2.0, "K" 1.1→2.0
- bjorvika "U" 1.8→2.8, "I" 2.2→3.4, "#" 1.3→2.3
- gamlebyen "R" 1.9→4.1, "#" 1.0→2.5, "J" 0.7→1.4
- all surfaces: 2.4 → 3.6 on average; the busiest 10.5 → 12.1 (Vålerenga, where the roofs are its back art's and only the
  tiles round them are measured)

Under each level's own sky (the night's tint over it): 0.6 → 0.9 on average.

**Where it got worse for seeing a figure** (by these numbers and by looking at the pictures at 390 x 844): Gamlebyen's old stone
(1.9 → 4.1: the archers on the wall walk and the guards stand on it), Ekeberg's granite steps and blocks (1.2 to 1.9 → 3.7 to
4.8), Stortinget's signal cabinet (2.8 → 6.0), the rock of the river, Holmenkollen and the quarry (1.0 to 1.6 → 3.8 to 4.8),
Akershus's rock (4.0 → 6.5). Each stays well under a figure's own edge; the enemies keep their red and dark outline and the
paint is unchanged, so what tells a figure from the ground at a glance is as before. Whether the busier ground tires the eye at
speed on a phone is for a person to judge.

## Sections 3b to 3d (added the same evening)

- **Flags (3b).** Found: the hand flags of Slottet's parade children (the banner bearers are the same children) and of the
  crowds at Slottet and Holmenkollen's outrun (4 x 3 and 5 x 4: a red patch with a white mark, or stripes); the far blocks'
  roof flags on Karl Johan (6 x 4: no white either side of the blue); the map's flag on the palace (6 x 4, plain red); the
  wall flags on Karl Johan, Stortinget's flag, the palace's (and the one run up in its flourish), Holmenkollen's on the tower
  and Akershus's in its flourish (the kit's 13 x 9: already a whole cross, but flat). No stalls or bunting carry flags. Now:
  the hand flags 7 x 5 in two waves (the crowds) or three (the children), the roof flags and the map's 7 x 5, the 13 x 9 ones
  the game's own rippling cloth. The kit's flag is untouched (the front page 28 of 28). The flag's red was already held by the
  palette test where it is (it is not a field and no role is near it); nothing was named. Before and after, by day and at
  night, at real size and at 3x: `/tmp/shots-ground/flags/` (the map's and the palace's whole pictures in `flags/full/`).
- **Spruces (3c).** Why they had no top: the tip was never drawn. Holmenkollen's path spruces, its near row and the old spruce
  start their top tier five wide (a half of two at its first row) under a row of snow, so the top is flat. Not clipped, not
  under the header. Given a spire of a pixel of snow, a pixel, then three (snow on the middle), over the top tier's snowy row:
  Holmenkollen's path, near row (one row: order 23 split no row of Holmenkollen's) and the old spruce. The same lack and the same fix (in their own greens, a pixel or two): Nordmarka's street spruces
  and middle rows (kept pieces three and two rows taller), Korketrekkeren's behind the run (two rows taller), the far shore's
  spruces over the fjord (`render/backdrop.ts`, Langkaia, Akershus, Rådhuset, Bygdøy and the map). The map's own spruces
  already ended in a pixel. Before and after at both sizes: `/tmp/shots-ground/spruces/`.
- **Rats and wasps (3d).** The rat (Langkaia, Akershus, Akerselva, Stortinget, Bjørvika, all one drawing) has a tail as long as
  its body, one pixel, pink, from its rump down to the ground, trailing and lifting at its tip, in three swings over the run;
  the track rat's streams eight pixels further behind it as it rises, and flies out to the side as it falls (over its head it
  would be drawn where he lands: the palette test holds the head there). The boxes are as they were; the outline goes round
  the tail. The wasp's bands are amber (`ENEMY.amber`, `#ffb020`) between black ones, shaded orange beneath, its thorax black
  with an amber mark, its face amber: `tools/glance/tones.ts` passes `#ffb020` (nearest him at 10.3, `#ffaa00` the coin's gold
  at 11.3; the paint's yellow and the outline further), so it joined the palette and the test holds it as every body: nothing
  was named. The wings are the palette's white: grey-whites came within 0.8 to 2.2 of the snow. No poison green is left in it.
  Before and after at 4x and in place: `/tmp/shots-ground/rats-wasps/`.
