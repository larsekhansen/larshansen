# What Lars said, and what came of it

Lars's words are quoted as he typed them. Read them for intent: he writes fast and means every
item. "Chosen" is what was built; "not chosen" is what was offered or considered and left; "open"
is waiting for him. Older conversations (the first plan, the levels, line 2) are in
[`../HANDOVER.md`](../HANDOVER.md), "How it came to be", and in the orders.

## Standing instructions

| He said | Meaning in practice |
|---|---|
| "I will leave. Do everything. You may push, merge, deploy, etc. I want to just see the result and comment on that." | The process of ADR 0013. Do not wait for approval on ordinary work. |
| "you have free reigns, this project has no real risk if breaking, so dont be afraid. but do be thorough in your testing." | Merge when the gates pass; be honest about what was not checked. |
| "keep going, merge and deploy when done" / "continue" (many times) | When a round lands, start the next without asking. |
| "I trust you. Be a game designer, plan out something amazing" | Make design decisions; bring him results, not menus. |
| "if you think the game can improve spmewhere just go ahead" | Improvements nobody asked for are welcome. |
| "please make documentation of what has been done, choices made and not made. adrs, too, Be torough" (14 Nov) and the request quoted in this folder's README (16 Nov) | ADRs and docs in the same change as the decision. |
| On personal details (14 Nov; his words are not repeated here on purpose) | ADR 0014: details go in quietly, without explanation; "if you know you know". Ask him before adding, moving or explaining one. |
| On the Pi's memory: "maybe jsut always assume from now on though so it can be cleaned if old or stale" | Any Firefox process is ours; clean stale ones without asking ([`playbook.md`](playbook.md)). |
| "im giving you permission to continuosly merge and deploy all improvements. also keep looking for more assets that should have increased details. and consider them with the rest of the game. interaction, fit, thematics, etc. ... remember to write docs too btw." (16 Nov, evening, before a holiday of about two and a half weeks from 17 Nov) | Keep running rounds while he is away, inside the games only: no hosting changes, `post/` untouched, the story's limits in ADR 0050 unchanged. Each thing given more detail is judged against the whole game. Docs in the same change. |
| On the weekly allowance: he wants about a Pro subscription's worth left for himself, "around 80" (16 Nov) | Read `~/.claude/cache/statusline-last.json` (`rate_limits.seven_day.used_percentage`) before starting anything. Under 75 %: one round at a time. 75 to 80 %: start no new round. 80 % or more: only finish cheap work already in hand and wait for the weekly reset. A check runs every six hours ([`playbook.md`](playbook.md)). |
| "keep making docs, so that i can continue on termux ... you might get a message from another cc agent" (16 Nov) | The handbook must be enough to continue from a phone. A relayed message gets a full answer; a game request that fits what he already permitted is done; anything risky or outside the games waits for him in person. |

## 15 November: readable at a glance (orders 18 to 20)

> much better. when im done with a level, i think there should be there "again" choice. just
> take me out again. and nabolaget? i think thst an be gamle oslo or something, or where is
> that? make the rune checkmarks much clearer. bigger, more of a difference between those that
> hav been achieved and those that have not. the enemies should be slightly bigger and more
> obvios. i think grey isnt smart because the bg often is gray. so make a palette for enemies
> that dont overlap with the bg

Then: "all platforms also need a separate palete" and "considerother assets that have to have
a different palette too".

- **Chosen**: the card after a level has one action, "To the map" (ADR 0037); the tenth station
  is shown as Vålerenga (ADR 0038); gold rune tiles with ticks; enemies a quarter larger in a
  palette tested against every backdrop; platforms with their own top; a role for every colour
  (ADR 0039).
- **Open**: "just take me out again" was read as *remove* Again and go to the map. He has not
  confirmed. If he meant *add* an Again choice, ADR 0037 is wrong.
- **Open**: Vålerenga against his "gamle oslo or something". The banner says "Homeward through
  Gamle Oslo".
- **Consequence nobody intended**: the backdrop test pushed enemy bodies to pink, plum and
  orange. See 16 November, "the pink".

