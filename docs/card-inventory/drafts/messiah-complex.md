<!-- INVENTORY STATUS:
  Heroes: ✅
  Villains: ✅
  Masterminds: ✅
  Schemes: ✅
  Henchmen: ✅
  Bystanders/Sidekicks: ✅
  Last updated: 2026-06-21
-->

# Messiah Complex — Card Inventory

**Primary source**: Card images in `expansions/messiah-complex/` (effect text + card titles) — card art is authoritative for effect text and titles.
**Cross-check**: `expansions/messiah-complex/messiah-complex-reference.md` (BGG-derived; authoritative for structured fields). Rules PDF: `expansions/messiah-complex/Lgd_MessiahComplex_Rulesheet_Compressed.pdf`.
**Pass 1 date**: 2026-06-21
**Pass 2 status**: Pending — run `/inventory-verifier` in a fresh session

> **Set composition (per reference):** 200 cards — 8 Heroes (14 cards each), 3 Masterminds (5 cards each), 4 Villain Groups (8 cards each), 2 Henchmen Groups (10 cards each), 4 double-sided Veiled/Unveiled Schemes (8 sides), 7 special Sidekicks (2 each), 3 special Bystanders (1 each). Teams used: X-Men, X-Force, X-Factor (and villains reference "Brotherhood").

---

## New Keywords

- **Clone**: "You may gain another copy of this card from the HQ. If there are none in the HQ, you may gain a copy from the Hero Deck and shuffle it." ("Gain" = put into your discard pile.) Cloning a S.H.I.E.L.D. Officer/Sidekick searches+shuffles that stack instead.
  - **"When Recruited: Clone"**: use the Clone immediately when you recruit the Hero (after putting it in discard + refilling its HQ space). Only triggers on a true recruit, not on "gain"/"put in hand" — so the gained copy doesn't chain further clones.
  - **"When Recruited — [ICON]: Clone"**: use only if you played a matching-class/team Hero earlier this turn before recruiting this card.
  - **Clone (Villain)**: "Ambush: Clone" = search the Villain Deck for a copy of this Villain; it enters the city ignoring further Clone effects; shuffle the deck. (For Predator X, use the first Predator X found.) If no copy is found, move on.
- **Shatter**: "Halve that enemy's current Attack (round up). Lasts until end of turn." Can be applied multiple times (re-halving). "Shatter a Villain" can't target a Mastermind; "Shatter the Mastermind" lasts for one fight against it. A few effects Shatter a Hero in the HQ (halving current cost, round up).
- **Tactical Formation NNN**: usable only if you have Heroes of exactly those costs (e.g. "445" = two cost-4 Heroes and one cost-5). Counts the Tactical-Formation card itself, played Heroes, and Heroes in hand. (This is a card-cost condition, NOT a class-played superpower trigger.)
- **Investigate**: "Look at the top two cards of your deck. Reveal a [matching] card from among them and draw it. Put the rest back on top and/or bottom of your deck in any order." (Draw only one even if both match; if at least one matches, you must reveal+draw one.) Some effects Investigate other decks (Villain/Hero/Bystander/Sidekick) and specify what to do with the found card.
- **Prey / Finish the Prey**: "Ambush: Prey on the fewest/most [trait]." After the Villain enters the Sewers, each player reveals their hand; it Preys on the player with the fewest (Reavers) or most (Purifiers) of that trait (current player breaks ties). It sits in front of that player. Any player may still fight it; but if it isn't defeated by the end of the preyed-on player's turn, do its **Finish the Prey** effect against that player (after they draw their new hand), then it enters the Sewers ignoring its Ambush. Multiple enemies can prey on a player at once.
- **Chivalrous Duel**: to fight an enemy with this keyword, you may only use Attack from a **single Hero Name** (can't combine Attack across different Hero names; non-Hero Attack sources don't count).
- **Veiled / Unveiled Schemes**: all 4 schemes are double-sided. Start each game with the **Veiled** side face up. At the trigger ("This Scheme Transforms into a random Unveiled Scheme"), remove the Veiled scheme from the game and replace it with a **randomly selected Unveiled Scheme from all you own** (could be this card's own back, or a different card's Unveiled side). Then do its Twist effect.

---

## Section 1: Structured Data Tables

### Heroes

