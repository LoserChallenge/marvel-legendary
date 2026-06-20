# Cluster F — Diagnosis (DIAGNOSE-ONLY, reuse-first)

**Date:** 2026-06-01 · **Branch:** revelations · **Status:** report for approval — nothing implemented.

Cluster F = Revelations hero abilities that are log-only / no-op / broken. Source of truth for
effect text = finalized inventory (`docs/card-inventory/final/revelations.md`). Reuse survey =
`pattern-reuse-scout` run 2026-06-01 (verdicts inline). All 8 functions ARE wired (DB→function
mapping is correct); the function bodies are the problem.

Line numbers in the 2026-05-28 catalog drifted; **actual** locations below.

---

## Per-card findings

### F-a · Speed "Speedy Delivery" (Common B) — `expansionRevelations.js:1707`
- **Inventory:** "The next Hero you recruit this turn goes on top of your deck."
- **Current:** logs a reminder only; no flag, no recruit hook. No-op.
- **Needed:** set a per-turn flag so the next recruited Hero lands on top of `playerDeck` instead of `playerDiscardPile`.
- **Reuse — REUSE (exact prior art).** `backflipRecruit` flag → branch in `recruitHeroConfirmed()` (`script.js:18311`) already pushes the next recruit to deck-top (`playerDeck.push(hero); hero.revealed = true;`), consumes-and-resets the flag on the next recruit (`18318`), and force-resets in `endTurn` (`script.js:11481`). Two sibling recruit handlers carry the same branch (`script.js:17701`, `17803`) — parity to confirm.
- **Fix:** `speedSpeedyDelivery()` sets `backflipRecruit = true` (+ on-screen reminder). No new engine code.
- **Risk:** very low (flag reuse). **Dual-mode:** recruit flow identical in both modes.

### F-b · War Machine "Military-Industrial Complex" (Common B) — `expansionRevelations.js:1863`
- **Inventory:** "Whenever you defeat a **Villain** this turn, you get +1 Recruit." (Villain only — NOT mastermind.)
- **Current:** logs a reminder only; no per-turn flag, no defeat hook. No-op.
- **Reuse — ADAPT.** `defeatBonuses()` (`cardAbilities.js:20`) is the canonical on-defeat payout dispatcher; `extraThreeRecruitAvailable` is the precedent (+N recruit per defeat). Per-turn counter pattern to mirror: `bystandersRescuedThisTurn` (declare `script.js:854`, reset `11478`).
- **⚠ Design point:** `defeatBonuses()` runs in **both** the villain path (`handlePostDefeat` → `script.js:13348`) **and** the mastermind path (`handleMastermindPostDefeat` → `15839`). Military-Industrial is **villain-only**, so its +1 recruit must NOT fire on mastermind defeat. Options: (a) place the payout in the villain path only (not inside the shared `defeatBonuses()`), or (b) parameterize `defeatBonuses(source)` and gate. **Recommend (a)** to avoid touching every `defeatBonuses()` caller. Needs new global `warMachineMilitaryRecruit` (set by the ability, reset in endTurn).
- **Risk:** medium (engine defeat-flow touch). **Dual-mode:** identical.

