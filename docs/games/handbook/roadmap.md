# Roadmap

As of the night of 17 November 2026. Change this file in the same change that makes it wrong.

## Status

| | |
|---|---|
| Date | 17 November 2026, about 00:30 |
| Last live | Order 27, the neon invaders (the glamour, ADR 0050) |
| Lars | Away from 17 November for about two and a half weeks; standing permission in [`conversations.md`](conversations.md) |
| Weekly allowance | 68 % used when order 27 was reviewed; resets Saturday 21 November 11:00. No new round above 75 %, nothing heavy at 80 % |
| Paused? | No. One round at a time |

## In flight

Nothing. Order 27 is live. What it left: what enemies throw is not glammed; the lean is per level, not per kind; a kind met in
several levels was looked at in place only in its first; line 2's ending card was checked in code only; the four stings are unheard;
a worktree under `~/.cache` measures the first script 2 kB larger than the main checkout does and nobody knows why
(`apps/viking/tools/review/o27/`).

Order 26 (the ground, small flags, spruce spires, rat tails, amber wasps; ADR 0049) is live.
What it left: lamp posts, railings, panel doors, the sauna rafts, sheds' plank walls, the
rowing boat and carriers' bodies are not textured; the ground was not added to order 22's
saturation and value band test; it reports the stone at Gamlebyen, Ekeberg and Akershus as
busier than before (`apps/viking/tools/review/o26/after.md`): ask Lars whether figures still
stand out there on a phone.

## Next

**Order 28, the last flat things**: a sweep of everything in the lane still drawn as plain rectangles (order 26's list above, the line
map, anything else a look finds), each judged against the whole game: what he does with it, whether it fits its level, and whether
the glamour should touch it. Then the ground joins order 22's band test.

## After that: ideas in rough order of value

None of these is decided. Each has a reason.

1. **Meet Loki.** ADR 0050 keeps him for later. A final boss or an encore after VIKING: a
   front man on a stage, the glamour at its thickest. The ending of line 2 could lead to it.
2. **Tune by play.** No level has been tuned by a person. Ask Lars to play line 1 start to end
   and say where it is unfair, boring or unclear; turn that into an order. The reviews'
   weak-spot lists (HANDOVER, "Known weak spots") are the starting list.
3. **What only a person can judge**, collected from the hand-backs, to put to Lars as a short
   checklist when he has ten minutes:
   - Phone (order 21): the sliding move pad, a held jump, long-press and pull-down doing
     nothing, "Go in" at a door, turning the phone mid-level, the see-through buttons on snow
     and in the dark, any missed tap. On a notched phone on its side the camera can jump when
     he turns near the Dash button (known, not fixed).
   - Motion (orders 23 to 25): does his run read as running; is the idle fidgety; is the
     landing felt; do the strips of water read as depth or shimmer; are things in front a
     distraction; is the "!" on every thrower too much; does the edge arrow help.
   - Sound: nobody has heard any of it.
4. **The camera's jump on notched phones** (order 21's one "partly").
5. **Stortinget's escalator shafts**: 3,600 of its 9,950 rectangles a frame.
6. **Way 1 for him alone** (GRAIN.md): only if he still reads as a blob on a phone after way 3.
7. **The 240-pixel upright view** (ADR 0019): at 200 everything is a fifth larger. A question
   for Lars with two pictures, not a thing to decide for him.
8. **The maze** has had none of orders 18 to 27: its help line still names keys on touch; its
   figures are in the old style; it knows nothing of the glamour.
9. **The front page** is frozen by its 28 pictures. If Lars wants the new hero or the glamour
   there, that is a decision to unfreeze it (new references, an ADR).
10. **More frames where order 23 stopped**: no climbing or hanging poses exist because the game
    has no such states.
11. **Norwegian.** ADR 0016 says both languages; check that orders 21 to 27 added both for
    every new line (the touch notes, the story).

## Questions waiting for Lars

Kept in [`conversations.md`](conversations.md), "Questions waiting for Lars". Do not let them
block work: pick the reading that is cheapest to undo, say which you picked, carry on.

## Known debts in the tools

- The front page references live in `/tmp` and die on reboot.
- `review.sh` and `frontgate.sh` in [`scripts/`](scripts/) have this session's scratch paths
  written into them: set `S` before using them.
- The viking suite takes about three minutes alone and over five when two implementers run;
  the deploy runs it too. One slow hook has a ten-minute timeout for that reason.
- `tools/pictures.ts` retakes LEVELS.html's pictures; a hit in the first steps blanks a
  headless picture (HANDOVER, "The harness").
