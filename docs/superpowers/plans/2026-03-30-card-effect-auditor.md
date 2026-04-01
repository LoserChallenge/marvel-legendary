# Card Effect Auditor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive card reference covering every card in the game, then an auditor subagent that compares that reference against the code to flag discrepancies.

**Architecture:** Two components — (1) a set of per-expansion markdown reference files containing every card's data and effect text, and (2) a Claude subagent definition that reads those files and audits the code. Hero effect text comes from card images; all other card types are extracted from `cardDatabase.js`.

**Design spec:** `docs/superpowers/specs/2026-03-29-card-effect-auditor-design.md`

---

## Refinement from Design Spec

The design spec describes a single `docs/card-effects-reference.md` file. This plan splits it into **one file per expansion** under `docs/card-effects-reference/`:

```
docs/card-effects-reference/
  core-set.md
  dark-city.md
  fantastic-four.md
  guardians-of-the-galaxy.md
  paint-the-town-red.md
```

**Why:** Each file stays manageable in size. The auditor can target a single expansion. The `/new-expansion` workflow adds a new file rather than editing a massive document.

---

## Expansion-to-Card Mapping

`cardDatabase.js` does not tag most cards with an expansion field. The mapping below is the source of truth for which cards belong to which expansion.

### Core Set

| Type | Cards |
|------|-------|
| **Heroes (15)** | Black Widow, Captain America, Cyclops, Deadpool, Emma Frost, Gambit, Hawkeye, Hulk, Iron Man, Nick Fury, Rogue, Spider-Man, Storm, Thor, Wolverine |
| **Villain Groups (7)** | Brotherhood, Enemies of Asgard, HYDRA, Masters of Evil, Radiation, Skrulls, Spider-Foes |
| **Masterminds (4)** | Dr. Doom, Loki, Magneto, Red Skull |
| **Schemes (8)** | Midtown Bank Robbery, Negative Zone Prison Breakout, Portals to the Dark Dimension, Replace Earth's Leaders with Killbots, Secret Invasion of the Skrull Shapeshifters, Superhero Civil War, The Legacy Virus, Unleash the Power of the Cosmic Cube |
| **Henchmen (4)** | Doombot Legion, Hand Ninjas, Savage Land Mutates, Sentinel |

### Dark City

| Type | Cards |
|------|-------|
| **Heroes (17)** | Angel, Bishop, Blade, Cable, Colossus, Daredevil, Domino, Elektra, Forge, Ghost Rider, Iceman, Iron Fist, Jean Grey, Nightcrawler, Professor X, Punisher, Wolverine (X-Force) |
| **Villain Groups (6)** | Emissaries of Evil, Four Horsemen, Marauders, Mutant Liberation Front, Streets of New York, Underworld |
| **Masterminds (5)** | Apocalypse, Kingpin, Mephisto, Mr. Sinister, Stryfe |
| **Schemes (8)** | Capture Baby Hope, Detonate the Helicarrier, Massive Earthquake Generator, Organized Crime Wave, Save Humanity, Steal the Weaponized Plutonium, Transform Citizens Into Demons, X-Cutioner's Song |
| **Henchmen (2)** | Maggia Goons, Phalanx |
| **Special Bystanders (3)** | News Reporter, Radiation Scientist, Paramedic |

### Fantastic Four

| Type | Cards |
|------|-------|
| **Heroes (5)** | Human Torch, Invisible Woman, Mr. Fantastic, Silver Surfer, Thing |
| **Villain Groups (2)** | Heralds of Galactus, Subterranea |
| **Masterminds (2)** | Galactus, Mole Man |
| **Schemes (4)** | Bathe Earth in Cosmic Rays, Flood the Planet with Melted Glaciers, Invincible Force Field, Pull Reality Into the Negative Zone |
| **Henchmen (0)** | None |

### Guardians of the Galaxy

| Type | Cards |
|------|-------|
| **Heroes (5)** | Drax the Destroyer, Gamora, Groot, Rocket Raccoon, Star-Lord |
| **Villain Groups (2)** | Infinity Gems, Kree Starforce |
| **Masterminds (2)** | The Supreme Intelligence of the Kree, Thanos |
| **Schemes (4)** | Forge the Infinity Gauntlet, Intergalactic Kree Nega-Bomb, The Kree-Skrull War, Unite the Shards |
| **Henchmen (0)** | None |

