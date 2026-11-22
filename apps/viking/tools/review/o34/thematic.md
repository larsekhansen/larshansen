# Order 34, item 4: every level against "difficulty and enemies follow the place"

Lars, 22 November 2026 (relayed): "keep line 2 harder". "Keep the difficulty thematic. Is it a touch part of town? Hard. Big event? Can
also be hard. Less so, lean easy. Also keep enemies thematic." (The relaying session reads "touch" as "tough".) The rule is in DESIGN
("The levels") and ADR 0055. **This is a table of proposals only: no level is retuned and no enemy moved in order 34, because he has
not played yet.** When he has, his notes and this table make the next order.

**How hard the reviews say it is now**: the sloppy player (`tools/review/fresh.ts`), each level's scripted route with a person's timing
laid over every key, on seeds 201 to 260, at ±2 and ±4 steps, measured on 22 November 2026 on `origin/main` (`136450f`, the rules this
order did not change): hearts lost a run, and how many of 60 runs clear (a run that ends off the route mostly fell where the route never
goes; it is a lower bound on difficulty, not a person). Remember what the sloppy player is: the route's plan, which knows every answer,
with a person's timing. Holmenkollen's inrun steers itself and the sledge carries him, so both read easy to it.

**What it is in Oslo**: *tough* (a rough or hard place to be), *big event* (a day the city turns out for), *calm* (an everyday or quiet
place). **Belongs**: whether each enemy is something that lives there, works there or comes to its event (glammed), in its season.

## Line 1, LARS HANSEN

| Level | The place | In Oslo | Hearts a run ±2 / ±4 (clear of 60) | Enemies, and whether each belongs | Rule and numbers | Proposal |
|---|---|---|---|---|---|---|
| Langkaia (L) | The Opera's quay and the harbour saunas | calm | 0.15 / 0.77 (59, 55) | pigeons ×4, gulls ×3, a rat: all of the quay and the harbour | agree: calm, easy, the first level | none |
| Akershus festning (A) | The medieval fortress over the harbour | calm (a guarded historic park) | 0.52 / 0.97 (46, 21: most runs leave the route on the walls) | guards ×7 (the fortress is guarded: works there), fire baskets ×4 (the fortress's torches and braziers), crows ×2, rats ×2: all belong | agree: calm and easy by hearts; the walls lose the sloppy player more than they hurt it | none; watch the walls when he plays |
| Rådhuset (R) | City Hall and its square; the Peace Prize | big event (the Peace Prize, the story's joke) | 0.77 / 1.23 (55, 45) | pigeons ×4 (the square's), gulls ×4, two throwing chips (the harbour's), an e-scooter (the harbour front's): all belong | agree: a big event may be hard; the carillon is its hard part | none |
| Slottet (S) | 17 May on Karl Johan, up to the palace | big event (the biggest of the year) | 0.05 / 0.32 (60, 60): the easiest of line 1 | pigeons ×7, gulls ×5, a hot-dog cart (17 May's own: the hot dogs): pigeons and gulls belong to Karl Johan but say little of the day | **disagree**: the biggest event in the city is the easiest level (by design "the easy breather before the mountain") | make 17 May busier: the parade and the crowd as the obstacle (more to weave through, banners on a tighter beat), toward line 1's middle (about 1.0 at ±4); and give two or three of the seven pigeons to the day's own (a glammed russ in red overalls with a whistle; a kid's balloon cart). Or keep it the breather, if Lars likes the rest before the mountain |
| Holmenkollen (H) | The ski jump; the ski festival | big event (Holmenkollen Sunday) | 0.10 / 0.27 (59, 54): the inrun steers itself | snowball kids ×2, crows ×2, foxes ×2, a fire basket (the festival crowd's bonfires): belong; **a hedgehog**: does not (hedgehogs sleep through the winter) | the mountain and a big event may be hard; the sloppy player cannot judge the lip, which is the test for a person | swap the hedgehog for a winter thing that stays put and hurts (a second bonfire basket of the crowd's); judge the difficulty after he has played the lip. **Done in order 35, differently**: a mountain hare in its white winter coat in the hedgehog's place (true of a winter hill; the same box, speed, behaviour and frames, so a drawing only), glammed with neon spikes along its back; on the planner's reading of "Also keep enemies thematic", easy to undo (`look: "hare"` in `levels/holmenkollen.ts`) |
| Akerselva (A) | Down the river from Nydalen to Vaterland | tough (its lower reaches by Vaterland) | 0.82 / 2.52 (60, 58): among the hardest | salmon ×4 (they jump the river), rats ×3, wasps ×2, a gull, a duck, a hedgehog (a summer river), a disposable grill (summer evenings along the river): all belong | agree: a rough stretch of town may be hard | none |
| Nordmarka (N) | The forest north of the city, at night; the troll | calm (the city's forest) | 0.65 / 2.00 (59, 56; 4 Game overs at the troll in 60 at ±4) | foxes ×3, owls ×2, squirrels ×2, a hedgehog, a bat, an anthill: all of the forest; the troll (a Norwegian forest's own) | **disagree**: a calm forest is among the hardest, nearly all of it the troll's third round | ease the troll's last round a little (a longer stuck club, or the dawn's pool a tile wider), so the forest leans easier and the first boss stays a test; measure the Game overs again |
| Stortinget (S) | The T-bane station under the parliament | calm (an everyday station; busy) | 1.28 / 1.78 (56, 43) | pigeons ×3 (one flying), rats ×2 and track rats ×3 (the tracks'), a trolley and an umbrella (commuters'), an e-scooter: belong (the scooter least: they are ridden above, not below) | **disagree, mildly**: by design "a breather under the city", it measures harder than its neighbours (the trains and the third rail) | ease toward the breather it was meant to be (the trains' waits, the third rail's stretch), about 1.2 at ±4; the e-scooter could become a commuter's bicycle |
| Ekeberg (E) | The hillside over Gamle Oslo: the sculpture park, the Scream's viewpoint | calm (a park) | 1.38 / 1.72 (38, 27: most runs leave the route at the quarry's sheep or in a gust) | magpies ×4, crows ×3, hedgehogs ×2, squirrels ×2, wasps ×2: all of a park on an evening in summer; the sheep on its knolls too | **disagree, mildly**: a calm park is one of line 1's harder levels (order 23's longer edge already eased it from 2.58) | ease the gust over the sculptures' small drops and the sheep chain over the quarry (a knoll a tile nearer, or a gust a beat shorter), toward 1.2 at ±4 |
| Gamle Oslo (N) | Vålerenga and Kampen's roofs, the church, Kruttverket; the plough | tough (the old east side) and the end of line 1 | 1.07 / 1.63 (35, 24: many runs leave the roofs' route or time out) | crows ×3, cats ×2 (the back yards'), a snowball kid, a fox (the city's winter foxes), an owl (the churchyard's): all belong; the plough (a winter street's) | agree: the old east side and the last boss of line 1 may be hard | none |

