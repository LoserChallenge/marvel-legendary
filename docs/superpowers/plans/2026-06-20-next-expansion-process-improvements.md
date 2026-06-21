# Next-Expansion Process Improvements — Plan

**Date:** 2026-06-20
**Status:** Reviewed via sandbox chain (2026-06-20) and revised per the audit. **Proposal — awaiting Paul's go to build the tooling.** Not yet adopted.
**Sources:** `docs/revelations-retrospective.md`, `docs/engine-gotchas.md`, `docs/expansion-decisions.md`, the 2026-06-20 `/audit-project` + `/optimize-project` reports.
**Independent review:** `D:\Claude Code\sandbox\reviews\2026-06-20-next-expansion-process-improvements-review.md` + `-audit.md`. This revision incorporates every adjudicated fix.

> Everything here is a **hypothesis to test, not a proven fix.** Confident process changes sound right and fail — that is the retrospective's own lesson, and the sandbox review caught the first draft falling into exactly that trap (it claimed a static spec delivered "verification" it didn't, and proposed a self-deflating success metric). Each change below is built to be observable, and the default assumption is that it may NOT help until bug data across *several* expansions says it did.

---

## Goal

Reduce the **volume and severity of card-text-vs-code bugs** in upcoming expansions, by adding an **executable per-card behavioral check at build time** (the layer that was missing), using tools we already have.

> Wording note (review fix): the missing layer is *behavioral verification*, delivered by per-card executable assertions — NOT "specification." A spec document alone is not verification; it's the scaffolding that produces the assertion. The first draft conflated the two.

## The root cause we're targeting — and what each fix can and can't catch

From the retrospective, the dominant Revelations bug bucket was **"the card said X, the code did something else or nothing."** That single phrase covers four mechanically distinct failures, and — this is the key correction from review — a static spec only cleanly catches the *first*:

| Bug class | Example | Caught by static spec? | Reliable catch |
|---|---|---|---|
| Wrong-field no-op | wrote `card.attack` instead of `attackFromOwnEffects` | **Yes** (spec names the field) | static spec / audit |
| Dead trigger | wired but never fires (`locationTrigger` vs `triggeredAbility`) | **No** — code reads plausibly | **execution** (`/game-test`) |
| Stub declared complete | function exists, body is log-only | **No** — passes a glance | **execution** |
| Auto-pick shortcut | auto-resolves a choice the card offers | **Partially** | execution + spec assertion |

