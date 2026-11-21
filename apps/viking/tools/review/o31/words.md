# Order 31, item 6: the words orders 21 to 30 added, in both languages

Every line a player can see that orders 21 to 30 added (order 21's touch notes and buttons, order 27's story, order 29's encore, the
words of the cards and the help line that came with them), read from the code (`game/story.ts`, `render/pad.ts`, `game/shield.ts`,
`game/i18n.ts`) on branch `loose-ends`. Every one exists in both languages: `game/words.test.ts` looks through every module of the page
and every level for words kept by language (387 places) and finds none missing, none with other keys, other lines or other arguments.

Fit at 360 wide: pictures at 360 x 640 (a mouse, and for the cards a touch screen too), English and Norwegian (`--lang=nb-NO`), in
`~/.cache/claude-scratch-larshansen/o31/shots/6-words/` and `1-cards/`. Nothing ran out of its box: banners stay on their plate,
bubbles inside the screen, cards inside their card (since item 1 below the header with a mouse too), the help line wraps inside the
screen. `story.ts` was not changed (the order: report only); nothing outside it needed changing.

| Where it shows | Key | Norwegian | English | Seen at 360 wide |
|---|---|---|---|---|
| the help line's note on a touch screen (5 s, under the bar or over the pad) | `move` | Gå til venstre eller høyre | Walk left or right | aria-label only |
| the help line's note on a touch screen (5 s, under the bar or over the pad) | `pole` | Skistaven: Rykk gir et kort rykk, også i lufta. | The ski pole: Dash for a short dash, in the air too. | not photographed; 47 / 52 characters, held by `pad.test.ts` to two lines at 360 (64) |
| the help line's note on a touch screen (5 s, under the bar or over the pad) | `shield` | Skjoldet: hold Skjold for å løfte det. | The shield: hold Shield to raise it. | button: item 1's touch cards; note: as `pole` |
| the help line's note on a touch screen (5 s, under the bar or over the pad) | `sledge` | På kjelken: Hopp for å hoppe, Dukk for å dukke. | On the sledge: Jump to jump, Duck to duck. | as `pole` (47 / 42) |
| the help line's note on a touch screen (5 s, under the bar or over the pad) | `off` | Av kjelken: Skjold løfter skjoldet igjen. | Off the sledge: Shield raises the shield again. | as `pole` (41 / 47) |
| the pad's Shield/Duck button, the shield's gift bubble, the help line | `shield` | Skjold | Shield | button: item 1's touch cards; note: as `pole` |
| the pad's Shield/Duck button, the shield's gift bubble, the help line | `duck` | Dukk | Duck | not photographed (the sledge's button) |
| the pad's Shield/Duck button, the shield's gift bubble, the help line | `givenTouch` | Skjoldet er ditt. / Hold Skjold-knappen for å løfte det. | The shield is yours. / Hold the Shield button to raise it. | not photographed (Bygdøy's prow on a touch screen) |
| the pad's Shield/Duck button, the shield's gift bubble, the help line | `helpSledge` | På kjelken: mellomrom eller pil opp for å hoppe, pil ned for å dukke. R starter banen på nytt. | On the sledge: Space or up to jump, down to duck. R starts the level again. | not photographed (keyboard, on the sledge) |
| the pad's Shield/Duck button, the shield's gift bubble, the help line | `help` | Hold pil ned for skjoldet. | Hold down for the shield. | `bjorvika` at 360 x 640, both languages: four lines, inside the screen |
| the pad's Shield/Duck button, the shield's gift bubble, the help line | `given` | Skjoldet er ditt. / Hold pil ned for å løfte det. | The shield is yours. / Hold down to raise it. | not photographed |
| the page (blurb for screen readers, cards, the pad's Sit) | `blurb` | Du fant den hemmelige døra. Ta T-banen gjennom Oslo, finn runene i navnet, og tramp neonsynkvervingen av byen. | You found the secret door. Take the T-bane through Oslo, find the runes of the name, and stomp the neon glamour off the city. | not shown (screen readers) |
| the page (blurb for screen readers, cards, the pad's Sit) | `finishPoleTouch` | Du har fått skistaven: Rykk-knappen gir et kort rykk, også i lufta. | You have the ski pole: the Dash button for a short dash, in the air too. | not photographed (Holmenkollen's card on a touch screen) |
| the page (blurb for screen readers, cards, the pad's Sit) | `sitButton` | Sett deg | Sit | not photographed (a bench on a touch screen) |
| the page (blurb for screen readers, cards, the pad's Sit) | `homeLine` | Ti av ti runer: LARS HANSEN. Velkommen hjem. | Ten of ten runes: LARS HANSEN. Welcome home. | item 1: Vålerenga's card, both languages, 360 and 390 |
| the page (blurb for screen readers, cards, the pad's Sit) | `lineTwoOpened` | Linje 2 har åpnet. Den går fra Stortinget. | Line 2 has opened. It leaves from Stortinget. | item 1: Vålerenga's card |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `title` | Oslo, glammet | Oslo, glammed | item 1: the opening card, both languages |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `opening` | Ifølge avisene fikk ikke Donald Trump fredsprisen, og han tok det tungt. / Han betalte Loke for å gjøre Oslo lei seg. Loke tok pengene og gjorde det på sin måte: / Neoninvaderne hans har lagt en åttitallssynkverving over hele byen. / En viking med T-banekort er alt som står mellom Oslo og evig hårspray. | Reports say Donald Trump did not get the Peace Prize, and took it badly. / He paid Loki to make Oslo sorry. Loki took the money and did it his own way: / his Neon Invaders have put an 80s glamour on the whole city. / A viking with a T-bane card is all that stands between Oslo and eternal hair spray. | item 1: the opening card |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `onward` | Til linja | To the line | item 1: the opening card's button |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `mapSub` | Synkvervingen ligger over Oslo | The glamour is on Oslo | the map's banner (`kart`, told), both languages |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `signLabel` | Siste nytt | The news | the map's story sign (`x=136`), both languages |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `sign` | Ingen fredspris til Donald Trump. / Han surmulte, og betalte Loke. / Loke glammet opp Oslo i stedet. / Tramp det av; runene løfter det. | No Peace Prize for Donald Trump. / He sulked, and paid Loki. / Loki glammed Oslo up instead. / Stomp it off; the runes lift it. | the map's story sign, four bubbles, both languages |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `arrival.langkaia` | Synkvervingen begynner på kaia | The glamour starts at the quay | Langkaia's banner, both languages (the widest banner line: fits with about ten pixels each side) |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `arrival.radhuset` | Her bor fredsprisen | Where the Peace Prize lives | Rådhuset's banner, both languages |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `boss.troll` | Loke ga det hockeysveis. Det er ikke fornøyd. | Loki gave it a mullet. It is not happy either. | Nordmarka, `on=troll:wake`, both languages (the widest bubble, nearly edge to edge at 360) |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `boss.plough` | På turné: brøytebilen. Lokes hovednummer. | On tour: the snow plough. Loki's headliner. | Vålerenga, `on=boss:wake`, both languages |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `boss.serpent` | Neonkam. Solbriller. Det biter likevel. | Neon crest. Shades on. It still bites. | Gamlebyen, `on=boss:wake`, both languages |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `endOne` | Linje 1 er vanlige Oslo igjen. En pils koster fortsatt det den koster. | Line 1 is plain Oslo again. A beer still costs what it costs. | item 1: Vålerenga's card with every rune of line 1 |
| the opening card, the map's banner and sign, banners on arrival, bosses' wake bubbles, the line endings' cards | `endTwo` | Synkvervingen letter. Loke beholder pengene. Noen må forklare fakturaen. | The glamour lifts. Loki keeps the money. Somebody will have to explain the invoice. | item 1: Gamlebyen's card with every rune |
| its banner, Loki's bubbles, its card | `arrival` | Loke har ett nummer til | Loki has one more song | the encore's banner, both languages |
| its banner, Loki's bubbles, its card | `wake` | God kveld, Oslo! / Ett nummer til, så kan dere gå hjem. | Good evening, Oslo! / One more, then you can all go home. | `on=boss:wake`, both languages |
| its banner, Loki's bubbles, its card | `piece1` | Det var en parykk. / Det visste dere. | That was a wig. / You all knew. | `steps=500`, both languages |
| its banner, Loki's bubbles, its card | `piece2` | Solbriller i november. / Greit nok. | Shades, in November. / Fair point. | `steps=850`, both languages |
| its banner, Loki's bubbles, its card | `piece3` | Forsiktig. Den jakka er leid. | Careful. That jacket was rented. | `steps=1115`, both languages |
| its banner, Loki's bubbles, its card | `leaving` | Fint publikum. Ingen danset, / men ingen gikk heller. | Lovely crowd. Nobody danced, / but nobody left either. | `steps=1200` and `1240`, both languages |
| its banner, Loki's bubbles, its card | `miss` | Mellom numrene står han i positur. / Hopp på ham da. | Between his moves he strikes a pose. / Jump on him then. | not photographed (the route never misses); shorter than the troll's wake line, which fits |
| its banner, Loki's bubbles, its card | `missClub` | Trollets klubbe, i neon. / Hopp når den kommer ned. | The troll's club, in neon. / Jump as it comes down. | as `miss` |
| its banner, Loki's bubbles, its card | `missCharge` | Brøytebilens rush, på knærne. / Opp på en høyttaler mens han turer opp. | The plough's charge, on his knees. / Get up on a speaker while he revs. | as `miss` (39 characters in Norwegian, the longest) |
| its banner, Loki's bubbles, its card | `missBite` | Sjøormens ring av skum. / Vær ute av den før den biter. | The serpent's ring of foam. / Be out of it before it bites. | as `miss` |
| its banner, Loki's bubbles, its card | `ending` | Scenelysene er bare lys igjen. Oslo går hjem, vanlig og ganske fornøyd. | The stage lights are just lights again. Oslo walks home, plain and quite content. | item 1: the encore's card, both languages |

The words that predate order 21 (every level's name, landmark and signs, the bosses' hints, the cards' counts) were not photographed
again here; the test holds that each has both languages.
