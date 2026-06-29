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

## Phase 2.5: Author & Freeze Per-Card Behavioral Specs (the build-time check)

This is the layer that was missing in Revelations: a per-card **behavioral check authored BEFORE any effect code exists**, whose centerpiece is an **executable `/game-test` assertion**. A static document alone is not verification — it is the scaffolding that produces the assertion. The assertion is what catches the bug classes that actually hurt (dead triggers that never fire, stub functions that only log, auto-pick shortcuts) — static review reads those as plausible and misses them.

**Save to** `docs/expansion-specs/[name].md`. **Freeze it (commit) before writing a single line of Phase 3 effect code.** Freezing intent before the code exists is the non-negotiable floor: it stops the later audit from rationalizing whatever the code does back into "I guess that's what the card meant." Temporal ordering secures that benefit on its own.

### What gets a spec, and how deep

Scope spec depth to card complexity:
- **Trivial / vanilla** (e.g. plain "+2 Attack", "+1 Recruit", a Wound with no rider) — one-line spec, assertion optional.
- **Non-trivial** (any trigger, choice, draw, KO, villain/HQ interaction, keyword, transform, setup change) — full spec with a concrete executable assertion.

If a card *looks* vanilla but its intent is genuinely uncertain, **promote it to non-trivial** so it gets a full spec block and can carry a `confidence: LOW` flag — never let ambiguity hide behind "it's just +2 Attack." Confidence overrides complexity.

### Per-card spec format

For each non-trivial card:

```markdown
### [Card Name]  (confidence: HIGH | LOW)
- **Effect text:** [verbatim from inventory] — *(inventory stamp: docs/card-inventory/final/[name].md, YYYY-MM-DD)*
- **Intended behavior:** [plain English — what should observably happen]
- **Engine function / pattern:** [from engine-gotchas.md + the Prior Art & Reuse Candidates section of the mechanics doc — reuse before building]
- **Interaction risks:** [cross-reference docs/card-inventory/references/ for how this interacts with existing cards/keywords]
- **Executable assertion:** Set up state S → play/trigger the card → assert observable result R. (This becomes the `/game-test` run in Phase 3.)
```

**Inputs to consult while authoring (Change 3 reference wiring):**
- `docs/engine-gotchas.md` — which engine function/field the effect must touch (e.g. `attackFromOwnEffects` not `card.attack`), known traps.
- `docs/expansion-mechanics/[name].md` → **Prior Art & Reuse Candidates** — reuse an existing implementation before writing a new one.
- `docs/card-inventory/references/` — original-game card text, for the interaction-risk cross-reference.

### The two flags that protect the check

- **Confidence flag (per card).** If the card's intent is unclear (ambiguous text, novel interaction) — mark `confidence: LOW`. **A LOW card gets a mandatory dynamic `/game-test` in Phase 3 regardless of complexity scoping.** This is the guard against a misread card silently becoming a wrong spec, and it overrides the complexity carve-out — a genuinely ambiguous card is never waved through on "it's just +2 Attack" grounds.
- **Inventory stamp (staleness guard).** Stamp each card's spec with the inventory file + date it was derived from. If that card's inventory text changes after the spec is frozen, **regenerate the spec** — otherwise a late inventory edit silently turns the frozen spec into a wrong contract.

### Authoring vs auditing separation

The spec authored here is the **contract**. In Phase 4, `/expansion-audit`'s card-type auditors **blind-compare the code to this frozen spec — they do NOT re-derive intent from the card.** Same-lens-end-to-end (one pass reads the card, writes the spec, AND audits the code against it) shares a single blind spot: a misread card → wrong spec → clean audit against the wrong spec. Freezing the spec here, and having a separate Phase-4 lens compare code to it, breaks that chain.

### Checkpoint

> "Before I write any effect code, here are the behavioral specs for [N] non-trivial cards — what each should do and how I'll test it. [X] are flagged LOW-confidence and will get a forced in-game test. Anything here that doesn't match how the cards actually play?"

Get the user's read on the LOW-confidence cards especially — that's where their gameplay knowledge resolves ambiguity the spec can't.

### Freeze and update progress file: Phase 2.5 ✅ (spec committed before Phase 3)

---

## Phase 3: Effect Implementation

Broken into sub-phases by card type. **Each sub-phase can be its own session** — check the progress file to know where to resume.

Read the mechanics reference document at the start of this phase (or at resume) to refresh context on all keyword implementations and solo mode decisions.

