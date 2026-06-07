import { useEffect, useRef } from "react";
import initGame from "./game";

if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}

const VikingGame = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // React StrictMode invokes effects twice in dev; guard so the game inits
    // exactly once. (The previous guard skipped the *first* run, so in a
    // production build — where the effect fires only once — it never ran and
    // the page rendered blank.)
    if (startedRef.current) return;
    startedRef.current = true;

    initGame(gameRef);
  }, []);

  return <div id="game" ref={gameRef} />;
};

export default VikingGame;
