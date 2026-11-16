# The games: handbook

Written 16 November 2026 by the planning session (Claude Fable 5.2), because Lars asked:

> remember to document everything. all choices and design choices. adrs. Make a documentation
> folder and go ham i guess. make it so that the next claude can start and know whats been done,
> what might go next thatt hasnt been done, what has been discussed, etc. choices made, direction
> not chosen. and so on. References to assets, resources used, tools used, lessons learned, etc.
> stuff to improve you for the next run, essentially.

[`../HANDOVER.md`](../HANDOVER.md) says what exists and is kept current by every implementer.
This folder holds what the handover does not: what the planner knew and never wrote down.

| File | What it is for |
|---|---|
| [`start-here.md`](start-here.md) | Ten minutes: what the project is, how it is run, what state it is in, what to do first |
| [`conversations.md`](conversations.md) | What Lars said, in his words, and what came of each thing: chosen, not chosen, still open |
| [`roadmap.md`](roadmap.md) | What is being built, what is planned next, the backlog, and the questions waiting for Lars |
| [`playbook.md`](playbook.md) | How to run one round from order to live site, with the commands |
| [`lessons.md`](lessons.md) | What went wrong, what the planner got wrong, and what to do differently |
| [`resources.md`](resources.md) | Tools, debug addresses, pages published for Lars, reference games, where files live on the Pi |
| [`scripts/`](scripts/) | The planner's own review scripts, which lived in a temporary folder until now |

Reading order for a new session: `CLAUDE.md` at the root, then `start-here.md`, then
`../HANDOVER.md`, then whatever the task touches. The decision records are in
[`../../adr/`](../../adr/README.md); the orders in [`../orders/`](../orders/).

Keep it true. `roadmap.md` and `conversations.md` go stale fastest: change them in the same
change that makes them wrong. Privacy (ADR 0014) holds here as everywhere: no street addresses,
nothing about a wedding.
