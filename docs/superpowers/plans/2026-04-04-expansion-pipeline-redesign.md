# Expansion Pipeline Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old `/new-expansion` skill with two new skills (`/analyze-expansion` and a redesigned `/new-expansion`) that consume finalized inventory files and mechanics references, plus create supporting directories and update CLAUDE.md.

**Architecture:** Two skill files (markdown), two output directories, and CLAUDE.md updates. No application code changes — this is purely documentation/configuration.

**Tech Stack:** Markdown skill files following existing project patterns (see `/inventory-creator` for reference format).

---

## File Structure

| Action | File | Purpose |
|---|---|---|
| Create | `.claude/skills/analyze-expansion/SKILL.md` | New rules analysis skill |
| Replace | `.claude/skills/new-expansion/SKILL.md` | Rewritten code integration skill |
| Create | `docs/expansion-mechanics/.gitkeep` | Directory for mechanics reference docs |
| Create | `docs/expansion-progress/.gitkeep` | Directory for implementation progress files |
| Modify | `CLAUDE.md` | Update skill references, pipeline description, remove "not ready" warnings |

---

### Task 1: Create `/analyze-expansion` Skill

**Files:**
- Create: `.claude/skills/analyze-expansion/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p ".claude/skills/analyze-expansion"
```

- [ ] **Step 2: Write the skill file**

Create `.claude/skills/analyze-expansion/SKILL.md` with this exact content:

```markdown
---
name: analyze-expansion
description: Collaborative rules analysis for a Marvel Legendary expansion. Reads rules PDF + finalized inventory, works through each new mechanic with the user, produces a mechanics reference document. Use after inventory is finalized, before /new-expansion.
---

# Analyze Expansion — Rules & Mechanics

Collaborative analysis session. You and the user work through the expansion's rules PDF and inventory to understand every new mechanic, then produce a mechanics reference document that `/new-expansion` will consume.

**This skill produces NO code.** Not even pseudocode. It is purely about understanding and documenting rules.

---

## Prerequisites

Before starting, verify these exist:
- Finalized inventory in `docs/card-inventory/final/[name].md`
- Rules PDF in `rules/` or `expansions/[name]/`

If either is missing, stop and tell the user what's needed.

---

## Resume Check

Check if `docs/expansion-mechanics/[name].md` already exists.

- **If yes:** Read it. Check the `Status:` line in the header. If it says "In Progress", report what's been completed and what remains, then pick up at the next unanalyzed mechanic.
- **If no:** This is a fresh analysis. Proceed from Step 1.

---

## Step 1: Load Sources

1. Read the finalized inventory file — scan the "New Keywords" section and all effect text for mechanics that go beyond standard play
2. Read the rules PDF page by page — targeted sections only, not the whole thing at once (keeps token cost down). Focus on:
   - New keyword definitions
   - New card type rules
   - Setup changes
   - Any rules that modify core gameplay (city, villain deck, HQ, win conditions)

---

## Step 2: Identify New Mechanics

Present a categorized list of everything this expansion introduces:

- **New keywords** (e.g., Focus, Burrow, Divided)
- **New card types** (e.g., Traps, Horrors, Locations)
- **New game systems** (e.g., Ascending Villains becoming Masterminds, Adapting Masterminds with rotating tactics)
- **Modified existing systems** (e.g., a scheme that changes how the city works, a villain that interacts with the HQ differently)

Ask the user: "Does this list look complete, or are there mechanics I missed?"

---

## Step 3: Analyze Each Mechanic (One at a Time)

For each mechanic, present all four parts, then checkpoint with the user before moving to the next.

### Part 1: What the Rules Say
Plain English summary. Quote the rulebook where precision matters.

### Part 2: How It Maps to the Current Engine
Which existing systems does this touch? Does it fit cleanly into existing patterns, or does it need something new? Reference specific functions or files in the game when relevant — but explain in plain English what they do.

### Part 3: Solo Mode Implications
Address BOTH modes explicitly:
- **Golden Solo** — HQ rotation effects, villain draw interactions, "other player" effects, Final Showdown impact
- **What If? Solo** — single villain group restrictions, reduced hero count, any mechanics that assume multiplayer setup counts

Flag anything that needs a decision from the user.

### Part 4: Impact Assessment
Rate the mechanic using one of these levels:

- **Fits cleanly** — uses existing patterns, stays in the expansion file, no risk to other expansions or core gameplay. Example: "Focus is like a recruit-spend trigger — the pattern already exists."

- **New capability needed** — requires new helper functions or a new system, but self-contained within the expansion file. No changes to `script.js` or other shared code. Example: "Cosmic Threat needs a reveal-from-hand popup, but similar popups exist — we just need a new variant."

- **Core engine change** — modifies `script.js` or shared systems that affect other expansions. For these, spell out:
  - **What would change** — which files, which functions
  - **What it affects** — other expansions, core gameplay systems
  - **Risk** — what could break
  - **Options** — 2-3 approaches with trade-offs and a recommendation

### Checkpoint
After presenting all four parts for one mechanic, ask the user:
- "Does this match how the physical game works?"
- If solo mode decisions are needed: "How should this work in solo play?"
- If a core engine change: "Which approach do you prefer?"

Record the user's answers — they go into the mechanics reference document.

---

## Step 4: Produce the Mechanics Reference Document

After all mechanics are analyzed and agreed, save to `docs/expansion-mechanics/[name].md`.

**If this was a multi-session analysis**, update the existing file rather than overwriting it.

### Document Format

```markdown
# [Expansion Name] — Mechanics Reference

