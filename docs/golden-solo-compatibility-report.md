# Golden Solo Compatibility Report

**Date:** 2026-03-12
**Audited files:** cardAbilities.js, cardAbilitiesDarkCity.js, cardAbilitiesSidekicks.js, expansionFantasticFour.js, expansionGuardiansOfTheGalaxy.js, expansionPaintTheTownRed.js

---

## Key Architectural Finding

**`enterCityNotDraw = true` does NOT suppress the Golden Solo block.**

Many functions use the pattern `enterCityNotDraw = true` before calling `drawVillainCard()`, apparently intending to signal "this is a city entry, not a full villain draw." However, in `script.js` line 4668, that flag only bypasses the Reality Gem check. The entire Golden Solo block — HQ rotation, bystander discard popup, and the 2-card draw loop — runs unconditionally whenever `gameMode === 'golden'`. Every `drawVillainCard()` call in every card file, guarded or not, triggers a full Golden Solo round.

The correct fix in all cases is identical: replace `drawVillainCard()` with `processVillainCard()`.

---

## Summary

| Severity | Count |
|---|---|
| Confirmed Breaks | **32** |
| Possible Conflicts | **4** |
| Flagged / Probably Fine | **24** |
| **cardAbilitiesSidekicks.js** | **Clean — zero hits** |

Confirmed Breaks break down into two fix types:
- **28× `drawVillainCard()` → `processVillainCard()`** — mid-turn villain card plays that accidentally re-trigger the full Golden Solo round
- **4× fill-in-place HQ write → `goldenRefillHQ()`** — direct `hq[i] = heroDeck.pop()` assignments that bypass Golden Solo's rotation mechanic

---

## Confirmed Breaks

### cardAbilities.js

---

#### `EmmaFrostVoluntaryVillainForAttack` — cardAbilities.js:1594
**What it does:** Emma Frost's "Shadowed Thoughts" — player optionally plays the top villain deck card mid-turn for +2 Attack.
**Why it breaks:** `drawVillainCard()` re-triggers HQ rotation, bystander popup, and 2-card draw loop mid-turn.
**Fix:** Replace `drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `handleMystiqueEscape` — cardAbilities.js:14750
**What it does:** Mystique's escape-pile ability — converts her into a Scheme Twist, places on top of villain deck, plays it immediately.
**Why it breaks:** `drawVillainCard()` triggers full round machinery to resolve a single card. Additionally has a pre-existing async bug: `enterCityNotDraw = false` is a boolean, not a Promise — the `.then()/.catch()` chained on it never runs, meaning `resolve()` is never called and the function hangs in all game modes.
**Fix:** Replace `drawVillainCard()` with `await processVillainCard()`. Also fix the async chain bug.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `extraVillainDraw` — cardAbilities.js:14798
**What it does:** A villain's Ambush ability forces the player to play the top villain deck card as an extra mid-turn draw.
**Why it breaks:** `drawVillainCard()` triggers full round machinery instead of processing a single card.
**Fix:** Replace `await drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `bankRobbery` — cardAbilities.js:16840
**What it does:** Villain ability that attaches bystanders to a city slot, then triggers one extra villain card draw.
**Why it breaks:** `drawVillainCard()` at end of function triggers full round machinery.
**Fix:** Replace `drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `drawMultipleVillainCards(count)` — cardAbilities.js:16852
**What it does:** Utility function that draws `count` villain cards in sequence via a promise chain.
**Why it breaks:** Each iteration calls `drawVillainCard()` — if count is 3, three full Golden Solo rounds are triggered.
**Fix:** Replace `drawVillainCard()` with `processVillainCard()` in the promise chain.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `heroSkrulled` — cardAbilities.js:17008 + 17015 *(double break)*
**What it does:** A Skrull villain effect converts an HQ hero into a villain — mutates the card, places it in the villain deck, refills the vacated HQ slot, then plays the Skrull card.
**Why it breaks — Break 1:** `hq[heroIndex] = heroDeck.pop()` at line 17008 is fill-in-place refill — bypasses Golden Solo's rotation mechanic entirely.
**Why it breaks — Break 2:** `drawVillainCard()` at line 17015 triggers full round machinery to process the single Skrull entry.
**Fix:** Replace HQ write with `goldenRefillHQ(heroIndex)` when `gameMode === 'golden'`. Replace `drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** HQ rotation, villain draw count

---

