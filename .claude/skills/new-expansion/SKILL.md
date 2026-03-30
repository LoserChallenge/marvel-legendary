---
name: new-expansion
description: Step-by-step guide for adding a new expansion to the Marvel Legendary Solo Play app — correct file structure, card data, Golden Solo compatibility rules, and workflow order.
---

# New Expansion Skill

Use this skill whenever starting work on a new expansion. Follow the steps in order.

---

## Before You Start

You will need:
- The expansion's rulesheet PDF (user attaches to chat)
- `card-directory.pdf` (already in project root) for card names, costs, and classes
- The name of the expansion (e.g. "Heroes of Asgard")

All source files are in:
`D:\Games\Digital\Marvel Legendary\Claude Code\marvel-legendary\Legendary-Solo-Play-main\Legendary-Solo-Play-main\`

---

## Step 1 — Read and Plan (before touching any files)

1. Read the rulesheet PDF to understand:
   - All heroes, their cards (names, costs, classes, recruit/attack values)
   - All villains (fight effects, ambush effects, escape effects)
   - All schemes (twist effects, win condition)
   - The mastermind (lead card, tactics, master strike)
   - Any new keywords the expansion introduces

2. Read the relevant pages of `card-directory.pdf` to confirm card names and values.

3. Draft a full content plan and present it to the user for approval before writing any code. The plan should list:
   - Hero roster and card names
   - Villain group(s)
   - Scheme(s)
   - Mastermind name and tactics
   - Any new keywords and how they'll be implemented

**Do not write any code until the user approves the plan.**

---

## Step 2 — Create the Expansion File

Create a new file: `expansion[Name].js` (e.g. `expansionHeroesOfAsgard.js`)

Model the structure on `expansionFantasticFour.js`. Typical sections:

```js
// [Expansion Name] Expansion
// [date]

// Keywords (if any)
// [keyword helper functions here]

// --- HERO CARD ABILITIES ---
// [one async function per card ability]

// --- VILLAIN CARD EFFECTS ---
// [ambush, fight, escape functions]

// --- SCHEME TWIST EFFECTS ---
// [scheme twist functions]

// --- MASTERMIND EFFECTS ---
// [master strike, lead card, tactic functions]
```

---

## Step 3 — Add Card Data to cardDatabase.js

Use the Grep tool to find where existing expansion card data is added (search for `// Fantastic Four` or `// Guardians`). Add the new expansion's data in the same format immediately after the last expansion block.

Card data entries follow this structure:
```js
{ name: "Hero Name - Card Title", cost: 4, recruit: 3, attack: 0, classes: ["Instinct"], type: "Hero", team: "Expansion Name", ability: heroNameCardTitle },
```

---

## Step 4 — Register on the Setup Screen (index.html)

1. Add the expansion's heroes to the hero selection checkboxes.
2. Add the expansion's villains to the villain group selection.
3. Add the expansion's schemes to the scheme dropdown.
4. Add the expansion's mastermind to the mastermind dropdown.
5. Add a `<script src="expansion[Name].js"></script>` tag alongside the other expansion script tags.

Search `index.html` for `expansionFantasticFour.js` to find the right location for the script tag.

---

## Step 5 — Golden Solo Compatibility (MANDATORY)

Every function in the new expansion file that affects villain draws or the HQ **must** follow these three rules. The anti-pattern hook will catch violations at save time, but read these rules first.

### Rule 1 — Villain draws mid-turn: use `processVillainCard()`

Any card effect that draws a villain card during play (ambush effects, scheme twists, etc.) must call `processVillainCard()`, **not** `drawVillainCard()`.

```js
// CORRECT
await processVillainCard();

// WRONG — triggers full Golden Solo round machinery
await drawVillainCard();
```

If an effect draws multiple villain cards, loop over `processVillainCard()`:
```js
for (let i = 0; i < count; i++) {
  await processVillainCard();
}
```

### Rule 2 — HQ KO effects: use `goldenRefillHQ()`

Any effect that KOs a hero from the HQ and immediately fills the slot must use the conditional pattern:

```js
// CORRECT
if (gameMode === 'golden') {
  goldenRefillHQ(index);
} else {
  hq[index] = heroDeck.pop();
}

// WRONG — breaks HQ rotation in Golden Solo
hq[index] = heroDeck.pop();
```

Read the full function before editing — the variable name for the index may vary.

### Rule 3 — "Each other player" effects: skip in Golden Solo

Any effect worded "each other player" should be silently skipped in Golden Solo (no hero deck interaction):

```js
if (gameMode === 'golden') {
  // skip — no other player in Golden Solo
  return;
}
// ...normal effect...
```

---

## Step 6 — Verify

After completing all files:

1. The JS syntax check hook runs automatically on every save — fix any errors immediately.
2. The anti-pattern hook blocks any `drawVillainCard()` calls in expansion files — fix if triggered.
3. Grep for `drawVillainCard` in the new expansion file — confirm zero results.
4. Open `index.html` in the browser and confirm the new expansion appears on the setup screen with no console errors.
5. Start a test game using the new expansion and play through at least one full round.

---

## Key Functions (defined in script.js)

| Function | Purpose |
|---|---|
| `processVillainCard()` | Draw a single villain card — use this in card effects |
| `drawVillainCard()` | Full Golden Solo round machinery — only called by the turn engine |
| `goldenRefillHQ(index)` | Remove HQ card at index, append new card to rightmost slot |
| `gameMode` | Global: `'golden'` or `'whatif'` |