Analyzed: YYYY-MM-DD
Status: Complete (or: In Progress — X of Y mechanics analyzed)
Remaining: [list, if in progress]
Sources: [rules PDF filename], [inventory filename]

---

## Keywords

### [Keyword Name]
**Rules definition:** [Verbatim from rulebook]
**Implementation approach:** [How it maps to the engine — plain English]
**Solo mode notes:** [Golden Solo and What If? adaptations, decisions made]
**Complexity:** Fits Cleanly / New Capability / Core Engine Change

---

## New Card Types

### [Card Type Name]
**Rules definition:** [How this type works]
**Implementation approach:** [How it maps to the engine]
**Solo mode notes:** [Adaptations for both modes]
**Complexity:** [Rating]

---

## New Game Systems

### [System Name]
**Rules definition:** [How this system works]
**Implementation approach:** [How it maps to the engine]
**Solo mode notes:** [Adaptations for both modes]
**Complexity:** [Rating]

---

## Core Engine Changes Required

[Numbered list of anything that needs to touch script.js or other shared files, with the agreed approach for each]

1. [Change description] — Agreed approach: [which option was chosen]

---

## Solo Mode Decisions

| Mechanic | Question | Decision |
|---|---|---|

---

## Open Questions

[Anything unresolved — for user to think about or test with physical cards before implementation begins]
```

---

## What This Skill Does NOT Do

- No code or pseudocode
- No file structure decisions — that's `/new-expansion`'s job
- No card-by-card effect review — the inventory already has that
- No image handling or database work

This skill focuses on the **mechanics** that make card effects work, not the individual effects themselves.
```

- [ ] **Step 3: Verify the file is valid**

Read `.claude/skills/analyze-expansion/SKILL.md` and confirm:
- Frontmatter has `name` and `description` fields
- All template sections use `[name]` or `[Expansion Name]` placeholders (not real expansion names)
- No TODO/TBD placeholders remain
- The document format example is inside a markdown code fence

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/analyze-expansion/SKILL.md
git commit -m "feat: add /analyze-expansion skill for collaborative rules analysis

