# Secret Wars Vol. 1 — Pre-Merge Audit Catalog

**Date:** 2026-06-26
**Branch:** `secret-wars-vol1` @ `2609415`
**Scope:** Full expansion — 6 schemes + 14 heroes + 24 city villains + 3 henchmen + 2 masterminds + bystanders/sidekicks + the Multiple-Masterminds keystone.
**Skill:** `/expansion-audit` (engine-integration-auditor → expansion-validator → 6 card-type auditors + keyword-consistency-auditor).

> Static analysis only. Nothing fixed. This is the triage input. Items needing a live check are tagged **→ /game-test**.

---

## Summary

| Severity | Count (deduped) |
|----------|-----------------|
| HIGH     | 2 |
| MEDIUM   | 5 |
| LOW      | 9 |

**Auditor run status — all 9 PASSED, none errored/timed out:**

| Auditor | Result |
|---------|--------|
| engine-integration-auditor | 3 gaps (E-7 L, E-8 H, E-9 M) + 5 new touchpoints appended + 2 pre-existing non-SWV1 notes |
| expansion-validator | 0 issues (all 7 Golden Solo rules pass) |
| hero-card-auditor | 7 (0H 1M 6L) |
| villain-card-auditor | 4 (0H 1M 3L) |
| henchmen-card-auditor | 1 (1H) — E-8 surface |
| mastermind-card-auditor | 2 (2L) — both E-7 |
| scheme-card-auditor | 4 (2H 1M 1L) |
| misc-card-auditor | 4 (1M 3L) |
| keyword-consistency-auditor | 3 (3L, all latent) |

Raw counts sum higher than the deduped table because **E-8, E-9, and E-7 each surfaced through multiple auditors** — consolidated below to one entry per root cause with all trigger surfaces listed.

---

## HIGH severity

### H1 — Pan-Dimensional Plague: `hqWound[]` misaligns on Golden HQ rotation/refill  `RELATED: E-8`
**Surfaced by:** engine, scheme, henchmen (M.O.D.O.K.s trigger), misc (cross-ref).
**Where:** `script.js:5323` (`goldenRefillHQ` splice+push), `script.js:5350` (`goldenHQRotate` shift+push), `script.js:935` (`hqWound[]`), `script.js:19068` (recruit gate reads `hqWound[hqIndex-1]`); writer `expansionSecretWarsVol1.js:2988` (`panDimensionalPlagueTwist`), `:3028` (`resolvePlagueWoundOnRecruit`).
**Problem:** `hqWound[]` is keyed by HQ **slot index**. Golden Solo HQ rotation (start of round) and mid-turn refill (after a recruit) slide heroes between slots **without** re-shifting `hqWound[]`. The Wound stays glued to the old slot, so the pay-1-Recruit gate fires against the wrong hero (or skips the one that has a Wound). Per-Twist re-seed (KO all + replace) masks it *between* Twists, not *within* a round. **Golden Solo is the dominant mode.** M.O.D.O.K.s' HQ-KO is a second live trigger (its `refillHQSlot` shifts the HQ). What If? fill-in-place refill is unaffected.
**Note:** The frozen spec (rules-notes BATCH 8 ②) *ratified* slot-keying as a low-bookkeeping approximation that re-seeds each Twist. So this is a **spec-vs-engine adjudication**, not a clear code defect — triage decision: does the in-round misalignment matter enough to re-key the Wound to the hero card object, or is the ratified per-Twist re-seed acceptable? **→ /game-test** to see the in-round misalignment concretely (Golden: place a Plague Wound, recruit a hero to its left, observe the Wound now sits on the wrong hero).

