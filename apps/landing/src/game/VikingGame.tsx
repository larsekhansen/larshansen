import { useEffect, useRef } from "react";
import { EventController } from "./eventController";
import initGame from "./game";

if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}

const VikingGame = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      return (isMounted.current = true) && undefined;
    }

    initGame(gameRef);

    return () => {
      const { cleanupEventListeners } = new EventController();
      cleanupEventListeners();
    };
  }, []);

  return <div id="game" ref={gameRef} />;
};

export default VikingGame;
