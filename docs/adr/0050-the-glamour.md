# 0050. The glamour: neon is a spell on Oslo, and a stomp breaks it

Decided 2026-11-16 by Lars, in conversation with the planner, before order 27 was built. The
order ([`docs/games/orders/27-the-neon-invaders.md`](../games/orders/27-the-neon-invaders.md))
carries it out; its implementer amends this record with what was built and what was not.
The number 0049 was left for order 26, which was being built at the time.

## How it came about

Order 18 tested enemy bodies against every backdrop, because Lars had said grey enemies vanish
on grey. Browns and greys failed, so bodies drifted to pink, plum and orange
([0039](0039-colour-says-what-a-thing-is.md)). Order 22 added the red outline
([0044](0044-paint-says-where-to-go.md)) but no natural colour passed the test even then.
Looking at a page of every redrawn figure, Lars said:

> hm. all the pink... im just not sold on pink being a bad guy color. but maybe if we make it a
> theme somehow? like, oh no, the 80s glam invaders are here!

Offered natural colours, a "bewitched" story, or his own joke, he chose "The neon invaders",
then: "no sorry, you bewitched idea is kinda cool. But idk, can you mix them?" The two are one
word. On hearing it: "wow yes the glamour idea is so good. the word play is lovely. I guess
general neon / cyber punk / 80s glam is a theme that can be recurring then, doesnt only have to
be magenta." And for why it happened: "Maybe you can somehow make it a sort of silly, current
story too. thats holds mirror up to society, but in a tongue in cheek way. like 'oh no, seems
like trump paid loki to terrorize oslo because he didnt win the peace prize!' or something".

## Decision

- **A glamour** is a spell that makes a thing appear other than it is. The Neon Invaders have
  put one on Oslo. Everything under it is glammed up in neon and out to hurt him. Natural
  colours are Oslo; neon is the glamour. That is the game's reading at a glance, on top of the
  outlines of 0044.
- **Neon is a spectrum, not magenta alone**: hot pink, magenta, electric purple, acid green,
  electric blue, laser orange, and a two-neon sheen on a figure's lit side. One gang by
  treatment (saturated, glowing after dark, the same glam marks), not by hue. Levels and kinds
  may lean their own way. Neon is for the glamour only: nothing natural, nothing he takes and
  nothing he stands on uses it. The roles of 0039 and 0044 keep their colours in their shapes;
  a neon near a role is an accent, never a figure's whole body beside that role.
- **A stomp breaks the glamour.** In the frames and steps a death takes today, the glam flies
  off and the creature is itself again in natural colours, with the pale outline, and leaves.
  Nobody dies in this game. A level's rune lifts the glamour from whatever is still in view.
  Bosses drop theirs in their last frames.
- **Fire that hurts burns neon** (magenta with lime) under the glamour; scenery fire stays warm.
- **The story is a joke and is told as one**: Trump did not get the Peace Prize (handed out in
  Oslo's Rådhuset, level 3), took it badly, and paid Loki to make Oslo sorry; Loki took the
  money and did it his way, with an 80s glamour. Told in the voice of a tabloid or a saga gone
  wrong, in a few lines: an opening card, a line at Rådhuset, one at each boss, an ending per
  line. Oslo is teased as warmly as anyone.

## Limits the planner set (Lars may change them)

- The man who paid is named once or twice in the telling and **never drawn**; he is not a
  character or a boss. The satire is of public behaviour (vanity, sulking, prizes, money,
  spectacle), never of looks, health, family or supporters; nothing cruel.
- Loki is the Invaders' front man and is not met in order 27 (a poster or a silhouette at
  most). Meeting him is kept for later.
- **Nothing borrowed**: no real band, song, person's likeness, logo, album cover, lyric or
  nameable melody. The 80s is a look and a sound made here. (`docs/games/PLAN.md` records that
  a commercial recording had to leave the old maze.)
- The site and the repository are public; every line of the story sits in one file of strings
  so Lars can reword it.

## Not chosen

- **Natural colours for enemies, the red outline alone saying danger.** Looks like Oslo, but a
  brown rat on brown planks is then told by a thin line only, on a phone. Natural colours come
  back as what an enemy turns into.
