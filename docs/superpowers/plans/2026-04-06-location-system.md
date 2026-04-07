# Location System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Location card type that sits above city spaces in a separate layer, with independent placement, rendering, and fighting mechanics.

**Architecture:** A parallel `cityLocations[]` array tracks Location cards per city space. The `updateGameBoard()` city rendering loop adds a second layer when a Location is present. Location placement routes through `processVillainCard()`. Fighting uses the existing `showAttackButton()` pattern with a Location-specific path. Post-villain-fight triggers check the Location layer.

**Tech Stack:** Vanilla JS, HTML, CSS (no frameworks, no build step, no test runner)

**Spec:** `docs/superpowers/specs/2026-04-06-location-system-design.md`

**Verification approach:** No automated test suite. Each task ends with `node --check`. Final task uses a temporary test Location card for browser testing.

---

## Key Code Locations

| Function | File | Line |
|---|---|---|
| `initCityArrays()` | script.js | 570 |
| `processVillainCard()` | script.js | 5863 |
| `processRegularVillainCard()` | script.js | 4974 |
| `updateGameBoard()` city loop | script.js | 8039-8773 |
| `showAttackButton()` | script.js | 11126 |
| `defeatVillain()` | script.js | 11467 |
| `updateVillainAttackValues()` | script.js | 9652 |

---

### Task 1: Worktree Setup

- [ ] **Step 1: Create worktree branch**

```bash
cd "d:/Games/Digital/Marvel Legendary/Claude Code/marvel-legendary"
git worktree add .worktrees/location-system -b location-system
```

- [ ] **Step 2: Verify worktree**

```bash
cd .worktrees/location-system
ls Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
```

All subsequent tasks work in `.worktrees/location-system/Legendary-Solo-Play-main/Legendary-Solo-Play-main/`.

---

### Task 2: Data Structure + Placement Function

**Files:**
- Modify: `script.js:~545` (declarations)
- Modify: `script.js:~570` (initCityArrays)
- Add new function: `placeLocation()`

- [ ] **Step 1: Add cityLocations declaration**

Near the other city array declarations (~line 563, after `let cityReserveAttack = [];`), add:

```js
let cityLocations = [];
```

- [ ] **Step 2: Initialize in initCityArrays()**

Add this line inside `initCityArrays()` (after `cityCosmicThreat` init, before `citySpaceLabels`):

```js
cityLocations = new Array(citySize).fill(null);
```

- [ ] **Step 3: Add placeLocation() function**

Add after `initCityArrays()`:

```js
function placeLocation(locationCard) {
  // Find rightmost empty location slot
  let targetIndex = -1;
  for (let i = citySize - 1; i >= 0; i--) {
    if (cityLocations[i] === null && !destroyedSpaces[i]) {
      targetIndex = i;
      break;
    }
  }

  if (targetIndex === -1) {
    // All spaces have Locations — overflow: KO the weakest
    targetIndex = handleLocationOverflow(locationCard);
    if (targetIndex === -1) return; // overflow handler will place it
  }

  cityLocations[targetIndex] = locationCard;
  console.log(`Location "${locationCard.name}" placed above ${citySpaceLabels[targetIndex]}.`);
  updateGameBoard();
}
```

- [ ] **Step 4: Add handleLocationOverflow() stub**

Add immediately after `placeLocation()`. This is a stub — full implementation in Task 8:

```js
async function handleLocationOverflow(newLocation) {
  // Stub — full implementation in Task 8
  // For now, KO the first Location found (lowest index)
  for (let i = 0; i < citySize; i++) {
    if (cityLocations[i] !== null) {
      console.log(`Location overflow: KO'd "${cityLocations[i].name}" to make room for "${newLocation.name}".`);
      cityLocations[i] = null;
      return i;
    }
  }
  return -1;
}
```

- [ ] **Step 5: Route Location cards in processVillainCard()**

In `processVillainCard()` (~line 5892), add a new `else if` before the final `else` that handles regular villains:

```js
} else if (villainCard.type === "Location") {
  placeLocation(villainCard);
```

The full routing section should now read:
```js
} else if (villainCard.type === "Location") {
  placeLocation(villainCard);
} else {
  // Handle regular villain card
  await processRegularVillainCard(villainCard);
}
```

- [ ] **Step 6: Syntax check + commit**

```bash
node --check script.js
git add script.js
git commit -m "feat: add cityLocations[] array, placeLocation(), and villain deck routing

Location cards drawn from the villain deck are now placed in the
rightmost empty city space via cityLocations[] parallel array."
```

---

### Task 3: CSS for Location Cards

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add Location card CSS**

Add these rules after the existing `.city-space` class:

```css
/* Location card layer — sits above city space */
.location-card-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  cursor: pointer;
  transition: all 0.3s;
}

