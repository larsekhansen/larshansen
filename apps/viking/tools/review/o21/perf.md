# Order 21, section 3: rectangles a frame

Measured 16 November 2026 with `?debug&perf` (the frame drawn fifty times, the rectangles counted) through
`tools/glance/perf.ts`, at 390 x 844 (a pixel ratio of 1, as orders 18 to 20 measured), each build served by
`vite preview`. The places are `tools/glance/walk.ts`'s as it is now: every twentieth column of each level's scripted
route, where the route first stands past it (order 20's table, `../o20/perf.md`, was taken at an earlier version's
places, so its numbers are not place for place the same). "Held" places are where he is hit on the first step: the
page holds its picture and draws nothing.

For Stortinget and Slottet, the two this order changed, "before" is the build of `origin/main` at `b50413c` at the same
places. For the other fourteen "before" is order 20's own table (its places), for reference; their drawing did not
change, and the pictures say so (the desktop shots below).

| Level | places | most before | most after | mean before | mean after | worst place, before → after | over 15,000 after |
|---|---|---|---|---|---|---|---|
| langkaia | 11 | 9,666 | 9,477 | 8,593 | 8,409 | c200: 9,477 | none |
| akershus | 14 | 7,621 | 7,604 | 7,012 | 6,997 | c260: 7,604 | none |
| radhuset | 11 (2 held) | 13,631 | 13,188 | 7,956 | 7,568 | c160: 13,188 | none |
| slottet | 12 (1 held) | 17,779 | 9,795 | 15,382 | 9,424 | c180: 17,779 → 9,771 | none |
| holmenkollen | 12 | 11,979 | 11,980 | 11,481 | 11,606 | c080: 11,980 | none |
| akerselva | 13 | 12,242 | 11,989 | 11,288 | 11,247 | c200: 11,989 | none |
| nordmarka | 11 | 5,744 | 5,719 | 5,333 | 5,285 | c140: 5,719 | none |
| stortinget | 14 (1 held) | 29,919 | 9,950 | 28,436 | 5,491 | c060: 29,919 → 9,234 | none |
| ekeberg | 13 | 12,282 | 12,209 | 11,668 | 11,607 | c100: 12,209 | none |
| nabolaget | 11 | 14,291 | 14,252 | 10,173 | 10,216 | c160: 14,252 | none |
| bygdoy | 13 | 7,343 | 6,892 | 6,484 | 6,392 | c140: 6,892 | none |
| vigelandsparken | 12 (1 held) | 8,174 | 8,168 | 7,250 | 7,288 | c100: 8,168 | none |
| korketrekkeren | 14 | 3,726 | 3,712 | 3,505 | 3,512 | c200: 3,712 | none |
| ostensjovannet | 13 | 10,906 | 10,843 | 9,698 | 9,552 | c240: 10,843 | none |
| bjorvika | 14 | 14,670 | 14,600 | 13,825 | 13,769 | c080: 14,600 | none |
| gamlebyen | 14 (1 held) | 5,887 | 5,887 | 5,226 | 5,070 | c260: 5,887 | none |

Stortinget and Slottet, every place:

| place | before | after |
|---|---|---|
| slottet-c000 | 13,268 | 9,210 |
| slottet-c020 | 13,543 | 9,306 |
| slottet-c040 | 16,067 | 9,669 |
| slottet-c060 | 15,205 | 9,329 |
| slottet-c080 | held | held |
| slottet-c100 | 13,708 | 9,110 |
| slottet-c120 | 13,555 | 9,047 |
| slottet-c140 | 16,485 | 9,795 |
| slottet-c160 | 15,484 | 9,518 |
| slottet-c180 | 17,779 | 9,771 |
| slottet-c200 | 17,217 | 9,519 |
| slottet-c220 | 16,890 | 9,394 |
| stortinget-c000 | 27,894 | 3,590 |
| stortinget-c020 | 28,247 | 4,163 |
| stortinget-c040 | 29,909 | 9,950 |
| stortinget-c060 | 29,919 | 9,234 |
| stortinget-c080 | 28,042 | 4,679 |
| stortinget-c100 | 28,364 | 4,902 |
| stortinget-c120 | 28,179 | 4,458 |
| stortinget-c140 | held | held |
| stortinget-c160 | 28,106 | 4,768 |
| stortinget-c180 | 28,268 | 5,287 |
| stortinget-c200 | 28,333 | 6,002 |
| stortinget-c220 | 28,280 | 5,126 |
| stortinget-c240 | 28,146 | 5,007 |
| stortinget-c260 | 27,987 | 4,214 |

What was done (ADR 0041's way, amended by a line):

- **Stortinget**: what is off the screen is not drawn. The ticket hall, the platform walls, the tunnel's rock, the
  cavern, the depot's siding, the kiosk and what lies past the end ask `seen` first; the loops that draw a column at a
  time (the escalators' steps and balustrades, the shafts' tiled walls, the cavern's express track and the slot, the
  walkway, the tiles' joints, the trains' cars) run over the screen's columns only. The far rock, thousands of blocks on
  a tall screen, is stamped in 128-pixel blocks of the layer's own pixels (`stamp`): a block's courses fill it to its
  edges, so the copies make the same picture. Its worst place (the escalator shafts, column 40) is 9,950, 3,600 of it
  the shafts' tiled wall.
- **Slottet**: the ground under the street (`under`, about seventeen rectangles a tile on a tall screen) is kept tile
  by tile (`kept`); the street's slopes are drawn only on the screen.

The pictures are byte-identical: Stortinget's and Slottet's walk at 1280 x 800 and 390 x 844, by day, and four places
of each at night, 67 of 68; the 68th (Slottet at column 80, where he is hit on the first step) holds its
picture, and at step 0 it is identical at both sizes. Ten more desktop pictures of Langkaia, Akershus, Bygdøy,
Gamlebyen, the map and a Game over, before and after this order: 10 of 10 identical.
