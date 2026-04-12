# Step 3 — Small Infrastructure Bundle Design

Date: 2026-04-11
Status: Approved
Scope: 4 engine features needed before Revelations content phases

## Overview

Step 3 adds four small engine capabilities that Revelations cards depend on. Each is independent and gets its own commit on a single `step3-infra-bundle` worktree branch. None of these features change existing game behavior — they add new opt-in fields and code paths that only activate when Revelations content uses them.

## Implementation Approach

- **Single worktree branch** (`step3-infra-bundle`) with one commit per feature
- Merge the whole branch when all 4 items are complete and tested
- All existing expansions and card sets remain unaffected — every new feature is gated behind new fields that no existing cards use

---

## Feature 1: Epic Mastermind Toggle

**Purpose:** Let players choose Normal or Epic difficulty for Revelations masterminds.

### Data Model (`cardDatabase.js`)

Add an optional `epic` sub-object to mastermind entries. Only fields that differ go in `epic` — everything else (tactics, alwaysLeads, etc.) is inherited from the parent:

```js
{
  name: "Grim Reaper",
  attack: 8,
  masterStrike: "grimReaperMasterStrike",
  masterStrikeConsoleLog: "...",
  image: "grim-reaper.jpg",
  // ... other normal fields ...
  epic: {
    name: "Epic Grim Reaper",
    attack: 9,
    masterStrike: "epicGrimReaperMasterStrike",
    masterStrikeConsoleLog: "...",
    masterStrikeImage: "...",
    image: "epic-grim-reaper.jpg"
  },
  tactics: [ /* shared by both sides */ ]
}
```

### Setup Screen UI (`index.html`)

- A **Normal / Epic toggle** (checkbox or switch) appears next to each mastermind radio button that has an `epic` field
- Default state: Normal (unchecked)
- Masterminds without an `epic` field show no toggle — completely unchanged

### Engine Change (`script.js`)

`getSelectedMastermind()` (~line 776) gets ~10 new lines:
1. Find the base mastermind as today
2. Check if the epic toggle checkbox is checked
3. If epic is selected and the mastermind has an `epic` field: `return { ...baseMastermind, ...baseMastermind.epic }` — this replaces name, attack, masterStrike, image, etc. with the epic versions while preserving tactics, alwaysLeads, and everything not overridden
4. Otherwise return the base mastermind unchanged

All downstream code (`recalculateMastermindAttack`, `handleMasterStrike`, fight UI, `showConfirmChoicesPopup`) works unchanged because it reads whatever `getSelectedMastermind()` returns.

### What Doesn't Change

- Tactics array is shared — no duplication
- All existing masterminds have no `epic` field and are completely unaffected
- No changes to fight logic, master strike handling, or victory tracking

---

## Feature 2: Unique Henchmen `cards` Array

