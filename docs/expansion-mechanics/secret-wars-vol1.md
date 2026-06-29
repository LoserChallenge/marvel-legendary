# Secret Wars Volume 1 — Mechanics Reference

Analyzed: 2026-06-22
Status: Mechanics analyzed + reuse survey complete (`pattern-reuse-scout`, 2026-06-22). Ready for `/new-expansion`.
Sources: `expansions/secret-wars-vol1/Legendary_Rules_Secret_Wars_v1.pdf`, `rules/WhatIf_Rulebook.pdf` (shares Secret Wars mechanics, fuller wording), `docs/card-inventory/final/secret-wars-vol1.md`, `docs/rules-notes/secret-wars-vol1.md`

## Scope (this build)

**IN:** 14 heroes; 4 villain groups (Domain of Apocalypse, Limbo, Manhattan Earth-1610, Sentinel Territories); 2 masterminds (Madelyne Pryor, Nimrod); **6 of 8 schemes** (2 deferred — see below); **3 henchmen groups (M.O.D.O.K.s, Thor Corps, Ghost Racers — Fight effect only, ratified in-scope 2026-06-25)**; Banker bystander; Sidekicks (reuse existing stack).

**DEFERRED (out of scope, per user 2026-06-22):** Wasteland group, The Deadlands (zombie) group, all 30 Ambitions + the Ambition Row / "A Player is the Mastermind" mode, and the two masterminds tied to the deferred groups (Wasteland Hulk, Zombie Green Goblin). The **Bribe** keyword has zero in-scope cards (not implemented). The **Ghost Racers henchman Fight effect IS built** (Phase 3f, commit `40081cb`); only its Deadlands Ambush **"Rise of the Living Dead"** stays deferred (no other in-scope cards). **Two schemes deferred** (cost-disproportionate, decided 2026-06-22): **Smash Two Dimensions Together** (needs a genuinely-new parallel/second city dimension) and **Fragmented Realities** (per-player dimensions collapse to nothing at 1 player).

---

## Keywords

### Teleport
**Rules definition (rulebook, authoritative):** "Instead of playing this card, you may set it aside. At the end of this turn, add it to your new hand as an extra card." (Secret Wars insert p.1; confirmed What If? p.16-style usage.)
**Note:** The inventory gloss "Put this card on top of your deck" (final/secret-wars-vol1.md L13) is WRONG — correct it to the rulebook wording. The engine already implements the correct behavior.
**Implementation approach:** Reuse the existing `playOrTeleport()` / `teleport()` / `markedToDrawNextTurn` / `temporaryTeleport` system in `cardAbilitiesDarkCity.js` + `script.js`. Cards/villains that *grant* Teleport to other cards (Inferno Nightcrawler, Magik) set the `Teleport` keyword (or `temporaryTeleport`) on the target.
**Solo mode notes:** No divergence — operates on the active player's own hand/deck.
**Mode-divergent?:** No
**Reuse verdict:** REUSE: `playOrTeleport()` @ cardAbilitiesDarkCity.js:3789 + `teleport()` @ cardAbilitiesDarkCity.js:3767 + end-of-turn `drawOne()` priority on `cardsToBeDrawnNextTurn` @ script.js:11739. Granting Teleport to another card is already proven by Azazel @ cardAbilitiesDarkCity.js:11940 (`card.keywords.push("Teleport"); card.temporaryTeleport = true;` + auto-cleanup @ cardAbilitiesDarkCity.js:3772) — directly reusable for Inferno Nightcrawler/Magik.
**Complexity:** Fits Cleanly (reuse)

