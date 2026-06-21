# Engine Gotchas — cross-expansion code traps & patterns

On-demand reference. **Not auto-loaded** — consult at the start of expansion code work and during `/expansion-audit`. Holds the recurring engine-level traps and reusable patterns harvested from prior expansion builds (primarily Revelations, 2026-04→06). CLAUDE.md keeps only the highest-frequency rules inline and points here for the rest.

Conventions: `script.js` line numbers drift — treat them as hints, grep to confirm. "Twin" = a city/HQ function pair that must stay in sync.

---

## Attack / fight-cost pipeline

- **`attackFromOwnEffects` is reset-then-accumulate.** Explicit `= 0` at the top of each villain recompute, then `+=` for every source (keyword, name-exclusive, Void bonus, granted bonus). An overwrite (`=`) clobbers when two sources hit one villain (e.g. Sentry-in-Bank + Last Stand). Establish the convention before the first multi-source villain ships, not after.
- **Mastermind own-effect attack scaling uses a dedicated summed field** `mastermind.attackFromOwnEffects` (init 0, set in `recalculateMastermindAttack()`, fold into the final sum). Never mutate `mastermind.attack` directly — the same failure mode as villain `card.attack` (display reads the printed art number).
- **Any custom attack-modifier state must be READ in both twins.** Setting a field on the card object isn't enough — `updateVillainAttackValues()` (city) AND `updateHQVillainAttackValues()` (HQ) must each read it. Audit E-3: Grim Reaper Graveyard's `graveyardBonus` was set but never read, so the bonus never applied.
- **`calculateLastStand()` must skip destroyed spaces.** It counted any `null city[i]` as empty, including destroyed (nonexistent) spaces; guard `!city[i] && !destroyedSpaces[i]`. Used on both the villain side and the hero side (`applyLastStand`).
- **A hero card that can also appear as a villain (Scarlet Witch) leaks hero keywords into the villain attack pipeline.** Its `keywords:["Dark Memories"]` (a hero superpower prop) flowed into `revelationsVillainOwnAttack()`. Villain-attack functions must gate on `attackFromScheme`/own-keyword villains and exclude hero-typed keywords.

## Twin functions (city / HQ parity)

- **`showCityAttackButton` and `showHQAttackButton` are parallel duplicates** — a variable in scope for one (e.g. `usesRecruitToFight`) may not be in the other. Check the HQ twin before editing a city-fight UI branch, or risk a reference error.
- **The HQ twin must force position-conditional flags to their HQ-appropriate value.** A villain moved to HQ inherits a stale city-render value (e.g. `usesRecruitToFight`) otherwise, so HQ defeat charges the wrong cost.
- **`updateHQVillainAttackValues` (HQ twin) is intentionally asymmetric with the city twin.** It referenced undeclared `currentPermBuff` → ReferenceError under Portals to the Dark Dimension + a villain in HQ. `cityPermBuff` is city-space-scoped (city indices only); drop city-only branches from the HQ twin entirely rather than zeroing them.
- **HQ overlay render must route through the HQ twin.** `applyCardOverlays` historically called the CITY twin for HQ villains with the HQ slot index; once any city-twin branch reads `cityLocations[index]`, HQ villains silently leak that effect.

## Defeat / bonus hooks

- **`defeatBonuses()` (cardAbilities.js) is THE canonical per-defeat payout hook** for both villain and mastermind paths. Villain-only payouts live here gated by an `isMastermindDefeat` flag. ~6 expansion villain-defeat sites bypass `handlePostDefeat` and call `defeatBonuses()` directly — a `handlePostDefeat`-only hook under-counts those defeats.
- **Making `defeatBonuses()` async requires `await` at ALL ~10 call sites** (script.js `handlePostDefeat` branches + `handleMastermindPostDefeat`, cardAbilities.js, cardAbilitiesDarkCity.js, expansionFantasticFour.js). Missing one silently fire-and-forgets.
- **`defeatLocation()` does NOT call `defeatBonuses()`** — correct for generic stronghold Locations, wrong for Henchman-Locations (HYDRA Base, `henchmen:true`), which suppresses "whenever you defeat a Villain" triggers. Gate on `locationCard.henchmen === true`, not the `type` field (reads "Location").
- **A deck-reveal / off-pipeline defeat is a genuine Villain defeat.** Push the ORIGINAL card to `victoryPile` and call `defeatBonuses()` after the push so "whenever you defeat a Villain" triggers fire. (See also: off-pipeline `fightEffect` dispatch must save/null/restore `currentVillainLocation` — already in CLAUDE.md.)
- **Mastermind defeat-counting keys off `mastermind.tactics.length === 0`** (via `tactics.pop()`), NOT `victoryPile` contents. Suppressing a tactic's `victoryPile` push has zero effect on defeat counting or win detection.