## Line 2, VIKING

| Level | The place | In Oslo | Hearts a run ±2 / ±4 (clear of 60) | Enemies, and whether each belongs | Rule and numbers | Proposal |
|---|---|---|---|---|---|---|
| Bygdøy (V) | The museum peninsula: the Viking ships, Fram, the beaches | calm (museums, beaches) | 0.40 / 0.80 (60, 60) | crabs ×2 (the beaches'), gulls ×3, a pigeon, rats ×3 (the quays'), slingers ×3 (vikings, at the Viking ships): belong; penguins ×2: not of Oslo, but a museum's joke on Fram's voyage south, which the level makes | agree: a calm place, line 2's gentle start, where the shield is taught | none |
| Vigelandsparken (I) | The sculpture park in Frogner Park | calm (a park full of visitors) | 1.90 / 2.32 (60, 59): the hardest of line 2 | statues ×6 in granite and ×2 in bronze, the Angry Boy, two ring-throwing granite groups (the park's own sculptures, glammed), crows ×4, a pigeon: all belong | **disagree**: a calm park is line 2's hardest level | ease the statues a little (the step at the Wheel of Life between a statue behind and one on the plinth, the courtyard's), toward 1.5 at ±4, and let the tough places and the finale take line 2's top |
| Korketrekkeren (K) | The sledge run from Frognerseteren | big event, of a kind (every winter weekend's crowd) | 0.02 / 0.23 (60, 60): the easiest level of all | boys with snowballs ×3, sledgers ×3, a crow, an owl, a fox: all belong | **disagree**, with a caveat: the sledge carries him, so a person's timing matters less to the sloppy player than ducking at speed will to a person | judge after he has played the run; if it is easy for him, more to duck and jump (sledgers closer together, a second barrier) |
| Østensjøvannet (I) | The bird lake, a nature reserve | calm | 0.20 / 0.72 (60, 60) | ducks ×3, coots ×2, swans ×3, nesting gulls ×3 (the lake's gull colony): all belong | agree: the calm one of line 2 | none |
| Bjørvika (N) | The building site behind the Opera, high up | tough (a hard-hat site) | 0.52 / 1.60 (60, 60) | riveters ×4 (the site's workers), pigeons ×6, rats ×2, a crow: belong; six pigeons say little of a building site | agree in kind: a tough place, hard; it could be harder (order 16 wanted about 3 at ±4) | after he has played: tighten the traverse or the jib girder toward 2 at ±4; one or two pigeons could become the site's own (a glammed surveyor with a theodolite, a forklift) |
| Gamlebyen (G) | The medieval ruins and the harbour; the sea serpent | calm by day, but line 2's finale, where the city's big summer festival was held | 0.47 / 1.07 (60, 59) | rats ×2, an owl, guards ×3 who were statues (the bishop's), archers ×2 (the town wall's), geese ×2 (the park's water), a dog (its walkers'): all belong; the serpent (the old shore's) | **disagree, mildly**: the end of the harder line is in its middle | after he has played: let line 2 end on its hardest (the serpent's second and third rounds, or the walls that close behind him), about 1.5 to 2 at ±4 |

## The encore

| | The place | In Oslo | Hearts a run ±2 / ±4 (clear of 60) | Enemies | Rule | Proposal |
|---|---|---|---|---|---|---|
| Middelalderparken | A festival stage on the water | big event | 0.08 / 0.65 (60, 60) | Loki alone | a big event may be hard | none: Lars, of its difficulty: "leave it as it is" |

## Line 2 against line 1

Lars: "keep line 2 harder". By the sloppy player at ±4 today, it is not: line 1's ten average 1.32 hearts a run (0.27 to 2.52), line 2's
six 1.12 (0.23 to 2.32). (Order 17's numbers, which the question to him was based on, had line 2 harder; orders 17 to 33 eased or changed
much since.) Two cautions: many runs of line 1 leave the route (Akershus 39 of 60 at ±4, Gamle Oslo 26, Ekeberg 33, Stortinget 17), which
makes its numbers lower bounds; and line 2 asks for the shield, which the sloppy player holds as it holds a direction.

**Proposal**, after he has played: let line 2's tough places and its finale carry its difficulty (Bjørvika's site, the sledge run's crowd,
Gamlebyen's walls and serpent) toward 1.5 to 2 at ±4, ease the calm park that is its hardest now (Vigelandsparken), and keep Bygdøy and
Østensjøvannet gentle. On line 1, Slottet (the biggest event, the easiest level) and Nordmarka (a calm forest made hard by the troll) are
the clearest disagreements with the rule; Holmenkollen's hedgehog in the snow was the one enemy out of its season (a mountain hare since
order 35).

## The numbers

| Level | ±2 hearts a run | ±2 clear | ±4 hearts a run | ±4 clear |
|---|---|---|---|---|
| Langkaia | 0.15 | 59 | 0.77 | 55 |
| Akershus festning | 0.52 | 46 | 0.97 | 21 |
| Rådhuset | 0.77 | 55 | 1.23 | 45 |
| Slottet | 0.05 | 60 | 0.32 | 60 |
| Holmenkollen | 0.10 | 59 | 0.27 | 54 |
| Akerselva | 0.82 | 60 | 2.52 | 58 |
| Nordmarka | 0.65 | 59 | 2.00 | 56 |
| Stortinget | 1.28 | 56 | 1.78 | 43 |
| Ekeberg | 1.38 | 38 | 1.72 | 27 |
| Gamle Oslo | 1.07 | 35 | 1.63 | 24 |
| Bygdøy | 0.40 | 60 | 0.80 | 60 |
| Vigelandsparken | 1.90 | 60 | 2.32 | 59 |
| Korketrekkeren | 0.02 | 60 | 0.23 | 60 |
| Østensjøvannet | 0.20 | 60 | 0.72 | 60 |
| Bjørvika | 0.52 | 60 | 1.60 | 60 |
| Gamlebyen | 0.47 | 60 | 1.07 | 59 |
| The encore | 0.08 | 60 | 0.65 | 60 |

`bun fresh.ts levels=<id> ks=2,4 seeds=60 first=201 out=<file>` in `tools/review`, on `origin/main`'s code at `136450f` (its rules are the
branch's: no rule changed in order 34). The run files are not kept (the `out/` rule); their md5s for the seven levels order 34 had to hold
are in `after.md`.
