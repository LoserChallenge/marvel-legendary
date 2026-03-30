# Live Selection Summary Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed bottom panel to the setup screen that shows all current selections at a glance with color-coded counts, replacing the floating right-side control cluster.

**Architecture:** A new `#summary-panel` div is appended to `#home-screen` in `index.html`, positioned `fixed` at the viewport bottom. A single `updateSummaryPanel()` function in `script.js` reads all form inputs and the selected scheme's requirements, then renders category labels, names, and color-coded counts. The existing right-side Game Mode, Final Blow, and bottom button elements are relocated into the panel.

**Tech Stack:** Vanilla HTML/CSS/JS (no build step, no dependencies)

**Spec:** `docs/superpowers/specs/2026-03-27-live-selection-summary-panel-design.md`

**Out of scope:** No changes to What If? villain draw behavior. No changes to Golden Solo game logic. No layout changes to the in-game board. No modifications to the CONFIRM CHOICES popup validation logic. Setup-screen-only feature.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `index.html` | Modify (lines 542-563) | Remove right-side floating cluster; add `#summary-panel` HTML |
| `styles.css` | Modify (add new block ~line 8640+) | Panel fixed positioning, flexbox rows, count colors, responsive stacking, bottom padding on `#home-screen` |
| `script.js` | Modify (add new block near top-level listeners ~line 2430+) | `updateSummaryPanel()` function + event listeners on all setup inputs |

No new files are created. All changes are in existing files.

---

## Task 1: Add Summary Panel HTML Shell

**Files:**
- Modify: `index.html:542-563` (replace right-side cluster with panel)
- Modify: `index.html` (add panel div before `#confirm-start-up-choices`)

### Steps

- [ ] **Step 1.1: Read the current right-side cluster HTML**

Read `index.html` lines 542-563 to confirm the exact HTML that will be replaced.

- [ ] **Step 1.2: Replace right-side cluster with summary panel**

Remove the following elements from their current positions (lines 542-563):
- `#game-mode-section` (lines 542-548)
- `#final-blow-section` (lines 550-558)
- `.startup-centered-buttons` bottom cluster (lines 559-563)

Insert the new `#summary-panel` div in their place. The panel contains two rows:

```html
<!-- Selection Summary Panel (fixed bottom of setup screen) -->
<div id="summary-panel">
  <div id="summary-row-1">
    <div class="summary-item" id="summary-scheme">
      <span class="summary-label">SCHEME</span>
      <span class="summary-value" id="summary-scheme-value">None</span>
    </div>
    <div class="summary-item" id="summary-mastermind">
      <span class="summary-label">MASTERMIND</span>
      <span class="summary-value" id="summary-mastermind-value">None</span>
    </div>
    <div class="summary-item" id="summary-villains">
      <span class="summary-label">VILLAINS</span>
      <span class="summary-value" id="summary-villains-value">None</span>
      <span class="summary-count" id="summary-villains-count"></span>
    </div>
    <div class="summary-item" id="summary-henchmen">
      <span class="summary-label">HENCHMEN</span>
      <span class="summary-value" id="summary-henchmen-value">None</span>
      <span class="summary-count" id="summary-henchmen-count"></span>
    </div>
    <div class="summary-item summary-control" id="summary-game-mode">
      <span class="summary-label">GAME MODE</span>
      <!-- Game Mode radio buttons relocated here -->
      <div id="game-mode-options">
        <label><input type="radio" name="gameMode" id="mode-whatif" value="whatif" checked> What If?</label>
        <label><input type="radio" name="gameMode" id="mode-golden" value="golden"> Golden Solo</label>
      </div>
    </div>
    <div class="summary-item summary-control" id="summary-final-blow">
      <span class="summary-label">FINAL BLOW</span>
      <!-- Final Blow toggle relocated here -->
      <div id="finalBlowToggle">
        <label class="switch">
          <input type="checkbox" id="final-blow-checkbox">
          <span class="slider round"></span>
        </label>
      </div>
    </div>
  </div>
  <div id="summary-row-2">
    <div class="summary-item summary-heroes-item" id="summary-heroes">
      <span class="summary-label">HEROES</span>
      <span class="summary-value" id="summary-heroes-value">None</span>
      <span class="summary-count" id="summary-heroes-count"></span>
    </div>
    <div class="summary-buttons">
      <button id="randomize-all2" class="start-up-buttons">RANDOMIZE ALL</button>
      <button id="load-last-setup-2" class="start-up-buttons">LOAD LAST SETUP</button>
      <button id="start-game2" class="start-up-buttons">START GAME</button>
    </div>
  </div>
</div>
```

