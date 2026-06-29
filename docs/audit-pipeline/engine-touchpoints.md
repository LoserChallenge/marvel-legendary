# Engine Touchpoints Reference

Living catalog of shared engine functions in `script.js` (and expansion files) that mutate game state, who reads that state, and known propagation gaps. Read by `engine-integration-auditor` (Pass 2). Grown over time — Pass 1 of that auditor appends newly discovered touchpoints here.

**Gap ID scheme:** propagation gaps are tagged `E-1`, `E-2`, … and referenced by card-type auditors in their `RELATED:` field.

---

## Touchpoint format

Each entry:
- **Function** — name + file:line
- **Mutates** — what state it writes (variable names, scope)
- **Readers** — where that state is consumed
- **Gaps** — known propagation problems (with IDs), or "none known"
- **Pattern note** — how to correctly add new readers/writers

---

## Touchpoints

### transformScheme()
- **Function:** `transformScheme()` — `script.js` (~line 2139)
- **Mutates:** `window.selectedScheme` (global), `#scheme-place img.card-image` src, scheme name display
- **Readers:** `getSelectedScheme()` at `script.js:~14051` (queries the setup-screen DOM radio button, NOT `window.selectedScheme`); ~30 inline `document.getElementById` scheme-radio reads scattered through `script.js`; twist dispatcher; `checkEvilWins`
- **Gaps:**
  - **E-1** — `getSelectedScheme()` and inline radio reads pull the ORIGINAL scheme after a transform, because they read the setup DOM radio which never changes. `transformScheme()` updates only `window.selectedScheme`. Result: post-transform, twist effects, `scheme.name === 'X'` checks, and end-game conditions all key off the pre-transform scheme. Fix direction: make `getSelectedScheme()` prefer `window.selectedScheme` when set, then audit inline radio reads.
- **Pattern note:** any code that must track "current scheme" across transforms reads `window.selectedScheme` (lazy-init it from the DOM radio on first use). Never read the setup radio directly during transformed gameplay.

### processVillainCard()
- **Function:** `processVillainCard()` — `script.js`
- **Mutates:** villain deck draw position, city, HQ (via Golden Solo round logic), bystander state
- **Readers:** all mid-turn villain-draw effects must route through this, NOT `drawVillainCard()` (which triggers a full Golden Solo round: bystander popup, 2-card draw, HQ rotation)
- **Gaps:** none known
- **Pattern note:** card effects that draw from the villain deck mid-turn call `processVillainCard()`. `drawVillainCard()` is reserved for the round-start sequence in `onBeginGame()` / round loop.

### goldenRefillHQ()
- **Function:** `goldenRefillHQ(index)` — `script.js`
- **Mutates:** `hqCards[]` via rotation (new card rightmost, others slide left)
- **Readers:** any HQ modification in Golden Solo mode
- **Gaps:** none known
- **Pattern note:** in Golden Solo, never assign `hqCards[i] = newCard` directly — wrap: `if (gameMode === 'golden') { goldenRefillHQ(i); } else { hqCards[i] = newCard; }`

### placeLocation()
- **Function:** `placeLocation()` — `script.js:584` (async)
- **Mutates:** city array (adds a Location card), city size on overflow
- **Readers:** expansion functions placing Locations
- **Gaps:** none known
- **Pattern note:** `await placeLocation(...)` and declare the caller `async`. Missing `await` causes a race when the city is full (overflow popup fires-and-forgets before the player chooses).

### enterCityFromRight()
- **Function:** `enterCityFromRight()` — `script.js`
- **Mutates:** city array (villain placement)
- **Readers:** villain entry logic
- **Gaps:** none known
- **Pattern note:** use for villains entering the city from the deck side; respects city ordering.

### recalculateVillainAttack() / updateVillainAttackValues() / updateHQVillainAttackValues()
- **Function:** `recalculateVillainAttack()` — `script.js:11706`; `updateVillainAttackValues()` (city, ~line 9921); `updateHQVillainAttackValues()` (HQ, ~line 10137)
- **Mutates:** reads modifier fields `attackFromMastermind` / `attackFromScheme` / `attackFromOwnEffects` / `attackFromHeroEffects` / `attackFromShards`; computes display + fight cost
- **Readers:** fight-cost calc, the attack overlay at `script.js:~8533` (conditional: only drawn if `totalAttackModifiers !== 0`)
- **Gaps:** none known, but **DUPLICATE-FUNCTION HAZARD** — city and HQ versions must be patched in parallel
- **Pattern note:** villain attack bonuses go into the modifier fields, NEVER `card.attack` (the base number comes from card art). New bonuses follow the `mastermind.alwaysLeadsBonus` precedent at `script.js:9937` inside `updateVillainAttackValues()` AND `updateHQVillainAttackValues()`.