### Paint the Town Red

| Type | Cards |
|------|-------|
| **Heroes (5)** | Black Cat, Moon Knight, Scarlet Spider, Spider-Woman, Symbiote Spider-Man |
| **Villain Groups (2)** | Maximum Carnage, Sinister Six |
| **Masterminds (2)** | Carnage, Mysterio |
| **Schemes (4)** | The Clone Saga, Invade the Daily Bugle News HQ, Splice Humans with Spider DNA, Weave a Web of Lies |
| **Henchmen (0)** | None |

### Not Yet Implemented (in DB but no expansion code)

Sidekick cards exist in `cardDatabase.js` for Secret Wars Volume 1, Civil War, and Messiah Complex. These are **future expansions** — do not include them in the reference files until those expansions are built.

---

## Icon Notation Convention

`cardDatabase.js` uses HTML `<img>` tags for icons. The reference files use a shorthand notation instead:

| Icon | Notation |
|------|----------|
| Attack | `[Attack]` |
| Recruit | `[Recruit]` |
| Tech | `[Tech]` |
| Ranged | `[Ranged]` |
| Covert | `[Covert]` |
| Strength | `[Strength]` |
| Instinct | `[Instinct]` |
| Piercing | `[Piercing]` |

When extracting from `cardDatabase.js`, replace all `<img ... alt='X Icon' ...>` tags with the corresponding `[X]` notation. When reading card images, use the same notation for any icons shown on the card.

---

## Phase 1: File Structure and Core Set

### Task 1: Create file structure and conventions header

**Files:**
- Create: `docs/card-effects-reference/README.md`
- Create: `docs/card-effects-reference/core-set.md` (headers only)

- [ ] **Step 1: Create the README**

This file explains the reference format and icon notation so anyone (human or auditor) understands the conventions.

```markdown
# Card Effects Reference

Comprehensive inventory of every card in the game, grouped by expansion.

## File Structure

One file per expansion:
- `core-set.md` — 15 heroes, 7 villain groups, 4 masterminds, 8 schemes, 4 henchmen
- `dark-city.md` — 17 heroes, 6 villain groups, 5 masterminds, 8 schemes, 2 henchmen, 3 special bystanders
- `fantastic-four.md` — 5 heroes, 2 villain groups, 2 masterminds, 4 schemes
- `guardians-of-the-galaxy.md` — 5 heroes, 2 villain groups, 2 masterminds, 4 schemes
- `paint-the-town-red.md` — 5 heroes, 2 villain groups, 2 masterminds, 4 schemes

## Icon Notation

Effect text uses shorthand for game icons:

| Icon | Notation |
|------|----------|
| Attack value | `[Attack]` |
| Recruit value | `[Recruit]` |
| Tech class | `[Tech]` |
| Ranged class | `[Ranged]` |
| Covert class | `[Covert]` |
| Strength class | `[Strength]` |
| Instinct class | `[Instinct]` |
| Piercing energy | `[Piercing]` |

## Data Sources

- **Hero effect text**: Extracted from card images in `Visual Assets/Heroes/`
- **Villain/Mastermind/Scheme/Henchmen data**: Extracted from `cardDatabase.js`
- **Special Bystander data**: Extracted from `cardDatabase.js` (expansion bystanders)

## How to Add a New Expansion

1. Create a new file: `docs/card-effects-reference/<expansion-name>.md`
2. Follow the same section structure as existing files
3. Populate hero cards from card images
4. Populate other card types from `cardDatabase.js`
5. Run the Card Effect Auditor against the new file
```

- [ ] **Step 2: Create core-set.md with section headers**

Create the file with all section headers but no card data yet. This establishes the structure that subsequent tasks will fill in.

```markdown
# Core Set

## Heroes

<!-- 15 heroes, 4 cards each = 60 cards total -->
<!-- Data source: card images in Visual Assets/Heroes/Reskinned Core/ -->

## Villains

<!-- 7 villain groups -->
<!-- Data source: cardDatabase.js villains array, IDs 1-7 -->

## Masterminds

<!-- 4 masterminds -->
<!-- Data source: cardDatabase.js masterminds array, IDs 1-4 -->

## Schemes

<!-- 8 schemes -->
<!-- Data source: cardDatabase.js schemes array, IDs 1-8 -->

## Henchmen

<!-- 4 henchmen groups -->
<!-- Data source: cardDatabase.js henchmen array, IDs 1-4 -->
```