### H2 — `getEffectiveHeroCount` returns 5 (not 3) in Golden for all six SWV1 schemes  `RELATED: B18 — DESIGN Q, FLAG-DON'T-FIX`
**Surfaced by:** scheme.
**Where:** `script.js:820-824` + `:810` (`WHATIF_DEFAULT_HEROES = 3`); DB `cardDatabase.js:790,805,832,847,869,891` (all 6 schemes `requiredHeroes:3`).
**Problem:** `return (scheme.requiredHeroes === WHATIF_DEFAULT_HEROES) ? defaultCount : scheme.requiredHeroes;` — a deliberate `requiredHeroes:3` is indistinguishable from the "unset/default" sentinel (also 3), so Golden mode overrides it to 5. Golden games set up 5 heroes instead of 3. What If? returns 3 correctly.
**Triage:** This is the **B18 residual** the coordinator already flagged — a gameplay decision for Paul (do SWV1 schemes want 3 heroes in Golden, or 5?), NOT a blind code fix. Both randomize **and** validation read this same function, so they agree → game starts cleanly either way (no blocker). The reported B18 ("randomize 6 vs validation 3, can't start in What If?") is **not reproducible** on this HEAD — resolved by the unified `getEffectiveHeroCount`/`_gameMode` plumbing. Audit records the behavior; fix is gated on Paul's ruling.

---

## MEDIUM severity

### M1 — Inferno Colossus / Inferno Cyclops: captured Bystanders bypass Madelyne's Demon-Goblin store
**Surfaced by:** villain. **Severity elevated for triage attention** — Madelyne *Always Leads Limbo*, so this is the expansion's **default pairing**, hit in normal play.
**Where:** `expansionSecretWarsVol1.js:1869` (`infernoColossusAmbush`), `:1913` (`infernoCyclopsEscape`).
**Problem:** "The Mastermind captures a Bystander" routes to the generic `mastermind.bystanders` store even when the Mastermind is Madelyne Pryor — whose captured Bystanders are supposed to become fightable **Demon Goblins** (`demonGoblinDeck`). So under the default Madelyne+Limbo lead, these bystanders never become Demon Goblins, never lock her, and are rescued on her defeat instead of being separately fightable.
**Triage:** rules-interpretation call — should Limbo "the Mastermind captures" feed `demonGoblinDeck` when the lead is Madelyne? Candidate for `rules-oracle`/Paul. **→ /game-test** to confirm the routing in a live Madelyne+Limbo game.

### M2 — Untouchable cancel silently deletes gain-as-Hero / gain-corrupted-Sidekick converter cards
**Surfaced by:** misc.
**Where:** `expansionSecretWarsVol1.js:1377` (`offerUntouchableCancel`); hook `script.js:13462-13467`; VP-skip `script.js:13869, 14297, 14630`.
**Problem:** Untouchable's reactive cancel runs *before* the Fight effect. For converter cards (`gainVillainAsHero` — Manhattan villains, Thor Corps; `gainCorruptedSidekick` — corrupt Sidekicks), cancelling skips the converter — but the VP-push is *also* skipped (because `gainAsHero`/`skrulled` is true). Net: the defeated card vanishes — no Hero gained, no Sidekick to deck top, **and no VP**. Untouchable's design assumes a harmful Fight effect cancelled while the Villain is still scored; converter cards have no VP to fall back on.
**Triage:** real cross-card interaction the spec's Untouchable block didn't anticipate. **→ /game-test** (defeat a Manhattan villain, cancel via Untouchable, confirm the card disappears with no gain and no VP).

### M3 — Build an Army: Annihilation-Henchman fight ignores Negative Zone (Recruit-as-Attack)
**Surfaced by:** scheme.
**Where:** `expansionSecretWarsVol1.js:3278-3284` (affordability), `:3288-3297` (spend), `:3318-3320` (prompt).
**Problem:** The badge-fight computes `available = totalAttackPoints + (recruitUsedToAttack ? totalRecruitPoints : 0)` with no `negativeZoneAttackAndRecruit` branch (a live engine mechanic, 42 refs). A player whose Attack is supplied via Negative Zone is wrongly told they can't afford the 3-Attack fight, and the spend path never deducts from Recruit under Negative Zone. The same author's Fight the Future hero fight *does* handle Negative Zone (`:947-949`) — this off-grid paid fight should match.
**Triage:** likely a real omission; fix is to mirror Fight the Future's Negative-Zone handling. **→ /game-test** under a Negative-Zone-granting state.

