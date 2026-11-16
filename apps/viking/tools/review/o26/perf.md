# Order 26: rectangles a frame, against order 23's table

Measured 16 November 2026 with `?debug&perf` through `tools/glance/perf.ts` at 390 x 844, on a build of branch `the-ground`
(with the plank doors; the one change after it keeps one buried map per level and draws the same pixels) served by `vite preview`, at order 23's places (`bun tools/glance/walk.ts
--every=60`, 73 places, each level's own sky, Langkaia by day), against `../o23/perf-after.tsv` (and order 25's,
`../o25/perf-after.tsv`). The order allows no place more than 200 rectangles over order 23's table, none over 15,000. Order 25's
times were taken on a Pi busy with its pictures; these on a quieter one, so the times are not a fair comparison. The counts are.

| Level | places | most, order 23 | most, order 25 | most, order 26 | largest rise over order 23 (place) | largest fall (place) | copies a frame, most, order 25 → 26 | ms a frame, most, order 25 → 26 |
|---|---|---|---|---|---|---|---|---|
| langkaia | 4 | 8,617 | 8,579 | 6,296 | -433 (c000) | -2,321 (c120) | 487 → 597 | 71.7 → 41.0 |
| akershus | 5 | 6,327 | 6,288 | 5,817 | -289 (c240) | -510 (c120) | 936 → 967 | 73.9 → 42.6 |
| radhuset | 4 | 11,140 | 11,105 | 3,758 | -104 (c060) | -7,454 (c180) | 583 → 706 | 73.8 → 38.5 |
| slottet | 4 | 8,055 | 7,787 | 7,474 | -515 (c120) | -1,127 (c000) | 662 → 788 | 119.2 → 51.2 |
| holmenkollen | 4 | 11,618 | 11,466 | 10,016 | -741 (c120) | -1,603 (c000) | 190 → 650 | 99.3 → 53.4 |
| akerselva | 5 | 11,456 | 11,446 | 10,063 | -1,003 (c120) | -1,549 (c240) | 103 → 551 | 96.9 → 56.9 |
| nordmarka | 4 | 4,988 | 4,998 | 3,908 | -1,066 (c060) | -1,150 (c180) | 247 → 727 | 178.3 → 120.8 |
| stortinget | 5 | 8,883 | 8,855 | 5,592 | -1,462 (c240) | -3,291 (c060) | 958 → 1,361 | 91.7 → 83.2 |
| ekeberg | 5 | 11,445 | 11,421 | 9,821 | -128 (c240) | -1,649 (c180) | 198 → 656 | 129.0 → 94.9 |
| nabolaget | 4 | 9,181 | 9,145 | 5,515 | -2,920 (c060) | -3,863 (c180) | 188 → 648 | 80.8 → 62.1 |
| bygdoy | 5 | 5,978 | 5,840 | 4,611 | -976 (c180) | -1,443 (c120) | 361 → 591 | 85.6 → 56.6 |
| vigelandsparken | 4 | 7,180 | 7,084 | 6,034 | -748 (c060) | -1,182 (c000) | 113 → 566 | 95.8 → 76.7 |
| korketrekkeren | 5 | 2,785 | 2,711 | 2,710 | -75 (c180) | -317 (c240) | 707 → 737 | 112.2 → 61.8 |
| ostensjovannet | 5 | 10,361 | 10,317 | 9,380 | -981 (c240) | -1,392 (c060) | 295 → 661 | 131.1 → 66.8 |
| bjorvika | 5 | 9,497 | 9,440 | 8,210 | -75 (c240) | -1,287 (c060) | 280 → 732 | 94.8 → 78.7 |
| gamlebyen | 5 | 4,592 | 4,502 | 3,556 | -175 (c240) | -1,631 (c060) | 179 → 652 | 71.4 → 43.4 |

The most any place rose against order 23: -75 (korketrekkeren-c180); the most any place draws: 10,063.

Why fewer everywhere: a solid tile is one copy of a piece drawn once (the textured set, `src/alive/ground.ts`) where it was two
to eighteen rectangles (a fill, a top band, its dots, a pebble, joints, an outline); the deepest saving where the ground under
the map fills a tall screen (Rådhuset's quay stone, 7,454 fewer at column 180) and where walls were rectangles a course
(Vålerenga's street and banks, Stortinget's concrete). What rose is copies: a copy a solid tile on the screen (up to 1,361 a frame,
Stortinget), and the sign boards, the T-bane's entrance and the doors as a copy each. Vålerenga's roofs are kept in strips.

Every place's line: `perf-after.tsv` beside this file.