New skill in the expansion pipeline — sits between inventory finalization
and code implementation. Produces a mechanics reference document covering
keywords, card types, game systems, and solo mode decisions for both
Golden Solo and What If? modes."
```

---

### Task 2: Rewrite `/new-expansion` Skill

**Files:**
- Replace: `.claude/skills/new-expansion/SKILL.md`

- [ ] **Step 1: Write the new skill file**

Replace the entire contents of `.claude/skills/new-expansion/SKILL.md` with this exact content:

```markdown
---
name: new-expansion
description: Multi-phase code integration for a Marvel Legendary expansion. Consumes finalized inventory + mechanics reference to add card data, images, setup screen entries, and all card effects. Supports multi-session work with progress tracking.
---

# New Expansion — Code Integration

Multi-phase skill that takes a fully analyzed expansion and builds it into the game. This is the final step in the expansion pipeline.

**Pipeline position:** `/stage-expansion` → `/inventory-creator` → `/inventory-verifier` → user spot-check → `/analyze-expansion` → **`/new-expansion` (this skill)**

---

## Interaction Model

The user wants to be involved in decisions about **gameplay** but not the code itself. Surface checkpoints about game logic; handle code details autonomously.

---

## Phase 0: Pre-flight Check

Before any work, verify ALL prerequisites exist:

1. **Finalized inventory** — `docs/card-inventory/final/[name].md` exists and has no `⏳` sections
2. **Mechanics reference** — `docs/expansion-mechanics/[name].md` exists and `Status:` says "Complete"
3. **Staged images** — `expansions/[name]/` has organized subfolders (Heroes/, Villains/, etc.)
4. **Rules PDF** — accessible in `rules/` or `expansions/[name]/`

**If anything is missing, stop and tell the user what's needed. Do not proceed.**

### Resume Check

If `docs/expansion-progress/[name].md` exists, read it and report current status:
> "Picking up where we left off — Phases 1-2 are complete, Phase 3b (Heroes) is in progress. [Hero1] and [Hero2] are done, [Hero3] is next. Ready to continue?"

If no progress file exists, create one (see Progress Tracking section at the end).

---

## Phase 1: Card Data + Image Import

### 1a: Import Images

Copy staged images from `expansions/[name]/` into production folders following the import mapping:

| Staging subfolder | Production folder |
|---|---|
| `Heroes/` | `Visual Assets/Heroes/[Expansion Display Name]/` |
| `Villains/` | `Visual Assets/Villains/` |
| `Masterminds/` | `Visual Assets/Masterminds/` |
| `Schemes/` | `Visual Assets/Schemes/` |
| `Henchmen/` | `Visual Assets/Henchmen/` |
| `Bystanders/` | `Visual Assets/Other/Bystanders/` |
| `Sidekicks/` | `Visual Assets/Sidekicks/` |

Only copy subfolders that exist in the staging area.

### 1b: Add Card Data to cardDatabase.js

Add all card entries pulling structured data directly from the inventory file. Follow the existing format in `cardDatabase.js` — use a nearby expansion's entries as the template for field order and naming.

For each card entry:
- All structured fields (name, cost, team, classes, attack, recruit, rarity, etc.) come from the inventory
- `image` path points to the production location from Step 1a
- `unconditionalAbility` and `conditionalAbility` reference function names that will be created in Phase 3 — use the standard naming convention: `camelCaseHeroNameCardTitle`
- For villain/mastermind/scheme entries, follow the same field patterns as existing expansions

### Checkpoint

Show the user a summary:
> "Added [N] heroes ([M] cards), [N] villain groups ([M] cards), [N] mastermind(s) ([M] tactics), [N] scheme(s), [N] henchmen group(s). Here's the roster: [list]. Does this match what you'd expect?"

### Update progress file: Phase 1 ✅

---

## Phase 2: Setup Screen Registration

1. Add expansion heroes to the hero selection area in `index.html` — follow the pattern of existing expansion hero entries
2. Add villain groups, schemes, masterminds to their respective dropdowns/selection areas
3. Add a `<script>` tag for the new expansion file in the loading chain — find where the existing expansion scripts are loaded (nested `onload` callbacks) and add the new one in sequence
4. Create `expansion[Name].js` with a basic skeleton:

