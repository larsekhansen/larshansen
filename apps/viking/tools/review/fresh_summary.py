#!/usr/bin/env python3
"""Tables for line 2's review (15 November 2026) from fresh.ts's .jsonl files.

Run: python3 fresh_summary.py <dir>   (reads <dir>/fs-*.jsonl, fh-*.jsonl, l1s-*.jsonl, l1h-*.jsonl)
"""
import collections, glob, json, os, sys

D = sys.argv[1] if len(sys.argv) > 1 else "out"
LINE1 = ["langkaia", "akershus", "radhuset", "slottet", "holmenkollen", "akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget"]
LINE2 = ["bygdoy", "vigelandsparken", "korketrekkeren", "ostensjovannet", "bjorvika", "gamlebyen"]


def load(prefix, lv):
    f = os.path.join(D, f"{prefix}-{lv}.jsonl")
    return [json.loads(l) for l in open(f) if l.strip()] if os.path.exists(f) else []


def med(xs):
    xs = sorted(xs)
    return xs[len(xs) // 2] if xs else None


def pct(xs, q):
    xs = sorted(xs)
    return xs[min(len(xs) - 1, int(len(xs) * q))] if xs else None


def outcomes(prefix, levels, title):
    print(f"\n### {title}\n")
    print("| Level | k | runs | clear | game over | off route / gave up / time out | hearts lost per run | lives lost per run | median clear (s) | 90th pct clear (s) |")
    print("|---|---|---|---|---|---|---|---|---|---|")
    for lv in levels:
        rs = load(prefix, lv)
        byk = collections.defaultdict(list)
        for r in rs:
            byk[r["k"]].append(r)
        for k in sorted(byk):
            x = byk[k]
            n = len(x)
            oc = collections.Counter(r["outcome"] for r in x)
            secs = [r["seconds"] for r in x if r["outcome"] == "clear"]
            m, p90 = med(secs), pct(secs, 0.9)
            print(f"| {lv} | ±{k} | {n} | {oc['clear']} | {oc['over']} | {oc['offroute']}/{oc['gaveup']}/{oc['timeout']} | {sum(len(r['hurts']) for r in x)/n:.2f} | {sum(r['livesLost'] for r in x)/n:.2f} | {m:.0f} | {p90:.0f} |" if m else f"| {lv} | ±{k} | {n} | {oc['clear']} | {oc['over']} | {oc['offroute']}/{oc['gaveup']}/{oc['timeout']} | {sum(len(r['hurts']) for r in x)/n:.2f} | {sum(r['livesLost'] for r in x)/n:.2f} | – | – |")


def cause_of(h):
    c = h["cause"]
    if c.startswith(("fall", "rail")):
        return c
    return c.split("@")[0]


def hotspots(prefix, levels, k, top=5, title=""):
    print(f"\n### Where hearts go, {title} ±{k} (4-column bins)\n")
    print("| Level | cols | what | hearts per run | lives lost (all runs) | knocked in after a hit |")
    print("|---|---|---|---|---|---|")
    for lv in levels:
        x = [r for r in load(prefix, lv) if r["k"] == k]
        if not x:
            continue
        n = len(x)
        c = collections.Counter()
        lives = collections.Counter()
        kn = collections.Counter()
        for r in x:
            for h in r["hurts"]:
                key = (h["col"] // 4 * 4, cause_of(h))
                c[key] += 1
                if h["lifeLost"]:
                    lives[key] += 1
                if h.get("knockedIn"):
                    kn[key] += 1
        for (col, cause), v in c.most_common(top):
            print(f"| {lv} | {col}–{col+3} | {cause} | {v/n:.2f} | {lives[(col, cause)]} | {kn[(col, cause)]} |")


def others(prefix, levels):
    print(f"\n### Runs that did not end in a clear or Game over ({prefix})\n")
    for lv in levels:
        for r in load(prefix, lv):
            if r["outcome"] in ("offroute", "gaveup", "timeout"):
                print(f"- {lv} ±{r['k']} seed {r['seed']}: {r['outcome']} at col {r['lastX']//16} row {(r.get('feet') or 0)/16:.1f}, move '{r['lastMove'][:60]}', {len(r['hurts'])} hearts, {r['seconds']:.0f} s")


def respawns(prefix, levels):
    print(f"\n### Respawns and walk-back ({prefix}, all k)\n")
    print("| Level | respawns | walk back median / 90th / max (s of the perfect run) | hurt within 2 s of being put back |")
    print("|---|---|---|---|")
    for lv in levels:
        rs = load(prefix, lv)
        cost = sorted(x["refCost"] for r in rs for x in r["respawns"])
        after = sum(1 for r in rs for h in r["hurts"] if h.get("afterRespawn"))
        if cost:
            print(f"| {lv} | {len(cost)} | {cost[len(cost)//2]:.1f} / {cost[int(len(cost)*0.9)]:.1f} / {cost[-1]:.1f} | {after} |")


if __name__ == "__main__":
    outcomes("fs", LINE2, "Line 2, the sloppy player, fresh seeds 101-200")
    outcomes("fh", LINE2, "Line 2, the hesitating player (hesitate=0.2), fresh seeds 101-200")
    outcomes("l1s", LINE1, "Line 1 for comparison, the sloppy player, seeds 101-150")
    outcomes("l1h", LINE1, "Line 1 for comparison, the hesitating player, seeds 101-150")
    for k in (2, 4):
        hotspots("fs", LINE2, k, title="sloppy")
    hotspots("fh", LINE2, 4, title="hesitating")
    hotspots("fs", LINE2, 8, title="sloppy", top=4)
    respawns("fs", LINE2)
    others("fs", LINE2)
    others("fh", LINE2)
