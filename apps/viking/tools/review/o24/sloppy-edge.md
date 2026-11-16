# Order 24, section 3: the edge, place by place

ADR 0048 keeps ten steps of forgiveness at an edge (a jump still works 10 steps after walking off one; 6 before order 23)
though the sloppy player did worse on 31 of 1,920 runs (`../o23/sloppy-edge.md`). This finds out why at each place, moves
what could be moved, and measures again. The sloppy player is `fresh.ts` on seeds 201 to 260 at ±2 and ±4 (`coyote.ts` sets
the steps before it), compared seed by seed with `edgecmp.py`; one seed is replayed with 6 and 10 side by side, step by step,
with `edgeplace.ts`, which says where the two runs part, what the jump did there, and every heart lost after.

## What the late jump does

Every place where 10 did worse is the same thing: **a short drop followed by a jump.** He walks off a step one or two tiles
high (a crate, a ledge, a stack of crates onto a deck), which takes 11 to 16 steps to fall, and the route's next move is a jump
from the floor below (to stomp what stands there, or to hop what is in the way). The sloppy player presses that jump up to k
steps early. With 6 steps of forgiveness a press 7 to 10 steps after leaving the edge is too late to jump from the edge, so it
is kept (a press is kept 6 steps before landing) and the jump goes from the floor as the route meant. With 10 it is not too
late: the jump goes at once, in the air, from a few pixels below the edge, higher and earlier than the route meant, and is
often cut short as the route lets go of the key on its own schedule. The two windows overlap: 10 steps after leaving an edge
and 6 before landing meet on any drop shorter than 16 steps.