```js
// [Expansion Name] Expansion
// [date]

// --- KEYWORDS & HELPERS ---

// --- HERO CARD ABILITIES ---

// --- VILLAIN CARD EFFECTS ---

// --- SCHEME TWIST EFFECTS ---

// --- MASTERMIND EFFECTS ---

// --- HENCHMEN EFFECTS ---
```

### Checkpoint

> "The expansion is now registered in the game. You should be able to open index.html, see [Expansion Name] in all the dropdowns, and start a game — cards will appear with images but no special effects yet. Want to test that before I start on effects?"

### Update progress file: Phase 2 ✅

---

## Phase 3: Effect Implementation

Broken into sub-phases by card type. **Each sub-phase can be its own session** — check the progress file to know where to resume.

Read the mechanics reference document at the start of this phase (or at resume) to refresh context on all keyword implementations and solo mode decisions.

### 3a: Keywords & Helpers

Implement keyword functions defined in the mechanics reference. These are shared functions that individual card abilities will call.

For each keyword:
- Refer to the mechanics reference for the agreed implementation approach
- Follow the complexity rating: "Fits cleanly" = expansion file only; "New capability" = new helpers in expansion file; "Core engine change" = modify script.js per the agreed approach
- If the mechanics reference lists core engine changes, implement those first

**Checkpoint:** For each keyword, explain what it does in gameplay terms:
> "[Keyword] is now implemented. When a card has [Keyword] [N], it means [plain English explanation]. Does that match your understanding?"

### 3b: Hero Abilities

One hero at a time, all 4 cards per hero. For each card:
- Read the effect text from the inventory file
- Implement the function referenced in the `cardDatabase.js` entry
- Use `async` for any function that may trigger popups, draws, or player choices — and grep all call sites to ensure `await` is present
- Follow Golden Solo rules: `processVillainCard()` not `drawVillainCard()`, conditional `goldenRefillHQ()` for HQ manipulation, silent skip for "other player" effects
- Follow the attack-granting pattern: update both `totalAttackPoints` and `cumulativeAttackPoints`, call `updateGameBoard()`

**Checkpoint per hero:**
> "[Hero Name] — 4 cards implemented. Here's what each does:
> - [Card 1]: [gameplay description]
> - [Card 2]: [gameplay description]
> - [Card 3]: [gameplay description]
> - [Card 4]: [gameplay description]
> Does this match the cards?"

### 3c: Villain Effects

For each villain group, implement ambush, fight, and escape effects. Reference the inventory for exact effect text and the mechanics reference for any keywords or special mechanics.

**Checkpoint per villain group:**
> "[Group Name] — [N] cards implemented. Key effects: [summary of notable ambush/fight/escape behaviors]. Does this match?"

### 3d: Mastermind Effects

Implement master strike, lead card ability, and all tactic effects. Pay special attention to:
- Mastermind names must match `cardDatabase.js` exactly
- Tactic fight effects often involve complex interactions
- Epic variants if present

**Checkpoint:**
> "[Mastermind Name] implemented. Master Strike does [X]. Tactics: [summary of each]. Does this match?"

### 3e: Scheme Effects

Implement scheme twist effects, any setup modifications, and evil wins conditions. Schemes are often the most complex — they can modify core game flow.

Refer to the mechanics reference for any schemes flagged as "Core engine change."

**Checkpoint per scheme:**
> "[Scheme Name] — Setup: [description]. Twist: [what happens]. Evil Wins: [condition]. Does this match?"

### 3f: Henchmen / Other

Implement henchmen fight effects, bystander rescue effects, and any expansion-specific card type effects (Locations, Traps, Horrors, etc.).

**Checkpoint:**
> "[Type] effects implemented: [summary]. Does this match?"

### Update progress file after each sub-phase completes

---

## Phase 4: Validation & Testing

### 4a: Expansion Validator

Run the expansion-validator subagent against the new expansion file:
> Use `.claude/agents/expansion-validator.md` — it checks all 7 Golden Solo compatibility rules.

Present results to the user in plain English:
> "Validation results: [N] of 7 rules passed. [Details of any failures and what the fix does]."

