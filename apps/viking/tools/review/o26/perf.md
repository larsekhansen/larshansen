# Order 26: rectangles a frame, against order 23's table

Measured 16 November 2026 with `?debug&perf` through `tools/glance/perf.ts` at 390 x 844, on a build of branch `the-ground` with
everything in it (the textured set, the props, the flags, the spires, the tails and the wasps) served by `vite preview`, at order
23's places (`bun tools/glance/walk.ts --every=60`, 73 places, each level's own sky, Langkaia by day), against
`../o23/perf-after.tsv` (and order 25's, `../o25/perf-after.tsv`). The order allows no place more than 200 rectangles over order
23's table, none over 15,000. The counts are the measure. The times are not: the walk ran beside the sloppy player's runs and the
whole viking test suite (sixteen workers on four cores), so a frame took two to five times as long as on a quiet Pi; an earlier
walk on a quieter Pi (section 2 alone) took 35 to 121 ms a frame at its most, below order 25's at every level.

| Level | places | most, order 23 | most, order 25 | most, order 26 | largest rise over order 23 (place) | largest fall (place) | copies a frame, most, order 25 → 26 | ms a frame, most, order 25 → 26 |
|---|---|---|---|---|---|---|---|---|
| langkaia | 4 | 8,617 | 8,579 | 6,296 | -433 (c000) | -2,321 (c120) | 487 → 597 | 71.7 → 109.0 |
| akershus | 5 | 6,327 | 6,288 | 5,817 | -289 (c240) | -510 (c120) | 936 → 967 | 73.9 → 89.6 |
| radhuset | 4 | 11,140 | 11,105 | 3,758 | -104 (c060) | -7,454 (c180) | 583 → 706 | 73.8 → 379.1 |
| slottet | 4 | 8,055 | 7,787 | 7,434 | -555 (c120) | -1,175 (c000) | 662 → 800 | 119.2 → 311.5 |
| holmenkollen | 4 | 11,618 | 11,466 | 10,141 | -616 (c120) | -1,503 (c000) | 190 → 651 | 99.3 → 89.2 |
| akerselva | 5 | 11,456 | 11,446 | 10,063 | -1,003 (c120) | -1,549 (c240) | 103 → 551 | 96.9 → 78.5 |
| nordmarka | 4 | 4,988 | 4,998 | 3,908 | -1,066 (c060) | -1,150 (c180) | 247 → 727 | 178.3 → 434.9 |
| stortinget | 5 | 8,883 | 8,855 | 5,592 | -1,462 (c240) | -3,291 (c060) | 958 → 1,361 | 91.7 → 90.4 |
| ekeberg | 5 | 11,445 | 11,421 | 9,821 | -128 (c240) | -1,649 (c180) | 198 → 656 | 129.0 → 76.7 |
| nabolaget | 4 | 9,181 | 9,145 | 5,515 | -2,920 (c060) | -3,863 (c180) | 188 → 648 | 80.8 → 55.8 |
| bygdoy | 5 | 5,978 | 5,840 | 4,611 | -976 (c180) | -1,443 (c120) | 361 → 591 | 85.6 → 50.3 |
| vigelandsparken | 4 | 7,180 | 7,084 | 6,034 | -748 (c060) | -1,182 (c000) | 113 → 566 | 95.8 → 66.2 |
| korketrekkeren | 5 | 2,785 | 2,711 | 2,710 | -75 (c180) | -317 (c240) | 707 → 737 | 112.2 → 58.2 |
| ostensjovannet | 5 | 10,361 | 10,317 | 9,380 | -981 (c240) | -1,392 (c060) | 295 → 661 | 131.1 → 65.8 |
| bjorvika | 5 | 9,497 | 9,440 | 8,210 | -75 (c240) | -1,287 (c060) | 280 → 732 | 94.8 → 51.3 |
| gamlebyen | 5 | 4,592 | 4,502 | 3,556 | -175 (c240) | -1,631 (c060) | 179 → 652 | 71.4 → 41.0 |

The most any place rose against order 23: -75 (korketrekkeren-c180); the most any place draws: 10,141.

Why fewer everywhere: a solid tile is one copy of a piece drawn once (the textured set, `src/alive/ground.ts`) where it was two
to eighteen rectangles (a fill, a top band, its dots, a pebble, joints, an outline); the deepest saving where the ground under
the map fills a tall screen (Rådhuset's quay stone, 7,454 fewer at column 180) and where walls were rectangles a course
(Vålerenga's street and banks, Stortinget's concrete). What rose is copies: a copy a solid tile on the screen (up to 1,361 a frame,
Stortinget), and the sign boards, the T-bane's entrance, the doors and the flags as a copy each. Vålerenga's roofs are kept in
strips. The spires add five rectangles a spruce where they are not kept (Holmenkollen's path and near row: its most rose from
10,016 to 10,141 against section 2 alone, still 1,477 under order 23's).

Every place's line: `perf-after.tsv` beside this file.
