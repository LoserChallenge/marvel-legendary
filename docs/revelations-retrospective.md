# Revelations Build Retrospective — What Drove the Bug Volume

**Date:** 2026-06-20 (post-merge). **Purpose:** make the *next* expansion build smoother by attacking the structural causes of Revelations' bug volume — not by adding more reminders.

**Method:** three independent subagents mined the evidence (audit catalog `docs/audit-results/revelations-2026-05-28.md` + diagnosis docs; playtest logs `docs/playtest-*`; Playwright runs + `docs/merge-reconciliation-checklist.md`). Their findings converged. This doc is the synthesis. Recommendations are tagged as **hypotheses to test**, not proven fixes — verify efficacy on the next expansion via independent review, not self-assessment.

---

## The headline

**The audit pipeline already catches most of what drove the volume — but no card-text-vs-behavior gate existed at the point the effects were written.** Phase 3 (Effects) was marked "✅ Complete" but a large fraction of those effects were stubs, wrong-field no-ops, or auto-pick shortcuts. The bugs were present at "Phase 3 complete" and nothing checked card-text-against-code at that moment — the `/expansion-audit` tool that catches exactly this was *built later* and surfaced ~8 game-breaking root-cause clusters as soon as it first ran. (NB: the calendar gap between "effects done" and "first audit" was just project inactivity — Paul working on other things — NOT code rot or a process delay. Don't draw any conclusion from the timeline length; the point is purely that the check wasn't part of effect-writing.)

**Single highest-leverage change:** make the card-type auditors part of the *effect-writing step itself* (Phase 3 done-criteria), not a separate pre-merge-only gate. Same tool, wired into the build instead of bolted on after. Everything else below is secondary.

**Important calibration finding:** mode-divergence (golden vs. whatif) — the most heavily-gated risk and the focus of the handoff's "dual-mode" track — produced **~0 confirmed bugs this build**. The 06-15 results explicitly note every fix was mode-agnostic in code. Don't over-invest structural effort guarding a risk that didn't materialize; a light footer/reminder is proportionate.

---

## Root-cause buckets, ranked by volume × leverage

### 1. Stubs declared "complete" + no text-vs-behavior gate at effect-write time — DOMINANT
Card directives ("set up X," "counts as Y," keyword grants, "choose…") where the function existed but the body did nothing, targeted the wrong path, or had no engine path at all. The biggest single contributor.
- Examples: whole Location-trigger system dead (field-name mismatch `locationTrigger` vs `triggeredAbility` + functions never defined); all keyword attack-scaling unwired on the villain/mastermind side; 5 hero superpowers gated on `conditionType:"None"` (no case → always false); House of M / HYDRA / Korvac setup directives never coded; 8 hero abilities log-only stubs.
- **Why it slipped:** "Phase 3 ✅ Complete" allowed stub bodies, and no card-text-vs-code check was part of the effect-writing step. The gate that catches this (`/expansion-audit` card-type auditors) was built later and run as a separate pass — so the stubs sat uncaught until it ran.
- **Prevention hypothesis:** (a) run `/expansion-audit` (or at minimum the 6 card-type auditors) as the Phase 3 done-criteria, not pre-merge-only; (b) "no-stub" definition-of-done — a Phase 3 item can't be checked ✅ while its body is only `onscreenConsole.log`/TODO/empty; consider a mechanical grep for stub bodies.

### 2. Silent failures swallowed to the dev console — HIGHEST LEVERAGE PER FIX
Errors caught-and-discarded or thrown where no on-screen signal appears; static checks pass, defect hides until live play.
- Examples: `transformScheme()` threw `ReferenceError` on its first line and stayed broken for weeks (try/catch → `console.error` only); `processVillainCard` silent catches; R2-1 throw inside an uncatchable `setTimeout` softlocked the game; R2-2 silent catch swallowed a re-entrant twist error.
- **Prevention hypothesis:** in the game-test/dev build, surface caught effect-dispatch errors to `onscreenConsole` (or a visible banner), not just `console.error`. Pair with the existing rule "check F12 console for errors when verifying." Falsifiable: count silent-catch sites in dispatch paths before/after.

