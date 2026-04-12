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

#### Phase 1: Card Data + Images ⬜ Not started
- Copy staged images from `expansions/revelations/` to `Visual Assets/` production folders
- Add all card entries to `cardDatabase.js` (9 heroes, 4 villain groups, 3 masterminds, 4 scheme pairs, 2 henchmen groups, 3 bystanders)

#### Phase 2: Setup Screen ⬜ Not started
- Register heroes, villains, masterminds, schemes, henchmen in `index.html`
- Add `<script>` tag for `expansionRevelations.js` in loading chain
- Create expansion file skeleton

#### Phase 3: Effects ⬜ Not started
- 3a Keywords (Hyperspeed, Dark Memories, Last Stand): ⬜
- 3b Heroes (9 — Captain Marvel AoS, Darkhawk, Hellcat, Photon, Quicksilver, Ronin, Scarlet Witch, Speed, War Machine): ⬜
- 3c Villains (4 groups — Army of Evil, Dark Avengers, Hood's Gang, Lethal Legion): ⬜
- 3d Masterminds (3 normal + 3 epic — Grim Reaper, Mandarin, The Hood): ⬜
- 3e Schemes (4 transforming, 8 sides — Earthquake/Tsunami, House of M/No More Mutants, Secret HYDRA/Open HYDRA, Korvac Saga/Korvac Revealed): ⬜
- 3f Henchmen (HYDRA Base + Mandarin's Rings) + Bystanders (3): ⬜

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
