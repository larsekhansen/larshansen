# Order 21: the game in the hand, after

Measured 16 November 2026 on this branch (`in-the-hand`), built and served by `vite preview`, the same way as
`before.md`: `tools/glance/hand.ts` with a coarse pointer and a pixel ratio of 3, the states of `tools/glance/hand.tsv`,
at 360 x 640, 390 x 844, 430 x 932, 844 x 390 and 932 x 430, and the phone turned mid-level both ways (the tool asks the
page to lay out as its resize observer would, `__game.layout`, since a headless browser delivers no observations).
The columns are as in `before.md`; "over" under "pad band" means the pad lies over the picture, see-through, with
nothing solid under it.

| state | size | picture | bar | pad band | over the picture | targets | smallest | nearest | button over him and ahead | banner over | help line |
|---|---|---|---|---|---|---|---|---|---|---|---|
| start | 360x640 | 555 px, 87 % | 85 | over | banner, 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 178 px (Go in / Jump) | no | nothing |  |
| mid | 360x640 | 555 px, 87 % | 85 | over | 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 178 px (Go in / Jump) | no |  |  |
| mid-armed | 360x640 | 555 px, 87 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| troll | 360x640 | 555 px, 87 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| plough | 360x640 | 555 px, 87 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| serpent | 360x640 | 555 px, 87 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| sledge | 360x640 | 555 px, 87 % | 85 | over | help line (1 line), 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  | 1 line |
| map | 360x640 | 442 px, 69 % | 198 | over | banner, 2 buttons | 7, 0 under 56 | 166 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| card | 360x640 | 436 px, 68 % | 204 | none | card | 6, 0 under 56 | 166 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| card-home | 360x640 | 442 px, 69 % | 198 | none | card (scrolls) | 6, 0 under 56, 1 off the screen | 166 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| over | 360x640 | 436 px, 68 % | 204 | none | card | 7, 0 under 56 | 166 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| loading | 360x640 | 436 px, 68 % | 204 | none | board | 5, 0 under 56 | 166 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) |  |  |  |
| failed | 360x640 | 436 px, 68 % | 204 | none | card | 7, 0 under 56 | 166 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| start | 390x844 | 759 px, 90 % | 85 | over | banner, 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 208 px (Go in / Jump) | no | nothing |  |
| mid | 390x844 | 759 px, 90 % | 85 | over | 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 208 px (Go in / Jump) | no |  |  |
| mid-armed | 390x844 | 759 px, 90 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| troll | 390x844 | 759 px, 90 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| plough | 390x844 | 759 px, 90 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| serpent | 390x844 | 759 px, 90 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| sledge | 390x844 | 759 px, 90 % | 85 | over | help line (1 line), 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  | 1 line |
| map | 390x844 | 646 px, 77 % | 198 | over | banner, 2 buttons | 7, 0 under 56 | 181 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| card | 390x844 | 640 px, 76 % | 204 | none | card | 6, 0 under 56 | 181 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| card-home | 390x844 | 646 px, 77 % | 198 | none | card | 6, 0 under 56 | 181 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| over | 390x844 | 640 px, 76 % | 204 | none | card | 7, 0 under 56 | 181 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| loading | 390x844 | 640 px, 76 % | 204 | none | board | 5, 0 under 56 | 181 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) |  |  |  |
| failed | 390x844 | 640 px, 76 % | 204 | none | card | 7, 0 under 56 | 181 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| start | 430x932 | 847 px, 91 % | 85 | over | banner, 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 248 px (Go in / Jump) | no | nothing |  |
| mid | 430x932 | 847 px, 91 % | 85 | over | 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 248 px (Go in / Jump) | no |  |  |
| mid-armed | 430x932 | 847 px, 91 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| troll | 430x932 | 847 px, 91 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| plough | 430x932 | 847 px, 91 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| serpent | 430x932 | 847 px, 91 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| sledge | 430x932 | 847 px, 91 % | 85 | over | help line (1 line), 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  | 1 line |
| map | 430x932 | 798 px, 86 % | 134 | over | banner, 2 buttons | 7, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| card | 430x932 | 792 px, 85 % | 140 | none | card | 6, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| card-home | 430x932 | 798 px, 86 % | 134 | none | card | 6, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| over | 430x932 | 792 px, 85 % | 140 | none | card | 7, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| loading | 430x932 | 792 px, 85 % | 140 | none | board | 5, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) |  |  |  |
| failed | 430x932 | 792 px, 85 % | 140 | none | card | 7, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| start | 844x390 | 351 px, 90 % | 39 | over | banner, 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no | nothing |  |
| mid | 844x390 | 351 px, 90 % | 39 | over | 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| mid-armed | 844x390 | 351 px, 90 % | 39 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| troll | 844x390 | 351 px, 90 % | 39 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| plough | 844x390 | 351 px, 90 % | 39 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| serpent | 844x390 | 351 px, 90 % | 39 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| sledge | 844x390 | 351 px, 90 % | 39 | over | help line (1 line), 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  | 1 line |
| map | 844x390 | 351 px, 90 % | 39 | over | banner, 2 buttons | 7, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| card | 844x390 | 351 px, 90 % | 39 | none | card | 6, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| card-home | 844x390 | 351 px, 90 % | 39 | none | card | 6, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| over | 844x390 | 351 px, 90 % | 39 | none | card | 7, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Try again / To the map) | no |  |  |
| loading | 844x390 | 351 px, 90 % | 39 | none | board | 5, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) |  |  |  |
| failed | 844x390 | 351 px, 90 % | 39 | none | card | 7, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Try again / To the map) | no |  |  |
| start | 932x430 | 391 px, 91 % | 39 | over | banner, 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no | nothing |  |
| mid | 932x430 | 391 px, 91 % | 39 | over | 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| mid-armed | 932x430 | 391 px, 91 % | 39 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| troll | 932x430 | 391 px, 91 % | 39 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| plough | 932x430 | 391 px, 91 % | 39 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| serpent | 932x430 | 391 px, 91 % | 39 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| sledge | 932x430 | 391 px, 91 % | 39 | over | help line (1 line), 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  | 1 line |
| map | 932x430 | 391 px, 91 % | 39 | over | banner, 2 buttons | 7, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no | nothing |  |
| card | 932x430 | 391 px, 91 % | 39 | none | card | 6, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| card-home | 932x430 | 391 px, 91 % | 39 | none | card | 6, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) | no |  |  |
| over | 932x430 | 391 px, 91 % | 39 | none | card | 7, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Try again / To the map) | no |  |  |
| loading | 932x430 | 391 px, 91 % | 39 | none | board | 5, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Gamle Oslo / QR-verkstedet) |  |  |  |
| failed | 932x430 | 391 px, 91 % | 39 | none | card | 7, 0 under 56 | 86 x 56 (Gamle Oslo) | 8 px (Try again / To the map) | no |  |  |
| mid | 390x844 → 844x390 | 759 px, 90 % | 85 | over | 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 208 px (Go in / Jump) | no |  |  |
| mid, turned | 844x390 | 351 px, 90 % | 39 | over | 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| mid-armed | 390x844 → 844x390 | 759 px, 90 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |
| mid-armed, turned | 844x390 | 351 px, 90 % | 39 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| mid | 844x390 → 390x844 | 351 px, 90 % | 39 | over | 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| mid, turned | 390x844 | 759 px, 90 % | 85 | over | 2 buttons | 3, 0 under 56 | 56 x 56 (Sound off) | 208 px (Go in / Jump) | no |  |  |
| mid-armed | 844x390 → 390x844 | 351 px, 90 % | 39 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Go in / Jump) | no |  |  |
| mid-armed, turned | 390x844 | 759 px, 90 % | 85 | over | 3 buttons | 4, 0 under 56 | 56 x 56 (Sound off) | 10 px (Dash / Jump) | no |  |  |

