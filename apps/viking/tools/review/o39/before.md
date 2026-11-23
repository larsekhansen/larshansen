# Order 39: the sheets order 38 did not see in place (item 3), and the table kept honest (item 4)

Looked at on branch `rest-of-the-table`, from `origin/main` at `a52f15b` (after order 38). Pictures and working files outside the
repository, in `~/.cache/claude-scratch-larshansen/o39/`: `shots/item3-before/` (every subject below in place, by day and under its level's
own sky), `same/before/` (order 35's 176 places of every level, by day and at night), `work/` (the subjects, their pixels and the measures'
logs), `bin/` (the scripts). The measures, a row a subject: `rim.tsv` (the bosses and Loki, what is thrown, the carriers, the pickups) and
`props.tsv` (the props kit's pieces), both here.

## How

- **What was photographed** (`bin/subjects.ts`): every boss state that matters along its scripted route (the troll asleep, walking, its club
  raised, hit, stone; the plough parked, driving, revving, stuck, beaten; the serpent's ring, rearing, spitting, dazed, lashing; Loki
  strutting, his club, posing, revving, his ring, plain), every carrier of every level at a step it is shown (81), what each of the eight
  throwers throws in flight twelve steps after it left (he stands a few tiles in front of the first of its kind), and in every level a
  skilling, the cheese, the bracteate, the rune stone, a bench and a flag (96): 206 subjects, 412 pictures at 390 x 844, each with the camera
  on it (`?debug&look=`), by day and under its level's own sky (a level pinned to day at night, Langkaia, which follows the clock, in the
  evening). The props: every piece of the props kit each level draws (52 pieces of 30 kinds, `bin/props.ts`), found in order 35's pictures of
  every level by day and at night (`same/before/`).