### Twist dispatcher
- **Function:** scheme twist dispatch — `script.js` (locate via `twistEffect` references)
- **Mutates:** depends on scheme; routes a drawn Scheme Twist to the active scheme's `twistEffect`
- **Readers:** the active scheme (determined by current-scheme lookup — see E-1, transforms break this)
- **Gaps:** inherits **E-1** — after a transform, the dispatcher may fire the original scheme's twist if it reads the DOM radio rather than `window.selectedScheme`
- **Pattern note:** twist dispatch must resolve the *current* scheme, honoring transforms.

### generateVillainDeck()
- **Function:** `generateVillainDeck()` — `script.js`
- **Mutates:** overwrites every card's `type` field to `"Villain"`
- **Readers:** deck-build; card-type-dependent logic downstream
- **Gaps:** new card types (e.g. Location) are clobbered unless preserved
- **Pattern note:** preserve non-Villain types: `const cardType = modifiedCard.type === "Location" ? "Location" : "Villain";`

### updateHighlights()
- **Function:** TWO `function updateHighlights()` declarations in `script.js` (second overwrites first in JS)
- **Mutates:** city/HQ villain affordability + fight-button highlight state; gates on `usesRecruitToFight`
- **Readers:** fight UI
- **Gaps:** **DUPLICATE-FUNCTION HAZARD** — both declarations must stay in sync
- **Pattern note:** when changing affordability or fight-button logic, grep for ALL `updateHighlights` definitions and patch both.

