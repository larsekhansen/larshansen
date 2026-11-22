# Order 34: what Lars said, each item and the measures

Measured on 22 November 2026 on branch `what-lars-said` (from `origin/main` at `136450f`, after order 33). Pictures (outside the
repository) in `~/.cache/claude-scratch-larshansen/o34/shots/`, a folder an item: `1-name/` (the banner, the map's board, the card, the
plough's lines at 360 wide, both languages, from `origin/main`'s build (`before/`) and the branch's (`after/`); `map/` the map with runes
missing, both builds), `2-red/` (every recoloured thing at 1280 x 850, four screen pixels an art pixel, by day, under its level's own sky
and at night, both builds; `crops/` cropped to what changed, before over after), `3-outfit/` (Loki's sheet, every frame at four times,
`before/` and `after/`; `place/` him in place at 390 x 844 and 360 x 640 from both builds), `3-words/` (the shouted lines at 360 x 640 and
390 x 844 in both languages, beside him as he poses), `3-music/` (the audition's address loaded, its help line clear).

## The answers recorded: done

`docs/games/handbook/conversations.md` has a dated section, "Lars's answers, 22 November 2026 (relayed by his other session)", with his
words as typed and what came of each, and "Questions waiting for Lars" closed or updated: edge forgiveness ("planner's call": 10 until he
has played), Again ("no Again"), the tenth station ("rename it Gamle Oslo"), `post/` ("leave post/ out of the repository"), line 2
("keep line 2 harder" and the thematic rule) closed; `landing-game-polish` ("delete", waiting for his word in the planner's session) and the
opening card (his suggested line waits for him) still open; the encore's words answered; his play notes not.

## 1. The tenth station is Gamle Oslo, and nothing says "home": done

- **The name** is Gamle Oslo in both languages wherever a player reads it: the station (`levels/index.ts`, so the map's board, the loading
  board, the cards, the runes' count and the screen reader's lines), the level (`name` in `levels/nabolaget.ts`: the banner and the card's
  title), line 2's gate sign ("Opens once Gamle Oslo is cleared" / "Åpner når du har klart Gamle Oslo", `levels/kart.ts`, and its test), the
  page's description (`index.html`), LEVELS.html, DESIGN, the HANDOVER and the handbook where they describe the game as it is (the orders'
  own sections keep their history). The id stays `nabolaget`. The map's board reads "Gamle Oslo" in the board's width (`1-name/`).
- **Its words**, each with two other ways in `conversations.md`:

  | Where | Was | Now (English / Norwegian) |
  |---|---|---|
  | The banner's second line | Homeward through Gamle Oslo | A winter night on the east side / Vinternatt på østkanten |
  | Where in Oslo (`place`) | From Vålerenga home to Kværnertoppen | From Vålerenga's wooden houses over the hill / Fra trehusene på Vålerenga, over bakken |
  | The plough wakes (the middle line) | The last thing between you and the door home. | The last thing between you and a quiet evening. / Det siste mellom deg og en rolig kveld. |
  | The plough beaten | The plough parks. The way home is clear. | The plough parks. / The street is clear, for once. — Brøytebilen parkerer. / Gata er fri, for en gangs skyld. |
  | The card with the tenth rune | Ten of ten runes: LARS HANSEN. Welcome home. | … Oslo, end to end. / … Oslo, fra ende til annen. |

  The beaten line is two lines: on one, the Norwegian ran off a 360-wide screen (`1-name/after/*say-beaten*360x640_nb-NO.png`).
- **What stays**: Vålerenga as a place in the level (its first sign, "Vålerenga kirke", the lane); the Pi, the cranes, the yellow house and
  the plates' names as drawn, with no new words; the doors labelled "Hjem" (the site's front page). Code and comments that called the house
  his home say the yellow house (`YELLOW`, `yellowHouse`; the light census's row follows the function's name). ADR 0055 (new), 0038's name
  superseded, 0014 amended. The story's lines above the encore's block are untouched (their hash test passes).
- Ekeberg's banner still says "The hillside above Gamle Oslo", and the header's first link (to the front page) is "Gamle Oslo": three
  things of one name, as ADR 0038 feared. Lars chose the name; ADR 0055 says so.

