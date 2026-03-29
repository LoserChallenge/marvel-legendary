# Marvel Legendary — Solo Play Web App

## About the User

- Complete beginner — no coding background
- No terminal experience — walk through every command step by step
- No mental model of file/folder structure — explain where things are in plain English
- Learns best by seeing the result first, then understanding why
- Will not always know what follow-up questions to ask — flag things proactively
- Prefers to approve changes before they are made
- Always explain what a change will do in plain English before doing it

## Project Goal

Enhance the existing Legendary Solo Play web app. Golden Solo Mode is complete. Active work: UI/setup screen improvements, then full expansion content additions.

## Project Location

- Working directory: `D:\Games\Digital\Marvel Legendary\Claude Code\marvel-legendary`
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

## How to Run

Open `Legendary-Solo-Play-main\Legendary-Solo-Play-main\index.html` directly in a browser. No server, build step, or install needed.

## Platform & Constraints

- Windows 11, VS Code
- Static HTML/JS/CSS — no server, no build step, opens directly in a browser
- No package.json / no npm
- User is on Claude Pro — no API usage
- `node` is installed at `C:\Program Files\nodejs\node.exe` but not on the Bash tool's PATH — manual `node --check` will fail; rely on the hook runner instead
- When running Node `-e` scripts, use relative paths from the working directory — absolute Windows paths with backslashes get mangled by double-escaping

## JS/HTML Pairing Rule

When removing an HTML element, always grep `script.js` for matching `getElementById()` calls at the top level. Null references at the top of `script.js` crash ALL subsequent listener registration silently (e.g., removing `#donate-call-to-action` from HTML broke the Welcome popup close button because `script.js` crashed before registering its listener).

## Mastermind Code Gotchas

- Mastermind names in `cardDatabase.js` must be matched exactly — `"The Supreme Intelligence of the Kree"` not `"Supreme Intelligence"`. Wrong names silently return `undefined` from `masterminds.find()`.
- `showConfirmChoicesPopup` receives a stub `{ name: selectedMastermind }` from its caller (~line 3514) — not a full mastermind object. Code inside needing `mastermind.alwaysLeads` etc. must call `masterminds.find(m => m.name === mastermind.name)` internally.
- `getSelectedMastermind()` already exists in `script.js` — use it instead of manual DOM + `masterminds.find()` lookups in setup screen functions.

## Out of Scope

- Any changes to What If? Solo behavior
- Two Handed mode

## Reference Files

- `revisions-additions.md` — prioritised list of planned UI/setup screen changes
- `card-directory.pdf` — full card list for all expansions with faction symbols
- `rules/` — PDF rulesheets for all expansions (attach to chat to read; file-path reading requires pdftoppm which is not installed)

## Planned Work (in order)

1. **UI/Setup Screen improvements** ✅ Complete — merged to master (2026-03-28)
   - Phase 1: ✅ Merged to master (2026-03-27)
   - Phase 2: ✅ Welcome screen rewrite complete (2a); RULES button and pairing to be addressed during expansion work
   - Phase 3: ✅ Live selection summary panel — all 7 tasks + CSS redesign complete, merged to master (2026-03-28)
2. **Villain deck rules fix (Golden Solo)** ✅ Complete — merged to master (2026-03-29)
3. **Expansion content** — all 12 expansions, phased by complexity; use `/new-expansion` skill when starting each one
   - Phase A (existing mechanics): Heroes of Asgard, New Mutants, Doctor Strange, S.H.I.E.L.D., Into The Cosmos, Annihilation
   - Phase B (new mechanics required): Secret Wars Vol. 1, X-Men, Revelations, Messiah Complex, Weapon X, World War Hulk

## Golden Solo Rules Summary

**Setup:**
- Villain deck: standard 2-player rules (2 bystanders default, 10-card henchmen group shuffled in)
- Hero deck: remove each hero's unique high card → shuffle remaining → deal 10 into small stack → add unique cards back into large stack and shuffle → place 10-card stack on top
- Always 5 heroes (no sub-modes)
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

