# Order 28: the last flat things

Written 17 November 2026, after order 27. Lars is away for about two and a half weeks and left
this standing instruction (his words): "keep looking for more assets that should have increased
details. and consider them with the rest of the game. interaction, fit, thematics, etc. ...
remember to write docs too btw."

Orders 23 to 27 redrew everything that moves, everything picked up, the ground and the invaders.
What is left flat is listed in `docs/games/handbook/roadmap.md` ("In flight", what orders 26 and
27 left). This order finishes that list, and judges each thing against the whole game instead of
only drawing it better.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `docs/games/handbook/` (start-here, playbook,
  lessons), `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014, 0035, 0036, 0039 to 0050, orders 26
  and 27 and their `apps/viking/tools/review/o26/`, `o27/`.
- `git fetch origin`; branch `the-last-flat-things` from `origin/main`. First commit: this order,
  as `docs/games/orders/28-the-last-flat-things.md`. Commit as you go. Do not push.
- Bun only. Stop preview servers by port and any headless browser you started when done. Do not
  use `pkill -f` with a pattern that matches your own command line.
- Do not add, commit or touch `post/`. ADR 0014 (privacy) and ADR 0003 (movement) stand.
- No route, box, speed or timing changes: sloppy run files for Langkaia, Akershus, Bjørvika and
  Østensjøvannet on seeds 201 to 260 byte-identical with `origin/main`.
- Front page 28 pictures byte-identical. First script under 60 kB (it is 59.51 kB now: anything
  new goes in the lazy chunk or replaces something).
- The story's words (`game/story.ts`) and ADR 0050's limits are not yours to change.

## 1. Look first, and write the table

Walk every level and the line map at 390 x 844 and 1280 x 800, by day and under its own sky.
List every thing in or beside the lane that is still drawn as plain rectangles or one flat
colour. Start from this list and add what you find:

lamp posts, railings and fences, panel doors and the T-bane doors, sauna rafts, sheds' plank
walls, the rowing boat, carriers' bodies (boats, trams, lifts, whatever carries him), ladders,
signs' posts and boards, the line map itself (pillars, track, station boxes, the Hjem door, the
news sign), what enemies throw (snowballs, chips, stones, arrows, sparks), windows he passes at
arm's length.

For each, fill a row in `apps/viking/tools/review/o28/before.md`:

| Thing | Where | What he does with it (stands on, uses, passes, is hurt by) | Fits its level? | Should the glamour touch it? | Decision |

The last three columns are the point of this order:

- **Interaction.** A thing he stands on must keep ADR 0044's yellow top; a thing he uses keeps
  the cyan corners; a thing that hurts keeps the red outline. More detail may never make a
  harmless thing look like one of those, or the reverse. If a detail could be mistaken for a
  coin, a rune, a door or a platform, leave it out.
- **Fit.** Each thing should be of its place: a lamp post at Slottet is not the lamp post at
  Bjørvika's quay or in Gamlebyen. Use what is true of Oslo (cast-iron posts in the old town,
  plain steel at the harbour, wooden posts in the forest). Place names are fine; no addresses.
- **The glamour (ADR 0050).** The rule from order 27 holds: neon belongs to the glamour only,
  harmless things stay natural. So scenery and props are natural. The exception is what an
  invader throws: order 27 left shots un-glammed. Decide per shot whether a small neon trail or
  sheen would make it read better as "theirs" without making it harder to see against the
  backgrounds; shots must stay at least as visible as now (measure against each level's
  backgrounds as the palette test does). If you glam a shot, it follows the level's lean and
  loses its neon inside a rune's ring.

## 2. Draw them

Same method as orders 23 to 26: per-pixel maps with named tone ramps, drawn once into kept
pieces and copied (ADR 0036, 0041, 0045). Three to five tones of one hue; a lit edge, a shadowed
foot, the material's grain. Backdrop quiet (ADR 0044's band): the lane's props may not come
closer to any role colour than today, and stay below the figures in contrast.

The line map gets the same care as a level: textured pillars and track, stations that read as
their place at a glance, the water, and the mirror balls sitting well on it. The map is the
first thing a visitor sees after the card.

## 3. Close two debts

- Add the lane's ground to order 22's saturation and value band test with its own band (order
  26 did not). If the busier stone at Gamlebyen, Ekeberg or Akershus fails a sensible band,
  quieten the stone, do not widen the band; show before and after.
- Order 27 found that a worktree under `~/.cache` measures the first script about 2 kB larger
  than the main checkout. Spend at most half an hour finding out why; write down what you find
  in `o28/` and in `docs/games/handbook/lessons.md` whether or not it is solved.

## 4. Docs, in the same change

- An ADR (0051) for what was decided here: props are of their place; the three questions asked
  of every thing; what was decided for shots and why; what was looked at and left alone.
- DESIGN: the rule for a level author adding a prop.
- HANDOVER; `docs/games/handbook/` (start-here's table, roadmap's status table and "In flight",
  lessons, resources if a tool changed); LEVELS.html pictures retaken with
  `apps/viking/tools/pictures.ts`; `o28/after.md`.

## Measures that must hold

- `bun test` green in all four packages; `tsc --noEmit` and `bun run build` clean; first script
  under 60 kB.
- Front page 28 of 28 byte-identical. Run files as said above.
- Perf at 390 x 844 for every level against `o27/perf.md`: no place more than +200 rectangles a
  frame, none over 15,000.
- A test that every prop kind used by any level has a textured piece, and that no prop uses a
  neon of `ROLES.glamour`.

## If you cannot do all of it

Work in this order and finish each properly before the next: (a) the table; (b) props in the
lane, level by level along line 1 then line 2; (c) the line map; (d) shots; (e) the two debts;
(f) docs. Docs for what was done are never skipped.

## Hand back

1. The table with its decisions, and per thing: done, partly, left alone and why.
2. Pictures in `~/.cache/claude-scratch-larshansen/o28/shots/` (not `/tmp`, which is RAM): each
   redrawn thing at four times size before and after; every level and the map before and after
   at both sizes, day and its own sky.
3. Contrast and band numbers; perf; tests; first-script size; front page; run files.
4. What only a person can judge, as a list for Lars.
5. Departures, doubts, found and not fixed. Branch and commits. Confirm no preview server or
   headless browser of yours is left running.
