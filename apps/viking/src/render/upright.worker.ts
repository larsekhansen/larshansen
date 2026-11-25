import { loadLevel } from "../levels/index";
import { flats, places } from "./uprightframe";

// One level's flat bands upright (order 45, `upright.test.ts`), in a worker of its own: the levels side by side, and the drawing as fast
// as in a process alone.

declare const self: Worker;

self.onmessage = async (e: MessageEvent<{ id: string }>) => {
  const { id } = e.data;
  const def = await loadLevel(id);
  const f = await flats(id, def);
  self.postMessage({ id, ...f, places: (await places(id, def)).at });
};
