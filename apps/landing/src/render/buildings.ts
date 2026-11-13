import type { Door } from "@larshansen/pixelkit/doors";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { R, gable, light, stoneColumn, view, wdisc } from "@larshansen/pixelkit/paint";
import { BRICK, DOORWAY, FACADE, GLASS, GROUND, INK, MASONRY, METAL, PAINT, PLANTS, ROOF, SNOW, STONE_BACK, WHITE } from "@larshansen/pixelkit/palette";
import { flagPole, lampPost, panelDoor, pane, smoke, tree } from "@larshansen/pixelkit/props";
import { WORLD_W, districtFrom, rampAt, type DoorKind } from "../game/level";

const reduced = () => view.reduced;

// The street-level landmarks. Each part of town is drawn relative to where its district starts,
// so the map can change without moving every building by hand. The street is at y 160.

const G = 160;
const TRIM = PAINT.trim;

function walls(x: number, top: number, w: number, color: string, line: string) {
  R(x, top, w, G - top, color);
  for (let i = 3; i < w - 2; i += 4) R(x + i, top, 1, G - top, line);
  R(x, top, 2, G - top, TRIM);
  R(x + w - 2, top, 2, G - top, TRIM);
}

/** Street lamps, by where they stand. The street lights up around them after dark. */
export const LAMPS: { x: number; tall: number }[] = [
  { x: 238, tall: 36 },
  { x: districtFrom("Bjørvika") + 14, tall: 40 },
  { x: districtFrom("Bjørvika") + 178, tall: 40 }
];
const lamp = (i: number) => lampPost(LAMPS[i].x, G, LAMPS[i].tall);

const QR_BITS = ["111010111", "101001101", "111011111", "000101000", "110111011", "001010100", "111001010", "101110011", "111010101"];

/** Vålerenga and Kampen: small wooden houses, Lars's yellow one, and a brick workshop. */
function valerengaKampen(home: Door<DoorKind> | undefined, workshop: Door<DoorKind> | undefined, sky: Sky, time: number) {
  const roof = (c: string) => (sky.snow ? SNOW.lying : c);
  walls(8, 112, 80, PAINT.mint, PAINT.mintLine);
  gable(2, 112, 92, 24, roof(ROOF.red));
  pane(20, 124, 12, 10);
  pane(56, 124, 12, 10);
  for (let x = 2; x < 100; x += 4) R(x, 150, 2, 10, TRIM);
  R(0, 152, 100, 1, TRIM);
  R(0, 156, 100, 1, TRIM);

  walls(136, 104, 96, PAINT.ochre, PAINT.ochreLine);
  R(206, 78, 6, 14, MASONRY.chimney);
  gable(130, 104, 108, 28, roof(ROOF.slate));
  pane(150, 112, 14, 12);
  pane(204, 112, 14, 12);
  pane(150, 134, 14, 12);
  pane(204, 134, 14, 12);
  if (home) {
    R(home.x - 2, home.bottom - home.h - 2, home.w + 4, home.h + 2, TRIM);
    panelDoor(home, PAINT.homeDoor, PAINT.homeDoorPanel);
  }

  walls(248, 116, 64, PAINT.red, PAINT.redLine);
  gable(243, 116, 74, 20, roof(ROOF.slate));
  pane(258, 128, 12, 10);
  pane(290, 128, 12, 10);
  lamp(0);

  // A brick workshop with a cast-iron window, home of QR-verkstedet.
  R(352, 100, 96, 60, BRICK.red);
  for (let y = 103; y < G; y += 4) {
    R(352, y, 96, 1, BRICK.course);
    for (let x = 352 + ((y / 4) % 2) * 4; x < 448; x += 8) R(x, y - 3, 1, 3, BRICK.course);
  }
  gable(346, 100, 108, 14, roof(ROOF.slate));
  R(424, 78, 4, 18, METAL.pipe);
  R(423, 76, 6, 2, METAL.pipeCap);
  R(425, 80, 1, 14, METAL.pipeShine);
  if (!reduced()) smoke(424, 72, time);
  R(358, 116, 24, 34, METAL.castIron);
  for (let dy = 0; dy < 6; dy++) {
    const half = Math.round(12 * Math.sqrt(1 - ((6 - dy) / 6) ** 2));
    R(370 - half, 110 + dy, half * 2, 1, METAL.castIron);
  }
  for (let y = 117; y < 149; y += 6)
    for (let x = 359; x < 381; x += 6) {
      R(x, y, 4, 4, GLASS.pane);
      light(x, y, 4, 4);
    }
  R(410, 118, 24, 24, WHITE);
  QR_BITS.forEach((row, r) => [...row].forEach((b, c) => b === "1" && R(413 + c * 2, 121 + r * 2, 2, 2, INK)));
  if (workshop) {
    R(workshop.x - 2, workshop.bottom - workshop.h - 2, workshop.w + 4, workshop.h + 2, PAINT.shopFrame);
    panelDoor(workshop, PAINT.shopDoor, PAINT.shopDoorPanel);
  }
  if (sky.flags) {
    flagPole(4, 60, G);
    flagPole(126, 70, G);
  }
}

