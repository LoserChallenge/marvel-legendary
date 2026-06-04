# Korvac Revealed — Build Plan (Cluster B Item 2)

**Status:** NOT STARTED. Approved plan + ruling captured for a fresh-context worker. No code written.
**Authored:** 2026-06-03 (Cluster B diagnose-first pass; pattern-reuse-scout survey).
**Branch:** `revelations`. **Builds on:** Items 1 (`a543a2b`) + 3 (`cb6ec1e`) already merged on the branch.

This is the meatiest/riskiest Cluster B item (a fightable scheme-entity + a win trigger). Build it
in a FRESH worker context (coordinator's call). Gate per Rule 7 (own commit + expansion-validator on
touched `expansion*.js` + cold-read `/code-review` + dual-mode `/game-test` vs FRESH on-disk).

---

## The mechanic

**Korvac Revealed** is Side B of **The Korvac Saga** (transforms back and forth on twists).
Verbatim special rule (inventory `docs/card-inventory/final/revelations.md:695`):

> "This Scheme counts as a 19 Attack 'Korvac' Villain worth 9VP. If you defeat Korvac, KO the
> Mastermind and all its Tactics."

DB entries: `cardDatabase.js` The Korvac Saga (`endGame: "korvacEvilWins"`, twist `theKorvacSagaTwist`)
and Korvac Revealed (`hiddenFromSetup: true`, twist `korvacRevealedTwist`). **Like House of M, the
Side-B name may differ from a clean string — match scheme sides on `scheme.endGame`, NOT `scheme.name`
(see the embedded-quote gotcha that bit Item 1; verify the Korvac Revealed DB `name` value before any
name-equality).**

## Current state (the gap)

`korvacRevealedTwist()` (`expansionRevelations.js`, ~3511 pre-Item-1-shift; grep the name) only does:
twist-count increment, even-twist Avengers-discard-or-wound, transform-back-to-Side-A, and the
Twist-8 "Evil Wins" hook (`korvacEvilWins`, a `checkEvilWins` switch case, ~`script.js:9670`).
**The defining mechanic — a fightable 19-Attack / 9VP "Korvac" entity + a defeat→KO-Mastermind-and-
all-Tactics WIN trigger — does not exist anywhere.** No fightable element, no defeat handler, no win
hook. (`#scheme-place` is a static `<img class="card-image">`, `script.js:4481` — NO click/fight
handler. Do NOT try to make the scheme cell itself fightable.)

---

## RULING (rules-oracle, cached `docs/rules-notes/revelations.md`)

**Defeating Korvac = INSTANT WIN in BOTH modes.** The build fork collapses to a single path:

> `korvacDefeated` → KO the Mastermind + clear ALL its Tactics → trigger the win IMMEDIATELY
> (`showWinPopup()` directly). **BYPASS** the Golden Solo Final-Showdown / strength+4 check and the
> Final-Blow gate — there is no Mastermind card left to fight it against; What If? has no Final Blow
> by default. One collapsed win path, both modes.

The Twist-8 "Evil Wins" race (`korvacRevealedTwist` / `korvacEvilWins`, already partly built) must
still work — the instant-WIN path (defeat Korvac) and the LOSS path (8th twist) coexist.

---

## Build approach (REUSE-heavy — cites from the scout survey)

### 1. The fightable Korvac entity — ADAPT the Grim Reaper "Graveyard" Location pattern
Build Korvac as a **Location-type card object** dropped into the city, NOT a city villain and NOT the
scheme cell. This reuses the entire fightable / affordability / VP-award / animation chain for free.

- Model on **`grimReaperStrike` "Graveyard"** (`expansionRevelations.js` ~3547; epic ~3576): builds an
  ad-hoc `{ name, type:"Location", attack, originalAttack, victoryPoints, fightEffect,
  forceAttackOverlay:true, ... }` and `await placeLocation(...)` into the city.
- Korvac card object: `attack:19, originalAttack:19, forceAttackOverlay:true` (paints "19" over reused
  art — `forceAttackOverlay` precedent at `expansionRevelations.js:3566`), `victoryPoints:9`,
  `fightEffect:"korvacDefeated"`, `name:"Korvac"`, an appropriate image (reuse the Korvac Revealed
  scheme art or a dedicated asset — confirm with Paul; `forceAttackOverlay` lets it reuse art).
- `placeLocation()` is `async` (`script.js:584`) — the caller must `await` it and be `async`
  (see the Async Gotchas in CLAUDE.md).
- Fight/defeat is handled by **`defeatLocation(cityIndex, attackCost)`** (`script.js:12250`): pays the
  attack cost, pushes the card to `victoryPile` (awards the 9 VP + logs it), runs `locationCard.
  fightEffect`, clears the slot. Attack-19 display + 9-VP award come for free.
- `generateVillainDeck` Type Gotcha: Location type-preservation is already handled on this branch
  (`const cardType = modifiedCard.type === "Location" ? "Location" : "Villain";`).

