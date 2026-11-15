# Order 19: what every event looks and sounds like now

The same events, staged the same way (`tools/glance/events.tsv`), on this branch; the strips are
`/tmp/shots-felt/after/<event>_<sky>_<width>.png`, and a few with reduced motion in `/tmp/shots-felt/after-reduced/`.
The sounds are the page's own (`VOICES` in `src/render/feel.ts`) or the kit's named ones (`kit:`). What answers
is drawn after the night's tint, so it reads the same by day and at night; where the night or the narrow screen
differs, it is said.

Two things hold for every event now: **the rules never stop** (the page's two-step freeze after a stomp or a hit
is gone; what holds after a hit is the picture, four steps, drawing only, and `feel.test.ts` holds the play the
same step for step), and **every answer is at the thing**, in its role's colour (ADR 0039, 0040).

| Event | Seen in the half second after | Heard | Reduced motion |
|---|---|---|---|
| He is hit | He flashes the hurt red for 3 steps and the picture holds 4 (drawing only); six red and pale sparks from him; the view jumps 2 px; the lost heart breaks in two in the header and its halves fall apart, the others swell once; then he blinks a pale figure every 5 steps, which reads on the night's dark as on the day's sky | `hurt` | No flash, hold or jump; a still red ring round him for half a second, the broken heart shown still; a still pale outline while he cannot be hurt |
| One heart left | The last heart in the header keeps a slow pulse (a second round) | | A still red glow round it |
| He stomps an enemy | It is squashed flat in its own shape and colours (a third as tall, a half again as wide, its outline under it), then puffs in its own two commonest colours; its skilling rises; two motes of dust off its back as he bounces; view jumps 2 px | `stomp` (a thump, a squeak up) | Squashed and held flat a quarter second, no puff or jump |
| A stomp that does not kill (the plough reeling) | A hard white spark and a small white ring under his feet; no squash | `dud`: two dry high ticks, no noise | The ring stands still |
| He takes a skilling | A copper ring opens where it was, four glints; the header's count swells and turns copper | `kit:coin`, climbing | The ring at its full size; the count only turns copper |
| He takes the cheese | The slice rises from where it lay and fades; cheese-coloured sparks; the lives count swells and turns green | `kit:life` | The lives count turns green |
| He takes a bracteate | It rises from where it was with a four-pointed glint on and off, a gold ring and sparks; the gold count swells | `kit:gold` | It stands a little up, glint steady |
| The feather lands on his shoulder (on the map) | A white ring and feather-coloured glints as it comes to rest | `feather`: three high notes | The ring stands |
| The pole (Holmenkollen's rune, first time) | The ski pole stands up out of the snow beside him with a glint, as the rune flies | `pole`: a swish and a rising note | It stands there at once |
| The shield is given | A gold ring and sparks round him, his words | `kit:fanfare` | The ring stands |
| The shield turns a thrown thing | A hard white and iron spark and a small ring at the shield's face | `block`: a high metallic clang | The ring stands |
| A flag goes up | A white ring at the top of its pole; a second later the tick appears with its own ring | `kit:flag`, then `tick` | Tick at once, rings stand |
| He sits on a bench | A white ring round the bench; the hearts fill one by one in the header, each swelling as it comes; the bench keeps a tick at the end of its back for the rest of the level | `kit:bench`, then a `heart` blip for each | The hearts fill one by one without swelling |
| He takes a rune | A gold ring where it was, the flight, the card | `kit:pickup` | The ring stands |
| He lands from a fall of more than three tiles | Eight motes of dust and earth thrown up; the view jumps 1 px. A jump's landing: two motes | `thud` (low); a jump's landing `land` | No dust, no jump |
| He falls in water | A splash in the water's foam and blue where he went in, a ring on the water; a ring closing on him where he is put back; the heart breaks | `splash` | The rings stand |
| He falls in a pit | Dust and earth off the pit's edge falling in after him; the ring where he is put back | `pit`: a falling whoosh, not a splash | The ring stands |
| He loses a life | The heart breaks; the lives count swells and turns red; once it has broken the hearts fill one by one; a ring closes on him | `hurt`, `lifeLost` (three falling notes) | Counts take their colour, no swelling |
| Game over | The last heart breaks; the card | `kit:over` | as it is |
| A ledge on a beat is about to go | The warning shimmer, and the ledge and its standing top tremble a pixel to and fro for the second | `rattle` when near him | The shimmer holds still; the top's dashes join |
| ... and goes | A few lavender crumbs fall where it was | `crumble` when near him | No crumbs |
| A pad, a bundle or the sinking stone is about to sink | It and its standing top tremble for its last half second under him | | Its dashes join |
| ... and starts to sink | Foam bubbles at his feet | `glug` | No bubbles |
| A lift or a train arrives | Two motes of dust at its ends | `arrive` (a clunk) | No dust |
| ... and is about to leave | Two thirds of a second before, its whole standing top flashes the moving violet | `leave` (a ding-dong) | The violet top steady |
| A statue wakes / freezes | Wakes: dust at its feet, its walking pose (46 pixels of outline unlike its stone pose); freezes: a ring closing on it | `wake` (a grind) / `freeze` (a clack) | Rings stand, no dust |
| A woken guard (Gamlebyen) | Its halberd, upright as a statue, is levelled at him (23 pixels of outline; it was 0) | `wake` | as it is |
| A thrower winds up | A second's wind-up in a pose 18 pixels or more of outline unlike its rest: the gull rears (head up, wing lifted, chip high), the slinger's arm goes up with the sling, the archer's bow comes up drawn with his arm back, the ring-thrower's arm goes up with its ring (tested for all eleven) | | as it is |
| ... and throws | The throw flies | `throw` (a whoosh) | as it is |
| A swan turns on him | Its neck down (114 pixels of outline unlike its calm), a red ring on it | `hiss`; when it comes, `honk` | The ring stands |
| A door opens | The door opens, he walks in; every door is marked at its corners in the use cyan, and the bubble "↑ Go in" is framed in it | `kit:door` | as it is |
| The troll's tell | The club up in violet (its glint steady with reduced motion), a violet ring at it | `growl` | The ring stands, the glint does not blink |
| The troll is hit | Violet and white sparks; the picture holds 4 steps | `bossHit` | No hold |
| The troll is beaten | Gold and violet sparks | `kit:fanfare` | |
| The plough's tell | It revs, blade and beacons violet; a violet ring at its cab | `rev` (a rising engine) | The ring stands |
| The plough is hit | Violet and white sparks and a violet ring at its cab; the hold | `bossHit` | No hold |
| The plough is beaten | Gold and violet sparks | `kit:fanfare` | |
| The serpent's tell | It rears, its throat violet; a violet ring at its head | `rear` (a rising hiss over a rising tone: not the plough's) | The ring stands |
| The serpent is hit | Violet and white sparks and a ring at its head; the hold | `bossHit` | No hold |
| The serpent is beaten | Gold and violet sparks, then its dawn | `kit:fanfare` | |
| A station's stone, cleared the first time (on the map) | A gold ring and sparkles round the stone with its tick | `stone` (three high notes) | The ring stands |
| The station it opened | Half a second later a ring closes on its door | `open` (three rising notes) | The ring stands |
| Line 2 opens | The same at Bygdøy's door, then a second rising phrase | `open`, `rise` | |

