# Order 19: what every event looked and sounded like before

The code at `origin/main` after order 18 (the merge of PR #64), with only the frame-strip tool added
(`?debug&strip`, `tools/glance/strips.ts`). Each event was staged by `tools/glance/events.tsv` and drawn every
third step for 30 steps (half a second), cropped round him (or round the thing), by day and at night, at 1280 x
800 and 390 x 844; the strips are `/tmp/shots-felt/before/<event>_<sky>_<width>.png` (`stack.py` puts the four
of an event together). Sounds were recorded as the page played them. "Reduced motion" is read from the code
(`view.reduced`). What did not differ between day and night or the two widths is said once; where it did, it
is said.

Two things held for every event: **the page froze the rules for two steps** after every stomp and hit (not in
the tests: the page and the tests did not play quite the same game), and at night his blink after a hit was a
dark figure at a quarter strength on a dark ground, hard to see at all.

| Event | Seen in the half second after | Heard | Reduced motion |
|---|---|---|---|
| He is hit (Langkaia's pigeon) | He is knocked back and blinks at a quarter strength every other 4 steps; the view jumps 2 px for 6 steps; a heart in the header goes faint at once. At night the blink is barely there. | `hurt` (a falling square and a burst of noise) | Drawn at half strength the whole time; no jump |
| He stomps an enemy (Langkaia's first) | A flat cream bar the enemy's width for 3 steps, six cream squares fly out, its skilling rises; he bounces; view jumps 2 px down | `stomp` | The same squash and puff (not held back), no jump |
| A stomp that does not kill (a bounce off the plough while it reels) | Only his bounce: no event in the rules at all | nothing | nothing |
| He takes a skilling | Four one-pixel sparks; the header's count changes its digits, nothing more | `coin`, climbing | No sparks |
| He takes the cheese | Eight sparks; the slice is gone; the lives number changes | `life` | No sparks |
| He takes a bracteate | Ten gold sparks; the disc is gone; the gold count in the header appears or changes | `gold` | No sparks |
| The feather (out of the mound, on the map) | It floats down swaying for 100 steps to his shoulder, his line in a bubble (outside the first half second, the strip shows him only) | nothing at all, also when it lands | No sway |
| The pole (Holmenkollen's rune, first time) | Only the rune's sparks and flight; the pole is mentioned on the card | `pickup` `hurra` | as it is |
| The shield (given at Bygdøy's prow) | Ten gold sparks, his words in a bubble, the Shield button | `fanfare` | No sparks |
| The shield turns a thrown thing | Four grey sparks at the shield's face | `stomp`: the same as a stomp | No sparks |
| A flag goes up | It climbs the pole in a second; the tick appears at the top when it is up | `flag` (three rising notes) | Tick at once |
| He sits on a bench | He sits; every heart in the header full at once; nothing marks the bench afterwards | `bench` | as it is |
| He takes a rune | Eight glowing sparks, the rune flies to its slot, the card | `pickup` (and `hurra` where the level has a flourish) | No sparks |
| He lands from a fall of more than three tiles | Five dust grains, as after any landing faster than 3 px a step: a jump's landing looks and sounds the same | `land` | No dust |
| He falls in water | The foam is drawn **at the flag he is put back at**, not where he went in; a heart faint in the header; he blinks at the flag | `splash` | No foam |
| He falls in a pit | The same foam as water, at the flag; the camera follows him down into the dark first | `splash`, as water | No foam |
| He loses a life | Back at the flag, every heart full at once, the lives number one lower | `hurt` only | as it is |
| Game over | The card | `over` (and `hurt`) | as it is |
| A ledge on a beat is about to go (Rådhuset's bell) | The warning shimmer: a pale box round it, blinking every 8 steps for a second | nothing | **The shimmer still blinks, 3.75 times a second** |
| ... and goes | It is gone | nothing | as it is |
| A lily pad or a balsa bundle starts to sink | No tell before; it starts down, a few bubbles; he goes in with it | nothing, then `splash` | No bubbles |
| A carrier arrives and leaves (Stortinget's local) | It stops at the platform, the board counts down; nothing tells it is about to go | nothing | as it is |
| A statue wakes and freezes (Vigelandsparken) | Walking: eyes, dust at its feet, a walking pose (an outline change of 46 pixels); stone again: plain | nothing | as it is |
| A thrower winds up and throws (Rådhuset's gull) | A second's wind-up; the gull's pose changes by 13 pixels of outline (the slinger 15, the archer 14, the ring-thrower 16); the throw flies | nothing, wind-up or throw | as it is |
| A swan turns on him (Østensjøvannet) | Its neck goes down, it swims nearer, hissing as drawn | nothing | Drawn still |
| A door opens (a station on the map) | The door opens, he walks in, the scene fades | `door` | No walk-in |
| The troll's tell | The club raised for a second, in violet | nothing (the windup had no sound) | as it is |
| The troll is hit (the dawn) | A third of it to stone; the view jumps; the rules freeze 2 steps | `stone` | No jump |
| The troll is beaten | A boulder with the rune | `fanfare` | as it is |
| The plough's tell | It revs, blade and beacons violet | `hiss` | Beacons burn still |
| The plough is hit (a stomp on its cab) | It reels; the view jumps 3 px | `stone` | No jump |
| The plough is beaten | It parks | `fanfare` | as it is |
| The serpent's tell | It rears, its throat swells violet | `hiss` (the same as the plough's) | as it is |
| The serpent is hit (a stomp on its dazed head) | It reels; the view jumps | `stone` | No jump |
| The serpent is beaten | It sinks; the dawn | `fanfare` | as it is |
| A station opens on the map (after a level's first clear) | Nothing: he arrives at the station he cleared; the next is simply open | nothing | as it is |
| Line 2 opens (Vålerenga's first clear) | Nothing on the map; the gate is gone (the card said so) | nothing | as it is |

## By rule

1. Silent: the dud stomp (and invisible), the feather's landing, every throw, the pads and bundles, the carriers,
   the statues, the swans, the troll's tell, a station or line 2 opening. Not where it happened: the splash and
   the pit's "splash" (at the flag). Not in its role's colour: the puff (cream for every enemy).
2. The hit: no flash, no hold of the picture (but a freeze of the rules in the page), the heart only fades, the
   blink is lost at night, nothing at one heart.
3. The stomp: a cream bar, not the enemy's shape; the dud stomp is nothing at all.
4. Pickups: sparks and a changed number; the cheese, bracteate and pole have no moment of their own.
5. No tremble on anything that gives way; the wind-ups of the gull, slinger, archer and ring-thrower change little
   outline; a guard woken from stone changed only colour (0 pixels of outline).
6. Water and pit sound and look the same, both at the wrong place.
7. Flags keep their tick; benches and stations keep nothing.
8. Reduced motion: the ledges' warning shimmer still blinks at 3.75 a second (Rådhuset's bells, Holmenkollen's
   ice ledges' cracks, the kit's ledges), and the glint of the troll's raised club at 5; the hit has no still
   answer beyond his half strength.
9. The fireworks at Slottet put 66 sparks in the air at once; the sparks list was filtered (a new array) every step.
10. The block and the stomp were one sound; the plough's and the serpent's tells were one sound.