> **⚠️ Non-standard copy distribution:** the four "clone" heroes (**Multiple Man, Shatterstar, Stepford Cuckoos, M**) use **4/4/4/2** copies (three cards ×4 + one card ×2 = 14), NOT the standard 5/5/3/1. There is no 5-copy or 1-copy card for these heroes — the DB `rarity` field will need special mapping. The other four heroes (Strong Guy, Warpath, Siryn, Rictor) use the standard 5/5/3/1.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Multiple Man | Me, Myself, and I | clone ×4 ⚠️ | 4 | 4 | X-Factor | Instinct | 0 | 2 |
| Multiple Man | Finding Myself | clone ×4 ⚠️ | 4 | 4 | X-Factor | Tech | 1 | 0 |
| Multiple Man | Perfect Match | clone ×4 ⚠️ | 4 | 4 | X-Factor | Tech | 1+ | 0 |
| Multiple Man | Reabsorb Duplicates | clone ×2 ⚠️ | 2 | 4 | X-Factor | Instinct | 2 | 0 |
| Shatterstar | Strive for Greatness | clone ×4 ⚠️ | 4 | 3 | X-Force | Instinct | 0 | 2+ |
| Shatterstar | Gladiator's Blades | clone ×4 ⚠️ | 4 | 5 | X-Force | Instinct | 2 | 0 |
| Shatterstar | Bioelectric Surge | clone ×4 ⚠️ | 4 | 5 | X-Force | Range | 2+ | 0 |
| Shatterstar | Gene-Spliced Creation | clone ×2 ⚠️ | 2 | 5 | X-Force | Instinct | 2 | 0 |
| Stepford Cuckoos | Find Mutants with Cerebro | clone ×4 ⚠️ | 4 | 2 | X-Men | Tech | 1 | 0 |
| Stepford Cuckoos | Shared Thoughts | clone ×4 ⚠️ | 4 | 2 | X-Men | Covert | 1+ | 0 |
| Stepford Cuckoos | Telepathic Warning | clone ×4 ⚠️ | 4 | 3 | X-Men | Range | 2+ | 0 |
| Stepford Cuckoos | Mind Wipe | clone ×2 ⚠️ | 2 | 3 | X-Men | Range | 2+ | 0 |
| M | Uncover Family Secrets | clone ×4 ⚠️ | 4 | 3 | X-Factor | Covert | 0 | 2 |
| M | Penance Form | clone ×4 ⚠️ | 4 | 3 | X-Factor | Strength | 2+ | 0 |
| M | Three Sisters Combined | clone ×4 ⚠️ | 4 | 3 | X-Factor | Strength | 0+ | 0 |
| M | Interweaving Powers | clone ×2 ⚠️ | 2 | 3 | X-Factor | Covert | 2+ | 0 |
| Strong Guy | X-Factor Investigations | Common A | 5 | 4 | X-Factor | Strength | 0 | 2 |
| Strong Guy | Absorb Kinetic Energy | Common B | 5 | 5 | X-Factor | Strength | 3 | 0 |
| Strong Guy | Go Big | Uncommon | 3 | 4 | X-Factor | Strength | 2+ | 0 |
| Strong Guy | Treasure Hunt | Rare | 1 | 8 | X-Factor | Strength | 3 | 0 |
| Warpath | Grim Tracker | Common A | 5 | 2 | X-Force | Instinct | 1 | 0 |
| Warpath | Endless Endurance | Common B | 5 | 5 | X-Force | Strength | 0 | 0 |
| Warpath | Dangerous Maneuver | Uncommon | 3 | 2 | X-Force | Covert | 0+ | 0 |
| Warpath | Superhuman Senses | Rare | 1 | 7 | X-Force | Instinct | 3+ | 0 |
| Siryn | Echolocation | Common A | 5 | 2 | X-Factor | Covert | 1 | 0 |
| Siryn | Hypnotic Call | Common B | 5 | 4 | X-Factor | Covert | 2 | 0 |
| Siryn | Three-Octave Arpeggio | Uncommon | 3 | 6 | X-Factor | Range | 4 | 0 |
| Siryn | Splintering Shriek | Rare | 1 | 8 | X-Factor | Covert | 0 | 0 |
| Rictor | Underground Cave-In | Common A | 5 | 3 | X-Factor | Range | 2 | 0 |
| Rictor | Unearth Tectonic Power | Common B | 5 | 5 | X-Factor | Instinct | 2 | 0 |
| Rictor | Trace the Fault Lines | Uncommon | 3 | 4 | X-Factor | Range | 0 | 2 |
| Rictor | Massive Earthquake | Rare | 1 | 7 | X-Factor | Range | 0 | 0 |

**Attack / Recruit notation:** fixed `3`; `0+` = base 0 modified by ability; `[#]+` = base plus conditional bonus; `0` = none of that stat / no printed base value; `⚠️` = uncertain. Cards with no printed lower-left value (Endless Endurance, Splintering Shriek, Massive Earthquake) recorded `0`/`0`.

---

### Villains

Standard villain group total: **8 cards** each.

**Reavers** (8 cards) — all use **Prey** (on the FEWEST of a class) / **Finish the Prey**

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Reavers | Donald Pierce | 2 | 6 | 4 |
| Reavers | Bonebreaker | 2 | 5 | 3 |
| Reavers | Skullbuster | 2 | 5 | 3 |
| Reavers | Pretty Boy | 2 | 2 | 2 |

**Purifiers** (8 cards) — all use **Prey** (on the MOST) / **Finish the Prey**; the 5 Predator X also have **Clone**

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Purifiers | Predator X (Covert) | 1 | 3 | 2 |
| Purifiers | Predator X (Instinct) | 1 | 3 | 2 |
| Purifiers | Predator X (Ranged) | 1 | 3 | 2 |
| Purifiers | Predator X (Strength) | 1 | 3 | 2 |
| Purifiers | Predator X (Tech) | 1 | 3 | 2 |
| Purifiers | Leper Queen | 1 | 4 | 2 |
| Purifiers | Reverend William Stryker | 1 | 5 | 3 |
| Purifiers | Cameron Hodge | 1 | 6 | 4 |

*The 5 Predator X each Prey on the MOST of one Hero class (matching their name). The 3 named Purifiers Prey on the MOST X-Men + X-Force + X-Factor + Brotherhood (four team icons).*

**Acolytes** (8 cards) — all have asterisk Attack + a self-**Shatter** payment mechanic (see effects)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Acolytes | Unuscione | 2 | 8* | 4 |
| Acolytes | Tempo | 2 | 16* | 2 |
| Acolytes | Frenzy | 2 | 12* | 3 |
| Acolytes | Random | 2 | 10* | 4 |

**Clan Yashida** (8 cards) — all have **Chivalrous Duel** and asterisk Attack

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Clan Yashida | Silver Samurai | 2 | 3* | 3 |
| Clan Yashida | Scarlet Samurai | 2 | 3* | ⚠️ none printed |
| Clan Yashida | Lord Shingen | 2 | 4* | 5 |
| Clan Yashida | Gorgon | 2 | 5* | 4 |

