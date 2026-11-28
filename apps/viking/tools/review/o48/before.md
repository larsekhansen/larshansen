# Order 48: the dichotomy, looked at first

Written 28 November 2026 on branch `the-dichotomy`, before any level was changed for item 2 (the balloon cart of item 1 was already
redrawn; the pictures here are origin/main's, `05266c0`). The measure is Lars's sentence of 28 November: Oslo "quaint,
Nordic-national-romantic, less technological, less crowded, calm", the bad guys "glam, neon, lights, American, loud"
(`docs/games/handbook/conversations.md`, ADR 0058).

## How it was looked at

- Every level and the encore at the places order 47's comparison used (every sixty columns along the route; the encore at its park,
  its stage's foot and the stage), from origin/main's build served on 5184, with `tools/shots.ts`: 844 x 390 by day, under the
  level's own sky and natural by day (`?debug&natural`: every invader as its natural self); 390 x 844 by day and under its own sky.
  324 pictures. Langkaia follows the clock, so its own sky here is the evening.
- One sheet a level: the places in rows, day, own sky and natural in columns (`~/.cache/claude-scratch-larshansen/o48/before/sheets-land/`).
- A measure of how far the glamour shows: the pixels of the play (under the bar, over the help line) that differ by more than 24
  between a place's glammed and natural pictures by day, summed over the level's places (`o48/bin/glamdiff.py`). It counts how much
  of the screen the invaders' glamour covers, not how loud it is; the invaders' scenery (posters, signs, flamingos) stays in both.
- The scripts are in `~/.cache/claude-scratch-larshansen/o48/bin/` (`mkplaces.py`, `before.sh`, `levelsheets.py`, `glamdiff.py`).

## The table

Mark: 1, both sides read as the sentence has them (calm Oslo, loud glamour); 2, one side does not (something in the natural Oslo
reads loud, technological or crowded beyond the place's idea, or the glamour reads as part of the place); 3, both, or one badly.

| Level (own sky) | In the natural Oslo: what reads loud, technological, crowded or neon, though it is not Loki's | Of Loki's glamour: what reads too tame to tell from the place | Glam against natural, pixels | Mark |
|---|---|---|---|---|
| Langkaia (the clock) | Little: the Opera's marble and the quay's stone, the saunas' timber. The Barcode's glass towers stand behind the Opera (honestly modern, true of Bjørvika) | The pigeons, the gulls and the rat are small and their glam a pink against pale stone; the poster and the heart sign are small. Glammed and natural differ little | 1,182 over 4 places | 2 |
| Akershus festning (day) | Nothing: stone walls, cannons, the palace's white front, water | The guards' plum coats and the fire baskets' neon fire read at once against the grey stone | 3,980 over 5 | 1 |
| Rådhuset (day) | Nothing: the hall's brick, the harbour, the square's lamps | Pigeons and gulls small, but pink against grey | 1,282 over 4 | 1 |
| Slottet (17 May) | Crowded, but the crowd is 17 May's and the level's idea (stays) | The balloon carts at 112 and 172 were a muddle of red with the crowd's flags across them (item 1, mended); the rest are pigeons and gulls lost in the crowd's colours | 2,172 over 4 | 2 |
| Holmenkollen (winter day) | The station's name board was a white panel with a row of blue squares: it read as a screen. The jump's steel tower and lift shaft are modern sport, true of the place | The fox is orange glammed and natural alike; the heart sign on the slope is small | 896 over 4 | 2 |
| Akerselva (day) | The start, Nydalen's office block with its blue board, is modern and true of Nydalen; the mills, the wheel and the wooden houses are old | The rats and salmon read; the LOKI poster at Runesmia reads | 1,338 over 5 | 1 |
| Nordmarka (twilight) | Nothing: the night forest, Ullevålseter's red timber with its lit window | The invaders glow in the dark and read at once | 8,400 over 4 | 1 |
| Stortinget (day) | The signs: a T roundel every 120 pixels (three to a screen), the station's name every 180 pixels in a saturated blue band, a poster every 160 in bright blocks, red no-entry signs, departure boards, the hall's blue sign. Honestly modern, but busier and more technological than a station needs to be told | The LOKI posters and the neon heart read as more station adverts among the signs; the enemies are small | 972 over 5 | 3 |
| Ekeberg (evening) | The Scream's bands across the sky are loud, but they are the level's homage (Munch's), toned down in order 22 | Magpies and crows small; the heart sign | 1,856 over 5 | 2 |
| Gamle Oslo (winter) | Nothing: wooden houses, snow, the church, the northern lights; a block of flats at column 60 is true of Kampen | The plough as a tour bus; the cats and crows read | 1,000 over 4 | 1 |
| Bygdøy (day) | The museum halls are large plain walls (true of the place); the boathouse and the storehouse on legs are old | Slingers, crabs and penguins read | 2,808 over 5 | 1 |
| Vigelandsparken (day) | Nothing: granite, limes, wrought iron | The statues stand as the park's own while he watches them: that is the level's idea (they move while his back is turned) | 1,094 over 4 | 2 |
| Korketrekkeren (evening) | Nothing loud; but Frognerseteren, the dragon-style log house that makes the place, had its dragon heads as three rectangles each, not seen, and no carving | The sledgers and the snowball boys glow and read | 2,544 over 5 | 2 |
| Østensjøvannet (twilight) | Nothing: reeds, hides, the ridge's blocks far off | The nesting gulls' neon reads; the swans are calm by design | 2,476 over 5 | 1 |
| Bjørvika (evening) | Honestly modern (the site, the cranes, the Barcode), already in the evening's haze and quiet; the hazard paint is the role's | The pigeons and the forklifts glow pink; the poster and the mirror ball | 3,292 over 5 | 1 |
| Gamlebyen (night) | Nothing: ruins, the harbour, longships | The rats, the archers and the serpent read; the guards are statues by the level's idea | 388 over 5 | 1 |
| The encore (evening) | The park is calm (a cast-iron lamp, a bench, trees) | The stage at rest is a black box with two neon bolts and two tubes: before the show and after it, nothing tells the glamour's stage from a dark shed; only the beams and the ball while he plays | 0 over 3 (no invader in view at rest) | 2 |

## Ranking

1. **Stortinget** (3): the natural station's signs.
2. **Korketrekkeren** (2): Frognerseteren without its dragon style.
3. **The encore** (2): the glamour's stage tame at rest.
4. **Holmenkollen** (2): the name board read as a screen; the fox's glam tame.
5. **Slottet** (2): the balloon carts (item 1); the crowd is its idea.
6. **Langkaia** (2): the glamour small against the quay.
7. **Vigelandsparken** (2) and **Ekeberg** (2): each by its own idea (statues that are statues while watched; the Scream's sky).
8. The rest (1): Akershus, Rådhuset, Akerselva, Nordmarka, Gamle Oslo, Bygdøy, Østensjøvannet, Bjørvika, Gamlebyen.

What the table does not count: how a level feels at speed; whether the glamour's figures read on a phone (orders 38 to 40 looked at
that figure by figure); sound.
