# Order 32, part one: every light, in every level, after dark, before

Looked at on `origin/main` at `0e17455` (after order 31), built and served by `vite preview`, in three ways:

- **The census** (`../../glance/lights.ts`, on `src/render/lightcensus.ts`): every scene (the sixteen levels, the encore, the map
  with no runes and with every rune) drawn across its whole length at night and under its own sky, the passes of a frame in
  order as a browser draws them, every `light()` noted with the function that registered it, and what a later pass on the
  street draws over it (see-through: it dims the light; opaque: it covers it, as a thing in front does).
- **Pictures** (outside the repository, `~/.cache/claude-scratch-larshansen/o32/shots/1-lights/before/`): every level's walk every
  60 columns, the census's lights' columns, three places in the encore and the map in three states, at 390 x 844 with `&sky=night`
  (144) and under each scene's own sky where that is not the day (65); the walk and the encore and the map at 1280 x 800 both ways
  (120); and the camera on each lit thing at 1280 x 800 at night (`look=`, 157).
- **The code**: every drawing of a lamp, a lantern, a window, a sign, a fire or a stage, whether it registers a light, and every
  thing drawn over the night's tint that is not a light.

"Lit after dark now" means: after dusk its glass, flame or pane is drawn in its own colour over the night's tint (it is a light).
"Lights what is near it" means a pool on the ground, a ring through a level's own dark, light on a wall or on the water.

## The lights, level by level