/** Tøyen: the palm house and the gate into Botanisk hage. */
function toyen(gate: Door<DoorKind> | undefined, sky: Sky) {
  const o = districtFrom("Tøyen");
  const glass = GLASS.palmHouse;
  R(o + 66, 120, 52, 40, glass);
  for (let dy = 0; dy <= 16; dy++) {
    const half = Math.round(26 * Math.sqrt(1 - ((16 - dy) / 16) ** 2));
    R(o + 92 - half, 104 + dy, half * 2, 1, glass);
  }
  for (let x = o + 68; x < o + 118; x += 6) R(x, 112, 1, 48, TRIM);
  R(o + 66, 132, 52, 1, TRIM);
  R(o + 66, 146, 52, 1, TRIM);
  for (const [px, py] of [[o + 78, 140], [o + 100, 132], [o + 90, 148]]) {
    R(px, py, 2, 160 - py, PLANTS.palmTrunk);
    R(px - 5, py, 12, 2, PLANTS.hedge);
    R(px - 3, py - 2, 8, 2, PLANTS.hedgeLight);
  }
  for (let x = o + 68; x < o + 116; x += 8) light(x, 122, 5, 8, "soft");

  if (gate) {
    R(o + 120, 118, 7, 42, MASONRY.gatePost);
    R(o + 145, 118, 7, 42, MASONRY.gatePost);
    for (let y = 122; y < 160; y += 6) {
      R(o + 120, y, 7, 1, MASONRY.gatePostLine);
      R(o + 145, y, 7, 1, MASONRY.gatePostLine);
    }
    for (let i = 0; i < 18; i++) R(o + 127 + i, 118 - Math.round(Math.sin((i / 17) * Math.PI) * 8), 1, 2, METAL.castIron);
    wdisc(o + 136, 108, 2, METAL.castIron);
    // Through the gate: rows of clipped hedge with gaps, like the start of a maze, on gravel.
    const top = gate.bottom - gate.h;
    R(gate.x, top, gate.w, gate.h, gate.open ? DOORWAY.garden : PLANTS.gateShade);
    if (!gate.open) {
      R(gate.x, top + 6, gate.w - 5, 4, PLANTS.clipped);
      R(gate.x + 5, top + 15, gate.w - 5, 4, PLANTS.clipped);
      R(gate.x, top + 24, gate.w - 6, 3, PLANTS.clipped);
      R(gate.x, gate.bottom - 3, gate.w, 3, GROUND.gravel);
    }
    R(o + 127, top, 1, gate.h, METAL.castIron);
    R(o + 144, top, 1, gate.h, METAL.castIron);
  }
  tree(o + 168, G, sky);
  tree(o + 264, G, sky);
}

// Ruined stone: irregular blocks with dark mortar, a little moss, and the same stones every visit.
// Walls you can stand on are a little lighter and warmer than the ruins further back.

/**
 * Gamlebyen: what is left of Mariakirken in Middelalderparken, a broken arch and a ruined wall.
 * This is scenery, drawn in its own layer a little further back than the walls you can stand on.
 */
export function drawRuins(sky: Sky) {
  const o = districtFrom("Gamlebyen");
  const back = (x: number, top: number, bottom: number, gapTop = 0, gapBottom = 0) => stoneColumn(x, top, bottom, gapTop, gapBottom, STONE_BACK);
  const moss = (x: number, y: number) => R(x, y - 1, 1, 2, sky.snow ? SNOW.lying : STONE_BACK.moss);

  // A broken arch: one pillar standing, the other snapped off, and the curve broken past the top.
  const cx = o + 40;
  for (let x = cx - 24; x < cx - 16; x++) back(x, 118, G);
  for (let x = cx + 16; x < cx + 24; x++) back(x, 132 + (x % 3), G);
  for (let x = cx - 24; x <= cx + 9; x++) {
    const dx = x - cx;
    const outer = Math.round(118 - Math.sqrt(24 * 24 - dx * dx));
    const inner = Math.abs(dx) < 16 ? Math.round(118 - Math.sqrt(16 * 16 - dx * dx)) : 118;
    const broken = dx > 4 ? (dx - 4) * 2 : 0; // the stones fall away at the break
    back(x, outer + broken, inner);
    if (dx > 0 && dx % 3 === 0) moss(x, outer + broken);
  }
  moss(cx - 22, 118);
  moss(cx + 18, 132);

  // A wall with round-arched windows you can see through, and a broken top.
  const steps = [52, 58, 64, 61, 56, 48, 42, 46, 38];
  for (let x = o + 100; x < o + 208; x++) {
    const seg = Math.floor((x - o - 100) / 12);
    const top = G - steps[Math.min(seg, steps.length - 1)] + ((x * 7) % 3 === 0 ? 1 : 0);
    let gapTop = 0;
    let gapBottom = 0;
    for (const [cx, wTop, wBottom] of [[o + 126, 118, 142], [o + 170, 112, 136]]) {
      const dx = x - cx;
      if (Math.abs(dx) <= 6) {
        gapTop = wTop + 6 - Math.round(Math.sqrt(Math.max(0, 36 - dx * dx)));
        gapBottom = wBottom;
      }
    }
    back(x, top, G, gapTop, gapBottom);
    if (x % 5 === 0) moss(x, top);
  }
  // Fallen stones in the grass.
  for (const [rx, rw, rh] of [[o + 8, 5, 3], [o + 70, 6, 4], [o + 92, 4, 2], [o + 214, 6, 3]]) {
    for (let x = rx; x < rx + rw; x++) back(x, G - rh, G);
  }
}

