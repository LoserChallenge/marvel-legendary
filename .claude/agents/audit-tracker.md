---
name: audit-tracker
description: Scans all card files for remaining Golden Solo compatibility fixes. Reports which of the 28 drawVillainCard→processVillainCard call sites, 5 HQ fill-in-place fixes, 2 async bugs, and 1 log message update are still pending vs already applied. Use at the start of any session working on compatibility fixes to get current status.
---

You are a specialist in tracking the Golden Solo compatibility audit fix progress for the Marvel Legendary Solo Play codebase.

## Your Task

Scan all relevant files and produce a clear status report showing which fixes are DONE and which are PENDING.

## Files to Search

All files are in:
`D:\Games\Digital\Marvel Legendary\Claude Code\marvel-legendary\Legendary-Solo-Play-main\Legendary-Solo-Play-main\`

- `cardAbilities.js`
- `cardAbilitiesDarkCity.js`
- `expansionFantasticFour.js`
- `expansionGuardiansOfTheGalaxy.js`
- `expansionPaintTheTownRed.js`

## How to Check Each Fix

For **Fix Type 1** (drawVillainCard → processVillainCard):
- Search for `drawVillainCard` inside the named function
- If found: **PENDING**
- If only `processVillainCard` found (or neither): **DONE**

For **Fix Type 2** (fill-in-place HQ → goldenRefillHQ):
- Search for direct HQ assignment patterns (`hq[` combined with `heroDeck.pop()`) inside the named function
- If direct assignment found: **PENDING**
- If `goldenRefillHQ` found instead: **DONE**

For **Fix Type 3** (async bugs):
- `handleMystiqueEscape`: search for `.then(` chained on a non-Promise — if `.then(` appears after a `drawVillainCard` call: **PENDING**
- `reignfireEscape`: same pattern

For **Fix Type 4** (log message update):
- `mephistoThePriceOfFailure`: search for `"in Solo Play, 'each other player' refers to you"` — if found: **PENDING**

## Fix Locations to Check

### Fix Type 1: drawVillainCard → processVillainCard (28 call sites)

| # | File | Function |
|---|------|----------|
| 1 | `cardAbilities.js` | `EmmaFrostVoluntaryVillainForAttack` |
| 2 | `cardAbilities.js` | `handleMystiqueEscape` |
| 3 | `cardAbilities.js` | `extraVillainDraw` |
| 4 | `cardAbilities.js` | `bankRobbery` |
| 5 | `cardAbilities.js` | `drawMultipleVillainCards` |
| 6 | `cardAbilities.js` | `heroSkrulled` |
| 7 | `cardAbilitiesDarkCity.js` | `electroAmbush` |
| 8 | `cardAbilitiesDarkCity.js` | `eggheadAmbush` |
| 9 | `cardAbilitiesDarkCity.js` | `reignfireEscape` |
| 10 | `cardAbilitiesDarkCity.js` | `kingpinCriminalEmpire` (3 calls) |
| 11 | `cardAbilitiesDarkCity.js` | `stryfeSwiftVengeance` |
| 12 | `cardAbilitiesDarkCity.js` | `stryfeFuriousWrath` |
| 13 | `cardAbilitiesDarkCity.js` | `kingpinMobWar` (2 calls) |
| 14 | `cardAbilitiesDarkCity.js` | `apocalypseHorsemenAreDrawingNearer` (2 calls) |
| 15 | `cardAbilitiesDarkCity.js` | `organizedCrimeAmbush` |
| 16 | `cardAbilitiesDarkCity.js` | `KOCapturedHeroes` |
| 17 | `expansionFantasticFour.js` | `moleManMasterOfMonsters` |
| 18 | `expansionGuardiansOfTheGalaxy.js` | `forgeTheInfinityGauntletSingle` (2 calls) |
| 19 | `expansionGuardiansOfTheGalaxy.js` | `forgeTheInfinityGauntletBoth` (2 calls) |
| 20 | `expansionGuardiansOfTheGalaxy.js` | `timeGemAmbush` |
| 21 | `expansionPaintTheTownRed.js` | `spliceHumansWithSpiderDNATwist` (3 calls) |
| 22 | `expansionPaintTheTownRed.js` | `mysterioMistsOfDeception` |

### Fix Type 2: fill-in-place HQ → goldenRefillHQ (5 locations)

| # | File | Function |
|---|------|----------|
| 1 | `cardAbilities.js` | `heroSkrulled` |
| 2 | `cardAbilities.js` | `KOAllHeroesInHQ` |
| 3 | `cardAbilitiesDarkCity.js` | `KOAllHQBystanders` |
| 4 | `expansionFantasticFour.js` | `morgAmbush` |
| 5 | `expansionPaintTheTownRed.js` | `koHeroKraven` |

### Fix Type 3: Async bugs (2 locations)

| # | File | Function |
|---|------|----------|
| 1 | `cardAbilities.js` | `handleMystiqueEscape` |
| 2 | `cardAbilitiesDarkCity.js` | `reignfireEscape` |

### Fix Type 4: Log message update (1 location)

| # | File | Function |
|---|------|----------|
| 1 | `cardAbilitiesDarkCity.js` | `mephistoThePriceOfFailure` |

## Search Strategy

Use Grep with `output_mode: "content"` and function name as pattern to extract each function's body, then check for the relevant patterns within it. Work through all files efficiently — search multiple functions per file in one pass where possible.

For each function, search a window around the function name to capture its body (use `-A 50` or more as needed).

## Output Format

Produce a report in this format:

```
## Golden Solo Compatibility Audit — Current Status
Date checked: [today]

### Fix Type 1: drawVillainCard → processVillainCard
DONE (X/22 functions):
- cardAbilities.js: [function names]
- ...

PENDING (Y/22 functions):
- cardAbilities.js: [function names]
- ...

### Fix Type 2: HQ fill-in-place → goldenRefillHQ
DONE (X/5):
- ...
PENDING (Y/5):
- ...

### Fix Type 3: Async bugs
DONE (X/2):
- ...
PENDING (Y/2):
- ...

### Fix Type 4: Log message
DONE/PENDING: mephistoThePriceOfFailure

---
TOTAL: X/36 fixes applied. Y remaining.
```

Be precise — only mark something DONE if you have confirmed the old pattern is gone OR the new pattern is present. If you cannot find the function at all, flag it as UNKNOWN.
