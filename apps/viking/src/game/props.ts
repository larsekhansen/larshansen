// Everything in the playfield that is not the player: terrain, doors, rune
// stones, the longship, sheep and signs. All drawn from primitives.
import { Container, Graphics, Sprite, Text, type TextStyleOptions } from "pixi.js";
import { RUNE_STROKES, type Block, type DoorDef, type RuneChar } from "./level";
import { lerp, rng, type Textures } from "./particles";

const FONT = "Georgia, 'Times New Roman', serif";
const GOLD = 0xffd166;
const WOOD = 0x8a5a2b;
const WOOD_DARK = 0x5a3d1e;
const STONE = 0x8b8f9c;
const STONE_DARK = 0x646876;

const label = (text: string, style: TextStyleOptions) => {
  const t = new Text({ text, style: { fontFamily: FONT, ...style }, resolution: 3 });
  t.anchor.set(0.5);
  return t;
};

/** Stroke a rune into `g`, fitting a box `size` wide and 1.5× as tall, centred on 0,0. */
export function drawRune(g: Graphics, char: RuneChar, size: number, color: number, width: number) {
  const h = size * 1.5;
  for (const stroke of RUNE_STROKES[char]) {
    stroke.forEach(([x, y], i) => {
      const px = (x - 0.5) * size;
      const py = (y - 0.5) * h;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    });
  }
  g.stroke({ color, width, cap: "round", join: "round" });
  return g;
}

export function drawBlock(b: Block, winter: boolean, seed: number) {
  const r = rng(seed);
  const g = new Graphics();
  const cap = winter ? 0xf4f8fc : 0x58b368;
  const capShade = winter ? 0xcfdcea : 0x3f9150;

  if (b.kind === "island") {
    // A floating sod: flat top, tapering earth and a few roots underneath.
    const depth = 26 + r() * 14;
    g.poly([b.x + 4, b.y + 8, b.x + b.w - 4, b.y + 8, b.x + b.w * 0.72, b.y + depth, b.x + b.w * 0.45, b.y + depth + 10, b.x + b.w * 0.2, b.y + depth - 4]).fill(0x6b4a2f);
    g.poly([b.x + b.w * 0.5, b.y + 8, b.x + b.w - 4, b.y + 8, b.x + b.w * 0.72, b.y + depth, b.x + b.w * 0.45, b.y + depth + 10]).fill({ color: 0x000000, alpha: 0.18 });
    for (let i = 0; i < 3; i++) {
      const rx = b.x + b.w * (0.25 + i * 0.22);
      g.moveTo(rx, b.y + depth - 4).lineTo(rx + (r() - 0.5) * 8, b.y + depth + 8 + r() * 12).stroke({ color: 0x4a3524, width: 1.5 });
    }
    g.roundRect(b.x, b.y, b.w, 14, 6).fill(cap);
    g.roundRect(b.x + 2, b.y + 9, b.w - 4, 5, 2).fill(capShade);
  } else if (b.kind === "ledge") {
    g.rect(b.x, b.y, b.w, b.h).fill(STONE);
    for (let row = 0; row * 20 < b.h; row++) {
      const y = b.y + row * 20;
      g.moveTo(b.x, y).lineTo(b.x + b.w, y).stroke({ color: STONE_DARK, width: 2 });
      for (let x = b.x + (row % 2 ? 22 : 44); x < b.x + b.w; x += 44) {
        g.moveTo(x, y).lineTo(x, Math.min(y + 20, b.y + b.h)).stroke({ color: STONE_DARK, width: 2 });
      }
    }
    g.rect(b.x, b.y, b.w, b.h).stroke({ color: STONE_DARK, width: 2 });
    g.roundRect(b.x - 3, b.y - 2, b.w + 6, 9, 4).fill(cap);
  } else {
    g.rect(b.x, b.y, b.w, b.h).fill(0x6b4a2f);
    g.rect(b.x, b.y + 46, b.w, b.h - 46).fill({ color: 0x000000, alpha: 0.16 });
    for (let i = 0; i < b.w / 28; i++) {
      const x = b.x + 8 + r() * (b.w - 16);
      const y = b.y + 22 + r() * 70;
      g.ellipse(x, y, 3 + r() * 6, 2 + r() * 3).fill(r() > 0.5 ? 0x8a6a4a : 0x55381f);
    }
    g.roundRect(b.x - 2, b.y - 3, b.w + 4, 17, 6).fill(cap);
    g.rect(b.x, b.y + 9, b.w, 5).fill(capShade);
    // Tufts of grass (or drifts of snow) and a few flowers.
    for (let x = b.x + 10; x < b.x + b.w - 10; x += 14 + r() * 30) {
      if (winter) g.ellipse(x, b.y - 2, 9 + r() * 8, 3).fill(cap);
      else {
        g.poly([x - 4, b.y - 2, x - 2, b.y - 9 - r() * 4, x, b.y - 2, x + 3, b.y - 8 - r() * 4, x + 5, b.y - 2]).fill(0x58b368);
        if (r() > 0.72) g.circle(x + 9, b.y - 6, 2.2).fill([0xffffff, 0xffd166, 0xff8fab][Math.floor(r() * 3)]);
      }
    }
  }
  return g;
}