## 2. Scenery off the warning red: done

**The test** (`src/render/warning.test.ts`, a second test beside order 33's): every view (320 x 200) of every level and the encore drawn as
the page draws it, by day: the sky, the far, mid and near layers (each fill's colour washed toward the level's air by its layer's haze, 0.5,
0.4, 0.3, as the page's passes wash it), the street's backdrop (0.08), the water and the tiles, then what he meets and the paint over them.
What is left of the scenery within 10 (CIEDE2000) of the warning red may fill no more than 24 pixels of a view (a rear light, a door's knob,
a stripe on a far sign), or it is named with why. Named: Stortinget's third rail's cover (the warning red itself: it hurts). What it found
before (the most pixels of a view; o33's table measured the scenery alone, without what covers it, so its counts were larger):

| Where | Colour, ΔE from the warning red | Most pixels a view | What | Now (ΔE from the warning red; nearest role) |
|---|---|---|---|---|
| Stortinget | `#c8302b` 6.1 | 488 | the walls' stripe along the cable tray, the posters' blocks, the kiosk's sign, the ticket machines, the kiosk; the no-entry sign, the buffer stop and the cabinet's lamp past the end | the station's brick red-orange `#9c3a30` for the stripe, posters and sign (14.3; the coin's copper 14.1); the kiosk and the machines a red-brown `#8a3329` with a lit top `#aa4a3a` (18.1, 11.4); the signs past the end the trains' shade `#aa2c27` (12.3) |
| Stortinget | `#e2553a` 7.3 | 80 | the kiosk's and the machines' lit tops, a magazine, the door's frame | `#aa4a3a` (11.4) |
| Holmenkollen | `#c8302b` 6.1 | 177 | the padded rails on the ice (the `H` tiles) and the jump's lip markers | blue padding `#3384b0`, lit `#7fb0cc`, shade `#2a6a8c` (47+; the helmet 14.7, the use cyan 13.6, the tunic's lit blue 12.8) |
| Vålerenga | `#c8402b` 6.3 | 96 | the church's stained glass | a deep ruby `#9a2433` (17.3; the copper 20.8); the paper cranes keep their tint of the old glass, as drawn |
| Bygdøy | `#c8302b` 6.1 | 44 | the ticket kiosk's sign band at Rådhusbrygga | the ferry's own band, order 33's `#aa2c27` (12.3) |
| Korketrekkeren | `#c8402f` 5.9 | 72 | the red plastic sledge among the hire sledges leaning on Frognerseteren's shed (not the walls: they are tarred logs) | a deep wine `#8a2030` (20.7) |

After: nothing of the scenery over 24 pixels of a view but the named third rail; the most left is Slottet's parade (20 pixels, the russ's
red, already named by order 33's test). Each new colour is in its level's own file; the kit's palette (`HAT_RED`, `swatches/metro.ts`,
`ice.ts`, `winter.ts`, `paint.ts`, `sledge.ts`) is unchanged, as the front page shares it. Orange padding was tried first: every orange
within reach came within 10 of the invaders' orange, the coin's copper or his skin. His hat keeps the kit's red. `render/palette.test.ts`,
`lights.test.ts`, `alive/props.test.ts` and `ground.test.ts` pass. ADR 0044 amended; DESIGN's role table.

**Pictures** (`2-red/crops/`, before over after at four times): each still reads as its place: Stortinget's walls a brick stripe, the kiosk
and the machines a darker red, the no-entry sign and the buffer stop still red signs; Holmenkollen's rails padded blue with their white
bars; the church windows ruby, blue and gold, still stained glass by day and lit at night; Bygdøy's kiosk sign a darker red; the wine
sledge between two wooden ones.

## 3. The encore gets music, more glam and glammy words: done (unheard)

### The music

An original glam-rock tune (`src/game/tune.ts`, written down as data; in the encore's own chunk, `vite.config.ts`'s `OWN`), played through
the kit's `voice` (no change to the kit): a tone that slides from one pitch to another and dies away, or a burst of filtered noise. A beat
is 28 steps (about 129 a minute), a bar 112, the loop 16 bars (1,792 steps, about 30 seconds). Written out, from the data:

