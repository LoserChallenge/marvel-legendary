# Expansion Audit Pipeline — Design

**Date:** 2026-05-28
**Status:** Approved — ready for implementation plan
**Trigger context:** Revelations Phase 4 verification surfaced multiple cascading bugs (`transformScheme` propagation gap, House of M setup directives not implemented, Korvac twist auto-picks impossible choices) that revealed structural gaps in the current single-pass audit approach. Decision: pause per-fix verification; build a systematic pre-merge audit pipeline first.

## Goal

Surface entire categories of expansion bugs proactively, before merge to master, rather than via playtest. Cover all card types, all engine integrations, and all cross-card interactions. Become part of `/new-expansion` as the standard gate.

## Architecture

Two integration points into the expansion workflow:

```
/analyze-expansion (final step)
    └── pattern-reuse-scout
            (output: prior-art catalog appended to mechanics ref doc → feeds implementer)

/new-expansion Phases 1–3 (data import, registration, effect implementation)

/new-expansion Phase 4 — Validation & Audit (expanded)
    /expansion-audit:
    ├── engine-integration-auditor   [sequential — output feeds card-type auditors via prompt context]
    ├── expansion-validator          [sequential — file-level rules, existing 7-rule check]
    ├── hero-card-auditor            ┐
    ├── villain-card-auditor         │
    ├── henchmen-card-auditor        │
    ├── mastermind-card-auditor      ├── parallel
    ├── scheme-card-auditor          │
    └── misc-card-auditor            ┘
            └── orchestrator consolidates → findings catalog → triage with Paul
```

**Why this shape:**
- `pattern-reuse-scout` runs at the end of `/analyze-expansion` so reuse happens *during* implementation, not as post-build rework. Its output is appended to the mechanics reference doc, which the implementer already reads in `/new-expansion` Phase 1.
- `engine-integration-auditor` runs first inside `/expansion-audit` because its output (known systemic gaps with IDs `E-1`, `E-2`, …) is passed as prompt context to each card-type auditor. They cross-reference it when checking each card and tag related findings.
- `expansion-validator` runs next because the 7 file-level rules are fast and orthogonal to card-level checks.
- The six card-type auditors run in parallel — independent contexts, no shared state — cutting wall time roughly 6×.
- The orchestrator (the `/expansion-audit` skill itself, not a separate subagent) merges all findings into one severity-tagged catalog so triage happens in one pass.

## Subagent Specs

### Card-type auditors (six)

All six share a base spec; each adds type-specific specializations.

**Inputs (each gets the slice for its type):**
- Finalized inventory file: `docs/card-inventory/final/<expansion>.md`
- Expansion JS file: `expansion<Name>.js`
- `cardDatabase.js`
- `script.js`
- `engine-integration-auditor` output — known systemic gaps with IDs
- `pattern-reuse-scout` output (if available) — prior-art that may have been ignored

**Per-card check list (all six run these):**

| Check | Description |
|---|---|
| (a) Text-vs-code accuracy | Numeric values, conditional triggers, targets, durations, "may" vs forced |
| (b) Engine touchpoint correctness | Calls right shared function, awaits async, passes correct args |
| (c) Mode compliance | Code paths exercised by the card must produce correct behavior under BOTH `gameMode === 'golden'` AND `gameMode === 'whatif'` — neither mode silently breaks the card. **In-scope example:** "this villain's ambush effect breaks if Golden Solo's 5-slot city is in play." **Out-of-scope example:** "is the Kree-Skrull War 1-group villain cap rule itself correct under What If? Solo" — that's a broader rules question for `docs/known-issues.md`. The auditor checks per-card behavior under whatever rules each mode currently enforces; it does not adjudicate the rules. |
| (d) Cross-card interaction safety | Modifies shared state cleanly; handles cases where another card already mutated it; empty-deck/HQ/city edges |
| (e) Player-choice correctness | "may"/"choose"/"if you do" → code presents the choice (right popup type) instead of auto-picking or silently skipping |
| (f) Base-rules compliance | Turn structure, twist dispatch, attack-pairing (`totalAttackPoints` + `cumulativeAttackPoints`), `updateGameBoard()` after attack changes |

**Type-specific specializations:**