| Thing | Where | Lit after dark now? | Should it be? | Lights what is near it? | Decision |
|---|---|---|---|---|---|
| The city's windows | every level's far layers but Nordmarka, Stortinget, Vigelandsparken, Korketrekkeren, Østensjøvannet (`lit` in the kit's backdrop) | yes | yes | no (far off) | keep |
| The T sign at the T-bane's entrance | every level, at its start | no: a blue disc with a white T, tinted | yes: Oslo's T signs are lit from inside | no | light its white T (`tbane` in `alive/ground.ts`); not its blue, which lit would come within 6 of his tunic |
| The invaders' neon sign (a heart in tubes on a board) | Langkaia, Akershus, Rådhuset, Slottet, Holmenkollen, Akerselva, Nordmarka, Stortinget, Ekeberg, Vigelandsparken, Korketrekkeren, Østensjøvannet, Bjørvika, Gamlebyen (`invasion.ts`) | no: tinted with the scenery | yes: a sign in tubes gives light, and it is the glamour's own (ADR 0050: neon is the invaders'), as the encore's stop on the map is (order 30) | no | light its tubes in their neon; under Nordmarka's dark let its board through with a little light round it |
| The Opera's foyer behind its glass | Langkaia, the start | yes (soft) | yes | no | keep (a fifth of it at most is behind the quay's edge, as by day) |
| The sheds' windows (Verkstedet, Runesmia) | Langkaia | yes | yes | no | keep |
| The 3D printer's lamp strip and hot end | Langkaia, Verkstedet's window | yes | yes | no | keep |
| The sauna club's hut, its window | Langkaia | yes (soft) | yes | no | keep |
| The sauna rafts' windows, the stoves' light | Langkaia, on the rafts | yes (soft) | yes | no | keep |
| The buoy's light, the motor boat's wheelhouse | Langkaia, past the prow | yes | yes | no | keep |
| The castle's buildings' windows and dormers | Akershus | yes | yes | no | keep (a few behind the walls in front, as by day) |
| Akershus slott's window, the keep's top floor | Akershus | yes | yes | no | keep |
| The arrow slits | Akershus, the outer wall | yes | yes | no | keep |
| The fire baskets inside the keep | Akershus | yes (soft), flames flicker (held with reduced motion) | yes: scenery fire, warm (ADR 0050) | a little (the soft light round the flame) | keep |
| The braziers' light | Akershus, four (enemies) | yes: a lamp's warm light over the fire | no: the fire hurts and is the glamour's, magenta and lime (ADR 0050); the warm light over it mixed it to a muddy yellow; every invader already glows in its own neon after dark (`glows`) | the warm light, over its own flames | take the warm light away: its light after dark is its neon glow, as every invader's |
| The square's lamp posts | Rådhuset, seven | yes | yes | yes: a pool on the square (the kit's `lampPool`, in front) | keep |
| The towers' tall windows, the reliefs' windows, the lantern on the clock tower | Rådhuset | yes | yes | no | keep |
| The ferry terminal's window, the passage's lamps | Rådhuset | yes (soft) | yes | no | keep |
| The island ferry's saloon | Rådhuset, the ferry | yes | yes | no | keep |
| Karl Johan's windows, the town houses' shop fronts, the Grand's ground floor | Slottet | yes | yes | no | keep (the crowd and the banners in front hide some, as by day) |
| The palace's windows | Slottet | yes | yes | no | keep |
| The jump tower's hut | Holmenkollen | yes | yes | no | keep |
| The scoreboard's floodlights | Holmenkollen, the flourish | yes, only as the rune is taken | yes | no | keep |
| The grills' light | Holmenkollen, Akerselva (enemies) | yes: a lamp's warm light over the coals | no: as the braziers | the warm light | take it away, as the braziers' |
| The workshop's, the mill's, Hjula's and Vaterland's windows | Akerselva | yes | yes | no | keep (one of Vaterland's houses is behind the rock, as by day) |
| Runesmia's forge in its door | Akerselva | yes (soft) | yes | no | keep |
| Ullevålseter's one lit window | Nordmarka | yes, and through the dark | yes | yes: a ring through the dark | keep |
| The fireflies, the dawn's shaft | Nordmarka | drawn over the dark | yes | the dawn: its pool | keep |
| The tube lamps, the tunnels' lamps, the cavern's great lamps | Stortinget | yes | yes (underground they are always on) | no | keep |
| The trains' windows, the departure boards, the kiosk's window | Stortinget | yes | yes | no | keep |
| The old wooden houses' windows at the foot of the hill | Ekeberg | yes | yes | no | keep |
| Ekebergrestauranten's long windows | Ekeberg | yes | yes | no | keep |
| The viewpoint's old lamp | Ekeberg, at the end of the deck | yes (by day too once cleared) | yes | no | a pool on the deck under it |
| The lamp posts along the park's paths | Ekeberg's near layer | yes | yes | no (behind the lane) | keep |
| The tram's windows | Ekeberg, Vålerenga | yes (order 31) | yes | no | keep |
| The houses' windows along the roofs | Vålerenga | yes | yes | no | keep |
| The lane's lanterns behind the church | Vålerenga | the glass yes; their light through the lane's dark no | yes | should: a ring through the lane's dark (`lights` in `nabolaget.ts`) | **the lane's dark has not been drawn since order 15** (see below); drawn again it costs about 1,580 rectangles a frame there, over the order's limit: left for a decision |
| The church's arched windows | Vålerenga | the glass yes; through the dark no (there is none) | yes | would: a ring each, with the dark | as the lane's lanterns |
| The yellow house: its windows, the door lamp, the lamp's light on its walls | Vålerenga, home | yes | yes | yes: on its walls | keep |
| The Pi on the sill, its light (red, blinking, until the rune is taken; then green, the window taking its glow) | Vålerenga, home | **not drawn at all** since order 15 | yes: DESIGN says it is there | its green glow in the window | draw it again (see below) |
| The paper cranes in Kruttverket's upstairs window | Vålerenga | **not drawn** since order 15 | yes (ADR 0014) | no | draw them again (see below) |
| Kværnertoppen's plate: its white rule and letters | Vålerenga | yes (soft: they catch the street's light, as a sign's white paint does) | yes, as they are | no | keep |
| Kruttverket's arched windows, its door lamp | Vålerenga | yes | yes | no | keep |
| The eyes over the lane's dark | Vålerenga | the eye-shine every enemy has after dark, yes; the eyes over the lane's dark, no (there is no dark) | with the dark | no | with the dark, if it comes back |
| The ticket kiosk at Rådhusbrygga, the museums' halls | Bygdøy | yes | yes | no | keep |
| The ferry's wheelhouse | Bygdøy, the ferry | no | yes: as Rådhuset's ferry | no | light its three windows |
| The pier's lamp | Bygdøy | yes | yes | no | a pool on the planks under it |
| The main gate's lanterns | Vigelandsparken, the start | yes (order 31) | yes | no | keep |
| The bridge's lanterns | Vigelandsparken, the far parapet | yes | yes | no | a pool on the bridge's deck under each |
| Frognerseteren's windows | Korketrekkeren | yes | yes | no | keep |
| The lit trail's lamps | Korketrekkeren, the trees at dusk | registered, but **dimmed**: the dusk under the trees is drawn in front of them (the census: all seven, 100 % of their pixels) | yes: it is a lit trail | a lit line on the snow, drawn under the dusk too | register the lamps in front, over the dusk, and give each a warm pool on the run, following its steps |
| The crossing's lights | Korketrekkeren | yes, while the barrier comes down (held with reduced motion) | yes | no | keep |
| Midtstuen's shelter | Korketrekkeren | yes (soft) | yes | no | keep |
| The sun coming up behind the far shore, its light on the water | Østensjøvannet | yes | yes | yes: on the water | keep |
| The far shore's lights, the new town's windows | Bjørvika | yes | yes | yes: their light on the fjord | keep |
| The cranes' warning lights | Bjørvika, at the jibs' tips | yes, red, blinking slowly (lit with reduced motion) | yes: cranes have them | no | keep (10.3 from the warning red; a dot at a jib's tip, never an outline) |
| The welder's arc and sparks | Bjørvika | yes: a blue-white arc at rest, magenta and lime while the sparks fall | yes: a hurting fire burns neon (ADR 0050) | no | keep, the glamour's own |
| The site hut's window, the top crane's cab, the towers' lit windows | Bjørvika | yes | yes | no | keep |
| The street's lamps | Gamlebyen, three | yes | yes | should: a pool on the cobbles | **the pool was under the cobbles**: registered behind the lane, so the tiles covered it (the census: 100 %) | register it in front |
| The torches | Gamlebyen, the town, the market, the quay | yes, flickering (held with reduced motion), out one by one at dawn | yes: scenery fire, warm | should: a pool each | **under the ground too** | register their pools in front; the flame a little yellower (it was 7.8 from the glamour's laser orange) |
| The market hall's firelight, its door's light on the street | Gamlebyen | the firelight yes; the door's pool under the street | yes | the door's pool | the pool in front; the firelight a little yellower (it was 4.8 from the laser orange) |
| The torches and the moon on the water | Gamlebyen, the harbour | yes | yes | yes (they are reflections) | keep |
| The town's lights on Ekeberg's slope, the roofs' windows | Gamlebyen's far layers | yes | yes | no | keep |
| The park's lamp | the encore, by the path | yes | yes | no | a pool on the path |
| The stage's neon, its lightning bolts in tubes | the encore | no: tinted with the stage | yes: the glamour's own neon (as its stop on the map, order 30) | no | light the tubes while the glamour is on (dark glass once he is plain) |
| The stage's lights on the truss, their beams, the cold spot on him before the show | the encore | no: tinted | yes: a stage's lights | the beams on the curtain and the deck | light the lenses while the show is on (warm white once plain), and the beams and the cold spot as their own light |
| The rune stones, the ticks on them, the empty slots' faint outline | the map | yes | yes (things done keep their light, ADR 0039) | no | keep |
| The stations' skylines' windows | the map | no: dark glass | yes: every level's buildings have lit windows after dark | no | light about half of each skyline's windows, the same ones every night |
| The lanterns along the viaducts, the longship's stern lantern | the map with every rune | yes | yes | no | keep |
| The encore's stop | the map with every rune | yes, until it is seen (order 30) | yes | a glow of its neon | keep |

## What glows after dark and is not a light

| Thing | Where | Glows now? | Should it? | Decision |
|---|---|---|---|---|
| The red outline round what hurts, the calm outline round what does not | everything that moves | yes (ADR 0044) | yes: a role | keep |
| The invaders' neon glow under the outline | every invader | yes (ADR 0050) | yes: neon is the glamour's, and looks better at night | keep; over a level's own dark (Nordmarka, and Vålerenga's lane again) with the outline over it (order 31) |
| Eye-shine | every enemy with eyes | yes (ADR 0023) | yes | keep |
| The skilling and the cheese, nearly as by day | everywhere | yes (ADR 0023) | yes: what he takes | keep |
| The hazards' stripe | the third rail, the rebar, the barrier, the branches, the sparks | yes (ADR 0044) | yes | keep |
| The paint on what he stands on | everywhere | yes (ADR 0044) | yes | keep |
| Things to use: their cyan corners | doors, benches, signs | yes (ADR 0040) | yes | keep |
| His warm rim | him | yes (ADR 0040) | yes | keep |
| The neon trail behind what the invaders throw | every thrower | yes (ADR 0051) | yes | keep |
| The brazier's and the grill's warm light | see above | yes | no | taken away |

No other thing glows: no prop, sign board, coin or door gives light of its own, and nothing drawn after a light dims it but the dusk at
Korketrekkeren (the census: one function in one level dims anything, and it is that one).

## Found on the way: Vålerenga's night has not been drawn since order 15

Before order 15 `main.ts` drew the night under any level with a `dark` (`if (p.def.dark) drawNight(v)`): Nordmarka's forest and
Vålerenga's lane behind the church, each with its lights through it and what it draws over it (`overDark`). Order 15 moved the night
into `render/night.ts` behind a hook, `Art.night`, and gave the hook to Nordmarka only (`39f30f5`). Since then Vålerenga's `dark`,
`lights` and `overDark` have been called by nothing: the lane behind the church is as light as the street, the church's windows and
the lane's lanterns throw no light through it, and what `overDark` draws (the eyes over the dark, the paper cranes in Kruttverket's
window, the Pi on the yellow house's sill and its red and green light) has not been drawn at all, by night or by day. DESIGN still says "The
Pi's light in the yellow house's window is red until Nabolaget's rune is taken, then green." The before picture at the home
(`night-390/nabolaget-c212.png`) shows the window lit and the sill empty.

Decision: draw the Pi and its light and the paper cranes again (Vålerenga's `night` hook now draws them, over the night's tint, by
night and by day, as before order 15: a few rectangles at two windows). The lane's own dark is not drawn again in this order: built and
measured, it cost about 1,580 rectangles a frame in the lane at 390 x 844 (6,711 in all, against 5,131), over the order's limit of 150 a
place, and the lane has been as light as the street on the live site since 15 November. It is for the planner and Lars: the code is
there (`dark`, `lights`, `overDark` in `nabolaget.ts`; `drawNight` would have to come with Vålerenga too, so `render/night.ts` would go
with the kit's dark into a chunk both fetch, and the lane's invaders would keep their red outline over the dark with `overTheDark`).
