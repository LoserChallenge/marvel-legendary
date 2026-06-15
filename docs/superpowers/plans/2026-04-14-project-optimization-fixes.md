# Project Optimization Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address 5 workflow friction points identified in the 2026-04-14 project optimization audit — ranging from a session-breaking stale path (do immediately) to longer-term config hygiene.

**Architecture:** All tasks are doc or config edits — no game code touched. Tasks are fully independent and can be done in any order, but priority order is recommended. Tasks 1–2 target the Revelations worktree; Tasks 3–4 target master; Task 5 requires a design decision before implementation.

**Tech Stack:** Markdown, JSON

---

## Priority Overview

| Priority | Task | Effort | Where |
|----------|------|--------|-------|
| 🔴 P1 — Do now | Fix stale fix plan path | 2 min | Worktree |
| 🟠 P2 — Do now | Add status column to playtest issue table | 5 min | Worktree |
| 🟡 P3 — This session | Trim CLAUDE.md inline pipeline status | 5 min | Master |
| 🟡 P4 — This session | Purge dead `mv` entries from settings.local.json | 10 min | Master |
| 🔵 P5 — Decision needed | CLAUDE.md/worktree sync enforcement | 15 min | Master + hooks |

---

## Task 1 (P1): Fix Stale Fix Plan Path in Revelations Progress File

**Files:**
- Modify: `.worktrees/revelations/docs/expansion-progress/revelations.md` — line 62
- Modify: `docs/expansion-progress/revelations.md` — line 62 (master copy, same fix)

**Why this is P1:** Any new session starting on Revelations Phase 4 reads this file first and hits a dead end — the referenced plan file doesn't exist at the path listed. Two-second fix that prevents a real failure.

- [ ] **Step 1: Fix the path in the worktree copy**

In `.worktrees/revelations/docs/expansion-progress/revelations.md`, find line 62:

```
**Fix plan:** `C:\Users\Paul\.claude\plans\temporal-coalescing-kettle.md`
```

Replace with:

```
**Fix plan:** `docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md` (inside worktree)
```

- [ ] **Step 2: Fix the same line in the master copy**

In `docs/expansion-progress/revelations.md`, apply the identical change to line 62.

- [ ] **Step 3: Verify the plan file actually exists at the new path**

Confirm `.worktrees/revelations/docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md` exists before committing. (It does — this was confirmed during the optimization audit.)

- [ ] **Step 4: Commit (master copy only — worktree commits separately)**

```bash
git add docs/expansion-progress/revelations.md
git commit -m "fix: correct stale fix plan path in Revelations progress file"
```

---

## Task 2 (P2): Add Status Column to Revelations Phase 4 Playtest Issue Tables

**Files:**
- Modify: `.worktrees/revelations/docs/expansion-progress/revelations.md` — the two issue tables under "Phase 4 Playtest Results"

**Why this is P2:** Every Revelations session checks this table to orient on what's done vs. pending. Right now all 9 issues look equally "open" — there's no way to see at a glance which fixes are applied.

- [ ] **Step 1: Add Status column to Tier 1 table**

Find the Tier 1 table (lines ~41–47):

```markdown
| ID | Issue | Root Cause |
|----|-------|-----------|
| 1A | Earthquake scheme not transforming, city stays at 5 spaces | `transformScheme()` swaps scheme but no city resize function exists |
| 1B | Klaw capture not functioning — "NO CAPTURED HERO TO GAIN" | `capturedHero` property lost when villain card cloned into city array |
| 1C | Mandarin attack modifiers missing (+1 Ring in city, -3 per Ring in VP) | `recalculateMastermindAttack()` has no Mandarin-specific logic |
| 1D | Locations enter city silently — no console announcement | `placeLocation()` uses `console.log()` instead of `onscreenConsole.log()` |
```

Replace with (fill in statuses based on current knowledge before committing — see note):

```markdown
| ID | Issue | Root Cause | Status |
|----|-------|-----------|--------|
| 1A | Earthquake scheme not transforming, city stays at 5 spaces | `transformScheme()` swaps scheme but no city resize function exists | ⏳ Pending |
| 1B | Klaw capture not functioning — "NO CAPTURED HERO TO GAIN" | `capturedHero` property lost when villain card cloned into city array | ⏳ Pending |
| 1C | Mandarin attack modifiers missing (+1 Ring in city, -3 per Ring in VP) | `recalculateMastermindAttack()` has no Mandarin-specific logic | ⏳ Pending |
| 1D | Locations enter city silently — no console announcement | `placeLocation()` uses `console.log()` instead of `onscreenConsole.log()` | ✅ Fixed 2026-04-13 |
```

