# 0025. Line 2: six more levels spelling VIKING, opened by Nabolaget

State: holds; completed by [0030](0030-the-end-of-line-2.md) (order 16 built the last two; nothing is under
construction any more).

Decided 2026-11-14 by the planner (`docs/games/PLAN-LINE-2.md`, shown to Lars, who asked for more
levels to be planned); built from order 14 on. Extends [0006](0006-ten-levels-lars-hansen-line-map.md).
Lars had not answered the plan's open questions (the word, the places, the sledge run) when building
began: a later answer may change a place or the word.

## Decision
- **The word**: six more runes spelling VIKING, Elder Futhark drawn as strokes like line 1's (V is
  written with the u-rune ᚢ, as the old inscriptions do; K ᚲ, G ᚷ, I ᛁ, N ᚾ). In order: Bygdøy,
  Vigelandsparken, Korketrekkeren, Østensjøvannet, Bjørvika, Gamlebyen. Each is the size of a line 1
  level and adds one idea; the plan has the ideas.
- **On the map**: line 2 is orange, as Oslo's line 2 is. It leaves at Stortinget (an orange bar on
  Stortinget's station mark), runs under line 1 on a low deck over the water, and comes up beside line
  1's end, where its own viaduct carries the six stations to the right. Line 1 does not move: its ten
  stations, boards and the mound stand where they stood. The map grows from 59 to 101 columns.
- **The unlock**: line 2 opens when Nabolaget is cleared, because a station opens when the one before
  it in the order is cleared and line 2 follows line 1 in it. Until then a gate of boards stands across
  it with a sign ("Opens once Nabolaget is cleared"), and everything of line 2 is drawn faint. Nabolaget's
  card says when it opens, the map's banner says "Lines 1 and 2" once it is.
- **Stations under construction**: a station whose level is not built stands behind a hoarding with a
  warning stripe and cannot be entered; up at it says "The station is under construction." Orders 15
  and 16 build them (`built: true` in `levels/index.ts`); the last built station's card counts line 2's
  runes ("One of six runes on line 2. The rest is under construction.").
- **The header**: line 1's ten slots as before; a second group of six for VIKING appears once line 2
  is open. On a narrow screen both groups' slots are narrower then, so the run keeps the row it had.
- **Progress**: line 2's levels are stored by id beside line 1's, as before; nothing about line 1's
  save changes (tested with a save of today's shape). The gold helmet and the ending are still line
  1's ten (`allRunes(progress, LINE_1)`). The shield comes with Bygdøy ([0024](0024-the-shield-is-a-held-stance.md)).
- **The first script**: the map's look moved out into its own chunk (`levels/kartArt.ts`, fetched
  as the page starts), the stations lost their unused place strings, and `?debug&auto`'s table of
  routes moved into the debug chunk; line 2's map drawing, the shield and each level come lazily.
  58.96 kB after Bygdøy (it was 59.12).

## Consequences
- A returning visitor with all ten runes finds line 2 open, and arrives on the map at Bygdøy.
- Line 2's ideas need kit pieces: the rocking deck, the sinking pad and the oar bank came with Bygdøy
  (`deck.ts`, `sink.ts`, `oars.ts`, in Bygdøy's chunk; since order 15 the sinking pad is a small chunk of
  its own, as Østensjøvannet's lily pads use it too). What only one level has (the statues, the sledge,
  the swans) comes in that level's file through its own rules (`LevelDef.rules`).
- On an upright phone, line 1's station boards overlap one another (they did before); line 2's,
  further apart, do not.

## Not chosen
- A second map, or a second screen reached through a door: line 2 has to read as part of one network.
- A lower deck he walks on under line 1: the map's ground can only be at one height at each column on
  a slope, and walking down to it would cut line 1 in two.
- OSLO (four levels) as the word: the plan offered it to Lars; not answered.
