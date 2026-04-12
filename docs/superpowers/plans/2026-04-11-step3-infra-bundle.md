# Step 3 — Small Infrastructure Bundle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 engine capabilities (epic mastermind toggle, unique henchmen cards, scheme transform helper, recruit-only fight cost) that Revelations content phases depend on.

**Architecture:** Each feature adds a new opt-in field or code path that only activates when future Revelations card data uses it. All existing game behavior is unchanged — no current cards use any of these new fields. Features are independent and committed separately.

**Tech Stack:** Vanilla JS/HTML/CSS, no build step, no test framework. Testing = browser console verification. Source files in `Legendary-Solo-Play-main/Legendary-Solo-Play-main/`.

**Spec:** `docs/superpowers/specs/2026-04-11-step3-infra-bundle-design.md`

---

## File Map

| File | Changes |
|------|---------|
| `script.js` | Modify `getSelectedMastermind()`, `generateVillainDeck()`, city villain affordability check in `updateGameBoard()`, `defeatVillain()` point deduction. Add new `transformScheme()` function. |
| `index.html` | Add epic mastermind toggle checkbox + label (hidden by default) |
| `styles.css` | Add styling for epic toggle (show/hide, positioning) |

No new files created. No changes to `cardDatabase.js` (data entries come in Phase 1 content work).

---

## Task 0: Worktree Setup

- [ ] **Step 1: Create worktree branch**

```bash
cd "D:\Games\Digital\Marvel Legendary\Claude Code\marvel-legendary"
git worktree add .worktrees/step3-infra-bundle -b step3-infra-bundle
```

- [ ] **Step 2: Verify worktree**

```bash
cd .worktrees/step3-infra-bundle/Legendary-Solo-Play-main/Legendary-Solo-Play-main
ls script.js index.html styles.css
```

Expected: all three files listed.

All subsequent tasks work inside `.worktrees/step3-infra-bundle/Legendary-Solo-Play-main/Legendary-Solo-Play-main/`.

---

## Task 1: Epic Mastermind Toggle

**Files:**
- Modify: `index.html` (mastermind section, ~line 276)
- Modify: `script.js` (`getSelectedMastermind()` at line 776, mastermind selection change handler)
- Modify: `styles.css` (new toggle styling)

### Step 1: Add epic toggle HTML

- [ ] **Add checkbox after the mastermind form in `index.html`**

Find this block (~line 276):
```html
              </form>
            </div>
          </div>
          <div class="centered-button">
            <button id="randomize-mastermind">RANDOMIZE MASTERMIND</button>
          </div>
```

Insert the epic toggle between `</div>` (end of options) and `<div class="centered-button">`:

```html
              </form>
            </div>
          </div>
          <div id="epic-toggle-container" class="epic-toggle-container" style="display: none;">
            <label class="epic-toggle-label">
              <input type="checkbox" id="epic-mastermind-toggle">
              <span class="epic-toggle-text">Epic Mode</span>
            </label>
          </div>
          <div class="centered-button">
            <button id="randomize-mastermind">RANDOMIZE MASTERMIND</button>
          </div>
```

### Step 2: Add epic toggle CSS

- [ ] **Add styling to `styles.css`**

Append to the end of the mastermind-related styles (or end of file):