- **The bewitched story played straight** (seid, a cursed rune): fits the viking, has no joke.
- **One magenta for every invader**: sixteen levels would look alike.
- **Relaxing the palette test for enemy bodies**: not needed once neon is the point; the test
  now names the neon family instead.

## Consequences

Every enemy has two looks (glamoured and natural) from one map and two ramps. The palette test
gains the neon family. DESIGN gains a rule for level authors: how to glam a new enemy; harmless
stays natural. The old question "why is the rat pink" has an answer inside the game.

## What order 27 built (amended by its implementer, 16 November 2026)

- **The neon family** (`swatches/enemy.ts`, `ROLES.glamour`): the enemy palette's warm end (plum, orange, poison) and hot pink,
  magenta, purple and its dark, electric blue and lime, each held off every field, the red outline and every role as a body
  colour is (`render/palette.test.ts`). Three sit near a role and are named there with the shape that keeps them apart: the
  purple (13) and the magenta (12) near the "now" violet, the electric blue (11) near his tunic; the test holds each to an accent
  (no more than a quarter of any figure). No electric blue lighter than `#2a2aff` passes: every lighter one comes within 10 of
  Langkaia's or Bygdøy's water and sky under a tint, so the blue is a sheen and a mark only.
- **One treatment**: a two-neon sheen along every glammed frame's lit top, each level's lean of the two neons (`LEANS`:
  Nordmarka acid green and purple, Bjørvika electric blue and hot pink with its plum gone hot pink, Gamlebyen hot pink and
  orange away from the serpent's violet), and a soft glow of each invader's own neon after dark, under its outline, made once a
  shape and copied (`alive/glamour.ts`).
- **Glam marks** drawn into every look's maps as glam pieces (the table in the order's hand-back): shades on most animals, crests
  on the gulls, the nesting gull, the magpie and the coot, shoulder pads on the guards and the slinger, a headband on the
  squirrel and the archer, leg warmers on the riveter, collars on the cat, the goose and the dog, a mohawk on the Angry Boy, a
  bolt on the anthill, the kid's jacket and the umbrella, neon tubes on the scooter, the trolley and the hot-dog cart. The wasp
  keeps its amber and black and wears shades, with the sheen along its back: on its sheet amber and black still say "wasp" at a
  glance, which Lars asked for in order 26; a fully neon wasp was not drawn.
- **A natural self for every look** (`alive/natural.ts`): the same map without its marks in a ramp of its real colours, and how
  it leaves. Held never to be neon (`alive/natural.test.ts`, 8 or more off every colour of the family), as the sheep, the moose,
  the heron and the parade are (the heron's beak was darkened for it).
- **A stomp breaks the glamour** in the death's frames and steps (`drawBreak`), drawing only; **a rune's ring of daylight** turns
  every invader it passes to its natural self. Fire that hurts burns magenta and lime (`glamFire`), orange when lifted.
- **The four redraws** Lars named: the Angry Boy from the statue's pose (fists down, a scowl, a howl, a foot up, nothing round
  over his head), the kid in winter clothes, the sledger on a sledge you can see, the hot-dog cart as a pølsebod.
- **The bosses' glam**: the troll's magenta mullet and spiked wristband, the plough as a tour bus with stage lights, the serpent's
  neon crest and shades; each gone in its last frames.
- **The story** in one file (`game/story.ts`, both languages): the opening card, the map's line and sign, the first level's and
  Rådhuset's lines, a line per boss, the two endings, and alternatives. The man who paid is named twice (the card, the sign).
- **The map's mirror balls, the scenery** (a flamingo, a neon heart, LOKI's poster, Bjørvika's mirror ball; `alive/invasion.ts`)
  and **four stings** (`neon`, `unglam`, `headliner`, `lifted` in `render/feel.ts`).

## What it did not do

- **Loki is not met**, as decided: his poster only.
- **Shots are not glammed**: what the invaders throw keeps its look (the order: "it still throws what it throws").
- **The lean is per level, not per kind**: a kind met in several levels takes each level's two neons; its body keeps its own colour.
- **Every enemy in place was looked at once per kind**, in the first level that has it, by day and under its own sky, at both
  sizes; a kind's other levels (other leans) only in the frame sheets.
- **Nobody has heard the stings or seen any of it at speed.**
