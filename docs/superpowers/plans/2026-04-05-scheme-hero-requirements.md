# Scheme Hero Requirements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Golden Solo's hardcoded 5-hero count so schemes dictate hero requirements, and add infrastructure for team composition and specific hero requirements with validation, randomize support, and a setup banner.

**Architecture:** Four hardcoded ternaries in `script.js` are replaced with direct `scheme.requiredHeroes` usage. A new optional `heroRequirements` field on scheme objects enables team composition and specific hero constraints. Validation, randomize, and a banner div all read from this field.

**Tech Stack:** Vanilla JS, static HTML/CSS. No build step. Manual browser testing.

**Spec:** `docs/superpowers/specs/2026-04-05-scheme-hero-requirements-design.md`

---

### Task 1: Remove Golden Solo Hardcoded Hero Count

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (4 locations)

This task changes all four places where Golden Solo overrides the scheme's hero count with a hardcoded `5`. After this, both game modes use `scheme.requiredHeroes`.

- [ ] **Step 1: Fix standalone Randomize Heroes (Location A, ~line 2305)**

The standalone randomize button also hardcodes `3` for What If — it should use the scheme's count for both modes. The function already looks up the selected scheme at line 2257.

Change line 2305 from:
```js
const _rh_count = (_rh_gameMode === GOLDEN_SOLO) ? 5 : 3;
```
to:
```js
const _rh_count = selectedScheme ? selectedScheme.requiredHeroes : 3;
```

Also remove the now-unused `_rh_gameMode` variable (line 2304) and its comment (line 2303):
```js
// Randomly select heroes — Golden Solo always uses 5 heroes
const _rh_gameMode = document.querySelector('input[name="gameMode"]:checked')?.value || 'whatif';
```

- [ ] **Step 2: Fix summary panel display (Location B, ~line 2531)**

Change line 2531 from:
```js
const requiredHeroes = (gameModeValue === GOLDEN_SOLO) ? 5 : (scheme ? (scheme.requiredHeroes ?? null) : null);
```
to:
```js
const requiredHeroes = scheme ? (scheme.requiredHeroes ?? null) : null;
```

- [ ] **Step 3: Fix Randomize All (Location C, ~line 2896-2898)**

Change lines 2896-2898 from:
```js
// Randomly select the required number of heroes — Golden Solo always uses 5
const _rhr_gameMode = document.querySelector('input[name="gameMode"]:checked')?.value || 'whatif';
const _rhr_count = (_rhr_gameMode === GOLDEN_SOLO) ? 5 : scheme.requiredHeroes;
```
to:
```js
const _rhr_count = scheme.requiredHeroes;
```

- [ ] **Step 4: Fix validation at confirm (Location D, ~lines 3087-3090)**

Change lines 3087-3090 from:
```js
// Hero count validation — Golden Solo always requires 5 heroes.
// Read from DOM directly (gameMode global isn't set until startGame() runs).
const _selectedGameMode = document.querySelector('input[name="gameMode"]:checked')?.value || 'whatif';
const requiredHeroes = (_selectedGameMode === GOLDEN_SOLO) ? 5 : scheme.requiredHeroes;
```
to:
```js
// Hero count validation — uses scheme's requiredHeroes for all game modes.
const requiredHeroes = scheme.requiredHeroes;
```

- [ ] **Step 5: Manual test**

Open `index.html` in browser. Test:
1. Select Golden Solo mode + a scheme with `requiredHeroes: 3` (most schemes) → summary panel shows `(0/3)`, validation requires 3
2. Select Golden Solo mode + "Secret Invasion of the Skrull Shapeshifters" (`requiredHeroes: 6`) → summary panel shows `(0/6)`, validation requires 6
3. Select Golden Solo mode + "Superhero Civil War" (`requiredHeroes: 4`) → summary panel shows `(0/4)`, validation requires 4
4. Click "Randomize Heroes" → selects the correct number for the scheme
5. Click "Randomize All" → selects the correct number for the scheme
6. What If? Solo mode still works as before