## Success Criteria

- What If? Solo plays exactly as before — no regressions
- Golden Solo is selectable on the setup screen (always 5 heroes)
- HQ rotation works correctly each round
- 2 villain cards drawn per round in Golden Solo
- Bystander discard option presented each round
- Final Showdown triggered and resolved correctly after 4th Mastermind defeat
- Villain deck built to 2-player rules (2 bystanders, 10-card henchmen group)

## Automations Set Up

- **Git worktrees**: `.worktrees/` directory is gitignored; feature branches live at `.worktrees/<branch-name>`
- **Subagent**: `.claude/agents/codebase-navigator.md` — for targeted code searches without flooding context
- **Hook**: `.claude/hookify.block-asset-edits.local.md` — blocks any edits to `Visual Assets/` or `Audio Assets/`
- **Hook**: `.claude/settings.json` — JS syntax check (`node --check`) runs automatically after every `.js` file edit
- **Hook**: `.claude/settings.json` — anti-pattern guard: blocks `drawVillainCard()` calls in `expansion*.js` and `cardAbilities*.js` files (use `processVillainCard()` instead)
- **Subagent**: `.claude/agents/audit-tracker.md` — scans card files for remaining compatibility fixes; use at start of any fix session
- **Subagent**: `.claude/agents/revision-tracker.md` — scans HTML/JS for UI revision progress; use at start of any UI revision session
- **Skill**: `.claude/skills/golden-solo-fixer/SKILL.md` — step-by-step guide for executing compatibility audit fixes; invoke with `/golden-solo-fixer`
- **Skill**: `.claude/skills/new-expansion/SKILL.md` — step-by-step guide for adding a new expansion (file structure, card data, Golden Solo compatibility rules); invoke with `/new-expansion`

## Workflow Preferences

- When a plan or prior discussion specifies worktrees/branch isolation, follow that approach — confirm with user if deviating
- Always read and understand code before proposing changes
- Propose a plan and get approval before editing any files
- Use the `codebase-navigator` subagent for searching large files
- Explain all terminal steps in plain English

## Implementation Status

All 7 phases of Golden Solo Mode have been implemented as of 2026-03-09.

### What Was Built

**Phase 1 — Setup Screen UI** (`index.html`)
- Added "Golden Solo" radio button alongside "What If? Solo" on the setup screen
- Golden Solo is always 5 heroes — no sub-mode selector was built
- Bystander discard popup HTML added (`#golden-bystander-popup`)

**Phase 2 — Game Mode Globals & Setup Reading** (`script.js`)
- `gameMode` global (`'whatif'` | `'golden'`) declared
- `goldenFirstRound` flag to skip HQ rotation on round 1
- Hero count hardwired to 5 for Golden Solo throughout (Confirm Choices, Randomize Heroes, Randomize All)
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
| `index.html` | Setup UI (Golden Solo radio button), bystander popup |
| `script.js` | All game logic — ~15 new/modified functions and sections |
| `styles.css` | Game Mode section position raised to clear Final Blow panel |

### Post-Launch Bug Fixes (2026-03-09)

| Bug | Fix |
|-----|-----|
| Game Mode radio buttons hidden behind Final Blow panel | `#game-mode-section` `bottom` raised from `44vh` to `62vh` in `styles.css` |
| Confirm Choices showed scheme's hero count (e.g. 3) instead of Golden Solo count (5) | Validation at `script.js` ~line 2996 now reads game mode from DOM instead of stale `gameMode` global |
| RANDOMIZE HEROES always picked 3 regardless of Golden Solo mode | `randomizeHero()` ~line 2379 now reads DOM for Golden Solo hero count |
| RANDOMIZE ALL picked scheme's hero count instead of Golden Solo count | `randomizeHeroWithRequirements()` ~line 2875 now reads DOM for Golden Solo hero count |
| Plutonium Scheme Twist caused 6+ villain cards drawn per round in Golden Solo | `handlePlutoniumSchemeTwist` at `script.js:5469` called `drawVillainCard()` (full round machinery) instead of `processVillainCard()` (single draw) — fixed 2026-03-12 |
| 36 card-effect functions called `drawVillainCard()` mid-turn, triggering full Golden Solo rounds | All 22 Type 1 call sites replaced with `processVillainCard()`; 5 HQ fill-in-place assignments replaced with `goldenRefillHQ()` conditionals; 2 async chain bugs fixed; 1 log message updated — applied 2026-03-26 |