.location-card-container img {
  width: 100%;
  border-radius: 1vh;
  border: 2px solid #d4af37;
  box-sizing: border-box;
}

/* When Location is alone (no villain) — full size */
.location-card-full {
  position: relative;
}

.location-card-full img {
  height: 100%;
  object-fit: contain;
}

/* When Location + Villain share space — Location peeks from top */
.location-card-peek {
  height: 40%;
  overflow: hidden;
}

.location-card-peek img {
  height: auto;
  max-height: none;
}

/* Villain card shifts down when Location is above */
.city-space-layered .villain-card-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75%;
  z-index: 2;
}

/* City space needs relative positioning for layers */
.city-space-layered {
  position: relative;
  overflow: hidden;
}

/* Location affordability glow */
.location-card-container.attackable {
  filter: drop-shadow(0 0 8px #d4af37);
}

.location-card-container.attackable img {
  border-color: #ffd700;
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "feat: add CSS for Location card rendering — full, peek, and layered states"
```

---

### Task 4: Rendering in updateGameBoard()

**Files:**
- Modify: `script.js:~8039-8773` (city rendering loop in updateGameBoard)

This is the most complex task. The city rendering loop currently handles villain cards and destroyed spaces. We need to add Location rendering for each of the visual states.

- [ ] **Step 1: Add Location rendering at the START of the city loop body**

Inside the `for (let i = 0; i < city.length; i++)` loop, after the cell is cleared and cloned (~line 8045), but BEFORE the destroyed space check (~line 8221), add Location rendering:

```js
// --- Location layer rendering ---
const hasLocation = cityLocations[i] !== null;
const hasVillain = city[i] !== null;

if (hasLocation && !destroyedSpaces[i]) {
  const locationCard = cityLocations[i];
  const locationContainer = document.createElement("div");

  if (hasVillain) {
    // Peek mode — Location at top, villain below
    locationContainer.className = "location-card-container location-card-peek";
    cityCell.classList.add("city-space-layered");
  } else {
    // Full mode — Location fills the space
    locationContainer.className = "location-card-container location-card-full";
  }

  const locationImg = document.createElement("img");
  locationImg.src = locationCard.image;
  locationImg.alt = locationCard.name;
  locationImg.classList.add("card-image");
  locationContainer.appendChild(locationImg);

  // Location affordability check
  if (totalAttackPoints >= locationCard.attack) {
    locationContainer.classList.add("attackable");
  }

  // Location click handler
  locationContainer.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!popupMinimized) return;
    showLocationAttackButton(i);
  });

  cityCell.appendChild(locationContainer);
}
```

- [ ] **Step 2: Wrap existing villain rendering in a container div when layered**

Find the existing `cardContainer` creation for villain cards (~line 8258). When a Location is also present, wrap the villain's elements in a `.villain-card-container` div:

After the existing `const cardContainer = document.createElement("div");` line, add:

```js
if (hasLocation) {
  cardContainer.classList.add("villain-card-container");
}
```

This uses the `hasLocation` variable declared in Step 1.

- [ ] **Step 3: Handle destroyed space clearing Location**

In the destroyed space check (~line 8221), add Location cleanup:

```js
if (destroyedSpaces[i]) {
  // Clear any Location in a destroyed space
  if (cityLocations[i] !== null) {
    console.log(`Location "${cityLocations[i].name}" destroyed with city space.`);
    cityLocations[i] = null;
  }
  // ... existing destroyed space rendering ...
}
```

- [ ] **Step 4: Syntax check + commit**

```bash
node --check script.js
git add script.js
git commit -m "feat: render Location cards in city spaces — full and peek states