- [ ] **Step 3: Commit**

```bash
git add docs/card-effects-reference/README.md docs/card-effects-reference/core-set.md
git commit -m "docs: create card effects reference file structure and conventions"
```

---

### Task 2: Core Set — extract villains, masterminds, schemes, henchmen from cardDatabase.js

**Files:**
- Modify: `docs/card-effects-reference/core-set.md`
- Read: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/cardDatabase.js`

These card types already have effect text in the database, so no image reading is needed. Read the relevant sections of `cardDatabase.js` and format the data into the reference file.

- [ ] **Step 1: Extract Core Set villain groups (IDs 1–7)**

Read `cardDatabase.js` and find all villains with IDs 1–7 (Brotherhood through Spider-Foes). For each villain, record:

| Villain Name | Group | Attack | VP | Fight Effect | Escape Effect | Ambush |
|-------------|-------|--------|-----|-------------|---------------|--------|

Replace any HTML `<img>` tags in effect text with the `[Icon]` notation from the conventions.

For villains whose `fightEffect`, `escapeEffect`, or `ambushEffect` is a function name (not human-readable text), look up that function in `cardAbilities.js` and write a plain-English description of what it does. Format: describe the game effect, not the code.

- [ ] **Step 2: Extract Core Set masterminds (IDs 1–4)**

Read `cardDatabase.js` masterminds with IDs 1–4 (Dr. Doom, Loki, Magneto, Red Skull). For each mastermind, record:

**Mastermind header:**
| Field | Value |
|-------|-------|
| Strength | (attack + bonusAttack) |
| Always Leads | (alwaysLeads value) |
| Master Strike | (masterStrikeConsoleLog text, icons converted) |

**Tactics table:**
| Tactic Name | VP | Effect Text |
|-------------|-----|-------------|

- [ ] **Step 3: Extract Core Set schemes (IDs 1–8)**

Read `cardDatabase.js` schemes with IDs 1–8. For each scheme, record:

| Field | Value |
|-------|-------|
| Bystander Count | (bystanderCount) |
| Twist Count | (twistCount) |
| End Game Condition | (endGame — convert to plain English) |
| Twist Effect | (twistText, or twistText1–N for variable twists, icons converted) |

- [ ] **Step 4: Extract Core Set henchmen (IDs 1–4)**

Read `cardDatabase.js` henchmen with IDs 1–4 (Doombot Legion, Hand Ninjas, Savage Land Mutates, Sentinel). For each, record:

| Henchmen Group | Attack | VP | Fight Effect |
|---------------|--------|-----|-------------|

For henchmen whose `fightEffect` is a function name, look up the function in `cardAbilities.js` and write a plain-English description.

- [ ] **Step 5: Write all extracted data into core-set.md**

Populate the Villains, Masterminds, Schemes, and Henchmen sections of `core-set.md` with the formatted tables.

- [ ] **Step 6: Verify completeness**

Check that all cards are accounted for:
- 7 villain groups, each with all their individual villains listed
- 4 masterminds, each with all 4 tactic cards
- 8 schemes
- 4 henchmen groups

- [ ] **Step 7: Commit**

```bash
git add docs/card-effects-reference/core-set.md
git commit -m "docs: populate Core Set villains, masterminds, schemes, henchmen in card reference"
```

---

### Task 3: Core Set — read hero card images (batch 1 of 3: heroes 1–5)

**Files:**
- Modify: `docs/card-effects-reference/core-set.md`
- Read: card images in `Visual Assets/Heroes/Reskinned Core/`

Read the card images for the first 5 Core Set heroes and extract their effect text. Each hero has exactly 4 cards.

- [ ] **Step 1: Read all 4 card images for Black Widow**

Image paths:
- `Legendary-Solo-Play-main/Legendary-Solo-Play-main/Visual Assets/Heroes/Reskinned Core/Core_BlackWidow_MissionAccomplished.webp`
- Find the other 3 Black Widow images in the same folder

For each card, record:
| Card Name | Class | Team | Cost | Base Value | Effect Text |
|-----------|-------|------|------|------------|-------------|

Read the full card text from the image. Use `[Icon]` notation for any icons. Note the class icon (Tech/Covert/etc.) and team icon (Avengers/X-Men/etc.) visible on the card.

Cross-reference against `cardDatabase.js` to verify the class, team, cost, and base values match. Flag any discrepancies.

- [ ] **Step 2: Read all 4 card images for Captain America**

Same process as Step 1. Find all 4 Captain America images in `Visual Assets/Heroes/Reskinned Core/`.

- [ ] **Step 3: Read all 4 card images for Cyclops**

Same process.

- [ ] **Step 4: Read all 4 card images for Deadpool**

Same process.

- [ ] **Step 5: Read all 4 card images for Emma Frost**

Same process.

- [ ] **Step 6: Write hero data into core-set.md Heroes section**

Add a sub-section for each of the 5 heroes with their 4-card tables.

- [ ] **Step 7: Commit**

```bash
git add docs/card-effects-reference/core-set.md
git commit -m "docs: add Core Set heroes 1-5 (Black Widow through Emma Frost) to card reference"
```

---

### Task 4: Core Set — read hero card images (batch 2 of 3: heroes 6–10)

**Files:**
- Modify: `docs/card-effects-reference/core-set.md`
- Read: card images in `Visual Assets/Heroes/Reskinned Core/`

- [ ] **Step 1: Read all 4 card images for Gambit**
- [ ] **Step 2: Read all 4 card images for Hawkeye**
- [ ] **Step 3: Read all 4 card images for Hulk**
- [ ] **Step 4: Read all 4 card images for Iron Man**
- [ ] **Step 5: Read all 4 card images for Nick Fury**
- [ ] **Step 6: Write hero data into core-set.md Heroes section**
- [ ] **Step 7: Commit**

```bash
git add docs/card-effects-reference/core-set.md
git commit -m "docs: add Core Set heroes 6-10 (Gambit through Nick Fury) to card reference"
```

Same process as Task 3 for each hero — read 4 card images, extract text, cross-reference against `cardDatabase.js`, write to file.

---

### Task 5: Core Set — read hero card images (batch 3 of 3: heroes 11–15)

**Files:**
- Modify: `docs/card-effects-reference/core-set.md`
- Read: card images in `Visual Assets/Heroes/Reskinned Core/`

- [ ] **Step 1: Read all 4 card images for Rogue**
- [ ] **Step 2: Read all 4 card images for Spider-Man**
- [ ] **Step 3: Read all 4 card images for Storm**
- [ ] **Step 4: Read all 4 card images for Thor**
- [ ] **Step 5: Read all 4 card images for Wolverine**
- [ ] **Step 6: Write hero data into core-set.md Heroes section**

- [ ] **Step 7: Verify Core Set completeness**

Final check on core-set.md:
- 15 heroes, each with 4 cards = 60 hero card entries
- 7 villain groups with all individual villains
- 4 masterminds with all tactic cards
- 8 schemes
- 4 henchmen groups

- [ ] **Step 8: Commit**

```bash
git add docs/card-effects-reference/core-set.md
git commit -m "docs: add Core Set heroes 11-15 (Rogue through Wolverine) to card reference — Core Set complete"
```

---

## Phase 2: Dark City

### Task 6: Dark City — extract non-hero cards from cardDatabase.js

**Files:**
- Create: `docs/card-effects-reference/dark-city.md`
- Read: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/cardDatabase.js`