| Auditor | Specialty |
|---|---|
| `hero-card-auditor` | Ability-function structure, async chains, `unconditionalAbility`/`conditionalAbility` wiring in DB, class/team correctness |
| `villain-card-auditor` | Ambush/fight/escape function signatures, attack-modifier pipeline (`attackFromMastermind`/`attackFromScheme`/`attackFromOwnEffects` fields — never `card.attack`), city placement, post-clone state preservation (city-copy ambush state) |
| `henchmen-card-auditor` | Fixed-attack patterns, `usesRecruitToFight` flag wiring, both `updateHighlights()` declarations patched in parallel |
| `mastermind-card-auditor` | Tactics order, `alwaysLeads` bonus, Epic overlay (runtime object-spread, `mastermind.name === 'Epic X'` detection), Master Strike effects, mastermind-name-exact-match in lookups |
| `scheme-card-auditor` | Setup directives (House of M case — does init code execute the setup?), twist effects, transforms (does `transformScheme` propagate to all readers?), evil-wins switch case, hero requirements wiring, city-resize for schemes that change city size |
| `misc-card-auditor` | Wounds (invulnerability), Locations (`placeLocation` async, `enterCityFromRight`, `generateVillainDeck` type-preservation), Artifacts/Shards, Bystander special effects, Sidekicks, any expansion-specific one-offs |

**Boundary clarification — `misc-card-auditor` vs `expansion-validator` overlap on Locations:** `expansion-validator` checks **file-level patterns** ("is any call site of `placeLocation()` missing `await`?"). `misc-card-auditor` checks **per-card behavior** ("does THIS specific Location card's effect work end-to-end when it enters the city?"). Both may touch the same engine function but from different angles. A finding from one is not redundant with the other.

**Henchmen as a separate auditor (justification):** Henchmen have small effect text but high cross-card interaction — they appear in nearly every villain deck composition, drive the `usesRecruitToFight` mechanic, depend on duplicate `updateHighlights()` declarations being patched in parallel, and have ambush effects that share patterns with villains but not signatures. Separating from `villain-card-auditor` lets each subagent stay focused on its pattern set and supports parallel dispatch. The cost is a tiny extra subagent file; the benefit is no mixed mental model.

**Output format (each subagent):**

```
CARD: <name> (<type> — <expansion>)
CHECK: <a-f>
SEVERITY: HIGH | MEDIUM | LOW
ISSUE: <one-line description>
EXPECTED: <what reference says>
ACTUAL: <what code does>
FILE: <path>:<line>
RELATED: <engine-integration finding ID if applicable>
```

Plus a summary footer: cards audited, issues found by severity, cards that could not be audited (missing function, unclear reference).

### Cross-cutting subagents (three)

**`pattern-reuse-scout`** — runs as the final step of `/analyze-expansion`
- **Input:** expansion mechanics reference doc (`docs/expansion-mechanics/<expansion>.md`) just produced by Steps 1–4 of `/analyze-expansion`
- **Process:** for each new mechanic listed, search codebase for existing implementations of the same/similar pattern
- **Output:** per-mechanic prior-art catalog appended to the mechanics doc under a fixed heading `## Prior Art & Reuse Candidates`. Implementer reads it in `/new-expansion` Phase 1. The catalog section is added to the canonical `/analyze-expansion` Step 4 document format (see Integration section) so format stays consistent across expansions — older expansion mechanics docs (e.g., Revelations) can be retroactively updated by running the scout against them, or left empty if not run. For each new mechanic: file:line pointers to existing implementations, a 1–2 sentence summary of how they work, recommendation (`REUSE: …` / `ADAPT: …` / `BUILD NEW (no precedent)`)
- **Example output line:** `MECHANIC: House of M — shuffle Scarlet Witch hero cards into villain deck. PRIOR ART: Secret Invasion of the Skrull Shapeshifters scheme (script.js:4287, 4633, 8084, 9999, 10078, 10221, 10300, 10453, 15663, 16079). RECOMMENDATION: REUSE — extract inject-heroes-into-villain-deck helper, parameterize on hero name, reuse for House of M.`

