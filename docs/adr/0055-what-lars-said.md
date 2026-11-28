# 0055. The tenth station is Gamle Oslo; the encore has a tune; a level's difficulty and enemies follow its place

Decided 2026-11-22 by Lars, answering the questions that waited for him (relayed by his other session; his words in
`docs/games/handbook/conversations.md`, "Lars's answers, 22 November 2026"). Carried out by the order 34 implementer
(`docs/games/orders/34-what-lars-said.md`). Supersedes the name in [0038](0038-valerenga.md); amends
[0052](0052-the-encore.md) (the encore's sound and Loki's look, within its limits, which stand); within
[0014](0014-personal-details-discreetly.md) (the repository is public).

## 1. The tenth station is called Gamle Oslo, and nothing in it says "home"

Lars: "rename it Gamle Oslo". "I don't want references to home. It's more of an ode to Oslo. Oslo is my home. Not just
gamle Oslo."

- **The name a player reads is Gamle Oslo**, in both languages: the station's name (`levels/index.ts`), from which the map's
  board, the loading board, the cards, the runes' count and the screen reader's lines follow; the level's banner
  (`levels/nabolaget.ts`); line 2's gate sign ("Opens once Gamle Oslo is cleared", `levels/kart.ts`); the page's description;
  LEVELS.html and the docs that describe the game as it is.
- **The id stays `nabolaget`**, for the reasons ADR 0038 gave: stored progress, addresses, files, tests and tools.
- **Its words lose "home"** and the claim that a house is his, and are written as an ode to Oslo: the evening walk over the
  old east side, from Vålerenga's wooden houses over the hill. The banner's second line "A winter night on the east side" /
  "Vinternatt på østkanten" (was "Homeward through Gamle Oslo"); where in Oslo "From Vålerenga's wooden houses over the hill"
  / "Fra trehusene på Vålerenga, over bakken" (was "From Vålerenga home to Kværnertoppen"); the plough waking, "The last
  thing between you and a quiet evening." / "Det siste mellom deg og en rolig kveld." (was "… the door home."); the plough
  beaten, "The plough parks. / The street is clear, for once." / "Brøytebilen parkerer. / Gata er fri, for en gangs skyld."
  (was "The way home is clear."); the card with the tenth rune, "Ten of ten runes: LARS HANSEN. Oslo, end to end." / "Ti av ti
  runer: LARS HANSEN. Oslo, fra ende til annen." (was "Welcome home."). Two other ways beside each are in `conversations.md`.
- **What stays.** Vålerenga is still a place in the level (its first sign, the church, the lane behind it): it is a
  neighbourhood inside the borough Gamle Oslo, so both are true. The Pi, the cranes, the yellow house and the place names on
  plates stay as drawn, with no new words about them. The doors at the level's end and at the line map's far left keep the
  label "Hjem" / "Home": they lead to the site's front page, which the header also calls "Gamle Oslo". The story's lines in
  `game/story.ts` above the encore's block do not change ("Oslo walks home" in the encore's ending is the crowd's home).
- **Code and docs** that called the house his home call it the yellow house (`YELLOW`, `yellowHouse` in `levels/nabolaget.ts`,
  where they were `HOME`, `home`; the light census names the function).