| Bar | Part | Chord (power chord, root in octave 2) | Riff (X open, x damped) | Bass (r root, f fifth, o octave) | Kick | Claps | Hats (C crash) | Lead (eighth: note, length in eighths) |
|---|---|---|---|---|---|---|---|---|
| intro | as he wakes | A5 struck and left ringing | X....... | | k....... | | C....... | toms: 4: G3, 5: E3, 6: D3, 7: B2 |
| 1 | chorus | D5 | `X.X.X.Xx` | `rrrrrrrr` | `k.k.k.k.` | `..c...c.` | `Chhhhhhh` | 0: E5 (2), 2: E5 (1), 3: F#5 (1), 4: E5 (2), 6: C#5 (2) |
| 2 | chorus | E5 | `X.X.X.Xx` | `rrrrrrrr` | `k.k.k.k.` | `..c...c.` | `hhhhhhhh` | 0: B4 (2), 2: C#5 (1), 3: B4 (1), 4: G#4 (4) |
| 3 | chorus | A5 | `X.X.X.Xx` | `rrrrrrrr` | `k.k.k.k.` | `..c...c.` | `hhhhhhhh` | 0: A4 (1), 1: C#5 (1), 2: E5 (2), 4: A5 (2), 6: F#5 (1), 7: E5 (1) |
| 4 | chorus | A5 | `X.X.XXX.` | `rrrrrrrr` | `k.k.k.k.` | `..c.c.cc` | `hhhhhhhh` | 0: E5 (5), 6: C#5 (1), 7: B4 (1) |
| 5 | verse | A5 | `X..xX..x` | `rrrrrrro` | `k.k.k.k.` | `..c...c.` | `Chhhhhhh` | — |
| 6 | verse | A5 | `X..xX.xx` | `rrrrrrro` | `k.k.k.k.` | `..c...c.` | `hhhhhhhh` | — |
| 7 | verse | D5 | `X..xX..x` | `rrrrrrro` | `k.k.k.k.` | `..c...c.` | `hhhhhhhh` | — |
| 8 | verse | E5 | `X.x.X.x.` | `rrrrrrfo` | `k.k.k.k.` | `..c...c.` | `hhhhhhhh` | — |
| 9 | verse | A5 | `X..xX..x` | `rrrrrrro` | `k.k.k.k.` | `..c...c.` | `hhhhhhhh` | — |
| 10 | verse | A5 | `X..xX.xx` | `rrrrrrro` | `k.k.k.k.` | `..c...c.` | `hhhhhhhh` | — |
| 11 | verse | G5 | `X..xX..x` | `rrrrrrro` | `k.k.k.k.` | `..c...c.` | `hhhhhhhh` | — |
| 12 | verse | E5 | `X.X.XXXX` | `rrrrffoo` | `k.k.k.k.` | `..c.cccc` | `hhhh....` | — |
| 13 | solo | F5 | `X...X...` | `r...r...` | `k.k.k.k.` | `..c...c.` | `Chhhhhhh` | 0: C5 (1), 1: D5 (1), 2: E5 (1), 3: D5 (1), 4: C5 (1), 5: A4 (1), 6: C5 (2) |
| 14 | solo | G5 | `X...X...` | `r...r...` | `k.k.k.k.` | `..c...c.` | `hhhhhhhh` | 0: D5 (1), 1: G5 (1), 2: A5 (2), 4: G5 (1), 5: E5 (1), 6: D5 (2) |
| 15 | solo | A5 | `X...X.x.` | `r...r.r.` | `k.k.k.k.` | `..c...c.` | `hhhhhhhh` | 0: D5→E5 (2), 2: C#5 (1), 3: A4 (1), 4: C#5 (4) |
| 16 | solo | A5 | `X.....xx` | `r.....rr` | `k.....kk` | `....cccc` | `C.......` | — |

The plain notes, once, a beat after the stage goes plain (eighth: note): 0: A3, 2: E4, 4: A4, 6: C#5, 10: E4, 12: A4.

