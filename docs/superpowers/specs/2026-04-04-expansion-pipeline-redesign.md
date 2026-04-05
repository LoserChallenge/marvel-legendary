# Expansion Pipeline Redesign — Skill Spec

**Date:** 2026-04-04
**Status:** Draft
**Scope:** Redesign `/new-expansion` skill and create new `/analyze-expansion` skill

---

## Problem Statement

The current `/new-expansion` skill predates the inventory pipeline (`/stage-expansion`, `/inventory-creator`, `/inventory-verifier`). It tries to extract card data from PDFs — work now handled by those other skills. It also lacks session management for large expansions, rules analysis for new mechanics, and consideration for both solo modes.

## Decision: Two-Skill Split

The old monolithic `/new-expansion` is replaced by two skills with a clear artifact boundary between them:

1. **`/analyze-expansion`** (new) — collaborative rules analysis, produces a mechanics reference document
2. **`/new-expansion`** (redesigned) — multi-phase code integration, consumes the mechanics reference + inventory

---

## Full Pipeline (Steps 1–4 Already Exist)

| Step | Skill / Process | Input | Output |
|---|---|---|---|
| 1. Stage | `/stage-expansion` | Raw image files in `expansions/[name]/` | Organized, renamed images in subfolders |
| 2. Inventory | `/inventory-creator` | Staged images + PDF or DB | Draft inventory in `docs/card-inventory/drafts/` |
| 3. Verify | `/inventory-verifier` | Draft inventory (fresh session) | Verified inventory with corrections |
| 4. Spot-check | Manual (user + physical cards) | Verified inventory with remaining flags | Finalized inventory in `docs/card-inventory/final/` |
| 5. Analyze | `/analyze-expansion` | Finalized inventory + rules PDF | Mechanics reference in `docs/expansion-mechanics/` |
| 6. Implement | `/new-expansion` | Inventory + mechanics ref + staged images + rules PDF | Playable expansion in the game |

**Key principle:** Every step produces a document that the next step consumes. Nothing is carried in someone's head — the artifacts are the context.

---

## Skill 1: `/analyze-expansion`

### Purpose

Collaborative rules analysis session. The user and Claude read the expansion's rules PDF and inventory file together, work through every new mechanic, and produce a mechanics reference document.

### When to Invoke

After the inventory is finalized (exists in `docs/card-inventory/final/`), before invoking `/new-expansion`.

### Inputs

- Rules PDF in `rules/` or `expansions/[name]/`
- Finalized inventory file in `docs/card-inventory/final/[name].md`

### Session Flow

**Step 1: Load sources**
- Read the finalized inventory file (card data + effect text)
- Read the rules PDF page by page (targeted sections, not the whole thing at once)

**Step 2: Identify new mechanics**
Claude produces a categorized list of everything this expansion introduces:
- **New keywords** (e.g., Focus, Burrow, Divided)
- **New card types** (e.g., Traps, Horrors, Locations)
- **New game systems** (e.g., Ascending Villains becoming Masterminds, Adapting Masterminds with rotating tactics)
- **Modified existing systems** (e.g., a scheme that changes how the city works, a villain that interacts with the HQ differently)

**Step 3: Work through each mechanic one at a time**
For each item, Claude presents:
1. **What the rules say** — plain English summary of the mechanic
2. **How it maps to the current engine** — which existing systems it touches, whether it fits cleanly or needs new logic
3. **Solo mode implications** — how it behaves in both Golden Solo and What If? Solo. Flags anything that needs a decision.
4. **Impact assessment:**
   - **Fits cleanly** — uses existing patterns, stays in the expansion file, no risk to other expansions or core gameplay
   - **New capability needed** — requires new helper functions or a new system, but self-contained
   - **Core engine change** — modifies `script.js` or shared systems. Claude spells out:
     - **What would change**
     - **What it affects** (other expansions, core systems)
     - **Risk**
     - **Options** (2-3 approaches with trade-offs)

**Checkpoint after each mechanic:** User confirms the interpretation, corrects anything that doesn't match the physical game, and makes decisions on solo mode questions and engine change options.

**Step 4: Produce the mechanics reference document**
After all mechanics are discussed and agreed, save to `docs/expansion-mechanics/[name].md`.

### Multi-Session Support

Complex expansions (e.g., X-Men with 6+ new mechanics) may require multiple analysis sessions. The mechanics reference document supports incremental building — each session appends completed mechanics to the file and notes which remain. The file header tracks overall status:

```
Status: In Progress — 4 of 7 mechanics analyzed
Remaining: Ascending Villains, Shadow-X Dual Cards, Horrors
```

A follow-up session reads the file, sees what's done, and picks up at the next unanalyzed mechanic.

### What This Skill Does NOT Do

- No code. Not even pseudocode. Purely rules understanding and documentation.
- No file structure decisions. That's `/new-expansion`'s job.
- No card-by-card effect review. The inventory has that. This focuses on the mechanics that make those effects work.

### Output: Mechanics Reference Document

```
# [Expansion Name] — Mechanics Reference

Analyzed: YYYY-MM-DD
Sources: rules PDF, finalized inventory

## Keywords

### [Keyword Name]
Rules definition: [verbatim from rulebook]
Implementation approach: [how it works in the engine]
Solo mode notes: [Golden Solo and What If? adaptations]
Complexity: Simple / Moderate / Major

## New Card Types
[Same structure per type]

## New Game Systems
[Same structure per system]

## Core Engine Changes Required
[List of anything that needs to touch script.js or other shared files]

## Solo Mode Decisions
| Mechanic | Question | Decision |
|---|---|---|

## Open Questions
[Anything unresolved — for user to think about or test with physical cards]
```