```css
/* Epic Mastermind Toggle */
.epic-toggle-container {
  text-align: center;
  padding: 8px 0;
}

.epic-toggle-label {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
  color: #e0e0e0;
}

.epic-toggle-label input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.epic-toggle-text {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

### Step 3: Add show/hide logic for the toggle

- [ ] **Modify `script.js` — add listener to show/hide epic toggle when mastermind selection changes**

Find where mastermind radio button change events are handled. Add this function near `getSelectedMastermind()` (~line 783):

```js
function updateEpicToggleVisibility() {
  const epicToggleContainer = document.getElementById('epic-toggle-container');
  const epicCheckbox = document.getElementById('epic-mastermind-toggle');
  if (!epicToggleContainer) return;

  const selectedRadio = document.querySelector('#mastermind-section input[type=radio]:checked');
  if (!selectedRadio) {
    epicToggleContainer.style.display = 'none';
    return;
  }

  const mastermind = masterminds.find(m => m.name === selectedRadio.value);
  if (mastermind && mastermind.epic) {
    epicToggleContainer.style.display = '';
  } else {
    epicToggleContainer.style.display = 'none';
    if (epicCheckbox) epicCheckbox.checked = false;
  }
}
```

Then find the mastermind radio button change listener setup (search for `mastermind-selection` or `name="mastermind"` listeners) and add a call to `updateEpicToggleVisibility()` in that handler. If no centralized handler exists, add one:

```js
document.getElementById('mastermind-selection').addEventListener('change', function() {
  updateEpicToggleVisibility();
});
```

### Step 4: Modify `getSelectedMastermind()` to respect the toggle

- [ ] **Edit `getSelectedMastermind()` at script.js line 776-783**

Replace the current function:

```js
function getSelectedMastermind() {
  const selectedMastermindName = document.querySelector(
    "#mastermind-section input[type=radio]:checked",
  ).value;
  return masterminds.find(
    (mastermind) => mastermind.name === selectedMastermindName,
  );
}
```

With:

```js
function getSelectedMastermind() {
  const selectedMastermindName = document.querySelector(
    "#mastermind-section input[type=radio]:checked",
  ).value;
  const baseMastermind = masterminds.find(
    (mastermind) => mastermind.name === selectedMastermindName,
  );

  const epicCheckbox = document.getElementById('epic-mastermind-toggle');
  if (baseMastermind && baseMastermind.epic && epicCheckbox && epicCheckbox.checked) {
    return { ...baseMastermind, ...baseMastermind.epic };
  }

  return baseMastermind;
}
```

### Step 5: Browser verification

- [ ] **Open `index.html` in browser, open DevTools console**

Verify:
1. Select any existing mastermind (e.g., Dr. Doom) → epic toggle should NOT appear (no `epic` field)
2. In console, temporarily add epic to a mastermind to test:
   ```js
   masterminds.find(m => m.name === "Dr. Doom").epic = { name: "Epic Dr. Doom", attack: 99 };
   // Re-select Dr. Doom by clicking the radio button
   ```
3. After re-selecting Dr. Doom → epic toggle should appear
4. With toggle unchecked: `getSelectedMastermind().name` → `"Dr. Doom"`, `.attack` → normal value
5. Check the toggle: `getSelectedMastermind().name` → `"Epic Dr. Doom"`, `.attack` → `99`
6. Select a different mastermind without epic → toggle hides, checkbox unchecks
7. Remove the test data: refresh the page

### Step 6: Commit

- [ ] **Commit the epic mastermind toggle**

```bash
git add script.js index.html styles.css
git commit -m "feat: add Epic Mastermind toggle infrastructure

Setup screen shows Normal/Epic checkbox for masterminds with an 'epic'
sub-object. getSelectedMastermind() merges epic fields when toggled on.
No current masterminds use this yet — activates with Revelations data."
```

---

## Task 2: Unique Henchmen `cards` Array

**Files:**
- Modify: `script.js` (`generateVillainDeck()` henchmen section, lines 4071-4131)

### Step 1: Add `cards` array branch to Golden Solo henchmen loop

- [ ] **Edit `generateVillainDeck()` Golden Solo path at script.js lines 4071-4081**

Replace the current Golden Solo henchmen loop:

```js
    if (gameMode === GOLDEN_SOLO) {
      villainDeckHenchmen.forEach((henchmanName) => {
        const henchman = window.henchmen.find((h) => h.name === henchmanName);
        if (henchman) {
          for (let i = 0; i < 10; i++) {
            deck.push({ ...henchman, subtype: "Henchman" });
          }
        } else {
          console.warn(`Henchman with name ${henchmanName} not found.`);
        }
      });
```

With:

```js
    if (gameMode === GOLDEN_SOLO) {
      villainDeckHenchmen.forEach((henchmanName) => {
        const henchman = window.henchmen.find((h) => h.name === henchmanName);
        if (henchman) {
          if (henchman.cards) {
            for (const card of henchman.cards) {
              deck.push({ ...henchman, ...card, subtype: "Henchman" });
            }
          } else {
            for (let i = 0; i < 10; i++) {
              deck.push({ ...henchman, subtype: "Henchman" });
            }
          }
        } else {
          console.warn(`Henchman with name ${henchmanName} not found.`);
        }
      });
```

### Step 2: Add `cards` array branch to What If? Solo henchmen loops

- [ ] **Edit `generateVillainDeck()` What If? Solo path at script.js lines 4082-4131**

This path has three places where henchmen are cloned:
1. **Organized Crime special** (lines 4093-4100): 8 copies with ambush
2. **Normal special** (lines 4111-4117): 2+2 copies
3. **Non-special henchmen** (lines 4122-4124): 10 copies

For each loop, add the `cards` array branch. The non-special henchmen loop (10 copies, lines 4119-4124) is the most important:

Replace:
```js
          } else {
            // For the other henchmen:
            // Add 10 copies to the deck
            for (let i = 0; i < 10; i++) {
              deck.push({ ...henchman, subtype: "Henchman" });
            }
          }
```

With:
```js
          } else {
            // For the other henchmen:
            if (henchman.cards) {
              for (const card of henchman.cards) {
                deck.push({ ...henchman, ...card, subtype: "Henchman" });
              }
            } else {
              // Add 10 copies to the deck
              for (let i = 0; i < 10; i++) {
                deck.push({ ...henchman, subtype: "Henchman" });
              }
            }
          }
