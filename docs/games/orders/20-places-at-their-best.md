# Order 20: the places at their best

Written 15 November 2026, after orders 18 and 19 (PRs #64 and #65). Those made the things he
meets readable and felt. This order is about the places themselves: the backdrops where the
picture is still flat, the one level that is still slow, and the few events order 19 left
without a picture. Lars has not yet commented on orders 18 and 19, so nothing here changes
their colours or roles: it works inside ADRs 0039 and 0040.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014, 0023,
  0035 to 0040, and orders 18 and 19.
- `git fetch origin`; branch `places-at-their-best` from `origin/main`. First commit: this order
  (untracked). Commit as you go. Do not push.
- Bun only. Stop preview servers by port when done.
- ADR 0003 (`MOVE`, `JUMP` fixed) and ADR 0014 (privacy) stand. No route, box, speed or timing
  changes: the sloppy player's run files for Nordmarka, Bygdøy, Korketrekkeren and Bjørvika on
  seeds 201 to 260 must be byte-identical before and after.
- Front page: 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`.
- First script: 59.50 kB now; the build fails over 60.

## 1. Nordmarka's darkness is the slowest thing left

ADR 0036 lists it: `drawDark` / `lampOnlyLightsTheStreet` paint about 10,000 translucent rows a
frame (190 ms a frame on the Pi's software renderer at 390 x 844). Bring Nordmarka under 9,000
rectangles a frame in total at 390 x 844 and at 1280 x 800, measured with `?debug&perf` at
three places (the start, the dark middle, the troll's arena). The picture may change only if a
person could not tell: compare before and after and show the largest difference per channel;
byte-identical is best, a difference under 3 in 255 anywhere is acceptable, more is not.
Then the next two on ADR 0036's list: Bygdøy's halls (21,000) and Korketrekkeren (15,000), each
under 12,000, pictures byte-identical. Record what was done in ADR 0036 (amend it) or a new one.

## 2. Flat places

Order 17's review and HANDOVER name flat areas in line 2. Walk every level, both lines, at
1280 x 800 and 390 x 844, a picture every 20 columns (a tool for that in
`apps/viking/tools/glance/`, with the contact sheets kept out of the repo). Mark every picture
where more than about a third of the view is one unbroken colour or one repeated tile with
nothing else in it, or where the far backdrop is empty. For each, add what the place really has
(a landmark far off, a second depth layer, weather, light in windows, birds that are plainly
scenery), following the scenery rule of ADR 0039: lower in saturation and contrast than every
role, nothing that looks standable, nothing in an enemy's or pickup's colours. Everything added
is drawn once and copied (ADR 0036): no place may gain more than 300 rectangles a frame.

Wanted: no marked picture left in line 2, and the five worst of line 1 fixed. Say which were
left and why.

## 3. Left from order 19

1. Gamlebyen's walls that close behind him: a tremble and dust before they rise, in the time
   that is already there (if there is none, a mark on the ground where they will rise).
2. Korketrekkeren's sledgers setting off: a wind-up pose.
3. Turning between two statues plays "wake" and "freeze" together: one sound for the pair, or
   the quieter one dropped.
4. Bjørvika's hooks: an arrive and a leave sound like other carriers.
5. `16-gamlebyen-dawn.png` in LEVELS.html: record its address in `tools/facts.ts` or beside it,
   and retake it.
6. Langkaia's one-way ledge crop at 390 with a sign's bubble over it: move the crop.

## 4. Docs

HANDOVER, DESIGN where a rule changed, ADR 0036 amended or a new record, LEVELS.html pictures
where a place changed.

## Measures that must hold

- `bun test` green in all four packages; viking's suite under three and a half minutes;
  `tsc --noEmit` and `bun run build` clean; first script under 60 kB.
- Front page 28 of 28 byte-identical.
- Sloppy run files byte-identical on the four levels named.
- No level slower than before at any measured place.

## Hand back

1. Per item: done, partly (with the number), not done and why.
2. Pictures in `/tmp/shots-places/`: each changed place before and after, at both sizes.
3. Perf table: every level at 390 x 844, rectangles a frame before and after.
4. The identical-run proof, tests, first-script size, front page comparison.
5. Departures, doubts, found and not fixed. Branch and commits.
