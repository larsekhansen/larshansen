# Order 12: make it fair

Vikingfjorden has ten levels and nobody has played them. On 14 November an adversarial review ran
an imperfect scripted player through every level and read the rules for holes. Its report is
`docs/games/reviews/2026-11-14-adversarial.md`. This order fixes what it found about **rules,
fairness, pacing, the joins and the engineering**. The look and the words are order 13; leave them.

Lars's words for this pass: "polish. make it coherent … you have free reign, this project has no
real risk of breaking, so don't be afraid. but do be thorough in your testing … if you think the
game can improve somewhere just go ahead."

## Read first

- `CLAUDE.md` (Bun only; headless limits on this Pi; never `pkill -f`, stop servers with `fuser -k <port>/tcp`).
- `docs/games/HANDOVER.md`, `apps/viking/docs/DESIGN.md`, `docs/adr/README.md` and records 0003,
  0005, 0008, 0009, 0010, 0011, 0016.
- **The whole review**, `docs/games/reviews/2026-11-14-adversarial.md`. Findings are referred to
  below by its ids (B1, C1, …). Its line numbers were right at commit `b5d1a3a`.
- The review's scripts, in
  `/tmp/claude-1000/-home-lars-projects-larshansen/f3819549-c84a-449d-953e-29b64ae667a5/scratchpad/review/`
  (`rerun.md` there says how). They import the game by absolute path.

## How to work

- Branch `make-it-fair` from `main` (check `git log --oneline -1` says `b5d1a3a` or later and
  `git status` is clean, except the untracked `docs/games/reviews/` and this order, which you
  commit first). Commit in sensible steps. **Do not push.** End commit messages with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- `MOVE` and `JUMP` are never retuned (ADR 0003). Everything else may change, including rules in
  `play.ts`, enemy numbers, level maps and the tests' measure, when this order says so or the
  numbers say it is better. If you change the measure, say so in the hand-back.
- Every rule change gets a test on a made-up level in `rules.test.ts`. Every level change keeps
  its scripted route clearing (fix the route with the level).
- Do not reach a target by adding waits. Do not lengthen or shorten a level outside 220–280 columns.
- If the kit (`packages/pixelkit`) changes, the front page must not: build `apps/landing`, serve it
  with `bunx vite preview --port 5180 --strictPort`, shoot the `:5180` addresses listed in
  `/tmp/shots-urls.txt` with `bun tools/shots.ts`, and `cmp` each picture with the one of the same
  name in `/tmp/shots-before`. All 28 must be byte-identical. Prefer options the viking game
  passes in over changed defaults.

## Step 0: keep the review's tools

Move the review's scripts into the repository as `apps/viking/tools/review/` (the sloppy player
`sloppy.ts` with what it needs, `obstacles.ts`, `deadends.ts`, `resume.ts`, `standflag.ts`,
`bosses.ts`, `waits.ts`, `worstwait.ts`, the Python summaries, `runall.sh`, a short `README.md`).
Make their imports relative, drop the `dbg*` files, and make sure `bun sloppy.ts ks=0` still prints
`clear 1/1` for all ten levels from the new place. They must not be part of `bun test` or the build.
Save the review's own numbers as the "before": copy its `out/` summaries (not the raw jsonl if
large) to `apps/viking/tools/review/before/`.

## Step 1: things that are simply broken

1. **B1** Rådhuset's sealed pit (cols 209–227, row 48) and **B2** Slottet's slot (cols 247–251).
   Seal them so they make sense in the place: at Rådhuset a fall from the tower should not be
   free either, so make the bottom a fountain basin or harbour water (a heart, back at the flag);
   at Slottet carry the terrace to the map's edge. Then look at where a missed clock hand lands
   (the tower roof under the clock): give it a short, obvious way back to the hand.
2. **A dead-end test.** Put the graph search (`deadends.ts`) into the test suite: no level has a
   standable spot from which neither the rune nor a respawn can be reached with what the player is
   guaranteed (single jump; the pole from Akerselva on). Run it in workers beside the bracteate
   searches. If the suite passes two minutes on the Pi, raise the stated budget rather than weaken
   the check, and say what it takes now.
3. **F1** After Game over, R, the header's restart, Back or a header link must give three lives.
4. **G3** The feather moment plays only when the feather is actually new or newly gold.
5. **F2** The brown cheese and skilling cannot be farmed by restarting: remember, per visit and
   per level, that the cheese was taken (and do not pay skilling towards a life twice for the same
   coin in one visit). **F6** A bracteate already owned is drawn as a pale outline and makes no
   sound.
