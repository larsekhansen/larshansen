# 0043. The game in the hand: on a phone the screen is the game's, and the pad lies over it

Decided 2026-11-16 by the order 21 implementer, on the planner's order (order 21, "in the hand"), after Lars said
of orders 18 to 20 "i like what i see. keep going". He plays on a phone. Builds on [0019](0019-the-view-on-an-upright-phone.md);
adjusts [0021](0021-the-upright-view-stands-him-two-thirds-down.md) (on a touch screen the two thirds are counted from
the pad); keeps [0015](0015-solid-header-in-viking.md)'s solid bar.

## Context
Measured before the change (`apps/viking/tools/review/o21/before.md`, every screen state at 360 x 640, 390 x 844 and
430 x 932 upright and 844 x 390 and 932 x 430 on its side, at a pixel ratio of 3 with a coarse pointer):

- The game's picture got 63 to 74 % of the height upright and 55 to 60 % on its side: the bar was four rows upright
  (144 px: the name, the links, the runes, the run) and two on its side (75 to 78 px), and the touch pad a solid band
  of 96 px under the picture.
- Of the touch targets, the links were 19 to 22 px tall and 3 to 6 px apart, restart and sound 30 x 30; the pad's
  buttons were 64 px tall, but at 360 x 640 with five of them the jump was 54 px wide and ran 6 px off the screen.
  Left and right were two buttons, each holding its finger (pointer capture) even when it slid off.
- Vålerenga's tenth-rune card ran under the pad at 360 x 640.
- On a touch screen the help line never showed, so the shield given, the sledge mounted and the pole were never said there.

## Decision
On a touch screen (`(pointer: coarse)`, or `?debug&touch` to look at it without one):

1. **The game gets the screen.** The stage fills the window; nothing solid lies under the picture. While a level is
   on and the window is under 1024 x 600, the bar is the run alone (the runes, the clock, the hearts, the lives, the
   skilling, the sound): the name, the site's links, the gold count and the restart fold away (the body's `playing`
   class). Upright it is two rows (85 px), on its side one thin row (39 px). On the map and on a card the links are
   whole again.
2. **The help line is for keyboards.** On a touch screen it is only a note of what just changed (the pole, the shield,
   the sledge mounted or left), in the pad's words (`PAD_WORDS` in `render/pad.ts`), for five seconds, at most two
   lines at 360 wide, placed under the bar (and the banner) or else just over the pad, wherever it covers neither him
   nor the ground ahead of him; with nowhere clear it waits.
3. **The banner does not sit on what matters.** It stands where it always stood, or right under the bar; if both
   places would cover him, an enemy, something thrown or something to take, it has gone (every screen, not only phones).
4. **Buttons fit thumbs** (`padLayout`): the move pad (one wide control: the half under the finger is the way he
   walks, and the finger slides across without lifting) in the bottom left corner; the jump, the biggest, in the
   bottom right corner and the lowest there; the dash to its left a little higher; and one slot that says what up or
   down does here (Go in at a door, Sit at a bench, Shield where he has it, Duck on the sledge, Go in dimmed where
   there is nothing to do: the order's "the shield (or Duck on the sledge, Up at a door)"), over the move pad upright
   (the left thumb walks, or does up and down where he cannot walk) and over the jump on its side. Every target
   56 x 56 CSS pixels or more, 8 or more apart, inside
   `env(safe-area-inset-*)`; the bar's buttons and links are 56 x 56 targets with their look at the top, the card's
   buttons 56 tall. A control with nothing to do now is dimmed: the dash resting or spent, the shield in the air, the
   way in with no door or bench.
5. **A button answers the thumb.** Each finger is followed on its own (`createThumbs`, `wireThumbs`): it holds the
   control it went down on while it is over it; sliding off lets go, sliding back holds again; a control is held while
   any finger holds it, so a second finger never cancels the first and lifting one never lets go of the other's. The
   screen turning, the window losing focus or the page being hidden lets go of everything. Pressed shows in the event
   that pressed it, with no transition. Tested with synthetic pointer events (`render/pad.test.ts`).
6. **The pad does not hide the game.** The buttons are see-through over the picture. The camera (`roomy` in
   `game/frame.ts`) stands him at most two thirds of the way down the screen above the pad's bottom row (ADR 0021's
   two thirds, counted from the pad's top; the map's bottom row goes on down under him), so the pad lies over ground
   he has passed. Where he still comes under a button (near a level's ends, where the camera stops, or under the
   raised slot) it lifts him just above it, easing from a tile and a half before and leading a fall by the camera's
   own lag, and it never lets him be under one. Tested along every level's scripted route at the five sizes, three
   pixel ratios, with and without a notch (`game/frame.test.ts`), with the camera never moving more than 24 px in a
   frame beyond its own motion (without a notch).
