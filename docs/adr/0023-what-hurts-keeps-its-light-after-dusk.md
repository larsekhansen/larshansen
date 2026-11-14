# 0023. After dusk what can hurt him keeps its light; the place's name stands on a plate

Decided 2026-11-14 by the order 13 implementer, on the planner's order (order 13, step 1, items 3
and 5), after the adversarial review (H3, H6).

## Context
The night's tint darkens everything on the street layer alike. Langkaia follows Oslo's clock, so
in winter most evening visitors meet its pigeons and rat as dark shapes on dark planks, and the
skilling went dim. Separately, the district banner was white text with a faint outline that was
hard to read over Ekeberg's bands, Holmenkollen's snow and the first frames of its fade-in.

## Decision
- Under any sky but the day's, after the street is drawn and tinted, each living enemy and what it
  throws gets a one-pixel pale rim (its shape a pixel up and to each side), a little of its own
  light back over its tinted self, and eye-shine where it has eyes (`enemyEyes`). The hazards (the
  third rail) get a lit edge. The skilling and the brown cheese are drawn again nearly as by day.
  In a level under the trees the dark that comes after covers it all but the headlamp's circle,
  as before.
- The banner stands on a dark rounded plate, full from its first frame, fading out after about two
  and a half seconds, in every level and on the line map. In the kit this is an option of
  `drawBanner` (`plate`); the front page does not use it.

## Consequences
- An enemy reads at night by its outline and its eyes; nothing else on the street is lighter.
- The banner covers a strip of sky for two and a half seconds on arrival.

## Not chosen
- Pinning Langkaia to dusk at the latest. It follows the real clock on purpose.
- A brighter tint for the whole street. The night would stop being night.
