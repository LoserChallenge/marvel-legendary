# Rules Notes — Secret Wars Volume 1

Cache for Rules Oracle findings on Secret Wars Vol. 1 (solo-framed). Authoritative-source quotes with page cites. Solo rulesets win where they speak; base rule labeled INFERRED where solo is silent.

Sources used:
- Secret Wars rules insert: `expansions/secret-wars-vol1/Legendary_Rules_Secret_Wars_v1.pdf` (also `rules/Legendary_Rules_Secret_Wars_v1.pdf`) (2-page insert; image-text, sections quoted below)
- Finalized inventory (card content): `docs/card-inventory/final/secret-wars-vol1.md`
- Golden Solo ruleset: `rules/marvel-legendary-the-golden-solo-ruleset.pdf` (1 page)
- What If? rulebook: `rules/WhatIf_Rulebook.pdf` (28 pages; pages cited by printed page number)
- Core Set rulebook: `rules/Legendary_Rules-Core_Set.pdf`

---

## THE HEADLINE FINDING (read first)

**Multiple-Masterminds-in-solo IS officially defined — by the What If? solo ruleset, NOT by Golden Solo.**

- The **What If? rulebook fully defines the "ascend to become a new Mastermind" mechanic** in a dedicated section, "Villains Ascending to Become Additional Masterminds" (printed p.19), AND has a full solo section (printed p.24) that this set's solo mode runs under. The ascend mechanic is identical card-text to Secret Wars (both 2023+ Upper Deck wordings). So for **What If? Solo mode in this app, the rule is SETTLED, not a design decision.**
- **Golden Solo is SILENT.** The Golden Solo ruleset (one page) never mentions multiple/second Masterminds, ascension, or how its bespoke "defeat the Mastermind 4 times → Final Showdown" win condition interacts with a second Mastermind. So **for Golden Solo, multi-mastermind handling is genuinely a design decision the app must make** — but the What If? rule is the obvious faithful template to copy.

---

## Q1 — Multiple Masterminds: full mechanics

The Secret Wars insert ("Multiple Masterminds", p.1) verbatim:

> "When some powerful Villains in this set escape, they ascend to become new Masterminds, so there are multiple Masterminds in the game! Schemes can do this too. Players must defeat all the Masterminds to win. When a Master Strike occurs, each Mastermind does its Master Strike ability. The player whose turn it is picks the order."

The What If? rulebook ("Villains Ascending to Become Additional Masterminds", p.19) is the fuller, authoritative version and adds the critical defeat detail:

> "When some powerful Villains in this set escape, they say that they ascend to become additional Masterminds. This means there are multiple Masterminds in the game!
> • Players must defeat all the Masterminds to win.
> • When a Master Strike occurs, each Mastermind does its Master Strike ability. The player whose turn it is picks the order.
> • If an effect says it does something to 'the Mastermind,' you pick which Mastermind it affects.
> • An ascending Mastermind doesn't have Mastermind Tactics. You only need to fight it once to defeat it and put it into your Victory Pile. Once it's in your Victory Pile, it's considered a Villain card again, not a Mastermind or Tactic card."

**Mechanics summary:**
- **Win condition:** defeat ALL Masterminds (original + every ascended one).
- **Master Strikes:** every Mastermind in play fires its own Master Strike on each Master Strike trigger; current player chooses order.
- **"the Mastermind" targeting:** when an effect names "the Mastermind", the player chooses which one.
- CONFIDENCE: **SETTLED** (both inserts agree; What If? gives the defeat detail).

---

## Q2 — A villain that "ascends to become a new Mastermind": what it becomes mechanically

Governing rule (What If? p.19, quoted above): **an ascended Mastermind has NO Tactics, is defeated by ONE fight, and reverts to a normal Villain card in your Victory Pile.**

For **Apocalyptic Magneto** specifically (inventory `secret-wars-vol1.md` lines 627–630):
> "Fight: Gain an X-Men Hero from the HQ for free.
> Escape: Magneto ascends to become a new Mastermind. He gains the ability, 'Master Strike: Each player reveals an X-Men Hero or discards down to four cards.'
> Attack: 8 | VP: 6"

