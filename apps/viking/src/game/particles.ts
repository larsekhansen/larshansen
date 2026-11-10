import { Container, Sprite, Texture } from "pixi.js";

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpColor = (a: number, b: number, t: number) => {
  const ch = (shift: number) => Math.round(lerp((a >> shift) & 255, (b >> shift) & 255, t)) << shift;
  return ch(16) | ch(8) | ch(0);
};
/** Small deterministic PRNG so the scenery looks the same on every visit. */
export const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export interface Textures {
  /** Soft radial glow, white centre fading to transparent. */
  glow: Texture;
  /** Crisp filled circle. */
  dot: Texture;
  /** Vertical curtain: transparent → bright → transparent, for the aurora. */
  curtain: Texture;
  /**
   * Blend mode for glows. Additive under WebGL; Pixi's canvas fallback leaks
   * additive blending into whatever is drawn next, so it gets plain alpha.
   */
  glowBlend: "add" | "normal";
}

const canvasTexture = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d")!);
  return Texture.from(canvas);
};

export const createTextures = (glowBlend: Textures["glowBlend"]): Textures => ({
  glowBlend,
  glow: canvasTexture(64, 64, (c) => {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  }),
  dot: canvasTexture(32, 32, (c) => {
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(16, 16, 15, 0, Math.PI * 2);
    c.fill();
  }),
  curtain: canvasTexture(4, 128, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.75, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 128);
  })
});

export interface EmitOptions {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  gravity?: number;
  drag?: number;
  life: number;
  size: number;
  endSize?: number;
  color: number;
  alpha?: number;
  glow?: boolean;
}

interface Particle {
  sprite: Sprite;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  life: number;
  max: number;
  size: number;
  endSize: number;
  alpha: number;
}

/** Pooled sprite particles. Dead sprites are hidden and reused. */
export class Particles {
  readonly view = new Container();
  private live: Particle[] = [];
  private pool: Particle[] = [];

  constructor(
    private textures: Textures,
    private max = 400
  ) {}

  emit(o: EmitOptions) {
    if (this.live.length >= this.max) return;
    let p = this.pool.pop();
    if (!p) {
      const sprite = new Sprite(this.textures.dot);
      sprite.anchor.set(0.5);
      this.view.addChild(sprite);
      p = { sprite, vx: 0, vy: 0, gravity: 0, drag: 0, life: 0, max: 1, size: 1, endSize: 1, alpha: 1 };
    }
    p.sprite.texture = o.glow ? this.textures.glow : this.textures.dot;
    p.sprite.blendMode = o.glow ? this.textures.glowBlend : "normal";
    p.sprite.tint = o.color;
    p.sprite.visible = true;
    p.sprite.position.set(o.x, o.y);
    p.vx = o.vx ?? 0;
    p.vy = o.vy ?? 0;
    p.gravity = o.gravity ?? 0;
    p.drag = o.drag ?? 0;
    p.life = p.max = o.life;
    p.size = o.size;
    p.endSize = o.endSize ?? o.size;
    p.alpha = o.alpha ?? 1;
    this.live.push(p);
  }

  /** `count` particles thrown outward in a ring/cone. */
  burst(o: EmitOptions, count: number, speed: number, spread = Math.PI * 2, angle = -Math.PI / 2) {
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const s = speed * (0.4 + Math.random() * 0.6);
      this.emit({ ...o, vx: (o.vx ?? 0) + Math.cos(a) * s, vy: (o.vy ?? 0) + Math.sin(a) * s });
    }
  }

  update(dt: number) {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const p = this.live[i];
      p.life -= dt;
      if (p.life <= 0) {
        p.sprite.visible = false;
        this.live[i] = this.live[this.live.length - 1];
        this.live.pop();
        this.pool.push(p);
        continue;
      }
      const k = 1 - p.life / p.max;
      p.vy += p.gravity * dt;
      if (p.drag) {
        const d = Math.max(0, 1 - p.drag * dt);
        p.vx *= d;
        p.vy *= d;
      }
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      const size = lerp(p.size, p.endSize, k);
      p.sprite.width = p.sprite.height = size;
      p.sprite.alpha = p.alpha * (1 - k * k);
    }
  }
}
