# Revelations — Mechanics Reference

Analyzed: 2026-04-05
Status: Complete — 11 of 11 mechanics analyzed
Sources: `rules/2019_Marvel_Legendary_Revelations_Rules_compressed.pdf`, `docs/card-inventory/final/revelations.md`

---

## Keywords

### Hyperspeed N

**Rules definition:** Reveal the top N cards of your deck. You get +1 Attack for each card with an Attack icon you revealed this way. Discard all those cards. Variants: "Hyperspeed N for Recruit" (count Recruit icons, grant Recruit), "Hyperspeed N for Recruit and Attack" (count both separately, grant both). "Hyperspeed your entire remaining deck" means N = remaining deck size, no reshuffle.

**Key rule:** It doesn't matter what numbers are in the icons. A card with Attack 5 and a card with Attack 1 both count as +1. Count *icons*, not *values*. Cards with "0+" printed inside an icon still have the icon — use the `attackIcon` / `recruitIcon` boolean fields in cardDatabase.js, not the numeric `attack` / `recruit` fields.

**Implementation approach:** Create a reusable `hyperspeed(n, iconType)` function in the expansion ability file. The function:
1. Pops N cards from `playerDeck` (reshuffling `playerDiscardPile` into it if empty mid-reveal, UNLESS "don't reshuffle" variant)
2. For each revealed card, checks `attackIcon` (or `recruitIcon`, or both) boolean
3. Counts matching icons, adds count to `totalAttackPoints` + `cumulativeAttackPoints` (and/or Recruit equivalents)
4. Pushes all revealed cards to `playerDiscardPile`
5. Calls `updateGameBoard()`

**Special cards:**
- **Warflight (Darkhawk Rare):** "Whenever you Hyperspeed this turn, you get both Recruit and Attack." Sets a turn-level flag `hyperspeedCountsBoth = true` that the Hyperspeed function checks.
- **Around the World Punch (Quicksilver Rare):** "Hyperspeed your entire remaining deck. (Don't reshuffle.)" N = `playerDeck.length`, skip reshuffle. Superpower: "Before you do that, put your discard pile on top of your deck." — stack discard pile on top of deck without shuffling, then Hyperspeed the combined deck.

**Solo mode notes:** No concerns. Entirely self-contained — only touches your own deck and points. Works identically in Golden Solo and What If? Solo. Final Showdown tracking works automatically via `cumulativeAttackPoints` / `cumulativeRecruitPoints`.

**Complexity:** Fits Cleanly

---

### Dark Memories

**Rules definition:** This gets +1 Attack for each Hero Class (Strength, Instinct, Covert, Tech, Ranged) among cards in your discard pile. Range: +0 to +5. Grey cards (S.H.I.E.L.D. Agents, Wounds, etc.) have no Hero Class and don't count. It doesn't matter how many cards of a particular class you have — one Tech card and five Tech cards both count as +1. "Double Dark Memories" doubles the bonus (range +0 to +10).

**Always recalculated live.** Recruiting heroes, Hyperspeed, and other discard abilities may increase the bonus. If you draw/reveal enough cards that your discard pile is reshuffled into a new deck, the bonus resets to +0.

