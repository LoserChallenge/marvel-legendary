# Secret Wars Vol.1 — Phase 3b HEROES build map (reuse survey)

Produced by `pattern-reuse-scout` 2026-06-24 (rule-9 diagnose-first survey), before any 3b code.
Authoritative spec = `docs/expansion-specs/secret-wars-vol1.md` lines 105-513 (14 heroes / 56 cards).
All paths under `Legendary-Solo-Play-main/Legendary-Solo-Play-main/`.

## Two corrections that WILL bite if taken at face value
1. **`KO1To4FromDiscard()` (`cardAbilities.js:11735`) is DISCARD-ONLY, 1–4 cards, returns nothing.** CLAUDE.md + the spec call it the "KO from hand OR discard" reuse — it is NOT. Reuse only its popup *shape*; build a small `koOneFromHandOrDiscard()` over the COMBINED hand+discard pool that RETURNS the KO'd card (Last Survivor needs to check `type==="Wound"`; others branch on KO-happened).
2. **There is NO Mastermind free-defeat path and NO integer 4-defeat counter.** Golden "4 defeats" = the mastermind's 4 **tactics**; a defeat pops one tactic. Win check `isMastermindDefeated()` (`script.js:15470`, `tactics.length===0`) → `checkWinCondition()` (`script.js:16684`). Imperius Rex superpower + Utter Annihilation Mastermind branch must BUILD NEW (tactic-pop + tactic-defeat bonuses + `checkWinCondition()`), verify both modes.

## Already-built helpers (REUSE, do not rebuild) — in `expansionSecretWarsVol1.js`
- `gainSidekick(destination)` (:16) — "discard"|"hand"|"deckTop", no cost/cap, empty-stack no-op.
- `crossDimensionalRampage(families, name)` (:45) — Rage Out reuses with `["Wolverine","Weapon X","Old Man Logan"]`.
- `gainVillainAsHero()` (:94) — villain-side only; no 3b hero consumer.
- reveal-top→Draw-or-Teleport scaffold: `apocalypticBlinkFight()` (:180); KO-variant `infernoDarkchildeFight()` (:363).

## Family 1 — count cardsPlayedThisTurn by predicate → grant (REUSE)
Cards: Disrupt Circuits, Multifaceted Genius, Absorb Energies, Marvelous Strength, Hero from Another Dimension, Dimensional Portal, Master Combatant.
- Template: **`IronManArcReactorBonusAttack()` `cardAbilities.js:1177`** (filter `cardsPlayedThisTurn` → count → `totalX += n; cumulativeX += n; updateGameBoard()`). `hasClass` form at `expansionFantasticFour.js:73` (copy the local-const form; dual-class-safe).
- Real-card filter (5 flags): `!isCopied && !sidekickToDestroy && !markedToDestroy && !markedForDeletion && !isSimulation`. "each other" = exclude self by object identity.
- **CAVEAT:** do NOT use the Cyclops/Cap Pattern-A (`bonusAttack()` + DB `multiplier`) — the count there only drives the message; math can desync. Use the Iron Man compute-and-grant form.

## Family 2 — KO from hand OR discard → conditional bonus (ADAPT)
Cards: Phase Out (+1 Atk), Trust Me I'm a Doctor (+1 Rec), Feed the Sharks (draw), Last Survivor (draw-if-Wound), Transdimensional Overlord (KO VP Bystander→+2 Atk; Teleport first).
- Build `koOneFromHandOrDiscard()` (combined pool, single card, RETURNS the card). Popup shape from `KO1To4FromDiscard` (`cardAbilities.js:11735`). Wound = `card.type==="Wound"`.

## Family 3 — gainSidekick consumers (REUSE)
King of Wakanda (`gainSidekick("deckTop")`×3 on Illuminati else ×3 discard), Rally (×1–2), Lead the Armies (×1), Enslave the Will (per-defeat, needs §10c listener), Marvel Team-Up (×1 + reveal-draw).

## Family 4 — Teleport + reveal-top→Draw-or-Teleport (REUSE/ADAPT)
`teleport(card)` `cardAbilitiesDarkCity.js:3767` (card must be in playerHand; queues `cardsToBeDrawnNextTurn` + `nextTurnsDraw++`). `playOrTeleport()` :3789. `cardsToBeDrawnNextTurn` declared `script.js:834`, consumed `:11839`.
- Cloak of Levitation ≈ verbatim `apocalypticBlinkFight` gated on Range. Sorcerer Supreme = reveal-3 loop, per-card Draw/Teleport. Dimensional Portal / Wield / Travel / Transdimensional = `teleport()` the card, then rider via Family 1/2.

