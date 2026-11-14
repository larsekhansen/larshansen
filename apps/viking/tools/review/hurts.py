import json, collections, sys
# Where hearts are lost: by column bucket and cause, per k.
for f in sys.argv[1:]:
  runs=[json.loads(l) for l in open(f)]
  byk=collections.defaultdict(list)
  for r in runs: byk[(r['k'],r['drop'],r['overhold'])].append(r)
  for k,rs in sorted(byk.items()):
    c=collections.Counter(); lives=collections.Counter(); knocked=0; after=0; warn=[]
    for r in rs:
      for h in r['hurts']:
        cause=h['cause'].split('@')[0] if not h['cause'].startswith(('fall','rail')) else h['cause']
        key=(h['col']//4*4, cause)
        c[key]+=1
        if h['lifeLost']: lives[key]+=1
        if h.get('knockedIn'): knocked+=1
        if h.get('afterRespawn'): after+=1
        if h['warned'] is not None: warn.append(h['warned'])
    n=len(rs)
    print(f"{f} k={k}: {n} runs; hearts/run {sum(c.values())/n:.1f}; knocked into a pit {knocked}; hurt within 2 s of being put back {after}; enemy hits warned <30 steps: {sum(1 for w in warn if w<30)} of {len(warn)}")
    for (col,cause),v in c.most_common(6): print(f"    cols {col}-{col+3}: {cause}: {v} hearts ({v/n:.2f}/run), {lives[(col,cause)]} lives")
    cost=[x['refCost'] for r in rs for x in r['respawns']]
    if cost: 
      cost.sort(); print(f"    walk back after a fall/life: median {cost[len(cost)//2]:.1f} s, 90th pct {cost[int(len(cost)*0.9)]:.1f} s, max {cost[-1]:.1f} s ({len(cost)} respawns)")