### 2. The WIN trigger — REUSE the existing win plumbing + ADD a one-shot tactics-clear
The engine equates `mastermind.tactics.length === 0` (+ `finalBlowDelivered` when Final Blow is on)
with a defeated Mastermind = the win. Cites:
- `isMastermindDefeated(mastermind)` (`script.js:15328`) — `tactics.length === 0` (+ Final-Blow gate).
- `checkWinCondition()` (`script.js:16535`) → `showFinishTurnPopup()` → **`showWinPopup()`**
  (`script.js:16544`).
- `revealMastermindTactic()` `mastermind.tactics.pop()` (`script.js:15971`) — the normal one-per-attack
  drain.

**`korvacDefeated(locationCard, cityIndex)` (new fight-effect function, in `expansionRevelations.js`,
global per the classic-script `window[fightEffect]` dispatch):**
1. KO the Mastermind + clear ALL its Tactics — `mastermind.tactics = []` (or pop in a loop), plus
   whatever "KO the Mastermind" presentation is appropriate (log + any KO-pile/visual).
2. Trigger the win IMMEDIATELY — call **`showWinPopup()` directly** (instant win). Do NOT route through
   the Final-Showdown / strength+4 / Final-Blow gate (ruling above). A thin one-shot helper that clears
   tactics then calls `showWinPopup()` is the whole win path.
3. `onscreenConsole.log` the verbatim "defeat Korvac → KO the Mastermind and all its Tactics" outcome.

Caution: confirm `showWinPopup()` is safe to call directly (it's the same popup the normal win uses);
verify it doesn't itself re-check `isMastermindDefeated`/Final-Blow in a way that would block an instant
win. If it does, call the lower-level win presentation or set the state it needs, but do NOT make the
player satisfy strength+4.

### 3. WHERE/WHEN to place + remove the Korvac entity — KEY OPEN DESIGN QUESTION (flag/route)
The Korvac Saga (A) ⇄ Korvac Revealed (B) oscillates on twists: Side-A twist transforms to B; Side-B
even twists transform back to A; Twist 8 = Evil Wins. The "19-Attack Korvac Villain" exists **while
Korvac Revealed (Side B) is the active side.** So the build must decide:
- **Place** the Korvac Location entity when transforming TO Korvac Revealed (in `theKorvacSagaTwist`
  after `transformScheme()`), and
- **Remove** it when transforming BACK to The Korvac Saga (in `korvacRevealedTwist` even-twist path)?
  Or does Korvac persist once revealed?

This is the one genuine rules/design question the build hinges on — **route to the Revelations rulebook
/ rules-oracle + Paul before implementing the place/remove lifecycle.** (Does Korvac persist across the
A↔B oscillation, or exist only during Side B? What happens to a placed-but-undefeated Korvac when the
scheme flips back to Side A?) Get this settled first; the rest is mechanical reuse.

---

## Reuse cite summary

| Need | Reuse target | Verdict |
|---|---|---|
| Fightable non-city entity (attack+VP) | Grim Reaper "Graveyard" `expansionRevelations.js`~3547 → `placeLocation` (`script.js:584`) → `defeatLocation` (`script.js:12250`) | ADAPT |
| Attack-19 display on reused art | `forceAttackOverlay:true` `expansionRevelations.js:3566` | REUSE |
| 9 VP on defeat | `defeatLocation` victoryPile push (`script.js`~12275) | REUSE |
| KO Mastermind + all Tactics → win | `mastermind.tactics = []` → `showWinPopup()` (`script.js:16544`) directly | REUSE plumbing + ADD one-shot clear |
| Twist-8 Evil Wins (must still work) | `korvacEvilWins` (`script.js`~9670) + `korvacRevealedTwist` | KEEP working |
| Scheme cell itself fightable | none — `#scheme-place` static img (`script.js:4481`) | DO NOT BUILD — use the Location path |

## Gate (Rule 7)
Own commit + `expansion-validator` on touched `expansion*.js` + cold-read `/code-review` (fresh ctx) +
dual-mode `/game-test` (golden + whatif) vs FRESH on-disk. Verify: Korvac enters as a 19-attack/9VP
fightable Location while Side B is active; fighting it pays attack, KOs the Mastermind + clears all
Tactics, and triggers an INSTANT win (no strength+4 gate) in BOTH modes; the Twist-8 Evil-Wins loss
still fires when Korvac is NOT defeated by the 8th twist.

## Harness notes (from the Items 1 & 3 gates)
- Serve `/game-test` from the WORKTREE game dir via a RELATIVE path; set 1920×1080; `sw.js` 404 is
  expected noise.
- Game start: outer "START GAME" opens a CONFIRM CHOICES popup; the real start is the confirm popup's
  `#begin-game` button (a real click, not a synthetic `pointerdown` — that didn't fire the flow).
- Chromium serves STALE `script.js`/`expansionRevelations.js` even on reload — verify freshness markers
  (`<fn>.toString().includes(...)`) and eval-install fresh on-disk functions (brace-extract from
  `fetch(url,{cache:'no-store'})`) before trusting any result.
- Never `await` an interactive popup inside `browser_evaluate`; capture synchronous pre-popup effects,
  or null out the heroes/inputs so the popup auto-resolves.
- Korvac Revealed is `hiddenFromSetup` — to reach Side B in a real game you must start The Korvac Saga
  and transform; for logic tests, inject the Side-B scheme object + `placeLocation` the Korvac entity.