## Family 5 — ≥6-Recruit threshold + once-per-turn (REUSE deferred-flag)
Lady Thor: Mysterious Origin (draw), Chosen by Asgard (+2 Atk), Living Thunderstorm (+6 Atk).
- Deferred-flag pattern: **`throgHighRecruitReward()` `cardAbilitiesSidekicks.js:204`** (spec mislabels it `throgSidekickAbility`) → flag `throgRecruit` `script.js:882`, consumed in `updateGameBoard()` `script.js:8248` when `cumulativeRecruitPoints>=N` later crossed, reset `:11780`. Immediate read sibling: `ThorHighRecruitReward()` `cardAbilities.js:1379`.
- Add one per-card once-per-turn flag (e.g. `ladyThorMysteriousOriginUsed`) declared + reset in the end-turn block (`script.js:~11755–11784`; siblings `spiderWomanArachnoRecruit`, `backflipRecruit`).

## Family 6 — FREE-DEFEAT (Fight effect still fires)
Mental Domination (Henchman-only), Imperius Rex (Villain; MM on superpower), Utter Annihilation (attack-threshold), Inhuman Mastery (Henchman), Pieces on a Chessboard (re-enter from VP — not a free-defeat).
- City/HQ free-defeat popup: `cardAbilitiesDarkCity.js:2416–2429` (city→`instantDefeatAttack(idx)` `script.js:14434`; HQ→`instantDefeatHQVillain(idx)` `:12803`) OR `expansionFantasticFour.js:5689–5701` (city→`defeatVillain(idx,true)` `:12623`). The instant branch runs the full chain incl. Fight effect, skips attack spend.
- Henchman cards: REUSE + filter targets to Henchman class. Villain branch: REUSE `defeatVillain(idx,true)`. **Mastermind branch: BUILD NEW** (tactic-pop). Utter Annihilation: read LIVE attack (`attackFrom*`, not card art) for `< KO-bystander-count`. Pieces on a Chessboard: remove from `victoryPile` → `enterCityFromRight()` (`script.js:5295`).

## Family 7 — reveal top + conditional draw on cost (ADAPT)
Marvel Team-Up, Leaping Spider, Web-Slinger (cost≤2 draw), Superior to Others (peek-2 draw-higher; **equal cost → draw nothing**).
- Build `revealTopDrawIfCost(maxCost)` (peek `playerDeck[len-1]`, reshuffle-if-empty per Blink, `drawCard()` if `cost<=max` else leave). `drawCard()` = `script.js:11102`.

