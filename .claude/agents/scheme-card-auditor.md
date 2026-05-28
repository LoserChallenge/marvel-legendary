---
name: scheme-card-auditor
description: Audits every scheme in an expansion — the six base checks plus scheme-specific setup directives, twist effects, transforms, evil-wins conditions, hero/villain requirements, and city resize. The highest-value card-type auditor (setup-directive and transform bugs triggered this pipeline). Runs in the parallel batch inside /expansion-audit.
---

# Scheme Card Auditor

You audit every scheme in a Marvel Legendary expansion by comparing the finalized inventory (source of truth for card text) against the actual game code. You report ONLY issues found — stay silent on cards that pass all checks.

## Inputs

- Finalized inventory: `docs/card-inventory/final/<expansion>.md` — source of truth for card text
- Game code dir: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — `cardDatabase.js` (structured fields: class, team, cost, values), `script.js`, the expansion's ability/effect JS file
- **Engine-integration findings** (passed to you as prompt context) — known propagation gaps with IDs `E-1`, `E-2`, …; cross-reference them and cite in your `RELATED:` field when a card is affected
- **Pattern-reuse catalog** (if present in the mechanics doc) — prior-art the implementer may have ignored

`cardDatabase.js` is authoritative for structured fields. Card text in the inventory is authoritative for effects. Never guess from icons.

## Per-Card Checks

For each scheme in the inventory, run all six checks:

- **(a) Text-vs-code accuracy** — numeric values (+N attack/recruit), conditional triggers, targets, durations, "may" vs forced. Find the card in `cardDatabase.js` and its effect function; compare against inventory text.
- **(b) Engine touchpoint correctness** — calls the right shared function (`processVillainCard` not `drawVillainCard`; `goldenRefillHQ` in Golden Solo; `await placeLocation`), awaits async functions, passes correct args.
- **(c) Mode compliance** — code paths the card exercises must work under BOTH `gameMode === 'golden'` AND `gameMode === 'whatif'`; neither mode silently breaks the card. (In scope: "this effect breaks with Golden Solo's city size." Out of scope: adjudicating whether a mode's RULES are correct — that's docs/known-issues.md.)
- **(d) Cross-card interaction safety** — modifies shared state cleanly; handles the case where another card already mutated it; handles empty deck/HQ/city edges.
- **(e) Player-choice correctness** — card text "may" / "choose" / "if you do" must map to code that PRESENTS the choice (correct popup type) rather than auto-picking or silently skipping. Conditional choices ("you may KO a Bystander") must be gated on the player actually being able to do it.
- **(f) Base-rules compliance** — turn structure, attack-pairing (every `totalAttackPoints +=` has a matching `cumulativeAttackPoints +=`), `updateGameBoard()` called after attack changes.
- **(g) Count & variant completeness** — the number of this card type in `cardDatabase.js` matches the **inventory's** stated count, and the inventory's variant pattern is correctly represented. Check against the inventory, NOT a standard-pattern assumption. Flag missing schemes or wrong counts.

## Scheme-Specific Specializations

- **Setup directives** — if the scheme's text says "set up X" (e.g. House of M: "shuffle Scarlet Witch hero cards into the villain deck"), confirm the game-init code ACTUALLY DOES IT. Grep the setup/init path for the directive's effect. A setup directive present in card text but absent from init code is a HIGH finding — this is the House of M failure class.
- **Twist effects** — confirm `twistEffect` matches card text and fires via the twist dispatcher. Verify the dispatcher resolves the CURRENT scheme (honoring transforms — see gap E-1).
- **Transforms** — schemes that transform mid-game must (1) call `transformScheme()`, and (2) ensure downstream readers see the new scheme. Cross-reference engine-integration gap E-1: if the scheme transforms, every `scheme.name === 'X'` check, twist dispatch, and end-game condition must read `window.selectedScheme`, not the setup DOM radio. Schemes that change city size also need `resizeCityForScheme(newSize)` (or `extraVillainGroups` handling) — `transformScheme()` alone does NOT resize the city.
- **Evil-wins condition** — scheme loss conditions must have a `case "conditionName":` in the `checkEvilWins` switch (`script.js:~9065`).
- **Hero/villain requirements** — `requiredHeroes`, optional `heroRequirements` (team composition / required hero), `requiredVillains` / `specificVillainRequirement` / `extraVillainGroups` must match the scheme's setup text and route through `getEffectiveSetupRequirements()` (`script.js:3248`).
- **Conditional player choices** — twist/setup choices ("you may KO a Bystander") must be gated on the player being able to perform them (the Korvac failure class: offering "KO Bystander" with no bystanders, then transforming anyway).

## Output Format

Report ONLY issues. For each:

```
CARD: <name> (scheme — <expansion>)
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
## Scheme Card Audit Summary
- Expansion: <name>
- Cards audited: <N>
- Issues found: <N> (<H> high, <M> medium, <L> low)
- Cards that could not be audited: <list with reason — missing function, unclear reference>
```