Turning the phone mid-level: the steps and the clock (the game did not start again), him in view below the bar, the bar's width.

| state | turned | steps | clock | him in view | bar |
|---|---|---|---|---|---|
| mid | 390x844 → 844x390 | 200 → 200 | 0:00.0 → 0:00.0 | yes → yes | 844 of 844 |
| mid-armed | 390x844 → 844x390 | 200 → 200 | 0:00.0 → 0:00.0 | yes → yes | 844 of 844 |
| mid | 844x390 → 390x844 | 200 → 200 | 0:00.0 → 0:00.0 | yes → yes | 390 of 390 |
| mid-armed | 844x390 → 390x844 | 200 → 200 | 0:00.0 → 0:00.0 | yes → yes | 390 of 390 |

Per rule (order 21, section 2):

1. **The game gets the screen.** In a level the picture gets 87 % (360 x 640) to 91 % (430 x 932) of the height
   upright and 90 to 91 % on its side (62 and 78 wanted): the bar is 85 px upright (the runes; the clock, hearts,
   lives, skilling and sound) and 39 px on its side (one row). On the map and on the cards, where the links are whole
   again, 68 to 86 % upright and 90 to 91 % on its side. On its side the stage is now the window's full height, so the
   kit's sizing (about 192 art pixels high) draws the game larger there: 2 CSS pixels to an art pixel at a pixel ratio
   of 3, where it was 1.33 (26 tiles across 844 px instead of 40). Upright the scale is as before.
2. **The help line** on a touch screen is a note of what changed, one line at every size here (the sledge mounted),
   under the bar, not over him, naming no key.
3. **The banner** covers nothing in any state, at any size.
4. **Targets**: none under 56 x 56 (before: 5 to 10 a screen); the nearest two 8 px apart (the links, by their
   targets; the cards' two buttons) and 10 on the pad. Vålerenga's long card scrolls at 360 x 640 (its button below
   the fold, any tap takes him on).
5. **Fingers** (synthetic pointer events): `src/render/pad.test.ts`.
6. **Him and the ground ahead** under no button in any state; along every route at every size: `src/game/frame.test.ts`.
7. **Nothing else moves the page**: CSS, not measurable headless; on the list for a person with a phone.
8. **Turning** keeps the level going (the same step, the same clock), him in view, the bar whole (the last table).
9. **Furniture**: the pad's colours are greys and white (`pad.test.ts`).

The camera, along every level's scripted route at a pixel ratio of 3 (`frame.test.ts` holds it; the numbers from the
same framing measured frame by frame): he stands two thirds of the way down the screen above the pad's bottom row,
upright and on its side, which puts him higher than the plain camera did by up to 69 px upright (at a level's start)
and, with the lifts near a level's ends where he would still come under a button, by up to 118 to 136 px on its side
(Gamlebyen's start). Without a notch the camera never moves more than 10 px in a frame beyond its own motion (upright
4 px). With a notch on its side (insets of 47 px) a turn on landing beside the dash jumps it up to 72 px in a frame:
17 frames in all sixteen routes at 844 x 390, most in the bosses' fights; none at 932 x 430 over 24 px.