- [ ] **Step 1.3: Verify HTML is valid**

Open `index.html` in browser. The panel should appear at the bottom (unstyled). Confirm no console errors about missing element IDs — all existing IDs (`mode-whatif`, `mode-golden`, `final-blow-checkbox`, `randomize-all2`, `load-last-setup-2`, `start-game2`) are preserved.

- [ ] **Step 1.4: Commit**

```bash
git add "Legendary-Solo-Play-main/Legendary-Solo-Play-main/index.html"
git commit -m "feat: add summary panel HTML shell, relocate controls from right-side cluster"
```

---

## Task 2: Style the Summary Panel

**Files:**
- Modify: `styles.css` (add new rules at end of file, ~line 8640+)
- Modify: `styles.css` (remove/disable old right-side positioning for `#game-mode-section`, `#final-blow-section`, `.startup-centered-buttons`)

### Steps

- [ ] **Step 2.1: Remove old fixed-position styles**

Comment out or remove these existing CSS rules that positioned elements on the right side:

- `#game-mode-section` (lines 8537-8547) — delete the `position: fixed`, `right`, `bottom`, `width` rules
- `#final-blow-section` (lines 1323-1333) — delete the `position: fixed`, `right`, `bottom`, `width` rules
- `.startup-centered-buttons` (lines 1273-1282) — delete the `position: fixed`, `right`, `bottom`, `width` rules
- Media query overrides for these at max-width 500px (lines 1347-1409) — remove the relevant blocks

- [ ] **Step 2.2: Add panel container styles**

Add at the end of `styles.css`:

```css
/* ===== Selection Summary Panel ===== */

#summary-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #1e2a36;
  border-top: 3px solid var(--accent);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.4);
  padding: 10px 16px;
  display: none; /* shown by JS when on setup screen */
  flex-direction: column;
  gap: 6px;
  font-family: "Roboto Condensed", sans-serif;
}

#summary-panel.visible {
  display: flex;
}
```

- [ ] **Step 2.3: Add row layout styles**

```css
#summary-row-1,
#summary-row-2 {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px 20px;
}

#summary-row-2 {
  align-items: center;
}
```

- [ ] **Step 2.4: Add summary item styles**

```css
.summary-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
}

.summary-heroes-item {
  flex: 1;
  min-width: 0;
}

.summary-label {
  color: var(--accent);
  font-weight: 700;
  font-size: clamp(9px, 1.4vh, 14px);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.summary-value {
  color: var(--popupText);
  font-size: clamp(9px, 1.4vh, 14px);
  font-weight: 400;
}

.summary-count {
  font-size: clamp(9px, 1.4vh, 14px);
  font-weight: 700;
  white-space: nowrap;
}
```

- [ ] **Step 2.5: Add count color classes**

```css
.count-grey   { color: #888888; }
.count-amber  { color: #f0ad4e; }
.count-green  { color: #5cb85c; }
.count-red    { color: #d9534f; }
```

- [ ] **Step 2.6: Add control and button styles within panel**

```css
.summary-control {
  align-items: center;
}

#summary-panel #game-mode-options {
  display: flex;
  gap: 10px;
}

#summary-panel #game-mode-options label {
  color: var(--popupText);
  font-size: clamp(9px, 1.4vh, 14px);
  cursor: pointer;
  white-space: nowrap;
}

#summary-panel #finalBlowToggle {
  display: inline-flex;
  align-items: center;
}

.summary-buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.summary-buttons .start-up-buttons {
  width: auto;
  padding: 6px 14px;
  font-size: clamp(9px, 1.4vh, 14px);
}
```

- [ ] **Step 2.7: Add bottom padding to setup content**

```css
#home-screen {
  padding-bottom: 120px; /* space for fixed summary panel */
}
```

