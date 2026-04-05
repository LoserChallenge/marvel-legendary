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