6. **G1** A new player's first ↑ in Langkaia must not send him back to the front page: start him
   clear of the door Hjem after the helmet moment.
7. **G2** Click or tap to walk never walks him off an edge into water or a pit: in the viking
   levels it stops at an edge (and at an enemy), and the help line no longer invites it in levels
   (it may stay on the line map and stays on the front page).

## Step 2: dying

8. **D5 / F3** A fall into water or a pit while he is still blinking from a hit puts him back but
   takes no second heart.
9. **C1 (first half)** Game over at a boss restarts **at the boss's bench**, with three lives and
   full hearts, the boss asleep with no hits. Everywhere else Game over still restarts the level.
   Write this as ADR 0017 (it adjusts 0008), and say so on the Game over card in both languages
   when it applies.
10. **A2** Nabolaget gets flags no more than about 45 columns apart (one on the church roof); look
    at Akershus's 19.9 s walk back the same way. Check every level: no stretch of more than about
    50 columns without a flag or bench.

## Step 3: the bosses

11. **The troll (C1, C2).** A player who has not read the sign must be able to work it out from the
    picture, and one who has must usually win.
    - The dawn band is an unmistakable shaft on the floor; it pulses while the club is stuck.
    - The troll's and the plough's lines (today only `say()` to screen readers) are shown on screen
      in the level's bubble style, in both languages.
    - After a round with no hit, a short hint appears over the troll (dry voice, two lines at most).
    - After about ten seconds of stalemate (him on a rock or ledge), the troll backs off to the far
      end so the fight restarts; the plough likewise does something other than loop.
    - Make the windows kinder (how long the club sticks, how wide the wave's jump window is, how
      close he must be) until the sloppy player at ±4 ends in Game over at the troll in at most 2 of
      30 runs, and say what you changed.
    - `bosses.ts` after: no naive strategy should reach Game over in under a minute, and "walk in
      and stand facing it" should at least show the player what to do.
12. **The plough (C1, C4).** Cut the 11 s of standing on the terrace to about 5 s. Its wind-up must
    still be visible with reduced motion (a different still state, not only motion).

## Step 4: one problem at a time