### 3. Wrong field / wrong global name — passes `node --check`, fails at runtime
- Examples: `bystanderStack` (real `bystanderDeck`) and `escapePile` (real `escapedVillainsDeck`) → ReferenceErrors; `card.attack` written instead of the `attackFrom*` pipeline (invisible); `justAddedToDiscard` read but never populated → always 0.
- **Prevention hypothesis:** `engine-integration-auditor` + the `engine-touchpoints.md` registry catch state-written-here/read-there — run them earlier (with #1). A cheap grep for known-global typos is a low-cost backstop.

### 4. Auto-pick instead of presenting a player choice
The engine collapsed a decision the card text explicitly offers ("choose," "may," "which").
- Examples: Korvac twist auto-KO'd `[0]`; Speed picker showed 3 buttons not 5 class tiles; Hellcat Part-Time PI hardcoded the villain deck; the whole auto-pick batch.
- **Prevention hypothesis:** card-type auditors already flag "text says choose, code auto-resolves" — caught earlier with #1. Optionally flag at inventory time: any effect text containing choose/may/which marks a required choice-popup.

### 5. Reuse-vs-reinvent churn (the picker family) — caused a 3-round cascade
There was no canonical "return/reorder N cards top/bottom/any-order" picker, so Speed/Hood/Scarlet Witch each reinvented one. The fixes chained: R2-9's reused helper was TOP-ONLY (dropped a printed BOTTOM option → regression); R2-12 needed the hero deck but the helper hardcoded `playerDeck`; R2-13 was a softlock from stacked drag-listeners in that same reused picker. One missing primitive → three rounds of bugs.
- **Prevention hypothesis:** Rule 9 (`pattern-reuse-scout` at diagnose) now exists. Beyond that: when a mechanic family recurs, build one canonical, tested primitive up front instead of per-card. Flag the specific missing primitives during `/analyze-expansion`.

### 6. Newer "Location" card type lacked per-type coverage
Location is a new type; several engine code paths that special-case card type were never threaded through it.
- Examples: per-type popup dispatch had no Location case (PT-1); `defeatLocation` didn't call `defeatBonuses()` (R2-3) or wrap negate (GP-6b); transform-tactic → Location double-scored (PT-8) and negate erased it (M1); affordability path diverged (PT-6/7).
- **Prevention hypothesis:** a "new-card-type integration checklist" enumerating every engine site that branches on card type (popup dispatch, negate wrapper, affordability, attack overlay, defeat bonuses, `createVillainCopy` whitelist). Any new type must be threaded through all of them.

### 7. Rules-interpretation churn (Locations-vs-Villains) — net-zero rework
Whether a HYDRA Base / Carnival / Location counts as a "Villain" for defeat triggers flipped three times: NO → YES (fix landed and verified live, `a061c94`) → reverted to NO. GP-3's "each-other-player" Locations shipped as announce-and-skip, then reversed by the rulebook solo rule. Full build+verify cycles thrown away because the ruling settled late.
- **Prevention hypothesis:** resolve ambiguous interactions *before* implementation, during `/analyze-expansion`, and cache each in `docs/rules-notes/` as a settled ledger. Rule 8 (consult rules PDF / `rules-oracle` first) postdates this churn — front-loading it into analyze-phase is the structural form.

### 8. State-lifecycle softlocks — only manual play caught these
Shared popup modal, global chain flags, and stacked DOM listeners reused across invocations without reset (R2-1 empty-pile, R2-2 re-entrant twist, R2-13 picker 2nd-use). All game-breaking; all invisible to static audit and to auto-pick Playwright.
- **Prevention hypothesis:** hardest to gate statically — be honest about that. The lever is a targeted edge-sequence manual playtest checklist (pickers used a 2nd time, empty-pile/empty-deck edges, twist-after-twist chains). Don't claim a static gate will catch these.

---

## Cross-cutting amplifiers

- **Test-harness tax.** A standing per-run freshness ritual (Chromium served stale `cardAbilities.js`/`expansionRevelations.js` even on fresh ports/processes → verify markers + monkey-patch every run). This *directly spawned* the R2-10 false alarm (a full deferred-draw investigation on cached code). Auto-pick Playwright also gave false confidence (R2-13 slipped because the live UI loop was never human-driven). → the `/game-test` hardening track (for-later 2026-06-18) targets exactly this.
- **False alarms ate triage time.** ~5–6 reported "bugs" were working-as-designed, no-repro, or stale-cache (Obs 5/14/16, R2-4, R2-5, R2-10). Cheapest-cause-first triage (rule out stale cache / wrong build before deep-diving) is the lever.
- **Merge reconciliation friction.** Untracked-but-authoritative `docs/rules-notes/` on master vs. tracked stubs on the branch (worktrees don't see master's untracked files) nearly caused a silent overwrite; CLAUDE.md drift; leaked screenshot cruft. → the generalize-the-merge-runbook track.

---

## How this maps to the improvement road

| Driver | Owning track | Priority shift vs. handoff |
|---|---|---|
| #1 stubs + audit-timing | `/improve-skill` on `/new-expansion`: move card-type auditors to Phase 3 done-criteria | **Promote to #1** — biggest lever, was not the handoff's lead |
| #2 silent failures | `/improve-skill` on `/game-test`: surface caught errors on-screen | New, high-leverage |
| #5 reuse churn | Already Rule 9; flag missing primitives in `/analyze-expansion` | Sustain |
| #6 new card type | New "card-type integration checklist" doc | New |
| #7 rules churn | Front-load rulings ledger into `/analyze-expansion` | Sustain Rule 8 |
| #8 lifecycle softlocks | Edge-sequence manual playtest checklist | New, honest-limits |
| harness tax | `/game-test` hardening (for-later 2026-06-18) | Confirmed real |
| dual-mode (golden/whatif) | light footer/reminder only | **Demote** — ~0 confirmed bugs this build |