- [ ] **Step 2.8: Add responsive stacking for narrow screens**

```css
@media (max-width: 700px) {
  #summary-row-1,
  #summary-row-2 {
    flex-direction: column;
    gap: 4px;
  }

  .summary-buttons {
    margin-left: 0;
    flex-wrap: wrap;
  }

  #summary-panel {
    padding: 8px 10px;
  }
}
```

- [ ] **Step 2.9: Verify visual appearance**

Open `index.html` in browser. Confirm:
- Panel is fixed at viewport bottom
- Gold top border visible
- Category labels are gold/yellow, bold, small caps
- Panel does not cover the bottom of setup content (padding works)
- Panel stays fixed while scrolling

- [ ] **Step 2.10: Commit**

```bash
git add "Legendary-Solo-Play-main/Legendary-Solo-Play-main/styles.css"
git commit -m "feat: style summary panel with fixed positioning, count colors, responsive layout"
```

---

## Task 3: Implement `updateSummaryPanel()` Function

**Files:**
- Modify: `script.js` (add new function and listeners)

**Important:** Reuse the existing `schemes` array from `cardDatabase.js` (defined at line 132) to look up requirements. Do NOT re-parse radio button text or invent a second data source — use `schemes.find(s => s.name === schemeName)` exactly as the rest of `script.js` does.

### Steps

- [ ] **Step 3.1: Add the `updateSummaryPanel()` function**

Add this function near the top-level listener section of `script.js` (after the existing setup-screen event listeners, around line 2450):

```javascript
function updateSummaryPanel() {
  // --- Scheme ---
  const schemeRadio = document.querySelector('#scheme-selection input[type="radio"]:checked');
  const schemeName = schemeRadio ? schemeRadio.value : null;
  document.getElementById('summary-scheme-value').textContent = schemeName || 'None';

  // Look up scheme object for requirements
  const scheme = schemeName ? schemes.find(s => s.name === schemeName) : null;

  // --- Mastermind ---
  const mastermindRadio = document.querySelector('#mastermind-selection input[type="radio"]:checked');
  const mastermindName = mastermindRadio ? mastermindRadio.value : null;
  document.getElementById('summary-mastermind-value').textContent = mastermindName || 'None';

  // --- Game Mode ---
  const gameModeValue = document.querySelector('input[name="gameMode"]:checked')?.value || 'whatif';

  // --- Villains ---
  const selectedVillains = Array.from(
    document.querySelectorAll('#villain-selection input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  const villainsValueEl = document.getElementById('summary-villains-value');
  const villainsCountEl = document.getElementById('summary-villains-count');

  if (selectedVillains.length === 0) {
    villainsValueEl.textContent = 'None';
  } else {
    villainsValueEl.textContent = selectedVillains.join(', ');
  }

  const requiredVillains = scheme ? scheme.requiredVillains : null;
  villainsCountEl.textContent = `(${selectedVillains.length}/${requiredVillains !== null ? requiredVillains : '?'})`;
  villainsCountEl.className = 'summary-count ' + getCountColorClass(selectedVillains.length, requiredVillains);

  // --- Henchmen ---
  const selectedHenchmen = Array.from(
    document.querySelectorAll('#henchmen-selection input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  const henchmenValueEl = document.getElementById('summary-henchmen-value');
  const henchmenCountEl = document.getElementById('summary-henchmen-count');

  if (selectedHenchmen.length === 0) {
    henchmenValueEl.textContent = 'None';
  } else {
    henchmenValueEl.textContent = selectedHenchmen.join(', ');
  }

  const requiredHenchmen = scheme ? scheme.requiredHenchmen : null;
  henchmenCountEl.textContent = `(${selectedHenchmen.length}/${requiredHenchmen !== null ? requiredHenchmen : '?'})`;
  henchmenCountEl.className = 'summary-count ' + getCountColorClass(selectedHenchmen.length, requiredHenchmen);

  // --- Heroes ---
  const selectedHeroes = Array.from(
    document.querySelectorAll('#hero-selection input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  const heroesValueEl = document.getElementById('summary-heroes-value');
  const heroesCountEl = document.getElementById('summary-heroes-count');

  if (selectedHeroes.length === 0) {
    heroesValueEl.textContent = 'None';
  } else {
    heroesValueEl.textContent = selectedHeroes.join(', ');
  }

  const requiredHeroes = (gameModeValue === 'golden') ? 5 : (scheme ? scheme.requiredHeroes : null);
  heroesCountEl.textContent = `(${selectedHeroes.length}/${requiredHeroes !== null ? requiredHeroes : '?'})`;
  heroesCountEl.className = 'summary-count ' + getCountColorClass(selectedHeroes.length, requiredHeroes);
}

function getCountColorClass(selected, required) {
  if (required === null) return 'count-grey';
  if (selected === 0) return 'count-grey';
  if (selected === required) return 'count-green';
  if (selected < required) return 'count-amber';
  return 'count-red'; // selected > required
}
```