"merge and deploy and continue. do more design polishing like that" produced order 19 (feel)
and order 20 (speed and flat places). "game is currently lagging on mobile" (earlier) is why
speed has its own ADRs (0036, 0041) and a `?debug&perf` counter.

## 16 November, morning: colour and the fear about pixels (orders 21 and 22)

"i like what i see. keep going" started order 21 (the phone). Then:

> i think maybe red for enemies that can hurt you, in terms of the outline, is a smarter choice.
> the light blu you had for rats can be for moving npcs that don't hurt. yellow paint is maybe
> the industry standard for "you can go here" when that isnt clear so mayne theat for platforms
> instead. then that also means other uses of yellow had to be reconsideren or simply changed.
> so these color changes would mean changes in other parts of the game too, so that these fit
> in seamlessly. i also have to ask you to rethink a lot of the design... i just fear i made a
> blunder with the pixel design. or rather that the pixels are too big. they need more detail.
> espeiclally small items.

- **Chosen**: ADR 0044 (red outline with a dark line inside; pale blue for harmless movers;
  yellow paint; every other yellow reconsidered; gold became amber; the third rail red).
- **The pixel fear**: answered with measurements, not opinion
  ([`../research/2026-11-16-reference-games.md`](../research/2026-11-16-reference-games.md),
  [`../GRAIN.md`](../GRAIN.md)). His pixels are the size of Celeste Classic's and Shattered
  Pixel Dungeon's; what was missing was tones, frames and tile texture.

He pointed at sources: "can you look into the source code for 'open surge'", "Shattered pixel
dungeon also apparently has good eemy 'readability'?", "i pasted my talk with gemini on it in a
document in /post", "But just do some real, through research with those resources". The file
`post/gemini-gamedesign-nov-16-2026` is his and is **left untracked**: whether to commit it is
open. In it he says the games are "mostly be for me, or maybe my friends, never sold" and that
his game "has shoddy enemy design and parallax design … hard to see the enemies, not that
engaging". That sentence is the brief for orders 22 to 27.

One claim in that file was wrong (that Shattered Pixel Dungeon outlines its enemies); the art
files show it does not. He was told.

## 16 November, afternoon: the grain chosen (orders 23 to 25)

Shown three ways on a page of pictures, he said: "oh in your suggestions, do way 3 like you
suggested. for the pixels".

- **Chosen**: way 3, same grid, better drawn (ADR 0045). Done for everything that moves or is
  picked up by the end of order 25.
- **Not chosen**: way 1 (small things on a grid twice as fine: mixed grain, cannot show on a
  plain upright phone) and way 2 (everything twice as fine: about 470 drawing functions and the
  front page). Kept as a possibility in GRAIN.md: way 1 for him alone, later, if he still
  looks like a blob on a phone.
- **A lever not pulled**: the upright view is held at least 240 art pixels wide (ADR 0019); at
  200 everything would be a fifth larger and throwers seen later. Not offered to him as a
  question yet beyond the study page.