- [ ] **Step 1: Create dark-city.md with section headers**

Same structure as core-set.md, but add a **Special Bystanders** section at the end.

- [ ] **Step 2: Extract Dark City villain groups (IDs 8–13)**

Emissaries of Evil, Four Horsemen, Marauders, Mutant Liberation Front, Streets of New York, Underworld.

Same table format as Core Set villains. Look up function-name effects in `cardAbilitiesDarkCity.js` (not `cardAbilities.js` — Dark City has its own ability file).

- [ ] **Step 3: Extract Dark City masterminds (IDs 5–9)**

Apocalypse, Kingpin, Mephisto, Mr. Sinister, Stryfe.

- [ ] **Step 4: Extract Dark City schemes (IDs 9–16)**

Capture Baby Hope through X-Cutioner's Song.

- [ ] **Step 5: Extract Dark City henchmen (IDs 5–6)**

Maggia Goons, Phalanx.

- [ ] **Step 6: Extract Dark City special bystanders**

Search `cardDatabase.js` for bystanders with `expansion: 'Dark City'`. Record:

| Bystander Name | Copies | Effect (ability function) |
|---------------|--------|--------------------------|
| News Reporter | 4 | (look up `bystanderNewsReporter` in cardAbilities/cardAbilitiesDarkCity) |
| Radiation Scientist | 4 | (look up `bystanderRadiationScientist`) |
| Paramedic | 3 | (look up `bystanderParamedic`) |

