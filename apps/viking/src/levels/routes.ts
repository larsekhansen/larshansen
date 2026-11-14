// The scripted routes through levels 4 to 10, played by the tests with the real rules and the
// front page's single jump: each must clear its level without a fall or a heart lost, raising
// every flag, and take at least a minute. Each lives in its own file, so the page under
// `?debug&auto` fetches only the one it plays.

export { SLOTTET_ROUTE } from "./routes/slottet";
export { HOLMENKOLLEN_ROUTE } from "./routes/holmenkollen";
export { AKERSELVA_ROUTE } from "./routes/akerselva";
export { NORDMARKA_ROUTE } from "./routes/nordmarka";
export { STORTINGET_ROUTE } from "./routes/stortinget";
export { EKEBERG_ROUTE } from "./routes/ekeberg";
