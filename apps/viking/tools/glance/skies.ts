// The skies a level is looked at under (order 22): the day's, and its own. A level pinned to a dark sky
// (evening, twilight, night, winter) is looked at under it; one pinned to a day's sky or to the clock
// (Langkaia) under the night, so what keeps its light after dark is seen too.

import type { LevelDef } from "../../src/levels/types";

const DARK = new Set(["evening", "twilight", "night", "winter"]);
export const skyOf = (def: Pick<LevelDef, "sky">): string => (def.sky && DARK.has(def.sky) ? def.sky : "night");