13. **A1, D3, D4, D6** Go through the review's table of places that kill. The rule: no enemy's
    patrol (and no thrower's aim at the spot he must stand) within 3 tiles of the take-off or the
    landing of a jump over water, a pit or a drop, and no spiky enemy on or beside ice. Named:
    Langkaia's gulls at cols 125–131 and 216–219; Akershus's braziers before the first two cannons
    and the guard at 240–244; Rådhuset's e-scooter at 100–103; Holmenkollen's hedgehogs at 62 and 87,
    the fire basket at 94 and the kid at 98; Akerselva's wasp at 116–119; Nordmarka's hedgehog at
    the first bog; Stortinget's two umbrellas; Ekeberg's hedgehog at the hollow, the crow in the
    gust at 192–199, the squirrel at 93; Nabolaget's crow and cats on the first roofs. Move them,
    change their kind, or change the ground; keep each level at 8 to 20 enemies and keep every kind's
    first appearance alone.
14. **B3** No thrower can reach a flag, a bench or a sign he must read; extend the test to
    `THROW_REACH` for throwers.
15. **Langkaia is level 1.** Gaps of two tiles from moving ground, wider rafts, nothing in the air
    over a take-off, the first water still only costing a walk of a few seconds. A new player at ±4
    should lose about one heart there, not five.
16. **Ekeberg's quarry** (three sheep, a heart in 55 % of tries even at ±2): make the bounces
    forgiving (larger backs, a rock to rest on between, or a gust that does not blow during the
    chain) until it costs a heart in under 20 % of tries at ±2.
17. **Holmenkollen's sinking slabs** (cols 160–167, 22 lives at ±4) and **Nabolaget's last jump**
    (the tram's slot after the plough, 7 lives): make them fair.
18. **Slottet needs a twist** (E3): it is the easiest level by far and its route stands still 48 %
    of the time. Give its third section something to do that fits 17 May (ideas: a second, faster
    row of banners going the other way to change between; the band marching, with the drum moving;
    balloons as timed ledges; a hot-dog cart as a walker). Keep it the breather after Rådhuset, but
    not below level 2.

## Step 5: waiting

19. **E2** No forced wait over about 5 s anywhere, worst case on arrival, measured with
    `worstwait.ts`: Holmenkollen's chairlift (several chairs) and tower lift, Rådhuset's ferry and
    swinging bell (and a missed carillon bell should cost 3–4 s, not 9), Nordmarka's moose (two, or
    a shorter round), Akershus's hoist, Slottet's Guard, Stortinget's trains.
20. Rådhuset's route stands still 49 % of the time. Bring every level's standing share under about
    a third by making waits shorter, not by adding walking.

## Step 6: the numbers to hit

Run the full sloppy study after (`runall.sh`, about 50 minutes; run it while you do Step 7) and put
its tables in `apps/viking/tools/review/after/`. Targets at ±4, timing errors only, 30 runs:

| | hearts lost per run | Game over |
|---|---|---|
| Langkaia | ≤ 1.5 | 0 |
| Akershus | ≤ 2 | 0 |
| Rådhuset | ≤ 2.5 | 0 |
| Slottet | 1 to 2.5 | 0 |
| Holmenkollen | ≤ 3 | ≤ 1 |
| Akerselva | ≤ 3.5 | ≤ 1 |
| Nordmarka | ≤ 4 | ≤ 2 |
| Stortinget | 2 to 4 | ≤ 2 |
| Ekeberg | ≤ 4.5 | ≤ 3 |
| Nabolaget | ≤ 4.5 | ≤ 3 |

That is a rising line. At ±2 no level should end in Game over. Also: "gave up" outcomes at
Rådhuset at ±4 down from 9 to at most 2. If a target cannot be met without making a level dull,
stop, and say what you measured and why you stopped; do not hide a miss.

## Step 7: the joins, phones and the machinery

21. **D2** On a tall screen the view must be at least about 240 art px wide in the viking levels
    (pass an option from the viking game; do not change the front page). Add a way to shoot a
    portrait window in `tools/shots.ts` (a `--size=390x844` argument) and look at two levels that way.
22. **G4, G5** Touch: the button at a bench says "Sit"; the dash is taught in words that fit touch
    when the device has no keyboard; the help line mentions ↑ to jump, the dash once he has the
    pole, and R.
23. **G6** With reduced motion he is drawn at half strength while safe, instead of nothing.
24. **G7, J6** The maze is called Jernhaugen everywhere, front page header included. (This changes
    the front page's header text: the 28 reference pictures will then differ only in the header
    row. Say exactly which differ and confirm the canvas below the header is unchanged, by comparing
    the pictures with the header rows cut off, in a small script.)
25. **K4** A board "Laster … / Loading …" while a level's file is fetched, and a spoken-plain
    message with a retry when it fails; never a level opening under a player who has walked on.
26. **K2, K3** Win back first-script size: the bot and `?debug`-only code loaded on demand, the
    troll behind its level's boss slot as the plough is, routes out of the level chunks. Report the
    first script's size before and after; the budget stays 60 kB.
27. **K1, K5** The deploy runs the tests of `packages/pixelkit`, `packages/maze`, `apps/landing` and
    `apps/viking` before publishing and fails on red; the smoke test also fetches one level chunk
    and the maze's chunk; pin Bun to the version this Pi runs (`bun --version`). Read
    `infra/README.md` first; the runner is this Pi, so keep the job's time sensible and say what it
    is.
28. **F5, I1** Note `?feather` and `?pole` in DESIGN as deliberate. Move the maze level 5 teleport
    twin off the slider.

## Docs, in the same change

- `apps/viking/docs/DESIGN.md` matches the rules again (J1 too).
- ADR 0017 (Game over at a boss) and any other decision you had to make (the blinking fall, the
  portrait view) as records; update ADR 0008's status line and `docs/adr/README.md`.
- `docs/games/HANDOVER.md`: the weak-spots list rewritten to what is true after this order; the
  review and the tools named under "Checking"; margins updated.
- `docs/games/LEVELS.html`: the numbers in the `LEVELS` array (columns, clear time, enemies,
  skilling) and the rules section, where they changed. Do not touch the pictures.

## Hand back

1. Per numbered item above: done / partly / not done, in one line each, with what you changed.
2. The before and after tables: sloppy outcomes at ±2 and ±4, the per-jump worst places, worst
   waits, boss strategies, first-script size, test suite time.
3. Every departure from this order and why; everything you are unsure about; anything new you
   found that is not fixed.
4. Screenshots in `/tmp/shots-fair/`, named for what they show: each place you changed in a level,
   the troll's dawn shaft and hint, the plough's still telegraph, the Game over card at a boss,
   the loading board, a portrait shot of two levels, the front page header.
5. The state of the tree: branch, commits, `git status`, and the exact results of `bun test` in
   all four packages and of the front page comparison.