export function createDoor(def: DoorDef, tex: Textures) {
  const view = new Container();
  view.position.set(def.x, def.y);
  const W = 64;
  const H = 96;

  const halo = new Sprite(tex.glow);
  halo.anchor.set(0.5);
  halo.blendMode = tex.glowBlend;
  halo.tint = def.color;
  halo.width = 260;
  halo.height = 300;
  halo.y = -H / 2 - 10;
  halo.alpha = 0;

  // Stone arch
  const arch = new Graphics()
    .moveTo(-W / 2 - 14, 0)
    .lineTo(-W / 2 - 14, -H + 20)
    .arc(0, -H + 20, W / 2 + 14, Math.PI, 0)
    .lineTo(W / 2 + 14, 0)
    .closePath()
    .fill(STONE)
    .stroke({ color: STONE_DARK, width: 2 });
  for (let i = 1; i < 6; i++) {
    const y = -i * 18;
    arch.moveTo(-W / 2 - 14, y).lineTo(-W / 2, y).moveTo(W / 2, y).lineTo(W / 2 + 14, y);
  }
  arch.stroke({ color: STONE_DARK, width: 2 });

  // The opening behind the door: dark, with the destination's colour glowing inside.
  const openingShape = (g: Graphics) =>
    g.moveTo(-W / 2, 0).lineTo(-W / 2, -H + 20).arc(0, -H + 20, W / 2, Math.PI, 0).lineTo(W / 2, 0).closePath();
  const inside = openingShape(new Graphics()).fill(0x14101c);
  const insideGlow = new Sprite(tex.glow);
  insideGlow.anchor.set(0.5);
  insideGlow.tint = def.color;
  insideGlow.blendMode = tex.glowBlend;
  insideGlow.width = W * 1.6;
  insideGlow.height = H * 1.5;
  insideGlow.y = -H / 2;
  const insideMask = openingShape(new Graphics()).fill(0xffffff);
  insideGlow.mask = insideMask;

  // Plank door, hinged on the left
  const leaf = new Container();
  leaf.x = -W / 2;
  const planks = new Graphics();
  planks.moveTo(0, 0).lineTo(0, -H + 20).arc(W / 2, -H + 20, W / 2, Math.PI, 0).lineTo(W, 0).closePath().fill(WOOD);
  for (let x = 16; x < W; x += 16) planks.moveTo(x, 0).lineTo(x, -H - 4);
  planks.stroke({ color: WOOD_DARK, width: 2 });
  planks.rect(0, -28, W, 6).rect(0, -70, W, 6).fill(0x3b3f4a);
  planks.circle(W - 11, -46, 4).fill(GOLD);
  const leafMask = new Graphics().moveTo(0, 0).lineTo(0, -H + 20).arc(W / 2, -H + 20, W / 2, Math.PI, 0).lineTo(W, 0).closePath().fill(0xffffff);
  planks.mask = leafMask;
  leaf.addChild(planks, leafMask);

  // Keystone rune
  const keystone = new Graphics().circle(0, -H - 12, 13).fill(0x2b2d3a).stroke({ color: STONE_DARK, width: 2 });
  const rune = drawRune(new Graphics(), def.rune, 11, def.color, 2.5);
  rune.y = -H - 12;

  // Hanging sign
  const text = label(def.name, { fontSize: 15, fontWeight: "bold", fill: 0xfff3d6, letterSpacing: 0.5 });
  const blurb = label(def.blurb, { fontSize: 10, fill: 0xe7cfa3, fontStyle: "italic" });
  const sw = Math.max(text.width, blurb.width) + 22;
  const sign = new Container();
  sign.y = -H - 58;
  const board = new Graphics()
    .moveTo(-sw / 2 + 8, 19)
    .lineTo(-sw / 2 + 8, 30)
    .moveTo(sw / 2 - 8, 19)
    .lineTo(sw / 2 - 8, 30)
    .stroke({ color: 0x2b2d3a, width: 2 })
    .roundRect(-sw / 2, -20, sw, 40, 5)
    .fill(WOOD_DARK)
    .stroke({ color: 0x3d2a18, width: 2 });
  text.y = -6;
  blurb.y = 10;
  sign.addChild(board, text, blurb);

  // Torches
  const flames: Sprite[] = [];
  const torches = new Graphics();
  for (const side of [-1, 1]) {
    const tx = side * (W / 2 + 30);
    torches.rect(tx - 2.5, -62, 5, 62).fill(WOOD_DARK).rect(tx - 5, -68, 10, 8).fill(0x3b3f4a);
    for (const [size, tint] of [[70, 0xff8a3d], [16, 0xffe08a]] as const) {
      const f = new Sprite(tex.glow);
      f.anchor.set(0.5);
      f.blendMode = tex.glowBlend;
      f.tint = tint;
      f.width = f.height = size;
      f.position.set(tx, -74);
      flames.push(f);
    }
  }

  // "Press up" prompt
  const prompt = new Container();
  prompt.y = -H - 108;
  const promptText = label("↑  Enter", { fontSize: 14, fontWeight: "bold", fill: 0x1d1b26 });
  const pw = promptText.width + 24;
  prompt.addChild(
    new Graphics().roundRect(-pw / 2, -15, pw, 30, 15).fill(0xfffbf0).poly([-7, 14, 7, 14, 0, 23]).fill(0xfffbf0),
    promptText
  );
  prompt.alpha = 0;

  view.addChild(halo, torches, ...flames, arch, inside, insideGlow, insideMask, leaf, keystone, rune, sign, prompt);

  // Clicking or tapping a door is a shortcut to walking in.
  view.eventMode = "static";
  view.cursor = "pointer";
  view.hitArea = { contains: (x: number, y: number) => Math.abs(x) < W / 2 + 14 && y < 0 && y > -H - 80 };

  let near = false;
  let open = 0;
  let opening = false;

  return {
    def,
    view,
    setNear(v: boolean) {
      near = v;
    },
    setPrompt(text: string) {
      promptText.text = text;
    },
    open() {
      opening = true;
    },
    reset() {
      opening = false;
      open = 0;
    },
    update(dt: number, time: number) {
      const k = Math.min(1, dt * 8);
      halo.alpha = lerp(halo.alpha, near ? 0.5 : 0.12, k);
      prompt.alpha = lerp(prompt.alpha, near && !opening ? 1 : 0, k);
      prompt.y = -H - 108 + Math.sin(time * 4) * 3;
      rune.alpha = 0.75 + Math.sin(time * 3 + def.x) * 0.25;
      open = lerp(open, opening ? 1 : near ? 0.12 : 0, Math.min(1, dt * 6));
      leaf.scale.x = 1 - open * 0.85;
      insideGlow.alpha = 0.35 + open * 0.65;
      sign.rotation = Math.sin(time * 1.3 + def.x) * 0.025;
      flames.forEach((f, i) => {
        const flick = 0.85 + Math.sin(time * (11 + i * 3) + i * 2) * 0.1 + Math.random() * 0.08;
        f.scale.set(((i % 2 ? 16 : 70) / 64) * flick);
        f.alpha = i % 2 ? 1 : 0.7;
      });
    }
  };
}
export type Door = ReturnType<typeof createDoor>;

