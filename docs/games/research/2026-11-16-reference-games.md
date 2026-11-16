# What three open-source games do that Vikingfjorden does not

16 November 2026. Lars asked for real research into the open-source games his conversation in
`post/gemini-gamedesign-nov-16-2026` pointed to: Open Surge for parallax and layering, Shattered
Pixel Dungeon for enemy readability. A C port of Celeste Classic was read as well, for how a
jump feels. The sources were cloned and read, their art files measured, and our game measured
the same way.

All three are open source under licences that do not fit this repository (Open Surge and
Shattered Pixel Dungeon are GPL 3). **Nothing was copied: no code, no art.** This is a record of
techniques and numbers.

| | Read | Where |
|---|---|---|
| Open Surge | `src/entities/background.c`, `themes/*.bg`, `images/` | github.com/alemart/opensurge |
| Shattered Pixel Dungeon (SPD) | `sprites/CharSprite.java`, `sprites/*Sprite.java`, `effects/EmoIcon.java`, `ui/*Indicator.java`, `assets/sprites`, `assets/environment` | github.com/00-Evan/shattered-pixel-dungeon |
| Celeste Classic (C port) | `celeste.c` | github.com/lemon32767/ccleste |

## 1. The grain: are our pixels too big?

How tall the hero is, as a share of the screen's height:

| Game | Screen in art pixels | Hero | Share |
|---|---|---|---|
| Celeste Classic | 128 x 128 | 8 px | 1/16 |
| Shattered Pixel Dungeon, phone upright | from 135 x 225 | 15 px | 1/15 |
| **Vikingfjorden** | about 192 high | 14 px (10 x 14) | 1/14 |
| Open Surge | 426 x 240 | about 40 px in a 64 x 64 frame | 1/6 |

Two loved games have pixels as big as ours or bigger. Open Surge is the only one with a much
finer grain. So the size of a pixel is not what makes ours look coarse. What differs:

- **Tones.** An SPD rat is 16 x 15 pixels and uses about 50 colours across its frames; one
  frame has four or five tones of fur, a lit side and a shaded side, a pink tail and feet, and
  red eyes. The warrior uses 107. Our figures are drawn from maps of single letters or from
  rectangles with one tone per material.
- **Frames.** The SPD rat has **15 frames**: idle (2 frames at 2 a second, so it breathes),
  run (5 frames at 10 a second), attack (5 at 15 a second), death (4 at 10 a second). Our hero
  has **four leg poses** in all (stand, two walking, one in the air), no idle movement, the same
  pose rising and falling, and no squash on landing. Most of our enemies have two.
- **Tiles.** SPD's 16 x 16 tiles are textured pixel by pixel: every stone has a lit top edge
  and a shadowed bottom edge, there is moss, cracks, a grate. A tile sheet holds over a thousand
  colours. Ours are built from rectangles.

**Conclusion.** Keep the grain. Spend the effort on tones, frames and tile texture. A finer
grid would also need all of that, at four times the pixels.

## 2. Reading an enemy at a glance (Shattered Pixel Dungeon)

Measured over the art files (saturation and brightness, 0 to 1; the 90 % column is the top
tenth):

| | Saturation, middle | Saturation, 90 % | Brightness, middle | Brightness, 90 % |
|---|---|---|---|---|
| SPD dungeon tiles (seven sets) | 0.00 to 0.25 | 0.31 to 0.58 | 0.20 to 0.32 | 0.49 to 0.70 |
| SPD all character sprites | 0.35 | 0.94 | 0.46 | 0.86 |

- **The floor is dull and dark; whatever moves is brighter and stronger in colour.** That gap
  is the whole trick. SPD has **no outline** on its enemies (the advice Lars was given says it
  has one; the art files show it does not).
- **A drop shadow under every character**: a dark ellipse 1.2 times the sprite's width and a
  quarter of its height, at its feet. It ties the figure to the floor and lifts it off the
  floor at once.
- **Eyes as the one loud accent**: the rat is brown on grey-brown, and its red eyes are what
  the eye finds.
- **State is an icon over the head** that swells and shrinks: asleep, alert ("!"),
  investigating ("?"), lost. The alert icon pulses four times as fast as the sleep icon.
- **Fixed meaning colours** for everything that pops up: green good, red bad, orange warning,
  yellow neutral.
- **A hit flashes the sprite white for 0.05 s**, with a burst of blood in the creature's own
  blood colour.
- **Indicators at the screen's edge**: how many enemies are in sight, the target's health, a
  boss's health bar.

Ours, measured on the level pictures in `docs/games/shots/` (the backdrop band above the lane):

| Level | Saturation, middle | Brightness, middle |
|---|---|---|
| Langkaia, Rådhuset, Slottet, Holmenkollen (day) | 0.40 to 0.46 | 0.67 to 0.70 |
| Akerselva | 0.47 | 0.58 |
| Bygdøy | 0.44 | 0.66 |
| Akershus, Ekeberg, Bjørvika | 0.08 to 0.23 | 0.35 to 0.40 |
| Nordmarka, Vålerenga, Gamlebyen (night) | 0.53 to 0.74 | 0.07 to 0.13 |