**Purpose:** Support henchman groups where each of the 10 cards is unique (Mandarin's Rings) instead of 10 identical copies.

### Data Model (`cardDatabase.js`)

Add an optional `cards` array to henchman entries. Each card inherits all parent fields and only overrides what's unique:

```js
{
  name: "Mandarin's Rings",
  attack: 3,
  victoryPoints: 1,
  henchmen: true,
  type: "Villain",
  // ... shared fields ...
  cards: [
    { name: "Liar, The Mento-Intensifier", fightEffect: "liarMentoIntensifier", image: "..." },
    { name: "Remaker, The Matter Rearranger", fightEffect: "remakerMatterRearranger", image: "..." },
    // ... 8 more Rings, each with unique name, fightEffect, image
  ]
}
```

### Engine Change (`script.js`, `generateVillainDeck()` ~line 4065)

Add a branch in both the Golden Solo and What If? Solo henchmen loops:

```js
if (henchman.cards) {
  for (const card of henchman.cards) {
    villainDeck.push({ ...henchman, ...card, subtype: "Henchman" });
  }
} else {
  // existing loop: for (let i = 0; i < 10; i++) push({ ...henchman })
}
```

### What If? Solo Handling

The existing What If? henchmen split logic (subset of 2 or 8 copies) works by slicing from the generated cards. With unique cards, it picks from the `cards` array instead of cloning. The exact subset logic may need minor adjustment during the content phase when we implement Mandarin's Rings specifically — the infrastructure just ensures unique cards get generated.

### What Doesn't Change

- All existing henchmen groups have no `cards` field — they continue cloning 10 identical copies exactly as today
- No UI changes needed — henchmen selection works the same regardless of whether cards are unique

---

## Feature 3: `transformScheme()` Helper + `hiddenFromSetup` Filtering

**Purpose:** Support double-sided schemes that flip between Side A and Side B during gameplay.

### Data Model (`cardDatabase.js`)

Each transforming scheme is two separate entries. Side A links to Side B via `transformsInto`. Side B is hidden from setup:

```js
// Side A — visible in setup screen
{
  name: "Earthquake Drains the Ocean",
  transformsInto: "Tsunami Crushes the Coast",
  // ... normal scheme fields (twistEffect, endGame, image, etc.) ...
}

// Side B — hidden from setup screen
{
  name: "Tsunami Crushes the Coast",
  transformsInto: "Earthquake Drains the Ocean",  // back-and-forth
  hiddenFromSetup: true,
  // ... its own twistEffect, endGame, image, etc. ...
}
```

- **Back-and-forth schemes** (Earthquake/Tsunami, Secret HYDRA/Open HYDRA): Both sides have `transformsInto` pointing at each other
- **One-way schemes** (House of M → No More Mutants, Korvac Saga → Korvac Revealed): Side B omits `transformsInto` (or it could be present for potential future flexibility — decided during implementation)

### Setup Screen Filtering

Side B entries are never added to the HTML radio buttons in `index.html`. They exist only in the `schemes` array in `cardDatabase.js` for `transformScheme()` to find them. This matches the existing pattern where scheme options are manually authored in HTML.

The `hiddenFromSetup` flag is checked by any code that dynamically iterates schemes (e.g., randomize button logic) to skip Side B entries.

### Engine Change (`script.js`)

New `transformScheme()` function (~10-15 lines):

```js
function transformScheme() {
  const targetName = selectedScheme.transformsInto;
  if (!targetName) return;  // one-way scheme already on final side
  const newScheme = schemes.find(s => s.name === targetName);
  if (!newScheme) {
    console.error(`Transform target not found: ${targetName}`);
    return;
  }
  selectedScheme = newScheme;
  // Update displayed scheme image
  document.getElementById('scheme-image').src = newScheme.image;
  console.log(`Scheme transformed to: ${newScheme.name}`);
}
```

Called from individual scheme twist/effect functions when the transform condition is met (content phase work — Step 3 just provides the helper).

### Key Rule: Twist Counter Does NOT Reset

The global twist counter keeps incrementing across transforms. This is inherent — the counter is a separate global variable that `transformScheme()` never touches.

### What Doesn't Change

- All existing schemes have no `transformsInto` or `hiddenFromSetup` field — completely unaffected
- `getEffectiveSetupRequirements()` reads from `selectedScheme` dynamically, so it automatically respects whichever side is active
- Scheme twist dispatch reads `selectedScheme.twistEffect`, so it automatically uses the active side's twist handler

---

## Feature 4: Recruit-Only Fight Cost

**Purpose:** Support villains that cost Recruit points instead of Attack to fight (Mister Hyde as Dr. Calvin Zabo when in Bank or Streets).

### Relationship to Existing Bribe Mechanic

This is a variation on the existing Bribe pattern, not a new system:
- **Default:** Fight costs Attack only
- **Bribe:** Fight costs Attack + Recruit (any mix, player chooses split via popup)
- **Recruit-only (new):** Fight costs Recruit only — no Attack allowed, no split popup

### Dynamic Flag (set during `updateVillainAttackValues()`)

No new field in `cardDatabase.js`. The flag is position-dependent — set dynamically when recalculating villain stats:

```js
// Inside updateVillainAttackValues() for Mister Hyde:
if (cityIndex === 1 || cityIndex === 3) {  // Streets or Bank
  villain.usesRecruitToFight = true;
} else {
  villain.usesRecruitToFight = false;
}
```

The actual position-checking logic is written in the content phase (Mister Hyde's villain effect). Step 3 provides the engine support for the flag.

### Engine Changes (`script.js`)

**1. Affordability check** (~line 7057-7089, city villains section of `updateGameBoard()`):

Add a branch alongside the existing Bribe check:

```js
if (villain.usesRecruitToFight) {
  canFight = totalRecruitPoints >= villainAttack;
} else if (hasBribe) {
  canFight = totalAttackPoints + totalRecruitPoints >= villainAttack;
} else {
  canFight = totalAttackPoints >= villainAttack;
}
```

**2. Cost deduction** in `defeatVillain()` (~line 11513):

When `usesRecruitToFight` is true, deduct the full amount from `totalRecruitPoints` directly. No `showCounterPopup()` needed — there's no split to choose.

### What Doesn't Change

- The `recruitUsedToAttack` flag and Bribe keyword logic stay untouched
- All existing villains never have `usesRecruitToFight` set, so they're completely unaffected
- Mastermind fight logic is unaffected (no mastermind uses recruit-only)

---

## Deferred: Extra Turn Mechanism

Originally planned as a 5th item. Deferred to Phase 3 (content phase) when building The Dark Dimension's fight effect. Rationale:

- In solo mode, "take another turn" is the normal game loop — press End Turn and you get another turn automatically
- The only scenario requiring a flag is a narrow edge case where a game-end condition triggers between turns
- Better to assess whether the flag is needed with full context during content implementation

---

## Testing Strategy

Each feature is tested in isolation before moving to the next:
- **Epic Mastermind:** Select a mastermind with epic field, toggle between Normal/Epic, verify `getSelectedMastermind()` returns correct stats
- **Unique Henchmen:** Add a test henchman group with `cards` array, verify `generateVillainDeck()` produces unique cards instead of clones
- **Transform Scheme:** Add a test scheme pair, call `transformScheme()`, verify `selectedScheme` swaps and image updates
- **Recruit-Only Fight:** Set `usesRecruitToFight` on a city villain, verify fight button enables based on recruit (not attack) and cost deducts from recruit

Full integration testing happens during Phase 4 (expansion validation) after content is added.
