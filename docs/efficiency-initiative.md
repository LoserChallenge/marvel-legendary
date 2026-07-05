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
| 1 | SW-cache auto-bump tool (fold into `/deploy`) | tool, autonomous-build | ✅ BUILT 2026-07-03 (`tools/sync-sw-cache.js`, commit `e59a62d`) — cold-reviewed; first run fixed a decayed cache list (+204 files incl. 91 SWV1 art) |
| 2 | DB↔inventory linter (the keystone content gate) | rung-1 gate, autonomous-build | ✅ BUILT 2026-07-03 (`tools/lint-card-data.js`, commit `205eb5f`) — validated on all 7 built expansions (0 false positives); caught 1 real DB bug (B22 Supernova Spear); cold-reviewed (silent-skip + team fixes applied) |
| 3 | Clear base-bug backlog (B1/B6/B8/B9/B19/B20/B21/B22/B23) | cleanup, supervised cc-goal | ✅ DONE + MERGED to master 2026-07-04 (`1f08065`) — Fixed: B6, B9, B22 (07-03); B8-residual, B21, B19, B1 (07-04). CLEARED (not bugs): B20, B23. Each fix independently cold-eyes-reviewed CLEAN; B1 also had a deterministic Playwright repro. Still-open base bugs (B10/B11/B13–B15) roll to the next pass. |
| 4 | Read-orchestration as coordinator default (subagent/targeted-read over full-file) | token habit (★ best-ratio lever) | ACTIVE — standing lever (see Per-build protocol) |
| 4b | Cross-session relay-intel: coordinator relays receipts-form pointers (file:line + pattern + gotcha) so the worker scoped-reads its target, not the whole file | token habit — the cross-session duplication fix | ACTIVE — standing lever (Per-build protocol) |
| 4c | Tool-result scoping (`git status --short`, `grep head_limit`, `--stat` diffs) + tighter cold-subagent verify prompts (cheaper per pass, never fewer) | token free-wins (no efficacy cost) | ACTIVE — standing lever (Per-build protocol) |
| 5 | Model/effort tiering (mechanical→Sonnet/Haiku+low; judgment/verify→Opus/high) | subscription-burn lever (stacks with 4–4c) | ACTIVE — standing lever (Per-build protocol) |
| 6 | First `/goal` autonomy trial: green-zone Phase-1 scaffolding on a fail-closed condition | rung-2 trial | DEFERRED to the build AFTER HoA (decided 2026-07-04). HoA runs Phase 1 under supervised cc-goal and shadow-measures whether the linter gate ALONE would have caught what the human/independent review caught (Build ledger). The `/goal` trial fires next build only if HoA's ledger shows no gate misses. |
| 7 | Test-fix loop (`/loop` + `/goal`) for Phase-3 assertion grind | rung-2 trial | deferred; after #6 proves out |