#### `KOAllHeroesInHQ` — cardAbilities.js:16952
**What it does:** KOs every hero in HQ (used by scheme twists that wipe the HQ), then refills all slots from the hero deck.
**Why it breaks:** Loops `hq[i] = heroDeck.pop()` for each vacated slot — fill-in-place for up to 5 slots, fully bypassing rotation.
**Fix:** Replace the fill loop with repeated `goldenRefillHQ()` calls when `gameMode === 'golden'`.
**Affected mechanic:** HQ rotation

---

### cardAbilitiesDarkCity.js

---

#### `electroAmbush` — cardAbilitiesDarkCity.js:8255
**What it does:** Electro's Ambush — reveals top villain deck card; if it's a Scheme Twist, plays it immediately.
**Why it breaks:** `drawVillainCard()` called to process a single Scheme Twist triggers full round machinery.
**Fix:** Replace `drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `eggheadAmbush` — cardAbilitiesDarkCity.js:8282
**What it does:** Egghead's Ambush — reveals top villain deck card; if it's a Villain, plays it immediately.
**Why it breaks:** Same as `electroAmbush`.
**Fix:** Replace `drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `reignfireEscape` — cardAbilitiesDarkCity.js:9893
**What it does:** Reignfire escape effect — converts Reignfire into a Master Strike, places on villain deck, plays immediately. Uses `enterCityNotDraw = true` (ineffective — see architectural finding above).
**Why it breaks:** `drawVillainCard()` triggers full round. Also has the same pre-existing async bug as `handleMystiqueEscape` — `.then()` chained on a boolean, so `resolve()` never runs.
**Fix:** Replace `drawVillainCard()` with `await processVillainCard()`. Fix async chain bug.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `kingpinCriminalEmpire` — cardAbilitiesDarkCity.js:12899, 12908, 12922
**What it does:** Kingpin's "Criminal Empire" Tactic — reveals top 3 villain deck cards, plays each villain found via `drawVillainCard()`. Up to 3 calls with `enterCityNotDraw = true` (ineffective).
**Why it breaks:** Each of the 3 potential calls triggers a full Golden Solo round — up to 3 spurious round-starts mid-tactic.
**Fix:** Replace all 3 `drawVillainCard()` calls with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `stryfeSwiftVengeance` — cardAbilitiesDarkCity.js:12977
**What it does:** Stryfe's "Swift Vengeance" — converts a Wound into a Master Strike, places on villain deck, plays immediately. Uses `enterCityNotDraw = true` (ineffective).
**Why it breaks:** `drawVillainCard()` triggers full round machinery.
**Fix:** Replace `drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `stryfeFuriousWrath` — cardAbilitiesDarkCity.js:13472
**What it does:** Stryfe's "Furious Wrath" Tactic — reveals top 6 villain deck cards, plays any Master Strikes found via `drawVillainCard()`. Uses `enterCityNotDraw = true` (ineffective).
**Why it breaks:** Each Master Strike found fires a full Golden Solo round.
**Fix:** Replace `drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `kingpinMobWar` — cardAbilitiesDarkCity.js:14639 (auto) + 14888 (selection)
**What it does:** Kingpin's "Mob War" Tactic — takes a henchman from victory pile, places on villain deck, plays immediately. Two code paths (auto-select and player-select), both calling `drawVillainCard()` with no guard.
**Why it breaks:** Both calls trigger full Golden Solo round machinery.
**Fix:** Replace both `drawVillainCard()` calls with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `apocalypseHorsemenAreDrawingNearer` — cardAbilitiesDarkCity.js:14922 (auto) + 15165 (selection)
**What it does:** Apocalypse's "Horsemen Are Drawing Nearer" Tactic — takes a Horsemen villain from victory pile, places on villain deck, plays immediately. Two code paths.
**Why it breaks:** Both `drawVillainCard()` calls trigger full Golden Solo round machinery.
**Fix:** Replace both calls with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `organizedCrimeAmbush` — cardAbilitiesDarkCity.js:15968
**What it does:** Maggia Goons' Ambush effect — forces the player to play one extra villain card.
**Why it breaks:** Bare `drawVillainCard()` with no guard triggers full Golden Solo round mid-turn.
**Fix:** Replace `drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `KOCapturedHeroes` — cardAbilitiesDarkCity.js:16634
**What it does:** After KO-ing all captured heroes (X-Cutioner's Song and similar effects), triggers one additional villain card draw as a penalty.
**Why it breaks:** `drawVillainCard()` triggers full round machinery for what should be a single card draw.
**Fix:** Replace `await drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `KOAllHQBystanders` — cardAbilitiesDarkCity.js:15993–15994
**What it does:** KOs all bystanders attached to HQ cards, then refills those HQ slots from the hero deck using direct index assignment.
**Why it breaks:** `hq[i] = heroDeck.pop()` fill-in-place write bypasses Golden Solo's HQ rotation.
**Fix:** Replace direct HQ writes with `goldenRefillHQ(i)` calls when `gameMode === 'golden'`.
**Affected mechanic:** HQ rotation

