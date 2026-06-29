# Secret Wars Vol.1 Post-Mortem — vs. Revelations + Token-Efficiency Analysis

**Date:** 2026-06-29. **Purpose:** Paul's standing after-every-expansion review, centered on his two observations of how SWV1 differed from Revelations:
1. **Much smoother, fewer bugs** — credited to the `cc-coordinate` two-session split.
2. **Token usage rose dramatically** — find where the workflow can use tokens more efficiently *only to the point it doesn't sacrifice quality*.

Build-cause detail lives in `docs/secret-wars-vol1-retrospective.md`; this doc is the comparison + the token analysis. Recommendations are **hypotheses to test**, not proven fixes.

---

## Part 1 — Observation 1: fewer bugs (quantified)

| Dimension | Revelations | Secret Wars Vol.1 | Read |
|---|---|---|---|
| Game-breaking root-cause clusters at first audit | ~8 | **0** | The big one |
| Audit findings (deduped) | (many, incl. dead-engine-path clusters) | 16 (2 HIGH / 5 MED / 9 LOW) | Lower *and* less severe |
| HIGH findings that were actual defects | several | **0** (both were design/spec adjudications) | — |
| `expansion-validator` result | issues found | **0 issues, 7/7 Golden rules** | Clean |
| False positives | several wasted triage | **0 pure false positives** | — |
| True SWV1-effect bugs reaching playtest | (rules-churn + stubs + softlocks) | **2** (Magik, Old Man Logan) | — |
| Source of residual bugs | SWV1's own stubs/dead paths | mostly **pre-existing base-engine debt** surfaced by reuse | Not SWV1's code |
| Build workflow | single session | **two-session coordinator/worker split** | The variable that changed |
| Rules-interpretation rework | 3× flip-flop, full cycles thrown away | **0** — resolved to rulebook before coding (Q4a/Q7/Q8) | Rule 8 held |

