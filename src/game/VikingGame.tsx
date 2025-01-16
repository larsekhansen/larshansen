import { useEffect, useRef } from "react";
import { Application } from "pixi.js";
import { JumpController } from "./jumpController";
import worldCreation from "./WorldCreation";
import { EventController } from "./eventController";
import { CollisionSide, rectangleCollision } from "./collision";

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}

const VikingGame = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) return (isMounted.current = true) && undefined;

    const jumpController = new JumpController();
    const event = new EventController();

    const { cleanup } = event;

    // Initialize game
    const init = async () => {
      const app = new Application();
      await app.init({
        background: 0x87ceeb,
        width: 800,
        height: 600
      });
      gameRef.current?.appendChild(app.canvas);

      const { player, platforms, ground } = worldCreation(app);

      // Game loop
      app.ticker.add(({ deltaTime }) => {
        // -- Reset player -- //
        event.isGrounded = false;
        const velocity = {
          x: 0,
          y: 0
        };

        // -- Player movement (HAS TO BE BEFORE COLLISION DETECTION) -- //
        velocity.y = jumpController.update(event.isKeyPressed("Space"), event.isGrounded);
        if (event.isKeyPressed("ArrowLeft") || event.isKeyPressed("KeyA")) velocity.x = -event.moveSpeed * deltaTime;
        if (event.isKeyPressed("ArrowRight") || event.isKeyPressed("KeyD")) velocity.x = event.moveSpeed * deltaTime;

        player.x += velocity.x * deltaTime;
        player.y += velocity.y * deltaTime;

        // -- Keep player in bounds -- //
        if (player.x < 0) player.x = 0;
        if (player.x > app.screen.width - player.width) player.x = app.screen.width - player.width;

        // -- Collision detection Y axis (HAS TO BE AFTER PLAYER MOVEMENT) -- //
        platforms.forEach((platform) => {
          const collision = rectangleCollision(player, platform);
          if (collision) {
            const playerBottom = player.y + player.height;
            const isOnGround = playerBottom >= ground.y;
            if (CollisionSide.BOTTOM === collision) {
              console.log("BOTTOM");
              event.isGrounded = true;
              jumpController.reset();
            }
            if (CollisionSide.LEFT === collision) {
              console.log("LEFT");
            }
            if (CollisionSide.RIGHT === collision) {
              console.log("RIGHT");
            }
            if (CollisionSide.TOP === collision) {
              console.log("TOP");
            }
          }
        });
      });
    };

    init();

    return () => {
      cleanup();
    };
  }, []);

  return <div id="game" ref={gameRef} />;
};

export default VikingGame;
