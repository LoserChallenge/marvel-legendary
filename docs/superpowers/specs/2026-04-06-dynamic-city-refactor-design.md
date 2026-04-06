# Dynamic City Refactor — Design Spec

Date: 2026-04-06
Status: Approved
Context: Revelations expansion Step 1 — foundation for Location system and Earthquake/Tsunami scheme

---

## Goal

Convert the hardcoded 5-space city infrastructure into a dynamically-sized system driven by a `citySize` variable. All existing content must work identically after the refactor. The city will support any number of spaces — arrays and HTML are generated dynamically from `citySize`. Revelations needs 3, 5, and 7, but the system is not limited to those values.

## Why This Is Needed

The Revelations expansion introduces:
- **Earthquake scheme:** 7 city spaces (2 extra "Low Tide" spaces)
- **Tsunami scheme:** 3 city spaces (Low Tide, Bridge, Streets destroyed)
- **Locations:** A new card type placed above city spaces — needs the city infrastructure to be array-based before building the Location system on top

Every piece of Revelations city-related code benefits from this refactor being done first.

---

## Current State (What Exists Today)

### Variables (25 individually-named, declared in script.js ~lines 556-579, 672-676)
- `city1TempBuff` through `city5TempBuff` (5) — per-turn temporary attack modifiers, reset each turn
- `city1PermBuff` through `city5PermBuff` (5) — permanent attack modifiers, persist all game
- `city1LocationAttack` through `city5LocationAttack` (5) — location-based attack bonuses, reset each turn
- `bridgeReserveAttack` through `sewersReserveAttack` (5) — reserved attack from card abilities, reset each turn
- `city1CosmicThreat` through `city5CosmicThreat` (5) — cosmic threat tracking per space (~line 672)

### Arrays (already dynamic)
- `city[]` — villain cards in each space (already `[null, null, null, null, null]`)
- `destroyedSpaces[]` — boolean per space (already array)
- `darkPortalSpaces[]` — boolean per space (already array)
- `citySpaceLabels[]` — space names (already array)
- `citySize` variable exists at line 555 but is rarely used

### HTML (hardcoded in index.html ~lines 666-700)
- 5 static `<div>` elements with IDs `city-1` through `city-5`
- Each contains `city-N-temp-buff` and `city-N-perm-buff` child divs (dead code — JS creates overlays dynamically, never references these IDs)

### CSS (styles.css)
- 5 individual `#city-1` through `#city-5` selectors for position styling

### Cross-File References (204 total across 8 files)
| File | Named var refs | Dynamic window[] refs | Hardcoded index refs |
|---|---|---|---|
| script.js | 80 | 18 | 4 |
| cardAbilities.js | 19 | 0 | 0 |
| cardAbilitiesDarkCity.js | 7 | 0 | 0 |
| expansionFantasticFour.js | 16 | 0 | 10 |
| expansionGuardiansOfTheGalaxy.js | 5 | 0 | 0 |
| expansionPaintTheTownRed.js | 5 | 0 | 19 |
| index.html | 10 (element IDs) | — | — |
| styles.css | 5 (ID selectors) | — | — |

---

## Target State (After Refactor)

### Variables → Arrays (4 arrays, initialized in initGame)

```js
let cityTempBuff = [];      // was city1TempBuff...city5TempBuff
let cityPermBuff = [];      // was city1PermBuff...city5PermBuff
let cityLocationAttack = []; // was city1LocationAttack...city5LocationAttack
let cityReserveAttack = [];  // was bridgeReserveAttack...sewersReserveAttack
```

Initialization (in `initGame()` or wherever city setup occurs):
```js
cityTempBuff = new Array(citySize).fill(0);
cityPermBuff = new Array(citySize).fill(0);
cityLocationAttack = new Array(citySize).fill(0);
cityReserveAttack = new Array(citySize).fill(0);
city = new Array(citySize).fill(null);
destroyedSpaces = new Array(citySize).fill(false);
darkPortalSpaces = new Array(citySize).fill(false);
```

### Conversion Patterns

**Named variable read/write → array indexing:**
```js
// Before:
city3TempBuff += value;
// After:
cityTempBuff[2] += value;
```

**If/else index chains → single array assignment:**
```js
// Before:
if (index === 0) city1PermBuff++;
else if (index === 1) city2PermBuff++;
else if (index === 2) city3PermBuff++;
else if (index === 3) city4PermBuff++;
else if (index === 4) city5PermBuff++;

// After:
cityPermBuff[index]++;
```

**window[] dynamic lookups → direct array access:**
```js
// Before:
window[`city${i + 1}TempBuff`]
// After:
cityTempBuff[i]
```

**Array literal constructions → direct array reference or slice:**
```js
// Before (LocationAttack read pattern, appears in 6 files):
[
  { value: city1LocationAttack, id: "bridge-label" },
  { value: city2LocationAttack, id: "streets-label" },
  ...
]
// After:
cityLocationAttack.map((value, i) => ({ value, id: `${citySpaceLabels[i].toLowerCase().replace(/\s/g, '-')}-label` }))
// Or a simpler loop if the label-to-id mapping is fixed
```

**ReserveAttack named variables → array indexing:**
```js
// Before:
bridgeReserveAttack, streetsReserveAttack, ...
// After:
cityReserveAttack[0], cityReserveAttack[1], ...
```

