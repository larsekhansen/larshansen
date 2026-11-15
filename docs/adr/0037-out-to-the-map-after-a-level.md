# 0037. After a level the card takes him out to the map

Decided 2026-11-15 by the planner (order 18, section 1), after Lars played on his phone: when a level is
done there should be no "again" choice, "just take me out again".

## Context
The card after a rune had two buttons, "Onward" (to the map, at the next station) and "Once more" (the
level again). On a phone the second was a tap away from the first, and a player who had just cleared a level
was asked a question he had no reason to answer.

## Decision
- The card after a rune shows what it showed (the time, the best, the skilling, the bracteate, a clean run,
  what is new) and has one action, "Til kartet" / "To the map". Any key newly pressed (not one still held
  from the run, not Tab or a modifier, and not in the first 0.4 s), a tap or a click anywhere takes him
  there; after six seconds it goes by itself, a thin line filling under the button meanwhile. Under reduced
  motion it waits for him.
- He arrives on the map at the station he just cleared; the next one is open, to his right.
- Playing a level again is what the map is for: walk to the station and go in. R during a level still
  restarts it; on the card after a rune R, like any key, takes him out, and the header's restart button is
  hidden there.
- The Game over card keeps "Prøv igjen" / "Try again" and "To the map"; so does the card for a level's file
  that did not come.
- Gamlebyen's ending (the dawn, the rune rising to the prow) is not shortened: the card comes after it, as
  before, then the map with the longship.
- The flow is pure and tested (`game/card.ts`, `card.test.ts`).

## Consequences
- "Videre"/"Onward" and "En gang til"/"Once more" are gone; "Til kartet"/"To the map" is one string for all
  three cards.
- A player who wants a better time walks back to the station: a few seconds on the map.

## Not chosen
- Arriving at the next station, as "Onward" did: the order asked for the one just cleared, with the next open
  ahead of him, so the map shows what changed.
- Going out at once, with no card: the card's time and best are the reward for the level.
