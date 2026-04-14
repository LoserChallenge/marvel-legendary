# Revelations — Implementation Progress

Started: 2026-04-06
Status: In Progress

## Build Order (Infrastructure-First)

Revelations requires 7 core engine changes before content work.
Build order optimized to avoid rework — each layer builds on the previous.

### Block 1: Infrastructure

#### Step 1 — Dynamic City Refactor ✅ Complete (2026-04-06)
Merged to master. 25 named variables → 5 arrays, 264 references converted across 8 files, city HTML generated dynamically. Browser-tested with Portals to the Dark Dimension (PermBuff) and Galactus (TempBuff + CosmicThreat + destroyed spaces). Deferred: 11 renderCityCards() popup loops still use `i < 5` — fix when Earthquake/Tsunami scheme changes citySize.

#### Step 2 — Location System ✅ Complete (2026-04-06)
On `location-system` worktree branch (9 commits, not merged — merge when full expansion ready). `cityLocations[]` parallel array, fan-out CSS rendering (Location extends above cell at `top: -4vh`, villain shifts down via `margin-top: 5vh`), independent fight flow (`showLocationAttackButton` + `defeatLocation`), post-villain-fight trigger hooks, overflow (KO lowest-attack, player chooses ties), `generateVillainDeck` type preservation. Bugs fixed during testing: inverted `popupMinimized` click guard, `vp` → `victoryPoints` field name, missing space in console message.

#### Step 3 — Small Infrastructure Bundle ✅ Complete (2026-04-11)
Epic Mastermind toggle, unique henchmen `cards` array, `transformScheme()` helper + `hiddenFromSetup`, recruit-only fight cost, extra turn mechanism. All on `revelations` worktree branch.

### Block 2: Content (standard /new-expansion phases)

#### Phase 1: Card Data + Images ✅ Complete (2026-04-12)
#### Phase 2: Setup Screen ✅ Complete (2026-04-12)
#### Phase 3: Effects ✅ Complete (2026-04-12)
All heroes, villains, masterminds, schemes, henchmen, bystanders, and keywords implemented. Code review done, fixes applied.

Deferred stubs (expected no-ops during test): Photon, War Machine, Speed, Ronin, Scarlet Witch.

#### Phase 4: Validation — In Progress
- ✅ Expansion validator run (6 issues found, fixed 2026-04-12)
- ✅ JS syntax check passed
- 🔄 Guided test game — first playtest 2026-04-12, 9 issues found (see below)

## Phase 4 Playtest Results (2026-04-12)

First playtest using Mandarin + Earthquake Drains the Ocean scheme in Golden Solo mode.

### Tier 1 — Core Mechanics (game-breaking)
| ID | Issue | Root Cause |
|----|-------|-----------|
| 1A | Earthquake scheme not transforming, city stays at 5 spaces | `transformScheme()` swaps scheme but no city resize function exists |
| 1B | Klaw capture not functioning — "NO CAPTURED HERO TO GAIN" | `capturedHero` property lost when villain card cloned into city array |
| 1C | Mandarin attack modifiers missing (+1 Ring in city, -3 per Ring in VP) | `recalculateMastermindAttack()` has no Mandarin-specific logic |
| 1D | Locations enter city silently — no console announcement | `placeLocation()` uses `console.log()` instead of `onscreenConsole.log()` |

### Tier 2 — Player Choice UI (playable but wrong)
| ID | Issue | Affected Functions |
|----|-------|--------------------|
| 2A | KO from discard: blank popup, auto-picks cheapest (×3) | `mandarinRingIncandescence`, `brothersGrimmFight`, `warMachineHypersonicCannonSuper` |
| 2B | KO from discard: no popup, silent auto-KO (×2) | `sentryFight`, `grimReaperCultOfSkulls` |
| 2C | Mandarin Master Strike auto-picks Ring from VP | `mandarinMasterStrike` (normal + epic) |
| 2D | Other auto-pick effects (×2) | `mandarinRingRemaker`, `grimReaperMazeOfBones` |
| 2E | Partial KO stubs (×2) | `mandarinDragonOfHeavenSpaceship` (skipped), `...LocationFight` (KOs 1 not 2) |

### Tier 3 — Known Deferred
| ID | Issue | Status |
|----|-------|--------|
| 3A | Scarlet Witch Chaos Magic — no play option for revealed copy | Expected deferred stub |

**Fix plan:** `docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md` (inside worktree)
**Execution order:** 1D → 1C → 1B → 2A → 2B → 2C → 2D → 2E → 1A (most complex last)

## Key Decisions (from /analyze-expansion)

See `docs/expansion-mechanics/revelations.md` for full details.

| Decision | Choice |
|---|---|
| Epic Masterminds | Option B — single entry with `epic` sub-object + setup toggle |
| Mandarin's Rings | Option B — expandable henchman template with `cards` array |
| Dynamic City | Approach A — full refactor in isolated worktree |
| Korvac (Golden Solo) | Defeating Korvac initiates Final Showdown |
| Korvac (What If?) | Defeating Korvac wins the game |
| House of M hero count | Follow scheme requirements in all modes |
| Sentry Fight effect | Void-only (Bank/Streets) |
| Mandarin's Rings in What If? | Open — decide during implementation |