Locations render full-size when alone, peek from top (~40%) when a
villain is also present. Gold border distinguishes from villain cards.
Click handlers attached for fighting (handler function in next task)."
```

---

### Task 5: Fight Flow for Locations

**Files:**
- Modify: `script.js` — add `showLocationAttackButton()` and `defeatLocation()`

- [ ] **Step 1: Add showLocationAttackButton()**

Add near `showAttackButton()` (~line 11126):

```js
function showLocationAttackButton(cityIndex) {
  const locationCard = cityLocations[cityIndex];
  if (!locationCard) return;

  const cityCell = document.querySelector(`#city-${cityIndex + 1}`);
  if (!cityCell) return;

  const locationAttackValue = locationCard.attack;

  // HYDRA Base: +2 while villain is present
  let effectiveAttack = locationAttackValue;
  if (locationCard.subtype === "Henchman" && city[cityIndex] !== null) {
    effectiveAttack += 2;
  }

  if (totalAttackPoints < effectiveAttack) {
    console.log(`Cannot afford to fight Location "${locationCard.name}" (need ${effectiveAttack} Attack).`);
    return;
  }

  // Show fight confirmation popup
  const locationName = locationCard.name;
  showConfirmPopup(
    `Fight Location: ${locationName}?`,
    `This Location has ${effectiveAttack} Attack.`,
    locationCard.image,
    async () => {
      await defeatLocation(cityIndex, effectiveAttack);
    }
  );
}
```

Note: `showConfirmPopup` is the existing confirmation popup pattern. Search for how `confirmAttack` works and replicate that pattern. The exact popup function name may differ — check `showAttackButton` for the pattern used when confirming a villain fight, and use the same approach for Location fights.

- [ ] **Step 2: Add defeatLocation()**

```js
async function defeatLocation(cityIndex, attackCost) {
  const locationCard = cityLocations[cityIndex];
  if (!locationCard) return;

  // Deduct attack points
  totalAttackPoints -= attackCost;
  cumulativeAttackPoints -= attackCost;

  // Move to Victory Pile
  victoryPile.push(locationCard);
  console.log(`Defeated Location "${locationCard.name}" at ${citySpaceLabels[cityIndex]}. Worth ${locationCard.vp} VP.`);

  // Execute fight effect if present
  if (locationCard.fightEffect && typeof window[locationCard.fightEffect] === "function") {
    await window[locationCard.fightEffect](locationCard, cityIndex);
  }

  // Clear from city
  cityLocations[cityIndex] = null;

  updateGameBoard();
}
```

- [ ] **Step 3: Syntax check + commit**

```bash
node --check script.js
git add script.js
git commit -m "feat: add Location fight flow — showLocationAttackButton + defeatLocation

Players can fight Locations independently. Attack cost deducted,
Location moved to Victory Pile, fight effect executed if present."
```

---

### Task 6: Post-Villain-Fight Trigger Hook

**Files:**
- Modify: `script.js:~11511` (inside defeatVillain, after `city[cityIndex] = null`)

- [ ] **Step 1: Add Location trigger check after villain defeat**

In `defeatVillain()`, after the villain is removed from the city (`city[cityIndex] = null` at ~line 11511) and after fight effects are collected/executed, add:

```js
// Check for Location triggered ability in this space
if (cityLocations[cityIndex] && cityLocations[cityIndex].triggeredAbility) {
  const triggerFn = window[cityLocations[cityIndex].triggeredAbility];
  if (typeof triggerFn === "function") {
    await triggerFn(cityLocations[cityIndex], cityIndex, villainCard);
  }
}
```

Place this after `collectDefeatOperations()` is called and its operations are executed, but before the final `updateGameBoard()` call at the end of `defeatVillain()`. The `villainCard` variable is available in scope — it's the card that was just defeated.

Important: `defeatVillain` is already `async`, so `await` works here. But verify the exact placement by reading the function — the trigger should fire after the villain's own fight effects, not before.

- [ ] **Step 2: Syntax check + commit**

```bash
node --check script.js
git add script.js
git commit -m "feat: add post-villain-fight Location trigger hook

