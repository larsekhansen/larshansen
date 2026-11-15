# Linje 2: six more levels

**Built.** Orders 14 to 16 built all six (14 to 15 November 2026); order 17 reviews them. Where the build
left this plan is at the end.

Written 14 November 2026 by the planner, after orders 12 and 13 were merged. Lars asked for more
levels to be planned; this is the plan as it was shown to him. He had not yet answered the open
questions at the end when the building started, so they stay open: a later answer may change a
place or the word.

## The idea

The ten runes in the header spell LARS HANSEN, one per level of line 1. Line 2 adds six runes and
six levels, spelling VIKING. It leaves the line map at Stortinget (an interchange, as on the real
T-bane) and opens when Nabolaget is cleared. Every level is the size of line 1's (220 to 280
columns, 40 s or more on the scripted route) and adds one idea.

| # | Rune | Level | The one new idea | Tone |
|---|---|---|---|---|
| 11 | V | Bygdøy, the museum ships | Decks that rock: the polar ship's deck tilts, the balsa raft drifts, the longship's oars are steps on a beat | Bright; a warm-up for a returning player |
| 12 | I | Vigelandsparken | Statues move only while his back is turned; the angry boy stomps; the fountain's jets are timed lifts; the climb is the column of figures | Eerie by day, funny |
| 13 | K | Korketrekkeren, the sledge run | He rides a sledge downhill and cannot stop: jump and duck only; about 45 s | The breather, as Slottet is on line 1 |
| 14 | I | Østensjøvannet, the bird lake | Lily pads sink under him; swans guard a stretch and chase only one who lingers; mist, reeds, bird hides | Quiet, early morning |
| 15 | N | Bjørvika, the cranes | Crane hooks carry him between half-built towers and he chooses when to let go; Ekeberg's wind returns | High up, evening |
| 16 | G | Gamlebyen, the medieval ruins | Night; the ruins rebuild as he passes and the town is a thousand years younger at the end; the sea serpent | The finale |

## The shield

From the longship at Bygdøy. Holding down raises it: it stops thrown things and a charge, and he
cannot walk while it is up. Levels 12 to 16 each have one place that needs it, as Akerselva onward
need the ski pole. The body's `MOVE` and `JUMP` do not change (ADR 0003). On a touch screen it is a
button, as the dash is.

## The serpent

It rises at three places along a quay. Its spit is stopped with the shield and goes back at it; the
hit is a stomp on its head while it is dazed. Three bosses, three answers: light for the troll,
timing for the plough, the shield for the serpent. Its hint is on screen from the first failed
round and Game over goes on from its bench (ADRs 0017, 0022).

## Difficulty

Measured with the sloppy player (`apps/viking/tools/review/`), hearts lost per run at ±4:
Bygdøy about 1.5, Vigelandsparken 2, Korketrekkeren 1, Østensjøvannet 2.5, Bjørvika 3,
Gamlebyen 3.5 with at most 2 Game overs in 30. No Game over at ±2 anywhere.

## Lars in it

Østensjøvannet and Bjørvika's cranes are his (see the private memory note, not this repo). ADR 0014
stands: no address, nothing about a wedding.

## Each level also has

One gold bracteate only the feather reaches, one brown cheese, one or two benches, flags at most
about 45 columns apart, two to four signs in both languages, 8 to 20 enemies none of them at a
take-off or landing over water, no forced wait much over 5 s.

## Orders

| Order | What |
|---|---|
| 14 | Groundwork: line 2 on the map, sixteen runes, the shield, rocking decks and sinking pads, and Bygdøy |
| 15 | Vigelandsparken, Korketrekkeren, Østensjøvannet |
| 16 | Bjørvika, Gamlebyen, the serpent |
| 17 | An adversarial review of line 2 and its fixes |

Each is merged and deployed on its own: the line grows on the live site station by station. A
station not yet built shows on the map as "under construction" and cannot be entered.

## Open with Lars

- The word: VIKING fixes six levels; OSLO would be four.
- The places: any may be swapped (considered: Sognsvann, Grünerløkka, Tøyen's botanical garden,
  Bislett, the fjord islands).
- The sledge run is the only level where he cannot stop; it is the first to drop if it does not
  feel like the same game.

## Where the build left the plan (after order 16)

- **The word and the places** stand as planned: VIKING, from Bygdøy to Gamlebyen. Lars has not answered the
  open questions; a later answer may still change a place or the word.
- **The shield** came with Bygdøy and is needed once in each of levels 12 to 16 (slingers, ring throwers,
  snowball boys, diving gulls, riveters, archers) and against the serpent. One-way throwers that throw from
  above may be blind close in front of them (ADR 0024).
- **The serpent** is as planned, but its neck never hurts: it stands in his way while it is up, and what
  hurts is its ball and its tail (ADR 0027). Its ball that hits him ends the round with a rest.
- **Difficulty**, hearts a run at ±4 by the sloppy player: Bygdøy 1.2, Vigelandsparken 2.1, Korketrekkeren
  1.0, Østensjøvannet 1.2 (2.6 for the hesitating player the lake was eased for, ADR 0029), Bjørvika 1.6,
  Gamlebyen 2.9; no Game over at ±2 anywhere. Line 2 is easier than planned for the sloppy player in its
  last two levels (3 and 3.5 were wanted).
- **Bjørvika's hooks** stop a tile from the landing they leave (a hop on, at the moment he picks) and come
  right up to the one they reach (a step off): a hop off at the far end cost half a heart a try. **Gamlebyen's stones** rise within six tiles and stay; two walls close behind him (ADR 0028).
- **The end**: all sixteen built; VIKING whole on the header and Gamlebyen's card; the map adds each line's
  best times, and with all sixteen sails a longship and lights lanterns (ADR 0030). The gold helmet is still
  line 1's ten.