What ADR 0038 feared happens: "Gamle Oslo" is now the header's link to the front page, Ekeberg's banner ("The hillside above
Gamle Oslo") and the tenth station. Lars chose it knowing the level is in Gamle Oslo and the front page is a walk through it.

## 2. The encore has a tune, Loki is glam at its far end, and he shouts

Lars: "But the music has to be something like glam rock. And Lokis outfit should be Poison's most extreme neon glam era. And some
fitting, thematic, glammy song or just glsmmy text. But ideally there should be music". His naming of one real band is read as "the
general style" of late-1980s glam metal: anything closer to one band's look waits for a word from him directly, and ADR 0050's and 0052's
limits stand (no real band's or performer's likeness, costume, logo, song, riff, lyric or nameable melody).

- **The tune** (`apps/viking/src/game/tune.ts`, in the encore's own chunk; written down there as data). Original: its own chords and its
  own melody. Made with the game's own synth through the kit's `voice` (a tone sliding from one pitch to another and dying away, or a
  burst of filtered noise): nothing new in the kit, no audio file. About 129 beats a minute (a beat is 28 steps, so a bar is 112 and the
  game's own clock keeps time). One bar of intro as he wakes (a crash, an A struck and left ringing, toms falling G, E, D, B), then a loop of
  sixteen bars (about 30 seconds): the chorus (D E A A: the riff's power chords on every beat to shout along to, the lead playing its hook
  over it, E E F# E C# / B C# B G# / a climb to the high A / a long E), the verse (A A D E, A A G E: the riff stomping on one, the and of
  two, three and the and of four, the bass on the root in eighths), the solo (F G A A: the riff ringing on one and three under a short lick
  down and up the pentatonic, a bend from D to E, a held C#, then a stop and a fill). Four on the floor all through, claps on two and four,
  hats in eighths, a crash at each section. The loop starts on the chorus so the lead is heard before the first hit can come.
- **It follows the fight.** The whole band while he is glammed; one layer drops with each piece knocked off: the wig takes the lead, the
  shades the riff, the jacket the drums and the bass (the band is gone); a beat after the stage goes plain, six plain notes on what sounds
  like an acoustic guitar (an A arpeggio, then E and A), once. Waiting at his mark he is silent; a lost life sends him to his mark and
  the music stops, and it starts again with the intro when he wakes.
- **It is the page's sound.** It follows the sound switch (muted, it schedules nothing at all), sounds only after the first key or touch
  (the kit's synth has no sound until then), and stops on a card, when he leaves, and while the page is hidden: the page asks it once a
  frame (`LevelDef.music`, one call in `main.ts`) and gives it no sound then. It schedules a quarter of a second ahead; time it lost (a
  hidden page, a slow frame) is skipped, never played late in a burst. The band sits under the game's own sounds (its loudest moment, all
  parts on a downbeat, sums to 0.73 against the game's single sounds of 0.1 to 0.5).
- **To hear it**: `?debug&told&cleared=all#encore` plays the encore with every rune pretended; `?debug&told&level=encore&music=band#encore`
  plays the loop at once whatever Loki does, `music=drums`, `bass`, `riff`, `lead`, `intro`, `plain` or a list (`drums,bass`) a layer at a
  time. Sound starts with the first key or touch.
- **Loki's outfit** (`apps/viking/src/render/loki.ts`), late-1980s glam metal at its far end, in general: the hair teased as high as the frame
  allows under the stars of his pose, spiked, wide behind his head, with a lime headband knotted at the back and a mullet down his back;
  wraparound shades over his eyes (before, two rows at his hairline, hidden under the wig) with purple shadow on his lids over them and a
  liner's wing, seen whole once the shades are off; a leopard-print jacket in the amber with black rosettes, white shoulder pads, the magenta
  shirt, a studded belt with a lime buckle; neon spandex, one leg hot pink and one acid green, tiger-striped; a scarf at each wrist; a
  pointed guitar slung behind him (its body behind his hip, its neck and headstock up behind his back once the wig is off; in his hands
  while he revs and slides, as before); white boots. Every colour the enemy palette's, as before. "Yellow" in Lars's words is the glamour's
  lime: the paint's yellow is where he stands (ADR 0044). Three stages and the plain man as before: the wig takes the hair and the headband,
  the shades the shades, the jacket all the rest. No box, tell or timing changed.
- **Glammy words**: four shouted lines of the game's own (the encore's block of `game/story.ts`, `shout1` to `shout4`, each with another way
  in `ENCORE_ALTERNATIVES`): "Higher hair, Oslo! / Mind the wind!", "Neon tonight! / Sleet tomorrow!", "Louder, Oslo! / The neighbours can
  take it!", "Glitter, Oslo! / It's only drizzle!" ("Høyere hår, Oslo! / Pass på vinden!", "Neon i kveld! / Sludd i morgen!", "Høyere, Oslo!
  / Naboene tåler det!", "Glitre, Oslo! / Det er bare yr!"). In time with the music: a line comes in on a beat he was already strutting or
  posing on and stays while he does, the lines taking turns two bars each (`shoutAt`); never during a tell (the bubble stands beside him,
  clear of the stars over his pose), and only while no line or hint of his is up. They fit a bubble at 360 wide in both languages. With
  reduced motion they are the same still bubbles, and nothing flashes with the beat (nothing is drawn to it).

## 3. A level's difficulty and its enemies follow its place

Lars: "keep line 2 harder". "Keep the difficulty thematic. Is it a touch part of town? Hard. Big event? Can also be hard. Less so, lean
easy. Also keep enemies thematic." (The relaying session reads "touch" as "tough".)

- **The rule** (DESIGN, "The levels"): a level is as hard as its place is. A tough part of town or a big event may be hard; a calm place
  leans easy. Its enemies belong to where they are met: what lives there, works there or comes to its event, glammed. Line 2 stays harder
  than line 1.
- **Measured for it** (the sloppy player, seeds 201 to 260, ±4): line 2 is not harder today: line 1's ten average 1.32 hearts a run, line
  2's six 1.12 (order 17's numbers, on which the question to him was asked, had line 2 harder). Its hardest is a calm park
  (Vigelandsparken, 2.32), its finale is in its middle (Gamlebyen, 1.07); on line 1 the biggest event is the easiest level (Slottet, 0.32)
  and a calm forest is among the hardest (Nordmarka, 2.00, the troll); Holmenkollen's hedgehog is out of its season.
- **Nothing is retuned and no enemy moved now**: he has not played. `apps/viking/tools/review/o34/thematic.md` holds every level against
  the rule (the place, what it is in Oslo, how hard the reviews say it is, its enemies and whether each belongs), with proposals where they
  disagree, for after he has played.

## Not chosen

- **A sampled or borrowed tune**, or a riff "in the style of" a named song: nothing a listener could name (ADR 0050, 0052).
- **A sequencer in the kit**: the kit and its synth are the front page's too; the tune's sequencer is the encore's own.
- **The shouted lines as the place's banner**: it would mean a second banner in the first script; a bubble beside him reads as him shouting.
- **The lyric over a tell or a hint**: the tells and the hints are what a player needs; the lines wait their turn.
- **Renaming the id** to `gamleoslo`: it would lose everyone's stored progress for no gain a player sees (ADR 0038's reason).
- **Taking "Hjem" off the doors**: they lead to the site's home page; "Hjem" there is the site's, not his.
- **New words about the Pi, the cranes or the yellow house**: they stay as drawn, unexplained (ADR 0014).

## Amended by order 35 (22 November 2026): one enemy brought into its season
Of the proposals in `apps/viking/tools/review/o34/thematic.md`, one is a drawing only and was carried out on the planner's reading of
"Also keep enemies thematic": Holmenkollen's hedgehog, which sleeps through the winter, is a mountain hare in its white winter coat
(`HARE` in `levels/holmenkollen.ts`: the same box, speed, behaviour and frame count; glammed in the level's lean with neon spikes along
its back, which say it hurts from above as the spines did, and shades; its natural self white with black ear tips, in the calm outline).
The hedgehog is as it was at Akerselva, Nordmarka and Ekeberg; Holmenkollen's run files are byte-identical. It waits for Lars's word
like the rest of the table, and is one word to undo (`look: "hare"`). Nothing else was retuned or moved.

**Reversed in review, the same day.** The planner did not accept it in review: at the game's size it read as a pale blob, and its small spikes said "hurts from above" less clearly than the hedgehog's spines. The hare was taken out again before the merge (the commit and its revert are in the history); Holmenkollen keeps its hedgehog until a hare can be drawn that reads.

## Amended by order 47 (28 November 2026): his second answers
Lars answered again on 28 November (relayed by his other session; `docs/games/handbook/conversations.md`). Of this record's part 1: the
plough beaten now says what he wrote, "The plough parks. / Gamle Oslo is clear." / "Brøytebilen parkerer. / Gamle Oslo er fri." (it was
"The street is clear, for once."); every other line of Gamle Oslo is as live, and the doors labelled Hjem / Home were asked about and
keep their label ("keep the label"). He asked for the level's first sign to be changed without saying to what: three ways to word it
wait for him in `apps/viking/tools/review/o47/after.md`; the sign is as it was. Of part 3: every level whose difficulty was in question
he said to leave as it is; nothing was retuned. Holmenkollen's hedgehog: "swap it for a mountain hare", and "Enemies of the place's own:
yes, draw them". Order 47 drew them as figures in another look's box and behaviour (`EnemyDef.drawAs`, so the rules and the run files
are untouched): the mountain hare at Holmenkollen, drawn again to read (long ears with black tips over its box, a crest of neon spikes
when glammed), a balloon seller's cart for three of Slottet's pigeons, a forklift for two of Bjørvika's, a commuter's bicycle for
Stortinget's e-scooter (DESIGN, "The levels"). His wider words about the theme are [0058](0058-calm-oslo-loud-glamour.md).

