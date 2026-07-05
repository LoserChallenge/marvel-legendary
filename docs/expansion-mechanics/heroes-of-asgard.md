# Heroes of Asgard — Mechanics Reference

Analyzed: 2026-07-04
Status: Complete
Sources: rules/2020_Marvel_Legendary_HeroesAsgard_Rules_compressed.pdf (2-page rulesheet), docs/card-inventory/final/heroes-of-asgard.md

Reuse posture: HoA is ~80–85% reuse (per docs/expansion-reuse-difficulty-ranking.md). Most mechanics assemble existing primitives (GotG Artifact zone, bystander-attach lifecycle, transform-and-defer-VP, villain attack-modifier pipeline). The `Reuse verdict:` lines below are filled by pattern-reuse-scout (Step 5) with exact file:line targets — implementers read those in Phase 1 and cite them in Phase 2.5 specs.

---

## Keywords

### Worthy
**Rules definition:** "You are Worthy if you have a Hero that costs 5 or more." "Your Heroes" / "Heroes you have" include cards in your hand, cards you played this turn, and Hero Artifacts you control. Heroes in your deck and discard pile don't count. Villainous Weapons controlled as Artifacts have 0 cost and can never make you Worthy.
**Implementation approach:** A per-turn boolean predicate — `isWorthy()` — that scans the active player's current-visible Hero cards (hand + cards played this turn + controlled Hero Artifacts) for any Hero with `cost >= 5`. Many cards read it (heroes, villains, schemes). Re-evaluate live during the turn (playing/discarding a 5+ Hero flips the status). Recompute on every relevant UI refresh — it is not a one-time setup flag.
**Solo mode notes:** Not mode-divergent — it reads only the active player's own cards. Identical in Golden and What If? Solo.
**Mode-divergent?:** No
**Reuse verdict:** ADAPT — no `isWorthy()` exists, but the ingredients do: cost-threshold filters (`hq.filter(h => h.cost >= 7)` script.js:5287) and played-this-turn keyword scans (`cardsPlayedThisTurn.some(...)` script.js:8446); GotG already merges the three zones to check (`[...playerHand, ...playerArtifacts, ...cardsPlayedThisTurn]` expansionGuardiansOfTheGalaxy.js:2349). Assemble those into one shared predicate scanning hand + played + artifact zone for `cost >= 5`.
**Complexity:** New Capability (small, self-contained predicate)

### Conqueror
**Rules definition:** "[Space] Conqueror N" = "+N Attack while any Villain is in [Space]." A Villain with the keyword gets the bonus while it *itself* or *another* Villain occupies that space. Used by both Heroes ("Rooftops Conqueror 1") and Villains/Masterminds ("Bridge Conqueror 3"). City spaces referenced: Sewers, Bank, Rooftops, Streets, Bridge.
**Implementation approach:** A conditional attack bonus keyed to city occupancy.
- Hero-side: on play, if any Villain occupies the named space, grant +N Attack this turn (a normal conditional attack bump — also update the Final Showdown cumulative).
- Villain/Mastermind-side: the enemy's displayed Attack rises by N while a Villain sits in the named space. This flows through the villain attack-modifier pipeline (`attackFrom*` fields, `updateVillainAttackValues()` / `updateHQVillainAttackValues()` twins) and must update live as the city changes.
**Solo mode notes:** City is the same 5 spaces in both modes. Not mode-divergent. Confirm space-name strings match the engine's city keys.
**Mode-divergent?:** No
**Reuse verdict:** ADAPT — both halves ride existing plumbing. Villain-side: `attackFromOwnEffects` bucket in `updateVillainAttackValues()` (script.js:10639) / `updateHQVillainAttackValues()` (script.js:10944) twins — add a Conqueror term that fires when the named space is occupied. Hero-side: clone the Throg-style conditional bump that updates both `totalAttackPoints` AND `cumulativeAttackPoints` (script.js:8400). NEW glue only: the city-occupancy test for a named space (map space-name → index; occupancy = `city[i] !== null`).
**Complexity:** New Capability (city-occupancy-driven attack; villain-side is the harder half via the live attack pipeline)

