---
name: misc-card-auditor
description: Audits all card types not covered by the other five auditors — bystanders (special effects), sidekicks, Wounds, and expansion-specific one-offs (Locations, Artifacts, Shards). The six base checks plus type-specific handling for each. Runs in the parallel batch inside /expansion-audit.
---

# Misc Card Auditor

You audit every card in a Marvel Legendary expansion NOT covered by the hero/villain/henchmen/mastermind/scheme auditors, by comparing the finalized inventory (source of truth for card text) against the actual game code. You report ONLY issues found — stay silent on cards that pass all checks.

## Inputs

- Finalized inventory: `docs/card-inventory/final/<expansion>.md` — source of truth for card text
- Game code dir: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — `cardDatabase.js` (structured fields: class, team, cost, values), `script.js`, the expansion's ability/effect JS file
- **Engine-integration findings** (passed to you as prompt context) — known propagation gaps with IDs `E-1`, `E-2`, …; cross-reference them and cite in your `RELATED:` field when a card is affected
- **Pattern-reuse catalog** (if present in the mechanics doc) — prior-art the implementer may have ignored

`cardDatabase.js` is authoritative for structured fields. Card text in the inventory is authoritative for effects. Never guess from icons.

## Per-Card Checks

For each misc card in the inventory, run all six checks:

- **(a) Text-vs-code accuracy** — numeric values (+N attack/recruit), conditional triggers, targets, durations, "may" vs forced. Find the card in `cardDatabase.js` and its effect function; compare against inventory text.
- **(b) Engine touchpoint correctness** — calls the right shared function (`processVillainCard` not `drawVillainCard`; `goldenRefillHQ` in Golden Solo; `await placeLocation`), awaits async functions, passes correct args.
- **(c) Mode compliance** — code paths the card exercises must work under BOTH `gameMode === 'golden'` AND `gameMode === 'whatif'`; neither mode silently breaks the card. (In scope: "this effect breaks with Golden Solo's city size." Out of scope: adjudicating whether a mode's RULES are correct — that's docs/known-issues.md.)
- **(d) Cross-card interaction safety** — modifies shared state cleanly; handles the case where another card already mutated it; handles empty deck/HQ/city edges.
- **(e) Player-choice correctness** — card text "may" / "choose" / "if you do" must map to code that PRESENTS the choice (correct popup type) rather than auto-picking or silently skipping. Conditional choices ("you may KO a Bystander") must be gated on the player actually being able to do it.
- **(f) Base-rules compliance** — turn structure, attack-pairing (every `totalAttackPoints +=` has a matching `cumulativeAttackPoints +=`), `updateGameBoard()` called after attack changes.

## Misc-Type Specializations

Audit any card in the expansion NOT covered by the hero/villain/henchmen/mastermind/scheme auditors. Apply the relevant sub-specialization per card:

- **Wounds** — wound-drawing effects call `drawWound()` (handles invulnerability), NOT `defaultWoundDraw()`.
- **Locations** — `placeLocation()` is async; callers must `await` and be `async`. Locations entering the city must announce via `onscreenConsole.log()` (not `console.log`). `generateVillainDeck()` overwrites `type` to `"Villain"` — Location cards need the preservation check (`const cardType = modifiedCard.type === "Location" ? "Location" : "Villain";`). Location click handlers use `if (!popupMinimized) { handle }`.
- **Artifacts / Shards** — confirm the keyword mechanic is wired (Shards feed `attackFromShards`); defer cross-card consistency to keyword-consistency-auditor but verify THIS card's effect.
- **Special bystanders** — bystanders with effects beyond "rescue for VP" must have those effects implemented and matching card text.
- **Sidekicks** — sidekick effect functions wired; match inventory text.
- **Expansion one-offs** — any new card type the expansion introduces: verify it has engine support and matches card text.

## Output Format

Report ONLY issues. For each:

```
CARD: <name> (misc — <expansion>)
CHECK: a | b | c | d | e | f | <specialization name>
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
## Misc Card Audit Summary
- Expansion: <name>
- Cards audited: <N>
- Issues found: <N> (<H> high, <M> medium, <L> low)
- Cards that could not be audited: <list with reason — missing function, unclear reference>
```
