# Marvel Legendary — Golden Solo Mode Project

## About the User

- Complete beginner — no coding background
- No terminal experience — walk through every command step by step
- No mental model of file/folder structure — explain where things are in plain English
- Learns best by seeing the result first, then understanding why
- Will not always know what follow-up questions to ask — flag things proactively
- Prefers to approve changes before they are made
- Always explain what a change will do in plain English before doing it

## Project Goal

Add **Golden Solo Mode** to the existing Legendary Solo Play web app. The mode will be selectable alongside the existing **What If? Solo** mode on the setup screen. What If? Solo must remain completely unchanged.

## Project Location

- Working directory: `D:\AI\Claude Code\marvel-legendary`
- Source files (extracted): `Legendary-Solo-Play-main\Legendary-Solo-Play-main\`

## Source Files

| File | Lines | Purpose |
|------|-------|---------|
| `script.js` | 19,322 | Core game engine — turn logic, UI, villain deck, HQ, mastermind, city |
| `cardAbilities.js` | 17,704 | Hero card effects — Core set |
| `cardAbilitiesDarkCity.js` | 16,972 | Hero card effects — Dark City expansion |
| `cardAbilitiesSidekicks.js` | 2,470 | Sidekick card effects |
| `cardDatabase.js` | 9,869 | All card data definitions |
| `index.html` | 1,830 | Setup screen + game board HTML |
| `styles.css` | 8,804 | All styling |
| `expansionFantasticFour.js` | 5,851 | Fantastic Four expansion |
| `expansionGuardiansOfTheGalaxy.js` | 7,052 | Guardians of the Galaxy expansion |
| `expansionPaintTheTownRed.js` | 5,582 | Paint the Town Red expansion |
| `updatesContent.js` | 475 | Patch notes |

## Platform & Constraints

- Windows 11, VS Code
- Static HTML/JS/CSS — no server, no build step, opens directly in a browser
- No package.json / no npm
- User is on Claude Pro — no API usage

## Out of Scope

- Any changes to What If? Solo behavior
- Two Handed mode
- New expansion card data

## Golden Solo Rules Summary

**Setup:**
- Villain deck: standard 2-player rules
- Hero deck: remove each hero's unique high card → shuffle remaining → deal 10 into small stack → add unique cards back into large stack and shuffle → place 10-card stack on top
- Two sub-modes: **Standard** (5 heroes) and **Quick Play** (3 heroes)
- HQ starts with 5 heroes populated normally

**Each Round:**
1. Draw hand of 6 cards
2. Draw 1 hero card → add to rightmost HQ slot, slide all cards left, leftmost card removed from game *(skip on Round 1)*
3. Optional: discard 1 rescued bystander from victory pile to skip 1 villain card draw this round (max 1 per round)
4. Draw **2** villain cards and resolve
5. Play 6 cards per normal rules

**HQ Refill Rule:**
When a hero is recruited (or villain effect KOs a card), the new card goes in the **rightmost** slot and all others slide left — rotation, not fill-in-place.

**"Other Player" Rule:**
Card effects targeting "each other player" apply to the top card of the hero deck (KO it or cycle it to the bottom depending on the effect).

**Win/Lose:**
- Win: Defeat Mastermind 4 times
- Lose: Scheme triggers
- Ultimate Victory (optional): After 4th defeat, trigger Final Showdown — player's 6-card total (recruit + attack combined) must equal or exceed Mastermind's strength + 4

**Quick Play — Schemes Not Recommended:**
- Super Hero Civil War
- Secret Invasion of the Skrull Shapeshifters
- Save Humanity

## Success Criteria

- What If? Solo plays exactly as before — no regressions
- Golden Solo is selectable on the setup screen
- Standard and Quick Play sub-options appear when Golden Solo is selected
- HQ rotation works correctly each round
- 2 villain cards drawn per round in Golden Solo
- Bystander discard option presented each round
- Final Showdown triggered and resolved correctly after 4th Mastermind defeat
- Quick Play incompatible schemes are flagged in the UI

## Automations Set Up

- **Subagent**: `.claude/agents/codebase-navigator.md` — for targeted code searches without flooding context
- **Hook**: `.claude/hookify.block-asset-edits.local.md` — blocks any edits to `Visual Assets/` or `Audio Assets/`

## Workflow Preferences

- Always read and understand code before proposing changes
- Propose a plan and get approval before editing any files
- Use the `codebase-navigator` subagent for searching large files
- Explain all terminal steps in plain English

## Implementation Status

All 7 phases of Golden Solo Mode have been implemented as of 2026-03-09.

### What Was Built

**Phase 1 — Setup Screen UI** (`index.html`)
- Added "Golden Solo" radio button alongside "What If? Solo" on the setup screen
- Sub-options panel (Standard / Quick Play) appears only when Golden Solo is selected
- Quick Play incompatible scheme warnings (`⚠ Not recommended for Quick Play`) added inline to: Secret Invasion of the Skrull Shapeshifters, Superhero Civil War, Save Humanity
- Bystander discard popup HTML added (`#golden-bystander-popup`)