## KO / koPile / discard

- **`koBonuses()` reads `koPile[length-1].team` BEFORE the KO'd card is pushed.** An empty `koPile` (turn-1 KO-from-hand with no Scheme Twist yet) throws `undefined.team` and aborts the KO (softlock). Fix needs BOTH a universal empty-pile guard AND push-first reordering at the anomaly site (`FightKOHeroYouHave`). ~80 callers.
- **`checkDiscardForInvulnerability()` is the engine-correct "discard from hand" path.** Plain `playerDiscardPile.push()` silently drops discard-invulnerable heroes (Cyclops "Unending Energy"). Route any new discard-from-hand mechanic through it.
- **`FightKOHeroYouHave` hardcoded its picker title to "Super-Skrull".** Parameterize as `FightKOHeroYouHave(source)` (string name or `villainCopy` object); default "KO a Hero". Mirror `koUpToNHeroesYouHave`'s `sourceName` pattern.

## Scheme transform / active-scheme reads

- **Transform-aware reads need a NEW `getActiveScheme()`** targeting only the ~5 transform-sensitive sites (twist dispatcher, `checkEvilWins`, both `updateVillainAttackValues` twins, `showPopup`'s twist branch). Do NOT broaden `getSelectedScheme()` (~50 setup-scoped DOM-radio callers) or setup validation breaks across all schemes. `getSelectedScheme()` reads the setup radio = pre-transform side.
- **`updateEvilWinsTracker()` needs an explicit case per numeric-threshold scheme.** Earthquake / House of M fell through to the default "See Scheme" and never showed a live counter. Logic in `checkEvilWins` is not enough; the display switch needs its own case.
- **Dynamic badge/title text that must track a transform** is set in the `updateGameBoard` render path from `getActiveScheme().name` — a static HTML `title` attribute goes stale on transform.

## City resize (transforming schemes)

- **Resize uses Model B (`destroyedSpaces[]` flag array), never physical realloc** — see `docs/expansion-decisions.md` for the decision rationale. Engine notes:
  - **`initCityArrays()` does `fill(null)`** — it wipes occupants; can't be used for an occupant-preserving resize.
  - **Hardcoded `cityIndex === 5` (mastermind-reserve slot) breaks in 6-7-space schemes.** Correct mapping: `cityIndex >= citySize`. Twin bug — existed in both the Location fight path and the villain fight path.
  - **`scheme.citySpaces`** is referenced in a comment as the size source but is never actually read; wire it or hardcode the target explicitly.
  - **Verify `destroyedSpaces[]` toggle-BACK (restore)** before relying on it — Earthquake/Tsunami restore on the opposite transform.

## Locations

- **Trigger field name: engine reads `.triggeredAbility`.** Locations declared with `locationTrigger:` were all dead — the `typeof fn === "function"` guard silently skips `undefined` with no error. Verify the field matches the engine's reader before declaring Location triggers done.
- **Two distinct Location events:** the "fight a Villain here" trigger (`.triggeredAbility`, fired from the `defeatVillain` hook when a villain in the same space is defeated) vs the Location's own `fightEffect` (`defeatLocation`, when the Location itself is fought). Never conflate; an expansion can implement one without the other.
- **`cityLocations[]` is never nulled before the trigger hook** (unlike `city[]`, which `defeatVillain` nulls first). Location trigger fns read `cityLocations[i]` directly, so the `createVillainCopy` whitelist gotcha does NOT apply to them; captured state on the `locationCard` is accessible to the trigger and to `defeatLocation`'s rescue logic via the same object reference.
- **Generic `bonusWhileVillain` DB field + `getLocationEffectiveAttack(cityIndex)` helper** replace hardcoded named-Location/subtype bonus checks; used for both fight cost AND the attack overlay. Locations otherwise have no attack overlay — the affordable-highlight reads base attack.
- **Location-attack overlay draws ONLY when effective !== base.** A Location with misleading art (Graveyard art prints 8, `attack` is 7) shows the wrong number — add a `forceAttackOverlay` flag OR'd into the overlay condition.
- **Location/villain can share a city cell** (`placeLocation` scans only `cityLocations[]` for a free slot). CSS peeks the Location ~75px above the villain; cap the peek's hover z-index below the villain's. Playwright `.click()` hits the geometric center (the villain) — call `showLocationAttackButton(idx)` then click `.attack-button`, or clear the villain first.
- **A scheme card on Location plumbing that counts rules-wise as a Villain** needs `isSchemeVillain: true` and exclusion in all Location-count loops (Korvac is the precedent — see `docs/known-issues.md` for the documented residual limitations).
- **Every branch of a Location placement event must use `onscreenConsole`, not `console.log`** — including the single-candidate auto-KO branch in `handleLocationOverflow` (the auto path is easy to miss).
- **"Play another card from the Villain Deck" (Location/ability-triggered) calls `processVillainCard()`**, not `drawVillainCard()` (which runs a full Golden Solo round: bystander spend, HQ rotation, 2-card draw).

## Scheme twists / mastermind tactics

- **Scheme-twist `koPile` timing:** `handleSchemeTwist` pushes the current twist to `koPile` BEFORE awaiting the effect, so a handler counting Scheme Twists in `koPile` already includes the current one — use `.length`, not `.length + 1`.
- **Transform-tactic double-score:** `revealMastermindTactic()` unconditionally pushes the tactic to `victoryPile`, but a transform-tactic also `placeLocation()`s a Location that scores again on defeat (2 VP for one card). Needs a `transformsToLocation` flag + conditional push guard. When that tactic's `fightEffect` is negated, the guard suppresses the VP push AND no Location is placed → 6 VP silently lost; the negate path needs its own guard.
- **Twist handlers that loop FORWARD over HQ slots while calling `goldenRefillHQ()`** (which splices/shifts mid-iteration) skip or mis-KO heroes. Iterate in reverse or collect indices first.

## Counters / state lifecycle

- **Expansion-scope top-level `let` counters** (`revelationsTwistCount`, `hydraOfficersNextToScheme`, `window.selectedScheme`) init at page load and carry across "play again" sessions unless reset in `initGame`. Reload-mitigated today (the only restart path is a full page reload); a soft-restart would turn this into an instant-loss bug.
- **`justAddedToDiscard` (script.js ~775) is dead infrastructure** — declared and reset but nothing pushes to it. There is no single discard-from-hand chokepoint, so any "cards discarded from hand this turn" counter needs new hooks at the scattered discard sites. (Root cause of Photon "Light the Way" always reading 0.)
- **"this turn" card mutations need an `endTurn` revert pass** that sweeps `cardsPlayedThisTurn` + `playerDiscardPile` + `koPile` and runs BEFORE the destroy-splice ops — card objects persist into discard/KO after the array clear and leak the mutation otherwise (Ronin "Mysterious Identity" class/team wildcard is the first revert-on-discard case).
- **A flag-based deferred action** (`addToHandEndOfTurn` etc.) is a silent dead effect unless a consumer pass exists in `endTurn`; the consumer must scan discard + deck + hand (`endTurn` can reshuffle discard into deck on thin-draw turns). Verify the consumer exists before shipping any deferred flag.

## Played cards

- **"Cards you played this turn" effects need the full six-flag filter:** `type === "Hero" && !isCopied && !isSimulation && !markedForDeletion && !markedToDestroy && !sidekickToDestroy`.
- **Played card object identity:** `confirmActions()` pushes the SAME object reference to both `cardsPlayedThisTurn` and the ability's `card` arg, so mutating the arg propagates to what `isConditionMet` reads. Safe because `generateHeroDeck` spreads each card (script.js ~4094) — played cards are per-instance copies, not shared DB refs.
- **Mandatory HQ swap (a played card replaces an HQ slot):** do NOT call `refillHQSlot()` — the incoming played card IS the refill; splice it from `cardsPlayedThisTurn` immediately or end-of-turn cleanup double-discards it.

## Villain identity & escape state

- **Never mutate `card.name` for a display-identity change** — it's the `findIndex` identity key AND whitelisted into `createVillainCopy`, so the mutation persists onto the fight copy and breaks lookups. Use a separate display field + position-keyed `onscreenConsole`; add a shared `resolveVillainDisplayName()` called from both `defeatVillain` twins.
- **`escapePile` is undefined** — the real global is `escapedVillainsDeck`. Reading the undeclared name throws `ReferenceError` in non-strict JS (two pre-existing sites: `powerManEscape`, `mandarinRingsSeekTheirTrueHand`).
- **`escapedVillainsCount` is shadowed by a local `const`** inside `checkEvilWins`/`updateEvilWinsTracker` filtering `type === "Villain"` — silently drops HYDRA Base (`type:"Location"`). Use `type === "Villain" || subtype === "Henchman"`; real Locations are never in `escapedVillainsDeck`.
- **Henchman subtype convention:** most henchmen are DB-typed `"Villain"`; HYDRA Base is the only one typed `"Location"`; all get `subtype:"Henchman"` from `generateVillainDeck`. A filter needing all henchmen uses `type === "Villain" || subtype === "Henchman"`. (For which conditions DO/DON'T hit HYDRA Base, see the rules ruling in `docs/rules-notes/`.)

## Mastermind

- **`getSelectedMastermind()` returns a fresh spread `{...base, ...base.epic}` for Epic masterminds** — reassigning `mastermind.tactics = []` mutates a throwaway copy. Clear the live array in-place with `mastermind.tactics.length = 0`.

## Bank / Streets position

- **`isBankOrStreets` must use `citySpaceLabels.indexOf("The Streets")` / `"The Bank"`** (labels include "The ") — bare `"Streets"`/`"Bank"` returns -1. Literal indices `i === 1 || i === 3` are a latent resize bug: under Earthquake/Tsunami the 7-space city has Streets=3, Bank=5.

## Misc helpers & verification

- **"Play a copy of a card" precedent is `chameleonFight`** (expansionPaintTheTownRed.js): deep-clone, set `markedForDeletion + isSimulation + isCopied` phantom flags, push to `cardsPlayedThisTurn` BEFORE `executeAbilityWithSpecialCases` (so prior class symbols are visible to the copy's conditional superpower), grant atk/rec to both `total*` and `cumulative*`. A phantom copy can't self-satisfy its OWN conditional superpower (`isConditionMet` slices off the last-pushed entry). Resolve-now, not banked.
- **Running a villain `fightEffect` outside the city-fight pipeline:** `createVillainCopy(v)` then `await window[copy.fightEffect](copy)` (works for henchmen and full villains; established by F-G3).
- **`handleCardPlacement` hardcodes `playerDeck`** and includes a playerDeck-only `stingOfTheSpider` side effect — reusing it on another deck requires parameterizing the target deck and gating the side effect. The free-ordering pickers (`chooseReturnOrderSingleRow`/`pickFromCardsSingleRow`) are likewise hardcoded to `playerDeck`.
- **Multi-select pickers should select by object identity** (array index/reference), not `card.id` — duplicate-named cards in one pool collide.
- **`defeatVillain()` reads the DOM city cell for its animation** — call `updateGameBoard()` first in a test harness or it throws "City cell not found".
- **To confirm an expansion file is loaded:** expansion JS is injected via `createElement('script')` in index.html, not a static `<script src>` — `grep 'createElement.*script'`, not a static-tag scan (WebFetch/HTML-summarizers miss it).
- **Confirm mode-independence by grep:** before claiming a function behaves identically in `golden` and `whatif`, grep it for `gameMode` refs; zero refs justifies full verification in one mode + a spot-check in the other.