### M4 — `recalculateVillainAttack` off-grid → `cityPermBuff[-1]` undefined → NaN attack/fight-cost  `RELATED: E-9`
**Surfaced by:** engine, hero (Fight the Future, guarded), villain (guarded).
**Where:** `script.js:10635` / `:10674` (`updateVillainAttackValues` Portals branch reads `cityPermBuff[i]` with `i = -1`); consumed `expansionSecretWarsVol1.js:940`.
**Problem:** For a card not in `city[]` (`cityIndex = -1`), under the "Portals to the Dark Dimension" scheme `undefined !== 0` sets `attackFromScheme = undefined` → NaN effective Attack → NaN fight cost. **Masked today:** the only in-scope off-grid caller (Dr. Strange — Fight the Future) guards locally (`:941`, falls back to `topCard.attack`). The base-engine hazard remains for any future off-grid caller.
**Triage:** engine root cause, currently no live failure (sole caller guarded). Fix direction: skip `cityPermBuff[i]` when `i < 0` (or guard the Portals branch on `cityIndex >= 0`). Defer-candidate unless cheap.

### M5 — Black Bolt "Silence is Golden": re-grants base Attack/Recruit fields, not the card's icon payout
**Surfaced by:** hero.
**Where:** `expansionSecretWarsVol1.js:237-242`.
**Problem:** "You get its Recruit and Attack again" re-grants `chosen.attack`/`chosen.recruit` (printed base fields) rather than re-firing the card's icon payout. Correct for the in-scope fixed-value no-text targets (Speak No Words 1/2, Inspiration Through Power 1/1, vanilla S.H.I.E.L.D.), so **impact is bounded** — but a no-text card whose value came from a `0+`/variable base or a bonus would be mis-valued.
**Triage:** bounded today; confirm no in-scope target is variable-valued, else low-priority.

---

## LOW severity

### L1 — Black Bolt no-rules-text predicate counts Wounds
`expansionSecretWarsVol1.js:183-193`. A Wound (`type:"Wound"`, no ability/keyword/bonus) passes `cardHasNoRulesText`, so it can satisfy "four cards with no rules text" (Destructive Whisper) or feed Hypersonic Scream. Arguably a Wound *has* rules text. Edge case.

### L2 — Apocalyptic Kitty Pryde "Disrupt Circuits" counts Tech without `type === "Hero"` guard
`expansionSecretWarsVol1.js:274-276`. Counts any HQ card whose `classes` includes "Tech"; HQ normally holds only Heroes, but a scheme that places Villains in HQ could inflate the count. Low likelihood in solo SWV1.

### L3 — Dr. Strange "Fight the Future": Option-A at-resolution window (ratified narrowing)
`expansionSecretWarsVol1.js:894-1035`. Implements at-resolution fight popup rather than the literal "may fight this turn" deferred window. **Coordinator-ratified** (spec BUILD NOTE L240). Recorded so the blind-compare logs it as intended, not a deviation. No action.

### L4 — Namor/Thanos `freeDefeatMastermind`: interim Golden-interaction read
`expansionSecretWarsVol1.js:1593-1617`. Models the 4 Tactics as the 4 defeats; removes one Tactic per free defeat; no-op if none remain. Flagged interim in-code. **→ /game-test (both modes)** — both are LOW-confidence spec cards needing the dual-mode gate.

### L5 — Inferno Colossus/Cyclops: "the Mastermind" has no multi-mastermind picker  `RELATED: E-7`
`expansionSecretWarsVol1.js:1878, 1921`. Hardcodes the main mastermind via `getSelectedMastermind()`; with a secondary mastermind active no "which Mastermind" picker is offered. Documented deferral in-code.

### L6 — Inferno Cyclops: single carry-away discard vs per-bystander (ratified approximation)
`script.js:6396`. `handleVillainEscapeActions` discards once per escape, not once per carried Bystander. Spec (`:577`) explicitly accepts the single default-path discard. No action.

### L7 — Corrupt Twist-8 escape: no carry-away Bystander discard penalty
`expansionSecretWarsVol1.js:3134-3164`. The manual Twist-8 escape pushes captured Bystanders to `escapedVillainsDeck` (per fix `ab663a6`) but does not call `handleVillainEscapeActions`/`showDiscardCardPopup`, so no discard penalty. Low real-world impact — no in-scope effect attaches Bystanders to a city Sidekick-Villain.

