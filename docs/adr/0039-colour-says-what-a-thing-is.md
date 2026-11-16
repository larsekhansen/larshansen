# 0039. Colour says what a thing is

Decided 2026-11-15 by the planner (order 18, sections 4 to 6), after Lars played on his phone: "the enemies
should be slightly bigger and more obvious. i think grey isnt smart because the bg often is gray. so make a
palette for enemies that dont overlap with the bg"; then "all platforms also need a separate palette"; then
"consider other assets that have to have a different palette too". Carried out by the order 18 implementer.

## Context
The game's enemies were grey pigeons, grey-brown rats, black crows on grey stone, a grey troll in a grey
forest: on a phone, at a glance, they were the backdrop. What he could stand on was drawn in each level's
own materials, so a ledge, a carving and a slab looked alike. Nothing kept one kind of thing's colours from
another's.

## Decision
One rule: **a colour belongs to a role, and a role's colours belong to nothing else**. The roles and their
colours are named in `packages/pixelkit/src/swatches/roles.ts`; each role's colours live in a file of their
own.

- **What can hurt him and moves** (`swatches/enemy.ts`): signal red, orange, magenta-plum and poison green,
  each with a lighter shade, a near-black outline, a pale for eyes (and only eyes), a pale for teeth and
  claws. No greys, stone, muted browns, sky or water blues. Every enemy look and everything thrown is drawn
  from it and nothing else (tested). Each kind keeps its shape: a plum rat, an orange-breasted plum pigeon,
  guards in red, an acid wasp, a pink swan.
- **Outlined, as part of its look.** Every enemy, what it throws, and the bosses are drawn into a recorder,
  painted once per shape onto a small canvas with a one-pixel outline round it, and copied from then on
  (`apps/viking/src/render/sprite.ts`): an enemy costs one copy a frame, not its rectangles. The eyes it drew
  are found there and shine after dark (ADR 0023's eye-shine, now for every enemy with eyes). Stone does not
  bite: a statue he watches, Gamlebyen's guards while they are statues, a pulled-off sledger, the troll
  asleep or all stone, the plough parked are drawn plain.
- **A quarter larger**, redrawn at that size (not scaled). Boxes grew with the pictures by a quarter
  (`GROW`, `sizeOf` in `game/enemies.ts`) on Holmenkollen, Nordmarka, Ekeberg, Vålerenga, Bygdøy,
  Vigelandsparken, Korketrekkeren and Østensjøvannet, but for Ekeberg's magpie at column 116 and
  Østensjøvannet's coot at 110 (a bigger box broke the scripted clear) and the statues (their heads are steps).
  On Langkaia, Akershus, Rådhuset, Slottet, Akerselva, Stortinget, Bjørvika and Gamlebyen growing cost the
  sloppy player more than 0.3 hearts a run against the code before, so every enemy there keeps its box
  (`keepBoxes`) and plays exactly as before (`apps/viking/tools/review/o18/summary.md`); so do Slottet's
  hot-dog cart and Stortinget's umbrella. A kept box's picture is as wide as the others and drawn to the box's
  height (`parts`), so he lands on its head where the head is drawn (tested within two pixels for every enemy
  he can stomp).
- **The bosses** keep their looks, outlined; while they can hurt (the troll walking or raising its club, the
  plough driving or charging, the serpent's tail) the outline is the warning red, since they are dark on
  dark ground.
- **What hurts and is not an enemy** (rebar, the third rail, branches, the barrier, sparks): the same red and
  black stripe along its dangerous edge everywhere, while it hurts, blinking through its warning.
- **What he can stand on** (`swatches/stand.ts`): a mint top edge two pixels thick, a teal body, a dark line
  under. One-way ledges are drawn so; every carrier, ledge on a beat, rocking deck, sinking pad, the heron,
  Gamlebyen's tower and a watched statue gets the standing top over its own drawing: plain mint where it
  holds, mint over a violet stripe where it moves, lavender dashes where it gives way (sinks, falls, goes on
  a beat). The tops keep their light after dark. No size, place or timing changed.
- **Him**: his tunic's blue is his. Where a field came near it, the field moved (Ekeberg's fjord, city and
  ridge; Bjørvika's shore and windows; the deep water and the bed under it).
- **What he takes**: copper and gold with a pale glint (the copper darkened, the glint paled, so they stand
  off his skin, the enemies' orange and the evening sky).
- **What a boss shows before it acts and where to hit it**: one violet (`ROLES.now`), the same at all three:
  the troll's raised club and the dawn's pool while its club is stuck, the plough's blade and beacons while
  it revs, the serpent's ring of foam, its swelling throat and the stars over its dazed head.
- **Things done**: a tick (a dark disc with a pale check) on an earned rune's stone, a raised flag, and the
  header's gold rune tiles.
- **Where he falls**: the same dark band down the bank's face wherever ground stops over deep water or a pit.
- **Scenery** is quieter than every role; Ekeberg's Scream bands were toned down (mixed four tenths toward a
  dusk grey-violet). The rest was looked at and left (the hand-back lists each and why).

## How it is held
`apps/viking/src/render/palette.test.ts`: every level is drawn into a recorder (`render/fields.ts`) and every
colour covering 0.4 % or more of what it paints is a field. Distances are CIEDE2000; the set distance is 10.
- Enemy bodies: 10 or more from every field by day, and under the evening, twilight and night tints with a
  quarter of their own light back (as `afterDark` draws them).
- Platform tops, stripes and dashes: 10 or more, with the light they keep after dark; bodies: 10 by day and
  the same shrunk as each tint shrinks every difference.
- Him (his blue) by day; what he takes and the bosses' violet under every sky.
- Every role's colours 10 or more from every other role's.
- Under deuteranopia and protanopia (Machado 2009) colour alone does not keep enemies, platforms, pickups and
  him apart; every pair that comes nearer than 10 is told apart by a shape the test names (the outline, the
  top edge, the coin's turn and glint, his figure).
- The outline, the line under a platform, eyes and pale details, a coin's rim and glint are contrast and
  detail, not role colours: they sit on their thing, not on the field.

## Consequences
- A later level must draw what hurts from the enemy palette, what he stands on with the standing top, and
  keep its fields off every role's colours: the test fails otherwise.
- Under the tints his blue is not held (the game's water is blue): see the order's hand-back for the numbers.
- First script: the shared enemy looks only some levels use moved to a chunk of their own
  (`render/looks.ts`), the troll's lines to Nordmarka, the shield's and the sledge's words to the shield's
  chunk, the kiosk's to Stortinget.

## Not chosen
- An outline drawn as four copies of the enemy each frame: four times the drawing (order 18 forbade it).
- Honey wood for platforms (the order's example): it lands on the bracteate's gold and the coins' copper.
- Scaling the old pictures by a quarter: pixels of uneven size.

## Amended by 0044 (order 22)
Lars asked for a red outline round what can hurt, the pale blue for what moves and does not, and yellow paint on what
he can stand on. The rule above stands; the outline is now the warning red with a near-black line inside it, the
standing top is yellow paint (marked where it moves, broken where it gives way), what moves and cannot hurt has a
pale outline of its own (the role `calm`), and the gold of what he takes is a deep amber. See
[0044](0044-paint-says-where-to-go.md).
