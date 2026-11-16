#!/bin/bash
# review.sh <name>: tsc, tests, build, first-script size and the front page gate for the main checkout.
S=${S:-/tmp/claude-scratch}   # a folder for output: set S to your session scratchpad
R=/home/lars/projects/larshansen
cd $R || exit 1
{
  for p in packages/pixelkit packages/maze apps/landing apps/viking; do
    echo "== $p"; (cd $p && bunx tsc --noEmit 2>&1 | tail -3; bun test 2>&1 | tail -5 | grep -v '^$')
  done
  echo "== build"; bun run build 2>&1 | grep -E "index-.*js|Exited|error" | tail -6
  echo "first script bytes: $(gzip -c apps/viking/dist/assets/index-*.js | wc -c)"
  (cd apps/landing && nohup bun run preview --port 5180 --strictPort > $S/p5180.log 2>&1 &)
  sleep 6
  echo "front page: $(bash "$(dirname "$0")/frontgate.sh" $R front-$1-$(date +%s))"
  fuser -k 5180/tcp > /dev/null 2>&1
  echo "stale firefox: $(pgrep -c -f 'firefox --headless')"
  echo FINISHED
} > $S/$1-check.txt 2>&1