After defeating a villain, checks cityLocations[i] for a triggeredAbility
and executes it. Enables 'Whenever you fight a Villain here' effects."
```

---

### Task 7: Location Overflow (KO Lowest)

**Files:**
- Modify: `script.js` — replace the overflow stub from Task 2

- [ ] **Step 1: Replace handleLocationOverflow() with full implementation**

Replace the stub from Task 2 with:

```js
async function handleLocationOverflow(newLocation) {
  // Find Location(s) with lowest attack
  let lowestAttack = Infinity;
  for (let i = 0; i < citySize; i++) {
    if (cityLocations[i] !== null && cityLocations[i].attack < lowestAttack) {
      lowestAttack = cityLocations[i].attack;
    }
  }

  // Collect all Locations tied at lowest attack
  const candidates = [];
  for (let i = 0; i < citySize; i++) {
    if (cityLocations[i] !== null && cityLocations[i].attack === lowestAttack) {
      candidates.push({ index: i, location: cityLocations[i] });
    }
  }

  let targetIndex;
  if (candidates.length === 1) {
    targetIndex = candidates[0].index;
  } else {
    // Player chooses which to KO — use existing popup choice pattern
    targetIndex = await new Promise((resolve) => {
      const options = candidates.map(c => ({
        label: `${c.location.name} (ATK ${c.location.attack}) at ${citySpaceLabels[c.index]}`,
        value: c.index
      }));
      showChoicePopup("All city spaces have Locations. Choose one to KO:", options, (chosenIndex) => {
        resolve(chosenIndex);
      });
    });
  }

  // KO the chosen Location
  const koLocation = cityLocations[targetIndex];
  console.log(`Location overflow: KO'd "${koLocation.name}" to make room for "${newLocation.name}".`);
  koPile.push(koLocation);
  cityLocations[targetIndex] = null;

  // Place the new Location
  cityLocations[targetIndex] = newLocation;
  console.log(`Location "${newLocation.name}" placed above ${citySpaceLabels[targetIndex]}.`);
  updateGameBoard();
  return targetIndex;
}
```

Note: The `showChoicePopup` function name is a placeholder — search script.js for the existing pattern used when players must choose between options (e.g., "choose a card to KO", "choose a hero class"). Use whatever popup/choice mechanism already exists. The pattern will likely involve creating a popup with clickable options that resolve a Promise.

- [ ] **Step 2: Update placeLocation() to handle async overflow**

The overflow handler is async (player choice popup). Update `placeLocation()`:

```js
async function placeLocation(locationCard) {
  // Find rightmost empty location slot
  let targetIndex = -1;
  for (let i = citySize - 1; i >= 0; i--) {
    if (cityLocations[i] === null && !destroyedSpaces[i]) {
      targetIndex = i;
      break;
    }
  }

  if (targetIndex === -1) {
    // All spaces have Locations — overflow: KO the weakest
    await handleLocationOverflow(locationCard);
    return;
  }

  cityLocations[targetIndex] = locationCard;
  console.log(`Location "${locationCard.name}" placed above ${citySpaceLabels[targetIndex]}.`);
  updateGameBoard();
}
```

Also add `await` at the call site in `processVillainCard()`:

```js
} else if (villainCard.type === "Location") {
  await placeLocation(villainCard);
```

- [ ] **Step 3: Syntax check + commit**

```bash
node --check script.js
git add script.js
git commit -m "feat: Location overflow — KO lowest-attack Location when all spaces full

Player chooses on ties. New Location takes the freed space."
```

---

### Task 8: Test with Temporary Location Card

**Files:**
- Modify: `cardDatabase.js` (temporary addition, reverted after testing)

- [ ] **Step 1: Add a temporary test Location to an existing villain group**

In `cardDatabase.js`, find the Hydra villain group entries (or any existing villain group). Add a test Location card:

```js
{
  name: "Test Watchtower",
  group: "HYDRA",
  type: "Location",
  attack: 4,
  vp: 2,
  image: "Visual Assets/Villains/Madame_Hydra_1.webp",  // reuse any existing villain image
  triggeredAbility: null,
  fightEffect: null,
}
```

Add it to the villain group's card array so it gets shuffled into the villain deck.

- [ ] **Step 2: Browser test checklist**

Open `index.html` in a browser. Start a game with any scheme. Play turns until the test Location is drawn. Verify:

1. Location card appears above a city space (rightmost empty)
2. When a villain enters that space, Location peeks from top, villain renders below
3. Can click the Location peek area — fight confirmation appears
4. Can click the villain — normal fight flow
5. Fighting the Location removes it, villain stays
6. Fighting the villain — Location stays in the space
7. Location doesn't move when villains advance

- [ ] **Step 3: Revert the test card**

Remove the test Location from `cardDatabase.js`. Do not commit the test card — it was for manual testing only.

- [ ] **Step 4: Final commit**

```bash
git add script.js styles.css
git commit -m "feat: Location system complete — placement, rendering, fighting, triggers, overflow

New card type sits above city spaces in a parallel cityLocations[] array.
Two-layer rendering with independent click targets. Post-villain-fight
triggers enable 'Whenever you fight a Villain here' effects."
```

---

## Self-Review

**Spec coverage check:**
- ✅ Data structure (cityLocations[], Task 2)
- ✅ Placement logic (placeLocation, Task 2)
- ✅ Villain deck routing (processVillainCard, Task 2)
- ✅ CSS rendering (Task 3)
- ✅ Three visual states (Task 4)
- ✅ Fight flow (Task 5)
- ✅ Post-fight triggers (Task 6)
- ✅ Overflow (Task 7)
- ✅ Browser testing (Task 8)
- ✅ HYDRA Base +2 Attack (Task 5, in showLocationAttackButton)
- ✅ Destroyed space clearing (Task 4, Step 3)
- Tactic → Location: Not in this plan — handled in Phase 3d (Mastermind effects) of /new-expansion, which calls `placeLocation()` with a constructed Location object. The infrastructure is ready.
- Location-granted keywords (Watchtower/Dark Dimension): Not in this plan — handled in Phase 3c (Villain effects). The `triggeredAbility` hook and `updateVillainAttackValues` extension point are ready.
- Solo mode ("each other player" → self): Handled per-card in expansion ability functions, not infrastructure.

**Placeholder scan:** The `showChoicePopup` and `showConfirmPopup` names in Tasks 5 and 7 are approximate — the implementer must find the actual popup/confirmation patterns in the existing codebase and use those. This is noted in the task text.

**Type consistency:** `cityLocations`, `placeLocation`, `handleLocationOverflow`, `showLocationAttackButton`, `defeatLocation` — all used consistently throughout.