### L8 — Corrupt Sidekick overflow escape via city cascade → `skrulled→Hero` type flip
`script.js:6349`; `expansionSecretWarsVol1.js:3112-3126`. If a corrupt Sidekick-Villain escapes via the *normal* overflow path (Twist 1-7 pushing 2 more in when city is full), `handleVillainEscape` flips `skrulled` cards to `type:"Hero"`. The 4-escape loss counter filters on `corruptSidekick` (preserved, still works), but the card sits in `escapedVillainsDeck` as `type:"Hero"` and could misbehave in any generic escaped-*villain* stat filtering on `type === "Villain"`.

### L9 — Mastermind Demon-Goblin lock not parameterized for secondaries (E-7 cluster)
`script.js:15924-15927` (`isMastermindDemonGoblinLocked()` no param), `:17285` (`addSecondaryMastermind` copies `unfightableUnlessRecruit` but not `unfightableWhileDemonGoblins`), `:17354/:17399` (secondary fight path checks only recruit-lock). A Madelyne-as-secondary would be fightable with goblins live. **Latent** — Madelyne is not in `darkAllianceEligible`, can't ascend; Demon Goblins are global. Also surfaced by mastermind (2×) and keyword auditors as the same E-7 asymmetry. `RELATED: E-7`

> Additional LOW (keyword auditor, latent forward-compat): **gainAsHero + Burrow keyword** burrow-branches (`script.js:13840/13857/14286/14602/14619`) push to victoryPile unconditionally (no `gainAsHero` check) — no in-scope card combines both. **Secondary master-strike silent-skip** (`script.js:6030-6031`) — fires only secondaries that have a `masterStrike` fn; in-scope consumers all set one. **updateEvilWinsTracker** reads scheme from the setup DOM radio not the live scheme (`script.js:11221-11226`) — no in-scope SWV1 scheme transforms, so no live impact. `RELATED: E-1, E-7`

---

## Could not be audited

None. Every in-scope card resolved to a function + DB entry; all `unconditionalAbility`/`conditionalAbility` names matched exactly; all engine touchpoints located in `script.js`. Out-of-scope-by-spec sets (Deadlands zombies, Wasteland, Ambitions, Fragmented Realities, Smash Two Dimensions, Ghost Racers Ambush) were correctly absent.

---

## Engine touchpoints discovered this run (appended to `docs/audit-pipeline/engine-touchpoints.md`)

1. **Multiple-Masterminds keystone** — `secondaryMasterminds[]` (ascend/add + win-check + strike fan-out + fight + rescue). Carries E-7.
2. **Sentinel deferred attack-delta** — `sentinelVillainAttackDelta` (read in both attack twins + MM recompute). Clean.
3. **Plague HQ-adjacent Wounds** — `hqWound[]`, slot-keyed. Carries E-8.
4. **Build-an-Army annihilation army** — `annihilationHenchmenNextToMM` etc. Clean.
5. **`recalculateVillainAttack()` off-grid usage** — `script.js:12780`. Carries E-9.

---

## Pre-existing (non-SWV1) base bugs — REPORT ONLY, not regressions

- **`escapedVillainsDeck` / `escapedVillainsCount` never reset in `initGame`** (only at declaration, `script.js:792/825`). A second game in the same page session without reload retains escaped state — would inflate the new flag-filtered end-game checks (Corrupt 4 / Tyrants 5). Engine-wide, predates this expansion.
- **`refillHQSlot` What If? branch references `showHeroDeckEmptyPopup`**, a function never defined (`script.js:5254/5338-5342`). Already `typeof`-guarded by the worker; throws only on an unguarded path. Latent base bug.

---

## Suggested triage order

1. **H1 (Plague hqWound)** — adjudicate ratified-slot-keying vs re-key-to-hero; /game-test the in-round misalignment.
2. **H2 (B18 Golden hero count)** — Paul's gameplay ruling (3 vs 5 in Golden).
3. **M1 (Madelyne+Limbo demon-goblin)** — rules ruling (default pairing, hit in normal play).
4. **M2 (Untouchable deletes converters)** — real interaction bug, likely Fix Now.
5. **M3 (Annihilation Negative-Zone)** — mirror Fight the Future, likely Fix Now.
6. **M4 (E-9 NaN)** — cheap engine guard or Defer (sole caller guarded).
7. **M5 + LOWs** — confirm bounded / ratified, mostly Defer or Reject.
