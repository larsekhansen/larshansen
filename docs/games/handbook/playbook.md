# Playbook: one round, from order to live site

What the planning session does, in order. It took about two hours a round on 16 November, of
which ten minutes were the planner's.

## 1. Write the order

A file in `docs/games/orders/NN-name.md` (drafted in the scratchpad, committed by the
implementer as its first commit). The implementer knows nothing else, so the order carries
everything. The shape that worked, every time:

1. **Why**, with Lars's words quoted exactly, typos and all. Implementers follow a quote better
   than a paraphrase, and the ADR can quote it later.
2. **Before you start**: what to read (CLAUDE.md, HANDOVER, DESIGN, the ADRs by number, the
   last two orders, the files it will touch); the branch name, cut from `origin/main`; "commit
   as you go, do not push"; Bun only; the rules that stand (ADR 0003, ADR 0014); which sloppy
   run files must be byte-identical; the front page's 28 pictures; the first script's size now
   and its limit.
3. **Look first**: measure or picture the present state into `apps/viking/tools/review/oNN/`
   before changing anything. Orders without this produced claims that could not be checked.
4. **Numbered items**, each with what "done" means in a way a picture or a number can show.
5. **Docs**: which of DESIGN, HANDOVER, ADRs, LEVELS.html.
6. **Measures that must hold**: tests, tsc, build, size, front page, run files, perf.
7. **Hand back**: per item done / partly / not done and why; pictures in `/tmp/shots-name/`;
   tables; "what only a person can judge, as a list for Lars"; departures, doubts, found and
   not fixed; branch and commits; "confirm no preview server or headless browser of yours is
   left running".

Say what is decided and what is the implementer's to choose "by looking". Say what must not be
stretched ("do not stretch this order to redraw every enemy; list what is left").

## 2. Launch

`Agent` with `subagent_type: general-purpose`, `model: opus`, running in the background. The
prompt names the checkout, the branch, the order file's path, and the practical notes below
(copy them; every one was learned the hard way):

- `post/` is Lars's own untracked file: do not add, commit or touch it.
- Privacy (ADR 0014). The reference games are GPL: technique and numbers only.
- Pictures: `bun tools/shots.ts [--size=390x844] [--wait=5000] <dir> <url>…` against a preview
  server; the debug addresses; preview ports 5184 to 5189, stopped by port; port 5180 is the
  front page gate's.
- `/tmp` is RAM. Kill hung headless Firefox after each batch; bulky working files under
  `~/.cache/claude-scratch-larshansen/oNN/`; only the hand-back pictures in `/tmp/shots-name/`.
- No `rm -rf` with shell variables (a safety check blocks it): literal paths or fresh names.
- The first script's size and the 60 kB limit.
- Run the whole viking suite only at milestones.
- Sign commits `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Look at your own pictures before claiming something reads well, at 390 x 844 too.

**One implementer at a time** in the main checkout. Two at once is possible with
`isolation: "worktree"` for the second, but the Pi slows badly (load 15 to 30, the suite takes
twice as long, the deploy's tests timed out once). Do it only when the two orders touch
different files, and tell the second it will be asked to rebase.

**Adding to a running order**: `SendMessage` to the agent, first line a full sentence saying
what it is, Lars's words quoted, "add it as section 3x and do it in this branch". Four such
additions went into order 26. If the addition is large or touches what the next order will
redraw anyway, put it in the next order instead and tell Lars which.

## 3. Review the hand-back

The hand-back is a report by a model, not proof. Check it:

```bash
cd /home/lars/projects/larshansen && git status -sb && git log --oneline origin/main..HEAD
bash docs/games/handbook/scripts/review.sh oNN     # set S inside it first; about five minutes
```

`review.sh` runs `tsc --noEmit` and `bun test` in the four packages, the root build, prints the
first script's gzipped size, serves the front page on 5180, takes the 28 pictures and compares
them, and counts stale browsers. Wanted: 0 fail everywhere, under 60,000 bytes, "28 of 28
byte-identical".

Then **look at the pictures** (Read the PNGs): a frame sheet or two, one place per changed
thing at 390 x 844, anything the hand-back calls a doubt. Things found only by looking, on
16 November: a foreground mast that read as a tear in the picture; shield crops that were
empty; a boy that looked like a teddy (Lars found that one).

Read "departures, doubts, not fixed" twice. Anything that contradicts what Lars was told goes
to him in plain words (the edge forgiveness did).

## 4. Merge and deploy

```bash
git push -u origin <branch>
gh pr create --head <branch> --title "Order NN: …" --body "…"   # what, checked, not checked
gh pr merge <branch> --merge
git checkout main && git pull origin main && git branch -d <branch>
gh run watch <id> --exit-status        # about four minutes; ten when the Pi is busy
curl -s https://larshansen.dev/viking/ | grep -o 'index-[A-Za-z0-9_-]*\.js'   # must match dist
```

PR bodies end with the Claude Code line; say what was **not** checked (a real phone, motion at
speed, sound). If the deploy fails, read `gh run view <id> --log-failed`: so far the only
failure was a test hook timing out under load.

## 5. Tell Lars

Lead with what is live and its address. Then what changed, as he would see it, in plain words.
Then what did not go as said, what is not done, what he must judge. Then what is building.
No code names. He reads on a phone.

Republish the pages he looks at ([`resources.md`](resources.md)) when their pictures changed.

## 6. Housekeeping, every round

Lars, on the Pi's memory: "maybe jsut always assume from now on though so it can be cleaned if
old or stale". The Pi has 8 GB and `/tmp` is RAM.

```bash
ps -eo pid,etimes,rss,args | grep "firefox --headless" | grep -v grep   # any over a few minutes: kill
ss -ltnp | grep -E ":51[89][0-9]"                                        # preview servers left over
df -h /tmp; free -m
git worktree list; git branch --merged origin/main
```

- Every Firefox on this Pi is ours (Lars uses Falkon and foot). A screenshot takes seconds; one
  that is minutes old has hung. Kill it and remove its `/tmp/shots-*`, `/tmp/perf-*`,
  `/tmp/hand-*` profile folder.
- Move a finished round's pictures from `/tmp` to `~/.cache/claude-scratch-larshansen/`.
- Remove finished worktrees and merged local branches.
- Do not touch Falkon, foot, Home Assistant, dockerd or the actions runner.
- **Keep** `/tmp/shots-before-jernhaugen/` and `/tmp/shots-urls.txt`: the front page gate.
