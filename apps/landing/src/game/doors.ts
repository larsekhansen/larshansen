import { PLAYER, TILE } from "./config";
import type { DoorKind, DoorSpot } from "./level";
import type { Body } from "./physics";

export interface AppLink {
  id: string;
  label: string;
  href: string | null;
  soon: boolean;
  el: HTMLElement;
}

export interface Door {
  id: string;
  kind: DoorKind;
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

/** The plain links in the page header are the list of apps. One link, one door. */
export function readAppLinks(root: ParentNode = document): AppLink[] {
  return [...root.querySelectorAll<HTMLElement>("[data-door]")].map((el) => ({
    id: el.dataset.door ?? "",
    label: el.dataset.name ?? el.textContent?.trim() ?? "",
    href: el instanceof HTMLAnchorElement ? el.href : null,
    soon: el.hasAttribute("data-soon"),
    el
  }));
}

export function buildDoors(spots: DoorSpot[], links: AppLink[], signs: Record<string, string>): Door[] {
  return spots.map((s) => {
    const link = links.find((l) => l.id === s.id);
    const secret = s.kind === "opera";
    return {
      id: s.id,
      kind: s.kind,
      x: s.x,
      w: TILE,
      h: TILE * 2,
      bottom: s.bottom,
      sign: signs[s.id] ?? link?.label ?? "?",
      name: link?.label ?? "",
      href: link?.href ?? null,
      soon: !secret && (!link || link.soon || !link.href),
      secret,
      open: false,
      shake: 0
    };
  });
}

/** The door the player is standing in front of, if any. */
export function doorAt(b: Body, doors: Door[]): Door | null {
  if (!b.onGround) return null;
  const cx = b.x + PLAYER.w / 2;
  return doors.find((d) => cx >= d.x - 3 && cx <= d.x + d.w + 3 && Math.abs(b.y + PLAYER.h - d.bottom) < 1) ?? null;
}
