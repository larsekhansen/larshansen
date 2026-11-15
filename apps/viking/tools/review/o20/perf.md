# Order 20: rectangles a frame, before and after

Measured 15 November 2026 with `?debug&perf` (the frame drawn fifty times, the rectangles counted) through
`tools/glance/perf.ts`, at 390 x 844, on a build of `origin/main` at the merge of PR #65 (before) and of this
branch (after), each served by `vite preview`. The places are the same on both sides: every twentieth column
of each level, him put on the first thing to stand on from the top (`x=` only, an earlier version of
`tools/glance/walk.ts`), one step. "Held" places are where he is hit on that first step: the page holds its
picture and draws nothing, so `perf` counts 0 on both sides; they are left out of the numbers.

| Level | places | most before | most after | mean before | mean after | worst place, before → after | any place heavier after |
|---|---|---|---|---|---|---|---|
| langkaia | 13 | 9,666 | 9,666 | 8,593 | 8,593 | c220: 9,666 → 9,666 | none |
| akershus | 14 | 7,621 | 7,621 | 7,012 | 7,012 | c260: 7,621 → 7,621 | none |
| radhuset | 10 (2 held) | 16,745 | 13,631 | 11,046 | 7,956 | c160: 16,745 → 13,631 | none |
| slottet | 11 (2 held) | 18,143 | 18,143 | 15,242 | 15,242 | c180: 18,143 → 18,143 | none |
| holmenkollen | 13 (1 held) | 11,979 | 11,979 | 11,481 | 11,481 | c060: 11,979 → 11,979 | none |
| akerselva | 13 | 12,242 | 12,242 | 11,288 | 11,288 | c200: 12,242 → 12,242 | none |
| nordmarka | 12 | 29,101 | 5,744 | 21,433 | 5,333 | c020: 29,101 → 5,698 | none |
| stortinget | 14 | 30,064 | 30,064 | 27,546 | 27,546 | c040: 30,064 → 30,064 | none |
| ekeberg | 13 | 12,282 | 12,282 | 11,668 | 11,668 | c100: 12,282 → 12,282 | none |
| nabolaget | 12 | 14,956 | 14,291 | 10,838 | 10,173 | c160: 14,956 → 14,291 | none |
| bygdoy | 12 (1 held) | 22,940 | 7,343 | 22,163 | 6,484 | c020: 22,940 → 7,343 | none |
| vigelandsparken | 13 | 8,174 | 8,174 | 7,250 | 7,250 | c100: 8,174 → 8,174 | none |
| korketrekkeren | 13 | 15,789 | 3,726 | 15,623 | 3,505 | c060: 15,789 → 3,620 | none |
| ostensjovannet | 14 | 11,064 | 10,906 | 9,804 | 9,698 | c260: 11,064 → 10,906 | none |
| bjorvika | 14 | 14,670 | 14,670 | 13,825 | 13,825 | c080: 14,670 → 14,670 | none |
| gamlebyen | 13 (1 held) | 8,276 | 5,887 | 7,593 | 5,226 | c100: 8,276 → 5,627 | none |

Only Nordmarka, Bygdøy and Korketrekkeren were the order's (ADR 0041). Rådhuset, Vålerenga, Østensjøvannet and
Gamlebyen are lighter for what order 20's flat places did: Rådhuset's upper tower and Vålerenga's drift kept as
strips, the stamped tiles of Rådhuset's quay and Østensjøvannet's bank, and Gamlebyen's church, market and last
longship no longer drawn off the screen (that pays for the lit windows added to its far slope and town, 22 to 36
rectangles a frame at night). No place is heavier than before.

Nordmarka's three places at both sizes (the start, the dark middle at column 175, the troll's arena at 210):

| | 1280 x 800 | 390 x 844 |
|---|---|---|
| the start | 13,822 → 3,348 | 23,772 → 4,242 |
| the dark middle | 15,277 → 4,547 | 17,354 → 5,459 |
| the troll's arena | 15,725 → 4,480 | 18,289 → 5,426 |

The pictures before and after the drawing changes of section 1 are byte-identical: Nordmarka 19 of 19 at each
size, Bygdøy and Korketrekkeren 36 of 37 at each (the 37th held, identical at step 0), Stortinget 14 of 14 at each.
