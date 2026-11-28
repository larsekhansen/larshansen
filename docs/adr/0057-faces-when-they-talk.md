# 0057. Faces when they talk: a large portrait of who speaks, beside the words

Decided 2026-11-28 by Lars, carried out by the order 47 implementer (`docs/games/orders/47-what-lars-said-second.md`); how it looks
and where it stands are the implementer's, within the order. Within [0050](0050-the-glamour.md) and [0052](0052-the-encore.md) (the
story's limits, which stand), [0043](0043-the-game-in-the-hand.md) (the phone), [0036](0036-drawn-once-and-copied.md) and
[0035](0035-the-budget-enforced.md).

## Context

Lars, 28 November, of Loki's outfit (relayed by his other session; `docs/games/handbook/conversations.md`): "the general glam style
is close enough (as built)", and: "I do want more detail though. Now it reads more as just... Colorful I guess. Maybe when he talks
you can make a more detailed version of his face, like they do in many pixel games. Maybe with over the top emoting like JoJo's
Adventures or Ace Attorney. It fits the theme." Then: "Right. So the bigger face panels when talking. And more detail on the
character anyway. And the dichotomy."

A figure in a level is 14 to 46 art pixels tall and must read at a glance as what it does; a face there is a few pixels. The genre he
names puts a large portrait of whoever speaks beside the words, with an expression for each line, and pushes the expressions as far
as the theatre allows.

## Decision

- **Who has a panel.** A line said by a character in his own voice. In this game that is Loki at the encore: his greeting as he
  wakes, his three lines as the wig, the shades and the jacket come off, his leaving line, and the four lines he shouts with the
  tune. Narration keeps its bubble: the hints (which tell the player what to do), the bosses' lines (a narrator's, about the troll,
  the plough and the serpent: none of the three speaks), the signs, the lines over him when he is given the shield or the feather
  (the game's, said to him). The list of every place where someone speaks is in `apps/viking/tools/review/o47/after.md`.
- **What it is.** Two portraits 56 art pixels square (48 where a short screen needs it, the middle of each, never shrunk) and the
  words between them in a box as a bubble's (dark on white, a thin line of the game's dark round it): Loki's on the left, facing
  right; the one he speaks to, the hero, on the right, facing him, quiet where Loki is loud. The two side by side is the game's
  contrast, calm Nordic Oslo against the loud glamour ([0058](0058-calm-oslo-loud-glamour.md)). Where a screen has room for only one,
  the speaker's alone.
- **The portraits** (`apps/viking/src/render/faces.ts`) are the game's own characters in its own grain (ADR 0045): a ramp of tones a
  material, the light from the top left, the game's near-black round the figure and its features, a backdrop of their own (Loki's
  stage, its rays and stars; the hero's winter evening over a fjord). Loki has six expressions, smug, delighted, outraged, wounded,
  scheming and a shout, each at the four stages of the fight (glammed, the wig gone, the shades gone, plain), as large as the theatre
  allows: big brows, eyes and mouth, his head forward for a shout or drawn back when hurt, shock lines, sparkles, a sweat drop, gloom,
  speed lines behind a shout. Glammed he is the glamour to the last pixel: the teased wig in hot pink and magenta with its lime streak
  and headband, wraparound shades, purple lids and a liner's wing, a lime star under his eye, the leopard jacket with white pads and the
  magenta shirt. Plain he is a thin man in a grey sweater in front of a stage with its lights off. The hero has four, calm,
  surprised, set and pleased: his iron helmet with its white wool pompom, his knit sweater, his cape; no beard (his face and a beard
  wait for Lars's word, and the portrait follows the figure).
- **Which expression goes with which line** is a tag beside the line, in `game/story.ts` below the encore's block
  (`ENCORE_FACES`): Loki's and the hero's, the same in both languages. No word changed.
- **Where it stands.** Clear of the play he must see while the line shows, of the touch pad and of a notch, on both orientations:
  under the stage's floor (the water mirror, which he never needs) across the screen over the pad's controls, or between the controls
  at the left and at the right; failing that, under the bar if what he must see (Loki with the club raised, the stars over his pose,
  him on a speaker) is lower; failing both, the page keeps its bubble. It keeps the room it found for a line while the line is up,
  so it does not jump when he does. It never pauses anything that the words do not pause now (nothing).
- **How it comes and goes.** It slides in from the screen's sides over eight steps and out over the line's last six; a shout has a
  flash behind Loki once as it starts (a fifth of a second). With reduced motion it appears and goes: no slide, no flash.
- **Cost.** Each portrait is painted once into a canvas of its own and copied (0036); a frame with a panel adds two copies, a few
  filled shapes and its lines of words, on the words' canvas, which no rectangle count of the picture includes. The portraits and the
  panel come with the encore's file (`vite.config.ts`), fetched with it before Loki can speak, so a panel is whole on the first frame
  its line is up; the first script carries only the page's call to the level's hook.

## The limits on likeness

The portraits are nobody real: no real performer's, band's or any other game's character's face, costume, pose, logo or likeness.
The genre Lars names gave the idea (a big face beside the words, pushed expressions), not a look: the drawing is this game's, its
pixels, its palette, its characters. The man who paid is not drawn, named or quoted in any of it (0050, 0052). Nothing cruel: Loki is
laughed at for his vanity and his wig, as before.

## How to turn it off

The encore's level drops its `talk` (one line in `apps/viking/src/levels/encore.ts`): the page draws every line in its bubble
again, as before order 47. A line drops its panel when its tag is taken out of `ENCORE_FACES`.

## Held by

`apps/viking/src/render/talk.test.ts`: every tagged expression exists for its speaker and every tagged line in both languages; every
line he says in his own voice has a tag and no hint has one; the panel overlaps no control of the pad, keeps off a notch, the home bar
and the bar, and off the play over the stage's floor, at 390 x 844, 844 x 390, 360 x 640 and 667 x 375 with every notch the harness
pretends and wherever the floor is; where the page puts the floor every line has its panel; with reduced motion it is drawn the same
at every step of a line (and without, it is not); every portrait whole and each expression its own; glammed he is in the glamour's
neon, plain none of it is on him. Each shown to fail on a planted fault.

## Not chosen

- **A portrait over the play**, or the words left in the bubble beside him with a portrait somewhere else: the order wanted the face
  beside the words.
- **Boss portraits for narration**: the troll, the plough and the serpent do not speak; a face beside a narrator's line would put
  words in their mouths. Left for a decision if their lines are ever written in their own voices.
- **A mouth that moves with the words**: motion nobody asked for, and nothing a player needs.
- **A name tag** ("Loki"): the face says who speaks, and a new word in two languages was not asked for.
- **The maze's raven and mound-dweller**: they speak in the maze's own page and package; left for later (`o47/after.md`).

## Consequences

- `LevelDef.talk` (a level's talk panel) and `EnemyDef` unchanged by it; the page hands the hook the line up now, what the music has him
  shout, the bar's foot and the pad's controls. `?debug&say=<key>` shows a line as if it came up a second before (`&sayage=0` for its
  first frame).
- The first script grew by the page's call to the hook (with order 47's other changes, under 400 bytes: `o47/after.md`).