**Build against the frozen Phase 2.5 spec, not from the card cold.** For each non-trivial card, implement to the spec's intended-behavior + engine-function line, then **run its executable assertion via `/game-test`** before calling that card done — execution is the only thing that catches dead triggers (wired but never fires) and stub functions (body is log-only) that read as plausible on a glance. **Any card flagged `confidence: LOW` in the spec gets a mandatory dynamic `/game-test` regardless of how simple it looks.** Do not advance a sub-phase until its non-trivial cards' assertions pass. **Every per-sub-phase checkpoint (3b–3f) must lead with its assertion PASS/FAIL line; a checkpoint presented without one is incomplete — go run the assertions before showing it.** If reality contradicts the frozen spec, surface it to the user — don't silently rewrite the spec to match the code.

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
- **Build against the card's frozen Phase 2.5 spec** (intended-behavior + engine-function line) — not from the inventory cold
- Implement the function referenced in the `cardDatabase.js` entry
- Use `async` for any function that may trigger popups, draws, or player choices — and grep all call sites to ensure `await` is present
- Follow Golden Solo rules: `processVillainCard()` not `drawVillainCard()`, conditional `goldenRefillHQ()` for HQ manipulation, silent skip for "other player" effects
- Follow the attack-granting pattern: update both `totalAttackPoints` and `cumulativeAttackPoints`, call `updateGameBoard()`
- **Run the card's executable assertion via `/game-test`** — required for every non-trivial card, mandatory for any `confidence: LOW` card no matter how simple it looks
- **Heroes get a mandatory runtime backstop regardless of this scoping** — even a hero ability skipped here as trivial is runtime-tested by the Phase-4d Hero-Ability Behavioral Sweep before merge (dual-mode where 4d requires it)

**Checkpoint per hero — report the assertion results FIRST, then the gameplay summary:**
> "[Hero Name] — 4 cards implemented. **Assertions (from frozen spec): [Card → PASS/FAIL via /game-test; 'trivial, no assertion' where applicable].** Here's what each does:
> - [Card 1]: [gameplay description]
> - [Card 2]: [gameplay description]
> - [Card 3]: [gameplay description]
> - [Card 4]: [gameplay description]
> Does this match the cards?"

Do not present this checkpoint until every non-trivial card's assertion has actually been run. A checkpoint with no assertion line is incomplete.

### 3c: Villain Effects

For each villain group, implement ambush, fight, and escape effects. Reference the inventory for exact effect text and the mechanics reference for any keywords or special mechanics.

**Checkpoint per villain group:**
> "[Group Name] — [N] cards implemented. **Assertions (from frozen spec): [card → PASS/FAIL via /game-test].** Key effects: [summary of notable ambush/fight/escape behaviors]. Does this match?"

### 3d: Mastermind Effects

Implement master strike, lead card ability, and all tactic effects. Pay special attention to:
- Mastermind names must match `cardDatabase.js` exactly
- Tactic fight effects often involve complex interactions
- Epic variants if present

**Checkpoint:**
> "[Mastermind Name] implemented. **Assertions (from frozen spec): [Master Strike / each tactic → PASS/FAIL via /game-test].** Master Strike does [X]. Tactics: [summary of each]. Does this match?"

### 3e: Scheme Effects

Implement scheme twist effects, any setup modifications, and evil wins conditions. Schemes are often the most complex — they can modify core game flow.

Refer to the mechanics reference for any schemes flagged as "Core engine change."

**Checkpoint per scheme:**
> "[Scheme Name] — **Assertions (from frozen spec): [setup / twist / evil-wins → PASS/FAIL via /game-test; dual-mode where the mechanic checklist flags it].** Setup: [description]. Twist: [what happens]. Evil Wins: [condition]. Does this match?"

### 3f: Henchmen / Other

Implement henchmen fight effects, bystander rescue effects, and any expansion-specific card type effects (Locations, Traps, Horrors, etc.).

**Checkpoint:**
> "[Type] effects implemented. **Assertions (from frozen spec): [item → PASS/FAIL via /game-test].** [summary]. Does this match?"

### Update progress file after each sub-phase completes

---

## Phase 4: Validation & Testing

### 4a: Full Expansion Audit

Run the `/expansion-audit` skill for this expansion. It runs the full pipeline:
`engine-integration-auditor` → `expansion-validator` → six card-type auditors + `keyword-consistency-auditor` (parallel) → consolidated findings catalog at `docs/audit-results/<expansion>-<date>.md`.

The card-type auditors **blind-compare the code to the frozen Phase 2.5 spec** (`docs/expansion-specs/[name].md`) — they treat the spec as the contract and do NOT re-derive intent from the card. This is the authoring-vs-auditing separation: the spec was authored before the code, a different lens audits against it now. An auditor re-reads the card only when the frozen spec looks self-inconsistent.

Present the headline to the user:
> "Audit complete: [N] HIGH, [M] MEDIUM, [L] LOW findings across the pipeline. Catalog saved to [path]."

