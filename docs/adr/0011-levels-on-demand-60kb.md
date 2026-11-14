# 0011. Levels load on demand; the first script stays under 60 kB

Decided by the planner (order 8 set the budget; order 10 rule 12 set the means).

## Decision
- The viking page's first script must stay under 60 kB gzipped. It holds the kit, the rules, the
  line map and Langkaia, so a fresh visitor starts playing without a second fetch.
- Every other level is exactly one dynamic import. `vite.config` keeps anything shared in the
  first script (shared lazy chunks raced the headless screenshots) and assigns level-only
  swatches and the plough to their level's chunk.
- The maze loads lazily too.
- The deploy smoke test greps the first script for `Langkaia`; keep that string there.

## State
57.4 kB of 60 after batch D. The next rule added to `play.ts` or the kit will press on it.
Candidates to move out if needed: the line map's station art, the troll (into its level through
the boss slot), `?debug`-only code.

## Not chosen
- One bundle. It would be about 110 kB gzipped.
- Raising the budget. It is arbitrary, but the front page is 24 kB and the site is served from a
  Pi on a home line; ask Lars before changing it.
