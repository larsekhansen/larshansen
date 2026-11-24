# 0035. The first script's budget is enforced by the build

Decided 2026-11-15 by the order 17 implementer, on the planner's order (order 17, J1: "make the build or a
test fail over 60 kB, so the budget is enforced and not remembered"). Adjusts [0011](0011-levels-on-demand-60kb.md).

## Decision
- `apps/viking/vite.config.ts` has a plugin, `firstScriptBudget`, that gzips the page's first script as it is
  written (the entry chunk, after vite's own plugins have finished it) and fails the build over 60 kB. It
  measures with zlib in the process vite runs in, the same number vite prints.
- The deploy runs `bun run build`, so a script over the budget never reaches the site.

## Consequences
- 59.34 kB after order 17 (59.18 before it): the order's own limit was 59.5. What grew it: the help line
  that comes back when it changes, the shield's key at Bygdøy's passage, the map's banner naming both lines,
  and the rule that a lost life at a boss is never further back than its bench.
- Under Bun's own zlib the same file measures about 0.9 kB more; vite runs under Node here, so the plugin
  agrees with what vite prints. If vite is ever run under Bun, the plugin will be the stricter.

## Not chosen
- A test in `bun test`: it would have had to build the page first, and the suite has a time budget of its own.
- A step in `deploy.yml` only: the build on a work branch would not have caught it.

## Amended by order 42 (24 November 2026): room made, and what may be lazy
After order 41 the first script stood at 58.65 kB of the 60 (58,647 bytes by zlib), and every round adds a little. Order 42 measured it
module by module (`apps/viking/tools/review/o42/before.md`: each module's bytes, its own gzip and its share, and whether the first frame
of the map or of a level needs it) and moved out what only later files need, into lazy files that already existed, nothing a player sees
changed and no new fetch before the first frame (five then and five now: the page, its script and stylesheet, the map's look and
`feel`'s file; the pad's on a touch screen). To **55.80 kB** (55,801 bytes by zlib, 55,730 by GNU gzip), step by step:

| What | Where it went | The first script after |
|---|---|---|
| The kit's swatches no first-script code draws with: the river's, the ice's (one level each), the feather's, the tram's, the creatures' | Akerselva's and Holmenkollen's files (`OWN`); `feel`'s file | 58.21 kB |
| `runeCells`, the runes as pixels (`game/runecells.ts`) | `feel`'s file (the header draws its runes as strokes) | 58.00 |
| How the kit's cannon and drum look (`packages/pixelkit/src/launcherart.ts`, apart from their rules) | `feel`'s file, drawn by the two levels that use them (Akershus's cannons, Slottet's drums) | 57.25 |
| The page's plain carrier and plain ledge on a beat, which no level drew with | gone: every level with carriers or ledges draws its own (`levels/lazy.test.ts`) | 57.00 |
| The kit's harness (`?debug&steps=N`) | `?debug`'s file; the harness carries its own runner, so the kit's `launch` no longer imports it | 56.71 |
| The card after a rune filled in, and its words (`render/finish.ts`) | `feel`'s file; the first script puts the card up with its title and its button | 55.70 |
| (order 42's own: the plate waiting for the opening card, the map's boards kept off the pad, the kit's bubble's edge) | | 55.80 |

**What may be lazy, as the rule now stands**: the first script carries what the first frame of the map or of Langkaia draws or steps
without `feel`'s file (ADR 0053), and the page's own machinery. What only `feel`'s file, a later level, the map's look or `?debug` uses
goes with it: a whole module by the bundler's rule (`vite.config.ts`: a module it is not told about lands in the first script, so a new
one is named there), a part of one by splitting the module (as `runecells.ts` and `launcherart.ts` were). Something drawn only in a level
fetched later needs no plain drawing in the first script: that level brings `feel`'s file with it. Read the first script's modules, not
only its size (`apps/viking/tools/review/o42/`, the scratch scripts named there).

Left, with why: the maze's glue in `main.ts` (going in and out of the mound, its header; about 1.2 kB, woven through the page's own
state); the bosses' bubbles' placing (about 0.3 kB, read every frame of a fight); a click's walk (`walkto.ts`, 0.34 kB: a click wants
its answer at once); the swatches some of whose colours the first script draws with (whole modules move or none).
