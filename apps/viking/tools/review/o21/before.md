# Order 21, section 1: the game in the hand, before

Measured 16 November 2026 on a build of `origin/main` at the merge of PR #66 (`b50413c`), served by `vite preview`, with
`tools/glance/hand.ts`: headless Firefox told it has a coarse pointer (so the page shows its touch pad, as on a phone) and
a device pixel ratio of 3, at 360 x 640, 390 x 844 and 430 x 932 upright and 844 x 390 and 932 x 430 on its side; the
states are `tools/glance/hand.tsv` (a level's start with its banner, mid-level on Akershus and on Vigelandsparken with
all five buttons, the troll's wind-up, the plough's, the serpent rearing, the sledge, the map with both lines, the card
after Langkaia's rune and after Vålerenga's (the tenth), Game over, the loading board, the failed-load card). The
numbers are CSS pixels, read from the page itself; `tools/glance/hand-table.ts` makes this table.

- **picture**: the screen's height less what is solid over it (the bar, the pad's band), and its share.
- **over the picture**: what lies over the picture, see-through or not: the help line, the banner, buttons, a card.
- **targets**: everything a finger can press (the bar's links and buttons, the pad's, a card's), how many are under
  56 x 56, how many reach off the screen; the smallest; the two nearest each other and the gap between them.
- **button over him and ahead**: whether a button lies over him, the two tiles under his feet and six ahead (rule 6).
- **banner over**: what the banner covers of him, enemies, shots and pickups (rule 3).
- **help line**: its lines, and whether it names keys or covers him (rule 2).

The safe areas are nought in a headless browser; `render/pad.test.ts` checks them with a notch and a home bar.

| state | size | picture | bar | pad band | over the picture | targets | smallest | nearest | button over him and ahead | banner over | help line |
|---|---|---|---|---|---|---|---|---|---|---|---|
| start | 360x640 | 400 px, 63 % | 144 | 96 | banner | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| mid | 360x640 | 400 px, 63 % | 144 | 96 | nothing | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| mid-armed | 360x640 | 400 px, 63 % | 144 | 96 | nothing | 11, 10 under 56, 1 off the screen | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| troll | 360x640 | 400 px, 63 % | 144 | 96 | nothing | 10, 6 under 56, 1 off the screen | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| plough | 360x640 | 400 px, 63 % | 144 | 96 | nothing | 10, 6 under 56, 1 off the screen | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| serpent | 360x640 | 400 px, 63 % | 144 | 96 | nothing | 11, 10 under 56, 1 off the screen | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| sledge | 360x640 | 400 px, 63 % | 144 | 96 | nothing | 11, 11 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| map | 360x640 | 372 px, 58 % | 172 | 96 | banner | 9, 5 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| card | 360x640 | 400 px, 63 % | 144 | 96 | card | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| card-home | 360x640 | 372 px, 58 % | 172 | 96 | card | 10, 6 under 56, 1 off the screen | 84 x 19 (Gamle Oslo) | -24 px (Walk right / To the map) | no |  |  |
| over | 360x640 | 400 px, 63 % | 144 | 96 | card | 11, 8 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| loading | 360x640 | 400 px, 63 % | 144 | 96 | board | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) |  |  |  |
| failed | 360x640 | 400 px, 63 % | 144 | 96 | banner, card | 10, 7 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| start | 390x844 | 604 px, 72 % | 144 | 96 | banner | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| mid | 390x844 | 604 px, 72 % | 144 | 96 | nothing | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| mid-armed | 390x844 | 604 px, 72 % | 144 | 96 | nothing | 11, 10 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| troll | 390x844 | 604 px, 72 % | 144 | 96 | nothing | 10, 6 under 56, 1 off the screen | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| plough | 390x844 | 604 px, 72 % | 144 | 96 | nothing | 10, 6 under 56, 1 off the screen | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| serpent | 390x844 | 604 px, 72 % | 144 | 96 | nothing | 11, 10 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| sledge | 390x844 | 604 px, 72 % | 144 | 96 | nothing | 11, 11 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| map | 390x844 | 610 px, 72 % | 138 | 96 | banner | 9, 5 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| card | 390x844 | 604 px, 72 % | 144 | 96 | card | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| card-home | 390x844 | 610 px, 72 % | 138 | 96 | card | 10, 6 under 56, 1 off the screen | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| over | 390x844 | 604 px, 72 % | 144 | 96 | card | 11, 8 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| loading | 390x844 | 604 px, 72 % | 144 | 96 | board | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) |  |  |  |
| failed | 390x844 | 604 px, 72 % | 144 | 96 | banner | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| start | 430x932 | 692 px, 74 % | 144 | 96 | banner | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| mid | 430x932 | 692 px, 74 % | 144 | 96 | nothing | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| mid-armed | 430x932 | 692 px, 74 % | 144 | 96 | nothing | 11, 10 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| troll | 430x932 | 692 px, 74 % | 144 | 96 | nothing | 10, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| plough | 430x932 | 692 px, 74 % | 144 | 96 | nothing | 10, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| serpent | 430x932 | 692 px, 74 % | 144 | 96 | nothing | 11, 10 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| sledge | 430x932 | 692 px, 74 % | 144 | 96 | nothing | 11, 11 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| map | 430x932 | 698 px, 75 % | 138 | 96 | banner | 9, 5 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| card | 430x932 | 692 px, 74 % | 144 | 96 | card | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| card-home | 430x932 | 698 px, 75 % | 138 | 96 | card | 10, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| over | 430x932 | 692 px, 74 % | 144 | 96 | card | 11, 8 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| loading | 430x932 | 692 px, 74 % | 144 | 96 | board | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) |  |  |  |
| failed | 430x932 | 692 px, 74 % | 144 | 96 | banner | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| start | 844x390 | 216 px, 55 % | 78 | 96 | banner | 9, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no | nothing |  |
| mid | 844x390 | 216 px, 55 % | 78 | 96 | nothing | 9, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| mid-armed | 844x390 | 216 px, 55 % | 78 | 96 | nothing | 11, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| troll | 844x390 | 216 px, 55 % | 78 | 96 | nothing | 10, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| plough | 844x390 | 216 px, 55 % | 78 | 96 | nothing | 10, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| serpent | 844x390 | 216 px, 55 % | 78 | 96 | nothing | 11, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| sledge | 844x390 | 216 px, 55 % | 78 | 96 | nothing | 11, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| map | 844x390 | 219 px, 56 % | 75 | 96 | banner | 9, 5 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no | nothing |  |
| card | 844x390 | 216 px, 55 % | 78 | 96 | card | 9, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| card-home | 844x390 | 219 px, 56 % | 75 | 96 | card | 10, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| over | 844x390 | 216 px, 55 % | 78 | 96 | card | 11, 8 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| loading | 844x390 | 216 px, 55 % | 78 | 96 | board | 9, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) |  |  |  |
| failed | 844x390 | 216 px, 55 % | 78 | 96 | banner, card | 10, 7 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no | nothing |  |
| start | 932x430 | 256 px, 60 % | 78 | 96 | banner | 9, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no | nothing |  |
| mid | 932x430 | 256 px, 60 % | 78 | 96 | nothing | 9, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| mid-armed | 932x430 | 256 px, 60 % | 78 | 96 | nothing | 11, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| troll | 932x430 | 256 px, 60 % | 78 | 96 | nothing | 10, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| plough | 932x430 | 256 px, 60 % | 78 | 96 | nothing | 10, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| serpent | 932x430 | 256 px, 60 % | 78 | 96 | nothing | 11, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| sledge | 932x430 | 256 px, 60 % | 78 | 96 | nothing | 11, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| map | 932x430 | 259 px, 60 % | 75 | 96 | banner | 9, 5 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no | nothing |  |
| card | 932x430 | 256 px, 60 % | 78 | 96 | card | 9, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| card-home | 932x430 | 259 px, 60 % | 75 | 96 | card | 10, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| over | 932x430 | 256 px, 60 % | 78 | 96 | card | 11, 8 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| loading | 932x430 | 256 px, 60 % | 78 | 96 | board | 9, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) |  |  |  |
| failed | 932x430 | 256 px, 60 % | 78 | 96 | banner, card | 10, 7 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no | nothing |  |
| mid | 390x844 → 844x390 | 604 px, 72 % | 144 | 96 | nothing | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| mid, turned | 844x390 | 216 px, 55 % | 78 | 96 | nothing | 9, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | under the pad band |  |  |
| mid-armed | 390x844 → 844x390 | 604 px, 72 % | 144 | 96 | nothing | 11, 10 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| mid-armed, turned | 844x390 | 216 px, 55 % | 78 | 96 | nothing | 11, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | under the pad band |  |  |
| mid | 844x390 → 390x844 | 216 px, 55 % | 78 | 96 | nothing | 9, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| mid, turned | 390x844 | 604 px, 72 % | 144 | 96 | nothing | 9, 6 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| mid-armed | 844x390 → 390x844 | 216 px, 55 % | 78 | 96 | nothing | 11, 6 under 56 | 101 x 22 (Gamle Oslo) | 6 px (QR-verkstedet / Jernhaugen) | no |  |  |
| mid-armed, turned | 390x844 | 604 px, 72 % | 144 | 96 | nothing | 11, 10 under 56 | 84 x 19 (Gamle Oslo) | 3 px (Gamle Oslo / QR-verkstedet) | no |  |  |

