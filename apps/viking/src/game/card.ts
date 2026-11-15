// The card at a level's end, as small pure rules, so the tests can hold the flow (ADR 0037).
//
// After a rune the card shows what he did and has one action, to the map: any key, tap or click
// takes him there, and after six seconds it goes by itself (not under reduced motion, where it waits
// for him). Playing a level again is what the map is for. A Game over and a level's file that did not
// come keep two actions: try again, and the map.

export type CardKind = "clear" | "over" | "failed";
export type CardAction = "map" | "again";

/** Steps the card after a rune stays before it goes by itself: six seconds. */
export const CARD_AUTO = 360;
/** Keys pressed this soon after the card comes (0.4 s) do not take it away: one pressed as he took the rune is no answer to it. */
export const CARD_GRACE = 24;

/** The card's actions, the first the main one. */
export const cardActions = (kind: CardKind): CardAction[] => (kind === "clear" ? ["map"] : ["again", "map"]);

/** Keys that never answer the card: moving the focus, and the modifiers alone. */
const NOT_AN_ANSWER = new Set(["Tab", "Shift", "Control", "Alt", "Meta", "AltGraph", "CapsLock"]);

/** Whether a key takes him from the card to the map: on the card after a rune, any key newly pressed, once the card has been up a moment. */
export const cardKey = (kind: CardKind | null, key: string, repeat: boolean, age: number) => kind === "clear" && !repeat && age >= CARD_GRACE && !NOT_AN_ANSWER.has(key);

/** Whether the card after a rune goes by itself now, `age` steps after it came. */
export const cardGoes = (kind: CardKind | null, age: number, reduced: boolean) => kind === "clear" && !reduced && age >= CARD_AUTO;

/** Where he stands on the map after clearing a level: at its own station, the next one open ahead of him. */
export const arriveAfterClear = (id: string) => id;