### Artifact
**Rules definition:** A card that persists in play in front of you across turns (debuted in Guardians of the Galaxy). Some Hero cards in this set are also Artifacts and still count as Hero cards. When gained, a Hero Artifact goes to the discard like any Hero. When drawn, you may play it in front of you and use its effects; at end of turn it stays out while your other played cards are discarded. Use "once per turn" abilities each turn you control it. You may control multiple with the same name and use each. You cannot use an Artifact's "once per turn" ability during another player's turn. Hero Artifacts count as "your Heroes" for reveal effects and for Worthy (a controlled 5+ Hero Artifact makes you Worthy). You only "played" an Artifact on the turn you put it out — so Superpower abilities trigger only that turn, and "each Hero you played this turn" counts it only that turn.
**Implementation approach:** REUSE the GotG Artifact zone (persistent in-front-of-you cards). Key wiring: the Artifact zone must feed `isWorthy()` and "reveal a [class] Hero" / "your Heroes" checks; once-per-turn abilities gate on "it's your turn"; the "played this turn" flag is set only on the put-out turn (distinct from the persistent-control state).
**Solo mode notes:** Not mode-divergent.
**Mode-divergent?:** No
**Reuse verdict:** REUSE — GotG Artifact zone is fully built: `playerArtifacts` global (expansionGuardiansOfTheGalaxy.js:9), `playedArtifact()` puts a card out (expansionGuardiansOfTheGalaxy.js:237), popup/render + USE button (expansionGuardiansOfTheGalaxy.js:93), `artifactAbilityUsed` set on use (expansionGuardiansOfTheGalaxy.js:226) and reset each turn-end (script.js:12209). Cards tag as `keywords:["Artifact"]` in the DB (Hero-type example Drax "Knives of the Hunter" cardDatabase.js:10947). GAPS to close: (a) no explicit "it's your turn" gate on the USE button (currently always clickable — HoA must add the your-turn guard); (b) `isWorthy()` must read `playerArtifacts`; (c) "played this turn" is already tracked separately from persistent control.
**Complexity:** Reuse (verify GotG impl covers once-per-turn gating + counts-as-your-Heroes)