- [ ] **Step 7: Commit**

```bash
git add docs/card-effects-reference/dark-city.md
git commit -m "docs: populate Dark City villains, masterminds, schemes, henchmen, bystanders in card reference"
```

---

### Task 7: Dark City — read hero card images (batch 1 of 3: heroes 1–6)

**Files:**
- Modify: `docs/card-effects-reference/dark-city.md`
- Read: card images in `Visual Assets/Heroes/Dark City/`

- [ ] **Step 1: Read all 4 card images for Angel**
- [ ] **Step 2: Read all 4 card images for Bishop**
- [ ] **Step 3: Read all 4 card images for Blade**
- [ ] **Step 4: Read all 4 card images for Cable**
- [ ] **Step 5: Read all 4 card images for Colossus**
- [ ] **Step 6: Read all 4 card images for Daredevil**
- [ ] **Step 7: Write hero data into dark-city.md Heroes section**
- [ ] **Step 8: Commit**

```bash
git add docs/card-effects-reference/dark-city.md
git commit -m "docs: add Dark City heroes 1-6 (Angel through Daredevil) to card reference"
```

---

### Task 8: Dark City — read hero card images (batch 2 of 3: heroes 7–12)

**Files:**
- Modify: `docs/card-effects-reference/dark-city.md`
- Read: card images in `Visual Assets/Heroes/Dark City/`

- [ ] **Step 1: Read all 4 card images for Domino**
- [ ] **Step 2: Read all 4 card images for Elektra**
- [ ] **Step 3: Read all 4 card images for Forge**
- [ ] **Step 4: Read all 4 card images for Ghost Rider**
- [ ] **Step 5: Read all 4 card images for Iceman**
- [ ] **Step 6: Read all 4 card images for Iron Fist**
- [ ] **Step 7: Write hero data into dark-city.md Heroes section**
- [ ] **Step 8: Commit**

```bash
git add docs/card-effects-reference/dark-city.md
git commit -m "docs: add Dark City heroes 7-12 (Domino through Iron Fist) to card reference"
```

---

### Task 9: Dark City — read hero card images (batch 3 of 3: heroes 13–17)

**Files:**
- Modify: `docs/card-effects-reference/dark-city.md`
- Read: card images in `Visual Assets/Heroes/Dark City/`

- [ ] **Step 1: Read all 4 card images for Jean Grey**
- [ ] **Step 2: Read all 4 card images for Nightcrawler**
- [ ] **Step 3: Read all 4 card images for Professor X**
- [ ] **Step 4: Read all 4 card images for Punisher**
- [ ] **Step 5: Read all 4 card images for Wolverine (X-Force)**
- [ ] **Step 6: Write hero data into dark-city.md Heroes section**

- [ ] **Step 7: Verify Dark City completeness**

Final check on dark-city.md:
- 17 heroes, each with 4 cards = 68 hero card entries
- 6 villain groups with all individual villains
- 5 masterminds with all tactic cards
- 8 schemes
- 2 henchmen groups
- 3 special bystander types

- [ ] **Step 8: Commit**

```bash
git add docs/card-effects-reference/dark-city.md
git commit -m "docs: add Dark City heroes 13-17 (Jean Grey through X-Force Wolverine) — Dark City complete"
```

---

## Phase 3: Small Expansions

### Task 10: Fantastic Four — all card types

