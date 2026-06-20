# Auto-Pick → Present-Choice Batch — Diagnosis & Build Plan

**Date:** 2026-06-02
**Status:** DIAGNOSE COMPLETE — no build started. This doc is the build brief for a fresh worker.
**Source of truth for effects:** finalized inventory `docs/card-inventory/final/revelations.md` (verbatim quoted below).
**Parent catalog:** `docs/audit-results/revelations-2026-05-28.md` (triage line 165: "Any card text saying 'choose' / 'may' / non-mandatory must present the choice to the player; the game must never auto-resolve it"). Chemistro already done (commit `3e66797`) and EXCLUDED.

All members live in `Legendary-Solo-Play-main/Legendary-Solo-Play-main/expansionRevelations.js`. Line numbers drift — locate by function name.

## Dual-mode note (applies to ALL members)
Every member operates only on own-player resources (hand / deck / cards-played-this-turn / Victory Pile) — mechanically **identical in `gameMode` `'golden'` and `'whatif'`. No `gameMode` branch is needed anywhere.** Dual-mode verification = "behaves the same in both modes." The two "each player" framings (Korvac twist, and the EXCLUDED Rings-Seek) resolve to self in solo and are already coded that way. (Nightbringer's "do its Fight effect" inherits whatever mode-sensitivity the defeated villain's own fightEffect has — not new.)

## Gate (each group, per Rule 7)
Own commit + `expansion-validator` on `expansionRevelations.js` + cold-read `/code-review` (fresh ctx) + dual-mode `/game-test` (golden + whatif) vs FRESH on-disk. Reuse-first (Rule 9): run `pattern-reuse-scout` before building any sub-pattern that lacks a named lead below.

---

## BUILD ORDER (easiest-first; Nightbringer LAST — riskiest)
G1 Zero → G2 Photon Infrared+Ultraviolet → G3 Speed → G5 Korvac twist → **G4 Nightbringer (last)**.

*(Group IDs keep the diagnose labels; build order reorders G4 to the end.)*

---

## G1 — Zero "The Ice Blast"  `mandarinRingZero()` (~4516-4526)  [TRIVIAL]
- **Verbatim:** "Fight: **Choose** a card you played this turn that costs 0. When you draw a new hand of cards at the end of this turn, add that card to your hand as an extra card."
- **Choice word:** "Choose" — **MANDATORY** (no "may").
- **Now:** auto-picks `costZeroPlayed[0]` (filters `cardsPlayedThisTurn` for cost-0, excl. copied/deleted/simulation).
- **Present:** pick 1 of the cost-0 played cards (then set `addToHandEndOfTurn = true` as today). If exactly one cost-0 card, may auto-resolve; if none, no-op (as today).
- **Reuse:** `.card-choice-popup` played-card pick = **exactly Chemistro step-1 / `prodigyCopyPowers`**. Direct reuse — filter `cardsPlayedThisTurn` to cost-0 with the full flag filter, present, splice the selection logic from Chemistro's `chemistroPickPlayedCard`.

## G2 — Photon "Infrared Conversation" + "Ultraviolet Radiation" (shared mechanic — ONE commit)
Both are **mandatory play-costs: "To play this, you must discard a card"** — player chooses WHICH card. Shared scaffold: `.card-choice-popup` hand pick (`prodigyCopyPowers`), **mandatory (no No-Thanks)**.

- **Infrared Conversation**  `photonInfraredConversation()` (~1283-1313)
  - **Verbatim:** "SPECIAL ABILITY: To play this, you **must** discard a card. Draw two cards."
  - **Now:** TWO bugs — (1) made optional (popup asking *whether*), (2) discards a **random** hand card (`Math.random`).
  - **Present:** mandatory pick 1 from hand to discard → then `drawCard(); drawCard();`. Remove the "whether" popup and the random pick.
