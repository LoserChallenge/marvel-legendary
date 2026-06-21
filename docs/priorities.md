# Priorities — Marvel Legendary

Live task tracker (in-flight / deferred / ongoing / completed). **Not auto-loaded** — consult on direction. CLAUDE.md holds durable context; this holds what's being worked on and what's next. Created 2026-06-20.

---

## 🔜 Next up (in-flight)

### Build the expansion-pipeline process improvements (Changes 1–3)
The main next piece of work. Reshape the pipeline *before* the next expansion build so card-text-vs-code bugs are caught at build time.
- **Plan (reviewed + sandbox-vetted):** `docs/superpowers/plans/2026-06-20-next-expansion-process-improvements.md`
- **Scope:** encode, via `/improve-skill` on `/analyze-expansion` + `/new-expansion`:
  - frozen pre-build spec + **mandatory executable per-card `/game-test` assertion** (the real centerpiece — catches dead-triggers/stubs)
  - separate spec-authoring from spec-auditing (freeze-before-code is the floor; lens separation the upgrade)
  - per-card spec-confidence flag (ambiguous cards → mandatory dynamic test)
  - dual-mode gate (mode-divergent-mechanic checklist + aliased `gameMode` grep as cheap first pass; `expansion-validator` "NOT COVERED: What If?" footer)
  - wire `engine-gotchas.md`, `expansion-decisions.md`, and `docs/card-inventory/references/` into the spec step
- **How to run it:** this is the designated **`/cc-coordinate`** job — first hands-on multi-step coding in this arc; an independent worker builds while the coordinator holds the review context.
- **Then:** run the new pipeline on the next expansion and record the where-caught tally vs. the frozen Revelations baseline (in the plan) as a *directional* read.

---

## ⏸ Deferred (gated or scheduled)

- **Delete the `revelations` branch** — after the rollback window (~a few days past 2026-06-20): `git branch -d revelations`. History + tag `original-game-baseline` preserve everything. Don't delete early.
- **Revelations raw-docs cleanup** — after the branch is deleted, remove `docs/audit-results/`, `docs/playtest-*.md`, `docs/playwright-runs/`, `docs/playwright-verification-plan.md` (durable findings already captured in the retrospective + `expansion-progress/revelations.md`).
- **CLAUDE.md surface pass** — `/audit-surface` on CLAUDE.md: shed inline gotchas now living in `engine-gotchas.md`, keep pointers. (Pairs with this priorities-extraction.)
- **P5 — CLAUDE.md/worktree sync** (from the 2026-04-14 optimization-fixes plan): choose Option A (warning hook) or Option B (flip sync direction). Plan: `docs/superpowers/plans/2026-04-14-project-optimization-fixes.md`. P1/P3/P4 done; P2 unblocked via the Revelations merge.
- **Base-engine code backlog** (separate base-code pass, NOT the expansion road) — from `docs/merge-reconciliation-checklist.md` §7: Darwin/Boom-Boom sidekick bugs (task chip `task_01225142`), Overwhelming Firepower empty-deck guard, `recruitUsedToAttack === "true"` string-vs-boolean, koBonuses empty-pile hardening, Negative-Zone + recruit-to-fight gap, leftover `showHeroAbilityMayPopup` debug logs, + 4 sandbox hardening items.

---

## 🔁 Ongoing

- **Expansion pipeline (the core mission).** Bring expansions into the game one at a time. Status table: `docs/expansion-pipeline-status.md`.
  - Remaining inventory work: **Pass 1** for messiah-complex, shadows-of-nightmare, new-mutants, world-war-hulk; **Pass 2** for shield, weapon-x. Then user review → `final/` → `/analyze-expansion` → `/new-expansion`.
  - Next expansion to *implement* not yet selected.
- **Periodic maintenance:** `/legendary-sweep` (~per expansion), `/audit-project` + `/optimize-project` (when structure/workflow drifts), `/audit-surface` (when editing persistent reference files).

---

## ✅ Recently completed (with context worth keeping)

- **2026-06-20 — Post-Revelations process-improvement road.** Bug-volume retrospective (`docs/revelations-retrospective.md`), full `/legendary-sweep` backfill (→ `docs/engine-gotchas.md` + `docs/expansion-decisions.md`), `/audit-project` + `/optimize-project`, and the reviewed improvement plan (above). Key finding: dominant Revelations bug bucket was card-text-vs-code with no build-time check; dual-mode divergence was NOT a real driver (~0 confirmed). Safe cleanup applied; deferred items listed above.
- **2026-06-20 — Revelations merged to master.** First expansion built into the base game. Full history: `docs/expansion-progress/revelations.md`.
- **By 2026-03-31 — Foundation:** UI revisions, Golden Solo mode, health check, scheme-hero-requirements infrastructure. (Code is the record; see `docs/golden-solo-history.md` for rationale/rules.)