Turning the phone mid-level: the steps and the clock (the game did not start again), him in view below the bar, the bar's width.

| state | turned | steps | clock | him in view | bar |
|---|---|---|---|---|---|
| mid | 390x844 → 844x390 | 200 → 200 | 0:00.0 → 0:00.0 | yes → no | 844 of 844 |
| mid-armed | 390x844 → 844x390 | 200 → 200 | 0:00.0 → 0:00.0 | yes → no | 844 of 844 |
| mid | 844x390 → 390x844 | 200 → 200 | 0:00.0 → 0:00.0 | yes → no | 390 of 390 |
| mid-armed | 844x390 → 390x844 | 200 → 200 | 0:00.0 → 0:00.0 | yes → no | 390 of 390 |

What it says:

- **The picture** got 63 % (360 x 640) to 74 % (430 x 932) of the height upright, and 55 % (844 x 390) and 60 %
  (932 x 430) on its side: the bar was 144 px upright (four rows: the name, the links, the runes, the run) and 75 to
  78 px on its side (two rows), and the pad a solid band of 96 px under the picture. On the map with line 2 open the
  bar was 172 px at 360 (58 %).
- **Targets**: every link in the bar was 19 to 22 px tall, 3 to 6 px from the next; restart and sound 30 x 30; the
  card's buttons 31 px tall. The pad's buttons were 64 px tall, but with five of them (the dash and the shield) at
  360 x 640 they were 50 to 54 px wide and the jump ran 6 px off the screen (430: just in). Left and right were two
  buttons, each holding its finger (pointer capture) even when it slid off.
- **Vålerenga's tenth-rune card** at 360 x 640 ran under the pad (its "To the map" 24 px into the pad's "Walk right").
- **The help line** never showed on a touch screen: the shield given, the sledge and the pole were not said there.
- **The banner** covered nothing in these states; **him and the ground ahead** were never under the pad's band in them.
- **Turning the phone**: in a headless browser the page's resize observer is never told, so the bar re-laid out (by
  CSS) but the game did not draw again; the last rows say so ("under the pad band" is that stale picture). After this
  order `hand.ts` asks the page to lay out as its observer would (`__game.layout`, `?debug`); the old page has no such
  hook, so the turn was not measured before.