Then TRIAGE with the user:
- Walk each HIGH finding in plain English ("card says X, code does Y, here's how it plays").
- User makes the gameplay call: is the CODE wrong, or is the card-text/reference what's stale?
- Tag each finding: Fix Now / Defer / Reject.
- MEDIUM/LOW go into a sweep pass after HIGH is resolved.

Fix the Fix-Now findings, then re-run `/expansion-audit` until the merge gate is met.

**Merge gate:** HIGH count = 0, OR every remaining HIGH has a documented Defer rationale in the progress file.

### 4b: JS Syntax Check

Run an explicit syntax check on the new expansion file (beyond the automatic hook):
```bash
node --check expansion[Name].js
```

### 4c: Dual-Mode Gate (What If? + Golden)

`expansion-validator` is Golden-Solo-only, so What If? divergences are behavioral, not structural, and the validator cannot see them. Gate dual-mode testing deliberately:

1. **Run the mechanic checklist (authoritative gate).** Walk this expansion's new/modified mechanics against `docs/mode-divergence-checklist.md`. **Every mechanic that touches a row → a dual-mode `/game-test`** (run its Phase 2.5 assertion in both `gameMode === 'golden'` and `gameMode === 'whatif'`).
2. **Grep the expansion file (cheap first-pass signal, NOT proof):** `gameMode|isGolden|\bmode\b|'golden'|'whatif'`. Hits → exercise both modes for those branches. Zero hits → no *direct* branching in this file, low risk — but NOT a guarantee (divergence can live in a shared `script.js` helper the file calls). The checklist is the real gate; the grep is just a signal.

### 4d: Hero-Ability Behavioral Sweep — runtime-test every hero ability (hard done-criterion)

**Override the Phase-3b triviality carve-out for heroes: every new hero ability gets a
runtime behavioral `/game-test` — no hero card ships on static audit alone, none waved
through as "looks vanilla."** Static text-vs-code audit cannot observe runtime behavior
(SWV1: Magik "Dimensional Portal" wired +1 Attack per Sidekick but granted +0; Old Man
Logan "Loner" residual — both passed `/expansion-audit`, surfaced only in playtest). This
catches what 4c's checklist-scoping misses: a plain Attack grant touches no divergence row,
so 4c never tests it.

For each new hero card ability:
1. Inject a state that exercises the ability (N Sidekicks for a per-Sidekick bonus, a
   KO-eligible target, a known draw pile).
2. Assert the observable effect — Attack/Recruit delta, KO count, cards drawn — matches the
   frozen Phase 2.5 spec. Where the card grants Attack/Recruit, also assert the Final Showdown
   cumulative (a flat card can update the turn total but miss `cumulative*` — a known gotcha).
3. **Dual-mode** (`gameMode === 'golden'` AND `'whatif'`; a pass in one mode is not a pass)
   when the ability is **conditional, computed, per-X, or touches a
   `docs/mode-divergence-checklist.md` row.** A flat unconditional Attack/Recruit with no
   rider — which cannot diverge by mode — may record a single-mode PASS.

Done-criterion: every new hero ability has a recorded runtime PASS (dual-mode where step 3
requires it) before Status → Complete. A FAIL or a missing run blocks the merge gate.

### 4e: Guided Test Game

Suggest a test setup that exercises the expansion's key mechanics:
> "For testing, I'd suggest: [Mastermind] with [Scheme], heroes: [list that includes new + existing heroes]. This setup will exercise [keyword], [mechanic], and [interaction]. Ready to try it?"

Walk the user through what to look for during the test game. For any mechanic the checklist flagged as mode-divergent, the test must cover **both** modes.

### Update progress file: Phase 4 ✅, Status → Complete

### Merge checklist (run before merging to master)

Before merging the expansion branch:
- [ ] All Phase 4 issues resolved and retested
- [ ] **Hero-ability behavioral sweep (4d):** every new hero ability has a runtime `/game-test` PASS — dual-mode for any conditional/computed/per-X or mode-divergent ability; no hero ability merges on static audit alone
- [ ] `/expansion-audit` run clean (0 unresolved HIGH findings, or all deferrals documented)
- [ ] `sw.js` `CACHE_NAME` bumped (e.g. `legendary-v4` → `legendary-v5`)
- [ ] New expansion JS file added to `FILES_TO_CACHE` in `sw.js`
- [ ] **Sync CLAUDE.md:** copy worktree's CLAUDE.md to master — `cp .worktrees/[branch]/CLAUDE.md CLAUDE.md` — so new branches cut from master inherit all gotchas added during this expansion's work

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

## Phase 2.5: Behavioral Specs frozen — ⬜ Not started
<!-- After completion: ✅ Complete — [N] specs in docs/expansion-specs/[name].md, committed before Phase 3, [X] LOW-confidence flagged -->

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
