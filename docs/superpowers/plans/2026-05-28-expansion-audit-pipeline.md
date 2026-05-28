# Expansion Audit Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pre-merge audit pipeline of nine subagents plus an orchestrator skill that surfaces entire categories of Marvel Legendary expansion bugs (card-text mismatches, engine-integration gaps, keyword inconsistency, mode-compatibility breaks, missed pattern reuse) before merge to master, replacing the single-pass `card-effect-auditor`.

**Architecture:** Subagent definition files (`.claude/agents/*.md`) are prompt artifacts, not code — each is a self-contained Markdown file with YAML frontmatter (`name`, `description`) and a prompt body. The orchestrator is a skill (`.claude/skills/expansion-audit/SKILL.md`) that dispatches the subagents and consolidates their findings. A living reference doc (`docs/audit-pipeline/engine-touchpoints.md`) feeds the engine-integration auditor. All auditors are static-analysis only (read + grep, no runtime). Built in dependency order: reference doc → cross-cutting auditors → card-type auditors → orchestrator → integration into existing skills → inaugural run on Revelations.

**Tech Stack:** Markdown + YAML frontmatter (Claude Code subagent/skill format). No build step, no test framework — verification is structural self-check per artifact plus a full dispatch run against Revelations at the end. All paths relative to the worktree root: `D:\Games\Digital\Marvel Legendary\Claude Code\marvel-legendary\.worktrees\revelations\`.

**Spec:** `docs/superpowers/specs/2026-05-28-expansion-audit-pipeline-design.md`

---

## Conventions used throughout this plan

- **"Game code dir"** = `Legendary-Solo-Play-main/Legendary-Solo-Play-main/` (where `script.js`, `cardDatabase.js`, `expansion*.js`, `cardAbilities*.js` live).
- **Subagent file format**: every `.claude/agents/<name>.md` starts with YAML frontmatter:
  ```
  ---
  name: <exact-name-matching-filename-without-.md>
  description: <one paragraph; this is what the orchestrator and humans see in the menu>
  ---
  ```
  followed by the prompt body.
- **Subagent output contract (shared by all auditors)** — every finding is one block:
  ```
  CARD: <name> (<type> — <expansion>)        [or KEYWORD:/TOUCHPOINT:/MECHANIC: for non-card auditors]
  CHECK: <which check produced this>
  SEVERITY: HIGH | MEDIUM | LOW
  ISSUE: <one-line description>
  EXPECTED: <what the reference/rules says>
  ACTUAL: <what the code does>
  FILE: <path>:<line>
  RELATED: <engine-integration gap ID, e.g. E-1, if applicable>
  ```
  Severity guide: HIGH = breaks gameplay (wrong values, missing effects, mode incompatibility, missing keyword implementation); MEDIUM = incorrect but non-breaking (cosmetic text mismatch, unhandled edge case); LOW = minor (naming, redundant check).
- **Commit after every task.** Commit messages end with the Co-Authored-By trailer used elsewhere on this branch.
- **No runtime execution in any auditor** — they read files and grep. `node --check` is unavailable (node not on Bash PATH); the JS syntax hook covers that separately.

---

## Task 1: Engine-touchpoints reference doc

This is the living "how state flows in this game" doc that `engine-integration-auditor` reads in its Pass 2. Seed it from the spec's known touchpoints.

**Files:**
- Create: `docs/audit-pipeline/engine-touchpoints.md`

- [ ] **Step 1: Create the reference doc with seed entries**

Create `docs/audit-pipeline/engine-touchpoints.md` with this exact content:

```markdown
# Engine Touchpoints Reference

Living catalog of shared engine functions in `script.js` (and expansion files) that mutate game state, who reads that state, and known propagation gaps. Read by `engine-integration-auditor` (Pass 2). Grown over time — Pass 1 of that auditor appends newly discovered touchpoints here.

**Gap ID scheme:** propagation gaps are tagged `E-1`, `E-2`, … and referenced by card-type auditors in their `RELATED:` field.

---

## Touchpoint format

Each entry:
- **Function** — name + file:line
- **Mutates** — what state it writes (variable names, scope)
- **Readers** — where that state is consumed
- **Gaps** — known propagation problems (with IDs), or "none known"
- **Pattern note** — how to correctly add new readers/writers

---

## Touchpoints

### transformScheme()
- **Function:** `transformScheme()` — `script.js` (~line 2139)
- **Mutates:** `window.selectedScheme` (global), `#scheme-place img.card-image` src, scheme name display
- **Readers:** `getSelectedScheme()` at `script.js:~14051` (queries the setup-screen DOM radio button, NOT `window.selectedScheme`); ~30 inline `document.getElementById` scheme-radio reads scattered through `script.js`; twist dispatcher; `checkEvilWins`
- **Gaps:**
  - **E-1** — `getSelectedScheme()` and inline radio reads pull the ORIGINAL scheme after a transform, because they read the setup DOM radio which never changes. `transformScheme()` updates only `window.selectedScheme`. Result: post-transform, twist effects, `scheme.name === 'X'` checks, and end-game conditions all key off the pre-transform scheme. Fix direction: make `getSelectedScheme()` prefer `window.selectedScheme` when set, then audit inline radio reads.
- **Pattern note:** any code that must track "current scheme" across transforms reads `window.selectedScheme` (lazy-init it from the DOM radio on first use). Never read the setup radio directly during transformed gameplay.

### processVillainCard()
- **Function:** `processVillainCard()` — `script.js`
- **Mutates:** villain deck draw position, city, HQ (via Golden Solo round logic), bystander state
- **Readers:** all mid-turn villain-draw effects must route through this, NOT `drawVillainCard()` (which triggers a full Golden Solo round: bystander popup, 2-card draw, HQ rotation)
- **Gaps:** none known
- **Pattern note:** card effects that draw from the villain deck mid-turn call `processVillainCard()`. `drawVillainCard()` is reserved for the round-start sequence in `onBeginGame()` / round loop.

### goldenRefillHQ()
- **Function:** `goldenRefillHQ(index)` — `script.js`
- **Mutates:** `hqCards[]` via rotation (new card rightmost, others slide left)
- **Readers:** any HQ modification in Golden Solo mode
- **Gaps:** none known
- **Pattern note:** in Golden Solo, never assign `hqCards[i] = newCard` directly — wrap: `if (gameMode === 'golden') { goldenRefillHQ(i); } else { hqCards[i] = newCard; }`

### placeLocation()
- **Function:** `placeLocation()` — `script.js:584` (async)
- **Mutates:** city array (adds a Location card), city size on overflow
- **Readers:** expansion functions placing Locations
- **Gaps:** none known
- **Pattern note:** `await placeLocation(...)` and declare the caller `async`. Missing `await` causes a race when the city is full (overflow popup fires-and-forgets before the player chooses).

### enterCityFromRight()
- **Function:** `enterCityFromRight()` — `script.js`
- **Mutates:** city array (villain placement)
- **Readers:** villain entry logic
- **Gaps:** none known
- **Pattern note:** use for villains entering the city from the deck side; respects city ordering.