- [ ] **Step 3.2: Verify function loads without errors**

Open `index.html` in browser. Open DevTools console. Type `updateSummaryPanel()` — should not throw errors.

- [ ] **Step 3.3: Commit**

```bash
git add "Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js"
git commit -m "feat: add updateSummaryPanel() and getCountColorClass() functions"
```

---

## Task 4: Wire Up Event Listeners

**Files:**
- Modify: `script.js` (add change listeners on all setup inputs)

### Steps

- [ ] **Step 4.1: Add change listeners to all setup form inputs**

Add after the `updateSummaryPanel` function definition:

```javascript
// --- Summary Panel: live update listeners ---
document.getElementById('scheme-selection').addEventListener('change', updateSummaryPanel);
document.getElementById('mastermind-selection').addEventListener('change', updateSummaryPanel);
document.getElementById('villain-selection').addEventListener('change', updateSummaryPanel);
document.getElementById('henchmen-selection').addEventListener('change', updateSummaryPanel);
document.getElementById('hero-selection').addEventListener('change', updateSummaryPanel);
document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
  radio.addEventListener('change', updateSummaryPanel);
});
```

- [ ] **Step 4.2: Show panel on page load and call initial update**

Add after the listeners:

```javascript
// Show summary panel on setup screen load
document.getElementById('summary-panel').classList.add('visible');
updateSummaryPanel();
```

- [ ] **Step 4.3: Verify live updates work**

Open `index.html` in browser:
1. Select a scheme — scheme name should appear in panel
2. Select a mastermind — mastermind name should appear
3. Check some heroes — hero names appear, count updates with correct color
4. Change Game Mode to Golden Solo — hero required count should change to 5
5. Change scheme — required counts should update

- [ ] **Step 4.4: Commit**

```bash
git add "Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js"
git commit -m "feat: wire up live update listeners for summary panel"
```

---

## Task 5: Panel Visibility — Hide During Gameplay

**Files:**
- Modify: `script.js` (hide panel when game starts, show when returning to setup)

### Steps

- [ ] **Step 5.1: Find where setup screen is hidden and game board is shown**

Read `script.js` around line 3362 where `home-screen` display is set to "none" and `game-board` is set to "block".

- [ ] **Step 5.2: Hide summary panel when game starts**

In the `onBeginGame()` function (or wherever the transition happens), add:

```javascript
document.getElementById('summary-panel').classList.remove('visible');
```

right after (or near) the line that hides `#home-screen`.

- [ ] **Step 5.3: Verify panel hides during gameplay**

Start a game — the summary panel should disappear when the game board appears.

- [ ] **Step 5.4: Commit**

```bash
git add "Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js"
git commit -m "feat: hide summary panel during gameplay"
```

---

## Task 6: Sync Panel After Programmatic Changes (Randomize / Load Last Setup)

**Files:**
- Modify: `script.js` (add `updateSummaryPanel()` calls after randomize and load functions)

### Steps

- [ ] **Step 6.1: Find all randomize functions**

These functions change selections programmatically, so the panel needs to update after they run:
- `randomizeHero()` (~line 2379)
- `randomizeScheme()` (search for it)
- `randomizeMastermind()` (search for it)
- `randomizeVillains()` (search for it)
- `randomizeHenchmen()` (search for it)
- `randomizeHeroWithRequirements()` (~line 2875 — this is RANDOMIZE ALL)
- `loadLastGameSetup()` (~line 2972)