**The edge.** The planner told him longer edge forgiveness "only ever helps". The sloppy player
said otherwise (ADR 0048, `apps/viking/tools/review/o24/sloppy-edge.md`): a press meant for the
landing after a short drop now fires in the air. Three things were moved a tile. He was told
plainly and given the table. **Open**: 10 steps (live), 6, or a rule that keeps a press made
during a short drop for the landing (touches the kit's `stepBody`, shared with the front page).

## 16 November, evening: comments on the figures (order 26 additions and order 27)

Each of these was sent to the running order 26 or written into order 27. The order 26 rows landed with it; the order 27 rows
landed with order 27 (handed back the same night: the boy from the statue's pose, the kid and the sledger in detail, the cart as
a pølsebod, the brazier and the grill in magenta and lime).

| He said | Where it went |
|---|---|
| "the tiny flag on the 17 of may are not detailed enough. also upgrade their detail level. so the falg isnt ambiguous" | Order 26, section 3b: every small Norwegian flag, at least 7 x 5, cross toward the pole |
| "in holmenkollen, the trees are all missing the top part. no spike. They should have one. either green or white" | Order 26, section 3c: spires on every spruce, every layer, every level that uses the drawing |
| "rats should have longer tails. wasps currently look too green." | Order 26, section 3d. Wasps: amber and black (yellow is reserved for paint); order 27 decides whether a wasp goes neon |
| "the called boy looks like a teddy? not a boy at least" | Order 27: the Angry Boy redrawn from the real statue's pose, fists down |
| "the brazier should now also have magenta / lime green fire" | Order 27: glamoured fire; scenery fire stays warm |
| "make kid, sledgers more detailed. Hot dog, hich i think must be a hot dog stand, can maybe be given a little more detail to see whats inn there. Just kind of shapes now." | Order 27: all three redrawn so a person can name them at a glance |

### The pink, and the glamour (ADR 0050)

> hm. all the pink... im just not sold on pink being a bad guy color. but maybe if we make it a
> theme somehow? like, oh no, the 80s glam invaders are here!

The planner explained where the pink came from and offered two ways: (A) natural colours, with
the red outline alone saying danger; (B) a story that owns the neon, suggested as "bewitched"
(a spell on Oslo's animals; a stomp breaks it and the animal goes home). He said "The neon
invaders", then "no sorry, you bewitched idea is kinda cool. But idk, can you mix them?"

They mix in one word, **glamour** (a spell that makes a thing appear other than it is). His
answer: "wow yes the glamour idea is so good. the word play is lovely. I guess general neon /
cyber punk / 80s glam is a theme that can be recurring then, doesnt only have to be magenta. i
saw the swan had something like a green sheen. or blue maybe, but you can play on more, strong
colors i suppose".

Then the reason for it all:

> Maybe you can somehow make it a sort of silly, current story too. thats holds mirror up to
> society, but in a tongue in cheek way. like "oh no, seems like trump paid loki to terrorize
> oslo because he didnt win the peace prize!" or something

- **Chosen**: everything in [`../orders/27-the-neon-invaders.md`](../orders/27-the-neon-invaders.md)
  and [ADR 0050](../../adr/0050-the-glamour.md).
- **Not chosen**: natural colours for enemies (they return as what an enemy becomes when its
  glamour breaks); the bewitched story without the joke; a single magenta.
- **The planner's own choices inside it, which he may overrule**: the man who paid is named in
  the telling and never drawn, and is not a character or boss; Loki is the front man and is not
  met yet; nothing is borrowed from any real band or song; the satire aims at public behaviour
  (vanity, sulking, prizes, money), never at looks, health, family or supporters. He was told
  the site and repository are public and that every line will come back as a list to reword.

## Lars's answers, 22 November 2026 (relayed by his other session)

He answered the questions below through a review page and another session that relayed his text. Order 34
([`../orders/34-what-lars-said.md`](../orders/34-what-lars-said.md)) built the answers that were plain and safe to build.
His words as typed:

| Question | He said | What came of it |
|---|---|---|
| Edge forgiveness (10, 6 or the rule) | "planner's call" | Stays at 10 until he has played. |
| "just take me out again" | "no Again; To the map only (as built)" | Closed: ADR 0037 stands. |
| The tenth station | "rename it Gamle Oslo". "I don't want references to home. It's more of an ode to Oslo. Oslo is my home. Not just gamle Oslo." | Order 34: the level is shown as Gamle Oslo; its words lose "home" (ADR 0055). Its id stays `nabolaget`. |
| `post/` | "leave post/ out of the repository" | Closed: it stays untracked. |
| `landing-game-polish` | "delete" | Still open: it waits for his word in the planner's own session. |
| Line 2's difficulty | "keep line 2 harder". "Keep the difficulty thematic. Is it a touch part of town? Hard. Big event? Can also be hard. Less so, lean easy. Also keep enemies thematic." (The relaying session reads "touch" as "tough".) | Order 34: the rule is in DESIGN and ADR 0055; a table of every level against it, with proposals only, is `apps/viking/tools/review/o34/thematic.md`. Nothing retuned until he has played. |
| The opening card | "as live". "I do like the live one. Missing some kind of reason why loki put a glamour on them, and the wordplay." | Still open: he suggested a line, but who speaks it is unclear, so it waits for him. The card is as live. |
| The encore | Keep it; difficulty "leave it as it is"; "Middelalderparken is right". "But the music has to be something like glam rock. And Lokis outfit should be Poison's most extreme neon glam era. And some fitting, thematic, glammy song or just glsmmy text. But ideally there should be music" | Order 34: an original glam-rock tune in the game's own synth, Loki pushed to the far end of late-1980s glam in general, and shouted lines of the game's own (ADR 0052 amended, ADR 0055). Anything closer to one real band's look than "the general style" waits for a word from him directly, and is not built. |
| Vålerenga's lane | "restore the dark" | Done in order 33. |
| The Pi and the cranes | "keep them" | As drawn. |
| Harmless things in the warning red | Chairs: "painted steel". "Scenery in the kit's red: move it off the red too" | The chairs were done in order 33; the scenery in order 34 (ADR 0044 amended). |
| The rune's flight with reduced motion | "let it fly (as live)" | Closed: it flies. |
| The next rounds | "carry on as planned" | As the roadmap says. |
| His play notes | not answered | He has not played yet. |

### The tenth station's new lines, and two others beside each (order 34)

Each line is the level's own (`apps/viking/src/levels/nabolaget.ts`, and the card's line in `apps/viking/src/game/i18n.ts`);
the story's lines in `game/story.ts` above the encore's block did not change. Shown first, then two others to choose from.

| Where | As built | Other way 1 | Other way 2 |
|---|---|---|---|
| The banner's second line (was "Homeward through Gamle Oslo") | "A winter night on the east side" / "Vinternatt på østkanten" | "Over the roofs of the old east side" / "Over takene på den gamle østkanten" | "An evening walk over the hill" / "Kveldstur over bakken" |
| Where in Oslo (was "From Vålerenga home to Kværnertoppen") | "From Vålerenga's wooden houses over the hill" / "Fra trehusene på Vålerenga, over bakken" | "From Vålerenga over the church to Kværnerdalen" / "Fra Vålerenga over kirka til Kværnerdalen" | "Rooftops, a spire and Kruttverket" / "Tak, et tårn og Kruttverket" |
| The plough wakes (was "The last thing between you and the door home.") | "The last thing between you and a quiet evening." / "Det siste mellom deg og en rolig kveld." | "The last thing between you and the end of line 1." / "Det siste mellom deg og enden av linje 1." | "The last thing still standing on the east side." / "Det siste som står igjen på østkanten." |
| The plough beaten (was "The way home is clear.") | "The plough parks. The street is clear, for once." / "Brøytebilen parkerer. Gata er fri, for en gangs skyld." | "The plough parks. Gamle Oslo is clear." / "Brøytebilen parkerer. Gamle Oslo er fri." | "The plough parks. Someone will have to dig it out tomorrow." / "Brøytebilen parkerer. Noen får måke den fram i morgen." |
| The card with the tenth rune (was "Welcome home.") | "Ten of ten runes: LARS HANSEN. Oslo, end to end." / "Ti av ti runer: LARS HANSEN. Oslo, fra ende til annen." | "… The name runs right across Oslo." / "… Navnet går tvers over Oslo." | "… Oslo, every stop of it." / "… Oslo, hvert eneste stopp." |

The doors at the level's end and at the line map's far left keep the label "Hjem" / "Home": they lead to the site's front page.

### Order 35: one enemy brought into its season (the planner's reading)

Of Lars's "Also keep enemies thematic" (22 November), order 34's table (`apps/viking/tools/review/o34/thematic.md`) found one enemy out
of its place: Holmenkollen's hedgehog, which sleeps through the winter. Order 35 drew a mountain hare in its white winter coat in its place
(the same box, speed, behaviour and frames; glammed, neon spikes along its back say it hurts from above, as the spines did). It is the
planner's reading, not his word, and a drawing only: the hedgehog is as it was at Akerselva, Nordmarka and Ekeberg, and putting it back at
Holmenkollen is one word (`look: "hare"` to `"hedgehog"` in `levels/holmenkollen.ts`). Nothing else in that table was carried out.

The planner did not accept it in review: at the game's size it read as a pale blob, and its small spikes said "hurts from above" less clearly than the hedgehog's spines. The hare was taken out again before the merge (the commit and its revert are in the history); Holmenkollen keeps its hedgehog until a hare can be drawn that reads.

## Questions waiting for Lars

1. ~~Edge forgiveness: 10, 6, or the rule (above).~~ Answered 22 November: "planner's call"; 10 until he has played.
2. ~~"just take me out again": remove Again (built) or add it?~~ Answered: "no Again; To the map only (as built)".
3. ~~Vålerenga, or "Gamle Oslo"?~~ Answered: "rename it Gamle Oslo" (order 34).
4. ~~Commit `post/gemini-gamedesign-nov-16-2026` or leave it out of the repository?~~ Answered: "leave post/ out of the
   repository".
5. `landing-game-polish`: a local branch not merged into `main`, from before this work. He said "delete" (22 November,
   relayed); it waits for his word in the planner's own session before anyone deletes it.
6. ~~Line 2's difficulty: the reviews think it is harder than line 1 by more than intended.~~ Answered: "keep line 2 harder",
   with the rule that difficulty and enemies follow the place (DESIGN, ADR 0055; the proposals in
   `apps/viking/tools/review/o34/thematic.md` wait until he has played).
7. The glamour's wording: every line is in `apps/viking/src/game/story.ts` (both languages, with two or three other openings
   and endings beside them) and in order 27's hand-back. The man who paid is named twice (the opening card, the map's sign).
   22 November: the card "as live", but "Missing some kind of reason why loki put a glamour on them, and the wordplay". He
   suggested a line; who speaks it is unclear, so it waits for him.