Sounds: the kick a sine falling 130 to 45 Hz with a click of noise; claps two bursts of noise 12 ms apart; hats a short high burst; the crash a
long one; the bass a square and a triangle together an eighth long; a power chord the root and its fifth in sawtooth and the octave in square,
an open chord ringing 0.32 s, a damped one 0.11 s; the lead a square, bent where it bends; the plain notes a triangle ringing 1.2 s with a
quiet sine an octave up. The band sits under the game's own sounds: its loudest moment (every part on a downbeat) sums to 0.73 of the
synth's volume against 0.1 to 0.5 for a single sound of the game's.

**It follows the fight**: silent while he waits at his mark; the intro as he wakes; the whole band while he is glammed; the wig takes the
lead with it, the shades the riff, the jacket the drums and the bass (one layer a hit; after the third the band is gone); a beat after the
stage goes plain, the plain notes, once. In the scripted fight the lead is heard before the first hit (the loop starts on the chorus for
that), the riff before the second, the drums and bass before the third, and after the third only the six plain notes.

**It is the page's sound**: the page asks it once a frame (`LevelDef.music`, one call in `main.ts`) with its sound while the level is played,
and with none on a card, while the page is hidden or after he has gone (another scene does not ask it at all): then it schedules nothing.
Muted, it schedules nothing at all and makes no sound nodes. Nothing sounds before the first key or touch (the kit's synth has no audio
until then). It schedules a quarter of a second ahead; time it lost (a hidden page, a slow frame, a restart) is skipped: a missed note is
never played late.

**Held by `src/game/tune.test.ts`** (9 tests): whole bars, 16 to 32 a loop, every part eight eighths a bar, every lead note inside its bar;
deterministic, the same each time round, and the same asked a frame at a time as all at once; every tone 40 to 4,200 Hz, every noise's filter
50 to 13,000 Hz, every volume over 0 and at most 0.3, no delay below 0, no moment over 0.8; a layer fewer with each hit and none after the
third; in the scripted fight the intro as he wakes, the four instruments while glammed, the lead gone after the first hit and the riff after
the second, only the plain notes (six, once) after the third; nothing heard muted, with no sound, or while he waits; every note played once
and on time a frame at a time, and nothing late after lost time; the audition playing only what it names; the shouted lines (below).

**How to hear it** (nobody can hear it on the Pi: headless Firefox plays no sound; Lars, with sound on and after a first tap or key):
- the encore as it plays, every rune pretended: `https://larshansen.dev/viking/?debug&told&cleared=all#encore`;
- the loop at once, whatever Loki does, a part at a time: `https://larshansen.dev/viking/?debug&told&level=encore&music=band#encore`, and
  `music=drums`, `bass`, `riff`, `lead`, `intro`, `plain`, or a list such as `music=drums,bass`.
Both addresses load in headless Firefox with a clear help line (`3-music/`).

### Loki's outfit

Late-1980s glam metal at its far end, in general, and nobody real (`src/render/loki.ts`; sheets in `3-outfit/before/` and `after/`, every
frame at four times; in place at phone size in `3-outfit/place/`):
- the hair (the wig): hot pink and magenta teased up to row 5 of his 46-row frame (it was row 7): as high as it goes under the violet stars
  of his pose, which turn between rows −4 and 4; spiked, wide behind his head, the fringe over his brow, the mullet down to his shoulder
  blades; a lime headband over his brow, knotted at the back with its ends hanging;
- the shades: one row over his eyes, the arm back to his ear, a glint at the front (they were two rows at his hairline, hidden under the wig
  while he was glammed and "pushed up" once it was off); the eye make-up: purple shadow on his lid, showing over the shades, and a liner's
  wing, seen whole when the shades come off; plum lips as before;