- [ ] **Step 6: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: use scheme.requiredHeroes for all game modes instead of hardcoded 5"
```

---

### Task 2: Add Hero Requirements Banner

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/index.html` (~line 466)
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/styles.css`
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js`

This task adds a small banner `<div>` that displays hero requirements when a scheme with `heroRequirements` is selected.

- [ ] **Step 1: Add banner div to index.html**

Insert between line 466 (after hero team filter chips) and line 467 (before the scrollable hero list):

```html
        <div id="hero-requirements-banner" class="hero-requirements-banner" style="display: none;"></div>
```

So the structure becomes:
```html
        <div id="hero-selected-team-filters" class="selected-filters"></div>
        <div id="hero-requirements-banner" class="hero-requirements-banner" style="display: none;"></div>
        <div class="options">
```

- [ ] **Step 2: Add banner CSS to styles.css**

Add at the end of `styles.css`:

```css
/* Hero requirements banner */
.hero-requirements-banner {
  background-color: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.4);
  border-radius: 6px;
  padding: 6px 12px;
  margin: 6px 0;
  font-size: 0.85em;
  color: #e0e0e0;
}
```

- [ ] **Step 3: Add `updateHeroRequirementsBanner()` function to script.js**

Add this function near `updateSummaryPanel()` (after line ~2556):

```js
function updateHeroRequirementsBanner() {
  const banner = document.getElementById('hero-requirements-banner');
  if (!banner) return;

  const schemeName = document.querySelector('#scheme-section input[type="radio"]:checked')?.value;
  const scheme = schemes.find(s => s.name === schemeName);

  if (!scheme || !scheme.heroRequirements) {
    banner.style.display = 'none';
    banner.textContent = '';
    return;
  }

  const parts = [];
  const req = scheme.heroRequirements;

  if (req.teamComposition) {
    for (const tc of req.teamComposition) {
      if (tc.team.startsWith('non:')) {
        parts.push(`${tc.count} non-${tc.team.slice(4)} hero${tc.count !== 1 ? 'es' : ''}`);
      } else {
        parts.push(`${tc.count} ${tc.team} hero${tc.count !== 1 ? 'es' : ''}`);
      }
    }
  }

  if (req.requiredHero) {
    for (const hero of req.requiredHero) {
      parts.push(hero);
    }
  }

  banner.textContent = 'This scheme requires: ' + parts.join(', ');
  banner.style.display = 'block';
}
```

- [ ] **Step 4: Hook banner update to scheme selection changes**

Add the call right after the existing `updateSummaryPanel` listener on `scheme-selection` (near line 2545):

```js
document.getElementById('scheme-selection').addEventListener('change', updateHeroRequirementsBanner);
```

Also call it once at startup (near line 2556 where `updateSummaryPanel()` is first called):

```js
updateHeroRequirementsBanner();
```

- [ ] **Step 5: Manual test**

No current schemes have `heroRequirements`, so temporarily add one to test:

In `cardDatabase.js`, temporarily add to a scheme (e.g., the first scheme):
```js
heroRequirements: { teamComposition: [{ team: "X-Men", count: 2 }], requiredHero: ["Spider-Man"] },
```

Verify the banner appears when that scheme is selected and disappears when another scheme is selected. Then remove the test data.

