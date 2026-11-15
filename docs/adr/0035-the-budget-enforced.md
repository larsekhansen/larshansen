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