- the jacket: leopard print (the enemy palette's amber with black rosettes, its far side in the orange), white shoulder pads, the magenta
  shirt in its open front, a studded belt (white studs) with a lime buckle; sleeves in the amber;
- neon spandex, split: the near leg hot pink, the far leg acid green, tiger-striped in black every fourth row; white boots as before;
- a scarf at each wrist (hot pink and lime);
- a pointed guitar slung behind him: its body (pointed top and bottom, hot pink and magenta, a lime pickup) behind his hip, its neck up
  behind his back to a headstock over his shoulder, the strap across his chest; hidden by the hair while he is glammed but for its body,
  whole once the wig is off; in his hands while he revs and slides, as before ("if it reads": at four times and at phone size it reads as a
  guitar once the neck shows; while glammed, its body alone is a pink shape behind his hip).

Every glammed colour the enemy palette's (`levels/encore.test.ts`); "yellow" is the glamour's lime, since the paint's yellow is where he
stands. Three stages and the plain man as before: the wig takes the hair and the headband, the shades the shades, the jacket all the rest
(spandex, scarves, the guitar, the make-up). No box, tell or timing changed: the encore's run file is byte-identical. The pose's stars are
drawn over him and stay clear; the club raised is drawn over the hair as before.

### Glammy words

Four shouted lines of the game's own, added to the encore's block of `game/story.ts` (`shout1` to `shout4` on `EncoreWords`, an alternative
each in `ENCORE_ALTERNATIVES`); nothing above the block or in it changed:

| | English | Norwegian | Other way (English / Norwegian) |
|---|---|---|---|
| shout1 | Higher hair, Oslo! / Mind the wind! | Høyere hår, Oslo! / Pass på vinden! | Tease it up, Oslo! / The fog won't. — Tuper det, Oslo! / Tåka gjør det ikke. |
| shout2 | Neon tonight! / Sleet tomorrow! | Neon i kveld! / Sludd i morgen! | The night is young! / The last tram is not! — Natta er ung! / Siste trikk er ikke det! |
| shout3 | Louder, Oslo! / The neighbours can take it! | Høyere, Oslo! / Naboene tåler det! | Hands in the air! / Gloves on is fine! — Hendene i været! / Med votter går fint! |
| shout4 | Glitter, Oslo! / It's only drizzle! | Glitre, Oslo! / Det er bare yr! | Lights up, Oslo! / Mind the slush! — Lys på, Oslo! / Pass deg for sørpa! |

In time with the music (`shoutAt`): a line comes in on a beat he was already strutting or posing on, stays while he does, and the lines
take turns two bars each; never during a tell (club, slam, rev, charge, ring, bite, reel, waking), and the page shows it only while none of
his lines or hints is up. In a bubble beside him (`bossBubbleAt`), on the side away from the player: beside his pose it stands clear of the
stars over his head (`3-words/pose-zoom.png`). Every line fits a bubble at 360 wide in both languages (`3-words/say-360.png`). With reduced
motion it is the same still bubble; nothing is drawn to the beat. In the scripted fight his own lines and hints are up for most of his
struts, so a shouted line shows only now and then; a slower player who misses openings sees more.

**What a picture cannot show**: under the harness (`?debug&steps=…`) the page steps the rules and draws one frame, so the music never saw him
wake and no shouted line shows there; the pictures use `&say=shout1` (the same bubble at the same place). The timing is held by the tests.

## 4. The design rule: done (proposals only)

DESIGN ("The levels": "Difficulty and enemies follow the place") and ADR 0055 have the rule. `thematic.md` here holds every level against
it: the place, what it is in Oslo, the sloppy player's numbers measured for this order on seeds 201 to 260 (±2 and ±4, `origin/main`'s
rules), its enemies and whether each belongs, and a proposal where they disagree. Nothing was retuned or moved.

## Docs