**What the comparison supports (and what it doesn't):**
- **Strongly supported:** the build was genuinely cleaner, not just smaller — defect *severity* dropped to near-zero, not only defect *count*.
- **Plausible but not isolated:** Paul credits the two-session split. It clearly helped (two confident-call saves caught by independent verification — see retrospective §"What worked" #1). But **a second variable changed simultaneously**: the audit pipeline was mature and from-the-start this time, whereas for Revelations it was built after effects and run once at the end. We can't cleanly attribute the improvement to the split alone — both the split *and* the matured gate were present. Honest read: **both contributed; the split is not proven as the sole cause** (both underlying facts are sourced — the matured-pipeline timing from the Revelations retrospective, the from-the-start wiring from this build's progress doc; the "can't isolate" is reasoning from them, not a guess).
- **The residual bugs vindicate a specific gap:** the only SWV1-*authored* bugs (Magik, OML) were behavioral, and slipped because static audit doesn't execute abilities. That points the next improvement at a runtime gate, not at more inspection.

---

## Part 2 — Observation 2: token-efficiency analysis of `cc-coordinate`

**The constraint Paul set:** optimize tokens *only* to the point it doesn't sacrifice the quality/independence that reduced bugs. So every lever below is graded on whether it touches the independence that did the work. **The independence is the asset; trim the overhead around it, never the asset.**

### Caveat on precision
No hard token totals exist — transcripts aren't instrumented, and measuring them would itself burn significant context. The drivers below are ranked by **estimated magnitude** from the visible evidence (handoff token-cost notes + suggestion-box 2026-06-26 token audit). Each lever is tagged **[measurable]** (could be confirmed with a cheap probe before committing) or **[estimated]**.

### Where the tokens went, ranked by likely magnitude

**1. Both sessions independently loading full project context — LARGE, structural to the split. [estimated]**
Two sessions each load CLAUDE.md (large), MEMORY, and re-ground on the same large files. This is the *inherent* cost of the two-session model and the single biggest driver. It is also partly load-bearing: the worker's independence depends on it building its own context rather than inheriting the coordinator's assumptions.
- **Lever — slim the always-loaded surface, not the independence.** CLAUDE.md trim (suggestion-box #3, was deferred until SWV1 ships — *now unblocked*) and `enabledPlugins` skill-list trim (#2) reduce the per-session fixed cost for *both* sessions at once. **Does NOT touch independence.** Highest-value, lowest-risk lever. → run `/audit-surface` on CLAUDE.md.
- **Non-lever:** do *not* try to have the worker inherit the coordinator's context to save the reload — that reintroduces the shared-assumption bias the split exists to break.

**2. Full reads of very large files — LARGE, partly avoidable. [measurable]**
`script.js` (~21.6k lines) and `cardDatabase.js` (huge) read in full when only a region was needed. Each full read is a large fixed hit, often repeated across both sessions and across grounding passes.
- **Lever — read-orchestration (the ★ primary behavioral lever from the suggestion-box audit).** Default to `codebase-navigator`/`Explore` subagents and targeted `Grep`+offset `Read` over full-file reads; reserve full reads for genuine whole-file edits. The subagent reads the big file in *its* context and returns only the conclusion — the expensive read doesn't land in the main context at all. **Does NOT touch independence** (it's how you read, not whether you verify independently). This is the lever with the best ratio.

**3. Big tool-result dumps — MEDIUM, cheaply avoidable. [measurable]**
The `git status` during merge printed ~95 staged asset paths into context; large diffs and broad greps do the same.
- **Lever — scope the command.** `git status --short -- <dir>` / `git diff --stat`, `Grep` with `head_limit` and `files_with_matches`, `git status -uno` to suppress untracked asset noise. Pure overhead, zero quality cost. Easy win, modest size.

**4. Repeated grounding/verification passes — MEDIUM, and mostly load-bearing. [estimated]**
The `/check` grounding pass and cold-subagent verifications cost tokens — and they are *exactly what caught the two wrong confident-calls*. **This is the asset, not the waste.**
- **Lever — make verification cheaper, not rarer.** Give each cold-subagent a tightly scoped prompt (one claim, the file:line to check) so it reads narrowly instead of re-exploring. Keep the pass; shrink its footprint. **Protects independence by design.**
- **Non-lever:** cutting the number of verification passes. That's cutting the asset — off the table per Paul's constraint.

**5. Courier relay tax (coordinator↔worker paste) — SMALL-MEDIUM, Paul's effort more than tokens. [estimated]**
Manual paste between sessions (suggestion-box "Reduce the courier relay tax", explicitly deferred to *this* post-expansion review). The token cost is the re-stated context in each relay; the bigger cost is Paul's manual effort and latency.
- **Lever — calibrate relay verbosity to receiver state** (already a global preference: terse for an oriented session, full only for a fresh one) and **calibrate scout-and-pause vs scout-and-build** (suggestion-box #3) — reserve the relay-pause for genuinely engine-touching mechanics, let the worker run straight through on localized work. Reduces relay *count*, not independence.
- **Worth surfacing to Paul:** whether a lighter comms channel than manual paste is wanted is a workflow-preference call for him, not a code decision.

**6. Model & effort tiering — a SEPARATE cost axis, real and underused. [measurable]**
Everything above (#1–#5) reduces the *context-window footprint*. Model/effort tiering reduces a different thing: **how fast the work burns Pro subscription limits** — the same task on a cheaper engine. The `Agent`/`Workflow` tools accept per-agent `model` (haiku | sonnet | opus | fable) and `effort` (low → max) overrides, so each dispatched subagent can run on the right tier instead of all-Opus-high by default. Relative cost: Sonnet ≈ 0.6× Opus, Haiku ≈ 0.2× Opus; `low` effort further cuts tool-calls and preamble.
- **Lever — tier by task type, not by default.** Run **mechanical/deterministic** subagent work on Sonnet or Haiku at low effort: inventory/structured-data extraction, `codebase-navigator`/`Explore` searches, grep-and-report lookups, the validator checklist passes. Keep **Opus + high/xhigh effort** for the work that actually needs the intelligence: effect-code writing, the adversarial/cold-read verification (the independence asset), rules adjudication, coordinator judgment calls.
- **Why it's safe:** mechanical extraction and search don't get *more correct* on a more expensive model — they're pattern-matching and retrieval. The independence and hard-logic work, which is where bugs hide, stays on Opus. So this trims subscription burn **without touching the quality that reduced bugs** — the same constraint as every other lever.
- **Maps to the official guidance:** the model-routing reference says explicitly *"use low effort for subagents or simple tasks"* and reserve the top tier for genuinely hard/long-horizon work — exactly the split above.
- **Caveat:** don't over-tier. A cheap model on a task that needed Opus produces a wrong answer that costs more to catch than the tokens saved. When unsure whether a subagent task is "mechanical," leave it on Opus — the default is correctness.

### The net trade-off, stated explicitly
- **Free wins (no quality cost):** #2 read-orchestration, #3 tool-result scoping, #1 always-loaded-surface trim, and #6 model/effort tiering on mechanical subagents. These are pure overhead reduction — and #6 attacks a different cost (subscription burn) than #1–#3 (context footprint), so they stack rather than compete. **Pursue all of them.**
- **Conditional win:** #4 make verification cheaper per-pass (tighter subagent prompts) — keeps the asset, shrinks its cost.
- **Off the table:** anything that reduces the *number* of independent verifications, or that makes the worker inherit the coordinator's context. Those buy tokens by spending the exact independence that produced the near-zero defect rate. **Not worth it per Paul's constraint.**

**Bottom line:** the biggest dollar number (both sessions loading context) is mostly structural to the model that worked, so chase it only via slimming the shared always-loaded surface — which helps both sessions and costs nothing in quality. The best *ratio* lever is read-orchestration. The verification passes look expensive but are the asset; optimize their footprint, never their frequency.

---

## Recommended actions (feeds steps 4–7 of the session)
1. **Run `/audit-surface` on CLAUDE.md** (now unblocked) — slims the per-session fixed cost for both sessions. [Part 2 lever #1]
2. **Adopt read-orchestration as default** — encode "subagent/targeted-read over full-file read" as a coordinator habit. [Part 2 lever #2, the ★ primary lever]
3. **Behavioral `/game-test` gate for new hero abilities** — the residual-bug fix from the retrospective; would have caught Magik + OML. [retrospective §residual #1]
4. Mark the relevant suggestion-box entries handled / folded (step 4).
5. Surface the courier-relay-channel question to Paul as a workflow-preference call. [Part 2 lever #5]
