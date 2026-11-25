# Lessons

What went wrong or nearly did, and what to do differently. Earlier lessons are in
[`../HANDOVER.md`](../HANDOVER.md), "How the work was run".

## What the planner got wrong

- **"It can only help."** The planner told Lars a longer edge forgiveness "only ever helps",
  from reasoning, before measuring. The sloppy player found 31 runs in 1,920 that did worse
  (ADR 0048). *Do not promise an effect on play that has not been measured; say "should" and
  say how it will be checked.*
- **A colour test with a side effect nobody chose.** Order 18's rule that enemy bodies stand
  off every backdrop made every enemy pink, plum or orange, and for four rounds the planner
  treated "no brown passes the test" as a fact of nature. Lars saw it at once. *When a test
  forces an odd result, question the test and tell the person; an odd result that persists is
  a design decision being made by accident.* (It became the glamour, ADR 0050, which is
  better than what either started with.)
- **A page of the finished designs came late.** The planner published the study of three ways
  but no gallery of what was then built. When one was made, Lars found five things in an hour
  (rat tails, green wasps, the teddy boy, the shapeless kid and cart, the pink). *After any
  round that redraws things, publish the sheets. He comments on what he can see.*
- **Trusting a second-hand claim.** Lars's pasted advice said Shattered Pixel Dungeon outlines
  its enemies. It does not. The planner checked the art files before building on it. *Keep
  doing that: open the source.*
- **Guessing from process names.** A "WebExtensions" process made the planner suggest Lars had
  Firefox open. He does not use it. *Look at the parent process before saying whose it is.*
- **Reading "just take me out again"** as "remove Again". Still unconfirmed. *When a sentence
  can mean opposite things, build the cheaper one and ask in the same message, once.*

## What went wrong in the machinery

- **Two implementers at once** drove the Pi's load to 15 to 30; the viking suite went from
  three minutes to over five and the deploy's tests timed out (a hook's 240 s limit, now 600).
  One at a time unless the gain is worth it.
- **`/tmp` is RAM.** Pictures, cloned repositories and browser profiles filled 2.3 GB of it,
  with swap nearly full, before anyone looked. Working files go on disk
  (`~/.cache/claude-scratch-larshansen/`).
- **Headless Firefox hangs** now and then instead of exiting, holding 700 MB. Three were found
  hours old. Check after every batch and every round.
- **A safety check blocks `rm -rf $VAR`**, and also commands it cannot parse (zsh's
  `${(@f)$(…)}`). Use literal paths, fresh directory names, or put the command in a script
  file and run that.
- **The shell's working directory drifts** after a `cd` inside a command, and once ended up
  inside a subagent's worktree. Start commands with an absolute `cd`.
- **`/usr/bin/time` does not exist** on this Pi; a check script silently ran no tests because
  of it. Read a check's output before believing it finished.
- **Wait loops that never end**: `until grep … && ! pgrep -f "bun run build"` matched another
  session's process forever. Wait on a marker the script itself writes (`echo FINISHED`).
- **The first script's budget** (60 kB) was hit by two orders merging: 59.47 + 0.9 = 60.34.
  Each order now moves something out as it adds. It was 58.86 after order 25.
- **Hand-back pictures that miss their subject** (a crop of sky where the shield should be, a
  "troll asleep" without the troll). Ask for crops found by the subject's outline, and open
  them.
- **A finished subagent's worktree stays locked.** `git worktree unlock`, then remove.
- **The first script measured in a worktree** (order 27: "about 2 kB larger" than the main checkout). Order 28 spent half an hour on it:
  a worktree of `origin/main` under `~/.cache`, with node_modules linked from the main checkout or freshly installed (`bun install
  --frozen-lockfile`), builds byte-identical (the same file name and hash, 59.51 kB): the path and the install are not it. What does
  change the number: **vite run under Bun** (`bun --bun vite build`, or any shell where `node` is not what runs vite). Its budget plugin then
  measures with Bun's zlib, 60.35 kB for the same script (0.84 kB more), and the build fails; its output also differs trivially
  (`Error(` for `new Error(`, other chunk hashes). GNU `gzip -c` gives 59.52, Node's zlib 59.51. The 2 kB itself was not reproduced. *Read
  the size from `bun run build` in `apps/viking` (vite under Node), and say how it was measured; if a number differs, check which zlib.*

- **A boss route that bounced for ever** (order 29): the first scripted run against Loki landed on his head as he reeled, bounced
  (a dud), came down on it again, and never touched the floor; the ring under him then kept the height he last stood at. A person
  steers off; a route does not. *When a boss has a bounce state, play the route and look at his feet's height over time; and decide
  what landing on a figure that hurts does* (on Loki: a hurt, as spikes; only his pose is a stomp).
- **A test that imported the review's tools** (order 29) pulled `tools/review/sloppy.ts` into the app's type-check, which failed the
  build on an unused variable there. The test imports them by a path in a variable now. *Tools outside `src` stay outside `tsc`.*