**`engine-integration-auditor`** — runs first inside `/expansion-audit`
- **Input:** the codebase + maintained engine-touchpoints reference file (`docs/audit-pipeline/engine-touchpoints.md` — see Supporting Artifacts below)
- **Process — two passes:**
  - **Pass 1 — Discovery:** scan the codebase for shared engine functions matching state-mutation patterns (functions that write to `window.*`, mutate top-level arrays like `city`, `hqCards`, `villainDeck`, or assign to global state). Compare against the touchpoints reference file. Any function discovered that's not in the reference is reported as **new touchpoint found — needs seeding**, with proposed entry text the subagent appends to the reference doc.
  - **Pass 2 — Verification:** for each engine function in the (now-updated) reference, identify (1) what state it mutates, (2) all readers of that state, (3) whether each reader pulls from the authoritative source or a stale source (e.g., `transformScheme` writes `window.selectedScheme` but readers query the DOM radio button → gap)
- **Output:** new-touchpoint list (with proposed reference-doc entries) + state-propagation gap list + engine-touchpoint misuse list, each gap finding tagged with an ID (`E-1`, `E-2`, …) that card-type auditors reference
- **Why two passes:** without discovery, the auditor can only find gaps in functions someone already documented. With discovery, new engine functions added in any expansion get caught the first time `/expansion-audit` runs against that expansion, and the reference doc grows organically.
- **Side benefit:** the engine-touchpoints reference file becomes a living doc of "how state flows in this game"

**`expansion-validator`** — existing subagent, no changes
- 7 file-level pattern rules (`drawVillainCard`, HQ fill-in-place, async chains, attack pairing, `updateGameBoard()`, DOM null guards, splash/init null guards). Already documented in `.claude/agents/expansion-validator.md`.

## Orchestrator Skill: `/expansion-audit`

