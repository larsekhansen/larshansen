# 0058. The theme: calm Oslo against the loud glamour

Decided 2026-11-28 by Lars, in his answers relayed by his other session (`docs/games/handbook/conversations.md`); written down by the
order 47 implementer (`docs/games/orders/47-what-lars-said-second.md`, item 4). Within [0050](0050-the-glamour.md) and
[0052](0052-the-encore.md), whose limits stand; gives a reason to [0055](0055-what-lars-said.md)'s rule that a level's difficulty
and enemies follow its place.

## Context

Lars, 28 November, after asking for more detail on Loki and for faces when he talks:

> Maybe that's a good general theme anyway, making Oslo quaint, Nordic-national-romantic, less technological, less crowded, calm?
> Maybe there are some character tropes to push here too. Like how Dutch people are so direct. What are Norwegians? Like, the bad
> guys are glam, neon, lights, American, loud. Norwegians and Norway is like described above. Of course it doesn't quite explain why
> loki, considering the pantheon, is siding with him. But then maybe that makes for an interesting plot reason. He is the god of
> mischief. And why would he really like the nordics anyway, they fucked him over. Yeah. It kinda does make sense.

And: "And the dichotomy."

## Decision

- **The game has two sides, and they are told apart in everything.** Oslo, and its people, are calm, quaint and Nordic-romantic: the
  old wooden houses, the fjord and the forest, wool and wood and stone, snow, a thermos, a queue for the sauna, a straight face; few
  people, little technology, nothing loud. The glamour Loki lays over it is loud: neon, lights, glitter, big hair, hair spray, a stage,
  a show, American in its manner. Natural colours are Oslo, neon is the glamour (0050); quiet is Oslo, loud is the glamour.
- **Loki's reason** is mischief, and a grudge: he is the god of mischief, and the gods of the north wronged him (in the old stories
  they bound him), so he has no love for the north. A man who sulked over a prize paid him (0050), and he took the money and did it
  his own way. That reason may be told in the game **only in lines the planner or Lars writes later**; no word in the game changes for
  it now. The story's limits stand exactly as they are (0050, 0052): the man who paid is named, never drawn, never quoted, not a
  character.
- **What follows from it, for whoever draws or writes next.** The hero is the calm one: quiet faces, wool and iron, a winter evening
  (order 47's portraits put him beside Loki for that reason). A place's enemies are its own creatures and things, glammed (0055); a
  figure of the place's own is preferred to one that could be anywhere (order 47: the hare at Holmenkollen, the balloon cart on 17
  May, the forklift on the building site, the commuter's bicycle under the parliament). Scenery stays quiet and natural; noise, neon
  and glitter are the invaders' alone.
- **Plans asked for and not decided here** (the planner writes them): the city rebuilt along Oslo's real streets and station names,
  the front page as a home with a door for each project, and what the runes spell or do. This record only says what side of the
  theme each would stand on.

## Not chosen

- **A national caricature** of either side: the theme is about manner (calm against loud, natural against neon), not about a people.
  No real person is drawn or quoted; the satire is of public behaviour, as before (0050).
- **Telling Loki's grudge in the game now**: Lars asked for the theme to be written down; lines that tell it are for him or the
  planner to write.

## Consequences

`apps/viking/docs/DESIGN.md` has a section, "Calm Oslo, loud glamour", saying this in plain words with his words quoted. Nothing in
the game changed for this record; the talk panel ([0057](0057-faces-when-they-talk.md)) is its first use.

## Amended 28 November 2026 by order 48: the dichotomy, seen

Order 48 (`docs/games/orders/48-the-dichotomy.md`) made the theme visible in the levels, by drawing only; no route, box, speed, timing,
heart, enemy placement or word changed, and the plans of 28 November (the real-Oslo rebuild, the front page as a home, the runes) were
not touched. What was decided, by the planner on Lars's behalf from his sentence ("making Oslo quaint, Nordic-national-romantic, less
technological, less crowded, calm ... the bad guys are glam, neon, lights, American, loud"), and how each is undone, is in
`docs/games/handbook/conversations.md`; the table it was chosen from is `apps/viking/tools/review/o48/before.md`, the result `o48/after.md`.

- **A place that is honestly modern stays modern and is quietened** (Stortinget): fewer signs (the T roundel and the station's name once a
  screen and a half, half the posters) and muted colour (the band and the posters' blocks an old enamel's). The station is not made old.
- **Details of the national romantic kind where the place truly has them**, one or two a screen, as pieces of the props kit
  (`alive/props.ts`: `dragonHead`, `bargeBoard`, `skis`, with `carvedWood` and `skiWood` for a level's own material): Frognerseteren's
  dragon heads and barge board, skis against its wall and against Holmenkollen station's post. Holmenkollen's name board an old enamel
  sign with the name in capitals (it read as a screen).
- **The glamour louder where it read tame**: the encore's stage glitters with sequins and burns a marquee of bulbs along its mouth while
  the glamour is on (lit after dark), and both go with the glamour: plain, the cloth is black and the bulbs dark glass.
- **The characters**: one or two marks each of what the theme says they are, every box, frame and timing kept: him (wool and iron) the
  knit's band across his yoke and rivets on his helmet's rim; the troll (stone and moss) a stone in its back and a young spruce on its
  shoulders; the plough (the municipality's own) its fleet number and its blade's marker rod; the serpent (the fjord's) barnacles and
  kelp. Slottet's balloon carts redrawn (two balloons, sheen-free colours) and the crowd's flags kept off where they walk.
- **Held**: every look's glammed self differs from its natural self in half its pixels or more, but by name (`alive/natural.test.ts`): the
  wasp (amber and black, by Lars's word), the ring-throwers (granite, by the park's idea), and the fox and the cat, whose own orange is
  near the glamour's. Those two were found here and **left for a decision**: a neon of their own would change four levels.
- **Not mended, with why**: Langkaia (its glamour reads small; it is the first script's level, and what it draws costs every visitor),
  Vigelandsparken and Ekeberg (their statues and their Scream's sky are their ideas), and the levels marked 1.
