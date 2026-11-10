// The player character, drawn from primitives and animated procedurally.
// Origin is at the feet, centred; he faces right at scale.x = 1.
import { Container, Graphics } from "pixi.js";
import { lerp } from "./particles";

const SKIN = 0xf1c9a5;
const BEARD = 0xd9772b;
const TUNIC = 0x2e6f9e;
const TUNIC_DARK = 0x245a82;
const LEATHER = 0x5a3d1e;
const BOOT = 0x3d2a18;
const CAPE = 0xb3261e;
const STEEL = 0xb8c2d0;
const GOLD = 0xffd166;
const HORN = 0xf4ead5;

export interface VikingPose {
  vx: number;
  vy: number;
  grounded: boolean;
  facing: 1 | -1;
}

export function createViking() {
  const view = new Container();
  const body = new Container(); // squashed and stretched as one
  view.addChild(body);

  const cape = new Graphics();
  const shield = new Graphics()
    .circle(0, 0, 12)
    .fill(0x8a5a2b)
    .circle(0, 0, 12)
    .stroke({ color: 0x3d2a18, width: 2 })
    .moveTo(-12, 0)
    .lineTo(12, 0)
    .moveTo(0, -12)
    .lineTo(0, 12)
    .stroke({ color: 0x6b431f, width: 1.5 })
    .circle(0, 0, 3.5)
    .fill(STEEL);
  shield.position.set(-7, -24);

  const leg = () => new Graphics().roundRect(-3.5, 0, 7, 10, 2).fill(TUNIC_DARK).roundRect(-4, 8, 10, 6, 2).fill(BOOT);
  const legBack = leg();
  const legFront = leg();
  legBack.position.set(-5, -14);
  legFront.position.set(4, -14);

  const arm = () => new Graphics().roundRect(-3, 0, 6, 12, 3).fill(TUNIC).circle(0, 13, 3.5).fill(SKIN);
  const armBack = arm();
  const armFront = arm();
  armBack.position.set(-9, -34);
  armFront.position.set(9, -34);

  const torso = new Graphics()
    .roundRect(-12, -37, 24, 25, 6)
    .fill(TUNIC)
    .rect(-12, -20, 24, 4)
    .fill(LEATHER)
    .rect(-2.5, -21, 5, 6)
    .fill(GOLD);

  const head = new Container();
  head.position.set(1, -42);
  const face = new Graphics().circle(0, 0, 10).fill(SKIN);
  const beard = new Graphics()
    .poly([-10, -1, 11, -1, 9, 7, 3, 15, -4, 13, -9, 6])
    .fill(BEARD)
    .ellipse(5, 2, 5, 2.2)
    .fill(0xc0631f);
  const eyes = new Graphics().circle(2, -3, 1.6).circle(8, -3, 1.6).fill(0x1d1b26);
  const nose = new Graphics().circle(6, 0, 2.4).fill(0xe2b08a);
  const helmet = new Graphics();
  const drawHelmet = (crowned: boolean) => {
    const metal = crowned ? GOLD : STEEL;
    const dark = crowned ? 0xc9962b : 0x8b96a8;
    helmet
      .clear()
      // horns first so the dome overlaps their roots
      .poly([-9, -8, -17, -12, -19, -22, -14, -15, -8, -13])
      .fill(HORN)
      .poly([9, -8, 17, -12, 19, -22, 14, -15, 8, -13])
      .fill(HORN)
      .moveTo(-11, -5)
      .arc(0, -5, 11, Math.PI, 0)
      .closePath()
      .fill(metal)
      .rect(-11.5, -7, 23, 3.5)
      .fill(dark)
      .rect(4.5, -6, 3, 6)
      .fill(dark)
      .circle(0, -11, 1.4)
      .fill(dark);
  };
  drawHelmet(false);
  head.addChild(face, beard, eyes, nose, helmet);

  body.addChild(cape, shield, legBack, armBack, torso, legFront, head, armFront);

  let cycle = 0;
  let squashX = 1;
  let squashY = 1;
  let blink = 2;
  let capeLift = 0;
  let turn = 1;

  return {
    view,
    setCrowned: drawHelmet,
    /** Kick the squash-and-stretch spring: >1 stretches tall, <1 squashes flat. */
    squash(amount: number) {
      squashY = amount;
      squashX = 1 / amount;
    },
    update(dt: number, time: number, pose: VikingPose) {
      const speed = Math.abs(pose.vx);
      const running = pose.grounded && speed > 20;
      cycle += dt * (running ? 9 + speed / 45 : 0);

      turn = lerp(turn, pose.facing, Math.min(1, dt * 18));
      const k = Math.min(1, dt * 12);
      squashX = lerp(squashX, 1, k);
      squashY = lerp(squashY, 1, k);
      body.scale.set(squashX * turn, squashY);

      const swing = running ? Math.sin(cycle) : 0;
      if (pose.grounded) {
        legFront.rotation = swing * 0.75;
        legBack.rotation = -swing * 0.75;
        armFront.rotation = -swing * 0.9;
        armBack.rotation = swing * 0.9;
        body.y = running ? -Math.abs(Math.cos(cycle)) * 2.5 : Math.sin(time * 2.2) * 0.6;
        body.rotation = running ? 0.07 : 0;
      } else {
        const rising = pose.vy < 0;
        legFront.rotation = rising ? 0.5 : -0.25;
        legBack.rotation = rising ? -0.3 : 0.45;
        armFront.rotation = rising ? -2.4 : -1.2;
        armBack.rotation = rising ? -2.0 : -1.0;
        body.y = 0;
        body.rotation = Math.max(-0.12, Math.min(0.12, pose.vy / 5000)) + 0.04;
      }
      body.rotation *= Math.sign(turn) || 1; // lean the way he is facing
      head.rotation = pose.grounded ? 0 : Math.max(-0.2, Math.min(0.25, pose.vy / 2500));

      // Cape trails behind: lifted by speed, by falling, and a little by wind.
      const target = Math.min(1, speed / 270) * 0.8 + (pose.grounded ? 0 : Math.max(0, pose.vy / 700));
      capeLift = lerp(capeLift, Math.min(1.3, target), Math.min(1, dt * 8));
      const flutter = Math.sin(time * 9) * 1.5 * (0.3 + capeLift);
      const tipX = -13 - capeLift * 13;
      const tipY = -11 - capeLift * 15 + flutter;
      cape
        .clear()
        .poly([-8, -36, 2, -36, -4, -22, tipX + 6, tipY + 4, tipX, tipY, -11, -30])
        .fill(CAPE);

      blink -= dt;
      eyes.scale.y = blink < 0.1 ? 0.15 : 1;
      if (blink < 0) blink = 2 + Math.random() * 3;
    }
  };
}

export type Viking = ReturnType<typeof createViking>;
