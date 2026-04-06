# Revelations — Implementation Progress

Started: 2026-04-06
Status: In Progress

## Build Order (Infrastructure-First)

Revelations requires 7 core engine changes before content work.
Build order optimized to avoid rework — each layer builds on the previous.

### Block 1: Infrastructure

#### Step 1 — Dynamic City Refactor ⬜ Not started
Worktree: `.worktrees/dynamic-city`
- Convert 20 per-space buff variables → arrays (`cityTempBuff[]`, `cityPermBuff[]`, `cityLocationAttack[]`, `cityReserveAttack[]`)
- Generate city HTML dynamically from `citySize`
- Convert hardcoded city space labels to array-driven
- Validate all existing expansions work identically at size 5
- Test at size 7
- Merge to master

#### Step 2 — Location System ⬜ Not started
- `cityLocations[]` parallel array (same length as `city[]`)
- Two-layer city rendering (Location above, villain below)
- Placement logic (rightmost empty city space)
- Separate fight targets (villain vs Location in same space)
- Post-fight trigger hooks ("Whenever you fight a Villain here")
- Location overflow (KO lowest Attack when all spaces full)
- Tactic → Location lifecycle

#### Step 3 — Small Infrastructure Bundle ⬜ Not started
- Epic Mastermind toggle (`getSelectedMastermind()` + setup screen UI)
- Unique henchmen `cards` array branch in `generateVillainDeck()`
- `transformScheme()` helper + `hiddenFromSetup` filtering
- Recruit-only fight cost (Mister Hyde — new affordability check branch)
- Extra turn mechanism (Dark Dimension fight reward)

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
