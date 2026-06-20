# Sweep Inbox — raw capture & staging

> **Status:** ACTIVE · created 2026-06-19 · the staging surface for `/legendary-sweep`.
> A holding pen for cross-expansion domain learnings pulled from session transcripts.

## What this file is

A **holding pen** for newly-noticed domain learnings — reusable code patterns, design/rules-decision precedents, in-session discoveries (bugs/corrections/gotchas), and recurring pre-flight gaps. Capture is cheap and append-only.

## What this file is NOT

**It is staging, not a recall surface.** Nothing here auto-loads into any session. An item protects against nothing until it is promoted out of this file to its canonical home. The inbox exists to be **drained toward empty**, not to accumulate.

## What this sweep is FOR (and not)

This sweep is deliberately narrow. Legendary already documents well — `/plans`, `/specs`, `expansion-mechanics/`, `expansion-progress/`, `known-issues.md`. The sweep does **not** duplicate those. It captures the two things those docs miss:

1. **Cross-expansion reuse memory** — the "we already solved this in expansion X, reuse the pattern/precedent" thread that no single per-expansion doc owns.
2. **In-session discoveries that never got written down** — bugs found while fixing, corrections made while testing, conventions established on the fly. These live in the transcript but evaporate from memory when a session is cleared.

## The three fates (every item ends as exactly one)

1. **Promoted** → graduates to its canonical home (see routing table) → **deleted from inbox.**
2. **Pruned** → not durable → **deleted from inbox.**
3. **Pending** → stays *only* until it earns a verdict.

A healthy inbox holds **only category 3** (+ `#pin`).

## Capture format

One line per item: a date, one tag, a one-line statement, optional detail.

```
- YYYY-MM-DD #tag — <one-line statement>. <optional detail / why it matters>.
```

**Tags:** `#pattern` (reusable code pattern / helper / recurring-bug rule) · `#decision` (rules-interpretation or design-decision precedent) · `#gotcha` (empirical in-session discovery not yet in any doc) · `#gap` (recurring deferred item / pre-flight gap spanning expansions). Add `#pin` as a second tag to mark an item **durable even if rare** (exempt from dwell-time pruning).

## Promotion targets (route each keeper)

Promotion is **consolidation, not addition** — refine the existing rule at the destination; never add a parallel second rule.

| Kind of learning | Canonical home |
|---|---|
| Reusable code pattern / helper / recurring-bug rule (`#pattern`, `#gotcha`) | project `CLAUDE.md` — Code Patterns / Gotchas section |
| Cross-expansion design/rules-decision precedent (`#decision`) | a note in `docs/expansion-mechanics/`; if precedents accumulate, flag a dedicated `docs/expansion-decisions.md` for Paul |
| Recurring pre-flight gap across expansions (`#gap`) | `docs/known-issues.md` (or a pre-flight checklist consumed by `/analyze-expansion` / `/new-expansion`) |
| Data / inventory convention | `docs/card-inventory/card-reading-rules.md` |
| CC/workflow meta-learning | **NOT here** → cc-helper's global `learning-sweep` |

---

## Capture log

<!-- Append new items below this line. Newest at top. Drain toward empty. -->

<!-- /legendary-sweep TRIAL run 2026-06-19 (Pass A only). Sessions: d881aa2e (2026-06-18), 9d6fa167 (2026-06-16) — Revelations Phase 4 playtest-fix work, worktree dir. Two workflow-flavored candidates (browser cache-bust hygiene, cascade-symptom debugging method) were dropped as out-of-lens (they route to global learning-sweep). Pass B NOT yet run — awaiting Paul's go. -->

- 2026-06-18 #gotcha — `koBonuses()` has ~80 callers (not ~30); the push-then-koBonuses ordering convention is violated only at `FightKOHeroYouHave`. Fix needs BOTH a universal empty-pile guard AND targeted push-first reordering at the anomaly site.
- 2026-06-18 #gotcha — Scarlet Witch villain cards carry `keywords: ["Dark Memories"]` (a hero superpower property) that leaked into `revelationsVillainOwnAttack()`; that function must gate on `attackFromScheme` vs own-keyword villains and exclude hero-typed keywords from the villain fight-cost pipeline. Any future hero-card-as-villain mechanic needs the same exclusion gate.
- 2026-06-18 #gotcha — `showPopup`'s Scheme Twist branch re-derives `selectedScheme` from the setup-screen DOM radio (always Side A), ignoring in-game transforms; correct source is `getActiveScheme()`. Any mechanic that transforms the active scheme then shows a popup must use `getActiveScheme()`, not a DOM read.
- 2026-06-18 #gotcha — `handleCardPlacement` hardcodes `playerDeck` and includes a playerDeck-only `stingOfTheSpider` side effect; reusing it on any other deck requires parameterizing the target deck and gating the side effect.
- 2026-06-18 #pattern — Villain-card-clone rule: state set on a villain card BEFORE it enters `city[]` lives on the pre-clone instance and survives only if the clone pipeline copies it. Validate new villain-card state fields survive the clone (`henchmen` flag survives via spread; function-based ambush state needn't, dispatched by function ref after city placement).
- 2026-06-18 #gotcha — `defeatLocation` never calls `defeatBonuses()` — correct for generic stronghold Locations, wrong for Henchman-Locations (HYDRA Base, `henchmen: true`). Gate on `locationCard.henchmen === true`, NOT the type field (which reads "Location").
- 2026-06-18 #pattern — `showCityAttackButton` and `showHQAttackButton` are parallel duplicates; a variable in scope for one (e.g. `usesRecruitToFight`) may not be in the other. Before editing a city-fight UI branch, check the HQ twin for the same variable or risk a reference error.
- 2026-06-18 #decision — Free-ordering helpers `chooseReturnOrderSingleRow` / `pickFromCardsSingleRow` are canonical for "return cards in any order" effects; for per-card TOP/BOTTOM placement, loop `pickFromCardsSingleRow` + `handleCardPlacement` per card. Reuse, don't rebuild custom UI.
- 2026-06-18 #decision — Superpower icon-count conditions (`conditionType: "playedCards"`): N entries = N OTHER cards before the bearer (engine excludes bearer via `cardsPlayedThisTurn.slice(0,-1)`); entry count = printed icon count directly, no off-by-one. Applies to all multi-icon superpower conditions.
- 2026-06-16 #gotcha — Local `escapedVillainsCount` const inside `checkEvilWins`/`updateEvilWinsTracker` shadows the global and filters only `type === "Villain"`, silently dropping HYDRA Base (`type: "Location"`, `subtype: "Henchman"`). Fix is `type === "Villain" || subtype === "Henchman"`, not switching to the global. Real Locations are never in `escapedVillainsDeck`.
- 2026-06-16 #pattern — Henchman subtype convention: most henchmen are DB-typed `"Villain"`; HYDRA Base is the only one typed `"Location"`; all get `subtype: "Henchman"` from `generateVillainDeck`. Any filter needing all henchmen should use `type === "Villain" || subtype === "Henchman"`.
- 2026-06-16 #gotcha — The display `switch` in `updateEvilWinsTracker` has no cases for "Earthquake Drains the Ocean" or "House of M" → they fall through to default "See Scheme" and never show a live counter. Any scheme with a numeric evil-wins threshold needs its own case here, not just logic in `checkEvilWins`.
- 2026-06-16 #decision — Superpower `conditionType: "None"` hits the `isConditionMet` default branch and returns false permanently — the ability never fires. Any superpower with a firing condition must use a non-None `conditionType`; "None" is a silent permanent-disable, not "unconditional."