*⚠️ Scarlet Samurai is a dual Villain/Hero card (Fight: gain it as a Hero) — its villain side prints no VP (see flags). ⚠️ Clan Yashida asterisk-Attacks have no controlling text printed on the cards (unlike the Acolyte self-Shatter lines) — meaning of `*` for Yashida is a Pass-2 / rules question.*

---

### Masterminds

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| Lady Deathstrike | 8 | 6 | Reavers |
| Epic Lady Deathstrike | 11 | 6 | Reavers |
| Bastion, Fused Sentinel | 4+ | 6 | Purifiers and any Sentinel Henchmen Group |
| Epic Bastion, Fused Sentinel | 6+ | 6 | Purifiers and any Sentinel Henchmen Group |
| Exodus | 32* | 7 | Acolytes |
| Epic Exodus | 36* | 7 | Acolytes |

```
Lady Deathstrike Tactics:
  Cybernetic Healing Factor, Prey on the Weak, Relentless Assassin, Stretching Adamantium Claws

Bastion, Fused Sentinel Tactics (each ascends to an additional Mastermind; prints an ascended-form Attack):
  Master Mold, Sentinel Factory (4+); Template, Infected Sentinel (5+); Nimrod, Future Sentinel (6+); Machine Man, Sentinel Supreme (7+)

Exodus Tactics:
  Unite All Mutantkind, Omega-Level Mutant, Avalon Asteroid Haven, Resurrect the Dead
```

*Bastion `4+`/`6+` and tactic `4+/5+/6+/7+` reflect the per-Master-Strike-in-KO passive / ascended-form Attack. Exodus `32*`/`36*` reflects the Shatter-payment passive.*

---

### Schemes (Veiled / Unveiled — 4 double-sided cards = 8 sides)

| Scheme Name (side) | Twist Count | Bystander Count |
|---|---|---|
| Hack Cerebro Servers to… (Veiled) | 10 | — (not on card) |
| Drain Mutants' Powers to… (Veiled) | 11 | — (not on card) |
| Hire Singularity Investigations to… (Veiled) | 9 | — (not on card) |
| Raid Gene Banks to… (Veiled) | 8 | — (not on card) |
| …Control the Mutant Messiah (Unveiled) | — (transform target) | — |
| …Open Rifts to Future Timelines (Unveiled) | — (transform target) | — |
| …Reveal the Heroes' Evil Clones (Unveiled) | — (transform target) | — |
| …Unleash an Anti-Mutant Bioweapon (Unveiled) | — (transform target) | — |

*Physical card pairings (front Veiled / back Unveiled), but transform-to-unveiled is RANDOM in play: Hack Cerebro↔Control the Mutant Messiah; Drain Mutants' Powers↔Open Rifts to Future Timelines; Hire Singularity Investigations↔Reveal the Heroes' Evil Clones; Raid Gene Banks↔Unleash an Anti-Mutant Bioweapon. No scheme card prints a bystander count.*

---

### Henchmen (2 groups, 10 cards each)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Mr. Sinister Clones | Mr. Sinister Clones | 10 | 3 | 1 |
| Sentinel Squad O*N*E* | Sentinel Squad O*N*E* | 10 | 2 | 1 |

---

### Bystanders (3 special, 1 each)

| Card Name | Count | VP |
|---|---|---|
| Private Investigator | 1 | 1 |
| Opera Singer | 1 | 1 |
| Cloning Technician | 1 | 1 |

### Sidekicks (7 special, 2 each)

| Sidekick | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|
| Layla Miller | 2 | 2 | X-Factor | Tech | 1 | 0 |
| Skids | 2 | 2 | X-Men | Covert | 0 | 3 |
| Rockslide | 2 | 2 | X-Men | Strength | 0 | 0 |
| Darwin | 2 | 2 | X-Factor | Instinct | 0+ | 0+ |
| Boom-Boom | 2 | 2 | X-Force | Range | 0+ | 0 |
| Prodigy | 2 | 2 | X-Men | Tech | 0 | 0 |
| Rusty "Firefist" Collins | 2 | 2 | X-Men | Range | 1 | 0 |

---

## Section 2: Card Effects

---

### Heroes

---

### Multiple Man

**Me, Myself, and I** (×4)
- SPECIAL ABILITY: 2 Recruit. Tactical Formation 444: Draw a card.
- SUPERPOWER: [X-FACTOR] ⚠️: Clone *(⚠️ image read = X-Factor team icon; BGG reference says Instinct — inline-icon conflict, verify Pass 2)*

