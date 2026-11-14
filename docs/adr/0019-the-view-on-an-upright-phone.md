# 0019. On an upright phone the viking view stays 240 art pixels wide

Decided 2026-11-14 by the order 12 implementer, on the planner's order (order 12, item 21), after
the adversarial review (D2).

## Context
The kit zooms in on tall screens so the front page's street fills an upright phone. In the viking
game that left a view of about 130 to 150 art pixels: he saw 75 to 90 px ahead, less than a
thrower's reach (112 px), and a walker coming at him was on screen for well under the second
0008 promises.

## Decision
The kit's stage takes a `minWidth` option (`openPage(factors, { minWidth })`); the viking page
passes 240, so the view is never narrower than 240 art pixels. Without the option nothing
changes: the front page still zooms in as before (its 28 reference pictures are the check).

## Consequences
- On an upright phone the viking game shows more sky above the street, and the person is
  smaller. Seeing what comes is worth more than the size.
- The maze inside the viking page shares the stage and gets the wider view too.

## Not chosen
- Asking the visitor to turn the phone. A request to rotate is a wall, and the game works upright.
- Making the throwers' reach depend on the view's width. The rules would then differ by screen.
