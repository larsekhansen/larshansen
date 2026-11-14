# Order 10: levels 4 to 10

Build the seven remaining levels of Vikingfjorden, so the line spells all of LARS HANSEN.
The work is done in three batches, each handed back for review before the next starts:

| Batch | Levels | New in the kit |
|---|---|---|
| A | 4 Slottet, 5 Holmenkollen | surfaces (ice, ski inrun) |
| B | 6 Akerselva, 7 Nordmarka | zones (push), orbiting carriers, dark |
| C | 8 Stortinget, 9 Ekeberg, 10 Nabolaget, the ending | belts, hazards, zones on a beat (wind) |
| D | 1 Langkaia, 2 Akershus, 3 Rådhuset, lengthened to rule 6 | none |

You will be told which batch is yours. Do only that batch.

## Read first

- `CLAUDE.md` (Bun only; headless limits on this Pi).
- `docs/games/PLAN.md` §3 (style bible) and §9 (the debug harness and `tools/shots.ts`).
- `docs/games/LEVELS.html`: the `LEVELS` array (what each level adds, its beats, its Oslo and
  personal notes) and the scene function drawn for each level. That page is the art direction.
- `docs/games/orders/08-three-levels.md`: the conventions the first three levels follow.
- `apps/viking/src/levels/` (`types.ts`, `langkaia.ts`, `akershus.ts`, `radhuset.ts`, `kart.ts`,
  `levels.test.ts`), `apps/viking/src/game/` (`play.ts`, `bot.ts`, `reach.ts`) and `apps/viking/README.md`.

## Rules that hold for every level

1. **The body does not change.** `MOVE` and `JUMP` in `packages/pixelkit/src/config.ts` are never
   retuned. A full jump is 46 px high and 54 px far (3.4 tiles); with the feather 91 px and 101 px
   (6.3 tiles). New behaviour comes from the world (a surface, a zone, a carrier), never from the body.
2. **A level is data** in `apps/viking/src/levels/<id>.ts` and moves from `PLANNED` to `BUILT` in
   `levels/index.ts`. The one runner plays it. If the runner needs a new rule, it goes in
   `game/play.ts` (pure, tested), not in the level file or `main.ts`.
3. **Kit first.** Each new mechanic is a small module in `packages/pixelkit/src/` with its own
   tests, as `carrier.ts`, `launcher.ts` and `timed.ts` are. Follow the "ladder" table in `LEVELS.html`:
   - *surface*: the world may answer `surfaceAt(x, y)` with a grip (how much of accel and decel
     applies), an optional speed cap above the usual run speed, and an optional belt speed.
     `stepBody` reads it through its optional fifth argument, as it reads carriers.
   - *zone*: a rectangle that adds a push to a body inside it each step; optionally on a beat with
     a warning phase, using `timedPhase`.
   - *dark*: the maze's torch overlay as a kit module. Lights punch through it. Move the maze to
     the kit version only if that is a small change and its tests still pass; otherwise leave the maze.
   - *hazard*: touching it costs a heart, as an enemy does (rule 4).