- [ ] **Step 6: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/index.html Legendary-Solo-Play-main/Legendary-Solo-Play-main/styles.css Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: add hero requirements banner for schemes with heroRequirements"
```

---

### Task 3: Extend Validation for Hero Requirements

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (~lines 3087-3138)

This task extends `showConfirmChoicesPopup()` to validate team composition and required hero constraints, blocking game start if unmet.

- [ ] **Step 1: Add team composition validation**

After the existing hero count validation block (after line ~3096), add:

```js
  // Hero requirements validation (team composition + required heroes)
  let heroRequirementsMet = true;

  if (scheme.heroRequirements) {
    const req = scheme.heroRequirements;

    // Team composition validation
    if (req.teamComposition) {
      for (const tc of req.teamComposition) {
        let matchCount;
        if (tc.team.startsWith('non:')) {
          const excludeTeam = tc.team.slice(4);
          matchCount = heroes.filter(h => {
            const checkbox = document.querySelector(`input[name="hero"][value="${h}"]`);
            return checkbox && checkbox.dataset.team !== excludeTeam;
          }).length;
        } else {
          matchCount = heroes.filter(h => {
            const checkbox = document.querySelector(`input[name="hero"][value="${h}"]`);
            return checkbox && checkbox.dataset.team === tc.team;
          }).length;
        }
        if (matchCount !== tc.count) {
          const teamLabel = tc.team.startsWith('non:') ? `non-${tc.team.slice(4)}` : tc.team;
          heroFeedback += `<br><span class="error-spans">You need ${tc.count} ${teamLabel} hero${tc.count !== 1 ? 'es' : ''} (currently have ${matchCount}).</span>`;
          heroRequirementsMet = false;
        }
      }
    }

    // Required specific hero validation
    if (req.requiredHero) {
      for (const heroName of req.requiredHero) {
        if (!heroes.includes(heroName)) {
          heroFeedback += `<br><span class="error-spans">This scheme requires ${heroName}.</span>`;
          heroRequirementsMet = false;
        }
      }
    }
  }
```

- [ ] **Step 2: Update heroesCorrect gate**

Change line ~3138 from:
```js
const heroesCorrect = heroes.length === requiredHeroes;
```
to:
```js
const heroesCorrect = heroes.length === requiredHeroes && heroRequirementsMet;
```

This ensures the Begin Game button stays disabled until all hero conditions are met.

- [ ] **Step 3: Manual test**

Temporarily add `heroRequirements` to a scheme in `cardDatabase.js` (as in Task 2, Step 5). Test:
1. Select that scheme, pick heroes that don't meet requirements → error messages appear, Begin button disabled
2. Pick heroes that meet requirements → no errors, Begin button enabled
3. Select a different scheme without `heroRequirements` → no extra validation
Then remove the test data.

- [ ] **Step 4: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: validate team composition and required hero constraints at confirm"
```

---

### Task 4: Extend Randomize Logic for Hero Requirements

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (two randomize functions)

This task updates both `randomizeHero()` and `randomizeHeroWithRequirements()` to respect `heroRequirements` when picking random heroes.

- [ ] **Step 1: Add a hero requirements-aware random picker helper**

Add this function above `randomizeHero()` (before line ~2247):

```js
/**
 * Picks random heroes that satisfy a scheme's heroRequirements.
 * @param {HTMLInputElement[]} availableCheckboxes - filtered hero checkboxes
 * @param {object} scheme - the selected scheme object
 * @returns {HTMLInputElement[]} - selected checkboxes satisfying requirements
 */
function pickHeroesForRequirements(availableCheckboxes, scheme) {
  const count = scheme.requiredHeroes;
  const req = scheme.heroRequirements;

  if (!req) {
    // No special requirements — simple random pick
    return fisherYatesShuffle([...availableCheckboxes]).slice(0, count);
  }

  const selected = [];
  const used = new Set();

  // Step 1: Include required specific heroes
  if (req.requiredHero) {
    for (const heroName of req.requiredHero) {
      const cb = availableCheckboxes.find(c => c.value === heroName);
      if (cb && !used.has(cb.value)) {
        selected.push(cb);
        used.add(cb.value);
      }
    }
  }

  // Step 2: Fill team composition constraints
  if (req.teamComposition) {
    for (const tc of req.teamComposition) {
      // Count how many already-selected heroes satisfy this constraint
      let alreadySatisfied;
      if (tc.team.startsWith('non:')) {
        const excludeTeam = tc.team.slice(4);
        alreadySatisfied = selected.filter(c => c.dataset.team !== excludeTeam).length;
      } else {
        alreadySatisfied = selected.filter(c => c.dataset.team === tc.team).length;
      }

      const needed = tc.count - alreadySatisfied;
      if (needed <= 0) continue;

      // Find eligible candidates not yet selected
      let candidates;
      if (tc.team.startsWith('non:')) {
        const excludeTeam = tc.team.slice(4);
        candidates = availableCheckboxes.filter(c => c.dataset.team !== excludeTeam && !used.has(c.value));
      } else {
        candidates = availableCheckboxes.filter(c => c.dataset.team === tc.team && !used.has(c.value));
      }

      const picks = fisherYatesShuffle([...candidates]).slice(0, needed);
      for (const cb of picks) {
        selected.push(cb);
        used.add(cb.value);
      }
    }
  }

  // Step 3: Fill remaining slots randomly
  const remaining = count - selected.length;
  if (remaining > 0) {
    const leftover = availableCheckboxes.filter(c => !used.has(c.value));
    const picks = fisherYatesShuffle([...leftover]).slice(0, remaining);
    selected.push(...picks);
  }

  return selected;
}
```

