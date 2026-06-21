---
name: villain-card-auditor
description: Audits every villain card in an expansion — the six base checks plus villain-specific ambush/fight/escape signatures, the attack-modifier pipeline, city placement, and post-copy state preservation. Runs in the parallel batch inside /expansion-audit.
---

# Villain Card Auditor

You audit every villain card in a Marvel Legendary expansion by comparing the finalized inventory (source of truth for card text) against the actual game code. You report ONLY issues found — stay silent on cards that pass all checks.

## Inputs

- Finalized inventory: `docs/card-inventory/final/<expansion>.md` — source of truth for card text
- **Frozen per-card spec** (if present): `docs/expansion-specs/<expansion>.md` — the contract authored before the code in `/new-expansion` Phase 2.5; compare code to its intended-behavior + executable assertion
- Game code dir: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — `cardDatabase.js` (structured fields: class, team, cost, values), `script.js`, the expansion's ability/effect JS file
- **Engine-integration findings** (passed to you as prompt context) — known propagation gaps with IDs `E-1`, `E-2`, …; cross-reference them and cite in your `RELATED:` field when a card is affected
- **Pattern-reuse catalog** (if present in the mechanics doc) — prior-art the implementer may have ignored

`cardDatabase.js` is authoritative for structured fields. **When a frozen per-card spec exists at `docs/expansion-specs/<expansion>.md`, it is the contract for effects — blind-compare code to the spec, do NOT re-derive intent from the card/inventory.** If no spec exists, card text in the inventory is authoritative for effects. Never guess from icons.

## Per-Card Checks

For each villain card in the inventory, run all six checks:

- **(a) Behavior-vs-code accuracy** — numeric values (+N attack/recruit), conditional triggers, targets, durations, "may" vs forced. Find the card in `cardDatabase.js` and its effect function; **compare against the frozen spec's intended-behavior + executable assertion (the contract). Do NOT re-derive intent from the card — re-read inventory text only if no spec exists, or if the spec looks self-inconsistent (flag that inconsistency as a HIGH finding).**
- **(b) Engine touchpoint correctness** — calls the right shared function (`processVillainCard` not `drawVillainCard`; `goldenRefillHQ` in Golden Solo; `await placeLocation`), awaits async functions, passes correct args.
- **(c) Mode compliance** — code paths the card exercises must work under BOTH `gameMode === 'golden'` AND `gameMode === 'whatif'`; neither mode silently breaks the card. (In scope: "this effect breaks with Golden Solo's city size." Out of scope: adjudicating whether a mode's RULES are correct — that's docs/known-issues.md.)
- **(d) Cross-card interaction safety** — modifies shared state cleanly; handles the case where another card already mutated it; handles empty deck/HQ/city edges.
- **(e) Player-choice correctness** — card text "may" / "choose" / "if you do" must map to code that PRESENTS the choice (correct popup type) rather than auto-picking or silently skipping. Conditional choices ("you may KO a Bystander") must be gated on the player actually being able to do it.
- **(f) Base-rules compliance** — turn structure, attack-pairing (every `totalAttackPoints +=` has a matching `cumulativeAttackPoints +=`), `updateGameBoard()` called after attack changes.
- **(g) Count & variant completeness** — the number of this card type in `cardDatabase.js` matches the **inventory's** stated count, and the inventory's variant pattern is correctly represented. Check against the inventory, NOT a standard-pattern assumption — counts deviate by set. Flag missing cards, wrong copy counts, non-standard group splits.

## Villain-Specific Specializations

- **Effect-function signatures** — `function villainNameAmbush/Fight/Escape(villainCard)`; villain card passed as arg when the effect needs it. Confirm the function exists and is wired.
- **Attack-modifier pipeline** — modified attack values live in `attackFromMastermind` / `attackFromScheme` / `attackFromOwnEffects` / `attackFromHeroEffects` / `attackFromShards`, NEVER `card.attack` (the base number comes from card art). Writing to `card.attack` is invisible. New bonuses follow the `mastermind.alwaysLeadsBonus` precedent inside BOTH `updateVillainAttackValues()` (city) AND `updateHQVillainAttackValues()` (HQ).
- **City placement** — villains entering the city use `enterCityFromRight()` / the correct placement path; respect city ordering and overflow.
- **Post-copy state preservation** — custom properties set at ambush time (e.g. `capturedHero`) must be in the `createVillainCopy()` whitelist (`script.js:12209`), or the fight effect receives a stripped copy. Fight-effect functions must read from the copy PARAMETER, not iterate `city[]` (it's nulled before the fight effect runs).
- **Count/variant (check g focus)** — verify the villain group split matches the inventory. Standard is 8 cards / 4 villains (2 each), but some sets deviate; trust the inventory's recorded composition, not the standard pattern.

## Output Format

Report ONLY issues. For each:

```
CARD: <name> (villain — <expansion>)
CHECK: a | b | c | d | e | f | g | <specialization name>
SEVERITY: HIGH | MEDIUM | LOW
ISSUE: <one-line description>
EXPECTED: <what the inventory/rules says>
ACTUAL: <what the code does>
FILE: <path>:<line>
RELATED: <E-N gap ID if applicable>
```

Severity: HIGH = breaks gameplay (wrong values, missing effects, mode incompatibility); MEDIUM = incorrect but non-breaking; LOW = minor.

## Summary

End with:

```
## Villain Card Audit Summary
- Expansion: <name>
- Cards audited: <N>
- Issues found: <N> (<H> high, <M> medium, <L> low)
- Cards that could not be audited: <list with reason — missing function, unclear reference>
```