```

For the **special henchman paths** (Organized Crime 8+2, normal 2+2): a henchman with unique `cards` would need different split logic. For now, leave the special paths unchanged — if Mandarin's Rings is selected as the special henchman in What If?, the content phase will handle the specific split. The infrastructure is that the `cards` array gets expanded in the normal (non-special) path.

**Note:** If Mandarin's Rings is the special henchman in What If? Solo, the 2+2 split from 10 unique cards needs custom logic. That's a content-phase decision — Step 3 just ensures the 10-copy path works with `cards`.

### Step 3: Browser verification

- [ ] **Open `index.html` in browser, open DevTools console**

Start a Golden Solo game with any henchman group. After game loads, verify in console:

```js
// Existing henchmen should still produce 10 identical copies
// No errors in console during game setup
```

Then test the `cards` array path by temporarily patching a henchman in console before starting a game:

```js
// Before clicking Begin Game:
const testHenchman = window.henchmen.find(h => h.name === "Doombot Legion");
testHenchman.cards = [
  { name: "Doombot Alpha" }, { name: "Doombot Beta" }, { name: "Doombot Gamma" },
  { name: "Doombot Delta" }, { name: "Doombot Epsilon" }, { name: "Doombot Zeta" },
  { name: "Doombot Eta" }, { name: "Doombot Theta" }, { name: "Doombot Iota" },
  { name: "Doombot Kappa" }
];
// Start a Golden Solo game selecting Doombot Legion
// After game loads, check the villain deck in console — cards should have unique names
```

Refresh page to restore normal state.

### Step 4: Commit

- [ ] **Commit the unique henchmen support**

```bash
git add script.js
git commit -m "feat: support unique henchmen via optional cards array

generateVillainDeck() now checks for a 'cards' array on henchman
objects. If present, spreads each unique card instead of cloning
the template 10 times. No existing henchmen use this — activates
with Mandarin's Rings in Revelations."
```

---

## Task 3: `transformScheme()` Helper

**Files:**
- Modify: `script.js` (add new function, ~15 lines)

### Step 1: Add `transformScheme()` function

- [ ] **Add the function to `script.js`**

Place it near other scheme-related functions. A good location is after `randomizeScheme()` (~line 2024) or near the game-start functions. Add:

```js
function transformScheme() {
  const targetName = selectedScheme.transformsInto;
  if (!targetName) {
    console.warn("transformScheme() called but current scheme has no transformsInto field.");
    return;
  }

  const newScheme = schemes.find(s => s.name === targetName);
  if (!newScheme) {
    console.error(`Transform target scheme not found: "${targetName}"`);
    return;
  }

  selectedScheme = newScheme;

  // Update the in-game scheme image
  const schemeImg = document.querySelector('#scheme-place img');
  if (schemeImg) {
    schemeImg.src = newScheme.image;
    schemeImg.alt = newScheme.name;
  }

  onscreenConsole.log(`Scheme transformed to: <span class="console-highlights">${newScheme.name}</span>`);
}
```

### Step 2: Add `hiddenFromSetup` filtering to scheme randomize

- [ ] **Edit `randomizeScheme()` at script.js ~line 1997**

The randomize function iterates DOM radio buttons, so Side B schemes without radio buttons won't be picked. However, if any future code dynamically generates scheme options from the `schemes` array, it should skip `hiddenFromSetup` entries.

Add a guard to `randomizeScheme()` as a safety check. Find (~line 1997):

```js
    const filteredRadioButtons = schemeRadioButtons.filter((button) => {
      const schemeSet = button.getAttribute("data-set");
      return selectedFilters.length === 0 || selectedFilters.includes(schemeSet);
    });
