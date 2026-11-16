# Order 21: in the hand

Written 16 November 2026, after orders 18 to 20 (PRs #64 to #66). Lars on those three: "i like
what i see. keep going". He plays on a phone, and first reported the game as lagging there.
Orders 18 to 20 were about the picture; this one is about the phone in the hand: what is on the
screen around the game, the buttons under his thumbs, and the last slow level.

Nobody can touch a phone from this Pi. Everything here is done so it can be checked without one
(pictures at phone sizes, synthetic pointer events in tests), and the hand-back says plainly
what only a person with a phone can tell.

## Before you start

- Read `CLAUDE.md`, `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, ADRs 0003, 0014,
  0035 to 0042, and orders 18 to 20.
- `git fetch origin`; branch `in-the-hand` from `origin/main`. First commit: this order
  (untracked). Commit as you go. Do not push.
- Bun only. Stop preview servers by port when done.
- ADR 0003 (`MOVE`, `JUMP` fixed) and ADR 0014 (privacy) stand. No route, box, speed or timing
  changes: sloppy run files for Stortinget, Akershus, Korketrekkeren and Gamlebyen on seeds 201
  to 260 byte-identical before and after.
- Front page: 28 pictures byte-identical to `/tmp/shots-before-jernhaugen/`. The touch pad and
  header live partly in the shared kit: anything changed there is opt-in for the viking game.
- First script: 59.08 kB now; the build fails over 60.

## 1. Look first

Pictures of every screen state at 360 x 640, 390 x 844, 430 x 932 upright and 844 x 390,
932 x 430 on its side, with touch controls showing (find or add the debug switch that shows them
without a touch screen): a level at its start, mid-level, the boss fights, the sledge, the map,
the card after a rune, Game over, the loading board, the failed-load card. Measure in each: how
many pixels of height the game's picture gets out of the screen, what covers it (header, help
line, banner, touch pad), and every touch target's size and distance to its neighbour. Put the
table in `apps/viking/tools/review/o21/before.md`.

## 2. The rules, then fix what breaks them

1. **The game gets the screen.** Upright, the picture gets at least 62 % of the height; on its
   side at least 78 %. The header shrinks to what a player needs while playing (runes, clock,
   hearts, lives, skilling, sound); the site's links fold away during a level on a phone and are
   whole again on the map and on cards. On its side the header is one thin row.
2. **The help line is for keyboards.** On a touch screen it never lists keys. It shows only
   what changed (the shield just got, the sledge mounted, the pole), in the touch words, for a
   few seconds, in at most two lines at 360 wide, and never over him or over the ground ahead.
3. **The banner does not sit on the game.** A level's name shows on arrival and goes; at 390 it
   never covers an enemy, a pickup or him.
4. **Buttons fit thumbs.** Every touch target at least 56 x 56 CSS px with 8 px between,
   inside the safe areas (`env(safe-area-inset-*)`), nothing under the home bar or a notch.
   Left and right are one wide pad he can slide across without lifting; jump is the biggest
   and lowest on the right; dash and the shield (or Duck on the sledge, Up at a door) say what
   they do now, by word or picture, and a button with nothing to do now is dimmed.
5. **A button answers the thumb.** Pressed looks pressed within a frame. A touch that slides off
   a button lets go of it; a second finger never cancels the first; lifting one finger never
   lets go of the other's button. Tests with synthetic pointer events for each of these, and
   for the screen turning mid-press and the page losing focus (no key stays held).
6. **The pad does not hide the game.** The buttons are translucent over the picture and sit
   where the level's ground is not, or the camera leaves room: at every size above he and the
   two tiles under him and six ahead are never under a button.
7. **Nothing else moves the page.** No scrolling, no pull-to-refresh, no double-tap zoom, no
   text selection or callout on a long press, no 300 ms delay, while a level is on. The map and
   cards scroll if they must.
8. **Turning the phone works.** Mid-level, both ways: nothing cut, he is still in view, the
   game does not restart.
9. **Reduced motion and the roles of ADR 0039 hold**: the buttons are furniture, not things in
   the world, and take none of the role colours.

## 3. Stortinget is the last slow level

27,000 to 30,000 rectangles a frame at 390 x 844 (`tools/review/o20/perf.md`). Under 12,000 at
every place of the walk, pictures byte-identical, by the means of ADRs 0036 and 0041. Then any
level still over 15,000 at any place (Slottet 18,143, Rådhuset 13,631 is fine): under 15,000.
Check `feel.test`'s route test that times out under load: give it the time it needs.

## 4. Docs

DESIGN (the phone rules as a list), HANDOVER, one ADR for the phone layout and one line in
ADR 0041 for the speed, LEVELS.html only if a picture in it changed.

## Measures that must hold

- `bun test` green in all four packages; viking's suite under three and a half minutes;
  `tsc --noEmit` and `bun run build` clean; first script under 60 kB.
- Front page 28 of 28 byte-identical.
- Sloppy run files byte-identical on the four levels named.
- Desktop at 1280 x 800 unchanged in the picture: byte-identical shots of four levels before
  and after, or name every difference.

## Hand back

1. Per rule: met, partly (with the number), not met and why.
2. Pictures in `/tmp/shots-hand/`: every state at every size, before and after side by side.
3. The before and after tables of section 1, the perf table of section 3.
4. **A list for a person with a phone**: what to try, in order, in five minutes, to find what
   pictures cannot show.
5. Identical-run proof, tests, first-script size, front page comparison.
6. Departures, doubts, found and not fixed. Branch and commits.