/** Bjørvika: Deichman, the library, with its top floor hanging out over the square. */
function deichman(library: Door<DoorKind> | undefined) {
  const o = districtFrom("Bjørvika");
  const glass = GLASS.library;
  R(o + 32, 96, 128, 64, glass);
  R(o + 8, 78, 152, 18, FACADE.libraryTop);
  for (let i = 0; i < 19; i++) R(o + 8 + i * 8, 74 + (i % 2) * 2, 8, 4 - (i % 2) * 2, FACADE.libraryRidge);
  R(o + 8, 96, 24, 2, FACADE.libraryUnder);
  for (let x = o + 32; x < o + 160; x += 4) R(x, 96, 1, 64, FACADE.libraryMullion);
  for (let x = o + 8; x < o + 160; x += 4) R(x, 78, 1, 18, FACADE.libraryTopMullion);
  R(o + 32, 114, 128, 1, FACADE.libraryFloor);
  R(o + 32, 132, 128, 1, FACADE.libraryFloor);
  const books = FACADE.books;
  for (let x = o + 37; x < o + 74; x += 2) R(x, 118, 1, 10, books[(x * 7) % books.length]);
  for (let x = o + 113; x < o + 150; x += 2) R(x, 118, 1, 10, books[(x * 5) % books.length]);
  for (let x = o + 33; x < o + 159; x += 8) {
    light(x, 98, 3, 15, "soft");
    light(x + 4, 116, 3, 15, "soft");
  }
  for (let x = o + 9; x < o + 159; x += 8) light(x, 80, 3, 14, "soft");
  if (library) {
    R(library.x - 2, library.bottom - library.h - 2, library.w + 4, library.h + 2, FACADE.libraryFrame);
    panelDoor(library, FACADE.libraryDoor, FACADE.libraryDoorPanel);
  }
  lamp(1);
  lamp(2);
}

/** Bjørvika: the Opera. The roof is a slope you can walk up, with the stage tower on top. */
function opera(secret: Door<DoorKind> | undefined) {
  const o = districtFrom("Bjørvika");
  const foyer = o + 280;
  for (let x = o + 192; x < WORLD_W; x++) {
    const s = Math.round(rampAt(x) ?? G);
    R(x, s, 1, 3, FACADE.marble);
    R(x, s + 3, 1, 1, FACADE.marbleEdge);
    if (x < foyer) {
      R(x, s + 4, 1, G - s - 4, (x - o) % 12 === 0 ? FACADE.marbleSeam : FACADE.marbleWall);
      continue;
    }
    // The glass foyer under the high part of the roof, with mullions only below the roof line.
    const mullion = (x - foyer) % 6 === 0;
    R(x, s + 4, 1, G - s - 4, mullion ? GLASS.foyerMullion : GLASS.foyer);
    if (!mullion) for (let y = 104; y < G; y += 10) if (y > s + 4) R(x, y, 1, 1, GLASS.foyerMullion);
    if ((x - foyer) % 6 === 3) light(x, s + 6, 1, G - s - 8, "soft");
  }
  R(o + 384, 40, 48, 56, FACADE.stageTower);
  R(o + 384, 40, 48, 2, FACADE.stageTowerTop);
  for (let y = 44; y < 94; y += 4) for (let x = o + 386; x < o + 430; x += 4) R(x + ((y / 4) % 2) * 2, y, 1, 1, FACADE.stageTowerDot);
  if (secret) {
    R(secret.x - 1, secret.bottom - secret.h - 1, secret.w + 2, secret.h + 1, FACADE.stageTowerDot);
    R(secret.x, secret.bottom - secret.h, secret.w, secret.h, secret.open ? DOORWAY.stage : FACADE.stageDoor);
    R(secret.x + secret.w - 4, secret.bottom - 16, 2, 2, METAL.brass);
  }
}

export function drawBuildings(doors: Door<DoorKind>[], sky: Sky, time: number) {
  const byId = (id: string) => doors.find((d) => d.id === id);
  valerengaKampen(byId("cv"), byId("qr"), sky, time);
  toyen(byId("maze"), sky);
  tree(districtFrom("Gamlebyen") + 226, G, sky, true);
  deichman(byId("quintle"));
  opera(byId("opera"));
}