### recalculateVillainAttack() / updateVillainAttackValues() / updateHQVillainAttackValues()
- **Function:** `recalculateVillainAttack()` — `script.js:11706`; `updateVillainAttackValues()` (city, ~line 9921); `updateHQVillainAttackValues()` (HQ, ~line 10137)
- **Mutates:** reads modifier fields `attackFromMastermind` / `attackFromScheme` / `attackFromOwnEffects` / `attackFromHeroEffects` / `attackFromShards`; computes display + fight cost
- **Readers:** fight-cost calc, the attack overlay at `script.js:~8533` (conditional: only drawn if `totalAttackModifiers !== 0`)
- **Gaps:** none known, but **DUPLICATE-FUNCTION HAZARD** — city and HQ versions must be patched in parallel
- **Pattern note:** villain attack bonuses go into the modifier fields, NEVER `card.attack` (the base number comes from card art). New bonuses follow the `mastermind.alwaysLeadsBonus` precedent at `script.js:9937` inside `updateVillainAttackValues()` AND `updateHQVillainAttackValues()`.

### Twist dispatcher
- **Function:** scheme twist dispatch — `script.js` (locate via `twistEffect` references)
- **Mutates:** depends on scheme; routes a drawn Scheme Twist to the active scheme's `twistEffect`
- **Readers:** the active scheme (determined by current-scheme lookup — see E-1, transforms break this)
- **Gaps:** inherits **E-1** — after a transform, the dispatcher may fire the original scheme's twist if it reads the DOM radio rather than `window.selectedScheme`
- **Pattern note:** twist dispatch must resolve the *current* scheme, honoring transforms.

### generateVillainDeck()
- **Function:** `generateVillainDeck()` — `script.js`
- **Mutates:** overwrites every card's `type` field to `"Villain"`
- **Readers:** deck-build; card-type-dependent logic downstream
- **Gaps:** new card types (e.g. Location) are clobbered unless preserved
- **Pattern note:** preserve non-Villain types: `const cardType = modifiedCard.type === "Location" ? "Location" : "Villain";`

### updateHighlights()
- **Function:** TWO `function updateHighlights()` declarations in `script.js` (second overwrites first in JS)
- **Mutates:** city/HQ villain affordability + fight-button highlight state; gates on `usesRecruitToFight`
- **Readers:** fight UI
- **Gaps:** **DUPLICATE-FUNCTION HAZARD** — both declarations must stay in sync
- **Pattern note:** when changing affordability or fight-button logic, grep for ALL `updateHighlights` definitions and patch both.

