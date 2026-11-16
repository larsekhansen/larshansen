# Order 23: every drawing still in the old style

Lars chose way 3 (ADR 0045): figures and small things drawn as per-pixel frames with a ramp of tones and a lit side.
Order 23 drew him, the enemies of line 1's first three levels and the skilling and the cheese that way. Everything below
is still drawn in rectangles, one tone or two a material (it has its frames from `parts`, but not its pixels). For the
next orders, a level at a time. "Shared" means drawn once for every level that has it.

## Enemies

| Kind | Look | Levels | File |
|---|---|---|---|
| spiky | hedgehog | Holmenkollen, Akerselva, Nordmarka, Ekeberg | `src/render/looks.ts` (shared) |
| spiky | grill | Holmenkollen, Akerselva | `src/render/looks.ts` |
| thrower | kid | Holmenkollen, Korketrekkeren, Vålerenga | `src/render/looks.ts` |
| flyer | wasp | Akerselva, Ekeberg | `src/render/looks.ts` |
| walker | fox | Holmenkollen, Nordmarka, Korketrekkeren, Vålerenga | `src/render/looks.ts` |
| flyer | owl | Nordmarka, Korketrekkeren, Vålerenga, Gamlebyen | `src/render/looks.ts` |
| thrower | squirrel | Nordmarka, Ekeberg | `src/render/looks.ts` |
| walker | hotdog | Slottet | `src/levels/slottet.ts` |
| jumper | salmon | Akerselva | `src/levels/akerselva.ts` (a letter map, two tones a material) |
| walker | duck | Akerselva | `src/levels/akerselva.ts` |
| flyer | bat | Nordmarka | `src/levels/nordmarka.ts` |
| spiky | anthill | Nordmarka | `src/levels/nordmarka.ts` |
| flyer | pigeonfly | Stortinget | `src/levels/stortinget.ts` |
| jumper | trackrat | Stortinget | `src/levels/stortinget.ts` |
| spiky | umbrella | Stortinget | `src/levels/stortinget.ts` |
| walker | trolley | Stortinget | `src/levels/stortinget.ts` |
| walker | magpie | Ekeberg | `src/levels/ekeberg.ts` |
| walker | cat | Vålerenga | `src/levels/nabolaget.ts` |
| walker | crab, penguin | Bygdøy | `src/levels/bygdoy.ts` |
| thrower | slinger | Bygdøy | `src/levels/bygdoy.ts` |
| spiky | statue, bronze | Vigelandsparken | `src/levels/vigelandsparken.ts` |
| jumper | boy | Vigelandsparken | `src/levels/vigelandsparken.ts` |
| thrower | ringer | Vigelandsparken | `src/levels/vigelandsparken.ts` |
| walker | sledger | Korketrekkeren | `src/levels/korketrekkeren.ts` |
| spiky | swan | Østensjøvannet | `src/levels/ostensjovannet.ts` |
| walker | coot, duck | Østensjøvannet | `src/levels/ostensjovannet.ts` |
| thrower | nester | Østensjøvannet | `src/levels/ostensjovannet.ts` |
| thrower | riveter | Bjørvika | `src/levels/bjorvika.ts` |
| thrower | archer | Gamlebyen | `src/levels/gamlebyen.ts` |
| walker | guard (the bishop's), goose, dog | Gamlebyen | `src/levels/gamlebyen.ts` |

Drawn as frames already (for reference): pigeon, gull on the wing, crow, rat (every level that has them,
`src/alive/foes.ts`); Akershus's guard and brazier (`src/levels/akershus.ts`); the gull on Rådhuset's bank and the scooter
(Rådhuset and Stortinget, `src/render/looks.ts`).

## The bosses

| Boss | Level | File |
|---|---|---|
| the troll (asleep, waking, walking, its club raised, stuck, hit, stone) | Nordmarka | `src/levels/nordmarka.ts` |
| the plough (parked, driving, revving, charging, stuck, hit, beaten) | Vålerenga | `src/levels/nabolaget.ts` |
| the sea serpent (its ring, rising, rearing, spitting, dazed, its tail) | Gamlebyen | `src/levels/gamlebyen.ts` |

## What moves and cannot hurt him

| Thing | Levels | File |
|---|---|---|
| sheep | Ekeberg (and the map) | `src/render/actors.ts` (a letter map, one tone a material) |
| the moose | Holmenkollen | `src/levels/holmenkollen.ts` |
| the parade, the King's Guard | Slottet | `src/levels/slottet.ts` |
| the heron | Østensjøvannet | `src/levels/ostensjovannet.ts` |

## What is thrown

| Thing | Thrower | File |
|---|---|---|
| a snowball | kid | `src/render/pickups.ts` |
| a chip, a cone | gull on the bank, squirrel | `src/render/looks.ts` |
| a stone, a ring, a bolt, an arrow, a gull's dive | slinger, ringer, riveter, archer, nester | each level's file |
| the serpent's ball | the serpent | `src/levels/gamlebyen.ts` |

## Small things

| Thing | File |
|---|---|
| the bracteate (already a letter map, four tones of amber; its turn by narrowing) | `src/render/actors.ts` |
| a rune on its stone | `src/render/actors.ts` |
| the shield (on his back, held up, where it is given) | `src/game/shield.ts` |
| the raven's feather (as it floats down onto him) | `packages/maze/src/feather.ts` (the maze's too) |
| a flag on its pole (the front page's too: opt-in only) | `packages/pixelkit/src/checkpoint.ts` |
| a park bench | `src/render/pickups.ts` |
| the ski pole at his side | `src/main.ts` (`skiPole`) |