Fix any issues found, then re-run until all 7 rules pass.

### 4b: JS Syntax Check

Run an explicit syntax check on the new expansion file (beyond the automatic hook):
```bash
node --check expansion[Name].js
```

### 4c: Guided Test Game

Suggest a test setup that exercises the expansion's key mechanics:
> "For testing, I'd suggest: [Mastermind] with [Scheme], heroes: [list that includes new + existing heroes]. This setup will exercise [keyword], [mechanic], and [interaction]. Ready to try it?"

Walk the user through what to look for during the test game.

### Update progress file: Phase 4 ✅, Status → Complete

---

## Progress Tracking

Create and maintain `docs/expansion-progress/[name].md`:

```markdown
# [Expansion Name] — Implementation Progress

Started: YYYY-MM-DD
Status: In Progress

## Phase 0: Pre-flight — ✅ Complete

## Phase 1: Card Data + Images — ⬜ Not started
<!-- After completion: ✅ Complete — [N] heroes, [N] villain groups, [N] masterminds, [N] schemes added -->

## Phase 2: Setup Screen — ⬜ Not started

## Phase 3: Effects — ⬜ Not started
- 3a Keywords: ⬜
- 3b Heroes: ⬜
- 3c Villains: ⬜
- 3d Mastermind: ⬜
- 3e Schemes: ⬜
- 3f Henchmen/Other: ⬜

## Phase 4: Validation — ⬜ Not started
```

