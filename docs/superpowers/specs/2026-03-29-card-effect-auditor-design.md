# Card Effect Auditor — Design Spec

**Date:** 2026-03-29
**Updated:** 2026-03-30
**Status:** Approved design, pending implementation plan

## Problem

The game has hundreds of cards across multiple expansions, each with effects that must be correctly implemented in code. With 12 more expansions planned, there is no systematic way to verify that:

1. Card effects in code match the physical card text
2. Cards follow Golden Solo compatibility rules
3. New card effects don't conflict with existing mechanics
4. Expansion keywords are handled consistently

Hero cards in `cardDatabase.js` store only a function key (`unconditionalAbility`) with no effect text — so there's currently no way to compare intent vs. implementation without reading the physical card images.

## Solution

Two components, built in order:

| Component | Purpose | File |
|-----------|---------|------|
| **Comprehensive Card Reference** | Every card's full data and effect text, grouped by expansion and card type | `docs/card-effects-reference.md` |
| **Card Effect Auditor** | Subagent that compares reference data against code implementations | `.claude/agents/card-effect-auditor.md` |

### Why not a separate taxonomy?

The original design included a standalone "Card Effect Taxonomy" document categorizing every trigger/condition type. This was dropped because the auditor is Claude — it can read effect text like "Covert: You get +2 Attack" and understand it's a class-conditional effect without needing a separate classification document. The comprehensive card reference contains all the information the auditor needs.

## Component 1: Comprehensive Card Reference

A structured file containing every card in the game, grouped by expansion, then by card type. This is the single source of truth the auditor checks against.

### Card Types and Fields

#### Heroes

| Field | Description |
|-------|-------------|
| Hero name | The character (e.g. "Black Widow") |
| Card name | The specific card (e.g. "Covert Operation") |
| Class | Covert, Strength, Instinct, Ranged, or Tech |
| Team | X-Men, Avengers, S.H.I.E.L.D., etc. |
| Cost | Recruit cost |
| Base value | Recruit or attack value |
| Effect text | Full text from the physical card |

#### Villains

| Field | Description |
|-------|-------------|
| Villain name | The specific villain (e.g. "Venom") |
| Villain group | The group they belong to (e.g. "Sinister Six") |
| Fight effect | What happens when you fight/defeat them |
| Escape effect | What happens when they escape the city |
| Ambush effect | Effect that triggers when they enter the city (if any) |
| VP value | Victory points awarded |

#### Masterminds

| Field | Description |
|-------|-------------|
| Mastermind name | Full name as it appears in the database |
| Strength | Attack value needed to defeat |
| Always Leads | Which villain group they always lead |
| Master Strike effect | What happens when a Master Strike is drawn |
| Tactic cards | Each tactic card's name and effect text |

#### Schemes

| Field | Description |
|-------|-------------|
| Scheme name | Full name |
| Setup rules | Special setup modifications (extra villain groups, hero count changes, etc.) |
| Twist effects | What happens for each Scheme Twist (may differ by twist number) |
| Win/lose conditions | Any special victory or defeat conditions beyond the default |

#### Henchmen

| Field | Description |
|-------|-------------|
| Group name | The henchmen group (e.g. "Sentinel") |
| Fight effect | What happens when you fight/defeat them |
| Escape effect | What happens when they escape the city |
| Ambush effect | Effect that triggers when they enter the city (if any) |

#### Bystanders (special)

| Field | Description |
|-------|-------------|
| Bystander name | Name of the special bystander (if any) |
| Effect text | Any special effect that triggers when rescued or otherwise interacted with |

Only bystanders with special effects need entries — standard bystanders with no text effect are skipped.

#### Sidekicks

| Field | Description |
|-------|-------------|
| Name | Sidekick card name |
| Class | Class type (if any) |
| Effect text | Any special effect text |

Only sidekicks with special effects need entries — standard sidekicks with no text effect are skipped.

### Data Sources

- **Heroes**: Effect text extracted from card images in `Visual Assets/Heroes/`
- **Villains**: `effect` field in `cardDatabase.js`
- **Masterminds/Tactics**: `effect` and `masterStrikeConsoleLog` fields in `cardDatabase.js`
- **Schemes**: `twistText` field in `cardDatabase.js`
- **Henchmen**: `effect` fields in `cardDatabase.js`
- **Bystanders/Sidekicks**: Effect text from card images or code as applicable

### Structure Example

```markdown
## Core Set

### Heroes

#### Black Widow
| Card Name | Class | Team | Cost | Base Value | Effect Text |
|-----------|-------|------|------|------------|-------------|
| Covert Operation | Covert | Avengers | 4 | 0+ Attack | "You get +1 Attack for each Bystander in your Victory Pile." |
| Dangerous Rescue | ... | ... | ... | ... | ... |

#### Captain America
...

### Villains

#### Brotherhood
| Villain Name | Fight Effect | Escape Effect | Ambush | VP |
|-------------|-------------|---------------|--------|-----|
| Juggernaut | "..." | "..." | — | 4 |
| Mystique | "..." | "..." | "..." | 3 |

### Masterminds

#### Dr. Doom
| Field | Value |
|-------|-------|
| Strength | 9 |
| Always Leads | Doombot Legion |
| Master Strike | "..." |

**Tactics:**
| Tactic Name | Effect Text |
|-------------|-------------|
| ... | "..." |

### Schemes

#### The Legacy Virus
| Field | Value |
|-------|-------|
| Setup | "..." |
| Twist | "..." |
| Win/Lose | Standard |

### Henchmen

#### Sentinels
| Fight Effect | Escape Effect | Ambush |
|-------------|---------------|--------|
| "..." | "..." | — |
```

### Expansion Workflow Integration

When adding a new expansion via `/new-expansion`, new card entries are added to this reference file as part of the workflow — reading from card images for heroes, from code for villains/masterminds/schemes.

## Component 2: Card Effect Auditor (Subagent)

### Purpose

Compares each card's reference data against its code implementation. Flags issues only — stays silent on cards that pass.

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

1. Create `docs/card-effects-reference.md` — populate Core Set heroes from card images, villains/masterminds/schemes/henchmen from `cardDatabase.js`
2. Populate remaining existing expansions (Dark City, Fantastic Four, GotG, Paint the Town Red) into reference file
3. Create `.claude/agents/card-effect-auditor.md` — the subagent
4. Run first audit against all existing cards
5. Update `/new-expansion` skill to include reference file + auditor steps

## Design Decisions

- **Two components, not three**: The standalone taxonomy was dropped. The auditor (Claude) can classify effects directly from card text without a separate reference document.
- **Comprehensive card reference**: Covers all card types (heroes, villains, masterminds, schemes, henchmen, bystanders, sidekicks) with type-appropriate fields including class and team for heroes.
- **Reference file over image reading**: Card text is extracted once into a reference file rather than reading images every audit run. Faster, reviewable, and correctable.
- **Flagged issues only**: No pass/fail noise — only surfaces problems.
- **Four audit layers**: Card accuracy, Golden Solo compat, cross-card interactions, keyword consistency.
- **Existing cards first**: All currently-implemented cards are inventoried and audited before any new expansion work begins.
