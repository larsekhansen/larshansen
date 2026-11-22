import { frame, type Frame, type Piece } from "./frames";
import { HIM_INK } from "./him";

// Him from the front and from behind (order 37), for the maze, where he walks up and down corridors as well as along them
// (`packages/maze`): the same man as his side sheet (`him.ts`), at the same size (his 10 x 14 box), in its ramps and letters,
// by the same methods (per-pixel maps, way 3 of `docs/games/GRAIN.md`), lit from the top left. Going away he shows his back:
// the helmet's dome and rim, the back of his head and neck, the cape over his shoulders down to the belt, his heels; coming
// toward he shows his face under the rim with the helmet's nose guard, his eyes, the tunic's knit, the belt and its buckle,
// his toes. Each has a standing pose that breathes (and, from the front, blinks) and a run of four frames with the side run's
// rhythm: a step, a pass a pixel higher, the other step, the other pass a pixel higher, picked by the distance he covers
// (`STRIDE`), so he keeps the same pace round a corner.
//
// His torch hand is held out on the right (at column 9, row 8 of his box, where the maze draws the torch for his side frames
// too), so the free arm swings on the left. Facing left, a frame is mirrored about his box, as the side frames are. The viking
// game draws none of this: it lives in a file of its own, which only the maze imports, so it is in neither the fjord's first
// script nor `feel`'s file.

const at = (rows: readonly string[], dx = 0, dy = 0): Piece => [rows, dx, dy];
const make = (name: string, ...pieces: Piece[]) => frame(name, HIM_INK, ...pieces);

// --- Coming toward: his face ---------------------------------------------------------------------------------------------

// The helmet's dome lit on its left, the rim a band across his brow, the nose guard down between his eyes; the face lit on
// the left and shaded on the right; the tunic over his shoulders, lit on the left, the knit on his chest, the belt with its
// buckle; his free arm on the left with its hand, his torch arm out to the right; a glimpse of the cape behind his left arm.
const FACE = [
  "....Ww....",
  "...IIij...",
  ".rRRRrrrr.",
  "..SSiisz..",
  "..SeSsez..",
  "..SSsssz.."
];
const FRONT = [
  ".BBbbbbxx.",
  "cBbPbbPbx.",
  "cBbbBbbbx.",
  ".byyynyy.."
];
const FRONT_HIPS = ["..DDDddd.."];
/** His free hand, at his side; forward (toward us, lower); back (foreshortened, higher). */
const FREE: Piece = [["S"], 1, 10];
const FREE_FWD: Piece = [["b", "S"], 1, 10];
const FREE_BACK: Piece = [["S"], 1, 9];
/** Standing, from the front: the near leg lit, the far one shaded, his boots' toes. */
const FRONT_STAND = ["..DDDddd..", "..Dd..dq..", "..Dd..dq..", "..LK..Kk.."];
// The run, from the front (feet planted where they land; the foot that is off the ground is a pixel or two higher).
const FRONT_RUN = [
  // 0: his left foot down, the right lifted behind.
  ["..DDDddd..", "..Dd..dq..", "..Dd..kk..", "..LK......"],
  // 1: his left leg under him (him a pixel higher), the right passing it, its foot off the ground.
  ["...Dddq...", "...Dddq...", "...Ddkk...", "...LK....."],
  // 2: his right foot down, the left lifted behind.
  ["..DDDddd..", "..Dd..dq..", "..kk..dq..", "......Kk.."],
  // 3: his right leg under him, the left passing.
  ["...Dddq...", "...Dddq...", "...kkdq...", ".....Kk..."]
];
const TOWARD_BLINK: Piece = [["z..z"], 3, 4];

// --- Going away: his back ------------------------------------------------------------------------------------------------