---

## Skill 2: `/new-expansion` (Redesigned)

### Purpose

Multi-phase code integration. Takes the mechanics reference + inventory and builds the expansion into the game.

### When to Invoke

After `/analyze-expansion` has produced its mechanics reference document.

### Inputs

- Mechanics reference doc in `docs/expansion-mechanics/[name].md`
- Finalized inventory file in `docs/card-inventory/final/[name].md`
- Staged images in `expansions/[name]/`
- Rules PDF (available for spot-checks during implementation)

### Interaction Model

User wants to be involved in decisions and updates related to **gameplay**, but not the code itself. Checkpoints surface gameplay logic questions; code details are handled by Claude autonomously.

### Phase 0: Pre-flight Check

Verify all prerequisites exist before any work begins:
- Finalized inventory file in `docs/card-inventory/final/[name].md`
- Mechanics reference doc in `docs/expansion-mechanics/[name].md`
- Staged images in `expansions/[name]/`
- Rules PDF accessible

If a progress file exists for this expansion (`docs/expansion-progress/[name].md`), read it and resume. If not, create one.

**If anything is missing, stop and tell the user what's needed.**

### Phase 1: Card Data + Image Import

1. Copy staged images from `expansions/[name]/` into the correct `Visual Assets/` subfolders
2. Add all card entries to `cardDatabase.js` — heroes, villains, masterminds, schemes, henchmen, bystanders — pulling structured data directly from the inventory file
3. Wire up image paths to match where files were copied

**Checkpoint:** Claude shows a summary — card counts per type, hero roster, villain groups. User confirms it matches expectations.

### Phase 2: Setup Screen Registration

1. Add expansion heroes to hero selection area in `index.html`
2. Add villain groups, schemes, masterminds to their respective dropdowns
3. Add `<script>` tag for the new expansion file in the loading chain
4. Create the expansion JS file with its basic skeleton (empty, ready for effects)

**Checkpoint:** "You should be able to open the game, see the new expansion in all the dropdowns, and start a game — cards will appear but have no special effects yet. Want to test that before I start on effects?"

### Phase 3: Effect Implementation

Broken into sub-phases by card type. Each sub-phase can be its own session.

- **3a: Keywords & helpers** — new keyword functions that multiple cards reference
- **3b: Hero abilities** — one hero at a time, all 4 cards per hero
- **3c: Villain effects** — ambush, fight, escape for each villain group
- **3d: Mastermind effects** — master strike, lead card ability, tactic effects
- **3e: Scheme effects** — twist effects, setup modifications, evil wins conditions
- **3f: Henchmen / other** — henchmen fight effects, bystander rescue effects, expansion-specific card types

**Checkpoints per sub-phase:** Claude explains each effect in gameplay terms. Example: "When you play Human Torch - Flame On!, it deals 4 attack. Then if you've played another Ranged card this turn, you can spend 6 recruit to look at your top 2 cards, draw one, discard the other, and deal 3 more attack. Does that match the card?"

**Sub-phase order rationale:** Keywords first (other cards depend on them). Heroes before villains (most numerous, surface patterns). Villains and masterminds last (often interact with hero mechanics).

### Phase 4: Validation & Testing

1. Run the expansion-validator subagent (7 Golden Solo compatibility rules)
2. Fix any issues found
3. JS syntax check (final explicit check beyond the automatic hook)
4. Claude guides user through a test game with suggested setup

**Checkpoint:** Validation results shown in plain English. Failures explained with what's wrong and what the fix does.

### Progress Tracking

A file at `docs/expansion-progress/[name].md` tracks status across sessions:

```
# [Expansion Name] — Implementation Progress

Started: YYYY-MM-DD
Status: In Progress

## Phase 1: Card Data + Images — ✅ Complete
- [summary of what was added]

## Phase 2: Setup Screen — ✅ Complete

## Phase 3: Effects — In Progress
- 3a Keywords: ✅ [list]
- 3b Heroes: ✅ Hero1, ✅ Hero2, ⬜ Hero3, ⬜ Hero4, ⬜ Hero5
- 3c Villains: ⬜ Not started
- 3d Mastermind: ⬜ Not started
- 3e Schemes: ⬜ Not started
- 3f Henchmen: ⬜ N/A

## Phase 4: Validation — ⬜ Not started
```

Any session reads this file, knows where things stand, and picks up at the next unchecked item.

---

## What Gets Replaced

The current `/new-expansion` SKILL.md is completely replaced. Nothing from the old version carries over except the Golden Solo compatibility rules, which are already captured in the expansion-validator subagent (used in Phase 4).

## New Files Created

| File | Purpose |
|---|---|
| `.claude/skills/analyze-expansion/SKILL.md` | New analysis skill |
| `.claude/skills/new-expansion/SKILL.md` | Rewritten integration skill |
| `docs/expansion-mechanics/` (directory) | Mechanics reference docs produced by `/analyze-expansion` |
| `docs/expansion-progress/` (directory) | Per-expansion progress tracking files produced by `/new-expansion` |
