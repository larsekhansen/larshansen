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
