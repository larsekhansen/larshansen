# Order 18: the sloppy player with the enemies' boxes a quarter larger

Measured 15 November 2026 by order 18's implementer with `fresh.ts` (the sloppy player, ADR 0034) on fresh seeds 201 to 260 (60 runs a level and k), against the same seeds on the code before order 18 (`origin/main` at the merge of PR #63, run from a worktree) and against `line2-after/tables.md` (seeds 101 to 200). Hearts lost per run.

- *every box grown*: every enemy's box a quarter larger (`GROW`), but for the ones that broke a scripted clear (Slottet's hot-dog cart, Stortinget's umbrella, Ekeberg's magpie at 116, Østensjøvannet's coot at 110) and the statues (their heads are steps), and with Gamlebyen's guards at 13 x 18.
- *height only*: the same with only the boxes' height grown (a try, on the eight levels that got worse).
- *handed back*: on the eight levels where growing cost more than 0.3 hearts a run against the code before, every enemy keeps its old box (`keepBoxes`), so they play exactly as before (checked on Slottet and Gamlebyen: the same numbers); on the other eight the boxes grew.

| Level | k | order 17's table (101-200) | before order 18 (201-260) | every box grown | height only | handed back | against before |
|---|---|---|---|---|---|---|---|
| langkaia | ±2 | 0.15 | 0.15 | 0.47 | 0.38 | 0.15 (kept) | +0.00 |
| langkaia | ±4 | 1.19 | 0.77 | 1.10 | 1.00 | 0.77 (kept) | +0.00 |
| akershus | ±2 | 0.51 | 0.52 | 1.10 | 0.88 | 0.52 (kept) | +0.00 |
| akershus | ±4 | 0.97 | 1.00 | 1.45 | 1.27 | 1.00 (kept) | +0.00 |
| radhuset | ±2 | 0.67 | 0.77 | 1.12 | 1.03 | 0.77 (kept) | +0.00 |
| radhuset | ±4 | 1.48 | 1.23 | 1.68 | 1.73 | 1.23 (kept) | +0.00 |
| slottet | ±2 | 0.05 | 0.05 | 0.63 | 0.08 | 0.05 (kept) | +0.00 |
| slottet | ±4 | 0.28 | 0.32 | 0.65 | 0.35 | 0.32 (kept) | +0.00 |
| holmenkollen | ±2 | 0.01 | 0.00 | 0.10 |  | 0.10 (grown) | +0.10 |
| holmenkollen | ±4 | 0.16 | 0.15 | 0.27 |  | 0.27 (grown) | +0.12 |
| akerselva | ±2 | 1.07 | 0.82 | 1.25 | 0.85 | 0.82 (kept) | +0.00 |
| akerselva | ±4 | 2.40 | 2.52 | 2.80 | 2.45 | 2.52 (kept) | +0.00 |
| nordmarka | ±2 | 0.81 | 0.50 | 0.65 |  | 0.65 (grown) | +0.15 |
| nordmarka | ±4 | 1.73 | 2.23 | 2.00 |  | 2.00 (grown) | -0.23 |
| stortinget | ±2 | 1.17 | 1.28 | 2.10 | 1.38 | 1.28 (kept) | +0.00 |
| stortinget | ±4 | 1.53 | 1.80 | 2.33 | 2.18 | 1.80 (kept) | +0.00 |
| ekeberg | ±2 | 1.34 | 1.28 | 1.55 |  | 1.55 (grown) | +0.27 |
| ekeberg | ±4 | 2.80 | 2.27 | 2.58 |  | 2.58 (grown) | +0.31 |
| nabolaget | ±2 | 0.95 | 1.05 | 1.15 |  | 1.15 (grown) | +0.10 |
| nabolaget | ±4 | 1.56 | 1.27 | 1.47 |  | 1.47 (grown) | +0.20 |
| bygdoy | ±2 | 0.19 | 0.20 | 0.40 |  | 0.40 (grown) | +0.20 |
| bygdoy | ±4 | 0.85 | 0.70 | 0.80 |  | 0.80 (grown) | +0.10 |
| vigelandsparken | ±2 | 1.98 | 1.93 | 1.90 |  | 1.90 (grown) | -0.03 |
| vigelandsparken | ±4 | 2.41 | 2.32 | 2.38 |  | 2.38 (grown) | +0.06 |
| korketrekkeren | ±2 | 0.01 | 0.02 | 0.02 |  | 0.02 (grown) | +0.00 |
| korketrekkeren | ±4 | 0.21 | 0.23 | 0.23 |  | 0.23 (grown) | +0.00 |
| ostensjovannet | ±2 | 0.21 | 0.20 | 0.20 |  | 0.20 (grown) | +0.00 |
| ostensjovannet | ±4 | 0.73 | 0.70 | 0.72 |  | 0.72 (grown) | +0.02 |
| bjorvika | ±2 | 0.38 | 0.52 | 0.93 | 0.65 | 0.52 (kept) | +0.00 |
| bjorvika | ±4 | 1.64 | 1.60 | 1.80 | 2.17 | 1.60 (kept) | +0.00 |
| gamlebyen | ±2 | 0.59 | 0.47 | 0.98 | 0.90 | 0.47 (kept) | +0.00 |
| gamlebyen | ±4 | 1.04 | 1.07 | 2.08 | 1.72 | 1.07 (kept) | +0.00 |

Against order 17's table, no level is more than 0.3 hearts a run worse as handed back (the largest: Holmenkollen ±4 +0.11, Nabolaget's ±2 +0.20, Bygdøy ±2 +0.21; Nordmarka ±4 2.00 against 1.73 is +0.27). Against the same seeds before the order, Ekeberg ±4 is +0.31 (2.58 against 2.27; 2.80 in order 17's table). Thirty runs move by ±0.3, sixty by about ±0.2.