```

Replace with:

```js
    const filteredRadioButtons = schemeRadioButtons.filter((button) => {
      const schemeSet = button.getAttribute("data-set");
      const schemeName = button.value;
      const schemeData = schemes.find(s => s.name === schemeName);
      if (schemeData && schemeData.hiddenFromSetup) return false;
      return selectedFilters.length === 0 || selectedFilters.includes(schemeSet);
    });
```

### Step 3: Browser verification

- [ ] **Open `index.html` in browser, open DevTools console**

Test `transformScheme()` by temporarily creating linked scheme entries:

```js
// Add a fake Side B scheme to the schemes array
schemes.push({
  name: "Test Side B",
  transformsInto: "Midtown Bank Robbery",
  hiddenFromSetup: true,
  image: "Visual Assets/CardBack.webp"
});
// Add transformsInto to an existing scheme
schemes.find(s => s.name === "Midtown Bank Robbery").transformsInto = "Test Side B";

// Start a game with Midtown Bank Robbery selected
// After game loads, run in console:
transformScheme();
// Expected: console log "Scheme transformed to: Test Side B"
// Expected: scheme image changes to CardBack.webp
// Run again:
transformScheme();
// Expected: console log "Scheme transformed to: Midtown Bank Robbery"
// Expected: scheme image changes back
```

Also verify randomize doesn't pick hidden schemes:
```js
// Before starting a game, verify randomize skips hidden entries
// (Test Side B has no radio button, so it won't be picked regardless)
```

Refresh page to restore normal state.

### Step 4: Commit

- [ ] **Commit the transform scheme helper**

```bash
git add script.js
git commit -m "feat: add transformScheme() helper and hiddenFromSetup filtering

New transformScheme() swaps selectedScheme to its transformsInto
partner and updates the in-game scheme image. randomizeScheme()
now skips schemes with hiddenFromSetup. No current schemes use
these fields — activates with Revelations transforming schemes."
```

---

## Task 4: Recruit-Only Fight Cost

**Files:**
- Modify: `script.js` (city villain affordability check in `updateGameBoard()` ~line 7075, point deduction in `defeatVillain()` ~line 11513)

### Step 1: Add recruit-only branch to affordability check

- [ ] **Edit the city villain affordability check at script.js ~lines 7075-7089**

Find the current check:

```js
          const canAttackWithAttackPoints =
            totalAttackPoints + reservedAttack >= villainAttack;
          const hasBribeKeyword =
            Array.isArray(city[i].keywords) && city[i].keywords.includes("Bribe");
          const canAttackWithRecruitPoints =
            (recruitUsedToAttack || hasBribeKeyword) &&
            totalAttackPoints + totalRecruitPoints + reservedAttack >=
              villainAttack;

          if (canAttackWithAttackPoints || canAttackWithRecruitPoints) {
            cityCell.classList.add("attackable");
            if (canAttackWithRecruitPoints && !canAttackWithAttackPoints) {
              cityCell.classList.add("needs-recruit");
            }
          }
```

Replace with:

```js
          const usesRecruitToFight = city[i].usesRecruitToFight === true;
          let canAttackWithAttackPoints;
          let canAttackWithRecruitPoints;

          if (usesRecruitToFight) {
            // Recruit-only fight (e.g., Mister Hyde as Dr. Calvin Zabo)
            canAttackWithAttackPoints = false;
            canAttackWithRecruitPoints = totalRecruitPoints >= villainAttack;
          } else {
            canAttackWithAttackPoints =
              totalAttackPoints + reservedAttack >= villainAttack;
            const hasBribeKeyword =
              Array.isArray(city[i].keywords) && city[i].keywords.includes("Bribe");
            canAttackWithRecruitPoints =
              (recruitUsedToAttack || hasBribeKeyword) &&
              totalAttackPoints + totalRecruitPoints + reservedAttack >=
                villainAttack;
          }

          if (canAttackWithAttackPoints || canAttackWithRecruitPoints) {
            cityCell.classList.add("attackable");
            if (canAttackWithRecruitPoints && !canAttackWithAttackPoints) {
              cityCell.classList.add("needs-recruit");
            }
          }
