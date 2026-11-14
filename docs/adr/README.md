# Decision records for the games

One file per decision that shaped the front page game, Vikingfjorden, the maze and the shared kit.
Each says what was decided, why, what follows from it, and what was considered and not chosen.
Start with [`../games/HANDOVER.md`](../games/HANDOVER.md).

Who decided is stated in each record: **Lars** (the owner, in his own words), or **the planner**
(Claude, acting on Lars's leave to decide). Decisions by the planner are easier to reverse; ask
Lars before reversing one of his.

| # | Decision | Decided by | State |
|---|---|---|---|
| [0001](0001-front-page-is-the-cloth.md) | The front page is the look and the code all three games share | planner, on Lars's request | holds |
| [0002](0002-code-drawn-pixels-no-asset-files.md) | Art is rectangles drawn in code; no image, font or audio files | planner | holds |
| [0003](0003-fixed-body-constants.md) | Run and jump never change; the world and abilities add behaviour | planner | holds |
| [0004](0004-levels-as-data-one-pure-runner.md) | A level is data; one pure runner plays any of them | planner | holds |
| [0005](0005-checking-without-a-player.md) | Scripted players, a reach search, a debug harness and byte-identical screenshots stand in for playtests | planner | holds, with known limits |
| [0006](0006-ten-levels-lars-hansen-line-map.md) | Ten levels spelling LARS HANSEN, on a T-bane line map of Oslo | Lars (ten, Oslo, him); planner (the rest) | holds |
| [0007](0007-maze-as-optional-bonus.md) | The maze is a bonus stop, never required; no music; the original kept on a branch | Lars (bonus, no music, keep a copy); planner (the rest) | holds |
| [0008](0008-hearts-lives-enemies-pits.md) | Enemies, hearts, lives and pits | Lars | holds; supersedes "nothing kills" |
| [0009](0009-mario-length-levels.md) | Each level about as long and as good as a Mario level | Lars | holds; supersedes the plan's column counts |
| [0010](0010-benches-dash-bosses.md) | Benches, an earned dash, two bosses: mechanics borrowed, nothing recognisable | Lars (a splash of Hollow Knight); planner (which) | holds |
| [0011](0011-levels-on-demand-60kb.md) | Levels load on demand; the first script stays under 60 kB gzipped | planner | holds |
| [0012](0012-saved-progress.md) | What is saved, under which keys, and how old saves are treated | planner | holds |
| [0013](0013-plan-implement-review.md) | One session plans and reviews, Opus implements, each batch merges and deploys | Lars | holds |
| [0014](0014-personal-details-discreetly.md) | Personal details go in quietly; no addresses, nothing explained | Lars | holds |
| [0015](0015-solid-header-in-viking.md) | The viking game's header is solid, not frosted | implementer, accepted by planner | holds; Lars has not seen it |
| [0016](0016-two-languages-dry-voice.md) | Norwegian and English, in a dry voice | earlier work, kept | holds |

To add one: copy the shape of an existing file, take the next number, add the row here. To
reverse one: write a new record that says "supersedes 00NN" and mark the old row "superseded by".