| Place (order 23's list) | Seeds replayed | What the late jump did | What was done |
|---|---|---|---|
| Langkaia, the pigeon on the longship's deck (column 205) | ±4 205, 218, 254 (and 227, 243 later) | Off the crates at column 201, two tiles above the deck: the jump for the stomp fired in the air 8 or 9 steps after he left them, was cut short, and dropped him in front of the pigeon, which hit him | The pigeon a tile on (206): the press now comes after he lands, as with 6. Those three seeds are no longer worse. |
| Akershus, the keep's guards (columns 221 to 232) | ±2 204, 220, 222, 226, 258; ±4 216 | Not the guards: off the ledge at column 210, a tile above the floor, the walk's hop over the brazier at 213 fired in the air; he came down elsewhere, a moment early or late, and met the guards and the crow 1 to 15 seconds later in a different phase of their patrols | The brazier a tile on (214), its arc of skilling with it: no run does worse with 10 (1 better, 119 the same). |
| Vålerenga, the terrace's dash and the first roofs | ±2 236, 244, 245, 248, 256, 257; ±4 221, 232, 234 | Not the terrace: off the crate at column 87, a tile above the street, the jump to stomp the fox at 90 fired in the air; the runs then part in time and lose their hearts later (the cat at 104, the crow at 141, the plough's charge, the terrace's dash) | The fox a tile on (91). The route times its stomp by where the fox is, so the press still comes in the drop: the runs still part there (±4 222, 231, 248, 257). Better at ±2, still worse at ±4. |
| Stortinget, two runs that left the route | ±2 253, ±4 240 | At the last stairs (columns 236 and 266) the hop up fired in the air; he came down a step lower than the route expects and the sloppy player stopped there ("off route"), with no heart lost | Nothing: it is the sloppy player's. The reach search finds no spot in Stortinget reached only with 10 (`../o23/reach-edge.txt`) and the tests find no dead end, so a person landing there walks on. With 10 Stortinget's runs leave the route less often: 35 times in 120 with 6, 21 with 10. |
| Ekeberg, six runs that left the route | ±4 213, 215, 232, 233, 259, 260 (and 221, 234) | The leap over the quarry's first gap at column 88: with 6 the late leap fails and he falls in (4 to 7 hearts a run); with 10 it carries him over and the route goes on. The runs leave the route much later, crossing the quarry on the sheep (column 149) | Nothing: the edge did what it should here. The sheep crossing is where the sloppy player loses its way whatever the edge does: 48 of 120 runs end there with 6, 49 with 10. |

## The five places' levels, 6 against 10, before and after the moves

Hearts lost a run (runs that did not clear, in brackets).

| Level | ±2, 6 → 10, before | after | ±4, 6 → 10, before | after | runs worse with 10, before → after |
|---|---|---|---|---|---|
| Langkaia | 0.15 → 0.15 | 0.15 → 0.15 | 0.77 → 0.85 | 0.70 → 0.77 | 6 → 5 |
| Akershus | 0.52 → 0.53 | 0.52 → 0.52 | 1.00 → 0.93 | 0.98 → 0.97 | 6 → 0 |
| Vålerenga | 1.15 → 1.27 | 1.20 → 1.07 | 1.47 → 1.60 | 1.37 → 1.63 | 9 → 11 |
| Stortinget (not moved) | 1.28 → 1.28 | | 1.80 → 1.78 | | 2 |
| Ekeberg (not moved) | 1.55 → 1.38 | | 2.58 → 1.72 | | 8 |

## With 8

The same five levels with 8 steps (after the moves), for the choice:

| Level | ±2 with 6 | with 8 | with 10 | ±4 with 6 | with 8 | with 10 |
|---|---|---|---|---|---|---|
| Langkaia | 0.15 (1) | 0.15 (1) | 0.15 (1) | 0.70 (5) | 0.77 (5) | 0.77 (5) |
| Akershus | 0.52 (14) | 0.52 (14) | 0.52 (14) | 0.98 (39) | 0.98 (39) | 0.97 (39) |
| Vålerenga | 1.20 (27) | 1.17 (28) | 1.07 (25) | 1.37 (39) | 1.50 (37) | 1.63 (36) |
| Stortinget | 1.28 (10) | 1.28 (3) | 1.28 (4) | 1.80 (25) | 1.78 (17) | 1.78 (17) |
| Ekeberg | 1.55 (25) | 1.38 (22) | 1.38 (22) | 2.58 (30) | 1.87 (34) | 1.72 (33) |

8 does not cure Langkaia (its late presses come 6 to 9 steps after the edge) and halves Vålerenga's rise; it keeps most of
Ekeberg's gain.

## The order's wanted result, and what is not met

Wanted: no level's hearts lost a run higher with 10 than with 6 at ±2 or ±4, and no run that left the route. **Not met** for
Langkaia at ±4 (0.70 → 0.77: five seeds a heart worse, one better; in four of the five the heart is lost 10 to 60 seconds after
the runs part, elsewhere, as the two runs have come to the later places at different moments) and Vålerenga at ±4 (1.37 →
1.63). Runs that left the route with 10 and not with 6 remain at Stortinget (2, the sloppy player's, above), Ekeberg (the sheep)
and Vålerenga (the first roofs, "walk to 2108", after the runs parted at the fox).

Moving more things a tile would chase the places where the runs part (Langkaia has three more short drops before a hop:
columns 78, 114, 154), and at Vålerenga moving the fox did not stop the parting, since the route times its stomp by the fox.
The mechanism, not the places, is the cause: so the choice is Lars's. Three ways, none taken here:

1. Keep 10 (ADR 0048), accepting that on short drops a jump pressed before landing can go from the air.
2. Go back to 6 (or 8, which does not help Langkaia).
3. A rule rather than a number: after walking off an edge, a press in the last of the 10 steps is kept for the landing when the
   ground below is near enough to be reached within the 6 steps a press is kept (so a late jump off an edge still works over
   a gap or a pit, and a press made while dropping onto a floor waits for it). It changes `stepBody` in the kit, which the front
   page shares, and needs its own record.

## All sixteen levels after section 3

Seeds 201 to 260, ±2 and ±4, 6 against 10, seed by seed (`edgecmp.py`); order 23's table is `../o23/sloppy-edge.md` (55 better,
31 worse). Eleven levels run exactly as in order 23 (nothing in them changed); Akershus, Langkaia and Vålerenga are measured
with their moves.

| Level | runs | better | worse | same | hearts a run at ±2, 6 → 10 | at ±4, 6 → 10 |
|---|---|---|---|---|---|---|
| akerselva | 120 | 0 | 0 | 120 | 0.82 → 0.82 | 2.52 → 2.52 |
| akershus | 120 | 1 | 0 | 119 | 0.52 → 0.52 | 0.98 → 0.97 |
| bjorvika | 120 | 0 | 0 | 120 | 0.52 → 0.52 | 1.60 → 1.60 |
| bygdoy | 120 | 0 | 0 | 120 | 0.40 → 0.40 | 0.80 → 0.80 |
| ekeberg | 120 | 18 | 8 | 94 | 1.55 → 1.38 | 2.58 → 1.72 |
| gamlebyen | 120 | 0 | 0 | 120 | 0.47 → 0.47 | 1.07 → 1.07 |
| holmenkollen | 120 | 0 | 0 | 120 | 0.10 → 0.10 | 0.27 → 0.27 |
| korketrekkeren | 120 | 0 | 0 | 120 | 0.02 → 0.02 | 0.23 → 0.23 |
| langkaia | 120 | 1 | 5 | 114 | 0.15 → 0.15 | 0.70 → 0.77 |
| nabolaget | 120 | 15 | 11 | 94 | 1.20 → 1.07 | 1.37 → 1.63 |
| nordmarka | 120 | 0 | 0 | 120 | 0.65 → 0.65 | 2.00 → 2.00 |
| ostensjovannet | 120 | 0 | 0 | 120 | 0.20 → 0.20 | 0.72 → 0.72 |
| radhuset | 120 | 0 | 0 | 120 | 0.77 → 0.77 | 1.23 → 1.23 |
| slottet | 120 | 0 | 0 | 120 | 0.05 → 0.05 | 0.32 → 0.32 |
| stortinget | 120 | 17 | 2 | 101 | 1.28 → 1.28 | 1.80 → 1.78 |
| vigelandsparken | 120 | 2 | 0 | 118 | 1.90 → 1.90 | 2.38 → 2.32 |
| all | 1920 | 54 | 26 | 1840 | | |

Worse:
- ekeberg ±4 seed 213: clear, 4 hearts → offroute, 0 hearts (last move across on the sheep, hurts at [])
- ekeberg ±4 seed 215: clear, 4 hearts → offroute, 2 hearts (last move across on the sheep, hurts at [1548, 1708])
- ekeberg ±4 seed 221: clear, 1 hearts → clear, 2 hearts (last move walk to 4024, hurts at [1555, 1665])
- ekeberg ±4 seed 232: clear, 6 hearts → offroute, 1 hearts (last move across on the sheep, hurts at [1549])
- ekeberg ±4 seed 233: offroute, 2 hearts → offroute, 3 hearts (last move across on the sheep, hurts at [1505, 1662, 1705])
- ekeberg ±4 seed 234: clear, 2 hearts → clear, 3 hearts (last move jump 1, hurts at [1684, 1709, 3908])
- ekeberg ±4 seed 259: clear, 4 hearts → offroute, 1 hearts (last move across on the sheep, hurts at [1548])
- ekeberg ±4 seed 260: clear, 7 hearts → offroute, 1 hearts (last move across on the sheep, hurts at [1709])
- langkaia ±4 seed 208: clear, 0 hearts → clear, 1 hearts (last move jump 0, hurts at [3018])
- langkaia ±4 seed 212: clear, 1 hearts → clear, 2 hearts (last move jump 0, hurts at [759, 3289])
- langkaia ±4 seed 226: clear, 0 hearts → clear, 1 hearts (last move jump 0, hurts at [1717])
- langkaia ±4 seed 227: clear, 2 hearts → clear, 3 hearts (last move jump 0, hurts at [1575, 1729, 2473])
- langkaia ±4 seed 243: clear, 1 hearts → clear, 2 hearts (last move jump 0, hurts at [1593, 2662])
- nabolaget ±2 seed 201: clear, 2 hearts → offroute, 1 hearts (last move walk to 2108, hurts at [1450])
- nabolaget ±2 seed 226: clear, 0 hearts → offroute, 0 hearts (last move walk to 2108, hurts at [])
- nabolaget ±4 seed 201: offroute, 1 hearts → offroute, 2 hearts (last move walk to 2108, hurts at [828, 1454])
- nabolaget ±4 seed 222: clear, 2 hearts → timeout, 2 hearts (last move the dash: off the terrace's edge, the dash, onto the cab, hurts at [1174, 2867])
- nabolaget ±4 seed 231: clear, 1 hearts → clear, 3 hearts (last move jump 0, hurts at [812, 3097, 3317])
- nabolaget ±4 seed 234: offroute, 1 hearts → timeout, 4 hearts (last move the dash: off the terrace's edge, the dash, onto the cab, hurts at [1428, 2279, 2867, 2867])
- nabolaget ±4 seed 243: offroute, 0 hearts → offroute, 3 hearts (last move walk to 2108, hurts at [2242, 2439, 2502])
- nabolaget ±4 seed 248: clear, 5 hearts → offroute, 3 hearts (last move walk to 2108, hurts at [833, 828, 1436])
- nabolaget ±4 seed 253: offroute, 0 hearts → offroute, 1 hearts (last move walk to 1994, hurts at [1449])
- nabolaget ±4 seed 255: clear, 0 hearts → clear, 1 hearts (last move walk to 3496, hurts at [3321])
- nabolaget ±4 seed 257: clear, 1 hearts → timeout, 4 hearts (last move the dash: off the terrace's edge, the dash, onto the cab, hurts at [840, 2257, 2867, 2867])
- stortinget ±2 seed 253: clear, 1 hearts → offroute, 1 hearts (last move jump 1, hurts at [2331])
- stortinget ±4 seed 240: clear, 1 hearts → offroute, 1 hearts (last move jump 1, hurts at [2207])