- **Defeat value:** The rulebook does NOT print a separate "Mastermind strength" for an ascended villain. The only Attack value the card carries is its **printed villain Attack — 8 for Magneto**. The What If? rule says "You only need to fight it once… put it into your Victory Pile" using normal fight rules, and the insert ("Villains You Gain as Heroes", p.1) reinforces that gained/transformed cards keep "their old Villain Attack value." So **you beat the ascended Magneto by spending Attack ≥ 8 (his printed villain Attack), one time.** It does NOT acquire a new/higher Mastermind strength.
- **Tactics:** None. It has ONLY the granted Master Strike ("Each player reveals an X-Men Hero or discards down to four cards" — solo: the active player does it themselves; see Q6/solo "each other player" note). No face-down Tactic stack.
- **Number of defeats:** ONE (vs. four for a normal Mastermind's Tactic stack).
- **Where it sits:** It occupies the Mastermind area as an additional Mastermind while in play; once fought it goes to your Victory Pile and counts as a normal Villain (VP 6) again.
- CONFIDENCE: **SETTLED** for defeat value/Tactics/defeats (What If? p.19 + insert p.1 are explicit). The insert alone never spells out the ascended Attack number — it's the What If? rule + "use old Villain Attack value" line that nails it to printed Attack 8.

---

## Q3 — Solo reconciliation (THE key question)

- **Golden Solo ruleset: SILENT on multiple/second Masterminds.** Full single-page ruleset read; no mention of ascension, additional Masterminds, or how a second Mastermind interacts with "Defeat the Mastermind 4 times" + Final Showdown. The Golden win/lose conditions are written for exactly one Mastermind.
- **What If? Solo ruleset: ADDRESSES it (transitively + directly).** The ascend mechanic is fully defined at p.19 (applies in all modes including solo), and the What If? solo section (p.24) governs solo play. Nothing in the solo section overrides the ascend rule, so in What If? Solo: a second Mastermind appears, fires its Master Strike each Master Strike, and must also be defeated (one fight) to win. The solo "each other player → do it yourself" rule (p.24) handles its Master Strike text in 1-player.
- **Verdict:**
  - **What If? Solo → SETTLED by official rules.** Honor the ascend rule as written: extra Mastermind, one-fight defeat at printed Attack, both Master Strikes fire, win requires defeating both.
  - **Golden Solo → genuine DESIGN DECISION.** Official rules don't define how a second Mastermind meshes with the 4-defeats-then-Final-Showdown structure. App must decide (recommendation in summary).
- CONFIDENCE: **SETTLED** that Golden is silent and What If? defines it; the Golden design call itself is **OPEN** (ours to make).

---

## Q4 — Dark Alliance scheme

Inventory verbatim (`secret-wars-vol1.md` lines 844–849):
> "Dark Alliance
> Setup: 8 Twists.
> Twist 1: Add a random second Mastermind to the game with one Mastermind Tactic.
> Twists 2-4: If the second Mastermind is still in play, it gains another Mastermind Tactic.
> Twists 5-6: Each Mastermind captures a Bystander.
> Twist 7: Evil Wins!"

- **Second Mastermind here is a REAL, full-strength Mastermind, not reduced.** It is a randomly chosen Mastermind card placed into the game at its **normal Attack/strength**. The scheme does NOT reduce its strength — it only controls how many **Tactics** it has: it starts with **one** Tactic (Twist 1), and gains another on each of Twists 2–4 (up to four Tactics) **if still in play**. So unlike an *ascended* villain-Mastermind (no Tactics, one defeat), the Dark Alliance second Mastermind is fought like a normal Mastermind — you defeat it by fighting through however many Tactics it has accumulated.
- **"Twist 7: Evil Wins"** is the scheme's lose condition: when the 7th Scheme Twist is played, the Mastermind completes the Scheme and **all players lose immediately** (the Secret Wars insert/What If? p.15 "Evil Wins" rule: don't finish the turn). Note: 8 Twists are in the deck but **Twist 7 ends the game** — the 8th is effectively never reached. This is a race: defeat both Masterminds before the 7th Twist surfaces.
- CONFIDENCE: **SETTLED** (card text verbatim). One caveat flagged for human spot-check: the card text does not itself restate "normal strength" — that the added Mastermind uses its own printed strength is the default rule (a Mastermind added to the game uses its own card), INFERRED from absence of any reduction clause. Worth a Pass-3 eyeball on the physical card if available.

---

## Q5 — Master of Tyrants scheme (confirm interpretation)

CONFIRMED. Inventory verbatim (`secret-wars-vol1.md` lines 857–861):
> "Master of Tyrants
> Setup: 8 Twists. Choose 3 other Masterminds, and shuffle their 12 Tactics into the Villain Deck. Those Tactics are 'Tyrant Villains' with their printed Attack and no abilities.
> Twists 1-7: Put this Twist under a Tyrant Villain as 'Dark Power.' It gets +2 Attack.
> Twist 8: All Tyrant Villains in the city escape.
> Evil Wins: When 5 Tyrant Villains escape."

