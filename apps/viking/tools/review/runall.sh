#!/bin/sh
# The whole sloppy-player study, as reported in docs/games/reviews/2026-11-14-adversarial.md (see README.md):
#   1. every level at timing errors of +-2, +-4, +-8 steps (30 runs each)       -> out/t-<level>.jsonl
#   2. every level at +-4 with 3% dropped jumps and 15% held directions          -> out/m-<level>.jsonl
#   3. every jump of every route on its own at +-2 and +-4 (40 tries each)       -> out/obstacles-<level>.json
# Then: python3 agg.py out/t-*.jsonl; python3 hurts.py out/t-*.jsonl; python3 summary.py
cd "$(dirname "$0")"
mkdir -p out
LEVELS="radhuset nabolaget akershus slottet langkaia holmenkollen akerselva nordmarka stortinget ekeberg"
SEEDS=${SEEDS:-30}
for l in $LEVELS; do echo "$l"; done | xargs -P 4 -I{} sh -c "bun sloppy.ts levels={} ks=2,4,8 seeds=$SEEDS out=out/t-{}.jsonl > out/t-{}.log 2>&1"
for l in $LEVELS; do echo "$l"; done | xargs -P 4 -I{} sh -c "bun sloppy.ts levels={} ks=4 seeds=$SEEDS drop=0.03 overhold=0.15 out=out/m-{}.jsonl > out/m-{}.log 2>&1"
for l in $LEVELS; do echo "$l"; done | xargs -P 4 -I{} sh -c "bun obstacles.ts levels={} ks=2,4 seeds=40 > out/obstacles-{}.log 2>&1"
echo done
