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

#### Phase 4: Validation ⬜ Not started
- Expansion validator (7 Golden Solo rules)
- JS syntax check
- Guided test game

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
