// Everything that is not gameplay: sky, sun and moon, stars, aurora, parallax
// mountains, clouds, the fjord and the weather. Drawn in view units; the game
// positions `back` behind the world and `front` in front of it.
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { VIEW_H, WATER_Y } from "./level";
import { Particles, clamp, lerp, lerpColor, rng, type Textures } from "./particles";

interface SkyKey {
  h: number;
  top: number;
  mid: number;
  bot: number;
  ambient: number;
  night: number;
}
const NIGHT = { top: 0x060a1c, mid: 0x0f1a3c, bot: 0x22315e, ambient: 0x7f8fd0, night: 1 };
const DAWN = { top: 0x2b3a67, mid: 0xc06c84, bot: 0xf8b195, ambient: 0xffcdb8, night: 0.25 };
const DAY = { top: 0x2f86d6, mid: 0x86cdee, bot: 0xdaf3ff, ambient: 0xffffff, night: 0 };
const DUSK = { top: 0x2a2757, mid: 0xd9567b, bot: 0xffb36b, ambient: 0xffb9a0, night: 0.25 };
const SKY: SkyKey[] = [
  { h: 0, ...NIGHT },
  { h: 5, ...NIGHT },
  { h: 7.5, ...DAWN },
  { h: 10, ...DAY },
  { h: 15.5, ...DAY },
  { h: 18, ...DUSK },
  { h: 20.5, ...NIGHT },
  { h: 24, ...NIGHT }
];

const skyAt = (hour: number): SkyKey => {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < SKY.length - 2 && SKY[i + 1].h <= h) i++;
  const a = SKY[i];
  const b = SKY[i + 1];
  const t = clamp((h - a.h) / (b.h - a.h), 0, 1);
  return {
    h,
    top: lerpColor(a.top, b.top, t),
    mid: lerpColor(a.mid, b.mid, t),
    bot: lerpColor(a.bot, b.bot, t),
    ambient: lerpColor(a.ambient, b.ambient, t),
    night: lerp(a.night, b.night, t)
  };
};

const hex = (c: number) => "#" + c.toString(16).padStart(6, "0");
const LAYER_W = 4600; // wide enough for the whole world at the nearest parallax factor
const BASE_Y = WATER_Y + 30;

function mountains(seed: number, color: number, minH: number, maxH: number, spacing: number, snow: boolean) {
  const r = rng(seed);
  const g = new Graphics();
  for (let x = -200; x < LAYER_W; x += spacing * (0.5 + r())) {
    const h = lerp(minH, maxH, r());
    const hw = h * (0.75 + r() * 0.5);
    const top = BASE_Y - h;
    g.poly([x - hw, BASE_Y, x, top, x + hw, BASE_Y]).fill(color);
    g.poly([x, top, x + hw, BASE_Y, x + hw * 0.15, BASE_Y]).fill({ color: 0x000000, alpha: 0.14 });
    if (snow) {
      const s = 0.3;
      g.poly([
        x, top,
        x + hw * s, top + h * s,
        x + hw * 0.14, top + h * 0.2,
        x + hw * 0.02, top + h * 0.33,
        x - hw * 0.12, top + h * 0.21,
        x - hw * s, top + h * s
      ]).fill(0xf5f9ff);
    }
  }
  return g;
}

function hills(winter: boolean) {
  const r = rng(7);
  const g = new Graphics();
  const top = (x: number) => 468 + Math.sin(x / 190) * 22 + Math.sin(x / 71 + 2) * 9;
  const pts: number[] = [-200, BASE_Y];
  for (let x = -200; x <= LAYER_W; x += 20) pts.push(x, top(x));
  pts.push(LAYER_W, BASE_Y);
  g.poly(pts).fill(winter ? 0xc3d3e3 : 0x3f7a5c);
  for (let x = -150; x < LAYER_W; x += 26 + r() * 90) {
    const y = top(x) + 4;
    const h = 34 + r() * 40;
    const w = h * 0.42;
    g.rect(x - 2, y - 8, 4, 10).fill(0x4a3524);
    for (let k = 0; k < 3; k++) {
      const ty = y - 6 - (h * k) / 3.6;
      const tw = w * (1 - k * 0.24);
      g.poly([x - tw, ty, x, ty - h * 0.48, x + tw, ty]).fill(k % 2 ? 0x2c5a48 : 0x244d3e);
      if (winter) g.poly([x - tw * 0.45, ty - h * 0.26, x, ty - h * 0.48, x + tw * 0.45, ty - h * 0.26]).fill(0xeef4fa);
    }
  }
  return g;
}

function waves(color: number, alpha: number, wavelength: number, amp: number, y: number, sparkle: boolean) {
  const g = new Graphics();
  const w = 3200;
  const pts: number[] = [0, VIEW_H + 400];
  for (let x = 0; x <= w; x += 8) pts.push(x, y + Math.sin((x / wavelength) * Math.PI * 2) * amp);
  pts.push(w, VIEW_H + 400);
  g.poly(pts).fill({ color, alpha });
  if (sparkle) {
    const r = rng(3);
    for (let i = 0; i < 6; i++) {
      const sx = r() * wavelength;
      const sy = y + 12 + r() * 40;
      const sw = 8 + r() * 14;
      for (let x = sx; x < w; x += wavelength) g.rect(x, sy, sw, 2).fill({ color: 0xffffff, alpha: 0.22 });
    }
  }
  return g;
}