---

### expansionFantasticFour.js

---

#### `moleManMasterOfMonsters` — expansionFantasticFour.js:2642
**What it does:** Mole Man's "Master of Monsters" Tactic — reveals top 6 villain deck cards, places any Subterranea villains back on top and plays each via `drawVillainCard()`. Uses `enterCityNotDraw = true` (ineffective).
**Why it breaks:** Up to 6 Subterranea villains each trigger a full Golden Solo round.
**Fix:** Replace `await drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `morgAmbush` — expansionFantasticFour.js:3258
**What it does:** Morg's Ambush effect — moves non-Instinct heroes from HQ to bottom of hero deck, then refills vacated slots using `hq[i] = heroDeck.pop()`.
**Why it breaks:** Fill-in-place HQ write bypasses Golden Solo's rotation mechanic.
**Fix:** Replace direct HQ writes with `goldenRefillHQ(i)` calls when `gameMode === 'golden'`.
**Affected mechanic:** HQ rotation

---

### expansionGuardiansOfTheGalaxy.js

---

#### `forgeTheInfinityGauntletSingle` — expansionGuardiansOfTheGalaxy.js:1157 + 1172
**What it does:** Infinity Gauntlet artifact ability — converts a chosen gem into a villain card, places on villain deck, plays via `await drawVillainCard()`. Two code paths (from artifacts vs. discard pile), both affected.
**Why it breaks:** Both calls trigger full Golden Solo round machinery.
**Fix:** Replace both `await drawVillainCard()` calls with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `forgeTheInfinityGauntletBoth` — expansionGuardiansOfTheGalaxy.js:1443 + 1461
**What it does:** Identical to `forgeTheInfinityGauntletSingle` but for two gems simultaneously. Two code paths.
**Why it breaks:** Both `await drawVillainCard()` calls trigger full Golden Solo rounds.
**Fix:** Replace both calls with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `timeGemAmbush` — expansionGuardiansOfTheGalaxy.js:3711
**What it does:** Time Gem Ambush — awards shards equal to top villain card's VP, then forces one extra villain card draw via bare `await drawVillainCard()` with no guard at all.
**Why it breaks:** No `enterCityNotDraw` flag, no guard — triggers the most aggressive Golden Solo round re-entry of any finding in this audit. HQ rotates, bystander popup appears, 2 villain cards drawn, all mid-turn.
**Fix:** Replace `await drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

### expansionPaintTheTownRed.js

---

#### `spliceHumansWithSpiderDNATwist` — expansionPaintTheTownRed.js:666, 682, 931
**What it does:** Scheme twist effect — plays a Sinister Six villain from the victory pile back through the villain deck. Three code paths: empty VP fallback (line 666), single-villain auto-path (line 682), and multi-villain player-selection (line 931). None use `enterCityNotDraw`.
**Why it breaks:** All three `drawVillainCard()` calls trigger full Golden Solo rounds.
**Fix:** Replace all three with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

#### `koHeroKraven` — expansionPaintTheTownRed.js:1710
**What it does:** Kraven's villain escape effect — KOs the highest-cost hero from HQ, then refills the vacated slot using `hq[heroIndex] = heroDeck.length > 0 ? heroDeck.pop() : null`.
**Why it breaks:** Fill-in-place HQ write bypasses Golden Solo's rotation.
**Fix:** Replace direct HQ write with `goldenRefillHQ(heroIndex)` when `gameMode === 'golden'`.
**Affected mechanic:** HQ rotation

---

#### `mysterioMistsOfDeception` — expansionPaintTheTownRed.js:5560
**What it does:** Mysterio's "Mists of Deception" Tactic — reveals top 5 villain deck cards, plays each Master Strike via `await drawVillainCard()`. Uses `enterCityNotDraw = true` (ineffective).
**Why it breaks:** Each Master Strike found triggers a full Golden Solo round.
**Fix:** Replace `await drawVillainCard()` with `await processVillainCard()`.
**Affected mechanic:** Villain draw count, HQ rotation, bystander spend

---

## Possible Conflicts

These effects are silently skipped in all solo modes with a "does not apply in solo play" message. That is correct for What If? Solo (no other players). In Golden Solo, the rules state that "each other player" effects should apply to the top card of the hero deck — but the exact interpretation for each card needs a rules decision before any code changes are made.

