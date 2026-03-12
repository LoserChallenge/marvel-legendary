# Golden Solo Compatibility Audit — Design Spec

**Date:** 2026-03-12
**Status:** Approved
**Project:** Marvel Legendary — Golden Solo Mode

---

## Background

Golden Solo Mode was added on top of an existing What If? Solo codebase. Card effect functions across all expansion files were written exclusively for What If? Solo and were never reviewed for compatibility with Golden Solo's distinct mechanics.

The Plutonium Scheme Twist bug (fixed 2026-03-12) is a confirmed example of this class of problem: `handlePlutoniumSchemeTwist` called `drawVillainCard()` — the full round entry point — instead of `processVillainCard()`, causing it to re-trigger HQ rotation, the bystander popup, and the full 2-card draw loop on every cascade. The fix was a one-line change, but the bug would not have been found without a playthrough.

This audit exists to find all remaining instances of this pattern before they are discovered through play.

---

## Goal

Produce a prioritised report of all card effect functions across all card files that may conflict with Golden Solo's rules. No code changes are made during the audit — the output is the report only.

---

## Scope

### Files to audit

| File | Lines | Contents |
|---|---|---|
| `cardAbilities.js` | 17,704 | Hero card effects — Core set |
| `cardAbilitiesDarkCity.js` | 16,972 | Hero card effects — Dark City expansion |
| `cardAbilitiesSidekicks.js` | 2,470 | Sidekick card effects |
| `expansionFantasticFour.js` | 5,851 | Fantastic Four expansion |
| `expansionGuardiansOfTheGalaxy.js` | 7,052 | Guardians of the Galaxy expansion |
| `expansionPaintTheTownRed.js` | 5,582 | Paint the Town Red expansion |

All files are at: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/`

### Golden Solo mechanics that could be affected

| Mechanic | Description |
|---|---|
| Villain draw count | Golden Solo draws exactly 2 villain cards per round (or 1 if a bystander is spent). Any card effect that calls `drawVillainCard()` directly re-runs the full round machinery. |
| HQ rotation | When a hero is recruited or KO'd, the new card fills the rightmost slot and all cards slide left. Effects that use fill-in-place HQ refill bypass this. |
| Bystander spend mechanic | At round start, the player may spend a bystander from the victory pile to reduce villain draws to 1. Effects that remove bystanders from the victory pile mid-round could interfere. |
| "Other player" targeting | Effects targeting "each other player" should apply to the top card of the hero deck in Golden Solo (KO it or cycle to bottom). Effects that assume a human second player will silently do nothing or error. |
| Player count scaling | Effects that scale with number of players (e.g. "draw a card for each other player") will produce wrong results in Golden Solo's effective 1-player context. |
| First-turn behaviour | Golden Solo skips HQ rotation on round 1 via `goldenFirstRound`. Effects that check `isFirstTurn` may conflict if they assume What If? Solo's turn-1 villain draw count of 3. |

---

## Approach

### Phase 1 — Pattern Search

Grep all 6 files for the following keyword groups to produce a map of suspect functions:

| Category | Search patterns |
|---|---|
| Villain draw calls | `drawVillainCard`, `processVillainCard`, `villainDeck.pop`, `villainDrawCount` |
| HQ manipulation | `refillHQ`, `addToHQ`, `fillHQ`, `hqSlot`, `heroHQ`, `goldenRefillHQ` |
| Bystander interactions | `bystander`, `victoryPile`, `rescuedBystander` |
| "Other player" targeting | `otherPlayer`, `other player`, `eachOther`, `each other player` |
| Player count scaling | `playerCount`, `numPlayers`, `players.length` |
| Game mode awareness | `gameMode` (to identify effects already handling Golden Solo) |
| First-turn assumptions | `isFirstTurn`, `firstTurn` |

Output: list of function names and line numbers per file.

### Phase 2 — Targeted Semantic Read

For each flagged function, read the full function body and classify into one of three severity buckets:

| Severity | Definition |
|---|---|
| **Confirmed Break** | Provably wrong in Golden Solo from code alone — bad behaviour is guaranteed regardless of game state |
| **Possible Conflict** | Suspicious code that may break depending on game state or card sequence — requires playtesting or human judgement to confirm |
| **Flagged / Probably Fine** | Matched a search pattern but appears safe on inspection — included for completeness |

**Execution:** Phase 1 runs sequentially (grep is fast). Phase 2 dispatches one codebase-navigator subagent per file in parallel, so all 6 files are analysed simultaneously.

---

## Report Format

Output: a single markdown file at `docs/golden-solo-compatibility-report.md`, committed to git.

Structure:

```
# Golden Solo Compatibility Report

## Summary
- X confirmed breaks
- Y possible conflicts
- Z flagged / probably fine

## Confirmed Breaks
### [Function name] — [File]:[Line]
**What it does:** plain English description
**Why it breaks:** specific conflict with Golden Solo mechanic
**Affected mechanic:** villain draw / HQ rotation / bystander / other player / player count

## Possible Conflicts
[same format]

## Flagged / Probably Fine
[same format]
```

---

## Out of Scope

- `script.js` — already reviewed during Golden Solo implementation
- Any changes to card effect code — report only, no fixes
- What If? Solo regressions — audit focuses on Golden Solo conflicts only
- New expansion content — only files listed in scope

---

## Success Criteria

- All 6 files searched with all pattern groups
- Every flagged function read and classified
- Report committed to git before any fix work begins
- No card effect code modified during the audit
