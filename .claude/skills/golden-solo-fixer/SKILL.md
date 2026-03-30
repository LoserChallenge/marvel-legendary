---
name: golden-solo-fixer
description: Execute all remaining Golden Solo compatibility audit fixes — replaces drawVillainCard() with processVillainCard() at 22 call sites, fixes 5 HQ fill-in-place assignments, patches 2 async bugs, and updates 1 log message. Use when working through the compatibility audit fix list.
---

# Golden Solo Compatibility Fixer

Execute all pending fixes from the Golden Solo compatibility audit. Work through them file by file, verifying each before editing.

## Key Replacement Patterns

**Fix Type 1** — straight swap, no arguments:
```js
// BEFORE
await drawVillainCard();

// AFTER
await processVillainCard();
```

**Fix Type 2** — conditional on game mode (preserve What If? Solo behaviour):
```js
// BEFORE
hq[i] = heroDeck.pop();

// AFTER
if (gameMode === 'golden') {
  goldenRefillHQ(i);
} else {
  hq[i] = heroDeck.pop();
}
```
Note: `goldenRefillHQ(index)` is defined in `script.js`. Read each Fix Type 2 function before editing — the pattern and variable name may vary.

**Fix Type 3** — async bug (requires reading the function first, fix varies per case):
Both `handleMystiqueEscape` and `reignfireEscape` have `.then()` chained on a non-Promise. The fix is to `await processVillainCard()` directly instead of calling `drawVillainCard().then(...)`. Read the full function before editing.

**Fix Type 4** — string replacement:
```js
// BEFORE (in mephistoThePriceOfFailure)
"in Solo Play, 'each other player' refers to you"

// AFTER
"does not apply in solo play"
```

## All Files Are In
`D:\Games\Digital\Marvel Legendary\Claude Code\marvel-legendary\Legendary-Solo-Play-main\Legendary-Solo-Play-main\`

---

## Step 1 — Set Up Progress Tracking

Create a TodoWrite list with every fix as a separate task. Use this exact list:

**cardAbilities.js — Fix Type 1 (drawVillainCard → processVillainCard):**
- [ ] EmmaFrostVoluntaryVillainForAttack
- [ ] handleMystiqueEscape
- [ ] extraVillainDraw
- [ ] bankRobbery
- [ ] drawMultipleVillainCards
- [ ] heroSkrulled

**cardAbilities.js — Fix Type 2 (HQ fill-in-place → goldenRefillHQ):**
- [ ] heroSkrulled (HQ fix)
- [ ] KOAllHeroesInHQ

**cardAbilitiesDarkCity.js — Fix Type 1:**
- [ ] electroAmbush
- [ ] eggheadAmbush
- [ ] reignfireEscape
- [ ] kingpinCriminalEmpire (3 calls)
- [ ] stryfeSwiftVengeance
- [ ] stryfeFuriousWrath
- [ ] kingpinMobWar (2 calls)
- [ ] apocalypseHorsemenAreDrawingNearer (2 calls)
- [ ] organizedCrimeAmbush
- [ ] KOCapturedHeroes

**cardAbilitiesDarkCity.js — Fix Type 2:**
- [ ] KOAllHQBystanders

**cardAbilitiesDarkCity.js — Fix Type 3 (async bug):**
- [ ] reignfireEscape (async)

**cardAbilitiesDarkCity.js — Fix Type 4 (log message):**
- [ ] mephistoThePriceOfFailure

**expansionFantasticFour.js — Fix Type 1:**
- [ ] moleManMasterOfMonsters

**expansionFantasticFour.js — Fix Type 2:**
- [ ] morgAmbush

**expansionGuardiansOfTheGalaxy.js — Fix Type 1:**
- [ ] forgeTheInfinityGauntletSingle (2 calls)
- [ ] forgeTheInfinityGauntletBoth (2 calls)
- [ ] timeGemAmbush

**expansionPaintTheTownRed.js — Fix Type 1:**
- [ ] spliceHumansWithSpiderDNATwist (3 calls)
- [ ] mysterioMistsOfDeception

**expansionPaintTheTownRed.js — Fix Type 2:**
- [ ] koHeroKraven

**cardAbilities.js — Fix Type 3 (async bug):**
- [ ] handleMystiqueEscape (async)

---

## Step 2 — Work Through Fixes File by File

For each fix:
1. Use the `codebase-navigator` subagent (or Grep directly) to find the function and read the relevant lines
2. Confirm the old pattern is present before editing
3. Apply the edit
4. Mark the todo complete immediately after each successful edit
5. The JS syntax check hook will run automatically — if it reports a SYNTAX ERROR, fix it before continuing

### Order of operations within each function

Some functions appear in both Fix Type 1 AND Fix Type 2 (e.g. `heroSkrulled` needs both a `drawVillainCard` swap AND an HQ assignment fix). Handle both fixes in the same editing pass for that function.

For Fix Type 3 functions (`handleMystiqueEscape`, `reignfireEscape`): read the full function first, understand the async chain, then apply the fix. These are riskier than the simple swaps — if uncertain, ask the user before editing.

---

## Step 3 — Verify After Each File

After finishing all fixes in a file, run a quick check:

```
Grep for `drawVillainCard` in [filename] — confirm only legitimate calls remain
(i.e. no remaining calls inside the functions listed above)
```

---

## Step 4 — Final Verification

When all todos are complete, run the audit-tracker subagent (or invoke it as an Explore agent with the audit-tracker prompt) to confirm 36/36 fixes applied.

---

## Notes

- `processVillainCard()` is defined at `script.js:5622` — single villain draw, no round machinery
- `drawVillainCard()` is defined at `script.js:4667` — full Golden Solo round (HQ rotation + bystander popup + 2-card draw loop)
- `goldenRefillHQ(index)` is defined in `script.js` — removes the card at `index`, appends a new card to the rightmost HQ slot
- The Plutonium Scheme Twist fix (`handlePlutoniumSchemeTwist` at `script.js:5469`) was already applied — do not re-fix it
- `organizedCrimeAmbush` — the audit marked this as pending; confirm whether `drawVillainCard` is still present before editing