**Files:**
- Create: `docs/card-effects-reference/fantastic-four.md`
- Read: card images in `Visual Assets/Heroes/Fantastic Four/`
- Read: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/cardDatabase.js`

- [ ] **Step 1: Create fantastic-four.md with section headers**

- [ ] **Step 2: Extract Fantastic Four villains (IDs 14–15: Heralds of Galactus, Subterranea)**

Look up effect functions in `expansionFantasticFour.js`.

- [ ] **Step 3: Extract Fantastic Four masterminds (IDs 10–11: Galactus, Mole Man)**

- [ ] **Step 4: Extract Fantastic Four schemes (IDs 17–20: Bathe Earth in Cosmic Rays through Pull Reality Into the Negative Zone)**

- [ ] **Step 5: Read all 4 card images for Human Torch**
- [ ] **Step 6: Read all 4 card images for Invisible Woman**
- [ ] **Step 7: Read all 4 card images for Mr. Fantastic**
- [ ] **Step 8: Read all 4 card images for Silver Surfer**
- [ ] **Step 9: Read all 4 card images for Thing**

- [ ] **Step 10: Write all data into fantastic-four.md**

- [ ] **Step 11: Verify completeness**

- 5 heroes × 4 cards = 20 hero entries
- 2 villain groups
- 2 masterminds with tactics
- 4 schemes
- 0 henchmen (confirm none exist for this expansion)

- [ ] **Step 12: Commit**

```bash
git add docs/card-effects-reference/fantastic-four.md
git commit -m "docs: add Fantastic Four expansion to card reference — complete"
```

---

### Task 11: Guardians of the Galaxy — all card types

**Files:**
- Create: `docs/card-effects-reference/guardians-of-the-galaxy.md`
- Read: card images in `Visual Assets/Heroes/GotG/`
- Read: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/cardDatabase.js`

- [ ] **Step 1: Create guardians-of-the-galaxy.md with section headers**

- [ ] **Step 2: Extract GotG villains (IDs 18–19: Infinity Gems, Kree Starforce)**

Look up effect functions in `expansionGuardiansOfTheGalaxy.js`.

- [ ] **Step 3: Extract GotG masterminds (IDs 14–15: The Supreme Intelligence of the Kree, Thanos)**

- [ ] **Step 4: Extract GotG schemes (IDs 25–28: Forge the Infinity Gauntlet through Unite the Shards)**

- [ ] **Step 5: Read all 4 card images for Drax the Destroyer**
- [ ] **Step 6: Read all 4 card images for Gamora**
- [ ] **Step 7: Read all 4 card images for Groot**
- [ ] **Step 8: Read all 4 card images for Rocket Raccoon**
- [ ] **Step 9: Read all 4 card images for Star-Lord**

- [ ] **Step 10: Write all data into guardians-of-the-galaxy.md**

- [ ] **Step 11: Verify completeness**

- 5 heroes × 4 cards = 20 hero entries
- 2 villain groups
- 2 masterminds with tactics
- 4 schemes
- 0 henchmen (confirm none exist for this expansion)

- [ ] **Step 12: Commit**

```bash
git add docs/card-effects-reference/guardians-of-the-galaxy.md
git commit -m "docs: add Guardians of the Galaxy expansion to card reference — complete"
```

---

### Task 12: Paint the Town Red — all card types

**Files:**
- Create: `docs/card-effects-reference/paint-the-town-red.md`
- Read: card images in `Visual Assets/Heroes/PtTR/`
- Read: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/cardDatabase.js`

- [ ] **Step 1: Create paint-the-town-red.md with section headers**

- [ ] **Step 2: Extract PtTR villains (IDs 16–17: Maximum Carnage, Sinister Six)**

Look up effect functions in `expansionPaintTheTownRed.js`.

- [ ] **Step 3: Extract PtTR masterminds (IDs 12–13: Carnage, Mysterio)**

- [ ] **Step 4: Extract PtTR schemes (IDs 21–24: The Clone Saga through Weave a Web of Lies)**

- [ ] **Step 5: Read all 4 card images for Black Cat**
- [ ] **Step 6: Read all 4 card images for Moon Knight**
- [ ] **Step 7: Read all 4 card images for Scarlet Spider**
- [ ] **Step 8: Read all 4 card images for Spider-Woman**
- [ ] **Step 9: Read all 4 card images for Symbiote Spider-Man**

- [ ] **Step 10: Write all data into paint-the-town-red.md**

- [ ] **Step 11: Verify completeness**

- 5 heroes × 4 cards = 20 hero entries
- 2 villain groups
- 2 masterminds with tactics
- 4 schemes
- 0 henchmen (confirm none exist for this expansion)

- [ ] **Step 12: Commit**

```bash
git add docs/card-effects-reference/paint-the-town-red.md
git commit -m "docs: add Paint the Town Red expansion to card reference — complete"
```

---

## Phase 4: Auditor Subagent

### Task 13: Create the Card Effect Auditor subagent

**Files:**
- Create: `.claude/agents/card-effect-auditor.md`

- [ ] **Step 1: Write the subagent definition**

```markdown
---
name: card-effect-auditor
description: Compares card effect reference data against code implementations, flags discrepancies
tools: ["Read", "Grep", "Glob", "Bash"]
---

