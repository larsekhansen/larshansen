# Order 25: rectangles a frame, against order 23's table

Measured 16 November 2026 with `?debug&perf` through `tools/glance/perf.ts` at 390 x 844, on a build of branch
`line-two-redrawn` served by `vite preview`, at order 23's places (`bun tools/glance/walk.ts --every=60`, 73 places, each
level's own sky, Langkaia by day), against `../o23/perf-after.tsv` (and order 24's, `../o24/perf-after.tsv`, beside it). The
order allows no place more than 200 rectangles over order 23's table, none over 15,000. The Pi was busy with the order's
pictures while it ran, so the times in the table are long; the counts are not. The build was taken again near the end of
the walk for one change, the bracteate's light after dusk drawn on its disc row by row (at most eleven rectangles more
where a bracteate is in view after dusk); the places measured before it were measured without that.

| Level | places | most, order 23 | most, order 24 | most, order 25 | largest rise over order 23 (place) | largest fall (place) | copies a frame, most, order 23 → 25 |
|---|---|---|---|---|---|---|---|
| langkaia | 4 | 8,617 | 8,579 | 8,579 | -13 (c180) | -38 (c000) | 468 → 487 |
| akershus | 5 | 6,327 | 6,288 | 6,288 | -39 (c240) | -39 (c000) | 916 → 936 |
| radhuset | 4 | 11,140 | 11,105 | 11,105 | -35 (c180) | -35 (c000) | 565 → 583 |
| slottet | 4 | 8,055 | 8,040 | 7,787 | -201 (c060) | -268 (c180) | 566 → 662 |
| holmenkollen | 4 | 11,618 | 11,580 | 11,466 | -152 (c180) | -152 (c000) | 131 → 190 |
| akerselva | 5 | 11,456 | 11,446 | 11,446 | -10 (c240) | -10 (c000) | 80 → 103 |
| nordmarka | 4 | 4,988 | 4,992 | 4,998 | +10 (c120) | -4 (c060) | 244 → 247 |
| stortinget | 5 | 8,883 | 8,855 | 8,855 | -28 (c240) | -28 (c000) | 943 → 958 |
| ekeberg | 5 | 11,445 | 11,421 | 11,421 | -10 (c120) | -24 (c000) | 177 → 198 |
| nabolaget | 4 | 9,181 | 9,145 | 9,145 | -36 (c180) | -36 (c000) | 168 → 188 |
| bygdoy | 5 | 5,978 | 5,840 | 5,840 | -138 (c240) | -138 (c000) | 336 → 361 |
| vigelandsparken | 4 | 7,180 | 7,084 | 7,084 | -96 (c180) | -96 (c000) | 81 → 113 |
| korketrekkeren | 5 | 2,785 | 2,694 | 2,711 | -63 (c240) | -74 (c000) | 683 → 707 |
| ostensjovannet | 5 | 10,361 | 10,270 | 10,317 | -44 (c240) | -44 (c000) | 268 → 295 |
| bjorvika | 5 | 9,497 | 9,401 | 9,440 | -57 (c240) | -57 (c000) | 250 → 280 |
| gamlebyen | 5 | 4,592 | 4,491 | 4,502 | -90 (c240) | -90 (c000) | 155 → 179 |

The most any place rose against order 23: +10 (nordmarka-c120); the most any place draws: 11,466.

Why so few: line 2's looks are drawn into the sprite recorder and copied (one copy a frame each, as before), the serpent too;
its coils, the crowds' people and their flags are frames painted once and copied (Slottet and Holmenkollen draw a hundred
and fifty to two hundred and seventy fewer rectangles for it, and more copies); the troll's lit side after dusk adds a light
a lit run where it is in view (it is in none of these places). The one rise, Nordmarka at column 120 (+10 against order 23,
+6 against order 24), is in the night's own rectangles (the dark's pieces), not in anything this order drew. Every place's
line: `perf-after.tsv` beside this file.