- [ ] **Step 2: Update `randomizeHero()` to use the helper**

In `randomizeHero()`, replace lines ~2305-2307:
```js
const _rh_count = selectedScheme ? selectedScheme.requiredHeroes : 3;
const shuffledCheckboxes = fisherYatesShuffle([...filteredCheckboxes]);
const selectedCheckboxes = shuffledCheckboxes.slice(0, _rh_count);
```
with:
```js
const selectedCheckboxes = selectedScheme
  ? pickHeroesForRequirements(filteredCheckboxes, selectedScheme)
  : fisherYatesShuffle([...filteredCheckboxes]).slice(0, 3);
```

Note: `_rh_count` was already changed in Task 1 Step 1. This step replaces that line with the helper call.

- [ ] **Step 3: Update `randomizeHeroWithRequirements()` to use the helper**

In `randomizeHeroWithRequirements()`, replace lines ~2898-2900:
```js
const _rhr_count = scheme.requiredHeroes;
const shuffledCheckboxes = fisherYatesShuffle([...filteredCheckboxes]);
const selectedCheckboxes = shuffledCheckboxes.slice(0, _rhr_count);
```
with:
```js
const selectedCheckboxes = pickHeroesForRequirements(filteredCheckboxes, scheme);
```

- [ ] **Step 4: Manual test**

Temporarily add `heroRequirements` to a scheme:
```js
heroRequirements: { teamComposition: [{ team: "X-Men", count: 4 }, { team: "non:X-Men", count: 2 }] },
requiredHeroes: 6,
```

Test:
1. Select that scheme, click "Randomize Heroes" → should pick exactly 4 X-Men and 2 non-X-Men
2. Click "Randomize All" → same result
3. Verify Begin Game validation passes with the randomized selection
4. Select a scheme without `heroRequirements`, randomize → works as before
Then remove the test data.

- [ ] **Step 5: Commit**

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "feat: randomize heroes respects team composition and required hero constraints"
```

---

### Task 5: Final Integration Test and Cleanup

**Files:**
- Review: all modified files

- [ ] **Step 1: Full integration test**

Open `index.html` in browser. Run through this checklist:

**Golden Solo mode:**
1. Scheme with `requiredHeroes: 3` → counter shows `/3`, randomize picks 3, validation requires 3
2. Scheme with `requiredHeroes: 6` (Secret Invasion) → counter shows `/6`, randomize picks 6, validation requires 6
3. Scheme with `requiredHeroes: 4` (Civil War) → counter shows `/4`, randomize picks 4, validation requires 4
4. Switch between schemes → counter updates, banner shows/hides appropriately
5. Start a game with correct hero count → game starts normally
6. Try to start with wrong count → error message, Begin button disabled

**What If? Solo mode:**
7. All of the above should work identically (schemes were already respected in some paths, now all paths are consistent)

**No `heroRequirements` regression:**
8. Play through a full game with a standard scheme → no errors, no unexpected behavior

- [ ] **Step 2: Commit any cleanup**

If any adjustments were needed during testing:

```bash
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "fix: address issues found during integration testing"
```
