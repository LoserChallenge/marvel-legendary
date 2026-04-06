# Dynamic City Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the hardcoded 5-space city infrastructure to a dynamically-sized system driven by `citySize`, so the game can support any number of city spaces.

**Architecture:** Replace 25 individually-named city buff/tracking variables with 5 index-based arrays. Generate city HTML dynamically instead of using 5 static divs. All existing content continues to work identically — this is a pure refactor with zero behavior change for the default 5-space city.

**Tech Stack:** Vanilla JS, HTML, CSS (no frameworks, no build step, no test runner)

**Spec:** `docs/superpowers/specs/2026-04-06-dynamic-city-refactor-design.md`

**Verification approach:** No automated test suite exists. Each task ends with `node --check` for syntax verification. Final task is manual browser testing.

---

## Variable Mapping Reference

Every task references this mapping. Old name → new array + index:

| Old Variable | New Array | Index |
|---|---|---|
| `city1TempBuff` ... `city5TempBuff` | `cityTempBuff[i]` | 0-4 |
| `city1PermBuff` ... `city5PermBuff` | `cityPermBuff[i]` | 0-4 |
| `city1LocationAttack` ... `city5LocationAttack` | `cityLocationAttack[i]` | 0-4 |
| `bridgeReserveAttack` | `cityReserveAttack[0]` | 0 |
| `streetsReserveAttack` | `cityReserveAttack[1]` | 1 |
| `rooftopsReserveAttack` | `cityReserveAttack[2]` | 2 |
| `bankReserveAttack` | `cityReserveAttack[3]` | 3 |
| `sewersReserveAttack` | `cityReserveAttack[4]` | 4 |
| `city1CosmicThreat` ... `city5CosmicThreat` | `cityCosmicThreat[i]` | 0-4 |

**1-based to 0-based conversion:** `city1TempBuff` → `cityTempBuff[0]`, `city2TempBuff` → `cityTempBuff[1]`, etc. The number in the old name is 1-based; the array index is 0-based (subtract 1).

**`window[]` dynamic access conversion:** `window[\`city${i + 1}TempBuff\`]` → `cityTempBuff[i]` (the `i + 1` in the template literal was compensating for the 1-based naming — no longer needed).

---

## City Space Configuration Reference

Each city space has a label, a background image, and a background-position CSS value. This data moves from hardcoded HTML/CSS into a JS configuration array used by `generateCityHTML()`:

```js
const CITY_SPACE_DEFAULTS = [
  { label: "The Bridge",   bg: "Bridge.webp",   bgPos: "top" },
  { label: "The Streets",  bg: "Streets.webp",  bgPos: "center" },
  { label: "The Rooftops", bg: "Rooftops.webp", bgPos: "top" },
  { label: "The Bank",     bg: "Bank.webp",     bgPos: "center" },
  { label: "The Sewers",   bg: "Sewers.webp",   bgPos: "center" },
];
```

Schemes that change city size provide their own config array via `scheme.citySpaces`. If absent, `CITY_SPACE_DEFAULTS` is used.

---

### Task 1: Worktree Setup

**Files:** None modified yet — git operations only.

- [ ] **Step 1: Create worktree branch**

```bash
cd "d:/Games/Digital/Marvel Legendary/Claude Code/marvel-legendary"
git worktree add .worktrees/dynamic-city -b dynamic-city
```

- [ ] **Step 2: Verify worktree**

```bash
cd .worktrees/dynamic-city
ls Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
```

Expected: file exists.

All subsequent tasks work in `.worktrees/dynamic-city/Legendary-Solo-Play-main/Legendary-Solo-Play-main/`.

---

### Task 2: Replace Variable Declarations in script.js

**Files:**
- Modify: `script.js:543-583` (variable declarations)
- Modify: `script.js:672-676` (CosmicThreat declarations)

- [ ] **Step 1: Replace city array and buff variable declarations (lines 543-579)**

Replace this block:

```js
let city = [null, null, null, null, null];
let destroyedSpaces = [false, false, false, false, false];
let darkPortalSpaces = [false, false, false, false, false];
let darkPortalMastermind = false;
let darkPortalMastermindRendered = false;
const citySpaceLabels = [
  "The Bridge",
  "The Streets",
  "The Rooftops",
  "The Bank",
  "The Sewers",
];
let citySize = 5;
var city1TempBuff = 0;
var city2TempBuff = 0;
var city3TempBuff = 0;
var city4TempBuff = 0;
var city5TempBuff = 0;
var city1LocationAttack = 0;
var city2LocationAttack = 0;
var city3LocationAttack = 0;
var city4LocationAttack = 0;
var city5LocationAttack = 0;
var mastermindTempBuff = 0;
var city1PermBuff = 0;
var city2PermBuff = 0;
var city3PermBuff = 0;
var city4PermBuff = 0;
var city5PermBuff = 0;
var mastermindPermBuff = 0;
let mastermindPermBuffDynamicPrev = 0;
var mastermindReserveAttack = 0;
var bridgeReserveAttack = 0;
var streetsReserveAttack = 0;
var rooftopsReserveAttack = 0;
var bankReserveAttack = 0;
var sewersReserveAttack = 0;
```

With:

```js
// City space configuration — default 5 spaces, schemes can override via scheme.citySpaces
const CITY_SPACE_DEFAULTS = [
  { label: "The Bridge",   bg: "Bridge.webp",   bgPos: "top" },
  { label: "The Streets",  bg: "Streets.webp",  bgPos: "center" },
  { label: "The Rooftops", bg: "Rooftops.webp", bgPos: "top" },
  { label: "The Bank",     bg: "Bank.webp",     bgPos: "center" },
  { label: "The Sewers",   bg: "Sewers.webp",   bgPos: "center" },
];
let citySize = 5;
let citySpaces = CITY_SPACE_DEFAULTS; // active config for current game
let citySpaceLabels = CITY_SPACE_DEFAULTS.map(s => s.label);
let city = [];
let destroyedSpaces = [];
let darkPortalSpaces = [];
let darkPortalMastermind = false;
let darkPortalMastermindRendered = false;
// Per-space buff arrays — initialized to citySize in initCityArrays()
let cityTempBuff = [];
let cityPermBuff = [];
let cityLocationAttack = [];
let cityReserveAttack = [];
var mastermindTempBuff = 0;
var mastermindPermBuff = 0;
let mastermindPermBuffDynamicPrev = 0;
var mastermindReserveAttack = 0;
```

- [ ] **Step 2: Replace CosmicThreat declarations (~line 672)**

Replace:

```js
let city1CosmicThreat = 0;
let city2CosmicThreat = 0;
let city3CosmicThreat = 0;
let city4CosmicThreat = 0;
let city5CosmicThreat = 0;
```

With:

```js
let cityCosmicThreat = [];
```

- [ ] **Step 3: Add initCityArrays() helper function**