- **Can it be told from the ground behind it**, measured as the contrast (CIEDE2000) between its rim and the pixel just outside it, every
  rim pixel against each of its neighbours outside, the median given (and in the logs the tenth percentile and the share under 10):
  - what the page outlines (the bosses and Loki, what is thrown): its outline found in the picture by day by its exact colour (the warning
    red, else the calm pale) nearest where the camera put it, the ground outside filled in from round it (`bin/outline.py`); the same pixels
    in the picture under its own sky;
  - what it is not (the carriers, the pickups, the props): its own pixels, drawn by the game's own drawing at that step, found in the
    picture by day where its colours match (within 24 a channel: the street's backdrop is washed 0.08 toward the air), its edge against the
    pixel beyond (`bin/rim.py`, `bin/propsrim.py`; a prop's edge only where the pixel beyond is no prop's).
  - **Limits**, said plainly: a subject found by less than 80 % of its colours is not measured (Langkaia's rafts and Akerselva's logs lie in
    the water and bob, Nordmarka's dark changes every colour, a few pickups were off the middle); those were looked at by eye
    (`work/v-carriers.png`): each is told by its yellow paint first. A prop measured 0 is one joined to scenery of its own colours (a
    railing's next span drawn by the level, a post into the deck it holds), not a prop that cannot be seen. A level pinned to day is never
    met at night: its night measure is shown but not ranked.

## What was found

**What is thrown** (the order: it matters most, it hurts and it is small). By day every thrown thing stands 47 to 53 off what is round it.
Under its level's own sky, before order 39:

| Thrown | Level, its sky | By day | Its own sky | Why |
|---|---|---|---|---|
| bolts | Bjørvika, evening | 52.3 | **16.5** | its glow (hot pink) lies right against its red outline |
| arrows | Gamlebyen, night | 52.5 | **21.2** | the same, its glow orange |
| chips | Rådhuset (day; night shown) | 47.1 | 22.9 | the same |
| a nesting gull's dive | Østensjøvannet, twilight | 43.7 | 23.7 | the same |
| sling stones | Bygdøy (day; night shown) | 51.3 | 33.0 | |
| stone rings | Vigelandsparken (day) | 52.7 | 57.0 | |
| snowballs | Holmenkollen, winter day | 52.5 | 52.5 | (no glow by day) |
| pine cones | Nordmarka, twilight under its dark | 44.8 | 44.8 | order 32's dark pixel already there |
| the serpent's ball | Gamlebyen, night | 52.5 | 56.9 | |

**The bosses and Loki**, as met (by day where a level is pinned to day, else under its own sky): the troll 30.7 (its club raised) to 61.7,
the plough 31.6 (driving) to 60.4, the serpent 56.9 to 60.6, Loki 25.9 (posing) to 61.2. By day, which their levels never show, the plough
and the serpent's neck outlined in the calm pale stand only 9 to 18 off the snow and the pale sky (a harmless state). The troll asleep and
walking in Nordmarka's dark, and the serpent's ring of foam, were not found by their outline's exact colour (the dark changes it; the ring
is a light): looked at by eye (`work/v-troll.png`), the troll walking reads by its red outline and glow, asleep it is a boulder in the dark
(as meant), the ring is the violet over the water.

**The carriers**, by level, the worst as met: Slottet's Guard 10.9 (by its paint), Gamle Oslo's tram at night 8.1, Gamlebyen's longships
15.4, Bygdøy's ferry 15.8, Bjørvika's hooks 16.3, Vigelandsparken's jets 19.4, Ekeberg's trams 23.0, Stortinget's trains 28.5, Rådhuset's ferry
21.1, Holmenkollen 44.4, Akershus's hoist 50.5 (5.2 at night, its chains; never met so). Every carrier is told first by the yellow paint on
what he stands on (ADR 0044), which its edge measure does not count.

**The pickups**, by kind (in how many levels found; the worst three as met; the median as met): skilling 15 of 16, Bygdøy 15.5, Langkaia
(evening) 17.2, Ekeberg 17.7, median 35.7; the cheese 14, Ekeberg 15.0, Langkaia 18.3, Bjørvika 21.0, median 34.5; the bracteate 14, Langkaia
(evening) 14.5, Ekeberg 14.5, Bjørvika 23.4, median 41.6; the rune stone 12, Østensjøvannet 13.5, Ekeberg 30.5, Langkaia 31.2, median 48.8;
the bench 14, Gamle Oslo 10.5, Gamlebyen 16.4, Langkaia 16.7, median 26.1; the flag 14, Stortinget 12.7, Rådhuset 17.3, Akershus 18.2, median
23.5. What he takes against an evening sky (Langkaia's, Ekeberg's, Bjørvika's) is warm on warm: copper, amber and the cheese's brown on a
pinkish brown.

**The props** (`props.tsv`): 23 kinds found in place; the lowest real measures are scenery kept quiet on purpose (ADR 0042, 0049, 0051: a
prop that is not a thing to use must not compete), the old-town lantern at night (its glass is lit), the encore's truss and speaker stacks
at night (never met so: the encore is an evening), Ekeberg's tube railing at night 7.6.

## The ten worst, as met, and what became of each

| | Subject | As met | What was done |
|---|---|---|---|
| 1 | Gamle Oslo's tram, at night | 8.1 | left: a carrier, told by its lit windows and the paint on its roof |
| 2 | Gamle Oslo's bench, at night | 10.5 | left: a thing to use, told by its cyan corners (ADR 0039) |
| 3 | Slottet's Guard on parade (carrying him) | 10.9 | left: told by the paint on their caps |
| 4 | Stortinget's flag | 12.7 | left: its cloth reads (the flag's red and white cross); its pole is thin on the pale wall |
| 5 | Østensjøvannet's rune stone, at twilight | 13.5 | left: the stone is grey on grey planks, its rune lit; it glows when he is near |
| 6 | The bracteate at Langkaia (evening) and Ekeberg | 14.5 | left, for the planner: what he takes against an evening sky (below) |
| 7 | The cheese at Ekeberg | 15.0 | left, as 6 |
| 8 | Gamlebyen's longships, at night | 15.4 | left: carriers, told by their paint |
| 9 | The skilling at Bygdøy (by day) | 15.5 | left: copper on Bygdøy's warm ground by day |
| 10 | Gamlebyen's bench, at night | 16.4 | left, as 2 |
| (11) | **Bjørvika's bolts, in its evening** | **16.5** | **mended**, with every thrown thing: below and `after.md` |

What is thrown was mended first, as the order asks, though the bolt is eleventh: it is the only thing on the list that hurts, and it is
small. The carriers, benches and the flag are told by their role's mark (the paint, the cyan corners), which the edge measure does not count.
**Left for the planner**: what he takes against an evening sky (6, 7, 9 and the skilling at Langkaia, 17.2) could take the maze's own rule
for a thing to take, a one-pixel dark line round it, after dusk; it would change every coin in every evening picture, so it is a decision
about the look, not a mend, and is not built.

## Item 4: order 38's table, marked again

Order 38's marks (`../o38/before.md`) as they stand after order 39: no 3s; the 2s that remain, each with why it was left.

| Sheet | Name | Met in | Mark in order 38 | Mark now | Why |
|---|---|---|---|---|---|
| `him` | the viking | all | 1 | **1** |  |
| `enemy-anthill` | anthill | nordmarka | 1 | **1** |  |
| `enemy-archer` | archer | gamlebyen | 1 | **1** |  |
| `enemy-bat` | bat | nordmarka | 1 | **1** |  |
| `enemy-boy` | the Angry Boy | vigelandsparken | 1 | **1** |  |
| `enemy-brazier` | brazier | akershus | 1 | **1** |  |
| `enemy-bronze` | bronze statue | vigelandsparken | 1 | **1** |  |
| `enemy-cat` | cat | nabolaget | 1 | **1** |  |
| `enemy-coot` | coot | ostensjovannet | 2 | **1** | was 2; redrawn in order 39: plump and black with its head up, the white shield and bill in the pale (no sheen or lean touches it), big lobed toes |
| `enemy-crab` | crab | bygdoy | 1 | **1** |  |
| `enemy-crow` | crow | akershus, holmenkollen, ekeberg, nabolaget, vigelandsparken, korketrekkeren, bjorvika | 3 | **1** | was 3; redrawn in order 38 as a hooded crow beating through four shapes (held by `alive/frames.test.ts`) |
| `enemy-dog` | dog | gamlebyen | 1 | **1** |  |
| `enemy-duck` | mallard | akerselva, ostensjovannet | 1 | **1** |  |
| `enemy-fox` | fox | holmenkollen, nordmarka, nabolaget, korketrekkeren | 1 | **1** |  |
| `enemy-goose` | goose | gamlebyen | 1 | **1** |  |
| `enemy-grill` | disposable grill | holmenkollen, akerselva | 1 | **1** |  |
| `enemy-guard` | fortress guard | akershus | 1 | **1** |  |
| `enemy-guard (the bishop's)` | the bishop's guard | gamlebyen | 2 | **1** | was 2; redrawn in order 39: a kettle hat with its brim, the bishop's cross, the halberd levelled with its axe-blade across the shaft; told from Akershus's guard by the brim and the levelled halberd (74 pixels apart) |
| `enemy-gull` | gull | langkaia, radhuset, slottet, akerselva, bygdoy | 3 | **1** | was 3; redrawn in order 38 as a herring gull beating through four shapes |
| `enemy-gull (thrower)` | gull with chips | radhuset | 1 | **1** |  |
| `enemy-hedgehog` | hedgehog | holmenkollen, akerselva, nordmarka, ekeberg | 1 | **1** |  |
| `enemy-hotdog` | hot-dog cart | slottet | 1 | **1** |  |
| `enemy-kid` | kid with snowballs | holmenkollen, nabolaget, korketrekkeren | 1 | **1** |  |
| `enemy-magpie` | magpie | ekeberg | 1 | **1** |  |
| `enemy-nester` | nesting gull | ostensjovannet | 1 | **1** |  |
| `enemy-owl` | owl | nordmarka, nabolaget, korketrekkeren, gamlebyen | 1 | **1** |  |
| `enemy-penguin` | penguin | bygdoy | 1 | **1** |  |
| `enemy-pigeon` | pigeon | langkaia, radhuset, slottet, stortinget, bygdoy, vigelandsparken, bjorvika | 1 | **1** |  |
| `enemy-pigeonfly` | pigeon in flight | stortinget | 3 | **1** | was 3; redrawn in order 38, broad wings beating through four shapes |
| `enemy-rat` | rat | langkaia, akershus, akerselva, stortinget, bygdoy, bjorvika, gamlebyen | 1 | **1** |  |
| `enemy-ringer` | ring-throwers | vigelandsparken | 1 | **1** |  |
| `enemy-riveter` | riveter | bjorvika | 1 | **1** |  |
| `enemy-salmon` | salmon | akerselva | 2 | **1** | was 2 (3 for its tell); order 38 drew its water breaking, order 39 held it still at its fullest with reduced motion, so its tell is seen with motion and without |
| `enemy-scooter` | e-scooter | radhuset, stortinget | 3 | **1** | was 3; redrawn in order 38 as a hire scooter, wheels, deck, stem, lamp |
| `enemy-sledger` | sledger | korketrekkeren | 1 | **1** |  |
| `enemy-slinger` | viking with a sling | bygdoy | 1 | **1** |  |
| `enemy-squirrel` | squirrel | nordmarka, ekeberg | 2 | **1** | was 2; redrawn in order 39: its tail a plume flicked back at the tip with sky between it and its back, tufted ears, the cone it holds the cone it throws |
| `enemy-statue` | granite statue | vigelandsparken | 1 | **1** |  |
| `enemy-swan` | swan | ostensjovannet | 1 | **1** |  |
| `enemy-trackrat` | track rat | stortinget | 2 | **2** | left: the rat holds; its tell (three dark stones on the third rail's red cover) is small with motion or without, and since order 39 held still with reduced motion. Making it larger changes the picture with motion: for a later round |
| `enemy-trolley` | shopping trolley | stortinget | 1 | **1** |  |
| `enemy-umbrella` | umbrella | stortinget | 1 | **1** |  |
| `enemy-wasp` | wasp | akerselva, ekeberg | 2 | **1** | was 2; its beat touched up in order 38 (four shapes, held by the test) |
| `boss-loki` | Loki | encore | 1 | **1** |  |
| `boss-plough` | the snow plough | nabolaget | 1 | **1** |  |
| `boss-serpent` | the sea serpent | gamlebyen | 1 | **1** |  |
| `boss-troll` | the troll | nordmarka | 1 | **1** |  |
| `maze-adder` | an adder | jernhaugen | 1 | **1** |  |
| `maze-dweller` | the mound-dweller | jernhaugen | 2 | **1** | was 2; order 38 gave him a face, order 39 a peaked hood, the cloak in folds and one hand on his knee |
| `maze-ghost` | the ghost of your best run | jernhaugen | 1 | **1** |  |
| `maze-him` | the viking in the mound, with his torch | jernhaugen | 1 | **1** |  |
| `maze-key` | the rune key | jernhaugen | 1 | **1** |  |
| `maze-portal` | a teleport stone | jernhaugen | 1 | **1** |  |
| `maze-raven` | the raven | jernhaugen | 3 | **1** | was 3; redrawn in order 38, 10 x 13 with a hooked bill and a pale eye |
| `maze-stone` | a standing stone | jernhaugen | 1 | **1** |  |
| `harmless-heron` | heron | ostensjovannet | 1 | **1** |  |
| `harmless-sheep` | sheep | akershus, ekeberg | 1 | **1** |  |
| `pickup-bench` | bench | all | 1 | **1** |  |
| `pickup-bracteate` | gold bracteate | all | 1 | **1** |  |
| `pickup-cheese` | brown cheese | all | 1 | **1** |  |
| `pickup-feather` | raven's feather | nordmarka | 1 | **1** |  |
| `pickup-flag` | flag | all | 1 | **1** |  |
| `pickup-pole` | ski pole | holmenkollen | 2 | **2** | left: a ski pole is a line; carried at his side it is a pixel wide, with its grip, strap and basket. Holds in place |
| `pickup-rune` | rune stone | all | 1 | **1** |  |
| `pickup-shield` | shield | bygdoy | 1 | **1** |  |
| `pickup-skilling` | skilling | all | 1 | **1** |  |
| `thrown-archer` | arrows | gamlebyen | 1 | **1** |  |
| `thrown-gull (thrower)` | the gull's chips | radhuset | 1 | **1** |  |
| `thrown-kid` | snowballs | holmenkollen, nabolaget, korketrekkeren | 1 | **1** |  |
| `thrown-nester` | a nesting gull's dive | ostensjovannet | 1 | **1** |  |
| `thrown-ringer` | stone rings | vigelandsparken | 1 | **1** |  |
| `thrown-riveter` | bolts | bjorvika | 1 | **1** |  |
| `thrown-slinger` | sling stones | bygdoy | 1 | **1** |  |
| `thrown-squirrel` | pine cones | nordmarka, ekeberg | 1 | **1** |  |
| `carrier-akerselva` | the logs and the water wheel's buckets | akerselva | 1 | **1** |  |
| `carrier-akershus` | the hoist | akershus | 1 | **1** |  |
| `carrier-bjorvika` | the hoist, the crane hooks and the steel sheets | bjorvika | 1 | **1** |  |
| `carrier-bygdoy` | the ferry, the raft and the reeds | bygdoy | 1 | **1** |  |
| `carrier-ekeberg` | the trams | ekeberg | 1 | **1** |  |
| `carrier-gamlebyen` | the longships | gamlebyen | 1 | **1** |  |
| `carrier-holmenkollen` | the chairlift and the tower lift | holmenkollen | 1 | **1** |  |
| `carrier-langkaia` | the rafts and the rowing boat | langkaia | 1 | **1** |  |
| `carrier-nabolaget` | the trams | nabolaget | 1 | **1** |  |
| `carrier-nordmarka` | the moose | nordmarka | 1 | **1** |  |
| `carrier-radhuset` | the ferry, the tower lift, the bell and the clock's hands | radhuset | 1 | **1** |  |
| `carrier-slottet` | the banners and the Guard | slottet | 1 | **1** |  |
| `carrier-stortinget` | the trains | stortinget | 1 | **1** |  |
| `carrier-vigelandsparken` | the fountain's jets | vigelandsparken | 1 | **1** |  |
| `prop-baluster` | balusters | slottet | 2 | **2** | left: one baluster is tiny on its sheet; Slottet draws them in a row, which reads as a balustrade |
| `prop-barrier` | crowd barrier | slottet | 1 | **1** |  |
| `prop-chair` | chairlift chair | holmenkollen | 1 | **1** |  |
| `prop-container` | site container | bjorvika | 1 | **1** |  |
| `prop-ferry` | the City Hall ferry | radhuset | 1 | **1** |  |
| `prop-fire basket` | fire basket | akershus | 2 | **2** | left: the basket alone on its sheet; in place its fire flickers in it (drawn apart) and it reads |
| `prop-gate lantern` | gate lantern | vigelandsparken | 1 | **1** |  |
| `prop-gate pillar` | gate pillar | vigelandsparken | 1 | **1** |  |
| `prop-gondola` | gondola | radhuset | 1 | **1** |  |
| `prop-hut door` | plank door | langkaia | 1 | **1** |  |
| `prop-ladder` | ladder | langkaia | 1 | **1** |  |
| `prop-lamp old` | old-town lantern | ekeberg, nabolaget, gamlebyen, encore | 1 | **1** |  |
| `prop-lamp park` | park lantern | vigelandsparken | 1 | **1** |  |
| `prop-lamp square` | square lamp | radhuset | 1 | **1** |  |
| `prop-leg` | the diving tower's legs | langkaia | 1 | **1** |  |
| `prop-light pole` | lit-trail pole | korketrekkeren | 1 | **1** |  |
| `prop-log` | log | akerselva | 1 | **1** |  |
| `prop-panel door` | panel door | stortinget, nabolaget | 1 | **1** |  |
| `prop-plank wall` | plank wall | langkaia, nabolaget | 1 | **1** |  |
| `prop-pontoons` | sauna raft pontoons | langkaia | 2 | **2** | left: under the sauna rafts and mostly under water; a player sees their tops |
| `prop-post` | post | langkaia, holmenkollen, nabolaget | 2 | **2** | left: a post lit on its left with a cap and a dark foot; in place under the club deck and at Holmenkollen station it reads as a post |
| `prop-rail bars` | iron railing | radhuset, nabolaget | 1 | **1** |  |
| `prop-rail tube` | tube railing | langkaia, slottet, ekeberg | 2 | **2** | left: ADR 0051 keeps a rail a line with a glint, never a lit top that reads as a ledge; in place it reads as a railing |
| `prop-roof truss` | the stage's roof truss | encore | 1 | **1** |  |
| `prop-rowboat` | rowing boat | langkaia | 1 | **1** |  |
| `prop-sauna cabin` | sauna cabin | langkaia | 1 | **1** |  |
| `prop-site fence` | site fence | bjorvika | 1 | **1** |  |
| `prop-speaker stack` | speaker stack | encore | 1 | **1** |  |
| `prop-stove pipe` | stove pipe | langkaia | 2 | **2** | left: three pixels of steel pipe; in place, with its smoke, the hut's and the sauna's chimney |
| `prop-tram` | tram | ekeberg, nabolaget | 1 | **1** |  |
| `prop-truss tower` | lighting tower | encore | 1 | **1** |  |