export function createRuneStone(char: RuneChar, x: number, y: number, tex: Textures) {
  const view = new Container();
  const glow = new Sprite(tex.glow);
  glow.anchor.set(0.5);
  glow.blendMode = tex.glowBlend;
  glow.tint = GOLD;
  glow.width = glow.height = 76;
  const stone = new Graphics().roundRect(-13, -17, 26, 34, 8).fill(0x2b2d3a).stroke({ color: GOLD, width: 2 });
  drawRune(stone, char, 12, GOLD, 2.6);
  view.addChild(glow, stone);
  const phase = x * 0.01;
  return {
    char,
    x,
    y,
    view,
    collected: false,
    update(time: number) {
      view.position.set(x, y + Math.sin(time * 2.4 + phase) * 5);
      stone.rotation = Math.sin(time * 1.6 + phase) * 0.12;
      glow.alpha = 0.5 + Math.sin(time * 3.2 + phase) * 0.18;
    }
  };
}

export function createShip(width: number) {
  const view = new Container();
  const hull = new Container(); // rocks gently around the deck line
  const w = width;
  const g = new Graphics();
  // mast and sail (behind the hull)
  g.rect(w / 2 - 2.5, -112, 5, 112).fill(WOOD_DARK);
  g.rect(w / 2 - 48, -108, 96, 4).fill(WOOD_DARK);
  for (let i = 0; i < 6; i++) {
    g.poly([w / 2 - 46 + i * 15.4, -104, w / 2 - 46 + (i + 1) * 15.4, -104, w / 2 - 42 + (i + 1) * 14, -40, w / 2 - 42 + i * 14, -40]).fill(i % 2 ? 0xf5ecd9 : 0xc0392b);
  }
  // prow with a dragon head, stern with a curl
  g.poly([w - 6, 6, w + 22, -8, w + 30, -40, w + 22, -38, w + 14, -14, w - 14, 0]).fill(WOOD);
  g.poly([w + 30, -40, w + 44, -44, w + 40, -34, w + 30, -30, w + 22, -38]).fill(WOOD);
  g.circle(w + 34, -39, 1.8).fill(0xffe08a);
  g.poly([6, 6, -22, -8, -28, -34, -20, -32, -12, -12, 14, 0]).fill(WOOD);
  g.circle(-25, -36, 6).stroke({ color: WOOD, width: 4 });
  // hull
  g.poly([-14, 0, w + 14, 0, w - 6, 30, w * 0.5, 38, 6, 30]).fill(WOOD);
  g.poly([-14, 0, w + 14, 0, w + 8, 8, -8, 8]).fill(0xa26e38);
  g.moveTo(-4, 14).lineTo(w + 4, 14).moveTo(4, 22).lineTo(w - 4, 22).stroke({ color: WOOD_DARK, width: 2 });
  // shields along the rail
  const colors = [0xc0392b, 0xffd166, 0x2e6f9e, 0x58b368];
  for (let i = 0; i < 5; i++) {
    const sx = 18 + (i * (w - 36)) / 4;
    g.circle(sx, 9, 9).fill(colors[i % 4]).stroke({ color: 0x3d2a18, width: 2 });
    g.circle(sx, 9, 2.5).fill(0xb8c2d0);
  }
  hull.addChild(g);
  hull.pivot.set(w / 2, 0);
  hull.x = w / 2;
  view.addChild(hull);
  return {
    view,
    update(time: number) {
      hull.rotation = Math.sin(time * 1.1) * 0.02;
    }
  };
}