4. **Enemies, hearts, lives and pits.** Lars asked for this in so many words ("enemies, lives,
   pitfalls, platforming. Mario, but me in Oslo. A splash of Hollow Knight or other famous
   platformers"). It replaces the old rule that nothing can hurt. Build it once in
   `game/play.ts`, pure and tested, in batch A; later batches reuse it. Borrow mechanics only:
   no character, name, art, level or tune from any existing game.
   - *Hearts:* three, drawn in the header as waffle hearts. A touch from an enemy or a hazard
     takes one, knocks him back and makes him blink and untouchable for 1.5 s.
   - *Pits and water:* real bottomless pits now. A fall takes one heart and puts him back at the
     last flag or bench.
   - *Lives:* three to start, shown in the header as small helmets. No hearts left costs a life
     and puts him at the last flag or bench with full hearts. 100 skilling gives a life. A rare
     pickup (a brown-cheese slice) gives one too, one per level in a secret. No lives left: a
     plain "Game over" card, and the level starts over from its beginning with three lives.
     Cleared levels, runes, bracteates and best counts are never lost.
   - *Enemies* are data in the level (kind, place, patrol range), each kind a small pure rule:
     - *walker:* patrols a ledge, turns at edges. Landing on it from above defeats it and bounces
       him (higher if jump is held). Oslo casts: gull, pigeon, rat, e-scooter, shopping trolley.
     - *spiky:* as a walker, but landing on it hurts (hedgehog, a lit grill). Go round or over.
     - *flyer:* flies a sine line or swoops when he comes near (gull, crow, wasp). Can be bounced on.
     - *thrower:* stands still and lobs something on a beat with a visible wind-up (a snowball
       kid, a seagull dropping chips).
     - *jumper:* leaps out of a pit or the water on a beat (a salmon in Akerselva).
     Each level introduces one new kind alone and safe, then mixes it with the level's mechanic.
     Eight to twenty enemies per level. Defeated enemies puff into squares and drop a skilling.
   - *Benches* (the Hollow Knight splash): a park bench is a checkpoint he must choose to use
     (up arrow to sit). Sitting refills hearts and saves the spot. Flags still save on touch but
     do not heal. One or two benches per level, one of them a little off the path.
   - *An ability from the line itself:* clearing Holmenkollen gives the ski pole, a short dash
     (Shift or X; a second button on touch): 3 tiles in 10 steps, level flight, once per time in
     the air, a brief streak behind him. Levels 6 to 10 may require it after teaching it;
     levels 1 to 5 never do, but their secrets may use it. `MOVE` and `JUMP` stay as they are.
     The feather stays optional and maze-only.
   - *Pogo:* holding down while landing on an enemy or a spiky thing with the dash's pole out
     is not needed. Keep it simple: the bounce is the stomp.
   - *Two bosses,* simple and readable, each three hits with a telegraph before every attack and
     a flag and bench right before: the troll of Nordmarka (level 7, turns to stone when the
     headlamp and the dawn window hit it) and, in Nabolaget (level 10), the last thing between
     him and home. Design the second so it uses the dash, a bounce and a ride once each.
   - *Fairness:* an enemy is always visible for a second before it can reach him, never placed
     on a blind landing, and never at a flag or bench.
5. **Fair on a first try.** Every required gap is at most 3 tiles wide and 2 tiles up for the
   single jump. Anything timed shows a warning at least one second ahead. A flag stands before
   every stretch that can drop him, so no fall costs more than about 15 seconds.
6. **As long and as good as a Mario level** (NES or SNES). Lars asked for this in so many words,
   and it overrides the column counts in `LEVELS.html`.
   - *Length:* 220 to 280 columns per level (World 1-1 is about 210 tiles; our screen shows about
     20). The scripted single-jump clear should take at least 60 s; level 10 at least 90 s.
   - *Shape:* four sections, as those levels have. Teach the level's new thing where it cannot
     fail. Practise it over a small drop. Twist it by combining it with something from an earlier
     level. End with a set piece and the rune. A flag stands near the middle and before the set piece.
   - *Something every screen:* no screen of plain walking. Each 20 columns has a jump to make, a
     thing to ride, a choice of a high and a low route, or something to find.
   - *Pickups:* small coins along the way (call them `skilling`, drawn as a 5 px copper coin, map
     letter `$`), 40 to 80 per level. They trace the good line through a jump, reward the high
     route and hide in nooks. The header counts them and the card shows found/total; the best
     count is saved in `viking.progress`. They are never required.
   - *Secrets:* two or three nooks per level off the obvious path (above the screen edge, behind a
     one-way ledge, down a pipe-like well) holding a cluster of skilling. One of them holds the
     bracteate, behind the feather.
   - *Enemies:* see rule 4.
   - *An end worth reaching:* the rune sits at the top of the set piece, and taking it plays the
     level's flourish (the flag run up, lights coming on, the bell) before the card.
7. **One bracteate per level,** reachable only with the feather. The reach search must prove it
   cannot be had without. Never put the rune or the way forward behind the feather.
8. **Words** in Norwegian and English, in the dry voice of the existing signs. Two to four signs
   per level. Use the lines from `LEVELS.html` where it gives them.
9. **Art** is filled rectangles from the kit's swatches, 16 px tiles, no outlines, no image
   files, no fonts beyond the kit's text. Each level has its own far, mid and near backdrop and a
   pinned sky where `LEVELS.html` names one. Avoid large flat areas: brick, stone, snow and earth
   get courses, speckle or shadow bands as Akershus's wall has.
10. **The line map** (`levels/kart.ts`): each built level gets an open station with its own small
    landmark behind it. The hoarding moves to stand after the last built level, and is gone when
    all ten are built. The card's last line counts honestly ("Fem av ti runer. …" / "Five of ten runes. …").
11. **The front page must not change.** Its 28 reference screenshots in `/tmp/shots-before`
    (addresses: the `:5180` lines of `/tmp/shots-urls.txt`) must stay byte-identical. Check with
    `cmp` after the last kit change.
12. **Size.** The viking page's first script must stay under 60 kB gzipped. It is at 40.7 kB with
    three levels, so levels must load on demand: one dynamic import per level, with the line map
    and the level a fresh visitor starts in kept in the first script. Do this in batch A.
13. **Tests.** For each level: the map is well formed, a scripted player clears it with the single
    jump with no falls and every flag raised, and the reach search proves rule 7. The whole viking
    suite should finish in under two minutes on the Pi; make the reach search cheaper if needed.

## Feel, and what makes it one game

Lars: "Be a game designer, plan out something amazing. Remember to use the pixel style from the
front page." So, beyond the rules above:

- **The front page is the look.** Same person, same 16 px tiles, same swatches, same skies, same
  clouds and hills, same sign boards and bubbles. Put any new screenshot beside one of the front
  page: if it looks like another game, it is wrong. Enemies are drawn at the person's scale
  (8 to 14 px), two or three colours each, with a two-frame walk.
- **Every level has one idea and one picture.** The idea is its mechanic; the picture is the one
  screen a visitor would send to a friend (the parade under the flags, the flight off the jump,
  the wheel at Hjula, the troll at dawn, two trains passing, the city lit from Ekeberg, the green
  light in the window). Build that screen first and make it beautiful.
- **Juice, cheaply.** A two-step pause and a 2 px screen nudge on a stomp and on a hit. Dust
  squares on landing and on turning at speed. Skilling spin (three frames) and chime up a scale
  when taken in a row. Enemies squash one frame before they puff. All from the kit's sparks and sfx.
- **Rhythm.** Hard beat, then a rest: after every stretch that can cost a heart comes a safe
  screen with something to look at, a sign with a dry line, or a bench.
- **The city remembers.** What he did earlier shows later: cleared levels are lit from Ekeberg,
  the line map fills in, the helmet, feather, pole and gold show on him everywhere, front page included
  only where it already does.
- **A reason to come back.** Each level's card shows time, skilling found/total, bracteate, and
  whether it was cleared without losing a heart (a small waffle mark on the station board).

## The levels

Columns and beats are in `LEVELS.html`. What follows is what to get right.

### 4 Slottet (batch A)
Sky pinned to 17 May. Karl Johan as one long ramp uphill. Banners in the children's parade are
travelling carriers moving the way he walks; riding one crosses the crowd, which is drawn in
front of the street and is not solid. The bass drum is a launcher straight up. The Guard are
carriers that march back and forth across the square. Few pits and gentle enemies (pigeons, one e-scooter): this is the
breather. One banner is "the school's": draw it plain with a comment `// Lars: your school's
banner goes here`, since he has not said which. Rune S over the balcony.

### 5 Holmenkollen (batch A)
Sky pinned to winter, snowing. Icy steps down to the start hut: ice is a surface with low grip,
with rails (solid posts) that stop a slide. The inrun is a surface with no steering and a speed
cap well above 1.6, so speed climbs until the lip. One button matters: jump at the lip. The
flight is about twelve tiles. Rune H hangs in the flight path of a well-timed jump; a late or
missing jump still lands on the lower slope and lets him walk back up to try again by a lift or
steps, but does not get the rune. A flag stands at the hut. The far backdrop is the city seen
from above.

### 6 Akerselva (batch B)
Day, summer. Three terraces going down, each a stretch of river with a fall at the end. Logs are
carriers that drift downstream and come round again. The falls are zones that push down into
water. The water wheel at Hjula is a ring of carriers on an orbit: on at the bottom, off at the
top. Runesmia by the falls is a door to `/qr/`. Aamodt bru carries the sign about marching in
step. Rune A on the far bank.

### 7 Nordmarka (batch B)
Sky pinned to a summer night. Under the spruces the dark overlay shows only what the headlamp
lights; lit windows, blue-painted trunks and the rune show through. A blue-painted trunk is this
level's flag (same rule, different art). The moose is a walking carrier with a one-way back.
Ullevålseter has one lit window and a sign about waffles. Jernhaugen's mound stands here with a
door to `#jernhaugen`; leaving the maze from here returns him here. Rune N on a boulder.

### 8 Stortinget (batch C)
No sky: underground, with tiled walls and the T-bane roundel. Escalators are belt surfaces, one
of them against him. Trains are carriers on a timetable; a departure board counts down to the
next one, and their roofs are the only way through the tunnel. The third rail is a hazard, drawn
with a clear warning colour. The platform kiosk is a door for Quintle, locked with the front
page's padlock and its "kommer snart" words. Sign: "Dørene lukkes". Rune S at the far end.

### 9 Ekeberg (batch C)
Sky pinned to evening, with the banded sky of The Scream. The tram's roof carries him up the
hill. Sculptures are the ledges. Wind is a zone on a beat: leaves stream through it for a second
before it pushes. Three sheep in a row bounce him across a gap too wide for anything else. At
the viewpoint the city below shows one light for every level he has cleared. Rune E at the end
of the railing.

### 10 Nabolaget (batch C)
Sky pinned to a winter night with northern lights. Nothing new: icy roofs, chimney smoke that
lifts (an upward zone), clotheslines that bounce (launchers), a tram to ride, one dark stretch
behind the church, the spire as the last climb. The yellow house has a window with a Raspberry
Pi and a light that turns green when the rune is taken. Rune N beside it. The door Hjem leads
to `/`.

### The ending (batch C)
With all ten runes: the helmet turns gold (`viking.crowned` already carries this), the header
spells the whole name, and the card says so once, plainly, in both languages. The line map shows
all ten stations open and no hoarding.

## Also fix
- Langkaia: the sign bubble on the quay overlaps the "Verkstedet" board. Move one of them. (Batch A.)

## Hand back with
- Commits on the branch you are told to use, not pushed. Messages end with
  `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`.
- Test counts and build sizes, the scripted clear time per level, and the `cmp` result for the
  front page.
- Screenshots in `/tmp/shots-levels-2/`: for each level the start, every new mechanic in use,
  the rune, the bracteate and the card; plus the line map. Look at them yourself first and fix
  what looks wrong before handing back.
- What departs from this order and why, and what is weak, most important first.
