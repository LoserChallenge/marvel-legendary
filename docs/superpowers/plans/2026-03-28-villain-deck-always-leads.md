# Villain Deck Always Leads & Golden Solo Rules Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Golden Solo villain deck setup to enforce 2 villain groups with one locked to the mastermind's Always Leads group, and generalise Apocalypse's +2 attack bonus to a data-driven pattern.

**Architecture:** Add `alwaysLeads`/`alwaysLeadsType`/`alwaysLeadsBonus` fields to mastermind data, then introduce a single `getEffectiveSetupRequirements()` helper that all setup-screen functions call instead of reading `scheme.requiredVillains` directly. Game-start `alwaysLeadsVillain` assignment and the attack-bonus calculation are updated separately.

**Tech Stack:** Vanilla JS, static HTML — no build step, no test framework. Automated JS syntax check runs via hook after every `.js` save. All verification is manual in-browser.

---

## Spec Reference

`docs/superpowers/specs/2026-03-28-villain-deck-always-leads-design.md`

---

## File Map

| File | Change |
|---|---|
| `Legendary-Solo-Play-main/Legendary-Solo-Play-main/cardDatabase.js` | Add `alwaysLeads`, `alwaysLeadsType`, `alwaysLeadsBonus` to all 15 mastermind objects |
| `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` | New `getEffectiveSetupRequirements` helper (~line 2908); update `showConfirmChoicesPopup`, `randomizeVillainWithRequirements`, henchmen randomize function, `randomizeVillain`, `updateSummaryPanel` (~lines 2009–2640); update `alwaysLeadsVillain` assignment (~line 4349); generalise attack bonus in `updateVillainAttackValues` and `updateHQVillainAttackValues` (lines 9381, 9596) |

---

## Task 1: Add mastermind data fields (`cardDatabase.js`)

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/cardDatabase.js` (~lines 619–950 for Core masterminds, plus Dark City, FF, GotG, PtTR masterminds further in file)

Add `alwaysLeads`, `alwaysLeadsType` to every mastermind object. Add `alwaysLeadsBonus` to Apocalypse only.

- [ ] **Step 1: Add fields to Core Set masterminds (Dr. Doom, Loki, Red Skull, Magneto, Apocalypse)**

Locate each mastermind object by `name:` field and add the two (or three) new fields. Place them after the last existing field of each object, before the closing `},`. Use the exact group names below — they must match the `value` attributes of the checkboxes in `index.html`.

```js
// Dr. Doom (~line 622)
alwaysLeads: "Doombot Legion",
alwaysLeadsType: "henchmen",

// Loki (~line 681)
alwaysLeads: "Enemies of Asgard",
alwaysLeadsType: "villain",

// Red Skull (~line 737)
alwaysLeads: "HYDRA",
alwaysLeadsType: "villain",

// Magneto (~line 796)
alwaysLeads: "Brotherhood",
alwaysLeadsType: "villain",

// Apocalypse (~line 856) — also gets the bonus field
alwaysLeads: "Four Horsemen",
alwaysLeadsType: "villain",
alwaysLeadsBonus: { attack: 2 },
```

- [ ] **Step 2: Add fields to Dark City masterminds (Kingpin, Mephisto, Mr. Sinister, Stryfe)**

Search for each `name:` value to locate the object:

```js
// Kingpin
alwaysLeads: "Streets of New York",
alwaysLeadsType: "villain",

// Mephisto
alwaysLeads: "Underworld",
alwaysLeadsType: "villain",

// Mr. Sinister
alwaysLeads: "Marauders",
alwaysLeadsType: "villain",

// Stryfe
alwaysLeads: "Mutant Liberation Front",
alwaysLeadsType: "villain",
```

- [ ] **Step 3: Add fields to Fantastic Four masterminds (Galactus, Mole Man)**

```js
// Galactus
alwaysLeads: "Heralds of Galactus",
alwaysLeadsType: "villain",

// Mole Man
alwaysLeads: "Subterranea",
alwaysLeadsType: "villain",
```

- [ ] **Step 4: Add fields to Guardians of the Galaxy masterminds (Thanos, The Supreme Intelligence of the Kree)**

Note: the mastermind's `name` in `cardDatabase.js` is `"The Supreme Intelligence of the Kree"` — not `"Supreme Intelligence"`. Use the exact name.

```js
// Thanos
alwaysLeads: "Infinity Gems",
alwaysLeadsType: "villain",

