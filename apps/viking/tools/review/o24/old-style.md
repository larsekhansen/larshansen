# Order 24: what is still drawn in the old style (for order 25)

Lars chose way 3 (ADR 0045): figures and small things drawn as per-pixel frames with a ramp of tones and a lit side.
Order 23 drew him, the first three levels' enemies, the skilling and the cheese that way; order 24 drew the rest of
line 1 and the things every level shares (the list order 23 left, `../o23/old-style.md`, with what was done struck out
below). What is left is line 2's own: everything below still has its frames from `parts` (a cycle, a breath, a bob)
but not its pixels: one tone or two a material, drawn in rectangles.

## Done in order 24

- **Shared looks** (`src/render/looks.ts`): hedgehog, grill, kid (a plum or an orange jacket, a snowball raised, the arm
  out as it throws), wasp, fox, owl, squirrel; Rådhuset's gull and the scooter were order 23's.
- **Line 1's own kinds**: the hot-dog cart (`levels/slottet.ts`); the salmon and the duck (`levels/akerselva.ts`); the bat
  and the anthill (`levels/nordmarka.ts`); the flying pigeon, the track rat (Langkaia's rat turned on end), the umbrella
  (plum or pink) and the trolley (`levels/stortinget.ts`); the magpie (`levels/ekeberg.ts`); the cat (`levels/nabolaget.ts`).
- **Line 1's bosses**: the troll (`levels/nordmarka.ts`: five tones of hide and five of stone, shaded pixel by pixel from
  the top left; an eye; its eyes in the dark follow its head) and the plough (`levels/nabolaget.ts`: panels lit and shaded,
  the cab's glass with a reflection, the door, the grille, the tyres' tread, the blade's lit edge). Every tell where it was.
- **Harmless movers of line 1**: the sheep (`alive/things.ts`), the moose (`levels/nordmarka.ts`), Slottet's parade children,
  banner bearers and King's Guard (`levels/slottet.ts`, still kept by `outlined`).
- **Thrown**: the gull's chip, the squirrel's cone, the kid's snowball (`render/looks.ts`), each turning in two frames.
- **Small things**: the bench, the bracteate, the rune on its stone, the flag the game flies (three frames in its level's
  wind; the kit's flag stays the front page's), the ski pole, the feather (`alive/things.ts`); the shield face on, on his
  back and raised (`game/shield.ts`).
- **Frames only, pixels for order 25**: the sea serpent breathes while reared and rocks in its daze (`levels/gamlebyen.ts`).

## Left: enemies

| Kind | Look | Level | File |
|---|---|---|---|
| walker | crab, penguin | Bygdøy | `src/levels/bygdoy.ts` |
| thrower | slinger | Bygdøy | `src/levels/bygdoy.ts` |
| spiky | statue, bronze | Vigelandsparken | `src/levels/vigelandsparken.ts` |
| jumper | boy | Vigelandsparken | `src/levels/vigelandsparken.ts` |
| thrower | ringer | Vigelandsparken | `src/levels/vigelandsparken.ts` |
| walker | sledger | Korketrekkeren | `src/levels/korketrekkeren.ts` |
| spiky | swan | Østensjøvannet | `src/levels/ostensjovannet.ts` |
| walker | coot, duck (the lake's own) | Østensjøvannet | `src/levels/ostensjovannet.ts` |
| thrower | nester | Østensjøvannet | `src/levels/ostensjovannet.ts` |
| thrower | riveter | Bjørvika | `src/levels/bjorvika.ts` |
| thrower | archer | Gamlebyen | `src/levels/gamlebyen.ts` |
| walker | guard (the bishop's), goose, dog | Gamlebyen | `src/levels/gamlebyen.ts` |

Line 2's levels already meet the shared looks drawn in order 24 (the kid at Korketrekkeren, the fox and the owl at
Korketrekkeren and Gamlebyen): those are done.

## Left: the boss, what moves and cannot hurt him, what is thrown

| Thing | Level | File |
|---|---|---|
| the sea serpent's pixels (its ring, rising, rearing, spitting, dazed, its tail; its frames are order 24's) | Gamlebyen | `src/levels/gamlebyen.ts` |
| the heron | Østensjøvannet | `src/levels/ostensjovannet.ts` |
| a stone, a ring, a bolt, an arrow, a nesting gull's dive | Bygdøy, Vigelandsparken, Bjørvika, Gamlebyen, Østensjøvannet | each level's file |
| the serpent's ball | Gamlebyen | `src/levels/gamlebyen.ts` |

## Notes for whoever draws them

- An enemy's tones are the enemy palette's and nothing else (`render/palette.test.ts`): plum (light, plum, dark, the
  near-black), white (the eye's pale, white, its shade), orange (light, orange, the near-black, the pale as a highlight),
  green (light, green, the near-black), pink (pink, the near-black). Order 24 looked for a tone more
  (`tools/glance/tones.ts`): no brown and no dark orange passes the test (every brown is within 3 to 5 of a field, the dark
  oranges fall on the red outline for someone who cannot tell red from green); a dark green, `#2c7a18`, passes by 0.2 and
  was not added.
- A look drawn as frames: `Looks` in `src/alive/foes.ts` (idle two frames, move four, a wind-up pose for a thrower), drawn
  with `drawFoe(e, foeFrame(e, t, looks), w, h)`, its height the old drawing's so its head is where he lands on it (the
  palette test holds it within two pixels). `turned` in `alive/frames.ts` turns a frame a quarter or upside down.
- `bun tools/glance/frames.ts <look> > f.json; python3 tools/glance/framesheet.py f.json <dir> --scale=6` makes its
  sheet as the game draws it; `tools/glance/bosses.ts` the bosses in every state.
