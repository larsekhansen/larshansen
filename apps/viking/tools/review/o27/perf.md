# Order 27: rectangles a frame, against order 26's table

Measured on the night of 16 November 2026 with `?debug&perf` through `tools/glance/perf.ts` at 390 x 844, on a build of branch
`the-neon-invaders` with everything in it served by `vite preview`, at order 23's places (`bun tools/glance/walk.ts --every=60`,
73 places, each level's own sky, Langkaia by day), against `../o26/perf-after.tsv`. The order allows no place more than 300
rectangles over order 26's table, none over 15,000. The counts are the measure; the times are not (the walk ran beside the
pictures for the hand-back, a second headless Firefox).

No place draws a rectangle more than after order 26: every invader is a sprite painted once per shape and copied (ADR 0036), so its
marks, its sheen and its lean change what is painted the first time, not what a frame draws. What is new is copies: the glow after
dark (one a visible invader), the invaders' scenery (one a piece on the screen) and the map's mirror balls (one a station), at most 21
more a frame (Nordmarka, at night).

| Level | places | most, order 26 | most, order 27 | largest rise (place) | largest fall (place) | copies a frame, most, 26 → 27 |
|---|---|---|---|---|---|---|
| langkaia | 4 | 6,296 | 6,296 | +0 (c180) | +0 (c000) | 597 → 598 |
| akershus | 5 | 5,817 | 5,817 | +0 (c240) | +0 (c000) | 967 → 967 |
| radhuset | 4 | 3,758 | 3,758 | +0 (c180) | +0 (c000) | 706 → 706 |
| slottet | 4 | 7,434 | 7,434 | +0 (c180) | +0 (c000) | 800 → 800 |
| holmenkollen | 4 | 10,141 | 10,141 | +0 (c180) | +0 (c000) | 651 → 652 |
| akerselva | 5 | 10,063 | 10,063 | +0 (c240) | +0 (c000) | 551 → 551 |
| nordmarka | 4 | 3,908 | 3,908 | +0 (c180) | +0 (c000) | 727 → 748 |
| stortinget | 5 | 5,592 | 5,592 | +0 (c240) | +0 (c000) | 1,361 → 1,361 |
| ekeberg | 5 | 9,821 | 9,821 | +0 (c240) | +0 (c000) | 656 → 669 |
| nabolaget | 4 | 5,515 | 5,515 | +0 (c180) | +0 (c000) | 648 → 657 |
| bygdoy | 5 | 4,611 | 4,611 | +0 (c240) | +0 (c000) | 591 → 591 |
| vigelandsparken | 4 | 6,034 | 6,034 | +0 (c180) | +0 (c000) | 566 → 566 |
| korketrekkeren | 5 | 2,710 | 2,710 | +0 (c240) | +0 (c000) | 737 → 746 |
| ostensjovannet | 5 | 9,380 | 9,380 | +0 (c240) | +0 (c000) | 661 → 669 |
| bjorvika | 5 | 8,210 | 8,210 | +0 (c240) | +0 (c000) | 732 → 745 |
| gamlebyen | 5 | 3,556 | 3,556 | +0 (c240) | +0 (c000) | 652 → 661 |

Over the order's limits: none
