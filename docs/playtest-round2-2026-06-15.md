# Revelations — Playtest Round 2 (Paul hands-on, 2026-06-15)

Second hands-on playtest after Round-1 fixes (Batches A–E). **Merge is PAUSED** pending this round. Source notes: Paul's `ml-notes.md`. Coordinator triage + subagent diagnoses below. Worker fixes on the `revelations` branch unless noted; same per-fix gate (validator if expansion file touched + fresh-subagent cold-read + single-mode smoke); consolidated dual-mode `/game-test` after all land.

Setups played: (1) Korvac Saga / Mandarin / Dark Avengers / Mandarin's Rings; (2) House of M / Grim Reaper / Army of Evil + Lethal Legion / HYDRA Base / 4 X-Men + Captain Marvel AoS + Hellcat — replayed twice; (3) Earthquake Drains the Ocean (What If?) / The Hood / Army of Evil + Hood's Gang / HYDRA Base.

## Round-2 gate results + 2nd-pass fixes (coordinator independent review, 2026-06-15)

Worker landed 5 commits (f45a4eb..f66ab42); independent cold-read + expansion-validator (PASS 7/7) run from master.

- **ACCEPTED:** R2-1 (softlock — all 4 sub-points verified, reorder local, guard safe for ~30 callers), R2-8 (Obs 4 root cause; zeroes only the leaking own-effect, scheme attack cost+3/+4 untouched — Alter Reality 10→6 / Warp Time 10 / Hex Bolt 0), R2-2 (error-surfacing; worker correctly did NOT add speculative serialization — re-entrant symptom didn't reproduce), R2-6, R2-7. R2-9 **Hood** half (correct: Hood text = "in any order" = top free-order).
- **CONFIRMED no-bug (close):** R2-4 (Nefaria ambush fires on entry; sets no card state → cloning gotcha N/A), R2-5 (blackoutFight draws 2).
- **2nd-PASS FIXES NEEDED (worker, this round):**
  - **R2-9 Speed REGRESSION:** Speed "Break the Sound Barrier" card text = "put the rest back on the **top or bottom** in any order." The reused `chooseReturnOrderSingleRow` is TOP-ONLY, so it dropped the printed BOTTOM option the old `handleCardPlacement` had. Rework Speed to support BOTH top-ordering AND per-card bottom (Hood stays as-is — its card is top-only). Inventory ref: `expansions/Revelations/revelations-reference.md:301`.
- **2nd PASS ACCEPTED (independent cold-read SHIP, 2026-06-15):** R2-3 (0474e13 — `.location-card-peek:hover` z-index 10→1, below villain's 2; verified nothing else re-raises the peek, villain wins overlap, bare-Location still clickable) and R2-9 v2 (6744543 — Speed loop: `pickFromCardsSingleRow` free-order + `handleCardPlacement` TOP/BOTTOM per card; bottom option restored + ordering kept; Hood left top-only). **ALL Round-2 code work done + gated.** Remaining gate: Paul's hands-on re-playtest, then un-pause merge. (Minor non-blocker: stale comment at `cardAbilitiesSidekicks.js:904` still names Speed as a top-only-picker user — one-line sweep next time that file is edited.)

  - **R2-3 — CORRECTED 2026-06-15 (the z-index theory was a wrong premise; this is the REAL bug):** Paul confirmed he fought the HYDRA Base Location INTENTIONALLY (both times), not a mis-click — so the z-index/targeting fix (commit 0474e13) addressed a separate non-issue. The actual bug: **defeating HYDRA Base does not fire "whenever you defeat a Villain" triggers (War Machine "Military-Industrial Complex" +1 Recruit), but per the rules it SHOULD.** RULES (rules-oracle re-ruling, SETTLED — reverses the prior NO; cached in docs/rules-notes/revelations.md): HYDRA Base is a HENCHMAN (Attack value 2+, fought with Attack, → Victory Pile, 1 VP) that is merely displayed as a Location. Henchmen ARE Villains → defeating HYDRA Base is a Villain defeat → War Machine / Nightbringer / any "defeat a Villain" trigger MUST fire. The prior "Locations aren't Villains" carve-out applies only to generic Recruit-paid stronghold Locations, NOT to HYDRA Base. CODE CAUSE (confirmed from R2-1 + R2-3 prior investigations): HYDRA Base is fought via `defeatLocation` (script.js:12506), which never calls `defeatBonuses()` (`cardAbilities.js:39`, where War Machine fires) → trigger suppressed. FIX (worker): when a Henchman-Location (HYDRA Base) is DEFEATED, run the defeat-a-Villain bonus step so triggers fire, and ensure it lands in the Victory Pile as a Henchman defeat (1 VP). Generic non-Henchman Locations must STILL NOT fire those triggers (don't over-broaden). VERIFY: HYDRA Base is fought with Attack (correct, it's a Henchman) — confirm the build isn't charging Recruit via the Location path; and ensure the fix doesn't reintroduce the R2-1 koBonuses softlock (same fight path). Mode-agnostic; verify both. The earlier z-index change can stay (harmless) but was NOT Paul's issue.

## 🔴 P0 — game-breaking

### R2-1. HYDRA Base bare-Location fight → KO-a-hero popup softlock
- Symptom: fighting a HYDRA Base Location with NO villain on top → "KO a hero" popup never dismisses; each submit re-KOs + re-logs; game stuck. Hit in both Golden and What If?. Works fine WITH a villain on the Location (because koPile is non-empty by then).
- ROOT CAUSE (diagnosed, certain): this IS the documented `koBonuses()` empty-`koPile` crash. `FightKOHeroYouHave` (cardAbilities.js, ~8919 setTimeout) logs the KO (~8920-8922), calls `koBonuses()` (8923) BEFORE pushing to koPile (8941), then closes/resolves (~8944). `koBonuses()` (cardAbilities.js:14-16) reads `koPile[length-1]` → `undefined.team` → throws inside the setTimeout (uncatchable by `defeatLocation`'s try/catch) → push/close/resolve never run → popup re-fires.
- FIX: (a) guard `koBonuses()`: `if (kodCard && kodCard.team === "Infinity Gems")`; (b) reorder `FightKOHeroYouHave` to push to koPile BEFORE calling koBonuses (also fixes a latent Infinity-Gems wrong-card read). Grep ALL ~30 koBonuses callers for the same push-after ordering before reordering. Reproduce the empty-koPile crash first (fight a bare HYDRA Base as the turn's first KO). Verify both modes.
- ROUTING DECISION (coordinator): fix ON THE BRANCH now (was previously slated post-merge-on-master). Rationale: game-breaking + reliably hit in normal Revelations play; a branch-only fix to `cardAbilities.js` merges cleanly as long as master isn't ALSO changed there (it won't be). Supersedes merge-checklist §7's koBonuses post-merge entry.

## 🟠 P1 — functional

### R2-2. House of M re-entrant twist — "twist logged but not shown/executed" (the real "wonkiness")
- Symptom (intermittent): a Scheme Twist logs in the console but no popup; stated effect ("KO all X-Men from HQ") doesn't run; no transform. "Sometimes worked, sometimes not."
- ROOT CAUSE (diagnosed, strong hypothesis — confirm via Playwright with a stacked deck): `houseOfMTwist`/`noMoreMutantsTwist` call `await processVillainCard()` for the extra draw (expansionRevelations.js:3477, 3504). If that card is ANOTHER Scheme Twist, `handleSchemeTwist` re-enters recursively, sharing one popup modal + global chain state (`schemeTwistChainDepth`, `pendingHeroKO`). Inner twist's `showPopup` collides/overwrites; if the inner promise never settles or throws, the silent catch at script.js:6055-6062 swallows it → effect body after the popup `await` never runs.
- FIX: handle re-entrant scheme-twist (queue popups / serialize nested twists), and STOP silently swallowing the inner error (at minimum log to onscreenConsole + ensure the effect body still runs). Confirm root cause with a Playwright repro (stack the villain deck: twist → SW → twist).

### R2-3. War Machine "Military-Industrial Complex" +1 Recruit not firing on a villain defeated over a Location
- Symptom: defeated a villain associated with a Location → no +1 recruit; a normal villain next → +1 recruit fired.
- RULING (rules-oracle, SETTLED): defeating a Villain that sits ON a Location DOES count as defeating a Villain (the Villain and Location are separate cards; Villain defeat is normal Attack-based). War Machine's +1 Recruit MUST fire. (Fighting a BARE Location does NOT count — that case correctly didn't fire.) Cached in `docs/rules-notes/revelations.md`.
- LIKELY CAUSE: a villain sharing a space with a Location is being routed through the Recruit-paid Location-fight path, so the "defeat a Villain" hook never fires. FIX: keep the villain-on-the-space defeat on the normal Attack-based `defeatVillain` path so all "whenever you defeat a Villain" triggers fire (War Machine, Nightbringer). Exempt only fighting the Location card itself.

### R2-4. Count Nefaria (Lethal Legion) ambush fires intermittently / late
- Symptom: ambush ("reveal all class types or gain a Wound") did NOT fire on ambush; triggered the NEXT turn after Nefaria was already defeated. On a later replay it fired correctly on ambush. INTERMITTENT.
- HYPOTHESIS (for worker to confirm): the Villain Card Cloning gotcha (CLAUDE.md) — ambush effects that attach state to the card aren't preserved on the `city[]` clone; the ambush function must find the card in `city[]` after placement and modify the city copy. Diagnose Nefaria's ambush against that pattern.

### R2-10. House of M extra-draw — RESOLVED: STALE-CACHE FALSE ALARM (no fix needed)
- **OUTCOME (Paul, 2026-06-15):** the original repro was run on STALE CACHED CODE (the Empty-Cache-Hard-Reload step was skipped). After a proper Empty Cache + Hard Reload and reloading the SAME setup, the extra-draw worked correctly: card1 Klaw, card2 Scheme Twist, card3 SW Chaos Magic (the extra). Reconciles with the worker's clean-build result (R2-2 symptom never reproduced on a cache-busted Playwright build). NOT a real bug in current code — do NOT relay/fix. Lesson: cache state was the missing variable; the watch-list "Empty Cache and Hard Reload" step exists for exactly this.
- The investigation below is RETAINED for reference only (it diagnosed stale-cache behavior, not the current build):

> (former diagnosis — cross-turn deferral hypothesis — superseded by the stale-cache finding)
- REPRO (Paul, 2026-06-15, two-turn evidence — this is the decisive clue):
  - TURN 1 (GS, House of M): card#1 = Scheme Twist, card#2 = Master Strike, NO card#3. The twist's extra draw (`<2 SW` branch) did not appear → turn 1 short one card.
  - TURN 2: card#1 = Klaw, card#2 = SW "Alter Reality" (**no announcement popup — Klaw and Raft were announced, SW was not**), card#3 = Raft Prison (Location). GS turn 2 should draw 2 → it drew 3 (one surplus), and the surplus card came in unannounced.
  - Net over the two turns: the count balances (turn1 short 1, turn2 long 1) → the turn-1 extra draw is being DEFERRED and resolved during turn 2, bypassing the announce popup.
- DIAGNOSIS (revised — supersedes the earlier "swallowed throw" guess): the await chain is actually INTACT (handleSchemeTwist `await`s the twist effect at script.js:6062, `resolve()` is after it; houseOfMTwist `await`s its extra processVillainCard at expansionRevelations.js:3497). So it is NOT "never runs" and NOT a simple swallowed throw. The signature (extra lands a turn late + unannounced) points to a re-entrancy/ordering bug in the twist machinery's GLOBAL flags: `pendingHeroKO` is set true when `schemeTwistChainDepth` hits 0 (script.js:6078-6080), and processVillainCard's end-block fires a deferred `showHeroSelectPopup()` when `pendingHeroKO && schemeTwistChainDepth === 0 && !schemeTwistTuckComplete` (script.js:5898-5907). These globals are shared across the nested extra-draw AND the GS turn-draw loop and are not turn-scoped, so the extra draw appears to get parked and replayed on the next turn through a path that skips the announce. (processVillainCard's own catch is still console.error-only at 5908-5909 — surface it too, but it's not the primary cause.)
- WORKER — DO NOT trust a code-read (it already fooled us once on this exact item). Reproduce via Playwright: stack the deck so turn-1 card#1 = a House of M Scheme Twist (0 SW in city), play through turn 1 AND turn 2, and CAPTURE THE F12 CONSOLE + the exact pop order across both turns. Confirm WHICH draw is deferred and WHY (trace pendingHeroKO / schemeTwistChainDepth / schemeTwistTuckComplete and the GS draw loop's interaction with the nested extra-draw). Fix so the extra draw resolves INLINE on the triggering turn, announced normally. Mode-agnostic (no gameMode branch in the extra-draw path) — verify both GS and What If?. Re-close ONLY with a clean two-turn empirical repro.

### R2-5. Blackout "Fight: Draw two cards" not firing
- Symptom: fought Blackout, didn't get the 2-card draw. Worker: confirm whether the fight effect fires (draw 2 + cumulative/board update); diagnose-first.

## 🟡 P2 — display / text

### R2-6. Korvac Revealed twist POPUP shows Side-A text (Obs 10 incomplete)
- Symptom: when Korvac Revealed (Side B) is active and a twist fires, the POPUP still reads the Side-A text ("…discard down to four cards or KO a Bystander… This Scheme Transforms") instead of the Side-B text ("Discard an Avengers Hero or gain a Wound, then the Scheme Transforms"). Paul confirms the EFFECTS are correct — only the popup notification text is wrong.
- NOTE: Round-1 Obs 10 fixed the `korvacRevealedTwist()` console message but missed the POPUP announcement (separate text source, likely the `showPopup` in `handleSchemeTwist` using the scheme's twist description). Fix the popup to use side-correct text.

### R2-7. Mister Hyde / "Dr. Calvin Zabo" affordability-fail message says "attack" not "recruit"
- Symptom: tried to fight Hyde in the Streets (recruit-cost) with enough Attack but insufficient Recruit; block was correct, but the console said "need 6 attack" instead of recruit. Fix the recruit-fight affordability-fail message wording for the `usesRecruitToFight` case.

### R2-8. Scarlet Witch "Alter Reality" card — wrong attack number (Obs 4 REOPENED, narrowed)
- Symptom: Obs 4 (SW attack creep) resurfaced; Paul has now narrowed it to JUST the "Alter Reality" card showing an incorrect attack number. (Round-1 closed Obs 4 as not-reproduced; this is the concrete repro we asked for.) Worker: investigate Alter Reality's display specifically — compare its attack-modifier pipeline vs the other SW cards (Hex Bolt/Chaos Magic).

## 🔵 P3 — fidelity / scope (needs Paul's call)

### R2-9. "Put cards back in any order" only offers top/bottom one-at-a-time — RESOLVED: reuse existing picker
- Affects BOTH Speed "Break the Sound Barrier" AND Hood's Master Strike (reveal top 6, discard non-grey Heroes, put rest back in any order). The game presents each leftover card individually asking TOP or BOTTOM, so the player can't choose a precise full ordering.
- DECISION (Paul 2026-06-15, reuse-first): implement TRUE free-ordering by REUSING the existing helper — a real free-ordering picker already exists (Spider-Man "reveal top 3 and reorder", Redwing, several Dark City effects).
- REUSE TARGET: `chooseReturnOrderSingleRow(cards, title)` + `pickFromCardsSingleRow(...)` at `cardAbilitiesSidekicks.js:868` / `:722` (cleanest, newest; loops a single-row pick into a chosen order, batch-pushes to playerDeck). Alt: `handleCardReturnOrder`/`showSequentialCardSelectionPopup` at `cardAbilities.js:2549`/`:2598` (used by Spider-Man + 3 Dark City sites).
  - Speed "Break the Sound Barrier": DIRECT fit — one call with the leftover array (player deck). No changes.
  - Hood's Master Strike: filter out non-grey Heroes FIRST (bespoke, like the Spider-Man/Redwing cost-filter), then hand the survivors to the ordering helper. Confirm it targets the PLAYER deck (it's a "reveal the top of your deck" Master Strike — yes). Count-agnostic.
  - Caveat: all existing implementations push to `playerDeck` only; neither of our two effects needs villain-deck ordering, so no new work there.

## ✅ Confirmed working (Paul verified)
- Korvac no-bystander → discard-to-4 (R1 Obs 9); Korvac instant-win on defeat; Speed 5-class picker (Obs 13); SW greyed out under House of M (Obs 8); N/12 tracker (Obs 7).

## Working-as-designed / misobservations (explain, no fix)
- **No More Mutants does NOT transform back to House of M** — ONE-WAY by design (rules-oracle: Side-B twist has no Transform clause). Paul expected Korvac-style oscillation; it isn't. It correctly re-KOs all X-Men + draws an extra card each twist.
- **"Delayed transform" on the 2nd SW** — no ambient transform check exists; it was a chained extra-draw twist (buried by R2-2) re-counting SW and transforming. Transform is correctly twist-gated.
- **"Extra card not drawn"** — House of M side draws the extra card only when <2 SW; with ≥2 SW it transforms INSTEAD (correct). Apparent misses are fallout of R2-2.
- **Bare HYDRA Base / Location not giving War Machine +1 recruit** — correct (a bare Location is not a Villain).

## Deferred (carry forward, not this round)
- Korvac Revealed displaying AS a Location — Paul wants to discuss the intended-vs-current display approach "at some point" (post-merge display/UX discussion, with the Obs 3/6/18 overlay pass).