**Finding Myself** (×4)
- SPECIAL ABILITY: 1 Attack. Investigate for a card that has the same card name as any of your cards. (You don't need to choose a specific card name before you Investigate.)
- SUPERPOWER: [TECH]: Clone

**Perfect Match** (×4)
- SPECIAL ABILITY: 1+ Attack. You get +1 Attack for each card name that you played at least twice this turn.
- SUPERPOWER: [TECH]: Clone

**Reabsorb Duplicates** (×2)
- SPECIAL ABILITY: 2 Attack. Tactical Formation 44: You may KO a card from your hand or discard pile.
- SUPERPOWER: [X-FACTOR]: Clone

### Shatterstar

**Strive for Greatness** (×4)
- SPECIAL ABILITY: 2+ Recruit. When Recruited — [INSTINCT]: Clone.
- SUPERPOWER: [INSTINCT]: You get another +2 Recruit usable only to recruit Heroes that cost 5 or more.

**Gladiator's Blades** (×4)
- SPECIAL ABILITY: 2 Attack. When Recruited — [INSTINCT]: Clone.
- SUPERPOWER: [INSTINCT]: Draw a card.

**Bioelectric Surge** (×4)
- SPECIAL ABILITY: 2+ Attack. When Recruited — [RANGE]: Clone.
- SUPERPOWER: Tactical Formation 55: You get +1 Attack. *(below the divider; Tactical Formation is a cost condition, not a class trigger)*

**Gene-Spliced Creation** (×2)
- SPECIAL ABILITY: 2 Attack. When Recruited — X-Force: Clone.
- SUPERPOWER: [RANGE],[INSTINCT]: Shatter the Mastermind. *(two inline triggers — most error-prone; verify Pass 2)*

### Stepford Cuckoos

**Find Mutants with Cerebro** (×4)
- SPECIAL ABILITY: 1 Attack. When Recruited: Clone.
- SUPERPOWER: [TECH]: Investigate the Sidekick Stack for a card and put it in your discard pile.

**Shared Thoughts** (×4)
- SPECIAL ABILITY: 1+ Attack. When Recruited: Clone.
- SUPERPOWER: Tactical Formation 22: You get +1 Attack. Tactical Formation 33: Investigate for a card with an Attack icon. *(Tactical Formation lines, not class triggers)*

**Telepathic Warning** (×4)
- SPECIAL ABILITY: 2+ Attack. When Recruited: Clone.
- SUPERPOWER: Tactical Formation 22: You get +1 Attack. Tactical Formation 33: Reveal the top card of the Villain Deck. If it's a Master Strike, you get +1 Attack and you may shuffle the Villain Deck.

**Mind Wipe** (×2)
- SPECIAL ABILITY: 2+ Attack. When Recruited: Clone.
- SUPERPOWER: Tactical Formation 223: Reveal the top card of the Villain Deck. If it's a Villain, you get +2 Attack and you may fight it this turn. If you fight it, put a card from the Bystander stack on top of the Villain Deck.

### M

**Uncover Family Secrets** (×4)
- SPECIAL ABILITY: 2 Recruit. When Recruited — [COVERT]: Clone.
- SUPERPOWER: Investigate for a card that costs 3. *(below divider; no class trigger)*

**Penance Form** (×4)
- SPECIAL ABILITY: 2+ Attack. When Recruited — [STRENGTH]: Clone.
- SUPERPOWER: If you have a Wound in your hand or discard pile, KO it and you get +1 Attack. Otherwise, gain a Wound.

**Three Sisters Combined** (×4)
- SPECIAL ABILITY: 0+ Attack. When Recruited — [STRENGTH]: Clone.
- SUPERPOWER: Draw a card. Tactical Formation 333: You get +2 Attack.

**Interweaving Powers** (×2)
- SPECIAL ABILITY: 2+ Attack. When Recruited — X-Factor: Clone.
- SUPERPOWER: Tactical Formation 3333: You get +3 Attack.

### Strong Guy

**X-Factor Investigations** (Common A) *(card prints plural "Investigations"; reference singular)*
- SPECIAL ABILITY: 2 Recruit. Investigate for a card that's [STRENGTH] and/or X-Factor.
- SUPERPOWER: NA

**Absorb Kinetic Energy** (Common B)
- SPECIAL ABILITY: 3 Attack. If any player would gain a Wound, you may discard this card instead. If you do, draw two cards.
- SUPERPOWER: NA

**Go Big** (Uncommon)
- SPECIAL ABILITY: 2+ Attack. Tactical Formation 445: You get +3 Attack.
- SUPERPOWER: NA

**Treasure Hunt** (Rare)
- SPECIAL ABILITY: 3 Attack. Investigate for one of these options, then a different option, then a third different option: a [STRENGTH] card; an X-Factor card; a card that costs 4; a card that costs 5.
- SUPERPOWER: NA

### Warpath

**Grim Tracker** (Common A)
- SPECIAL ABILITY: 1 Attack. Choose a number 1 or more. Investigate for a card of that cost.
- SUPERPOWER: NA

**Endless Endurance** (Common B)
- SPECIAL ABILITY: When you draw a new hand of cards at the end of this turn, draw two extra cards.
- SUPERPOWER: NA

**Dangerous Maneuver** (Uncommon)
- SPECIAL ABILITY: 0+ Attack. Reveal the top card of your deck. If it costs 0, you may KO it. Tactical Formation 225: You get +3 Attack.
- SUPERPOWER: NA

**Superhuman Senses** (Rare)
- SPECIAL ABILITY: 3+ Attack. Whenever you "reveal" or "look at" any number of cards from your deck this turn, you get +1 Attack. (Just drawing or discarding a card from your deck doesn't count.) Choose a number 1 or more. Investigate for a card of that cost.
- SUPERPOWER: NA

### Siryn

**Echolocation** (Common A)
- SPECIAL ABILITY: 1 Attack. Choose a Hero Class. Investigate for a card of that Hero Class.
- SUPERPOWER: NA

**Hypnotic Call** (Common B)
- SPECIAL ABILITY: 2 Attack.
- SUPERPOWER: [COVERT]: Shatter each Hero currently in the HQ whose printed cost is 2, 4, 6, and/or 8.

**Three-Octave Arpeggio** (Uncommon)
- SPECIAL ABILITY: 4 Attack. Tactical Formation 246: Shatter all Villains.
- SUPERPOWER: NA

**Splintering Shriek** (Rare)
- SPECIAL ABILITY: Shatter the Mastermind. KO up to two cards from your hand and/or discard pile.
- SUPERPOWER: NA

### Rictor

**Underground Cave-In** (Common A)
- SPECIAL ABILITY: 2 Attack.
- SUPERPOWER: [RANGE]: Shatter a Villain in the Sewers.

**Unearth Tectonic Power** (Common B)
- SPECIAL ABILITY: 2 Attack. Investigate for a card that's [RANGE] and/or [INSTINCT].
- SUPERPOWER: NA

**Trace the Fault Lines** (Uncommon)
- SPECIAL ABILITY: 2 Recruit.
- SUPERPOWER: [RANGE]: Investigate for a card that costs 0. KO it or discard it.

**Massive Earthquake** (Rare)
- SPECIAL ABILITY: Shatter the Mastermind or Shatter all Heroes currently in the HQ.
- SUPERPOWER: NA

---

### Villains

---

### Reavers

**Donald Pierce** (×2)
Ambush: Prey on the fewest [TECH].
Finish the Prey: KO one of that player's non-grey Heroes.
Fight: KO one of your grey Heroes.
Attack: 6 | VP: 4

**Bonebreaker** (×2)
Ambush: Prey on the fewest [STRENGTH].
Finish the Prey: That player gains a Wound to the top of their deck.
Fight: Reveal the top card of your deck. KO it or draw it.
Attack: 5 | VP: 3

**Skullbuster** (×2)
Ambush: Prey on the fewest [RANGE]. Skullbuster captures one Bystander from the Bystander Stack and two Bystanders from that player's Victory Pile of their choice.
Finish the Prey: KO the captured Bystanders, and each player discards a card.
Attack: 5 | VP: 3

**Pretty Boy** (×2)
Ambush: Prey on the fewest [COVERT].
Finish the Prey: That player discards a card.
Fight: Discard the top card of your deck. If it has a Recruit icon, you get +1 Recruit and this Villain Preys on the fewest [COVERT].
Attack: 2 | VP: 2

### Purifiers

**Predator X (Covert)** (×1)
Ambush: Prey on the most [COVERT]. Clone.
Finish the Prey: That player discards a [COVERT] Hero. If they can't, they discard any non-grey Hero instead.
Attack: 3 | VP: 2

**Predator X (Instinct)** (×1)
Ambush: Prey on the most [INSTINCT]. Clone.
Finish the Prey: That player discards an [INSTINCT] Hero. If they can't, they discard any non-grey Hero instead.
Attack: 3 | VP: 2

**Predator X (Ranged)** (×1)
Ambush: Prey on the most [RANGE]. Clone.
Finish the Prey: That player discards a [RANGE] Hero. If they can't, they discard any non-grey Hero instead.
Attack: 3 | VP: 2

**Predator X (Strength)** (×1)
Ambush: Prey on the most [STRENGTH]. Clone.
Finish the Prey: That player discards a [STRENGTH] Hero. If they can't, they discard any non-grey Hero instead.
Attack: 3 | VP: 2

**Predator X (Tech)** (×1)
Ambush: Prey on the most [TECH]. Clone.
Finish the Prey: That player discards a [TECH] Hero. If they can't, they discard any non-grey Hero instead.
Attack: 3 | VP: 2

**Leper Queen** (×1)
Ambush: Prey on the most X-Men + X-Force + X-Factor + Brotherhood.
Finish the Prey: That player gains a Wound and KOs two Bystanders from their Victory Pile.
Fight: Shuffle two cards from the Bystander Stack into the Villain Deck.
Attack: 4 | VP: 2

**Reverend William Stryker** (×1)
Ambush: Prey on the most X-Men + X-Force + X-Factor + Brotherhood. Stryker captures one Sidekick from the Sidekick Stack and two Sidekicks from that player's hand and/or discard pile of their choice.
Finish the Prey: KO the captured Sidekicks.
Fight: Gain the captured Sidekicks.
Attack: 5 | VP: 3

**Cameron Hodge** (×1)
Ambush: Prey on the most X-Men + X-Force + X-Factor + Brotherhood. Cameron Hodge captures one of that player's non-grey Heroes of their choice.
Finish the Prey: KO the captured Hero.
Fight: Choose a player to gain the captured Hero.
Attack: 6 | VP: 4

### Acolytes

**Unuscione** (×2)
You may pay 2 Recruit any number of times to Shatter Unuscione.
Ambush: Unuscione captures a Bystander.
Attack: 8* | VP: 4

**Tempo** (×2)
You may Shatter Tempo any number of times. Each time you do this, draw one fewer card when you draw a new hand of cards at the end of this turn.
Fight: Draw two cards.
Attack: 16* | VP: 2

**Frenzy** (×2)
You may pay 1 Recruit any number of times to Shatter Frenzy. Each time you do, reveal the top card of the Hero Deck and put it on the bottom of that deck. If it's [STRENGTH], gain a Wound. If it's [INSTINCT], the player on your right gains a Wound.
Fight: KO one of your Heroes.
Attack: 12* | VP: 3

**Random** (×2)
You may pay 1 Recruit any number of times to Shatter Random. Each time you do, reveal the top card of the Hero Deck and put it on the bottom of that deck. If it's [COVERT], [TECH], or [RANGE], Random then gets +Attack equal to that card's cost.
Escape: Each player discards a card at random.
Attack: 10* | VP: 4

### Clan Yashida

**Silver Samurai** (×2)
Chivalrous Duel
Ambush: The Villain in the city worth the most VP captures a Bystander.
Fight: KO a card from your discard pile. *(⚠️ this Fight line is on the card but MISSING from the reference)*
Attack: 3* | VP: 3

**Scarlet Samurai** (×2) — Villain side
Chivalrous Duel
Fight: Gain this as a Hero.
Attack: 3* | VP: ⚠️ none printed (see flags)

**Scarlet Samurai** — Hero side (gained on Fight)
Team: Crime Syndicate | Class: Instinct
- 2 Attack
- [INSTINCT]: Draw a card.
*(No cost — gained as a Hero, not recruited.)*

**Lord Shingen** (×2)
Chivalrous Duel
Ambush: Lord Shingen captures a Bystander. Bystanders held by Lord Shingen are "Samurai Bodyguards." You can't fight Lord Shingen while he has any Bodyguards. You can fight them as if they were 3 Attack Villains with "Chivalrous Duel. Fight: Rescue this as a Bystander."
Attack: 4* | VP: 5

**Gorgon** (×2)
Chivalrous Duel
Ambush: Choose a Hero Name. You can't play Heroes this turn unless they are that Hero Name or grey Heroes.
Fight: KO one of your Heroes.
Attack: 5* | VP: 4

---

### Masterminds

---

### Lady Deathstrike

**Lady Deathstrike** (Normal)
Always Leads: Reavers
Master Strike: If she is Preying on a player, Finish the Prey. Otherwise, Prey on the fewest [INSTINCT].
Finish the Prey: That player gains two Wounds. Each other player discards two cards. (1-player game: Instead, gain a Wound and discard a card.)
Attack: 8 | VP: 6

**Epic Lady Deathstrike**
Always Leads: Reavers
Master Strike: If she is Preying on a player, Finish the Prey. Then, whether she was preying or not, Prey on the fewest [INSTINCT].
Finish the Prey: That player gains Wounds to the top and bottom of their deck. Each other player discards down to three cards. (1-player game: Instead, gain a Wound and discard two cards.)
Attack: 11 | VP: 6

**Cybernetic Healing Factor** (Tactic)
Fight: If this is not the final Tactic, and if Lady Deathstrike was not Preying on a player: KO up to two of your Heroes, rescue 4 Bystanders, and shuffle this Tactic back into her remaining Tactics.

**Prey on the Weak** (Tactic)
Fight: Each Villain that's Preying on a player Finishes the Prey. After those have all entered the city, then each Villain in the city with a "Prey" Ambush does that Ambush, starting from the Sewers.

**Relentless Assassin** (Tactic)
Fight: If Lady Deathstrike was not Preying on a player, each other player reveals their hand. She Preys on the one of those players with the fewest non-grey Heroes.

**Stretching Adamantium Claws** (Tactic)
Fight: You may KO one of your Heroes. If you have an [INSTINCT] Hero, you may instead KO up to two of your Heroes.

---

### Bastion, Fused Sentinel

**Bastion, Fused Sentinel** (Normal)
Passive: All Sentinel Masterminds get +1 Attack for each Master Strike in the KO pile, even after Bastion is defeated.
Always Leads: Purifiers and any Sentinel Henchmen Group.
Master Strike: A card from the Bystander Stack ascends to become a 3 Attack "Prime Sentinel" Mastermind with "Fight: Rescue this. Master Strike: Each player reveals the top card of their deck and discards it if it costs 1 or more."
Attack: 4+ | VP: 6

**Epic Bastion, Fused Sentinel**
Passive: All Sentinel enemies get +1 Attack for each Master Strike in the KO pile, even after Bastion is defeated. *(⚠️ Epic card prints "enemies"; Normal Bastion + reference say "Masterminds" — see flags)*
Always Leads: Purifiers and any Sentinel Henchmen Group.
Master Strike: A card from the Bystander Stack ascends to become a 4 Attack "Prime Sentinel" Mastermind with "Fight: Rescue this. Master Strike: Each player reveals the top card of their deck and KOs it if it costs 1 or more."
Attack: 6+ | VP: 6

**Master Mold, Sentinel Factory** (Tactic → ascending Mastermind)
Fight: Rescue three Bystanders. KO one of your Heroes. Master Mold ascends to become an additional Mastermind whose only ability is:
  Master Strike: A Sentinel Henchman from the Villain Deck enters the city. Shuffle the Villain Deck.
Attack: 4+

**Template, Infected Sentinel** (Tactic → ascending Mastermind)
Fight: Rescue three Bystanders. KO one of your Heroes. Template ascends to become an additional Mastermind whose only ability is:
  Master Strike: Each player reveals a [COVERT] Hero or discards one of their non-grey Heroes.
Attack: 5+

**Nimrod, Future Sentinel** (Tactic → ascending Mastermind)
Fight: Rescue three Bystanders. KO one of your Heroes. Nimrod ascends to become an additional Mastermind whose only abilities are:
  Master Strike: Choose Recruit or Attack. Each player discards a card with the chosen icon.
Attack: 6+

**Machine Man, Sentinel Supreme** (Tactic → ascending Mastermind)
Fight: Rescue three Bystanders. KO one of your Heroes. Machine Man ascends to become an additional Mastermind whose only ability is:
  Master Strike: Each player reveals a [TECH] Hero or gains a Wound.
Attack: 7+

---

### Exodus

**Exodus** (Normal)
Passive: You may pay 3 Recruit any number of times to Shatter Exodus.
Always Leads: Acolytes
Master Strike: Choose X-Men, X-Force, X-Factor, or Brotherhood. Each player discards one of those Heroes or gains a Wound.
Attack: 32* | VP: 7

**Epic Exodus**
Passive: Any number of times, you may Shatter Exodus by spending 2 Recruit plus 1 Recruit for each Immortality stacked here.
Always Leads: Acolytes
Master Strike: Stack this Strike next to Exodus as an "Immortality." Choose X-Men, X-Force, X-Factor, or Brotherhood. Each player KOs one of those Heroes or gains a Wound to the top of their deck.
Attack: 36* | VP: 7

**Unite All Mutantkind** (Tactic)
Fight: Each other player chooses one of their X-Men, X-Force, X-Factor, or Brotherhood Heroes to enter the city as a Villain with Attack equal to its cost and "Fight: Gain this as a Hero." If no card enters the city this way, then each player gains a Wound.

**Omega-Level Mutant** (Tactic)
Fight: Each other player reveals their hand, discards all their cards that cost 1 or more, then draws that many cards.

**Avalon, Asteroid Haven** (Tactic)
Fight: You may gain an X-Men, X-Force, X-Factor, or Brotherhood Hero from the HQ. Each other player discards two cards that aren't any of those teams.

**Resurrect the Dead** (Tactic)
Fight: Choose a player. That player gains an X-Men, X-Force, X-Factor, or Brotherhood Hero from the KO pile, then chooses a Non-Henchmen Villain from their Victory Pile to enter the city.

---

### Schemes

---

**Hack Cerebro Servers to…** (Veiled)
Setup: 10 Twists.
Twist 1-5: Put a card from the Bystander Stack next to this Scheme as a "Hacker." KO a Hero from the HQ with cost equal to the number of Hackers. If you KO'd a Hero this way, stack this Twist next to the Mastermind as "Stolen Cerebro Data."
Twist 6: Put the Hackers on the bottom of the Bystander Stack. This Scheme Transforms into a random Unveiled Scheme. Do its Twist effect.

**…Control the Mutant Messiah** (Unveiled) *(reference Main-list "Manipulate" is an internal error; card prints "Control")*
When revealed: Twists stacked next to the Mastermind are "Manipulations." Shuffle a random extra Hero into a face down "Mutant Messiah" stack.
Twist: Add this Twist to the Manipulations. Investigate the Mutant Messiah stack for a card and set it aside. This turn you may gain that card to the top of your deck by spending Recruit equal to its cost, +1 Recruit for each Manipulation. If you don't, then put that card into a "Fallen Messiah" stack next to the Scheme.
Evil Wins: When there are 3 cards in the Fallen Messiah stack or the Villain Deck runs out.

**Drain Mutants' Powers to…** (Veiled)
Setup: 11 Twists.
Twist 1-6: Stack the top two cards of the Sidekick Stack face down next to the Scheme as "Kidnapped Mutants." If there were any Kidnapped Mutants already there, put those on the bottom of the Sidekick Stack and put this Twist next to the Mastermind as a "Drained Power."
Special Rules: Players may spend 3 Recruit or 3 Attack to gain a Kidnapped Mutant.
Twist 7: KO all Kidnapped Mutants. This Scheme Transforms into a random Unveiled Scheme. Do its Twist effect.

**…Open Rifts to Future Timelines** (Unveiled)
When revealed: Shuffle a random additional Villain Group into the Villain Deck. Twists stacked next to the Mastermind are "Temporal Rifts."
Twist: Add this Twist to the Temporal Rifts. Then reveal and set aside cards from the Villain Deck equal to the number of Temporal Rifts. Play a Henchman you revealed, then play the Villain you revealed that is worth the most VP. Shuffle the other set aside cards into the Villain Deck. (If the Villain Deck runs out during this, that doesn't end the game.)
Evil Wins: When there are 7 Temporal Rifts or the Villain Deck runs out.

**Hire Singularity Investigations to…** (Veiled) *(filename says "Investigators"; card prints "Investigations")*
Setup: 9 Twists.
Twist 1-4: If there are any "Singularity Investigators" in the city, stack this Twist next to the Mastermind as a "Dark Discovery." Whether you did that or not, Investigate the Bystander Stack for a card and have it enter the city as a "Singularity Investigator" Villain. It has 6 Attack and "Fight: Rescue this as a Bystander. Then KO one of your Heroes. Then Investigate your deck for a card with a Recruit icon."
Twist 5: This Scheme Transforms into a random Unveiled Scheme. Do its Twist effect.

**…Reveal the Heroes' Evil Clones** (Unveiled)
When revealed: Twists stacked next to the Mastermind are "Cloning Breakthroughs."
Twist: Add this Twist to the Cloning Breakthroughs. The top card of the Hero Deck enters the city as an "Evil Clone" Villain. Clone a copy of it from the HQ or Hero Deck as another Evil Clone. *(⚠️ image: "from the HQ or Hero Deck"; reference: "from the Hero Deck" — verify Pass 2)*
Special Rules: Each Evil Clone has Attack equal to its cost plus the number of Cloning Breakthroughs. It has "Fight: A player gains this as a Hero. KO one of your Heroes."
Evil Wins: When there are 7 Evil Clones in the city and/or Escape Pile, or the Villain Deck or Hero Deck runs out.

**Raid Gene Banks to…** (Veiled)
Setup: 8 Twists.
Twist 1-3: If there is a Villain in the Bank, stack this Twist next to the Mastermind as a "Mutant Genome." Otherwise, move a Villain from another city space to the Bank.
Twist 4: This Scheme Transforms into a random Unveiled Scheme. Do its Twist effect.

**…Unleash an Anti-Mutant Bioweapon** (Unveiled)
When revealed: Twists stacked next to the Mastermind are "Bioweapon Adaptations."
Twist: Add this Twist to the Bioweapon Adaptations. Then for each card in that stack, choose a different number from 2-6. KO all Heroes from the HQ that have any of those costs.
Evil Wins: When there are 15 non-grey Heroes in the KO pile or the Villain Deck or Hero Deck runs out.

---

### Henchmen

---

### Mr. Sinister Clones

**Mr. Sinister Clones** (×10)
Ambush: Clone. When the cloned copy enters the city, shuffle a Bystander into the Villain Deck.
Fight: Clone the next Hero you recruit this turn that has printed cost 4 or less.
Attack: 3 | VP: 1

### Sentinel Squad O*N*E*

**Sentinel Squad O*N*E*** (×10)
Ambush: If there are no other Sentinel Squad O*N*E*s in the city, Clone.
Fight: If there are no other Sentinel Squad O*N*E*s in the city, KO one of your Heroes and put this Villain on the bottom of the Villain Deck.
Attack: 2 | VP: 1

---

### Bystanders

---

**Private Investigator** (×1)
When you rescue this Bystander, choose Recruit or Attack. Investigate for a card with that icon.
VP: 1

**Opera Singer** (×1)
When you rescue this Bystander, Shatter a Villain in the Bank or Shatter a Hero in the HQ space under the Bank.
VP: 1

**Cloning Technician** (×1)
When you rescue this Bystander, Clone the next Hero you recruit this turn that has printed cost 3 or less.
VP: 1

---

### Sidekicks

---

**Layla Miller** (×2)
X-Factor | Tech
- 1 Attack
- Choose a team. Investigate for a card of that team.
- Put this on the bottom of the Sidekick Stack.
Cost: 2

**Skids** (×2)
X-Men | Covert
- 3 Recruit
- If any player would gain a Wound, you may discard this card instead. If you do, draw two cards.
- Put this on the bottom of the Sidekick Stack.
Cost: 2

**Rockslide** (×2)
X-Men | Strength
- Shatter a Villain.
- Put this on the bottom of the Sidekick Stack.
Cost: 2

**Darwin** (×2)
X-Factor | Instinct
- 0+ Recruit / 0+ Attack
- If the most recent other Hero you played this turn has a Recruit icon, you get +2 Recruit. If it has an Attack icon, you get +2 Attack. (If both, you get both.) *(card wording "most recent other"/"an"; reference paraphrases "previously"/"a")*
- Put this on the bottom of the Sidekick Stack.
Cost: 2

**Boom-Boom** (×2)
X-Force | Range
- 0+ Attack *(⚠️ on card art; reference omits a base value — verify Pass 2)*
- Choose one of her nicknames:
  - "Time Bomb": You get +1 Attack and put this on top of your deck.
  - "Boomer": You get +3 Attack and put this on the bottom of the Sidekick Stack.
  - "Meltdown": You get +4 Attack, KO this, and gain a Wound.
Cost: 2

**Prodigy** (×2)
X-Men | Tech
- Play this card as a copy of another Hero you played this turn that costs 6 or less. This card is both Tech and the Hero Class you copy.
- Put this on the bottom of the Sidekick Stack.
Cost: 2

**Rusty "Firefist" Collins** (×2)
X-Men | Range
- 1 Attack
- Investigate your deck for a card that costs 0. KO it or discard it.
- Put this on the bottom of the Sidekick Stack.
Cost: 2

---

## Pass 1 Flags Summary (for Pass 2 / Pass 3)

**Resolved (no action, recorded for context):**
1. **Warlock-equivalent title checks:** Strong Guy common prints "X-Factor **Investigations**" (plural; reference singular) → image wins. Scheme "Hire Singularity **Investigations**" (filename `Investigators` wrong). Unveiled scheme "…**Control** the Mutant Messiah" (reference Main-list "Manipulate" wrong). Cloning Technician (not "Clone Technician"). Rusty "Firefist" Collins (full printed name). Sentinel Squad O*N*E* (reference effect-text typo "Squard").
2. Reference typos corrected from card art throughout (Pretty Boy "get", Stryker "one Sidekick", Epic LDS "their deck", Epic Exodus "plus"/"Immortality", Stretching Claws "your Heroes").

**Open ⚠️ — need spot-check:**
3. **Multiple Man "Me, Myself, and I" clone trigger:** image read = **X-Factor** team icon; BGG reference says **Instinct**. Recorded X-Factor (image-primary) but this is an inline-icon conflict — Pass 2 must confirm (the other clone-heroes' triggers matched reference; this is the lone conflict). Also re-check Gene-Spliced Creation's two-icon trigger [RANGE],[INSTINCT].
4. **Scarlet Samurai VP** — NO VP printed on the villain side of the card OR in the reference. Likely a no-VP dual Villain/Hero card, but confirm against physical card / rules.
5. **Silver Samurai Fight line** — card prints "Fight: KO a card from your discard pile"; reference OMITS it. Image wins; confirm.
6. **Epic Bastion passive** — card prints "All Sentinel **enemies**"; Normal Bastion + reference say "**Masterminds**." Meaningful gameplay difference (enemies = all Sentinel villains/henchmen/masterminds). Resolve against rules PDF.
7. **Clan Yashida asterisk-Attacks (3*/3*/4*/5*)** — no controlling text on the cards (unlike Acolyte self-Shatter lines). Determine what `*` means for Yashida (likely Shatter-able / Chivalrous-Duel-related) via rules PDF.
8. **"…Reveal the Heroes' Evil Clones" Twist** — image "Clone a copy of it from the HQ or Hero Deck"; reference "from the Hero Deck." Image wins; confirm.
9. **Boom-Boom base value** — 0+ Attack on card art; reference omits it. Confirm.
10. **Sidekick base-value convention** — Rockslide and Prodigy have no printed lower-left value (recorded 0). Confirm `0` vs `—` for the DB.

**Structural notes for implementation (not errors):**
11. **Non-standard clone-hero distribution (4/4/4/2)** for Multiple Man, Shatterstar, Stepford Cuckoos, M — DB `rarity` field needs special mapping (no 5-copy or 1-copy card).
12. **"Brotherhood" team** appears on Purifiers/Exodus cards — not catalogued in `icon-reference.md` (identified as Magneto-helmet icon). New team reference for this set.
13. **Tactical Formation** below-divider effects on clone heroes are recorded in the SUPERPOWER slot by card position, but Tactical Formation is a card-cost condition, not a class-played superpower — the engine should treat it as its own conditional.
14. **Bastion tactics ascend to additional Masterminds**; their `4+/5+/6+/7+` is the ascended-form Attack, not a cost.
15. **Class terminology:** "Ranged" recorded as **Range** per DB convention throughout.
