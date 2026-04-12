# Scheme Hero Requirements Design

**Date:** 2026-04-05
**Status:** Approved

## Problem

Golden Solo mode hardcodes the hero count to 5, ignoring the scheme's `requiredHeroes` field. Some schemes require 4 or 6 heroes, and future expansion schemes may require specific heroes or team compositions (e.g., "4 X-Men and 2 non-X-Men"). There is no infrastructure to express or enforce these conditions.

## Design Decisions

- **Scheme rules always take priority** over default hero counts — in both Golden Solo and What If modes. If a scheme says 4, you use 4 even though Golden Solo's baseline is 5.
- **Condition types supported:** hero count, team composition, and specific required heroes.
- **Class composition and expansion restrictions** are out of scope — too specific and harder to enforce.
- **No auto-locking of required heroes** — validation at confirm time is sufficient.
- **Requirements banner included** — minimal UI element that shows conditions when a scheme with `heroRequirements` is selected.

## Data Model

### Hero Count (existing field)

Remove the Golden Solo hardcoded `5` from all four locations in `script.js`. Both game modes use `scheme.requiredHeroes` directly.

The four locations are:
1. **Standalone Randomize Heroes button** (~line 2303) — `_rh_count` assignment
2. **Summary panel display** (~line 2531) — `requiredHeroes` assignment
3. **Randomize All button** (~line 2896) — `_rhr_count` assignment
4. **Validation at confirm** (~line 3087) — `requiredHeroes` assignment

Each currently has: `(gameMode === GOLDEN_SOLO) ? 5 : scheme.requiredHeroes`
Each becomes: `scheme.requiredHeroes`

### Hero Requirements (new optional field)

Add an optional `heroRequirements` property to scheme objects in `cardDatabase.js`:

```js
heroRequirements: {
    // Team composition constraints
    teamComposition: [
        { team: "X-Men", count: 4 },
        { team: "non:X-Men", count: 2 }
    ],
    // Specific heroes that must be included
    requiredHero: ["Spider-Man"]
}
```

Rules:
- `heroRequirements` is optional — most schemes won't have it
- `teamComposition` is an array of constraints; `"non:"` prefix means "any team except"; each `count` is exact
- `requiredHero` is an array of hero names that must be selected
- The sum of `teamComposition` counts should equal `requiredHeroes`
- Existing schemes need no changes — this is infrastructure for future expansion schemes

## Setup Screen Behavior

### Requirements Banner

- A single `<div>` near the hero selection area
- Shows/hides dynamically when the scheme selection changes
- Only visible when the selected scheme has `heroRequirements`
- Displays conditions in plain English, e.g.:
  - "This scheme requires 4 X-Men heroes and 2 non-X-Men heroes"
  - "This scheme requires Spider-Man"
- Minimal styling consistent with existing UI

### Validation at Confirm

Extends the existing validation block (~line 3087 in `script.js`):

1. **Hero count** — already exists, just uses `scheme.requiredHeroes` for all modes now
2. **Team composition** — checks selected heroes against each `teamComposition` constraint. Required heroes from `requiredHero` count toward their team's constraint (e.g., if Spider-Man is required and is an Avenger, he counts toward an Avengers team constraint). Specific error messages: "You need 4 X-Men heroes (currently have 2)"
3. **Required hero** — checks each name in `requiredHero` is selected. Error message: "This scheme requires Spider-Man"

Game cannot start until all conditions are met.

### Summary Panel

The existing `(3/5)` hero counter continues to work — just uses `scheme.requiredHeroes` instead of the hardcoded 5. No other changes needed.

## Randomize Behavior

When "Randomize Heroes" or "Randomize All" is clicked and the scheme has `heroRequirements`:

1. **Required heroes first** — include any heroes from `requiredHero` list
2. **Team composition** — fill each constraint from eligible heroes (e.g., pick 4 random X-Men, then 2 random non-X-Men), subtracting any already-included required heroes from the appropriate pool
3. **No `heroRequirements`** — works exactly as today, picking `scheme.requiredHeroes` random heroes
4. **Fallback** — if not enough eligible heroes exist to satisfy a constraint, pick as many as possible; validation at confirm time flags the shortfall

## Files Changed

| File | Changes |
|------|---------|
| `script.js` | Remove hardcoded 5 in four locations; extend validation; extend randomize logic; add banner show/hide logic |
| `cardDatabase.js` | Add `heroRequirements` to schemes that need it (none currently — infrastructure for expansions) |
| `index.html` | Add one `<div>` for requirements banner |
| `styles.css` | Minimal banner styling |

## Existing Infrastructure (no changes needed)

Villain and henchmen requirements are **already implemented** via `specificVillainRequirement` and `specificHenchmenRequirement` fields on schemes, enforced by `getEffectiveSetupRequirements()` in `script.js`. Examples: Kree-Skrull War requires `["Kree Starforce", "Skrulls"]`, Forge the Infinity Gauntlet requires `"Infinity Gems"`. Validation, randomize enforcement, and auto-checking all work. This spec fills the equivalent gap on the **hero** side.

## Out of Scope

- Class composition constraints (e.g., "must include 2 Covert heroes")
- Expansion restriction constraints (e.g., "only use heroes from X-Men set")
- Auto-locking required heroes in the selection list
- Mastermind requirements from schemes (no known schemes require a specific mastermind)
- Villain/henchmen requirements (already implemented — see above)
