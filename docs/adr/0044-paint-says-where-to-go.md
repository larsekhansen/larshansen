# 0044. Red round what hurts, pale round what does not, yellow paint where he can go

Decided 2026-11-16 by the planner (order 22, part A and A6), after Lars had seen orders 18 to 20 live: "i think
maybe red for enemies that can hurt you, in terms of the outline, is a smarter choice. the light blu you had for
rats can be for moving npcs that don't hurt. yellow paint is maybe the industry standard for "you can go here" when
that isnt clear so mayne theat for platforms instead. then that also means other uses of yellow had to be
reconsideren or simply changed." Carried out by the order 22 implementer. Amends
[0039](0039-colour-says-what-a-thing-is.md): its rule (a colour belongs to a role, and a role's colours belong to
nothing else) stands; the colours of three roles change, and one role is added.

## Decision
- **What hurts on touch and moves is outlined in one warning red** (`ENEMY.red`), by day and after dark: every
  enemy, what it throws, a boss while it can hurt. Between the body and the red a near-black line (`INNER` in
  `render/sprite.ts`, "out"): tried with and without at phone size, the red alone ran into orange and pink bodies
  and the dark line kept every shape. After dark the outline keeps its light: every outline copied onto the street
  in a frame is noted and copied again, alone, over the night's tint (`rings`). The pale rim of order 13 (ADR 0023)
  is gone; the eye-shine stays.
- **No body is that red.** The enemy palette's bodies are plum, orange, poison green, pink and a white a little
  cooler than the clouds, each held off every field (as before) and 20 or more (CIEDE2000) off the outline, 10 or
  more without telling red from green. Kinds went toward what they look like where the test let them: white gulls,
  swans, geese and nesting gulls, an orange squirrel, pink feet and tails, a plum coat on the fortress guard. A rat
  could not go brown: every brown is the bricks', the wood's or the copper coin's.
- **What moves and cannot hurt him is outlined in a pale blue-white** (`ROLES.calm`, the new role): sheep, the
  moose, the heron, the parade and the King's Guard at Slottet, a watched statue, a guard still stone, a calm swan,
  a sledger pulled off, the troll asleep, stuck, flinching or stone, the plough parked, revving, stuck or beaten,
  the serpent's neck and its dazed head (the "now" violet over it stays). A thing that turns on him turns from the
  pale to the red at that moment, and a "!" in the red springs up over it (a statue, a guard, a swan; still under
  reduced motion). The troll and the plough turn red as they set off, after the violet of their wind-up.
- **Yellow paint on what he stands on** (`STAND.top`, `#ffd400`): the top edge of every platform two pixels thick,
  its outer top pixel at each end worn (`STAND.worn`), the same in every level, keeping its light after dark. What
  moves has black marks leaning in the paint (a chevron wants three rows; in two they are the stripes of moving
  machinery), marching for two thirds of a second before it sets off; what gives way has its paint broken in dashes.
  The teal bodies stay: they keep a one-way ledge apart from the ground and from the paint, and the paint reads on
  them. The yellow also goes where the way is not a platform: the lip of every ledge of ground before a fatal drop
  (six pixels of paint over the dark band), a crane hook's block (yellow with black stripes), a statue's head while
  it is a step.
- **Nothing else is that yellow.** Every yellow and gold the game paints was listed (`tools/glance/yellows.ts`)
  and each decided: the gold of what he takes (bracteates, the gold count, the header's rune tiles, a cleared
  station's stone, the effects' rings) became a deep amber (`COIN.gold`) whose light is the glint's pale; the third
  rail's cover became the warning red (its sign says so); Holmenkollen's snow cannon and the map's crane a quieter
  ochre; Bjørvika's site sign orange and black; the line-2 gate's stripes red; the crowd's yellow hats red. Kept, by
  name: Rådhuset's bells and the clock hand (things he stands on, their tops painted), lamps and lit windows (lights,
  never a top edge). The palette test holds that no colour any level paints is within 10 of the paint but these.
