import { Application, Graphics, Container } from "pixi.js";

const worldCreation = (app: Application) => {
  // Create game scene with platforms
  const gameScene = new Container();
  app.stage.addChild(gameScene);
  const platformPositions = [
    { x: 300, y: 400, width: 200, height: 20 },
    { x: 100, y: 300, width: 200, height: 20 },
    { x: 500, y: 200, width: 200, height: 20 }
  ];

  // Create player
  const player = new Graphics();
  player.setFillStyle({ color: 0xff0000 });
  player.rect(0, 0, 40, 60);
  player.fill();
  player.x = 100;
  player.y = 240;
  gameScene.addChild(player);

  // Create ground
  const platforms: Graphics[] = [];
  const ground = new Graphics();
  ground.setFillStyle({ color: 0x00aa00 });
  ground.rect(0, 0, 800, 60);
  ground.fill();
  ground.x = 0;
  ground.y = 540;
  platforms.push(ground);
  gameScene.addChild(ground);

  // Create floating platforms
  platformPositions.forEach(({ x, y, width, height }) => {
    const platform = new Graphics();
    platform.setFillStyle({ color: 0x00aa00 });
    platform.rect(0, 0, width, height);
    platform.fill();
    platform.x = x;
    platform.y = y;
    platforms.push(platform);
    gameScene.addChild(platform);
  });

  return { player, platforms, ground };
};

export default worldCreation;