### F-c · War Machine "Overwhelming Firepower" (Rare) — `expansionRevelations.js:1880`
- **Inventory:** "Whenever you defeat a **Villain or Mastermind** this turn, draw a card and rescue a Bystander."
- **Current:** logs a reminder only; no hook. No-op.
- **Reuse — ADAPT.** Same `defeatBonuses()` pattern as F-b, but Villain-OR-Mastermind = payout goes **directly inside `defeatBonuses()`** (which already runs in both paths — perfect fit). New global `warMachineFirepowerBonus` (count of pending defeats' rewards), set by the ability, reset in endTurn. Payout per defeat: `drawCard()` + `await rescueBystander()` (mechanic 6).
- **Risk:** medium. **Dual-mode:** identical. Note `rescueBystander()` is async — `defeatBonuses()` payout site must `await` (check `defeatBonuses` callers' async-ness; may need to make the bonus draw+rescue awaited or fire a dedicated async helper).

### F-d · War Machine "Simulated Target Practice" (Common A) — `expansionRevelations.js:1825` — **HIGH (ReferenceError)**
- **Inventory:** "[TECH]: You may fight a Henchman from your Victory Pile this turn. If you do, KO it and rescue a Bystander. **(Do that Henchman's Fight effect too.)**"
- **Current bugs (three):**
  1. `bystanderStack.length` / `bystanderStack.pop()` (`1846-1847`) → **ReferenceError** (`bystanderStack` is undefined; real global is `bystanderDeck`). Aborts mid-effect.
  2. Auto-picks the first VP henchman (`findIndex`) instead of presenting a choice — minor, but violates the "present-choice" triage rule when >1 henchman in VP.
  3. **Skips the "Do that Henchman's Fight effect too" clause entirely.**
- **Reuse:** **REUSE** `await rescueBystander()` (`cardAbilities.js:640`; pops `bystanderDeck`, pushes `victoryPile`, runs bonuses + the bystander's own on-rescue) for bug 1 — replaces the whole `bystanderStack` block. **REUSE** the Fight-effect dispatch `await window[henchman.fightEffect](henchman)` (the pattern at `script.js:12663`) for bug 3. **ADAPT** a thin VP-henchman `card-choice-popup` picker (model `FightKOHeroYouHave`, `cardAbilities.js:8629`) for bug 2.
- **⚠ Gotcha:** confirm a defeated henchman sitting in `victoryPile` still carries its `fightEffect` string field (createVillainCopy whitelist gotcha — CLAUDE.md). If VP stores a stripped copy, the dispatch would no-op; verify at implementation.
- **Function must become `async` + `await`** for `rescueBystander()`. Grep call site / DB mapping (superpower) and add `await`.
- **Risk:** medium. **Dual-mode:** identical (no mode branching).

### F-e · Hellcat "Second Chance at Life" (Rare) — `expansionRevelations.js:1201` — most complex
- **Inventory:** "If a Master Strike or Scheme Twist would occur, you may discard this card from your hand instead. If you do, draw three cards, then shuffle that Strike or Twist back into the Villain Deck."
- **Current:** `unconditionalAbility` only prints a reminder; the actual reactive interception is unimplemented in Master Strike / Scheme Twist processing. No-op.
- **Reuse — ADAPT (strike half) + BUILD-on-template (twist half).**
  - **Master Strike:** strong prior art — `handleMasterStrike()` (`script.js:5756`) already does a from-hand reaction via the **Cable** hook (`processCableCards` `5766` → `askToDiscardCable` `5818`: scans `playerHand` for a named card, shows a discard-Y/N popup, splices it out, applies a bonus). Mirror this for the Hellcat card. Cable does NOT negate the strike; Second Chance **does** — negate by early-returning before `handleMasterStrikeEffect()` (precedent: the `mastermindDefeated` early-return at `5770-5782`) and `villainDeck.push(strikeCard)` + reshuffle. Reward = draw 3.
  - **Scheme Twist:** **no equivalent hook** — `handleSchemeTwist()` (`script.js:5891`) KOs the twist (`5897`) and runs the effect with no prevention opportunity. Add a Cable-style `playerHand` check at the top, before KO/effect.
- **Risk:** HIGH (touches two core engine processors; reactive-from-hand timing). Strongly warrants its own group + cold-read + dual-mode game-test.
- **Dual-mode:** both modes route strikes/twists through `handleMasterStrike`/`handleSchemeTwist` — confirm no mode-specific strike/twist path bypasses the new hook.

### F-f · Scarlet Witch "Hex Bolt" (Common A superpower) — `expansionRevelations.js:1576`
- **Inventory (superpower [RANGED]):** "Discard the top card of any player's deck. You may play a copy of that card this turn." (Solo: discard own top.)
- **Current:** discards own top card correctly, but "you may play a copy" is just a log line — unimplemented.
- **Reuse — ADAPT/BUILD.** `RogueCopyPowers` (`cardAbilities.js:7419`) is NOT reusable — it's an in-place identity-swap of the Rogue card, not a "play a copy of X" helper. BUT the **copy-flag infrastructure is reusable**: tag a clone `isCopied`/`markedForDeletion`, and the ~40 "cards played this turn" filters already exclude it + the endTurn destroy sweep (`script.js:11377-11400`) cleans it up for free. Need a small new **`playCopyOfCard(card)`** helper: clone, tag, invoke the existing play-effect executor (the `unconditionalAbility`/`conditionalAbility` dispatch), add to play flow.

### F-g · Scarlet Witch "Chaos Magic" (Uncommon) — `expansionRevelations.js:1631`
- **Inventory:** "Reveal the top card of the Hero Deck. You may play a copy of that card this turn. When you do, put that card on the bottom of the Hero Deck."
- **Current:** reveals top of `heroDeck` + logs; "play a copy" + "move to bottom" unimplemented.
- **Reuse:** same new **`playCopyOfCard()`** helper as F-f. Extra step: on accept, `heroDeck.unshift(revealedCard)` (move the original to bottom). **Group F-f + F-g** — build the copy helper once, call from both.
- **Risk:** HIGH-ish (new copy mechanic — novel). Own group; cold-read the helper carefully (copied-card flag conventions, scoring exclusion, cleanup).

### F-h · Photon "Light the Way" (Uncommon) — `expansionRevelations.js:1254`
- **Inventory:** "You get +1 Attack for each card you discarded from your hand this turn."
- **Current:** reads `justAddedToDiscard.length` — but **nothing ever pushes to that array** (declared `script.js:775`, reset `11425`, never populated) → always 0 attack. No-op.
- **Reuse — BUILD NEW.** No discard-from-hand chokepoint exists; hand discards are ad-hoc splices across many cards (e.g. `photonInfraredConversation` `1226`). Two options: (a) add a single **`discardFromHand(card)`** helper (splice + push + count) and migrate hand-discard sites to it; (b) increment the counter at each existing hand-discard site. **Recommend (a)** — one helper, future-proof, lower regression surface than touching N sites. The reset already exists (`script.js:11425`). Counter scoped to **from-hand** discards only (NOT played-cards-to-discard at cleanup, NOT deck-discards).
- **Risk:** medium (cross-cutting if migrating sites). **Dual-mode:** identical.

---

## Proposed grouping (by shared engine touchpoint, for review efficiency)

| Group | Cards | Shared mechanic | Reuse | Risk |
|-------|-------|-----------------|-------|------|
| **F-G1** | Speedy Delivery (F-a) | recruit-destination redirect | REUSE `backflipRecruit` | very low |
| **F-G2** | Military-Industrial (F-b), Overwhelming Firepower (F-c) | on-defeat standing bonus | ADAPT `defeatBonuses()` + `rescueBystander()` | medium |
| **F-G3** | Simulated Target Practice (F-d) | VP-henchman fight + rescue (crash fix) | REUSE `rescueBystander()` + fightEffect dispatch; ADAPT VP picker | medium (HIGH crash) |
| **F-G4** | Hex Bolt (F-f), Chaos Magic (F-g) | play-a-copy | BUILD `playCopyOfCard()` (reuse copy-flag system) | high (novel) |
| **F-G5** | Light the Way (F-h) | count from-hand discards | BUILD `discardFromHand()` counter | medium |
| **F-G6** | Second Chance at Life (F-e) | reactive cancel strike/twist from hand | ADAPT Cable hook (strike) + build twist hook | high |

Suggested order: F-G1 (trivial reuse) → F-G3 (crash fix, mostly self-contained) → F-G2 (defeat-flow) → F-G5 (counter) → F-G4 (copy mechanic) → F-G6 (reactive engine, riskiest). Each group: own commit + `expansion-validator` (touched expansion files) + `/code-review` + dual-mode where engine-touching, per Rule 7.

## Dual-mode notes
All eight are hero abilities with no anticipated `gameMode` branching — `whatif` and `golden` route through the same recruit / defeat / strike / twist / discard engine paths. No mode-specific divergence expected; still verify both modes at implementation for the engine-touching groups (F-G2, F-G3, F-G6) per Rule 7 (validator is Golden-only; What If? divergence caught only by dual-mode test + code-review).

## Open implementation flags (not blockers — verify at build time)
1. **F-b villain-only payout** — keep Military-Industrial's +1 recruit OUT of the shared `defeatBonuses()` (fires on mastermind too); place in the villain-defeat path only.
2. **F-c async rescue** — `rescueBystander()` is async; the `defeatBonuses()` payout site must `await` (or delegate to a dedicated async helper). Confirm `defeatBonuses` callers can await.
3. **F-d VP fightEffect retention** — confirm defeated henchmen in `victoryPile` still carry `fightEffect` (createVillainCopy whitelist gotcha) before relying on the dispatch.
4. **F-f/g copy executor** — identify the exact play-effect dispatch entry point used by normal card play; `playCopyOfCard()` must invoke the same path so copied cards run real effects and get swept at endTurn.
5. **F-e twist hook is new** — `handleSchemeTwist()` has no from-hand reaction today; adding one is the novel part of this group.
