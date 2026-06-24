# Secret Wars Volume 1 — Per-Card Behavioral Specs (FROZEN)

Status: **FROZEN** 2026-06-23 — committed before any Phase 3 effect code.
Inventory stamp source: `docs/card-inventory/final/secret-wars-vol1.md` (Pass 2, 2026-04-04).
Inputs: that inventory (verbatim effect text), `docs/expansion-mechanics/secret-wars-vol1.md` (reuse verdicts + Prior Art file:line), `docs/rules-notes/secret-wars-vol1.md` (solo rulings), `docs/engine-gotchas.md` (engine traps).

**What this is:** the CONTRACT the Phase-4 `/expansion-audit` card-type auditors blind-compare the code against. Phase 3 builds TO this spec (intended-behavior + engine-function line), then runs each non-trivial card's executable assertion via `/game-test` before calling the card done. Any `confidence: LOW` card gets a MANDATORY dynamic `/game-test` in Phase 3 regardless of how simple it looks. If reality contradicts a frozen spec during Phase 3, surface it — do NOT silently rewrite the spec to match the code.

**Scope:** in-scope roster only (14 heroes, 4 villain groups, 2 masterminds + 8 tactics, 6 schemes, 2 henchmen, Banker). Deferred/skipped content (Deadlands, Wasteland, Ghost Racers, Ambitions, Fragmented Realities, Smash Two Dimensions) is OUT.

**Counts:** ~87 spec blocks; **30 LOW-confidence** (forced dynamic test in Phase 3). LOW concentration: all 6 Madelyne/Demon-Goblins blocks, Dark Alliance + the keystone consumers, the 5 Manhattan/Thor-Corps gain-as-hero cards, the 4 novel schemes, and the reactive/ambiguous heroes (Untouchable, Black Bolt ×2, Stalk, Fight the Future, Imperius Rex, Utter Annihilation, etc.).

---

## ⚠️ OPEN QUESTIONS — need coordinator/Paul ratification BEFORE Phase 3 builds the affected cards

These are genuine **gameplay/rules** calls the inventory + rules-notes leave open. Each affected card is flagged `confidence: LOW` and carries my recommended reading inline, but the call is the coordinator's/Paul's. None block the **keystone (3a-1)** or the routine cards; they gate specific consumers in 3b–3e.

**Q1 — "each other player" in 1-player solo (the big one; affects 6 cards).** rules-notes + the mechanics Solo-Decisions table defer this ("self-apply or no-op per the non-Location precedent; confirm at build"). Proposed consolidated rule + per-card calls:
- **NO-OP** when "each other player" is the *source/comparison* (no other player exists to draw from): **Everyone's a Demon on the Inside** ("a Bystander from each OTHER player's Victory Pile"), **#Humblebrag** ("players who have fewer cards than you" — can't be fewer than yourself).
- **SELF-APPLY** when it's a *reveal-or-suffer / reveal-or-surrender* the active player can meaningfully resolve alone: **Corrupted Clone of Jean Grey** (reveal X-Men or Wound), **Nimrod Adapt and Destroy** (you discard one chosen-icon card), **Maximus Inhuman Mastery** (you reveal Tech or surrender a Henchman from your VP → you free-defeat it), **Thanos Galactic Domination** (you reveal Range or surrender a Bystander from your VP → you rescue it).
- Rationale: matches the Revelations Location solo rule ("do it yourself") for reveal-or-suffer effects, while honoring the literal "OTHER player's pile" wording where there's genuinely no solo source. **If Paul prefers uniform no-op (simpler) or uniform self-apply, say so — assertions flip accordingly.**

**Q2 — Colossus of Future Past "Don't play a Villain card at the beginning of next turn."** Golden Solo draws **2** villain cards/round. Does "a Villain card" mean **skip one** (draw 1 next round) or **skip the whole villain step**? Recommend: reduce next round's villain draw by **1**. (Mode-divergent — What If? Solo draw count differs.)

