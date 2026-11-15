# 0030. The end of line 2: all sixteen built, and what they give

Decided 2026-11-15 by the order 16 implementer, on the planner's order (order 16, "The end of line 2").
Completes [0025](0025-line-2-viking.md).

## Decision
- **No station is under construction.** With Bjørvika and Gamlebyen built, the hoarding on the map, the
  station's "under construction" bubble and its string are gone, and every station's door has its address.
  `Station.built` stays in `levels/index.ts` (one boolean a station; a third line could use it again).
- **Gamlebyen's card** says, in the visitor's language, that VIKING is whole and what is left to find: "Six of
  six runes: VIKING. Still to find: N bracteates, and better times." (or "better times." with all sixteen
  bracteates). Before all six (only under `?debug`), it counts line 2's runes as Nabolaget's card counts line 1's.
- **The header**: line 2's six slots light as their levels are cleared and turn gold with all six, as line 1's
  do with all ten (`.runes.all`).
- **The map**: every station's board shows its best time, as before; under the last station of a line whose
  every level has a best time, a board adds them up ("Line 1 24:39.5"). With all sixteen cleared, a longship
  sails the fjord under the viaducts and lanterns stand along both decks, lit after dusk (`kartArt.ts`, which
  comes in its own chunk).

## Consequences
- The gold helmet and the ending are still line 1's ten ([0006](0006-ten-levels-lars-hansen-line-map.md)); all
  sixteen give the map its longship and lanterns, and the header its second gold word. Nothing else.
- First script 59.18 kB gzipped after order 16 (of 59.5 allowed).