- **Ultraviolet Radiation**  `photonUltravioletRadiation()` (~1317-1321)  [STUB]
  - **Verbatim:** "SPECIAL ABILITY: To play this, you **must** discard a card." (Superpower Hyperspeed 3 is separate, already works.)
  - **Now:** empty no-op stub (comment: "broader play-cost system").
  - **Present:** same mandatory pick-1-from-hand-to-discard as Infrared, **minus** the draw.
  - **⚠ Beyond pure choice-conversion:** this is a STUB — the play-cost must be wired to actually fire on play, not just the picker added. Confirm the trigger path (how the card's ability is invoked on play) during build.

## G3 — Speed "Break the Sound Barrier"  `speedBreakTheSoundBarrier()` (~1951-1979)  [COMPLEX]
- **Verbatim:** "SPECIAL ABILITY: Look at the top six cards of your deck, **draw two of them**, and put the rest back on the top or bottom **in any order**."
- **Choice:** **MANDATORY**. Two choices: (1) multi-select WHICH 2 of the 6, (2) top-or-bottom placement for the remaining 4.
- **Now:** auto-takes 2 highest-cost (`sort` + `splice(0,2)`), rest `unshift`-ed to bottom.
- **Reuse:** `.card-choice-popup` adapted for **multi-select (exactly 2)**; the top/bottom-reorder is a scry-like sub-pattern.
- **⚠ OPEN REUSE Q (a):** is there an existing "look at top N, draw M, put rest top/bottom" scry helper? **Run `pattern-reuse-scout` before building.** Other Legendary heroes have scry-like reveal-and-reorder effects — check before hand-rolling the multi-select + placement UI.

## G5 — Korvac Saga twist  `theKorvacSagaTwist()` (~3194-3239)
- **Verbatim:** "Twist: Each player **must discard down to four cards or KO a Bystander** from their Victory Pile to 'search for the Korvac Entity.' This Scheme Transforms."
- **Choice:** the OR-mode popup **is already implemented** (confirm = discard-to-4, deny = KO Bystander) — keep it. Two sub-choices are NOT presented:
  - **discard-to-4:** card lets the player choose WHICH cards to discard down to 4. Now pops hand tail (`while length>4: pop`).
  - **KO Bystander:** player chooses WHICH VP Bystander. Now auto-picks `bystanders[0]`.
- **MANDATORY** (one of the two modes must be taken). Solo: "each player" → self (already coded).
- **Reuse:** KO-Bystander = `.card-choice-popup` pool pick from VP Bystanders (`KO1To4FromDiscard`-style pool pick, `cardAbilities.js:11814`). discard-to-4 = repeated/multi hand pick.
- **⚠ OPEN REUSE Q (c):** is there an existing "discard down to a hand limit, player chooses which" helper? **Run `pattern-reuse-scout` before building.** Legendary has **no normal hand limit**, so this may genuinely lack a helper — scout confirms; if none, build a minimal repeated-hand-pick loop on the `.card-choice-popup` scaffold.

## G4 — Nightbringer "The Black Light"  `mandarinRingNightbringer()` (~4451-4476)  [RISKIEST — BUILD LAST]
- **Verbatim:** "Fight: Reveal the top three cards of the Villain Deck. **You may defeat** a Villain you revealed worth 2VP or less. **(Do its Fight effect.)** Put the rest back in any order."
- **Choice:** **OPTIONAL ("may") + No-Thanks opt-out.** Pick 1 from the ≤2VP revealed pool (could be multiple eligible). NOT an "each other player" effect — "you may defeat" targets the fighting player; stays IN.
- **Now:** auto-defeats `eligible[0]`, NO opt-out, and does **NOT** run the defeated villain's Fight effect. Rest go back on top.
- **Present:** `.card-choice-popup` revealed-pool pick (filter top-3 for `type==="Villain" && victoryPoints<=2`) + No-Thanks. On select: `victoryPile.push(target)` THEN run the villain's `fightEffect`.
- **✅ REUSE LEAD (Q b — coordinator-supplied):** run the defeated Villain's `fightEffect` OUTSIDE the city-fight operations pipeline by reusing **F-G3 (War Machine "Simulated Target Practice")** — the proven pattern is `createVillainCopy(v)` + `await window[copy.fightEffect](copy)`. F-G3 did this for a Henchman; Nightbringer defeats a Villain but the dispatch is identical. **Scout/adapt F-G3, do not invent.** This de-risks G4 substantially. Function is `async` already; keep the `await` chain intact.
- "Put the rest back in any order" — ordering is a minor sub-choice; current "back on top in revealed order" is acceptable unless the build wants to offer a reorder.

---

## EXCLUSIONS (coordinator-confirmed)

- **"Rings Seek Their True Hand"**  `mandarinRingsSeekTheirTrueHand()` (~3623-3642) — auto-picks `rings[0]`, BUT it's an **"Each other player"** effect (verbatim: "Each other player reveals a [TECH] Hero or puts a Mandarin's Ring from their Victory Pile into the Escape Pile") AND LOW "functionally-correct penalty." → **Route to the deferred each-other-player review** (`docs/known-issues.md`; catalog line 166). NOT this batch.

- **Unimplemented (log-only) abilities** → **NOT this batch** (different fix class: implement-from-nothing, not convert-auto-pick-to-choice). Logged as a new tracked catalog item (see catalog "QUEUED" entry). Members found (outside Cluster F, which is DONE):
  - **Ronin "Mysterious Identity"** — color/team reassignment unimplemented (log only). catalog line 126.
  - **Hellcat "Demon Sight" (superpower)** — "may fight the revealed Villain this turn" not enabled (log only). catalog line 127.
  - **The Dark Dimension** Fight "Take another turn after this one" — no-op stub (`expansionRevelations.js` ~2828; catalog line 70).
  - *Scan caveat:* the above came from a comment-marker scan + catalog cross-ref, NOT an exhaustive body-level audit of every effect function. The cleanup item's own diagnose should sweep all expansion effect bodies for log-only/no-op patterns before building.

---

## Reuse scaffolds (proven precedents)
- **`.card-choice-popup`** pool/hand/played pick — `prodigyCopyPowers` (`cardAbilitiesSidekicks.js:1295`), Chemistro `chemistroPickPlayedCard` (`expansionRevelations.js`). Single-select; multi-select needs adaptation (G3).
- **`KO1To4FromDiscard`** discard/VP pool pick — `cardAbilities.js:11814`.
- **F-G3 villain/henchman fightEffect invocation** — `createVillainCopy(v)` + `await window[copy.fightEffect](copy)` (War Machine "Simulated Target Practice"). For G4.
- *(`.card-choice-city-hq-popup` — invadeTheDailyBugle/Chemistro step-2 — NOT needed; no HQ/city picks in this batch.)*