So the spec is necessary but not sufficient. The **executable assertion is what catches the bug classes that actually hurt** (dead triggers, stubs). The plan must invest most there, not in the static document. (Root-cause diagnosis stays — "no per-card behavioral check at effect-writing time" is the true common upstream condition — but the fix must not claim coverage it can't deliver.)

---

## Change 1 (centerpiece): Per-card executable behavioral assertions, anchored by a frozen pre-build spec

**The hole it fills:** `/analyze-expansion` works at the *mechanics* level (not per-card); `/new-expansion` Phase 3 reads each card and writes its code in one motion; the only card-level text-vs-code check is Phase 4 audit — static, after the fact, same place it was in Revelations.

**The change, in priority order:**

1. **Executable assertion per non-trivial card (the real centerpiece).** For each card whose behavior isn't trivially vanilla, author a concrete `/game-test` assertion — "set up state S, play the card, assert observable result R." These run during the build, not just at merge, and they catch dead-triggers/stubs/auto-picks that static review misses.
2. **A lightweight per-card spec produces those assertions** (scaffolding, not the goal): exact effect text (inventory) → intended behavior (plain English) → engine function/pattern (`engine-gotchas.md` + `pattern-reuse-scout`) → interaction risks (cross-ref original-game references) → **the executable assertion**.
3. **Freeze the spec before coding (non-negotiable floor).** Committing intent before the code exists prevents the audit from rationalizing code into intent ("I guess that's what the card meant"). Per the audit: temporal ordering alone secures this benefit *even with a single lens* — so "spec before code" is the floor that always pays off.
4. **Separate spec-authoring from spec-auditing (the upgrade).** The same card-type-auditor lens authoring the spec *and* auditing code against it shares one blind spot end-to-end: a misread card → wrong spec → clean audit against the wrong spec. Where feasible, a different pass/lens authors vs. audits; at minimum the audit blind-compares code to the frozen spec without re-deriving intent from the card.
5. **Per-card spec-confidence flag.** When the lens is unsure of a card's intent (ambiguous text, novel interaction), flag it → **mandatory dynamic `/game-test` regardless of complexity scoping.** This is the direct guard against a wrong spec silently propagating, and it stops the complexity carve-out (below) from waving a genuinely ambiguous card through on "it's just +2 Attack" grounds.

**Consumed by:** `/new-expansion` Phase 3 builds against the frozen spec + runs the assertions per card; `/expansion-audit` Phase 4 blind-compares code to the frozen spec.

**Honest cost (review fix — do NOT call this near-free):** running the auditor lens *forward* on every card is, in effort, roughly **a second full audit pass** (once forward to author, once back to verify). The tooling is reused; the *invocations* roughly double per expansion. This is a real upfront tax justified by a hypothesis — which is exactly what the kill criterion measures.

**Scope guard (keep, but bounded by #5):** scope spec/assertion depth to card complexity — a vanilla "+2 Attack" card needs a one-liner; a transforming scheme needs the full treatment. The spec-confidence flag overrides this for ambiguous cards.

**Staleness guard (review cross-cutting #5):** stamp each card's spec with the inventory version it was derived from; if that card's inventory text changes after the spec is authored, regenerate the spec — otherwise a late inventory edit silently turns the spec into a stale (wrong) contract.

## Change 2: Gate dual-mode exercise (NOT a second validator)

**Where we are:** `/analyze-expansion` already forces both-mode thinking upfront. The gap is downstream — `expansion-validator` is Golden-only; `/new-expansion` Phase 4c suggests one test setup; What If? can silently go un-exercised. Revelations showed ~0 confirmed mode-divergence bugs, but that may be looking-bias, not robustness.

**The change (lean):**
- `expansion-validator` emits a standing footer every run: *"NOT COVERED: What If? behavioral — requires dual-mode `/game-test`."*
- **Authoritative gate: a known mode-divergent-mechanic checklist.** Drive dual-mode exercise from "does this expansion introduce any mechanic on the divergent list?" (build the list from the modes' actual rule differences — hero count, villain deck, HQ rotation, win condition, etc.).
- **Cheap first-pass signal: grep the expansion file** for `gameMode` *and its aliases* (`isGolden`, `mode`, relevant enum/config flags). Hits → both modes exercised for the branching mechanics. **Zero hits → no *direct* mode-branching in this file; low risk** — NOT "provably no divergence" (divergence can live in a shared helper the file merely calls). The grep is a signal, not a proof; the mechanic checklist is the real gate.

## Change 3: Wire the new reference layer into the pipeline

- `docs/engine-gotchas.md` → consulted in the spec step (Change 1) and during audit.
- `docs/expansion-decisions.md` → consulted in `/analyze-expansion`.
- Original-game references (relocated per audit finding #3 to `docs/card-inventory/references/`) → the interaction-risk cross-reference source for the spec.

## Change 4: Clear the runway (safe `/audit-project` cleanup)

Fast, low-risk hygiene (full detail in the 2026-06-20 audit report):
- **FIRST — freeze the baseline (sequencing fix):** before deleting any Revelations analysis memory, copy the baseline numbers (the ~8 HIGH root-cause clusters + Round-1/Round-2 playtest volume) into the "How we'll know" section below or a one-line baseline doc. The measurement anchor must not be deleted while it's still the anchor.
- Remove spent one-time tooling: `/golden-solo-fixer`, `audit-tracker`, `revision-tracker` (+ CLAUDE.md entries).
- Delete the retired card-effect-auditor's plan/spec docs.
- Relocate + rename the 5 original-game reference docs out of the game-code folder.
- Delete 5 staging-leftover `rename-plan.md` files.
- Delete 2 stale memory entries (`project_revelations_analysis`, `project_card_effect_auditor`) — **only after the baseline freeze above.**
- Fix the `the-new-mutants` vs `new-mutants` naming mismatch.
- Trim CLAUDE.md "Planned Work" completed items; `/audit-surface` pass to shed inline gotchas now living in `engine-gotchas.md`.
- **Deferred:** Revelations raw docs (`audit-results/`, `playtest-*`, `playwright-runs/`) stay until the `revelations` branch rollback window closes.

---

## How we'll know it worked (falsifiable — and honest about its limits)

The first draft's metric was self-deflating: the spec is *designed* to move detection upstream, so "audit-HIGH count" drops mechanically even if true bug incidence is unchanged. Corrected design:

- **Baseline (FROZEN 2026-06-20):** Revelations' bug profile —
  - Inaugural `/expansion-audit` (2026-05-28): **53 HIGH / 22 MEDIUM / 10 LOW** raw findings, deduping to **~8 HIGH root-cause clusters (A–H)** (transform system dead, 3 schemes can't complete their core mechanic, Location-trigger system dead, all keyword attack-scaling unwired, 5 hero superpowers never fire, 8 hero abilities dead, Mister Hyde unplayable-on-attack, Mandarin Rings wrong cards).
  - Playtest: **Round-1 (2026-06-11) = 18 observations** (Obs 1–18); **Round-2 (2026-06-15) = 13 IDs** (R2-1..R2-13), a mix of new discovery + regressions of Round-1 fixes; **Round-3 (2026-06-19)** surfaced 1 new game-breaking softlock (R2-13).
  - Full detail preserved in `docs/revelations-retrospective.md` + `docs/expansion-progress/revelations.md` (both stay) — these are now the durable baseline record, so the `project_revelations_analysis` memory is safe to delete.
- **Measure:** **total bugs caught at ANY stage** (spec + build assertion + audit + playtest), with a **"where was each caught?" tally** — so the spec gets credit for true *prevention*, not for relocating detection. Normalize **per card and per novel mechanic** to remove the size/complexity confound.
- **What one expansion actually tells us (review cross-cutting #3):** even normalized, next-expansion-vs-Revelations is **n=1 vs n=1** — a *directional read and a clean kill signal*, NOT validation. Between-expansion variance (novelty, ambiguity, interaction density) is large; confidence accrues only across several expansions. Do not over-read a single good or bad result in either direction.
- **Kill criterion:** if the spec+assertion pass adds meaningful upfront cost (≈ a second audit pass) without moving the normalized where-caught profile upstream across the first couple of expansions, revert it — don't keep it out of sunk cost.
- **Efficacy verification is independent** (clean-context review of the outcome), not self-assessed.

## Sequencing

1. **Now (post-go):** Change 4 safe cleanup — **baseline freeze first**, then the rest.
2. **Before next expansion:** build Changes 1–3 into the pipeline via `/improve-skill` on `/analyze-expansion` + `/new-expansion` (encode the frozen-spec + executable-assertion step, the authoring/auditing separation, the spec-confidence flag, and the dual-mode gate). Relocate references.
3. **Next expansion selected** → run the new pipeline → record the where-caught tally against baseline as a directional read.

> This plan is an *input to a later decision*, not a blueprint to execute immediately. Paul gives the go on building the tooling; until then it stays a proposal.
