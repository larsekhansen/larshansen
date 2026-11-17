# Order 28: rectangles a frame, against order 27's table

Measured on 17 November 2026 with `?debug&perf` through `tools/glance/perf.ts` at 390 x 844, on a build of branch
`the-last-flat-things` with everything in it served by `vite preview`, at order 23's places (`bun tools/glance/walk.ts --every=60`,
73 places, each level's own sky, Langkaia by day), against `../o27/perf-after.tsv`. The order allows no place more than 200
rectangles over order 27's table, none over 15,000. The counts are the measure; the times are not.

Every place draws fewer rectangles than after order 27: a prop is one copy where it was two to twenty rectangles (Ekeberg's railing
was three a pixel column of its 560: 1,153 fewer at every place, since the street's back art draws it wherever the view is). Copies
rose by the props on the screen (at most 64 more a frame, Slottet's balusters).

| Level | places | most, order 27 | most, order 28 | smallest fall (place) | largest fall (place) | copies a frame, most, 27 → 28 |
|---|---|---|---|---|---|---|
| langkaia | 4 | 6,296 | 6,058 | -238 (c180) | -238 (c000) | 598 → 638 |
| akershus | 5 | 5,817 | 5,805 | -12 (c240) | -12 (c000) | 967 → 973 |
| radhuset | 4 | 3,758 | 3,643 | -115 (c180) | -115 (c000) | 706 → 727 |
| slottet | 4 | 7,434 | 7,353 | -81 (c180) | -81 (c000) | 800 → 864 |
| holmenkollen | 4 | 10,141 | 10,130 | -11 (c180) | -11 (c000) | 652 → 659 |
| akerselva | 5 | 10,063 | 10,055 | -8 (c240) | -8 (c000) | 551 → 555 |
| nordmarka | 4 | 3,908 | 3,902 | -6 (c180) | -6 (c000) | 748 → 751 |
| stortinget | 5 | 5,592 | 5,582 | -6 (c240) | -10 (c060) | 1,361 → 1,364 |
| ekeberg | 5 | 9,821 | 8,668 | -1,153 (c240) | -1,153 (c000) | 669 → 698 |
| nabolaget | 4 | 5,515 | 5,421 | -94 (c180) | -94 (c000) | 657 → 673 |
| bygdoy | 5 | 4,611 | 4,603 | -8 (c240) | -8 (c000) | 591 → 595 |
| vigelandsparken | 4 | 6,034 | 6,010 | -24 (c180) | -24 (c000) | 566 → 575 |
| korketrekkeren | 5 | 2,710 | 2,704 | -6 (c240) | -6 (c000) | 746 → 749 |
| ostensjovannet | 5 | 9,380 | 9,374 | -6 (c240) | -6 (c000) | 669 → 672 |
| bjorvika | 5 | 8,210 | 8,116 | -94 (c240) | -94 (c000) | 745 → 755 |
| gamlebyen | 5 | 3,556 | 3,542 | -14 (c240) | -14 (c000) | 661 → 668 |

Over the order's limits (+200 a place, 15,000): none

No place rose: the "smallest fall" is the place that changed least. In most levels every place fell by the same number, since what
changed is drawn wherever the view is.

## The line map

Four states (nothing cleared, three, line 1, all), at 390 x 844, before (`dbfea3d`) and after: rectangles and copies a frame.

| State | before | after |
|---|---|---|
| kart-none | 5280 rectangles, 207 copies | 4143 rectangles, 364 copies |
| kart-three | 5244 rectangles, 145 copies | 4082 rectangles, 304 copies |
| kart-line2 | 5078 rectangles, 63 copies | 3891 rectangles, 220 copies |
| kart-all | 5313 rectangles, 58 copies | 4131 rectangles, 208 copies |

The water under the viaduct is a rectangle a band where it was one a screen column; each pier, bracket, deck tile, station mark and skyline one copy.
