# Order 28: what became of each thing, and the measures

Measured on 17 November 2026 on branch `the-last-flat-things` (from `origin/main` at `dbfea3d`, after order 27). The table of what
was flat and the decision for each is `before.md`; this says what was done. Pictures (outside the repository) in
`~/.cache/claude-scratch-larshansen/o28/shots/`: `before/` and `after/` (every level's walk at 390 x 844 under its own sky and by day,
two places a level at 1280 x 800 both ways, the map in four states by day and at night at both sizes), `crops/` (every redrawn thing
at four times, before and after, by day and under its own sky, cropped by `../../glance/diffcrop.py` to what changed), `trails/`
(a chip in flight).

## Per thing

| Thing | Done? |
|---|---|
| Langkaia: sheds' plank walls, the club hut, the sauna rafts (pontoons, cabin, door, window, pipe), the posts under the deck, the diving tower (legs, ladder, rail), the rowing boat | done (through `TEXTURED.prop` and `TEXTURED.walls`) |
| Akershus: fire baskets | done |
| Akershus: the hoist | left alone: timbers lit, iron bands and chains already |
| Rådhuset: the square's lamp posts, the balcony's railing, the ferry, the gondola | done |
| Rådhuset: bells, clock hand | left alone: he stands on them; order 24's drawing; their gold is named in the palette test |
| Slottet: balusters, the pond's railing, the crowd barriers' ends | done |
| Holmenkollen: the platform roof's posts | done |
| Holmenkollen: chairlift chair and cage, snow cannon | left alone: small, lit tops and wires already |
| Akerselva: logs, buckets, bridges | left alone: lit tops, rings, foam already |
| Nordmarka: Ullevålseter's lamp | left alone: it gutters (order 24) in the dark |
| Stortinget: the kiosk's door | done (panel door) |
| Stortinget: the trains (the T-bane's doors) | left alone: drawn a column at a time and clipped by the tunnels, with doors, windows and bogies |
| Ekeberg: the viewpoint's railing and its old lamp | done |
| Ekeberg: the tram, the tram stop | left alone (as the trains; the stop is far back) |
| Vålerenga: lamps behind the church, the yellow house's walls and door, the red house's walls, upper floor and terrace railing, the washing line's poles | done |
| Vålerenga: the tram | left alone (as the trains) |
| Bygdøy: the rowing boat on the beach, the ferry | left alone: a thing drawn by the level and kept; the ferry is behind the lane |
| Vigelandsparken: the bridge's lamps, the rope at the broken span | done |
| Vigelandsparken: the gate's pillars and lanterns | left alone: granite lit on top already |
| Korketrekkeren: lanterns; Østensjøvannet: hides, boardwalk posts | left alone |
| Bjørvika: the site fence, the container | done |
| Gamlebyen: the town's lamps | done (the old town's cast iron) |
| Gamlebyen: torches | left alone: they flicker and go out at dawn |
| Every sign board's post | done (`alive/ground.ts`) |
| Windows at arm's length | left alone: a frame, a cross and panes that light one by one already |
| The Opera's door Hjem | left alone: a door must not change shape; its steel already reads |
| The line map: skylines (all sixteen), piers, decks (line 1 and 2), station marks, the door Hjem, the water, the mirror balls' brackets, the story sign's post | done |
| The line map: line 2's low track and the branch to the mound, the mound, the gate, the longship, the lanterns | left alone |
| What the invaders throw | done: a neon trail (below) |

## Shots

Decided per shot, by the same rule for all eight (chip, cone, snowball, stone, ring, dive, bolt, arrow): each trails three pixels of its
level's first neon behind it, fading, starting clear of its outline, over the night's tint (so it glows after dark). The shot's own
pixels and outline are untouched, so its distance to every level's backgrounds is what it was (the palette test's "every enemy look's
colours, and what it throws" and "no body colour within 10 of any level's fields" pass unchanged); the trail's neon is one of the family
the palette test already holds 10 or more off every field of every level under every tint, so the trail adds a mark that stands off the
ground, never one that hides. None once the shield has spent it, none inside the rune's ring of daylight, none with reduced motion. A
sheen on the shot itself was not drawn: at four to six pixels it would take the shot's own colour from it (ADR 0051).

## The ground's band (debt 1)

`render/palette.test.ts`, "the lane's ground keeps a band of its own", by day over the area each colour covers on a level's tiles (the
paint and the platforms' teal left out):

| Level | saturation, middle / nine tenths | value, a tenth to nine tenths (span) |
|---|---|---|
| langkaia | 0.13 / 0.78 | 0.42 to 0.55 (0.13) |
| akershus | 0.13 / 0.56 | 0.29 to 0.49 (0.20) |
| radhuset | 0.49 / 0.65 | 0.39 to 0.70 (0.31) |
| slottet | 0.14 / 0.17 | 0.24 to 0.40 (0.16) |
| holmenkollen | 0.12 / 0.12 | 0.87 to 1.00 (0.13) |
| akerselva | 0.56 / 0.78 | 0.42 to 0.45 (0.03) |
| nordmarka | 0.51 / 0.51 | 0.29 to 0.37 (0.08) |
| stortinget | 0.09 / 0.11 | 0.30 to 0.42 (0.11) |
| ekeberg | 0.47 / 0.47 | 0.35 to 0.48 (0.13) |
| nabolaget | 0.24 / 0.25 | 0.23 to 0.29 (0.06) |
| bygdoy | 0.47 / 0.78 | 0.42 to 0.57 (0.15) |
| vigelandsparken | 0.53 / 0.55 | 0.33 to 0.58 (0.26) |
| korketrekkeren | 0.10 / 0.10 | 0.89 to 0.92 (0.03) |
| ostensjovannet | 0.39 / 0.78 | 0.31 to 0.45 (0.14) |
| bjorvika | 0.29 / 0.68 | 0.33 to 0.56 (0.23) |
| gamlebyen | 0.44 / 0.68 | 0.35 to 0.55 (0.19) |