**Note:** Before committing, Paul should confirm the status of 1A, 1B, and 1C based on what was actually applied in the 2026-04-13 session. CLAUDE.md mentions 1C Part B failed — update accordingly (e.g., 🔄 Partial if some sub-steps are done).

- [ ] **Step 2: Add Status column to Tier 2 table**

Find the Tier 2 table (lines ~49–56):

```markdown
| ID | Issue | Affected Functions |
|----|-------|--------------------|
| 2A | KO from discard: blank popup, auto-picks cheapest (×3) | `mandarinRingIncandescence`, `brothersGrimmFight`, `warMachineHypersonicCannonSuper` |
| 2B | KO from discard: no popup, silent auto-KO (×2) | `sentryFight`, `grimReaperCultOfSkulls` |
| 2C | Mandarin Master Strike auto-picks Ring from VP | `mandarinMasterStrike` (normal + epic) |
| 2D | Other auto-pick effects (×2) | `mandarinRingRemaker`, `grimReaperMazeOfBones` |
| 2E | Partial KO stubs (×2) | `mandarinDragonOfHeavenSpaceship` (skipped), `...LocationFight` (KOs 1 not 2) |
```

Replace with:

```markdown
| ID | Issue | Affected Functions | Status |
|----|-------|--------------------|--------|
| 2A | KO from discard: blank popup, auto-picks cheapest (×3) | `mandarinRingIncandescence`, `brothersGrimmFight`, `warMachineHypersonicCannonSuper` | ⏳ Pending |
| 2B | KO from discard: no popup, silent auto-KO (×2) | `sentryFight`, `grimReaperCultOfSkulls` | ⏳ Pending |
| 2C | Mandarin Master Strike auto-picks Ring from VP | `mandarinMasterStrike` (normal + epic) | ⏳ Pending |
| 2D | Other auto-pick effects (×2) | `mandarinRingRemaker`, `grimReaperMazeOfBones` | ⏳ Pending |
| 2E | Partial KO stubs (×2) | `mandarinDragonOfHeavenSpaceship` (skipped), `...LocationFight` (KOs 1 not 2) | ⏳ Pending |
```

- [ ] **Step 3: Commit in the worktree**

From `.worktrees/revelations/`:

```bash
git add docs/expansion-progress/revelations.md
git commit -m "docs: add status column to Phase 4 playtest issue tables"
```

---

## Task 3 (P3): Trim CLAUDE.md Inline Pipeline Status

**Files:**
- Modify: `CLAUDE.md` — "Planned Work" section, "Current position" paragraph
- Modify: `.worktrees/revelations/CLAUDE.md` — same section (keep in sync)

**Why this is P3:** CLAUDE.md's own design principle is the reference/proxy strategy for frequently-updated content, but the "Current position" paragraph maintains a manually-updated expansion list that duplicates `docs/expansion-pipeline-status.md`. Every pipeline session has to update both.

- [ ] **Step 1: Replace the inline paragraph in master CLAUDE.md**

Find this block in the "Planned Work" section:

```markdown
   - **Current position (2026-04-13):** 10 expansions finalized in `card-inventory/final/` (Into the Cosmos complete). Pass 1 complete, awaiting Pass 2: weapon-x, shield. Staged and awaiting Pass 1: messiah-complex, shadows-of-nightmare, the-new-mutants, world-war-hulk. All expansions now staged.
```

Replace with:

```markdown
   - **Current position:** See `docs/expansion-pipeline-status.md` for full pipeline status. Active focus: Revelations Phase 4 (fix plan + playtest, on `revelations` branch).
```

- [ ] **Step 2: Apply the same change to the worktree CLAUDE.md**

Make the identical edit to `.worktrees/revelations/CLAUDE.md`.

- [ ] **Step 3: Commit master copy**

```bash
git add CLAUDE.md
git commit -m "docs: replace inline pipeline status in CLAUDE.md with proxy pointer"
```

---

## Task 4 (P4): Purge Dead Staging Entries from settings.local.json

**Files:**
- Modify: `.claude/settings.local.json`

**Why this is P4:** The file has grown to 151 lines mostly from one-time `mv` staging commands that have already been executed and will never match again. This makes it hard to audit what's actually auto-allowed.

