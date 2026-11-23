# Order 38, item 1: every figure looked at first, and ranked

Looked at on branch `a-third-look` with nothing of order 38 in it but `?debug&natural` (every invader drawn as its natural self in place,
drawing only under `?debug`, commit `e4bb21e`). Nothing here is retuned.

- **The sheets**: `bun tools/figures.ts` on `origin/main` (190fcad) into `~/.cache/claude-scratch-larshansen/o38/figures-before/`: 119 sheets
  and `figures.json`, each looked at at four times on the neutral ground (`work/m1.png` to `m8.png` there are the montages).
- **In place**: every enemy look in the first level it is met in, 390 x 844 (a plain phone: an art pixel a screen pixel), the camera on it
  (`look=`) one step in, by day and under its level's own sky (a level pinned to day taken at night, Langkaia, which follows the clock, in the
  evening), glammed and natural (`&natural`): 168 pictures, `shots/inplace-before/`, each look's four cropped and enlarged three times in
  `shots/inplace-before-crops/<look>.png` (glammed over natural, day left). The maze's raven and mound-dweller inside the viking page
  (`shots/maze-before/`), Langkaia's hut and diving tower at 1280 x 850 for the props (`shots/props-before/`). The addresses are in
  `work/places-all.tsv`, `places-maze.tsv`, `places-props.tsv`.