export function createSheep(minX: number, maxX: number, groundY: number) {
  const view = new Container();
  const body = new Container();
  const legs = [-9, -4, 5, 10].map((x) => {
    const l = new Graphics().rect(-1.5, 0, 3, 9).fill(0x2b2d3a);
    l.position.set(x, -9);
    return l;
  });
  const wool = new Graphics();
  for (const [x, y, r] of [[-9, -19, 8], [-1, -22, 9], [8, -20, 8], [-5, -14, 8], [5, -14, 8], [-13, -14, 5]]) wool.circle(x, y, r);
  wool.fill(0xfaf7f0);
  const head = new Graphics()
    .ellipse(15, -21, 6.5, 5.5)
    .fill(0x2b2d3a)
    .ellipse(10.5, -25, 3, 1.8)
    .fill(0x2b2d3a)
    .circle(17, -22, 1.1)
    .fill(0xffffff);
  body.addChild(...legs, wool, head);
  view.addChild(body);

  let x = lerp(minX, maxX, 0.5);
  let dir: 1 | -1 = 1;
  let pause = 0;
  let squash = 1;
  let hop = 0;

  return {
    view,
    w: 34,
    h: 30,
    get x() {
      return x;
    },
    y: groundY,
    bounce() {
      squash = 0.55;
      hop = 0.4;
      pause = 0.8;
    },
    update(dt: number, time: number) {
      if (pause > 0) pause -= dt;
      else {
        x += dir * 26 * dt;
        if (x > maxX) dir = -1;
        else if (x < minX) dir = 1;
        else if (Math.random() < dt * 0.25) pause = 1 + Math.random() * 2.5; // stop to graze
      }
      const walking = pause <= 0;
      legs.forEach((l, i) => (l.rotation = walking ? Math.sin(time * 9 + i * 1.6) * 0.45 : 0));
      head.rotation = walking ? 0 : 0.35 + Math.sin(time * 6) * 0.05; // grazing
      head.pivot.set(walking ? 0 : -3, walking ? 0 : 3);
      squash = lerp(squash, 1, Math.min(1, dt * 9));
      hop = Math.max(0, hop - dt);
      body.scale.set(dir * (2 - squash), squash);
      view.position.set(x, groundY - Math.sin((hop / 0.4) * Math.PI) * 10);
    }
  };
}

