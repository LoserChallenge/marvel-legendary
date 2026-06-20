# Revelations — Implementation Progress

Started: 2026-04-06
Status: In Progress

## Build Order (Infrastructure-First)

Revelations requires 7 core engine changes before content work.
Build order optimized to avoid rework — each layer builds on the previous.

### Block 1: Infrastructure

#### Step 1 — Dynamic City Refactor ✅ Complete (2026-04-06)
Merged to master. 25 named variables → 5 arrays, 264 references converted across 8 files, city HTML generated dynamically. Browser-tested with Portals to the Dark Dimension (PermBuff) and Galactus (TempBuff + CosmicThreat + destroyed spaces). Deferred: 11 renderCityCards() popup loops still use `i < 5` — fix when Earthquake/Tsunami scheme changes citySize.

#### Step 2 — Location System ✅ Complete (2026-04-06)
On `location-system` worktree branch (9 commits, not merged — merge when full expansion ready). `cityLocations[]` parallel array, fan-out CSS rendering (Location extends above cell at `top: -4vh`, villain shifts down via `margin-top: 5vh`), independent fight flow (`showLocationAttackButton` + `defeatLocation`), post-villain-fight trigger hooks, overflow (KO lowest-attack, player chooses ties), `generateVillainDeck` type preservation. Bugs fixed during testing: inverted `popupMinimized` click guard, `vp` → `victoryPoints` field name, missing space in console message.

#### Step 3 — Small Infrastructure Bundle ✅ Complete (2026-04-11)
- ✅ Epic Mastermind toggle (`getSelectedMastermind()` + setup screen UI)
- ✅ Unique henchmen `cards` array branch in `generateVillainDeck()`
- ✅ `transformScheme()` helper + `hiddenFromSetup` filtering
- ✅ Recruit-only fight cost (Mister Hyde — new affordability check branch)
- ⏳ Extra turn mechanism — deferred to Phase 3 content (Dark Dimension fight effect)

### Block 2: Content (standard /new-expansion phases)