- The interpretation in the prompt is **correct**: Master of Tyrants takes **3 OTHER Masterminds' 12 Tactic cards** (4 each) and shuffles them into the Villain Deck as **"Tyrant Villains" — printed Attack, NO abilities.** It does NOT create a second active Mastermind, no Master Strikes, no second win condition. It needs **NO multiple-mastermind support** — these are just special Villains in the Villain Deck.
- CONFIDENCE: **SETTLED** (card text verbatim).

---

## Q6 — Verify interpretation calls

### 6a — Teleport
CONFIRMED (corrected nuance). Secret Wars insert ("Teleport", p.1) verbatim:
> "'Teleport' means 'Instead of playing this card, you may set it aside. At the end of this turn, add it to your new hand as an extra card.'"

- So Teleport = **set the card aside; at end of turn add it to your NEW hand as an extra card** — NOT "put on top of your deck." The inventory's New Keywords line ("Put this card on top of your deck") is a **simplification that conflicts with the actual insert text** — the insert is authoritative. Mechanically the difference matters: a Teleported card comes back THIS turn's-end into your next hand as a bonus card, it is not just placed on the deck to be drawn whenever.
- CONFIDENCE: **SETTLED** (insert verbatim). FLAG: inventory's keyword gloss is wrong/oversimplified — use the insert wording in implementation.

### 6b — Cross-Dimensional Rampage
CONFIRMED. Secret Wars insert ("Cross-Dimensional Rampage", p.1) verbatim:
> "'Cross-Dimensional Hulk Rampage' means 'Each player reveals one of their Hulk Heroes or a Hulk card in their Victory Pile or gains a Wound.'
> • This counts any card that includes 'Hulk' in its card name or Hero name, plus the alternate Hulks 'Maestro' and 'Nul, Breaker of Worlds.' (from Legendary: Fear Itself)
> • Likewise, 'Cross-Dimensional Wolverine Rampage' counts any card with 'Wolverine,' 'Weapon X,' or 'Old Man Logan.'"

- Wording is **"each PLAYER"** (NOT "each other player"). In 1-player solo it applies to **the active (only) player** — you reveal a matching-character Hero/Victory-Pile card or gain a Wound. (Contrast: the solo "each other player → do it yourself" rule is for "each OTHER player" effects; "each player" already includes you, so no translation needed — but the net solo behavior is the same: the active player resolves it.)
- Character-matching confirmed: **Hulk** = any "Hulk" in card/Hero name + "Maestro" + "Nul, Breaker of Worlds." **Wolverine** = any card with "Wolverine," "Weapon X," or "Old Man Logan." (So Old Man Logan and Apocalyptic Weapon X both satisfy a Wolverine Rampage.)
- CONFIDENCE: **SETTLED** (insert verbatim).

### 6c — Sidekicks one-per-turn limit
CONFIRMED. Secret Wars insert ("Sidekicks", p.1) verbatim:
> "Secret Wars adds a new Sidekick Stack to the game. Players can pay to recruit up to one Sidekick per turn. When card effects tell you to 'gain Sidekicks,' that doesn't count against that one-per-turn limit."

- So: the **one-per-turn cap applies only to RECRUITING (paying Recruit for) a Sidekick.** Card effects that "**gain** a Sidekick" (e.g., Magik's Rally the New Mutants, King of Wakanda's three Sidekicks) **do NOT count against the limit** — you can gain multiple via effects in the same turn and still recruit one with Recruit.
- CONFIDENCE: **SETTLED** (insert verbatim).

---

## Other in-scope ascend triggers (for completeness)
Only **two** in-scope sources add a second Mastermind: **Apocalyptic Magneto Escape** (villain ascend, Domain of Apocalypse) and the **Dark Alliance** scheme. All Deadlands/Wasteland ascend villains (Zombie Loki, Zombie Mr. Sinister, Zombie Thanos, Wasteland Kingpin) and the "Dark Apprentice" Ambition are **deferred this build** — same mechanic, but out of scope now.

---

## Decision-relevant summary (plain English)

