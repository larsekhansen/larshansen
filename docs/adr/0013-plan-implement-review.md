# 0013. One session plans and reviews, Opus implements, each batch deploys

Lars, 2026-11-13: "You will plan. Then Opus will execute it. Then you will review the work. Make
several sub agents at lower levels that can do grunt work, if it saves tokens. I will leave. Do
everything. You may push, merge, deploy, etc. I want to just see the result and comment on that."
Repeated in effect on 2026-11-14: "I'm going to bed. Keep making levels." and "I trust you."

## Decision
- The planning session writes work orders, reviews, and does the git and deploy work.
- Each order or batch is built by one Opus subagent, which commits on a work branch and never pushes.
- The planner re-runs tests and builds, re-checks the front page, looks at screenshots, then
  opens a pull request, merges it, watches the deploy and fetches the live pages.
- Each accepted batch is merged on its own, so the live site moves forward while Lars is away.

## Consequences
- Lars is the first person to play anything. Every pull request says so under "Not checked".
- The leave to merge and deploy was given for this work. A later session should not assume it
  for unrelated changes; ask.
- Cost: each implementer run was 0.7 to 0.9 million tokens. Eight runs in all.

## Not chosen
- Lower-tier implementers. Every order was design-heavy; offered to Lars as a saving, not taken up.
- One pull request at the end. He would have woken to nothing.
- Asking before each merge. He said not to.