function cloud(r: () => number) {
  const g = new Graphics();
  const n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) g.ellipse(i * 26 + r() * 10, r() * 10, 26 + r() * 16, 14 + r() * 8).fill(0xffffff);
  g.rect(0, 6, (n - 1) * 26, 14).fill(0xffffff);
  g.alpha = 0.88;
  return g;
}

export interface SceneryFrame {
  dt: number;
  time: number;
  camX: number;
  viewW: number;
  viewH: number;
  hour: number;
  aurora: boolean;
}

export function createScenery(tex: Textures, opts: { winter: boolean; reducedMotion: boolean }) {
  const back = new Container();
  const front = new Container();

  // Sky gradient lives in a tiny canvas that is repainted when the hour moves.
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 2;
  skyCanvas.height = 256;
  const skyCtx = skyCanvas.getContext("2d")!;
  const skyTexture = Texture.from(skyCanvas);
  const sky = new Sprite(skyTexture);
  let paintedHour = -1;

  const starsA = new Graphics();
  const starsB = new Graphics();
  const sr = rng(11);
  for (let i = 0; i < 170; i++) {
    (i % 2 ? starsA : starsB).circle(sr() * 2800, sr() * 430, 0.6 + sr() * 1.3).fill(0xffffff);
  }

  const sunGlow = new Sprite(tex.glow);
  const sun = new Sprite(tex.dot);
  const moonGlow = new Sprite(tex.glow);
  const moon = new Sprite(tex.dot);
  const moonBite = new Sprite(tex.dot);
  for (const s of [sunGlow, sun, moonGlow, moon, moonBite]) s.anchor.set(0.5);
  sunGlow.blendMode = moonGlow.blendMode = tex.glowBlend;
  sunGlow.tint = 0xffe6a0;
  sun.tint = 0xfff7dc;
  moon.tint = 0xeef2ff;
  moonGlow.tint = 0x9fb4ff;
  sunGlow.width = sunGlow.height = 420;
  sun.width = sun.height = 58;
  moonGlow.width = moonGlow.height = 220;
  moon.width = moon.height = 44;
  moonBite.width = moonBite.height = 40;

  const aurora = new Container();
  const STRIPS = 64;
  const strips: Sprite[] = [];
  for (let band = 0; band < 2; band++) {
    for (let i = 0; i < STRIPS; i++) {
      const s = new Sprite(tex.curtain);
      s.blendMode = tex.glowBlend;
      s.tint = lerpColor(band ? 0x7c5cff : 0x4dffb0, band ? 0x4dffb0 : 0x5ad1ff, i / STRIPS);
      aurora.addChild(s);
      strips.push(s);
    }
  }

  const farMountains = mountains(21, 0x93a7c8, 120, 250, 190, false);
  const nearMountains = mountains(5, 0x5f7499, 170, 330, 300, true);
  const hillLayer = hills(opts.winter);
  const waterBack = waves(0x1f5d86, 1, 80, 3, WATER_Y, true);
  const waterMid = waves(0x2a76a3, 0.55, 130, 4, WATER_Y + 7, false);
  const waterFront = waves(0x2f86b8, 0.5, 110, 4, WATER_Y + 18, true);

  const cr = rng(42);
  const clouds = Array.from({ length: 8 }, (_, i) => {
    const g = cloud(cr);
    const s = 0.7 + cr() * 0.9;
    g.scale.set(s);
    return { g, x: i * 330 + cr() * 200, y: 50 + cr() * 190, speed: (6 + cr() * 10) * (opts.reducedMotion ? 0 : 1), f: 0.04 + s * 0.04 };
  });
  const cloudLayer = new Container();
  clouds.forEach((c) => cloudLayer.addChild(c.g));

  const weather = new Particles(tex, 220);

  back.addChild(sky, starsA, starsB, sunGlow, sun, moonGlow, moon, moonBite, aurora, farMountains, cloudLayer, nearMountains, hillLayer, waterBack, waterMid);
  front.addChild(weather.view);

  let current = skyAt(12);
  let weatherTimer = 0;

  const update = ({ dt, time, camX, viewW, viewH, hour, aurora: auroraOn }: SceneryFrame) => {
    current = skyAt(hour);
    const oy = viewH - VIEW_H; // world-anchored layers sit on the bottom edge

    if (Math.abs(current.h - paintedHour) > 0.02) {
      paintedHour = current.h;
      const grad = skyCtx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, hex(current.top));
      grad.addColorStop(0.55, hex(current.mid));
      grad.addColorStop(0.9, hex(current.bot));
      skyCtx.fillStyle = grad;
      skyCtx.fillRect(0, 0, 2, 256);
      skyTexture.source.update();
    }
    sky.width = viewW;
    sky.height = viewH;

    const twinkle = opts.reducedMotion ? 0 : Math.sin(time * 1.7) * 0.25;
    starsA.alpha = current.night * (0.75 + twinkle);
    starsB.alpha = current.night * (0.75 - twinkle);

    // Sun rides an arc from 06 to 20, the moon takes the other shift.
    const arc = (t: number) => ({ x: viewW * (0.08 + 0.84 * t), y: oy + 470 - Math.sin(Math.PI * t) * 400 });
    const sunT = (current.h - 6) / 14;
    const s = arc(sunT);
    sun.position.copyFrom(s);
    sunGlow.position.copyFrom(s);
    sun.visible = sunGlow.visible = sunT > 0 && sunT < 1;
    sunGlow.alpha = 0.55;
    // Low in the sky the sun goes from pale yellow to orange.
    const low = 1 - clamp(Math.sin(Math.PI * clamp(sunT, 0, 1)) * 1.6, 0, 1);
    sun.tint = lerpColor(0xfff7dc, 0xffb469, low);
    sunGlow.tint = lerpColor(0xffe6a0, 0xff8a4a, low);
    const moonT = ((current.h + 4) % 24) / 10;
    const m = arc(moonT);
    moon.position.copyFrom(m);
    moonGlow.position.copyFrom(m);
    moonBite.position.set(m.x + 13, m.y - 7);
    moonBite.tint = current.top;
    moon.visible = moonGlow.visible = moonBite.visible = moonT > 0 && moonT < 1;
    moon.alpha = moonGlow.alpha = clamp(current.night * 1.5, 0, 1);
    moonBite.alpha = moon.alpha;

    const intensity = Math.max(current.night * 0.55, auroraOn ? 0.85 : 0);
    aurora.visible = intensity > 0.02;
    if (aurora.visible) {
      const at = opts.reducedMotion ? 0 : time;
      const step = viewW / (STRIPS - 1);
      strips.forEach((sp, n) => {
        const band = n < STRIPS ? 0 : 1;
        const i = n % STRIPS;
        const wob = Math.sin(i * 0.21 + at * 0.35 + band * 2) * 34 + Math.sin(i * 0.55 - at * 0.6 + band) * 14;
        sp.x = i * step - step / 2;
        sp.width = step + 1;
        sp.height = 150 + Math.sin(i * 0.4 + at * 0.8 + band * 3) * 50;
        sp.y = oy + 40 + band * 46 + wob;
        sp.alpha = intensity * (0.2 + 0.16 * Math.sin(i * 0.8 + at * 1.3 + band * 1.7));
      });
    }

    farMountains.position.set(-camX * 0.06 - 100, oy);
    nearMountains.position.set(-camX * 0.14 - 100, oy);
    hillLayer.position.set(-camX * 0.35, oy);
    const flow = opts.reducedMotion ? 0 : time;
    const wrap = (v: number, n: number) => ((v % n) + n) % n;
    waterBack.position.set(-wrap(camX * 0.8 + flow * 12, 80) - 80, oy);
    waterMid.position.set(-wrap(camX * 0.9 - flow * 18, 130) - 130, oy);
    waterFront.position.set(-wrap(camX * 1.1 + flow * 26, 110) - 110, oy);

    const span = viewW + 500;
    for (const c of clouds) {
      c.g.x = wrap(c.x + time * c.speed - camX * c.f, span) - 250;
      c.g.y = oy * 0.5 + c.y;
    }

    for (const layer of [farMountains, nearMountains, hillLayer, cloudLayer, waterBack, waterMid, waterFront]) {
      layer.tint = current.ambient;
    }

    // Weather: snow in winter, fireflies on warm nights.
    if (!opts.reducedMotion) {
      weatherTimer -= dt;
      if (weatherTimer <= 0) {
        if (opts.winter) {
          weatherTimer = 0.035;
          weather.emit({
            x: Math.random() * (viewW + 200) - 100,
            y: -10,
            vx: -25 + Math.random() * 30,
            vy: 45 + Math.random() * 60,
            life: 9,
            size: 2 + Math.random() * 3,
            color: 0xffffff,
            alpha: 0.85
          });
        } else if (current.night > 0.5) {
          weatherTimer = 0.25;
          weather.emit({
            x: Math.random() * viewW,
            y: oy + 380 + Math.random() * 120,
            vx: -12 + Math.random() * 24,
            vy: -14 + Math.random() * 10,
            life: 3.5,
            size: 14,
            endSize: 4,
            color: 0xe6ff7a,
            alpha: 0.9,
            glow: true
          });
        } else weatherTimer = 0.5;
      }
      weather.update(dt);
    }
  };

  return {
    back,
    /** Nearest wave band: goes in front of the ship, behind the terrain. */
    water: waterFront,
    front,
    update,
    get ambient() {
      return current.ambient;
    },
    get night() {
      return current.night;
    }
  };
}
