export const V = "../../src";
export const PK = "../../../../packages/pixelkit/src";
const imp = (p: string) => import(`${V}/${p}`);
const _play = await imp("game/play.ts");
const _phys = await import(`${PK}/physics.ts`);
export const play = { ..._play, placeBodyAt: (p: any, x: number, bottom: number) => _phys.placeBody(p.body, x, bottom) };
export const physics = _phys;
export const bot = await imp("game/bot.ts");
export const R = await imp("levels/routes.ts");
export const LEVELS = [
  ["langkaia", (await imp("levels/langkaia.ts")).LANGKAIA, R.LANGKAIA_ROUTE],
  ["akershus", (await imp("levels/akershus.ts")).AKERSHUS, R.AKERSHUS_ROUTE],
  ["radhuset", (await imp("levels/radhuset.ts")).RADHUSET, R.RADHUSET_ROUTE],
  ["slottet", (await imp("levels/slottet.ts")).SLOTTET, R.SLOTTET_ROUTE],
  ["holmenkollen", (await imp("levels/holmenkollen.ts")).HOLMENKOLLEN, R.HOLMENKOLLEN_ROUTE],
  ["akerselva", (await imp("levels/akerselva.ts")).AKERSELVA, R.AKERSELVA_ROUTE],
  ["nordmarka", (await imp("levels/nordmarka.ts")).NORDMARKA, R.NORDMARKA_ROUTE],
  ["stortinget", (await imp("levels/stortinget.ts")).STORTINGET, R.STORTINGET_ROUTE],
  ["ekeberg", (await imp("levels/ekeberg.ts")).EKEBERG, R.EKEBERG_ROUTE],
  ["nabolaget", (await imp("levels/nabolaget.ts")).NABOLAGET, R.NABOLAGET_ROUTE],
] as const;
export const POLE = new Set(["akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget"]);
