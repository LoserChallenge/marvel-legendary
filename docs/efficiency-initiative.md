# Build Efficiency & Automation Initiative

**Living tracker.** Purpose: make each expansion build faster, leaner, and cheaper in tokens than the one before — **without sacrificing efficacy or accuracy** — and progressively shift suitable work to autonomous execution. Log improvement ideas here as they surface; mark them handled in place. Modeled on `suggestion-box.md`, scoped to efficiency + automation.

Source docs (history/inputs, not living): `automation-initiative.md`, `automation-readiness.md`, `secret-wars-vol1-postmortem.md`, `secret-wars-vol1-retrospective.md`, `revelations-retrospective.md`.

---

## Intent (the north star)

- **Efficiency without sacrificing efficacy/accuracy.** Cut token cost and Paul's manual effort — never independent verification or correctness.
- **More autonomous tasks.** Shift suitable work to run without Paul's input, via loop-engineering + the **`/goal` mechanism** (persistence Stop-hook) — reserving his input for genuine judgment forks.
- **Verification is the ASSET.** SWV1's near-zero defect rate came from independent verification (cold-subagent + `/check` grounding caught real confident-wrong calls). Savings come from *overhead* — read orchestration, context footprint, tool-result dumps, model tiering — **not** from cutting checks or reducing their number.

## Core distinction (settled 2026-07-03)

- **`cc-goal`** = a *methodology* skill. Shapes how work is driven: own the technical calls, verify at checkpoints, report at boundaries, stop only for genuine forks. Human stays in the loop. Safe today.
- **`/goal`** = a *harness mechanism*. Plants a session-scoped Stop hook with a completion condition; **forbids the session from stopping until the condition holds**, then auto-clears. It is the autonomy primitive — it *removes* the natural stop-and-check-in points.
- **`/loop`** = built-in recurring-interval runner (the iteration primitive for a test-fix loop).
- **`/goal` is only as safe as its condition is fail-closed.** A condition that only encodes *structure* ("all cards in DB") lets it grind past a wrong value and never stop to let a human catch it. Clamp `/goal` only on tasks with an objective, fail-closed "done" (e.g. *all N cards in DB AND linter green AND `node --check` clean AND audit HIGH=0*). Never on judgment/red-zone work.

## The autonomy ladder (the mental model)

- **Green zone (mechanical, objective):** Phase 0 pre-flight, Phase 1 card-data→DB + image/SW wiring, Phase 2 setup registration; running the audit pipeline + game-test assertions. Machine-checkable done-states.
- **Red zone (judgment, stays hands-on):** Phase 2.5 spec authoring, Phase 3 effect logic, rules resolution, content-correctness calls.
- **The guardrail:** even green-zone scaffolding writes wrong *values* silently — structural checks pass on a bad stat (`automation-readiness.md` C6). So green-zone automation needs a content gate.

| Rung | State | Driver |
|---|---|---|
| **0 — today** | Green zone run supervised; content-check is a human/independent step | `cc-goal` |
| **1 — build these** | Fail-closed gates: **DB↔inventory linter** (content check, the keystone), per-phase rollback checkpoints, setup-ritual encoding | build work |
| **2 — unlocks after rung 1** | Green zone wrapped in a `/goal` condition → autonomous unattended | `/goal` + gates |

The **DB↔inventory linter is the keystone** — it converts the green zone from *supervised-only* to *lease-able to `/goal`*.

---

## Status board

**Already built (baseline — don't redo):**
- Spec-first Phase 2.5 + Phase 3 executable assertions (killed the Revelations stub-driver).
- `/expansion-audit` pipeline as a from-the-start gate (SWV1: 0 game-breaking defects, validator 0 issues).
- **Phase-4d behavioral game-test machine gate** (PASS/FAIL) — catches behavioral hero bugs static audit misses (Magik/OML class). Pushed to origin 2026-07-03.
- Rules-first (Rule 8) + reuse-scout (Rule 9) — held clean through SWV1.
- Mechanics-doc canonical-side discipline (shared-doc table) — the SWV1 merge-drift fix.
- CLAUDE.md trim + paul/seed shelf removal (token footprint) — 2026-07-03.

**In flight / next:** see Active improvements below.

## Active improvements

| # | Improvement | Rung/type | Status |
|---|---|---|---|
| 1 | SW-cache auto-bump tool (fold into `/deploy`) | tool, autonomous-build | proposed |
| 2 | DB↔inventory linter (the keystone content gate) | rung-1 gate, autonomous-build | proposed |
| 3 | Clear base-bug backlog (B1/B6/B9/B11/B8-half/B19/B20/B21) | cleanup, supervised cc-goal | proposed |
| 4 | Read-orchestration as coordinator default (subagent/targeted-read over full-file) | token habit (★ best-ratio lever) | proposed |
| 5 | Model/effort tiering (mechanical→Sonnet/Haiku+low; judgment/verify→Opus/high) | subscription-burn lever | in cc-coordinate rec |
| 6 | First `/goal` autonomy trial: green-zone Phase-1 scaffolding on a fail-closed condition | rung-2 trial | gated on #2 |
| 7 | Test-fix loop (`/loop` + `/goal`) for Phase-3 assertion grind | rung-2 trial | gated on gates |

## Idea log (append as they surface — date + mark handled in place)

- 2026-07-03 — Initiative opened. Autonomy ladder + `/goal`-vs-`cc-goal` distinction settled; linter identified as keystone. Full context in this session's discussion + source docs above.

## Retro hooks (measure at the end of each build)

- Token cost per phase vs the prior build (rough — use postmortem's estimated drivers; no hard instrumentation).
- `/goal` trial: did the fail-closed gates hold? Any wrong content shipped, or caught by the linter?
- Behavioral bugs caught at the Phase-4d gate vs leaked to playtest (the SWV1 open efficacy question).
- Did read-orchestration + model tiering cut cost without adding defects?
- **Verdict:** ready to widen `/goal` autonomy to more of the green zone next build?
