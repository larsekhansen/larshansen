"""The edge's forgiveness (order 23, section 4), seed by seed: the sloppy player's runs with 6 steps and with 10, the
same level, timing error and seed, compared. A run does better when it clears where it did not, or loses fewer hearts
(and as many lives or fewer); worse the other way. Prints a table per level and every seed that did worse.

usage: python3 edgecmp.py <dir with 6-step runs> <dir with 10-step runs>   (files <level>.jsonl from fresh.ts)"""
import json, os, sys

before, after = sys.argv[1:3]
rank = {"clear": 0, "timeout": 1, "gaveup": 2, "offroute": 2, "over": 3}


def load(path):
    out = {}
    for line in open(path):
        if line.strip():
            r = json.loads(line)
            out[(r["k"], r["seed"])] = r
    return out


def score(r):
    return (0 if r["outcome"] == "clear" else 1, r.get("livesLost", 0), len(r["hurts"]))


print("| Level | runs | better | worse | same | hearts a run at ±2, 6 → 10 | at ±4, 6 → 10 |")
print("|---|---|---|---|---|---|---|")
worse_all = []
tot = [0, 0, 0, 0]
for name in sorted(os.listdir(after)):
    if not name.endswith(".jsonl") or not os.path.exists(os.path.join(before, name)):
        continue
    a, b = load(os.path.join(before, name)), load(os.path.join(after, name))
    better = worse = same = 0
    hearts = {}
    for key, ra in a.items():
        rb = b.get(key)
        if not rb:
            continue
        sa, sb = score(ra), score(rb)
        if sb < sa:
            better += 1
        elif sb > sa:
            worse += 1
            worse_all.append(f"{name[:-6]} ±{key[0]} seed {key[1]}: {ra['outcome']}, {len(ra['hurts'])} hearts → {rb['outcome']}, {len(rb['hurts'])} hearts (last move {rb.get('lastMove')}, hurts at {[h.get('x') if isinstance(h, dict) else h for h in rb['hurts']]})")
        else:
            same += 1
        hearts.setdefault(key[0], [0, 0, 0])
        hearts[key[0]][0] += len(ra["hurts"])
        hearts[key[0]][1] += len(rb["hurts"])
        hearts[key[0]][2] += 1
    tot = [tot[0] + better + worse + same, tot[1] + better, tot[2] + worse, tot[3] + same]
    h = {k: f"{v[0] / v[2]:.2f} → {v[1] / v[2]:.2f}" for k, v in hearts.items()}
    print(f"| {name[:-6]} | {better + worse + same} | {better} | {worse} | {same} | {h.get(2, '')} | {h.get(4, '')} |")
print(f"| all | {tot[0]} | {tot[1]} | {tot[2]} | {tot[3]} | | |")
print()
print("Worse:" if worse_all else "No run did worse.")
for w in worse_all:
    print("-", w)
