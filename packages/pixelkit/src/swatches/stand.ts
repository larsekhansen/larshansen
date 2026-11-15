// What he can stand on (order 18, section 5, ADR 0039): everything he can stand on that is not a level's
// main ground or wall (ledges, one-way platforms, rafts, lifts, ferries, bells, hooks, sheets, logs, lily
// pads, decks, oars, rising stones, crates, a statue's head) has its top edge from here, and its body where
// the level draws it from here. One glance says "I can stand there": a bright top edge two pixels thick,
// a teal body, a dark line under it. Nothing that can hurt him, nothing he can take, and no field of any
// level uses these colours. Part of the palette: import it from there, as STAND.

/** The standing top edge: two pixels, the same on every platform. */
export const top = "#7dffd4";
/** The body under it, with a lighter and a darker shade (planks' joints, a pad's veins). */
export const body = "#47c2b8";
export const bodyLight = "#8be3d9";
export const bodyDark = "#2c9a91";
/** The dark line under it. */
export const under = "#123b3a";
/** What moves (a raft, a lift, a log, a hook): the top's lower row in this colour, a stripe. */
export const moving = "#5a48f0";
/** What gives way (sinks, falls, goes on a beat): its top in this colour, broken in dashes. */
export const warn = "#c8a8ff";
