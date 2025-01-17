import { Application } from "pixi.js";
import { JumpController } from "./jumpController";
import worldCreation from "./worldCreation";
import { CollisionSide, rectangleCollision } from "./collision";
import { EventController } from "./eventController";

const initGame = async (gameRef: React.RefObject<HTMLDivElement | null>) => {
  const REQUIRED_FRAMES_ON_GROUND = 2;
  const MOVE_SPEED = 8;
  let framesOnGround = 0;

  const app = new Application();
  await app.init({
    background: 0x87ceeb,
    width: 800,
    height: 600
  });

  gameRef.current?.appendChild(app.canvas);
  const jumpController = new JumpController();
  const eventController = new EventController();

  const { player, platforms } = worldCreation(app);

  // Game loop
  app.ticker.add(({ deltaTime: delta }) => {
    // -- Reset player -- //
    let isGrounded = false;
    const velocity = {
      x: 0,
      y: 0
    };

    // -- Player movement (HAS TO BE BEFORE COLLISION DETECTION) -- //
    if (eventController.isPressingLeft()) velocity.x = -MOVE_SPEED;
    if (eventController.isPressingRight()) velocity.x = MOVE_SPEED;
    player.x += velocity.x * delta;

    // -- Keep player in bounds -- //
    if (player.x < 0) player.x = 0;
    if (player.x > app.screen.width - player.width) player.x = app.screen.width - player.width;

    isGrounded = framesOnGround >= REQUIRED_FRAMES_ON_GROUND;
    velocity.y = jumpController.updateVelocityY(eventController.isPressingJump(), isGrounded, delta);
    player.y += velocity.y * delta;

    const bottomCollisionDetected = platforms.some((p) => rectangleCollision(player, p) === CollisionSide.BOTTOM);
    if (bottomCollisionDetected) framesOnGround++;
    else framesOnGround = 0;
  });
};

export default initGame;