**Reset blocks → loop or fill:**
```js
// Before (lines 10905-10921):
city1TempBuff = 0; city2TempBuff = 0; ... city5TempBuff = 0;
city1LocationAttack = 0; ... city5LocationAttack = 0;
bridgeReserveAttack = 0; ... sewersReserveAttack = 0;

// After:
cityTempBuff.fill(0);
cityLocationAttack.fill(0);
cityReserveAttack.fill(0);
```

### HTML → Dynamic Generation

Remove the 5 static `city-N` divs from index.html. Generate them in JS during game initialization:

```js
function generateCityHTML(size) {
  const cityRow = document.querySelector('.city-row'); // or appropriate container
  cityRow.innerHTML = '';
  for (let i = 0; i < size; i++) {
    const cell = document.createElement('div');
    cell.className = 'city-space';
    cell.id = `city-${i + 1}`;
    cell.dataset.index = i;
    // Add label, click handlers, etc.
    cityRow.appendChild(cell);
  }
}
```

Dead HTML elements (`city-N-temp-buff`, `city-N-perm-buff` overlays) are removed entirely — they were never referenced by JS.

### CSS → Class-Based

Replace individual `#city-1` through `#city-5` selectors with a single `.city-space` class. Any position-specific styling uses dynamic `flex` or `grid` layout that adapts to the number of children.

```css
/* Before: */
#city-1 { /* position styles */ }
#city-2 { /* position styles */ }
...

/* After: */
.city-space {
  flex: 1 1 0;
  min-width: 0;
  /* shared styles */
}
```

### City Space Labels

Default labels remain `["The Bridge", "The Streets", "The Rooftops", "The Bank", "The Sewers"]`.

Schemes can optionally provide a `citySpaceLabels` array for non-standard sizes:
```js
// Earthquake scheme example:
citySpaceLabels: ["Low Tide 1", "Low Tide 2", "The Bridge", "The Streets", "The Rooftops", "The Bank", "The Sewers"]
```

If a scheme doesn't provide labels, the default 5-space labels are used. `citySize` defaults to 5 and is only changed when a scheme declares a different `citySpaces` count (not implemented in this refactor — that's the Earthquake scheme's job later).

---

## Files Modified

| File | Scope of Changes |
|---|---|
| **script.js** | Replace 20 variable declarations with 4 arrays; update ~80 named refs + 18 window[] refs + 4 hardcoded indices; update reset blocks; add `generateCityHTML()`; update city rendering loop |
| **cardAbilities.js** | Update ~19 named refs (PermBuff writes, LocationAttack reads) |
| **cardAbilitiesDarkCity.js** | Update ~7 named refs (LocationAttack reads/writes) |
| **expansionFantasticFour.js** | Update ~16 named refs + 10 hardcoded indices (TempBuff cosmic, ReserveAttack, Galactus destroy logic) |
| **expansionGuardiansOfTheGalaxy.js** | Update ~5 named refs (LocationAttack reads) |
| **expansionPaintTheTownRed.js** | Update ~5 named refs + 19 hardcoded indices (Sinister Six checks, Web-Slinging swaps) |
| **index.html** | Remove 5 static city divs + 10 dead overlay elements |
| **styles.css** | Replace 5 `#city-N` selectors with `.city-space` class |

---

## What Does NOT Change

- Game appearance for all existing schemes (5-space city looks identical)
- Villain movement logic (already uses `city.length` for loops)
- Escape logic (already checks `city[0]`)
- Entry logic (already uses `city[city.length - 1]`)
- `destroyedSpaces[]` and `darkPortalSpaces[]` (already arrays — just ensure they initialize to `citySize` length)
- Any card abilities that don't reference the 20 named variables
- Mastermind, HQ, hero deck, player hand — all untouched

---

## Hardcoded City Index References (Special Handling)

34 references use literal `city[0]`, `city[1]`, etc. These are **intentional** — they reference specific named spaces (Bridge=0, Streets=1, etc.) for scheme/ability effects. These do NOT change in the refactor because:
- They reference a space by its game-mechanic name (e.g., "Streets" is always index 1 in a standard city)
- For non-standard city sizes like Earthquake's 7-space city, the indices shift — but that's handled by the Earthquake scheme implementation, not this refactor

The only change: add a comment clarifying the index-to-name mapping where it's not obvious.

---

## Validation Plan

1. **Zero-change test (size 5):** After refactor, open the game with any existing scheme. City must render identically, villains must move/escape/fight correctly, all buff overlays must appear, all expansion abilities must work.

2. **Size 7 smoke test:** Temporarily set `citySize = 7` and add 7 labels. Confirm: city renders 7 spaces, villains enter at the rightmost space, advance left, escape from leftmost space. Buff arrays are length 7.

3. **Size 3 smoke test:** Set `citySize = 3`. Confirm: 3 spaces render, villain flow works correctly.

4. **Existing expansion spot-checks:**
   - Fantastic Four: Galactus destroy-space logic still works
   - Paint the Town Red: Web-Slinging and Sinister Six still work
   - Guardians of the Galaxy: Cosmic Threat buffs still apply
   - Dark City: Location attack modifiers still work

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Off-by-one errors in index conversion | Named vars used 1-based (city**1**TempBuff), arrays use 0-based — every conversion must subtract 1. Systematic grep-and-replace with manual verification. |
| Breaking expansion files | Each expansion file has a small, well-defined set of references (5-19 each). Convert and test one file at a time. |
| CSS layout breaking for non-5 sizes | Use flexbox with equal-width children. Test at 3, 5, and 7. |
| Missing a reference | The audit found 204 total references. After conversion, grep for all old variable names — any remaining hits are missed conversions. |
