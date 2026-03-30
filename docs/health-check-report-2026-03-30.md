# Full Project Health Check Report

**Date:** 2026-03-30
**Scope:** script.js, cardAbilities.js, cardAbilitiesDarkCity.js, cardAbilitiesSidekicks.js, expansionFantasticFour.js, expansionGuardiansOfTheGalaxy.js, expansionPaintTheTownRed.js, index.html, styles.css, cardDatabase.js

---

## CRITICAL — Fix before expansions

### C1 — `drawVillainCardsSequential()` triggers full round machinery mid-fight

**Area:** Core engine
**File:** `script.js` ~line 11299
**Call sites:** ~lines 12434, 12866, 13196

`drawVillainCardsSequential(2)` calls `drawVillainCard()` twice, which in Golden Solo triggers the full round sequence: `goldenHQRotate()`, the bystander discard popup, and the 2-card draw loop. Called from 3 Endless Armies of HYDRA fight-effect handlers. This is the exact same bug that was fixed for Plutonium Scheme Twist (now at line ~5490 using `processVillainCard()`). As a side effect, if HYDRA is defeated on Turn 1, it prematurely consumes `goldenFirstRound = false` before the normal round-start draw fires, potentially causing a double HQ rotation.

**Fix:** Replace all three `await drawVillainCardsSequential(2)` calls with two sequential `await processVillainCard()` calls, matching the Plutonium Scheme Twist pattern.

---

### C2 — `drawVillainCard()` not awaited in `endTurn()` and `initGame()`

**Area:** Core engine
**File:** `script.js` ~lines 10865 and 4543

Both `endTurn()` and `initGame()` call `drawVillainCard()` without `await`. Since `drawVillainCard()` is async (it contains awaited popups and HQ mutations), execution continues past it immediately. In `endTurn()` this means `nextTurnsDraw` and `cardsToBeDrawnNextTurn` can be reset while villain draws are still in flight. In `initGame()`, the startup screen hides before Turn 1 villain cards finish resolving.

**Fix:** Change both calls to `await drawVillainCard()`.

---

### C3 — 3 bare HQ fill-in-place bugs in expansion files

**Area:** Expansion files

All three break Golden Solo HQ rotation (new card should go to rightmost slot via `goldenRefillHQ`, not fill in place):

| Function | File | Line | Trigger |
|---|---|---|---|
| `risingWatersTwist` | `expansionFantasticFour.js` | ~628-629 | Scheme twist KOs a hero and replaces it |
| `cosmicRaysRecruit` | `expansionFantasticFour.js` | ~1278-1279 | Bathe Earth in Cosmic Rays scheme recruit |
| `dailyBugleVillainToHQ` | `expansionPaintTheTownRed.js` | ~275-276 | Daily Bugle fallback when no villains in city |

**Fix pattern** (same as all prior fixes):
```javascript
if (gameMode === 'golden') {
  goldenRefillHQ(index);
} else {
  hq[index] = heroDeck.length > 0 ? heroDeck.pop() : null;
}
```
`morgAmbush` (FF ~L3256) and `koHeroKraven` (PTTR ~L1710) already use this correctly.

---

### C4 — Duplicate `id="popup"`, `id="popup-confirm"`, `id="popup-title"` in HTML

**Area:** UI
**File:** `index.html` ~lines 902-928

Lines ~902 and ~919 both declare `id="popup"`. Inside them, `id="popup-confirm"` (~913, ~924) and `id="popup-title"` (~910, ~923) are also duplicated. The second `#popup` block appears to be a legacy version of the popup never removed. `getElementById` silently returns the first match only — the second block is permanently dead and inaccessible.

**Fix:** Remove the entire second `#popup` block (~lines 919-928). Confirm first that no JS or CSS references the button classes inside it (`close-btn`, `popup-visibility-btn`).

---

### C5 — Duplicate `id="sidekick-section"` (missed in 2026-03-30 fix)

**Area:** UI
**File:** `index.html` ~lines 391 and 395

Exact same pattern as the 5 IDs fixed on 2026-03-30: outer section wrapper and inner scrollable list div share `id="sidekick-section"`.

**Fix:** Rename the inner div (~line 395) to `sidekick-list` or `sidekick-scroll-list`. Grep `script.js` first to confirm no JS directly targets the inner list by ID.

---

## MEDIUM — Fix before or during expansion work

### M1 — `heroSkrulled()` has two bugs: wrong popup gate + unawaited async

**Area:** Card abilities
**File:** `cardAbilities.js` ~line 17026

1. `showHeroDeckEmptyPopup()` is called after `goldenRefillHQ()` checking `if (!hq[heroIndex])` — but after `goldenRefillHQ` splices the array, `hq[heroIndex]` now points to the card that shifted into that index, not the new card. Can falsely trigger the popup, or miss it. `captureHeroBySkrullQueen` (same file, ~L15248) correctly places this check inside the `else` branch.

2. `processVillainCard()` is called fire-and-forget from a non-async function — `updateGameBoard()` runs concurrently with the villain draw.

**Fix:** Move `showHeroDeckEmptyPopup()` into the `else` branch. Make `heroSkrulled` async and `await processVillainCard()`.

---

### M2 — `electroAmbush()` and `eggheadAmbush()` call `processVillainCard()` fire-and-forget

**Area:** Card abilities
**File:** `cardAbilitiesDarkCity.js` ~lines 8255 and 8282