---

#### `Gambit2ndTopCardDiscardOrPutBack` — cardAbilities.js:1832
**What it does:** Gambit's "each other player looks at their top card and discards or returns it" — currently a no-op with console message.
**Golden Solo conflict:** In Golden Solo, this should apply to the top card of the hero deck. Player would see top card, then choose to discard it (KO/cycle to bottom) or return it. Currently does nothing in Golden Solo.
**Affected mechanic:** "Other player" targeting

---

#### `HawkeyeDontDrawOrDiscard` — cardAbilities.js:1838
**What it does:** Hawkeye's "each other player chooses: don't draw, or discard for a benefit" — currently a no-op with console message.
**Golden Solo conflict:** Same pattern as Gambit. Should involve the top card of the hero deck. Currently does nothing in Golden Solo.
**Affected mechanic:** "Other player" targeting

---

#### `punisherHostileInterrogation` — cardAbilitiesDarkCity.js:3282
**What it does:** Punisher's "each other player" Superpower ability — currently logs "does not apply in solo play" and does nothing.
**Golden Solo conflict:** The current message is What If? Solo wording. In Golden Solo this should apply to the top hero deck card but is being silently skipped. A Golden Solo-specific branch (or at minimum a corrected log message) is needed.
**Affected mechanic:** "Other player" targeting

---

#### `mephistoThePriceOfFailure` — cardAbilitiesDarkCity.js:12988
**What it does:** Mephisto's tactic — logs "in Solo Play, 'each other player' refers to you" and adds The Price of Failure to victory pile with no wound.
**Golden Solo conflict:** In Golden Solo, "each other player" means the top card of the hero deck — not the human player. The current logic applies the What If? Solo interpretation (you are the other player) which is wrong for Golden Solo. Should apply to the hero deck's top card instead.
**Affected mechanic:** "Other player" targeting

---

## Flagged / Probably Fine

These matched one or more search patterns but are safe on inspection. Included for completeness.

| File | Line(s) | Function | Why it's fine |
|---|---|---|---|
| cardAbilities.js | 16788–89 | `doubleVillainDraw` | Already uses `processVillainCard()` correctly — the one function in the codebase that got it right |
| cardAbilities.js | 3279, 4685, 6060 | `renderHQCards` (×3) | Read-only UI display — reads `hq[]` to render cards, never writes |
| cardAbilitiesDarkCity.js | 2473 | `freeTelepathicVillainDefeat` | `.pop()` removes a card the player just chose to defeat — targeted removal, not a draw |
| cardAbilitiesDarkCity.js | 3230 | `punisherHailOfBullets` | Same — targeted defeat removal |
| cardAbilitiesDarkCity.js | 7047 | `professorXHandleBystanderCard` | `.pop()` rescues a bystander off the deck top — card removal, not a villain draw |
| cardAbilitiesDarkCity.js | 7102 | `initiateTelepathicVillainFight` | `.pop()` removes villain being fought — targeted removal |
| cardAbilitiesDarkCity.js | 9740, 9791 | `chimeraAmbush` | Inspect-and-return pattern — cards popped to examine, pushed back; no draw triggered |
| cardAbilitiesDarkCity.js | 12870, 12925, 12928 | `kingpinCriminalEmpire` | `.pop()` for inspection, `.push()` returns non-villain cards — safe deck manipulation |
| cardAbilitiesDarkCity.js | 13438, 13486 | `stryfeFuriousWrath` | `.pop()` for inspection only — the downstream `drawVillainCard()` at 13472 is the break, listed above |
| cardAbilitiesDarkCity.js | 13499, 13540 | `mrSinisterMasterGeneticist` | Inspect-and-return; no `drawVillainCard()` call |
| cardAbilitiesDarkCity.js | 15944 | `GoonsEscape` | Reshuffles goons back into villain deck with no downstream draw |
| cardAbilitiesDarkCity.js | 16791 | inline post-defeat block | Plutonium cards returned to shuffled deck — no draw triggered |
| expansionFantasticFour.js | 2600, 2653 | `moleManMasterOfMonsters` | Look-ahead `.pop()` and deck-bottom `.unshift()` — the break is the `drawVillainCard()` at 2642, listed above |
| expansionFantasticFour.js | 5766 | `freeTelepathicVillainDefeat` | Targeted defeat removal, same as DarkCity 2473 |
| expansionGuardiansOfTheGalaxy.js | 3087 | `realityGemVillainChoice` onclick | Rotates top card to bottom of villain deck — deck manipulation only, no round logic |
| expansionGuardiansOfTheGalaxy.js | 4373, 4378 | `draxTheDestroyerTheDestroyer` | "Other player" already suppressed with console message |
| expansionGuardiansOfTheGalaxy.js | 6081 | `otherPlayerNoEffect` | Correct What If? Solo suppression helper — already a no-op |
| expansionPaintTheTownRed.js | 2670 | `blackCatCatBurglarNonEffect` | "Other player" already suppressed with console message |
| expansionPaintTheTownRed.js | 5518, 5573 | `mysterioMistsOfDeception` | Look-ahead `.pop()` and deck-bottom `.unshift()` — the break is the `drawVillainCard()` at 5560, listed above |