Add this function near the declarations (after the variable block, before it's needed):

```js
function initCityArrays() {
  city = new Array(citySize).fill(null);
  destroyedSpaces = new Array(citySize).fill(false);
  darkPortalSpaces = new Array(citySize).fill(false);
  cityTempBuff = new Array(citySize).fill(0);
  cityPermBuff = new Array(citySize).fill(0);
  cityLocationAttack = new Array(citySize).fill(0);
  cityReserveAttack = new Array(citySize).fill(0);
  cityCosmicThreat = new Array(citySize).fill(0);
}
```

- [ ] **Step 4: Wire initCityArrays() into game initialization**

Find where `initGame()` or game setup currently initializes `city = [null, null, null, null, null]` (it may re-initialize on new game). Add a call to `initCityArrays()` at the start of game initialization. Search for any place that re-sets `city = [null, null, null, null, null]` and replace with `initCityArrays()`.

- [ ] **Step 5: Syntax check**

```bash
node --check script.js
```

Expected: no errors. (The old variable names are still referenced elsewhere — that's OK, we'll fix them file by file. This step just confirms the declarations compile.)

Note: syntax check will fail because old names are now undefined. That's expected — proceed to Task 3. The game won't be functional until all tasks through Task 11 are complete.

- [ ] **Step 6: Commit**

```bash
git add script.js
git commit -m "refactor: replace 25 hardcoded city buff variables with 5 dynamic arrays

Declarations only — references not yet converted. Arrays initialized via
initCityArrays() which sizes everything to citySize."
```

---

### Task 3: Convert script.js — Reset Block + Cosmic Threat Functions

**Files:**
- Modify: `script.js:~10905-10946` (turn reset block)
- Modify: `script.js:~13438-13478` (removeCosmicThreatBuff + removeHQCosmicThreatBuff)

- [ ] **Step 1: Convert the turn reset block (~lines 10905-10946)**

Replace:

```js
city1TempBuff = 0;
city2TempBuff = 0;
city3TempBuff = 0;
city4TempBuff = 0;
city5TempBuff = 0;
city1LocationAttack = 0;
city2LocationAttack = 0;
city3LocationAttack = 0;
city4LocationAttack = 0;
city5LocationAttack = 0;
mastermindTempBuff = 0;
mastermindReserveAttack = 0;
bridgeReserveAttack = 0;
streetsReserveAttack = 0;
rooftopsReserveAttack = 0;
bankReserveAttack = 0;
sewersReserveAttack = 0;
```

With:

```js
cityTempBuff.fill(0);
cityLocationAttack.fill(0);
cityReserveAttack.fill(0);
mastermindTempBuff = 0;
mastermindReserveAttack = 0;
```

Note: `cityPermBuff` is NOT reset (permanent buffs persist across turns). `cityCosmicThreat` is NOT reset here (it's managed by the cosmic threat functions).

- [ ] **Step 2: Find and replace the CosmicThreat reset block**

Nearby (~lines 10942-10946), replace:

```js
city1CosmicThreat = 0;
city2CosmicThreat = 0;
city3CosmicThreat = 0;
city4CosmicThreat = 0;
city5CosmicThreat = 0;
```

With:

```js
cityCosmicThreat.fill(0);
```

- [ ] **Step 3: Convert removeCosmicThreatBuff() (~line 13438)**

Replace the entire function:

```js
function removeCosmicThreatBuff(cityIndex) {
  if (cityIndex === 0 && city1CosmicThreat > 0) {
    city1TempBuff += city1CosmicThreat;
    city1CosmicThreat = 0;
  } else if (cityIndex === 1 && city2CosmicThreat > 0) {
    city2TempBuff += city2CosmicThreat;
    city2CosmicThreat = 0;
  } else if (cityIndex === 2 && city3CosmicThreat > 0) {
    city3TempBuff += city3CosmicThreat;
    city3CosmicThreat = 0;
  } else if (cityIndex === 3 && city4CosmicThreat > 0) {
    city4TempBuff += city4CosmicThreat;
    city4CosmicThreat = 0;
  } else if (cityIndex === 4 && city5CosmicThreat > 0) {
    city5TempBuff += city5CosmicThreat;
    city5CosmicThreat = 0;
  }

  updateGameBoard();
}
```

With:

```js
function removeCosmicThreatBuff(cityIndex) {
  if (cityCosmicThreat[cityIndex] > 0) {
    cityTempBuff[cityIndex] += cityCosmicThreat[cityIndex];
    cityCosmicThreat[cityIndex] = 0;
  }
  updateGameBoard();
}
```

- [ ] **Step 4: Convert removeHQCosmicThreatBuff() (immediately after)**

Same pattern — replace the 5-way if/else chain with:

```js
function removeHQCosmicThreatBuff(index) {
  if (cityCosmicThreat[index] > 0) {
    cityTempBuff[index] += cityCosmicThreat[index];
    cityCosmicThreat[index] = 0;
  }
  updateGameBoard();
}
```

- [ ] **Step 5: Commit**

```bash
git add script.js
git commit -m "refactor: convert reset block + cosmic threat functions to array access"
```

---

### Task 4: Convert script.js — Fight Affordability

**Files:**
- Modify: `script.js:~7020-7050` (city villain fight affordability)
- Modify: `script.js:~7275-7300` (second affordability block if present)
- Modify: `script.js:~7530-7545` (third affordability block if present)
- Modify: `script.js:~11145-11160` (fight execution)
- Modify: `script.js:~11520-11540` (fight execution — second path)
- Modify: `script.js:~11560-11620` (ReserveAttack deduction after fight)
- Modify: `script.js:~7670-7680` (reserve attack display array)

- [ ] **Step 1: Convert the cityReserveAttacks array literal (~line 7021)**

Replace:

```js
const cityReserveAttacks = [
  bridgeReserveAttack,
  streetsReserveAttack,
  rooftopsReserveAttack,
  bankReserveAttack,
  sewersReserveAttack,
];
```

With:

```js
const cityReserveAttacks = cityReserveAttack;
```

Or better — just use `cityReserveAttack` directly everywhere `cityReserveAttacks` was used. Search for all `cityReserveAttacks[` in the fight affordability section and replace with `cityReserveAttack[`. Then remove the `const cityReserveAttacks` declaration entirely.

- [ ] **Step 2: Convert window[] LocationAttack lookups in fight code**

Search script.js for all instances of:
```js
window[`city${i + 1}LocationAttack`]
```

Replace each with:
```js
cityLocationAttack[i]
```

There are 5 occurrences in script.js (lines ~7041, ~7296, ~7537, ~11147, ~11522).

- [ ] **Step 3: Convert ReserveAttack deduction after fight (~lines 11564-11615)**

There are two if/else chains that deduct reserved attack after a fight. Each looks like:

```js
if (villainIndex === 0) bridgeReserveAttack -= reservedAttackUsed;
else if (villainIndex === 1) streetsReserveAttack -= reservedAttackUsed;
else if (villainIndex === 2) rooftopsReserveAttack -= reservedAttackUsed;
else if (villainIndex === 3) bankReserveAttack -= reservedAttackUsed;
else if (villainIndex === 4) sewersReserveAttack -= reservedAttackUsed;
```

Replace each with:

```js
cityReserveAttack[villainIndex] -= reservedAttackUsed;
```

- [ ] **Step 4: Convert reserve attack display array (~line 7674)**

Search for the array that builds reserve attack data for display:

```js
{ name: "Bridge", value: bridgeReserveAttack }
```

Replace with a dynamic construction:

```js
cityReserveAttack.map((value, i) => ({ name: citySpaceLabels[i], value }))
```

Or if the surrounding code iterates differently, replace each named reference with `cityReserveAttack[i]`.

- [ ] **Step 5: Find any remaining ReserveAttack array literals in script.js**

Grep for `bridgeReserveAttack|streetsReserveAttack|rooftopsReserveAttack|bankReserveAttack|sewersReserveAttack` in script.js. Convert any remaining hits.

- [ ] **Step 6: Commit**

```bash
git add script.js
git commit -m "refactor: convert fight affordability + reserve attack to array access"
```

---

### Task 5: Convert script.js — updateGameBoard Rendering

**Files:**
- Modify: `script.js:~8219-8225` (LocationAttack label array)
- Modify: `script.js:~8262-8277` (TempBuff/PermBuff overlay rendering)

- [ ] **Step 1: Convert LocationAttack label array (~line 8219)**

Replace:

```js
const locations = [
  { value: city1LocationAttack, id: "bridge-label" },
  { value: city2LocationAttack, id: "streets-label" },
  { value: city3LocationAttack, id: "rooftops-label" },
  { value: city4LocationAttack, id: "bank-label" },
  { value: city5LocationAttack, id: "sewers-label" },
];
```

With:

```js
const locations = cityLocationAttack.map((value, idx) => ({
  value,
  id: `city-label-${idx}`,
}));
```

Note: the label element IDs are changing from name-based (`bridge-label`) to index-based (`city-label-0`) because they'll be generated dynamically. This must match what `generateCityHTML()` creates in Task 6.

- [ ] **Step 2: Convert TempBuff/PermBuff overlay rendering (~line 8262)**

Replace:

```js
const currentTempBuff = window[`city${i + 1}TempBuff`];
```

With:

```js
const currentTempBuff = cityTempBuff[i];
```

Replace:

```js
const currentPermBuff = window[`city${i + 1}PermBuff`];
```

With:

```js
const currentPermBuff = cityPermBuff[i];
```

- [ ] **Step 3: Search for any remaining window[] city buff lookups in script.js**

Grep script.js for `window\[\`city` — there should be additional hits around lines ~9652 and ~11416-11417. Convert each:
- `window[\`city${...}TempBuff\`]` → `cityTempBuff[...]`
- `window[\`city${...}PermBuff\`]` → `cityPermBuff[...]`

Adjust the index expression: if the original uses `i + 1`, the new version uses just `i`.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "refactor: convert updateGameBoard rendering to array access"
```

---

### Task 6: Dynamic City HTML Generation

**Files:**
- Modify: `index.html:~666-700` (remove static city divs)
- Modify: `index.html:~707-721` (remove static label divs)
- Modify: `styles.css:~700-743` (replace #city-N selectors)
- Modify: `script.js` (add generateCityHTML function)

- [ ] **Step 1: Replace static city divs in index.html (~lines 666-700)**

Remove the 5 city divs (from `<div class="cell city" id="city-1">` through the closing `</div>` of city-5). Replace with a single comment marker:

```html
        <!-- City spaces generated dynamically by generateCityHTML() -->
```

The mastermind cell (before city-1) and villain-deck cell (after city-5) stay as-is.

- [ ] **Step 2: Replace static label divs in index.html (~lines 707-721)**

The label row currently has hardcoded elements for each city space name:

```html
<div class="cell-label">
  <p class="labeltext" id="bridge-label">Bridge</p>
</div>
```

(Repeated for streets, rooftops, bank, sewers.)

Remove all 5 label divs. Replace with:

```html
        <!-- City labels generated dynamically by generateCityHTML() -->
```

The cell-labels for Evil Wins, Remaining Tactics (before the city labels) and Villain Deck count (after) stay as-is.

- [ ] **Step 3: Replace CSS #city-N selectors (~lines 700-743)**

Remove:

```css
#city-1 {
  height: 15vh;
  background-image: url("Visual Assets/Backgrounds/Bridge.webp");
  background-size: cover;
  background-position: top;
  background-blend-mode: overlay;
  background-color: var(--city-background-color);
}

#city-2 { ... }
#city-3 { ... }
#city-4 { ... }
#city-5 { ... }
```

Replace with a single class:

```css
.city-space {
  height: 15vh;
  background-size: cover;
  background-blend-mode: overlay;
  background-color: var(--city-background-color);
}
```

The background-image and background-position are set per-space by `generateCityHTML()` via inline styles (they vary per space and per scheme).

- [ ] **Step 4: Add generateCityHTML() function in script.js**

Add near the top of script.js (after the variable declarations, before game logic):

```js
function generateCityHTML() {
  const config = citySpaces;

  // Find insertion points in the game board rows
  const villainDeck = document.getElementById("villain-deck");
  const cityRow = villainDeck.parentElement;

  // Remove any existing city cells
  cityRow.querySelectorAll(".city-space").forEach(el => el.remove());

  // Insert city cells before the villain deck (leftmost = Bridge = index 0)
  for (let i = 0; i < citySize; i++) {
    const cell = document.createElement("div");
    cell.className = "cell city city-space";
    cell.id = `city-${i + 1}`;
    cell.dataset.index = i;
    cell.textContent = `City - ${config[i].label.replace("The ", "")}`;
    cell.style.backgroundImage = `url("Visual Assets/Backgrounds/${config[i].bg}")`;
    cell.style.backgroundPosition = config[i].bgPos;
    cityRow.insertBefore(cell, villainDeck);
  }

  // Find the label row (next sibling .row of the city row)
  const labelRow = cityRow.nextElementSibling;

  // Remove any existing city label cells
  labelRow.querySelectorAll(".city-label").forEach(el => el.remove());

  // Find the villain deck count label (last cell-label in the row) to insert before
  const villainDeckLabel = document.getElementById("villainDeckCountNumber").closest(".cell-label");

  // Insert city label cells
  for (let i = 0; i < citySize; i++) {
    const labelDiv = document.createElement("div");
    labelDiv.className = "cell-label city-label";
    const p = document.createElement("p");
    p.className = "labeltext";
    p.id = `city-label-${i}`;
    p.textContent = config[i].label.replace("The ", "");
    labelDiv.appendChild(p);
    labelRow.insertBefore(labelDiv, villainDeckLabel);
  }
}
```

- [ ] **Step 5: Call generateCityHTML() during game initialization**

Find `initCityArrays()` call from Task 2 and add `generateCityHTML()` immediately after it:

```js
initCityArrays();
generateCityHTML();
```

- [ ] **Step 6: Update grid-template-columns if needed**

The current grid uses `repeat(8, 1fr)` which assumes 8 cells per row (mastermind + 5 city + villain deck + ???). Check if the column count needs to become dynamic. If the grid is `repeat(8, 1fr)` and `.row` is `display: contents`, then the grid auto-flows. With 7 city spaces instead of 5, the row would have 9 items instead of 7, which may need `grid-template-columns` to update.

Option: Change the grid to `grid-template-columns: auto repeat(var(--city-size, 5), 1fr) auto` or simply recalculate after city generation:

```js
// At end of generateCityHTML():
const grid = document.querySelector('.grid');
// mastermind(1) + city(N) + villain-deck(1) = N+2 for the city row
// But the grid must also fit the HQ row: sidekick(1) + shield(1) + 5 HQ + hero(1) = 8
// Use the max of both rows:
const totalColumns = Math.max(citySize + 2, 8);
grid.style.gridTemplateColumns = `repeat(${totalColumns}, 1fr)`;
```

- [ ] **Step 7: Syntax check all modified files**

```bash
node --check script.js
```

- [ ] **Step 8: Commit**

```bash
git add script.js index.html styles.css
git commit -m "feat: generate city HTML dynamically from citySize

City spaces and labels are now created by generateCityHTML() instead of
being hardcoded in index.html. CSS uses .city-space class instead of
#city-N ID selectors. Grid columns adjust to city size."
```

---

### Task 7: Convert cardAbilities.js

**Files:**
- Modify: `cardAbilities.js:~16850-16878` (PermBuff switch/case)
- Modify: `cardAbilities.js:~7712-7722` (LocationAttack writes)
- Modify: `cardAbilities.js:~8125-8129` (LocationAttack array literal)
- Modify: `cardAbilities.js:~11685-11689` (LocationAttack array literal)
- Modify: `cardAbilities.js:~7938` (window[] TempBuff read)
- Modify: `cardAbilities.js:~11519,11580` (window[] TempBuff reads)

- [ ] **Step 1: Convert PermBuff switch/case (~lines 16850-16878)**

This is the Portals to the Dark Dimension scheme twist. Replace each case:

```js
case 2:
  console.log("A dark portal opens beneath the Bridge...");
  city1PermBuff++;
  darkPortalSpaces[0] = true;
  break;
```

With:

```js
case 2:
  console.log("A dark portal opens beneath the Bridge...");
  cityPermBuff[0]++;
  darkPortalSpaces[0] = true;
  break;
```

Repeat for cases 3-6: `city2PermBuff++` → `cityPermBuff[1]++`, etc. (case N maps to index N-2 because case 1 is the mastermind, cases 2-6 are city spaces 0-4).

- [ ] **Step 2: Convert LocationAttack writes (~lines 7712-7722)**

Replace:
- `city3LocationAttack--` → `cityLocationAttack[2]--`
- `city1LocationAttack--` → `cityLocationAttack[0]--`

(These are specific card abilities that reduce location attack on specific spaces.)

- [ ] **Step 3: Convert LocationAttack array literals (~lines 8125-8129 and 11685-11689)**

Two blocks that build arrays like:

```js
{ value: city1LocationAttack, id: "bridge-label" },
{ value: city2LocationAttack, id: "streets-label" },
...
```

Replace each block with:

```js
cityLocationAttack.map((value, idx) => ({ value, id: `city-label-${idx}` }))
```

Or if the surrounding code expects a different structure, adjust accordingly.

- [ ] **Step 4: Convert window[] TempBuff reads**

Search cardAbilities.js for `window[\`city` and replace:
- `window[\`city${...}TempBuff\`]` → `cityTempBuff[...]`

Adjust index expressions (remove the `+ 1` if present).

- [ ] **Step 5: Syntax check**

```bash
node --check cardAbilities.js
```

- [ ] **Step 6: Commit**

```bash
git add cardAbilities.js
git commit -m "refactor: convert cardAbilities.js city buff references to array access"
```

---

### Task 8: Convert cardAbilitiesDarkCity.js

**Files:**
- Modify: `cardAbilitiesDarkCity.js:~3673-3677` (LocationAttack array literal)
- Modify: `cardAbilitiesDarkCity.js:~5399-5400` (LocationAttack writes)
- Modify: `cardAbilitiesDarkCity.js:~3486` (window[] TempBuff read)

- [ ] **Step 1: Convert LocationAttack array literal (~lines 3673-3677)**

Same pattern as Task 7 Step 3 — replace the 5-element array literal with:

```js
cityLocationAttack.map((value, idx) => ({ value, id: `city-label-${idx}` }))
```

- [ ] **Step 2: Convert LocationAttack writes (~lines 5399-5400)**

Replace:
- `city5LocationAttack--` → `cityLocationAttack[4]--`

(Two occurrences.)

- [ ] **Step 3: Convert window[] TempBuff read (~line 3486)**

Replace `window[\`city${...}TempBuff\`]` → `cityTempBuff[...]`.

- [ ] **Step 4: Syntax check**

```bash
node --check cardAbilitiesDarkCity.js
```

- [ ] **Step 5: Commit**

```bash
git add cardAbilitiesDarkCity.js
git commit -m "refactor: convert cardAbilitiesDarkCity.js city buff references to array access"
```

---

### Task 9: Convert expansionFantasticFour.js

**Files:**
- Modify: `expansionFantasticFour.js:~558-570` (TempBuff + CosmicThreat if/else chains)
- Modify: `expansionFantasticFour.js:~582-596` (removeCosmicThreatBuff duplicate)
- Modify: `expansionFantasticFour.js:~2661` (streetsReserveAttack write)
- Modify: `expansionFantasticFour.js:~4883-4887` (LocationAttack array literal)
- Modify: `expansionFantasticFour.js:~4696` (window[] TempBuff read)

- [ ] **Step 1: Convert cosmicThreat() TempBuff chain (~lines 558-563)**

Replace:

```js
if (index === 0) city1TempBuff -= attackReduction;
else if (index === 1) city2TempBuff -= attackReduction;
else if (index === 2) city3TempBuff -= attackReduction;
else if (index === 3) city4TempBuff -= attackReduction;
else if (index === 4) city5TempBuff -= attackReduction;
```

With:

```js
cityTempBuff[index] -= attackReduction;
```

- [ ] **Step 2: Convert cosmicThreat() CosmicThreat chain (~lines 565-570)**

Replace:

```js
if (index === 0) city1CosmicThreat = attackReduction;
else if (index === 1) city2CosmicThreat = attackReduction;
else if (index === 2) city3CosmicThreat = attackReduction;
else if (index === 3) city4CosmicThreat = attackReduction;
else if (index === 4) city5CosmicThreat = attackReduction;
```

With:

```js
cityCosmicThreat[index] = attackReduction;
```

- [ ] **Step 3: Convert the expansion's removeCosmicThreatBuff (~lines 582-596)**

Same replacement as Task 3 Step 3 — replace the if/else chain with:

```js
if (cityCosmicThreat[cityIndex] > 0) {
  cityTempBuff[cityIndex] += cityCosmicThreat[cityIndex];
  cityCosmicThreat[cityIndex] = 0;
}
```

- [ ] **Step 4: Convert streetsReserveAttack write (~line 2661)**

Replace:

```js
streetsReserveAttack += 6;
```

With:

```js
cityReserveAttack[1] += 6; // Streets = index 1
```

- [ ] **Step 5: Convert LocationAttack array literal (~lines 4883-4887)**

Same pattern as Tasks 7-8 — replace with dynamic `cityLocationAttack.map(...)`.

- [ ] **Step 6: Convert window[] TempBuff read (~line 4696)**

Replace `window[\`city${...}TempBuff\`]` → `cityTempBuff[...]`.

- [ ] **Step 7: Syntax check**

```bash
node --check expansionFantasticFour.js
```

- [ ] **Step 8: Commit**

```bash
git add expansionFantasticFour.js
git commit -m "refactor: convert expansionFantasticFour.js city buff references to array access"
```

---

### Task 10: Convert expansionGuardiansOfTheGalaxy.js

**Files:**
- Modify: `expansionGuardiansOfTheGalaxy.js:~3525-3529` (LocationAttack array literal)
- Modify: `expansionGuardiansOfTheGalaxy.js:~3345` (window[] TempBuff read)

- [ ] **Step 1: Convert LocationAttack array literal (~lines 3525-3529)**

Same pattern — replace with `cityLocationAttack.map(...)`.

- [ ] **Step 2: Convert window[] TempBuff read (~line 3345)**

Replace `window[\`city${...}TempBuff\`]` → `cityTempBuff[...]`.

- [ ] **Step 3: Syntax check**

```bash
node --check expansionGuardiansOfTheGalaxy.js
```

- [ ] **Step 4: Commit**

```bash
git add expansionGuardiansOfTheGalaxy.js
git commit -m "refactor: convert expansionGuardiansOfTheGalaxy.js city buff references to array access"
```

---

### Task 11: Convert expansionPaintTheTownRed.js

**Files:**
- Modify: `expansionPaintTheTownRed.js:~3555-3559` (LocationAttack array literal)
- Modify: `expansionPaintTheTownRed.js:~2433` (window[] TempBuff read)
- Modify: `expansionPaintTheTownRed.js:~3368` (window[] TempBuff read)

- [ ] **Step 1: Convert LocationAttack array literal (~lines 3555-3559)**

Same pattern — replace with `cityLocationAttack.map(...)`.

- [ ] **Step 2: Convert window[] TempBuff reads (~lines 2433, 3368)**

Replace each `window[\`city${...}TempBuff\`]` → `cityTempBuff[...]`.

- [ ] **Step 3: Syntax check**

```bash
node --check expansionPaintTheTownRed.js
```

- [ ] **Step 4: Commit**

```bash
git add expansionPaintTheTownRed.js
git commit -m "refactor: convert expansionPaintTheTownRed.js city buff references to array access"
```

---

### Task 12: Verification Sweep

**Files:** All 8 files (read-only verification)

- [ ] **Step 1: Grep for any remaining old variable names**

Run these greps across all JS files. Each should return 0 matches:

```bash
grep -rn "city[1-5]TempBuff\|city[1-5]PermBuff\|city[1-5]LocationAttack\|city[1-5]CosmicThreat" *.js
grep -rn "bridgeReserveAttack\|streetsReserveAttack\|rooftopsReserveAttack\|bankReserveAttack\|sewersReserveAttack" *.js
grep -rn "window\[.city" *.js
```

If any matches remain, convert them using the mapping table at the top of this plan.

- [ ] **Step 2: Grep for old HTML IDs**

```bash
grep -n "city-[1-5]-temp-buff\|city-[1-5]-perm-buff" index.html
grep -n "#city-[1-5]" styles.css
```

Both should return 0 matches.

- [ ] **Step 3: Syntax check all JS files**

```bash
node --check script.js
node --check cardAbilities.js
node --check cardAbilitiesDarkCity.js
node --check expansionFantasticFour.js
node --check expansionGuardiansOfTheGalaxy.js
node --check expansionPaintTheTownRed.js
```

All must pass.

- [ ] **Step 4: Fix any issues found, then re-run Steps 1-3**

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: address remaining old variable references found in verification sweep"
```

(Skip this commit if no fixes were needed.)

---

### Task 13: Browser Testing — Size 5 (Default)

**Files:** None modified — manual testing only.

- [ ] **Step 1: Open the game in a browser**

Open `index.html` directly in a browser. Select any existing scheme and mastermind. Start a game.

- [ ] **Step 2: Verify city renders correctly**

Check:
- 5 city spaces visible with correct background images (Bridge, Streets, Rooftops, Bank, Sewers)
- Labels show below each space
- Villain deck on the right, mastermind on the left

- [ ] **Step 3: Verify villain flow**

Play a few turns:
- Villains enter at Sewers (rightmost)
- Villains advance left each turn
- Villains escape from Bridge (leftmost)
- Fight buttons appear on affordable villains
- Fighting a villain removes it from the city

- [ ] **Step 4: Test expansion-specific features**

If possible, quick-test:
- Fantastic Four scheme with Cosmic Threat (buff overlays appear on city spaces)
- Dark City Portals to the Dark Dimension (permanent buff overlays)
- Paint the Town Red with Web-Slinging (villain swapping between spaces)

- [ ] **Step 5: Document any issues found**

If issues are found, note them and fix before proceeding.

---

### Task 14: Smoke Test — Size 7 and Size 3

**Files:**
- Modify: `script.js` (temporary test code, reverted after testing)

- [ ] **Step 1: Temporarily set citySize to 7 for testing**

In `initCityArrays()` or at the call site, temporarily add:

```js
citySize = 7;
citySpaces = [
  { label: "Low Tide 1",   bg: "Streets.webp",  bgPos: "center" },
  { label: "Low Tide 2",   bg: "Streets.webp",  bgPos: "center" },
  ...CITY_SPACE_DEFAULTS,
];
citySpaceLabels = citySpaces.map(s => s.label);
```

- [ ] **Step 2: Open game and verify 7-space city**

Check:
- 7 city spaces render with labels
- Grid layout accommodates the wider city without breaking HQ row
- Villains enter at rightmost space (index 6) and advance toward leftmost (index 0)

- [ ] **Step 3: Temporarily set citySize to 3 for testing**

```js
citySize = 3;
citySpaces = CITY_SPACE_DEFAULTS.slice(2); // Rooftops, Bank, Sewers
citySpaceLabels = citySpaces.map(s => s.label);
```

- [ ] **Step 4: Open game and verify 3-space city**

Check:
- 3 city spaces render
- Villain flow works with fewer spaces
- No JS errors in console

- [ ] **Step 5: Revert test code**

Remove the temporary `citySize` overrides. Restore default behavior (citySize = 5).

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "refactor: dynamic city refactor complete — verified at sizes 3, 5, and 7"
```

- [ ] **Step 7: Report results**

Summarize what was tested and any remaining issues. The worktree is ready for merge review.