Both are synchronous functions that call `processVillainCard()` (async) without `await`. They are called with `await ambushEffectFunction(...)` in script.js, but since they return `undefined` (not a Promise), the `await` resolves immediately and subsequent code races with the villain draw.

**Fix:** Mark both `async` and `await processVillainCard()`. `organizedCrimeAmbush` (DC ~L15945) is the correct reference pattern.

---

### M3 — `KOAllHQBystanders()` uses stale indices after splice in Golden Solo

**Area:** Card abilities
**File:** `cardAbilitiesDarkCity.js` ~line 15968

When multiple bystanders are in HQ and `gameMode === 'golden'`, the first `goldenRefillHQ(index)` call splices the array, shifting all higher indices left by one. Subsequent iterations use the original pre-splice indices — pointing at the wrong cards.

**Fix:** Iterate in reverse index order (highest first) so splicing doesn't affect unprocessed indices.

---

### M4 — `isFirstTurn` and `finalBlowDelivered` not reset in `initGame()`

**Area:** Core engine
**File:** `script.js` (initGame function)

If a player ever starts a second game without a full page reload, `isFirstTurn` stays `false` (skipping the What If? Turn 1 3-villain draw) and `finalBlowDelivered` stays `true` (from a prior win). `goldenFirstRound` is correctly reset; these two are not.

**Fix:** Add `isFirstTurn = true;` and `finalBlowDelivered = false;` at the top of `initGame()`.

---

### M5 — Detonate the Helicarrier (>=6 explosions) leaves a `null` hole in Golden Solo HQ

**Area:** Core engine
**File:** `script.js` ~line 13837 (`koHeroInHQ`)

The >=6 explosions branch sets `hq[index] = null` (slot destruction) without a `gameMode` check. In Golden Solo, `goldenRefillHQ` manages the array with `splice` — a `null` hole persists and shifts around with subsequent splices. Affects only the intersection of Golden Solo + Detonate the Helicarrier scheme with 6+ explosions (rare).

**Fix:** In the >=6-explosions branch, use `hq.splice(index, 1)` in Golden Solo instead of `hq[index] = null`.

---

### M6 — CSS z-index: `#golden-bystander-popup` and `.modal-overlay` both at 999

**Area:** UI
**File:** `styles.css` ~lines 8504 and 1439

The popup renders above its own overlay only because it comes later in the DOM — fragile.

**Fix:** Raise `#golden-bystander-popup` to `z-index: 1001`.

---

## LOW — Defer until convenient

| # | Area | File | Location | Issue |
|---|---|---|---|---|
| L1 | Expansion | `expansionPaintTheTownRed.js` ~L1730 | `koHero()` | Dead function never called — also contains bare HQ fill bug. Remove or wire up with golden guard. |
| L2 | Card abilities | `cardAbilities.js` ~L16855 | `drawMultipleVillainCards()` | Dead function never called. Remove. |
| L3 | Card abilities | `cardAbilitiesDarkCity.js` ~L15963 | `KOAllHQBystanders()` | Missing `return` after no-bystander guard — falls through to VP check unconditionally. Clarify intent. |
| L4 | Card abilities | `cardAbilities.js` ~L16962 | `KOAllHeroesInHQ()` | Missing `showHeroDeckEmptyPopup()` in What If? path after refill loop. |
| L5 | Core engine | `script.js` ~L651 | `enterCityNotDraw` | Flag declared but never set to `true` — permanently `false`. Dead scaffolding. |
| L6 | Expansion | `expansionFantasticFour.js` ~L3232 | `morgAmbush()` | Iterates `i < 5` hardcoded instead of `i < hq.length`. Works but fragile. |
| L7 | Expansion | `expansionGuardiansOfTheGalaxy.js` ~L2411 | Thanos tactic popup | Shows full multiplayer card text including "each other player" clause that never fires in solo. |
| L8 | Data | `cardDatabase.js` ~L520 | Splice Humans scheme | `specificVillainRequirement` declared twice — same value so no runtime impact. |
| L9 | UI | `styles.css` ~L8556 | `#summary-panel` | Hard-coded `height: 100px` — could overflow on small screens. |
| L10 | UI | `index.html` ~L137 | X-Cutioner's Song | Hero radio inputs use `name="hero"` — same namespace as main hero checkboxes. |

---

## What's Clean (confirmed by audit)

- All 22 + 3 previously-fixed `drawVillainCard` -> `processVillainCard` call sites — verified correct
- All `hq[]` write assignments in `cardAbilities.js` and `cardAbilitiesDarkCity.js` — correctly guarded
- GOTG expansion — no HQ fills, no drawVillainCard calls, cleanest expansion
- `cardAbilitiesSidekicks.js` — fully mode-agnostic, no issues
- Script loading order (waterfall chain, DB first, script.js last) — correct
- All mastermind `alwaysLeads` group names — all resolve to real villain groups
- Golden Solo bystander popup HTML + JS button IDs — fully aligned
- Final Showdown correctly gated to `gameMode === 'golden'` only
- All `heroDeck.pop()` calls in card ability files — consistently null-checked
- "Each other player" effects — all silently skipped in solo with log messages

---

## Suggested Fix Order

1. C1 + C2 + C3 (core gameplay bugs — HYDRA, await, expansion HQ fills)
2. M1 + M2 + M3 (card ability async/index bugs)
3. C4 + C5 + M6 (HTML/CSS structural cleanup)
4. M4 + M5 (global state reset, Helicarrier edge case)
5. L1-L10 (opportunistic cleanup during expansion work)