## By rule

1. Every event in the table answers within two frames where it happened, in its role's colour, with a sound.
2. The hit: flash, hold (drawing only), breaking heart, swelling hearts, a blink that reads after dark, the last
   heart's pulse.
3. The stomp in the enemy's own shape and colours; the dud stomp a spark and two ticks.
4. Every pickup has its moment; the bench fills hearts one by one (the cheese is a life, not hearts).
5. Everything that gives way trembles; every thrower's and every changing statue's, guard's and swan's outline
   changes by 18 pixels or more; no timing changed. What had no room for a tell: nothing that gives way or
   throws lacked lead time. Two have no picture before they happen: a carrier arriving (it is not a danger,
   it is answered as it comes), and the sledgers that set off at Korketrekkeren (they were not asked for).
6. A splash for water, dust for a pit, each where he went in.
7. Ticks on flags and benches; the stone's flourish once.
8. Reduced motion: no shake, no hold, no particles, nothing blinking three times a second (the ledges' shimmer,
   Holmenkollen's cracks and the troll's glint hold still); every event has a still ring, tick or held pose.
9. Forty particles at most, from pools made once; the fireworks thirteen to a burst.
10. 40 events, each with its sound; the page's own sounds all different; a hit, a stomp, a block and a dud differ
    in at least two of register, direction, noise and length.

## The rules did not change, and the frame costs little more

The sloppy player (`fresh.ts`, ADR 0034) on seeds 201 to 260, ±2 and ±4, on order 18's code and on this branch
(at `6d67aaf`, each from a worktree): every run's record (outcome, hearts lost with where and when, time) is
byte-identical on Akershus (md5 5a1eac08e46e, 0.52 / 1.00 hearts a run), Bygdøy (9e982a3ca1bf, 0.40 / 0.80),
Nordmarka (58bfcf501657, 0.65 / 2.00) and Gamlebyen (54db73ff6304, 0.47 / 1.07): the same as order 18's hand-back.

`?debug&perf&on=<event>&skip=6` at 390 x 844, with a stomp's answers (Bygdøy: a block's) in the air, rectangles a
frame, order 18 then order 19: Akershus day 7938 / 7961, night 9276 / 9344; Bygdøy day 22357 / 22359, night
23354 / 23398; Stortinget day 27412 / 27374, night 28528 / 28534 (at most 68 more; 300 allowed).