**Q3 — Crush Them With My Bare Hands: Master-Strike counting under multiple masterminds.** "Evil Wins when 8 Master Strikes have taken effect." With a 2nd mastermind in play, does one Master-Strike *trigger* count as 1 or N (one per mastermind)? Recommend: **1 event per trigger**. (Also: the 5 twists alone can't reach 8 — natural Master-Strike cards from the villain deck also count.)

**Q4 — Black Bolt "Destructive Whisper": reveal source.** "+1 Attack if you reveal four cards with no rules text." Reveal from **hand** (my reading — contrasts Hypersonic Scream's explicit "played this turn") or from cards played this turn? Recommend: **from hand**. Needs the no-rules-text predicate settled (see Shared Mechanics).

**Q5 — Lady Thor "Once per turn" scope.** Once-per-turn **total** for the effect, or once **per card copy** played? Text reads flatly "Once per turn." Recommend: **once total per turn per card title** (a 2nd copy of the same title does nothing more that turn).

**Q6 — Superior to Others tie case.** Top two deck cards equal cost → "draw the higher" has no answer. Recommend: **draw nothing**, both stay on top. (Dead-draw outcome — confirm.)

**Q7 — Build an Army of Annihilation Twist reading.** With the M.O.D.O.K. stand-in (agreed), the per-Twist count next to the Mastermind escalates with the Twist stack and defeated henchmen recycle (VP→KO'd back out each Twist). This is my interpretation of ambiguous wording — worth a rules eyeball before 3e.

**Technical build-time confirms (NOT Paul calls — I/build resolve & verify):** exact S.H.I.E.L.D./HYDRA team-tag strings (No More Heroes); Bridge/Rooftops/Bank city-space label→index in both modes (Namor Ruler of the Seas, Web-Slinger, Banker); Limbo group-tag field name (Gather the Harvest); whether the MAIN mastermind supports captured-bystander attachment today (Dark Alliance Twists 5-6); inventory Teleport gloss is wrong — use the rulebook wording (set aside → next hand), not "top of deck" (Teleport and Incarcerate).

---

## Shared Mechanics & Keystone

Cards above reference these by name. Engine-function lines cite `Legendary-Solo-Play-main/Legendary-Solo-Play-main/` (file:line). Honor reuse-first (CLAUDE.md rule 9): adapt these before building fresh.

### KEYSTONE — Multiple Masterminds (Core Engine Change; build FIRST in Phase 3a-1)  (confidence: LOW)
- **Rule (What If? rulebook p.19, authoritative):** multiple Masterminds can be in play; **win = defeat ALL of them**; on each Master Strike trigger, **every** Mastermind fires its own Master Strike (current player picks order); "the Mastermind" targeting → player picks which; an **ascended** Mastermind has **no Tactics**, is defeated by **one fight at its printed villain Attack**, then becomes a normal Villain card in the Victory Pile.
- **Intended behavior:** Generalize the engine's single-mastermind assumption to an **array of active masterminds**. Two flavors: **(a) ascended** (Apocalyptic Magneto Escape) = no tactics, one fight at printed Attack 8, converts to a VP-6 villain on defeat; **(b) scheme-added** (Dark Alliance) = a real full-strength mastermind that accrues 1→4 Tactics over Twists. A 2nd mastermind occupies an additional board slot.
  - **Golden Solo adaptation (ours — rules-silent; user-approved 2026-06-22):** the MAIN mastermind keeps its existing **4-defeats → Final Showdown** flow UNCHANGED; a 2nd mastermind is an **additional must-kill gate** that must be cleared to win but is **NOT folded into the Final Showdown combined-points math** (Showdown stays a single-mastermind calc). The 2nd's Master Strike fires alongside the main one.
  - **What If? Solo:** implement p.19 as written.
- **Engine function / pattern:** BUILD NEW (mostly) in `script.js`, generalizing single→array: `getSelectedMastermind()` @ script.js:944 (one DOM radio), the global `mastermindDefeated` flag @ script.js:898, the win check @ script.js:16538 → `isMastermindDefeated()` @ script.js:15339, `handleMasterStrike()` @ script.js:5804 (NO loop today), tactic reveal `revealMastermindTactic()` @ script.js:15981. REUSE the convert-on-defeat-to-VP-villain machinery for the ascended half (the `skrulled` VP-bypass @ script.js:13360 / `gainScarletWitchAsHero()` @ expansionRevelations.js:3481, routed to Victory Pile not discard). The Epic overlay `{...base,...base.epic}` @ script.js:952 is a runtime shallow-merge of ONE mastermind — NOT prior art for two; its in-place-mutation gotcha (`tactics.length = 0`, never reassign) carries into any multi-mastermind code. Add an `ascendToMastermind(villainCard, {masterStrikeFn, defeatAttack, vp})` registration helper for the ascended flavor; whitelist any ascension flag in `createVillainCopy()`.
- **Interaction risks:** Touches the win check + Master-Strike loop shared by ALL expansions → **dual-mode `/game-test` MANDATORY**. The Golden-Solo "additional gate outside Showdown math" seam is the riskiest part. Build + dual-mode-verify this BEFORE its consumers (Apocalyptic Magneto in 3c, Dark Alliance in 3e).
- **Executable assertion (BOTH golden+whatif):** With the keystone built: trigger Apocalyptic Magneto Escape → assert a 2nd active mastermind exists (no tactics, defeat value 8) occupying a 2nd board slot; trigger a Master Strike → assert BOTH masterminds' strikes resolve (player picks order); defeat the ascended one with Attack ≥ 8 (one fight) → assert it lands in the Victory Pile as a VP-6 villain AND the win check now requires both masterminds defeated. Golden: assert the main mastermind still runs its 4-defeats→Final-Showdown unchanged and the 2nd is a separate must-kill gate not in the Showdown points math.

### gainSidekick() helper (cost-free, cap-free Sidekick gain)  (confidence: HIGH)
- **Why:** every Sidekick acquisition today flows through `recruitSidekick()` @ script.js:17782, which always sets `sidekickRecruited` AND deducts cost. A cost-free/cap-free "gain" path is genuinely missing (insert p.1: "gain" ≠ "recruit", does NOT count against the 1/turn cap).
- **Design (approved 2026-06-22, with empty-stack guard):**
  ```js
  async function gainSidekick(destination = "discard") { // "discard" | "hand" | "deckTop"
    if (sidekickDeck.length === 0) { onscreenConsole.log("No Sidekicks remain in the Sidekick Stack."); return null; } // graceful no-op
    const sk = sidekickDeck.pop();
    if (destination === "hand") playerHand.push(sk);
    else if (destination === "deckTop") { playerDeck.push(sk); sk.revealed = true; }
    else playerDiscardPile.push(sk);
    onscreenConsole.log(`Gained a Sidekick (<span class="console-highlights">${sk.name}</span>).`);
    updateGameBoard();
    return sk;
  }
  ```
  Does NOT touch `sidekickRecruited` or recruit points. Consumers: Magik Rally, King of Wakanda (×3 → deckTop on Illuminati), Maximus Enslave (per-defeat), Namor Lead, Ultimate Spidey Marvel Team-Up; Corrupt-the-Next-Gen "gain to deck top". Stack-empty → no-op gracefully (don't push `undefined`).

### Teleport keyword  (confidence: HIGH)
- **Rule (insert p.1):** "Instead of playing this card, you may set it aside. At the end of this turn, add it to your new hand as an extra card." (NOT "top of deck" — the inventory gloss is wrong.)
- **Reuse:** `playOrTeleport()` @ cardAbilitiesDarkCity.js:3789 + `teleport()` @ cardAbilitiesDarkCity.js:3767 + end-of-turn priority on `cardsToBeDrawnNextTurn` in `drawOne()` @ script.js:11739. A card whose ability text is just "Teleport." carries `keywords:["Teleport"]` and no ability fn. **Granting Teleport to ANOTHER card** (Inferno Nightcrawler): copy Azazel @ cardAbilitiesDarkCity.js:11940 — `card.keywords.push("Teleport"); card.temporaryTeleport = true;` — the engine auto-removes the temp keyword @ cardAbilitiesDarkCity.js:3772.

### Cross-Dimensional Rampage  (confidence: HIGH for the mechanic; consumers vary)
- **Rule (insert p.1):** "Cross-Dimensional [Character] Rampage" = "Each player reveals one of their [Character] Heroes or a [Character] card in their Victory Pile or gains a Wound." Family match: **Wolverine** = name contains "Wolverine"/"Weapon X"/"Old Man Logan"; **Thor** = name contains "Thor". "each PLAYER" (not "each other") → in solo applies to the **active player**.
- **Reuse:** ADAPT `revealClassOrWound()` @ expansionRevelations.js:2329 (scans `[...playerHand, ...playerArtifacts, ...cardsPlayedThisTurn]`, pops Reveal/Wound choice or calls `drawWound()` @ cardAbilities.js:305) — swap the single-class predicate for a family-NAME substring match (case-insensitive) and **extend the scanned pool to include the Victory Pile**. In-scope consumers: Old Man Logan "Rage Out" (Wolverine; the "+1 Attack per OTHER player who Wounded" rider = **0** in solo), Apocalyptic Weapon X Escape (Wolverine), Wolverine of Future Past Escape (Wolverine), Ultimate Thor Escape (Thor).

### Dual-class (multicolored) cards  (confidence: HIGH — verified safe)
- Store as a **2-element `classes` array** (e.g. `["Covert","Tech"]`), inventory order. Verified codebase-safe (Phase 1): zero `classes[0]` single-index reads; every consumer uses `.includes()`/`.some()`/iteration; icon renderer @ script.js:19932 already does `classes.slice(0,3)`. `color` field = first class's color (display + Grey-check only). Use `hasClass(card, wanted)` @ expansionFantasticFour.js:73 for membership. Never a `"Covert / Tech"` slash string.

### "Cards with no rules text" predicate (Black Bolt)  (confidence: LOW — predicate design open)
- A card "has no rules text" if it has no ability/superpower/keyword effect (base stats only). **Add a DB flag `noRulesText: true`** on the no-text cards rather than brittle runtime inference (`unconditionalAbility==="None" && conditionalAbility==="None"` misses keyword-only cards). Black Bolt's cards filter `cardsPlayedThisTurn` @ script.js:790 by this flag. **Scope decision needed at build:** which cards across the WHOLE game get the flag (the predicate counts ANY no-text card, not just Secret Wars ones — e.g. base "Speak No Words", vanilla S.H.I.E.L.D. cards). In-scope SWV1 no-text cards: Black Bolt "Speak No Words", Proxima "Inspiration Through Power". The "replay a no-text card's Recruit+Attack" half (Silence is Golden) needs a re-grant helper — survey at build.

### Villain→Hero "gain as Hero" converter (inverted Skrull)  (confidence: LOW)
- On Fight, instead of pushing to the Victory Pile, **convert the villain/henchman card to its Hero form and route to the player's discard pile**. These have **no/0 VP** → the defeat handler must **skip the VP push** (key off a `skrulled`-style flag the defeat handlers already check @ script.js:13360 — and the HENCHMAN defeat handler must honor it too, for Thor Corps). **Reuse `gainScarletWitchAsHero()` @ expansionRevelations.js:3481** as the converter template (flip `type` Villain→Hero, restore printed value, clear `fightEffect`, push to `playerDiscardPile`); sibling `unskrull()` @ cardAbilities.js:17109. Set the gained Hero's **cost = old villain/henchman Attack value**. The installed Hero ability/superpower resolves only when the card is later PLAYED, not at conversion. **Whitelist the gain-as-hero flag in `createVillainCopy()`.** Consumers: Manhattan ×4, Thor Corps.

### "Defeat a Villain / Mastermind for free"  (confidence: HIGH)
- Reuse the existing free-defeat machinery (present a target choice, run the city/HQ defeat chain so the target's Fight effect still fires, no Attack spend). Consumers: Maximus Mental Domination (Henchmen only), Namor Imperius Rex (Villain, or Mastermind on superpower), Maximus Inhuman Mastery, Thanos Utter Annihilation. Mastermind free-defeat must register toward the Golden 4-defeat counter / What If? progress without spending Attack.

### Banker restricted recruit (hqNReserveRecruit)  (confidence: HIGH)
- On rescue, +2 Recruit usable ONLY on the HQ Hero in the slot under the **Bank** space. Reuse `moleManUndergroundRiches()`'s position-keyed reserve @ expansionFantasticFour.js:2640 (read @ script.js:7360). Resolve the Bank slot by **label** (`"The Bank"`, not bare `"Bank"` → -1), never a hardcoded index (city-resize schemes shift it). Additive (multiple Bankers stack). No-op gracefully if the Bank space doesn't exist.

### ≥6-Recruit-this-turn threshold (Nimrod gate + Lady Thor)  (confidence: HIGH)
- Read `cumulativeRecruitPoints >= 6` (total GENERATED this turn, not current unspent — spending Recruit must not re-lock). Lady Thor bonuses reuse the immediate `>= N` read (`ThorHighRecruitReward()` @ cardAbilities.js:1380) + the deferred-flag pattern (`throgSidekickAbility()` @ cardAbilitiesSidekicks.js:213) so a copy played before reaching 6 still pays out once 6 is hit. **Nimrod's fight-gate** is a distinct UNLOCK (Nimrod still costs Attack — NOT `usesRecruitToFight`): add `unfightableUnlessRecruit:6` read at ALL THREE affordability gates — `showAttackButton()` @ script.js:11922 + both `updateHighlights()` twins @ script.js:7333 and script.js:7590.

### Demon Goblins (Madelyne)  (confidence: LOW)
- Bystanders captured by Madelyne become separately-fightable **2-Attack "Demon Goblin" entities** attached to her (fight one → rescue its Bystander to the active player). **Madelyne is unfightable while any Demon Goblin exists.** Reuse the capture-onto-entity plumbing (`captureBystanderFromVPToLocation()` @ expansionRevelations.js:5059 → `entity.capturedBystanders[]`; rescue-on-defeat @ script.js:12448; overlay @ script.js:8681). Each Demon Goblin is a fightable off-grid entity modeled on Korvac/Graveyard (`type:"Location"`, `placeLocation()` @ script.js:580). The can't-fight-Madelyne gate adapts the 3-gate affordability pattern (a NEW gate, distinct from `usesRecruitToFight` and Nimrod's unlock — keep all three `updateHighlights`/`showAttackButton` gates in sync).

### "each other player" solo convention
- See **Q1** above. Default per the Solo-Decisions table = the per-card calls in Q1; ratify before building those cards.

---


## Heroes A — Apocalyptic Kitty Pryde through Magik

### Apocalyptic Kitty Pryde

### Apocalyptic Kitty Pryde — Phase Out (Common A)  (confidence: HIGH)
- **Effect text:** "[COVERT]: You may KO a card from your hand or discard pile. If you do, you get +1 Attack." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower gated on a Covert Hero being played this turn. Optional ("may"): player chooses to KO one card from hand OR discard pile (card-choice popup over both pools), or decline. If a card is KO'd, +1 Attack ("if you do"). Decline → no Attack.
- **Engine function / pattern:** Reuse the KO-from-hand/discard card-choice pattern — `KO1To4FromDiscard()` in `cardAbilities.js` (per CLAUDE.md: KO from hand/discard player-choice → `card-choice-popup`, NOT `showHeroAbilityMayPopup`). On KO, grant +1 Attack via the standard attack-grant helper touching BOTH `totalAttackPoints` + `cumulativeAttackPoints`, then `updateGameBoard()`.
- **Interaction risks:** None notable. Covert gate is standard conditional superpower.
- **Executable assertion:** Set up state with a Covert Hero already played this turn + ≥1 card in hand → trigger Phase Out superpower → choose to KO a hand card → assert that card moved to KO pile AND current-turn Attack increased by exactly 1. Second run: decline the KO → assert Attack unchanged.

### Apocalyptic Kitty Pryde — Infiltrate HQ (Common B)  (confidence: HIGH)
- **Effect text:** "You may put a Hero from the HQ on the bottom of the Hero Deck. The Hero that replaces it in the HQ costs 1 less during this turn." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Optional. Player picks one HQ Hero → it goes to the bottom of the Hero Deck → the HQ refills that slot from the Hero Deck (standard refill). The NEW Hero now occupying that slot costs 1 Recruit less for the remainder of this turn. Decline → nothing happens.
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js. Reuse the HQ-to-bottom-of-deck + refill mechanism (Nimrod "Scatter the Mutants" and Ambition "Abduction" share "HQ → bottom of Hero Deck"; survey at build for an existing HQ-bottom helper). Apply a per-turn cost reduction to the replacement slot — reuse the cost-reduction mechanism used for "costs N less" (survey `recruitCost` / cost-discount reads in script.js; cleared at turn end). Card-choice popup over HQ slots.
- **Interaction risks:** Cost reduction must key to the SLOT/replacement card, not the removed card, and must clear at end of turn. Must trigger HQ refill correctly (Golden Solo = rightmost-fill rotation per CLAUDE.md; here the replacement enters the vacated slot — confirm refill semantics in both modes during build).
- **Executable assertion:** Set up known HQ + known top of Hero Deck → trigger Infiltrate HQ → select an HQ Hero → assert: selected Hero is now on bottom of Hero Deck, the slot is refilled, and the refilled Hero's effective recruit cost is its printed cost − 1 this turn. End turn → assert cost reverts.

### Apocalyptic Kitty Pryde — Disrupt Circuits (Uncommon)  (confidence: HIGH)
- **Effect text:** "You get +1 Attack for each [TECH] Hero in the HQ." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Count Tech-class Heroes currently in the HQ (count the card per slot; dual-class cards that include Tech count). Grant +1 Attack per such Hero. Immediate, non-optional.
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js. Iterate HQ slots, count via `hasClass(card, "Tech")` (`hasClass` @ expansionFantasticFour.js:73 — array-based, supports dual-class). Grant total Attack touching BOTH `totalAttackPoints` + `cumulativeAttackPoints`, then `updateGameBoard()`.
- **Interaction risks:** Dual-class Tech cards (e.g. Black Panther "Multifaceted Genius" Strength/Tech) must count — use `hasClass`, not `classes[0]`. Empty/null HQ slots must be guarded.
- **Executable assertion:** Set up HQ containing exactly 2 Tech Heroes (one single-class Tech, one dual-class incl. Tech) → play Disrupt Circuits → assert current-turn Attack increased by exactly 2.

### Apocalyptic Kitty Pryde — Untouchable (Rare)  (confidence: LOW)
- **Effect text:** "When any player defeats a Villain or Mastermind with a \"Fight\" effect, you may discard this card to cancel that fight effect. If you do, draw three cards." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** A REACTIVE trigger. When a Villain or Mastermind that has a Fight effect is defeated, BEFORE that Fight effect resolves, the player may discard Untouchable from hand to cancel (skip) the Fight effect entirely; if they do, draw 3 cards. In solo, "any player" = the active player (only player). KEY AMBIGUITIES (why LOW): (1) Timing — can it fire only while Untouchable is in HAND, and exactly at the moment a Fight effect is about to resolve? Standard Legendary reactive-discard cards (e.g. cancel-effect responses) fire from hand at the trigger window. (2) Does "cancel that fight effect" cancel only the Villain's own Fight effect, or also the defeat itself? Reading: cancels ONLY the Fight effect — the Villain is still defeated and goes to the Victory Pile; you just skip its harmful Fight text. (3) Does it apply to a Villain you're defeating THIS turn via your own play, i.e. fires during your own fight resolution? Yes — "any player" includes you. (4) Interaction with masterminds that have multiple tactic Fight effects — applies to the single Fight effect being resolved.
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js. No clean existing prior art for "discard a card from hand to cancel a pending fight effect" — survey at build for any reactive cancel/interrupt pattern (e.g. existing "you may discard to prevent" responses) before building fresh (reuse-first, CLAUDE.md rule 9). Needs a hook in the fight-effect resolution path in script.js to offer the cancel window when the active player holds Untouchable. On cancel: discard the card, skip the fight effect, then draw 3 (reuse `drawOne()`/draw-N).
- **Interaction risks:** High — requires intercepting the Villain/Mastermind Fight-effect resolution pipeline, which is shared engine. Risk of cancelling the wrong effect or firing at the wrong window. Must NOT cancel the defeat/VP gain, only the Fight effect. Reactive "while in hand" detection during fight resolution is novel for this engine.
- **Executable assertion:** Set up a Villain in the city WITH a Fight effect (e.g. one that KOs a hero) + Untouchable in hand + enough Attack to defeat it → defeat the Villain → assert a cancel prompt appears → accept → assert: the Fight effect did NOT resolve (no hero KO'd), Untouchable moved to discard, hand gained 3 cards, AND the Villain is in the Victory Pile (defeat still counted). Second run: decline → assert Fight effect resolves normally and Untouchable stays in hand.

---

### Black Bolt

> All three of Black Bolt's text-bearing cards depend on the **"cards with no rules text" predicate** (see Shared Mechanics — DB flag `noRulesText: true` filtered over `cardsPlayedThisTurn` @ script.js:790). "Speak No Words" is itself a no-rules-text card (intentionally blank — it is one of the cards these abilities count/replay).

### Black Bolt — Destructive Whisper (Common A)  (confidence: LOW)
- **Effect text:** "You get +1 Attack if you reveal four cards with no rules text." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** If the player can reveal FOUR distinct cards that have no rules text, gain +1 Attack. AMBIGUITY (why LOW): "reveal four cards with no rules text" — reveal from WHERE? Most Legendary "reveal N [trait] cards" abilities reveal from your HAND (cards currently held). Reading: reveal 4 no-rules-text cards from your hand → if you can, +1 Attack. This is NOT "played this turn" (contrast Hypersonic Scream which says "played this turn") — it is a reveal-from-hand check. Optional only in the sense that if you can't reveal four, you get nothing. The no-rules-text predicate must be settled first (Shared Mechanics).
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js. Filter the player's HAND by the `noRulesText` flag (Shared Mechanics); if count ≥ 4, grant +1 Attack touching BOTH `totalAttackPoints` + `cumulativeAttackPoints`. Survey at build for an existing "reveal N cards of trait from hand" pattern (e.g. No More Heroes-style reveal-hand checks).
- **Interaction risks:** Depends entirely on the not-yet-built no-rules-text predicate — confidence is LOW pending that predicate's definition. Whether "reveal" means from-hand vs played-this-turn is the core uncertainty; confirm against the physical card / a rules pass at build.
- **Executable assertion:** Set up a hand containing ≥4 no-rules-text cards (Black Bolt "Speak No Words" copies + other vanilla cards) → play Destructive Whisper → assert current-turn Attack increased by 1. Second run: hand with only 3 no-rules-text cards → assert no Attack bonus.

### Black Bolt — Speak No Words (Common B)  (confidence: HIGH) — trivial: intentionally a no-rules-text card (base stats 1 Attack / 2 Recruit only); flag `noRulesText: true` in DB, no ability function. No assertion.

### Black Bolt — Silence is Golden (Uncommon)  (confidence: LOW)
- **Effect text:** "Choose a card you played this turn with no rules text. You get its Recruit and Attack again." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Player chooses one card among those PLAYED this turn that have no rules text. Re-grant that card's printed Recruit and Attack icon values a second time (e.g. a no-text card worth 2 Recruit → +2 Recruit again). If no qualifying card exists, nothing happens. AMBIGUITY (why LOW): (1) the "replay a card's Recruit+Attack" re-trigger — the mechanics doc notes the codebase may or may not have an existing replay helper (not surveyed). (2) Some no-text cards are dual-class with `0+`/variable base values — "its Recruit and Attack" means the card's printed icon values; for `0+` variable-base cards this needs care (likely the fixed printed value, but flag).
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js. Filter `cardsPlayedThisTurn` (@ script.js:790) by `noRulesText`; card-choice popup over the result; grant the chosen card's printed Recruit (BOTH `totalRecruitPoints` + `cumulativeRecruitPoints`) and Attack (BOTH `totalAttackPoints` + `cumulativeAttackPoints`); `updateGameBoard()`. Survey at build for an existing replay/re-grant-points helper before building fresh.
- **Interaction risks:** Depends on the no-rules-text predicate. Re-granting variable-base (`0+`) cards' values is ambiguous. Must not re-trigger any ability (no-text cards have none, so safe by definition).
- **Executable assertion:** Set up: play a no-rules-text card worth 2 Recruit this turn, then play Silence is Golden → choose that card → assert current-turn Recruit increased by an additional 2 (and Attack by that card's printed Attack, if any). Second run: no no-text card played → assert the ability finds no valid target and grants nothing.

### Black Bolt — Hypersonic Scream (Rare)  (confidence: HIGH)
- **Effect text:** "For each card with no rules text you played this turn, draw a card." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Count no-rules-text cards played this turn (per `cardsPlayedThisTurn` filtered by `noRulesText`). Draw that many cards. Immediate, non-optional. (Confidence HIGH because the count-and-draw is unambiguous once the predicate exists — the predicate dependency itself is the only soft spot, but the count semantics are clear.)
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js. `cardsPlayedThisTurn.filter(c => c.noRulesText).length` → loop `drawOne()` that many times.
- **Interaction risks:** Depends on the no-rules-text predicate (Shared Mechanics). Does Hypersonic Scream itself count? No — it HAS rules text, so it is excluded. Confirm whether a card must be counted at the moment it was played vs re-evaluated now (use the played-this-turn log, which records cards as played).
- **Executable assertion:** Set up: play exactly 3 no-rules-text cards this turn, then play Hypersonic Scream → assert exactly 3 cards drawn into hand.

---

### Black Panther

### Black Panther — Catlike Reflexes (Common A)  (confidence: HIGH) — trivial: Special Ability "Draw a card" — single `drawOne()`. No assertion.

### Black Panther — Multifaceted Genius (Common B)  (confidence: HIGH)
- **Effect text:** "You get +1 Attack for each other multicolored card you played this turn." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Count OTHER cards (excluding this one) played this turn that are multicolored (dual-class — `classes` array length ≥ 2). Grant +1 Attack each. Immediate.
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js. Filter `cardsPlayedThisTurn` (@ script.js:790) to those with `classes.length >= 2`, excluding the current Multifaceted Genius card itself; grant count × Attack (BOTH `totalAttackPoints` + `cumulativeAttackPoints`); `updateGameBoard()`. Note: Multifaceted Genius is itself dual-class (Strength/Tech) — "each OTHER" requires excluding self.
- **Interaction risks:** "Multicolored" = dual-class = `classes.length >= 2`. Depends on dual-class being stored as multi-element arrays (Shared Mechanics). Must exclude self ("each other"). If the played-this-turn log includes the current card, filter it out by identity.
- **Executable assertion:** Set up: play 2 other dual-class cards this turn + some single-class cards → play Multifaceted Genius → assert current-turn Attack increased by exactly 2 (not 3 — self excluded even though it's dual-class).

### Black Panther — Stalk the Urban Jungle (Uncommon)  (confidence: LOW)
- **Effect text:** "Whenever you defeat a Villain on the Rooftops or Streets this turn, you may KO one of your cards or a card from your discard pile." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** A persistent this-turn trigger: each time the player defeats a Villain located on the Rooftops or Streets city space (for the rest of this turn after playing this card), they MAY KO one card from hand ("one of your cards") or discard pile. AMBIGUITIES (why LOW): (1) "one of your cards" — does it mean a card in hand, or any card you own (hand/play area)? Reading: a card in your hand or discard pile (standard KO-source phrasing). (2) Trigger scope — does it apply to Villains defeated BEFORE this card was played this turn, or only after? Reading: only defeats occurring after the card is played (a forward-looking "whenever ... this turn" buff, like other "this turn, whenever you defeat" abilities). (3) Must register and clean up a per-turn defeat listener keyed to city space.
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js. Set a this-turn flag/listener that hooks the villain-defeat path, filtered to Rooftops/Streets spaces; on each qualifying defeat, offer an optional KO via the `card-choice-popup` KO-from-hand/discard pattern (`KO1To4FromDiscard()` in cardAbilities.js). Survey at build for existing "whenever you defeat ... this turn" registration prior art (Stalk mirrors Maximus "Enslave the Will" / "whenever you defeat a Villain this turn" — reuse that registration shape). Clean up the listener at end of turn.
- **Interaction risks:** Needs space-filtered (Rooftops/Streets) defeat detection — confirm city-space identification. "Whenever ... this turn" listener lifecycle (register on play, fire per defeat, clear at turn end) is the risk surface. Optional ("may") each trigger.
- **Executable assertion:** Set up: play Stalk the Urban Jungle, then defeat a Villain on the Streets → assert an optional KO prompt appears → KO a hand card → assert it moved to KO pile. Then defeat a Villain on the Bridge (NOT Rooftops/Streets) → assert NO prompt appears.

### Black Panther — King of Wakanda (Rare)  (confidence: HIGH)
- **Effect text:** "Gain three Sidekicks." / "[ILLUMINATI]: Put them on top of your deck." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special Ability: gain 3 Sidekicks (gainSidekick × 3 — does NOT cost Recruit, does NOT count against the 1/turn recruit cap, per rules-notes 6c). Default destination = discard pile. Superpower (if an Illuminati Hero played this turn): instead put those 3 gained Sidekicks on top of your deck.
- **Engine function / pattern:** Reuse `gainSidekick()` helper (see Shared Mechanics — pops `sidekickDeck` without touching `sidekickRecruited` or recruit points). Call ×3 to discard by default; if the Illuminati superpower fires, call with the to-top-of-deck destination flag ×3. Guard for empty Sidekick Stack.
- **Interaction risks:** Sidekick Stack may have fewer than 3 cards — gain as many as available. Must not consume the recruit cap or Recruit points (gain ≠ recruit). Order on top of deck if to-top variant.
- **Executable assertion:** Set up Sidekick Stack with ≥3 cards, NO Illuminati Hero played → play King of Wakanda → assert 3 Sidekicks now in discard pile AND `sidekickRecruited` still false AND Recruit points unchanged. Second run: with an Illuminati Hero played this turn → assert the 3 Sidekicks are on top of the deck instead.

---

### Captain Marvel

### Captain Marvel — Absorb Energies (Common A)  (confidence: HIGH)
- **Effect text:** "[RANGED]: For each other [RANGED] Hero you have played this turn, you get +1 Recruit." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower gated on a Ranged Hero played this turn (this card itself is Ranged, so it self-satisfies the gate). Count OTHER Ranged Heroes played this turn (excluding this card) → +1 Recruit each.
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js (or reuse a generic "count class played this turn" helper if one exists — survey at build; mirrors Marvelous Strength below). Filter `cardsPlayedThisTurn` by `hasClass(c, "Range")` excluding self; grant count × Recruit (BOTH `totalRecruitPoints` + `cumulativeRecruitPoints`); `updateGameBoard()`. NOTE: class string is `"Range"` not `"Ranged"` per CLAUDE.md DB convention.
- **Interaction risks:** "each OTHER" — exclude self. Dual-class Ranged cards count (use `hasClass`). Class-string mismatch risk: DB uses `"Range"`, inventory text says [RANGED].
- **Executable assertion:** Set up: play 2 other Range-class Heroes this turn → play Absorb Energies → assert current-turn Recruit increased by exactly 2.

### Captain Marvel — Supersonic Flight (Common B)  (confidence: HIGH) — trivial: Special Ability "Draw a card" — single `drawOne()`. No assertion.

### Captain Marvel — Marvelous Strength (Uncommon)  (confidence: HIGH)
- **Effect text:** "[STRENGTH]: For each other [STRENGTH] Hero you have played this turn, you get +1 Attack." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower gated on a Strength Hero played this turn (self-satisfies). Count OTHER Strength Heroes played this turn (excluding self) → +1 Attack each.
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js (twin of Absorb Energies, Attack instead of Recruit). Filter `cardsPlayedThisTurn` by `hasClass(c, "Strength")` excluding self; grant count × Attack (BOTH `totalAttackPoints` + `cumulativeAttackPoints`); `updateGameBoard()`.
- **Interaction risks:** "each OTHER" — exclude self. Dual-class Strength cards count.
- **Executable assertion:** Set up: play 3 other Strength-class Heroes this turn → play Marvelous Strength → assert current-turn Attack increased by exactly 3.

### Captain Marvel — Cosmic Energies (Rare)  (confidence: HIGH) — trivial: Superpower [RANGED][RANGED][STRENGTH][STRENGTH]: +6 Attack — pure 4-icon-gated flat Attack bonus, no count/choice/draw. No assertion.

---

### Dr. Strange

### Dr. Strange — Cloak of Levitation (Common A)  (confidence: HIGH)
- **Effect text:** "[RANGED]: Reveal the top card of your deck. Draw it or Teleport it." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower gated on a Ranged Hero played this turn. Reveal top card of own deck; player chooses to either draw it (into hand now) OR Teleport it (set aside, returns at end of turn as a bonus card — see Shared Mechanics Teleport). If deck empty, reshuffle discard per standard rules (or no-op if nothing).
- **Engine function / pattern:** Reuse the reveal-top-then-Draw-or-Teleport flow — this is identical to villain "Apocalyptic Blink" Fight ("Reveal the top card of your deck. Draw it or Teleport it"). Reuse `playOrTeleport()`-adjacent Draw/Teleport choice (Teleport keyword — see Shared Mechanics; `teleport()` @ cardAbilitiesDarkCity.js:3767, `playOrTeleport()` @ cardAbilitiesDarkCity.js:3789). New thin wrapper that reveals top-of-deck then routes to draw or the existing teleport queue (`cardsToBeDrawnNextTurn`).
- **Interaction risks:** Empty deck guard. Teleport-of-a-revealed-deck-card (vs a hand card) must queue into `cardsToBeDrawnNextTurn` correctly. Shared the same Draw-or-Teleport choice as Inferno Darkchilde (KO variant) and Apocalyptic Blink — keep consistent.
- **Executable assertion:** Set up: a Ranged Hero played this turn + a known top card of deck → trigger Cloak of Levitation → choose Draw → assert that card is now in hand. Second run: choose Teleport → assert the card is set aside and arrives in next turn's starting hand as an extra card.

### Dr. Strange — Trust Me, I'm a Doctor (Common B)  (confidence: HIGH)
- **Effect text:** "[ILLUMINATI]: You may KO a card from your hand or discard pile. If you do, you get +1 Recruit." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower gated on an Illuminati Hero played this turn. Optional KO of one card from hand or discard pile; if KO'd, +1 Recruit. (Recruit-variant twin of Kitty Pryde's Phase Out, which is Attack.)
- **Engine function / pattern:** Reuse the `card-choice-popup` KO-from-hand/discard pattern (`KO1To4FromDiscard()` in cardAbilities.js). On KO, +1 Recruit (BOTH `totalRecruitPoints` + `cumulativeRecruitPoints`); `updateGameBoard()`.
- **Interaction risks:** None notable. Optional ("may"). Recruit (not Attack) — don't copy the Attack twin's grant by mistake.
- **Executable assertion:** Set up: an Illuminati Hero played this turn + a KO-able card in hand → trigger → KO it → assert current-turn Recruit +1 AND card in KO pile. Second run: decline → assert Recruit unchanged.

### Dr. Strange — Fight the Future (Uncommon)  (confidence: LOW)
- **Effect text:** "[INSTINCT]: Reveal the top card of the Villain Deck. If it's a Villain, you get +2 Attack and may fight that Villain this turn." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower gated on an Instinct Hero played this turn. Reveal top card of the VILLAIN Deck. If it's a Villain (not a Scheme Twist / Master Strike / Bystander), gain +2 Attack and that revealed Villain becomes fightable this turn — i.e. you may fight it directly from where it sits without it having entered the city normally. AMBIGUITIES (why LOW): (1) After revealing, where does the Villain sit — stays on top of the Villain Deck as a special fightable target, or enters the city, or sits aside? Reading: it stays revealed/on top and is flagged fightable this turn; if not fought it remains for the normal villain-draw step. (2) If the revealed card is NOT a Villain (Twist/Strike/Bystander), it presumably stays on top and resolves normally on the next villain draw, with no Attack bonus. (3) "may fight that Villain this turn" — making an out-of-city card fightable is a novel target state for the engine.
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js. Peek top of villain deck; type-check for Villain. If Villain: grant +2 Attack (BOTH totals) and mark the card as a special fightable target for this turn. Closest prior art: villain "Apocalyptic Rogue"/Hero-deck reveal patterns and any "fight a villain outside the city" target flag — survey at build; this likely needs a custom fightable-target registration (reuse-first per rule 9). Reveal text via onscreenConsole.
- **Interaction risks:** High — "fight a Villain still on the Villain Deck" is a non-standard fight target; the fight pipeline assumes city/HQ/bridge/mastermind targets. Must not double-resolve the card (don't both fight it AND draw it later). +2 Attack only when it's a Villain.
- **Executable assertion:** Set up: an Instinct Hero played this turn + a known Villain on top of the Villain Deck → trigger Fight the Future → assert +2 Attack granted AND the revealed Villain is offered as a fightable target this turn. Second run: a Scheme Twist on top of the Villain Deck → assert no Attack bonus and no fight offered.

### Dr. Strange — Sorcerer Supreme (Rare)  (confidence: HIGH)
- **Effect text:** "Reveal the top three cards of your deck. Draw any number of them and Teleport the rest." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Reveal top 3 of own deck. Player chooses any subset to draw into hand; every card NOT drawn is Teleported (set aside, returns at end of turn as bonus cards — Shared Mechanics Teleport). Net: all 3 cards end up in hand by end of turn (drawn now or Teleported back), but Teleported ones skip this turn's play.
- **Engine function / pattern:** New helper in expansionSecretWarsVol1.js. Reveal top 3 (guard for <3 in deck); per-card or multi-select choice Draw vs Teleport; route non-drawn cards into the Teleport queue (`cardsToBeDrawnNextTurn`, Shared Mechanics). Reuse the reveal-multiple + per-card disposition pattern (mirrors villain Hero-deck reveal-and-sort flows; survey at build).
- **Interaction risks:** Deck with fewer than 3 cards — reveal what's available (possibly trigger reshuffle of discard per standard draw rules). Teleport-of-revealed-deck-cards into the queue. Multi-card selection UI.
- **Executable assertion:** Set up: 3 known cards on top of deck → play Sorcerer Supreme → choose to draw 2, Teleport 1 → assert 2 cards in hand now, and the 3rd arrives in next turn's starting hand as an extra card.

---

### Lady Thor

> Three of Lady Thor's cards share the **≥6-Recruit-this-turn threshold** (see Shared Mechanics — read `cumulativeRecruitPoints >= 6`, plus a once-per-turn-used flag per card). Each is "Once per turn."

### Lady Thor — Mysterious Origin (Common A)  (confidence: HIGH)
- **Effect text:** "Once per turn, if you made at least 6 Recruit this turn, draw a card." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** When played (or when the threshold is met, whichever is later): if total Recruit generated this turn ≥ 6, draw 1 card. Fires at most once per turn even if multiple copies are played. NOTE timing ambiguity is the soft spot but resolved by precedent: existing ≥-threshold cards (ThorHighRecruitReward, throgSidekickAbility) either fire immediately if already met OR defer with a flag and pay out when the threshold is later crossed — use the deferred pattern so a copy played before reaching 6 Recruit still rewards once 6 is reached.
- **Engine function / pattern:** Reuse ≥6-Recruit threshold (Shared Mechanics). Pattern: `throgSidekickAbility()` @ cardAbilitiesSidekicks.js:213 (deferred-flag if not yet at threshold) + `ThorHighRecruitReward()` @ cardAbilities.js:1380 (immediate `>= N` read). On satisfaction, `drawOne()` once; set a per-turn-used guard so only one draw per turn from this card.
- **Interaction risks:** "Once per turn" must gate across multiple copies of the same card if intended per-card-title (confirm: standard Legendary "once per turn" is per card title — multiple copies still only fire once collectively? Usually per-card-instance unless stated. Flag at build — but text says "Once per turn" flatly, suggesting once total per turn for this effect). Deferred-vs-immediate timing.
- **Executable assertion:** Set up: generate 6 Recruit this turn, then play Mysterious Origin → assert 1 card drawn. Second run: play it with only 4 Recruit, then later cross 6 Recruit → assert the draw fires once when 6 is reached (deferred), and does not fire a second time.

### Lady Thor — Chosen by Asgard (Common B)  (confidence: HIGH)
- **Effect text:** "Once per turn, if you made at least 6 Recruit this turn, you get +2 Attack." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Once per turn, if Recruit this turn ≥ 6, +2 Attack. Same threshold + deferred-or-immediate pattern as Mysterious Origin, granting Attack instead of a draw.
- **Engine function / pattern:** Reuse ≥6-Recruit threshold (Shared Mechanics) + deferred-flag pattern (`throgSidekickAbility` shape). On satisfaction, +2 Attack (BOTH `totalAttackPoints` + `cumulativeAttackPoints`); once-per-turn guard; `updateGameBoard()`.
- **Interaction risks:** Same once-per-turn / deferred-timing considerations as Mysterious Origin.
- **Executable assertion:** Set up: 6 Recruit this turn → play Chosen by Asgard → assert current-turn Attack +2. Second run: <6 Recruit at play, cross 6 later → assert +2 fires once at threshold.

### Lady Thor — Heir to the Hammer (Uncommon)  (confidence: HIGH) — trivial: Superpower [RANGED][STRENGTH]: +2 Attack — pure 2-icon-gated flat Attack bonus, no count/choice/draw/threshold. No assertion.

### Lady Thor — Living Thunderstorm (Rare)  (confidence: HIGH)
- **Effect text:** "Once per turn, if you made at least 6 Recruit this turn, you get +6 Attack." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Once per turn, if Recruit this turn ≥ 6, +6 Attack. Same threshold pattern, larger bonus.
- **Engine function / pattern:** Reuse ≥6-Recruit threshold (Shared Mechanics) + deferred-flag pattern. On satisfaction, +6 Attack (BOTH totals); once-per-turn guard; `updateGameBoard()`.
- **Interaction risks:** Same once-per-turn / deferred-timing as the other Lady Thor threshold cards.
- **Executable assertion:** Set up: 6 Recruit this turn → play Living Thunderstorm → assert current-turn Attack +6. Second run: <6 Recruit → assert no bonus until 6 is reached.

---

### Magik

### Magik — Rally the New Mutants (Common A)  (confidence: HIGH)
- **Effect text:** "Gain a Sidekick." / "[COVERT]: Gain another Sidekick." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special Ability: gain 1 Sidekick (to discard; no cost, no recruit-cap consumption — rules-notes 6c). Superpower (if a Covert Hero played this turn): gain a 2nd Sidekick. So 1 or 2 Sidekicks gained.
- **Engine function / pattern:** Reuse `gainSidekick()` helper (Shared Mechanics) — call once unconditionally; call a second time if the Covert superpower fires. Guard for empty Sidekick Stack.
- **Interaction risks:** Empty Sidekick Stack (gain as available). Gain ≠ recruit (don't touch `sidekickRecruited` / Recruit points).
- **Executable assertion:** Set up: Sidekick Stack ≥2, NO Covert Hero played → play Rally → assert exactly 1 Sidekick in discard, `sidekickRecruited` still false. Second run: with a Covert Hero played → assert 2 Sidekicks gained.

### Magik — Travel through Limbo (Common B)  (confidence: HIGH) — trivial: Special Ability "Teleport." (Shared Mechanics — reuse `playOrTeleport()`/Teleport keyword) + Superpower [RANGED]: +2 Attack (flat). Card-specific behavior is only the flat +2 Attack riding alongside the standard Teleport keyword; no count/choice/draw beyond Teleport itself. No assertion.

### Magik — Dimensional Portal (Uncommon)  (confidence: HIGH)
- **Effect text:** "Teleport. For each Sidekick you played this turn, you get +1 Attack." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Teleport this card (Shared Mechanics). Additionally, count Sidekick cards played this turn → +1 Attack each. (The Teleport and the count are independent; the card-specific part is the per-Sidekick Attack.)
- **Engine function / pattern:** Teleport keyword (Shared Mechanics — reuse `playOrTeleport()`). Card-specific: count `cardsPlayedThisTurn` (@ script.js:790) entries that are Sidekicks (e.g. `card.name === "Sidekick"` or a sidekick type flag); grant count × Attack (BOTH `totalAttackPoints` + `cumulativeAttackPoints`); `updateGameBoard()`.
- **Interaction risks:** Identifying "Sidekick you played this turn" — match by Sidekick card identity/type in the played-this-turn log. Teleporting this card while still resolving its Attack count: resolve the count BEFORE/independently of setting the card aside (the count is of OTHER sidekicks played, not this card). Confirm Teleport-then-still-grant ordering works (the card's ability still resolves even though the card itself is set aside).
- **Executable assertion:** Set up: play 2 Sidekick cards this turn → play Dimensional Portal → assert current-turn Attack +2 AND Dimensional Portal is set aside (Teleported) to return next turn.

### Magik — Wield the Soulsword (Rare)  (confidence: HIGH)
- **Effect text:** "Teleport. Choose a Villain or Mastermind in your Victory Pile. You get +Attack equal to its printed VP." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Teleport this card (Shared Mechanics). Then choose one Villain or Mastermind card in your Victory Pile; gain Attack equal to that card's printed VP value (e.g. a VP-5 villain → +5 Attack). If the Victory Pile has no Villain/Mastermind, no Attack (nothing to choose).
- **Engine function / pattern:** Teleport keyword (Shared Mechanics). Card-specific: card-choice popup over Victory-Pile entries of type Villain or Mastermind; read the chosen card's printed VP field; grant that many Attack (BOTH `totalAttackPoints` + `cumulativeAttackPoints`); `updateGameBoard()`.
- **Interaction risks:** Victory Pile may contain Bystanders/Heroes/Tactics — filter to Villain/Mastermind only. "Printed VP" — read the card's base VP field (mastermind/tactic VP per CLAUDE.md is usually 6; ascended villains revert to VP-6 villains). Empty-eligible-pile guard. Teleport-then-resolve ordering.
- **Executable assertion:** Set up: Victory Pile containing a VP-4 Villain → play Wield the Soulsword → choose that Villain → assert current-turn Attack +4 AND the card is Teleported. Second run: Victory Pile with no Villain/Mastermind → assert no Attack granted.

---


## Heroes B — Maximus through Ultimate Spider-Man

### Maximus

#### Maximus — Mental Domination (Common A) — (confidence: HIGH)
- **Effect text:** "[COVERT]: Defeat a Henchman Villain for free." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower (only fires if you have a [COVERT] Hero this turn). Lets the player defeat ONE Henchman-class Villain (in the city or HQ) for free — i.e. without spending Attack, but the Villain's Fight effect still triggers. Restricted to Henchman Villains only (not regular Villains or the Mastermind). If no Henchman is fightable, no-op.
- **Engine function / pattern:** "defeat a Villain for free" (see Shared Mechanics) — reuse the free-defeat machinery (cardAbilitiesDarkCity.js:2398-2426 / expansionFantasticFour.js:5683-5699 pattern: present a target choice, run the city/HQ defeat chain so the Fight effect fires). FILTER candidate targets to Henchman-class villains only. No attack-point spend.
- **Interaction risks:** Must restrict to Henchman villains (not all villains) — easy to over-grant. Must still trigger the target's Fight effect (per updatesContent.js:267 free-defeat audit). Dual-class card (Covert in classes array) feeds its own [COVERT] superpower.
- **Executable assertion:** Set up state S: a Henchman villain in the city, a regular (non-Henchman) villain also in the city, player has a [COVERT] Hero played this turn, totalAttackPoints = 0. → trigger Mental Domination superpower → assert the Henchman is offered as a free-defeat target and the regular villain is NOT; defeating it moves it to the Victory Pile, fires its Fight effect, and totalAttackPoints stays 0.

#### Maximus — Enslave the Will (Common B) — (confidence: HIGH)
- **Effect text:** "[TECH]: Whenever you defeat a Villain this turn, you gain a Sidekick." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower (requires a [TECH] Hero this turn). Sets a this-turn trigger: each time the player defeats a Villain for the rest of this turn, they gain a Sidekick (cost-free, does NOT count against the 1-Sidekick-per-turn recruit cap). Multiple defeats → multiple Sidekicks. Trigger expires at end of turn.
- **Engine function / pattern:** gainSidekick() helper (see Shared Mechanics — cost-free, cap-free, to discard). Plus a per-turn defeat-listener flag (e.g. `maximusEnslaveActive = true`) read by the villain-defeat path so each defeat this turn calls gainSidekick(). Clear the flag on turn reset.
- **Interaction risks:** Must hook the generic defeat path so it fires on ALL villain defeats this turn (city, HQ, free-defeats), not just the next one. Don't let it count against the recruit-Sidekick cap. Order vs Maximus Mental Domination free-defeat (a defeat triggered by Mental Domination should also grant a Sidekick if Enslave is active).
- **Executable assertion:** Set up state S: player has a [TECH] Hero this turn, Sidekick stack non-empty, two villains fightable. → trigger Enslave the Will superpower, then defeat two villains this turn → assert the player gained exactly 2 Sidekicks (to discard), and `sidekickRecruited` cap flag is unchanged (still able to recruit a Sidekick normally).

#### Maximus — Pieces on a Chessboard (Uncommon) — (confidence: HIGH)
- **Effect text:** "You may have a Henchman Villain from your Victory Pile enter the city. If you do, draw a card." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability. Optional ("You may"). If the player chooses a Henchman Villain from their own Victory Pile, that card leaves the Victory Pile and re-enters the city (rightmost slot, normal entry). "If you do" → only then draw 1 card. If declined or no eligible Henchman, nothing happens. Note: re-entering a defeated villain costs the player its VP (it's no longer in the Victory Pile) — intended.
- **Engine function / pattern:** card-choice-popup over the player's Victory Pile filtered to Henchman villains (Maximus "Inhuman Mastery" / Galactic Domination share VP-pile scanning; CLAUDE.md card-choice-popup pattern). On select: remove from victoryPile, route through `enterCityFromRight()` (script.js:5295). Then `drawOne()`.
- **Interaction risks:** Filter Victory Pile to Henchman villains only. Removing from Victory Pile lowers VP total — verify scoring reads live Victory Pile. Re-entering villain should be a clean copy (no stale fight/escape state) — `createVillainCopy()` whitelist if any custom flags.
- **Executable assertion:** Set up state S: player's Victory Pile contains one Henchman villain and one regular villain. → play Pieces on a Chessboard, choose the Henchman → assert the Henchman is removed from the Victory Pile, appears in the city, and the player's hand grew by 1; assert the regular villain was NOT offered.

#### Maximus — Inhuman Mastery (Rare) — (confidence: LOW)
- **Effect text:** "Each other player reveals a [TECH] Hero or chooses a Henchman Villain from their Victory Pile. You defeat all those Henchmen for free." / SUPERPOWER: "[CABAL]: You get +1 Attack for each Henchman you defeated this turn." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **RATIFIED (2026-06-24, coordinator) — SPECIAL CLAUSE = NO-OP.** The "each other player reveals/surrenders from their Victory Pile" clause pulls from OTHER players' piles = a source with no solo equivalent → NO-OP per the ratified Q1 split rule (matches expansion-decisions.md:26 + Family-9 reuse map). The Phase-2.5 example-list below miscategorized this as a self-apply candidate; the *rule* is unchanged, the frozen read was wrong. The **[CABAL] superpower DOES resolve** (it has a solo equivalent — tally Henchmen the active player defeated this turn).
- **Intended behavior:** Special ability is an "each other player" effect → in 1-player solo there are no other players, no Henchmen surrendered from other piles → the free-defeat clause has nothing to act on (announce no-op via onscreenConsole). Superpower [CABAL]: +1 Attack per Henchman the player has defeated THIS TURN (counts all henchman defeats this turn, not only ones from this card) — updates totalAttackPoints + cumulativeAttackPoints. *(Superseded self-apply reading kept for history: it would have had the active player reveal/surrender from their OWN pile — NOT the ratified behavior.)*
- **Engine function / pattern:** "each other player" solo handling (see Shared Mechanics / solo decisions) — resolve self-apply vs no-op at build, default to the precedent. Free-defeat machinery for the Henchman(s) chosen (see Maximus Mental Domination). Superpower: a this-turn henchman-defeat counter × +1 Attack → totalAttackPoints + cumulativeAttackPoints, then updateGameBoard(). new helper in expansionSecretWarsVol1.js.
- **Interaction risks:** Solo "each other player" ambiguity is the LOW-confidence driver. The superpower's "Henchmen you defeated this turn" needs a per-turn henchman-defeat tally that also captures defeats from Mental Domination / Enslave-driven defeats. Free-defeat must fire Fight effects.
- **Executable assertion (RATIFIED no-op build):** Set up state S: solo, player's Victory Pile has one Henchman villain, player has a [CABAL] + [TECH] Hero this turn. → resolve Inhuman Mastery special → assert the special does NOTHING (Henchman stays in the Victory Pile, no free-defeat, announce-no-op logged). → resolve the [CABAL] superpower → assert it adds +1 Attack per Henchman the player defeated this turn (by ANY means) to BOTH totalAttackPoints and cumulativeAttackPoints.
- **LOW reason:** still mandatory in-game /game-test — verifies the special correctly no-ops AND the [CABAL] superpower's henchman-defeat tally captures defeats from Mental Domination / Enslave (not just this card).

---

### Namor, the Sub-Mariner

#### Namor — Lead the Armies of Atlantis (Common A) — (confidence: HIGH)
- **Effect text:** "[INSTINCT]: Gain a Sidekick." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower (requires an [INSTINCT] Hero this turn). Gain one Sidekick — cost-free, does NOT count against the 1-per-turn recruit cap, goes to discard.
- **Engine function / pattern:** gainSidekick() helper (see Shared Mechanics).
- **Interaction risks:** Must not burn the recruit-Sidekick cap (`sidekickRecruited`). No-op gracefully if the Sidekick stack is empty.
- **Executable assertion:** Set up state S: player has an [INSTINCT] Hero this turn, Sidekick stack non-empty, `sidekickRecruited = false`. → trigger superpower → assert one Sidekick added to discard and `sidekickRecruited` still false.

#### Namor — Ruler of the Seas (Common B) — (confidence: HIGH)
- **Effect text:** "[STRENGTH]: You get +2, usable only against Villains on the Bridge or the Mastermind." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower (requires a [STRENGTH] Hero this turn). Grants +2 Attack restricted to fighting Villains in the Bridge city space OR the Mastermind — not usable against other city spaces / HQ villains. Position-restricted reserve attack.
- **Engine function / pattern:** restricted-attack reserve pattern — `cityReserveAttack[bridgeIndex]` (expansionFantasticFour.js:2632 / read script.js:11936) for the Bridge space, plus `mastermindReserveAttack` (expansionFantasticFour.js:4391) for the Mastermind. Must update the restricted reserves (NOT plain totalAttackPoints) and follow the attack/recruit twin-total discipline where the engine tracks cumulative.
- **Interaction risks:** "Bridge" is the What If? city space — confirm the space index/name maps in both Golden and What If? city layouts. Restricted points must not leak to other targets. Two-target restriction (Bridge villains + Mastermind) — both reserves must be granted.
- **Executable assertion:** Set up state S: player has a [STRENGTH] Hero this turn; a villain on the Bridge and a villain on a non-Bridge space. → trigger superpower → assert +2 attack is available ONLY when targeting the Bridge villain or the Mastermind, and unavailable against the non-Bridge villain.

#### Namor — Feed the Sharks (Uncommon) — (confidence: HIGH)
- **Effect text:** "You may KO a card from your hand or discard pile. If you do, draw a card." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability. Optional. Player may choose one card from hand OR discard pile to KO. "If you do" → only then draw 1 card. Declining → no draw.
- **Engine function / pattern:** card-choice-popup over hand + discard pile (CLAUDE.md "KO from discard/hand (player chooses)" → `KO1To4FromDiscard()` pattern in cardAbilities.js). On KO: route to KO pile, then `drawOne()`. Not `showHeroAbilityMayPopup` (that's Yes/No on a known card).
- **Interaction risks:** Must allow choosing from BOTH hand and discard (combined pool). "If you do" gating — no draw on decline.
- **Executable assertion:** Set up state S: player has ≥1 card in hand and ≥1 in discard, deck non-empty. → play Feed the Sharks, choose a discard-pile card to KO → assert that card is in the KO pile and the player drew exactly 1 card. Re-run declining → assert no KO and no draw.

#### Namor — Imperius Rex (Rare) — (confidence: LOW)
- **Effect text:** "Defeat a Villain for free." / SUPERPOWER: "[INSTINCT][INSTINCT][STRENGTH][STRENGTH]: Instead, defeat the Mastermind once for free." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability defeats one Villain (city or HQ) for free (no Attack spend; Fight effect fires). The superpower is a REPLACEMENT ("Instead"): if the player meets the [INSTINCT][INSTINCT][STRENGTH][STRENGTH] threshold, they may instead use this card to defeat the Mastermind once for free (one Mastermind fight toward the defeat count, no Attack spend) rather than defeating a Villain. The "Instead" timing is the either/or: the player picks Villain-defeat (always available) OR Mastermind-free-defeat (only if superpower met) — not both.
- **Engine function / pattern:** "defeat a Villain/Mastermind for free" (see Shared Mechanics). Villain branch reuses city/HQ free-defeat machinery (cardAbilitiesDarkCity.js:2398-2426). Mastermind branch reuses the mastermind free-defeat / one-fight path (mastermind defeat increments the Golden Solo 4-defeat counter / What If? Mastermind progress without Attack spend). new helper in expansionSecretWarsVol1.js wiring the either/or choice on superpower availability.
- **Interaction risks:** "Instead" replacement timing — when the superpower is met, present the player a choice (Villain-free vs Mastermind-free), don't auto-fire both. Mastermind free-defeat must respect the Golden Solo defeat counter / Final Showdown rules and not bypass them incorrectly. Must still fire the target's Fight effect (Villain) — Mastermind free-defeat semantics ("once") to confirm against rules.
- **Executable assertion:** Set up state S (superpower NOT met): a Villain in the city, totalAttackPoints = 0. → play Imperius Rex → assert only the Villain-defeat option, defeating it free (Fight fires, no Attack spent). Set up state S2 (4× the required classes present): → assert the player is offered the "instead defeat the Mastermind once for free" option; choosing it registers one Mastermind defeat with no Attack spent and does NOT also defeat a Villain.
- **LOW reason:** the special-vs-superpower "Instead" either/or replacement timing + Mastermind-free-defeat semantics ("once for free") are the subtle part (flagged in the task brief) — confirm against rules + mandatory in-game /game-test.

---

### Old Man Logan

#### Old Man Logan — Last Survivor (Common A) — (confidence: HIGH)
- **Effect text:** "[INSTINCT]: You may KO a card from your hand or discard pile. If you KO a Wound this way, draw a card." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower (requires an [INSTINCT] Hero this turn). Optional. Player may KO one card from hand OR discard pile. Conditional draw: draw 1 card ONLY IF the KO'd card was a Wound. KO a non-Wound → no draw.
- **Engine function / pattern:** card-choice-popup over hand + discard (KO1To4FromDiscard pattern, cardAbilities.js). After KO, check if the KO'd card is a Wound (e.g. name/type === "Wound") → if so `drawOne()`.
- **Interaction risks:** Draw is gated on the KO'd card BEING a Wound, not merely on a KO happening. Combined hand+discard pool.
- **Executable assertion:** Set up state S: a Wound in discard, a non-Wound in hand, [INSTINCT] Hero this turn, deck non-empty. → trigger superpower, KO the Wound → assert the Wound is in the KO pile and the player drew 1. Re-run KOing the non-Wound → assert KO occurs but NO draw.

#### Old Man Logan — Loner (Common B) — (confidence: HIGH)
- **Effect text:** "If you don't recruit any Heroes this turn, you get +2 Attack." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability with a conditional that can only be evaluated at end of turn (must know whether the player recruited any Heroes for the WHOLE turn). If, at turn end, the player recruited zero Heroes, grant +2 Attack. Recruiting a Sidekick is NOT recruiting a Hero — confirm: "any Heroes" excludes Sidekicks (Sidekick is not a Hero card). The +2 must land before the turn's attack is spent/finalized, so practically: set a deferred flag and pay out the +2 at end-of-turn if no Hero was recruited, OR re-evaluate the condition each board update.
- **Engine function / pattern:** deferred-condition pattern (mirror the "made ≥6 recruit" deferred-flag style, throgSidekickAbility cardAbilitiesSidekicks.js:213). Track "recruited a Hero this turn" boolean; at end-of-turn (or on each updateGameBoard) grant +2 Attack to totalAttackPoints + cumulativeAttackPoints if the boolean is false. new helper in expansionSecretWarsVol1.js.
- **Interaction risks:** Timing — the "no Hero recruited this turn" condition is only final at turn end, but +2 Attack must be usable during the turn. Decide: grant now and CLAW BACK if a Hero is later recruited, OR defer the grant. Sidekick recruit must not count as a Hero recruit. Must touch cumulativeAttackPoints for Final Showdown.
- **Executable assertion:** Set up state S: play Loner, recruit NOTHING (or only a Sidekick) for the rest of the turn → assert totalAttackPoints and cumulativeAttackPoints each include +2. Re-run: play Loner, then recruit a Hero from HQ → assert the +2 is NOT granted (or is clawed back).

#### Old Man Logan — Rage Out (Uncommon) — (confidence: HIGH)
- **Effect text:** "[INSTINCT]: Cross-Dimensional Wolverine Rampage. For each other player who gained a Wound this way, you get +1 Attack." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower (requires an [INSTINCT] Hero this turn). Runs Cross-Dimensional Wolverine Rampage (see Shared Mechanics): each player (= the active player in solo) reveals a Wolverine-family Hero/Victory-Pile card — Wolverine, Weapon X, or Old Man Logan — or gains a Wound. The "+1 Attack per OTHER player who gained a Wound" rider = 0 in solo (no other players). So in solo the net Attack bonus from the rider is always 0; the only effect is the self-reveal-or-Wound.
- **Engine function / pattern:** Cross-Dimensional Rampage (see Shared Mechanics) — adapt `revealClassOrWound()` (expansionRevelations.js:2329) with a Wolverine-FAMILY name predicate (substring: "Wolverine" | "Weapon X" | "Old Man Logan") scanning hand + Victory Pile; `drawWound()` if no match/decline. Rider: +1 Attack × (other players who Wounded) → 0 in solo, so no attack grant. (If implemented generically, ensure the rider math yields 0 and does not erroneously add Attack for the active player's own Wound.)
- **Interaction risks:** Solo rider must be 0 — do NOT count the active player's own Wound toward the +1-Attack rider (it's "each OTHER player"). Wolverine-family predicate must match Old Man Logan's own cards + Weapon X. Verify in BOTH modes (mode-divergent per checklist row 8).
- **Executable assertion:** Set up state S (solo): player has NO Wolverine-family Hero in hand or Victory Pile, [INSTINCT] Hero this turn. → trigger Rage Out superpower → assert the player gains a Wound (drawWound) and gains +0 Attack from the rider. Re-run with a Wolverine-family card present → assert the player may reveal it instead and gains no Wound, +0 Attack either way.

#### Old Man Logan — No More Heroes (Rare) — (confidence: LOW)
- **Effect text:** "Reveal your hand. You get +5 Attack if you haven't played any S.H.I.E.L.D. or HYDRA cards this turn and don't have any in your hand." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability. Reveal the player's current hand (the cards still in hand, not yet played). Grant +5 Attack only if BOTH conditions hold: (a) no S.H.I.E.L.D. or HYDRA card has been PLAYED this turn (scan cardsPlayedThisTurn), AND (b) no S.H.I.E.L.D. or HYDRA card is currently IN HAND. If either condition fails, no bonus. "S.H.I.E.L.D." and "HYDRA" are team/affiliation tags (from base game + Dark City) — identify by team field.
- **Engine function / pattern:** new helper in expansionSecretWarsVol1.js. Scan `cardsPlayedThisTurn` (script.js:790) for any card whose team is "S.H.I.E.L.D." or "HYDRA"; scan current hand likewise. If neither set contains one → +5 Attack to totalAttackPoints + cumulativeAttackPoints, updateGameBoard(). The "Reveal your hand" is a display/announce step (onscreenConsole).
- **Interaction risks:** Two-part AND condition (played-this-turn AND in-hand) — both must be checked. Need the canonical team strings for S.H.I.E.L.D. and HYDRA cards in cardDatabase.js — confirm exact tag values at build (could be "S.H.I.E.L.D." vs "SHIELD"). Self-reference: Old Man Logan is X-Men, doesn't self-disqualify. Must touch cumulativeAttackPoints.
- **Executable assertion:** Set up state S: player's hand has NO S.H.I.E.L.D./HYDRA card and none played this turn. → play No More Heroes → assert +5 Attack to both totalAttackPoints and cumulativeAttackPoints. Re-run with one S.H.I.E.L.D. card in hand → assert NO bonus. Re-run with a S.H.I.E.L.D. card already played this turn (none in hand) → assert NO bonus.
- **LOW reason:** the two-part condition is mechanically clear, but it depends on the exact S.H.I.E.L.D./HYDRA team-tag strings present in the DB (flagged in task brief) — needs build-time confirmation of the tag values + in-game /game-test of both fail branches.

---

### Proxima Midnight

#### Proxima Midnight — Inspiration Through Power (Common A) — (confidence: HIGH) — trivial: vanilla card, base stats only (1 Recruit + 1 Attack), no effect text. No assertion.

#### Proxima Midnight — Master Combatant (Common B) — (confidence: HIGH)
- **Effect text:** "If the most recent Hero you have played this turn has a Recruit icon, you get +2 Recruit. If it has an Attack icon, you get +2 Attack." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability. Looks at the most-recently-played Hero this turn BEFORE this card (i.e. the prior card in cardsPlayedThisTurn). If that Hero has a Recruit icon → +2 Recruit. If it has an Attack icon → +2 Attack. A card can have BOTH icons → grant both +2 Recruit AND +2 Attack. If no prior Hero played this turn, no bonus. ("most recent Hero you have played" — interpret as the most recent OTHER hero card played this turn, the one before Master Combatant.)
- **Engine function / pattern:** new helper in expansionSecretWarsVol1.js. Read `cardsPlayedThisTurn` (script.js:790), find the most recent Hero entry before this card; check its base Recruit/Attack icon presence → grant +2 Recruit (totalRecruitPoints + cumulativeRecruitPoints) and/or +2 Attack (totalAttackPoints + cumulativeAttackPoints); updateGameBoard().
- **Interaction risks:** "most recent Hero" must exclude Master Combatant itself (look at the prior played card). A card can carry both icons → both bonuses apply (not either/or). Icon presence = does the card grant base Recruit/Attack (per the card's printed icon), not whether it currently has points. Must touch both cumulative totals.
- **Executable assertion:** Set up state S: play a Hero with only an Attack icon, then play Master Combatant → assert +2 Attack (and no +2 Recruit) to totals + cumulatives. Re-run playing a Hero with BOTH icons first → assert both +2 Recruit and +2 Attack. Re-run as the first card played → assert no bonus.

#### Proxima Midnight — General of the Black Order (Uncommon) — (confidence: HIGH) — trivial: [INSTINCT] superpower → +3 Recruit. No assertion.

#### Proxima Midnight — Supernova Spear (Rare) — (confidence: HIGH) — trivial: [COVERT] superpower → +4 Recruit and +4 Attack. No assertion.

---

### Superior Iron Man

#### Superior Iron Man — Armor Upgrades (Common A) — (confidence: HIGH) — trivial: [TECH] superpower → +2 Attack. No assertion.

#### Superior Iron Man — Optimized Technology (Common B) — (confidence: HIGH) — trivial: draw a card. No assertion. *(Note: "Draw a card" uses the standard draw helper; trivial per format gate is borderline since it's a draw, but it's the plainest single-card draw with no condition — full block optional. Treating as trivial-draw; build via standard `drawOne()`/`drawCard()`.)*

#### Superior Iron Man — Superior to Others (Uncommon) — (confidence: HIGH)
- **Effect text:** "[RANGED]: Look at the top two cards of your deck. If one of them has a higher cost than the other, draw it. Put the rest back in any order." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower (requires a [RANGED] Hero this turn). Look at the top 2 cards of the player's deck. If their costs differ, draw the HIGHER-cost one into hand and put the other back on top of the deck (player chooses order — but only one card remains, so it just goes back on top). If the two costs are EQUAL, neither is "higher" → draw nothing, put both back in any order. Handle deck < 2 cards gracefully (reshuffle discard if needed, or peek what's available).
- **Engine function / pattern:** new helper in expansionSecretWarsVol1.js — deck-peek-2 + conditional draw-higher (similar in shape to Superior to Others is its own; Dr. Strange "Sorcerer Supreme" / Ultimate Spider-Man reveal-top patterns are siblings for top-of-deck reveal). Compare `card.cost`; draw the higher into hand; return the other(s) to deck top.
- **Interaction risks:** Tie case (equal cost) → draw NOTHING (no card is strictly higher) — verify the rules intent; this is the subtle branch. Deck with <2 cards (trigger reshuffle of discard into deck first, per engine's draw plumbing). "Put the rest back in any order" is trivial when one card remains.
- **Executable assertion:** Set up state S: stack the top two deck cards with costs 6 and 3, [RANGED] Hero this turn. → trigger superpower → assert the cost-6 card is drawn to hand and the cost-3 card remains on top of the deck. Re-run with two equal-cost cards on top → assert NO card is drawn and both remain on the deck.

#### Superior Iron Man — #Humblebrag (Rare) — (confidence: HIGH)
- **Effect text:** "Draw a card for each other player who has fewer cards in their Victory Pile than you." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability. "each other player" comparison → in 1-player solo there are NO other players, so the count of qualifying other players is 0 → draw 0 cards (no-op). Per the "each other player" solo precedent: this is a comparison against other players, so solo yields 0 (no-op), not self-apply. (Multiplayer reference: draw 1 per other player whose Victory Pile is smaller than yours.)
- **Engine function / pattern:** "each other player" solo handling (see Shared Mechanics / solo decisions) — count other players with fewer VP-pile cards; in solo = 0 → draw 0. new helper in expansionSecretWarsVol1.js (announce no-op via onscreenConsole).
- **Interaction risks:** Solo no-op is the key call — do NOT self-apply (you can't have fewer cards than yourself). Confirm the "each other player" precedent applies (this one is a player-count comparison → clearly 0 in solo).
- **Executable assertion:** Set up state S (solo): any Victory Pile size, deck non-empty. → play #Humblebrag → assert the player draws 0 cards (hand size unchanged).

---

### Thanos

#### Thanos — Revel in Destruction (Common A) — (confidence: HIGH)
- **Effect text:** "[CABAL]: KO a Bystander from the Bystander Stack. Then, you get +1 Recruit for every three Bystanders in the KO pile." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Superpower (requires a [CABAL] Hero this turn). KO one Bystander from the Bystander Stack (move to KO pile). THEN count total Bystanders now in the KO pile and grant +1 Recruit per complete group of 3 (floor(bystandersInKO / 3)). The KO from this card counts toward the total before the recruit calc.
- **Engine function / pattern:** new helper in expansionSecretWarsVol1.js. Pop one Bystander from the Bystander Stack to the KO pile; count Bystanders in KO pile; grant floor(count/3) Recruit → totalRecruitPoints + cumulativeRecruitPoints; updateGameBoard().
- **Interaction risks:** "+1 Recruit for every three Bystanders in the KO pile" = floor division on the running KO-pile bystander count (after this KO), not just this card's contribution. Bystander Stack empty → can't KO (no-op the KO, recruit calc still reads existing KO pile?). Must touch cumulativeRecruitPoints.
- **Executable assertion:** Set up state S: KO pile already has 5 Bystanders, Bystander Stack non-empty, [CABAL] Hero this turn. → trigger superpower → assert one Bystander moved Stack→KO pile (now 6 in KO), and +2 Recruit granted (floor(6/3)=2) to both totalRecruitPoints and cumulativeRecruitPoints.

#### Thanos — Transdimensional Overlord (Common B) — (confidence: HIGH)
- **Effect text:** "Teleport. You may KO a Bystander from your Victory Pile. If you do, you get +2 Attack." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability. First, Teleport this card (see Shared Mechanics — set aside, return to hand next turn as an extra card). Then OPTIONAL: player may KO one Bystander from their own Victory Pile. "If you do" → +2 Attack. Declining the KO → no Attack. (KOing a Bystander from your Victory Pile costs you 1 VP — intended tradeoff.)
- **Engine function / pattern:** Teleport keyword (see Shared Mechanics — `teleport()` cardAbilitiesDarkCity.js:3767). Then card-choice-popup over Bystanders in the player's Victory Pile (showHeroAbilityMayPopup is acceptable here if it's a yes/no to KO a known/auto-selected Bystander; if multiple Bystanders, use card-choice-popup). On KO: move Bystander to KO pile, grant +2 Attack → totalAttackPoints + cumulativeAttackPoints.
- **Interaction risks:** Teleport ordering — the card teleports regardless of the KO choice (Teleport is unconditional; the KO is the "may"). KO from Victory Pile reduces VP. "If you do" gates the +2 Attack. Must touch cumulativeAttackPoints.
- **Executable assertion:** Set up state S: player's Victory Pile contains a Bystander. → play Transdimensional Overlord, accept the KO → assert the card is teleported (queued for next turn's hand), the Bystander is in the KO pile, and +2 Attack to both totalAttackPoints and cumulativeAttackPoints. Re-run declining the KO → assert card still teleports but no Bystander KO and no +2 Attack.

#### Thanos — Galactic Domination (Uncommon) — (confidence: HIGH)
- **Effect text:** "[RANGED]: Each other player reveals a [RANGED] Hero or chooses a Bystander from their Victory Pile. You "rescue" those Bystanders." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **RATIFIED (2026-06-24, coordinator) — NO-OP.** The "each other player reveals/surrenders a Bystander from their Victory Pile" clause pulls from OTHER players' piles = a source with no solo equivalent → NO-OP per the ratified Q1 split rule (matches expansion-decisions.md:26 + Family-9 reuse map). The whole card is this superpower clause, so in solo it does nothing. Frozen read below miscategorized it as a self-apply candidate; the *rule* is unchanged.
- **Intended behavior:** Superpower [RANGED] whose entire body is an "each other player" effect → in 1-player solo there are no other players to surrender Bystanders → nothing to rescue. Announce no-op via onscreenConsole. *(Superseded self-apply reading kept for history: it would have had the active player reveal/surrender from their OWN pile — NOT the ratified behavior.)*
- **Engine function / pattern:** "each other player" solo handling (see Shared Mechanics / solo decisions). If self-apply: revealClassOrWound-style reveal of a [RANGED] Hero OR Victory-Pile Bystander choice; on Bystander surrender, route through the standard rescue-Bystander path for the active player. new helper in expansionSecretWarsVol1.js.
- **Interaction risks:** Solo "each other player" ambiguity (self-apply vs no-op) — but lower stakes than Maximus/Thanos free-defeat cards since it only moves a Bystander. "Rescue" gives the rescuer the Bystander's rescue benefit (e.g. Banker's +2 restricted Recruit). Mode-divergent (row 8).
- **Executable assertion (RATIFIED no-op build):** Set up state S (solo): player's Victory Pile has a Bystander, [RANGED] Hero this turn. → trigger superpower → assert NOTHING happens (Bystander stays in the Victory Pile, no rescue, announce-no-op logged).

#### Thanos — Utter Annihilation (Rare) — (confidence: LOW)
- **Effect text:** "KO six Bystanders from the Bystander Stack. Then, defeat any Villain or Mastermind whose Attack is less than the number of Bystanders in the KO pile." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability. Sequencing: (1) KO six Bystanders from the Bystander Stack into the KO pile (if fewer than 6 remain, KO as many as available). (2) THEN count total Bystanders in the KO pile. (3) Defeat for free ONE Villain (city/HQ) OR the Mastermind whose current Attack value is strictly LESS than that KO-pile Bystander count. The free-defeat fires the target's Fight effect (Villain) / counts as a Mastermind defeat. Player chooses among eligible targets. If no eligible target (all Attacks ≥ count), no defeat.
- **Engine function / pattern:** new helper in expansionSecretWarsVol1.js. Pop up to 6 Bystanders Stack→KO pile; count KO-pile Bystanders; build the eligible-target list (city villains + HQ villains + Mastermind with current/modified Attack < count); present card-choice; free-defeat the chosen target via the "defeat a Villain/Mastermind for free" machinery (see Shared Mechanics). Mastermind defeat must register toward the Golden Solo 4-defeat counter / What If? progress without Attack spend.
- **Interaction risks:** Sequencing matters — KO the 6 FIRST so the count includes them, then evaluate Attack thresholds. "Attack" = the current/modified attack value (read the live attackFrom* fields, not base card art — per CLAUDE.md attack pipeline). Strictly less-than (not ≤). Free-defeat must fire Fight effects (Villain) and respect Mastermind defeat rules. Bystander Stack with <6 → KO what's available. Mode-relevant for the Mastermind free-defeat (Golden 4-defeat vs What If?).
- **Executable assertion:** Set up state S: Bystander Stack has ≥6, KO pile starts empty, a Villain with current Attack 4 in the city and a Villain with Attack 8 in the city. → play Utter Annihilation → assert exactly 6 Bystanders moved Stack→KO pile (KO count 6), the Attack-4 villain is offered as a free-defeat target and the Attack-8 villain is NOT (8 not < 6), and defeating the Attack-4 villain fires its Fight effect with no Attack spent.
- **LOW reason:** KO-then-defeat sequencing + reading the LIVE (modified) Attack value for the threshold + the Mastermind free-defeat semantics make this the most error-prone of the set (flagged in task brief) — mandatory in-game /game-test, both modes for the Mastermind branch.

---

### Ultimate Spider-Man

#### Ultimate Spider-Man — Marvel Team-Up (Common A) — (confidence: HIGH)
- **Effect text:** "Gain a Sidekick. Reveal the top card of your deck. If it costs 2 or less, draw it." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability, two parts. (1) Gain a Sidekick (cost-free, cap-free, to discard — see Shared Mechanics gainSidekick). (2) Reveal the top card of the deck; if its cost ≤ 2, draw it into hand; otherwise leave it on top (revealed, not drawn).
- **Engine function / pattern:** gainSidekick() helper (see Shared Mechanics). Then a reveal-top-and-conditional-draw (sibling: Ultimate Spider-Man's other cards + Wasteland Spider-Girl reveal-top pattern; reveal top of deck, check `card.cost <= 2`, `drawOne()` if so).
- **Interaction risks:** gainSidekick must not burn the recruit cap. The cost-2-or-less draw reads the revealed top card's cost; if not drawn it stays on top (revealed). Deck-empty edge (reshuffle).
- **Executable assertion:** Set up state S: top deck card costs 2, Sidekick stack non-empty. → play Marvel Team-Up → assert one Sidekick gained (to discard, cap flag unchanged) AND the cost-2 card drawn to hand. Re-run with top card cost 4 → assert Sidekick gained but the card NOT drawn (remains on top).

#### Ultimate Spider-Man — Leaping Spider (Common B) — (confidence: HIGH)
- **Effect text:** "Reveal the top card of your deck. If it costs 2 or less, draw it." / SUPERPOWER: "[STRENGTH]: You get +2 Attack." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability: reveal top deck card; if cost ≤ 2, draw it (else leave on top). Superpower [STRENGTH]: +2 Attack (vanilla, only if a [STRENGTH] Hero this turn).
- **Engine function / pattern:** reveal-top-and-conditional-draw (same pattern as Marvel Team-Up part 2). Superpower is trivial +2 Attack (totalAttackPoints + cumulativeAttackPoints).
- **Interaction risks:** Cost-2-or-less gate on the draw; non-drawn card stays revealed on top. Superpower trivial.
- **Executable assertion:** Set up state S: top deck card costs 1. → play Leaping Spider → assert the cost-1 card is drawn. Re-run with top card cost 3 → assert NOT drawn (stays on top).

#### Ultimate Spider-Man — Web-Slinger (Uncommon) — (confidence: HIGH)
- **Effect text:** "You get +2 Attack usable only against the Mastermind or Villains on the Rooftops or Bridge. Reveal the top card of your deck. If it costs 2 or less, draw it." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability, two parts. (1) +2 Attack restricted to the Mastermind OR Villains in the Rooftops/Bridge city spaces (position-restricted reserve attack — not usable elsewhere). (2) Reveal top deck card; if cost ≤ 2, draw it (else leave on top).
- **Engine function / pattern:** restricted-attack reserve (cityReserveAttack[rooftopsIdx], cityReserveAttack[bridgeIdx], mastermindReserveAttack — expansionFantasticFour.js:2632/4391 pattern) for part 1; reveal-top-and-conditional-draw for part 2.
- **Interaction risks:** Restricted +2 applies to THREE possible targets (Mastermind + two city spaces) — all three reserves must be granted. Confirm Rooftops/Bridge space indices in both Golden + What If? layouts. Reserve points must not leak to other targets.
- **Executable assertion:** Set up state S: a villain on the Rooftops, a villain on a non-Rooftops/non-Bridge space, top deck card cost 2. → play Web-Slinger → assert +2 attack available against the Rooftops villain and the Mastermind but NOT the other villain, AND the cost-2 card is drawn.

#### Ultimate Spider-Man — Hero from Another Dimension (Rare) — (confidence: HIGH)
- **Effect text:** "You get +2 Attack for each other card you have played this turn that costs 1 or 2." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Special ability. Count the OTHER cards the player has played this turn (excluding this card) whose printed cost is 1 or 2; grant +2 Attack per such card. (Cards with no cost / cost 0 do not count; only cost-1 and cost-2.)
- **Engine function / pattern:** new helper in expansionSecretWarsVol1.js. Filter `cardsPlayedThisTurn` (script.js:790) to cards with `cost === 1 || cost === 2`, EXCLUDING this card itself; grant 2 × count Attack → totalAttackPoints + cumulativeAttackPoints; updateGameBoard().
- **Interaction risks:** "each OTHER card" — exclude Hero from Another Dimension itself from the count. Only cost exactly 1 or 2 (note: most Secret Wars Ultimate Spider-Man cards cost 2, so this self-synergizes). Must touch cumulativeAttackPoints. Sidekicks (cost 2) played this turn would count if they're "cards played."
- **Executable assertion:** Set up state S: player has already played 3 cards this turn costing 2, 2, and 5. → play Hero from Another Dimension → assert +4 Attack (two qualifying cost-1-or-2 cards × +2; the cost-5 excluded; itself excluded) to both totalAttackPoints and cumulativeAttackPoints.

---

---


## Villains, Henchmen, Bystander

## Domain of Apocalypse

### Domain of Apocalypse — Apocalyptic Blink  (confidence: HIGH)
- **Effect text:** "Fight: Reveal the top card of your deck. Draw it or Teleport it." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** On fight (active player only — solo, no "each player" wording), reveal `playerDeck` top card. Pop a two-button choice: **Draw it** (move to hand) or **Teleport it** (set aside → enters next turn's hand as a bonus card via the Teleport keyword). Empty deck → reshuffle discard per existing draw plumbing, or no-op if both empty.
- **Engine function / pattern:** New `apocalypticBlinkFight(villainCard)`. Reuse the **Teleport keyword** mechanic — call the existing `teleport()` (@ cardAbilitiesDarkCity.js:3767) for the Teleport branch; for the Draw branch use the standard draw helper (`drawOne()`/equivalent). This is essentially `Dr. Strange "Cloak of Levitation"` ("Reveal top card of your deck. Draw it or Teleport it") — share the same reveal-then-draw-or-teleport helper. No createVillainCopy whitelist needed (reads no ambush state).
- **Interaction risks:** Teleported card must route through the real `teleport()` so end-of-turn `drawOne()` priority on `cardsToBeDrawnNextTurn` fires; do NOT just `playerDeck.unshift()`. Off-pipeline fight: save/null/restore `currentVillainLocation` is unnecessary here (effect reads no city position).
- **Executable assertion:** Stack `playerDeck` top = a known Hero H. Trigger `apocalypticBlinkFight`, choose **Draw** → assert H now in `playerHand`, removed from deck top. Re-run, choose **Teleport** → assert H removed from deck, queued in `cardsToBeDrawnNextTurn` (or equivalent), and present in hand at start of next turn.

### Domain of Apocalypse — Apocalyptic Magneto  (confidence: LOW)
- **Effect text:** "Fight: Gain an X-Men Hero from the HQ for free. / Escape: Magneto ascends to become a new Mastermind. He gains the ability, 'Master Strike: Each player reveals an X-Men Hero or discards down to four cards.' Attack: 8 | VP: 6" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:**
  - **Fight:** Player chooses one X-Men-team Hero currently in the HQ and gains it for free (no Recruit cost) to the **discard pile** (standard "gain a Hero from HQ" destination), then refill that HQ slot. If no X-Men Hero is in the HQ → no-op (announce). "For free" = bypass recruit cost entirely.
  - **Escape:** Magneto **ascends** — register a second active Mastermind via the SHARED Multiple-Masterminds KEYSTONE. Ascended form: **no Tactics**, defeat = **one fight at printed villain Attack 8**, granted ability **"Master Strike: Each player reveals an X-Men Hero or discards down to four cards"** (solo: active player resolves it — reveal an X-Men Hero or discard down to 4). Once defeated it goes to the Victory Pile as a normal **VP-6 villain**. Win now requires defeating this Mastermind in addition to the main one (Golden Solo: additional must-kill gate, outside Final Showdown math; What If? Solo: per What If? p.19).
- **Engine function / pattern:** Fight = new `apocalypticMagnetoFight(villainCard)` — card-choice popup over HQ slots filtered `team === "X-Men"`, gain-for-free to discard + refill slot (reuse "gain a Hero from HQ for free" prior art, e.g. Revert to Bruce Banner's "gain a [TECH] Hero from the HQ for free" — same operation, different filter). Escape = `apocalypticMagnetoEscape(villainCard)` → **calls the SHARED keystone's `ascendToMastermind(...)` registration helper** (lead-owned), passing: granted Master Strike fn (the X-Men-reveal-or-discard-to-4), defeat value = printed Attack 8, no tactics, VP 6 on eventual defeat. Whitelist any ascension flag the keystone sets at escape time in `createVillainCopy()`.
- **Interaction risks:** **DEPENDS ON UN-BUILT KEYSTONE** — the entire ascension half cannot be implemented until Multiple-Masterminds support exists; this is the keystone's primary in-scope consumer. The granted Master Strike's "Each player" → active-player self-apply in solo (reveal X-Men Hero or discard down to 4). Golden-Solo win-condition wiring (second must-kill gate, NOT folded into Final Showdown combined-points math) is the riskiest seam — verify in BOTH modes. Ascended Magneto must convert to a plain VP-6 villain on defeat (reuse the `skrulled`-style VP routing, but routed to Victory Pile, not discard).
- **LOW confidence — why:** ascension depends on the un-built keystone; Golden-Solo design adaptation (additional gate outside Showdown math) is ours, not rulebook-defined; "defeat at printed Attack 8 / one fight / no tactics" is imported from What If? p.19 (sister set), pending the minor physical Pass-3 confirm flagged in mechanics Open Question 3.
- **Executable assertion:** *Fight:* Put an X-Men Hero X and a non-X-Men Hero in the HQ. Trigger `apocalypticMagnetoFight`, choose X → assert X in `playerDiscardPile`, that HQ slot refilled, no Recruit deducted. *Escape (once keystone exists):* Trigger `apocalypticMagnetoEscape` → assert a second mastermind object is now active with the granted Master Strike and defeat value 8; trigger a Master Strike → assert BOTH masterminds' strikes resolve; defeat the ascended one with Attack ≥ 8 (one fight) → assert it lands in Victory Pile as a VP-6 villain and the win-check now counts both masterminds.

### Domain of Apocalypse — Apocalyptic Rogue  (confidence: HIGH)
- **Effect text:** "Fight: Reveal the top card of the Hero deck. The player of your choice gains it. / Escape: Reveal the top card of the Hero deck. Each player reveals their hand and discards a card of that class. Attack: 6 | VP: 4" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:**
  - **Fight:** Reveal top card of `heroDeck`. "The player of your choice gains it" → in solo, the only player is the active player, so the active player gains the revealed Hero to their **discard pile**. Announce it. (No HQ refill — this is the Hero deck top, not an HQ slot.)
  - **Escape:** Reveal top card of `heroDeck` to determine a **class**. "Each player reveals their hand and discards a card of that class" → solo: the active player reveals hand and must discard one hand card whose class matches the revealed card's class (if any; if none match, no discard). The revealed Hero deck card goes back / is handled per "reveal" (returns to top unless rules say otherwise — it is only revealed to name a class; put it back on top of the Hero deck).
- **Engine function / pattern:** New `apocalypticRogueFight(villainCard)` (peek `heroDeck` top, gain to active player's discard) and `apocalypticRogueEscape(villainCard)` (peek `heroDeck` top → its class; scan `playerHand` for a card with that class; force-discard one match via the discard-from-hand path). For the class-match discard, reuse the class-membership check (`hasClass(card, wanted)` @ expansionFantasticFour.js:73) and route the discard through `checkDiscardForInvulnerability()` (the engine-correct discard-from-hand path) rather than a raw `playerDiscardPile.push()`.
- **Interaction risks:** "discards a card of that class" is mandatory if a match exists (not "may"); pick-popup if multiple matches. The revealed Hero-deck card must be returned to the top of `heroDeck` after reading its class (it is not gained on Escape). Dual-class cards count for either class — use `hasClass`, not `classes[0]`.
- **Executable assertion:** *Fight:* Set `heroDeck` top = Hero H. Trigger fight → assert H gained to `playerDiscardPile`, removed from deck top. *Escape:* Set `heroDeck` top = a Covert Hero; put a Covert card C and a non-Covert card in `playerHand`. Trigger escape → assert C discarded (or a forced choice among Covert cards), revealed card back on `heroDeck` top, non-Covert card untouched.

### Domain of Apocalypse — Apocalyptic Weapon X  (confidence: HIGH)
- **Effect text:** "Fight: KO one of your Heroes. / Escape: Cross-Dimensional Wolverine Rampage. Attack: 7 | VP: 5" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:**
  - **Fight:** Player chooses one of their own Heroes (from hand — "one of your Heroes" = a played/hand Hero; follow the existing "KO one of your Heroes" precedent `FightKOHeroYouHave`) and KOs it. Mandatory if the player has any Hero to KO.
  - **Escape:** **Cross-Dimensional Wolverine Rampage** (SHARED mechanic). Solo "each player" = active player: reveal a Wolverine-family Hero/Victory-Pile card (name contains "Wolverine", "Weapon X", or "Old Man Logan") or gain a Wound.
- **Engine function / pattern:** Fight = reuse `FightKOHeroYouHave(source)` (@ cardAbilities.js; pass source name "Apocalyptic Weapon X"). Escape = `apocalypticWeaponXEscape(villainCard)` → **call the SHARED Cross-Dimensional Rampage helper** with the Wolverine family predicate.
- **Interaction risks:** `FightKOHeroYouHave` had a hardcoded "Super-Skrull" title and an empty-`koPile` softlock — confirm both are fixed (parameterized title + empty-pile guard) before reuse. Rampage: ensure the scanned pool includes the Victory Pile (Apocalyptic Weapon X itself, once in VP, is a "Weapon X" card and satisfies the rampage). Family substring match must be case-insensitive.
- **Executable assertion:** *Fight:* Put Heroes in hand, trigger fight → assert one Hero moved to `koPile` via the picker. *Escape:* Put a Hero named e.g. "Old Man Logan" in hand → trigger escape → assert reveal-or-wound choice offered and revealing it satisfies the rampage (no Wound). Remove all Wolverine-family cards → trigger escape → assert a Wound is drawn (`drawWound`).

---

## Limbo

### Limbo — Inferno Colossus  (confidence: HIGH)
- **Effect text:** "Ambush: The Mastermind captures a Bystander. / Fight: KO one of your Heroes. Attack: 5 | VP: 3" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:**
  - **Ambush:** The Mastermind captures a Bystander (from the Bystander stack / villain-deck flow per existing "Mastermind captures a Bystander" plumbing — the bystander attaches to the Mastermind, not to Colossus). With multiple masterminds in play (Magneto/Dark Alliance), "the Mastermind" → player chooses which; in the common single-mastermind case, the main mastermind.
  - **Fight:** KO one of your own Heroes (mandatory if able). Same as Apocalyptic Weapon X fight.
- **Engine function / pattern:** Ambush = `infernoColossusAmbush(villainCard)` → reuse the existing **"Mastermind captures a Bystander"** plumbing (the capture-onto-Mastermind path the engine already has for masterminds/tactics that capture bystanders). Fight = reuse `FightKOHeroYouHave("Inferno Colossus")`. No custom ambush state on the villain card itself (bystander goes to the Mastermind), so no `createVillainCopy` whitelist needed for the Fight.
- **Interaction risks:** Distinguish from Inferno Cyclops: Colossus's bystander goes to **the Mastermind**, NOT onto Colossus — so Colossus carries no captured bystander and its escape (none) wouldn't transfer anything. With the keystone live, "the Mastermind" target needs the multi-mastermind picker.
- **Executable assertion:** Trigger `infernoColossusAmbush` → assert the Mastermind's captured-bystander count increments by 1 and the Bystander source decrements. Fight: assert a Hero is KO'd via picker.

### Limbo — Inferno Cyclops  (confidence: LOW)
- **Effect text:** "Ambush: Inferno Cyclops captures a Bystander. / Escape: The Mastermind captures all the Bystanders this Villain had. *(Players still discard for the Bystander being carried away.)* Attack: 6 | VP: 4" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:**
  - **Ambush:** **Inferno Cyclops itself** captures a Bystander — the bystander attaches to THIS villain card (`capturedBystanders[]` on the Cyclops object), like Klaw/Revelations bystander-capture-onto-entity.
  - **Escape:** Transfer ALL bystanders Cyclops is carrying to the Mastermind (the Mastermind captures them). The parenthetical "Players still discard for the Bystander being carried away" = the standard captured-bystander "discard a card when a bystander escapes/is carried away" penalty still applies in solo to the active player, per the base captured-bystander-escape rule — apply it once per carried bystander (or per the engine's existing carry-away discard count).
  - **Fight (not printed → defeat):** On a normal defeat of Cyclops, the carried bystanders are **rescued** to the player's Victory Pile via the standard rescue-on-defeat path (it has no Fight effect, so default defeat handling rescues its captured bystanders).
- **Engine function / pattern:** Ambush = `infernoCyclopsAmbush(villainCard)` → reuse `captureBystanderFromVPToLocation`-style capture, pushing onto `villainCard.capturedBystanders[]`. **Whitelist `capturedBystanders` in `createVillainCopy()`** (ambush state set on the city copy; the escape copy must carry it — follow the `bystander: [...(villainCard.bystander || [])]` array-copy pattern). Escape = `infernoCyclopsEscape(villainCard)` → move each entry of `villainCopy.capturedBystanders` to the Mastermind's captured set, then apply the carry-away discard penalty (reuse the existing bystander-escape discard logic).
- **Interaction risks:** **Whitelist gap is the classic createVillainCopy trap** — if `capturedBystanders` isn't whitelisted, the escape copy is stripped and transfers nothing. The carry-away discard ("players still discard") must still fire even though the bystander goes to the Mastermind rather than escaping the game — confirm the discard count matches the number carried. With multi-mastermind live, "the Mastermind" target needs the picker. Verify normal-defeat rescue still returns carried bystanders to the Victory Pile (default path), since this card has no Fight effect.
- **LOW confidence — why:** the "Mastermind captures all the bystanders this villain had" + "players still discard for the carried-away bystander" combination is novel (capture-transfer on escape, not a clean rescue or escape), and the solo handling of the discard penalty needs confirmation against the base captured-bystander-escape rule.
- **Executable assertion:** Ambush twice → assert `cyclops.capturedBystanders.length === 2`. Force escape → assert all 2 moved to the Mastermind's captured set, `cyclops.capturedBystanders` empty, and the active player discards the carry-away count. Separately: defeat Cyclops carrying a bystander → assert it is rescued to the Victory Pile (not lost).

### Limbo — Inferno Darkchilde  (confidence: HIGH)
- **Effect text:** "Fight: Reveal the top card of your deck. KO it or Teleport it. / Escape: Each player Teleports a random card from their hand. Attack: 5 | VP: 3" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:**
  - **Fight:** Reveal top card of `playerDeck`. Choice: **KO it** (to `koPile`) or **Teleport it** (set aside → next turn's hand as bonus card). Empty deck → reshuffle/no-op.
  - **Escape:** "Each player Teleports a random card from their hand" → solo: the active player Teleports ONE randomly-chosen card from their current hand (it leaves hand now, returns as a bonus card at end of next turn via Teleport). If hand empty, no-op.
- **Engine function / pattern:** Fight = `infernoDarkchildeFight(villainCard)` — reveal `playerDeck` top, two-button KO/Teleport (reuse `teleport()` for the Teleport branch; `koPile.push` for KO — route discard/KO appropriately). Escape = `infernoDarkchildeEscape(villainCard)` — pick a random index from `playerHand`, call `teleport()` on it.
- **Interaction risks:** Teleport must use the real keyword path so the card returns next turn (not just deck-top). "Random card" = engine-chosen random index, not player choice. KO path goes to `koPile` (KO ≠ discard).
- **Executable assertion:** *Fight:* deck top = card C; choose KO → assert C in `koPile`. Re-run, choose Teleport → assert C queued for next turn's hand. *Escape:* hand = [A,B,C]; trigger escape → assert exactly one of them removed from hand and queued via Teleport.

### Limbo — Inferno Nightcrawler  (confidence: HIGH)
- **Effect text:** "Fight: Up to two cards in your hand that have a Recruit icon gain Teleport this turn. Attack: 4 | VP: 2" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** On fight, the player may select **up to two** cards currently in hand that have a Recruit icon (i.e. a printed Recruit value / Recruit-granting card); each selected card **gains the Teleport keyword for this turn** (so the player may set it aside to return as a bonus card next turn). "Up to two" → 0, 1, or 2 allowed. Cards without a Recruit icon are ineligible.
- **Engine function / pattern:** `infernoNightcrawlerFight(villainCard)` — multi-select (cap 2) over `playerHand` filtered to Recruit-icon cards. For each selected card, apply the **grant-Teleport-to-another-card** pattern from Azazel (@ cardAbilitiesDarkCity.js:11940): `card.keywords.push("Teleport"); card.temporaryTeleport = true;` — the engine's existing temp-keyword cleanup (@ cardAbilitiesDarkCity.js:3772) removes it after resolution / end of turn.
- **Interaction risks:** Eligibility filter must detect a Recruit icon correctly (cards with `recruit > 0` or a Recruit-granting superpower — match how the inventory denotes a Recruit icon; some cards are "0+" Recruit which still counts as having the icon). Multi-select by object identity, not `card.id` (duplicate-named cards). Temp-Teleport cleanup must fire so the keyword doesn't persist past the turn.
- **Executable assertion:** Put two Recruit-icon Heroes and one non-Recruit Hero in hand. Trigger fight, select both Recruit-icon cards → assert each now has "Teleport" in `keywords` and `temporaryTeleport === true`; the non-Recruit card is unselectable. End the turn → assert the temporary Teleport keyword is cleaned off.

---

## Manhattan (Earth-1610) — all "Fight: Gain this as a Hero" (inverted-Skrull converter)

> Shared pattern for all four: on Fight, instead of pushing to the Victory Pile, **convert the villain card to its Hero form** and route to the player's discard pile (gained as a Hero). These cards have **no VP** — the defeat handler must **skip the VP push** (key off a `skrulled`-style flag the four defeat handlers already check @ script.js:13360). Reuse `gainScarletWitchAsHero()` @ expansionRevelations.js:3481 as the converter template (flip `type` Villain→Hero, restore printed value, clear `fightEffect`, push to `playerDiscardPile`). Set the gained Hero's **cost = old villain Attack value** (rules: gained-as-Hero cards use their old Villain Attack as cost). **Whitelist the gain-as-hero flag in `createVillainCopy()`.** Hero-form stats below are from inventory Section 1 (Manhattan hero-stats table).

### Manhattan — Ultimate Captain America  (confidence: RESOLVED — was LOW; Finding G ruling 2026-06-24)
- **Effect text:** "Fight: Gain this as a Hero. Attack: 6 (Villain) → Hero: Avengers / Strength / 0+ Attack, 'You get +1 Attack for each color of Hero you have'" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **RULING (Finding G, rules-notes BATCH 3):** Ultimate Captain America is a **reskin of Core "Captain America – Perfect Teamwork"** — identical effect, already shipped + tested. "Color of Hero you have" = count DISTINCT Hero colors across your **HAND + Artifacts + play area this turn** (NOT play-only; **includes Ultimate Cap itself**); only 5 colors exist so the +5 cap is implicit.
- **Intended behavior:** On Fight, convert to Hero form: **Team Avengers, Class Strength, base 0+ Attack**, ability = count distinct Hero colors across hand+artifacts+play (incl. itself) → that many +Attack. Cost as a Hero = 6 (old villain Attack). Skip VP push; route to discard.
- **Engine function / pattern:** `ultimateCaptainAmericaFight(villainCard)` → `gainVillainAsHero` converter with `unconditionalAbility: "CaptainAmericaCountUniqueColorsAndAddAttack"` (the shipped Core counter @ cardAbilities.js — REUSE, do NOT build a bespoke counter). `team:"Avengers"`, `classes:["Strength"]`, `color:"Green"`, `cost:6`, `attack:0`, `attackIcon:true`.
- **Interaction risks:** **gain-as-hero must SKIP the VP push** (no VP — stray push grants phantom VP). The count ability resolves only when the card is later PLAYED as a Hero, via the engine play-flow. The Core counter already updates BOTH attack totals (twin rule).
- **Resolution note:** Was LOW (the original guess was play-only; corrected to hand+play+self per the Core-reskin ruling). Now reuses proven Core code.
- **Executable assertion:** Fight Ultimate Captain America → assert it is NOT in the Victory Pile, IS in `playerDiscardPile`, now `type:"Hero"`, `team:"Avengers"`, `classes` includes "Strength", `cost === 6`, `unconditionalAbility === "CaptainAmericaCountUniqueColorsAndAddAttack"`. Later play it (it is in play, color Green) with cards of 2 OTHER distinct colors split across hand + play → assert +3 Attack (3 distinct colors counted across hand+play incl. itself), both attack totals.

### Manhattan — Ultimate Captain Marvel  (confidence: LOW)
- **Effect text:** "Fight: Gain this as a Hero. Attack: 4 (Villain) → Hero: Avengers / Ranged / 2 Recruit, 'Teleport'" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Convert to Hero: **Team Avengers, Class Range, base 2 Recruit**, ability **Teleport** (when later played, the player may Teleport it). Cost as Hero = 4. Skip VP; route to discard.
- **Engine function / pattern:** `ultimateCaptainMarvelFight(villainCard)` → converter as above with `classes:["Range"]`, `recruit:2`, `cost:4`, and the **Teleport keyword** on the hero form (reuse the Teleport keyword mechanic — the card simply has Teleport when played).
- **Interaction risks:** Class string must be `"Range"` not `"Ranged"` (CLAUDE.md DB convention). Teleport on a gained hero must function via the standard `playOrTeleport()` path when played. Skip VP push.
- **LOW confidence — why:** inverted-Skrull pattern (shared LOW reason across Manhattan).
- **Executable assertion:** Fight Ultimate Captain Marvel → assert gained to discard, `type:"Hero"`, `classes` includes "Range", `recruit === 2`, `cost === 4`, Teleport keyword present; NOT in Victory Pile.

### Manhattan — Ultimate Thor  (confidence: LOW)
- **Effect text:** "Fight: Gain this as a Hero. / Escape: Cross-Dimensional Thor Rampage. Attack: 7 (Villain) → Hero: Avengers / Ranged / 3+ Attack, '[RANGED]: You get +3 Attack'" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:**
  - **Fight:** Convert to Hero: **Team Avengers, Class Range, base 3+ Attack**, superpower **"[RANGED]: You get +3 Attack"** (when later played, if another Range Hero played this turn / Range symbol present, +3 Attack). Cost as Hero = 7. Skip VP; route to discard.
  - **Escape:** **Cross-Dimensional Thor Rampage** (SHARED mechanic) — solo active player reveals a "Thor"-family card (name contains "Thor") in Heroes/Victory Pile or gains a Wound.
- **Engine function / pattern:** Fight = `ultimateThorFight(villainCard)` converter (`classes:["Range"]`, base 3+ attack, `cost:7`, install the `[RANGED]: +3 Attack` superpower). Escape = `ultimateThorEscape(villainCard)` → **call the SHARED Cross-Dimensional Rampage helper** with the Thor family predicate ("Thor"). Whitelist the gain-as-hero flag in `createVillainCopy()`.
- **Interaction risks:** Same VP-skip + whitelist risks as the other Manhattan cards. Thor Rampage family predicate is just "Thor" substring (no extra aliases, unlike Wolverine/Hulk). Ultimate Thor and Lady Thor / Thor Corps all satisfy the Thor rampage — confirm name-substring scan catches them. The card has BOTH a Fight converter and an Escape rampage — keep them independent (escape doesn't convert).
- **LOW confidence — why:** inverted-Skrull pattern; plus the Escape adds the Thor-family rampage (the rampage itself is shared/HIGH, but the dual fight+escape on a convert card is novel).
- **Executable assertion:** *Fight:* convert → assert gained-as-hero (discard, `type:"Hero"`, "Range", `cost===7`, the [RANGED]+3 superpower), NOT in Victory Pile. *Escape:* with a "Thor"-named card revealable → assert reveal-or-wound choice; with none → assert a Wound drawn.

### Manhattan — Ultimate Wasp  (confidence: LOW)
- **Effect text:** "Fight: Gain this as a Hero. Attack: 5 (Villain) → Hero: Avengers / Covert / 2+ Attack, '[COVERT]: You get +2 Attack'" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Convert to Hero: **Team Avengers, Class Covert, base 2+ Attack**, superpower **"[COVERT]: You get +2 Attack"**. Cost as Hero = 5. Skip VP; route to discard.
- **Engine function / pattern:** `ultimateWaspFight(villainCard)` → converter with `classes:["Covert"]`, base 2+ attack, `cost:5`, install the `[COVERT]: +2 Attack` superpower. Reuse the `skrulled`-style VP-bypass; whitelist the flag in `createVillainCopy()`.
- **Interaction risks:** Same VP-skip + whitelist risks. The [COVERT] superpower resolves on later play, not at gain.
- **LOW confidence — why:** inverted-Skrull pattern (shared).
- **Executable assertion:** Fight Ultimate Wasp → assert gained to discard, `type:"Hero"`, "Covert", `cost===5`, the [COVERT]+2 superpower present; NOT in Victory Pile.

---

## Sentinel Territories — "alters/changes the future" delayed effects

> Common theme: these Fight/Escape effects schedule a bonus or penalty for **the next turn** (delayed). In 1-player solo "the next player's turn" / "the next player" = **the active player's own next turn** (no other players) — apply per the "each other player → do it yourself" solo precedent. Implement via a deferred-flag consumed at the start of the player's next turn (engine's existing next-turn-flag pattern; verify a consumer pass exists in the turn-start/`endTurn` path before shipping any deferred flag — dead-flag risk per engine-gotchas "Counters / state lifecycle").

### Sentinel Territories — Colossus of Future Past  (confidence: HIGH)
- **Effect text:** "Fight: *Colossus changes the future:* Don't play a Villain card at the beginning of next turn. Attack: 5 | VP: 3" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** On fight, set a flag so that **the villain-card draw step at the start of the next turn is skipped** (one fewer villain enters). In Golden Solo the round normally draws 2 villain cards — interpret "don't play a Villain card" as **skip one** of next turn's villain draws (reduce by 1), not the whole draw, unless the team decides "a Villain card" = the entire villain step. (FLAG for build: Golden draws 2/round; "a Villain card" most naturally = one card → draw 1 next round.)
- **Engine function / pattern:** `colossusOfFuturePastFight(villainCard)` → set a `skipNextVillainDraw` / `nextTurnVillainDrawReduction = 1` flag consumed by the start-of-turn villain-draw logic. Reuse any existing "skip villain this turn" precedent if one exists (pattern-reuse-scout should confirm during build).
- **Interaction risks:** Mode divergence — Golden draws 2, What If? Solo draws differently; the "don't play a Villain card" reduction must apply correctly in both. Deferred flag MUST have a consumer at turn start or it's a dead effect. Confirm whether the reduction stacks if fought twice (two Colossus copies) — likely cumulative.
- **Executable assertion:** Trigger `colossusOfFuturePastFight` → assert the next-turn villain-draw flag is set; advance to next turn start → assert one fewer villain card is drawn/played and the flag is cleared.

### Sentinel Territories — Kate Pryde of Future Past  (confidence: HIGH)
- **Effect text:** "Fight: You get +1 Recruit. Then, *Kate Pryde alters the future:* At the beginning of the next player's turn, that player gets +1 Recruit. Attack: 4 | VP: 2" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** On fight: immediate **+1 Recruit** this turn. Then schedule **+1 Recruit at the start of the next turn** (solo: the active player's own next turn).
- **Engine function / pattern:** `katePrydeOfFuturePastFight(villainCard)` → grant +1 Recruit now (update BOTH `totalRecruitPoints` AND `cumulativeRecruitPoints`, then `updateGameBoard()` — per the recruit-granting twin rule). Set a deferred `nextTurnBonusRecruit += 1` flag consumed at turn start (which likewise updates both recruit totals at that time).
- **Interaction risks:** **Recruit-grant twin rule:** missing `cumulativeRecruitPoints` silently breaks Final Showdown — apply to BOTH the immediate grant and the next-turn payout. Deferred flag needs a turn-start consumer. Stacking if fought multiple times → cumulative next-turn recruit.
- **Executable assertion:** Trigger fight → assert `totalRecruitPoints` and `cumulativeRecruitPoints` each +1 immediately and the deferred next-turn-recruit flag set. Advance to next turn → assert +1 Recruit applied at turn start (both totals) and flag cleared.

### Sentinel Territories — Rachel Summers of Future Past  (confidence: HIGH)
- **Effect text:** "Fight: *Rachel Summers alters the future:* During the next player's turn, all Villains and the Mastermind get -1 Attack. / Escape: This turn, all Villains and the Mastermind get +1 Attack. Attack: 6 | VP: 4" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:**
  - **Fight:** Schedule a **-1 Attack to all Villains and the Mastermind during the next turn** (solo: active player's next turn). The modifier applies for that whole turn, then clears.
  - **Escape:** **This turn**, all Villains and the Mastermind get **+1 Attack** (immediate, this turn only).
- **Engine function / pattern:** `rachelSummersOfFuturePastFight(villainCard)` → set a deferred `nextTurnAllVillainAttackDelta = -1` flag consumed at turn start that feeds the villain/mastermind attack pipeline. `rachelSummersOfFuturePastEscape(villainCard)` → set a this-turn `allVillainAttackDelta = +1`. **Both must be READ in the attack pipeline via `attackFrom*` fields in BOTH twins** (`updateVillainAttackValues` city + `updateHQVillainAttackValues` HQ) AND the mastermind attack recompute (`recalculateMastermindAttack` / `mastermind.attackFromOwnEffects` or a scheme-style delta) — never write `card.attack`.
- **Interaction risks:** **Twin-read trap** — a global ±1 must be read in BOTH villain-attack twins and the mastermind attack recompute, or it silently fails on HQ villains / the mastermind (engine-gotchas E-3 Graveyard precedent). Use `attackFromScheme`/`attackFromOwnEffects`-style additive fields (reset-then-accumulate), not overwrite. Next-turn -1 needs a turn-start consumer and a clear at the end of that turn. Escape +1 is this-turn-only.
- **Executable assertion:** *Escape:* trigger escape → assert every city villain's effective attack and the mastermind's effective attack each show +1 (via the overlay/modifier field), this turn only. *Fight:* trigger fight → assert the -1 flag set; advance one turn → assert all villains + mastermind show -1 effective attack that turn, then clears.

### Sentinel Territories — Wolverine of Future Past  (confidence: HIGH)
- **Effect text:** "Fight: *Wolverine alters the future:* At the start of the next player's turn, you draw a card, and that player draws a card. / Escape: Cross-Dimensional Wolverine Rampage. Attack: 7 | VP: 5" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:**
  - **Fight:** Schedule a draw for the start of the next turn. "You draw a card, and that player draws a card" — in solo "you" and "that player" are the **same active player**, so at the start of the next turn the active player draws **2 cards** (one for "you", one for "that player").
  - **Escape:** **Cross-Dimensional Wolverine Rampage** (SHARED) — solo active player reveals a Wolverine-family card or gains a Wound.
- **Engine function / pattern:** Fight = `wolverineOfFuturePastFight(villainCard)` → set a deferred `nextTurnDraw += 2` flag consumed at turn start (calls the standard draw helper twice). Escape = `wolverineOfFuturePastEscape(villainCard)` → **call the SHARED Cross-Dimensional Rampage helper** (Wolverine family predicate).
- **Interaction risks:** Solo collapses two separate draws onto one player = draw 2 (don't drop "that player draws" as a no-op). Deferred draw needs a turn-start consumer. Rampage: Wolverine of Future Past itself, in the Victory Pile, has no "Wolverine/Weapon X/Old Man Logan" in its name ("Wolverine" IS in the name → it DOES count) — confirm the family scan catches it.
- **Executable assertion:** *Fight:* trigger fight → assert deferred-draw flag = 2; advance to next turn start → assert the player draws 2 cards and flag clears. *Escape:* with a Wolverine-family card revealable → reveal-or-wound choice; with none → Wound drawn.

---

## Henchmen

### Henchmen — M.O.D.O.K.s  (confidence: HIGH)
- **Effect text:** "Fight: KO a Hero from your discard pile or the HQ. If that Hero has a Recruit icon, you get +1 Recruit. Attack: 3 | VP: 1" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** On fight, the player chooses one Hero to KO from EITHER their **discard pile** OR the **HQ** (combined pool). KO it (to `koPile`; if HQ, refill that slot). If the KO'd Hero has a **Recruit icon** (printed Recruit value / Recruit-granting), the player then gets **+1 Recruit** this turn. Mandatory if any Hero is available in either pool.
- **Engine function / pattern:** `modoksFight(villainCard)` → card-choice popup (the `card-choice-popup` "KO from discard/HQ" pattern, NOT `showHeroAbilityMayPopup`) over `playerDiscardPile` Heroes + HQ Heroes; KO selected via `koPile.push` (HQ selection → null slot + refill). After KO, if the chosen Hero has a Recruit icon, grant +1 Recruit (update BOTH `totalRecruitPoints` and `cumulativeRecruitPoints`, then `updateGameBoard()`). Henchman `fightEffect` doesn't read `currentVillainLocation` (confirmed safe class).
- **Interaction risks:** Combined-pool picker (discard + HQ) by object identity, not `card.id`. HQ-KO must refill the slot (avoid an empty HQ hole). Recruit-icon detection must match the inventory's Recruit-icon convention (a card with `recruit > 0` / "0+" still has the icon). Recruit-grant twin rule (cumulative too). Empty-`koPile` guard if KO is the turn-1 first KO.
- **Executable assertion:** Put a Recruit-icon Hero R in the discard pile and a non-Recruit Hero in HQ. Trigger `modoksFight`, choose R → assert R in `koPile`, `totalRecruitPoints` and `cumulativeRecruitPoints` each +1. Re-run choosing the non-Recruit HQ Hero → assert it's KO'd, HQ slot refilled, no Recruit gained.

### Henchmen — Thor Corps  (confidence: LOW)
- **Effect text:** "Fight: Gain this as a Hero. Attack: 3 | VP: 0. As Hero — Team: Avengers | Class: Strength / Ranged | 2+ Recruit; [STRENGTH][RANGED]: You get +1 Recruit." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** On fight, convert the Thor Corps henchman to its **Hero form** and gain it to the player's discard pile (gained as a Hero). Hero form: **Team Avengers, Class Strength / Range (dual-class), base 2+ Recruit**, superpower **"[STRENGTH][RANGED]: You get +1 Recruit"** (when later played, if you've played both a Strength and a Range symbol this turn, +1 Recruit). **VP 0** — skip the VP push on defeat. Cost as Hero = 3 (old henchman Attack).
- **Engine function / pattern:** `thorCorpsFight(villainCard)` → `gainScarletWitchAsHero`-style converter parameterized on this Hero form: `type:"Hero"`, `team:"Avengers"`, `classes:["Strength","Range"]` (two-element array for dual-class — `hasClass` works unchanged; do NOT use a `"Strength / Range"` slash string), `recruit:2`, `cost:3`, install the `[STRENGTH][RANGED]: +1 Recruit` superpower, route to `playerDiscardPile`. Reuse the `skrulled`-style VP-bypass flag; **whitelist the gain-as-hero flag in `createVillainCopy()`**. Same inverted-Skrull converter as the Manhattan cards.
- **Interaction risks:** **VP 0 / skip VP push** — these are henchmen (`subtype:"Henchman"`) gained as heroes; the henchman defeat path must also honor the VP-skip flag (confirm the henchman-defeat handler checks the same `skrulled`-style bypass as the villain handlers @ script.js:13360). Dual-class as a 2-element `classes` array (mechanics doc note — no dual-class card exists in the DB yet; audit `classes[0]` reads). The [STRENGTH][RANGED] superpower needs BOTH symbols played this turn — resolves on later play, not at gain. Class strings `"Strength"` and `"Range"` (not "Ranged").
- **LOW confidence — why:** dual-nature henchman gained as a Hero is the first of its kind (Manhattan are villains; Thor Corps is a HENCHMAN going through the henchman-defeat path), AND it's the first dual-class card in the DB — both the VP-skip on the henchman path and the dual-class array need verification.
- **Executable assertion:** Fight a Thor Corps → assert it is NOT in the Victory Pile (VP 0 skip), IS in `playerDiscardPile`, `type:"Hero"`, `team:"Avengers"`, `classes` deep-equals `["Strength","Range"]`, `recruit === 2`, `cost === 3`, and carries the [STRENGTH][RANGED]+1-Recruit superpower. Later play it after playing a Strength and a Range symbol this turn → assert +1 Recruit (both recruit totals).

---

## Bystander

### Bystander — Banker  (confidence: HIGH)
- **Effect text:** "When you rescue this Bystander, you get +2 Recruit, usable only to recruit Heroes in the HQ space under the Bank. VP: 1 (×3)" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** When the player **rescues** a Banker bystander, grant **+2 Recruit that is usable ONLY to recruit the Hero in the HQ slot positioned under the Bank** (the "Bank" city space's HQ slot). This restricted recruit cannot be spent on any other HQ slot or any other purpose. Standard bystander VP 1 still applies (Banker goes to the Victory Pile as a 1-VP bystander after rescue, like any bystander).
- **Engine function / pattern:** `bankerRescue()` (bystander rescue hook) → reuse the **`hqNReserveRecruit`** restricted-recruit mechanism from `moleManUndergroundRiches()` @ expansionFantasticFour.js:2640 (`hq2ReserveRecruit += N`, read @ script.js:7360, usable only for that HQ position). Key the +2 reserve to whichever HQ slot index corresponds to the **Bank** space — derive it via `citySpaceLabels.indexOf("The Bank")` (labels include "The "; bare `"Bank"` returns -1, per engine-gotchas Bank/Streets note), then map to the HQ slot under the Bank. Add +2 to that slot's reserve-recruit field.
- **Interaction risks:** **Bank slot index must be resolved by label, not hardcoded** — under city-resizing schemes the Bank index shifts (latent resize bug). Confirm the existing `hqNReserveRecruit` field/index aligns with the Bank HQ slot. The +2 is additive (multiple Bankers stack into the same reserve). It's a RECRUIT reserve (not attack). No mode divergence (Bank HQ slot exists in both modes), but Smash Two Dimensions / schemes that destroy the Bank would void the slot — out of scope here, but note the Banker's grant should no-op gracefully if the Bank space doesn't exist.
- **Executable assertion:** Rescue a Banker → assert the Bank-HQ-slot reserve-recruit field increases by 2; attempt to recruit the Hero in the Bank HQ slot → assert the +2 applies; attempt to spend it on a different HQ slot → assert it does NOT apply. Rescue a second Banker → assert the reserve is +4.

---

---


## Masterminds & Schemes

# MASTERMIND — Madelyne Pryor, Goblin Queen

## Madelyne Pryor — Passive: Demon Goblins + can't-fight gate  (confidence: LOW)
- **Effect text:** "Bystanders captured by Madelyne are 'Demon Goblin' Villains with 2 Attack. You can fight them to rescue them as Bystanders. You can't fight her while she has any Demon Goblins." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Whenever Madelyne captures a Bystander (Master Strike, any tactic, or any "Madelyne captures a Bystander" effect), each captured Bystander becomes a separately fightable **Demon Goblin** entity attached to Madelyne with printed Attack **2**. Fighting a Demon Goblin (cost = 2 Attack) rescues the underlying Bystander to the active player (normal rescue: +VP, Banker's recruit rider if Banker). While **any** Demon Goblin is attached, Madelyne herself is unfightable (her attack/fight affordance is suppressed regardless of player Attack total). Once the last Demon Goblin is rescued, Madelyne becomes fightable again.
- **Engine function / pattern:** Capture-onto-entity reuse: `captureBystanderFromVPToLocation()` @ expansionRevelations.js:5059 (push to `entity.capturedBystanders[]`) + `defeatLocation()` rescue loop @ script.js:12448 + overlay render @ script.js:8681. Each Demon Goblin is a fightable off-grid entity modeled on Korvac/Graveyard `type:"Location"` (`placeLocation()` @ script.js:580; defs @ expansionRevelations.js:3894) — 2-Attack, fight→rescue. Fight-gate on Madelyne adapts the 3-gate affordability pattern (Nimrod entry below): a new `unfightableWhileDemonGoblins` read at `showAttackButton()` @ script.js:11922 + both `updateHighlights()` twins @ script.js:7333 and script.js:7590. Mastermind lookup by exact name `"Madelyne Pryor, Goblin Queen"`; whitelist any new state in `createVillainCopy()`.
- **Interaction risks:** Novel fightable-attached-entity (Demon Goblin) — neither pure capture nor pure city villain. Capture plumbing currently rescues on the carrier's defeat; here the Bystander must be rescuable independently while the carrier (Madelyne) stays in play. Fight-gate is a NEW gate distinct from `usesRecruitToFight` and from Nimrod's recruit-unlock — three places must stay in sync (twin `updateHighlights()` hazard). Demon Goblin count must drive both the gate and the overlay. Epic-overlay in-place-mutation gotcha (`tactics.length = 0`, never reassign) applies if Madelyne ever runs Epic.
- **Executable assertion:** Set up Golden Solo with Madelyne as mastermind, ≥1 Bystander available. Trigger a capture (e.g. her Master Strike or City of Demon Goblins tactic) → assert (a) N Demon Goblin entities exist with attack 2, (b) Madelyne's attack button is suppressed (`showAttackButton` returns false / no `.attack-button` for her), (c) fighting one Demon Goblin with 2 Attack moves its Bystander to the active player's Victory Pile and decrements the Demon Goblin count, (d) after the last is rescued Madelyne is fightable again. **BOTH golden+whatif** (capture self-applies to the active player in both).

## Madelyne Pryor — Master Strike  (confidence: LOW)
- **Effect text:** "Master Strike: Madelyne captures 4 Bystanders. If she already had any Bystanders before that, then each player gains a Wound." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** On Master Strike, Madelyne captures 4 Bystanders from the Bystander Stack (each becomes a 2-Attack Demon Goblin per passive). The "If she already had any Bystanders before that" check evaluates BEFORE this capture: if Madelyne already had ≥1 attached Demon Goblin/Bystander, "each player gains a Wound" → solo: the **active player** gains a Wound (`drawWound()`). With multiple masterminds (ascended Magneto / Dark Alliance), this Strike fires as one of the per-mastermind Strikes (keystone loop; player picks order).
- **Engine function / pattern:** Master Strike effect under `handleMasterStrike()` @ script.js:5804 (keystone generalizes this to loop over all active masterminds). Capture reuses the passive's Demon Goblin capture path. Wound via `drawWound()` @ cardAbilities.js:305 (invulnerability-aware). "Already had any" = check attached-Demon-Goblin count > 0 captured at strike start, before the +4.
- **Interaction risks:** Order of operations — snapshot the prior count BEFORE capturing 4, or the Wound clause always fires. If Bystander Stack has <4, capture as many as available (cap at stack size). Keystone dependency for multi-mastermind Strike loop. Wound-to-active-player solo translation ("each player" includes the active player).
- **Executable assertion:** Madelyne has 0 Demon Goblins, ≥4 Bystanders in stack → trigger Master Strike → assert 4 Demon Goblins attached AND active player gained 0 Wounds (no prior bystanders). Then trigger Master Strike again (now she has ≥1) → assert 4 more captured (or stack-limited) AND active player gained exactly 1 Wound. **BOTH golden+whatif.**

## Madelyne Pryor — Tactic: City of Demon Goblins  (confidence: LOW)
- **Effect text:** "Fight: Madelyne captures five Bystanders." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** On defeating this Tactic, Madelyne captures 5 Bystanders (each → 2-Attack Demon Goblin). Cap at Bystander Stack size if fewer than 5. Fight value 10, VP 6 (inherits main Mastermind).
- **Engine function / pattern:** Tactic fight effect; reuses the passive's capture path (×5). Tactic reveal via `revealMastermindTactic()` @ script.js:15981 (VP push). No transform/Location, so no `transformsToLocation` guard needed.
- **Interaction risks:** Capturing 5 produces 5 Demon Goblins which then BLOCK fighting Madelyne (passive gate) — intended, but verify the gate fires off tactic-driven captures, not only Master-Strike captures. Stack-empty edge: capture available count only.
- **Executable assertion:** Bystander Stack ≥5, Madelyne in play → defeat City of Demon Goblins tactic → assert 5 Demon Goblins attached AND Madelyne unfightable. **BOTH golden+whatif** (self-applies; no "each player" clause).

## Madelyne Pryor — Tactic: Corrupted Clone of Jean Grey  (confidence: LOW)
- **Effect text:** "Fight: Each other player reveals an X-Men Hero or gains a Wound." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** "Each other player" → solo per the non-Location "each other player" precedent + What If? p.24 ("do it yourself"). Active player reveals an X-Men Hero (from hand / played-this-turn / artifacts) or gains a Wound (`drawWound()`). Confirm exact handling at build — flagged in mechanics doc Solo Decisions as "self-apply or no-op per precedent"; recommend SELF-APPLY (reveal X-Men or take a Wound) to match Cross-Dimensional Rampage "each player" treatment and the Revelations Location ruling.
- **Engine function / pattern:** ADAPT `revealClassOrWound()` @ expansionRevelations.js:2329 — scans `[...playerHand, ...playerArtifacts, ...cardsPlayedThisTurn]` for a team/class match; pop Reveal/Wound choice or `drawWound()`. Here predicate = team === "X-Men" (not a class). Tactic via `revealMastermindTactic()`.
- **Interaction risks:** Mode divergence (row 8 — "each other player"). Solo translation is a JUDGMENT call deferred to build per mechanics doc; if lead chooses NO-OP instead of self-apply, the spec/assertion must flip. Predicate is TEAM-based (X-Men), not class-based — don't reuse the class predicate unchanged.
- **Executable assertion:** Active player holds NO X-Men Hero → defeat Corrupted Clone tactic → assert active player gained 1 Wound (self-apply interpretation). Then with an X-Men Hero in hand → assert Reveal option offered and no forced Wound. **BOTH golden+whatif** (mode-divergent "each other player").

## Madelyne Pryor — Tactic: Everyone's a Demon on the Inside  (confidence: LOW)
- **Effect text:** "Fight: Madelyne captures a Bystander from each other player's Victory Pile." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** "From each OTHER player's Victory Pile" → in 1-player solo there are NO other players' Victory Piles. Per the non-Location "each other player" precedent: this captures from OTHERS specifically (not "each player"), so solo = **no-op** (no source to capture from — the active player is not an "other player," and capturing from your own VP isn't what the card says). Recommend NO-OP; flag for lead confirmation. (Contrast Master Strike's "each player" which DOES include the active player.)
- **Engine function / pattern:** No-op in solo (announce-and-skip with `onscreenConsole`). If lead instead rules self-target (capture from active player's own VP), reuse `captureBystanderFromVPToLocation()` @ expansionRevelations.js:5059 reading the active player's `victoryPile`. Tactic via `revealMastermindTactic()`.
- **Interaction risks:** Mode divergence (row 8). The "each OTHER player" wording (vs Master Strike's "each player") is the discriminator — DO NOT self-apply by analogy to the Master Strike; this one names "other" explicitly. Announce-and-skip must use `onscreenConsole`, not `console.log`.
- **Executable assertion:** Solo, defeat Everyone's a Demon tactic → assert NO Demon Goblins added (no-op) and an `onscreenConsole` announcement that there are no other players. **BOTH golden+whatif.**

## Madelyne Pryor — Tactic: Gather the Harvest  (confidence: LOW)
- **Effect text:** "Fight: For each Limbo Villain in the city and/or Escape Pile, Madelyne captures a Bystander." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Count Limbo-group Villains currently in the city AND in the Escape Pile (`escapedVillainsDeck`), sum them, and capture that many Bystanders (each → 2-Attack Demon Goblin). Cap at Bystander Stack size. Limbo group = Inferno Colossus/Cyclops/Darkchilde/Nightcrawler (team/group "Limbo"). Madelyne Always Leads Limbo, so Limbo villains are typically present.
- **Engine function / pattern:** Count via scan of `city[]` + `escapedVillainsDeck` filtered by group/team === "Limbo". Capture reuses passive path. Tactic via `revealMastermindTactic()`.
- **Interaction risks:** Must count BOTH city and escape pile; `escapedVillainsDeck` is the real global (`escapePile` is undefined — engine-gotchas). Group/team field name must match how Limbo villains are tagged in cardDatabase.js (confirm at build). Captured Bystanders block Madelyne (passive gate).
- **Executable assertion:** Seed 2 Limbo villains in city + 1 in `escapedVillainsDeck`, Bystander Stack ≥3 → defeat Gather the Harvest tactic → assert 3 Demon Goblins captured. **BOTH golden+whatif** (self-applies; no "each player").

---

# MASTERMIND — Nimrod, Super Sentinel

## Nimrod — Passive: can't-fight-unless-≥6-Recruit gate  (confidence: HIGH)
- **Effect text:** "You can't fight Nimrod unless you made at least 6 Recruit this turn." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Nimrod's fight affordance is locked unless the active player has generated ≥6 Recruit this turn (`cumulativeRecruitPoints >= 6` — total generated, NOT current unspent). Nimrod still COSTS Attack to fight (the recruit total is only an UNLOCK condition, not the fight currency — distinct from `usesRecruitToFight`). Fight value 6, VP 6.
- **Engine function / pattern:** ADAPT the 3-gate affordability pattern: add an `unfightableUnlessRecruit: 6` flag read at `showAttackButton()` @ script.js:11922 AND both `updateHighlights()` twins @ script.js:7333 and script.js:7590. Threshold read mirrors `if (cumulativeRecruitPoints >= N)` (`ThorHighRecruitReward()` @ cardAbilities.js:1380). Mastermind lookup exact name `"Nimrod, Super Sentinel"`. NOT `usesRecruitToFight` (that swaps the fight cost to Recruit; Nimrod keeps Attack cost).
- **Interaction risks:** Three gates must stay in sync (twin `updateHighlights()` hazard) — missing one lets Nimrod be fought (or hidden) inconsistently. `cumulativeRecruitPoints` (total generated this turn) vs `totalRecruitPoints` (current unspent) — must read the cumulative/generated value, else spending Recruit re-locks the gate. Re-evaluate the gate live as recruit accrues (each `updateGameBoard`).
- **Executable assertion:** Nimrod in play, 0 Recruit generated → assert Nimrod attack button suppressed at all three gates. Generate 6 Recruit (don't spend) → assert Nimrod becomes fightable; fighting deducts Attack (not Recruit). Generate 6 then spend it all on recruiting → assert Nimrod STILL fightable (cumulative read, not current). Mode-independent (own recruit total) — verify golden + spot-check whatif.

## Nimrod — Master Strike  (confidence: LOW)
- **Effect text:** "Master Strike: Each player who does not reveal a [TECH] Hero must choose Recruit or Attack, then discard all their cards with that icon." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** "Each player" → includes the active player (solo = active player). Active player may reveal a [TECH] Hero (from hand); if they cannot/decline, they choose Recruit or Attack, then discard ALL cards in hand bearing that icon. With multiple masterminds this fires as one per-mastermind Strike (keystone loop).
- **Engine function / pattern:** Reveal-or-penalty: ADAPT `revealClassOrWound()` @ expansionRevelations.js:2329 control flow but penalty = choose-icon-then-discard-by-icon rather than Wound. Icon-choice popup via `showHeroAbilityMayPopup`-style Recruit/Attack chooser; discard-by-icon scans hand for cards with the chosen Recruit/Attack icon. Master Strike under `handleMasterStrike()` @ script.js:5804.
- **Interaction risks:** "discard ALL cards with that icon" — many cards have both icons; the chosen-icon discard hits every card carrying it. [TECH] is class/team-class TECH (confirm predicate: class includes "Tech"). Solo "each player" = active player only. Keystone dependency for multi-mastermind Strike loop. Identical penalty shape to the Painful Choice Ambition (deferred) — note for keyword consistency.
- **Executable assertion:** Active player hand has NO Tech Hero and ≥1 card with a Recruit icon → trigger Master Strike → choose Recruit → assert all Recruit-icon cards discarded from hand. With a Tech Hero in hand → assert Reveal option offered, no forced discard. **BOTH golden+whatif** ("each player" + reveal-or-penalty).

## Nimrod — Tactic: Adapt and Destroy  (confidence: LOW)
- **Effect text:** "Fight: Choose Recruit or Attack. Each other player reveals their hand and discards a card with that icon." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Active player chooses Recruit or Attack. "Each OTHER player ... discards a card with that icon" → solo per "each other player → do it yourself" (What If? p.24): the **active player** discards one card with the chosen icon (single card, not all). Fight 6, VP 6.
- **Engine function / pattern:** Recruit/Attack chooser popup; then discard ONE card matching the chosen icon from the active player's hand (single discard, contrast Master Strike's "all"). Tactic via `revealMastermindTactic()`.
- **Interaction risks:** Mode divergence (row 8 — "each other player" → self in solo). Single-card discard here vs Master Strike's all-cards — don't conflate. If hand has no card with chosen icon, no-op (announce).
- **Executable assertion:** Solo, active player hand has ≥1 Attack-icon card → defeat Adapt and Destroy, choose Attack → assert exactly ONE Attack-icon card discarded from active player's hand. **BOTH golden+whatif.**

## Nimrod — Tactic: Detect Mutation  (confidence: HIGH)
- **Effect text:** "Fight: Choose Recruit or Attack. Then, reveal the top card of your deck. If that card has that icon, draw it and repeat this process." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Active player chooses Recruit or Attack. Reveal top card of own deck; if it has the chosen icon, draw it and reveal the next (repeat) — chain continues while each revealed top card carries the chosen icon. Stop when a revealed card lacks the icon (it stays on top, undrawn) or deck empties. No "each player" — self-only. Fight 6, VP 6.
- **Engine function / pattern:** Recruit/Attack chooser; loop revealing `playerDeck[top]`, draw via `drawOne()` while icon matches. Reshuffle handling if deck empties mid-chain (existing draw infra).
- **Interaction risks:** Infinite-loop guard if all remaining cards carry the icon — bounded by deck size, but ensure the loop terminates on empty deck. The non-matching revealed card must be LEFT on top (not drawn, not buried). "that icon" = whichever the player chose, read off the card's printed Recruit/Attack icon presence.
- **Executable assertion:** Stack player deck top with [card with Recruit icon, card with Recruit icon, card with no Recruit icon] → defeat Detect Mutation, choose Recruit → assert exactly 2 cards drawn and the 3rd remains on top of deck. Mode-independent — verify golden + spot-check whatif.

## Nimrod — Tactic: Scatter the Mutants  (confidence: HIGH)
- **Effect text:** "Fight: Choose Recruit or Attack. Put all Heroes from the HQ with that icon on the bottom of the Hero Deck." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Active player chooses Recruit or Attack. Every HQ Hero whose printed card bears that icon is moved to the bottom of the Hero Deck; HQ slots they vacate refill per the current mode's HQ refill rule (Golden rotation vs What If? fill-in-place). No "each player." Fight 6, VP 6.
- **Engine function / pattern:** Recruit/Attack chooser; scan HQ slots for cards bearing the chosen icon; move to Hero Deck bottom; trigger HQ refill. Mind the twist-handler HQ-iteration gotcha (iterate in reverse or collect indices first — `goldenRefillHQ()` splices mid-iteration; engine-gotchas "Twist handlers that loop FORWARD over HQ slots").
- **Interaction risks:** Mode divergence in HQ REFILL behavior (row 2 — Golden rotation vs What If? fill-in-place) — the icon-filter is mode-independent but the refill that follows differs. Forward-iteration-with-refill hazard. "with that icon" reads the HQ card's printed icon.
- **Executable assertion:** Seed HQ with 2 Recruit-icon Heroes + 3 others → defeat Scatter the Mutants, choose Recruit → assert the 2 Recruit-icon Heroes are on the bottom of the Hero Deck and HQ refilled. **BOTH golden+whatif** (HQ refill mode-divergent).

## Nimrod — Tactic: Teleport and Incarcerate  (confidence: LOW)
- **Effect text:** "Fight: Choose Recruit or Attack. Then, reveal the top card of that Hero Deck. If that card has that icon, gain that card, and Teleport it." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Active player chooses Recruit or Attack. Reveal the top card of the HERO Deck (note: inventory says "that Hero Deck" — single Hero Deck). If it has the chosen icon, gain it (to discard by default) and Teleport it (set aside, returns to next hand as an extra card per the rulebook Teleport definition — NOT "top of deck"). If it lacks the icon, no gain (leave/place per standard reveal). No "each player." Fight 6, VP 6.
- **Engine function / pattern:** Recruit/Attack chooser; reveal `heroDeck[top]`; if icon matches, gain to player + Teleport via existing `teleport()` @ cardAbilitiesDarkCity.js:3767 / `cardsToBeDrawnNextTurn` queue (drawn first end-of-turn). Teleport here is a card the player gains then sets aside.
- **Interaction risks:** Teleport definition is the rulebook one (set aside → next hand), not the inventory's wrong "top of deck" gloss (mechanics doc Open Q5). What happens to a NON-matching revealed Hero Deck card — leave on top (default) vs discard; card doesn't specify, default to leaving on top. Gained-then-Teleported card must enter `cardsToBeDrawnNextTurn`, not the deck.
- **Executable assertion:** Hero Deck top = a Recruit-icon Hero → defeat Teleport and Incarcerate, choose Recruit → assert that Hero is gained by the player and queued in `cardsToBeDrawnNextTurn` (returns next hand). Mode-independent — verify golden + spot-check whatif.

---

# SCHEMES (6 in-scope)

## Scheme — Build an Army of Annihilation  (confidence: LOW)
- **twistCount:** 9 — **Evil-Wins threshold:** 10 Annihilation Henchmen next to the Mastermind.
- **Effect text:** "Setup: 9 Twists. Put 10 extra Annihilation Wave Henchmen in that KO pile. / Twist: KO all Annihilation Henchmen from the players' Victory Piles. Stack this Twist next to the Scheme. Then, for each Twist in that stack, put an Annihilation Henchman from the KO pile next to the Mastermind. Players can fight those Henchmen. / Evil Wins: When there are 10 Annihilation Henchmen next to the Mastermind." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** STAND-IN DECISION (mechanics Open Q2, baked): "Annihilation Wave Henchmen" is a pre-release printing error — use **M.O.D.O.K.s as the stand-in**. Setup: spawn a dedicated 10-card "Annihilation" army from M.O.D.O.K. art/stats into a scheme-owned KO/reserve pool (NOT shuffled into the villain deck). Each Twist: (1) KO any Annihilation Henchmen sitting in the active player's Victory Pile back out; (2) stack the Twist next to the Scheme; (3) for each Twist now in that stack, move one Annihilation Henchman from the pool to next-to-the-Mastermind as a fightable 2/3-Attack entity (printed M.O.D.O.K. Attack 3). Players can fight those (rescue/defeat → Victory Pile, which the next Twist then KOs back out). Evil Wins when 10 are simultaneously next to the Mastermind.
  - Per-Twist count is the running stack size: Twist 1 places 1, Twist 2 places 2, etc. (escalating). Because defeated ones return to VP and get KO'd back to the pool each Twist, the count next to the Mastermind is re-derived each Twist from `min(stackSize, available pool)`.
- **Engine function / pattern:** Setup hooks scheme-specific spawn (model on Skrull-style stamping @ script.js:4427 but routed to a scheme-owned array, not the villain deck) — each Annihilation Henchman a fightable off-grid entity (Korvac/Graveyard model, `placeLocation()` @ script.js:580). Evil-Wins: add `case` to `endGameConditions` switch @ script.js:9343 keyed on scheme `endGame` value; TWIN: add `case` to `updateEvilWinsTracker()` @ script.js:10807 keyed on scheme NAME for the live "N/10" counter. Twist handler under `handleSchemeTwist`.
- **Interaction risks:** Stand-in mechanics are bespoke (LOW) — the count next to the Mastermind, VP-KO recycling each Twist, and the fightable-entity placement are all novel-ish. Scheme-owned henchman pool must not collide with the real M.O.D.O.K.s villain group if M.O.D.O.K.s is also a selected villain group. Need a live evil-wins counter (twin tracker case). HQ/city-count loops must exclude these (isSchemeVillain-style flag, Korvac precedent).
- **Executable assertion:** Set up this scheme solo; advance to Twist 3 → assert 3 Annihilation Henchmen next to the Mastermind (escalating stack), each fightable at Attack 3, and the live tracker shows "3/10". Force 10 next to the Mastermind → assert Evil Wins triggers (`endGameConditions` case fires). Mode-divergence Low (row 5); verify golden + spot-check whatif.

## Scheme — Corrupt the Next Generation of Heroes  (confidence: LOW)
- **twistCount:** 8 — **Evil-Wins threshold:** 4 Sidekicks escape.
- **Effect text:** "Setup: 8 Twists. Add 10 Sidekicks to the Villain Deck. / Special Rules: Sidekicks in the Villain Deck and city are Villains. Their Attack is 2 plus the number of Twists stacked next to this Scheme. When you defeat a Sidekick, gain it to the top of your deck. / Twists 1-7: Each player returns a Sidekick from their discard pile to the Sidekick Stack. Then, two Sidekicks from the Sidekick Stack enter the city. / Twist 8: All Sidekicks in the city escape. / Evil Wins: When 4 Sidekicks escape." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Setup: stamp 10 Sidekick cards as `type:"Villain"` and shuffle into the Villain Deck (Skrull-injection pattern). Sidekick-villains' Attack = 2 + (Twists stacked next to this Scheme) — scales up as Twists accrue. Defeating a Sidekick-villain gains it to the TOP of the active player's deck (not Victory Pile — bypass VP, route to deck-top). Twists 1-7: "each player returns a Sidekick from discard to the Sidekick Stack" → solo = active player returns one Sidekick from discard if present (self per "each other"/"each player" — here "each player" includes active); then 2 Sidekicks from the Sidekick Stack enter the city as villains. Twist 8: all Sidekick-villains in the city escape (to `escapedVillainsDeck`). Evil Wins at 4 escaped Sidekicks.
- **Engine function / pattern:** Setup injection ADAPT Skrull @ script.js:4427 (stamp Sidekick objects `type:"Villain"`). Scheme-scaled attack reuses per-villain attack stacking (read Twists-next-to-scheme count). Defeat→deck-top reuses the convert-on-defeat-bypass-VP pattern (`skrulled` VP-bypass @ script.js:13360 / `gainScarletWitchAsHero` @ expansionRevelations.js:3481) routed via the proposed `gainSidekick(toTopOfDeck)` helper. "Enter the city" via `processVillainCard()` @ script.js:6230 / `enterCityFromRight()`. Evil-Wins: `endGameConditions` case @ script.js:9343 + `updateEvilWinsTracker()` twin @ script.js:10807 (count escaped Sidekick-villains; `escapedVillainsCount` filter must include these — use `type === "Villain"` stamp).
- **Interaction risks:** Sidekick-as-villain + gain-to-deck-top is novel (LOW). Attack value is DYNAMIC (2 + twist stack) — the attack overlay + fight cost must re-derive live, not freeze at entry. Defeat routes to deck-TOP, not discard (distinct from Thor Corps/Ultimates which go to discard). `generateVillainDeck()` overwrites `type` to "Villain" — fine here, but Sidekick base stats/cost must not leak. Twist-8 escape must tag these as escaped Villains for the counter. Mode divergence (row 8 "each player returns"; row 5 deck composition).
- **Executable assertion:** Set up scheme; advance 2 Twists → assert Sidekick-villains in city show Attack 4 (2+2). Defeat one with 4 Attack → assert it lands on TOP of the active player's deck (not VP). Force 4 escapes → assert Evil Wins + tracker "4/4". **BOTH golden+whatif** (each-player + deck composition).

## Scheme — Crush Them With My Bare Hands  (confidence: HIGH)
- **twistCount:** 5 — **Evil-Wins threshold:** 8 Master Strikes have taken effect.
- **Effect text:** "Setup: 5 Twists. If playing solo, add an extra Villain Group. / Twist: This Twist becomes a Master Strike that takes effect immediately. / Evil Wins: When 8 Master Strikes have taken effect." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Setup: explicit solo directive — add ONE extra Villain Group (`extraVillainGroups: 1` semantics). Each of the 5 Twists immediately triggers a Master Strike (fires every active mastermind's Strike per the keystone loop). A running counter of Master Strikes "taken effect" (from twists AND from natural Master Strike cards in the villain deck) reaches 8 → Evil Wins. Note twistCount is 5 but threshold is 8 — natural Master Strikes from the villain deck also count toward 8, so the 5 twist-strikes alone don't end it.
- **Engine function / pattern:** Setup: `extraVillainGroups: 1` via `getEffectiveSetupRequirements()` Golden-Solo branch (existing infra; What If? Solo handles the "add extra group" via its own count). Twist handler: invoke `handleMasterStrike()` @ script.js:5804 immediately. Master-Strike counter increments wherever Master Strikes resolve (both twist-driven and natural). Evil-Wins: `endGameConditions` case @ script.js:9343 keyed on a Master-Strike-count >= 8; twin `updateEvilWinsTracker()` @ script.js:10807 for "N/8" counter.
- **Interaction risks:** "If playing solo, add an extra Villain Group" — this is the EXPLICIT solo directive (use `extraVillainGroups`, the Crush Them precedent). Counter must capture ALL Master Strikes (twist-driven + natural villain-deck Master Strike cards), not just the 5 twists. With multiple masterminds, one Master Strike trigger fires multiple Strikes — confirm whether that counts as 1 or N toward the 8 (interpret as 1 "Master Strike event" per the card's "8 Master Strikes have taken effect"; flag for lead). Mode divergence (row 4 extra group, row 8 master strikes).
- **Executable assertion:** Set up scheme solo → assert an extra villain group present (3 groups Golden base 2 + 1). Trigger 8 Master Strike events → assert Evil Wins fires and tracker shows "8/8". **BOTH golden+whatif** (extra-group + master-strike count).

## Scheme — Dark Alliance  (confidence: LOW)
- **twistCount:** 8 — **Evil-Wins threshold:** Twist 7 = instant Evil Wins (a race; 8th twist effectively never reached).
- **Effect text:** "Setup: 8 Twists. / Twist 1: Add a random second Mastermind to the game with one Mastermind Tactic. / Twists 2-4: If the second Mastermind is still in play, it gains another Mastermind Tactic. / Twists 5-6: Each Mastermind captures a Bystander. / Twist 7: Evil Wins!" — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** CONSUMES the Multiple-Masterminds KEYSTONE (lead authors the keystone engine spec; this scheme is its hardest consumer). Twist 1: add a random REAL, full-strength second Mastermind (its own printed Attack/strength — inferred from absence of reduction, Pass-3 confirm worthwhile) with exactly 1 Mastermind Tactic. Twists 2-4: if it's still in play (not yet defeated), it gains +1 Tactic each (cap 4). Twists 5-6: EACH Mastermind (main + second) captures a Bystander ("the Mastermind" plural → both; capture per their own capture rules). Twist 7: Evil Wins — instant loss (don't finish the turn).
  - **Golden Solo adaptation (keystone-agreed):** main mastermind keeps its 4-defeats → Final Showdown UNCHANGED; the Dark Alliance second mastermind is an ADDITIONAL must-kill gate OUTSIDE the Showdown math — you must defeat it (fight through its 1-4 Tactics) to win, but it's not folded into the combined-points Final Showdown calculation. Its Master Strike fires alongside the main one.
  - **What If? Solo:** per What If? p.19 as written — defeat all masterminds, both Strikes fire, win requires both.
- **Engine function / pattern:** ENTIRELY dependent on the keystone (generalize single→array of active masterminds: board slot, defeat set, looped Master Strike, "the Mastermind" target picker). Tactic accrual reuses `revealMastermindTactic()`/tactic-array mutation @ script.js:15981 but per-mastermind. Bystander capture (Twists 5-6) reuses capture plumbing (Demon Goblins verdict / `captureBystanderFromVPToLocation`). Twist 7 Evil-Wins: `endGameConditions` case @ script.js:9343 keyed on twist-count >= 7 for THIS scheme; twin `updateEvilWinsTracker()` @ script.js:10807 (counter framed as twists-to-loss, e.g. "Twist X/7"). Random second mastermind picked from the masterminds pool excluding the main.
- **Interaction risks:** LOW — depends on the UN-BUILT keystone; cannot be fully specified until the keystone array/loop/second-board-slot design lands. Second mastermind full-strength is INFERRED (Pass-3 physical confirm). Mode divergence (rows 4 mastermind count, 6 win/Final Showdown). The Golden-Solo "additional must-kill gate outside Showdown math" adaptation is OURS (rules-silent) — Golden win check must require BOTH masterminds defeated but keep the Showdown single-mastermind. Bystander capture on the main mastermind needs the main mastermind to support captured-bystander attachment (does it today? — flag). Force dual-mode `/game-test` in Phase 3.
- **Executable assertion:** Set up Dark Alliance solo. Play Twist 1 → assert a second full-strength mastermind is in play with exactly 1 Tactic and occupies a second board slot. Play Twists 2-4 → assert it has 4 Tactics (if undefeated). Play Twist 5 → assert both masterminds captured a Bystander. Play Twist 7 → assert instant Evil Wins. Also: defeat the second mastermind before Twist 4 → assert Twists 2-4 add NO further Tactics (it's gone) and (Golden) the win still requires the main mastermind's 4-defeats + Final Showdown. **BOTH golden+whatif** (mastermind count + win condition — keystone-divergent).

## Scheme — Master of Tyrants  (confidence: LOW)
- **twistCount:** 8 — **Evil-Wins threshold:** 5 Tyrant Villains escape.
- **Effect text:** "Setup: 8 Twists. Choose 3 other Masterminds, and shuffle their 12 Tactics into the Villain Deck. Those Tactics are 'Tyrant Villains' with their printed Attack and no abilities. / Twists 1-7: Put this Twist under a Tyrant Villain as 'Dark Power.' It gets +2 Attack. / Twist 8: All Tyrant Villains in the city escape. / Evil Wins: When 5 Tyrant Villains escape." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** NO multiple-mastermind support needed (decision baked). Setup: choose 3 other Masterminds (from the DB, excluding the selected mastermind/scheme constraints), pull their 12 Tactic cards (4 each), stamp each as `type:"Villain"` with its printed Tactic Attack and NO fightEffect/abilities, and shuffle into the Villain Deck (Skrull-injection pattern). These "Tyrant Villains" enter/fight as ordinary city villains. Twists 1-7: place the Twist under a Tyrant Villain in the city as "Dark Power" → that Tyrant gets +2 Attack (per-villain attack modifier). Twist 8: all Tyrant Villains currently in the city escape. Evil Wins at 5 Tyrant Villains escaped.
- **Engine function / pattern:** Setup injection ADAPT Skrull @ script.js:4427: pull `tactics[]` from 3 chosen masterminds, stamp `type:"Villain"` + printed Attack + no `fightEffect`, inject into villain deck; routed via `processVillainCard()` @ script.js:6230. "+2 Attack Dark Power token" reuses per-villain attack stacking (`cityReserveAttack[i]`-style or villain attack-modifier field). Twist-8 escape moves city Tyrants to `escapedVillainsDeck`. Evil-Wins: `endGameConditions` case @ script.js:9343 + `updateEvilWinsTracker()` twin @ script.js:10807 (count escaped Tyrants; `escapedVillainsCount` filter includes `type:"Villain"`).
- **Interaction risks:** Tactic-villain injection is novel-ish (LOW) — Tactic DB objects must be readable as villain entities (printed Attack present, no fightEffect leak, no VP-as-mastermind-tactic confusion — these score as plain villains on defeat). Choosing "3 other Masterminds" at setup needs a picker/random selection excluding the active mastermind. Dark Power +2 must stack and persist on the specific Tyrant (whitelist in `createVillainCopy()` if added at placement). Escape counting must isolate Tyrants from other escaped villains for the 5-threshold (separate flag, e.g. `isTyrant: true`). Mode divergence Low (row 5 villain deck composition).
- **Executable assertion:** Set up Master of Tyrants with 3 chosen masterminds → assert 12 Tyrant Villains (type Villain, no fightEffect, printed Tactic Attack) are in the Villain Deck. Place a Dark Power Twist under a city Tyrant → assert that Tyrant's effective Attack +2. Force 5 Tyrants to escape → assert Evil Wins + tracker "5/5". Mode-divergence Low; verify golden + spot-check whatif.

## Scheme — Pan-Dimensional Plague  (confidence: LOW)
- **twistCount:** 10 — **Evil-Wins threshold:** the Wound Stack runs out (0 Wounds remaining).
- **Effect text:** "Setup: 10 Twists. / Twist: KO all Wounds from next to the HQ. Then, put a Wound from the Wound Stack next to each Hero in the HQ. / Special Rules: When a player recruits a Hero with a Wound next to it, that player can either gain that Wound or pay 1 Recruit to return that Wound to the Wound Stack. / Evil Wins: When the Wound Stack runs out." — *(inventory stamp: docs/card-inventory/final/secret-wars-vol1.md, 2026-04-04)*
- **Intended behavior:** Each Twist: (1) KO all Wounds currently sitting next to HQ slots (back to KO pile, NOT the Wound Stack — "KO all Wounds"); (2) draw a Wound from the Wound Stack and place one next to EACH Hero in the HQ (consuming Wound-Stack wounds). Special rule: when the active player recruits a Hero that has a Wound next to its HQ slot, they choose: gain that Wound (into discard) OR pay 1 extra Recruit to return that Wound to the Wound Stack (not gained). Evil Wins when the Wound Stack is depleted (can't supply a Wound).
- **Engine function / pattern:** Per-HQ-slot Wound attachment (new lightweight state: `hqWound[slot]`). Twist handler KOs existing HQ-adjacent Wounds then assigns new ones from the Wound Stack to each occupied HQ slot. Recruit hook: when recruiting an HQ Hero with `hqWound[slot]`, present gain-or-pay-1-Recruit choice (reuse a yes/no-ish popup; pay path deducts 1 Recruit and returns Wound to stack). Evil-Wins: `endGameConditions` case @ script.js:9343 keyed on Wound-Stack-empty; twin `updateEvilWinsTracker()` @ script.js:10807 (counter = Wounds remaining in stack, e.g. "N Wounds left").
- **Interaction risks:** Mode divergence (row 2 — HQ refill: Golden rotation vs What If? fill-in-place changes which slot a Wound rides and whether it follows the Hero). When an HQ Hero is recruited/replaced, its attached Wound handling must be defined (the Twist re-seeds each turn, but mid-turn recruit triggers the gain/pay choice). "KO all Wounds from next to the HQ" → KO pile, distinct from "return to Wound Stack" (the pay-1-Recruit path) — two different destinations. Wound Stack depletion is the loss; the per-Twist placement (one per HQ Hero) is the main drain. HQ-slot iteration during refill hazard (reverse-iterate).
- **Executable assertion:** Set up scheme; play a Twist → assert each occupied HQ slot has 1 Wound next to it and the Wound Stack decremented accordingly. Recruit a wounded HQ Hero with ≥1 spare Recruit → assert the gain-or-pay choice appears; choosing pay-1 returns the Wound to the stack and deducts 1 Recruit; choosing gain puts the Wound in discard. Deplete the Wound Stack → assert Evil Wins. **BOTH golden+whatif** (HQ refill mode-divergent).

---

---
