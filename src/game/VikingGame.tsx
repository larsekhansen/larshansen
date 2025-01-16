import { useEffect, useRef } from "react";
import { Application, Graphics, Sprite } from "pixi.js";
import { JumpController } from "./jumpController";
import worldCreation from "./WorldCreation";
import { EventController } from "./eventController";

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
        velocity.y = jumpController.update(e.isKeyPressed("Space"), e.isGrounded);
        if (e.isKeyPressed("ArrowLeft") || e.isKeyPressed("KeyA"))
          velocity.x = -e.moveSpeed * deltaTime;
        if (e.isKeyPressed("ArrowRight") || e.isKeyPressed("KeyD"))
          velocity.x = e.moveSpeed * deltaTime;

        player.x += velocity.x * deltaTime;
        player.y += velocity.y * deltaTime;

        // -- Collision detection X axis -- //
        if (player.x < 0) player.x = 0;
        if (player.x > app.screen.width - player.width) player.x = app.screen.width - player.width;
        // ----------------- //
        // -- Collision detection Y axis (HAS TO BE AFTER PLAYER MOVEMENT) -- //
        platforms.forEach((platform) => {
          if (isColliding(player, platform)) {
            const playerTop = player.y;
            const playerBottom = player.y + player.height;
            const playerLeft = player.x;
            const playerRight = player.x + player.width;
            const platformTop = platform.y;
            const platformBottom = platform.y + platform.height;
            const platformLeft = platform.x;
            const platformRight = platform.x + platform.width;

            const isMovingDown = velocity.y > 0;
            const isMovingUp = velocity.y < 0;
            const isMovingLeft = velocity.x < 0;
            const isMovingRight = velocity.x > 0;
            const isOnGround = playerBottom >= ground.y;
            const isUnderPlatform = playerTop < platformBottom;
            const isOnPlatform = playerBottom >= platformTop && playerTop <= platformBottom;

            const isAtPlatformSideRight = playerLeft <= platformRight;
            const isAtPlatformSideLeft = playerRight >= platformLeft;
            const isAtPlatformSide = isAtPlatformSideLeft || isAtPlatformSideRight;

            const l = (msg: string) =>
              console.log(msg, {
                playerTop,
                playerBottom,
                platformTop,
                platformBottom,
                isMovingUp,
                isMovingDown,
                isMovingLeft,
                isMovingRight,
                isAtPlatformSideLeft,
                isAtPlatformSideRight,
                isOnPlatform
              });

            if (isMovingLeft && !isOnGround) {
              l("isMovingLeft ALT");
            }
            if (isMovingLeft && !isOnGround && isAtPlatformSide && !isOnPlatform) {
              player.x = platform.x + platform.width;
              l("isMovingLeft");
            } else if (isMovingRight && !isOnGround && isAtPlatformSide && !isOnPlatform) {
              player.x = platform.x - player.width;
              l("isMovingRight");
            }
            if (isMovingDown && isOnPlatform) {
              player.y = platformTop - player.height;
              e.isGrounded = true;
              jumpController.reset();
              velocity.y = 0;
            } else if (isMovingUp && isUnderPlatform) {
              l("isMovingUp");
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

  function isColliding(a: Sprite, b: Graphics) {
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }

  return <div id="game" ref={gameRef} />;
};

export default VikingGame;