### Thrown Artifact
**Rules definition:** "Put this card on the bottom of your deck and use its ability." You can throw as many Artifacts as you want in a turn (including multiple with the same name). You can throw on the same turn you play it, or a later turn. You can only throw during your turn *unless the card says otherwise* (Winged Helm explicitly allows throwing during any player's turn to prevent a Wound). All Hero Artifacts in this set are Thrown Artifacts. If a "copy an Artifact" effect (Rogue/Hulkling/Scarlet Witch) is applied, you use the Artifact's "Once per turn" OR "When you throw this" ability once, with no other effect (nothing goes to the bottom of the deck).
**Implementation approach:** A player action — "throw" a controlled/held Thrown Artifact: move the card to the bottom of `playerDeck` and fire its listed ability. Needs a throw affordance (button/click) on eligible cards. Multiple throws per turn; only on your turn (except Winged Helm's cross-turn Wound-prevention reaction, which hooks the "about to gain a Wound" moment).
**Solo mode notes:** Not mode-divergent (Winged Helm's reaction works solo — the "player" gaining the Wound is you).
**Mode-divergent?:** No
**Reuse verdict:** ADAPT — all three primitives exist. Bottom-of-deck: `playerDeck.unshift(card)` (bottom = index 0, since draw is `.pop()` off the end) — used in expansionRevelations.js:2054. Card USE-button affordance: GotG artifact USE button + click→ability→refresh (expansionGuardiansOfTheGalaxy.js:142). Winged Helm's cross-turn Wound-prevention reaction: the `drawWound()` pre-wound hook already scans hand + played for invulnerability cards and pops a choice popup (cardAbilities.js:313–332, `showInvulnerabilityChoicePopup` 335) — add a "throwable Winged Helm in artifact zone" branch to that same hook. NEW glue: the throw button wiring + firing the card's "when you throw" ability, and multiple-throws-per-turn.
**Complexity:** New Capability (throw action + UI affordance; moderate)

### Villainous Weapon
**Rules definition:** An all-new card type — NOT a Villain. Each villain group includes cards that say "Villainous Weapon." Behavior:
- When played from the Villain Deck, the Weapon is **captured by the Villain in the city space closest to the Villain Deck**. If there are no Villains in the city, **KO the Weapon**.
- A captured Weapon adds its printed **Attack bonus** to the holding Villain (tucked under so the bonus is visible). An enemy may hold any number of Weapons — bonuses combine.
- When a Villain holding Weapons **escapes the city, the Mastermind captures all those Weapons** (and gains their bonuses).
- When you **defeat** a Villain/Mastermind holding Weapons, **put all those Weapons into your discard pile as Artifacts.**
- In your control as an Artifact: **0 cost, no color/Hero class, does not count as a Hero or Villain card, can never make you Worthy.** You **never** get the Weapon's printed Attack bonus — only Villains/Masterminds get that; you get only the specific Artifact abilities written on the card.
- If, after you've gained a Weapon, a card effect makes an enemy capture it again, it works as a Villainous Weapon again until someone defeats that enemy to reclaim it.
- Malekith and Hela have Mastermind Tactics that turn into Villainous Weapons. You win when the Mastermind has no face-down Tactics left, even if some Tactics have turned into other card types elsewhere.
**Implementation approach:** A composite assembled from existing primitives:
- "captured by / tucked under a Villain, moves with it, released on defeat" → bystander-attach lifecycle (attach an entity to a villain card; whitelist any custom state in `createVillainCopy()`).
- "adds Attack bonus to holder" → villain attack-modifier pipeline (`attackFrom*`, `updateVillainAttackValues()` twins).
- "gained as an Artifact on defeat" → transform-and-defer-VP + the Artifact zone; the Weapon becomes a 0-cost, classless Artifact in the discard (does not push VP).
- "Mastermind captures on escape" → re-attach the Weapon(s) to the mastermind in the escape handler.
- "closest to the Villain Deck" → resolve to the appropriate city index at play time; no Villains → KO the Weapon.
**Solo mode notes:** Villain Deck + city exist in both modes; capture-on-play, capture-on-escape, and gain-on-defeat all run through shared flows. Not a listed divergent row, but exercise **both modes** given the escape→mastermind-capture path touches escape handling and the attack pipeline.
**Mode-divergent?:** No (dual-mode exercise recommended — escape/attack pipeline complexity)
**Reuse verdict:** ADAPT (composite of REUSE parts) — every sub-behavior has direct prior art: (1) tuck-under-villain lifecycle = `bystander`/`plutoniumCaptured`/`XCutionerHeroes` attach arrays (attach: script.js:5647; move-with-villain: the arrays ride the villain object through city shifts; whitelist a new `capturedWeapons` field in `createVillainCopy()` script.js:13364, alongside `bystander`/`plutoniumCaptured`/`XCutionerHeroes` already listed). (2) adds-Attack-to-holder = `attackFromOwnEffects` bucket (script.js:10786 already does `villain.bystander.length * 2` — mirror it for weapon Attack sum). (3) escape → holder carries captives = `handleVillainEscape()` already pushes all three attach-arrays to the escape pile (script.js:6318–6354); for HoA the escaping villain's Weapons transfer to the Mastermind (adapt the same loop, retarget the destination). (4) gained-as-Artifact-on-defeat = GotG Infinity Gems are the exact precedent — `type:"Villain"` cards that convert to Artifacts on defeat and SKIP the VP push via `team !== "Infinity Gems"` in the defeat guard (script.js:13898); weapons take the same skip + convert to a 0-cost classless Artifact into discard. (5) "closest to Villain Deck" = the **rightmost occupied** city index (Sewers = `citySize-1`), the entry end (villains enter via `enterCityFromRight` script.js:5478 and shift toward index 0 which is the escape end); no villains → KO. NEW glue: the capture-on-play hook + weapon-as-Artifact abilities.
**Complexity:** New Capability (composite; centerpiece build, but reuse-heavy)

---

## New Card Types

### Hero Artifacts (the 6 throwable hero cards)
**Rules definition:** Six hero cards are Hero Artifacts (all also Thrown Artifacts): Mjolnir, Stormbreaker, Dragonfang, Dimensional Blade, Winged Helm, Golden Apples of Idunn. They are Heroes AND Artifacts simultaneously — recruited/drawn/played as Heroes, persist as Artifacts, count as Heroes for Worthy/reveals, and can be thrown.
**Implementation approach:** Tag these DB cards as Artifact + Thrown Artifact; they route through the Artifact zone (persist) and the throw action. Mjolnir/Stormbreaker gate throwing on Worthy.
**Solo mode notes:** Not mode-divergent.
**Mode-divergent?:** No
**Reuse verdict:** REUSE — tag each as a Hero card with `keywords:["Artifact"]` (exact precedent: Drax "Knives of the Hunter" is a `heroName`/`classes`/`cost` card with `keywords:["Artifact"]`, cardDatabase.js:10947). They route through the built GotG Artifact zone (persist) + the new throw action (see Thrown Artifact verdict). No new card-type machinery.
**Complexity:** Reuse + New Capability (rides Artifact + Thrown Artifact)

---

## New Game Systems

### Villain → Artifact transformation on defeat
**Rules definition:** Some defeated cards become Artifacts instead of ordinary VP trophies. Surtur (no VP): Fight effect puts him into your discard pile as a "Surtur's Crown" Artifact (Once per turn: Sewers Conqueror 1). Every Villainous Weapon becomes an Artifact when its holder is defeated. Malekith's "Darkspear" and various Tactics convert to Weapons/Artifacts.
**Implementation approach:** transform-and-defer-VP pattern — on defeat, instead of pushing VP, the card converts to a 0-cost Artifact placed in the discard. Surtur has no VP, so his defeat handler skips the VP push (analogous to the `skrulled:true` VP-push-skip guard) and drops the Crown Artifact.
**Solo mode notes:** Not mode-divergent.
**Mode-divergent?:** No
**Reuse verdict:** REUSE — the VP-push-skip guard already supports exactly this shape: `if (!villainCard.skrulled && !villainCard.gainAsHero && villainCard.team !== "Infinity Gems")` gates the Victory-Pile push (script.js:13898), and the card's `fightEffect` does the conversion (SWV1 `gainAsHero` villains convert to Heroes into discard; GotG Gems convert to Artifacts). Surtur (no VP) rides this: add a skip-flag (e.g. `gainAsArtifact` / reuse the Infinity-Gems style skip) so his defeat drops "Surtur's Crown" into the artifact zone instead of scoring. Villainous Weapons use the same converter path.
**Complexity:** Reuse

### Army of the Dead tokens (Hela Master Strike)
**Rules definition:** Hela's Master Strike puts a new "Army of the Dead" Villain into the city (5 Attack / 3 VP; Epic: 6 Attack / 4 VP). Then choose a Villain worth ≥3 VP (Epic: ≥4) from your Victory Pile — including an Army of the Dead — to enter the city. If you had none, each player gains a Wound.
**Implementation approach:** Generate a dynamic Villain token (like scheme-spawned villains — Frost Giant Invaders, Revelations tokens) and place it in the city; plus a "return a Villain from your Victory Pile to the city" action (card-choice-popup over eligible VP villains). Master Strike fires in both modes; multi-mastermind solo rules per expansion-decisions.md apply if a second mastermind is present.
**Solo mode notes:** "choose a Villain from YOUR Victory Pile" = active player's own pile — native solo. The "each player gains a Wound" fallback → self-apply (you gain a Wound). Master Strike / win-condition interactions touch the mastermind flow.
**Mode-divergent?:** Yes (mode-divergence rows: 6 win-condition/Master Strike; 8 "each player" fallback)
**Reuse verdict:** ADAPT — both halves have direct precedent. Token generation: build a villain object and place it via `enterCityFromRight()` (script.js:5478) — the same call Revelations Mandarin Rings and SWV1 corrupted-Sidekicks use to drop a dynamically-built villain into the city; `stampCardsAsInDeckVillains()` (script.js:4325) is the stamp-any-card-as-Villain helper. Return-a-Villain-from-VP-to-city: `mandarinStrike()` is the near-exact template — pick-from-VP popup → `enterCityFromRight(chosen)` → else `drawWound()` (expansionRevelations.js:4248). HoA adds only a VP-threshold filter (≥3 / Epic ≥4) to the pool. "Each player gains a Wound" fallback → self-apply `drawWound()` (solo precedent expansionRevelations.js:5104). NOTE: Revelations also has `escapeVillainFromVictoryPile` (expansionRevelations.js:5016) but that routes VP→**escape pile**, not city — use the Mandarin `enterCityFromRight` path instead.
**Complexity:** New Capability (token generation), similar to scheme-generated villains

### Scheme trackers (4 schemes, each a twist-driven counter to an Evil-Wins threshold)
**Rules definition:**
- **Asgardian Test of Worth** (11 Twists): Twist 1–7 — each not-Worthy player discards a card; then if at least half the players (round up) are not Worthy, this Twist becomes a "Moral Failing." Twist 8–11 — always a Moral Failing. Evil Wins at 5 Moral Failings.
- **The Dark World of Svartalfheim** (10 Twists): each Twist places an "Eternal Darkness" token on a city or HQ space that lacks one. Villains in Eternal-Darkness city spaces get +1 Attack; recruiting a Hero from an Eternal-Darkness HQ space costs +1 Recruit. Evil Wins when all city spaces OR all HQ spaces are covered.
- **Ragnarok, Twilight of the Gods** (11 Twists): choose a Villain worth ≥2 VP from your Victory Pile to enter the city; then if total Attack of Villains in the city ≥ that Twist's Guardian threshold (see inventory table), the Twist becomes a "Guardian Defeated." Evil Wins at 5 Guardians Defeated.
- **War of the Frost Giants** (9 Twists): Twist 1–7 — a "Frost Giant Invader" Villain (6 VP / 6 Attack; "+4 Attack if you are not Worthy") enters the city. Twist 8–9 — same, plus a Frost Giant Invader from each player's Victory Pile enters the city. Evil Wins at 5 Frost Giant Invaders in city and/or Escape Pile.
**Implementation approach:** Each scheme = a custom Twist handler + an Evil-Wins condition + an on-screen counter. Evil-Wins wiring: add a `case` to the `endGameConditions` switch in `script.js` and a twin `case` to `updateEvilWinsTracker()` for the live counter (per CLAUDE.md). Eternal Darkness = per-space tokens (Location/`destroyedSpaces`-style flag array over city + HQ spaces) plus attack/recruit modifiers. Frost Giant Invader = dynamic Villain token. Ragnarok = return-villain-from-VP + city-total-attack check.
**Solo mode notes:**
- Asgardian Test — "at least half the players (round up)": solo = 1 player, so being not-Worthy is ≥ half → you must be Worthy on Twists 1–7 to avoid a Moral Failing. (Player-count-scaled.)
- War of the Frost Giants — Twist 8–9 "each player's Victory Pile" → self-apply (your Victory Pile).
- Ragnarok — "your Victory Pile" is native solo.
- Svartalfheim — self-contained.
- **Scheme-scope gate: all four schemes have viable 1-player solo forms. None SKIP or DEFER.**
**Mode-divergent?:** Asgardian Test — Yes (rows 8, 9). War of the Frost Giants — Yes (row 8). Ragnarok — No. Svartalfheim — No.
**Reuse verdict:** ADAPT (all schemes) — the Evil-Wins scaffold is fully established: add a `case` to the `endGameConditions` switch (script.js:9654; SWV1 "crush8MasterStrikes" at 9738 is a clean threshold-counter model) + a twin `case` to `updateEvilWinsTracker()` for the live `N/M` counter (script.js:11280; e.g. Corrupt "N/4 Sidekicks Escaped" at 11306). Twist handler = point the scheme's `twistEffect` at a new async function (dispatched via `window[selectedScheme.twistEffect]()` script.js:6190; model: SWV1 `darkAllianceTwist` expansionSecretWarsVol1.js:2921). Per-scheme parts: **Svartalfheim** Eternal Darkness = reuse `destroyedSpaces` flag-array model for CITY spaces (script.js:551/569/584) but HQ has NO equivalent flag array (HQ "destroy" = `hq[i]=null`) → NEW small parallel HQ-flag array; plus attack (+1 via `attackFromScheme`) and recruit (+1) modifiers. **Frost Giants** = dynamic villain token via `enterCityFromRight` (as Army of the Dead). **Ragnarok** = return-villain-from-VP-to-city (Mandarin template) + city-total-Attack check (sum `city[i]` effective attack). **Asgardian Test** = per-Twist not-Worthy check + Moral Failing counter (self-apply in solo). NEW glue per scheme: the specific twist logic; the counter scaffolds are reuse.
**Complexity:** New Capability per scheme (custom twist + counter over an established Evil-Wins pattern)

---

## Core Engine Changes Required

Most work lives in the expansion file, but these touch shared `script.js` systems:

1. **`isWorthy()` predicate + wiring** — a shared helper other cards call; the Artifact zone and "your Heroes"/reveal checks must include it. Agreed approach: implement once, reused everywhere.
2. **Conqueror on the villain attack pipeline** — villain/mastermind Attack must rise while a Villain occupies a named city space, via `attackFrom*` + `updateVillainAttackValues()` / `updateHQVillainAttackValues()` twins (keep both in sync).
3. **Villainous Weapon capture/escape hooks** — capture-on-play (closest-to-deck) and capture-on-escape (mastermind grabs) hook the villain-deck/escape flow; custom weapon state must be whitelisted in `createVillainCopy()`.
4. **Evil-Wins conditions ×4** — one `case` per scheme in the `endGameConditions` switch, plus the `updateEvilWinsTracker()` twin case for each live counter.
5. **Eternal Darkness space tokens** — per-space flags over city + HQ with attack/recruit modifiers (reuse the `destroyedSpaces`-style flag-array model, not physical realloc).

---

## Solo Mode Decisions

| Mechanic | Question | Decision |
|---|---|---|
| The Mangog "player on your right" (attack bonus) | No opponent in solo | **Self-apply** — +1 Attack per Villain in *your* Victory Pile. (Official Advanced Solo "do it yourself"; faithful 1:1 vs one opponent's pile.) |
| The Mangog Escape "each player who is not Worthy gains a Wound" | each player in solo | **Self-apply** — if you are not Worthy, you gain a Wound. |
| Naglfar (Hela Tactic) "player on your right reveals from their VP" | No opponent in solo | **Self-apply** — reveal your highest-VP Villain from *your* Victory Pile; it enters the Bridge or Streets if one is empty. |
| Army of the Dead fallback "each player gains a Wound" | each player in solo | **Self-apply** — you gain a Wound. |
| Asgardian Test "at least half the players (round up)" | player-count scaling in solo | Solo = 1 player: being not-Worthy is ≥ half → Moral Failing. You must be Worthy on Twists 1–7 to avoid one. |
| War of the Frost Giants Twist 8–9 "each player's Victory Pile" | each player in solo | **Self-apply** — your Victory Pile. |
| Ragnarok "choose a Villain from your Victory Pile" | — | Native solo; no change. |
| Scheme-scope gate (all 4 schemes) | any scheme unviable solo? | All four viable; none SKIP/DEFER. |

**Ruling basis:** official Advanced Solo rule — "when a Villain or Mastermind Tactic tells 'each other player' to do something, do it yourself" (verified 2026-07-04, BGG Advanced Solo ruling). Applied per-case to these HoA cards; the broader cross-expansion "other player" pass (still deferred) is *not* rewritten here.

---

## Prior Art & Reuse Candidates

_Survey run 2026-07-04 (pattern-reuse-scout, Step 5). All file:line pointers verified in-code against `Legendary-Solo-Play-main/Legendary-Solo-Play-main/`. Where a verdict says BUILD NEW, treat it as PROVISIONAL — semantic search can miss reuse filed under mismatched naming; the implementer re-verifies in-code at build time before treating "no precedent" as settled._

**Codebase-orientation facts confirmed this survey (load-bearing for several mechanics):**
- **City geometry:** villains ENTER at the rightmost slot (`city[citySize-1]` = "Sewers", fed by the Villain Deck at `drawVillainCard` script.js:5385) via `enterCityFromRight()` (script.js:5478), then bubble-shift toward index 0, and ESCAPE from index 0 (script.js:5505). Therefore **"the city space closest to the Villain Deck" = the rightmost occupied index**, NOT index 0. Get this right in the Villainous Weapon capture-on-play.
- **VP-push-skip guard** (the single choke point for "defeated card becomes something else"): `if (!villainCard.skrulled && !villainCard.gainAsHero && villainCard.team !== "Infinity Gems")` at script.js:13898 — any card matching a skip flag is NOT pushed to the Victory Pile; its `fightEffect` converts it instead.
- **`createVillainCopy()` whitelist** (script.js:13364): already copies `bystander, plutoniumCaptured` (via the copy), `XCutionerHeroes, capturedHero, shards, darkPower, isTyrant, gainAsHero, skrulled, scarletWitch, ascendsToMastermind`, etc. Any NEW captured-weapon state field MUST be added to this whitelist or the fight copy is stripped.
- **No player-count global exists** (no `numberOfPlayers`/`players.length`) — solo is single-player, so every "each player" / "half the players" scales to self-apply (precedent comment expansionRevelations.js:5103–5104).

---

MECHANIC: Worthy — per-turn predicate: any Hero with cost ≥ 5 in hand + played-this-turn + controlled Hero Artifacts
PRIOR ART: cost-threshold filter `hq.filter(h => h.cost >= 7)` (script.js:5287); played-this-turn keyword scan `cardsPlayedThisTurn.some(...)` (script.js:8446); three-zone merge `[...playerHand, ...playerArtifacts, ...cardsPlayedThisTurn]` (expansionGuardiansOfTheGalaxy.js:2349). No existing `isWorthy()`.
HOW IT WORKS: Existing code filters a card zone by a cost/class condition and, separately, GotG already unions hand + artifact zone + played-this-turn to evaluate a "cards you have" condition.
RECOMMENDATION: ADAPT — assemble the three-zone union + a `cost >= 5` filter into ONE shared `isWorthy()` helper; recompute on every relevant UI refresh (not a setup flag). Many cards call it.

MECHANIC: Conqueror N — +N Attack while a Villain occupies a named city space (hero-side conditional bump; villain/mastermind-side live pipeline term)
PRIOR ART: `updateVillainAttackValues()` (script.js:10639) + `updateHQVillainAttackValues()` twin (script.js:10944) with `attackFromOwnEffects` bucket already doing occupancy-style math (`villain.bystander.length * 2` at script.js:10786); Throg-style conditional hero bump updating both totals (script.js:8400–8407).
HOW IT WORKS: The villain-attack twins recompute `attackFrom*` buckets every frame and sum them into displayed Attack; hero abilities add to `totalAttackPoints` + `cumulativeAttackPoints` under a board condition.
RECOMMENDATION: ADAPT — villain-side: add a Conqueror term to `attackFromOwnEffects` gated on "named space occupied" (in BOTH twins). Hero-side: clone the Throg conditional-bump. NEW glue: map space-name → city index, occupancy = `city[i] !== null`.

MECHANIC: Artifact — a card that persists in front of you across turns (Hero Artifacts), counts as your Hero, once-per-turn ability
PRIOR ART: GotG Artifact zone — `playerArtifacts` (expansionGuardiansOfTheGalaxy.js:9), `playedArtifact()` (expansionGuardiansOfTheGalaxy.js:237), popup + USE button (expansionGuardiansOfTheGalaxy.js:93/142), `artifactAbilityUsed` set-on-use (expansionGuardiansOfTheGalaxy.js:226) + turn-end reset (script.js:12209); DB tag `keywords:["Artifact"]` on a Hero card (Drax "Knives of the Hunter", cardDatabase.js:10947).
HOW IT WORKS: A played Artifact moves into a persistent `playerArtifacts` array (not discarded at turn end); its once-per-turn ability is gated by an `artifactAbilityUsed` boolean reset each turn.
RECOMMENDATION: REUSE — the zone is built. Close two gaps for HoA: (a) add an "it's your turn" gate to the USE button (GotG leaves it always clickable), (b) feed `playerArtifacts` into `isWorthy()` and "reveal a Hero"/"your Heroes" checks.

MECHANIC: Thrown Artifact — player action: put a controlled/held Artifact on the bottom of your deck and fire its ability; Winged Helm throws cross-turn to prevent a Wound
PRIOR ART: bottom-of-deck `playerDeck.unshift(card)` (expansionRevelations.js:2054); card USE-button affordance (expansionGuardiansOfTheGalaxy.js:142); `drawWound()` pre-wound invulnerability hook → `showInvulnerabilityChoicePopup` (cardAbilities.js:313–332/335).
HOW IT WORKS: `unshift` puts a card at the bottom (draw is `.pop()` off the end); a card can carry a clickable ability affordance; `drawWound()` already checks hand + played for cards that can prevent the Wound and pops a choice popup before applying it.
RECOMMENDATION: ADAPT — reuse `unshift` for bottom-of-deck, the USE-button pattern for the throw affordance, and add a "throwable Winged Helm in artifact zone" branch to the existing `drawWound()` pre-wound hook (the cross-turn reaction). NEW glue: throw-button wiring + multiple-throws-per-turn.

MECHANIC: Villainous Weapon — new card type captured/tucked under a Villain (adds Attack), transfers to Mastermind on escape, becomes a 0-cost Artifact on the holder's defeat
PRIOR ART: attach-under-villain arrays `bystander` (attach script.js:5647), `plutoniumCaptured`, `XCutionerHeroes` (Dark City); `attackFromOwnEffects` adds captive count to holder Attack (script.js:10786); `handleVillainEscape()` carries all captives with the escaping villain (script.js:6318–6354); GotG Infinity Gems = `type:"Villain"` → Artifact-on-defeat with VP-skip (`team !== "Infinity Gems"` guard, script.js:13898); `enterCityFromRight`/city geometry (script.js:5478).
HOW IT WORKS: Captive cards live in an array ON the villain object (so they ride city shifts and escape with it); the defeat/escape handlers iterate those arrays to release/transfer; the VP-skip guard lets a defeated "villain" convert to another card type instead of scoring.
RECOMMENDATION: ADAPT (composite of REUSE parts) — attach = new `capturedWeapons` array (whitelist it in `createVillainCopy()` script.js:13364); Attack bonus = new `attackFromOwnEffects` term; escape = adapt the `handleVillainEscape` capture loop but retarget the destination to the Mastermind; gain-on-defeat = Infinity-Gems converter path (VP-skip + convert to 0-cost classless Artifact into discard). NEW glue: capture-on-play at the rightmost occupied space (KO if no villains) + the weapon's Artifact abilities.

MECHANIC: Hero Artifacts (the 6 throwable hero cards) — Heroes that are also Artifacts and Thrown Artifacts
PRIOR ART: Hero-type card carrying `keywords:["Artifact"]` (Drax "Knives of the Hunter", cardDatabase.js:10947) routing through the GotG Artifact zone.
HOW IT WORKS: A card is both a Hero (has `heroName`/`classes`/`cost`) and an Artifact (via the keyword) — recruited/played as a Hero, persists via the artifact zone.
RECOMMENDATION: REUSE — tag the 6 DB cards `keywords:["Artifact"]`; they ride the built Artifact zone + the new throw action. No new card-type machinery.

MECHANIC: Villain → Artifact transformation on defeat (Surtur's Crown; every defeated Weapon holder)
PRIOR ART: VP-push-skip guard (script.js:13898); SWV1 `gainAsHero` villains convert to Heroes into discard; GotG Gems convert to Artifacts on defeat — both use the same skip + `fightEffect` converter.
HOW IT WORKS: A defeated card whose skip flag is set is NOT pushed to VP; its `fightEffect` re-types it and routes it (to discard as Hero, or to the artifact zone).
RECOMMENDATION: REUSE — add a skip flag for Surtur/Weapons (mirror the Infinity-Gems / `gainAsHero` skip) and a converter that drops the card into the artifact zone as a 0-cost Artifact. Surtur has no VP, so the skip is exactly the behavior.

MECHANIC: Army of the Dead tokens (Hela Master Strike) — spawn a new Villain token into the city; then return a Villain (≥3 VP) from your Victory Pile to the city, else gain a Wound
PRIOR ART: `enterCityFromRight()` places a dynamically-built villain into the city (script.js:5478); `stampCardsAsInDeckVillains()` stamps any card as a Villain (script.js:4325); `mandarinStrike()` = return-a-Villain-from-VP-to-city template: pick-from-VP popup → `enterCityFromRight(chosen)` → else `drawWound()` (expansionRevelations.js:4248).
HOW IT WORKS: A villain object is built at runtime and dropped into the city via the normal entry call; Mandarin's Master Strike already does the VP→city return with a wound fallback.
RECOMMENDATION: ADAPT — build the Army-of-the-Dead token and place it via `enterCityFromRight`; clone `mandarinStrike` for the VP-return, adding a VP-threshold filter (≥3 / Epic ≥4) to the pool; "each player gains a Wound" fallback → self-apply `drawWound()`. (Do NOT use `escapeVillainFromVictoryPile` expansionRevelations.js:5016 — it routes VP→escape pile, not city.)

MECHANIC: Scheme trackers ×4 (Asgardian Test / Svartalfheim / Ragnarok / War of the Frost Giants) — each a twist-driven counter to an Evil-Wins threshold
PRIOR ART: `endGameConditions` switch (script.js:9654; threshold model SWV1 "crush8MasterStrikes" script.js:9738); `updateEvilWinsTracker()` twin live counter (script.js:11280; "N/4 Sidekicks Escaped" 11306); twist dispatch `window[selectedScheme.twistEffect]()` (script.js:6190; model `darkAllianceTwist` expansionSecretWarsVol1.js:2921); `destroyedSpaces` per-city-space flag array (script.js:551/569/584); `enterCityFromRight` token drop; Mandarin VP-return.
HOW IT WORKS: A scheme's `twistEffect` async fn runs each Twist, mutating a counter; the `endGameConditions` case checks the counter against a threshold and the `updateEvilWinsTracker` twin renders the live `N/M`. `destroyedSpaces` is a per-city-space boolean array read every frame.
RECOMMENDATION: ADAPT (all four) — reuse the Evil-Wins switch + tracker-twin + twist-dispatch scaffold for every scheme. Per-scheme: Svartalfheim reuses the `destroyedSpaces` model for CITY spaces but needs a NEW small parallel HQ-flag array (HQ has no boolean flag array — "destroy" is `hq[i]=null`), plus `attackFromScheme` +1 and +1 Recruit modifiers; Frost Giants + Army use `enterCityFromRight` token drop; Ragnarok uses the Mandarin VP-return + a city-total-Attack sum; Asgardian Test is a per-Twist not-Worthy check + Moral Failing counter (self-apply in solo). NEW glue per scheme = the specific twist logic only.

**Nothing scored a clean BUILD NEW.** The only genuinely new, no-precedent pieces are small glue sitting on top of proven scaffolds: the `isWorthy()` predicate body, the throw-button wiring, the city-occupancy test for Conqueror, the capture-on-play hook, and one small HQ-space flag array for Svartalfheim. Every one of those attaches to an existing pattern documented above — none is a from-scratch subsystem.

---

## Open Questions

- **Laufey Ambush misprint** — the card's Ambush text says "Casket of Eternal Winters" but the weapon is "The Casket of Ancient Winters" (Escape text uses the correct name). Confirmed misprint; implement Ambush against "The Casket of Ancient Winters." No open decision — flagged so the implementer doesn't chase a nonexistent card.
- **Broader "other player" cross-expansion pass** — this build's self-apply ruling on Mangog/Naglfar leans that deferred unified pass toward *self-apply* for VP-pull effects (the earlier provisional project note said NO-OP for VP-pulls; the official rule sides with self-apply). Logged for the deferred pass; prior expansions' NO-OP calls are NOT changed here (per the per-case preference).
