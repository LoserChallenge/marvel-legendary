# Priorities — Marvel Legendary

Live task tracker (in-flight / deferred / ongoing / completed). **Not auto-loaded** — consult on direction. CLAUDE.md holds durable context; this holds what's being worked on and what's next. Created 2026-06-20.

---

## 🔜 Next up (in-flight)

### Run the new pipeline on the next expansion (directional read)
The Changes 1–3 tooling is built (see Recently completed). The remaining open loop is **efficacy**: pick the next expansion, run it through the reshaped pipeline, and record the where-caught tally vs. the frozen Revelations baseline (in the plan) as a *directional* read — n=1, not validation. Default-assume the new mechanism may NOT be helping until bug data across several expansions says it did; honor the kill criterion in the plan.
- **Plan (baseline + kill criterion):** `docs/superpowers/plans/2026-06-20-next-expansion-process-improvements.md`

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

- **2026-06-20 — Built the expansion-pipeline process improvements (Changes 1–3).** Reshaped the pipeline before the next expansion. New: `docs/expansion-specs/` (frozen per-card behavioral specs with executable `/game-test` assertions), `docs/mode-divergence-checklist.md` (dual-mode gate). `/new-expansion` gained **Phase 2.5** (author + freeze specs before code), build-to-spec + run-assertions in Phase 3, blind-compare-to-spec + dual-mode gate (Phase 4c) in Phase 4. `/analyze-expansion` now consults `expansion-decisions.md` and flags mode-divergent mechanics. `/expansion-audit` passes the frozen spec to auditors. `expansion-validator` emits a standing "NOT COVERED: What If?" footer. Reference layer (`engine-gotchas.md`, `expansion-decisions.md`, `card-inventory/references/`) wired into the spec step. Efficacy is unproven — the next expansion gives a directional read (above).
- **2026-06-20 — Post-Revelations process-improvement road.** Bug-volume retrospective (`docs/revelations-retrospective.md`), full `/legendary-sweep` backfill (→ `docs/engine-gotchas.md` + `docs/expansion-decisions.md`), `/audit-project` + `/optimize-project`, and the reviewed improvement plan (above). Key finding: dominant Revelations bug bucket was card-text-vs-code with no build-time check; dual-mode divergence was NOT a real driver (~0 confirmed). Safe cleanup applied; deferred items listed above.
- **2026-06-20 — Revelations merged to master.** First expansion built into the base game. Full history: `docs/expansion-progress/revelations.md`.
- **By 2026-03-31 — Foundation:** UI revisions, Golden Solo mode, health check, scheme-hero-requirements infrastructure. (Code is the record; see `docs/golden-solo-history.md` for rationale/rules.)