# Card Effect Auditor

You audit card effect implementations by comparing the card effects reference files against the actual game code.

## Inputs

You will be told which expansion(s) to audit. Read the corresponding reference file(s) from `docs/card-effects-reference/`.

## Audit Process

For each card in the reference file:

### Layer 1: Card Text Accuracy
- Find the card's ability function in the code (check `cardAbilities.js`, `cardAbilitiesDarkCity.js`, and `expansion*.js`)
- Compare what the code does against what the reference says the card text is
- Check: correct trigger type, correct values, correct targets
- Flag any mismatch between reference text and code behavior

### Layer 2: Golden Solo Compatibility
- Any function that draws from the villain deck mid-turn must use `processVillainCard()`, NOT `drawVillainCard()`
- Any function that modifies the HQ must check `if (gameMode === 'golden')` and call `goldenRefillHQ(index)` instead of direct `hq[index] = heroDeck.pop()` assignment
- Any "each other player" effect should be silently skipped in Golden Solo (no hero deck superpower application)
- Check the compatibility report at `docs/golden-solo-compatibility-report.md` for known patterns

### Layer 3: Cross-Card Interactions
- Does the effect modify shared game state (city array, HQ array, villain deck, hero deck)?
- Could it conflict with other cards that touch the same state?
- Does it handle empty deck/city/HQ edge cases?

### Layer 4: Keyword/Mechanic Consistency
- If the card references a keyword (Bribe, Teleport, Focus, Artifacts, Shards, etc.), is that keyword implemented?
- Is the keyword handled consistently across all cards that reference it?

## Output Format

Report ONLY issues found. Do not report cards that pass all checks.

For each issue:

```
CARD: [Card Name] ([Card Type] — [Expansion])
LAYER: [1-4]
ISSUE: [What's wrong]
EXPECTED: [What the reference says]
ACTUAL: [What the code does]
FILE: [filename:line_number]
SEVERITY: [HIGH — breaks gameplay / MEDIUM — incorrect but non-breaking / LOW — cosmetic or edge case]
```

## Summary

End with a summary:
- Total cards audited
- Issues found (by layer and severity)
- Cards that could not be audited (missing function, unclear reference, etc.)
```

- [ ] **Step 2: Verify the subagent file is valid**

Read back `.claude/agents/card-effect-auditor.md` and confirm it is well-formed.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/card-effect-auditor.md
git commit -m "feat: add Card Effect Auditor subagent definition"
```

---

## Phase 5: First Audit Run

### Task 14: Run the auditor against all existing expansions

**Files:**
- Read: all files in `docs/card-effects-reference/`
- Read: `cardAbilities.js`, `cardAbilitiesDarkCity.js`, `expansion*.js`, `cardDatabase.js`
- Create: `docs/card-effect-audit-results-2026-XX-XX.md` (date of run)

- [ ] **Step 1: Run auditor against Core Set**

Invoke the `card-effect-auditor` subagent with prompt: "Audit the Core Set. Reference file: `docs/card-effects-reference/core-set.md`."

- [ ] **Step 2: Run auditor against Dark City**

Invoke with: "Audit Dark City. Reference file: `docs/card-effects-reference/dark-city.md`."

- [ ] **Step 3: Run auditor against Fantastic Four**

Invoke with: "Audit Fantastic Four. Reference file: `docs/card-effects-reference/fantastic-four.md`."

- [ ] **Step 4: Run auditor against Guardians of the Galaxy**

