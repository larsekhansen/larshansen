# 0038. The tenth station is called Vålerenga

Decided 2026-11-15 by the planner (order 18, section 2), after Lars asked: Nabolaget "can be Gamle Oslo or
something, or where is that?"

## Context
The level is a winter night over Vålerenga and Kampen, which lie in the district Gamle Oslo, ending at home.
Its station, banner and cards called it Nabolaget ("the neighbourhood"), which says nothing to anyone who does
not already know where it is. The header already has a link called "Gamle Oslo" (the front page), level 16 is
Gamlebyen, and Ekeberg's banner says "above Gamle Oslo".

## Decision
- The station and the level are shown as **Vålerenga**; the banner's second line is "Hjemover gjennom Gamle
  Oslo" / "Homeward through Gamle Oslo".
- Display names only. The id stays `nabolaget`: stored progress (`viking.progress` lists it), addresses
  (`#nabolaget`), the level's file, the tests and the tools all keep it.
- Every place a player reads the name follows from the station's name (`levels/index.ts`): the map's board,
  the banner, the cards ("Linje 2 åpner …" and the runes' count), the loading board, the gate's sign
  ("Åpner når du har klart Vålerenga" / "Opens once Vålerenga is cleared"), the screen reader's lines. The
  level's first sign board, which said "Nabolaget", says "Vålerenga".
- The rune is still N.

## Consequences
- Where the name lives: `name` in `levels/nabolaget.ts` (the level), the station's name in `levels/index.ts`
  (the map and everything else), the gate sign in `levels/kart.ts`, and the first sign's label in
  `levels/nabolaget.ts`. To call it "Gamle Oslo" instead is a change of the first two strings.
- The old subtitle named Kværnertoppen; the church sign and the plate past the yellow house still do.

## Not chosen
- "Gamle Oslo": it would be the third thing of that name on one screen (the header's link to the front page,
  Ekeberg's banner), and Gamlebyen is level 16.
- Renaming the id: it would lose stored progress for everyone who has cleared it, for no gain a player sees.