- **Not looked at in place this round**: the bosses, Loki, the carriers, what is thrown, the pickups and most props were looked at on
  their sheets only (orders 28 to 37 photographed each in place; nothing of theirs changed since). The props the order named were looked at in
  place (Langkaia's club hut and diving tower), the ski pole on his side in the walk's pictures.
- **Measures** (`bin/firstrow.py measures`, from each sheet's first row, its first frame): the colours it uses but the outline's (the
  near-black line, the warning red, the calm pale), and the share of its pixels in its commonest colour. They helped little: a lens in five
  tones is still a lens. The judging was by eye; what decided a 3 is said in the last column.

Columns: does its **silhouette** say what it is without colour; does it have a **light side and a dark side**; does its **movement** read
(wings, legs, wheels); does it **belong** where it is met (ADR 0055: enemies belong where they are met); colours and the commonest colour's
share; the **mark** (1 holds, 2 holds with a weakness, 3 does not read).

| Sheet | Name | Met in | Silhouette | Light and dark | Movement | Belongs | Colours | One colour | Mark | Why |
|---|---|---|---|---|---|---|---|---|---|---|
| `him` | the viking | all | yes | yes | runs by distance, four frames; breath, blink | yes | 24 | 12 % | **1** | helmet, cape, tunic: the reference for the rest |
| `enemy-anthill` | anthill | nordmarka | yes | yes | ants (tiny) | yes | 5 | 45 % | **1** |  |
| `enemy-archer` | archer | gamlebyen | yes | yes | draws, looses | yes | 8 | 35 % | **1** |  |
| `enemy-bat` | bat | nordmarka | yes | yes | wings beat | yes | 6 | 41 % | **1** |  |
| `enemy-boy` | the Angry Boy | vigelandsparken | yes | yes | stamps, howls | yes | 7 | 35 % | **1** |  |
| `enemy-brazier` | brazier | akershus | yes | yes | flames | yes | 5 | 30 % | **1** |  |
| `enemy-bronze` | bronze statue | vigelandsparken | yes | yes | as the statue | yes | 7 | 44 % | **1** |  |
| `enemy-cat` | cat | nabolaget | yes | yes | walks | yes | 7 | 43 % | **1** |  |
| `enemy-coot` | coot | ostensjovannet | partly | yes | walks | yes | 8 | 60 % | **2** | a dark round bird with its white shield; a blob at phone size, but a coot is one |
| `enemy-crab` | crab | bygdoy | yes | yes | scuttles | yes | 5 | 47 % | **1** |  |
| `enemy-crow` | crow | akershus, holmenkollen, ekeberg, nabolaget, vigelandsparken, korketrekkeren, bjorvika | no | partly | no: the gull's frames in plum, the same beat | yes | 5 | 44 % | **3** | a dark lens with a beak; not a crow (Oslo's crow is the hooded crow, grey and black) |
| `enemy-dog` | dog | gamlebyen | yes | yes | runs | yes | 8 | 47 % | **1** |  |
| `enemy-duck` | mallard | akerselva, ostensjovannet | yes | yes | waddles | yes | 10 | 22 % | **1** |  |
| `enemy-fox` | fox | holmenkollen, nordmarka, nabolaget, korketrekkeren | yes | yes | trots, tail up and down | yes | 6 | 49 % | **1** |  |
| `enemy-goose` | goose | gamlebyen | yes | yes | walks, hisses | yes | 6 | 38 % | **1** |  |
| `enemy-grill` | disposable grill | holmenkollen, akerselva | yes | yes | flames | yes | 6 | 34 % | **1** | a disposable grill on legs |
| `enemy-guard` | fortress guard | akershus | yes | yes | marches | yes | 10 | 54 % | **1** |  |
| `enemy-guard (the bishop's)` | the bishop's guard | gamlebyen | partly | yes | walks, halberd levelled (its tell) | yes | 9 | 28 % | **2** | drawn small for the box Gamlebyen keeps (13 x 9): a round helmet over a tabard with a cross and a halberd; a blob with a spike at phone size. A candidate for a later round |
| `enemy-gull` | gull | langkaia, radhuset, slottet, akerselva, bygdoy | no | partly | no: wings three rows over its back, squashed to the box Langkaia, Rådhuset, Slottet and Akerselva keep; a frame differs from the next by 12 pixels, most of it a bob | yes | 4 | 43 % | **3** | a lens with a beak: white on white, its wingtips run into the outline; no tail |
| `enemy-gull (thrower)` | gull with chips | radhuset | yes | yes | rears to throw (its wind-up), looks down | yes | 9 | 41 % | **1** | a gull standing: wing, tail and legs all read; the planner's yardstick for the gull in the air |
| `enemy-hedgehog` | hedgehog | holmenkollen, akerselva, nordmarka, ekeberg | yes | yes | walks | partly | 9 | 46 % | **1** | reads well; at Holmenkollen out of its season (`o34/thematic.md`, order 35's hare reverted): left for Lars |
| `enemy-hotdog` | hot-dog cart | slottet | yes | yes | rolls | yes | 13 | 19 % | **1** |  |
| `enemy-kid` | kid with snowballs | holmenkollen, nabolaget, korketrekkeren | yes | yes | raises the snowball, throws | yes | 13 | 20 % | **1** |  |
| `enemy-magpie` | magpie | ekeberg | yes | yes | hops, tail | yes | 9 | 28 % | **1** | the planner's yardstick: wing shape, tail, a pose |
| `enemy-nester` | nesting gull | ostensjovannet | yes | yes | dives | yes | 9 | 27 % | **1** |  |
| `enemy-owl` | owl | nordmarka, nabolaget, korketrekkeren, gamlebyen | yes | yes | four wing shapes, seen from the front | yes | 6 | 33 % | **1** |  |
| `enemy-penguin` | penguin | bygdoy | yes | yes | waddles | partly | 8 | 34 % | **1** | reads; whether it belongs at Bygdøy is in `o34/thematic.md` |
| `enemy-pigeon` | pigeon | langkaia, radhuset, slottet, stortinget, bygdoy, vigelandsparken, bjorvika | yes | yes | walks, head nodding as a foot lands | yes | 11 | 33 % | **1** |  |
| `enemy-pigeonfly` | pigeon in flight | stortinget | no | partly | no: wings two rows over its back; two frames differ by 5 pixels | yes | 10 | 35 % | **3** | a lens with a beak, as the gull |
| `enemy-rat` | rat | langkaia, akershus, akerselva, stortinget, bygdoy, bjorvika, gamlebyen | yes | yes | runs, its tail trailing | yes | 6 | 36 % | **1** |  |
| `enemy-ringer` | ring-throwers | vigelandsparken | yes | yes | throws rings | yes | 9 | 73 % | **1** |  |
| `enemy-riveter` | riveter | bjorvika | yes | yes | throws bolts | yes | 11 | 22 % | **1** |  |
| `enemy-salmon` | salmon | akerselva | yes | yes | the leap reads; its tell (the water before it leaps) is a line of foam blinking on and off, nothing with reduced motion | yes | 2 | 60 % | **2** | the fish holds; the sheet's "oval and two rings" are the ripple and the splash, foam drawn plain on the page and outlined only by the sheet; in place they read as a dash on the water, not water breaking (3 for the tell) |
| `enemy-scooter` | e-scooter | radhuset, stortinget | no | partly | its wheels turn, but under the deck where the squash to its kept box hides them | yes | 6 | 28 % | **3** | an L-shaped tube: no wheels to see, no deck, no grips, no lamp; not the hire scooter left on a pavement that the joke needs |
| `enemy-sledger` | sledger | korketrekkeren | yes | yes | leans in, slides | yes | 12 | 19 % | **1** |  |
| `enemy-slinger` | viking with a sling | bygdoy | yes | yes | swings the sling | yes | 8 | 40 % | **1** |  |
| `enemy-squirrel` | squirrel | nordmarka, ekeberg | partly | yes | raises the cone | yes | 9 | 55 % | **2** | the curled tail is most of it; sitting up with a cone, it reads at 4x, less at phone size |
| `enemy-statue` | granite statue | vigelandsparken | yes | yes | stiff stride; stone while watched | yes | 7 | 43 % | **1** |  |
| `enemy-swan` | swan | ostensjovannet | yes | yes | swims, rears | yes | 6 | 43 % | **1** |  |
| `enemy-trackrat` | track rat | stortinget | yes | yes | rises, tops, falls kicking | yes | 1 | 100 % | **2** | its first row (three dots) is the ballast stirring between the rails before it leaps: three grey pebbles drawn plain, never outlined on the page; the sheet outlined them, so a player never sees it so (the sheet fixed in order 38). The rat itself holds |
| `enemy-trolley` | shopping trolley | stortinget | yes | yes | wheels turn | yes | 8 | 28 % | **1** |  |
| `enemy-umbrella` | umbrella | stortinget | yes | yes | spins, turns inside out | yes | 5 | 36 % | **1** |  |
| `enemy-wasp` | wasp | akerselva, ekeberg | yes | yes | partly: two of its wing frames differ by 5 pixels | yes | 8 | 34 % | **2** | amber and black say wasp; the beat's first two frames are one blob |
| `boss-loki` | Loki | encore | yes | yes | every move | yes | 15 | 35 % | **1** |  |
| `boss-plough` | the snow plough | nabolaget | yes | yes | every phase | yes | 13 | 56 % | **1** |  |
| `boss-serpent` | the sea serpent | gamlebyen | yes | yes | every phase | yes | 9 | 42 % | **1** |  |
| `boss-troll` | the troll | nordmarka | yes | yes | every phase | yes | 7 | 36 % | **1** |  |
| `maze-adder` | an adder | jernhaugen | yes | yes | waves, tongue | yes | 6 | 30 % | **1** |  |
| `maze-dweller` | the mound-dweller | jernhaugen | partly | partly | his eyes follow him | yes | 4 | 44 % | **2** | on the sheet a grey block: his amber eyes are drawn by the maze apart from his frame, so the sheet never shows a face; in place they are there, in the dark of his hood (2). Three tones of grey, no folds or hands |
| `maze-ghost` | the ghost of your best run | jernhaugen | yes | yes | as him, pale | yes | 24 | 12 % | **1** |  |
| `maze-him` | the viking in the mound, with his torch | jernhaugen | yes | yes | side, back and face, by distance | yes | 25 | 11 % | **1** |  |
| `maze-key` | the rune key | jernhaugen | yes | yes | flies up when taken | yes | 7 | 28 % | **1** | small, but gold and a bow |
| `maze-portal` | a teleport stone | jernhaugen | yes | yes | cools, flashes | yes | 8 | 49 % | **1** |  |
| `maze-raven` | the raven | jernhaugen | no | partly | head turns, blinks | yes | 5 | 47 % | **3** | a few dark pixels (7 x 6): black on the dark slate it sits on, no beak or eye to find at phone size; it speaks to him |
| `maze-stone` | a standing stone | jernhaugen | yes | yes | lights | yes | 6 | 48 % | **1** |  |
| `harmless-heron` | heron | ostensjovannet | yes | yes | stands, sinks | yes | 10 | 27 % | **1** |  |
| `harmless-sheep` | sheep | akershus, ekeberg | yes | yes | walks, grazes | yes | 8 | 38 % | **1** |  |
| `pickup-bench` | bench | all | yes | yes |  | yes | 8 | 31 % | **1** |  |
| `pickup-bracteate` | gold bracteate | all | yes | yes | turns | yes | 4 | 34 % | **1** |  |
| `pickup-cheese` | brown cheese | all | yes | yes |  | yes | 6 | 44 % | **1** |  |
| `pickup-feather` | raven's feather | nordmarka | yes | yes | falls | yes | 4 | 54 % | **1** |  |
| `pickup-flag` | flag | all | yes | yes | flies in three frames | yes | 10 | 27 % | **1** |  |
| `pickup-pole` | ski pole | holmenkollen | yes | yes | carried at his side | yes | 6 | 38 % | **2** | "a line with a dot": a ski pole is a line; its grip, strap and basket are there, a pixel wide because it is held beside him (10 x 14). Holds in place; left |
| `pickup-rune` | rune stone | all | yes | yes | glows | yes | 10 | 27 % | **1** |  |
| `pickup-shield` | shield | bygdoy | yes | yes | raised, on his back | yes | 11 | 21 % | **1** |  |
| `pickup-skilling` | skilling | all | yes | yes | turns | yes | 3 | 48 % | **1** |  |
| `thrown-archer` | arrows | gamlebyen | yes | yes | turns in flight, trails its neon | yes | 6 | 31 % | **1** | small by design: its own colour tells a chip from a stone (ADR 0051) |
| `thrown-gull (thrower)` | the gull's chips | radhuset | yes | yes | turns in flight, trails its neon | yes | 3 | 69 % | **1** | small by design: its own colour tells a chip from a stone (ADR 0051) |
| `thrown-kid` | snowballs | holmenkollen, nabolaget, korketrekkeren | yes | yes | turns in flight, trails its neon | yes | 3 | 48 % | **1** | small by design: its own colour tells a chip from a stone (ADR 0051) |
| `thrown-nester` | a nesting gull's dive | ostensjovannet | yes | yes | turns in flight, trails its neon | yes | 5 | 56 % | **1** | small by design: its own colour tells a chip from a stone (ADR 0051) |
| `thrown-ringer` | stone rings | vigelandsparken | yes | yes | turns in flight, trails its neon | yes | 2 | 69 % | **1** | small by design: its own colour tells a chip from a stone (ADR 0051) |
| `thrown-riveter` | bolts | bjorvika | yes | yes | turns in flight, trails its neon | yes | 3 | 41 % | **1** | small by design: its own colour tells a chip from a stone (ADR 0051) |
| `thrown-slinger` | sling stones | bygdoy | yes | yes | turns in flight, trails its neon | yes | 3 | 46 % | **1** | small by design: its own colour tells a chip from a stone (ADR 0051) |
| `thrown-squirrel` | pine cones | nordmarka, ekeberg | yes | yes | turns in flight, trails its neon | yes | 3 | 56 % | **1** | small by design: its own colour tells a chip from a stone (ADR 0051) |
| `carrier-akerselva` | the logs and the water wheel's buckets | akerselva | yes | yes | moves on its round | yes | 8 | 36 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-akershus` | the hoist | akershus | yes | yes | moves on its round | yes | 5 | 74 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-bjorvika` | the hoist, the crane hooks and the steel sheets | bjorvika | yes | yes | moves on its round | yes | 5 | 28 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-bygdoy` | the ferry, the raft and the reeds | bygdoy | yes | yes | moves on its round | yes | 9 | 35 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-ekeberg` | the trams | ekeberg | yes | yes | moves on its round | yes | 10 | 31 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-gamlebyen` | the longships | gamlebyen | yes | yes | moves on its round | yes | 8 | 22 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-holmenkollen` | the chairlift and the tower lift | holmenkollen | yes | yes | moves on its round | yes | 8 | 23 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-langkaia` | the rafts and the rowing boat | langkaia | yes | yes | moves on its round | yes | 16 | 22 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-nabolaget` | the trams | nabolaget | yes | yes | moves on its round | yes | 10 | 47 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-nordmarka` | the moose | nordmarka | yes | yes | moves on its round | yes | 9 | 38 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-radhuset` | the ferry, the tower lift, the bell and the clock's hands | radhuset | yes | yes | moves on its round | yes | 11 | 39 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-slottet` | the banners and the Guard | slottet | yes | yes | moves on its round | yes | 22 | 46 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-stortinget` | the trains | stortinget | yes | yes | moves on its round | yes | 9 | 38 % | **1** | drawn by orders 28, 31, 32 |
| `carrier-vigelandsparken` | the fountain's jets | vigelandsparken | yes | yes | moves on its round | yes | 3 | 60 % | **1** | drawn by orders 28, 31, 32 |
| `prop-baluster` | balusters | slottet | yes | yes | none | yes | 3 | 46 % | **2** | tiny; a row of them in place reads |
| `prop-barrier` | crowd barrier | slottet | yes | yes | none (a prop) | yes | 6 | 30 % | **1** | of its place (ADR 0051) |
| `prop-chair` | chairlift chair | holmenkollen | yes | yes | none (a prop) | yes | 8 | 23 % | **1** | of its place (ADR 0051) |
| `prop-container` | site container | bjorvika | yes | yes | none (a prop) | yes | 4 | 45 % | **1** | of its place (ADR 0051) |
| `prop-ferry` | the City Hall ferry | radhuset | yes | yes | none (a prop) | yes | 11 | 39 % | **1** | of its place (ADR 0051) |
| `prop-fire basket` | fire basket | akershus | yes | yes | its fire flickers (drawn apart) | yes | 3 | 44 % | **2** | the basket alone on the sheet; in place with its flames |
| `prop-gate lantern` | gate lantern | vigelandsparken | yes | yes | none (a prop) | yes | 6 | 31 % | **1** | of its place (ADR 0051) |
| `prop-gate pillar` | gate pillar | vigelandsparken | yes | yes | none (a prop) | yes | 4 | 56 % | **1** | of its place (ADR 0051) |
| `prop-gondola` | gondola | radhuset | yes | yes | none (a prop) | yes | 7 | 36 % | **1** | of its place (ADR 0051) |
| `prop-hut door` | plank door | langkaia | yes | yes | none (a prop) | yes | 4 | 77 % | **1** | of its place (ADR 0051) |
| `prop-ladder` | ladder | langkaia | yes | yes | none (a prop) | yes | 3 | 40 % | **1** | of its place (ADR 0051) |
| `prop-lamp old` | old-town lantern | ekeberg, nabolaget, gamlebyen, encore | yes | yes | none (a prop) | yes | 5 | 38 % | **1** | of its place (ADR 0051) |
| `prop-lamp park` | park lantern | vigelandsparken | yes | yes | none (a prop) | yes | 5 | 40 % | **1** | of its place (ADR 0051) |
| `prop-lamp square` | square lamp | radhuset | yes | yes | none (a prop) | yes | 5 | 35 % | **1** | of its place (ADR 0051) |
| `prop-leg` | the diving tower's legs | langkaia | yes | yes | none (a prop) | yes | 7 | 42 % | **1** | of its place (ADR 0051) |
| `prop-light pole` | lit-trail pole | korketrekkeren | yes | yes | none (a prop) | yes | 8 | 34 % | **1** | of its place (ADR 0051) |
| `prop-log` | log | akerselva | yes | yes | none (a prop) | yes | 7 | 36 % | **1** | of its place (ADR 0051) |
| `prop-panel door` | panel door | stortinget, nabolaget | yes | yes | none (a prop) | yes | 7 | 55 % | **1** | of its place (ADR 0051) |
| `prop-plank wall` | plank wall | langkaia, nabolaget | yes | yes | none (a prop) | yes | 5 | 51 % | **1** | of its place (ADR 0051) |
| `prop-pontoons` | sauna raft pontoons | langkaia | yes | yes | none | yes | 5 | 34 % | **2** | under the rafts, mostly under water |
| `prop-post` | post | langkaia, holmenkollen, nabolaget | partly | yes | none | yes | 4 | 33 % | **2** | a post lit on its left with a cap and a dark foot; in place under the club's deck and at Holmenkollen's station it reads as a post. Left |
| `prop-rail bars` | iron railing | radhuset, nabolaget | yes | yes | none (a prop) | yes | 3 | 72 % | **1** | of its place (ADR 0051) |
| `prop-rail tube` | tube railing | langkaia, slottet, ekeberg | partly | yes | none (a prop) | yes | 4 | 41 % | **2** | "flat bars": a tube railing is two rails and posts; ADR 0051 keeps a rail a line with a glint, never a lit top that reads as a ledge. In place (the diving tower, Slottet's pond, Ekeberg's viewpoint) it reads as a railing. Left |
| `prop-roof truss` | the stage's roof truss | encore | yes | yes | none (a prop) | yes | 3 | 33 % | **1** | of its place (ADR 0051) |
| `prop-rowboat` | rowing boat | langkaia | yes | yes | none (a prop) | yes | 5 | 38 % | **1** | of its place (ADR 0051) |
| `prop-sauna cabin` | sauna cabin | langkaia | yes | yes | none (a prop) | yes | 9 | 44 % | **1** | of its place (ADR 0051) |
| `prop-site fence` | site fence | bjorvika | yes | yes | none (a prop) | yes | 7 | 46 % | **1** | of its place (ADR 0051) |
| `prop-speaker stack` | speaker stack | encore | yes | yes | none (a prop) | yes | 6 | 61 % | **1** | of its place (ADR 0051) |
| `prop-stove pipe` | stove pipe | langkaia | partly | yes | its smoke | yes | 2 | 73 % | **2** | three pixels of steel pipe with a collar at its top; in place, with its smoke, it reads as the hut's and the sauna's chimney. Left |
| `prop-tram` | tram | ekeberg, nabolaget | yes | yes | none (a prop) | yes | 9 | 31 % | **1** | of its place (ADR 0051) |
| `prop-truss tower` | lighting tower | encore | yes | yes | none (a prop) | yes | 3 | 33 % | **1** | of its place (ADR 0051) |

## The planner's list, against what was found

- **The scooter, the gull and the crow in the air, the pigeon in flight**: as the order says, and worse in place than on the sheet. The gull,
  the crow (the gull's own frames in plum) and the scooter are drawn for a box a quarter larger than the box Langkaia, Rådhuset, Slottet,
  Akerselva, Stortinget, Akershus and Bjørvika keep, and squashed to it (`parts`' `k`): the gull's wings, three rows over its back, became two,
  and the scooter's wheels went under its deck. Measured, two frames of the gull's beat differ by 12 pixels at the best overlay, the crow's
  by 11, the pigeon's by 5 (the table below): a bob, not a beat.
- **The track rat**: its first row is the ballast stirring between the rails before it leaps, three grey pebbles drawn plain (`plain`, no
  outline) while the rat is under the track. A player never sees it so: on the page they are grey, unoutlined and twitch on their own beat; the
  sheet outlined them because the census recorded what is plain with the rest. Struck from the redraws; the sheet is mended instead (order
  38's census notes what a look draws plain, and the figures tool lays it over the outlined shape without an outline).
- **The salmon**: the same for its "oval and two rings": the ripple (a line of foam, blinking on and off for the second before it leaps) and
  the splash (two squares of foam either side as it breaks the surface). In place the ripple reads as a dash on the water, half the time
  nothing at all, and with reduced motion never: it does not read as water breaking. The fish holds; its water is redrawn.
- **The maze's raven**: a few dark pixels on dark slate in place; no beak or eye to find. 3.
- **The mound-dweller**: a grey block on the sheet, because his eyes are drawn by the maze apart from his frame; in place there are two
  amber points in the dark of his hood, so his face can be found (2). Redrawn anyway, as one drawing with his eyes in it: folds, hands, a
  hood's opening.
- **The rail tube, the post, the stove pipe**: struck. On the sheet they are bars; in place they are a railing, posts and a chimney with its
  smoke, as plain as ADR 0051 keeps a prop (a railing's rail a line with a glint, never a lit top that reads as a ledge).
- **The ski pole**: struck. A ski pole is a line; its grip, strap and basket are drawn, a pixel wide because he carries it at his side.
- **Added**: the wasp (two frames of its beat a blob apart: touched up only, its half-raised wings swept back, so its beat is four shapes),
  the bishop's guard and the coot (2, small for their boxes: candidates for a later round, not redrawn).

## Ranked: the 3s, worst first

1. The e-scooter (Rådhuset, Stortinget): an L, no wheels; and it is the joke.
2. The gull on the wing (Langkaia, Rådhuset, Slottet, Akerselva, Bygdøy): five levels, the commonest flyer.
3. The crow (seven levels): the gull in plum, not a crow.
4. The pigeon in flight (Stortinget): a lens whose beat is 5 pixels.
5. The maze's raven: a few dark pixels that speak to him.
6. The salmon's water (Akerselva): its tell, which should read first.

Then the 2s worth a redraw this round: the mound-dweller (his face on one drawing), the wasp's beat.

## Silhouettes, before (the census's still and moving frames; `bin/sil.ts`)

A flyer's beat: the fewest pixels two frames of it differ by, laid over each other the way that makes them most alike (shifted up to two
pixels either way), and each frame against the next.

| Flyer in its level | Least, any two | Each against the next |
|---|---|---|
| gull@langkaia | 12 | 12 17 21 34 |
| crow@akershus | 11 | 11 11 13 23 |
| gull@radhuset | 12 | 12 17 21 34 |
| gull@slottet | 12 | 12 17 21 34 |
| crow@holmenkollen | 11 | 14 11 24 31 |
| wasp@akerselva | 5 | 5 14 12 25 |
| gull@akerselva | 12 | 12 17 21 34 |
| owl@nordmarka | 16 | 18 16 20 34 |
| bat@nordmarka | 12 | 12 18 28 32 |
| pigeonfly@stortinget | 5 | 5 18 12 25 |
| wasp@ekeberg | 5 | 5 10 15 22 |
| crow@ekeberg | 11 | 14 11 24 31 |
| crow@nabolaget | 11 | 14 11 24 31 |
| owl@nabolaget | 16 | 18 16 20 34 |
| gull@bygdoy | 11 | 14 11 24 31 |
| crow@vigelandsparken | 11 | 14 11 24 31 |
| crow@korketrekkeren | 11 | 14 11 24 31 |
| owl@korketrekkeren | 16 | 18 16 20 34 |
| crow@bjorvika | 11 | 11 11 13 23 |
| owl@gamlebyen | 10 | 10 16 12 26 |

Each level's figures: the two whose still silhouettes are nearest (pixels apart at the best overlay, shifted up to four), measured on
`origin/main` (the ballast and the water counted with the rats and the salmon there, as the census had them).

| Level | Figures | Nearest pair | Pixels apart |
|---|---|---|---|
| langkaia | 3 | pigeon / gull | 37 |
| akershus | 4 | crow / rat | 49 |
| radhuset | 4 | pigeon / gull (thrower) | 27 |
| slottet | 3 | pigeon / gull | 37 |
| holmenkollen | 5 | grill / hedgehog | 34 |
| akerselva | 7 | salmon / gull | 25 |
| nordmarka | 6 | owl / bat | 36 |
| stortinget | 7 | pigeonfly / umbrella | 31 |
| ekeberg | 5 | magpie / crow | 41 |
| nabolaget | 5 | cat / fox | 35 |
| bygdoy | 6 | penguin / slinger | 38 |
| vigelandsparken | 6 | crow / pigeon | 40 |
| korketrekkeren | 5 | crow / fox | 49 |
| ostensjovannet | 4 | duck / coot | 26 |
| bjorvika | 4 | crow / pigeon | 35 |
| gamlebyen | 6 | owl / guard (the bishop's) | 41 |