### createVillainCopy()
- **Function:** `createVillainCopy()` — `script.js:12209` (hand-rolled whitelist copier)
- **Mutates:** produces the villain copy passed to fight-effect functions; `city[cityIndex]` is nulled before the fight effect runs
- **Readers:** `defeatVillain()` → fight-effect functions receive the copy as a parameter
- **Gaps:** custom state added at ambush time (e.g. `capturedHero`) is DROPPED unless added to the whitelist
- **Pattern note:** any custom property set on a city villain at ambush time must be added to the `createVillainCopy()` whitelist (array pattern: `bystander: [...(villainCard.bystander || [])]`). Fight-effect functions read from the copy parameter, NOT by iterating `city[]` (it's nulled).
```

- [ ] **Step 2: Verify the doc is readable and well-formed**

Run: read the file back and confirm it contains the `## Touchpoints` heading and at least the `transformScheme()` / `E-1` entry.
Expected: file exists, E-1 gap is documented, gap-ID scheme explained.

- [ ] **Step 3: Commit**

```bash
git add docs/audit-pipeline/engine-touchpoints.md
git commit -m "$(cat <<'EOF'
Add engine-touchpoints reference doc for audit pipeline

Living catalog of shared engine functions, their state mutations, readers, and
known propagation gaps (seeded with E-1 transformScheme). Read by
engine-integration-auditor Pass 2; grown by its Pass 1 discovery.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: engine-integration-auditor subagent

Catches state-propagation gaps (the `transformScheme` → stale-reader family) and discovers new engine touchpoints. Two passes: discovery + verification.

**Files:**
- Create: `.claude/agents/engine-integration-auditor.md`

- [ ] **Step 1: Write the subagent definition file**

Create `.claude/agents/engine-integration-auditor.md` with this exact content:

```markdown
---
name: engine-integration-auditor
description: Audits how an expansion's code integrates with shared engine functions in script.js. Discovers undocumented engine touchpoints and finds state-propagation gaps (state written by one function but read from a stale source by another). Runs first inside /expansion-audit; its gap IDs feed the card-type auditors. Use when auditing an expansion before merge.
---

# Engine Integration Auditor

You audit how a Marvel Legendary expansion's code interacts with the shared game engine in `script.js`. You find two classes of problem: (1) **new engine touchpoints** not yet documented, and (2) **state-propagation gaps** — where one function writes game state but another reads it from a stale or wrong source.

You report ONLY problems. Stay silent on touchpoints that propagate state correctly.

## Inputs

- Game code dir: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — `script.js`, `cardDatabase.js`, `expansion<Name>.js`, `cardAbilities*.js`
- Reference doc: `docs/audit-pipeline/engine-touchpoints.md` — the maintained catalog of known touchpoints and gaps

You will be told which expansion to audit.

## Pass 1 — Discovery

Scan the codebase for shared engine functions that mutate game state but are NOT in the reference doc. Patterns that signal a state-mutating touchpoint:
- Assignments to `window.*` globals
- Mutation of top-level game arrays: `city`, `hqCards`, `villainDeck`, `heroDeck`, `koPile`, `bystanders`
- Functions whose name implies state change: `transform*`, `place*`, `refill*`, `generate*`, `recalculate*`, `update*Values`, `enterCity*`, `*Copy`
- Functions assigned to `window.<name>` (cross-module shared state)

For each candidate NOT already in `engine-touchpoints.md`, output a **NEW TOUCHPOINT** finding with a proposed reference-doc entry (Function / Mutates / Readers / Gaps / Pattern note), and append that entry to `docs/audit-pipeline/engine-touchpoints.md` under `## Touchpoints`.

## Pass 2 — Verification

For each engine function in the (now-updated) reference doc, trace:
1. **What state it mutates** (confirm against current code — line numbers drift)
2. **All readers of that state** — grep the codebase for reads of the same variable/DOM element
3. **Whether each reader pulls from the authoritative source or a stale one.** The canonical failure: a writer updates `window.selectedScheme` but a reader queries the setup-screen DOM radio (`getSelectedScheme()` / inline `getElementById`), so the reader sees pre-transform state.

Pay special attention to:
- **Transform/mode-switch propagation** — after `transformScheme()` (or any state that changes mid-game), do all downstream readers see the new value?
- **Duplicate-function hazards** — `updateHighlights()`, `updateVillainAttackValues()`/`updateHQVillainAttackValues()` exist in pairs; confirm both are consistent.
- **Async propagation** — `placeLocation()` is async; confirm callers await.

## Output Format

Report ONLY problems. For each:

```
TOUCHPOINT: <function name>
TYPE: NEW TOUCHPOINT | PROPAGATION GAP | DUPLICATE-FN MISMATCH | ASYNC GAP
GAP ID: <E-N, assign the next free ID for propagation gaps; omit for NEW TOUCHPOINT>
SEVERITY: HIGH | MEDIUM | LOW
ISSUE: <what's wrong>
WRITER: <function/file:line that mutates the state>
STALE READER: <function/file:line that reads the wrong source>
FIX DIRECTION: <one line>
```

For NEW TOUCHPOINT findings, also include the proposed reference-doc entry text and confirm you appended it.

## Summary

End with:

```
## Engine Integration Audit Summary
- Expansion: <name>
- New touchpoints discovered: <N> (appended to engine-touchpoints.md)
- Propagation gaps found: <N> (IDs: E-x, E-y, …)
- Duplicate-fn / async issues: <N>
```

The gap IDs you assign are consumed by the card-type auditors — assign them deterministically (next free integer after the highest existing E-N in the reference doc).
```

- [ ] **Step 2: Structural self-check**

Read the file back. Confirm: frontmatter `name: engine-integration-auditor` matches filename; both Pass 1 and Pass 2 are present; output format block present; the spec's two-pass requirement (discovery + verification) is captured; gap-ID assignment rule is stated.
Expected: all present.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/engine-integration-auditor.md
git commit -m "$(cat <<'EOF'
Add engine-integration-auditor subagent

Two-pass auditor: Pass 1 discovers undocumented engine touchpoints and appends
them to the reference doc; Pass 2 traces state-propagation gaps (writer updates
one source, reader pulls a stale one — the transformScheme/DOM-radio family).
Assigns E-N gap IDs consumed by card-type auditors.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: pattern-reuse-scout subagent

Finds existing implementations of a new mechanic so the implementer reuses rather than reinvents. Runs at the end of `/analyze-expansion`.

**Files:**
- Create: `.claude/agents/pattern-reuse-scout.md`

- [ ] **Step 1: Write the subagent definition file**

Create `.claude/agents/pattern-reuse-scout.md` with this exact content:

```markdown
---
name: pattern-reuse-scout
description: For each new mechanic an expansion introduces, scans the codebase for existing implementations of the same or similar pattern, so the implementer reuses proven code instead of reinventing it. Runs as the final step of /analyze-expansion; appends a Prior Art & Reuse Candidates section to the mechanics reference doc. Use after the mechanics doc is drafted, before implementation begins.
---

# Pattern Reuse Scout

You prevent reinvention. For each new mechanic a Marvel Legendary expansion introduces, you find where the codebase ALREADY implements that same pattern (possibly under a different card's name), so the implementer extends proven code instead of writing it from scratch.

## Inputs

- Mechanics reference doc: `docs/expansion-mechanics/<expansion>.md` (just produced by /analyze-expansion Steps 1–4 — read its Keywords, New Card Types, New Game Systems sections)
- Game code dir: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — all `script.js`, `cardDatabase.js`, `expansion*.js`, `cardAbilities*.js`

## Process

For each mechanic listed in the mechanics doc:
1. Characterize the mechanic in implementation terms ("shuffle specific hero cards into the villain deck", "transform a scheme mid-game", "capture a hero onto a villain", "fixed recruit-only fight cost", "extra villain group", "city resize").
2. Search the codebase for existing implementations of that same shape — grep for the behavior, not the card name. Look across all expansion files and `script.js`.
3. Classify the result:
   - **REUSE** — an existing implementation does essentially the same thing; extract/parameterize and reuse.
   - **ADAPT** — a near-match exists; adapt it with modifications.
   - **BUILD NEW** — no precedent in the codebase.

## Output Format

Append a section to `docs/expansion-mechanics/<expansion>.md` under the exact heading `## Prior Art & Reuse Candidates`. One entry per mechanic:

```
MECHANIC: <name> — <one-line implementation characterization>
PRIOR ART: <existing scheme/card/function names with file:line pointers, or "none found">
HOW IT WORKS: <1–2 sentences on how the existing implementation works>
RECOMMENDATION: REUSE — <what to extract/parameterize> | ADAPT — <what to change> | BUILD NEW (no precedent)
```

### Worked example (the canonical case this scout exists to catch)

```
MECHANIC: House of M — shuffle Scarlet Witch hero cards into the villain deck
PRIOR ART: Secret Invasion of the Skrull Shapeshifters scheme (script.js:4287, 4633, 8084, 9999, 10078, 10221, 10300, 10453, 15663, 16079)
HOW IT WORKS: Skrull Shapeshifters injects designated hero cards into the villain deck at setup and handles them as villain-deck entries during play.
RECOMMENDATION: REUSE — extract the inject-heroes-into-villain-deck logic into a helper parameterized on hero name; call it for House of M with Scarlet Witch.
```

## Notes

- Be thorough on the search — the whole value is finding prior art the implementer wouldn't know existed. Grep multiple phrasings of each behavior.
- If a mechanic genuinely has no precedent, say so explicitly (BUILD NEW) — that's a useful signal too.
- Do not write implementation code. You produce pointers and recommendations only.
```

- [ ] **Step 2: Structural self-check**

Read the file back. Confirm: frontmatter name matches filename; the REUSE/ADAPT/BUILD NEW classification is present; the output appends under the exact heading `## Prior Art & Reuse Candidates` (must match what Task 13 adds to the /analyze-expansion template); the House of M worked example is included.
Expected: all present, heading string matches exactly.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/pattern-reuse-scout.md
git commit -m "$(cat <<'EOF'
Add pattern-reuse-scout subagent

For each new mechanic, finds existing codebase implementations of the same
pattern (REUSE/ADAPT/BUILD NEW) so the implementer extends proven code instead
of reinventing. Appends a Prior Art & Reuse Candidates section to the mechanics
doc. Runs at the end of /analyze-expansion.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: keyword-consistency-auditor subagent

Verifies each keyword is implemented once, correctly, and consistently across every card type that references it. Absorbs the retired card-effect-auditor's Layer 4.

**Files:**
- Create: `.claude/agents/keyword-consistency-auditor.md`

- [ ] **Step 1: Write the subagent definition file**

Create `.claude/agents/keyword-consistency-auditor.md` with this exact content:

```markdown
---
name: keyword-consistency-auditor
description: Audits keyword/mechanic consistency across an expansion. Keywords (Bribe, Focus, Shards, Teleport, etc.) span every card type, so per-card-type auditors can't see whether a keyword is implemented once, correctly, and consistently everywhere it appears. Checks implemented-at-all, consistent-across-types, and correct-scoping. Runs in the parallel batch inside /expansion-audit. Use when auditing an expansion before merge.
---

# Keyword Consistency Auditor

Keywords in Marvel Legendary are cross-cutting RULES, not card types. The same keyword (Bribe, Teleport, Focus, Shards, Artifacts, Versatile, Feast, Wall-crawl, and each expansion's new ones) can appear on heroes, villains, henchmen, schemes, and masterminds. You verify each keyword is implemented once, correctly, and behaves consistently everywhere it appears. The per-card-type auditors check whether an individual card's keyword effect fires; YOU check the shared rule and cross-type consistency.

You report ONLY problems.

## Inputs

- Mechanics reference doc: `docs/expansion-mechanics/<expansion>.md` — read its Keywords section for the expansion's new keywords and their rules definitions
- Finalized inventory: `docs/card-inventory/final/<expansion>.md` — card text showing which cards reference which keywords
- Game code dir: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — `cardDatabase.js`, `script.js`, ability/expansion JS

## Process

1. **Enumerate keywords.** From the mechanics doc's Keywords section plus any keyword tokens appearing in card text in the inventory, build the list of keywords this expansion's cards reference (both new keywords and pre-existing ones the expansion reuses).
2. **Locate each keyword's core rule.** Find the single place in code where the keyword's mechanic is defined/handled (e.g., where Bribe lets a recruit value pay a fight cost; where Focus is granted/spent).
3. **Check IMPLEMENTED-AT-ALL.** If a keyword is referenced in card text but has no engine support anywhere → HIGH finding (missing implementation).
4. **Check CONSISTENT-ACROSS-TYPES.** For keywords appearing on more than one card type, confirm every card routes through the same shared handler / equivalent logic. Flag divergent or duplicated implementations (e.g., hero-Focus and villain-Focus computed differently) → finding.
5. **Check CORRECT-SCOPING.** Confirm expansion-specific keywords don't unintentionally activate for other expansions' cards, and aren't globally hardcoded when they should be conditional → finding.

## Output Format

Report ONLY problems. For each:

```
KEYWORD: <keyword name>
CHECK: IMPLEMENTED-AT-ALL | CONSISTENT-ACROSS-TYPES | CORRECT-SCOPING
SEVERITY: HIGH | MEDIUM | LOW
ISSUE: <what's wrong>
EXPECTED: <what the keyword rule says>
ACTUAL: <what the code does>
AFFECTED CARDS: <list of cards referencing this keyword>
FILE: <path>:<line> (core rule location and/or divergent sites)
```

## Summary

End with:

```
## Keyword Consistency Audit Summary
- Expansion: <name>
- Keywords audited: <N> (<list>)
- Missing implementations: <N>
- Cross-type inconsistencies: <N>
- Scoping issues: <N>
```

Boundary with card-type auditors: they confirm "this card's keyword effect produces the right result"; you confirm "the keyword is defined once and shared consistently." Overlap is intentional — different failure modes.
```

- [ ] **Step 2: Structural self-check**

Read the file back. Confirm: frontmatter name matches filename; all three checks (IMPLEMENTED-AT-ALL, CONSISTENT-ACROSS-TYPES, CORRECT-SCOPING) present; output format block present; boundary-vs-card-type-auditors note present.
Expected: all present.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/keyword-consistency-auditor.md
git commit -m "$(cat <<'EOF'
Add keyword-consistency-auditor subagent

Cross-cutting auditor for keyword/mechanic consistency. Checks each keyword is
implemented at all, behaves consistently across every card type that references
it, and is correctly scoped. Absorbs the retired card-effect-auditor's Layer 4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Card-type auditor BASE TEMPLATE (used by Tasks 5–10)

All six card-type auditors share this prompt body. Each task below provides the file's frontmatter and a **Type-Specific Specializations** section that is inserted at the marked point. Everything else is identical. The complete base body is given here ONCE; each task references "the BASE BODY" and supplies only its frontmatter + specialization block. (This is deliberate DRY for a genuinely identical shared template — the executing agent assembles each file as: frontmatter + BASE BODY with the task's specialization block spliced into the `<!-- TYPE-SPECIFIC SPECIALIZATIONS -->` marker.)

**BASE BODY:**

```markdown
# <Title> Card Auditor

You audit every <TYPE> card in a Marvel Legendary expansion by comparing the finalized inventory (source of truth for card text) against the actual game code. You report ONLY issues found — stay silent on cards that pass all checks.

## Inputs

- Finalized inventory: `docs/card-inventory/final/<expansion>.md` — source of truth for card text
- Game code dir: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — `cardDatabase.js` (structured fields: class, team, cost, values), `script.js`, the expansion's ability/effect JS file
- **Engine-integration findings** (passed to you as prompt context) — known propagation gaps with IDs `E-1`, `E-2`, …; cross-reference them and cite in your `RELATED:` field when a card is affected
- **Pattern-reuse catalog** (if present in the mechanics doc) — prior-art the implementer may have ignored

`cardDatabase.js` is authoritative for structured fields. Card text in the inventory is authoritative for effects. Never guess from icons.

## Per-Card Checks

For each <TYPE> card in the inventory, run all six checks:

- **(a) Text-vs-code accuracy** — numeric values (+N attack/recruit), conditional triggers, targets, durations, "may" vs forced. Find the card in `cardDatabase.js` and its effect function; compare against inventory text.
- **(b) Engine touchpoint correctness** — calls the right shared function (`processVillainCard` not `drawVillainCard`; `goldenRefillHQ` in Golden Solo; `await placeLocation`), awaits async functions, passes correct args.
- **(c) Mode compliance** — code paths the card exercises must work under BOTH `gameMode === 'golden'` AND `gameMode === 'whatif'`; neither mode silently breaks the card. (In scope: "this effect breaks with Golden Solo's city size." Out of scope: adjudicating whether a mode's RULES are correct — that's docs/known-issues.md.)
- **(d) Cross-card interaction safety** — modifies shared state cleanly; handles the case where another card already mutated it; handles empty deck/HQ/city edges.
- **(e) Player-choice correctness** — card text "may" / "choose" / "if you do" must map to code that PRESENTS the choice (correct popup type) rather than auto-picking or silently skipping. Conditional choices ("you may KO a Bystander") must be gated on the player actually being able to do it.
- **(f) Base-rules compliance** — turn structure, attack-pairing (every `totalAttackPoints +=` has a matching `cumulativeAttackPoints +=`), `updateGameBoard()` called after attack changes.
- **(g) Count & variant completeness** — the number of this card type in `cardDatabase.js` matches the **inventory's** stated count, and the inventory's variant pattern is correctly represented. Check against the inventory, NOT a standard-pattern assumption — counts deviate by set (most sets: 8 villain cards / 4 villains = 2 each; most henchmen: 10 identical copies — but exceptions exist, e.g. Ten Rings = 10 unique cards). Flag missing cards, wrong copy counts, unique-vs-duplicate mismatches, non-standard group splits.

<!-- TYPE-SPECIFIC SPECIALIZATIONS -->

## Output Format

Report ONLY issues. For each:

```
CARD: <name> (<TYPE> — <expansion>)
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
## <TYPE> Card Audit Summary
- Expansion: <name>
- Cards audited: <N>
- Issues found: <N> (<H> high, <M> medium, <L> low)
- Cards that could not be audited: <list with reason — missing function, unclear reference>
```
```

---

## Task 5: hero-card-auditor subagent

**Files:**
- Create: `.claude/agents/hero-card-auditor.md`

- [ ] **Step 1: Write the file**

Assemble `.claude/agents/hero-card-auditor.md` as: this frontmatter + the BASE BODY with `<Title>`→`Hero`, `<TYPE>`→`hero`, and this specialization block spliced into the `<!-- TYPE-SPECIFIC SPECIALIZATIONS -->` marker.

Frontmatter:
```
---
name: hero-card-auditor
description: Audits every hero card in an expansion — card text vs code, engine touchpoints, mode compliance, cross-card safety, player choices, base rules, plus hero-specific ability-function structure and class/team correctness. Runs in the parallel batch inside /expansion-audit.
---
```

Specialization block (replaces the marker):
```markdown
## Hero-Specific Specializations

- **Ability-function structure** — `async function heroNameCardTitle() { ... }` must match the `unconditionalAbility` / `conditionalAbility` names in `cardDatabase.js` EXACTLY. A mismatch silently disables the ability.
- **Async chains** — if the ability function is `async`, every call site (in `cardAbilities.js`, expansion files, `script.js`) must `await` it. Missing `await` = silent fire-and-forget.
- **Class/team correctness** — confirm class is one of `Strength` / `Instinct` / `Covert` / `Tech` / `Range` (NOT "Ranged"); confirm team matches the inventory.
- **Conditional triggers** — class-gated abilities ("Covert: …") must check the right class; verify the condition type matches the card.
```

- [ ] **Step 2: Structural self-check** — read back; confirm frontmatter name matches filename, all six base checks present, hero specialization present, output block present.

- [ ] **Step 3: Commit**
```bash
git add .claude/agents/hero-card-auditor.md
git commit -m "Add hero-card-auditor subagent

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: villain-card-auditor subagent

**Files:**
- Create: `.claude/agents/villain-card-auditor.md`

- [ ] **Step 1: Write the file**

Assemble as: frontmatter + BASE BODY (`<Title>`→`Villain`, `<TYPE>`→`villain`) + this specialization block.

Frontmatter:
```
---
name: villain-card-auditor
description: Audits every villain card in an expansion — the six base checks plus villain-specific ambush/fight/escape signatures, the attack-modifier pipeline, city placement, and post-copy state preservation. Runs in the parallel batch inside /expansion-audit.
---
```

Specialization block:
```markdown
## Villain-Specific Specializations

- **Effect-function signatures** — `function villainNameAmbush/Fight/Escape(villainCard)`; villain card passed as arg when the effect needs it. Confirm the function exists and is wired.
- **Attack-modifier pipeline** — modified attack values live in `attackFromMastermind` / `attackFromScheme` / `attackFromOwnEffects` / `attackFromHeroEffects` / `attackFromShards`, NEVER `card.attack` (the base number comes from card art). Writing to `card.attack` is invisible. New bonuses follow the `mastermind.alwaysLeadsBonus` precedent inside BOTH `updateVillainAttackValues()` (city) AND `updateHQVillainAttackValues()` (HQ).
- **City placement** — villains entering the city use `enterCityFromRight()` / the correct placement path; respect city ordering and overflow.
- **Post-copy state preservation** — custom properties set at ambush time (e.g. `capturedHero`) must be in the `createVillainCopy()` whitelist (`script.js:12209`), or the fight effect receives a stripped copy. Fight-effect functions must read from the copy PARAMETER, not iterate `city[]` (it's nulled before the fight effect runs).
- **Count/variant (check g focus)** — verify the villain group split matches the inventory. Standard is 8 cards / 4 villains (2 each), but some sets deviate; trust the inventory's recorded composition, not the standard pattern.
```

- [ ] **Step 2: Structural self-check** — read back; confirm name, six base checks, villain specialization (attack pipeline + createVillainCopy whitelist), output block.

- [ ] **Step 3: Commit**
```bash
git add .claude/agents/villain-card-auditor.md
git commit -m "Add villain-card-auditor subagent

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: henchmen-card-auditor subagent

**Files:**
- Create: `.claude/agents/henchmen-card-auditor.md`

- [ ] **Step 1: Write the file**

Assemble as: frontmatter + BASE BODY (`<Title>`→`Henchmen`, `<TYPE>`→`henchman`) + this specialization block.

Frontmatter:
```
---
name: henchmen-card-auditor
description: Audits every henchman group in an expansion — the six base checks plus henchmen-specific fixed-attack patterns, the usesRecruitToFight mechanic flag, and the duplicate updateHighlights() hazard. Runs in the parallel batch inside /expansion-audit.
---
```

Specialization block:
```markdown
## Henchmen-Specific Specializations

- **Fixed-attack patterns** — henchmen have a fixed printed attack; confirm value matches inventory and that any modifiers use the attack-modifier pipeline (not `card.attack`).
- **`usesRecruitToFight` flag** — henchmen with a recruit-only fight cost (e.g. Mister Hyde) need `usesRecruitToFight: true` in the DB entry. Both `updateHighlights()` declarations gate affordability on this flag; a missing flag silently disables the entire mechanic with no error.
- **Duplicate `updateHighlights()` hazard** — `script.js` has TWO `function updateHighlights()` declarations. Affordability/fight-button logic for henchmen must be consistent in BOTH; grep for all definitions.
- **Ambush effects** — henchmen ambush patterns resemble villains but use henchman function names; confirm wiring.
- **Count/variant (check g focus)** — verify the copy structure matches the inventory. Standard is 10 identical copies of one henchman, but some groups (e.g. Ten Rings) are 10 *unique* cards; trust the inventory.
```

- [ ] **Step 2: Structural self-check** — read back; confirm name, six base checks, henchmen specialization (`usesRecruitToFight` + duplicate updateHighlights), output block.

- [ ] **Step 3: Commit**
```bash
git add .claude/agents/henchmen-card-auditor.md
git commit -m "Add henchmen-card-auditor subagent

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: mastermind-card-auditor subagent

**Files:**
- Create: `.claude/agents/mastermind-card-auditor.md`

- [ ] **Step 1: Write the file**

Assemble as: frontmatter + BASE BODY (`<Title>`→`Mastermind`, `<TYPE>`→`mastermind`) + this specialization block.

Frontmatter:
```
---
name: mastermind-card-auditor
description: Audits every mastermind in an expansion — the six base checks plus mastermind-specific tactics, alwaysLeads bonus, Epic overlay detection, Master Strike effects, and exact-name-match lookups. Runs in the parallel batch inside /expansion-audit.
---
```

Specialization block:
```markdown
## Mastermind-Specific Specializations

- **Exact-name matching** — mastermind names in `cardDatabase.js` must match EXACTLY (e.g. `"The Supreme Intelligence of the Kree"`, not `"Supreme Intelligence"`). A wrong name silently returns `undefined` from `masterminds.find()`. Use `getSelectedMastermind()` where lookups are needed.
- **Tactics** — confirm the four Master Tactic cards/effects exist and are wired; confirm tactic order/uniqueness.
- **`alwaysLeads` bonus** — if the mastermind always leads a specific group, confirm the `alwaysLeadsBonus` is applied via the attack-modifier pipeline (precedent: `script.js:9937`).
- **Epic overlay** — Epic masterminds are a runtime object-spread overlay (`{ ...base, ...base.epic }`), NOT a separate DB entry. Runtime `mastermind.name` becomes `"Epic X"`. Confirm epic fields (`attack`, `masterStrike`, `image`) exist in the `epic` sub-object and that any name-based detection uses `mastermind.name === "Epic X"`.
- **Master Strike effects** — confirm the Master Strike effect matches card text and fires correctly.
```

- [ ] **Step 2: Structural self-check** — read back; confirm name, six base checks, mastermind specialization (exact-name + Epic overlay), output block.

- [ ] **Step 3: Commit**
```bash
git add .claude/agents/mastermind-card-auditor.md
git commit -m "Add mastermind-card-auditor subagent

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: scheme-card-auditor subagent

This is the highest-value card-type auditor — the House of M / Korvac / transformScheme bugs that triggered this whole pipeline are scheme bugs.

**Files:**
- Create: `.claude/agents/scheme-card-auditor.md`

- [ ] **Step 1: Write the file**

Assemble as: frontmatter + BASE BODY (`<Title>`→`Scheme`, `<TYPE>`→`scheme`) + this specialization block.

Frontmatter:
```
---
name: scheme-card-auditor
description: Audits every scheme in an expansion — the six base checks plus scheme-specific setup directives, twist effects, transforms, evil-wins conditions, hero/villain requirements, and city resize. The highest-value card-type auditor (setup-directive and transform bugs triggered this pipeline). Runs in the parallel batch inside /expansion-audit.
---
```

Specialization block:
```markdown
## Scheme-Specific Specializations

- **Setup directives** — if the scheme's text says "set up X" (e.g. House of M: "shuffle Scarlet Witch hero cards into the villain deck"), confirm the game-init code ACTUALLY DOES IT. Grep the setup/init path for the directive's effect. A setup directive present in card text but absent from init code is a HIGH finding — this is the House of M failure class.
- **Twist effects** — confirm `twistEffect` matches card text and fires via the twist dispatcher. Verify the dispatcher resolves the CURRENT scheme (honoring transforms — see gap E-1).
- **Transforms** — schemes that transform mid-game must (1) call `transformScheme()`, and (2) ensure downstream readers see the new scheme. Cross-reference engine-integration gap E-1: if the scheme transforms, every `scheme.name === 'X'` check, twist dispatch, and end-game condition must read `window.selectedScheme`, not the setup DOM radio. Schemes that change city size also need `resizeCityForScheme(newSize)` (or `extraVillainGroups` handling) — `transformScheme()` alone does NOT resize the city.
- **Evil-wins condition** — scheme loss conditions must have a `case "conditionName":` in the `checkEvilWins` switch (`script.js:~9065`).
- **Hero/villain requirements** — `requiredHeroes`, optional `heroRequirements` (team composition / required hero), `requiredVillains` / `specificVillainRequirement` / `extraVillainGroups` must match the scheme's setup text and route through `getEffectiveSetupRequirements()` (`script.js:3248`).
- **Conditional player choices** — twist/setup choices ("you may KO a Bystander") must be gated on the player being able to perform them (the Korvac failure class: offering "KO Bystander" with no bystanders, then transforming anyway).
```

- [ ] **Step 2: Structural self-check** — read back; confirm name, six base checks, scheme specialization (setup directives + transforms/E-1 + evil-wins + conditional choices), output block.

- [ ] **Step 3: Commit**
```bash
git add .claude/agents/scheme-card-auditor.md
git commit -m "Add scheme-card-auditor subagent

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: misc-card-auditor subagent

**Files:**
- Create: `.claude/agents/misc-card-auditor.md`

- [ ] **Step 1: Write the file**

Assemble as: frontmatter + BASE BODY (`<Title>`→`Misc`, `<TYPE>`→`misc`) + this specialization block.

Frontmatter:
```
---
name: misc-card-auditor
description: Audits all card types not covered by the other five auditors — bystanders (special effects), sidekicks, Wounds, and expansion-specific one-offs (Locations, Artifacts, Shards). The six base checks plus type-specific handling for each. Runs in the parallel batch inside /expansion-audit.
---
```

Specialization block:
```markdown
## Misc-Type Specializations

Audit any card in the expansion NOT covered by the hero/villain/henchmen/mastermind/scheme auditors. Apply the relevant sub-specialization per card:

- **Wounds** — wound-drawing effects call `drawWound()` (handles invulnerability), NOT `defaultWoundDraw()`.
- **Locations** — `placeLocation()` is async; callers must `await` and be `async`. Locations entering the city must announce via `onscreenConsole.log()` (not `console.log`). `generateVillainDeck()` overwrites `type` to `"Villain"` — Location cards need the preservation check (`const cardType = modifiedCard.type === "Location" ? "Location" : "Villain";`). Location click handlers use `if (!popupMinimized) { handle }`.
- **Artifacts / Shards** — confirm the keyword mechanic is wired (Shards feed `attackFromShards`); defer cross-card consistency to keyword-consistency-auditor but verify THIS card's effect.
- **Special bystanders** — bystanders with effects beyond "rescue for VP" must have those effects implemented and matching card text.
- **Sidekicks** — sidekick effect functions wired; match inventory text.
- **Expansion one-offs** — any new card type the expansion introduces: verify it has engine support and matches card text.
```

- [ ] **Step 2: Structural self-check** — read back; confirm name, six base checks, misc specialization covering Wounds/Locations/Artifacts/Shards/bystanders/sidekicks, output block.

- [ ] **Step 3: Commit**
```bash
git add .claude/agents/misc-card-auditor.md
git commit -m "Add misc-card-auditor subagent

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: /expansion-audit orchestrator skill

Runs the eight subagents in the right order, consolidates findings into a catalog.

**Files:**
- Create: `.claude/skills/expansion-audit/SKILL.md`

- [ ] **Step 1: Write the skill file**

Create `.claude/skills/expansion-audit/SKILL.md` with this exact content:

```markdown
---
name: expansion-audit
description: Runs the full pre-merge audit pipeline on a Marvel Legendary expansion — engine-integration-auditor, expansion-validator, the six card-type auditors, and keyword-consistency-auditor — then consolidates all findings into a single severity-tagged catalog for triage. Use as the validation gate before merging an expansion to master (invoked by /new-expansion Phase 4), or standalone to re-audit an expansion. Trigger on "/expansion-audit", "audit this expansion", "run the audit pipeline".
---

# Expansion Audit

Orchestrates the expansion audit pipeline. You dispatch the auditor subagents, collect their findings, and consolidate them into one catalog. You do NOT fix anything — you produce the findings catalog and hand it to triage.

## Step 1: Prerequisites

Confirm for the named expansion `<expansion>`:
- Finalized inventory exists: `docs/card-inventory/final/<expansion>.md`
- Expansion JS file exists in the game code dir
- `cardDatabase.js` has the expansion's entries
- Engine-touchpoints reference exists: `docs/audit-pipeline/engine-touchpoints.md`

If the engine-touchpoints reference is MISSING, halt and tell the user: "Run engine-integration-auditor in bootstrap mode first — its Pass 1 will seed docs/audit-pipeline/engine-touchpoints.md." (The reference doc ships with the pipeline, so this should normally exist.)

If inventory or DB entries are missing, halt and report what's missing.

## Step 2: Engine integration (sequential, first)

Dispatch `engine-integration-auditor` for `<expansion>`. Capture its full output (new touchpoints + propagation gaps with `E-N` IDs). If it appended new touchpoints to the reference doc, that's expected.

Hold its gap findings — they become prompt context for the card-type auditors.

## Step 3: Expansion validator (sequential)

Dispatch `expansion-validator` against the expansion JS file. Capture its 7-rule output.

## Step 4: Parallel batch (seven subagents)

Dispatch these seven IN PARALLEL (single message, multiple Agent calls):
- `hero-card-auditor`
- `villain-card-auditor`
- `henchmen-card-auditor`
- `mastermind-card-auditor`
- `scheme-card-auditor`
- `misc-card-auditor`
- `keyword-consistency-auditor`

Pass each card-type auditor:
- the expansion name
- the engine-integration gap findings (the `E-N` list from Step 2) as context, so they can cite `RELATED: E-N`
- a note that the pattern-reuse catalog (if present) is in `docs/expansion-mechanics/<expansion>.md`

Pass `keyword-consistency-auditor` the expansion name (it reads the mechanics doc's keyword section itself).

## Step 5: Consolidate

Merge ALL findings into `docs/audit-results/<expansion>-<YYYY-MM-DD>.md` (use the real current date). Structure:

1. **Summary header** — expansion, date, totals by severity (H/M/L), each subagent run with pass/fail/issue-count
2. **HIGH severity** — every HIGH finding across all subagents, grouped by card (all issues for one card colocated)
3. **MEDIUM severity** — same grouping
4. **LOW severity** — same grouping
5. **Could not be audited** — cards/items needing manual review
6. **Engine touchpoints discovered this run** — any new ones the engine auditor appended

## Step 6: Report

Tell the user the catalog path and the headline numbers (e.g. "12 HIGH, 8 MEDIUM, 5 LOW across 6 auditors"). Suggest triage as the next step: walk HIGH findings in plain English, Paul makes the gameplay call (code wrong vs reference wrong), tag each Fix Now / Defer / Reject.

## Notes

- All auditors are static-analysis only. If a finding needs in-browser confirmation, that's a `/game-test` (Playwright) job during triage, not part of this skill.
- This skill reports; it never fixes.
```

- [ ] **Step 2: Structural self-check**

Read back. Confirm: frontmatter name `expansion-audit` matches the skill folder; the order matches the spec (engine-integration → validator → parallel batch of 7 → consolidate); the parallel batch lists all 7; the consolidated catalog path and structure match the spec; "reports, never fixes" stated.
Expected: all present, order correct.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/expansion-audit/SKILL.md
git commit -m "$(cat <<'EOF'
Add /expansion-audit orchestrator skill

Runs the audit pipeline: engine-integration-auditor → expansion-validator →
parallel batch of six card-type auditors + keyword-consistency-auditor →
consolidate into a severity-tagged catalog at docs/audit-results/. Reports
only; triage and fixes happen separately.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Retire card-effect-auditor and update references

**Files:**
- Delete: `.claude/agents/card-effect-auditor.md`
- Modify: `CLAUDE.md` (worktree copy) — Subagents section
- Modify: `.claude/agents/audit-tracker.md` (only if it references card-effect-auditor)
- Modify: project `MEMORY.md` entry — `C:\Users\Paul\.claude\projects\D--Games-Digital-Marvel-Legendary-Claude-Code-marvel-legendary\memory\MEMORY.md` and `project_card_effect_auditor.md`

- [ ] **Step 1: Confirm card-effect-auditor has no remaining unique responsibility**

Read `.claude/agents/card-effect-auditor.md` once more. Confirm its four layers map to successors: Layer 1 → card-type check (a); Layer 2 → check (c); Layer 3 → check (d); Layer 4 → keyword-consistency-auditor. (Already verified in the spec; this is the pre-delete confirmation.)
Expected: no orphaned responsibility.

- [ ] **Step 2: Delete the file**

Because the repo's destructive-op guard may block `rm`, move it to the to-delete folder instead:
```bash
mv ".claude/agents/card-effect-auditor.md" "D:/Claude Code/_to-delete/card-effect-auditor.md"
```
Then append a dated line to `D:/Claude Code/_to-delete/README.md` noting: "card-effect-auditor.md — Marvel Legendary subagent, superseded 2026-05-28 by the expansion-audit pipeline (six card-type auditors + keyword-consistency-auditor). Safe to delete."

If `git` still tracks it, stage the deletion: `git rm --cached "Legendary-Solo-Play-main/...path.../card-effect-auditor.md"` is NOT needed — the file is under `.claude/agents/`, so: `git add -A .claude/agents/`.

- [ ] **Step 3: Update CLAUDE.md Subagents section**

In the worktree `CLAUDE.md`, find the Subagents block under "## Automations Set Up". Replace the line:
```
- `card-effect-auditor` — compares card reference data against code implementations
```
with:
```
- **Expansion audit pipeline** (run via `/expansion-audit`, see `docs/superpowers/specs/2026-05-28-expansion-audit-pipeline-design.md`):
  - `engine-integration-auditor` — discovers engine touchpoints + finds state-propagation gaps (E-N IDs)
  - `pattern-reuse-scout` — finds prior-art implementations of new mechanics (runs in `/analyze-expansion`)
  - `keyword-consistency-auditor` — keyword implemented-once / consistent-across-types / scoped
  - `hero-card-auditor`, `villain-card-auditor`, `henchmen-card-auditor`, `mastermind-card-auditor`, `scheme-card-auditor`, `misc-card-auditor` — per-card-type audit (text-vs-code, engine, mode, cross-card, choices, base rules)
```

Also update the `card-effect-auditor` mention in the agent list in the SessionStart-context Subagents bullet if present (the `- card-effect-auditor` line in the "## Automations Set Up" → Subagents list).

- [ ] **Step 4: Check audit-tracker for references**

Grep `.claude/agents/audit-tracker.md` for `card-effect-auditor`. If found, update to point at the new pipeline. (Likely no reference — audit-tracker is about Golden Solo compatibility fixes, not card effects.)
Run: `grep -n "card-effect-auditor" .claude/agents/audit-tracker.md`
Expected: no matches (no change needed). If matches, edit them out.

- [ ] **Step 5: Update MEMORY.md**

Edit `C:\Users\Paul\.claude\projects\D--Games-Digital-Marvel-Legendary-Claude-Code-marvel-legendary\memory\MEMORY.md`: change the `[Card effect auditor]` index line to reflect supersession:
```
- [Card effect auditor](project_card_effect_auditor.md) — SUPERSEDED 2026-05-28 by /expansion-audit pipeline (9 subagents); old single-pass auditor retired
```
And update the body of `project_card_effect_auditor.md` (same memory dir) with a one-line note that it's superseded and pointing to the spec.

- [ ] **Step 6: Commit**

```bash
git add -A .claude/agents/ CLAUDE.md
git commit -m "$(cat <<'EOF'
Retire card-effect-auditor; update CLAUDE.md for audit pipeline

Superseded by the expansion-audit pipeline (six card-type auditors absorb
Layers 1-3, keyword-consistency-auditor absorbs Layer 4). Updates CLAUDE.md
Subagents section. MEMORY.md updated separately (outside repo).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```
(MEMORY.md lives outside the repo — it is saved in Step 5 but not part of this commit.)

---

## Task 13: Update /analyze-expansion — add Step 5 (pattern-reuse-scout) + template section

**Files:**
- Modify: `.claude/skills/analyze-expansion/SKILL.md`

- [ ] **Step 1: Add the Prior Art section to the Step 4 document template**

In `.claude/skills/analyze-expansion/SKILL.md`, inside the `### Document Format` code block, insert between the `## Solo Mode Decisions` table block and `## Open Questions`:
```markdown
## Prior Art & Reuse Candidates

[Populated by pattern-reuse-scout in Step 5 — for each new mechanic: existing implementations with file:line, how they work, REUSE/ADAPT/BUILD NEW recommendation]
```

- [ ] **Step 2: Add Step 5**

After the `## Step 4: Produce the Mechanics Reference Document` section (before `## What This Skill Does NOT Do`), add:
```markdown
## Step 5: Pattern Reuse Scan

After the mechanics doc is saved, dispatch the `pattern-reuse-scout` subagent for this expansion. It reads the mechanics doc, finds existing codebase implementations of each new mechanic, and appends a `## Prior Art & Reuse Candidates` section to the doc.

Present the reuse recommendations to the user in plain English:
> "Before we implement, here's what already exists that we can reuse: [mechanic] → [existing scheme/card] already does this. I'd recommend reusing it rather than building from scratch."

This makes reuse decisions BEFORE implementation, not after — the implementer (in `/new-expansion`) reads this section in Phase 1.
```

- [ ] **Step 3: Update the "What This Skill Does NOT Do" if needed**

The skill says "No code or pseudocode." pattern-reuse-scout produces pointers, not code — consistent. No change needed unless the line contradicts; confirm it doesn't.

- [ ] **Step 4: Verify**

Read back the modified sections. Confirm: the template now has `## Prior Art & Reuse Candidates` (exact heading matching pattern-reuse-scout's output target from Task 3); Step 5 dispatches pattern-reuse-scout; ordering is Step 4 (save doc) → Step 5 (scout appends).
Expected: heading strings match between Task 3 and this task.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/analyze-expansion/SKILL.md
git commit -m "$(cat <<'EOF'
Add pattern-reuse-scout to /analyze-expansion (Step 5 + template)

After the mechanics doc is produced, dispatch pattern-reuse-scout to append a
Prior Art & Reuse Candidates section, so reuse decisions are made before
implementation. Adds the section to the canonical document template.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Update /new-expansion — expand Phase 4 to invoke /expansion-audit

**Files:**
- Modify: `.claude/skills/new-expansion/SKILL.md`

- [ ] **Step 1: Replace the 4a Expansion Validator step with the full audit**

In `.claude/skills/new-expansion/SKILL.md`, replace the `### 4a: Expansion Validator` section content with:
```markdown
### 4a: Full Expansion Audit

Run the `/expansion-audit` skill for this expansion. It runs the full pipeline:
`engine-integration-auditor` → `expansion-validator` → six card-type auditors + `keyword-consistency-auditor` (parallel) → consolidated findings catalog at `docs/audit-results/<expansion>-<date>.md`.

Present the headline to the user:
> "Audit complete: [N] HIGH, [M] MEDIUM, [L] LOW findings across the pipeline. Catalog saved to [path]."

Then TRIAGE with the user:
- Walk each HIGH finding in plain English ("card says X, code does Y, here's how it plays").
- User makes the gameplay call: is the CODE wrong, or is the card-text/reference what's stale?
- Tag each finding: Fix Now / Defer / Reject.
- MEDIUM/LOW go into a sweep pass after HIGH is resolved.

Fix the Fix-Now findings, then re-run `/expansion-audit` until the merge gate is met.

**Merge gate:** HIGH count = 0, OR every remaining HIGH has a documented Defer rationale in the progress file.
```

- [ ] **Step 2: Update the Merge checklist**

In the `### Merge checklist` block, add a checkbox:
```markdown
- [ ] `/expansion-audit` run clean (0 unresolved HIGH findings, or all deferrals documented)
```

- [ ] **Step 3: Verify**

Read back. Confirm: Phase 4a now invokes `/expansion-audit` (not just expansion-validator); triage workflow present; merge gate stated; merge checklist updated.
Expected: all present.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/new-expansion/SKILL.md
git commit -m "$(cat <<'EOF'
Expand /new-expansion Phase 4 to run full /expansion-audit

Phase 4a now invokes the full audit pipeline instead of just expansion-validator,
adds the triage workflow (HIGH findings walked with the user, tagged
Fix Now/Defer/Reject), and a merge gate (0 unresolved HIGH or documented
deferrals). Adds the audit-clean checkbox to the merge checklist.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Inaugural run on Revelations + triage prep

This is the real end-to-end verification — building the subagents proved nothing until they catch real bugs. Run the pipeline against Revelations and confirm it surfaces known issues.

**Files:**
- Produces: `docs/audit-results/revelations-2026-05-28.md` (or current date)

- [ ] **Step 1: Run /expansion-audit on Revelations**

Invoke the `/expansion-audit` skill for the Revelations expansion. Let it run the full pipeline (engine-integration → validator → parallel batch → consolidate).

- [ ] **Step 2: Confirm the pipeline caught known issues (the real test)**

The catalog MUST surface these known-real issues (planted bugs we already know about — if the pipeline misses them, the relevant subagent's prompt is broken):
- **engine-integration-auditor** must report gap **E-1** (transformScheme → stale DOM-radio readers). Expected: PRESENT.
- **scheme-card-auditor** must flag the **House of M setup directive** (Scarlet Witch hero injection) if House of M is in the Revelations inventory, AND the **Korvac conditional-choice** bug (KO Bystander offered with none available) at `expansionRevelations.js:2344-2359`. Expected: PRESENT.

Run: read `docs/audit-results/revelations-<date>.md` and grep for these.
Expected: E-1, House of M setup, Korvac conditional choice all appear. If any is MISSING, fix that subagent's prompt and re-run before proceeding.

- [ ] **Step 3: Cross-reference against the existing fix plan to dedupe**

Open `docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md`. For each catalog HIGH finding, mark whether it's: (a) already fixed, (b) already known and pending, or (c) genuinely new. This separates "the pipeline works" signal from "new work to do."

- [ ] **Step 4: Commit the catalog**

```bash
git add docs/audit-results/
git commit -m "$(cat <<'EOF'
Add inaugural Revelations audit catalog from /expansion-audit

First full run of the expansion-audit pipeline. Confirms the pipeline surfaces
known issues (E-1 transformScheme propagation, House of M setup directive,
Korvac conditional choice). Findings cross-referenced against the existing
Phase 4 fix plan to separate new work from known-pending.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5: Hand off to triage with Paul**

Present the headline numbers and the new-vs-known breakdown. This ends the pipeline-build work; Revelations fixes resume from the catalog (separate work, driven by triage decisions).

---

## Self-Review (completed by plan author)

**Spec coverage:**
- 9 new subagents → Tasks 2,3,4,5,6,7,8,9,10 ✓
- engine-touchpoints reference doc → Task 1 ✓
- /expansion-audit orchestrator → Task 11 ✓
- card-effect-auditor retirement + CLAUDE.md/MEMORY/audit-tracker updates → Task 12 ✓
- /analyze-expansion Step 5 + template → Task 13 ✓
- /new-expansion Phase 4 expansion + merge gate → Task 14 ✓
- Inaugural Revelations run + known-bug verification + triage prep → Task 15 ✓
- Static-analysis-only constraint → stated in conventions + Task 11 + each base body ✓
- Two-pass engine auditor → Task 2 ✓
- Mode compliance both golden + whatif → base body check (c) ✓
- Pattern-reuse heading consistency between Task 3 (output) and Task 13 (template) → cross-checked, both use `## Prior Art & Reuse Candidates` ✓

**Type/name consistency:** subagent `name:` frontmatter matches filename in every task; orchestrator dispatches exactly the names defined (hero/villain/henchmen/mastermind/scheme/misc-card-auditor, keyword-consistency-auditor, engine-integration-auditor, expansion-validator) ✓. Catalog path `docs/audit-results/<expansion>-<date>.md` consistent across Tasks 11 and 15 ✓. Gap-ID scheme `E-N` consistent across Task 1, 2, base body, Task 9 ✓.

**Placeholder scan:** no TBD/TODO; every file's complete content is given (base body once + complete per-type deltas) ✓.

**Open items from spec deferred here (now resolved):** exact prompt text — provided; orchestrator structure — provided; engine findings persistence — per-run output, touchpoints doc persists (Task 1/2); MEDIUM/LOW triage — sweep after HIGH (Task 14) ✓.
```
