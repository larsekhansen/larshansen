# 0040. Every event answers at once, and the hold after a hit is the picture's only

Decided 2026-11-15 by the planner (order 19), after Lars said of order 18's direction "do more design
polishing like that". Carried out by the order 19 implementer. Builds on [0039](0039-colour-says-what-a-thing-is.md):
order 18 made things readable while they stand still; this makes what just happened readable.

## Context
Before order 19 many events were silent or invisible, or answered somewhere else: a block sounded like a
stomp, a dud stomp on a reeling boss made no sound and showed nothing, a splash's foam appeared at the flag
he was put back at rather than where he went in, a pit splashed like water, nothing throws a sound, a lost
heart only went faint in the header, his blink was a dark ghost on a dark night, and a pad or a bundle went
under with no tell. The page also stopped the rules for two steps after every stomp and hit (a "freeze"),
so the page and the tests did not quite run the same game.

## Decision
- **The rules.** Every event answers within two frames, where it happened, in its role's colour (ADR 0039):
  a hit in the hurt red, a pickup in copper and gold, a boss in the "now" violet, a thing done with the tick,
  a thing to use in the use cyan; with a sound from the kit's synth, each its own, the near ones told apart
  with eyes shut (a hit falls, a stomp thumps and squeaks up, a block clangs high, a dud stomp ticks twice with
  no noise); and under reduced motion with a still answer (a ring that stands, a tick, a held pose). The
  rules, the list of events and their answers are in DESIGN's "What just happened".
- **Pictures only.** No box, speed, timing or route changed. The answers live in `render/feel.ts`, which reads
  the play and its events and draws and sounds; it never writes to the rules. A test runs a staged hit, and
  every level's scripted route, with and without the answers and holds the two plays identical step for
  step; the sloppy player's runs on four levels (seeds 201 to 260) are byte-identical before and after.
- **The hold after a hit is drawing only.** For four steps after a hit (and a boss hit) the picture holds
  the frame of the hit: the page draws nothing new, while the rules step on as always. The old freeze of
  the rules in the page is gone, so the page now plays exactly the game the tests play. With reduced motion
  there is no hold and no shake.
- **What is about to happen is seen first, in its outline.** Whatever gives way trembles first (a pixel to
  and fro: ledges on a beat through their warning, a pad, a bundle or the sinking stone in its last half
  second, the heron about to fly; with reduced motion its standing top's dashes join instead). Every
  thrower's wind-up (a second) changes its outline by 18 pixels or more; a woken statue, a woken guard and a
  swan turning on him change outline too (tested). A lift or a train about to set off flashes its moving
  stripe for two thirds of a second and rings a ding-dong. Nothing had to be retimed: every tell fits the
  lead time already there.
- **Things done stay done**: a raised flag's tick pops in with a ring and a sound; a bench he has sat on
  keeps a tick; a cleared station's stone arrives with a flourish the first time only, and the station it
  opened answers.
- **Cheap.** Forty particles at most, plain rectangles, from pools made once; six rings of twelve points;
  nothing the answers do in a frame makes anything new (the one exception: the kit's carrier positions,
  asked for carriers near him). At 390 x 844 with effects in the air Akershus, Stortinget and Bygdøy draw
  at most 68 rectangles a frame more than order 18's code at the same moment (300 allowed).
- **First script.** `render/feel.ts` is a chunk of its own, fetched with the first scene (a scene opens
  without it if it does not come). It pays for itself: the page's old sparks, the beaten enemies' puff and
  the freeze moved into it, and the first script went from 59.72 to 59.43 kB (`feel.ts` is 8.0 kB gzipped on its own).
- **Things to use** (left from order 18): doors, benches and signs are one family, marked at their four
  corners in one cyan (`ROLES.use`), and the bubble that names the key is framed in it; held off every field
  and every role by the palette test. **His blue after dusk** (left from order 18): the evening's water comes
  within 5 to 7 of his tunic; what tells him apart there is a warm rim drawn round him under every sky but
  the day's, tested 14.2 or more off every tinted field.

## Consequences
- A new event, or a new level's own, gets its answer in `render/feel.ts` and its sound in `VOICES` and
  `SOUND_OF`; the test holds every sound different and the near ones apart.
- The kit's synth has an opt-in `voice()`, a sound given as its parts; the front page's sounds are as they
  were. The kit's warning shimmer on a ledge holds still under reduced motion (the viking game alone uses it).
- `Events.dud`: a bounce off a boss that cannot be hurt just now. It reports; it changes nothing.

## Not chosen
- A hit-stop of the rules (a real freeze): it would make the page a different game from the tests, and every
  number the review keeps would stop meaning what it says.
- Answers drawn by each level: the same event would look different from level to level.
- Flash on every event: under reduced motion every flash is a still mark instead, and nothing blinks three
  times a second.
