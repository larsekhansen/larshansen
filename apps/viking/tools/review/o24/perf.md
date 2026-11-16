# Order 24: rectangles a frame, against order 23

Measured 16 November 2026 with `?debug&perf` through `tools/glance/perf.ts` at 390 x 844, on a build of branch `line-one-redrawn`
served by `vite preview`, at the places order 23 measured (`bun tools/glance/walk.ts --every=60`, 73 places, each level's own sky,
Langkaia by day), against order 23's table (`../o23/perf-after.tsv`). The order allows no place more than 200 rectangles over
order 23's and none over 15,000. The raw table is `perf-after.tsv` (name, rectangles, colours, copies, ms a frame on the Pi's
software renderer while the Pi ran other measures, so the times are long; counts are not).

| Level | places | most, order 23 | most, order 24 | largest rise (place) | largest fall (place) | copies a frame, most before → after |
|---|---|---|---|---|---|---|
| langkaia | 4 | 8,617 | 8,579 | -13 (c180) | -38 (c000) | 468 → 487 |
| akershus | 5 | 6,327 | 6,288 | -39 (c000) | -39 (c000) | 916 → 936 |
| radhuset | 4 | 11,140 | 11,105 | -35 (c000) | -35 (c000) | 565 → 583 |
| slottet | 4 | 8,055 | 8,040 | -15 (c000) | -15 (c000) | 566 → 584 |
| holmenkollen | 4 | 11,618 | 11,580 | -38 (c000) | -38 (c000) | 131 → 155 |
| akerselva | 5 | 11,456 | 11,446 | -10 (c000) | -10 (c000) | 80 → 103 |
| nordmarka | 4 | 4,988 | 4,992 | +4 (c000) | -10 (c060) | 244 → 247 |
| stortinget | 5 | 8,883 | 8,855 | -28 (c000) | -28 (c000) | 943 → 958 |
| ekeberg | 5 | 11,445 | 11,421 | -10 (c120) | -24 (c000) | 177 → 198 |
| nabolaget | 4 | 9,181 | 9,145 | -36 (c000) | -36 (c000) | 168 → 188 |
| bygdoy | 5 | 5,978 | 5,840 | -138 (c000) | -138 (c000) | 336 → 361 |
| vigelandsparken | 4 | 7,180 | 7,084 | -96 (c000) | -96 (c000) | 81 → 113 |
| korketrekkeren | 5 | 2,785 | 2,694 | -91 (c000) | -91 (c000) | 683 → 707 |
| ostensjovannet | 5 | 10,361 | 10,270 | -91 (c000) | -91 (c000) | 268 → 295 |
| bjorvika | 5 | 9,497 | 9,401 | -96 (c000) | -96 (c000) | 250 → 280 |
| gamlebyen | 5 | 4,592 | 4,491 | -101 (c000) | -101 (c000) | 155 → 179 |

The most any place rose: +4 (nordmarka-c000). Places over 15,000: none.

Why fewer: the bench, the rune stone, the flag's pieces and the bracteate's loop are copies of canvases drawn once, the shield's
face one copy; the sheep, the enemies and the bosses are kept by `outlined` as before (more runs to record, the same one copy a
frame). Why a few more copies: the flag's three frames, the water lapping at quays, the flames. Things in front are drawn on the
text canvas and are counted where they pass (not at these places).
