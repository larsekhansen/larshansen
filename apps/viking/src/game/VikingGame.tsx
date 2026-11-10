import { useEffect, useRef, useState, type PointerEvent } from "react";
import { initGame, type GameHandle, type RunState } from "./game";
import type { TouchButton } from "./input";
import { DOORS, RUNES, RUNE_STROKES, type RuneChar } from "./level";

if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}

const Rune = ({ char, lit }: { char: RuneChar; lit: boolean }) => (
  <svg viewBox="-1 -1 12 17" className={lit ? "rune lit" : "rune"} aria-hidden="true">
    {RUNE_STROKES[char].map((stroke, i) => (
      <polyline key={i} points={stroke.map(([x, y]) => `${x * 10},${y * 15}`).join(" ")} />
    ))}
  </svg>
);

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

const VikingGame = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameHandle | null>(null);
  const [runes, setRunes] = useState({ mask: 0, crowned: false });
  const [nearDoor, setNearDoor] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState<{ ms: number; best: number | null; state: RunState }>({ ms: 0, best: null, state: "idle" });

  useEffect(() => {
    // The game starts asynchronously; if React unmounts first (StrictMode does
    // this in dev) the finished instance is destroyed as soon as it resolves.
    let cancelled = false;
    initGame(hostRef.current!, {
      onRunes: (mask, crowned) => setRunes({ mask, crowned }),
      onNearDoor: setNearDoor,
      onMuted: setMuted,
      onTime: (ms, best, state) => setTime({ ms, best, state })
    })
      .then((game) => {
        if (cancelled) game.destroy();
        else gameRef.current = game;
      })
      .catch((err) => {
        console.error("Game failed to start", err);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  const hold = (button: TouchButton) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      gameRef.current?.setTouch(button, true);
    },
    onPointerUp: () => gameRef.current?.setTouch(button, false),
    onPointerCancel: () => gameRef.current?.setTouch(button, false),
    onContextMenu: (e: { preventDefault(): void }) => e.preventDefault()
  });

  const count = RUNES.filter((_, i) => runes.mask & (1 << i)).length;
  const door = DOORS.find((d) => d.id === nearDoor);

  return (
    <div className={failed ? "page failed" : "page"}>
      <div id="game" ref={hostRef} />

      <header className="hud">
        <div className="brand">
          <h1>Lars Hansen</h1>
          <p>You found the secret door. Find the ten runes, or take a door back out.</p>
          {!failed && (
            <div
              className="runes"
              role="img"
              aria-label={
                runes.crowned && count === RUNES.length
                  ? "All ten runes found"
                  : `${count} of ${RUNES.length} runes found`
              }
              title="Find the ten runes"
            >
              {RUNES.map((r, i) => (
                <Rune key={i} char={r.char} lit={(runes.mask & (1 << i)) !== 0} />
              ))}
              {runes.crowned && <span className="crown">★</span>}
            </div>
          )}
          {!failed && (
            <p className={`timer ${time.state}`} aria-live={time.state === "done" ? "polite" : "off"}>
              <span className="now">{seconds(time.ms)}</span>
              {time.state === "done" && time.best !== null && time.ms <= time.best && <span> · new best!</span>}
              {time.best !== null && !(time.state === "done" && time.ms <= time.best) && <span> · best {seconds(time.best)}</span>}
              {time.state === "done" && <span> · R to run again</span>}
            </p>
          )}
        </div>

        <nav aria-label="Destinations">
          {DOORS.map((d) => (
            <a key={d.id} href={d.href} className={d.id === nearDoor ? "near" : undefined} title={d.blurb}>
              {d.label}
            </a>
          ))}
          {!failed && (
            <button
              type="button"
              className="mute"
              aria-pressed={muted}
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
              title="Sound (M)"
              onClick={(e) => {
                gameRef.current?.toggleMute();
                e.currentTarget.blur(); // give the keyboard back to the game
              }}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          )}
        </nav>
      </header>

      {!failed && (
        <div className="touch" aria-hidden="true">
          <div className="pad">
            <button type="button" tabIndex={-1} {...hold("left")}>
              ◀
            </button>
            <button type="button" tabIndex={-1} {...hold("right")}>
              ▶
            </button>
          </div>
          <div className="pad">
            {door && (
              <button type="button" tabIndex={-1} className="enter" onClick={() => gameRef.current?.enterNearest()}>
                Enter {door.label}
              </button>
            )}
            <button type="button" tabIndex={-1} className="jump" {...hold("jump")}>
              ▲
            </button>
          </div>
        </div>
      )}

      {!failed && <p className="keys">← → move · Space jump (twice for a double jump) · ↑ enter · R restart · M sound · T time</p>}
    </div>
  );
};

export default VikingGame;