---

## Clean Files

**`cardAbilitiesSidekicks.js` — zero hits across all search patterns. No changes needed.**

---

## Fix Summary by Type

### Fix Type 1: Replace `drawVillainCard()` with `processVillainCard()` (28 call sites across 5 files)

| File | Function | Line(s) |
|---|---|---|
| cardAbilities.js | `EmmaFrostVoluntaryVillainForAttack` | 1594 |
| cardAbilities.js | `handleMystiqueEscape` | 14750 |
| cardAbilities.js | `extraVillainDraw` | 14798 |
| cardAbilities.js | `bankRobbery` | 16840 |
| cardAbilities.js | `drawMultipleVillainCards` | 16852 |
| cardAbilities.js | `heroSkrulled` | 17015 |
| cardAbilitiesDarkCity.js | `electroAmbush` | 8255 |
| cardAbilitiesDarkCity.js | `eggheadAmbush` | 8282 |
| cardAbilitiesDarkCity.js | `reignfireEscape` | 9893 |
| cardAbilitiesDarkCity.js | `kingpinCriminalEmpire` | 12899, 12908, 12922 |
| cardAbilitiesDarkCity.js | `stryfeSwiftVengeance` | 12977 |
| cardAbilitiesDarkCity.js | `stryfeFuriousWrath` | 13472 |
| cardAbilitiesDarkCity.js | `kingpinMobWar` | 14639, 14888 |
| cardAbilitiesDarkCity.js | `apocalypseHorsemenAreDrawingNearer` | 14922, 15165 |
| cardAbilitiesDarkCity.js | `organizedCrimeAmbush` | 15968 |
| cardAbilitiesDarkCity.js | `KOCapturedHeroes` | 16634 |
| expansionFantasticFour.js | `moleManMasterOfMonsters` | 2642 |
| expansionGuardiansOfTheGalaxy.js | `forgeTheInfinityGauntletSingle` | 1157, 1172 |
| expansionGuardiansOfTheGalaxy.js | `forgeTheInfinityGauntletBoth` | 1443, 1461 |
| expansionGuardiansOfTheGalaxy.js | `timeGemAmbush` | 3711 |
| expansionPaintTheTownRed.js | `spliceHumansWithSpiderDNATwist` | 666, 682, 931 |
| expansionPaintTheTownRed.js | `mysterioMistsOfDeception` | 5560 |

### Fix Type 2: Replace fill-in-place HQ write with `goldenRefillHQ()` (4 functions across 4 files)

| File | Function | Line(s) |
|---|---|---|
| cardAbilities.js | `heroSkrulled` | 17008 |
| cardAbilities.js | `KOAllHeroesInHQ` | 16952 |
| cardAbilitiesDarkCity.js | `KOAllHQBystanders` | 15993–15994 |
| expansionFantasticFour.js | `morgAmbush` | 3258 |
| expansionPaintTheTownRed.js | `koHeroKraven` | 1710 |

### Additional: Async bug fixes (not Golden Solo specific, but found during audit)

| File | Function | Issue |
|---|---|---|
| cardAbilities.js | `handleMystiqueEscape` | `.then()` chained on boolean — `resolve()` never called, function hangs |
| cardAbilitiesDarkCity.js | `reignfireEscape` | Same async chain bug |

### Fix Type 3: "Other player" Golden Solo handling (requires rules decision first)

| File | Function | Current behaviour |
|---|---|---|
| cardAbilities.js | `Gambit2ndTopCardDiscardOrPutBack` | Silent no-op in all solo modes |
| cardAbilities.js | `HawkeyeDontDrawOrDiscard` | Silent no-op in all solo modes |
| cardAbilitiesDarkCity.js | `punisherHostileInterrogation` | Silent no-op with What If? Solo message |
| cardAbilitiesDarkCity.js | `mephistoThePriceOfFailure` | Applies What If? Solo "you are the other player" logic — wrong in Golden Solo |
