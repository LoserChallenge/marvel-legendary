# Card Effect Auditor — Design Spec

**Date:** 2026-03-29
**Status:** Approved design, pending implementation plan

## Problem

The game has hundreds of cards across multiple expansions, each with effects that must be correctly implemented in code. With 12 more expansions planned, there is no systematic way to verify that:

1. Card effects in code match the physical card text
2. Cards follow Golden Solo compatibility rules
3. New card effects don't conflict with existing mechanics
4. Expansion keywords are handled consistently

Hero cards in `cardDatabase.js` store only a function key (`unconditionalAbility`) with no effect text — so there's currently no way to compare intent vs. implementation without reading the physical card images.

## Solution

Three components, built in order:

| Component | Purpose | File |
|-----------|---------|------|
| **Card Effect Taxonomy** | Reference of all known trigger/condition types | `docs/card-effect-taxonomy.md` |
| **Card Effects Reference** | Every card's effect text, extracted from images/code | `docs/card-effects-reference.md` |
| **Card Effect Auditor** | Subagent that compares reference text against code | `.claude/agents/card-effect-auditor.md` |

## Component 1: Card Effect Taxonomy

A living reference file listing every distinct trigger/condition type in the game. Starts with the known types below, grows as new expansions introduce new mechanics.

### Known Trigger/Condition Types

| Type | Description | Example |
|------|-------------|---------|
| **Unconditional** | Effect always fires when card is played | "You get +5 Attack" |
| **Class-conditional** | Triggers when you've played a card of a specific class (Covert, Strength, Instinct, Ranged, Tech) | "Covert: You may play the top card of the Villain Deck" |
| **Team-conditional** | Triggers based on team affiliation (X-Men, Avengers, S.H.I.E.L.D., etc.) | "X-Men: Draw a card" |
| **Count-based** | Scales with a quantity | "You get +1 Attack for each Bystander in your Victory Pile" |
| **Reveal-and-check** | Reveals top card(s) of a deck, effect depends on what's revealed | "Reveal the top card of your deck. If that card costs 2 or less, draw it" |
| **Choice** | Player picks between options | "Choose one: each other player draws a card or each other player discards a card" |
| **Each other player** | Targets other players (Golden Solo special handling) | "Each player discards the top card of their deck" |
| **Game state** | Depends on current board state | "If there are 3+ Villains in the city..." |
| **Draw villain card** | Any effect that draws from the villain deck mid-turn | "Play the top card of the Villain Deck" |
| **KO from HQ** | Any effect that removes a card from the HQ | "KO a Hero from the HQ" |
| **Keyword-driven** | Effects tied to expansion keywords | "Bribe", "Teleport", etc. |

### Uncategorized Handling

If the auditor encounters a card effect that doesn't fit any known type, it flags it as **UNCATEGORIZED** rather than silently skipping it. New types get added to the taxonomy when discovered.

## Component 2: Card Effects Reference

A structured file with every card's effect text, grouped by expansion, then by card type (Heroes, Villains, Masterminds, Schemes).

### Data Sources

- **Heroes**: Effect text extracted from card images in `Visual Assets/Heroes/`
- **Villains**: `effect` field already in `cardDatabase.js`
- **Masterminds/Tactics**: `effect` and `masterStrikeConsoleLog` fields in `cardDatabase.js`
- **Schemes**: `twistText` field in `cardDatabase.js`

### Structure

```markdown
## Core Set

### Heroes

#### Black Widow
| Card Name | Class | Cost | Base Value | Trigger Type | Effect Text |
|-----------|-------|------|------------|-------------|-------------|
| Covert Operation | Covert | 4 | 0+ Attack | Count-based | "You get +1 Attack for each Bystander in your Victory Pile." |
| Dangerous Rescue | ... | ... | ... | ... | ... |

#### Captain America
...

### Villains
(populated from cardDatabase.js `effect` fields)

### Masterminds
(populated from cardDatabase.js `effect` and `masterStrikeConsoleLog` fields)

### Schemes
(populated from cardDatabase.js `twistText` fields)
```

### Expansion Workflow Integration

When adding a new expansion via `/new-expansion`, new card entries are added to this reference file as part of the workflow — reading from card images for heroes, from code for villains/masterminds/schemes.

## Component 3: Card Effect Auditor (Subagent)

### Purpose

Compares each card's reference text against its code implementation. Flags issues only — stays silent on cards that pass.

### Four Audit Layers

| Layer | What it checks |
|-------|---------------|
| **1. Card text accuracy** | Does the function implement what the effect text says? Correct trigger type, correct values, correct targets? |
| **2. Golden Solo compatibility** | Uses `processVillainCard()` not `drawVillainCard()`? HQ changes use `goldenRefillHQ()`? "Each other player" effects handled? |
| **3. Cross-card interactions** | Does the effect touch shared game state (city, HQ, villain deck) in ways that could conflict with other cards? |
| **4. Keyword/mechanic consistency** | Any keywords referenced in the effect — are they implemented and handled everywhere? |

### Output Format

Flagged issues only. Each flag includes:

```
CARD: [Card Name] ([Hero/Villain/Mastermind/Scheme])
LAYER: [1-4]
ISSUE: [Description of what's wrong]
EXPECTED: [What the card text says should happen]
ACTUAL: [What the code does]
FILE: [filename:line_number]
```

### Invocation

- Run against a specific expansion: audits only cards from that expansion
- Run against all cards: full audit across entire game
- Run as part of `/new-expansion` workflow: audits new cards before merge

## Icon Reference

The auditor references this mapping when interpreting card images:

### Hero Classes (5)
Covert, Strength, Instinct, Ranged, Tech

### Heroic Teams (15)
X-Men, X-Force, Marvel Knights, Avengers, Fantastic Four, Heroes of Asgard, S.H.I.E.L.D., Warbound, Crime Syndicate, Champions, Spider Friends, Cabal, Illuminati, Guardians of the Galaxy, X-Factor

See `teams-classes.pdf` for icon visuals.

## Build Order

1. Create `docs/card-effect-taxonomy.md` — the taxonomy reference
2. Create `docs/card-effects-reference.md` — populate Core Set heroes from images, villains/masterminds/schemes from code
3. Populate remaining expansions (Dark City, Fantastic Four, GotG, Paint the Town Red) into reference file
4. Create `.claude/agents/card-effect-auditor.md` — the subagent
5. Run first audit against all existing cards
6. Update `/new-expansion` skill to include reference file + auditor steps

## Design Decisions

- **Reference file over image reading**: Card text is extracted once into a reference file rather than reading images every audit run. Faster, reviewable, and correctable.
- **Taxonomy is a living document**: Starts with known types, grows when uncategorized effects are found. Avoids silent blind spots.
- **Flagged issues only**: No pass/fail noise — only surfaces problems.
- **Four audit layers**: Card accuracy, Golden Solo compat, cross-card interactions, keyword consistency.
- **Flexible condition handling**: Auditor checks against known taxonomy but flags anything that doesn't fit rather than ignoring it.
