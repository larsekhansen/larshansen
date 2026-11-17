# Order 29: the line map before and after, with any rune missing

The order: "Before that, nothing shows: the map's pictures with fewer runes are pixel-identical to today." Two builds served side by
side: `origin/main` at `88979db` (a worktree under `~/.cache/claude-scratch-larshansen/o29/wt-main`, its build on port 5186) and the
branch (port 5184). The same twenty addresses taken from each at 1280 x 800 and at 390 x 844 (`tools/shots.ts`), and every pair compared
byte for byte (`cmp`).

The states: nothing cleared; three of line 1; all of line 1 (line 2 open); fifteen runes (all but Gamlebyen); fifteen runes (all but
Langkaia). Each where he arrives and at Gamlebyen's station (`x=1528`), by day and at night.

| | 1280 x 800 | 390 x 844 |
|---|---|---|
| byte-identical | 20 of 20 | 20 of 20 |

One picture (fifteen runes, day, at Gamlebyen, 1280 x 800) came out blank from the branch's build the first time: the headless page
was photographed before its scene opened (the race HANDOVER describes under "The harness"). Taken again, it was byte-identical to
`origin/main`'s.

The same is held by a test (`src/levels/encore.test.ts`, "is not on the map with any rune missing"): for every set with one of the
sixteen runes missing, `kartDef` returns exactly `kartMap(open)` as it was (101 columns, no `E`, no encore door), and so for nothing
cleared and for line 1 alone.

With every rune the map is wider (115 columns): line 2's viaduct runs on past the longship to the encore's stop at column 109. The
picture of the end of the line with every rune (LEVELS.html's `kart-end`) is not what it was, by design: the camera no longer stops at
the map's old end. It was taken again.

The addresses: `bash mapurls.sh <port>` in this folder prints them.
