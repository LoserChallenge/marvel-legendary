# Suggestion Box — process-improvement ideas

A **persistent, cross-expansion** log of ideas for doing the work **faster, more efficiently, or better** — anywhere in the project (build process, tooling, workflow, docs). Raw candidates, not committed work.

**This is NOT a per-expansion initiative.** It accumulates across all expansion builds and beyond. Capture ideas **whenever and wherever** they surface — mid-build, mid-review, in passing. Don't wait for a dedicated review to log one.

**Lifecycle — mark in place, don't delete:** entries stay in the log and get marked as they're handled — `open` → `investigating` → `resolved` / `dropped` (or `promoted` when an idea graduates to committed work in `docs/priorities.md`, with the outcome noted here). Resolved/dropped entries remain as a record; they accumulate. Triaging a too-long list is a future problem, not a now problem.

**Discipline:** correctness is always the priority; speed/efficiency ideas only graduate if they don't compromise it. Treat every entry as a **hypothesis to validate**, not a settled fix — speed claims are a known over-confidence trap.

**Entry format:** `### [date] Title` · value tag · the idea · effort-to-start · caveat · **status**.

---

### 2026-06-25 — Durable engine-primitives reuse catalog
- **Value:** faster reuse scouts AND better correctness; compounds across every future expansion.
- **Idea:** a standing index of *engine primitive → canonical implementation location* (e.g. `gainAsHero`, HQ-reserve recruit pool, `cumulativeRecruitPoints` fight-gate, reveal-class-or-suffer, `koControlledHeroByIdentity`, the `demonGoblinDeck` fight-rescue system). Future `pattern-reuse-scout` runs (and builders) hit a lookup instead of re-searching. The Secret Wars build re-discovered the same primitives repeatedly.
- **Start:** seed from the scouts already run this build; grow as new primitives land.
- **Caveat:** a stale catalog is worse than none — must stay a low-maintenance index, updated only when a genuinely new primitive is built.
- **Status:** open.

### 2026-06-25 — Pull part of the game-test hardening forward
- **Value:** less per-test setup + fewer false-fail re-runs, on work still in flight (3e, Phase 4).
- **Idea:** a reusable inject-state + auto-dismiss-popups + whitelist-sw.js-noise game-test harness snippet, plus a crisp pass/fail assertion shape. Every worker report this build re-handled the popup auto-dismiss and the benign sw.js-404 noise from scratch.
- **Start:** factor the common harness out of the runs already done; coordinate with the cc-helper automation effort so it isn't built twice.
- **Caveat:** overlaps the cc-helper "automate expansion builds" scoping — align scope before building.
- **Status:** open.

### 2026-06-25 — Calibrate scout-and-pause vs scout-and-build
- **Value:** removes an unnecessary relay round-trip on semi-novel mechanics.
- **Idea:** scout-*and-pause* (Banker, Madelyne) costs an extra courier cycle; scout-*then-build-in-one-report* (Nimrod's gate) doesn't. Reserve the pause for genuinely engine-touching or cross-card mechanics; make the trigger explicit so we don't pause when reuse is obvious.
- **Start:** trivial — a one-line rule in the dispatch convention.
- **Caveat:** under-pausing on a truly novel mechanic costs more than the round-trip saved; bias toward pausing when unsure.
- **Status:** open.

### 2026-06-25 — [Big lever, post-expansion review only] Reduce the courier relay tax
- **Value:** the real latency floor — every directive + report is hand-pasted by Paul.
- **Idea:** the mechanical-phase automation the cc-helper session is scoping attacks part of it; the deeper question is whether coordinator↔worker relay can flow with less manual paste while keeping Paul in the oversight loop.
- **Start:** NOT a quick tweak — a workflow redesign for the comprehensive review.
- **Caveat:** removing Paul from the loop changes the oversight model; that tradeoff is the whole point of the review, not a side effect to optimize away.
- **Status:** open (deferred to post-expansion review).
