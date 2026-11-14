# 0008. Enemies, hearts, lives and pits

Lars, 2026-11-14: "I want enemies, lives, pitfalls, platforming, etc. Mario. But me in Oslo."
Supersedes the planner's earlier rule that nothing can hurt (in `LEVELS.html` and order 8).

## Decision
As built (order 10 rule 4; `game/play.ts`, `game/enemies.ts`):
- Three hearts (waffle hearts). A hit knocks him back and leaves him safe for 1.5 s.
- Bottomless pits and water cost a heart and return him to the last flag or bench.
- Three lives. No hearts costs a life and refills hearts. 100 skilling or a slice of brown
  cheese (one per level, in a secret) gives a life. No lives: Game over, and only that level
  starts again. Runes, bracteates and best counts are never lost.
- Five kinds of enemy as data: walker, spiky, flyer, thrower, jumper. Walkers and flyers are
  beaten by landing on them. Casts are from Oslo: pigeons, gulls, rats, an e-scooter, guards,
  braziers, snowball kids, hedgehogs, salmon, wasps, foxes, magpies, cats.
- An enemy is visible for a second before it can reach him, never on a blind landing, never at
  a flag or bench.

## Consequences
- Lives and skilling carry from level to level during a visit, not across visits.
- Game over is deliberately mild: Lars asked for lives, not for lost progress.
- Throwers aim at where he stands; waiting near one is punished. Flagged as possibly harsh.

## Not chosen
- Losing the level's progress or runes on Game over.
- A health bar or more than three hearts.
- Enemies that cannot be avoided or that appear without warning.
