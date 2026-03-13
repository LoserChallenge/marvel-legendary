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

---

## Compatibility Audit (2026-03-12)

A full compatibility audit was conducted across all 6 card files. Full report: `docs/golden-solo-compatibility-report.md`. Design spec: `docs/superpowers/specs/2026-03-12-golden-solo-compatibility-audit-design.md`.

### Key Architectural Finding

**`enterCityNotDraw = true` does NOT suppress the Golden Solo block.** Many card effect functions set this flag before calling `drawVillainCard()` intending to signal "city entry only." However, the flag only bypasses the Reality Gem check (`script.js:4668`). The entire Golden Solo block — HQ rotation, bystander popup, 2-card draw loop — runs unconditionally whenever `gameMode === 'golden'`. Every `drawVillainCard()` call in every card file triggers a full Golden Solo round regardless of this flag.

### `cardAbilitiesSidekicks.js` — Clean

Zero hits across all search patterns. No changes needed.

### Fix Type 1: Replace `drawVillainCard()` → `processVillainCard()` (28 call sites)

All mid-turn card effects that play a villain card must call `processVillainCard()` (single draw, no round machinery) instead of `drawVillainCard()` (full round: HQ rotation + bystander popup + 2-card draw loop).

| File | Function | Line(s) |
|---|---|---|
| `cardAbilities.js` | `EmmaFrostVoluntaryVillainForAttack` | 1594 |
| `cardAbilities.js` | `handleMystiqueEscape` | 14750 |
| `cardAbilities.js` | `extraVillainDraw` | 14798 |
| `cardAbilities.js` | `bankRobbery` | 16840 |
| `cardAbilities.js` | `drawMultipleVillainCards` | 16852 |
| `cardAbilities.js` | `heroSkrulled` | 17015 |
| `cardAbilitiesDarkCity.js` | `electroAmbush` | 8255 |
| `cardAbilitiesDarkCity.js` | `eggheadAmbush` | 8282 |
| `cardAbilitiesDarkCity.js` | `reignfireEscape` | 9893 |
| `cardAbilitiesDarkCity.js` | `kingpinCriminalEmpire` | 12899, 12908, 12922 |
| `cardAbilitiesDarkCity.js` | `stryfeSwiftVengeance` | 12977 |
| `cardAbilitiesDarkCity.js` | `stryfeFuriousWrath` | 13472 |
| `cardAbilitiesDarkCity.js` | `kingpinMobWar` | 14639, 14888 |
| `cardAbilitiesDarkCity.js` | `apocalypseHorsemenAreDrawingNearer` | 14922, 15165 |
| `cardAbilitiesDarkCity.js` | `organizedCrimeAmbush` | 15968 |
| `cardAbilitiesDarkCity.js` | `KOCapturedHeroes` | 16634 |
| `expansionFantasticFour.js` | `moleManMasterOfMonsters` | 2642 |
| `expansionGuardiansOfTheGalaxy.js` | `forgeTheInfinityGauntletSingle` | 1157, 1172 |
| `expansionGuardiansOfTheGalaxy.js` | `forgeTheInfinityGauntletBoth` | 1443, 1461 |
| `expansionGuardiansOfTheGalaxy.js` | `timeGemAmbush` | 3711 |
| `expansionPaintTheTownRed.js` | `spliceHumansWithSpiderDNATwist` | 666, 682, 931 |
| `expansionPaintTheTownRed.js` | `mysterioMistsOfDeception` | 5560 |

### Fix Type 2: Replace fill-in-place HQ write → `goldenRefillHQ()` (5 functions)

When `gameMode === 'golden'`, any `hq[i] = heroDeck.pop()` direct assignment must be replaced with `goldenRefillHQ(i)` to preserve rotation.

| File | Function | Line(s) |
|---|---|---|
| `cardAbilities.js` | `heroSkrulled` | 17008 |
| `cardAbilities.js` | `KOAllHeroesInHQ` | 16952 |
| `cardAbilitiesDarkCity.js` | `KOAllHQBystanders` | 15993–15994 |
| `expansionFantasticFour.js` | `morgAmbush` | 3258 |
| `expansionPaintTheTownRed.js` | `koHeroKraven` | 1710 |

### Fix Type 3: Async bugs (affect all modes, found during audit)

| File | Function | Issue |
|---|---|---|
| `cardAbilities.js` | `handleMystiqueEscape` | `.then()` chained on a boolean — `resolve()` never called, function hangs in all modes |
| `cardAbilitiesDarkCity.js` | `reignfireEscape` | Same async chain bug |

### "Other Player" Effects — Decision: Keep Silent Skip

Four hero superpower abilities that reference "each other player" are currently silenced with a "does not apply in solo play" message. **Agreed approach: keep the silent skip for Golden Solo too.** The Golden Solo "other player" rule (apply to top of hero deck) is designed for villain/scheme effects that punish players, not for hero superpower bonuses. Applying these to the hero deck would mean the player penalises their own hero deck for playing a hero card.

One exception: `mephistoThePriceOfFailure` currently logs "in Solo Play, 'each other player' refers to you" — this is What If? Solo wording and should be updated to the standard "does not apply in solo play" message for Golden Solo consistency.

| File | Function | Current behaviour | Action |
|---|---|---|---|
| `cardAbilities.js` | `Gambit2ndTopCardDiscardOrPutBack` | Silent no-op | Keep as-is |
| `cardAbilities.js` | `HawkeyeDontDrawOrDiscard` | Silent no-op | Keep as-is |
| `cardAbilitiesDarkCity.js` | `punisherHostileInterrogation` | Silent no-op | Keep as-is |
| `cardAbilitiesDarkCity.js` | `mephistoThePriceOfFailure` | Applies What If? Solo "you are the other player" logic | Update log message only |
