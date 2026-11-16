#!/bin/bash
# frontgate.sh <checkout> <outname>: take the 28 front page pictures from a preview on 5180 and compare.
S=${S:-/tmp/claude-scratch}   # a folder for output: set S to your session scratchpad
cd "$1" || exit 1
mapfile -t urls < <(grep ':5180' /tmp/shots-urls.txt)
bun tools/shots.ts "$S/$2" "${urls[@]}" > "$S/$2.log" 2>&1
python3 "$(dirname "$0")/cmpfront.py" /tmp/shots-before-jernhaugen "$S/$2" | tail -1
