# Hero Reference Data Rebuild — Design Spec

**Date:** 2026-03-31
**Status:** Approved

## Problem

The first audit run (65 issues found) produced an unknown number of false positives because the hero sections of the card reference files were built by reading card images for ALL fields — including class, team, cost, and base value. Image readers made two categories of mistakes:

1. **Icon confusion** — Team icon (upper-left top of card) and Class icon (upper-left bottom of card) are stacked and visually similar. Image readers misidentified them, e.g. writing "Covert" where the card shows an Avengers team icon.
2. **Corner confusion** — Image readers read the lower-right Cost number as the lower-left Base Value, producing wrong attack/recruit values in the reference file.
3. **Inline icon confusion** — The same icon misreads occurred for [Class] and [Team] tags that appear inside the effect text itself.

These errors make audit findings unreliable — real bugs may be buried under false positives, and false negatives may exist too.

## Card Layout Reference

### Hero Cards
| Corner | Content |
|--------|---------|
| Upper left (top) | Team affiliation icon |
| Upper left (bottom) | Class icon (directly below team) |
| Lower left | Base value (attack or recruit points when played) |
| Lower right | Cost (recruit points to acquire the card) |

**Exception — Silver Surfer (Fantastic Four set):** Silver Surfer is the only hero with no team affiliation. The team slot is empty on his cards. The Class icon is still in its regular position (upper left). This is correct — do not flag as an error.

### Villain / Mastermind / Henchmen Cards
| Corner | Content |
|--------|---------|
| Lower right | Fight value (points needed to defeat) |

## Solution

Rebuild hero reference data one expansion at a time using a two-phase approach:

1. **Script phase** — extract all structured fields from `cardDatabase.js` (authoritative, no image reading)
2. **Subagent phase** — read card images for effect text only, cross-check any [Class]/[Team] tags against DB condition values, flag mismatches for manual review

Non-hero data (villains, masterminds, schemes, henchmen) was already sourced from `cardDatabase.js` and does not need rebuilding.

## Phase 1: Extraction Script

A Node.js script reads `cardDatabase.js` and outputs:

- A pre-filled markdown table for all heroes in the target expansion — every column populated from DB except Effect Text (left blank)
- A companion JSON file listing each card's image path and DB condition value (for the subagent to use in Phase 2)

### Fields Extracted from DB

| Reference Column | DB Field(s) |
|-----------------|------------|
| Card Name | `name` |
| Class | `classes[0]` |
| Team | `team` |
| Cost | `cost` |
| Base Value | derived (see logic below) |
| Effect Text | *(blank — filled in Phase 2)* |

### Base Value Derivation Logic

| DB State | Output |
|----------|--------|
| `attackIcon: true`, `bonusAttack > 0` | `0+ [Attack]` |
| `attackIcon: true`, `bonusAttack === 0` | `[attack] [Attack]` |
| `recruitIcon: true`, `bonusRecruit > 0` | `0+ [Recruit]` |
| `recruitIcon: true`, `bonusRecruit === 0` | `[recruit] [Recruit]` |
| Both icons false | `0` (support card) |
| Both icons true | `[attack] [Attack], [recruit] [Recruit]` |

### Condition Metadata (not shown in table, passed to subagent)

Each card entry in the companion JSON includes:
- `condition` — the DB condition value (e.g. `"Avengers"`, `"Covert"`, `"None"`)
- `conditionType` — the DB condition type (e.g. `"playedCards"`, `"None"`)
- `image` — path to the card image file

## Phase 2: Subagent Effect Text Fill

The subagent receives the pre-filled table and companion JSON. Its only job is to fill in the Effect Text column.

### Subagent Instructions

1. Read each card image, looking only at the **text area** (centre of card) — do not read any corner values
2. Write out the full effect text, replacing icon symbols with bracketed text equivalents: `[Attack]`, `[Recruit]`, `[Covert]`, `[Avengers]`, etc.
3. For any `[Class]` or `[Team]` tag that appears in the effect text, compare it against the DB condition value from the companion JSON:
   - **Match** → write it as-is
   - **Mismatch** → do not guess; add to "Needs Review" section with both values shown
4. Cards with `condition: "None"` — if any [Class] or [Team] tag appears in the effect text, add to "Needs Review" regardless

### Needs Review Format

```markdown
## Needs Review

The following cards had a mismatch between the effect text read from the image
and the DB condition field. Please check the physical card and correct the entry above.

- **[Hero] - [Card Name]**: image text says `[X]:` but DB condition is `Y`
```

## Phase 3: Manual Review

After the subagent completes:

1. Open each flagged card's image (path in the DB) or check the physical card
2. Confirm which tag is correct
3. Edit the reference file to fix the effect text
4. Delete the entry from "Needs Review" once resolved

Once the "Needs Review" list is empty, the expansion's hero section is considered accurate and ready for audit.

## Scope and Order

Rebuild one expansion at a time, starting with Core Set. Validate the process on Core Set before moving to subsequent expansions.

**Order:**
1. Core Set (15 heroes, 60 cards)
2. Dark City
3. Fantastic Four
4. Guardians of the Galaxy
5. Paint the Town Red

Each expansion follows the same two-phase process. Non-hero sections are not touched.

## New Expansion Cards (Future Work)

This DB-first approach only applies to cards already in `cardDatabase.js`. For new expansions where no DB entry exists yet, the `/new-expansion` skill will use a **structured per-corner image read** instead:

- Read upper-left top area only → Team
- Read upper-left bottom area only → Class
- Read lower-left corner only → Base Value
- Read lower-right corner only → Cost
- Read centre text area only → Effect Text

Targeted corner-by-corner reads are much harder to confuse than whole-card reads. This protocol will be added to the `/new-expansion` skill when expansion work begins.

## Success Criteria

- Every hero card's class, team, cost, and base value matches `cardDatabase.js` exactly
- Effect text is sourced from card images, with all inline [Class]/[Team] tags verified
- "Needs Review" list is empty (all mismatches resolved) before audit runs
- Re-running the audit against rebuilt reference data produces only real bugs, no reference-data false positives
