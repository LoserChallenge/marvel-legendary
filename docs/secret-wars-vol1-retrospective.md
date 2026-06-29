# Secret Wars Vol.1 Build Retrospective — Why This Build Was Clean

**Date:** 2026-06-29 (post-merge). **Purpose:** make the *next* expansion build smoother by learning from what went RIGHT this time — and naming the two residual gaps that still leaked bugs — so the gains compound instead of being rediscovered.

**Method:** synthesis of the pre-merge audit catalog (`docs/audit-results/secret-wars-vol1-2026-06-26.md`), the progress-doc dispositions (`docs/expansion-progress/secret-wars-vol1.md`), the known-issues base-bug catalogue, the rules-notes cache, and this session's in-chat sandbox-review + Paul's playtest of both modes. Recommendations are tagged **hypotheses to test**, not proven fixes — verify efficacy on the next build via independent review, not self-assessment.

---

## The headline

**SWV1 was dramatically cleaner than Revelations, and the cleanliness is attributable, not luck.** Two structural changes carried it:

1. **The `cc-coordinate` two-session split** (coordinator in master directing a worker in the worktree) put an independent perspective on the hands-on work continuously, not just at the pre-merge gate. Paul's own read: fewer bugs overall, and it felt much smoother.
2. **The audit pipeline ran as a built-in gate, mature.** Where Revelations' `/expansion-audit` was *built after* effects were written and surfaced ~8 game-breaking clusters the moment it first ran, SWV1's pipeline existed from the start and the effects were written against it. Result: **all 9 auditors passed, `expansion-validator` returned 0 issues (7/7 Golden rules), and not one finding was a game-breaking defect.**

**The numbers (audit catalog, deduped):** 16 findings — **2 HIGH, 5 MEDIUM, 9 LOW**. Both HIGH items were *adjudications, not defects* (H1 = a spec-vs-engine slot-keying call that was ratified; H2 = the Golden hero-count design question Paul ruled on). No pure false positives. The real omissions among the MEDs (M2, M4) were pre-existing base-engine bugs the audit re-surfaced, fixed on-branch. Contrast Revelations, where the equivalent pass exposed roughly eight root-cause clusters of stubs, silent failures, and dead engine paths.

