# 0021. On an upright screen he stands two thirds down, and the world goes on round him

Decided 2026-11-14 by the order 13 implementer, on the planner's order (order 13, step 1, item 7),
after order 12's screenshots at 390 × 844. Adjusts [0019](0019-the-view-on-an-upright-phone.md).

## Context
0019 keeps an upright phone's view at least 240 art pixels wide, which makes it very tall: 845 art
pixels at a device pixel ratio of 1, about 630 on a real phone. The camera kept the bottom of the
map at the bottom of the view, so he stood at the very bottom under a tall empty sky. The far
layers, placed for a view about 200 pixels high, hung in the middle of that sky or filled it as
flat blocks (Akerselva's hills, Ekeberg's evening, Nabolaget's city), a spruce's trunk or the dawn's
shaft in Nordmarka ran up to the top of the screen, and the help line ran off both edges.

## Decision
- On a view taller than it is wide the camera lets its bottom go below the map, so he stands about
  two thirds of the way down. Below the map the bottom row goes on down: ground (its earth, no
  grass), or deep water. A wide screen is unchanged.
- The far layers (far, mid, near) are drawn as for a view 220 pixels high centred on him, and moved
  down to where he stands; what they place in the world (the far shore at the water line) stays
  where it is. The sky above them is the sky.
- A level under the ground says so (`underground`, Stortinget): its far layers fill the whole view
  and are not moved, and the rock of its top row goes on up.
- What is drawn from the top of the view down (Nordmarka's dawn shaft and sunrise) starts at the top
  of the map instead. The line map's fjord and the viaduct's piers go on down.
- The help line wraps, centred, on a narrow screen (viking only; the front page's is untouched).

## Consequences
- An upright phone shows him with ground under him and the city, the forest or the station round
  him, and sky above, as a wide screen does, only taller.
- Checked at 390 × 844 and 844 × 390 in headless Firefox at a device pixel ratio of 1, all ten
  levels and the map; not on a phone.

## Not chosen
- Capping the view's height (letterboxing). Bars above and below on a phone are a waste of its screen.
- Redrawing every far layer for every height. The shift does it in one place.
