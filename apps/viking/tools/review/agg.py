import json, collections, glob, sys
files = sys.argv[1:] or sorted(glob.glob('out/t-*.jsonl'))
for f in files:
  runs=[json.loads(l) for l in open(f)]
  byk=collections.defaultdict(list)
  for r in runs: byk[(r['k'],r['drop'],r['overhold'])].append(r)
  for k,rs in sorted(byk.items()):
    oc=collections.Counter(r['outcome'] for r in rs)
    where=collections.Counter((r['outcome'], r['lastX']//16, r.get('feet',0)//16, r['lastMove'][:40]) for r in rs if r['outcome'] not in ('clear',))
    print(f, k, dict(oc))
    for w,c in where.most_common(6): print('    ',c,w)
