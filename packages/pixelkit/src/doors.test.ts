import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "./config";
import { WALK_IN_STEPS, buildDoors, doorAt, doorNear, shakeX, walkIn, type AppLink } from "./doors";
import { createBody } from "./physics";

const link = (id: string, href: string | null, soon = false): AppLink => ({ id, label: id.toUpperCase(), href, soon, el: {} as HTMLElement });

describe("building doors", () => {
  test("a door takes its address and name from its header link", () => {
    const [d] = buildDoors([{ id: "qr", kind: "workshop", x: 32, bottom: 160 }], [link("qr", "https://x/qr/")]);
    expect(d).toMatchObject({ x: 32, w: TILE, h: 2 * TILE, bottom: 160, sign: "QR", name: "QR", href: "https://x/qr/", soon: false, secret: false });
  });

  test("without a link, or with a link marked soon, it is coming soon", () => {
    const [a, b] = buildDoors(
      [
        { id: "cv", kind: "home", x: 0, bottom: 160 },
        { id: "q", kind: "library", x: 64, bottom: 160 }
      ],
      [link("q", null, true)]
    );
    expect(a.soon).toBe(true);
    expect(b.soon).toBe(true);
  });

  test("a door's own address wins and is never soon; the secret is never soon", () => {
    const [own, secret] = buildDoors(
      [
        { id: "home", kind: "home", x: 0, bottom: 256, href: "/?from=viking", sign: "Hjem" },
        { id: "opera", kind: "opera", x: 64, bottom: 96, href: "/viking/", secret: true }
      ],
      [link("home", "https://x/")]
    );
    expect(own).toMatchObject({ href: "/?from=viking", sign: "Hjem", soon: false });
    expect(secret).toMatchObject({ secret: true, soon: false });
  });

  test("signs given by the scene win over the link's label", () => {
    expect(buildDoors([{ id: "qr", kind: "w", x: 0, bottom: 0 }], [link("qr", "/qr/")], { qr: "QR-verkstedet" })[0].sign).toBe("QR-verkstedet");
  });
});

describe("standing at a door", () => {
  const doors = buildDoors([{ id: "a", kind: "k", x: 10 * TILE, bottom: 160 }]);

  test("on the ground in front of it, a few pixels either side", () => {
    expect(doorAt(createBody(10 * TILE + 8, 160), doors)?.id).toBe("a");
    expect(doorAt(createBody(10 * TILE - 3, 160), doors)?.id).toBe("a");
    expect(doorAt(createBody(10 * TILE - 4, 160), doors)).toBeNull();
    expect(doorAt(createBody(10 * TILE + 8, 144), doors)).toBeNull();
  });

  test("not while in the air", () => {
    const b = createBody(10 * TILE + 8, 160);
    b.onGround = false;
    expect(doorAt(b, doors)).toBeNull();
  });

  test("a click near a door picks it; the secret door never", () => {
    const both = buildDoors([
      { id: "a", kind: "k", x: 10 * TILE, bottom: 160 },
      { id: "s", kind: "k", x: 20 * TILE, bottom: 160, secret: true }
    ]);
    expect(doorNear(both, 10 * TILE - 10, 150)?.id).toBe("a");
    expect(doorNear(both, 10 * TILE + 8, 160 - 3 * TILE)?.id).toBe("a");
    expect(doorNear(both, 10 * TILE + 8, 100)).toBeNull();
    expect(doorNear(both, 20 * TILE + 8, 150)).toBeNull();
  });
});

describe("going through", () => {
  test("drawn in, the door opens as he fades, then the dark, then through", () => {
    const [d] = buildDoors([{ id: "a", kind: "k", x: 10 * TILE, bottom: 160 }]);
    const b = createBody(10 * TILE + 3, 160);
    const seen: ReturnType<typeof walkIn>[] = [];
    for (let s = 1; s <= WALK_IN_STEPS; s++) seen.push(walkIn(b, d, s, false));
    expect(Math.abs(b.x - (d.x + d.w / 2 - PLAYER.w / 2))).toBeLessThan(0.1);
    expect(d.open).toBe(true);
    expect(seen[19].alpha).toBe(0.5);
    expect(seen[29].alpha).toBe(0);
    expect(seen[30].fade).toBeCloseTo(1 / 14, 10);
    expect(seen.findIndex((w) => w.done)).toBe(WALK_IN_STEPS - 1);
  });

  test("with reduced motion it is over at once", () => {
    const [d] = buildDoors([{ id: "a", kind: "k", x: 0, bottom: 160 }]);
    expect(walkIn(createBody(8, 160), d, 1, true)).toEqual({ alpha: null, fade: null, done: true });
  });

  test("a locked door shakes one pixel each way", () => {
    expect([14, 13, 12, 11, 10, 0].map(shakeX)).toEqual([-1, 1, 1, -1, -1, 0]);
  });
});
