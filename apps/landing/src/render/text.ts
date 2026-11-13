import type { Door } from "@larshansen/pixelkit/doors";
import { boardWidth, doorBoard, type Board } from "@larshansen/pixelkit/text";
import type { DoorKind } from "../game/level";

// The front page's sign boards: one over each door, at a height that suits its house, and the
// welcome board on its post. Everything else on the text canvas is the kit's overlay.

const LIFT = { home: 13, workshop: 22, garden: 30, library: 13, opera: 14 } as const;

/** Sign boards above the doors, each as wide as its words, and the welcome board. */
export function layoutBoards(doors: Door<DoorKind>[], welcome: string): Board[] {
  const boards: Board[] = doors.map((d) => doorBoard(d, LIFT[d.kind]));
  boards.push({ text: welcome, cx: 104, y: 118, w: boardWidth(welcome), post: 160 });
  return boards;
}