Is multiple-masterminds-in-solo officially defined, or is it our call?
- **What If? Solo: officially defined — copy it.** The What If? rulebook (p.19) spells out the whole "ascend" mechanic: an ascended villain becomes a second Mastermind with no Tactics, you defeat it with a single fight at its printed villain Attack, both Masterminds fire their Master Strikes each Master Strike (player picks order), and you win only when ALL Masterminds are defeated. Nothing in the solo section overrides this, so What If? Solo is settled.
- **Golden Solo: our design call.** Golden Solo's one-page ruleset never mentions a second Mastermind; its win condition (defeat the Mastermind 4× → Final Showdown) assumes exactly one. So we decide how a second Mastermind fits. **Smallest faithful approach:** treat the ascended/added Mastermind as an *additional* enemy that must also be defeated, using the What If? template — its Master Strike fires alongside the main one, and the main Mastermind keeps its normal 4-defeats + Final Showdown flow. For an *ascended villain* (Magneto): one extra fight at Attack 8 to clear it. For *Dark Alliance*: the second Mastermind is a real Mastermind with 1–4 Tactics (gained on Twists 1–4) at its own normal strength; Twist 7 = instant loss, so it's a race.

Smallest faithful way to honor the two in-scope cards:
- **Apocalyptic Magneto:** on Escape, register a second "Mastermind" object whose only ability is the granted Master Strike, defeat value = printed Attack 8, one fight, then it's a normal VP-6 villain in the Victory Pile. Win now requires defeating both. Its Master Strike fires on each Master Strike.
- **Dark Alliance:** add a random real second Mastermind, give it 1 Tactic on Twist 1 and +1 Tactic on each of Twists 2–4 (if still in play, cap 4), both Masterminds capture a Bystander on Twists 5–6, and Twist 7 = Evil Wins (instant loss). The second Mastermind uses its own normal strength; win requires defeating both.

ONE thing to double-check (flagged): the inventory's **Teleport** gloss ("put on top of your deck") contradicts the authoritative insert ("set aside; add to your new hand at end of turn as an extra card") — implement the insert wording, not the inventory's. Also worth a physical-card Pass-3 confirm that Dark Alliance's second Mastermind is full-strength (no printed reduction; inferred from absence).

---

# BATCH 2 — Spec OPEN-QUESTIONS adjudication (2026-06-22, Rules Oracle)
These map to the FROZEN spec's "OPEN QUESTIONS" Q2–Q7 (different numbering from the Batch-1 Q's above). Solo-framed; both modes noted where they diverge.