7. **Nothing else moves the page** while a level is on: the stage takes no panning, zooming or double-tap
   (`touch-action: none`), the page no selection or callout; `touch-action: manipulation` everywhere (no 300 ms
   delay); a card scrolls if the screen cannot hold it, and never goes under the bar.
8. **Turning the phone** lets go of every finger and lays everything out again; the level goes on.
9. **The buttons are furniture**: greys and white, see-through; none of the roles' colours (ADR 0039); nothing on
   them moves by itself.

The pad's code and the camera's room for it are a chunk of their own (`render/pad.ts`, `game/frame.ts`, 3.1 kB
gzipped), fetched on a touch screen only, with the first scene; the first script went from 59.00 to 59.47 kB. The kit gained `viewFor` (the stage's sizing, pure, for the tests) and `platedRect` (where the plated banner
stands); the front page is byte-identical. A desktop with a mouse is unchanged.

## Consequences
- After (`o21/after.md`): the picture gets 87 to 91 % of the height in a level upright and 90 to 91 % on its side;
  68 to 86 % upright on the map and on a card, where the links are whole. No target under 56 x 56; the nearest two
  10 px apart on the pad, 8 between the links (two by two under 420 px) and between a card's buttons. Nothing measured had him or the ground ahead under a button, the banner
  over anything, or a key named on a touch screen.
- Without a restart in the bar during a level on a phone, a level starts again from the Game over card, or by going
  out to the map and in again.
- On its side the stage is now the window's whole height, so the kit's sizing (about 192 art pixels high) draws the
  game larger there: 2 CSS pixels to an art pixel at a pixel ratio of 3 where it was 1.33, 26 tiles across 844 px
  instead of 40. Upright the scale is unchanged (the 240-pixel width, ADR 0019, decides it).
- He stands higher on the screen than before (upright about half way down at 360 x 640 and 390 x 844 instead of two
  thirds), with the ground he has passed under the pad. Near a level's ends the camera stands him higher still, over
  the buttons (at most 118 to 138 px more on its side, at Gamlebyen's start).
- With a notch on its side (insets of 47 px each side) the pad stands further in: a turn on landing beside the dash
  jumps the camera up to 72 px in a frame, 17 frames in all sixteen routes, most in the bosses' fights.
- None of it has been touched by a person: synthetic pointer events and pictures in a headless browser only.

## Not chosen
- Hiding the pad's buttons that have nothing to do: a button that comes and goes moves under a thumb looking for it.
  Dimmed, every button stays where the thumb learned it.
- A way-in button of its own over the move pad on its side: a level starts there, so the camera had to stand him
  160 px higher at every start. Lifting him only at the last moment (the first try): 34 % of the steps on its side
  were lifted, by jumps of up to 80 px in a frame where he turned or fell near a button.
- A solid band for the pad under the picture, as before: on its side it took a quarter of the height.
- A menu button for the site's links during a level: the order folds them away and brings them back on the map and
  the cards, where a player looks up.
- Letting the camera go past a level's ends so he never stands over a button: it would show what the levels do not draw.

## Amended by order 31 (21 November 2026)
"A card ... never goes under the bar" held on a touch screen only, because only the pad gave CSS the bar's height (`--bar`). With
a mouse in a window as narrow as a phone the header wraps its runes to two rows and covered a card's top. The page's camera now
sets `--bar` every frame on any screen, and the game's own cards (a level's end, Game over, the opening, the loading board) keep
below it and scroll if the window is too short. Touch screens and wide windows are byte-identical to before.