- [ ] **Step 1: Replace the `allow` array with only the entries worth keeping**

Open `.claude/settings.local.json` and replace the entire `permissions.allow` array with this:

```json
"allow": [
  "Skill(claude-md-management:revise-claude-md)",
  "Skill(claude-md-management:revise-claude-md:*)",
  "Skill(hookify:help)",
  "Skill(hookify:help:*)",
  "Bash(gh api:*)",
  "Bash(gh run:*)"
]
```

Keep the `allowedTools` section at the bottom unchanged (git commands live there).

**What's being removed:** All `Bash(mv ...)`, `Bash(mkdir -p ...)`, `Bash(grep -n ...)`, `Bash(pdftotext ...)`, `Bash(python3 ...)`, `Bash(BASE=...)`, `Read(//d/...)`, and other one-time staging commands. These ran once and the files they targeted no longer exist in their pre-staged form.

**Tradeoff:** If an identical command somehow runs again, you'll get a permission prompt instead of auto-approval. That's the right behavior — it means you'll see what's happening.

- [ ] **Step 2: Verify the file is valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/settings.local.json','utf8')); console.log('Valid JSON')"
```

Expected output: `Valid JSON`

- [ ] **Step 3: Commit**

```bash
git add .claude/settings.local.json
git commit -m "chore: purge dead staging mv entries from settings.local.json"
```

---

## Task 5 (P5): CLAUDE.md / Worktree Sync Enforcement

**Files (depends on option chosen):**
- Option A: `.claude/settings.json` — add a PreToolUse hook
- Option B: Docs update only — revise the sync rule in `CLAUDE.md`

**Decision required before implementing.** Two options — Paul should pick one:

### Option A — Warning Hook
Add a PreToolUse hook that fires when `CLAUDE.md` is edited and checks whether both copies are in sync. If they differ, it logs a warning before proceeding.

**Pros:** Automatic — catches drift at the moment it happens, no memory required.
**Cons:** Adds hook complexity; fires on every CLAUDE.md edit even when the diff is intentional (worktree-only gotcha being added).

Implementation: Add to `.claude/settings.json` `PreToolUse` → `Edit|Write` hooks:

```json
{
  "type": "command",
  "command": "node -e \"process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const f=(JSON.parse(d).tool_input||{}).file_path||'';if(!f.endsWith('CLAUDE.md'))return;const fs=require('fs');const wt='.worktrees/revelations/CLAUDE.md';const main='CLAUDE.md';if(fs.existsSync(wt)&&fs.existsSync(main)){const a=fs.readFileSync(main,'utf8');const b=fs.readFileSync(wt,'utf8');if(a!==b)console.error('CLAUDE.md SYNC WARNING: master and worktree copies differ. Intentional? If not, sync before editing.');}}catch(e){}});\""
}
```

### Option B — Flip Sync Direction (lighter weight)
Change the CLAUDE.md rule so the worktree is the single source during active feature work, and master only gets updated at merge time (as part of the expansion merge checklist). No hook needed.

Update the "Worktree-vs-Master Edit Rule" in CLAUDE.md to add:

```markdown
- **During active expansion work:** treat the worktree's CLAUDE.md as the live copy. 
  Master's copy is intentionally stale until merge — do NOT sync mid-branch. 
  Add a CLAUDE.md sync step to the expansion merge checklist in `/new-expansion`.
```

**Pros:** Zero hook complexity; makes the "two copies" situation explicit and intentional rather than a failure mode.
**Cons:** Relies on the merge checklist being followed; master copy is always stale during feature work.

- [ ] **Step 1: Choose Option A or Option B and implement the corresponding change above**

- [ ] **Step 2 (Option A only): Test the hook fires correctly**

Edit `CLAUDE.md` with a trivial whitespace change. Confirm the hook warning appears in the terminal. Then revert.

- [ ] **Step 3: Commit**

```bash
# Option A:
git add .claude/settings.json
git commit -m "chore: add CLAUDE.md sync warning hook"

# Option B:
git add CLAUDE.md
git commit -m "docs: clarify worktree-as-source sync strategy during active branches"
```

---

## Self-Review

**Spec coverage:** All 5 opportunities from the 2026-04-14 optimization report have tasks. ✅

**Placeholder scan:** No TBDs or vague steps. Task 2 has a note about Paul confirming fix statuses before committing — that's intentional, not a placeholder gap. ✅

**Consistency:** No functions or types referenced — all doc/config changes. ✅