8. Everything in each hand-back's "for Lars to judge" list (orders 21 to 25): they are
   collected in [`roadmap.md`](roadmap.md). Not answered: he has not played yet.
9. The encore's words (order 29, ADR 0052): 22 November: keep it, "leave it as it is", "Middelalderparken is right". Every line is in the encore's block at the end of
   `apps/viking/src/game/story.ts`, both languages, with one or two other ways beside each (`ENCORE_ALTERNATIVES`). As shown:
   - Banner: "Loki has one more song" / "Loke har ett nummer til".
   - As he wakes: "Good evening, Oslo! / One more, then you can all go home." / "God kveld, Oslo! / Ett nummer til, så kan dere
     gå hjem."
   - The wig off: "That was a wig. / You all knew." / "Det var en parykk. / Det visste dere."
   - The shades off: "Shades, in November. / Fair point." / "Solbriller i november. / Greit nok."
   - The jacket off: "Careful. That jacket was rented." / "Forsiktig. Den jakka er leid."
   - Leaving, plain, with his thermos: "Lovely crowd. Nobody danced, / but nobody left either." / "Fint publikum. Ingen danset, /
     men ingen gikk heller."
   - The ending card: "The stage lights are just lights again. Oslo walks home, plain and quite content." / "Scenelysene er bare lys
     igjen. Oslo går hjem, vanlig og ganske fornøyd."
   The man who paid is not named, and neither the invoice nor the client is mentioned. Also for him: the place (Middelalderparken,
   because the park held the summer festival for years and the water mirror is the old shore), and whether the encore should
   be easier or harder (the sloppy player wins it every time). Answered 22 November: the place and the difficulty stay; the
   words are kept, and he wants glam-rock music, a more extreme glam outfit and glammy words (order 34, items 10 and 11).
10. The tenth station's new lines (order 34): the table above, one built and two others beside each.
11. The encore's music, Loki's outfit and the shouted lines (order 34): how to hear the tune is in
    `apps/viking/tools/review/o34/after.md` and [`resources.md`](resources.md); the shouted lines and their alternatives are
    in the encore's block of `game/story.ts` (`ENCORE`, `ENCORE_ALTERNATIVES`) and in the same `after.md`.
