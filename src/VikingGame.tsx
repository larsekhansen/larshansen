import { useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";
import { JumpController } from "./jumpController";
import worldCreation from "./WorldCreation";
import { EventController } from "./eventController";

const VikingGame = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) return (isMounted.current = true) && undefined;

    const jumpController = new JumpController();
    const e = new EventController();

    const { cleanup } = e;

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
        e.isGrounded = false;
        const velocity = {
          x: 0,
          y: 0
        };
        // ----------------- //

        // -- Player movement (HAS TO BE BEFORE COLLISION DETECTION) -- //
        velocity.y = jumpController.update(
          e.isKeyPressed("Space"),
          e.isGrounded
        );
        if (e.isKeyPressed("ArrowLeft") || e.isKeyPressed("KeyA"))
          velocity.x = -e.moveSpeed * deltaTime;
        if (e.isKeyPressed("ArrowRight") || e.isKeyPressed("KeyD"))
          velocity.x = e.moveSpeed * deltaTime;

        player.x += velocity.x * deltaTime;
        player.y += velocity.y * deltaTime;

        // -- Collision detection X axis -- //
        if (player.x < 0) player.x = 0;
        if (player.x > app.screen.width - player.width)
          player.x = app.screen.width - player.width;
        // ----------------- //
        // -- Collision detection Y axis (HAS TO BE AFTER PLAYER MOVEMENT) -- //
        platforms.forEach((platform) => {
          if (isColliding(player, platform)) {
            const playerTop = player.y;
            const playerBottom = player.y + player.height;
            const platformTop = platform.y;
            const platformBottom = platform.y + platform.height;

            const isMovingDown = velocity.y > 0;
            const isMovingUp = velocity.y < 0;
            const isMovingLeft = velocity.x < 0;
            const isMovingRight = velocity.x > 0;
            const isOnGround = playerBottom >= ground.y;

            const l = () =>
              console.log({
                playerTop,
                playerBottom,
                platformTop,
                platformBottom,
                isMovingUp,
                isMovingDown,
                isMovingLeft,
                isMovingRight
              });

            if (
              isMovingLeft &&
              !isOnGround &&
              player.x < platform.x + platform.width
            ) {
              player.x = platform.x + platform.width;
              l();
            } else if (
              isMovingRight &&
              !isOnGround &&
              player.x > platform.x - player.width
            ) {
              player.x = platform.x - player.width;
              l();
            }
            if (isMovingDown && playerBottom > platformTop) {
              // Landing on top of platform
              player.y = platformTop - player.height;
              e.isGrounded = true;
              jumpController.reset();
              velocity.y = 0;
            } else if (isMovingUp && playerTop < platformBottom) {
              // only if player hits platform with head, not side

              l();
              // Hitting platform from below
              player.y = platformBottom;
              velocity.y = 0;
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

  function isColliding(a: Graphics, b: Graphics) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  return <div id="game" ref={gameRef} />;
};

export default VikingGame;