- **`tsc` from the root is not the app's `tsc`** (order 30). The root has no TypeScript of its own, so `bunx tsc -p apps/viking` from
  the root fetches the newest from npm (7.0.2, the native port, whose DOM types allow `hidden` to be `"until-found"`), while inside
  `apps/viking` `bunx tsc` is the workspace's 5.9.3. That is why the root reported `main.ts:540` and the app was clean. Both are clean
  now (the help line's saved `hidden` is typed as the DOM types it). *Run `tsc` inside each package (as `review.sh` does); a number
  or an error from the root may be another compiler.*
- **`mapfile` is bash's** (order 30): in this zsh, `mapfile -t U < file` silently leaves `U` empty and `"${U[@]}"` passes one empty
  address. Put such loops in a `#!/bin/bash` script, as `frontgate.sh` is.
- **A test that watches pixels cannot tell a flash from motion** (order 30): drawing a whole level with its clock running found
  trams crossing the view's edge and a salmon's tail. What held was reading the source for every clock-driven blink (each held
  with reduced motion or named as an idle with why), and drawing one thing at a time (a boss with its age held, a ledge through
  its warning). *Watch the thing, not the screen.*

- **A recorder that also fingerprints shared state** (order 31): the reduced-motion test draws each path once unrecorded (so what is made
  once is made) and then records it at several steps of the clock, the lights it registers included. The unrecorded draw's lights were
  left in the list, so the first recording had them twice and every path in every level looked as if it changed. *Clear shared state
  after any draw that is not recorded; when a new test finds everything, suspect the test first.*
- **A picture taken before the level's file came** (order 31): one of 72 pictures of Stortinget differed from its pair in every pixel; it
  was the page's empty background, the level not yet fetched. *Look at a differing pair before believing it; retake it.*
- **zsh does not split words** (order 31): `for l in "a b" "c d"; do set -- $l; …` gives `$1` the whole pair in zsh. Put such loops in a
  `#!/bin/bash` script or `bash -c`, as with `mapfile`.
- **A source search for idioms can be written around** (order 30's, replaced in order 31): Ekeberg's fjord glints drifted with reduced
  motion because their clock was read inside a sum (`(i * 53 + Math.floor(v.t / 30)) % w`), which the search's pattern did not match.
  Drawing every path with the clock running and the world held found it at once. *Hold behaviour by doing it, not by reading for it.*

- **A hook given to one of two users** (found in order 32): order 15 moved the night out of `main.ts` behind `Art.night` and gave the
  hook to Nordmarka, the level it was moved for; Vålerenga also had a `dark`, and for a week nothing drew its lane's dark, the Pi in
  its window or the paper cranes (order 32 drew the Pi and the cranes again; the lane's dark, at 1,580 rectangles a frame, waits on a
  decision). The pictures were byte-identical where they were compared (Nordmarka's). *When code moves behind a
  hook, list every caller of the old path (`grep` the condition it ran on: here `def.dark`) and give each the hook.*
- **Light added is not light taken away** (order 32): a census that counted every see-through fill over a light as dimming it named
  Østensjøvannet's sunrise, which is drawn `lighter` (it adds). *Read the composite, not only the alpha.*
- **The harness's keys hold one action a step** (`r`, `j`, `n`...): a jump with a direction held cannot be scripted, so a stomp on
  Loki was found from a speaker stack (a short hop, then right), by a search in a script first. *Search a key script outside the
  page, then check it in the page: the page's input differs (one timing that missed the wave in the script was hit in the page).*

- **A light is drawn whether it is on the screen or not** (order 32): the kit draws every registered light after dusk, and a pool is a
  rectangle a column, so six bridge lanterns' pools cost 156 rectangles a frame wherever he stood. *Register what is costly only while
  it is in view (the props kit's `pool`); measure by night as well as by day.*
- **A cache that starts over in the middle of a recording** (order 32): the reduced-motion watch fingerprints a copy by which canvas it
  copies; the outlined shapes' cache holds 800 and starts over when full, so in the whole suite (after other tests had filled it) the
  Angry Boy's leap was "drawn two ways at one place" though it was not, and alone the file passed. *A test that fingerprints cached
  pieces clears the cache first (`forgetShapes`); when a test fails only in company, suspect shared state before the code.*

- **A copy of a see-through piece is not the fill it copies** (order 33): in headless Firefox (Skia) a rectangle filled with `rgba(...)`
  and the same colour drawn into a canvas and copied (`drawImage`) differ by a level or two on opaque ground and more on see-through
  ground: solid fills and bitmaps take different paths. A `Path2D` of whole-pixel rectangles filled once, under even-odd clips, is byte
  for byte the same as the rectangles; so is a copy laid destination-over. *Keep a see-through drawing as paths, not pieces, if its
  pictures must stay byte-identical; test the premise in the browser first (a small page photographed by `tools/shots.ts`).*
- **A counter counts what it counts** (order 33): `?debug&perf` counts `fillRect`, colours and copies, not path fills or clips; the lane's
  kept dark showed +0 rectangles. *When a change moves work out of what is counted, count the new work too (fills, the rectangles in
  their paths, clips) and time it.*
- **A watch over a combined drawing can be blind** (order 33): the reduced-motion watch of what the page draws after dusk found nothing,
  with reduced motion or without, because the skilling turns on its own clock and made every recording new; with them left to the part
  that holds them alone it found the track rat's named leap and a hook turning at its landing (the watch had moved the world with the
  clock). *Plant a blink and see the watch find it before trusting a clean result; hold the world as the other parts do.*
- **A module two chunks share lands in the first script** (order 33): the page took two numbers from the maze's feather module, and the
  maze's drawing in it stayed in the first script because the maze's chunk imported it from there. *Read the first script's module
  list (a build with a stats plugin), not only its size.*

- **An order's description of a thing can be wrong** (order 34): it named "Frognerseteren's walls" as near the warning red, from order 33's
  table; the walls are tarred logs, and the red was a hire sledge leaning on the shed (`frognerseteren < back`, the test's own words). *Read
  which function the test names before recolouring what the order names.*
- **A one-frame picture cannot show what needs the frames before it** (order 34): the encore's music learns when Loki woke by watching every
  frame; under `?debug&steps=…` the page steps the rules and draws once, so the music has never seen him wake and no shouted line shows.
  The timing was held by tests (`game/tune.test.ts`, the scripted fight step by step) and the bubble photographed with `&say=shout1`. *Say
  which a picture can show and which a test holds.*
- **A scheduler that learns of a moment late misses its first beat** (order 34): it schedules a quarter of a second ahead, so a phrase that
  begins the step the stage goes plain had its first note already behind it. The plain notes begin a beat later. *Start what follows an
  event at least the lookahead after it; the wake's intro works because nothing is scheduled while he waits.*
- **A drawing that hides behind another is not seen at four times** (found in order 34): Loki's shades were laid at his hairline in order
  29 and hidden under the wig while he was glammed; the sheet at four times showed his brow and eye and nobody noticed. *Look at one frame of
  a figure at eight or twelve times, part by part.*
- **Words relayed by another session** (order 34): Lars's answers came through his other session and a review page; the order quoted
  them, with the relaying session's reading of a typo beside them, and kept back the three that needed him in person. *Build what is plain
  and safe; keep what is not for his direct word, and say which.*

- **A proxy round a test's recorder is asked on every call** (order 35): the stand-in contexts the tests draw into were `new Proxy(base, …)`,
  so every `fillRect` and every `fillStyle =` went through a trap, and the area recorder parsed and printed a colour's hex on every fill.
  Drawing every level for the fields took 25 s; with the recorder's methods its own (anything else falls to a prototype that is a proxy:
  `ANY_METHOD` in `render/fields.ts`) and a colour worked out once, 7.6 s, the same areas to the last digit. That alone took the suite from
  363 s to 280. *Measure a test before trimming what it holds; look at what every call costs.*
- **Sixteen workers on four cores** (order 35): the reach searches are CPU-bound, about 400 core-seconds; started all at once, sixteen
  threads shared four cores and the suite waited for the last. A pool of four, the costliest first, Gamlebyen's nine searches each a job,
  a worker taking job after job, saved some twenty seconds; the floor is the CPU (Akershus's search alone is 52 s, nearly all of it the
  kit's physics). *Count the core-seconds before scheduling; no order of jobs beats their sum over the cores.*
- **The three slowest test files** after order 35 (each file's seconds in the suite's JUnit report, the mean of three runs alone): `levels/levels.test.ts` 106.6 s (the reach searches: CPU-bound on four cores), `render/reduced.test.ts` 70.9 s (every level drawn and recorded at many steps of the clock), `render/palette.test.ts` 20.3 s (every level walked for its fields).
  Before it, `levels.test.ts` 125.9 s, `render/reduced.test.ts` 99.1 s, `render/palette.test.ts` 38.4 s. Look there first.
- **A test that reads what another made passes alone** (found in order 35): `alive/props.test.ts`'s "no prop is neon" read the inks the
  first test's walk had gathered; asked alone (`-t`), it found none and passed. A planted neon prop showed it. *Each test draws what it
  reads (a walk made once, by whichever asks first).*
- **A planted fault the test cannot reach proves nothing** (order 35): a blink planted in the kit's `drawCarrier` passed the reduced-motion
  test's watch of the kit's carriers, because no level draws its carriers with the kit any more; a light dimmed earlier in its own pass
  is no dimming at all (a pass's lights are drawn at its end). *Plant the fault where the test looks, and when it passes, find out why
  before planting another.*
- **A fixed wait is a guess** (order 35): the blank pictures of orders 32 and 34 were taken before the page had drawn (`--wait=5000` was
  sometimes too short for the encore's files on this Pi), not by the harness. Now the page says when its picture is drawn and the picture is
  taken then; a blank one is named. *Wait for the thing, not for a time; and look for empty pictures by machine, not by eye.*

- **A navigation while the page loads replaces its history entry** (order 36): a stepped page that walked him through Nordmarka's mound
  door at load changed its address to `#jernhaugen` before the load event, which the HTML standard makes a replacement, not a new entry;
  the maze's way out (Back, `history.back()`) then had nowhere to go and the picture stayed in the mound. No player is at a door while the
  page loads, so the page is right; the harness walks in after load (`?debug&walkin`). *A stepped picture can only show what happens after
  load if it waits for the load; when a path goes through history, check `history.length`.*
- **A picture at step 0 of a scene that fades in is black** (order 36): the maze's first pictures at `steps=0` were named BLANK by
  `tools/shots.ts`; the level fades in over 24 steps. *Take a scene's opening a second in.*
- **One drawing of him, not two** (order 36): the maze could draw the viking game's own sheet once his frames and their machinery were
  moved into the kit and the viking build told to keep them in `feel`'s file (`vite.config.ts`); moving them changed nothing in the first
  script. *When two packages need one drawing, give it to the package both import, and say in the bundler where it goes.*
- **A file a debug module shares with the page's chunk splits the chunk** (order 36): the maze's harness imported the ghost's recorder
  and the records' keys from modules the maze's scene also imports, and the viking build split them into small files of their own, a
  fetch more for every visitor; handed in from the scene's module (and the keys as strings), nothing split. *Read the chunks' list
  after adding a lazy module that imports from another.*

- **A stepped picture snaps its camera** (order 37): the camera's jump on a notched phone (85 px in a frame) did not show in consecutive
  stepped pictures at all, before or after the fix, because a stepped page places its camera where it means to be; the jump is the easing
  camera's x lagging behind a turn. `?debug&live=<frames>` runs frames as the page runs them (the kit's loop takes the frame's time as given:
  start it at nought, then a sixtieth of a second a call) and lists the camera's moves. *What exists only from frame to frame needs frames;
  find the cause in a test (the frame test's walk) before photographing it.*
- **A module the bundler is not told about lands in the first script** (order 37, again): the kit's `himviews.ts` (only the maze draws it) and
  `safe.ts` (only `?debug` sets it) both went into the viking page's first script, 0.7 and 0.17 kB, because its `manualChunks` sends every
  module it does not name to `index`. *After adding a kit module, build and read the first script's size; say in `vite.config.ts` where it goes.*
- **A test's planted fault may miss a canvas** (order 37): the maze's scene draws its world's pass onto a scratch canvas and then its bursts
  and its doorway's glow onto the street's own; the first watch recorded only the pass, and two planted faults (a burst with reduced motion,
  a blinking glow) passed it. *Record every canvas a frame draws on; plant a fault on each.*
- **The first frame of a curse is drawn a step behind** (order 37): the page draws each frame between the step before and the step after
  (`alpha`), so the frame of the step the curse takes him on shows him where he was a step before. A watch that wants the world held must
  start a frame later.
- **A steady diagonal from a contradicting drawing** (order 37): with stickiness between two angles, a drawing that disagrees with the
  way he sets off (his face as he walks up a diagonal) has to be resolved once, and an early, noisy estimate of the way resolved it wrongly
  now and then; waiting for a steadier estimate only then fixed it. *Measure a sticky rule on every angle with noise before choosing its
  numbers (a sweep took a minute).*

- **A kept box squashes a drawing made for a grown one** (order 38): the gull, the crow and the scooter were drawn for the box a quarter
  larger and drawn into the box seven levels keep, so `parts` moved every row in proportion and merged some: the gull's raised wing lost a
  row, the scooter's wheels went under its deck. On the sheet at four times the gull was a lens; in place at phone size it was worse.
  *A look met in kept boxes is drawn for that box (`fit`) or from its box's top (`above`); look at it in the level that keeps the box.*
- **A sheet can draw what the page never does** (order 38): the census recorded a jumper's ripple and the track rat's ballast, which the
  page draws plain inside the outline, and the figures tool outlined them with the rest, so the sheet showed "three dots" and "two rings" in
  the warning red that no player sees. *Before judging a figure by its sheet, check the sheet draws it as the page does; when a tool
  misleads, mend the tool (`noPage.plain`).*
- **A beat can be measured** (order 38): "the wings do not read" became "two frames of the pigeon's beat are 5 pixels apart at their best
  overlay", which found the wasp too and is now a test. *Overlay two frames the way that makes them most alike before counting: a bob of a
  pixel otherwise counts as a whole silhouette's difference.*
- **A script outside the repository that imports a workspace package by name** (`@larshansen/pixelkit/...`) made Bun look for it on the
  npm registry (a 404; nothing was sent but the package's name). *From a scratch folder, import the repository's files by their path and run
  `bun --no-install`.*

- **A tell that is only a movement is nothing with reduced motion** (order 39, found by order 38): the salmon's water and the track rat's
  ballast were drawn under `!view.reduced` since order 23, so the players who asked for less motion saw no warning at all; every test held
  that nothing blinked, and nothing did. *For every warning ask what it is with reduced motion, and hold that it is something (a still mark
  there for the whole of the tell), not only that it does not blink.*
- **Finding a figure in a picture by its colours** (order 39): the street's backdrop is washed toward the air, a lean and a sheen recolour an
  invader, the dark recolours everything, so an exact match finds little and a loose one finds a one-toned piece on any wall of its tone.
  What worked: for what the page outlines, the outline by its exact colour by day, only the cluster that joins the one nearest the middle (a
  thrower's own outline beside its shot was counted at first and halved the measure), the same pixels under the other sky; for the rest, a
  match within 24 a channel with every colour of the piece found; and a pixel beyond a prop's edge that belongs to another piece (a railing's
  next span, a lamp's head over its post) is no edge. *Look at the found place in a crop before believing a number; a 0 was a bad match
  every time.*
- **A new test that outlines under a stand-in document leaves its outlines noted** (order 39): the next test to draw over a level's dark found
  them and made their glow with no document, three failures in a file that passed alone (order 32's lesson about shared state, again).
  *A test that puts up a stand-in document forgets what it drew before taking it down (`freshRings`, `forgetShapes`), and restores the paint
  target and the view; run the whole suite before believing a new test.*
- **A piece laid over another can hide an eye** (order 39): the bishop's guard's levelled halberd crossed his face on the frames his body
  dropped a row. *Ask the census for every frame's eye pixel after redrawing a figure.*
- **The worst by a measure is not always the worst to a player** (order 39): carriers and benches measured lowest at their edges, but they are
  told by their role's mark (the paint, the cyan corners); a level pinned to day is never seen at night. *Rank by the sky it is met under, and
  say what the measure does not count.*

- **A picture pair measures a tell only where nothing else moves through its window** (order 40): the track rat's tell measured 4.8 off
  what was behind it because a train left the station behind it between the two pictures, and along a route he walks through the window
  himself. What is exact is two builds' pictures at the same step (the world is the same, so every pixel that differs is the change), or the
  drawing alone recorded in a test. *Stage a tell where its world is still, or compare builds, and look at the pair before believing it.*
- **`?debug&look` on an upright phone puts the point two thirds down, and clamps at the level's edges** (order 40): a crop "round the middle" missed
  the subject. `?debug&where=<wx>,<wy>` writes where the point is into the picture's two bottom-left pixels: read it, do not guess.
- **By day nothing changed, so it need not be photographed three times** (order 40): `tools/shots.ts` starts a browser a picture (3 to 4 s on
  the Pi); 648 pictures were cut to 372 by taking each place by day once. *Count the pictures before a batch, and take what cannot differ once.*
- **A line round a shape is round its shape, not round everything drawn with it** (order 40): the skilling's glint, a star that crosses it six
  steps in a hundred and fifty, sticks out of its frame; the line goes round the frame and the glint is drawn over it. The test found the
  difference. *Say in the test what the shape is.*
- **A tell that is state, not clock, needs the state before it to be drawn "a step before"** (order 40): a pad about to sink and a wall about to
  close are on because of where he stands; drawing at `t - 1` with today's state shows the tell still. The test keeps a copy of the level's own
  ground (`structuredClone`) and where he was, a step before it came on.

- **Firefox's `--screenshot` with a relative folder writes nothing** (order 41): a copy of `hand.ts` run with a relative output folder measured
  every page and saved no picture, each reported FAILED. *Give the tools absolute paths.*
- **A stepped picture can show two things at once that never meet in play** (order 41): `?debug&card` puts the card up over the level's
  first frame, so the plate with the place's name lies under it and the pad stays drawn beside it (the page hides the pad a frame later, when
  a card is up). The look-first table counted neither as an overlap. *Before calling two elements a clash, ask whether play ever shows them
  together.*
- **`?debug&fetch=hang#akershus` with no progress opens the map** (order 41): Akershus is not open, so the page goes to the map and no board
  shows. Pretend the station before it cleared (`&cleared=langkaia`).
- **A word's contrast measured in a picture is noisy** (order 41): letters are smoothed into their field, so the pixels of a white word on a
  translucent button are mostly in between, and a pressed button that had gone white over snow still "measured" 9 from what showed through
  it. Where the colours are known (the stylesheet's, the kit's plate), work the contrast out over every ground the levels paint, and use the
  pictures to see.
- **A small layout rule in the first script costs more than its lines** (order 41): the boards' rows cost 172 bytes there; asked of the map's
  lazy look (which already brings its words) they cost 52. *Ask whether a rule belongs to a lazy file the page already waits for.*
- **A test that reads a stylesheet's rules** must take its comments out first (order 41): a comment before a selector list became part of the
  first selector, and the rule was not found.

- **A stepped picture on a touch screen is framed before the pad is up** (found in order 42): the pad stays "off" until the page's first frame
  says it is up, and a stepped page frames its camera once, before that frame; so the camera of every stepped picture on a touch screen
  has made no room for the pad. A browser's resize observation lays the page out again at once (with the pad up); headless Firefox delivers
  none. Order 41's picture of the map on its side showed Ekeberg's lowered board touching the move pad, where the camera of the second frame
  in a real browser stands 22 px higher. *On a touch screen, lay the stepped page out again before measuring (`__game.layout()`, as order 42's
  scratch copy of `hand.ts` does), and model the camera in a test as the page frames it (`frame` with the pad's room).*
- **A style sheet kept in a script ships its comments** (order 42): the maze's cards' CSS is a string in `panel.ts`, and its comments went to
  every visitor of both pages. Moved into the script's own comments, the maze page's first script went from 32.12 to 31.86 kB.
- **What the first script carries for others can be read off it** (order 42): built without minifying, every top-level binding the first
  script declares and its own code never uses, only exports, is there for a lazy file (`who-uses.py` in order 42's scratch folder). A whole
  module of such bindings can move by the bundler's rule (the swatches of one level were there because the rule sends what it is not told
  about to the first script); a binding beside others the first script uses needs its module split (`runecells.ts`, the kit's
  `launcherart.ts`). *Read the module list and who imports what, not only the size.*
- **A safety net nobody stands on** (order 42): the page drew the kit's plain carrier and plain ledge on a beat where a level had no drawing of
  its own, and no level was without one. *Ask which levels a fallback is for; if none, take it out and hold that none needs it.*
- **A function only `?debug` calls, reached through a module every page imports** (order 42): the kit's `launch` imported the harness's
  stepping, so the harness was in every visitor's first script though only `?debug&steps` reads it. The harness now carries its runner, and
  the page fetches the harness with its `?debug` code.

- **Turning the pad off also takes its room from the camera** (order 42): put "off" under the opening card, the map dropped while the card was up
  and eased back about 20 px as it went; hidden by the style sheet instead (`body:has(.card.story) .pad`), the pad is gone and the camera keeps its
  place. *Ask what else reads a switch before using it for a new case.*

- **A far view can be hidden by the level's own nearer layers** (order 43): Vigelandsparken's limes and maples (its mid and near layers) covered its far
  layer at every place but the gate on a phone on its side, and Bygdøy's woods its city; the first landmark drawn there was invisible in every
  picture with the play. *Look at a far layer with the play in front, at 844 x 390 where most of it shows, before drawing more into it; open the
  nearer layer where the place opens, or raise the far one where the view climbs.*
- **A thing in a far layer is placed by the world x it is seen from** (order 43): `layerOrigin` is taken from the view's middle, so what a far layer
  draws at world x is in the middle of the screen when the camera's middle is there, by day and with reduced motion alike. Placed by a layer pixel
  beyond the level's width it is never seen with reduced motion. And a thing that comes round every N world pixels comes round every N x 0.12
  pixels of the screen in the far layer.
- **A farther row of a split layer stands a quarter on** (order 43): order 23's split rows draw every other tree at `wx / 0.75` (`spedX`), so a gap
  cut by `wx` left the farther row standing in it. *Test a rule about where a thing stands on where it is drawn.*
- **The far view alone, by a scratch build** (order 43): two switches in a scratch copy of `main.ts` (the sky and the far passes only; the sky only)
  showed each far view without the play, and the far view is the pixels where the two differ (`o43/before.md`). Nothing of it is in the repository.

- **A far piece at a level's start is somewhere else on each phone** (order 44): the camera is held at the level's left edge there, so the view's
  middle is 120 art pixels in upright and 211 on its side, and a piece at world x stands 91 x (1 - the layer's speed) pixels further right on its
  side than upright; and on its side the page's bar covers the canvas's top 40 art pixels. Korketrekkeren's TV tower was behind the restaurant
  upright, behind a sign's bubble or the bar on its side, until it was placed for both. *Place a start's landmark for both sizes and look at both.*
- **A lit row of windows is a stripe of the paint** (order 44): Østensjøvannet's blocks first lit whole rows of windows after dusk, and across the
  lake they read as yellow ledges. *Light single panes with dark between them.*
- **An even line where a jagged one was hides what lay in the dips** (order 44): the sunrise's warmest bands at Østensjøvannet showed in the dips
  between the old jagged hills; Østmarka's even line covered them and the glow was gone. They lie along the line now. *Before and after, look at
  what was seen through what you replace.*
- **Pale far things vanish against an evening sky** (order 44): the haze washes toward the sky's own air, so a pale concrete tower in an evening
  level was the sky's colour. Against a low sun it is a dark silhouette. *Draw what stands against the light dark.*
- **A level's middle layer can lie wholly under the view** (order 44): Gamle Oslo's houses of Kampen are drawn below the roofs he walks on, so a
  church among them showed its spire's tip at most; in the farthest layer, nearer than its hills, it is seen. *Look where each layer is on the
  screen before choosing one for a landmark.*
- **bash 5.2 reads `&` in `${var/pattern/replacement}` as the match** (order 44): `${U[@]/\?debug/?debug&faronly}` gave `?debug?debugfaronly`.
  Escape it (`\&`).
- **A background command that keeps a pipe open never ends** (order 44): a build script piped into `grep` started its preview servers with
  `cd ... && nohup ... &`, and the backgrounded subshell held the pipe, so the command never returned. Start servers with `setsid`, all three
  streams redirected.
- **A flat band is a field** (order 44): Korketrekkeren's farthest water, drawn as two flat bands to save copies, filled more than a 250th of what
  the level paints, so the palette test held it as a field, and a paler tone than the plane's came 10.0 off the calm outline; the warning and lights
  tests, which were run, did not look. *After drawing anything broad, run the palette test too, or the whole suite.*
- **The map's far layers have no haze** (order 44): the same far shore the levels share is rawer on the map, and its ochre houses came 9.5 off a
  coin's copper there, where the levels' washed ones did not. *A shared drawing is held where each user shows it.*

- **A "390 x 844" picture at a pixel ratio of 1 is not a phone** (order 45): `tools/shots.ts --size=390x844` gives the page a view of 391 x 845 art
  pixels; a phone at a ratio of 3 shows 293 x 634 (the kit's `viewFor`: the 240-pixel minimum width sets 4 device pixels an art pixel), 271 x 481 at
  360 x 640. Orders 43 and 44 judged the upright far view on the larger view. *Look at an upright frame as a phone shows it: `tools/glance/hand.ts`
  (a pixel ratio of 3, a coarse pointer, the page laid out again), not `shots.ts`.*
- **A comment that says a case is handled can be wrong about what the handling moves** (order 45): `climbed` returned nothing upright because the far
  layers there "are already moved round him", but `farPass` moves only what a layer places by the screen; what it places in the world (every landmark
  of orders 43 and 44) stays at its world height, so from Akershus's walls Rådhuset's towers never showed upright. *Read what a shift moves (here: the
  view's `camY` moved one way and the transform the other) before trusting it covers a case.*
- **The canvases can be read** (order 45): every depth's canvas is at art pixels, and the wrapper page of `hand.ts` is the game's origin, so it can
  read the sky's, each far layer's and the street's alpha row by row: how much of a row the street covers, how much far view shows, how plain a
  row is, exactly, in one load, where order 43 needed a far-only and a sky-only scratch build and three pictures. And `__game.still()` after moving
  `__game.body` sweeps a whole level in one browser (1,525 places in a few minutes).
- **Layers for nothing** (order 45): a gradient's stops can carry thin lines (a stop either side of a pixel), so the ground's layers under him are
  one fill a column group, not a rectangle a layer.
- **A test of pixels upright wants its own small canvas** (order 45): the warning test's walk is 320 x 200; an upright frame is 293 x 634 and its
  bands are what the passes leave. `render/upright.test.ts` composites the sky, the shifted and washed far layers and the street in typed arrays
  (fills, see-through fills, the brush's gradients, `source-atop` for the haze and the tint) and draws each pass once a place, washing it per sky
  (no far layer draws differently under another sky). Time it on a quiet Pi: under the batch of pictures it took twice as long.
- **A test as fast as its process lets it be** (order 45): `render/upright.test.ts` drew its frames in 7 s alone and in 18.7 s in the suite, right after
  `render/reduced.test.ts` (each file's time from `bun test --reporter=junit`; run as a pair, the two showed it at once). Not the heap (a full GC first
  changed nothing), not a stand-in document left behind: the same functions (the kit's `R`, the tiles' drawing, the bot) had been through every kind of
  stand-in canvas there and ran two and a half times slower after. In workers of their own (`render/upright.worker.ts`) the frames take 5.8 s in the suite
  too. *When a test is slow only in company, time it in pairs with the files before it, and put costly drawing in a worker.*
- **`pkill -f` with a pattern in your own command line kills your own shell** (order 45, again, as the playbook says): `pkill -f "bin/final.sh"` in a
  command that also named `bin/final.sh` ended the command itself; the batch's child went on and had to be found by its process number. *Kill by PID.*

- **A lighter dark hides its own lines** (order 46): order 45's layers under the ground were steps of the dark's alpha, which showed over a near-black;
  over ground of nearly their own colour (dark wet earth over earth) they vanished, and the plain runs under him grew from 8 to 16 % of the screen. In
  the material's own tones each line is its own colour (the tone lit, the tone in the joint's shade). *When a band's colour comes nearer what is
  under it, measure the plain runs again.*
- **Water toward the ink passes his tunic** (order 46): the harbour's blue mixed toward the game's ink goes through a navy 6.5 off his tunic; the
  upright test's colour check found 324 such colours at once. Toward a dark teal it keeps 11 or more off. *A dark made by mixing toward the ink
  passes every blue on the way.*
- **A test's walk sees only the size it walks** (order 46): `render/warning.test.ts` walks every level at 320 x 200, so far-layer drawing made only
  for an upright screen (Ekeberg's fjord below the viewpoint) is held by no test; its colours were washed and tinted by hand as that test does
  (`o46/bin/farcheck.ts`), and two came within 10 of a role. *Ask which test sees a new drawing; if none, check it the same way by hand and say so.*
- **A far layer drawn for a view of the usual height leaves what it draws short upright** (found in order 46): Gamlebyen's dawn is drawn in its far
  layer, so upright it ended at that layer's window and the night stood over it with an edge, on origin/main too, since order 45 drew the window
  round him. *Upright, look at every state of a level's sky (dawn, a storm), not only its start.*
- **Three tries as three builds of one switch** (order 46): a scratch constant in the brush picked the try, set with `sed` and built three times into
  three folders served on three ports, so one address list gave the three side by side; the switch was taken out before the first commit.
- **A picture already taken is a picture** (order 46): order 45's final upright pictures were made from the code origin/main has; six taken again
  from origin/main's build were byte-identical, so its 320 served as the before, which saved half an hour of a busy Pi.

## What worked and should be kept

- **A census before a rule** (order 32): drawing every scene as the page does and noting every light with who registered it and what
  is drawn over it turned "are the lights consistent?" into a table of 150 rows in a minute, found the two real faults (a dusk over the
  lamps, pools under the cobbles) at once, and became the test.

- **Drawing as in a browser, in a test** (order 31): with a stand-in `document` whose canvases draw nothing, `kept`, `stamp` and
  `outlined` take their browser path, so a kept piece is drawn once and copied, and the test records a copy by which piece it copies.
  Akershus's stonework took 116 s to record drawn pixel by pixel; as copies it takes seconds, and it is what the page does.

- **A feature gated by a test of the old picture** (order 29): the encore's stop is built only with every rune; with any rune missing
  `kartDef` returns exactly the old map (a test for each of the sixteen), and the map's pictures from the two builds are compared byte
  for byte. "Nothing shows before" became a fact, not a promise.
- **Lines guarded by a hash** (order 29): the story's existing lines must not change, so the encore's words are a block appended to the
  file and a test holds everything above the block to its sha256 on `origin/main`.

- **A colour rule tried before it is set** (order 28): "no prop nearer a role than its old drawing" sounded right and forbade any lit tone on
  grey metal (every lighter grey comes nearer his helmet). Measuring first turned it into "no nearer than its level's flat props, or than
  10", which still caught real things (a lit ochre near his skin, the kiosk door's panel near a coin's copper) and let iron have a lit edge.

- **Quoting Lars exactly** in orders, ADRs and messages to implementers.
- **"Look first"** as section 1 of every order: a table of the present state before any change.
- **Byte-identical gates**: the front page's 28 pictures; sloppy run files on named seeds. They
  turn "nothing else changed" from a claim into a fact.
- **The palette test** (`render/palette.test.ts`): colour rules as numbers, with the nearest
  pair named when it fails. It is why four rounds of repainting broke nothing.
- **Asking each implementer for "what only a person can judge"**: an honest list of what the
  Pi cannot check.
- **A study before a big choice** (the grain): three ways built far enough to photograph, with
  costs, on a page Lars could look at. He chose in one sentence.
- **Research with numbers**: measuring three reference games and our own the same way turned
  "the pixels are too big" into "the pixels are fine; tones, frames and texture are missing".
- **Offering a recommendation, not a menu.** Lars answers a clear "I'd do B, because" faster
  than a list of options, and overrules it happily when he disagrees.
- **Taking his joke seriously.** "80s glam invaders" was a throwaway; treating it as a real
  proposal, and finding the word that joined it to the other idea, got the best reaction of
  the whole project.
- **Telling him what did not go as said**, at the top of the message, before he finds it.

## For the next planner, about Lars

- He plays on a phone and looks at pictures. Give him addresses and pages, not paths.
- He writes in bursts of one line. Each line is a work item; none is idle chat. Answer the
  line, say where it went (this round or next), keep going.
- He changes his mind mid-thought ("The neon invaders" … "no sorry, you bewitched idea is
  kinda cool"). Do not build on the first half until the second arrives; when it does, look
  for the version that keeps both.
- He trusts and delegates ("I trust you. Be a game designer"). The price of that trust is
  saying plainly what is unverified and what you got wrong.
- He cares about the Pi: memory, stale processes, tidiness.
- He wants documentation thorough enough that this conversation is not needed again.
