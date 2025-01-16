import { Application, Container, Texture, Sprite } from "pixi.js";

const colors: Record<string, number> = {
  ground: 0xf9cc6c,
  ground2: 0xef9b14,
  platform: 0x00aa00,
  player: 0xff0000,
  background: 0x000000,
  door: 0x0000ff
};

const worldCreation = (app: Application) => {
  const texture = Texture.WHITE;
  const gameScene = new Container();
  app.stage.addChild(gameScene);
  const platformPositions = [
    { x: 300, y: 400, width: 200, height: 20, tint: 0x00aa00 },
    { x: 100, y: 300, width: 200, height: 20, tint: 0x00aa00 },
    { x: 500, y: 200, width: 200, height: 20, tint: 0x00aa00 }
  ];
  const platforms: Sprite[] = [];

  // Create player
  const player = new Sprite({
    texture,
    tint: 0xff0000,
    width: 40,
    height: 60,
    x: 100,
    y: 240
  });
  gameScene.addChild(player);

  // Create ground
  const ground = new Sprite({
    texture,
    tint: colors.ground,
    width: 800,
    height: 60,
    x: 0,
    y: 540,
    label: "ground"
  });
  platforms.push(ground);
  gameScene.addChild(ground);

  // Create floating platforms
  platformPositions.forEach(({ x, y, width, height, tint }, i) => {
    const platform = new Sprite({
      texture,
      tint,
      width,
      height,
      x,
      y,
      label: `platform-${i}`
    });
    platforms.push(platform);
    gameScene.addChild(platform);
  });

  return { player, platforms, ground };
};

export default worldCreation;