**So where did the residual bugs come from?** Two places, and neither is "SWV1 wrote bad effect code":
- **(a) Pre-existing base-engine bugs surfaced by reuse** — B6, B8, B9, B11, B12, B16, B17 were all *found via* an SWV1 card exercising a base-game code path that was already broken. These are base-game faults, not SWV1 effect defects. They split two ways: the ones that *blocked an SWV1 card* were fixed on-branch (B12, B16 — which broke Madelyne's core playability — B17, and the converter-reachable half of B8), while the ones with no in-scope live impact were deferred to the base-code branch (B6, B9, B11, B8's `skrulled`/`gainScarletWitchAsHero` half, B19's free-recruit-ability instances). Only the deferred set is the "scattered backlog" of §residual #2.
- **(b) Two behavioral hero effects that static audit cannot catch** — Magik "Dimensional Portal" (+1 Attack per Sidekick played — silently always +0) and Old Man Logan "Loner" (condition residual). Both passed the text-vs-code audit and surfaced only in Paul's live playtest.

**Single highest-leverage change for next build:** a **runtime/behavioral gate** — dual-mode `/game-test` that actually *runs* each new hero ability before merge. The static audit pipeline is now strong enough that the remaining leak is behavioral, and behavioral bugs need execution, not inspection. Everything else below is secondary.

---

## What worked, ranked by leverage

### 1. The two-session coordinator/worker split — clear positive (but confounded with #2)
An independent session reviewing the worker's hands-on output caught problems continuously rather than at a single end gate. **Calibration:** the split clearly helped, but it is *not* isolable as the dominant cause — the audit pipeline (#2) matured in the same build, so two variables changed at once and the clean result can't be attributed to the split alone (see post-mortem Part 1). What the split demonstrably did was catch coordinator errors that self-review would have missed. Two concrete saves this session, both *coordinator confident-calls caught WRONG by verification before they caused harm*:
- "Madelyne has no `alwaysLeads`" — a `head`-truncated grep; she *does* lead Limbo. Caught by the `/check` grounding pass.
- A patched telepathic path mislabeled as "Professor X probe" — it was actually Ghost Rider "Infernal Chains." Caught by cold-subagent verification.
- **Why it worked:** the implementer's own verification is the weakest verification (self-evaluation bias). A genuinely separate session with its own context doesn't share the coordinator's wrong assumptions. **This is the gain to protect** — it's also the token cost the post-mortem (step 3) must weigh, but the bug-reduction is the reason the cost is worth paying.

### 2. The audit pipeline as a from-the-start gate, not a bolt-on
Revelations' dominant bug driver was "stubs declared complete, no text-vs-behavior gate at effect-write time." SWV1 wrote effects against the existing pipeline, so that entire class largely didn't recur: validator 0 issues, no stub-body findings, no dead-engine-path clusters. **The Revelations retrospective's #1 prevention hypothesis (run card-type auditors as build-time done-criteria) appears to have held** — this is a data point that the prior retrospective's lever was real, not just plausible.

### 3. `pattern-reuse-scout` + frozen specs caught spec-vs-precedent errors early
The frozen per-card specs were occasionally written against the *wrong* base precedent (Nimrod recruit-gate, Madelyne demon-goblin routing, Build-an-Army counter). The reuse scout and the diagnose-first step surfaced these before they became shipped bugs. Rule 9 (reuse-first survey) earned its place.

### 4. Rules ambiguity resolved to the rulebook before implementation
Where Revelations threw away build+verify cycles to late rules churn (the Locations-vs-Villains flip-flop), SWV1's ambiguous calls went to `rules-oracle` and were cached as settled ledger entries *before* coding: Q4a (Dark Alliance lone-Tactic defeat = correct, Core p.14), Q7 (Madelyne demon-goblin routing, Core p.16), Q8 (cancelled-converter defeat→VP, Core p.13). Rule 8 front-loaded into analyze-phase prevented the rework.

---

## The residual gaps — what still leaked, ranked

### 1. Static audit doesn't RUN abilities — the only true SWV1-effect bugs slipped here
Magik "Dimensional Portal" and Old Man Logan "Loner" both passed `hero-card-auditor` (text matched code structurally) but were behaviorally wrong, and surfaced only in playtest. The audit pipeline checks text-vs-code by inspection; it cannot observe that "+1 Attack per Sidekick" actually yields +0 at runtime.
- **Prevention hypothesis:** a dual-mode `/game-test` behavioral gate for every new hero ability as Phase-4 done-criteria — inject a state that exercises the ability, assert the observable effect (Attack delta, KO, draw count). Falsifiable: count behavioral bugs caught at this gate vs. leaked to playtest on the next build. This is the single highest-leverage add.

### 2. Base-engine debt surfaces unpredictably through reuse
Every reused base path is a chance to hit a latent base bug (B6/B8/B9/B11/B12/B16/B17 this build). These aren't SWV1's fault, but they cost SWV1 triage time and now form a scattered backlog.
- **Prevention hypothesis:** consolidate the deferred base-code-branch backlog (B6, B9, B11, the B8 `skrulled`/`gainScarletWitchAsHero` half, the B19 free-recruit-ability instances) into one batch and clear it on the inter-expansion fix pass — so the next expansion's reuse hits fewer landmines. (This is step 6 of the post-mortem.)

### 3. Mechanics-doc master↔branch drift caused the one real merge conflict
`/analyze-expansion` finalized scheme-scope on master while the branch carried a stale copy; the only hand-synthesis merge conflict was master's resolved 6-schemes/Open-Questions vs. the branch's Ghost-Racers henchmen content.
- **Prevention hypothesis:** add the mechanics doc to the shared-doc canonical-homes table in CLAUDE.md with an explicit canonical side, so it's edited on one side only (same discipline that already prevents `known-issues.md` drift). Cheap, structural. (This is process-learning #3, step 5.)

---

## Cross-cutting observations

- **Verification earned its keep — and that's the quality/token trade-off in one sentence.** The two confident-call saves (§"What worked" #1) were caught by the `/check` grounding pass and cold-subagent verification — exactly the independence that costs tokens. When step 3 weighs token optimizations, *these passes are the thing to protect*; the savings must come from elsewhere (read orchestration, tool-result dumps, redundant context loads), not from cutting independent verification.
- **The audit's MEDIUM count partly overlaps known-issues, not independent findings.** audit M2 → B8 and M4 → B10; audit H2 = B18 = the same Golden hero-count design Q (one issue, three surfaces). So "16 findings" overstates independent defect discovery — several are the same root cause seen from multiple angles, which is itself a sign the pipeline is cross-checking well.
- **No mode-divergence bugs again.** As with Revelations, golden-vs-whatif divergence produced ~0 confirmed bugs. The dual-mode gate stays a light reminder, not a heavy structural investment — consistent with the prior retrospective's calibration.

---

## How this maps to the improvement road

| What we learned | Owning track | Status |
|---|---|---|
| Static audit can't catch behavioral effect bugs (Magik/OML) | `/improve-skill` on `/new-expansion`: dual-mode `/game-test` behavioral gate as Phase-4 done-criteria | **Implemented 2026-06-29** — Phase-4d gate added (runtime test every hero ability; dual-mode when conditional/per-X/mode-divergent). Efficacy still a hypothesis: validate by counting behavioral bugs caught at the gate vs. leaked to playtest on the next build |
| Two-session split reduced bugs (independent perspective) | Keep `cc-coordinate` as default for engine-touching expansions; optimize its *token* cost without cutting independence | Sustain (token analysis = step 3) |
| Audit-as-built-in-gate held (consistent with Revelations hypothesis #1, not a controlled proof) | Already wired into `/new-expansion` Phase 3/4 | Sustain — result consistent with the hypothesis; confounded by the split, so not isolated |
| Reuse hits latent base bugs | Consolidate base-code-branch backlog, clear inter-expansion | Step 6 |
| Mechanics-doc master↔branch drift | Add to shared-doc canonical-homes table in CLAUDE.md | Step 5 (folder-discipline note) |
| `/sandbox-review` doesn't fit multi-file code-diff review | `/improve-skill`: document the code-diff-review pattern or split the skill | **Implemented 2026-06-29** — added a "Scope — single-document artifacts only" section + description clarifier steering multi-file code-diff review to cold-read subagents per focus area (chose the scope-note option over splitting the skill) |
| Rules-first + reuse-scout prevented churn | Rules 8 + 9 sustained | Sustain — confirmed working |
| Mode divergence ~0 bugs (again) | Light reminder only | Demote — consistent across two builds |
