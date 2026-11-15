# Order 20: flat places

Measured 15 November 2026. `tools/glance/walk.ts` gives, for each level, the place where its scripted route first
stands past every twentieth column (202 places); each was taken with `tools/shots.ts` at 1280 x 800 and at
390 x 844, from a build of `origin/main` at the merge of PR #65 (before) and of this branch (after).
`tools/glance/flat.py` marks a picture when the largest plain area other than the sky is over 0.3 of the view,
or when the far backdrop is empty (a wide view over half plain sky; a tall view, whose far layers are moved
round him, with the band over his head over three fifths sky). The marks were looked at, picture by picture.

## Marked before (20 of 404)

| Place | size | plain | sky | what it was |
|---|---|---|---|---|
| akershus-c140 | 1280 | 0.02 | 0.61 | the moat's tower: sky, the hills sunk below the view |
| akershus-c160 | 1280 | 0.00 | 0.73 | the saluting battery's top: sky only |
| radhuset-c140 | 390 | 0.30 | 0.00 | the promenade's fill: one beige under the paving |
| radhuset-c200 | 390 | 0.35 | 0.17 | the clock tower's face: brick and small windows, a tile repeated |
| slottet-c120 | 1280 | 0.00 | 0.72 | high on the banners: the city and hills below the view |
| slottet-c200 | 1280 | 0.01 | 0.60 | by the palace: Karl Johan has climbed, the city behind it has not |
| holmenkollen-c040 | 1280 | 0.04 | 0.62 | high on the hill: the far city sunk behind the ridges |
| nordmarka-c040, c060 | 390 | 0.30, 0.34 | | the dark under the spruces |
| nordmarka-c160, c180 | both | | 0.72 to 0.88 | the dark under the spruces |
| nabolaget-c140 | 1280 | 0.36 | 0.29 | the drift under the tower: one slope of snow |
| korketrekkeren-c000, c020, c260 | 1280 | 0.32 to 0.33 | | the snow under the top and at Midtstuen |
| gamlebyen-c000, c020, c120 | 1280 | 0.30 to 0.36 | | the far ridge's body: one dark band over the town |

## What each was given

- **Korketrekkeren** (line 2): the snow under the flats in wind-packed layers (a crust over a shade every other
  row), a stone under a cap, a root, a lens of ice, each tile drawn once and copied; on the hillside under the run,
  drifts, boulders under caps, a sapling buried to its top tier, a hare's tracks, the old fence's last posts, a
  hollow (`HILLSIDE`, stamped, half near the run for a wide view, half deeper for a tall one).
- **Gamlebyen** (line 2): Ekeberg's slope under the far ridge (woods, a road going up, eleven houses a strip with
  windows lit after dark), in four strips of the far layer drawn once and copied; the modern town's flats with a
  window lit here and there, a floor at a time.
- **Østensjøvannet** (line 2, named by the review though not marked): the bank under the grass in layers (reed
  roots, a band of peat, pebbles, pale clay, an old root, a shell), each tile stamped.
- **Akershus**: from the walls and the battery the hills stay on the horizon and the fjord spreads under them
  (`climbed` and a lift for `drawOsloHills` and `drawFjord`; nothing changes on the ground).
- **Slottet**: the city and the hills behind Karl Johan rise with the street towards the palace, and as far again
  as the view has climbed over it (up to 60 px); the buildings' walls go on down to the street.
- **Vålerenga**: the drift has the sledges' tracks, the wind's ripples, someone's steps and a fence buried to its
  rails high on the slope (not near Kruttverket), kept as strips.
- **Rådhuset**: the clock tower's face has piers between its window columns, bands of paler brick between its rows
  of windows (flush, no shadow under them, so nothing looks like a ledge) and a plaque at its foot; the promenade
  stands on the quay's granite in courses.

## Marked after (7 of 404)

| Place | size | plain | sky | why it is left |
|---|---|---|---|---|
| holmenkollen-c040 | 1280 | 0.04 | 0.62 | the far city sinks behind the ridges as he climbs the hill, by design (`sink`); its sky has its falling snow and clouds; one of line 1's five worst left |
| nordmarka-c040, c060 | 390 | 0.30, 0.34 | | the dark is the level: only his headlamp's circle and what shines show |
| nordmarka-c160, c180 | both | | 0.76 to 0.88 | the same |

No picture of line 2 is marked. Line 1's five worst before (by how far over its mark): akershus-c160,
slottet-c120, nabolaget-c140, radhuset-c200 fixed, holmenkollen-c040 left; akershus-c140, slottet-c200 and
radhuset-c140 fixed too. Before and after side by side, both sizes: `/tmp/shots-places/places/` on the Pi (not
kept).