### Cross-Dimensional Rampage
**Rules definition:** "Cross-Dimensional [Character] Rampage" means "Each player reveals one of their [Character] Heroes or a [Character] card in their Victory Pile or gains a Wound." Character matching: Wolverine counts any card with "Wolverine", "Weapon X", or "Old Man Logan"; Thor counts "Thor" cards. (Secret Wars insert p.1.)
**In-scope cards:** Wolverine variant — Old Man Logan "Rage Out" (hero), Apocalyptic Weapon X (Escape), Wolverine of Future Past (Escape). Thor variant — Ultimate Thor (Escape). (Hulk variant is deferred-only.)
**Implementation approach:** New self-contained helper. Build a card-name/Hero-name predicate for the character family (substring match on the family's name list), check the player's revealable Heroes + Victory Pile for a match; if none (or player declines), draw a Wound (`drawWound()`). Old Man Logan's "Rage Out" additionally counts other players who took a Wound → in solo that count is 0 (see solo notes).
**Solo mode notes:** Wording is "each PLAYER" (not "each other player") → in 1-player solo it applies to the **active player**: reveal a matching Hero/VP card or gain a Wound. The "+1 Attack for each other player who gained a Wound" rider (Old Man Logan) yields 0 in solo (no other players).
**Mode-divergent?:** Yes (checklist row 8 — "each player" wording). Self-applies in both solo modes; verify the rider math is 0 in both.
**Reuse verdict:** ADAPT: `revealClassOrWound()` @ expansionRevelations.js:2329 is the near-exact template — it scans `[...playerHand, ...playerArtifacts, ...cardsPlayedThisTurn]` for a class match and either pops a "Reveal / Gain Wound" choice or calls `drawWound()` @ cardAbilities.js:305 if no match. Adapt the predicate from single-class `.classes.includes()` to a Hero-NAME/family substring match (Wolverine/Weapon X/Old Man Logan; Thor) and extend the scanned pool to include the Victory Pile.
**Complexity:** New Capability (self-contained in expansion file)

### Multiclass cards (dual-class)
**Rules definition:** A card can count as both classes (e.g. Covert/Tech). Great for fueling Superpower abilities. (Insert p.1.)
**Implementation approach:** Reuse existing dual-class support (already used by prior expansions; class strings per CLAUDE.md — e.g. `"Covert / Tech"`). DB field convention only.
**Solo mode notes:** None.
**Mode-divergent?:** No
**Reuse verdict:** ADAPT: the class-membership helper `hasClass(card, wanted)` @ expansionFantasticFour.js:73 already does `card.classes.some(c => c === wanted)` (array-based, case-insensitive). NO dual-class card exists in `cardDatabase.js` yet (all `classes` arrays are single-element). Cleanest path: store dual-class as a TWO-element array `classes: ["Covert", "Tech"]` — `hasClass()` then works unchanged. (Do NOT use a `"Covert / Tech"` slash string; `hasClass()` does exact-match and would not split it.) Audit other class-check call-sites in script.js for raw `classes[0]` reads before relying on this.
**Complexity:** Fits Cleanly (reuse)

---

## New Card Types

### Sidekicks (shared stack)
**Rules definition:** Secret Wars adds a Sidekick Stack. Players may **pay to recruit up to one Sidekick per turn**; effects that say "gain a Sidekick" do NOT count against that one-per-turn recruit limit. (Insert p.1.) Sidekick card: cost 2; "You may return this card to the Sidekick Stack. If you do, draw two cards."
**Implementation approach:** Reuse the existing Sidekick system (`cardAbilitiesSidekicks.js`, `cardDatabase.js` sidekick entries, the recruit-one-per-turn cap). In-scope "gain a Sidekick" heroes: Magik, Black Panther (King of Wakanda — gain 3, optionally to top of deck), Maximus (Enslave the Will), Namor (Lead the Armies), Ultimate Spider-Man (Marvel Team-Up). Confirm the existing engine already separates "gain" from the recruit cap.
**Solo mode notes:** No divergence.
**Mode-divergent?:** No
**Reuse verdict:** ADAPT: stack exists (`sidekickDeck = shuffle(sidekicks)` @ script.js:532) and the per-turn recruit cap is `sidekickRecruited` (checked @ script.js:17793, set @ script.js:17833, reset @ script.js:11661). BUT a clean "gain a Sidekick (no cost, no cap)" helper does NOT exist — every acquisition currently flows through `recruitSidekick()` @ script.js:17782, which always sets `sidekickRecruited = true` and deducts cost. The closest precedent (Elektra Silent Meditation, `silentMeditationRecruit` @ cardAbilitiesDarkCity.js:1267 / consumed @ script.js:17802) only redirects the destination to hand — it still pays cost and burns the cap. ADAPT: extract a `gainSidekick(toTopOfDeck?)` helper that pops `sidekickDeck` to discard/hand/deck-top WITHOUT touching `sidekickRecruited` or recruit points.
**Complexity:** Fits Cleanly (reuse stack) — gain helper is genuinely missing; build it as a small wrapper

### Villains gained as Heroes (dual-nature)
**Rules definition:** The Ultimates (Manhattan Earth-1610) and Thor Corps start as Villains/Henchmen; "Fight: Gain this as a Hero." If an effect wants their cost as a Hero, use their old Villain Attack value. (Insert p.1.) Manhattan cards have no VP (they leave as Heroes); Thor Corps VP 0.
**In-scope cards:** Manhattan group (Ultimate Cap America/Cap Marvel/Thor/Wasp ×2 each) and Thor Corps henchmen (×10). Hero stats per inventory Section 1.
**Implementation approach:** New capability — the **reverse** of the existing Skrull "hero-as-villain" pattern (see `docs/expansion-decisions.md` → "Hero-as-villain seeding recipe"). On defeat, instead of pushing to Victory Pile, convert the card to its Hero form (swap to Hero `type`/team/class/base value + ability, clear `fightEffect`, set `cost` from old villain Attack) and route it to the player's discard (gained-as-hero). Skip the VP push (these have no/0 VP). Any custom flags must be whitelisted in `createVillainCopy()`.
**Reuse verdict:** REUSE (near-direct): `gainScarletWitchAsHero()` @ expansionRevelations.js:3481 is THIS EXACT operation already — on fight it flips `type:"Villain"`→`"Hero"`, restores `originalAttack`, clears `fightEffect`, and pushes to `playerDiscardPile`. The VP-push bypass already keys off the `skrulled` flag (`if (!villainCard.skrulled && villainCard.team !== "Infinity Gems") victoryPile.push(...)` @ script.js:13360 across all four defeat handlers). `unskrull()` @ cardAbilities.js:17109 is the sibling template. REUSE the bypass+convert machinery: give the Ultimates/Thor-Corps cards a flag that the defeat handlers treat like `skrulled` (skip VP), and a `fightEffect` that runs a `gainScarletWitchAsHero`-style converter parameterized on the Hero form. Whitelist the new flag in `createVillainCopy()`.
**Solo mode notes:** No divergence (gained by the active player).
**Mode-divergent?:** No
**Complexity:** New Capability (adapt Skrull/Scarlet-Witch pattern, inverted) — most plumbing already exists

### Banker bystander
**Rules definition:** "When you rescue this Bystander, you get +2 Recruit, usable only to recruit Heroes in the HQ space under the Bank." VP 1, ×3.
**Implementation approach:** Reuse space-restricted point grants (Paint the Town Red / Fantastic Four "usable only against …" prior art) — here restricted to recruiting the HQ card in the Bank space rather than a fight target.
**Solo mode notes:** None (the Bank HQ space exists in both modes).
**Mode-divergent?:** No
**Reuse verdict:** REUSE: Fantastic Four already has position-keyed *recruit* reserves restricted to one HQ slot — `moleManUndergroundRiches()` @ expansionFantasticFour.js:2640 does `hq2ReserveRecruit += 6;` (read @ script.js:7360, usable only for that HQ position). This is the exact shape the Banker needs (restricted +Recruit for one HQ slot). Sibling restricted-points precedents: `cityReserveAttack[i]` (`moleManSecretTunnel()` @ expansionFantasticFour.js:2632, read @ script.js:11936) and `mastermindReserveAttack` (`mrFantasticUltimateNullifier()` @ expansionFantasticFour.js:4391). REUSE the `hqNReserveRecruit` mechanism, keyed to whichever HQ slot is the Bank.
**Complexity:** Fits Cleanly (reuse restricted-points pattern)

---

## New Game Systems

### Multiple Masterminds ("ascension" + scheme-added) — KEYSTONE
**Rules definition:** "there are multiple Masterminds in the game! Players must defeat all the Masterminds to win. When a Master Strike occurs, each Mastermind does its Master Strike ability. The player whose turn it is picks the order. If an effect says it does something to 'the Mastermind,' you pick which Mastermind it affects. **An ascending Mastermind doesn't have Mastermind Tactics. You only need to fight it once to defeat it and put it into your Victory Pile. Once it's in your Victory Pile, it's considered a Villain card again, not a Mastermind or Tactic card.**" (What If? rulebook p.19 — the fuller, authoritative wording for this shared mechanic; Secret Wars insert p.1 gives the short version.)
**In-scope triggers (only two):** Apocalyptic Magneto Escape (ascends; granted Master Strike "Each player reveals an X-Men Hero or discards down to four cards"; defeat value = printed villain Attack **8**; no Tactics; becomes a normal VP-6 villain once defeated). Dark Alliance scheme (adds a random REAL full-strength 2nd Mastermind with growing Tactics — see Schemes).
**Implementation approach (Core Engine Change — agreed):** Generalize the engine's single-mastermind assumption (`getSelectedMastermind()`, the defeat tracker, the Master-Strike resolver, the win check) to support an **array of active masterminds**. A second mastermind occupies an additional board slot. Two kinds: (a) **ascended** = no tactics, one fight at printed villain Attack, then converts to a Victory-Pile villain; (b) **scheme-added (Dark Alliance)** = a normal mastermind that accrues Tactics over Twists.
**Solo mode notes:**
- **What If? Solo:** officially defined (What If? p.19 + p.24) — implement as written. Defeat all masterminds to win; each Master Strike fires every mastermind's Strike (solo = resolve sequentially); ascended = one fight at printed Attack.
- **Golden Solo:** the ruleset is SILENT on a second mastermind (design decision — ours). **Agreed adaptation:** the **main** mastermind keeps its existing 4-defeats → Final Showdown flow unchanged; a **second** mastermind is an *additional must-kill gate* (ascended Magneto = one fight at 8; Dark Alliance's = its normal strength), and its Master Strike fires alongside the main one. The second is NOT folded into the Final Showdown combined-points math — it must be cleared to win, but the Showdown stays a single-mastermind calculation.
**Mode-divergent?:** Yes (checklist rows 4 villain/mastermind count, 6 win condition / Final Showdown, 8 master-strike resolution). Force dual-mode `/game-test` in Phase 4c.
**Reuse verdict:** BUILD NEW (mostly) — the single-mastermind assumption is hardcoded throughout and there is NO existing multi-mastermind loop. Specific findings: `getSelectedMastermind()` @ script.js:944 reads ONE checked DOM radio; defeat is a single global `mastermindDefeated` flag @ script.js:898; the win check @ script.js:16538 calls `isMastermindDefeated(mastermind)` @ script.js:15339 (`tactics.length === 0`) for ONE mastermind; `handleMasterStrike()` @ script.js:5804 fetches one mastermind and has NO loop; tactic reveal `revealMastermindTactic()` @ script.js:15981 pops from one `mastermind.tactics`. ADAPT/REUSE where it exists: the **ascended-Magneto** flavor is close to the Skrull/Scarlet-Witch convert-on-defeat-to-VP-villain pattern (no tactics → one fight → becomes plain VP-6 villain) — reuse that machinery (see "Villains gained as Heroes" verdict, but routing to Victory Pile not discard). Epic overlay `{...base, ...base.epic}` @ script.js:952 is a runtime shallow-merge (NOT a second mastermind) — it is NOT prior art for two active masterminds; note its in-place-mutation gotcha (`tactics.length = 0`, not reassignment) carries to any multi-mastermind code. Net: generalize single→array; the convert-to-VP-villain ascension half has reuse, the array/loop/second-board-slot half is genuinely new.
**Complexity:** Core Engine Change — see "Core Engine Changes Required" #1

### Demon Goblins (Madelyne Pryor)
**Rules definition (inventory):** Bystanders captured by Madelyne are "Demon Goblin" Villains with 2 Attack. You can fight them to rescue them as Bystanders. **You can't fight Madelyne while she has any Demon Goblins.** Master Strike: Madelyne captures 4 Bystanders; if she already had any, each player gains a Wound.
**Implementation approach:** Builds on existing capture. When Madelyne captures a Bystander, represent it as a fightable 2-Attack "Demon Goblin" entity attached to her (fight → rescues the Bystander). Add a fight-gate on Madelyne: her fight is blocked while any attached Demon Goblin exists (similar in spirit to Nimrod's recruit gate / existing "can't fight unless" guards). Several Madelyne tactics capture more bystanders (City of Demon Goblins = 5; Gather the Harvest = per Limbo villain in city/escape).
**Solo mode notes:** "Everyone's a Demon on the Inside" tactic captures "a Bystander from each other player's Victory Pile" → in solo, no other players → self-apply or no-op per the "each other player" precedent (non-Location tactic → currently deferred-skip; confirm at build). Madelyne Master Strike "each player gains a Wound" → applies to the solo player.
**Mode-divergent?:** Yes (row 8 — "each other player"/"each player" wording on tactics + master strike).
**Reuse verdict:** ADAPT: bystander-capture-onto-an-entity already exists — `captureBystanderFromVPToLocation(locationCard, label)` @ expansionRevelations.js:5059 pushes to `entity.capturedBystanders[]`, and `defeatLocation()` @ script.js:12448 rescues each captured bystander on defeat (overlay render @ script.js:8681). REUSE that capture+rescue-on-defeat plumbing. The genuinely new pieces: (a) each captured Bystander is itself a *separately fightable 2-Attack entity* (not a passive attachment) — closest model is the fightable `type:"Location"` entities Korvac/Graveyard (`placeLocation()` @ script.js:580; defined @ expansionRevelations.js:3894) which sit outside city villain slots and are fought like villains; (b) the "can't fight Madelyne while a Demon Goblin exists" gate — see the Nimrod verdict below for the fight-gate prior art.
**Complexity:** New Capability (capture reuse + fight-gate + fightable attached entity)

### "Made at least 6 Recruit this turn" gate / trigger
**Rules definition:** Nimrod: "You can't fight Nimrod unless you made at least 6 Recruit this turn." Lady Thor cards: once-per-turn bonuses if you made ≥6 Recruit this turn (draw / +2 Attack / +6 Attack).
**Implementation approach:** Track total Recruit generated this turn (engine already maintains `totalRecruitPoints` / `cumulativeRecruitPoints`). Nimrod fight-affordability gate checks the threshold (mirror the existing "can't fight unless" guard pattern; remember the THREE affordability gates per CLAUDE.md `updateHighlights` twin note). Lady Thor "once per turn" bonuses check the threshold + a per-turn-used flag.
**Solo mode notes:** No divergence (reads the active player's own recruit total).
**Mode-divergent?:** No
**Reuse verdict:** REUSE: the recruit-threshold READ already exists — `if (cumulativeRecruitPoints >= 8)` in `ThorHighRecruitReward()` @ cardAbilities.js:1380, and the deferred-threshold pattern (`throgRecruit = true` if not yet at 6, pay out later) in `throgSidekickAbility()` @ cardAbilitiesSidekicks.js:213. Use these verbatim for Lady Thor's ≥6 bonuses. The Nimrod FIGHT-GATE adapts the existing affordability gate: `usesRecruitToFight` @ script.js:11978 already special-cases a fight cost, and the THREE gates that must stay in sync are `showAttackButton()` @ script.js:11922 plus the TWO `updateHighlights()` twins @ script.js:7333 and script.js:7590. ADAPT: add an `unfightableUnlessRecruit: 6` style flag read at all three gates (a different gate than `usesRecruitToFight` — Nimrod still costs Attack to fight; the recruit total is only an UNLOCK condition).
**Complexity:** New Capability (threshold read reused; fight-gate adapts the 3-gate pattern; small)

### "Cards with no rules text" predicate (Black Bolt)
**Rules definition:** Black Bolt cards reference cards with no rules text (Destructive Whisper: +1 Attack if you reveal four; Silence is Golden: replay a no-text card's Recruit+Attack; Hypersonic Scream: draw per no-text card played; Speak No Words intentionally has no text).
**Implementation approach:** New predicate: a card "has no rules text" if it has no special ability / superpower / keyword effect (base stats only). Tag such cards (a DB flag like `noRulesText: true` is cleaner than runtime inference). Black Bolt's cards then count/replay against `cardsPlayedThisTurn` filtered by that flag.
**Solo mode notes:** None.
**Mode-divergent?:** No
**Reuse verdict:** BUILD NEW (small) — no existing "has no ability / no rules text" flag or predicate exists. The hook IS ready: `cardsPlayedThisTurn` @ script.js:790 (cleared @ script.js:11653) is exactly what Black Bolt's cards filter over. REUSE that array; ADD a DB flag (e.g. `noRulesText: true`) on the no-text cards rather than inferring at runtime from `unconditionalAbility === "None" && !conditionalAbility` (inference is brittle — some cards carry a keyword with no ability function). Filter `cardsPlayedThisTurn.filter(c => c.noRulesText)`. The "replay a card's Recruit+Attack" half (Silence is Golden) should reuse whatever replay/re-trigger helper the codebase already has — check during build (not surveyed here).
**Complexity:** New Capability (simple predicate/flag)

---

## Schemes (6 shipped, 2 deferred)

> Standard per-card twist/effect work belongs to `/new-expansion` Phase 2.5 specs. Captured here: the structurally-notable schemes and their solo/mode-divergence implications.

### Dark Alliance — multi-mastermind (decided)
Twist 1 adds a random REAL 2nd Mastermind with 1 Tactic; Twists 2-4 add a Tactic each if it's still in play (cap 4); Twists 5-6 each Mastermind captures a Bystander; **Twist 7 = Evil Wins (instant loss — a race).** Uses the Multiple Masterminds system. Second mastermind is full strength (inferred — no reduction clause; physical Pass-3 confirm worthwhile).
**Mode-divergent?:** Yes (rows 4, 6).
**Reuse verdict:** BUILD NEW — depends entirely on the Multiple Masterminds keystone (see that verdict: single-mastermind is hardcoded, no array/loop exists). The full-strength scheme-added mastermind is the HARD flavor (accrues Tactics over Twists) — it needs the generalized array + second board slot + per-mastermind tactic UI, none of which exist. Adding Tactics over time reuses `revealMastermindTactic()`/tactic-array mutation @ script.js:15981 but per-mastermind. Bystander capture (Twists 5-6) reuses the capture plumbing (see Demon Goblins verdict). Build the keystone first; this scheme is its primary consumer.

### Master of Tyrants — tactic-villains (no multi-mastermind)
Shuffles 3 other masterminds' 12 Tactics into the Villain Deck as "Tyrant Villains" (printed Attack, no abilities). Twists 1-7 add "Dark Power" (+2 Attack) under a Tyrant; Twist 8 all Tyrants escape; Evil Wins at 5 escaped. **Does NOT need multiple-mastermind support** — Tyrants are plain villains. New piece: pull Tactic cards from the DB as villain entities.
**Mode-divergent?:** Low (row 5 — villain deck composition).
**Reuse verdict:** ADAPT: the Skrull Shapeshifters injection is the template — non-villain cards copied with `type:"Villain"` and pushed into the villain deck at setup @ script.js:4427, then routed as normal villains through `processVillainCard()` @ script.js:6230 → `enterCityFromRight()`, fightable in the city. ADAPT: pull the 12 Tactic objects from the chosen masterminds' DB `tactics` arrays, stamp `type:"Villain"` + printed Attack + no `fightEffect`, inject like Skrulls. The "+2 Attack token under a Tyrant" reuses the per-villain attack-modifier / `cityReserveAttack`-style stacking; escape-counting reuses the existing escaped-villain Evil-Wins counter.

### Crush Them With My Bare Hands — twists-as-master-strikes
5 Twists; "If playing solo, add an extra Villain Group." Each Twist becomes a Master Strike immediately; Evil Wins at 8 Master Strikes. Explicit solo directive → `extraVillainGroups`-style handling.
**Mode-divergent?:** Yes (row 4 — explicit solo extra group; row 8 — master strikes).

### Corrupt the Next Generation — Sidekicks-as-Villains
Adds 10 Sidekicks to the Villain Deck; in deck/city they're Villains (Attack = 2 + twists stacked); defeating one gains it to top of deck. Twists 1-7 recycle Sidekicks + 2 enter city; Twist 8 all escape; Evil Wins at 4 escaped. New: treat Sidekick cards as villains with a scheme-scaled attack.
**Mode-divergent?:** Yes (row 8 — "each player returns a Sidekick"; row 5 — villain deck composition).
**Reuse verdict:** ADAPT (same template as Master of Tyrants): Skrull-style injection @ script.js:4427 to stamp 10 Sidekick cards as `type:"Villain"` into the villain deck. The "defeat gains it to top of deck" is the SAME convert-on-defeat-bypass-VP pattern as `gainScarletWitchAsHero()` @ expansionRevelations.js:3481 / the `skrulled` VP-bypass @ script.js:13360 — except routing to deck-top (use the `gainSidekick(toTopOfDeck)` helper proposed in the Sidekicks verdict) instead of discard. Scheme-scaled attack (2 + twists) reuses per-villain attack-stacking.

### Pan-Dimensional Plague — Wounds next to HQ Heroes
10 Twists; each Twist KOs all Wounds next to HQ then puts a Wound next to each HQ Hero. On recruit of a wounded HQ Hero: gain the Wound OR pay 1 Recruit to return it. Evil Wins when the Wound Stack runs out.
**Mode-divergent?:** Yes (row 2 — HQ refill; Golden rotation vs What If? fill-in-place changes which slot a Wound rides).

### Build an Army of Annihilation — counter scheme
9 Twists; "Put 10 extra Annihilation Wave Henchmen in that KO pile." Twist moves Annihilation Henchmen next to the Mastermind per twists stacked; Evil Wins at 10 next to the Mastermind. **OPEN:** "Annihilation Wave Henchmen" is not a group in this box (it's from the Annihilation set) — need to pick a stand-in henchman group for our build (see Open Questions).
**Mode-divergent?:** Low-moderate (row 5).

### Smash Two Dimensions Together — parallel dimension (city restructuring)
8 Twists; add an extra Villain Group; Villain Deck on the Bank space. Sewers + Bank don't exist (main city = 3 spaces); a parallel 3-space dimension sits above; on each Villain entry the player chooses which dimension. Twists 1-7 play 2 villain cards; Twist 8 all escape; Evil Wins at 10 escaped.
**Implementation approach:** Reuse the dynamic-city / `destroyedSpaces[]` infrastructure (Revelations) to remodel the city; the parallel dimension is the heavier new piece (a second row of city spaces + per-entry placement choice).
**Mode-divergent?:** Yes (rows 1 play-2-villains, 4 extra group, city structure).
**Reuse verdict:** PARTIAL — REUSE the city-remodel half, BUILD NEW the parallel half. REUSE: `destroyedSpaces[]` @ script.js:551 (init @ script.js:569) + scheme `citySpaces` overrides (e.g. cardDatabase.js:651) to drop Sewers/Bank and set the 3-space main city; `extraVillainGroups` @ cardDatabase.js:671 read @ script.js:3395 for the extra group. BUILD NEW (no prior art): (a) a SECOND ROW / parallel set of fightable city spaces — the codebase has only one linear city array, nothing two-dimensional; (b) per-villain-entry PLACEMENT CHOICE — `enterCityFromRight()` @ script.js:5295 always auto-places at the rightmost slot; no existing mechanic lets the player choose which space a villain enters. Both halves of the parallel dimension are genuinely new — flag as the high-cost scheme; candidate for deferral per Core Engine Changes #2.

### Fragmented Realities — per-player dimensions — OPEN (solo shape)
Add an extra Villain Group; split the Villain Deck per player + 2 Twists each. No normal city; each player has their own one-space dimension; fight villains in any dimension. Twist plays 2 cards from your Villain Deck. Evil Wins when non-grey Heroes in KO pile = 5 × players.
**OPEN:** At 1 player this is degenerate (one dimension, one city space, no split). Needs a deliberate solo shape (see Open Questions) — defer the decision to build time, or simplify/skip.
**Mode-divergent?:** Yes (rows 4, 9 player-count scaling — "5 × players", city structure).
**Reuse verdict:** REUSE the city-resize half ( `destroyedSpaces[]` @ script.js:551 + `citySpaces` override to a single space) + `extraVillainGroups` @ script.js:3395; the per-player split is degenerate-to-trivial at 1 player so nothing new is needed there. Evil-Wins "non-grey Heroes in KO pile = 5 × players" → at 1 player a flat threshold of 5, read via the existing KO-pile / Evil-Wins counter infrastructure. Net: REUSE — the genuinely-new parallel-dimension work that Smash Two Dimensions needs does NOT apply here at 1 player. Confirm the solo shape with the user at build (Open Question 1).

---

## Core Engine Changes Required

1. **Multiple-mastermind support.** Generalize single-mastermind assumptions to an array of active masterminds: additional board slot; win = all defeated; Master-Strike resolver loops over all (solo = sequential); "the Mastermind" targeting picks one. Two flavors: ascended (no tactics, one fight at printed villain Attack, then converts to a VP villain) and scheme-added full mastermind (Dark Alliance, accrues tactics). **Agreed Golden Solo adaptation:** main mastermind keeps its 4-defeats → Final Showdown unchanged; second masterminds are additional must-kill gates outside the Showdown math. Risk: touches the win check + Master-Strike loop shared by all expansions → dual-mode `/game-test` mandatory. Reuse-first: check Epic-overlay + existing Master-Strike loop before building fresh.

2. **City restructuring for Smash Two Dimensions (and possibly Fragmented Realities).** Reuse the Revelations dynamic-city / `destroyedSpaces[]` model where it fits (destroying Sewers/Bank, resizing). The genuinely new piece is a **parallel/second dimension** (an extra row of fightable city spaces + a per-villain-entry placement choice). Scope this carefully at build; consider deferring the parallel-dimension schemes if cost is disproportionate.

---

## Solo Mode Decisions

| Mechanic | Question | Decision |
|---|---|---|
| Multiple Masterminds (Golden Solo) | How does a 2nd mastermind fit Golden's 4-defeats → Final Showdown? | Main mastermind unchanged (4 defeats → Showdown); 2nd is an additional must-kill gate, its Master Strike fires alongside, not in Showdown math. (User-approved 2026-06-22.) |
| Multiple Masterminds (What If? Solo) | Defined? | Yes — implement What If? p.19/24 as written. |
| Ascended Mastermind defeat value | What do you fight? | Printed villain Attack (Magneto = 8), one fight, no Tactics, then a VP-6 villain. (What If? p.19.) |
| Cross-Dimensional Rampage | "each player" in solo? | Applies to the active player (reveal matching Hero/VP card or take a Wound). |
| Demon Goblins / Madelyne tactics | "each other player" captures in solo? | No other players → self-apply or no-op per the non-Location "each other player" precedent; confirm exact handling at build. |
| Sidekick "gain" | Counts vs 1/turn recruit cap? | No — gain ≠ recruit (insert p.1); reuse existing engine separation. |

---

## Prior Art & Reuse Candidates

> Surveyed 2026-06-22. File:line pointers into `Legendary-Solo-Play-main/Legendary-Solo-Play-main/`. "BUILD NEW" entries explicitly note the cleanest existing hook even when nothing reusable exists.

MECHANIC: Teleport — set a card aside, add it to next turn's hand as an extra card; some cards grant Teleport to another card
PRIOR ART: `playOrTeleport()` @ cardAbilitiesDarkCity.js:3789; `teleport()` @ cardAbilitiesDarkCity.js:3767; end-of-turn draw priority on `cardsToBeDrawnNextTurn` in `drawOne()` @ script.js:11739; grant-to-another-card via Azazel @ cardAbilitiesDarkCity.js:11940 with temp-flag cleanup @ cardAbilitiesDarkCity.js:3772
HOW IT WORKS: `playOrTeleport()` pops a Play/Teleport modal; `teleport()` removes the card from hand and queues it in `cardsToBeDrawnNextTurn`, which the end-of-turn `drawOne()` shifts in first. Azazel proves granting Teleport to a target: `card.keywords.push("Teleport"); card.temporaryTeleport = true;` and the engine auto-removes the temporary keyword after resolution.
RECOMMENDATION: REUSE — call the existing functions as-is; for Inferno Nightcrawler/Magik granting Teleport, copy Azazel's two-line grant + rely on existing cleanup.

MECHANIC: Cross-Dimensional Rampage — reveal a Hero of family X (hand/VP) or gain a Wound
PRIOR ART: `revealClassOrWound()` @ expansionRevelations.js:2329; `drawWound()` @ cardAbilities.js:305
HOW IT WORKS: `revealClassOrWound()` scans `[...playerHand, ...playerArtifacts, ...cardsPlayedThisTurn]` for a card whose `classes` include the target; if a match exists it pops a Reveal/Wound choice, else it calls `drawWound()` (invulnerability-aware) directly.
RECOMMENDATION: ADAPT — swap the single-class `.classes.includes()` predicate for a Hero-NAME family substring match (Wolverine|Weapon X|Old Man Logan; Thor) and add the Victory Pile to the scanned pool. The reveal/wound control flow and `drawWound()` are reused verbatim.

MECHANIC: Multiclass (dual-class) cards
PRIOR ART: `hasClass(card, wanted)` @ expansionFantasticFour.js:73; cardDatabase.js (no dual-class card exists yet)
HOW IT WORKS: `hasClass()` does `card.classes.some(c => c.toLowerCase() === wanted.toLowerCase())` — an array membership check, case-insensitive, exact-match. No card in the DB currently has more than one class entry.
RECOMMENDATION: ADAPT — represent dual-class as a two-element `classes: ["Covert","Tech"]` array (works with `hasClass()` unchanged). Do NOT use a `"Covert / Tech"` slash string — `hasClass()` won't split it. Audit script.js for any raw `classes[0]` reads before relying on multi-element arrays. (NOTE: the doc's earlier claim that dual-class is "already used by prior expansions" is not borne out — no dual-class card exists in the DB.)

MECHANIC: Sidekicks (shared stack; "gain a Sidekick" exempt from the 1/turn recruit cap)
PRIOR ART: stack `sidekickDeck = shuffle(sidekicks)` @ script.js:532; recruit path + cap `recruitSidekick()` @ script.js:17782 (cap check @ 17793, set @ 17833, reset @ 11661); destination-redirect precedent Elektra `silentMeditationRecruit` @ cardAbilitiesDarkCity.js:1267 / consumed @ script.js:17802
HOW IT WORKS: All Sidekick acquisition currently flows through `recruitSidekick()`, which enforces the `sidekickRecruited` per-turn cap AND deducts cost. Elektra's "Silent Meditation" only redirects the recruited Sidekick to hand — it still pays and still burns the cap. There is NO cost-free, cap-free "gain" path today.
RECOMMENDATION: ADAPT — the stack is reusable, but a `gainSidekick(toTopOfDeck?)` helper is genuinely missing. Extract one that pops `sidekickDeck` to discard/hand/deck-top without touching `sidekickRecruited` or recruit points. (Corrects the doc's assumption that the engine already separates gain from the cap — it does not.)

MECHANIC: Villains gained as Heroes (dual-nature; Fight → gain this as a Hero)
PRIOR ART: `gainScarletWitchAsHero()` @ expansionRevelations.js:3481; sibling `unskrull()` @ cardAbilities.js:17109; VP-push bypass keyed on `skrulled` @ script.js:13360 (across all four defeat handlers); injection precedent @ script.js:4427
HOW IT WORKS: A villain-typed card flagged `skrulled` skips the Victory-Pile push on defeat; its `fightEffect` then converts it back to `type:"Hero"`, restores `originalAttack`, clears `fightEffect`, and pushes to `playerDiscardPile`. This is the exact villain→hero-on-defeat conversion needed.
RECOMMENDATION: REUSE (near-direct) — give the Ultimates / Thor Corps a flag the defeat handlers treat like `skrulled` (skip VP) and a `gainScarletWitchAsHero`-style converter parameterized on the target Hero form (set `cost` from old villain Attack). Whitelist the new flag in `createVillainCopy()`.

MECHANIC: Banker bystander — +2 Recruit usable only on the HQ card in the Bank space
PRIOR ART: `moleManUndergroundRiches()` @ expansionFantasticFour.js:2640 (`hq2ReserveRecruit += 6`, read @ script.js:7360); siblings `cityReserveAttack[i]` @ expansionFantasticFour.js:2632 / script.js:11936 and `mastermindReserveAttack` @ expansionFantasticFour.js:4391
HOW IT WORKS: Mole Man grants +6 Recruit restricted to a single HQ slot via a position-keyed reserve variable that the recruit-cost reader honors only for that slot — the precise "points usable only here" shape.
RECOMMENDATION: REUSE — apply the `hqNReserveRecruit` mechanism keyed to whichever HQ slot is the Bank.

MECHANIC: Multiple Masterminds (ascension + scheme-added; defeat all to win; loop every Master Strike)
PRIOR ART (single-mastermind hardcoding to generalize): `getSelectedMastermind()` @ script.js:944; defeat flag @ script.js:898; win check @ script.js:16538 → `isMastermindDefeated()` @ script.js:15339; `handleMasterStrike()` @ script.js:5804 (no loop); tactic reveal `revealMastermindTactic()` @ script.js:15981; Epic overlay `{...base,...base.epic}` @ script.js:952. Ascension-conversion reuse: the `skrulled` VP-bypass + convert-on-defeat pattern @ script.js:13360 / expansionRevelations.js:3481.
HOW IT WORKS: Every mastermind touchpoint reads ONE selected mastermind — DOM radio, a single global `mastermindDefeated`, a single-mastermind win check, a non-looping Master Strike, single-array tactic pop. The Epic overlay is a runtime shallow-merge of one mastermind, NOT a second active mastermind (and its in-place mutation gotcha — `tactics.length = 0`, never reassign — will carry into multi-mastermind code).
RECOMMENDATION: BUILD NEW (mostly) — generalize single→array of active masterminds (board slot, defeat set, looped win check + Master Strike, "the Mastermind" target picker). REUSE the convert-on-defeat-to-VP-villain machinery for ascended Magneto (no tactics → one fight at printed Attack 8 → becomes a plain VP-6 villain), routing to Victory Pile rather than discard. Epic overlay is NOT prior art for two masterminds.

MECHANIC: Demon Goblins — bystanders captured by Madelyne become separately fightable 2-Attack entities; can't fight Madelyne while any exist
PRIOR ART: capture+rescue-on-defeat `captureBystanderFromVPToLocation()` @ expansionRevelations.js:5059, `defeatLocation()` rescue loop @ script.js:12448, overlay render @ script.js:8681; fightable off-grid entity `placeLocation()` @ script.js:580 with Korvac/Graveyard defined @ expansionRevelations.js:3894; fight-gate prior art (see Nimrod entry)
HOW IT WORKS: Revelations already captures bystanders onto an entity's `capturedBystanders[]` and rescues them on defeat. Korvac/Graveyard prove a `type:"Location"` entity can sit outside the city villain slots and be fought like a villain.
RECOMMENDATION: ADAPT — reuse the capture/rescue plumbing; make each captured Bystander a fightable Korvac-style 2-Attack entity (fight → rescue). The "can't fight Madelyne while a Demon Goblin exists" gate adapts the fight-affordability gate (Nimrod entry).

MECHANIC: "Made ≥6 Recruit this turn" — Nimrod fight-unlock gate + Lady Thor once-per-turn bonuses
PRIOR ART: threshold read `if (cumulativeRecruitPoints >= 8)` in `ThorHighRecruitReward()` @ cardAbilities.js:1380; deferred-threshold `throgSidekickAbility()` @ cardAbilitiesSidekicks.js:213 (`throgRecruit` flag); fight gate `usesRecruitToFight` @ script.js:11978; the THREE affordability gates `showAttackButton()` @ script.js:11922 + `updateHighlights()` twins @ script.js:7333 and script.js:7590
HOW IT WORKS: `cumulativeRecruitPoints` is the running this-turn recruit total; existing cards already branch on `>= N` immediately or defer with a flag and pay out if the threshold is later hit. Fight affordability is gated identically in three places that must stay in sync.
RECOMMENDATION: REUSE the threshold reads for Lady Thor. ADAPT the fight gate for Nimrod — add an UNLOCK condition (distinct from `usesRecruitToFight`, since Nimrod still costs Attack) checked at all three gates; mind the twin `updateHighlights()` hazard.

MECHANIC: "Cards with no rules text" predicate (Black Bolt)
PRIOR ART: `cardsPlayedThisTurn` @ script.js:790 (cleared @ script.js:11653); ability fields `unconditionalAbility`/`conditionalAbility` in cardDatabase.js
HOW IT WORKS: `cardsPlayedThisTurn` is the per-turn played-card log Black Bolt filters over. No existing flag/predicate classifies a card as "no rules text."
RECOMMENDATION: BUILD NEW (small) — reuse `cardsPlayedThisTurn`; add a DB flag `noRulesText: true` on the no-text cards (cleaner than brittle runtime inference). For "replay a no-text card's Recruit+Attack" (Silence is Golden), reuse the codebase's existing replay/re-trigger helper if one exists (not surveyed; check at build).

MECHANIC: Non-villain cards injected into the Villain Deck as villains (Master of Tyrants tactic-villains; Corrupt the Next Generation sidekick-villains)
PRIOR ART: Skrull Shapeshifters injection @ script.js:4427; villain routing `processVillainCard()` @ script.js:6230 → `enterCityFromRight()` @ script.js:5295; gain-on-defeat (Corrupt) reuses the `skrulled`/`gainScarletWitchAsHero` bypass @ script.js:13360 / expansionRevelations.js:3481
HOW IT WORKS: Skrulls are hero cards copied with `type:"Villain"`, pushed into the villain deck at setup, then drawn/placed/fought as ordinary city villains. Exactly the model for stamping Tactic cards or Sidekick cards into the villain deck with a printed Attack and no abilities.
RECOMMENDATION: ADAPT (both schemes share this) — inject Tactic objects (Master of Tyrants) or Sidekick objects (Corrupt) Skrull-style. Corrupt's "defeat gains it to top of deck" reuses the convert-on-defeat-bypass-VP pattern, routing to deck-top via the proposed `gainSidekick(toTopOfDeck)` helper. Scheme-scaled attack (2 + twists) reuses per-villain attack stacking.

MECHANIC: City restructuring + parallel dimension (Smash Two Dimensions; Fragmented Realities)
PRIOR ART: dynamic city `destroyedSpaces[]` @ script.js:551 (init @ script.js:569); scheme `citySpaces` override (e.g. cardDatabase.js:651); `extraVillainGroups` @ cardDatabase.js:671 read @ script.js:3395; standard auto-placement `enterCityFromRight()` @ script.js:5295
HOW IT WORKS: Revelations can destroy/resize city spaces and schemes can override `citySpaces`; villains auto-enter the rightmost slot. The city is a single linear array.
RECOMMENDATION: PARTIAL — REUSE `destroyedSpaces[]` + `citySpaces` override + `extraVillainGroups` to remodel the main city to 3 spaces. BUILD NEW for Smash Two Dimensions: (a) a SECOND ROW of fightable spaces (no 2-D city precedent), and (b) per-villain-entry PLACEMENT CHOICE (no player-chosen entry slot precedent — `enterCityFromRight()` is always automatic). Fragmented Realities at 1 player is degenerate, so it needs only the resize reuse (no parallel-dimension build). Flag the parallel-dimension scheme as high-cost; deferral candidate (Core Engine Changes #2).

MECHANIC: Multi-mastermind scheme consumer (Dark Alliance — adds a full-strength 2nd Mastermind that accrues Tactics)
PRIOR ART: depends on Multiple Masterminds keystone (see that entry); per-mastermind tactic add reuses `revealMastermindTactic()`/tactic-array mutation @ script.js:15981; bystander capture reuses Demon Goblins plumbing
HOW IT WORKS: No second-active-mastermind support exists; this scheme is the keystone's hardest consumer (a full mastermind, not an ascension).
RECOMMENDATION: BUILD NEW — build the multi-mastermind keystone first; this scheme drives it. Tactic accrual and bystander capture reuse existing pieces once the array generalization exists.

---

## Open Questions

1. ~~**Fragmented Realities — solo shape.**~~ **RESOLVED 2026-06-22: SKIP ENTIRELY** (user call — its mechanic IS per-player dimensions, which have no natural 1-player solo form; not a revisit-later defer). **Smash Two Dimensions Together** is DEFERRED (could revisit if the parallel-dimension build is ever funded). → 6 of 8 schemes ship this build.
2. ~~**Build an Army of Annihilation — henchman source.**~~ **RESOLVED 2026-06-22: use M.O.D.O.K.s as the "Annihilation Wave" stand-in.** Research (`C:\Users\Paul\.claude\research\2026-06-22-secret-wars-annihilation-wave-henchmen.md`) found "Annihilation Wave" is a **printing error** — the named group was cut before release and exists in no Legendary product. Community consensus (no official UD errata) is to designate any henchman group, so M.O.D.O.K.s is rules-as-intended, not a house rule. Scheme spawns its own 10-henchman "Annihilation" army (separate from the villain-deck henchmen) using M.O.D.O.K. art/stats.
3. **Magneto ascension (minor physical confirm).** "Fight once / no Tactics / defeat at printed Attack 8" is imported from the What If? rulebook (sister set), not literally on the Secret Wars insert. Same shared mechanic — almost certainly identical — but a one-card physical glance confirms it.
4. **Dark Alliance 2nd mastermind strength** — "full strength" inferred from absence of a reduction clause; physical Pass-3 confirm worthwhile.
5. **Teleport inventory gloss fix** — correct final/secret-wars-vol1.md L13 from "top of deck" to the rulebook wording (tracking item; engine already correct).