```

### Step 2: Add recruit-only branch to `defeatVillain()` point deduction

- [ ] **Edit `defeatVillain()` at script.js ~line 11513**

Find the point deduction block:

```js
    if (villainAttack > 0) {
      // Handle point deduction (skip for instant defeat)
      if (!isInstantDefeat) {
        try {
          if (
            (!negativeZoneAttackAndRecruit && recruitUsedToAttack === true) ||
            (villainCard.keywords && villainCard.keywords.includes("Bribe"))
          ) {
```

Add a recruit-only check BEFORE the existing Bribe/recruitUsedToAttack check. Replace the opening of the try block:

```js
    if (villainAttack > 0) {
      // Handle point deduction (skip for instant defeat)
      if (!isInstantDefeat) {
        try {
          if (villainCard.usesRecruitToFight) {
            // Recruit-only fight — deduct entirely from recruit points
            totalRecruitPoints -= villainAttack;
            onscreenConsole.log(
              `You used ${villainAttack} <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> to fight <span class="console-highlights">${villainCopy.name}</span>.`
            );
          } else if (
            (!negativeZoneAttackAndRecruit && recruitUsedToAttack === true) ||
            (villainCard.keywords && villainCard.keywords.includes("Bribe"))
          ) {
```

**Important:** The closing braces and the rest of the existing logic (showCounterPopup, normal attack deduction, negativeZone path) remain unchanged. The new `if` becomes the first branch, and the existing Bribe check becomes `else if`.

### Step 3: Browser verification

- [ ] **Open `index.html` in browser, start a game, open DevTools console**

Test by temporarily setting `usesRecruitToFight` on a city villain:

```js
// Find a villain in the city
city.forEach((v, i) => { if (v) console.log(i, v.name, v.attack); });

// Pick one and set the flag (use the index from above, e.g., index 2)
city[2].usesRecruitToFight = true;
updateGameBoard();

// Verify: the villain's cell should only be attackable if you have enough recruit points
// (it should show as "needs-recruit" styled, or not attackable if recruit is too low)
// With enough recruit points, click to fight — verify recruit points decrease, not attack points
```

Also verify normal villains still work:
```js
// Fight a normal villain (without usesRecruitToFight) — should deduct attack points as usual
```

### Step 4: Commit

- [ ] **Commit the recruit-only fight cost**

```bash
git add script.js
git commit -m "feat: support recruit-only fight cost via usesRecruitToFight flag

City villain affordability check now handles a third path: when
usesRecruitToFight is true, only recruit points count. defeatVillain()
deducts from totalRecruitPoints directly with no split popup. No
current villains use this — activates with Mister Hyde in Revelations."
```

---

## Task 5: Final Verification and Update Progress

**Files:**
- Modify: `docs/expansion-progress/revelations.md`

### Step 1: Full regression check

- [ ] **Open `index.html`, play through a few turns of a Golden Solo game**

Verify:
1. No console errors during setup or gameplay
2. Mastermind fights work normally (no epic toggle visible for existing masterminds)
3. Henchmen appear in villain deck as expected (10 identical copies)
4. Scheme twists fire correctly
5. Villain fight deducts attack points correctly
6. Bribe villains still work (attack+recruit split popup appears)

### Step 2: Update Revelations progress file

- [ ] **Edit `docs/expansion-progress/revelations.md`**

Change Step 3 status from:

```
#### Step 3 — Small Infrastructure Bundle ⬜ Not started
```

To:

```
#### Step 3 — Small Infrastructure Bundle ✅ Complete (YYYY-MM-DD)
```

Update the bullet list to reflect what was built (4 items, extra turn deferred).

### Step 3: Commit progress update

- [ ] **Commit the progress update**

```bash
git add docs/expansion-progress/revelations.md
git commit -m "docs: mark Step 3 infrastructure bundle complete"
```
