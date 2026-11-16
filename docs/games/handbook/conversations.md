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

Each of these was sent to the running order 26 or written into order 27. Check they landed.

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

## Questions waiting for Lars

1. Edge forgiveness: 10, 6, or the rule (above).
2. "just take me out again": remove Again (built) or add it?
3. Vålerenga, or "Gamle Oslo"?
4. Commit `post/gemini-gamedesign-nov-16-2026` or leave it out of the repository?
5. `landing-game-polish`: a local branch not merged into `main`, from before this work. Keep or
   delete?
6. Line 2's difficulty: the reviews think it is harder than line 1 by more than intended.
7. The glamour's wording, once order 27 hands back its list of lines.
8. Everything in each hand-back's "for Lars to judge" list (orders 21 to 25): they are
   collected in [`roadmap.md`](roadmap.md).
