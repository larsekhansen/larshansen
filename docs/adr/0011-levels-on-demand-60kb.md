# 0011. Levels load on demand; the first script stays under 60 kB

State (order 18): enforced by [0035](0035-the-budget-enforced.md): the build fails over the budget. 59.34 kB after order 17, 59.75 after the speed fix (ADR 0036), 59.70 after order 18 (the enemy looks only some levels share went to a chunk of their own, `render/looks.ts`; the troll's lines to Nordmarka; the shield's and the sledge's words to the shield's chunk; the line map's words to its chunk; Gamlebyen's card line and the kiosk's words to their levels).

Decided by the planner (order 8 set the budget; order 10 rule 12 set the means).

## Decision
- The viking page's first script must stay under 60 kB gzipped. It holds the kit, the rules, the
  line map and Langkaia, so a fresh visitor starts playing without a second fetch.
- Every other level is exactly one dynamic import. `vite.config` keeps anything shared in the
  first script (shared lazy chunks raced the headless screenshots) and assigns level-only
  swatches and the bosses' rules to their level's chunk; the routes, the scripted player and
  `?debug`'s code are files of their own that a visitor never fetches.
- The maze loads lazily too.
- The deploy smoke test greps the first script for `Langkaia`; keep that string there.

## State
57.4 kB of 60 after batch D; 57.84 kB after order 12, which added rules and page code and moved
out the scripted player and the routes (fetched only under `?debug&auto`), `?debug`'s own code,
and the troll's rules (into Nordmarka's file through `LevelDef.trollRules`, as the plough's
through the boss slot). 59.12 kB after order 13, which added the rims enemies get after dusk, the
far layers' shift and the ground below the map on upright screens, the plated banner and the
bosses' bubbles beside them; to make room the duck, the salmon, the bat and the anthill are drawn
by the one level that has each. Left to move out if needed: the line map's station art, and the
enemy looks that two or three levels share. 58.96 kB after order 14 (line 2's groundwork and
Bygdøy), which moved the line map's look into a chunk of its own (`kartArt.ts`, fetched as the page
starts), dropped the stations' unused place strings and moved `?debug&auto`'s table of routes into
the debug chunk; the shield's rules (`shield.ts`) and line 2's kit pieces come lazily. The order
allowed 59.5. 58.83 kB after order 15 (three more levels, each its own file, and a slot in `play.ts`
for a level's own rules), which moved Nordmarka's night drawing out of `main.ts` into `render/night.ts`,
fetched with Nordmarka, and made the sinking pad a small file of its own that Bygdøy and Østensjøvannet
both fetch. Left to move: the enemy looks that two or three levels share. 59.18 kB after order 16 (Bjørvika,
Gamlebyen, the serpent, the end of line 2; the order allowed 59.5): each level's swatches and the serpent's
rules come with their level; what grew the first script is a level's own ground changing its map (one line in
`play.ts`), a one-way thrower's blind distance, the sledge's help line, the card's VIKING line and the map's
line totals. A level that aliases a palette namespace (`const P = PAINT`) pulls the whole namespace into the
first script (about 0.25 kB): use `PAINT.warning`, never an alias.

## Not chosen
- One bundle. It would be about 110 kB gzipped.
- Raising the budget. It is arbitrary, but the front page is 24 kB and the site is served from a
  Pi on a home line; ask Lars before changing it.