- **The haze behind the lane** (A6): the far, mid and near layers wash toward the level's air (the sky's at the
  horizon; a grey-white in snow and mist: Holmenkollen, Korketrekkeren, Vålerenga, Østensjøvannet) at 0.5, 0.4 and
  0.3 (it was 0.35, 0.3 and 0.2 toward the horizon), and the street's own backdrop at 0.08; none under the ground or
  on the line map; Ekeberg keeps its own. The wash is the fill each far pass already made, now toward the air
  (`pass(…, air)` in the kit, opt-in); the street's backdrop pass gains one fill a frame. Folding the haze and the
  night's tint into one fill was built and taken out again for the first script's budget. The palette test holds what is behind the
  lane quieter than what he plays with: by day, nine tenths of its area at most 0.5 saturated and its middle at most
  0.3 (the figures' middle is 0.69), the middle eight tenths of its value within 0.5.

## Consequences
- `swatches/roles.ts` names the role `calm`; `palette.test.ts` holds it as it holds the others, the outline's
  red against every body, the outline each thing has against its state, the yellow paint's uniqueness and the
  backdrop's band. The colour-blind table names the shapes that tell red outline from yellow paint, calm from use.
- An enemy is a pixel larger all round than before (the dark line); its box is unchanged.
- First script 59.47 (after order 21) to 59.85 kB gzipped (the outline's second ring and the rings after dark, the
  paint's marks and worn ends, the lips, the haze's air), with the careful walk to a clicked spot moved to a small
  file fetched with the first click (0.57 kB) to make room.

## Not chosen
- A red outline with no dark line inside: tried; it read worse at phone size.
- Natural browns and greys for bodies: the fields test does not allow them, and the copper coin is brown.
- Dropping the teal under the paint: the paint alone on a level's own material reads as a stripe on a wall.

## Amended by order 31 (21 November 2026)
"Outlines keep their light after dark" did not reach under Nordmarka's own dark, which comes after the night's tint and covers
everything but the lamp's circle: there the invaders were their glow round a dark shape. The red outline alone is now copied again
over that dark (`overDark` in `levels/nordmarka.ts`, at 0.9 of its strength, as over the night's tint), on its own pixels only, so
the dark round it is as dark as before. Measured as the palette test measures fields, the outline against the forest's fields
under every depth of its dark: at the least 6.7 before, 33.8 after, against 29.2 by day (`render/palette.test.ts` holds it). The
calm outline is not copied over the dark: what cannot hurt him there (the moose, the troll asleep) stays the dark's.

## Amended by order 32 (21 November 2026)
Over a level's own dark the invader's glow lay right against the red outline, its brightest band in the pixel next to it, and an
orange glow came within 22.7 of the red (16.8 at the worst depth of Nordmarka's dark, by the palette test's measure). There the glow
now starts a pixel further out and the pixel next to the outline is the night's own colour (`overTheDark`, `DARK_GAP` in
`alive/glamour.ts`): the red stands 44.3 off it, against 29.2 off the forest's fields by day, and the dark is no lighter. Any other
level's own dark would draw its invaders the same way. After dusk elsewhere the glow is as it was.

## Amended by order 33 (22 November 2026): harmless things keep off the warning red
"No body is that red" held the enemies' bodies; nothing held a harmless thing. Order 32's chairlift chairs had a back of red slats
6.1 from the warning red (CIEDE2000), a field that read as "this hurts". Now: what carries him, the ledges on a beat, cannons,
drums, flags and what stands in front, drawn as the page draws them with the paint over what he stands on, may fill no more than
12 pixels of a view (320 x 200) within 10 of the warning red, and every prop of the props kit no more than 12 of its own pixels,
but by name (`render/warning.test.ts`, `alive/props.test.ts`). What the rule found and was a field took a shade of its own red,
10 or more off the warning red and every role: the chairs' backs (the frame's painted steel), Rådhuset's and Bygdøy's ferries'
bands and funnels, Stortinget's trains' stripe, the lift cage's rail at Holmenkollen, Slottet's red balloon (the flag's own red)
and the shirt on Vålerenga's washing. Named as dots: the spectators' jackets at Holmenkollen's outrun and the russ's overalls at
Slottet (a few pixels a person), and the crossing's barrier at Korketrekkeren (it hurts). The scenery and the ground are not held:
the kit's red (`#c8302b`, his hat's, 6.1 off the warning red) is also Stortinget's walls and kiosk, Holmenkollen's rails on the ice
and its jump, and near it are Vålerenga's stained glass and Frognerseteren's walls (`apps/viking/tools/review/o33/after.md` lists
them with their areas): a decision for the planner and Lars.

