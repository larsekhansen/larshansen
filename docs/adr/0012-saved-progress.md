# 0012. Saved progress

Decided by the planner and implementers across orders 5, 8, 9 and 10.

## Decision
Everything is in `localStorage`, nothing on a server.

| Key | Holds |
|---|---|
| `viking.progress` | JSON: levels cleared, best time, bracteates, most skilling and "cleared without losing a heart" per level, and a version mark `v` |
| `viking.feather`, `viking.featherGold` | `"1"` when the maze has given the feather, and the gold one |
| `viking.crowned` | set when all ten runes are held; the gold helmet |
| `maze.records`, `maze.ghost.<level>` | the maze's marks and best-run ghosts |
| `larshansen.muted` | sound off, shared by all three |

- Reads are forgiving: missing, old or broken data is a fresh start, never an error.
- A `viking.progress` without the version mark comes from the short first three levels: its
  runes and bracteates are kept; best time, skilling and clean mark for those three are cleared
  once, and it is written back with `v: 2`.
- Hearts, lives and carried skilling are not saved. They last a visit.
- `?debug&cleared=…` pretends progress without storing it.

## Not chosen
- Accounts or a server-side save. A personal site on a Pi.
- Keeping best times from the short levels. They would be unbeatable.
- Saving lives across visits. A returning visitor starts with three.