**Update this file at the end of every phase and sub-phase.** Use:
- ✅ Complete (with summary)
- ⬜ Not started
- ⏳ In progress (with details of what's done within the phase)

For Phase 3b (Heroes), track individual heroes:
```
- 3b Heroes: ⏳ — ✅ Hero1, ✅ Hero2, ⬜ Hero3, ⬜ Hero4, ⬜ Hero5
```
```

- [ ] **Step 2: Verify the file is valid**

Read `.claude/skills/new-expansion/SKILL.md` and confirm:
- Frontmatter has `name` and `description` fields
- All template sections use `[name]` or `[Expansion Name]` placeholders
- No TODO/TBD placeholders remain
- Phase numbering is sequential (0, 1, 2, 3, 4)
- All code examples are inside fences
- Golden Solo rules (processVillainCard, goldenRefillHQ, attack point pairing, updateGameBoard) are referenced in Phase 3

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/new-expansion/SKILL.md
git commit -m "feat: rewrite /new-expansion as multi-phase code integration skill

Replaces the old monolithic skill that tried to extract card data from
PDFs. Now consumes finalized inventory + mechanics reference docs.
Organized into 5 phases (pre-flight, card data, setup screen, effects,
validation) with progress tracking for multi-session work."
```

---

### Task 3: Create Output Directories

**Files:**
- Create: `docs/expansion-mechanics/.gitkeep`
- Create: `docs/expansion-progress/.gitkeep`

- [ ] **Step 1: Create both directories with .gitkeep files**

```bash
mkdir -p docs/expansion-mechanics docs/expansion-progress
touch docs/expansion-mechanics/.gitkeep docs/expansion-progress/.gitkeep
```

- [ ] **Step 2: Verify directories exist**

```bash
ls -la docs/expansion-mechanics/ docs/expansion-progress/
```

Expected: Each directory contains a `.gitkeep` file.

- [ ] **Step 3: Commit**

```bash
git add docs/expansion-mechanics/.gitkeep docs/expansion-progress/.gitkeep
git commit -m "chore: create output directories for expansion pipeline

docs/expansion-mechanics/ — mechanics reference docs from /analyze-expansion
docs/expansion-progress/ — implementation progress files from /new-expansion"
```

---

### Task 4: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

There are 4 specific changes needed. Each step shows the exact old text to find and new text to replace it with.

- [ ] **Step 1: Update the Planned Work section**

Find this text in the "Planned Work" section:

```
   - ⛔ **`/new-expansion` IS NOT READY** — do not invoke it under any circumstances. It predates the inventory approach and needs a full review/rewrite once all expansions are staged.
```

Replace with:

```
   - `/analyze-expansion` → `/new-expansion` pipeline is ready. Run `/analyze-expansion` first (produces mechanics reference), then `/new-expansion` (multi-phase code integration with progress tracking).
```

- [ ] **Step 2: Update the stage-expansion "Do NOT invoke" note**

Find this text in the Staging Process section:

```
10. Do NOT invoke `/new-expansion` during staging — that skill is for code implementation only
```

Replace with:

```
10. Do NOT invoke `/new-expansion` or `/analyze-expansion` during staging — those skills are for the implementation phase after inventory is finalized
```

- [ ] **Step 3: Update the Automations section — replace the old new-expansion entry and add analyze-expansion**

Find this line in the Automations section:

```
- **Skill**: `.claude/skills/new-expansion/SKILL.md` — ⛔ NOT READY, do not invoke — needs full review/rewrite after all expansions are staged
```

Replace with:

```
- **Skill**: `.claude/skills/analyze-expansion/SKILL.md` — collaborative rules analysis; reads rules PDF + inventory, works through mechanics one-by-one with user, produces mechanics reference doc in `docs/expansion-mechanics/`; invoke with `/analyze-expansion`
- **Skill**: `.claude/skills/new-expansion/SKILL.md` — multi-phase code integration; consumes inventory + mechanics reference, handles image import, card data, setup screen, effects, and validation with progress tracking in `docs/expansion-progress/`; invoke with `/new-expansion`
```

- [ ] **Step 4: Update the expansion-validator entry to remove "also not ready"**

Find this line:

```
- **Subagent**: `.claude/agents/expansion-validator.md` — validates a finished expansion JS file against all 7 Golden Solo compatibility rules; run as the final step of `/new-expansion` (also not ready)
```

Replace with:

```
- **Subagent**: `.claude/agents/expansion-validator.md` — validates a finished expansion JS file against all 7 Golden Solo compatibility rules; run as Phase 4 of `/new-expansion`
```

- [ ] **Step 5: Verify all changes**

Read the modified sections of `CLAUDE.md` and confirm:
- No remaining "NOT READY" or "do not invoke" warnings about `/new-expansion`
- `/analyze-expansion` appears in both the Planned Work section and Automations section
- The expansion-validator entry no longer says "also not ready"
- No other references to the old skill behavior remain

Search for any stray references:

```bash
grep -n "NOT READY\|not ready\|do not invoke.*new-expansion\|predates" CLAUDE.md
```

Expected: Zero matches related to `/new-expansion`.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for expansion pipeline redesign

Replace 'not ready' warnings with active skill descriptions for
/analyze-expansion and /new-expansion. Update cross-references in
Planned Work, Staging Process, and Automations sections."
```

---

### Task 5: Update expansion-pipeline-status.md

**Files:**
- Modify: `docs/expansion-pipeline-status.md`

- [ ] **Step 1: Read the current pipeline status file**

Read `docs/expansion-pipeline-status.md` to find where the pipeline steps are described.

- [ ] **Step 2: Add Steps 5 and 6 to the pipeline description**

Add the two new steps to whatever pipeline overview section exists. The exact edit depends on the current file structure, but the content to add is:

After the existing steps (Stage → Inventory → Verify → Spot-check), add:

```
| 5. Analyze | `/analyze-expansion` | Finalized inventory + rules PDF | Mechanics reference in `docs/expansion-mechanics/` |
| 6. Implement | `/new-expansion` | Inventory + mechanics ref + staged images + rules PDF | Playable expansion in the game |
```

Also add a new column or status indicator for these steps in each expansion's row, showing them as "Not started" for all expansions.

- [ ] **Step 3: Commit**

```bash
git add docs/expansion-pipeline-status.md
git commit -m "docs: add analyze + implement steps to pipeline status

Extends the pipeline table with Steps 5 (/analyze-expansion) and 6
(/new-expansion) for all expansions."
```