Invoke with: "Audit Guardians of the Galaxy. Reference file: `docs/card-effects-reference/guardians-of-the-galaxy.md`."

- [ ] **Step 5: Run auditor against Paint the Town Red**

Invoke with: "Audit Paint the Town Red. Reference file: `docs/card-effects-reference/paint-the-town-red.md`."

- [ ] **Step 6: Compile results**

Combine all audit results into a single dated report file. Group by severity (HIGH first, then MEDIUM, then LOW).

- [ ] **Step 7: Review results with user**

Present the audit findings to the user. HIGH severity issues should be discussed and prioritized for fixing. MEDIUM and LOW issues can be tracked for later.

- [ ] **Step 8: Commit**

```bash
git add docs/card-effect-audit-results-*.md
git commit -m "docs: first Card Effect Auditor run — results for all existing expansions"
```

---

## Phase 6: Workflow Integration

### Task 15: Update the /new-expansion skill to include auditor steps

**Files:**
- Modify: `.claude/skills/new-expansion/SKILL.md`

- [ ] **Step 1: Read the current /new-expansion skill**

Read `.claude/skills/new-expansion/SKILL.md` to understand the existing workflow steps.

- [ ] **Step 2: Add card reference and auditor steps**

Add these steps to the skill's workflow (after card data is added to `cardDatabase.js` and ability functions are written):

1. **Create card reference file**: Create `docs/card-effects-reference/<expansion-name>.md` using the standard template
2. **Populate hero cards**: Read hero card images and fill in the Heroes section
3. **Populate other cards**: Extract villain/mastermind/scheme/henchmen data from `cardDatabase.js` into the reference file
4. **Run auditor**: Invoke the card-effect-auditor subagent against the new expansion's reference file
5. **Fix flagged issues**: Address any HIGH or MEDIUM severity findings before merging

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/new-expansion/SKILL.md
git commit -m "feat: add card reference and auditor steps to /new-expansion skill"
```

---

## Phase 7: Cleanup

### Task 16: Update design spec and CLAUDE.md

**Files:**
- Modify: `docs/superpowers/specs/2026-03-29-card-effect-auditor-design.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update design spec status**

Change status from "pending implementation plan" to "implemented" and add a link to this plan.

- [ ] **Step 2: Update CLAUDE.md**

Update the "Planned Work" section to mark the Card Effect Auditor as complete. Update the "Automations Set Up" section to list the new subagent and reference files as active (remove "pending creation" notes).

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-03-29-card-effect-auditor-design.md CLAUDE.md
git commit -m "docs: mark Card Effect Auditor as implemented, update project status"
```

---

## Execution Notes

### Time estimates by phase

| Phase | Tasks | Primary work |
|-------|-------|-------------|
| Phase 1 (Core Set) | Tasks 1–5 | 60 hero card images + DB extraction |
| Phase 2 (Dark City) | Tasks 6–9 | 68 hero card images + DB extraction |
| Phase 3 (Small expansions) | Tasks 10–12 | 60 hero card images + DB extraction |
| Phase 4 (Auditor) | Task 13 | Subagent definition |
| Phase 5 (First audit) | Task 14 | 5 audit runs |
| Phase 6 (Integration) | Task 15 | Skill update |
| Phase 7 (Cleanup) | Task 16 | Doc updates |

### Parallelization opportunities

- Tasks 2–5 (Core Set) can run in parallel: Task 2 (DB extraction) is independent of Tasks 3–5 (hero images)
- Tasks 10, 11, 12 (small expansions) can run in parallel since they're independent expansions
- Phase 5 audit runs (Steps 1–5 of Task 14) can run in parallel

### Key risks

- **Card image readability**: Some card images may be hard to read (small text, stylized fonts). Flag uncertain readings with `[?]` marker for user verification.
- **Icon confusion**: Claude may confuse class icons (Tech vs Ranged) or team icons. Cross-reference against `cardDatabase.js` class/team fields to catch mismatches.
- **Function-name effects**: Many villain/henchmen effects are stored as function names (e.g., `topTwoCardsKOChoice`) not readable text. The executor must look up each function to write a plain-English description.
- **Expansion-to-ID mapping**: The ID ranges in this plan are best estimates. The executor should verify exact IDs by reading `cardDatabase.js` rather than trusting the ranges blindly.