**Implementation approach:**
- Create a `calculateDarkMemories()` helper that scans `playerDiscardPile`, collects unique `heroClass` values (ignoring null/undefined), returns the count.
- **For heroes (Ronin, Scarlet Witch):** When played, call the helper, add result to `totalAttackPoints` + `cumulativeAttackPoints`. Double variant multiplies by 2.
- **For villains (Hood's Gang) and masterminds (The Hood):** Use the existing `attackFromOwnEffects` modifier bucket in `updateVillainAttackValues()`. Recalculated every `updateGameBoard()` call.

**Who has it:**
- Heroes: Ronin (Haunted by Loss superpower, Brooding Fury ability + superpower), Scarlet Witch (Alter Reality superpower, Warp Time and Space superpower)
- Villains: Cancer, Chemistro, Madam Masque (all Hood's Gang)
- Masterminds: The Hood (normal = Dark Memories), Epic Hood (Double Dark Memories)
- Locations: The Dark Dimension grants Dark Memories to villains in its space (see Keyword Granting)

**Solo mode notes:** No concerns. Only examines your own discard pile. Works identically in both solo modes.

**Complexity:** Fits Cleanly

---

### Last Stand

**Rules definition:** This gets +1 Attack for each empty city space. "Double Last Stand" doubles the bonus. A city space with a Location above it and no Villain still counts as "empty." If a Mastermind or Scheme causes a city space not to exist, that does not count as empty — the space must exist but have no villain.

**Implementation approach:**
- Create a `calculateLastStand()` helper that counts city spaces where no villain is present (regardless of whether a Location is above the space).
- **For heroes (Captain Marvel, Photon):** When played, call the helper, add result to `totalAttackPoints` + `cumulativeAttackPoints`.
- **For villains (Dark Avengers):** Use `attackFromOwnEffects` in `updateVillainAttackValues()`. Recalculated every board update.
- Fight-order matters: defeating a villain empties its space, making remaining Last Stand villains stronger.

**Who has it:**
- Heroes: Captain Marvel Agent of S.H.I.E.L.D. (Dominate the Battlefield superpower, Higher Further Faster ability), Photon (Coruscating Vengeance superpower)
- Villains: All Dark Avengers except Sentry — Ares, Captain Marvel (Noh-Varr), Dark Hawkeye (Bullseye), Dark Ms. Marvel (Moonstone), Dark Wolverine (Daken) have Last Stand. Dark Spider-Man (Scorpion) has Double Last Stand.
- Locations: Sentry's Watchtower grants Last Stand to villains in its space (see Keyword Granting)

**Solo mode notes:** No concerns. City space count is the same in all modes.

**Complexity:** Fits Cleanly

---

## New Card Types

### Locations

**Rules definition:** Completely new card type placed above city spaces. Key rules:
- When drawn from the Villain Deck, placed above the nearest city space (right to left, from villain deck entry side) that doesn't already have a Location
- Once placed, Locations don't move — villains advance underneath them
- Locations do NOT count as Villains (abilities mentioning Villains don't affect Locations)
- A city space with a Location and no Villain still counts as "empty" for Last Stand
- Most Locations have "Whenever you fight a Villain here" triggered abilities
- You can fight a Location by spending its listed Attack value; defeated Locations go to Victory Pile
- If every city space has a Location and a new one is played, KO the Location with the lowest Attack (current player chooses ties) — may KO the new one or an existing one
- Some Mastermind Tactics become Locations when fought ("If this was not already a Location...")
- In 1-player solo: "each other player" Location effects apply to yourself

**HYDRA Base** is a hybrid Henchman Location — placed like a Location (above a city space, doesn't move) but counts as a Henchman. 10 copies, all identical, Attack 2 (+2 while a Villain is in the same space).

**Implementation approach:**
- **Data structure:** Parallel `cityLocations[]` array (same length as `city[]`), each slot holds a Location card or null. Separate layer from the villain city array.
- **Placement:** When a Location is drawn from the villain deck, find the rightmost city space index where `cityLocations[i] === null`, place there. If all spaces have Locations, KO the one with lowest Attack to make room.
- **Rendering:** Vertical overlap display. Location card peeks out above the villain card, both independently clickable. When a space has only a Location (no villain), the Location displays full-size. When a villain is also present, the Location shifts to a peek position with the villain overlapping on top (~40% of Location visible).
- **Fighting:** Player can fight either the villain or the Location in a space (no forced order). Two separate click targets.
- **Triggered abilities:** After defeating a villain, check if `cityLocations[villainIndex]` exists. If so, execute that Location's "Whenever you fight a Villain here" effect.
- **Tactic → Location:** When a Mastermind Tactic is defeated and has a Location transformation, create a Location object from the tactic's data and place it via normal Location placement logic.

**Solo mode notes:** "Each other player" effects on Locations → do it to yourself (per rules). No other solo-specific concerns.

**Complexity:** Core Engine Change

Changes needed in script.js:
1. New `cityLocations[]` parallel array initialization
2. City rendering updates — each space displays two layers (Location above, villain below)
3. Villain deck processing — new branch for Location card type placement
4. Fight interaction — separate click targets for villain vs Location in same space
5. Fight resolution — post-fight hook checking for Location triggered abilities
6. Location overflow — KO lowest-Attack Location when all spaces full
7. Tactic → Location card lifecycle
8. Empty space checks must ignore Locations (Last Stand, etc.)

**Future benefit:** The vertical overlap CSS pattern built for Locations can later be reused to improve captured Bystander/Hero visibility on villain cards (separate future task).

---

### Mandarin's Rings (Unique Henchmen)

**Rules definition:** First Henchman Group that is 10 unique cards instead of 10 identical copies. All share Attack 3, VP 1, but each has a different name and Fight effect.

**Implementation approach — Option B (expandable henchman template):** Add an optional `cards` array field to the henchman data structure. If present, use those individual card definitions instead of cloning the template 10 times. If absent (all existing henchmen), behavior is unchanged.

In `generateVillainDeck()`, the loop that currently clones the template 10 times becomes:
```
if henchman has a cards array: push each unique card
else: for 10 times, push clone of template
```

Each Ring's Fight effect is a separate function in the expansion ability file.

**Solo adaptations for two Rings:**
- **Liar, The Mento-Intensifier:** "Look at top card of another player's deck..." → In solo: reveal the top card of your deck; choose to put it in your discard pile or put it back.
- **Remaker, The Matter Rearranger:** "Choose a card from hand or discard pile. Player on your right puts it in their hand." → In solo: choose a card from your discard pile and put it in your hand. (From hand = no-op.)

**What If? compatibility:** Open question — decide during implementation. The What If? henchman split (subset of group used) works mechanically with unique Rings, but may want to exclude Mandarin's Rings from What If? mode if the reduced Ring count makes Mandarin's scaling feel broken.

**Complexity:** New Capability Needed (small script.js change in deck-building loop)

---

## New Game Systems

### Epic Masterminds (Double-Sided)

**Rules definition:** Each Mastermind has a Normal side and an Epic side, sharing the same 4 Tactics. Player chooses which side to use during setup. Epic versions have higher Attack, nastier Master Strikes, sometimes additional effects. This is a setup-time difficulty selection, not an in-game mechanic.

**Revelations Masterminds:**
- Grim Reaper (8+ Attack) / Epic Grim Reaper (9+ Attack, stronger Master Strike with Wound effect at 3+ Locations)
- Mandarin (16 Attack, Rings +1) / Epic Mandarin (26 Attack, Rings +2, Wounds to top of deck)
- The Hood (9+ Attack, Dark Memories) / Epic Hood (10+ Attack, Double Dark Memories, devastating Master Strike)

**Implementation approach — Option B (single entry with toggle):**
- One mastermind entry in `cardDatabase.js` with an `epic` sub-object containing the alternate stats (attack, masterStrike, masterStrikeConsoleLog, masterStrikeImage, etc.)
- Setup screen shows a Normal/Epic toggle next to masterminds that have an `epic` field. Masterminds without one show no toggle.
- `getSelectedMastermind()` in script.js checks the toggle state and returns the appropriate stats. ~10 lines of new logic.
- All downstream code (recalculateMastermindAttack, handleMasterStrike, etc.) works unchanged because it reads from whatever `getSelectedMastermind()` returns.
- Both versions share the same `tactics` array.

**Fallback:** If Option B causes issues, split into two separate entries (Option A) with no script.js changes. The card ability functions are identical either way.

**Solo mode notes:** No concerns. Purely a setup difficulty choice.

**Complexity:** New Capability Needed (small script.js change in `getSelectedMastermind()` + setup screen HTML toggle)

---

### Dual-Identity Villains

**Rules definition:** Two villains change identity based on city position:

**Mister Hyde (Army of Evil):** While in Bank or Streets, this card's name is "Dr. Calvin Zabo", and you must spend Recruit to fight him instead of Attack. Fight value stays at 6 regardless of identity. Bank = city index 3, Streets = city index 1.

**Sentry (Dark Avengers):** While in Bank or Streets, this card's name is "The Void", it gets +5 Attack (base 7 → 12), and it gets "Fight: KO up to two cards from your discard pile." Normal Sentry has NO Fight effect. Escape effect (each player gains a Wound) applies in both identities.

**Implementation approach:**
- **Position detection:** City spaces are already named and indexed. Checking "is this villain in Bank or Streets?" = checking city index 1 or 3.
- **Mister Hyde (Recruit-only fight):** New concept. Not Bribe (any mix of Attack+Recruit) — this is Recruit-only. Set a `usesRecruitToFight` flag on the villain when in Bank/Streets via `updateVillainAttackValues()`. Small addition to fight affordability check in script.js to handle this third case.
- **Sentry +5 Attack:** Fits into existing `attackFromOwnEffects` — add 5 when at index 1 or 3.
- **Sentry conditional Fight effect:** The fight effect function checks the villain's city position internally and branches. No data structure change needed.
- **Name change:** Cosmetic — affects log messages and popup text. Villain names aren't displayed as text in the city (only the card image is shown).

**Solo mode notes:** No concerns. City positions work identically in all modes. No "other player" effects.

**Complexity:** New Capability Needed (small script.js touch for Recruit-only fight affordability check)

---

### Keyword Granting from Locations

**Rules definition:** Two Locations grant keywords to villains in the same city space:

**Sentry's Watchtower (Dark Avengers):** Villains here get Last Stand. Villains who already have it get the bonus again (stacking).

**The Dark Dimension (Hood's Gang):** Villains here get Dark Memories. Villains who already have it get the bonus again (stacking).

Stacking means a Dark Avenger with Last Stand under Sentry's Watchtower gets +2 Attack per empty space (their own Last Stand + the Location's grant). Same for Hood's Gang with Dark Memories under The Dark Dimension.

**Location Fight effects (separate from keyword grants):**
- Sentry's Watchtower Fight: You gain the Hero in the HQ space under this.
- The Dark Dimension Fight: Take another turn after this one.

**Implementation approach:** Extension of `updateVillainAttackValues()`. When recalculating a villain's modifiers, check if `cityLocations[i]` is Sentry's Watchtower or The Dark Dimension. If so, calculate the keyword bonus and add to `attackFromOwnEffects` independently of the villain's own keyword. Two instances = two separate calculations added together. No special "double" tracking needed.

**"Take another turn" (Dark Dimension):** Needs an extra-turn mechanism. Distinct from "play another villain card." An extra turn = finish current turn, then take a complete new turn (draw 6, HQ rotation, villain draws, play cards).

**Solo mode notes:** No concerns. Keyword calculations are identical in all modes.

**Complexity:** Fits Cleanly (once Location system from mechanic #8 exists)

---

### Double-Sided Transforming Schemes

**Rules definition:** All 4 Revelations schemes are double-sided. Start with Side A ("Setup"). When instructed to "Transform this Scheme," flip to Side B. Some flip back and forth multiple times. Each side has its own Special Rules, Twist effects, and Evil Wins conditions. Twist count does NOT reset on transform — keeps incrementing globally.

**The 4 schemes:**
| Side A | Side B | Flip Pattern |
|---|---|---|
| Earthquake Drains the Ocean | Tsunami Crushes the Coast | Back and forth |
| House of M | "No More Mutants" | One-way (A → B) |
| Secret HYDRA Corruption | Open HYDRA Revolution | Back and forth |
| The Korvac Saga | Korvac Revealed | One-way (A → B) |

**Implementation approach — Two entries linked by `transformsInto`:**
- Each Transforming Scheme is two separate entries in `cardDatabase.js`
- Side A has `transformsInto: "Side B Name"`, Side B has `transformsInto: "Side A Name"` (for back-and-forth schemes) or no `transformsInto` (for one-way like "No More Mutants")
- Side B entries are hidden from the setup screen via `hiddenFromSetup: true`
- `transformScheme()` helper (~10 lines in script.js): swaps `selectedScheme` to its partner, updates displayed scheme image
- All existing code reads from `selectedScheme` dynamically (twist handler, Evil Wins checker), so swapping the reference makes everything downstream work automatically
- Schemes are locked to their partners — Earthquake can only transform into Tsunami, never into No More Mutants

**Solo mode notes:** No concerns with the transform mechanic itself. Individual scheme effects may have solo implications (handled per-scheme during implementation).

**Complexity:** New Capability Needed (small `transformScheme()` helper in script.js + `hiddenFromSetup` filtering)

---

### Dynamic City Size (Earthquake / Tsunami)

**Rules definition:** The Earthquake/Tsunami scheme changes city size during the game:
- Side A (Earthquake): Two extra "Low Tide" city spaces on the left side. City has 7 spaces total.
- Side B (Tsunami): Low Tide, Bridge, and Streets destroyed. City shrinks to 3 spaces (Bank, Rooftops, Sewers remain). Villains in destroyed spaces escape immediately, starting from the left.
- Cycle: 7 → 3 → 7 → 3, each Twist.

**Implementation approach — Approach A (full dynamic city refactor) in isolated worktree:**

Execute as a standalone pre-task before Revelations implementation:

1. **Step 1:** Convert hardcoded 5-element city to dynamically sized based on `citySize` variable. Generate city HTML dynamically. Convert per-space buff globals (`city1TempBuff`...`city5TempBuff`, `city1PermBuff`...`city5PermBuff`) into arrays (`cityTempBuff[]`, `cityPermBuff[]`). Update all references across all files.
2. **Step 2:** Validate with `citySize = 5` — game must behave exactly as today for all existing schemes and expansions.
3. **Step 3:** Test with `citySize = 7` — confirm rendering, villain advancement, and escape all work.
4. **Step 4:** Wire up to Earthquake/Tsunami scheme (transform toggles destroyed spaces for the shrink).

**Fallback options:**
- If refactor proves too problematic → fall back to Approach B (scheme-specific 7-space setup, pre-build 7 and hide 2)
- Or defer Earthquake/Tsunami scheme entirely and implement the other 3 Transforming Schemes first

The existing `destroyedSpaces` mechanism from Fantastic Four handles the shrink (Tsunami side). Movement code already uses `city.length` for loops, so a longer array works. But all parallel arrays, HTML elements, and per-space buff variables need updating.

**Solo mode notes:** No mode-specific concerns. Golden Solo's 2 villain draws per turn can be punishing with only 3 spaces (by design). Last Stand interacts with empty spaces — a 3-space city has fewer possible empty spaces, weakening Last Stand on the Tsunami side.

**Complexity:** Core Engine Change

---

### Non-Standard Villain Sources

Three scheme mechanics introduce cards into the city from unusual sources:

#### Grim Reaper Master Strikes → Locations

**Rules definition:** Master Strike enters the city as a 7 Attack "Graveyard" Location (Epic: 8 Attack with Wound effect at 3+ Locations). The Strike card itself becomes a Location.

**Implementation approach:** The Master Strike function creates a Location object with Graveyard stats and places it via normal Location placement logic. Builds entirely on the Location system (mechanic #8).

**Complexity:** Self-contained in expansion file (requires Location system)

#### House of M — Hero Cards as Villains

**Rules definition:** Setup adds 14 Scarlet Witch Hero cards to the Villain Deck. Each Scarlet Witch in the city is a Villain with Attack = cost + 3 (Side A) or cost + 4 (Side B). If you fight one, gain it as a Hero (to discard pile, not Victory Pile).

**Implementation approach:** Direct precedent in `unskrull()` from Secret Invasion — hero card enters villain deck as `type: "Villain"`, fight effect transforms it back and pushes to `playerDiscardPile`. Same pattern.

**Hero deck composition:** Scheme dictates "4 X-Men and 2 non-X-Men." Both solo modes must follow scheme hero requirements (not override to default counts). See pre-requisite fix below.

**Complexity:** Self-contained in expansion file (follows existing patterns)

#### Korvac Saga — Scheme Becomes Fightable

**Rules definition:** Korvac Revealed (Side B) counts as a 19 Attack "Korvac" Villain worth 9VP. If you defeat Korvac, KO the Mastermind and all its Tactics.

**Implementation approach:** Add a clickable "Fight Korvac" element to the scheme display area when Side B is active. Fighting uses existing attack-spending logic. Defeating Korvac empties the Mastermind's tactics array and sets defeat flags.

**Solo mode decisions:**
- **What If? Solo:** Defeating Korvac KOs Mastermind and all Tactics → game won, finish your turn, then win popup.
- **Golden Solo:** Defeating Korvac KOs Mastermind and all Tactics → initiates Final Showdown. Player must still meet the combined recruit+attack threshold for Ultimate Victory.

**Complexity:** New Capability Needed (small — fightable scheme UI element + instant-defeat trigger)

---

## Core Engine Changes Required

1. **Location system** — New `cityLocations[]` array, two-layer city rendering, Location placement/fighting/overflow logic, post-fight trigger hooks. Agreed approach: parallel array, vertical overlap display, independently clickable layers.

2. **Epic Mastermind toggle** — Modify `getSelectedMastermind()` to check Normal/Epic toggle, add toggle UI to setup screen. Agreed approach: Option B (single data entry with `epic` sub-object).

3. **Unique henchmen support** — Small branch in `generateVillainDeck()` to handle henchman groups with a `cards` array instead of cloning template. Agreed approach: Option B (expandable template).

4. **Transforming Scheme swap** — `transformScheme()` helper to swap `selectedScheme` reference and update image. `hiddenFromSetup` filtering for Side B entries.

5. **Dynamic city sizing** — Full refactor of hardcoded 5-space city to dynamically-sized arrays and generated HTML. Agreed approach: Approach A in isolated worktree as pre-task, with Approach B or deferral as fallback.

6. **Recruit-only fight cost** — New affordability check branch for villains that require Recruit instead of Attack (Mister Hyde). Small addition to fight checks in script.js.

7. **Extra turn mechanism** — The Dark Dimension's Fight reward. Needs a flag/queue system for "take another turn after this one."

---

## Solo Mode Decisions

| Mechanic | Question | Decision |
|---|---|---|
| Liar, The Mento-Intensifier | "Another player's deck" in solo | Reveal top of your own deck; choose discard pile or put back |
| Remaker, The Matter Rearranger | "Player on your right" in solo | Choose card from discard pile → put in your hand |
| Location "each other player" effects | Solo handling | Do it to yourself (per rules) |
| Sentry Fight effect | Applies in both identities? | No — only when in Void form (Bank/Streets) |
| Korvac defeat in Golden Solo | End game or Final Showdown? | Initiates Final Showdown (must still meet threshold) |
| Korvac defeat in What If? | End game immediately? | Yes — finish turn, then win |
| House of M hero composition | Follow scheme or mode default? | Follow scheme (4 X-Men + 2 non-X-Men) in all modes |
| Mandarin's Rings in What If? | Allow or exclude? | Open — decide during implementation |

---

## Pre-Requisite Fixes

1. **Golden Solo hero count override** — Currently hard-overrides to 5 heroes, ignoring scheme requirements. Must be changed so scheme `requiredHeroes` takes precedent when specified, defaulting to 5 only when the scheme doesn't specify. Affects 3 lines in script.js (~lines 2531, 2898, 3090). **Note: May already be fixed by time of implementation — separate session is addressing this.**

---

## Open Questions

1. **Mandarin's Rings in What If? Solo** — Should they be excluded from What If? mode (use a different henchman group), or allowed with a reduced subset? Mandarin's scaling depends on Ring count in Victory Piles — with fewer Rings in play, his Attack reduction is smaller. Decide during implementation based on testing.

2. **Dynamic city refactor scope** — The Approach A refactor touches all files that reference per-space buff variables. Full impact assessment needed during the worktree pre-task. If scope is too large, fall back to Approach B or defer Earthquake/Tsunami.

3. **"Take another turn" implementation** — The Dark Dimension Location grants an extra turn when fought. Need to determine: does the extra turn include HQ rotation and villain draws, or just a fresh hand of 6? (Assumed: full turn including all phases, since "turn" in Legendary means a complete turn.)

4. **House of M team composition enforcement** — The scheme requires specific team composition (4 X-Men + 2 non-X-Men), not just a hero count. The setup screen may need to enforce or guide this selection. Consider whether to auto-select or just validate.

---

## Prior Art & Reuse Candidates

*(Appended by pattern-reuse-scout — survey of existing code for the HYDRA transforming-scheme Officer-stack feature: on-board count indicator + "pay 3 Recruit → gain a stacked Officer (as Hero, to discard pile)". Today the stack is a bare integer `hydraOfficersNextToScheme` (`expansionRevelations.js:2501`), incremented in `secretHydraCorruptionTwist` / `openHydraRevolutionTwist` (`expansionRevelations.js:2505-2534`), read for Evil Wins at `script.js:9569`. No indicator, no spend action.)*

MECHANIC: Bespoke per-scheme counter — a scheme that tracks its own escalating tally across turns/twists
PRIOR ART: `stackedTwistNextToMastermind` (`script.js:873` global init; incremented in Killbots/Rising Waters/GotG/Killbot abilities at `script.js:4457-4459`, `expansionFantasticFour.js:585,659`, `expansionGuardiansOfTheGalaxy.js:1583-1619`, `cardAbilities.js:16936`, `cardAbilitiesDarkCity.js:16679`; Evil Wins gate at `script.js:9372`; progress text at `script.js:10620`). Also `revelationsTwistCount` (`expansionRevelations.js:2402`) and the HYDRA counter itself.
HOW IT WORKS: A top-level `let` global counts "twists/cards set aside next to the Mastermind." Scheme twists `++` it; an Evil Wins check fires at a threshold (`>= 3`); a board indicator renders the running count each `updateGameBoard()`. Exactly the "escalating side-stack tally tied to a scheme/mastermind" shape HYDRA needs — HYDRA already mirrors it as an integer, just without the UI or interaction.
RECOMMENDATION: REUSE (storage pattern) — `hydraOfficersNextToScheme` is already the correct precedent-following integer. Keep it as the count source. The gap is purely (a) rendering it and (b) letting the player spend against it — addressed in the next two entries. Do NOT redesign the counter.

MECHANIC: On-board count INDICATOR — a number/badge rendered on or near a card cell, kept synced by updateGameBoard
PRIOR ART: (1) `stackedTwistNextToMastermind` indicator — `script.js:8268-8286` reads `#stacked-mastermind-cards` / `#stacked-mastermind-cards-count` (HTML at `index.html:689`, ALSO inside `#scheme-place`), shows them + sets `.textContent` to the count + sets a scheme-keyed background image when `> 0`, refreshed inside `updateGameBoard()`. This is the single closest precedent: a scheme-cell count badge driven by an escalating integer. (2) `demon-goblin-count` deck-side count badge — `script.js:8479-8488` toggles `#demon-goblin-deck` visibility and sets `#demon-goblin-count` innerHTML to `demonGoblinDeck.length`; HTML anchor `#demon-goblin-deck`/`#demon-goblin-count` sits INSIDE `#scheme-place` (`index.html:685`), right next to the scheme cell. (3) bystander/captured-hero count overlays — `bystanderOverlayNumber` span + thumbnail pattern on mastermind (`script.js:5685-5691`), city villains (`script.js:8946-8961`), HQ villains (`script.js:9894-9908`), and Locations (`script.js:8540-8544`), all driven by `array.length`.
HOW IT WORKS: A hidden span/div lives in the cell's HTML; `updateGameBoard()` sets its text to the current count and toggles display when count > 0. The `#demon-goblin-deck` precedent is the closest fit — it is already a scheme-adjacent count badge physically located inside `#scheme-place`, the exact cell the Officer stack sits next to.
RECOMMENDATION: REUSE — clone the `#demon-goblin-deck`/`#demon-goblin-count` pattern: add a sibling `#hydra-officer-stack`/`#hydra-officer-count` div inside `#scheme-place` (`index.html:683-686`), and add an update block alongside `script.js:8479-8488` in `updateGameBoard()` that shows it and sets count to `hydraOfficersNextToScheme` when the active scheme is Secret HYDRA / Open HYDRA. (Note the `#scheme-place` selector gotcha in CLAUDE.md — that cell already holds the hidden BabyHope `#scheme-token` plus the appended `.card-image`; target the new element by its own id.)

MECHANIC: Player ACTION — click a board affordance, pay N Recruit, gain a card (to discard pile)
PRIOR ART: `recruitOfficer()` (`script.js:17710-17761`) + `showSHIELDRecruitButton()` (`script.js:17763-17805`), wired to a click on `#shield-deck-card-back` (`script.js:17807-17809`). The HTML "spend 3 Recruit to recruit a S.H.I.E.L.D. Officer" popup is at `index.html:847-861`. Recruit-pool helpers: `canAffordRecruitCost(COST)`, `spendRecruitCost(COST)`, `logRecruitCostMessage(...)`. The "gain a card to discard pile" idiom is `playerDiscardPile.push(officer)` (`script.js:17746`).
HOW IT WORKS: A click handler shows a confirm button, gates on `canAffordRecruitCost(3)`, pops a card off `shieldDeck`, pushes it to `playerDiscardPile`, then calls `spendRecruitCost(3)` and `updateGameBoard()`. This IS the "pay 3 Recruit → gain a S.H.I.E.L.D. Officer to discard" flow — almost exactly the HYDRA action, except the officer source is the global `shieldDeck` rather than the scheme-side stack, and the trigger is the SHIELD deck cell rather than the scheme cell.
RECOMMENDATION: REUSE — model a `gainHydraOfficer()` after `recruitOfficer()` (same `canAffordRecruitCost(3)` → gain → `spendRecruitCost(3)` skeleton, push to `playerDiscardPile`), and a click affordance on the new `#hydra-officer-stack` cell modeled on `showSHIELDRecruitButton()` + the `#shield-deck-card-back` listener. Decrement `hydraOfficersNextToScheme` instead of popping `shieldDeck` (the stack is count-only — see next entry). Source the gained card as a `shieldOfficers`-shaped Hero (see Officer entry).

MECHANIC: "Stack of cards set aside for a scheme" — a card pile held separate from the main decks
PRIOR ART: Array-based precedents — `demonGoblinDeck` (`script.js:866`, an actual `[]` of bystander-cards moved aside at `cardAbilitiesDarkCity.js:16379-16381`, popped on spend at `cardAbilitiesDarkCity.js:2419`/`cardAbilities.js:6676`); the global escape pile `escapedVillainsDeck` (`script.js:778`, noted at `expansionRevelations.js:3525`); per-card captured arrays `villainCard.bystander[]` and `locationCard.capturedBystanders[]` (`script.js:5412-5450`, `8540`, `12108-12118`). Integer-based precedent — `stackedTwistNextToMastermind` (count only, no card objects). The HYDRA stack is currently integer-only (`hydraOfficersNextToScheme`).
HOW IT WORKS: Two established shapes exist. (a) A real card array (`demonGoblinDeck`) when individual card identity/abilities matter on later spend. (b) A bare integer (`stackedTwistNextToMastermind`) when the set-aside cards are fungible and only the count matters. HYDRA Officers are all identical (`shieldOfficers` are 30 interchangeable copies — `cardDatabase.js:115-144`), so the count-only shape is sufficient and is what's already in place.
RECOMMENDATION: REUSE (keep integer) — `hydraOfficersNextToScheme` as a count is the right call given Officers are fungible; no need to build a card array. On spend, synthesize one Officer Hero from the `shieldOfficers` template (or `shieldDeck.pop()`) and `playerDiscardPile.push(...)`. Only switch to an array if a later rule needs per-Officer identity (none found in the inventory).

MECHANIC: S.H.I.E.L.D. Officer representation + recruit pool
PRIOR ART: `shieldOfficers` array (`cardDatabase.js:114-144` — 30 identical `S.H.I.E.L.D. Officer` Hero entries, `team:"S.H.I.E.L.D."`, recruit 2, cost 3, image `shieldofficer.webp`); `shieldDeck = [...shieldOfficers]` initialized at `script.js:535` and reset in `initGame()` at `script.js:4872`. Spend paths: `recruitOfficer()` (`script.js:17710`), `moveShieldOfficerToHand()` (`cardAbilities.js:7121-7131`), Nick Fury's KO-to-gain-Officer (`cardAbilities.js:6794`+). Final Showdown helper includes officers at `script.js:16802`.
HOW IT WORKS: Officers live as a flat 30-element array of identical Hero objects. The live recruit pool is `shieldDeck` (a spread copy). Any "gain an Officer" effect pops from `shieldDeck` (or, in the count-only HYDRA case, just needs one template clone). Officers are recruited for 3 Recruit and normally land in the discard pile.
RECOMMENDATION: REUSE — pull the gained HYDRA Officer from the existing `shieldOfficers`/`shieldDeck` representation (no new card data). Per the inventory, the HYDRA scheme sets aside its own physical Officer stack, but since the cards are identical to the global Officers and tracked count-only, sourcing the gained card from `shieldDeck.pop()` (or a `shieldOfficers[0]` clone) and decrementing `hydraOfficersNextToScheme` reuses everything already built.

### Reuse Candidates — summary

| Mechanic | Prior art | Verdict |
|---|---|---|
| Per-scheme escalating counter | `stackedTwistNextToMastermind` (`script.js:873`, `8275`, `9372`, `10620`); HYDRA's own `hydraOfficersNextToScheme` | REUSE — keep integer counter |
| On-board count indicator | `#demon-goblin-deck`/`#demon-goblin-count` in `#scheme-place` (`script.js:8479-8488`, `index.html:685`); `stackedCardsByMastermindCount` (`script.js:8275-8278`); bystander overlays (`5685`, `8946`, `9894`, `8540`) | REUSE — clone demon-goblin badge into `#scheme-place` |
| Spend Recruit → gain card to discard | `recruitOfficer()` + `showSHIELDRecruitButton()` (`script.js:17710-17809`); `canAffordRecruitCost`/`spendRecruitCost` | REUSE — model `gainHydraOfficer()` on it |
| Set-aside card stack | `demonGoblinDeck[]` (array); `stackedTwistNextToMastermind` (integer); `capturedBystanders[]` | REUSE — keep integer (Officers fungible) |
| Officer data + recruit pool | `shieldOfficers` (`cardDatabase.js:114-144`), `shieldDeck` (`script.js:535`, `4872`) | REUSE — source gained Officer from existing pool |
