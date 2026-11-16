# Order 23: rectangles a frame, before and after

Measured 16 November 2026 with `?debug&perf` through `tools/glance/perf.ts` at 390 x 844, on a build of `origin/main` after
order 22 (`19d1b84`, "order 22") and of branch `alive` ("order 23"), each served by `vite preview`, at the same places: every sixtieth
column of each level along its route (`bun tools/glance/walk.ts --every=60`, 73 places, each level's own sky, Langkaia by day). The order
allows no place more than 400 rectangles over order 22's table (150 for the shadows) and none over 15,000.

| Level | places | most, order 22 | most, order 23 | largest rise (place) | largest fall (place) | copies a frame, most before → after |
|---|---|---|---|---|---|---|
| langkaia | 4 | 9,403 | 8,617 | -744 (c180) | -792 (c060) | 356 → 468 |
| akershus | 5 | 7,113 | 6,327 | -740 (c180) | -792 (c060) | 803 → 916 |
| radhuset | 4 | 11,858 | 11,140 | -718 (c180) | -741 (c060) | 465 → 565 |
| slottet | 4 | 8,339 | 8,055 | -284 (c180) | -337 (c000) | 500 → 566 |
| holmenkollen | 4 | 11,925 | 11,618 | -307 (c000) | -307 (c000) | 14 → 131 |
| akerselva | 5 | 11,685 | 11,456 | -229 (c240) | -352 (c060) | 16 → 80 |
| nordmarka | 4 | 5,480 | 4,988 | -492 (c000) | -496 (c060) | 136 → 244 |
| stortinget | 5 | 9,281 | 8,883 | -314 (c120) | -398 (c060) | 868 → 943 |
| ekeberg | 5 | 12,016 | 11,445 | -569 (c120) | -599 (c000) | 51 → 177 |
| nabolaget | 4 | 9,755 | 9,181 | -574 (c180) | -647 (c060) | 33 → 168 |
| bygdoy | 5 | 6,713 | 5,978 | -713 (c180) | -735 (c120) | 236 → 336 |
| vigelandsparken | 4 | 7,456 | 7,180 | -141 (c180) | -353 (c060) | 22 → 81 |
| korketrekkeren | 5 | 3,673 | 2,785 | -876 (c000) | -888 (c060) | 523 → 683 |
| ostensjovannet | 5 | 10,833 | 10,361 | -460 (c120) | -472 (c000) | 141 → 268 |
| bjorvika | 5 | 14,391 | 9,497 | -4,884 (c180) | -4,894 (c000) | 45 → 250 |
| gamlebyen | 5 | 5,106 | 4,592 | -511 (c120) | -518 (c000) | 42 → 155 |

The most any place rose: +0 ().

Every place draws fewer rectangles than before. Why: the skilling and the cheese are copied from canvases drawn once
(a copy each, where the old coin was six rectangles and its map would have been twelve); the fjord's flat water (a
rectangle a column) and Bjørvika's nine bands of swell a column are planes of copied strips; the shadows are copies of
ellipses drawn once; him a rectangle a run of his frame, not a pixel. What rose is copies: the planes' strips (three a
strip), a shadow under each thing that moves, a coin each. The split rows (Akerselva, Nordmarka, Slottet, Vålerenga,
Vigelandsparken, Stortinget, Ekeberg) draw as many trees and columns as before: the slower half is spaced as the row was.

Both tables' places, every line: `perf-before.tsv` and `perf-after.tsv` beside this file.
