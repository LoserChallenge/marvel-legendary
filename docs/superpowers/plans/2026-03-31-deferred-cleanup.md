# Deferred Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear all deferred low-priority and tech-debt items: define a GOLDEN_SOLO constant (T2), add a refillHQSlot() helper (T1), fix 11 small bugs/dead-code items (L1–L8, L10, R1, R2).

**Architecture:** T2 first (constant needed by T1's helper), then T1 (helper needed by L-item fixes), then all small fixes grouped by file. No new files created. No gameplay logic changes — all fixes are correctness/cleanup.

**Tech Stack:** Vanilla JS, static HTML. No build step. Open `Legendary-Solo-Play-main/Legendary-Solo-Play-main/index.html` directly in browser to verify. Working directory: `d:\Games\Digital\Marvel Legendary\Claude Code\marvel-legendary`.

---

## Files modified

| File | Tasks |
|------|-------|
| `script.js` | T2, T1, L5 |
| `cardAbilities.js` | T2, T1, L2, L4 |
| `cardAbilitiesDarkCity.js` | T2, T1, L3 |
| `expansionFantasticFour.js` | T2, T1, L6 |
| `expansionGuardiansOfTheGalaxy.js` | T2, T1, L7, R2 |
| `expansionPaintTheTownRed.js` | T2, T1, L1 |
| `cardDatabase.js` | L8, R1 |
| `index.html` | L10 |

All source files live at: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/`

---

## Task 1: T2 — Define GOLDEN_SOLO constant and replace all usages

**Files:**
- Modify: `script.js` (~22 occurrences)
- Modify: `cardAbilities.js` (4 occurrences)
- Modify: `cardAbilitiesDarkCity.js` (1 occurrence)
- Modify: `expansionFantasticFour.js` (3 occurrences)
- Modify: `expansionGuardiansOfTheGalaxy.js` (0 occurrences — no golden checks, skip)
- Modify: `expansionPaintTheTownRed.js` (2 occurrences)

### Step 1: Add the constant to script.js

At `script.js:607`, the current line reads:
```js
let gameMode = 'whatif';       // 'whatif' | 'golden'
```

Replace with:
```js
const GOLDEN_SOLO = 'golden';
let gameMode = 'whatif';       // 'whatif' | GOLDEN_SOLO
```

- [ ] Make this edit

### Step 2: Replace all `=== 'golden'` in script.js

Use replace_all for each of these patterns in `script.js`:

- [ ] Replace `gameMode === 'golden'` → `gameMode === GOLDEN_SOLO` (replace_all: true)
- [ ] Replace `(_rh_gameMode === 'golden')` → `(_rh_gameMode === GOLDEN_SOLO)` (replace_all: true)
- [ ] Replace `(_rhr_gameMode === 'golden')` → `(_rhr_gameMode === GOLDEN_SOLO)` (replace_all: true)
- [ ] Replace `gameMode = 'golden'` → `gameMode = GOLDEN_SOLO` — **only at line 3510** (the one assignment); use enough surrounding context to be unique:

Old (script.js ~line 3510):
```js
    gameMode = document.querySelector('input[name="gameMode"]:checked')?.value || 'whatif';
```
This reads the DOM value and sets the global. The DOM radio button still has `value="golden"` in HTML — that doesn't need changing. Only the fallback `'whatif'` stays as a string (there's no WHAT_IF_SOLO constant). This line does NOT need changing — the value comes from the DOM, not from code. **Skip this line.**

### Step 3: Replace all `=== 'golden'` in expansion/ability files

- [ ] In `cardAbilities.js`: replace `gameMode === 'golden'` → `gameMode === GOLDEN_SOLO` (replace_all: true)
- [ ] In `cardAbilitiesDarkCity.js`: replace `gameMode === 'golden'` → `gameMode === GOLDEN_SOLO` (replace_all: true)
- [ ] In `expansionFantasticFour.js`: replace `gameMode === 'golden'` → `gameMode === GOLDEN_SOLO` (replace_all: true)
- [ ] In `expansionPaintTheTownRed.js`: replace `gameMode === 'golden'` → `gameMode === GOLDEN_SOLO` (replace_all: true)

### Step 4: Verify count

- [ ] Run: `grep -rn "=== 'golden'" Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — expected output: **zero matches**
- [ ] Run: `grep -rn "=== GOLDEN_SOLO" Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — should show ~31 matches across 6 files

### Step 5: Commit

- [ ] `git add` the 5 modified JS files and commit:
```
git commit -m "refactor: define GOLDEN_SOLO constant, replace all 'golden' string comparisons"
```

---

## Task 2: T1 — Add refillHQSlot() helper and replace all call sites

**Files:**
- Modify: `script.js` (define helper + 5 call sites)
- Modify: `cardAbilities.js` (4 call sites)
- Modify: `cardAbilitiesDarkCity.js` (1 call site)
- Modify: `expansionFantasticFour.js` (3 call sites)
- Modify: `expansionPaintTheTownRed.js` (2 call sites)

### Step 1: Add the helper to script.js

In `script.js`, find `goldenRefillHQ` (line ~4660):
```js
function goldenRefillHQ(index) {
  hq.splice(index, 1);
  const newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
  hq.push(newCard);
  return newCard;
}
```

Add the new helper immediately after the closing brace:

- [ ] Edit `script.js` — after `goldenRefillHQ`'s closing brace, add:
```js

// Unified HQ slot refill: Golden Solo uses rotation, What If? uses fill-in-place.
// Always call this instead of the if/else pattern. Returns the new card (or null).
function refillHQSlot(index) {
  if (gameMode === GOLDEN_SOLO) {
    return goldenRefillHQ(index);
  }
  const newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
  hq[index] = newCard;
  if (!newCard) showHeroDeckEmptyPopup();
  return newCard;
}
```

**Note on showHeroDeckEmptyPopup:** The helper calls it automatically for What If? when deck is empty. Sites that previously had an explicit `if (!hq[index]) showHeroDeckEmptyPopup()` can drop that check after switching to `refillHQSlot`. Sites that didn't have it will now get it correctly.

### Step 2: Replace call sites in script.js

There are 5 call sites. Each follows one of two patterns — Pattern A returns newCard, Pattern B ignores it.

**Pattern A** (all 5 sites in script.js):
```js
// BEFORE:
if (gameMode === GOLDEN_SOLO) {
  newCard = goldenRefillHQ(someIndex);
} else {
  newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
  hq[someIndex] = newCard;
}

// AFTER:
newCard = refillHQSlot(someIndex);
```

- [ ] **script.js ~line 6133** (`returnHeroToDeck` — `hqIndex`):
  Old:
  ```js
    let newCard;
    if (gameMode === GOLDEN_SOLO) {
      newCard = goldenRefillHQ(hqIndex);
    } else {
      // Draw new top card (end of array)
      newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
      hq[hqIndex] = newCard;
    }
  ```
  New:
  ```js
    const newCard = refillHQSlot(hqIndex);
  ```

- [ ] **script.js ~line 12679** (recruit flow — `index`):
  Old:
  ```js
      let newCard;
      if (gameMode === GOLDEN_SOLO) {
        newCard = goldenRefillHQ(index); // Golden Solo: rotation refill
      } else {
        newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
        hq[index] = newCard;
      }
  ```
  New:
  ```js
      const newCard = refillHQSlot(index);
  ```

- [ ] **script.js ~line 13819** (Helicarrier explosion KO — `index`):
  Old:
  ```js
      let newCard;
      if (gameMode === GOLDEN_SOLO) {
        newCard = goldenRefillHQ(index); // Golden Solo: rotation refill
      } else {
        newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
        hq[index] = newCard;
      }
  ```
  New:
  ```js
      const newCard = refillHQSlot(index);
  ```

- [ ] **script.js ~line 13852** (normal KO — `index`):
  Old:
  ```js
    let newCard;
    if (gameMode === GOLDEN_SOLO) {
      newCard = goldenRefillHQ(index); // Golden Solo: rotation refill
    } else {
      newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
      hq[index] = newCard;
    }
  ```
  New:
  ```js
    const newCard = refillHQSlot(index);
  ```

- [ ] **script.js ~line 17460** (recruit-to-villain-deck — `hqIndex`):
  Old:
  ```js
    let newCard;
    if (gameMode === GOLDEN_SOLO) {
      newCard = goldenRefillHQ(hqIndex); // rotation: splice out, push to rightmost
    } else {
      newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
      hq[hqIndex] = newCard;
    }
  ```
  New:
  ```js
    const newCard = refillHQSlot(hqIndex);
  ```

### Step 3: Replace call sites in cardAbilities.js

- [ ] **cardAbilities.js ~line 15174** (heroSkrulled/capture — `hqIndex`, had explicit empty popup):
  Old:
  ```js
    let newCard;
    if (gameMode === GOLDEN_SOLO) {
      newCard = goldenRefillHQ(hqIndex);
    } else {
      hq[hqIndex] = heroDeck.length > 0 ? heroDeck.pop() : null;
      newCard = hq[hqIndex];
      // Check if the HQ space is empty after drawing
      if (!hq[hqIndex]) {
        showHeroDeckEmptyPopup();
      }
    }
  ```
  New (the helper handles the empty popup):
  ```js
    const newCard = refillHQSlot(hqIndex);
  ```

- [ ] **cardAbilities.js ~line 15246** (heroSkrulled capture variant — `heroIndex`, no return value needed, had explicit empty popup):
  Old:
  ```js
    if (gameMode === GOLDEN_SOLO) {
      goldenRefillHQ(heroIndex);
    } else {
      hq[heroIndex] = heroDeck.length > 0 ? heroDeck.pop() : null;

      // Check if the HQ space is empty after drawing
      if (!hq[heroIndex]) {
        showHeroDeckEmptyPopup();
      }
    }
  ```
  New:
  ```js
    refillHQSlot(heroIndex);
  ```

- [ ] **cardAbilities.js ~line 16957** (KOAllHeroesInHQ loop — `i`, no return value needed, no popup):
  Old:
  ```js
      if (gameMode === GOLDEN_SOLO) {
        goldenRefillHQ(i);
      } else {
        hq[i] = heroDeck.pop();
      }
  ```
  New:
  ```js
      refillHQSlot(i);
  ```

- [ ] **cardAbilities.js ~line 17017** (misfitRecruit — `heroIndex`, no return value, had explicit empty popup):
  Old:
  ```js
    if (gameMode === GOLDEN_SOLO) {
      goldenRefillHQ(heroIndex);
    } else {
      hq[heroIndex] = heroDeck.length > 0 ? heroDeck.pop() : null;

      // Check if the HQ space is empty after drawing
      if (!hq[heroIndex]) {
        showHeroDeckEmptyPopup();
      }
    }
  ```
  New:
  ```js
    refillHQSlot(heroIndex);
  ```

### Step 4: Replace call site in cardAbilitiesDarkCity.js

- [ ] **cardAbilitiesDarkCity.js ~line 15975** (KOAllHQBystanders loop — `index`):
  Old:
  ```js
    let newCard;
    if (gameMode === GOLDEN_SOLO) {
      newCard = goldenRefillHQ(index);
    } else {
      newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
      hq[index] = newCard;
    }
  ```
  New:
  ```js
    const newCard = refillHQSlot(index);
  ```

### Step 5: Replace call sites in expansionFantasticFour.js

- [ ] **expansionFantasticFour.js ~line 627** (FF recruit flow — `hqIndex`):
  Old:
  ```js
        let newCard;
        if (gameMode === GOLDEN_SOLO) {
          newCard = goldenRefillHQ(hqIndex);
        } else {
          newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
          hq[hqIndex] = newCard;
        }
  ```
  New:
  ```js
        const newCard = refillHQSlot(hqIndex);
  ```

- [ ] **expansionFantasticFour.js ~line 1281** (FF recruit variant — `selectedHQIndex`):
  Old:
  ```js
        let newCard;
        if (gameMode === GOLDEN_SOLO) {
          newCard = goldenRefillHQ(selectedHQIndex);
        } else {
          newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
          hq[selectedHQIndex] = newCard;
        }
  ```
  New:
  ```js
        const newCard = refillHQSlot(selectedHQIndex);
  ```

- [ ] **expansionFantasticFour.js ~line 3263** (morgAmbush fill loop — `i`, no return value):
  Old:
  ```js
      if (gameMode === GOLDEN_SOLO) {
        goldenRefillHQ(i);
      } else {
        hq[i] = heroDeck.pop();
      }
  ```
  New:
  ```js
      refillHQSlot(i);
  ```

### Step 6: Replace call sites in expansionPaintTheTownRed.js

- [ ] **expansionPaintTheTownRed.js ~line 276** (PtTR villain effect — `selectedHQIndex`):
  Old:
  ```js
      let newCard;
      if (gameMode === GOLDEN_SOLO) {
        newCard = goldenRefillHQ(selectedHQIndex);
      } else {
        newCard = heroDeck.length > 0 ? heroDeck.pop() : null;
        hq[selectedHQIndex] = newCard;
      }
  ```
  New:
  ```js
      const newCard = refillHQSlot(selectedHQIndex);
  ```

- [ ] **expansionPaintTheTownRed.js ~line 1715** (PtTR KO — `heroIndex`, no return value):
  Old:
  ```js
    if (gameMode === GOLDEN_SOLO) {
      goldenRefillHQ(heroIndex);
    } else {
      hq[heroIndex] = heroDeck.length > 0 ? heroDeck.pop() : null;
    }
  ```
  New:
  ```js
    refillHQSlot(heroIndex);
  ```

### Step 7: Verify no raw pattern remains

- [ ] Run: `grep -rn "goldenRefillHQ\|hq\[.*\] = heroDeck\.pop()" Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — expected: only the `function goldenRefillHQ` definition line and the internal `hq.push(newCard)` inside it (which is not an assignment to `hq[index]`). Zero `if (gameMode === GOLDEN_SOLO) { goldenRefillHQ` patterns should remain.

### Step 8: Commit

- [ ] `git add` the 5 modified JS files and commit:
```
git commit -m "refactor: add refillHQSlot() helper, replace 15 scattered if/else HQ refill patterns"
```

---

## Task 3: Small fixes — script.js

### L5: Remove dead `enterCityNotDraw` flag

The flag is declared at `script.js:651` and used at `script.js:4694` in the condition `if (!enterCityNotDraw && ...)`. It is never set to `true`, so the condition is always satisfied. Remove the dead flag and simplify the condition.

- [ ] Remove `script.js:651`:
  Old:
  ```js
  let enterCityNotDraw = false;
  ```
  Delete this line entirely.

- [ ] Simplify `script.js:4694`:
  Old:
  ```js
    if (!enterCityNotDraw && playerArtifacts.filter((card) => card.name === "Reality Gem").length > 0) {
  ```
  New:
  ```js
    if (playerArtifacts.filter((card) => card.name === "Reality Gem").length > 0) {
  ```

- [ ] Commit:
```
git commit -m "fix: remove dead enterCityNotDraw flag (was never set to true)"
```

---

## Task 4: Small fixes — cardAbilities.js

### L2: Remove dead `drawMultipleVillainCards` function

The function at `cardAbilities.js:16853` is never called anywhere in the codebase. Delete it entirely.

- [ ] Delete the entire function (lines 16853–16861):
  ```js
  function drawMultipleVillainCards(count) {
    let promiseChain = Promise.resolve();
  
    for (let i = 0; i < count; i++) {
      promiseChain = promiseChain.then(() => processVillainCard());
    }
  
    return promiseChain;
  }
  ```

### L4: KOAllHeroesInHQ — add showHeroDeckEmptyPopup in What If? path

At `cardAbilities.js:16944`, after T1 the fill loop looks like:
```js
  for (let i = 0; i < 5; i++) {
    if (!hq[i] && heroDeck.length > 0) {
      refillHQSlot(i);
    }
  }
```

The condition `heroDeck.length > 0` means empty slots are skipped if deck ran out. No popup is shown. Fix: remove the length guard from the loop (let `refillHQSlot` handle it — it checks length internally and calls `showHeroDeckEmptyPopup` when needed), and also fix the hardcoded `5` while we're here:

- [ ] Edit the fill loop in `KOAllHeroesInHQ`:
  Old (after T1 has already been applied):
  ```js
    for (let i = 0; i < 5; i++) {
      if (!hq[i] && heroDeck.length > 0) {
        refillHQSlot(i);
      }
    }
  ```
  New:
  ```js
    for (let i = 0; i < hq.length; i++) {
      if (!hq[i]) {
        refillHQSlot(i);
      }
    }
  ```

- [ ] Commit both L2 and L4 together:
```
git commit -m "fix: remove dead drawMultipleVillainCards; KOAllHeroesInHQ now shows empty-deck popup"
```

---

## Task 5: Small fixes — cardAbilitiesDarkCity.js

### L3: KOAllHQBystanders — add missing `return` after no-bystander guard

At `cardAbilitiesDarkCity.js:15963`:
```js
  if (bystanderIndices.length === 0) {
    onscreenConsole.log("No Bystanders found in HQ.");
  }
```
The function continues executing the loop even when there are no bystanders (the loop just does nothing, but it's misleading and wasteful).

- [ ] Edit `cardAbilitiesDarkCity.js`:
  Old:
  ```js
    if (bystanderIndices.length === 0) {
      onscreenConsole.log("No Bystanders found in HQ.");
    }
  ```
  New:
  ```js
    if (bystanderIndices.length === 0) {
      onscreenConsole.log("No Bystanders found in HQ.");
      return;
    }
  ```

- [ ] Commit:
```
git commit -m "fix: KOAllHQBystanders — add missing return after no-bystander early exit"
```

---

## Task 6: Small fixes — expansionFantasticFour.js

### L6: morgAmbush — fix hardcoded `i < 5`

At `expansionFantasticFour.js:3239`, the loop iterates `for (let i = 0; i < 5; i++)`. HQ is always 5 in practice, but the fill loop below it (handled by T1) uses `i < 5` too. Fix the ambush loop to use `hq.length`:

- [ ] Edit `expansionFantasticFour.js:3239`:
  Old:
  ```js
    for (let i = 0; i < 5; i++) {
      if (hq[i] && hq[i].type === "Hero") {
  ```
  New:
  ```js
    for (let i = 0; i < hq.length; i++) {
      if (hq[i] && hq[i].type === "Hero") {
  ```

- [ ] Commit:
```
git commit -m "fix: morgAmbush — replace hardcoded i < 5 with hq.length"
```

---

## Task 7: Small fixes — expansionGuardiansOfTheGalaxy.js

### L7: Thanos tactic popup — remove "each other player" text

At `expansionGuardiansOfTheGalaxy.js:2411`, the popup instructions read:
```
Gain a Hero from Thanos' Bound Souls pile. Then each other player puts a non-grey Hero from their discard pile into Thanos' Bound Souls pile.
```
The "each other player" part never fires in solo. The popup text should reflect solo play only.

- [ ] Edit `expansionGuardiansOfTheGalaxy.js:2411`:
  Old:
  ```js
      `Gain a Hero from <span class="console-highlights">Thanos</span><span class="bold-spans">'</span> Bound Souls pile. Then each other player puts a non-grey Hero from their discard pile into <span class="console-highlights">Thanos</span><span class="bold-spans">'</span> Bound Souls pile.`;
  ```
  New:
  ```js
      `Gain a Hero from <span class="console-highlights">Thanos</span><span class="bold-spans">'</span> Bound Souls pile.`;
  ```

Also check `expansionGuardiansOfTheGalaxy.js:2522` — this is a duplicate of the same popup text in a different code path. Apply the same fix:

- [ ] Edit `expansionGuardiansOfTheGalaxy.js:2522`:
  Old:
  ```js
          `Gain a Hero from <span class="console-highlights">Thanos</span><span class="bold-spans">'</span> Bound Souls pile. Then each other player puts a non-grey Hero from their discard pile into <span class="console-highlights">Thanos</span><span class="bold-spans">'</span> Bound Souls pile.`;
  ```
  New:
  ```js
          `Gain a Hero from <span class="console-highlights">Thanos</span><span class="bold-spans">'</span> Bound Souls pile.`;
  ```

### R2: Vengeance is Rocket — count Master Strikes by type not name

At `expansionGuardiansOfTheGalaxy.js:6503`:
```js
  const masterStrikeCount = koPile.filter((item) => item.name === "Master Strike").length;
```

- [ ] Edit:
  Old:
  ```js
    const masterStrikeCount = koPile.filter((item) => item.name === "Master Strike").length;
  ```
  New:
  ```js
    const masterStrikeCount = koPile.filter((item) => item.type === "Master Strike").length;
  ```

- [ ] Commit both L7 and R2:
```
git commit -m "fix: Thanos tactic removes solo-irrelevant 'other player' text; Vengeance is Rocket counts by type not name"
```

---

## Task 8: Small fixes — expansionPaintTheTownRed.js

### L1: Delete dead `koHero()` function

The function at `expansionPaintTheTownRed.js:1735` is never called. It also contains a bare `hq[heroIndex] = heroDeck.length > 0 ? heroDeck.pop() : null` (fill-in-place without Golden Solo check). Since it's dead code, delete the entire function.

- [ ] Read lines 1735–1770 first to confirm the full function extent, then delete the entire function body.

- [ ] Commit:
```
git commit -m "fix: delete dead koHero() function in PtTR (never called; contained bare HQ fill bug)"
```

---

## Task 9: Small fixes — cardDatabase.js

### L8: Remove duplicate `specificVillainRequirement` on Splice Humans scheme

At `cardDatabase.js:520` and `525`, the same field is declared twice in the Splice Humans object:
```js
    specificVillainRequirement: "Sinister Six",   // line 520
    ...
    specificVillainRequirement: "Sinister Six",   // line 525 — duplicate
```
JavaScript uses the last value, so both are "Sinister Six" and there's no functional bug — but the duplicate is misleading.

- [ ] Delete `cardDatabase.js:525` (the second occurrence). Use enough surrounding context to target only the second one:
  Old:
  ```js
      twistText: `Each player puts a Sinister Six Villain from their Victory Pile on top of the Villain Deck. No matter how many players did so, play a single card from the Villain Deck.`,
      specificVillainRequirement: "Sinister Six",
      backingTrack: "Genetic Splicing",
  ```
  New:
  ```js
      twistText: `Each player puts a Sinister Six Villain from their Victory Pile on top of the Villain Deck. No matter how many players did so, play a single card from the Villain Deck.`,
      backingTrack: "Genetic Splicing",
  ```

### R1: Remove dead DB fields on Arc Reactor (Iron Man)

At `cardDatabase.js:5367–5371`, the `IronManArcReactorBonusAttack` card has fields that are no longer read (the card effect was rewritten in a prior session to count Tech cards directly):

```js
        bonusAttack: 1,
        bonusRecruit: 0,
        multiplier: "Black",
        multiplierAttribute: "color",
        multiplierLocation: "playedCards",
```

`bonusRecruit: 0` is harmless to keep. The others (`bonusAttack`, `multiplier`, `multiplierAttribute`, `multiplierLocation`) are dead.

- [ ] Remove the four dead fields from the Arc Reactor card entry. The full card entry (~lines 5360–5380) should look like (keeping `bonusRecruit: 0` since it's a standard field used by `bonusAttack()` calls elsewhere):
  Old:
  ```js
          bonusAttack: 1,
          bonusRecruit: 0,
          multiplier: "Black",
          multiplierAttribute: "color",
          multiplierLocation: "playedCards",
  ```
  New:
  ```js
          bonusRecruit: 0,
  ```

- [ ] Commit both L8 and R1:
```
git commit -m "fix: remove duplicate specificVillainRequirement on Splice Humans; remove dead bonusAttack/multiplier fields on Arc Reactor"
```

---

## Task 10: Small fixes — index.html

### L10: X-Cutioner's Song hero radios share `name="hero"` with main hero inputs

The X-Cutioner's Song dropdown (`#xCutionersSongHero`) contains ~95 `<input type="radio" name="hero">` elements. While `script.js` correctly scopes its queries to `#xCutionersSongHero input[type=radio][name='hero']`, the shared name could cause browser-level interference and is confusing for future devs. Rename to `name="xcutioner-hero"`.

There are also two corresponding `querySelectorAll` calls in `script.js` that must be updated:
- `script.js:1322`: `.querySelectorAll("#xCutionersSongHero input[type=radio][name='hero']")`
- `script.js:4127`: `"#xCutionersSongHero input[type=radio][name='hero']:checked"`

- [ ] In `index.html`: replace all `name="hero"` within the X-Cutioner's Song section with `name="xcutioner-hero"`. Use `replace_all: true` — but this will also replace the `name="hero"` references in the main hero checkboxes. **Do NOT use replace_all globally.** Instead, read the HTML section from line 134 to ~line 230, identify the exact span, and make a targeted bulk edit of only the `<ul class="items">` block inside `#xCutionersSongHero`.

  Alternative approach: use replace_all with a more specific string. Since `type="radio" name="hero"` only appears inside `#xCutionersSongHero`, do:
  ```
  replace_all: true
  old: type="radio" name="hero"
  new: type="radio" name="xcutioner-hero"
  ```
  Then verify the main hero section uses `type="checkbox"` not `type="radio"` (confirmed — main heroes use checkboxes, not radios, so this targeted replace is safe).

- [ ] In `script.js:1322`:
  Old:
  ```js
    .querySelectorAll("#xCutionersSongHero input[type=radio][name='hero']")
  ```
  New:
  ```js
    .querySelectorAll("#xCutionersSongHero input[type=radio][name='xcutioner-hero']")
  ```

- [ ] In `script.js:4127`:
  Old:
  ```js
      "#xCutionersSongHero input[type=radio][name='hero']:checked"
  ```
  New:
  ```js
      "#xCutionersSongHero input[type=radio][name='xcutioner-hero']:checked"
  ```

- [ ] Commit:
```
git commit -m "fix: rename X-Cutioner's Song hero radios from name=hero to name=xcutioner-hero to avoid name conflict"
```

---

## Task 11: Update CLAUDE.md and push to master

- [ ] In `CLAUDE.md`, remove L1–L8, L10, R1, R2, T1, T2 from the deferred items sections (they're now done). Keep T3 (summary panel truncation) and the Kree-Skrull War scheme question as the only remaining deferred items.

- [ ] Commit:
```
git commit -m "docs: CLAUDE.md — mark all deferred cleanup items resolved"
```

- [ ] Push to master:
```
git push origin master
```

---

## Self-review

**Spec coverage:**
- T2 (GOLDEN_SOLO constant): Tasks 1 ✓
- T1 (refillHQSlot helper): Task 2 ✓
- L1 (dead koHero): Task 8 ✓
- L2 (dead drawMultipleVillainCards): Task 4 ✓
- L3 (KOAllHQBystanders missing return): Task 5 ✓
- L4 (KOAllHeroesInHQ missing popup): Task 4 ✓
- L5 (dead enterCityNotDraw): Task 3 ✓
- L6 (morgAmbush hardcoded 5): Task 6 ✓
- L7 (Thanos popup text): Task 7 ✓
- L8 (duplicate DB field): Task 9 ✓
- L10 (X-Cutioner's Song name conflict): Task 10 ✓
- R1 (dead Arc Reactor DB fields): Task 9 ✓
- R2 (Master Strike by name not type): Task 7 ✓
- CLAUDE.md cleanup: Task 11 ✓

**Placeholder scan:** No TBDs, no "similar to" references, no steps without code.

**Type consistency:** `GOLDEN_SOLO` introduced in Task 1 and used in Task 2 onward. `refillHQSlot` defined in Task 2 Step 1 and called in all subsequent steps. Both consistent throughout.

**Ordering dependency:** Task 1 (T2) must complete before Task 2 (T1) because the helper definition uses `GOLDEN_SOLO`. Task 2 must complete before Tasks 3–8 because Tasks 3–8 show post-T1 code. Tasks 3–10 are independent of each other.
