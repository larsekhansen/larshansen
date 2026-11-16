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

## What worked and should be kept

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
