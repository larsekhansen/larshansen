// What he can stand on (order 18, section 5, ADR 0039; order 22, ADR 0044): everything he can stand on that is not
// a level's main ground or wall (ledges, one-way platforms, rafts, lifts, ferries, bells, hooks, sheets, logs, lily
// pads, decks, oars, rising stones, crates, a statue's head) has its top edge painted from here, and its body where
// the level draws it from here. Yellow paint means "you can go here", as players know it from other games: a flat,
// saturated yellow, two pixels thick, a little worn at the ends, the same in every level, keeping its light after
// dark. Nothing that can hurt him, nothing he can take, and no field of any level is that yellow.
// Part of the palette: import it from there, as STAND.

/** The paint on the top edge: two pixels, the same on every platform. */
export const top = "#ffd400";
/** The paint worn thin at a platform's ends. */
export const worn = "#c9a227";
/** The body under it, with a lighter and a darker shade (planks' joints, a pad's veins). */
export const body = "#47c2b8";
export const bodyLight = "#8be3d9";
export const bodyDark = "#2c9a91";
/** The dark line under it; and the black of the marks in the paint (what moves: chevrons in it). */
export const under = "#123b3a";
export const mark = "#1d1a14";
/** What moves (a raft, a lift, a log, a hook): black chevrons in the paint. Kept as a name for what moves; it is the mark's black. */
export const moving = mark;
/** What gives way (sinks, falls, goes on a beat): the paint broken in dashes. The same yellow. */
export const warn = top;