**Phase 2 — Game Mode Globals & Setup Reading** (`script.js`)
- `gameMode` global (`'whatif'` | `'golden'`) and `goldenPlayMode` (`'standard'` | `'quickplay'`) declared
- `goldenFirstRound` flag to skip HQ rotation on round 1
- Setup reads the radio selections and sets hero count: 5 for Standard, 3 for Quick Play
- Final Showdown always enabled when Golden Solo is active

**Phase 3 — Hero Deck Restructuring** (`script.js` ~line 3769)
- After the normal hero deck is generated, Golden Solo restructures it:
  - Strips each hero's unique high card (Rare) out
  - Shuffles remaining cards, deals 10 into a small starting stack
  - Shuffles Rares back into the main deck
  - Places the 10-card stack on top
- Logged to the game console with a highlighted message

**Phase 4 — HQ Rotation** (`script.js` ~lines 4634–4714)
- `goldenRefillHQ(index)` — when a hero is recruited or KO'd, removes that slot, pushes a new card to the rightmost slot (rotation, not fill-in-place)
- `goldenHQRotate()` — at the start of each round (skipped on round 1), draws 1 hero card, appends to rightmost HQ slot, removes leftmost card from game
- Called from every HQ-modifying code path (recruit, villain KO, scheme KO)

**Phase 5 — Villain Draw Count** (`script.js` ~line 4694)
- Golden Solo draws exactly 2 villain cards per round (`villainDrawCount = 2`)

**Phase 6 — Bystander Discard Option** (`script.js` ~line 4533)
- At the start of each Golden Solo turn, if the player has rescued bystanders in their victory pile, a popup appears
- "Spend a Bystander" reduces villain draw count from 2 to 1 for that round (max 1 per round)
- "No Thanks" proceeds with 2 villain draws

**Phase 7 — Final Showdown** (`script.js` ~lines 14349–14678)
- After the 4th Mastermind defeat, Final Showdown is triggered
- The Defeat Mastermind button is re-labelled "Final Showdown"
- Combined recruit + attack points must equal or exceed Mastermind's strength + 4
- Validates and resolves correctly; Ultimate Victory message shown on success

### Key Files Modified

| File | Changes |
|------|---------|
| `index.html` | Setup UI, sub-options, scheme warnings, bystander popup |
| `script.js` | All game logic — ~15 new/modified functions and sections |
| `styles.css` | Game Mode section position raised to clear Final Blow panel |

### Post-Launch Bug Fixes (2026-03-09)

| Bug | Fix |
|-----|-----|
| Game Mode radio buttons hidden behind Final Blow panel | `#game-mode-section` `bottom` raised from `44vh` to `62vh` in `styles.css` |
| Confirm Choices showed scheme's hero count (e.g. 3) instead of Golden Solo count (5) | Validation at `script.js` ~line 2996 now reads game mode from DOM instead of stale `gameMode` global |
| RANDOMIZE HEROES always picked 3 regardless of Golden Solo mode | `randomizeHero()` ~line 2379 now reads DOM for Golden Solo hero count |
| RANDOMIZE ALL picked scheme's hero count instead of Golden Solo count | `randomizeHeroWithRequirements()` ~line 2875 now reads DOM for Golden Solo hero count |

### Testing Status

**Note on villain draw counts:**
- What If? Solo: 3 villain cards on Turn 1, then 1 per round — this is correct original behavior
- Golden Solo: 2 villain cards every round (or 1 if bystander spent)

**Passed:**
- [x] Game Mode section visible and clickable
- [x] Golden Solo sub-options (Standard / Quick Play) show/hide correctly
- [x] Confirm Choices shows correct hero count for Golden Solo Standard (5) and Quick Play (3)
- [x] RANDOMIZE HEROES respects Golden Solo hero count
- [x] RANDOMIZE ALL respects Golden Solo hero count
- [x] Hero deck restructuring console message appears on game start
- [x] HQ starts with 5 heroes (Standard)
- [x] Round 1: no HQ rotation
- [x] Round 2+: HQ rotates (1 card added right, 1 removed left)
- [x] 2 villain cards drawn per round in Golden Solo
- [x] Recruiting a hero rotates HQ (not fill-in-place)
- [x] What If? Solo regression: villain draw count unchanged (1/round after turn 1)

**Still to test:**
- [ ] Bystander discard popup appears when bystanders in victory pile
- [ ] Spending bystander reduces villain draws to 1 that round
- [ ] Villain KO of HQ card rotates HQ
- [ ] 4th Mastermind defeat triggers Final Showdown button label
- [ ] Final Showdown pass: combined recruit+attack ≥ strength+4 → Ultimate Victory
- [ ] Final Showdown fail: points too low → no victory
- [ ] Quick Play warning schemes flagged correctly (⚠ visible only in Quick Play sub-mode)