**Behavior:**
1. Verify prerequisites:
   - Finalized inventory exists at `docs/card-inventory/final/<expansion>.md`
   - Expansion JS file exists
   - `cardDatabase.js` has the expansion's entries
   - Engine-touchpoints reference file exists at `docs/audit-pipeline/engine-touchpoints.md` (if absent, halt with the message "run engine-integration-auditor in bootstrap mode first" — the auditor's Pass 1 will seed the file)
2. Run `engine-integration-auditor` → capture output as input artifact (`<expansion>-engine-findings.md` in temp). If the auditor reports new touchpoints discovered, the reference doc is updated in-place before card-type auditors dispatch.
3. Run `expansion-validator` on the expansion JS → capture output
4. Parallel-dispatch the six card-type auditors. Each receives engine-integration findings (gap IDs `E-1`, `E-2`, …) and the pattern-reuse-scout catalog (if present in mechanics doc) as prompt context.
5. Consolidate all findings into `docs/audit-results/<expansion>-<YYYY-MM-DD>.md`
6. Report the catalog path back, suggest triage as next step

**Static-analysis constraint:** all auditors are static analysis only — they read files (inventory, code, reference docs) and grep/parse. No runtime execution, no `node --check`, no browser, no Playwright. The game is a static HTML/JS app and the auditors run in subagent contexts without Bash access to Node. Runtime verification belongs to `/game-test` (Playwright), invoked separately during triage if a finding needs in-browser confirmation.

**Triage workflow with Paul (after `/expansion-audit` completes):**
- Walk through HIGH findings in plain-English summaries — "card says X, code does Y, here's how it looks in play"
- Paul makes the gameplay call (is the finding actually wrong from a player perspective, or is the card text / reference what's stale?)
- Claude makes the technical call on fix approach
- Each finding tagged Fix Now / Defer / Reject
- MEDIUM and LOW go into a sweep pass after HIGH is resolved

## Consolidated Catalog Format

`docs/audit-results/<expansion>-<YYYY-MM-DD>.md`:

1. **Summary header** — expansion name, audit date, totals by severity (H/M/L), subagents run with pass/fail
2. **HIGH severity** — every HIGH finding, grouped by card (all issues for one card colocated)
3. **MEDIUM severity** — same grouping
4. **LOW severity** — same grouping
5. **Could not be audited** — cards needing manual review
6. **Pattern-reuse-scout output** (if appended for context) — for reference during triage

## Integration with Existing Skills

**`/analyze-expansion` — new final step (Step 5) AND template update:**
- After mechanics reference doc is produced (existing Steps 1–4), run `pattern-reuse-scout`
- Append prior-art catalog under a fixed `## Prior Art & Reuse Candidates` heading to the mechanics doc
- Update the canonical document format defined in `/analyze-expansion` Step 4 to include this section (between "Solo Mode Decisions" and "Open Questions"). New expansions that complete `/analyze-expansion` always emit the section (may be empty). Older mechanics docs are not retroactively edited unless the scout is re-run.
- Implementer reads catalog when consuming the mechanics doc during `/new-expansion` Phase 1; reuse decisions are made before code is written

**`/new-expansion` — Phase 4 (Validation & Testing) expanded:**
- Current Phase 4 already invokes `expansion-validator` as a single-pass check
- Expand to invoke `/expansion-audit` (which includes `expansion-validator` plus the seven additional subagents)
- Triage findings with Paul
- Resolve all HIGH findings or document deferrals
- Merge readiness gate: HIGH count = 0 OR every HIGH has a documented Defer rationale

## Retirements & Cleanups

- Delete `.claude/agents/card-effect-auditor.md` — superseded by six specialized card-type auditors
- Update root `CLAUDE.md` — Subagents section: replace `card-effect-auditor` entry with the eight new ones (or a pointer to this design doc)
- Update `MEMORY.md` entry `project_card_effect_auditor.md` to reflect the supersession
- Audit `audit-tracker` subagent for references to `card-effect-auditor`; update if any
- Old audit results file (`docs/card-effect-audit-results-2026-03-31.md`) stays as historical record, no changes

## Supporting Artifacts

**`docs/audit-pipeline/engine-touchpoints.md`** — new living reference doc. Lists each shared engine function with:
- Function name + file:line
- State it mutates (variable names, scope)
- Where readers consume that state
- Known propagation gaps (with IDs `E-1`, `E-2`, …)
- Patterns to follow when adding new readers/writers

Seed entries from this session's findings:
- `transformScheme()` (script.js:2139 area) → writes `window.selectedScheme` → readers include `getSelectedScheme()` at script.js:14051 (queries DOM radio — **GAP E-1**), and ~30 inline `getElementById('selected-scheme')` sites throughout `script.js`
- `processVillainCard()` → contracts and Golden Solo entry point
- `goldenRefillHQ()` → HQ rotation logic
- `placeLocation()` → async; readers must await
- `enterCityFromRight()` → city placement
- `recalculateVillainAttack()` → modifier pipeline (`attackFromMastermind` / `attackFromScheme` / `attackFromOwnEffects` / `attackFromHeroEffects` / `attackFromShards`)
- Twist dispatcher → which schemes' twist effects are dispatched, lookup mechanism
- `generateVillainDeck()` → overwrites `type` field; new types need preservation check

## Implementation Order

For the implementation plan (next step):

1. Create `docs/audit-pipeline/engine-touchpoints.md` with seed entries
2. Build `engine-integration-auditor` subagent (reads the reference doc, audits propagation)
3. Build `pattern-reuse-scout` subagent
4. Build the six card-type auditors (shared base, type-specific specializations)
5. Build the `/expansion-audit` orchestrator skill
6. Retire `card-effect-auditor`; update CLAUDE.md, memory, audit-tracker
7. Update `/analyze-expansion` — add Step 5 (pattern-reuse-scout invocation)
8. Update `/new-expansion` — expand Phase 4 to invoke `/expansion-audit` instead of just `expansion-validator`
9. Inaugural run: execute full pipeline on Revelations. **Known caveat:** Revelations is mid-fix (Tier 1 mostly resolved, Tier 2 partially started). The audit runs against current-state code, so the catalog will mix "real new findings" with "findings already known and in-progress." Triage with Paul includes cross-referencing existing fix plan (`docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md`) to dedupe.
10. Triage Revelations findings with Paul; resume Revelations fixes from the catalog

## Open Items Deferred to Implementation Plan

- Exact prompt text for each subagent definition file (`.claude/agents/*.md`)
- Exact orchestrator skill structure (`.claude/skills/expansion-audit/SKILL.md`)
- Whether engine-integration findings are stored persistently or per-audit-run
- Whether MEDIUM/LOW findings get auto-deferred or always-triaged

These are mechanical implementation decisions; the design above is sufficient to drive the plan.

## Non-Goals

- Not auditing What If? Solo rules beyond per-card mode compliance — the broader What If? Solo rule review (e.g., Kree-Skrull War villain count) stays in `docs/known-issues.md`
- Not building automated fix application — audit reports; humans (Claude + Paul) triage and apply
- Not auditing UI/visual presentation of cards — text-vs-code only
- Not changing the existing inventory pipeline (`/inventory-creator`, `/inventory-verifier`) — they remain the source-of-truth feeders
