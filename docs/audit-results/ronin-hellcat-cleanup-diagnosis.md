# Revelations — "Unimplemented-Ability Cleanup" Sweep (DIAGNOSE-ONLY)

> **RESOLUTION (2026-06-03):** Group B tidy DONE (commit `9ee4f80`). A1 (`theDarkDimensionFight`)
> confirmed OUT OF SCOPE — honest "extra turns not supported in this version" log added (commit
> `58380e9`); the GotG Time Gem general-case extra turn is the same unimplemented stub (consistent gap).
> A2 (`hellcatDemonSightSuper`) BUILT (option 1, simplified resolve-now) + fully gated (commit `58380e9`):
> validator 7/7, cold-read merge-ready, dual-mode `/game-test` (accept golden+whatif, can't-afford,
> decline) all pass. A2 accepted simplification (resolve-now timing + plain-pool spend) flagged for the
> coordinator-side `open-rules-questions.md`. Deliberate deferrals below remain deferred.

**Date:** 2026-06-03. **Scope:** exhaustive body-level read of all 183 function declarations in
`expansionRevelations.js`, cross-referenced against `docs/card-inventory/final/revelations.md` and the
audit catalog `docs/audit-results/revelations-2026-05-28.md`. **No code changed.** Independently
spot-verified by the worker (theDarkDimensionFight, hellcatDemonSightSuper, roninMysteriousIdentity).

## Headline

The expansion is **far more complete than the prior "Ronin/Hellcat cleanup" flag implied.** Of the
known flagged members, **Ronin is fully implemented and Hellcat's base is fully implemented** — those
flags are STALE. Genuinely incomplete mechanical work is **one function**; everything else is either a
deliberately-deferred each-other-player effect (per standing ruling) or dead code / stale comments.

- **Functions scanned:** 183 (full body read). **Fully implemented:** ~177.
- **Genuinely unimplemented (not a deliberate deferral):** **1** — `theDarkDimensionFight`.

## Confirmation of the flagged "known members"

- **Ronin "Mysterious Identity"** (`roninMysteriousIdentity`, 1555) — ✅ **FULLY IMPLEMENTED.** Presents
  real class/color + team choices, mutates `card.classes`/`card.color`/`card.team` on the live played
  object (so later cards' team/class counting sees it), stashes `_orig*` for end-of-turn revert. Flag stale.
- **Ronin one-liners** (1615–1634: `roninStormOfArrows`→`hyperspeed(4)`, `…Super`→`drawCard()`,
  `roninHauntedByLoss`/`roninBroodingFury`/`…Super`→`applyDarkMemories()`) — ✅ ALL FULLY IMPLEMENTED.
- **Hellcat "Demon Sight" base** (`hellcatDemonSight`, 1136) — ✅ FULLY IMPLEMENTED (guess→reveal→+2 Attack).
- **Hellcat "Demon Sight" superpower** (`hellcatDemonSightSuper`, 1186) — ❌ **LOG-ONLY.** Reads top of
  villain deck; if Villain/Location, only logs "can be fought this turn." Sets NO fightable state. Card
  text: "If it was a Villain, you may fight it this turn." No engine hook exists to fight a card still
  in the villain deck.
- **"Dark Dimension — Take another turn"** = `theDarkDimensionFight` (3107) — ❌ **LOG-ONLY STUB.** Logs
  "Take another turn after this one!" + comment "to be fully wired when extra-turn mechanism is
  implemented." No flag set, no turn granted. Grep confirms NO extra-turn primitive anywhere in `script.js`.

## Genuinely incomplete items + build briefs

### A1. `theDarkDimensionFight` (3107) — "Take another turn" [HARD / likely OUT OF SCOPE]
- **Reuse verdict:** NONE. No extra-turn primitive in the engine (verified). From-scratch engine feature.
- **Dual-mode:** both modes need it; Golden Solo's turn loop (draw 6 → HQ rotate → villain draws → play 6)
  makes "another turn" a full loop-repeat — needs DESIGN before code.
- **Status note:** the catalog already lists extra-turn as OUT OF SCOPE (`revelations-2026-05-28.md` ~line 484).
  Recommend: confirm OUT-OF-SCOPE for the merge; leave the stub + a clear "not implemented (no engine
  support)" log line so the player isn't misled into thinking they got a turn.

### A2. `hellcatDemonSightSuper` (1186) — fight a deck-revealed Villain [MEDIUM, optional ability]
- **Reuse verdict:** weak. Closest analog is `mandarinRingNightbringer` (4052) which *defeats* a revealed
  Villain by popping it from the deck → victoryPile + dispatching its fightEffect. But Demon Sight says
  "you **may fight** it" (pay attack), not defeat-for-free — a real fight-with-cost against a non-city
  card, which the engine has no path for. Building it = new capability, not a wiring job.
- **Dual-mode:** no `gameMode` divergence expected.
- **Status note:** it's an optional ("may") superpower with no win/loss stakes. Cheapest honest fix:
  make the log accurate ("revealed Villain — fightable-from-deck not supported in solo") OR build the
  capability. Recommend a ruling: leave-as-informational vs build.

### B. Cheap deferral/dead-code/comment tidy [LOW, safe]
- **`announceOtherPlayerLocationTrigger` (4231)** — DEAD CODE. Never called (all 10 Location triggers were
  converted to true self-apply). Safe to delete.
- **`darkHawkeyeFight` (2395)** — self part ("KO one of YOUR Heroes") is correct; the "Then choose one:
  each other player…" branch is **silently dropped** (no log). Deferral is correct per standing ruling;
  only gap is the missing skip-log. Add one line for consistency.
- **`darkMsMarvelFight` (2401)** — entire effect is each-other-player → correctly a deferred no-op (logs
  the skip). No change unless the each-other-player review reopens.
- **Stale comment at `sentrysWatchtowerFight` (2469–2472)** — says the "Villains here get Last Stand"
  grant is "NOT YET IMPLEMENTED," but it WAS done in Cluster D Batch 4 (`revelationsVillainOwnAttack`
  178–190). Remove the misleading comment.

## Deliberate deferrals (NOT cleanup targets — confirm before touching)
- `mandarinRingsSeekTheirTrueHand` (4086) — each-other-player; routed to the each-other-player review
  (catalog line 166), NOT the auto-pick batch.
- `theHoodDemonicRevelation` (4158) — deferred non-Location Tactic (auto-picks first Hero); catalog report-only.
- `mbakuFight`/`mbakuEscape` (3137/3151) — auto-discard first Tech; functionally correct, no picker.

## Flags for human spot-check
1. The Location `*Fight()` one-liners (`carnivalOfWonders/laserMaze/raftPrison/whiteGorillaCult`, 3115–3229)
   only log "defeated" — that is CORRECT: the "whenever you fight a Villain here" effect lives in the
   separate `*Trigger` functions fired by the engine; these Locations have no on-self-defeat effect.
2. Confirm the non-Location each-other-player effects (darkHawkeye/darkMsMarvel) STAY deferred (per the
   standing ruling) before any "cleanup" — the naive fix (self-apply) would contradict that decision.

## Suggested grouping for any approved build
- **Group B (trivial, ~1 commit):** delete dead `announceOtherPlayerLocationTrigger`, add darkHawkeye
  skip-log, remove the stale sentrysWatchtower comment. Pure tidy, no mechanics, low risk.
- **Group A (rulings needed, NOT trivial):** A1 (extra-turn) likely stays OUT OF SCOPE; A2 (Hellcat super)
  is build-or-leave-informational — both need a coordinator/Paul ruling before any code.