// The Supreme Intelligence of the Kree
alwaysLeads: "Kree Starforce",
alwaysLeadsType: "villain",
```

- [ ] **Step 5: Add fields to Paint the Town Red masterminds (Carnage, Mysterio)**

```js
// Carnage
alwaysLeads: "Maximum Carnage",
alwaysLeadsType: "villain",

// Mysterio
alwaysLeads: "Sinister Six",
alwaysLeadsType: "villain",
```

- [ ] **Step 6: Verify syntax check passes**

The JS syntax hook runs automatically after saving. Confirm no errors appear in the terminal. If any errors appear, check the mastermind objects edited for missing commas or mismatched braces.

- [ ] **Step 7: Sanity-check group name spelling**

Open `Legendary-Solo-Play-main/Legendary-Solo-Play-main/index.html` and confirm the villain/henchmen checkbox `value` attributes match the `alwaysLeads` strings exactly (case-sensitive). Key ones to verify: "Doombot Legion", "Four Horsemen", "Streets of New York", "Mutant Liberation Front", "Heralds of Galactus", "Infinity Gems", "Kree Starforce", "Maximum Carnage".

- [ ] **Step 8: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/cardDatabase.js
git commit -m "feat: add alwaysLeads, alwaysLeadsType, alwaysLeadsBonus to all masterminds"
```

---

## Task 2: Write `getEffectiveSetupRequirements` helper (`script.js`)

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (insert before `showConfirmChoicesPopup` at ~line 2909)

- [ ] **Step 1: Insert the helper function**

Place this block immediately before the `function showConfirmChoicesPopup(` line:

```js
/**
 * Returns the effective villain/henchmen setup requirements for the current
 * game mode + mastermind + scheme combination.
 *
 * What If? Solo: returns scheme values unchanged.
 * Golden Solo: overrides to 2 villain groups; locks one slot to mastermind's
 *   alwaysLeads group (if a villain group); locks henchmen slot if alwaysLeads
 *   is a henchmen group (Dr. Doom → Doombot Legion).
 *
 * @param {Object} scheme      - scheme object from cardDatabase
 * @param {Object} mastermind  - full mastermind object (must have alwaysLeads/alwaysLeadsType)
 * @param {string} gameMode    - 'whatif' | 'golden'
 * @returns {{ requiredVillains, specificVillainRequirement, specificHenchmenRequirement }}
 */
function getEffectiveSetupRequirements(scheme, mastermind, gameMode) {
  // Normalise scheme's specific villain requirement to an array (may be string, array, or absent)
  const schemeLockedVillains = scheme.specificVillainRequirement
    ? (Array.isArray(scheme.specificVillainRequirement)
        ? scheme.specificVillainRequirement
        : [scheme.specificVillainRequirement])
    : [];

  // What If? Solo — return scheme values unchanged
  if (gameMode !== 'golden') {
    return {
      requiredVillains: scheme.requiredVillains,
      specificVillainRequirement: schemeLockedVillains,
      specificHenchmenRequirement: scheme.specificHenchmenRequirement || null,
    };
  }

  // Golden Solo
  const goldenRequiredVillains = 2;
  const lockedVillains = [...schemeLockedVillains];

  // Add mastermind's Always Leads if it's a villain group and there's a free slot
  if (
    mastermind &&
    mastermind.alwaysLeadsType === 'villain' &&
    mastermind.alwaysLeads &&
    lockedVillains.length < goldenRequiredVillains &&
    !lockedVillains.map(v => v.toLowerCase()).includes(mastermind.alwaysLeads.toLowerCase())
  ) {
    lockedVillains.push(mastermind.alwaysLeads);
  }

  // If scheme over-specifies (more locked slots than goldenRequiredVillains), respect that
  const effectiveRequiredVillains = Math.max(goldenRequiredVillains, lockedVillains.length);

  // Henchmen: lock to mastermind's Always Leads if it's a henchmen group (e.g. Dr. Doom)
  const specificHenchmenRequirement =
    mastermind &&
    mastermind.alwaysLeadsType === 'henchmen' &&
    mastermind.alwaysLeads
      ? mastermind.alwaysLeads
      : (scheme.specificHenchmenRequirement || null);

  return {
    requiredVillains: effectiveRequiredVillains,
    specificVillainRequirement: lockedVillains,
    specificHenchmenRequirement,
  };
}
```