- [ ] **Step 6.2: Add `updateSummaryPanel()` call at the end of each function**

At the end of each function listed above, add:

```javascript
updateSummaryPanel();
```

Check each function: if it already dispatches `change` events on the form elements (via `.click()` or `.dispatchEvent(new Event('change'))`), the listener from Task 4 will already call `updateSummaryPanel()` — do NOT add a second call, as double-calling can cause flicker. Only add an explicit `updateSummaryPanel()` call in functions that set `.checked` directly without dispatching events.

- [ ] **Step 6.3: Verify RANDOMIZE ALL updates panel**

Click RANDOMIZE ALL — all selections should appear in the panel with correct counts and colors.

- [ ] **Step 6.4: Verify LOAD LAST SETUP updates panel**

Set up a game, save setup via localStorage, reload. Click LOAD LAST SETUP — panel should show all loaded selections.

- [ ] **Step 6.5: Commit**

```bash
git add "Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js"
git commit -m "feat: sync summary panel after randomize and load-last-setup actions"
```

---

## Task 7: Final Visual Polish and Edge Cases

**Files:**
- Modify: `styles.css` (tweaks if needed)
- Modify: `script.js` (edge cases)

### Steps

- [ ] **Step 7.1: Handle the "None" initial state**

On first load with no selections, verify:
- Scheme shows "None"
- Mastermind shows "None"
- Villains shows "None" with count "(0/?)" in grey
- Henchmen shows "None" with count "(0/?)" in grey
- Heroes shows "None" with count "(0/?)" in grey

- [ ] **Step 7.2: Verify hero names don't truncate with 5+ heroes**

Select 5 or 6 heroes. Confirm all names are fully visible in the panel — the panel should grow taller if needed, and names should wrap.

- [ ] **Step 7.3: Verify bottom content is not hidden**

Scroll to the very bottom of the setup page (heroes/bystanders section). Confirm all content is visible above the panel — the `padding-bottom: 120px` on `#home-screen` should create enough clearance.

- [ ] **Step 7.4: Verify no regressions**

- START GAME button opens CONFIRM CHOICES popup as before
- Game Mode toggle switches correctly
- Final Blow toggle works
- RANDOMIZE ALL works
- LOAD LAST SETUP works
- What If? Solo game starts and plays normally
- Golden Solo game starts with 5 heroes required

- [ ] **Step 7.5: Adjust panel padding-bottom if needed**

If content is hidden, increase the `padding-bottom` on `#home-screen`. If there's too much whitespace, decrease it.

- [ ] **Step 7.6: Commit**

```bash
git add "Legendary-Solo-Play-main/Legendary-Solo-Play-main/styles.css" "Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js"
git commit -m "fix: polish summary panel edge cases and verify no regressions"
```

---

## Verification Checklist

After all tasks, confirm each item from the spec:

- [ ] Panel visible at bottom of setup screen on page load
- [ ] Panel stays fixed while scrolling through sections
- [ ] Selecting a scheme -> name appears in panel immediately
- [ ] Selecting a mastermind -> name appears immediately
- [ ] Checking heroes -> each name appears, count updates
- [ ] Count turns green when correct number selected
- [ ] Count turns amber when too few (still selecting)
- [ ] Count turns red when too many (over-filled)
- [ ] Count shows "?" when no scheme selected
- [ ] Changing Game Mode to Golden Solo -> hero required count changes to 5
- [ ] All hero names visible (no truncation) even with 5+ heroes
- [ ] All villain/henchmen names visible (no truncation)
- [ ] RANDOMIZE ALL button in panel works
- [ ] LOAD LAST SETUP button in panel works
- [ ] START GAME button in panel opens CONFIRM CHOICES popup as before
- [ ] Game Mode toggle in panel works (changes mode)
- [ ] Final Blow toggle in panel works
- [ ] Old right-side button cluster is removed
- [ ] Bottom of setup screen content not hidden behind panel
- [ ] Panel hidden during gameplay
- [ ] No regressions to CONFIRM CHOICES popup behavior
- [ ] No regressions to What If? Solo or Golden Solo game modes
