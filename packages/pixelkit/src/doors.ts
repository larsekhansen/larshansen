import { PLAYER, TILE } from "./config";
import type { Body } from "./physics";

// Doors: one plain link in the page header, one door in the world. The header works without
// JavaScript; the game reads it, so the links and the doors cannot drift apart. A door can also
// carry its own address (the front page's secret, the viking game's doors), and then the link only
// lights up.

export interface AppLink {
  id: string;
  label: string;
  href: string | null;
  soon: boolean;
  el: HTMLElement;
}

/** Where a door stands, from the map. `kind` says how the scene draws it. */
export interface DoorSpot<K extends string = string> {
  id: string;
  kind: K;
  x: number;
  bottom: number;
  /** Its own address, which wins over the header link's. */
  href?: string;
  /** The words on its board, when the scene does not give them. */
  sign?: string;
  name?: string;
  /** Not in the header, found on foot only, never "coming soon". */
  secret?: boolean;
}

export interface Door<K extends string = string> {
  id: string;
  kind: K;
  x: number;
  w: number;
  h: number;
  bottom: number;
  sign: string;
  name: string;
  href: string | null;
  soon: boolean;
  secret: boolean;
  open: boolean;
  shake: number;
}

/** The plain links in the page header, in their order. */
export function readAppLinks(root: ParentNode = document): AppLink[] {
  return [...root.querySelectorAll<HTMLElement>("[data-door]")].map((el) => ({
    id: el.dataset.door ?? "",
    label: el.dataset.name ?? el.textContent?.trim() ?? "",
    href: el instanceof HTMLAnchorElement ? el.href : null,
    soon: el.hasAttribute("data-soon"),
    el
  }));
}

/** One door per spot, one tile wide and two high. `signs` overrides the words on a door's board. */
export function buildDoors<K extends string>(spots: DoorSpot<K>[], links: AppLink[] = [], signs: Record<string, string> = {}): Door<K>[] {
  return spots.map((s) => {
    const link = links.find((l) => l.id === s.id);
    const secret = !!s.secret;
    return {
      id: s.id,
      kind: s.kind,
      x: s.x,
      w: TILE,
      h: TILE * 2,
      bottom: s.bottom,
      sign: signs[s.id] ?? s.sign ?? link?.label ?? "?",
      name: link?.label ?? s.name ?? "",
      href: s.href ?? link?.href ?? null,
      soon: !secret && !s.href && (!link || link.soon || !link.href),
      secret,
      open: false,
      shake: 0
    };
  });
}

/** The door the player is standing in front of, if any. */
export function doorAt<D extends Door>(b: Body, doors: D[]): D | null {
  if (!b.onGround) return null;
  const cx = b.x + PLAYER.w / 2;
  return doors.find((d) => cx >= d.x - 3 && cx <= d.x + d.w + 3 && Math.abs(b.y + PLAYER.h - d.bottom) < 1) ?? null;
}

/**
 * The door under a point in the world (a click, the mouse), generous by a tile to each side and up
 * to its sign. The secret door is never offered: it has to be found on foot.
 */
export function doorNear<D extends Door>(doors: D[], x: number, y: number): D | null {
  return doors.find((d) => !d.secret && x >= d.x - TILE && x <= d.x + d.w + TILE && y >= d.bottom - TILE * 3.5 && y <= d.bottom + 2) ?? null;
}

/** How far a door that will not open is pushed sideways while it shakes. */
export const shakeX = (shake: number) => (shake ? (shake % 4 < 2 ? 1 : -1) : 0);

/** Steps from the press to the scene being gone: drawn in (10), the door opens as he fades (20), then the dark (14). */
export const WALK_IN_STEPS = 44;

/**
 * Step `s` (from 1) of going through a door: he is drawn to its middle, the door opens while he
 * fades, then the screen goes dark. With reduced motion it is over at once. Moves the body and
 * opens the door; returns what to set on the scene, and whether he is through.
 */
export function walkIn(b: Body, d: Door, s: number, quick: boolean): { alpha: number | null; fade: number | null; done: boolean } {
  const cx = d.x + d.w / 2 - PLAYER.w / 2;
  let alpha: number | null = null;
  let fade: number | null = null;
  if (!quick && s <= 10) b.x += (cx - b.x) * 0.35;
  if (!quick && s > 10 && s <= 30) {
    d.open = true;
    alpha = Math.max(0, 1 - (s - 10) / 20);
  }
  if (!quick && s > 30) fade = Math.min(1, (s - 30) / 14);
  return { alpha, fade, done: quick || s >= WALK_IN_STEPS };
}