Our daytime backdrops are **bright and of middling saturation**, where SPD's floors are dark
and dull. A natural-coloured animal has nowhere to stand out, which is why the first enemies
vanished and why order 18 had to go as far as pink and lime. With Lars's red outline (order 22)
bodies can be natural again, but only if the backdrop behind the lane is quieter. Our enemy
palette today: saturation 0.5 to 0.9, brightness 0.3 to 0.8.

## 3. Depth (Open Surge)

A level's background is a text file listing layers. Each layer has a picture, a starting
position, a scroll speed as a share of the camera's, an optional movement of its own, repeat
flags and a depth.

| Theme | Layers | Different speeds | Moving by themselves | In front of the player |
|---|---|---|---|---|
| sunshine | 17 | 15 (0 to 0.4) | 13 | 0 |
| sunset | 15 | 11 (0 to 0.8) | 14 | 0 |
| waterworks | 20 | 9 (0 to 0.4) | 14 | 0 |
| waterworks indoors, front | 9 | 7 (0 to 2.0) | 0 | 3 |

- **Many speeds, not three or four.** Fifteen in one level. We have five canvases at fixed
  depths.
- **Nearly every layer drifts on its own**: clouds and water keep moving when he stands still,
  so the picture is never dead.
- **The receding plane.** The sea in "sunshine" is eleven strips, each 4 pixels tall, each a
  little faster than the one above (0.125, 0.15, 0.175 … 0.4 of the camera) and each drifting a
  little faster too. The eye reads a flat plane running to the horizon. It costs eleven copies
  of a strip.
- **Layers in front of the player** (depth over 0.5), moving up to twice the camera's speed:
  pipes and pillars that pass between the player and the screen. Nothing in our game is in
  front of him except the dark.
- **The far background is almost flat.** The "sunshine" backdrop uses **18 colours** in a
  narrow, pale band of brightness (0.59 to 1.0), while the ground tiles and the hero are at
  saturation 0.96 across the whole range of brightness. Background pale and simple; foreground
  strong and detailed. The same rule as SPD's, at the other end of the brightness scale.
- The layers are drawn in one batch from a cache: cheap.

Ours: `stage.ts` already fades far passes toward the horizon's colour (`pass(…, haze)`), so
the haze of order 22 is a matter of turning up and tuning something that exists.

## 4. How a jump feels (Celeste Classic)

Celeste Classic runs at 30 frames a second; we step 60 times a second.

| | Celeste Classic | Vikingfjorden |
|---|---|---|
| Jump still works after walking off an edge | 6 frames = **0.20 s** | 6 steps = **0.10 s** |
| Jump pressed before landing still happens | 4 frames = 0.13 s | 6 steps = 0.10 s |
| Gravity at the top of a jump | **halved** while vertical speed is small: he hangs | the same all the way up |
| A dash | the game stops for 2 frames and the screen shakes for 6 | no stop |
| Landing and jumping | a puff of smoke each time | dust on a long fall only |
| The hero's state | his hair changes colour when the dash is spent | none |

Our edge forgiveness is half of Celeste's. Making it longer only ever helps a player (no
route gets harder), so it does not break ADR 0003's promise that the jump is fixed, though it
is a change to `JUMP` and wants a record. The hang at the top would change how far a jump
reaches, so it does break ADR 0003 and is not proposed.

## 5. What to do with this

In order of what each buys for its cost:

1. **Frames.** The hero: idle breathing and a blink, a four-frame run, rising and falling as
   different poses, a squash on landing, a lean into a dash, a pose for the shield and the
   sledge. Every enemy: at least an idle of two frames, a move cycle of three or four, a
   wind-up, and a death of three frames in place of the squash alone. This is what "not that
   engaging" most likely is.
2. **Tones.** Every figure and every small thing drawn as a pixel map with three to five tones
   per material and a lit side. Tiles with a lit top edge, a shadowed bottom edge and texture.
   (Order 22's study shows this on two scenes first.)
3. **A shadow under everything that moves**, on the ground below it, also while it is in the
   air: it shows where he will land.
4. **Quieter backdrops behind the lane** (order 22's haze), then natural colours for enemies
   under the red outline.
5. **The receding plane** for the fjord, the lakes and the snow; **more layers at more speeds**
   where a level has only two or three; **drift** on clouds and water everywhere.
6. **Something in front of him now and then**: a lamp post, a mast, a tree trunk, reeds,
   passing at 1.5 to 2 times the camera's speed, never where he must read a jump.
7. **An alert mark** over anything at the moment it turns on him.
8. **Longer forgiveness at an edge**: 6 steps to 9 or 10.
9. **An arrow at the screen's edge** for a thrower or flyer that is about to enter the view.

Not proposed: a finer grid; outlines removed (our backdrops are too bright for SPD's way, and
Lars asked for red); the hang at the top of a jump (ADR 0003).