## SPEC-Q2 — Colossus of Future Past: "Don't play a Villain card at the beginning of next turn." → SKIP ONE villain card
- **Card (inventory/spec):** Sentinel Territories — Colossus of Future Past, Fight: "*Colossus changes the future:* Don't play a Villain card at the beginning of next turn." Attack 5 / VP 3.
- **Ruling: skip exactly ONE villain card next turn** (implementer's rec HOLDS). "A Villain card" = a single card. The Core turn structure's villain phase is "Step 1) Play the top card of the Villain Deck" — "play a Villain card" is the rulebook's own name for revealing/resolving ONE villain-deck card, NOT the whole phase. The card says "a Villain card" (singular), so it removes one such reveal.
- **Solo translation of the draw count:**
  - **Golden Solo:** draws 2 villain cards/round (Golden Solo ruleset p.1, "Villain Deck Gameplay": "draw TWO cards instead of one"). Colossus → next round draw **1** instead of 2.
  - **What If? Solo:** the solo villain phase plays **1** villain card/turn (What If? p.24 solo setup uses the normal single villain-deck draw; the 2 extra Henchmen are a first-turn setup add, not the per-turn count). Colossus → next turn the single villain card is **skipped** (0 played that turn). Mechanically identical primitive ("decrement next turn's villain plays by 1"), different baseline.
- **Note:** It's the same as the existing "bystander discard to prevent ONE new villain card" lever (Golden Solo ruleset p.1, "Bystander Discard": "prevent ONE new villain card from being drawn"). Reuse that decrement primitive. Stacks cumulatively if two Colossus copies are fought (−2).
- SOURCE: Core Set p.6/8 (villain phase = "play the top card of the Villain Deck", singular); Golden Solo ruleset p.1; What If? p.24.
- CONFIDENCE: **SETTLED** (singular wording + rulebook's own "play a villain card" = one reveal).

## SPEC-Q3 — Crush Them With My Bare Hands: Master-Strike counting under multiple masterminds → ONE event per trigger
- **Card (inventory/spec):** "Evil Wins: When 8 Master Strikes have taken effect." Each of its 5 Twists "becomes a Master Strike that takes effect immediately."
- **Ruling: count ONE per Master-Strike TRIGGER, not one per mastermind** (implementer's rec HOLDS). The keystone rule (What If? p.19 / insert p.1) says on each Master Strike, *each* Mastermind fires *its* Master Strike *ability* — that's about resolving each mastermind's ABILITY, not multiplying the count of "Master Strikes." A Master Strike (the event — a Twist becoming one, or a natural Master Strike card surfacing) is a single occurrence; the multi-mastermind rule just makes that one occurrence resolve N abilities. "8 Master Strikes have taken effect" counts Master-Strike events.
- **Caveat (worth a Pass-3/physical-card eyeball):** the rulebooks do NOT explicitly define whether the scheme counter is "events" or "ability resolutions." This is an INFERENCE from the natural-language distinction (a Master Strike is the trigger; "each Mastermind does its Master Strike ABILITY" is the resolution). The 1-event reading is the standard community/RAW reading and avoids the scheme self-accelerating purely from a 2nd mastermind. But it is not nailed by a verbatim rulebook line.
- **Also confirmed:** 5 Twists alone can't reach 8 — natural Master Strike cards from the villain deck also increment the counter. (Counter must capture both sources.)
- SOURCE: What If? p.19 (multiple-mastermind Master Strike resolution); insert p.1.
- CONFIDENCE: **INFERRED** (1-event is the faithful/standard reading; rulebooks don't spell out the counter's unit. Recommend building it as 1-per-event and flagging to Paul that this is an interpretation, not a quoted rule.)

## SPEC-Q4 — Black Bolt "Destructive Whisper": reveal source → FROM HAND
- **Card (inventory/spec):** "You get +1 Attack if you reveal four cards with no rules text."
- **Ruling: reveal from your HAND** (implementer's rec HOLDS). Legendary's "reveal N [trait] cards" abilities reveal from the player's HAND by default (the hand is the only place "reveal" a held card makes sense). Contrast the sibling card Hypersonic Scream, which explicitly scopes to "you played this turn" — Destructive Whisper deliberately OMITS that qualifier, so it is not a played-this-turn count; it's a reveal-from-hand check. Reveal 4 no-rules-text cards from hand → +1 Attack; can't reveal four → no bonus.
- **Caveat:** there is no Secret Wars insert or Core rulebook line that defines a generic "reveal" keyword source — this rests on Legendary convention + the deliberate contrast with Hypersonic Scream's wording, NOT a quoted rule. The "no rules text" predicate itself is a build-time scope decision (which whole-game cards get the flag), separate from this source question.
- SOURCE: card text contrast (inventory `secret-wars-vol1.md`); Legendary reveal-from-hand convention. No verbatim rulebook definition of "reveal" source exists in Core/insert.
- CONFIDENCE: **INFERRED** (from-hand is the strongly-supported convention + the Hypersonic-Scream contrast; not a quoted rulebook line — flag as interpretation).

## SPEC-Q5 — Lady Thor "Once per turn" scope → ONCE TOTAL PER TURN per card title
- **Cards (inventory/spec):** Mysterious Origin / Chosen by Asgard / Living Thunderstorm — each "Once per turn, if you made at least 6 Recruit this turn, [draw / +2 Attack / +6 Attack]."
- **Ruling: "Once per turn" = the effect fires at most once that turn** (implementer's rec HOLDS in substance). The phrase gates THE EFFECT to one resolution per turn. Practically: a second copy of the SAME title played the same turn grants nothing additional from that title's once-per-turn effect.
- **Important nuance for the build:** "Once per turn" in Legendary is per-EFFECT/per-card-title, but it does NOT pool across DIFFERENT titles. The three Lady Thor cards are three DISTINCT once-per-turn effects — playing Mysterious Origin AND Chosen by Asgard AND Living Thunderstorm the same turn (≥6 Recruit) fires ALL THREE (draw + 2 Attack + 6 Attack), each once. So implement the guard per-card-title (one flag per title), not one global Lady-Thor flag.
- **Caveat:** Marvel Legendary has no single rulebook glossary entry quoting "Once per turn." This is the consistent published-card convention (each "Once per turn" effect = once per turn for that effect). Treat as SETTLED-by-convention; the per-title (not pooled-across-titles) detail is the load-bearing implementation point.
- SOURCE: card text (inventory `secret-wars-vol1.md`); standard Legendary keyword convention.
- CONFIDENCE: **SETTLED** (convention is unambiguous and uniform across the game; per-title guard is the correct build).

## SPEC-Q6 — Superior to Others: equal-cost tie → DRAW NOTHING
- **Card (inventory/spec):** "[RANGED]: Look at the top two cards of your deck. If one of them has a higher cost than the other, draw it. Put the rest back in any order."
- **Ruling: on an equal-highest-cost tie, draw NOTHING — both cards go back on top in any order** (implementer's rec HOLDS). The draw is conditional: "IF one of them has a higher cost than the other, draw it." On a tie, neither card "has a higher cost than the other," so the condition is false → no card is drawn → "put the rest back" (here: both) on top. Dead-draw outcome confirmed.
- SOURCE: card text (inventory `secret-wars-vol1.md`) — the conditional "if ... higher ... than the other" is self-resolving on a tie.
- CONFIDENCE: **SETTLED** (pure card-text logic; no rule needed).

## SPEC-Q7 — Build an Army of Annihilation Twist: escalation / VP-recycle → CONFIRMED
- **Card (inventory/spec):** "Setup: 9 Twists. Put 10 extra [Annihilation] Henchmen in [the] KO pile. Twist: KO all Annihilation Henchmen from the players' Victory Piles. Stack this Twist next to the Scheme. Then, for each Twist in that stack, put an Annihilation Henchman from the KO pile next to the Mastermind. Players can fight those Henchmen. Evil Wins: When there are 10 Annihilation Henchmen next to the Mastermind." (M.O.D.O.K. stand-in already settled — not re-litigated.)
- **Ruling: escalation + VP-recycle reading is CORRECT.** Each Twist: (1) any Annihilation Henchmen sitting in the player's Victory Pile are KO'd back out (recycle VP→KO pool); (2) the Twist is stacked next to the Scheme; (3) "for each Twist in that stack" → place that-many Annihilation Henchmen (from the KO pool) next to the Mastermind. So the count placed escalates with the Twist-stack size: Twist 1 places 1, Twist 2 places 2, etc. Because step (1) clears any you've defeated-into-VP back to the pool first, the number standing next to the Mastermind is re-derived each Twist (bounded by available pool / by 10). Evil Wins when 10 stand next to the Mastermind simultaneously.
- **Subtlety the build must honor (RAW):** "for each Twist in that stack, put an Annihilation Henchman" places one PER TWIST IN THE STACK each time — combined with step (1) emptying your VP-captured ones back to the pool, the next-to-Mastermind count is effectively `min(twistStackSize, poolAvailable)` re-evaluated each Twist. Defeating them buys a one-turn reprieve but they come back (and grow) next Twist. This is a pure escalation race.
- **"players' Victory Piles" in solo:** = the single (active) player's Victory Pile. No "each other player" issue here ("players'" possessive includes you).
- SOURCE: card text (inventory `secret-wars-vol1.md`); escalation logic is self-contained in the Twist wording.
- CONFIDENCE: **SETTLED** for the mechanical escalation/recycle (card text is explicit). The M.O.D.O.K. substitution is a separate, already-settled design call (not re-opened here).

# BATCH 6 — Ghost Racers KO-zone: "one of your Heroes" (2026-06-25, Rules Oracle; relayed by coordinator)

## Ghost Racers Fight — "KO one of your Heroes with an Attack icon" → CONTROLLED HEROES (hand + played + artifacts); discard/deck/VP EXCLUDED
- **Card (inventory):** "Fight: Reveal a [COVERT] Hero or KO one of your Heroes with an Attack icon." (Ghost Racers henchman, ×10, Attack 3 / VP 1.)
- **Question:** What zones does "one of your Heroes" cover for the KO? (Hand only? + played this turn? + discard? + deck?)
- **Ruling: "your Heroes" = the Heroes you currently control = your HAND + the cards you have PLAYED this turn (+ Artifacts in play). Your DECK, DISCARD PILE, and Victory Pile are EXCLUDED.** This is rulebook-STATED, not inferred: Core p.16 ("Your Heroes" / play area) defines the Heroes you have as the cards in your hand plus the cards you've played this turn; Core p.15 ("KO") operates on cards you can KO from those zones. Cards in your deck or discard pile are not "your Heroes" for a generic "one of your Heroes" instruction — an effect that wants the discard pile names it explicitly (as the sibling M.O.D.O.K.s does: "KO a Hero from your discard pile or the HQ"). That explicit-naming contrast is a CORROBORATOR, not the primary authority (the primary authority is the Core "your Heroes" zone definition).
- **Attack-icon filter:** the "with an Attack icon" clause NARROWS the eligible pool within those zones; it does NOT widen the zones. If no controlled Hero carries an Attack icon, that branch cannot be chosen — the player takes the Covert-reveal branch, or if neither is payable, does as much as possible (here: nothing). Matches the standard "do as much as you can" handling.
- **Solo note:** single-player — no "each other player" dimension; "your Heroes" = the active (only) player's controlled Heroes.
- SOURCE: Core rulebook p.15 ("KO"), p.16 ("Your Heroes" / play area); corroborated by the M.O.D.O.K.s explicit-discard contrast (inventory `secret-wars-vol1.md`).
- CONFIDENCE: **SETTLED** (rulebook-stated zone definition, not convention/inference). Implemented in SWV1 Phase 3f (`ghostRacersFight` → `koControlledHeroByIdentity` over Artifacts+Hand+Played with `attackIcon===true`, excluding discard), commit `40081cb`.

# BATCH 7 — Dark Alliance scheme (multiple-Masterminds consumer) (2026-06-26, Rules Oracle; rulings relayed by coordinator/Paul)

Scheme "Dark Alliance" (SWV1): "Setup: 8 Twists. / T1: Add a random second Mastermind with one Tactic. / T2-4: if the 2nd MM is still in play, it gains another Tactic. / T5-6: Each Mastermind captures a Bystander. / T7: Evil Wins!" Implemented Phase 3e.

## Q-A — Random 2nd-Mastermind eligible pool → **Core/base-Set Masterminds only (this build)**
- **Ruling (DESIGN DECISION, not a rules constraint — Paul, 2026-06-26):** the rulebook imposes NO constraint on which Mastermind is added; "a random Mastermind" means any. This build deliberately ships the eligible pool as **Core Set Masterminds only** (low-hanging fruit), with an **extensible opt-in marker** (`darkAllianceEligible: true` per Mastermind) so widening the pool later is a one-flag change, not a picker rewrite.
- **Technical filters:** exclude the currently-selected MAIN Mastermind; use the base (non-Epic) side.
- **Final included pool (5):** Dr. Doom, Loki, Red Skull, Magneto, Mephisto.
- **Drops:** ZERO. `alwaysLeads` (themed villain/henchman group) is NOT a drop criterion — EVERY Mastermind in the game carries an `alwaysLeads` group, so treating it as "an unmeetable setup condition" would empty the pool. A 2nd MM added mid-game brings only its Tactics + Master Strike (no group); all 5 Core Masterminds' strikes/tactics are self-contained (verified: no group-presence dependency in their effect fns). The themed group simply isn't added — cosmetically absent, functionally irrelevant. *(Diverges from the literal "drop alwaysLeads" example in the brief; reported to coordinator.)*
- **Known cosmetic nuance (non-blocking):** Mephisto's "wound → top of deck" quirk (`defaultWoundDraw`) keys on the MAIN Mastermind only, so as a 2nd MM that quirk does not apply. Magneto's `recruitXMen` base over-credit (Finding A / base-bug B6) ships consistent with base.
- SOURCE: design decision (rules-silent); pool membership = Core Set fact. CONFIDENCE: **SETTLED** (scope choice).

## Q-B — T5-6 "Each Mastermind captures a Bystander" → from the **Bystander STACK**, literal "each" includes the MAIN MM
- **Ruling (SETTLED):** the captured Bystander comes from the **Bystander Stack** (the supply), NOT the villain-deck bystander flow. "Each Mastermind" is LITERAL and includes the **main Mastermind** → with the 2nd MM still in play, Twists 5 and 6 EACH capture 2 Bystanders (main + 2nd). No Golden/What-If divergence. Guard the empty-stack case: if the Bystander Stack is empty, that capture is a no-op.
- SOURCE: Core rulebook p.10 (Mastermind captures a Bystander), p.14 (Bystander rescued on Tactic/Mastermind defeat), p.15 (the Bystander Stack is the supply). CONFIDENCE: **SETTLED**.

## Q-C — Ascended Mastermind keeps captured Bystanders → **INFERENCE (no printed rule)**
- **Ruling (SETTLED, SILENT):** the rulebook says nothing about an ascended/added Mastermind retaining Bystanders it captured as a villain. The existing "it KEEPS them (ascension isn't escape; rescued on its defeat)" ruling stands as a sound inference. Closest adjacent printed text: Core p.9 ("Bystanders move with the villain card"). Recorded as **inference, not printed rule** (Finding C).
- SOURCE: inference; adjacent Core p.9. CONFIDENCE: **SETTLED (as inference).**

## Q-D — 2nd-MM Tactic Fight effects resolve; VP lives on Tactics, not the MM card
- **Ruling (SETTLED):** (1) when you KO/clear a 2nd Mastermind's Tactic by fighting it, that Tactic's **Fight effect RESOLVES** exactly like any Mastermind Tactic → engine must wire `resolveTacticEffects` into the secondary-MM defeat path (GAP-K). (2) Victory Points live on the **Tactic cards, NOT the Mastermind card** → a fully-defeated full 2nd MM's terminal card is worth **0 VP** (its accrued Tactics already carried the VP into the Victory Pile). (3) The 2nd MM is defeated when its ACTUAL accrued Tactic count (1-4, however many it gained over T1-4) is cleared — do NOT hardcode 4.
- SOURCE: Core rulebook p.14 (Tactic Fight effect + Tactic VP), p.21 (Mastermind-card VP is Final-Showdown-only). CONFIDENCE: **SETTLED**.

# BATCH 8 — Phase 3e chunk 2: the 5 remaining in-scope Schemes (2026-06-26; rulings relayed by coordinator/Paul)
Source = Secret Wars insert p.1 + Core p.8–10/13/15 + the scheme card text; solo-framed. Two cut schemes (Fragmented Realities, Smash Two Dimensions Together) stay OUT of scope.

## ① CRUSH THEM WITH MY BARE HANDS
- One Master Strike EVENT = 1 toward the 8, even with multiple Masterminds (insert: one event, each MM fires its ability → still ONE event for counting). Natural villain-deck Master Strikes ALSO count toward 8 alongside the 5 twist-strikes. Solo "+1 Villain Group" is the `extraVillainGroups` mechanism (Golden base 2→3; What If? bakes the +1 into `requiredVillains`).
- CONFIDENCE: **SETTLED** (1-event-per-trigger is the BATCH-2 SPEC-Q3 reading; recorded there as the faithful/standard reading).

## ② PAN-DIMENSIONAL PLAGUE
- Wound stays with the HQ **SLOT** (not the Hero), re-seeded each twist. Recruiting a Wound-flagged Hero resolves the wound AT the recruit instant (gain it, or pay 1 Recruit → return to the Wound Stack). TWO destinations: twist "KO all wounds next to HQ" → **KO pile**; recruit pay-1 → **Wound Stack**. Loss counts ONLY Wound-Stack depletion (KO'd wounds do NOT return to the stack).
- **SLOT-keyed, NOT hero-bonded — DO NOT "correct" back (Coordinator + Paul ruling, 2026-06-26).** The wound belongs to the HQ space, not the Hero card sitting in it. WHY this matters and must not be reverted: in Golden Solo the HQ rotates every round (1 added right, 1 removed left). If the wound were bonded to the Hero, a wounded Hero rotating OFF the HQ would carry the wound OUT of the HQ into undefined places (player deck/discard/KO). The scheme's loss is metered SOLELY by Wound-Stack depletion with no refill except the pay-1 recruit option — so a wound leaking out of the HQ corrupts that accounting (the stack count no longer reflects the real board). Slot-keyed keeps every wound IN the HQ where the scheme manages it (re-seed each twist; KO-all-next-to-HQ each twist). A future session or the Phase-4 audit might "intuitively" re-bond wounds to heroes — that REINTRODUCES the leak bug. Verified via `/game-test` rotation case 2026-06-26 (chunk 2a close-out): wound stays in HQ through rotation, count integrity holds.
- CONFIDENCE: **SETTLED**; slot-keyed attachment is **INFERRED** but the faithful low-bookkeeping reading (rationale above).

## ③ CORRUPT THE NEXT GENERATION OF HEROES
- (a) Solo "each player returns a Sidekick from discard" → you return one if present, else skip [INFERRED]. (b) Dynamic Attack (2 + Twists stacked next to this Scheme) applies to Sidekick-Villains in BOTH the Villain Deck and the city [SETTLED]. Defeat a Sidekick → gain it to the TOP of your deck (not VP).
- CONFIDENCE: a INFERRED, b SETTLED.

## ④ BUILD AN ARMY OF ANNIHILATION
- Loss = SIMULTANEOUS count of Annihilation Henchmen next to the Mastermind (re-derived each twist = stack size), NOT cumulative; defeated henchmen → your VP pile (normal), lowering the count.
- ⚠️ FLAG: inventory says 9 Twists but the loss needs 10 next to the MM — coordinator verifying the twist count before chunk 2c. **DO NOT build ④ until cleared.**

## ⑤ MASTER OF TYRANTS
- "Choose 3 other MMs" = random excluding the main (Core pool, DESIGN default). Dark Power STACKS (+2 Attack each, cumulative on the same Tyrant).
- ⚠️ Tyrant-Villain defeat VP = INFERRED 0 (verify pending before chunk 2d). **DO NOT build ⑤ until cleared.**