## Amended by order 37 (23 November 2026): the camera on a phone with a notch
"With a notch on its side ... a turn on landing beside the dash jumps the camera up to 72 px in a frame" (above) was a turn, standing as
often as landing: the six tiles ahead flip to his other side and meet a button the notch has pushed in before the easing camera's x has
followed, and the rule that they are never under a button lifts it at once. The camera now eases for the ground ahead either way
(`eitherWay` in `game/frame.ts`), so a turn finds the other side clear already. Along every route (`game/frame.test.ts`, which now holds
it with a notch on both sides and on one side, as Android phones report a cutout) the most the camera moves in a frame beyond where it
would have gone without the buttons is 12 px (76 before); in the page, six turns that moved it 85, 72, 71, 57, 55 and 35 px in a frame
move it at most 20, 13, 20, 18, 11 and 10 (`?debug&live`). What it costs: on its side he is lifted a little more often (without a notch 54
to 57 % of a route's frames, with one 72 to 76 %; the most lift unchanged; upright unchanged), and moves of 9 to 12 px a frame, the camera
starting to ease, are about twice as frequent on its side with a notch. A speech bubble keeps off the safe sides as the buttons do (the
kit's `safeSides`, set by the pad; the maze's raven spoke under a left notch). No browser here has a notch: `?debug&safe=left|right|sides|
upright` pretends one (every stylesheet reads a safe area as `var(--safe-*, env(safe-area-inset-*))`).

## Amended by order 42 (24 November 2026): the edges of the screen
Order 41 left three things at the screen's edges, which a touch target had to move to mend (`apps/viking/tools/review/o41/after.md`):

- **A card's foot keeps off the home bar's strip.** On a phone on its side with a home bar (21 px), the story's opening card and the maze's
  level list reached 11 px into its strip: a card was as tall as the screen less 10 px. Now its foot is 10 px over the screen's or at the safe
  area's edge, whichever is higher, and it scrolls when its words do not fit (`body.touch .card`, `#finish` and `.card.story` in
  `styles.css`). With no home bar nothing moves. On the maze's own page the level list (from 18 % down) ran past the screen's foot on a
  phone on its side with a notch or without, its last rows out of reach: its foot is kept the same way there (`packages/maze/src/panel.ts`),
  so that page's picture without a notch changed too (the list's foot shows).
- **The place's name waits for the opening card, and the pad is hidden under it.** At the first visit the plate with "T-banen" came up under the
  story's card; it is held back until the card has gone, and then shows its full time. On a short phone (360 x 640, 667 x 375) the card's button
  lay under the move pad and the jump: the style sheet hides the pad while the card is up (`body:has(.card.story) .pad`); it is not turned off,
  so the camera keeps the pad's room and the map does not move when the card goes.
- **The map's boards keep clear of the pad.** On the line map the boards under the stations, hung in rows since order 41, came close to
  the move pad and the jump on a phone on its side (Ekeberg's, line 1 nearly done; and in the first frame, framed before the pad is up,
  under it). On a touch screen the camera keeps everything from him down to the lowest board clear of the pad's bottom row across the
  whole view (`below` in `game/frame.ts`), the same lift everywhere on the flat deck; and at the line's start a board stands clear of a
  notch on the left (`stationBoards` in `levels/kartArt.ts`). The raised slot (the way in, over the jump on its side) stands over the deck
  itself by this record's design: the boards pass under it at the screen's edge as the stations do. The lift is nothing upright and on its
  side up to 45 px (every station timed, a notch), and it stops where the stations' doors would go under the bar: on a short phone on its
  side (667 x 375) the map's bar is two rows of links, three with line 2's runes (97 or 159 of 375 px), and there the stations come first
  and the lowest boards may reach the pad. Held by `levels/kart.test.ts` at 390 x 844, 844 x 390, 360 x 640 and 667 x 375, without a notch
  and with one on either side or both.
- **Not mended, for a later decision**: that tall bar over the map on a short phone (upright at 360 x 640 it is 204 px, 251 with a notch);
  laying it out again for those sizes moves the site's links, thumb targets on a phone without a notch.
