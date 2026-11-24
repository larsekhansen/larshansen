# 0053. Without feel's file, the first script still draws everything in its place, plainly

Decided 2026-11-21 by the order 30 implementer, on the planner's order (order 30, "small debts", item 1: "Give them a plain
fallback (flat rectangles are fine) that costs as few first-script bytes as possible, or show clearly why none is needed").
Within [0011](0011-levels-on-demand-60kb.md) and [0035](0035-the-budget-enforced.md) (the first script's budget),
[0049](0049-the-ground-is-textured.md) and [0051](0051-props-are-of-their-place.md) (the textured set and the props kit, in
`feel`'s file, reached from the first script through hooks).

## Context
Since order 26 the ground, the props and much of the small drawing live in `feel`'s file (`render/feel.ts` and
`src/alive/`), fetched as the page starts. The first script reaches them through hooks (`TEXTURED` in `render/tiles.ts`:
`tile`, `ledge`, `deep`, `boards`, `tbane`, `door`, `walls`, `prop`). A scene opens without `feel`'s file if it does not come
(`main.ts`, `needed`). Every hook had a plain drawing of its own where the hook was missing, except one: Langkaia's
`TEXTURED.prop`, which order 28 added for its sauna rafts' cabins and pontoons, the club's hut, the diving tower, the rowing
boat and the posts under the club's deck. Without `feel`'s file those were not drawn at all; the rowing boat he stands on
was its yellow paint over nothing.

## Decision
- **Every hook the first script calls has a plain drawing in the first script, where its thing stands**: flat rectangles in
  colours the file already uses, as few as reads (a tarred box for a cabin or the hut, a band for the pontoons, two white legs
  for the tower, a wooden hull for the boat, a post). `TEXTURED.prop?.(…) || R(…)` at each call: 0.07 kB of the first script.
- **Only the first script needs this.** Every level fetched later imports `src/alive/` itself, so its file brings `feel`'s
  with it: it is never drawn without it (if `feel`'s file cannot be fetched, the level's cannot either, and the card says the
  train did not come). The map's look (`kartArt.ts`) imports it too: without it the map is its bare self (`BARE` in
  `levels/kart.ts`) when the page starts on it, and its train does not come when he goes to it later. The bare map drew line 1's
  deck and the ground but not line 2's deck or its gate, so he walked on nothing past Vålerenga: line 2's deck is now the
  shared letter's band (`render/tiles.ts`, which the map's look draws its own way) and the gate plain boards (`BARE`).
- **Held by a test** (`levels/lazy.test.ts`): only Langkaia of all the levels (and the encore) can be drawn without `feel`'s
  file, the page itself does not reach it, and the map's look does; drawn whole with the hooks as `feel`'s file fills them,
  with hooks that draw nothing, and with no hooks at all, every hook call's drawing is at least half covered by the plain
  drawing where it stood; every solid tile and everything he is carried on is drawn without `feel`'s file, in Langkaia and on
  the bare map (with line 2 shut and with every rune).

## Not chosen
- **Moving Langkaia's props back into the first script**: 0.4 kB or more, the budget's margin.
- **Holding the level until `feel`'s file comes**: a slow line would hold the first level, which opens at once today.
- **Taking the map's look out of `feel`'s file**: it uses the mirror balls, the story's sign and the textured piers, which are
  `feel`'s; the bare map is enough for a page whose chunks did not come.

## Consequences
- A new hook from the first script into `feel`'s file comes with its plain drawing in the same change; `lazy.test.ts` names
  any that has none.
- The first script: 59.34 to about 59.42 kB gzipped for this (see `apps/viking/tools/review/o30/after.md` for all of order 30).

## Amended by order 33 (22 November 2026): more goes with feel's file
To make room in the first script (59.60 to 57.94 kB gzipped), three more things come with `feel`'s file, which the first scene
waits for (so no picture changes): the kit's synth (`sfx.ts`; the page keeps a stand-in that forwards to it, and the site's sound
switch, `mute.ts`, stays in the first script so the header's button is as it was); the page's drawing after dusk (`afterDark`:
what moves, what he takes, what hurts and the paint keeping their light) and of the rune's flight to the header
(`render/dusk.ts`); and, with the maze, the maze's feather drawing (the page's plain one was only a fallback). Without `feel`'s
file the page is therefore silent, nothing keeps its light after dusk, and the rune lands in the header without flying: every
level still starts and every solid thing is drawn plainly, which is what this record holds (`levels/lazy.test.ts`).

## Amended by order 42 (24 November 2026): the card after a rune, and what only later levels draw
For room in the first script (ADR 0035, amended): the card after a rune is filled in by `feel`'s file (`render/finish.ts`: the time, the
best, the bracteate, the skilling, a clean run, the last line and its words); the first script puts the card up with its title and its
button. Without `feel`'s file it is that alone, the level's rune and name and "To the map", and it still goes by itself after six
seconds. Game over and a load that failed are the first script's, whole, as before (a failed load is when `feel`'s file may be missing).

And a drawing that only levels fetched later use needs no plain one in the first script, since those levels bring `feel`'s file with
them: the kit's plain carrier and plain ledge on a beat, which no level drew with (every level with carriers or ledges draws its own,
Langkaia too), left the page; the kit's cannon and drum are drawn by the two levels that have them (Akershus, Slottet). Held by
`levels/lazy.test.ts`: every level and the map with carriers, ledges on a beat, cannons or drums draws them itself, and Langkaia has no
ledges, cannons or drums.
