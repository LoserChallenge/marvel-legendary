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
