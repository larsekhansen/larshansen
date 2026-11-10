import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import type { DoorSpot } from "./level";
import type { Body } from "@larshansen/pixelkit/physics";

// The same shape as the front page's doors: one plain link in the header, one door in the world.

export interface AppLink {
  id: string;
  el: HTMLElement;
}

export interface Door {
  id: string;
  x: number;
  w: number;
  h: number;
  bottom: number;
  sign: string;
  href: string;
  open: boolean;
  shake: number;
}

/** The plain links in the page header. The game only lights them up; they work without it. */
export function readAppLinks(root: ParentNode = document): AppLink[] {
  return [...root.querySelectorAll<HTMLElement>("[data-door]")].map((el) => ({ id: el.dataset.door ?? "", el }));
}

export function buildDoors(spots: DoorSpot[]): Door[] {
  return spots.map((s) => ({ id: s.id, x: s.x, w: TILE, h: TILE * 2, bottom: s.bottom, sign: s.sign, href: s.href, open: false, shake: 0 }));
}

/** The door the player is standing in front of, if any. */
export function doorAt(b: Body, doors: Door[]): Door | null {
  if (!b.onGround) return null;
  const cx = b.x + PLAYER.w / 2;
  return doors.find((d) => cx >= d.x - 3 && cx <= d.x + d.w + 3 && Math.abs(b.y + PLAYER.h - d.bottom) < 1) ?? null;
}