#### Phase 1: Card Data + Images ✅ Complete (2026-04-12)
102 images copied to production folders. All card entries added to cardDatabase.js: 9 heroes (36 cards), 4 villain groups (26 entries), 3 masterminds (with epic + 12 tactics), 8 schemes (4 transforming pairs), 2 henchmen groups (HYDRA Base + 10 unique Mandarin's Rings), 3 named bystanders. Fixed class name ("Ranged" → "Range") and color mapping post-insert.

#### Phase 2: Setup Screen ✅ Complete (2026-04-12)
All Revelations content registered in index.html: heroes, villains, masterminds, schemes (Side A only), henchmen. Set filters updated. `expansionRevelations.js` added to script loading chain. Expansion file skeleton created.

#### Phase 3: Effects ✅ Complete (2026-04-12)
- 3a Keywords (Hyperspeed, Dark Memories, Last Stand): ✅ — reusable helpers + hyperspeedCountsBoth flag
- 3b Heroes (9): ✅ — 36 ability functions, all DB references verified
- 3c Villains (4 groups): ✅ — 26 cards, ambush/fight/escape effects, revealClassOrWound/Discard helpers
- 3d Masterminds (3 normal + 3 epic): ✅ — 6 master strikes, 12 tactic effects, tactic→Location placement
- 3e Schemes (4 transforming pairs): ✅ — 8 twist functions + 6 evil wins conditions in script.js
- 3f Henchmen + Bystanders: ✅ — HYDRA Base fight, 10 Ring fight effects, 3 bystander rescue effects

Deferred/placeholder items:
- Speedy Delivery (recruit-to-top flag), Military-Industrial Complex (defeat-for-recruit trigger), Overwhelming Firepower (defeat-for-draw trigger), Second Chance at Life (reactive cancel) — logged as reminders, need fight/recruit flow hooks
- Extra turn mechanism (Dark Dimension) — needs end-of-turn integration
- Mysterious Identity (Ronin) — class/team wildcard needs superpower condition checker update
- Location triggered effects (Laser Maze, Raft Prison, etc.) — stubs in place, trigger system wiring needed

#### Phase 4: Validation — In Progress
- ✅ Expansion validator run (6 issues found, fixed 2026-04-12)
- ✅ JS syntax check passed
- 🔄 Guided test game — first playtest 2026-04-12 found 9 issues; second playtest 2026-04-13 found 2 additional setup-validation gaps

## Phase 4 Playtest Results

First playtest (2026-04-12): Mandarin + Earthquake Drains the Ocean in Golden Solo mode.
Second playtest (2026-04-13): Fix 1C/1D verification session; surfaced additional setup-time validation gaps across Revelations transforming schemes.

### Tier 1 — Core Mechanics (game-breaking)
| ID | Issue | Root Cause | Status |
|----|-------|-----------|--------|
| 1A | Scheme transform not triggering visually for Earthquake / Secret HYDRA / Korvac / House of M | **Two cascading bugs (root-caused 2026-05-28):** (1) `transformScheme()` threw `ReferenceError: selectedScheme is not defined` on its first line — relied on a global that was never initialized. (2) Even after that fix, the image-swap selector `'#scheme-place img'` was matching the hidden BabyHope token, not the visible scheme card. Both fixed: lazy-init selectedScheme from setup-screen radio + selector now targets `.card-image` class. Verified in Playwright across all 4 transforming pairs. Still pending: city-size resize for Earthquake/Tsunami (5↔7↔3 spaces). | ✅ Transform mechanism fixed 2026-05-28; city-resize still pending |
| 1B | Klaw capture not functioning — "NO CAPTURED HERO TO GAIN" | `createVillainCopy()` whitelist at `script.js:12209` didn't include `capturedHero`; also `klawFight()` iterated `city[]` which is already nulled before fight effects run. Fixed by adding `capturedHero` to whitelist and rewriting `klawFight(klaw)` to use its parameter | ✅ Fixed 2026-04-15 |
| 1C | Mandarin attack modifiers missing (+1 Ring in city, -3 per Ring in VP) | `recalculateMastermindAttack()` has no Mandarin-specific logic | ✅ Fixed 2026-04-13 |
| 1D | Locations enter city silently — no console announcement | `placeLocation()` uses `console.log()` instead of `onscreenConsole.log()` | ✅ Fixed 2026-04-13 |
| 1E | Earthquake scheme doesn't enforce extra villain group requirement during setup (+1 over base mode) | Golden Solo branch of `getEffectiveSetupRequirements()` hardcoded `2` villain groups with no scheme-level override; added new `extraVillainGroups` field and applied it | ✅ Fixed 2026-04-14 |
| 1F | Secret HYDRA Corruption doesn't enforce 30-Officer S.H.I.E.L.D. stack requirement | DB `shieldOfficers` array only had 20 entries (SHIELD13–32); rulebook default is 30 for every game. Extended DB to 30 entries and added `shieldDeck` reset in `initGame()` (was previously never reset between games) | ✅ Fixed 2026-04-14 |

### Tier 2 — Player Choice UI (playable but wrong)
| ID | Issue | Affected Functions |
|----|-------|--------------------|
| 2A | ✅ Fixed 2026-04-16 — new `koUpToNFromDiscardPile(sourceName, maxCount=1)` helper; all 3 call sites reduced to one-liners | `mandarinRingIncandescence`, `brothersGrimmFight`, `warMachineHypersonicCannonSuper` |
| 2B | ✅ Fixed 2026-04-16 — reused `koUpToNFromDiscardPile(...,  2)` helper from 2A (FIFO multi-select) | `sentryFight`, `grimReaperCultOfSkulls` |
| 2C | ✅ Fixed 2026-04-16 — extracted `enterCityFromRight(card)` helper in `script.js` (placement + shift-left + escape, no ambush); `processRegularVillainCard` now calls it; new `pickRingFromVictoryPile(title)` shows card-choice popup when 2+ Rings in VP (auto-picks if 1); `mandarinStrike`/`epicMandarinStrike` rewritten to pick → enterCityFromRight | `mandarinStrike` / `epicMandarinStrike` |
| 2D | ✅ Fixed 2026-04-16 — new `takeOneFromDiscardToHand` (Remaker) and `revealTopNKOAny` (Maze of Bones) helpers | `mandarinRingRemaker`, `grimReaperMazeOfBones` |
| 2E | ✅ Fixed 2026-04-16 — new `koUpToNHeroesYouHave(sourceName, maxCount)` helper (multi-select FIFO, 2-row artifacts+hand/played layout, NO THANKS skip); both call sites pass maxCount=2; LocationFight switched to `async` | `mandarinDragonOfHeavenSpaceship`, `...LocationFight` |
| 2F | Chemistro Fight exchange effect — (1) bails out in Golden Solo mode with a "not supported" message (unnecessary; card is self-only, no multiplayer context), (2) even with bailout removed, auto-picks highest-cost played hero + best-matching HQ card instead of letting the player choose which played card to sacrifice and which HQ card to take. Found during 2026-04-17 playtest. | `chemistroFight` (expansionRevelations.js:1970) |

### Tier 3 — Known Deferred
| ID | Issue | Status |
|----|-------|--------|
| 3A | Scarlet Witch Chaos Magic — no play option for revealed copy | Expected deferred stub |
| 3B | Mandarin Ring attack modifier (+1) is missing from the **right-side card hover preview** — it correctly shows on the city card (+1 overlay) but the preview pane reads only the printed base attack. Fix 1C display pipeline doesn't cover the hover preview path. Found during 2026-04-17 playtest. | Display polish, low priority |
| 3C | Stray `console.log("[FIX1C-DIAG] ...")` debug statements left in `script.js:9951` and `script.js:9965` from Fix 1C instrumentation. Harmless (browser dev-tools only) but should be removed before merge to master. Found during 2026-05-27 Playwright regression run. | Cleanup before merge |

**Fix plan:** `docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md`
**Original execution order:** 1D → 1C → 1B → 2A → 2B → 2C → 2D → 2E → 1E → 1F → 1A (most complex last)
**Revised execution order (2026-04-15):** 1E → 1F → 1B → (1A diagnostic) → 2A → 2B → 2D → 2E → 2C → 1A (implementation)
**Progress:** Tier 1 all complete except 1A (scheme transform + city resize — diagnostic pending). Tier 2 complete (2026-04-16 — 2A/2B/2C/2D/2E all fixed). Next: 1A empirical diagnostic + implementation.

## Key Decisions (from /analyze-expansion)

See `docs/expansion-mechanics/revelations.md` for full details.

| Decision | Choice |
|---|---|
| Epic Masterminds | Option B — single entry with `epic` sub-object + setup toggle |
| Mandarin's Rings | Option B — expandable henchman template with `cards` array |
| Dynamic City | Approach A — full refactor in isolated worktree |
| Korvac (Golden Solo) | Defeating Korvac initiates Final Showdown |
| Korvac (What If?) | Defeating Korvac wins the game |
| House of M hero count | Follow scheme requirements in all modes |
| Sentry Fight effect | Void-only (Bank/Streets) |
| Mandarin's Rings in What If? | Open — decide during implementation |

## Expansion Audit Pipeline (built 2026-05-28, on this branch)

A pre-merge audit pipeline was designed and built on this branch (it's general tooling, not Revelations-specific, but lives here until merge per the one-branch-per-expansion strategy). It will be the standard pre-merge gate for all future expansions and runs inaugurally against Revelations.

- **Spec:** `docs/superpowers/specs/2026-05-28-expansion-audit-pipeline-design.md`
- **Plan:** `docs/superpowers/plans/2026-05-28-expansion-audit-pipeline.md`
- **Built:** `docs/audit-pipeline/engine-touchpoints.md` (reference), 9 subagents in `.claude/agents/` (engine-integration-auditor, pattern-reuse-scout, keyword-consistency-auditor, + 6 card-type auditors), `/expansion-audit` orchestrator skill. `card-effect-auditor` retired (superseded). `/analyze-expansion` (Step 5) and `/new-expansion` (Phase 4) integrated. All 6 card-type auditors include check (g) count & variant completeness (catches missing cards, non-standard villain splits, unique-vs-duplicate henchmen).
- **NOT yet run:** the inaugural Revelations audit (Task 15 of the plan) needs a fresh session — the new subagents aren't in this session's registry (loaded at startup). Fresh session: run `/expansion-audit Revelations`, confirm it catches the known bugs (E-1 transformScheme, House of M setup directive, Korvac conditional choice), dedupe against the fix plan, triage with Paul.

## Merge-to-Master Checklist (Revelations → master)

Run when Revelations is complete and ready to merge. The audit pipeline + count-check are built on this branch and travel automatically with the merge — no action needed for them. The items below are reconciliations where master and this branch both changed, or master-side cleanup the merge does NOT handle:

- [ ] **Reconcile `CLAUDE.md`** — both sides edited it. Branch has: Revelations gotchas + audit-pipeline Subagents/Skills entries. Master has: a workflow-preferences tweak (commit a972de5) + ~5 lines of uncommitted edits. Do not blind-overwrite; merge both sets of changes.
- [ ] **`/new-expansion` skill — take the branch version** of the Merge checklist section. The worktree copy was rebuilt as a superset of master's (master's 4 items + the new `/expansion-audit` clean item). Resolve any conflict in favor of this branch.
- [ ] **Clean up master's uncommitted working-tree cruft** (a merge does NOT touch this — handle directly on master): modified `CLAUDE.md` (~5 lines), deleted draft docs (`x-men.md`, `heroes-of-asgard.md`, `x-men-pass2-results.md`, `health-check-report-2026-03-30.md`, `card-effect-audit-results-2026-03-31-v2.md`), untracked `.playwright-mcp/`, `.claude/skills/game-test/`, `docs/superpowers/plans/2026-04-14-project-optimization-fixes.md`, `setup-screen.png`. Likely leakage from prior Revelations sessions run from the main folder. Decide commit-or-discard for each.
- [ ] **`card-effect-auditor.md` removal travels via merge** — master's copy gets deleted by the merge (branch deleted it). The worktree copy was moved to `D:\Claude Code\_to-delete\`; remove master's at/after merge if it lingers.
- [ ] Standard expansion merge steps (from `/new-expansion` merge checklist): `/expansion-audit` clean, `sw.js` CACHE_NAME bump + FILES_TO_CACHE, CLAUDE.md sync.
