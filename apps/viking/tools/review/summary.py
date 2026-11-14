#!/usr/bin/env python3
"""The tables of the report, from out/t-*.jsonl, out/m-*.jsonl and out/obstacles-*.json."""
import json, glob, collections, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
ORDER = ["langkaia", "akershus", "radhuset", "slottet", "holmenkollen", "akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget"]

def load(prefix):
    out = {}
    for lv in ORDER:
        f = f"out/{prefix}-{lv}.jsonl"
        if os.path.exists(f):
            out[lv] = [json.loads(l) for l in open(f)]
    return out

def med(xs):
    xs = sorted(xs)
    return xs[len(xs) // 2] if xs else None

def table_outcomes(runs_by_level, title):
    print(f"\n### {title}\n")
    print("| Level | k | clear | game over | off route / gave up / time out | hearts lost per run | lives lost per run | median clear (s) |")
    print("|---|---|---|---|---|---|---|---|")
    for lv in ORDER:
        rs = runs_by_level.get(lv)
        if not rs: continue
        byk = collections.defaultdict(list)
        for r in rs: byk[r["k"]].append(r)
        for k in sorted(byk):
            x = byk[k]; n = len(x)
            oc = collections.Counter(r["outcome"] for r in x)
            other = n - oc["clear"] - oc["over"]
            t = med([r["seconds"] for r in x if r["outcome"] == "clear"])
            print(f"| {lv} | ±{k} | {oc['clear']}/{n} | {oc['over']}/{n} | {oc['offroute']}/{oc['gaveup']}/{oc['timeout']} | {sum(len(r['hurts']) for r in x)/n:.1f} | {sum(r['livesLost'] for r in x)/n:.2f} | {t:.0f} |" if t else f"| {lv} | ±{k} | {oc['clear']}/{n} | {oc['over']}/{n} | {oc['offroute']}/{oc['gaveup']}/{oc['timeout']} | {sum(len(r['hurts']) for r in x)/n:.1f} | {sum(r['livesLost'] for r in x)/n:.2f} | – |")

def killers(runs_by_level, k, top=4):
    print(f"\n### Where hearts are lost at ±{k} (all runs pooled; columns in 4-column bins)\n")
    print("| Level | place (cols) | what | hearts per run | lives lost there (all runs) |")
    print("|---|---|---|---|---|")
    for lv in ORDER:
        rs = [r for r in runs_by_level.get(lv, []) if r["k"] == k]
        if not rs: continue
        c = collections.Counter(); lives = collections.Counter()
        for r in rs:
            for h in r["hurts"]:
                cause = h["cause"] if h["cause"] in ("fall", "rail") else h["cause"].split("@")[0]
                key = (h["col"] // 4 * 4, cause)
                c[key] += 1
                if h["lifeLost"]: lives[key] += 1
        for (col, cause), v in c.most_common(top):
            print(f"| {lv} | {col}–{col+3} | {cause} | {v/len(rs):.2f} | {lives[(col, cause)]} |")

def extras(runs_by_level):
    print("\n### Respawns, knock-backs, warnings (all k pooled)\n")
    print("| Level | respawns | walk back: median / 90th pct / max (s of the perfect run) | falls to a lower floor with no heart lost, per run (median climb back, s) | knocked into water or a pit | hurt within 2 s of being put back | enemy hits with under 0.5 s on screen | off-route places (count) |")
    print("|---|---|---|---|---|---|---|---|")
    for lv in ORDER:
        rs = runs_by_level.get(lv)
        if not rs: continue
        cost = sorted(x["refCost"] for r in rs for x in r["respawns"])
        hs = [h for r in rs for h in r["hurts"]]
        knocked = sum(1 for h in hs if h.get("knockedIn"))
        after = sum(1 for h in hs if h.get("afterRespawn"))
        quick = sum(1 for h in hs if h["warned"] is not None and h["warned"] < 30)
        warned = sum(1 for h in hs if h["warned"] is not None)
        off = collections.Counter((r["lastX"] // 16, (r.get("feet") or 0) // 16) for r in rs if r["outcome"] in ("offroute", "gaveup", "timeout"))
        offs = ", ".join(f"col {c} row {rw} ({v})" for (c, rw), v in off.most_common(3))
        fell = sorted(x["refCost"] for r in rs for x in r["resyncs"] if x["refCost"] > 0)
        fells = f"{len(fell)/len(rs):.1f} ({fell[len(fell)//2]:.1f})" if fell else "0"
        if cost:
            print(f"| {lv} | {len(cost)} | {cost[len(cost)//2]:.1f} / {cost[int(len(cost)*0.9)]:.1f} / {cost[-1]:.1f} | {fells} | {knocked} | {after} | {quick} of {warned} | {offs or '–'} |")
        else:
            print(f"| {lv} | 0 | – | {fells} | {knocked} | {after} | {quick} of {warned} | {offs or '–'} |")

def obstacles():
    rows = []
    for f in glob.glob("out/obstacles-*.json"):
        rows += json.load(open(f))
    if not rows: return
    print("\n### Every jump on its own (40 tries each, from the perfect run's state at the walk before it)\n")
    print("| Level | jumps and rides | all made without a heart, ±2 | ±4 | hearts expected on the jumps alone, ±2 | ±4 | the three worst at ±4 (start col → end col: share of tries that cost a heart) |")
    print("|---|---|---|---|---|---|---|")
    for lv in ORDER:
        r = [x for x in rows if x["id"] == lv]
        if not r: continue
        p2 = 1.0; p4 = 1.0
        for x in r: p2 *= x["k2"]; p4 *= x["k4"]
        e2 = sum(1 - x["k2"] for x in r); e4 = sum(1 - x["k4"] for x in r)
        worst = sorted(r, key=lambda x: x["k4"])[:3]
        w = "; ".join(f"{x['col']}→{x['endCol']} {x['name'][:28]}: {100*(1-x['k4']):.0f}%" for x in worst)
        print(f"| {lv} | {len(r)} | {100*p2:.0f}% | {100*p4:.0f}% | {e2:.1f} | {e4:.1f} | {w} |")

if __name__ == "__main__":
    t = load("t"); m = load("m")
    table_outcomes(t, "Timing errors only")
    table_outcomes(m, "±4 with 3 % of jump presses dropped and 15 % of direction releases held 1–8 steps too long")
    killers(t, 2); killers(t, 4)
    extras(t)
    obstacles()