## Amended by order 34 (22 November 2026): the scenery and the ground keep off the warning red too
Lars, of order 33's list: "Scenery in the kit's red: move it off the red too." `render/warning.test.ts` now also draws every view of every
level and the encore with its scenery and ground as the page draws them (the far, mid and near layers, the street's backdrop, the water and
the tiles, each layer's colours washed toward the level's air by its haze, with what he meets and the paint over them): what is left within
10 of the warning red may fill no more than 24 pixels of a view (a rear light, a postbox, a door's knob), but by name. Named: the third
rail's cover at Stortinget, which hurts and is the warning red itself. What it found took a shade of its own, true to the place, in the
level's own file (the kit's palette, which the front page shares, is unchanged), each 10 or more off the warning red and every role:
Stortinget's walls' stripe, posters and kiosk sign the station's brick red-orange (`#9c3a30`, 14.3 off), the kiosk and the ticket machines
a deeper red-brown with a lit top (`#8a3329`, `#aa4a3a`), the signs past the end (no entry, the buffer stop, the cabinet's lamp) the
trains' shade of red; Holmenkollen's padded rails and the jump's lip markers blue, as a course's padding often is (`#3384b0`, lit
`#7fb0cc`, shade `#2a6a8c`, each 12.8 or more off every role, leaning a little to teal away from his tunic; orange was tried and every
orange came within 10 of the invaders' orange, the coin's copper or his skin); Vålerenga's church windows a deep ruby (`#9a2433`, 17.3
off), the paper cranes keeping their tint as drawn; Bygdøy's ticket kiosk's sign the ferry's own shade of red (order 33's band); and at
Korketrekkeren the red plastic sledge among the hire sledges leaning on Frognerseteren's shed a deep wine red (`#8a2030`, 20.7 off; the
red there was the sledge, not the walls, which are tarred logs already). His hat keeps the kit's red (he is the hero, not scenery); what
hurts keeps its own. Before and after at four times: `apps/viking/tools/review/o34/after.md`.

## Amended by order 35 (22 November 2026): lights near the warning red are named
After dusk a light is its own colour over the dark (ADR 0054), so a red light reads as red as a fill. Bjørvika's far cranes have a red
light at each jib's tip (`#ff5a44`), 10.3 off the warning red: outside the test's 10 by luck. `render/warning.test.ts` now holds every light
every level registers: none within 10 of the warning red, and any within 12 named with why. The crane lights are named: real crane lights
are red, a pixel each, far off, on a thing that does not hurt. The hue is kept.

## Amended by order 40 (23 November 2026): what he takes has a dark line round it after dusk
Decided by the planner on Lars's behalf ("carry on as planned"; a look, easy to undo). Order 39 measured what he takes in place: against an
evening sky the bracteate, the cheese and the skilling stood 14.5 to 18 (CIEDE2000, its edge against the pixel beyond) off what was round them,
copper, amber and brown cheese on the evening's warm ground (Langkaia, Ekeberg, Bjørvika). Now, under any sky but the day's, a thing he can still
take has a line a pixel wide round its shape (every pixel beside it, left, right, above or below), the rule the maze's rune key has had since
order 36 ([0056](0056-the-maze-in-the-games-grain.md)) and the means orders 32 and 39 used for what is thrown (a pixel of the dark round it). The
line is **the level's dark**: the near-black of an enemy's inner line (`ENEMY.line`) as the sky's tint leaves it, a dark plum in the evening, an
indigo at twilight, a navy at night, not black where the level is not. It is not the warning red (30 or more off it, and 10 or more off every
role's colour), so a coin reads as treasure, not as something that hurts. Drawn in `afterDark` (`takeLines`, `alive/things.ts`, in `feel`'s file)
round the skilling, the cheese and the bracteate on the screen; not round a bracteate found on an earlier visit (its pale ring hangs there: the page
says so, `PAGE.owned`), and not round the rune's stone, whose own edge is a dark line already. By day nothing changes (the pictures are
byte-identical). Measured in place as order 39 measured: every skilling, cheese and bracteate under every sky after dusk it is met under stands
31.6 or more off what is round it (`apps/viking/tools/review/o40/after.md`); under Nordmarka's own dark everything outside his headlamp is covered,
as before. The shadow side only (a line on the lower right) was tried as the lighter means and not chosen: it read as relief, but the cheese's lit
top stayed warm on warm (27.9 at Ekeberg and Langkaia) and a skilling seen edge on became a dark stick. Held by `alive/takes.test.ts`. Undoing it is
the call in `render/dusk.ts` and that test.

## Amended by order 41 (24 November 2026): the rune's stone a pale rim on its lit side after dusk
Decided by the planner on Lars's behalf ("carry on as planned"; a look, easy to undo), as the amendment above left it: the rune's stone has a
dark edge of its own all round, so a dark line could not help it, and on the night's dark ground it stood 6.7 to 19.3 off what was round it
(Langkaia's night and twilight, 13.5 at Østensjøvannet's). Now, under any sky but the day's, the stone's own edge pixels on its top and its
left, where the light comes from (the moon will do), are a pale moonlit grey (`RUNE_RIM`, `#cdcdd2`): not a line all round, not a pixel
outside its shape, and it bobs with the stone. It stands 30 or more off the stone's own dark edge under every tint, 39.8 off the warning red
and 16.1 or more off every role's colour (the nearest, the calm pale). Drawn by `runeRim` (`alive/things.ts`) in `afterDark` (`render/dusk.ts`,
`feel`'s file), only while the rune can be taken; by day nothing changes (the pictures are byte-identical). Measured in place:
`apps/viking/tools/review/o41/after.md`. Held by `alive/takes.test.ts`. Undoing it is the call in `render/dusk.ts` and that test.
