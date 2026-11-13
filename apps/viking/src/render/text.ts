import type { Door } from "@larshansen/pixelkit/doors";
import { boardWidth, doorBoard, type Board } from "@larshansen/pixelkit/text";
import type { SignSpot } from "../game/level";

// The sign boards in Vikingfjorden: over the doors, and on posts. Everything else on the text
// canvas is the kit's overlay, the same as the front page's.

/** How far above a door its board hangs. */
const LIFT = 13;
/** How high a post's board stands above the ground. */
const POST_HEIGHT = 30;

/** Sign boards above the doors and on the sign posts, each as wide as its words. */
export function layoutBoards(doors: Door[], signs: (SignSpot & { label: string })[]): Board[] {
  const boards: Board[] = doors.map((d) => doorBoard(d, LIFT));
  for (const s of signs) boards.push({ text: s.label, cx: s.x, y: s.bottom - POST_HEIGHT, w: boardWidth(s.label), post: s.bottom });
  return boards;
}