// The dome and the rim from behind, the back of his head and his neck under it, the cape from his shoulders to his belt (lit
// on the left, a fold down it, its hem), his sleeves either side, his heels.
const NAPE = [
  "....Ww....",
  "...IIij...",
  ".rRRRrrrr.",
  "..sszzzz..",
  "..szzzzz..",
  "...zzzz..."
];
const BACK = [
  ".BCCCcccx.",
  ".BCCcCccx.",
  ".bCCcCccx.",
  ".cCCcCcc.."
];
const BACK_STAND = ["..DDDddd..", "..Dd..dq..", "..Dd..dq..", "..KK..kk.."];
const BACK_RUN = [
  // 0: his left foot down, the right lifted behind: its sole.
  ["..DDDddd..", "..Dd..dq..", "..Dd..kk..", "..KK......"],
  // 1: his left leg under him (him a pixel higher), the right passing, its sole off the ground.
  ["...Dddq...", "...Dddq...", "...Ddkk...", "...KK....."],
  // 2: his right foot down, the left lifted.
  ["..DDDddd..", "..Dd..dq..", "..kk..dq..", "......kk.."],
  // 3: his right leg under him, the left passing.
  ["...Dddq...", "...Dddq...", "...kkdq...", ".....kk..."]
];
/** His free hand from behind: at his side, swung back (toward us, lower), swung forward (hidden but for a pixel). */
const BACK_FREE: Piece = [["S"], 1, 10];
const BACK_FREE_BACK: Piece = [["b", "S"], 1, 10];
const BACK_FREE_FWD: Piece = [["s"], 1, 9];

/** His frames from the front and from behind, by name: the maze draws from these, the sheet and the tests read them. */
export const HIM_VIEWS = {
  toward: {
    stand: make("toward, standing", at(FACE), at(FRONT, 0, 6), at(FRONT_STAND, 0, 10), FREE),
    breath: make("toward, breathing", at(FRONT, 0, 6), at(FACE, 0, 1), at(["...Ww ...."], 0, 1), at(FRONT_STAND, 0, 10), FREE),
    blink: make("toward, blinking", at(FACE), at(FRONT, 0, 6), at(FRONT_STAND, 0, 10), FREE, TOWARD_BLINK),
    breathBlink: make("toward, breathing, blinking", at(FRONT, 0, 6), at(FACE, 0, 1), at(FRONT_STAND, 0, 10), FREE, [["z..z"], 3, 5]),
    run: [
      make("toward, run 1", at(FACE), at(FRONT, 0, 6), at(FRONT_RUN[0], 0, 10), FREE_BACK),
      make("toward, run 2", at(FACE, 0, -1), at(FRONT, 0, 5), at(FRONT_HIPS, 0, 9), at(FRONT_RUN[1], 0, 10), [["S"], 1, 9]),
      make("toward, run 3", at(FACE), at(FRONT, 0, 6), at(FRONT_RUN[2], 0, 10), FREE_FWD),
      make("toward, run 4", at(FACE, 0, -1), at(FRONT, 0, 5), at(FRONT_HIPS, 0, 9), at(FRONT_RUN[3], 0, 10), [["S"], 1, 9])
    ]
  },
  away: {
    stand: make("away, standing", at(NAPE), at(BACK, 0, 6), at(BACK_STAND, 0, 10), BACK_FREE),
    breath: make("away, breathing", at(BACK, 0, 6), at(NAPE, 0, 1), at(["...Ww ...."], 0, 1), at(BACK_STAND, 0, 10), BACK_FREE),
    run: [
      make("away, run 1", at(NAPE), at(BACK, 0, 6), at(BACK_RUN[0], 0, 10), BACK_FREE_FWD),
      make("away, run 2", at(NAPE, 0, -1), at(BACK, 0, 5), at(FRONT_HIPS, 0, 9), at(BACK_RUN[1], 0, 10), [["S"], 1, 9]),
      make("away, run 3", at(NAPE), at(BACK, 0, 6), at(BACK_RUN[2], 0, 10), BACK_FREE_BACK),
      make("away, run 4", at(NAPE, 0, -1), at(BACK, 0, 5), at(FRONT_HIPS, 0, 9), at(BACK_RUN[3], 0, 10), [["S"], 1, 9])
    ]
  }
} satisfies Record<string, Record<string, Frame | Frame[]>>;

/** Every frame of his front and back, with its name (for the sheet and the tests). */
export const VIEW_FRAMES: Frame[] = [...Object.values(HIM_VIEWS.toward), ...Object.values(HIM_VIEWS.away)].flat();