**Off the table (per Paul's constraint):** reducing the *number* of independent verifications, or making the worker inherit the coordinator's context. Those buy tokens by spending the exact independence that produced SWV1's near-zero defect rate.

## Idea log (append as they surface — date + mark handled in place)

- 2026-07-03 — Initiative opened. Autonomy ladder + `/goal`-vs-`cc-goal` distinction settled; linter identified as keystone. Full context in this session's discussion + source docs above.
- 2026-07-03 — Improvements #1 (SW-cache tool) + #2 (keystone DB↔inventory linter) BUILT + cold-reviewed under `cc-goal` (commits `e59a62d`, `205eb5f`). **Rung-1 content gate now exists** → the green zone is lease-able to a `/goal` trial (rung 2) as planned. Linter caught B22 (Supernova Spear DB recruit 0→4) on first use — content-gate value demonstrated on day one. Next: step-3 base-bug backlog, then the HoA build with the gates live.
- 2026-07-04 — Step-3 backlog continued under supervised `cc-goal`: B8-residual, B21, B19 fixed+verified; B23 (surfaced by B19's cold-eyes review) ruled not-a-bug by Paul (gain ≠ recruit). Pattern held from 07-03: each fix got an independent fresh-subagent cold-read (the required gate, not self-review) before commit; all CLEAN. cc-goal cadence worked — drove all technical calls, stopped only for the two genuine rules forks (B8 disposition, B23 recruit-vs-gain). Only B1 (recruit-race dup, needs Playwright repro) remained at that point.
- 2026-07-04 (later) — **Backlog CLOSED.** B1 fixed via a deterministic Playwright repro + two-part fix (hold the recruit lock across the full await — replacing the blind 500ms timer — and identity-based HQ removal across all 5 recruit call sites); dual-mode verified; two fresh-subagent cold-reads CLEAN. Full `base-code-fixes` batch (B1/B6/B8/B9/B19/B21/B22 fixed; B20/B23 cleared) merged to master (`1f08065`). Improvement #3 done + merged.

## Retro hooks (measure at the end of each build)

- Token cost per phase vs the prior build (rough — use postmortem's estimated drivers; no hard instrumentation).
- `/goal` trial: did the fail-closed gates hold? Any wrong content shipped, or caught by the linter?
- Behavioral bugs caught at the Phase-4d gate vs leaked to playtest (the SWV1 open efficacy question).
- Did read-orchestration + model tiering cut cost without adding defects?
- **Verdict:** ready to widen `/goal` autonomy to more of the green zone next build?

---

## Per-build protocol (THE INGRAINING — run every expansion build)

Purpose: turn this tracker from a passive doc into a step the build actually executes, so lever-application and autonomy-readiness get **measured, not guessed**. **Structural trigger:** the `/new-expansion` skill's "Efficiency protocol" section gates every phase-boundary checkpoint on filling this doc's Build ledger — a phase isn't ✅ until its ledger row is filled. (The CLAUDE.md coordinator-habit bullet is a backup pointer, not the primary trigger — a prose habit alone would be a memory dependency.)

**At build START (before Phase 0):**
1. Open a Build ledger entry below (copy the template block; stamp expansion + date + driver).
2. From the Active-improvements table, confirm which levers apply this build (levers 4–5 are standing/always-on; note any Skip + why).

**At EACH phase boundary (0 → 1 → 2 → 2.5 → 3 → 4):**
1. **APPLY** the levers that fit the phase entered:
   - **Phase 1 (green/mechanical):** DB↔inventory linter (content gate) · read-orchestration + relay-intel (relay file:line, worker scoped-reads — never full-file re-scan) · tool-result scoping · model-tiering (mechanical subagents → cheaper tier).
   - **Phase 2.5 / 3 (red/judgment):** reserve top-tier model + high effort · spec-first · reuse-first per the mechanics-doc verdict.
   - **Phase 4 (gates):** audit pipeline + dual-mode game-test + independent cold-read review.
2. **MEASURE** — record in the ledger for that phase:
   - **Gate-vs-human (the autonomy signal, the number that matters):** what the AUTOMATED gate flagged, and — separately — what the INDEPENDENT/human review caught that the automated gate **missed**.
   - **Independent review run? (Y/N) — the false-empty guard.** An empty "missed" cell counts as autonomy-evidence *only when review = Y*. Empty-with-no-review is **INCONCLUSIVE, not a pass** — otherwise a skipped review reads identically to a perfect gate and fakes a green light. Autonomy-ready for a phase = "missed" empty across builds **AND** review = Y each of those builds. A non-empty "missed" cell ⇒ the gate has a hole; fix the gate before granting autonomy there.
   - **Effort note:** rough round-trips / notable token sinks (relative signal only — no hard instrumentation).
   - **Levers applied** this phase.

**At build END (merge):**
1. Roll the ledger into a one-line verdict per phase: did the automated gate ALONE suffice (would a hands-off run have been safe)?
2. Update Retro hooks + the autonomy-ladder rung call for the NEXT build.

**Status of this protocol:** provisional — a new *process* mechanism, which is a known overconfidence zone. Its own success test: after this build, does the ledger yield a **sharper** autonomy call than a guess would? If the data comes out vague or unusable, the protocol failed its job — revise it, don't trust it.

---

## Build ledger (one entry per expansion build — longitudinal autonomy-readiness data)

The autonomy signal is the "review MISSED" column read together with "Review run? (Y/N)": persistently empty-missed **with review = Y** ⇒ safe to automate that phase. Fill rows in full only for the phase that is this build's live autonomy question; for the rest, log the gate result only if notable (no obligation to fill prose a decision won't consume — least machinery).

### Heroes of Asgard — started 2026-07-04 · driver: cc-goal (supervised) · /goal trial: NO (deferred to next build)
Standing levers this build: linter (Ph1 gate) · read-orchestration + relay-intel · tool-result scoping · model-tiering · spec-first · reuse-first · audit + dual-mode game-test.
**This build's live autonomy question — Phase 1 only:** *would Phase-1 (card data → DB) have been safe to run hands-off next build?* — i.e., did the linter alone catch every card-data error the independent review caught? (Phases 2–4 log gate results only if notable; their autonomy calls aren't on the table yet.)

| Phase | Levers applied | Gate flagged | Review run? (Y/N) | Review caught that gate MISSED | Effort note |
|---|---|---|---|---|---|
| 1 card data → DB **(the measured row)** | | linter result | | empty **+ review=Y** ⇒ autonomy-ready | |
| 0 / 2 / 2.5 / 3 / 4 | log only if notable | | | | |

**End-of-build verdict:** _(fill at merge)_ — was Phase-1's linter gate sufficient (empty-missed with review=Y)? Widen `/goal` to Phase 1 next build? Y/N + why.
