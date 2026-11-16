# Order 22: rectangles a frame, before and after

Measured 16 November 2026 with `?debug&perf` through `tools/glance/perf.ts` at 390 x 844, on a build of `origin/main`
after order 21 (`6c799fb`, "main") and of this branch rebased on it ("order 22"), each served by `vite preview`, at
the same places: every sixtieth column of each level along its route (`bun tools/glance/walk.ts --every=60`, 73
places, each level's own sky, Langkaia by day). The order allows no place more than 200 rectangles over.

| Level | places | most, main | most, order 22 | largest rise (place) |
|---|---|---|---|---|
| langkaia | 4 | 9,360 | 9,403 | +43 (c060) |
| akershus | 5 | 7,142 | 7,113 | -29 (c120) |
| radhuset | 4 | 11,845 | 11,858 | +13 (c180) |
| slottet | 4 | 9,771 | 8,339 | -1,406 (c060) |
| holmenkollen | 4 | 11,920 | 11,925 | +16 (c120) |
| akerselva | 5 | 11,630 | 11,685 | +71 (c120) |
| nordmarka | 4 | 5,523 | 5,480 | -43 (c120) |
| stortinget | 5 | 9,234 | 9,281 | +47 (c060) |
| ekeberg | 5 | 12,183 | 12,016 | -133 (c000) |
| nabolaget | 4 | 9,712 | 9,755 | +43 (c180) |
| bygdoy | 5 | 6,685 | 6,713 | +28 (c120) |
| vigelandsparken | 4 | 7,647 | 7,456 | -71 (c180) |
| korketrekkeren | 5 | 3,674 | 3,673 | +3 (c240) |
| ostensjovannet | 5 | 10,843 | 10,833 | +8 (c060) |
| bjorvika | 5 | 14,350 | 14,391 | +81 (c240) |
| gamlebyen | 5 | 5,197 | 5,106 | -51 (c240) |

The most any place rose: 81 (Bjørvika, column 240: the lips' paint and the moving marks). What fell: Slottet's parade
and King's Guard, and Ekeberg's sheep, are outlined now, so each is one copy of a kept sprite instead of its
rectangles (Slottet 1,400 rectangles fewer, 141 copies more). After dark every outline drawn on the street is
copied once more over the tint (`rings`); the old pale rim drew every enemy twice more, so the night costs fewer
copies than before.

The grain study's two scenes today (`GRAIN.md`): Langkaia's quay 9,196 rectangles at 390 x 844 and 7,027 at
1280 x 800; Stortinget's platform 4,758 and 3,579.