### Testing Status

**Note on villain draw counts:**
- What If? Solo: 3 villain cards on Turn 1, then 1 per round — this is correct original behavior
- Golden Solo: 2 villain cards every round (or 1 if bystander spent)

**Passed:**
- [x] Game Mode section visible and clickable
- [x] Confirm Choices shows correct hero count (5) for Golden Solo
- [x] RANDOMIZE HEROES picks 5 heroes for Golden Solo
- [x] RANDOMIZE ALL picks 5 heroes for Golden Solo
- [x] Hero deck restructuring console message appears on game start
- [x] HQ starts with 5 heroes
- [x] Round 1: no HQ rotation
- [x] Round 2+: HQ rotates (1 card added right, 1 removed left)
- [x] 2 villain cards drawn per round in Golden Solo
- [x] Recruiting a hero rotates HQ (not fill-in-place)
- [x] What If? Solo regression: villain draw count unchanged (1/round after turn 1)
- [x] Villain deck bystander count: 2 by default, scheme special counts respected (code verified)
- [x] Villain deck henchmen: all 10 cards shuffled in for Golden Solo (code verified)

**Still to test in-game:**
- [ ] Villain deck bystander count confirmed in actual play (default 2, or scheme override)
- [ ] Villain deck henchmen count confirmed in actual play (10 cards)
- [ ] Bystander discard popup appears when bystanders in victory pile
- [ ] Spending bystander reduces villain draws to 1 that round
- [ ] Villain KO of HQ card rotates HQ
- [ ] 4th Mastermind defeat triggers Final Showdown button label
- [ ] Final Showdown pass: combined recruit+attack ≥ strength+4 → Ultimate Victory
- [ ] Final Showdown fail: points too low → no victory
- [ ] Card effects that draw extra villain cards (Emma Frost, Electro, Kingpin, Forge, etc.) draw single cards only — not full Golden Solo rounds
- [ ] KO effects on HQ cards (Skrull, Kraven, Morg) rotate HQ correctly rather than fill-in-place
- [ ] Mystique and Reignfire escape effects resolve correctly (no hang)

---

## Compatibility Audit (2026-03-12) — Complete

All fixes applied 2026-03-26. Full report: `docs/golden-solo-compatibility-report.md`.

**Key architectural rule:** `enterCityNotDraw = true` does NOT suppress the Golden Solo block. Mid-turn card effects must call `processVillainCard()` (single draw) not `drawVillainCard()` (full round). Any new expansion card that draws a villain card mid-turn must follow this same pattern.

**"Other Player" effects:** Keep the existing silent skip for Golden Solo — do not apply hero superpower bonuses to the hero deck. New expansion cards with "each other player" wording should follow the same approach.

---

## Known Issues / Deferred

### Scheme vs Game Mode villain count conflict

**Symptom:** The Kree-Skrull War scheme enforces both Kree Starforce and Skrulls as required villain groups in What If? Solo, even though What If? Solo is normally a 1-villain-group mode.

**Root cause:** `getEffectiveSetupRequirements` returns the scheme's `specificVillainRequirement` array unchanged in What If? mode. Kree-Skrull War has 2 specific requirements, so both are enforced regardless of game mode.

**The open question:** For schemes that explicitly require 2 villain groups (Kree-Skrull War), should What If? Solo honour the scheme's count (2) or always cap at 1? This is a rules interpretation question that needs a deliberate decision before fixing.

**Status:** Deferred — needs rules clarification before implementation.