export function createSign(x: number, y: number, lines: string[]) {
  const view = new Container();
  view.position.set(x, y);
  const head = label(lines[0], { fontSize: 14, fontWeight: "bold", fill: 0xfff3d6 });
  const rest = label(lines.slice(1).join("\n"), { fontSize: 10.5, fill: 0xe7cfa3, align: "center", lineHeight: 14 });
  const w = Math.max(head.width, rest.width) + 20;
  const h = 26 + rest.height;
  const top = -52 - h;
  head.y = top + 14;
  rest.y = top + 22 + rest.height / 2;
  view.addChild(
    new Graphics()
      .rect(-3, -56, 6, 56)
      .fill(WOOD_DARK)
      .roundRect(-w / 2, top, w, h, 5)
      .fill(WOOD)
      .stroke({ color: 0x3d2a18, width: 2 }),
    head,
    rest
  );
  return view;
}

/** The big carved name floating over the spawn meadow. */
export function createTitle(x: number, y: number, runes: RuneChar[]) {
  const view = new Container();
  view.position.set(x, y);
  const name = label("LARS HANSEN", {
    fontSize: 58,
    fontWeight: "bold",
    fill: 0xfffbf0,
    letterSpacing: 6,
    stroke: { color: 0x1d2b53, width: 6, join: "round" },
    dropShadow: { color: 0x0b1026, alpha: 0.45, blur: 6, distance: 5, angle: Math.PI / 2 }
  });
  const sub = label("ten runes are hidden here  ·  find them all", {
    fontSize: 15,
    fontStyle: "italic",
    fill: 0xfffbf0,
    stroke: { color: 0x1d2b53, width: 4, join: "round" }
  });
  sub.y = 80;
  const row = new Container();
  runes.forEach((c, i) => {
    const g = drawRune(new Graphics(), c, 13, GOLD, 2.6);
    g.x = (i - (runes.length - 1) / 2) * 26 + (i >= 4 ? 8 : -8); // gap between the two words
    row.addChild(g);
  });
  row.y = 48;
  view.addChild(name, row, sub);
  return view;
}