- [ ] **Step 2: Verify syntax check passes**

Confirm no errors in the terminal after saving.

- [ ] **Step 3: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: add getEffectiveSetupRequirements helper for Golden Solo villain rules"
```

---

## Task 3: Update `showConfirmChoicesPopup` (`script.js`)

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (~lines 2909–3043)

This function currently passes a stub `{ name: ... }` object from its caller — it must look up the full mastermind from the `masterminds` array before calling the helper.

- [ ] **Step 1: Add game mode + effective requirements block at the top of the function**

Find these two consecutive lines near the top of `showConfirmChoicesPopup`:

```js
let specificVillainRequirementMet = true;
let specificHenchmenRequirementMet = true;
```

The very next line after these is `if (scheme.specificVillainRequirement)` — that block is what Step 2 replaces. Insert these 3 lines between the `let` declarations and that `if` block:

```js
// Golden Solo: resolve effective villain/henchmen requirements
const _gameMode = document.querySelector('input[name="gameMode"]:checked')?.value || 'whatif';
const _fullMastermind = masterminds.find(m => m.name === mastermind.name) || mastermind;
const req = getEffectiveSetupRequirements(scheme, _fullMastermind, _gameMode);
```

Note: the `mastermind` argument to this function is a stub `{ name: ... }` from the caller — `_fullMastermind` performs the needed lookup to get the full object with `alwaysLeads`/`alwaysLeadsType`.

- [ ] **Step 2: Replace specific villain requirement check**

Find the existing block:

```js
if (scheme.specificVillainRequirement) {
  const requiredVillains = Array.isArray(scheme.specificVillainRequirement)
    ? scheme.specificVillainRequirement
    : [scheme.specificVillainRequirement];
  ...
}
```

Replace the condition and the `requiredVillains` array derivation to use `req`:

```js
if (req.specificVillainRequirement.length > 0) {
  const requiredVillains = req.specificVillainRequirement;
  // (rest of the block — normalisation, missing-villain check, error message — stays unchanged)
```

- [ ] **Step 3: Replace villain count validation**

Find:

```js
if (villains.length < scheme.requiredVillains) {
  villainFeedback += `...${scheme.requiredVillains - villains.length}...`;
} else if (villains.length > scheme.requiredVillains) {
  villainFeedback += `...${villains.length - scheme.requiredVillains}...`;
}
```

Replace `scheme.requiredVillains` with `req.requiredVillains` throughout this block (4 occurrences).

- [ ] **Step 4: Replace "X Villain groups required" display line**

Find:

```js
document.getElementById("required-villains-count").innerHTML =
  `<span class="bold-spans">${scheme.requiredVillains} Villain ${villainGroupText}.</span>`;
```

Replace `scheme.requiredVillains` with `req.requiredVillains`.

- [ ] **Step 5: Replace villain count in the `villainsCorrect` check**

Find:

```js
const villainsCorrect =
  villains.length === scheme.requiredVillains &&
  specificVillainRequirementMet;
```

Replace `scheme.requiredVillains` with `req.requiredVillains`.

- [ ] **Step 6: Replace specific henchmen requirement check**

Find:

```js
if (scheme.specificHenchmenRequirement) {
  const requiredHenchmen = Array.isArray(scheme.specificHenchmenRequirement)
    ? scheme.specificHenchmenRequirement
    : [scheme.specificHenchmenRequirement];
  ...
}
```

Replace the condition to use `req.specificHenchmenRequirement` (normalise string to array):

```js
if (req.specificHenchmenRequirement) {
  const requiredHenchmen = Array.isArray(req.specificHenchmenRequirement)
    ? req.specificHenchmenRequirement
    : [req.specificHenchmenRequirement];
  // (rest of block unchanged)
```

- [ ] **Step 7: Verify syntax check passes**

- [ ] **Step 8: Manual browser verification — Confirm Choices popup**

Open the app in a browser. Test each scenario and confirm the popup shows the correct counts and errors:

| Scenario | Expected |
|---|---|
| What If? + any mastermind + 1-villain scheme | Shows "1 Villain group required" — unchanged |
| Golden Solo + Magneto + any scheme | Shows "2 Villain groups required"; error if Brotherhood not selected |
| Golden Solo + Dr. Doom + any scheme | Shows "2 Villain groups required" (no villain lock); error if Doombot Legion not selected as henchmen |
| Golden Solo + Apocalypse + any scheme | Shows "2 Villain groups required"; error if Four Horsemen not selected |
| Golden Solo + Supreme Intelligence + Kree-Skrull War | Shows "2 Villain groups required"; errors if Kree Starforce or Skrulls missing (scheme wins both slots; no Always Leads lock) |
| Golden Solo + Mysterio + Splice Humans with Spider DNA | Shows "2 Villain groups required"; Sinister Six required (scheme); Always Leads = Sinister Six already satisfies both — second slot is free choice |

- [ ] **Step 9: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: update showConfirmChoicesPopup to use effective Golden Solo requirements"
```

---

## Task 4: Update `randomizeVillainWithRequirements` (`script.js`)

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (~line 2564)

- [ ] **Step 1: Add mastermind lookup and req at the top of the function**

Find `function randomizeVillainWithRequirements(scheme) {`. Immediately after the opening brace and before the existing `const villainCheckboxes` line, add:

```js
const _gameMode = document.querySelector('input[name="gameMode"]:checked')?.value || 'whatif';
const _mastermind = getSelectedMastermind() || {};
const req = getEffectiveSetupRequirements(scheme, _mastermind, _gameMode);
```

`getSelectedMastermind()` is already defined in `script.js` and returns the full mastermind object from the `masterminds` array.

- [ ] **Step 2: Replace `scheme.specificVillainRequirement` check with `req`**

Find:

```js
if (scheme.specificVillainRequirement) {
  const requiredVillains = Array.isArray(scheme.specificVillainRequirement)
    ? scheme.specificVillainRequirement
    : [scheme.specificVillainRequirement];
  ...
```

Replace with:

```js
if (req.specificVillainRequirement.length > 0) {
  const requiredVillains = req.specificVillainRequirement;
  ...
```

The rest of the block (finding checkboxes, pushing to `requiredCheckboxes`, building `availableCheckboxes`) stays unchanged.

- [ ] **Step 3: Replace `scheme.requiredVillains` in remaining slots calculation**

Find:

```js
const remainingSlots = Math.max(0, scheme.requiredVillains - selectedCount);
```

Replace with:

```js
const remainingSlots = Math.max(0, req.requiredVillains - selectedCount);
```

- [ ] **Step 4: Verify syntax check passes**

- [ ] **Step 5: Manual browser verification — Randomize All**

Click RANDOMIZE ALL with Golden Solo selected and various masterminds:

| Scenario | Expected |
|---|---|
| Golden Solo + Magneto | Brotherhood always selected; one other villain selected randomly |
| Golden Solo + Loki | Enemies of Asgard always selected; one other villain selected randomly |
| Golden Solo + Dr. Doom | Two villain groups selected randomly (no villain lock); Doombot Legion selected as henchmen (handled in Task 5) |
| What If? + any mastermind | 1 villain group selected (unchanged) |

- [ ] **Step 6: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: update randomizeVillainWithRequirements to use effective Golden Solo requirements"
```

---

## Task 5: Update `randomizeHenchmenWithRequirements` (`script.js`)

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (~line 2694)

The function `randomizeHenchmenWithRequirements` (at ~line 2694) already handles `scheme.specificHenchmenRequirement`. Update it to also use `req.specificHenchmenRequirement` so Dr. Doom's Doombot Legion lock works in Golden Solo.

- [ ] **Step 1: Add mastermind lookup and req at the top of the function**

Find `function randomizeHenchmenWithRequirements(scheme) {`. Immediately after the opening brace, add:

```js
const _gameMode = document.querySelector('input[name="gameMode"]:checked')?.value || 'whatif';
const _mastermind = getSelectedMastermind() || {};
const req = getEffectiveSetupRequirements(scheme, _mastermind, _gameMode);
```

- [ ] **Step 3: Replace `scheme.specificHenchmenRequirement` check**

Find:

```js
if (scheme.specificHenchmenRequirement) {
  const requiredHenchmen = filteredCheckboxes.find(
    (checkbox) => checkbox.value === scheme.specificHenchmenRequirement,
  );
```

Replace with:

```js
if (req.specificHenchmenRequirement) {
  const requiredHenchmen = filteredCheckboxes.find(
    (checkbox) => checkbox.value === req.specificHenchmenRequirement,
  );
```

Also replace `scheme.requiredHenchmen` references inside this block with `scheme.requiredHenchmen` unchanged — henchmen count is not overridden by the helper, only the specific group requirement.

- [ ] **Step 4: Verify syntax check passes**

- [ ] **Step 5: Manual browser verification — Randomize All + Dr. Doom**

With Golden Solo + Dr. Doom selected, click RANDOMIZE ALL. Confirm Doombot Legion is always selected as the henchmen group.

With Golden Solo + any other mastermind, click RANDOMIZE ALL. Confirm henchmen selection is random (unchanged).

- [ ] **Step 6: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: update henchmen randomize to lock Doombot Legion for Dr. Doom in Golden Solo"
```

---

## Task 6: Update `randomizeVillain` standalone button (`script.js`)

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (~line 2009)

This function currently always picks exactly 1 villain. In Golden Solo it must pick 2 — Always Leads locked first, then one additional random pick.

- [ ] **Step 1: Add mastermind lookup and req at the top of `randomizeVillain`**

After `function randomizeVillain() {`, before the existing `const villainCheckboxes` line:

```js
const _gameMode = document.querySelector('input[name="gameMode"]:checked')?.value || 'whatif';
const _mastermind = getSelectedMastermind() || {};
const _schemeName = document.querySelector('#scheme-selection input[type="radio"]:checked')?.value;
const _scheme = schemes.find(s => s.name === _schemeName) || { requiredVillains: 1 };
const req = getEffectiveSetupRequirements(_scheme, _mastermind, _gameMode);
```

- [ ] **Step 2: Replace the single-pick logic with a multi-pick that respects `req`**

The current function picks one villain at random and sets it. Replace the logic after `filteredCheckboxes` is built (and after the early-return guard) with:

```js
// Clear previous selections
selectedVillainGroups = [];

// Lock required villain groups first (Always Leads in Golden Solo)
const lockedCheckboxes = req.specificVillainRequirement
  .map(name => filteredCheckboxes.find(cb => cb.value === name) ||
               Array.from(villainCheckboxes).find(cb => cb.value === name))
  .filter(Boolean);

lockedCheckboxes.forEach(cb => {
  cb.checked = true;
  const group = villains.find(g => g.name === cb.value);
  if (group) selectedVillainGroups.push(group);
});

// Fill remaining slots randomly from filtered pool (excluding already-locked)
const remainingSlots = Math.max(0, req.requiredVillains - selectedVillainGroups.length);
const available = filteredCheckboxes.filter(cb => !lockedCheckboxes.includes(cb));
const shuffled = [...available].sort(() => 0.5 - Math.random());
shuffled.slice(0, remainingSlots).forEach(cb => {
  cb.checked = true;
  const group = villains.find(g => g.name === cb.value);
  if (group) selectedVillainGroups.push(group);
});
```

**Important:** The existing scroll block after this references `selectedCheckbox` (a variable from the old single-pick logic that no longer exists). Replace the scroll target with the first selected checkbox instead:

```js
// Scroll to first selected villain
const firstSelected = Array.from(villainCheckboxes).find(cb => cb.checked);
if (firstSelected) {
  const villainContainer = document.querySelector("#villain-section .scrollable-list");
  if (villainContainer) {
    const villainPosition = firstSelected.offsetTop - villainContainer.offsetTop;
    villainContainer.scrollTop = villainPosition - villainContainer.clientHeight / 2;
  }
}
```

Remove the old scroll block entirely and replace with the above. Keep the face-down cards update and `updateSummaryPanel()` calls.

- [ ] **Step 3: Verify syntax check passes**

- [ ] **Step 4: Manual browser verification — standalone Randomize Villains button**

| Scenario | Expected |
|---|---|
| Golden Solo + Magneto, click Randomize Villains | Brotherhood always selected; one other villain selected |
| Golden Solo + Dr. Doom, click Randomize Villains | Two villain groups selected randomly (no villain lock) |
| What If? + any mastermind, click Randomize Villains | 1 villain group selected at random (unchanged) |
| Golden Solo + no mastermind selected, click Randomize Villains | 2 villain groups selected at random (graceful fallback) |

- [ ] **Step 5: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: update standalone randomizeVillain to pick 2 with Always Leads lock in Golden Solo"
```

---

## Task 7: Update `updateSummaryPanel` (`script.js`)

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (~line 2432)

The function already reads `mastermindName`, `gameModeValue`, and `scheme` from DOM. Just add the full mastermind lookup and use `req.requiredVillains` for the count display.

- [ ] **Step 1: Add mastermind lookup and req**

The function already has (around line 2442):
```js
const mastermindName = mastermindRadio ? mastermindRadio.value : null;
```

After that line, add:
```js
const _mastermind = masterminds.find(m => m.name === mastermindName) || {};
const req = scheme ? getEffectiveSetupRequirements(scheme, _mastermind, gameModeValue) : null;
```

- [ ] **Step 2: Replace `scheme.requiredVillains` with `req.requiredVillains`**

Find (around line 2463):
```js
const requiredVillains = scheme ? scheme.requiredVillains : null;
```

Replace with:
```js
const requiredVillains = req ? req.requiredVillains : null;
```

The two lines below that use `requiredVillains` (count display and colour class) remain unchanged.

- [ ] **Step 3: Verify syntax check passes**

- [ ] **Step 4: Manual browser verification — live summary panel**

On the setup screen with Golden Solo selected, watch the villain count indicator update as you change mastermind and villain selections:

| Scenario | Expected summary panel villain count |
|---|---|
| Golden Solo + Magneto + 0 villains | 0/2 (red) |
| Golden Solo + Magneto + Brotherhood only | 1/2 (amber) |
| Golden Solo + Magneto + Brotherhood + any second | 2/2 (green) |
| What If? + any mastermind + 1-villain scheme | 0/1 or 1/1 as before (unchanged) |

- [ ] **Step 5: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: update summary panel villain count to use effective Golden Solo requirements"
```

---

## Task 8: Update `alwaysLeadsVillain` assignment at game start (`script.js`)

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (~line 4349)

- [ ] **Step 1: Locate the assignment block**

Find the block starting at ~line 4349:
```js
if (villains.length === 1) {
  const selectedVillainName = villains[0];
  ...
  window.alwaysLeadsVillain = selectedVillainName;
} else if (villains.length > 1) {
  const randomIndex = Math.floor(Math.random() * villains.length);
  const selectedVillainName = villains[randomIndex];
  ...
  window.alwaysLeadsVillain = selectedVillainName;
} else {
  window.alwaysLeadsVillain = null;
}
```

- [ ] **Step 2: Add Golden Solo path to the `villains.length > 1` branch**

Replace the `else if (villains.length > 1)` branch with:

```js
} else if (villains.length > 1) {
  let selectedVillainName;

  if (gameMode === 'golden' && mastermind.alwaysLeads && mastermind.alwaysLeadsType === 'villain') {
    // Golden Solo: always use the mastermind's correct Always Leads group
    selectedVillainName = mastermind.alwaysLeads;
  } else {
    // What If? with multiple villain groups (e.g. Kree-Skrull War): random pick unchanged
    const randomIndex = Math.floor(Math.random() * villains.length);
    selectedVillainName = villains[randomIndex];
  }

  console.log(`The Mastermind always leads ${selectedVillainName} in this game.`);
  onscreenConsole.log(`The Mastermind always leads ${selectedVillainName} in this game.`);
  window.alwaysLeadsVillain = selectedVillainName;
```

Note: `mastermind` at this point in `startGame()` is the object returned by `getSelectedMastermind()` (set a few lines earlier in the same function, around line 4329). After Task 1 adds `alwaysLeads`/`alwaysLeadsType` to `cardDatabase.js`, this object will carry those fields automatically — no extra lookup needed here. `gameMode` is also already set as a global by the time this code runs.

- [ ] **Step 3: Verify syntax check passes**

- [ ] **Step 4: Manual browser verification — game start console**

Start a Golden Solo game with Magneto + Brotherhood + one other villain group. Check the in-game console message — it should say "The Mastermind always leads Brotherhood in this game." (not a random pick).

Start a Golden Solo game with Apocalypse + Four Horsemen + one other villain group. Console should say "The Mastermind always leads Four Horsemen."

- [ ] **Step 5: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: set alwaysLeadsVillain from mastermind data in Golden Solo instead of random pick"
```

---

## Task 9: Generalise attack bonus in `updateVillainAttackValues` and `updateHQVillainAttackValues` (`script.js`)

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (lines 9381 and 9596)

Replace the two hardcoded `mastermind.name === "Apocalypse"` checks with the generalised `alwaysLeadsBonus` pattern.

- [ ] **Step 1: Update `updateVillainAttackValues` (line 9381)**

Find:
```js
if (mastermind.name === "Apocalypse" && villain.alwaysLeads === true) {
  villain.attackFromMastermind = 2;
}
```

Replace with:
```js
if (mastermind.alwaysLeadsBonus && villain.alwaysLeads === true) {
  villain.attackFromMastermind = mastermind.alwaysLeadsBonus.attack || 0;
}
```

- [ ] **Step 2: Update `updateHQVillainAttackValues` (line 9596)**

Find the identical block:
```js
if (mastermind.name === "Apocalypse" && villain.alwaysLeads === true) {
  villain.attackFromMastermind = 2;
}
```

Replace with the same generalised check:
```js
if (mastermind.alwaysLeadsBonus && villain.alwaysLeads === true) {
  villain.attackFromMastermind = mastermind.alwaysLeadsBonus.attack || 0;
}
```

- [ ] **Step 3: Verify syntax check passes**

- [ ] **Step 4: Manual browser verification — attack bonus**

Start a Golden Solo game with Apocalypse + Four Horsemen. During the game, when a Four Horsemen villain appears in the city, verify their displayed attack value is +2 above the card's base attack.

Start a Golden Solo game with a different mastermind (e.g. Magneto). Confirm no unintended attack bonuses on villain cards.

Start a What If? game with Apocalypse + Four Horsemen selected. Confirm Four Horsemen cards still show +2 attack (works in both modes).

- [ ] **Step 5: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: generalise Apocalypse attack bonus to use alwaysLeadsBonus data field"
```

---

## Task 10: Final integration testing

- [ ] **Step 1: Full Golden Solo test — Magneto**

Setup: Golden Solo, Magneto, Brotherhood (locked) + 1 other villain, any henchmen, 5 heroes, any scheme.
- Confirm Choices shows: 2 Villain groups required; Brotherhood required error if missing
- Randomize All: Brotherhood always in result
- Game starts: console says "always leads Brotherhood"
- Play a few rounds: verify no regressions to villain draw count (2/round)

- [ ] **Step 2: Full Golden Solo test — Dr. Doom**

Setup: Golden Solo, Dr. Doom, 2 free villain groups, Doombot Legion (henchmen), 5 heroes.
- Confirm Choices: no villain lock; henchmen shows error if Doombot Legion not selected
- Randomize All: Doombot Legion always selected as henchmen; villain groups random

- [ ] **Step 3: Full Golden Solo test — Apocalypse**

Setup: Golden Solo, Apocalypse, Four Horsemen (locked) + 1 other villain.
- Game starts: console says "always leads Four Horsemen"
- Four Horsemen villains in city show +2 attack above base

- [ ] **Step 4: What If? regression test**

Setup: What If?, any mastermind, 1 villain group (scheme default).
- All villain counts, validation, and randomize behaviour unchanged
- Villain draw count still 1/round (after round 1)

- [ ] **Step 5: Kree-Skrull War Golden Solo test**

Setup: Golden Solo, The Supreme Intelligence of the Kree, Kree-Skrull War scheme.
- Confirm Choices: both Kree Starforce and Skrulls required (scheme wins both slots); no Always Leads villain lock applied
- 2 villain groups total

- [ ] **Step 6: Update CLAUDE.md**

Two stale sections need updating:

1. In the **"Planned Work"** list, item 2 reads `**Villain deck rules fix (Golden Solo)** — planned next session`. Change it to `✅ Complete — merged to master (2026-03-28)` (matching the format of item 1).

2. In the **"Planned Rules Fix — Villain Deck (Golden Solo) + Always Leads"** section under **"Edge Cases to Handle"**, the **"Doombot Legion is not yet in the app"** block reads: "Adding Doombot Legion as actual henchmen group data is a future task (part of full Core set completion)." Remove this entire block — Doombot Legion is in the app and the Dr. Doom henchmen lock is now implemented.

- [ ] **Step 7: Final commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/CLAUDE.md
git commit -m "docs: mark villain deck Always Leads fix as complete in CLAUDE.md"
```
