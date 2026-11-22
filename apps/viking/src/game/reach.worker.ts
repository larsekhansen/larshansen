import { LEVELS, searchLevel, searchPart } from "./reachlevel";

// A level's reach search in a worker of its own, so the tests can search the levels side by side (`reachlevel.ts` says what
// is searched). Asked for a part (order 35), only that search of the level (`partsOf`); otherwise all of them.

declare const self: Worker;

self.onmessage = (e: MessageEvent<{ id: string; pole: boolean; part?: number }>) => {
  const { id, pole, part } = e.data;
  self.postMessage(part === undefined ? searchLevel(id, pole) : { id, part, ...searchPart(LEVELS[id], pole, part) });
};