### createVillainCopy()
- **Function:** `createVillainCopy()` — `script.js:12209` (hand-rolled whitelist copier)
- **Mutates:** produces the villain copy passed to fight-effect functions; `city[cityIndex]` is nulled before the fight effect runs
- **Readers:** `defeatVillain()` → fight-effect functions receive the copy as a parameter
- **Gaps:** custom state added at ambush time (e.g. `capturedHero`) is DROPPED unless added to the whitelist
- **Pattern note:** any custom property set on a city villain at ambush time must be added to the `createVillainCopy()` whitelist (array pattern: `bystander: [...(villainCard.bystander || [])]`). Fight-effect functions read from the copy parameter, NOT by iterating `city[]` (it's nulled).

### Multiple-Masterminds keystone (secondaryMasterminds[])
- **Function:** `ascendToMastermind()` / `addSecondaryMastermind()` — `script.js:17225` / `script.js:17271`; cleared in `initGame` (`script.js:5092`)
- **Mutates:** global `secondaryMasterminds[]` (array of MM-like objects: `.name .attack .victoryPoints .tactics[] .bystanders[] .defeated .masterStrike .unfightableUnlessRecruit`)
- **Readers:** win-check `checkWinCondition()` (`script.js:17159`, `allSecondaryMastermindsDefeated()`); Master Strike fan-out `handleMasterStrike()` (`script.js:6030`, `fireSecondaryMasterStrike`); secondary fight UI (`#mastermind-2` click `script.js:16152`, `handleSecondaryMastermindClick` `17350`, affordability `updateSecondaryMastermindSlot` `17486`); recruit-gate `isMastermindRecruitLocked(sm)` (parameterized, `15909`); bystander rescue `defeatSecondaryMastermind` → `collectMastermindRescueOperations(sm)` (`17447`)
- **Gaps:**
  - **E-7** — `isMastermindDemonGoblinLocked()` (`script.js:15924`) hardcodes `getSelectedMastermind()` (no parameter) while its twin `isMastermindRecruitLocked(mm=…)` is parameterized; `addSecondaryMastermind` (`17285`) copies `unfightableUnlessRecruit` but NOT `unfightableWhileDemonGoblins`. A demon-goblin-locked Mastermind (Madelyne) promoted to a secondary could be fought/defeated with Demon Goblins still in `demonGoblinDeck`. LATENT: no current `darkAllianceEligible` pool entry is Madelyne, so unreachable today; structural main-only read.
- **Pattern note:** any per-mastermind gate/reader added for the main MM must accept a Mastermind-like parameter and be called on each `secondaryMasterminds[]` entry in the secondary fight path; new MM-object fields must be copied in BOTH `ascendToMastermind` and `addSecondaryMastermind`.

### Sentinel deferred attack-delta (sentinelVillainAttackDelta)
- **Function:** Rachel Summers writers (expansion); promoted in `endTurn` (`script.js:12291`); declared `script.js:841`, reset `script.js:5027`
- **Mutates:** global `sentinelVillainAttackDelta` (±N to ALL villains + Mastermind this turn) and `sentinelVillainAttackDeltaNextTurn` (pending)
- **Readers:** folded into `attackFromScheme` in BOTH attack twins — `updateVillainAttackValues` (`script.js:10883`) and `updateHQVillainAttackValues` (`script.js:11165`) — AND the mastermind recompute `recalculateMastermindAttack` (`script.js:15856`)
- **Gaps:** none known — twin parity + mastermind read all present (correct application of the E-3 Graveyard precedent)
- **Pattern note:** a global ±attack delta MUST be read in all THREE sites (both villain twins + mastermind recompute). Add as a `+=` to the `attackFromScheme` bucket after the per-scheme assignments, never as an overwrite.

### Pan-Dimensional Plague HQ-adjacent Wounds (hqWound[])
- **Function:** `panDimensionalPlagueTwist()` / `resolvePlagueWoundOnRecruit()` (expansion); declared `script.js:935`, reset `script.js:5093`
- **Mutates:** global `hqWound[]` — a SLOT-KEYED (index) array of Wound cards "next to" each HQ slot's hero
- **Readers:** display token loop (`script.js:8683`); recruit gate in `showHeroRecruitButton` (`script.js:19068`, `hqWound[hqIndex-1]`)
- **Gaps:**
  - **E-8** — `hqWound[]` is slot-index-keyed but HQ heroes SLIDE between slots: `goldenRefillHQ` (`script.js:5323`, `splice`+`push`) and `goldenHQRotate` (`script.js:5350`, `shift`+`push`) shift cards left WITHOUT realigning `hqWound[]`. After any Golden HQ rotation/refill, a Wound stays glued to its old slot index and renders next to / gates a DIFFERENT hero than the one it was placed on. (Golden mode — the dominant mode for this app.)
- **Pattern note:** any state array keyed by HQ slot index must be re-shifted in lock-step inside `goldenRefillHQ`/`goldenHQRotate`/`refillHQSlot`, or re-keyed to the card object instead of the slot.

### Build-an-Army annihilation army (annihilationHenchmenNextToMM)
- **Function:** `buildAnArmyOfAnnihilationTwist()` / `fightAnnihilationHenchman()` (expansion); declared `script.js:947`, reset/seeded `script.js:5101` (supply=10 only for that scheme)
- **Mutates:** globals `annihilationSupply`, `annihilationHenchmenNextToMM` (loss meter), `annihilationTwistStack`
- **Readers:** badge render + click bind (`script.js:8857`); end-game `annihilation10Henchmen` (`script.js:9758`, `>= 10`); tracker `script.js:11297` (`N/10`)
- **Gaps:** none known — single live counter, all readers consistent; badge click idempotent (`dataset.clickBound`), fight prompt re-guards scheme/count/affordability
- **Pattern note:** scheme-spawned fightable-entity counters live as plain globals seeded in `initGame` gated on `scheme.name`; the badge render/click and end-game/tracker readers must all read the SAME live count (not the escalating twist-stack snapshot).

### recalculateVillainAttack() off-grid usage
- **Function:** `recalculateVillainAttack(card)` — `script.js:12780`; delegates per-scheme assignment to `updateVillainAttackValues(card, cityIndex)` with `cityIndex = city.findIndex(...)` (= -1 when off-grid)
- **Mutates:** reads/writes the card's `attackFrom*` buckets; returns effective Attack
- **Readers:** SWV1 off-grid callers — `drStrangeFightTheFuture` (villain-deck top) and `thanosUtterAnnihilation` (city cards only)
- **Gaps:**
  - **E-9** — for an OFF-GRID card (`i === -1`), `updateVillainAttackValues` reads `cityPermBuff[-1]` (`undefined`); under the "Portals to the Dark Dimension" scheme (`script.js:10674`) `undefined !== 0` is true, so `villain.attackFromScheme = undefined` → NaN effective Attack → NaN fight cost. `drStrangeFightTheFuture` guards this LOCALLY (`expansionSecretWarsVol1.js:940-941`), but the base engine hazard remains for any future off-grid caller. MEDIUM (currently masked at the only at-risk call site).
- **Pattern note:** never call `recalculateVillainAttack`/`updateVillainAttackValues` on a card not in `city[]` without guarding the result for finiteness; or fix the base function to skip `cityPermBuff[i]` reads when `i < 0`.