The band: middle saturation at most 0.6 (the figures' middle is 0.69), nine tenths at most 0.8 (the most saturated ground is the bed seen
under the water, 0.78), the middle eight tenths of value within 0.35 (order 22's backdrop has 0.5). Every level is inside it. By area
these numbers do not see what order 26 called busier stone (it is a matter of neighbouring pixels, not of area), so the test also holds
every material quiet in itself: the mean difference of lightness (CIE L*) between neighbouring pixels of its pieces (four variants, under
the sky and inside) at most a sixth of the figures' own contrast (38.7 / 6 = 6.4). Before, the busiest:

| Material | before | after |
|---|---|---|
| Akershus's fortress (`W`) | 8.34 | 6.18 (its joints halfway between the mortar and the dark stone) |
| Gamlebyen's quay planks (`J`) | 7.07 | 5.97 (the joints between boards toward the plank) |
| Østensjøvannet's boardwalk | 6.33 | 6.33 |
| Langkaia's jetty | 5.96 | 5.96 |
| Ekeberg's quarry | 5.43 | 5.43 |
| Nordmarka's granite | 5.28 | 5.28 |
| Gamlebyen's old stone | 3.73 | 3.73 |
| Ekeberg's granite | 3.47 | 3.47 |

The two over the band were quietened; the band was not widened. Gamlebyen's old stone and Ekeberg's granite and steps, which order 26
named, are inside it. Before and after of the fortress and the planks: `crops/`.

## The worktree's first script (debt 2)

Half an hour, not solved, written down here and in `docs/games/handbook/lessons.md`. A worktree of `origin/main` at
`~/.cache/claude-scratch-larshansen/o28/wt-main`, its node_modules linked from the main checkout, then freshly installed (`bun install
--frozen-lockfile`): `bunx vite build` there wrote `index-BQUU3Dlh.js`, the same name, hash and 59.51 kB as the main checkout's build of
the same commit. The path under `~/.cache` and the install are not the cause. What does change it: vite run under Bun (`bun --bun vite
build`) measured the same script at 60.35 kB with Bun's zlib, failed the budget, and wrote a trivially different file (`Error(` for
`new Error(`, other chunk hashes; Node's zlib gives that file 59.51). GNU `gzip -c` gives 59.52, `gzip -9` 59.48. So a number taken from
a build that ran vite under Bun is about 0.85 kB high; the 2 kB order 27 saw was not reproduced, and how it was measured is not recorded.

## No rule changed

The sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, on `origin/main` (`dbfea3d`, before any change, in the main checkout) and on
the branch with every part of the order in it: every run's record byte-identical (`cmp`) for Langkaia, Akershus, Bjørvika and
Østensjøvannet. Nothing the rules keep was touched: the props, the map, the trails and the quieter ground are drawing only.

| Level | md5 of the runs, before and after | ±2 | ±4 |
|---|---|---|---|
| Langkaia | `dd2406a1c3c0` | clear 59/60, 0.15 hearts a run | clear 55/60, 0.77 |
| Akershus | `49f3e97eed34` | clear 46/60, 0.52 | clear 21/60, 0.97 |
| Bjørvika | `1fdbdf511c68` | clear 60/60, 0.52 | clear 60/60, 1.60 |
| Østensjøvannet | `7bb99e49f57b` | clear 60/60, 0.20 | clear 60/60, 0.72 |

## Tests, types, builds, budget, front page

- `bun test`: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 428 pass (421 after order 27, and 7 new: `alive/props.test.ts`'s
  five, the ground's band and the materials' quietness in `render/palette.test.ts`), none failing; the viking suite 201 s.
- `tsc --noEmit` clean in all four; `bun run build` at the root clean.
- The first script: 59.07 kB gzipped as vite reports it (59.51 after order 27; GNU `gzip -c` 59,111 bytes). Langkaia's rafts, hut, tower,
  boat and posts went to `feel`'s file behind `TEXTURED.prop`, the shed walls behind `TEXTURED.walls`, and the kit's flat lamp post and
  panel door, which no level calls now, left it. `feel`'s file 34.37 to 38.22 kB gzipped (the props kit, the ground's posts, the trails);
  the map's look (`kart`) 3.90 to 6.39 kB.
- The front page: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/` (`docs/games/handbook/scripts/review.sh`). Nothing in
  `packages/` or `apps/landing` changed.

## Perf

`perf.md`: no place draws more rectangles than after order 27 (every place fewer: Ekeberg 1,153 fewer, Langkaia 238, Rådhuset 115); the
most any place draws is 10,130 (Holmenkollen); copies rose by at most 64 a frame. The map draws about 1,100 fewer rectangles a frame
(5,280 to 4,143 with nothing cleared) and up to 157 more copies.
