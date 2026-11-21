# 0052. The encore: Loki met once, as an extra that gates nothing

Decided 2026-11-17 by the planner (order 29, "the encore"), with Lars away and his standing words: "I trust you. Be a game
designer, plan out something amazing" and "im giving you permission to continuosly merge and deploy all improvements". Carried
out by the order 29 implementer. Amends [0050](0050-the-glamour.md) ("Loki is not met yet"); within
[0040](0040-felt-at-a-glance.md) (every tell seen first), [0044](0044-paint-says-where-to-go.md) (red hurts, yellow is where to
stand, violet is "now"), [0017](0017-game-over-at-a-boss.md) and [0033](0033-a-lost-life-at-a-boss.md) (the bench before a boss).

## Context
Order 27 told a story and stopped short of its front man: Loki was a poster and a silhouette, and line 2's ending card says the
glamour lifts and Loki keeps the money. The roadmap's first idea was to meet him once, after everything else is done, as an
encore. Nothing that exists may depend on it, be gated by it or change because of it.

## Decision
- **Where and when.** With every rune of both lines held, line 2's viaduct runs on past the longship to one more stop:
  **Middelalderparken**, a small festival stage on a pontoon in the park's water mirror. It is true of the place: the medieval
  park in Gamlebyen held Oslo's big summer festival for years before it moved to Tøyen, and the water mirror lies where the
  shore was in the Middle Ages. Before every rune is held, nothing of it shows: the map, its doors and its pictures are what they
  were (`levels/kart.ts`: `kartMap(open, encore)`, the door only with `allRunes`; held by `levels/encore.test.ts` for every
  set with one rune missing, and by pictures compared byte for byte).
- **What it counts.** It is a door like any other and can be played again. It has no rune (its `rune` is -1, no `r` on its map),
  is not a station of either line (`ENCORE_STOP` beside `LINE`, not in it), opens nothing, and keeps one thing: its best time,
  as `best.encore` in the save (a seen encore is one with a best time; the map draws its stage plain from then on). No total,
  no count of runes, no line's added-up time reads it.
- **How it ends.** The boss slot gains `ends()`: when Loki has gone, the clock stops as at a rune (`play.ts`), and the page shows
  the card with the time, the best and the encore's ending line (`main.ts`: the `gone` event; the card's title is the place's
  landmark where a level has no rune).
- **How Loki fights: other people's moves.** He is a trickster, so each round he puts on the glamour of one of the three bosses'
  moves, drawn in his own neon, with that boss's own tell and its own answer, which the player already knows:
  - *the club* (the troll's): he struts up, raises a club over his head for a full second (60 steps, the troll's), slams it; a
    wave runs out along the floor both ways (the troll's numbers). Answer: jump as it comes down.
  - *the charge* (the plough's): he struts to a run-up seven tiles off, goes down on one knee and revs for a full second (60 steps,
    the plough's: beacons on his shoulders in the violet, a guitar held out like a blade, backing up a little), then slides on
    his knees to five tiles past where he stood. Answer: up on a speaker stack.
  - *the bite* (the serpent's): he struts near and spreads his arms; a ring of neon foam runs after the player for three quarters
    of a second and then holds for as long again (90 steps, the serpent's ring); jaws come up out of it. Answer: be out of it.
  Between attacks he **poses**, two and a half seconds, marked with violet stars as the serpent's dazed head is: the only time a
  stomp is a hit. Each hit's next round brings in the next move (the club, then the charge, then the bite); a round with no hit
  goes on to the next of the moves he has shown, so a player who misses the opening must recognise which is coming.
- **Each hit knocks a piece off**: the hair (a wig), the shades, the jacket (and with it the rest of the glam). After the third he
  is a thin man in a grey wool sweater with a thermos; he shrugs, says his line and walks off by the nearer wing. The stage's
  lights go a plain warm white and stop sweeping, the neon goes dark, the mirror ball stops. Nobody dies.
- **Hearts and the shield work as anywhere.** His body hurts while he struts at him, raises the club or slides (the red outline);
  revving, conjuring, posing and plain it does not (the pale outline). Landing on him while his body hurts is a hurt, any other
  time but the pose a bounce. The shield holds off his strut (he tells there and then) and his slide (he skids and poses); it
  does not stop the club, the wave or the jaws (from above or below, as at the troll and the serpent). A lost life sends him back
  to his mark with his hits kept and puts the player at the bench before the stage (ADR 0033); a Game over goes on from it (0017).
- **Difficulty**: no harder than the serpent. The sloppy player clears it on every one of 60 fresh seeds at ±2 and at ±4
  (`apps/viking/tools/review/o29/`).
- **Sound and motion**: his tells sound as the bosses' (the growl, the rev, the rear); his pose strikes one chord, the jaws snap,
  a piece coming off glitters, the stage going plain sighs (`render/feel.ts`, the synth only). Nothing flashes faster than three
  times a second (the beacons twice); with reduced motion the lights hold still, the ball does not turn, the beacons stay lit, the
  pieces do not fly and the stars over his pose stand still.

## The limits of the story (ADR 0050's, restated; not chosen here and not loosened)
- The story's existing lines are as they were; the encore's are a block of their own at the end of `game/story.ts`, both
  languages, with alternatives beside them (a test holds everything above the block to its hash on `origin/main`).
- Loki is the mythological trickster dressed as an 80s front man: big hair teased into two points, wraparound shades, a jacket
  with shoulder pads, a mic, a guitar. He is nobody real: no real performer's likeness, costume, pose, logo, band name, song,
  lyric or nameable melody. His one chord is a fifth over a low root, struck once.
- The man who paid is not named again, drawn, present or quoted. The encore's words refer to neither the invoice nor the client.
  No new joke about any real person.
- Nobody dies: Loki loses his glamour and leaves, like everyone else.

## Not chosen
- **A final boss that gates the ending**: the order makes it extra. Line 2's ending, the longship and the lanterns are as they were.
- **Loki's own new moves**: a fourth set of answers to learn at the very end; borrowing the bosses' is the joke and the test.
- **A rune for the encore, or a seventeenth slot**: it would change every count the header and the card keep.
- **A stomp at any time**: the troll, the plough and the serpent each have their opening; his pose is his.
- **Horns**: the poster's silhouette has two points; on stage they are his hair, not a helmet, so nothing evokes a film's costume.

## Consequences
- `LevelDef` can be a level with no rune (`rune: -1`, `cardLine` for its card's last line); `Boss.ends`; the encore's chunk
  (`levels/encore.ts`, `game/loki.ts`, `render/loki.ts`) is fetched only when he goes in. The first script grew by about 0.27 kB
  (59.07 to 59.34).
- The review's tools play it (`tools/review/common.ts`: with the pole and the shield); `tools/glance/loki.ts` draws his sheet.

## Amended by order 30 (21 November 2026)
Three of the encore's "found and not fixed", drawing and fetching only, nothing of it with a rune missing: its stop on the map
keeps its neon's light after dark, with a glow of its first neon round the tubes, until the encore is seen; Loki's club is drawn
at the troll's size (a knobbed head seven pixels across, a haft three thick; raised, all of it the tell's violet), its tell's
length and the blow's box as they were; and with every rune the map fetches the encore's file when the page is idle, so its first
visit has no board (`ahead` in `levels/kart.ts`, held by `levels/encore.test.ts`).