`conversations.md` (the answers, what is still open, the new lines' alternatives); HANDOVER ("What exists", "How it came to be", the first
script, a section for order 34); the handbook (start-here's table, the roadmap's status, "In flight" and "Next", lessons, resources: the
addresses to hear the tune, the `&music` and `&say=shout…` debug ways, the new tests); DESIGN (the tenth station's name, the padded rails, the
role table, the thematic rule, Loki's tune, shouts and look, the parts table); ADR 0055 (new), 0052 and 0044 amended, 0038's name superseded,
0014 amended; LEVELS.html (the name and words, the encore's tune and look; pictures below); the review tools' README.

**LEVELS.html's pictures**, all 22 taken again with `tools/pictures.ts` from the branch's build: four changed and were kept
(`05-holmenkollen`: the padded rail now blue; `10-nabolaget`: the banner "Gamle Oslo / A winter night on the east side"; `17-encore`: Loki in his
new look; `kart-line2`: the board "Gamle Oslo 4:14.6", a little wider, abutting Ekeberg's as Vålerenga's did); the other eighteen came out
byte-identical.

## The measures

- **Tests**: pixelkit 153 pass, maze 211 pass, landing 18 pass, viking 484 pass (474 on `origin/main`; new: `game/tune.test.ts`'s
  nine, `render/warning.test.ts`'s scenery test), none failing.
- **The viking suite's time**: 370.5 s on a quiet Pi (484 tests across 22 files), over the 360 s the order names; `origin/main`'s, timed the same
  hour from a worktree, 335.0 s (474 tests). The new tests alone: the scenery walk in `render/warning.test.ts` about 18 s (the file took 20.5
  s alone, order 33's part of it about 1), `game/tune.test.ts` 0.2 s; the rest of the 35.5 s was not pinned down (Loki's larger frames are
  drawn by the encore's and the reduced-motion tests; runs move by several seconds). What could be trimmed: the scenery walk draws every
  tile and far layer of every view pixel by pixel (no `document`, so the textured set does not keep its pieces); counting a kept piece's
  colours once and its copies by area would take most of its 18 s; sharing one walk with order 33's test would save a second or two; the
  reduced-motion test (about 70 s) is still the largest single cost.
- **tsc** clean in all four packages, inside each (TypeScript 5.9.3) and from the root (`bunx tsc --noEmit -p <package>`).
  `bun run build` at the root clean.
- **First script**: 58.08 kB gzipped (vite), 58,051 bytes by GNU `gzip -c` (`origin/main`: 57.94 kB, 57,903): +0.14 kB for the page's one call
  to a level's music and the shouted line's bubble. The tune and the sequencer are in the encore's chunk (8.6 kB gzipped on `origin/main`, 11.2
  now, with Loki's new parts); the shouted words in `feel`'s file with the story (42.27 to 42.44 kB). Measured with `bun run build` in
  `apps/viking` (vite under Node).
- **The front page**: 28 of 28 byte-identical to `/tmp/shots-before-jernhaugen/` (nothing in `packages/` or `apps/landing` changed).
- **Run files**: the sloppy player (`fresh.ts`) on seeds 201 to 260, ±2 and ±4, from a worktree of `origin/main` (`136450f`) and from the
  branch: every run's record byte-identical (`cmp`), the md5s order 33 recorded:

  | Level | md5 of the runs, before and after |
  |---|---|
  | Langkaia | `dd2406a1c3c0` |
  | Nordmarka | `58bfcf501657` |
  | Bjørvika | `1fdbdf511c68` |
  | Gamlebyen | `54db73ff6304` |
  | Slottet | `0a1e506dd82b` |
  | Gamle Oslo (`nabolaget`) | `ec4e38c6dea5` |
  | The encore | `112b3fb514ab` |
- **The map with any rune missing**: order 29's twenty addresses (no runes, three, line 1, line 1 and five of line 2, all but Langkaia's; at
  the start and at the end; by day and at night) at 1280 x 800 and 390 x 844 from both builds: 40 of 40 byte-identical (one pair taken
  again: the first `origin/main` picture was the page before the map's look had come). At the renamed station (x 880) the same five sets:
  20 of 20 differ only in the strip of the station boards, the board reading "Gamle Oslo" for "Vålerenga" (`1-name/map/`, and
  `board-night.png`).
- **Perf** at 390 x 844 (`?debug&perf` through `../../glance/perf.ts`), `origin/main`'s build and the branch's at the same 56 places
  (`places.tsv`: every place of the encore, Loki in each move, by day and at night; Stortinget's walk, hall and shafts; Holmenkollen's walk
  and chairs; Gamle Oslo's walk and its church in the lane; Bygdøy's and Korketrekkeren's starts and the trail; the map; Langkaia):
  every place +0 rectangles a frame; the most, 10,821 (Holmenkollen at night), as before; none over 15,000. Two Stortinget places measure 0
  in both builds (he is hit in the first step, so the page holds its picture, as order 33 found). `perf-390-before.tsv`, `perf-390-after.tsv`.

## What only a person can judge

- **The tune.** Nobody has heard it. Does it sound like glam rock in a phone's speaker; is it too loud or too quiet under the game's sounds;
  does the drop of a layer at each hit come across; do the plain notes at the end land; does the loop wear thin over a long fight; does any
  of it remind anyone of a real song (it should not; tell the planner at once if it does).
- **Loki's look** on a phone at speed: does he read as glam metal at its far end; is the hair so big it gets in the way of reading his
  poses; does the guitar behind him read (or is it a pink shape); is the leopard print leopard at a phone's size; does he now land a stomp
  7 pixels into the hair (it was 5) and does that look right.
- **The shouted lines**: are they funny, are they in time, are there too few in a fight (his own lines and hints come first).
- **The new words** for Gamle Oslo, and the name itself beside the header's "Gamle Oslo" link and Ekeberg's banner.
- **The new colours**: Stortinget's brick and red-brown, Holmenkollen's blue padding on the ice, the ruby glass, the wine sledge.
- **The thematic proposals** (`thematic.md`), after he has played.

## Departures, doubts, found and not fixed

- **Frognerseteren's "walls"** (the order, from order 33's table) were not red: they are tarred logs. What the test found there (`frognerseteren
  < back`) is the red plastic sledge among three hire sledges leaning on the shed; it became a deep wine red. A dark timber sledge was not
  used: it vanished against the logs.
- **Loki's shades moved** from his hairline (order 29 laid them on the head's first two rows, under the wig while glammed) to one row over
  his eyes, as wraparound shades. The flying piece is that one row.
- **He shouts while he poses as well as while he struts**: struts alone gave the lines too few chances, since his own lines and hints come
  first. The bubble stands beside him, clear of the stars over his pose (photographed). The pose is the opening, marked by the stars; if the
  planner reads the pose as a tell the bubble must not share, `SHOUTING` in `game/tune.ts` is one word to change.
- **The plain notes begin a beat after** the stage goes plain, not on that step: the scheduler is a quarter of a second ahead, and a phrase
  starting the step it learns of the moment loses its first note.
- **Perf at 56 places**, not all of order 33's 275: a place took about forty seconds in headless Firefox here, and nothing in this order
  changes what is drawn but colours and Loki's frames (each still one copy). The 56: every place of the encore, and each recoloured level's
  places by day and at night, Langkaia and the map as controls.
- **The tenth station's first sign** still says "Vålerenga" (with the church's "Vålerenga kirke"): the order keeps Vålerenga as a place in
  the level, and the sign is where its roofs are.
- **Quoted in the repository**: Lars's words as the order gave them, including "Oslo is my home" (conversations, ADR 0055) and a real band's
  name in his request about the outfit (conversations, ADR 0052's amendment, 0055). Both are his words quoted, as the order asked; nothing
  was drawn or written from the band. If either should not be in a public file, it is a quote to shorten.
- **Doubts**: the tune was composed here and checked only by reason: its chords (I, IV, V, bVII, bVI) are common to a great deal of rock,
  its melody and riff its own, and nobody has heard it. The scenery test's limit (24 pixels a view) was set by looking at what it found
  (the smallest thing the order named was 44); it lets a postbox through, not a wall. Stortinget's brick is 14.1 from the coin's dark copper:
  it is a thin stripe and posters' blocks, never a coin's size.
- **Found and not fixed**: his stomp lands two pixels deeper into the hair than before (7 above his box's top, it was 5); in the scripted
  fight the shouted lines show only now and then; under the harness no shouted line can show (use `&say=shout1`); some harness pictures of
  the encore and Holmenkollen at 390 x 844 came out blank in both builds (the known race with `feel`'s file, or a hit in the first steps),
  retaken at another size; Holmenkollen's hedgehog in the snow, Slottet's quiet 17 May and the rest in `thematic.md` are proposals only.