## Family 8 — restricted reserve attack by space / MM (REUSE)
Ruler of the Seas (Bridge+MM), Web-Slinger (Rooftops/Bridge+MM).
- `cityReserveAttack[]` `script.js:559` (sized `:574`, read at fight `:12054`), `mastermindReserveAttack` `:565`. Both reset per turn (`:11759/11761`).
- **Resolve space index via `citySpaceLabels.indexOf("The Bridge"/"The Rooftops"/"The Streets")`** (`citySpaceLabels` `:549`, rebuilt `:577`; resize-safe pattern = `isBankOrStreets()` `:10327`). Do NOT hardcode indices (moleManSecretTunnel's `[1]` is the unsafe form). Same labels both modes; only resize schemes shift them.

## Family 9 — "each other player" solo (REUSE announce-and-skip)
Inhuman Mastery, Galactic Domination (special-ability clause → no-op), #Humblebrag (count=0 → draw 0).
- Decision: `docs/expansion-decisions.md:26` — non-Location "each other player" → deferred/no-op. Code precedent: `HawkeyeDontDrawOrDiscard()` `cardAbilities.js:1834`, `Gambit2ndTopCardDiscardOrPutBack()` :1828 (announce-and-skip). Inhuman Mastery/Galactic Domination superpowers (Cabal/Range) resolve normally, independent of the no-op clause. Confirm with rules-oracle at build (insert may override the LOW ones).

## Family 10 — NOVEL / BUILD-NEW (the real engineering surface — 6 items)
- (a) **Untouchable** (reactive discard-to-cancel a Fight effect): ADAPT `offerSecondChanceReaction()` `expansionRevelations.js:1320` (Hellcat from-hand interceptor, already wired into Master Strike `script.js:5882` + Scheme Twist `:6021`). Hook the villain Fight-effect path at `script.js:13070–13083` (next to `promptNegateFightEffectWithMrFantastic` `:13079`); MM tactic fights at `:16194–16218`. Draw-3 on accept via `drawCard()`×3.
- (b) **Fight the Future** (fight a villain on TOP of the Villain Deck): BUILD NEW, no prior art. Targets enumerate `city[i]` (`script.js:7262`) + HQ only. Closest hook: `showAttackButton(cityIndex)` + synthetic-slot `cityIndex>=citySize` pattern (mastermind-sentinel `payLocationAttackCost` `:12318`). Highest-risk card.
- (c) **Stalk the Urban Jungle + Enslave the Will** (per-turn defeat listener; Stalk keyed to Rooftops/Streets): PARTIAL. Hub `defeatBonuses()` `cardAbilities.js:25`; accumulator precedent `militaryComplexRecruit` `script.js:845` (paid in defeatBonuses `cardAbilities.js:39`, reset end-turn). `defeatBonuses()` gets NO location arg → `defeatVillain()` `:12623` must stash/pass `cityIndex` so the listener checks `citySpaceLabels[idx]`.
- (d) **Loner** (+2 Atk if no Hero recruited this turn): BUILD NEW. Set a `heroRecruitedThisTurn` flag in `recruitHeroConfirmed()` `script.js:18763`; deferred grant via the §5 `updateGameBoard()`-consume pattern, condition inverted. Sidekick recruit ≠ Hero recruit.
- (e) **Infiltrate HQ** ("costs 1 less this turn" per-slot): BUILD NEW. HQ cost read at `showHeroRecruitButton()` `script.js:18452` (`const cost = hero.cost`, feeds affordability `:18561` + charge `:18578`) → compute effective cost from a per-slot temp modifier cleared at turn end. HQ→bottom+refill REUSES `returnHeroToDeck(hqIndex)` `:6770` + `refillHQSlot(index)` `:5209` (mode-aware — always `refillHQSlot`).
- (f) **Black Bolt no-rules-text predicate**: BUILD NEW DB flag `noRulesText: true` in `cardDatabase.js` (precedent: tag-over-cardsPlayedThisTurn like `keywords.includes("Focus")` `script.js:8265`). Speak No Words carries it; Destructive Whisper (reveal-4-from-hand), Silence is Golden (replay points), Hypersonic Scream (count→draw) consume it.

## Trivial cards — standard helpers
Catlike Reflexes / Supersonic Flight / Optimized Technology = `drawCard()` `script.js:11102` (NOT `drawOne` — that's the turn-cleanup queue wrapper `:11839`). Flat icon superpowers (Cosmic Energies, Heir to the Hammer, General of the Black Order, Supernova Spear, Armor Upgrades, Leaping Spider/Travel-through-Limbo superpowers) = DB `bonusAttack`/`bonusRecruit` + `multiplier:"None"` → `bonusAttack()`/`bonusRecruit()` `cardAbilities.js:1017/1250` (flat path, both totals + updateGameBoard).

## Build-priority signal
- Pure REUSE (~40 cards): Families 1,3,4(most),5,7,8,9 + trivials.
- ADAPT (small shared helpers): Family 2 (combined-pool KO returning card), Family 7 (revealTopDrawIfCost), Untouchable (10a).
- BUILD NEW (6 surfaces): MM free-defeat tactic-pop (6), Fight-the-Future deck-top target (10b), space-keyed defeat listener (10c — Enslave + Stalk), recruit-this-turn tracker (10d — Loner), HQ per-slot cost reduction (10e — Infiltrate HQ), `noRulesText` DB flag (10f — Black Bolt).

## Per-card done-criteria (unchanged, per task brief + CLAUDE.md)
- Dual-mode for any mode-sensitive code (gameMode 'golden' AND 'whatif').
- LOW-confidence cards → mandatory dynamic `/game-test`. LOW set: Untouchable, Destructive Whisper, Silence is Golden, Stalk the Urban Jungle, Fight the Future, Inhuman Mastery, Imperius Rex, No More Heroes, Utter Annihilation. ("each other player" cards confirm self-apply-vs-no-op with rules-oracle.)
- onscreenConsole.log() for player messages; attack/recruit grants update BOTH current-turn AND cumulative; async abilities awaited at call sites.
- expansion-validator + /code-review on the diff before calling a sub-group done.
