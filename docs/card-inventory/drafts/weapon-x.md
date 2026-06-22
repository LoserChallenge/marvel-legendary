<!-- INVENTORY STATUS:
  Heroes: ✅
  Villains: ✅
  Masterminds: ✅
  Schemes: ✅
  Henchmen: — (none in expansion)
  Bystanders/Sidekicks: — (none in expansion)
  Enraging Wounds: ✅
  Last updated: 2026-04-05
-->

# Weapon X — Card Inventory

**Primary source**: `expansions/weapon-x/weapon-x-reference.md` (BGG community wiki) — foremost authority for all fields (reference-first protocol).
**Cross-check**: Card images in `expansions/weapon-x/` (verification/backup).
**Pass 1 date**: 2026-04-05
**Pass 2 status**: ✅ Complete 2026-06-21 — verified clean against the reference. Heroes (16), Masterminds (18), Schemes (3), Enraging Wounds (10) all clean, zero corrections. Two open Pass-3 items, both villains: (1) per-card copy counts — reference says "(? copies)", so the per-card split is unconfirmed. Rulesheet checked 2026-06-21: confirms "2 Villain Groups of 8 cards each" but gives no per-card breakdown. Group totals correct (Berserkers 8, Weapon Plus 8); exact per-card split needs a physical-card count. (2) Feral has no villain-side VP — confirmed by design (dual card → becomes a Hero on defeat), not missing data. Pass-3 spot-check 2026-06-22 (8 cards across all types incl. Three Brains, Metabolic Overdrive, Violent Conditioning, Wild Child, Typhoid Mary, Epic Romulus, Wipe Heroes' Memories, Last Breath) confirmed all clean — Wild Child's "Fail:" line is correctly recorded.

---

## New Keywords

- **Berserk** (Hero): "Discard the top card of your deck. You get +Attack equal to the discarded card's printed Attack." (Printed "2+ Attack" counts as 2.) Berserk gives no benefit from printed Recruit or Piercing. Multiple Berserk keywords (e.g., "Berserk, Berserk, Berserk") discard that many cards in sequence.
- **Berserk** (Villain/Enemy): "When you try to fight an Enemy that has Berserk, discard the top card of your deck. That Enemy gets +Attack equal to the discarded card's printed Attack." If your total Attack is still enough, you defeat the Enemy normally. If not, you don't defeat the Enemy, you lose all your Attack points, and you can't fight anymore this turn. You can still play cards and recruit. You must have enough Attack to match the Enemy's printed Attack before attempting. Once you start to fight, you can't play more cards until the fight is complete.
- **Fail**: "Do the 'Fail' effect if you try to fight that Enemy but the Berserk Attack bonus causes you to fail." Only triggers on a failed Berserk fight attempt.
- **Weapon X Sequence** (Hero): "You get +Attack equal to the longest sequence of different printed cost numbers on your cards." Counts both played cards and cards in hand. Sequence must be consecutive (e.g., 2-3-4 = +3). Each number must be one higher than the previous. Duplicates don't help. Can start at any number including 0.
- **Weapon X Sequence** (Enemy): "This Enemy gets +Attack equal to the longest sequence of different printed cost numbers among cards in the HQ."
- **Doubled Weapon X Sequence**: Double the bonus from Weapon X Sequence.
- **Enraging Wounds**: 10 unique Wound cards that replace some normal Wounds in the Wound Deck. Each provides Attack (and sometimes Recruit) when played, with a play cost and/or a Healing condition. **Healing**: A conditional KO — when the stated condition is met this turn, you may KO the Enraging Wound.

---

## Section 1: Structured Data Tables

### Heroes

Standard distribution per hero: 1 Rare (1 copy), 1 Uncommon (3 copies), 2 Commons (5 copies each) = 14 cards total.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Fantomex | Sentient Bullets | Common A | 5 | 1 | X-Force | Ranged | 0+ | 0 |
| Fantomex | Three Brains | Common B | 5 | 2 | X-Force | Tech | 0 | 0+ |
| Fantomex | Misdirection | Uncommon | 3 | 3 | X-Force | Covert | 0+ | 0 |
| Fantomex | Weapon XIII | Rare | 1 | 4 | X-Force | Tech | 1+ | 0 |
| Marrow | Hyper-Adaptive Skeleton | Common A | 5 | 2 | X-Force | Strength | 1+ | 1+ |
| Marrow | Bone Shards | Common B | 5 | 3 | X-Force | Ranged | 2+ | 0 |
| Marrow | Osteogenesis | Uncommon | 3 | 6 | X-Force | Strength | 2 | 1 |
| Marrow | Metabolic Overdrive | Rare | 1 | 7 | X-Force | Covert | 3+ | 0 |
| Weapon H | The Future of Warfare | Common A | 5 | 3 | Avengers | Strength | 2+ | 0 |
| Weapon H | Evolving Abilities | Common B | 5 | 4 | Avengers | Instinct | 2+ | 0+ |
| Weapon H | Slice and Smash | Uncommon | 3 | 5 | Avengers | Strength | 2+ | 0 |
| Weapon H | Ultimate Killing Machine | Rare | 1 | 8 | Avengers | Strength | 4+ | 0 |
| Weapon X (Wolverine) | Raging Regeneration | Common A | 5 | 4 | Marvel Knights | Instinct | 2+ | 0 |
| Weapon X (Wolverine) | Infuse Skeleton with Adamantium | Common B | 5 | 5 | Marvel Knights | Tech | 2+ | 0 |
| Weapon X (Wolverine) | Violent Conditioning | Uncommon | 3 | 3 | Marvel Knights | Instinct | 2+ | 0 |
| Weapon X (Wolverine) | Escape the Weapon X Lab | Rare | 1 | 6 | Marvel Knights | Instinct | 3+ | 0 |

> ⚠️ Violent Conditioning (Weapon X Wolverine Uncommon): cost 3 is lower than both Commons (cost 4 and 5) — atypical ordering; verify against physical card.

---

### Villains

Both groups are **8 cards each** (verified against reference total: 100 cards = 56 hero + 16 villain + 15 mastermind + 10 wounds + 3 schemes).

> ⚠️ **Copy counts unknown**: Reference lists "?" for all villain copy counts. Estimates below are based on standard distribution patterns. All copy counts need physical card verification.

**Berserkers** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Berserkers | Cyber | 2⚠️ | 5+ | 5 |
| Berserkers | Feral | 2⚠️ | 3+ | ⚠️ |
| Berserkers | Thornn | 2⚠️ | 3+ | 2 |
| Berserkers | Wild Child | 2⚠️ | 3+ | 4 |

> All Berserkers have one or more Berserk keywords. Fight values have "+" to reflect the Berserk bonus enemies gain when you try to fight them.
> ⚠️ Feral VP: Reference does not list a VP value. Feral is a dual-nature card (Villain → Hero when defeated). Card image agent reading suggested VP 3, but this needs physical verification.
> Feral hero side: X-Force team, Instinct class, 2+ Attack, SUPERPOWER: [INSTINCT]: Berserk, Berserk.

**Weapon Plus** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Weapon Plus | Daken | 1⚠️ | 3+ | 4 |
| Weapon Plus | Huntsman (Weapon XII) | 2⚠️ | 2+ | 2 |
| Weapon Plus | Nuke (Weapon VII) | 2⚠️ | 2+ | 2 |
| Weapon Plus | Skinless Man (Weapon III) | 1⚠️ | 3+ | 3 |
| Weapon Plus | Typhoid Mary (Weapon IX) | 1⚠️ | 3+ | 3 |
| Weapon Plus | Ultimaton (Weapon XV) | 1⚠️ | 4+ | 6 |

> All Weapon Plus Villains have Weapon X Sequence (Ultimaton has Doubled Weapon X Sequence). Fight values have "+" to reflect the Weapon X Sequence bonus. Daken also has Berserk and a Fail effect.

---

### Masterminds

> **Note**: Each mastermind is a double-sided physical card (Normal / Epic). 5 cards each = 1 double-sided mastermind + 4 Tactic cards.

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| Omega Red | 10+ | 6 | Any Villain Group |
| Epic Omega Red | 12+ | 6 | Any Villain Group |
| Romulus | 9+ | 6 | Weapon Plus |
| Epic Romulus | 10+ | 6 | Weapon Plus |
| Sabretooth | 8+ | 6 | Berserkers |
| Epic Sabretooth | 9+ | 6 | Berserkers |

> ⚠️ Omega Red "Always Leads: Any Villain Group" — unusual; most masterminds lead a specific group. Verify against physical card.
> Romulus: "+" = Weapon X Sequence (or Doubled for Epic) modifies fight value based on HQ card costs.
> Sabretooth: "+" = Berserks once per Savagery stacked (Epic adds two more Berserks on top).

```
Omega Red Tactics:
  Carbonadium Tentacles, The Carbonadium Synthesizer, Death Pheromones, Drain Life Force

Romulus Tactics:
  Anoint an Heir to Take My Place, Bite of the Muramasa Blade, Master of Schemes, Take Over the Weapon X Program

Sabretooth Tactics:
  Adamantium-Laced Claws, Lethal Fangs, Salivating Prowl, Sudden Savagery
```

---

### Schemes

| Scheme Name | Twist Count | Bystander Count |
|---|---|---|
| Condition Logan into Weapon X | 8 | — |
| Go After Heroes' Loved Ones | 8/10/11⚠️ | — |
| Wipe Heroes' Memories | Players + 4⚠️ | — |

> "Go After Heroes' Loved Ones": 1 player: 8 Twists, 2-4 players: 10 Twists, 5 players: 11 Twists.
> "Wipe Heroes' Memories": Twists = number of players + 4 (1p: 5, 2p: 6, 3p: 7, 4p: 8, 5p: 9).
> "Condition Logan into Weapon X": Twist 8 = Evil Wins (fixed count regardless of player count).

---

### Enraging Wounds

10 unique cards (1 copy each). These replace some normal Wounds in the Wound Deck.

| Card Name | Count | Attack | Recruit | Play Cost |
|---|---|---|---|---|
| Blazing Vengeance | 1 | 2 | 0 | — |
| Broken Bones | 1 | 3 | 0 | Put a card from hand on top of deck |
| Concussion | 1 | 2 | 0 | — |
| Erratic Powers | 1 | 3 | 0 | Discard three cards, then draw a card |
| Insults and Injuries | 1 | 2 | 0 | — |
| Last Breath | 1 | 4 | 0 | Gain a Wound to top of deck |
| Massive Blood Loss | 1 | 3 | 0 | Discard a card |
| Shell Shock | 1 | 1 | 1 | — |
| Sudden Terror | 1 | 0 | 2 | — |
| Wild Rage | 1 | 2 | 0 | — |

---

## Section 2: Card Effects

---

### Heroes

---

### Fantomex

**Sentient Bullets** (Common A)
- SPECIAL ABILITY: Weapon X Sequence.
- SUPERPOWER: NA

**Three Brains** (Common B)
- SPECIAL ABILITY: Weapon X Sequence, getting Recruit instead of Attack. If you got at least 3 Recruit this way, draw a card.
- SUPERPOWER: NA

**Misdirection** (Uncommon)
- SPECIAL ABILITY: Weapon X Sequence. When you draw a new hand this turn, draw an extra card, then put a card from your hand on top of your deck.
- SUPERPOWER: NA

**Weapon XIII** (Rare)
- SPECIAL ABILITY: Weapon X Sequence.
- SUPERPOWER: [TECH]: You may KO one of your cards that has the same cost as any of your other cards.

---

### Marrow

**Hyper-Adaptive Skeleton** (Common A)
- SPECIAL ABILITY: For all of your Heroes' Berserk abilities this turn, you get the Berserked cards' printed Recruit just like you get their printed Attack.
- SUPERPOWER: [STRENGTH]: Berserk

**Bone Shards** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [X-FORCE]: Berserk

**Osteogenesis** (Uncommon)
- SPECIAL ABILITY: Draw two cards. Then put a card from your hand on top of your deck.
- SUPERPOWER: NA

**Metabolic Overdrive** (Rare)
- SPECIAL ABILITY: Weapon X Sequence. Reveal the top six cards of your deck. Discard all the ones that cost 0 and put the rest back in any order.
- SUPERPOWER: NA

---

### Weapon H

**The Future of Warfare** (Common A)
- SPECIAL ABILITY: Look at the top card of your deck. Discard it or put it back.
- SUPERPOWER: [STRENGTH]: Berserk

**Evolving Abilities** (Common B)
- SPECIAL ABILITY: You may have this card make all Recruit instead of Attack (including the ability below).
- SUPERPOWER: [INSTINCT]: You get +1 Attack.

**Slice and Smash** (Uncommon)
- SPECIAL ABILITY: Berserk.
- SUPERPOWER: [STRENGTH]: You may KO the card you Berserked.

**Ultimate Killing Machine** (Rare)
- SPECIAL ABILITY: Weapon X Sequence.
- SUPERPOWER: [STRENGTH]: Using the Wound Deck, Berserk, Berserk, Berserk, Berserk, Berserk, Berserk, putting those discarded Wounds on the bottom of the Wound Deck.

---

### Weapon X (Wolverine)

**Raging Regeneration** (Common A)
- SPECIAL ABILITY: Berserk.
- SUPERPOWER: [INSTINCT]: You may KO a Wound from your hand or discard pile. If you do, Berserk again.

**Infuse Skeleton with Adamantium** (Common B)
- SPECIAL ABILITY: To play this, you must put another card from your hand on top of your deck. Weapon X Sequence.
- SUPERPOWER: NA

**Violent Conditioning** (Uncommon)
- SPECIAL ABILITY: You may gain a Wound. If you do, Berserk, Berserk.
- SUPERPOWER: NA

**Escape the Weapon X Lab** (Rare)
- SPECIAL ABILITY: Weapon X Sequence.
- SUPERPOWER: [INSTINCT]: You may reveal cards from the Wound Deck until you reveal an Enraging Wound. Gain that Enraging Wound to your hand. Put the other revealed cards back on the bottom. If you gain a Wound this way, Berserk.

---

### Villains

---

### Berserkers

> All Berserkers have Berserk — when you try to fight them, you discard from your deck and they gain +Attack. If the boosted Attack exceeds your total, you fail the fight, lose all Attack, and can't fight again this turn. Fail effects trigger on a failed attempt.

**Cyber** (×2⚠️)
Berserk, Berserk
Fight: KO one of your Heroes. If any of the cards you Berserked were [INSTINCT] or [TECH], shuffle Cyber into the Villain Deck, then play another card from the Villain Deck.
Fail: Each player discards a [INSTINCT] or [TECH] Hero or gains a Wound.
Escape: Do the Fail effect.
Attack: 5+ | VP: 5

**Feral** (×2⚠️)
Berserk, Berserk
Fight: Choose a player to gain this as a Hero.
Fail: KO a non-grey Hero from your discard pile.
Escape: Each player discards a non-grey Hero.
Attack: 3+ | VP: ⚠️ (reference does not list; dual-nature card — becomes Hero on defeat)
> Feral hero side: X-Force, Instinct, 2+ Attack. SUPERPOWER: [INSTINCT]: Berserk, Berserk.

**Thornn** (×2⚠️)
Berserk
Ambush: Choose a card named "Feral" from any player's discard pile to enter the city as a Villain.
Fight: Draw the card you Berserked.
Fail: When you draw a new hand at the end of this turn, discard a card.
Attack: 3+ | VP: 2

**Wild Child** (×2⚠️)
Berserk, Berserk, Berserk
Fight: KO one of the cards you Berserked this way that costs 0.
Fail: KO a card discarded by Wild Child's Berserking that costs 1 or more. (You can't KO cards you shuffled into your deck during the Berserking.)
Attack: 3+ | VP: 4

---

### Weapon Plus

> All Weapon Plus Villains have Weapon X Sequence — they gain +Attack equal to the longest consecutive cost sequence among HQ cards. Daken also has Berserk.

**Daken** (×1⚠️)
Weapon X Sequence
Berserk
Fight: KO one of your Heroes.
Fail: You gain a Wound.
Attack: 3+ | VP: 4

**Huntsman (Weapon XII)** (×2⚠️)
Weapon X Sequence
Ambush: Reveal the top 3 cards of the Hero Deck. Huntsman captures each that costs 4 or less. Put the rest on the bottom of the Hero Deck.
Fight: If Huntsman has any captured Heroes, choose a player to gain one of them and return Huntsman to his city space with the rest of them. (Ignore his Ambush.)
Attack: 2+ | VP: 2

**Nuke (Weapon VII)** (×2⚠️)
Weapon X Sequence
Fight: Reveal the top card of the Hero Deck as "Nuke's Adrenaline Pill":
  [COVERT]: "Rage" — Each other player gains a Wound.
  [INSTINCT]: "Balance" — Draw a card.
  [RANGED]: "Relax" — You get +2 Recruit.
Escape: Each player gains a Wound.
Attack: 2+ | VP: 2

**Skinless Man (Weapon III)** (×1⚠️)
Weapon X Sequence
Ambush: Skinless Man captures a Bystander of your choice from your Victory Pile. If you don't have one, gain a Wound and he captures one from the Bystander Deck.
Attack: 3+ | VP: 3

**Typhoid Mary (Weapon IX)** (×1⚠️)
Weapon X Sequence
Fight: Reveal the top card of the Hero Deck as her "Personality":
  [STRENGTH]: "Typhoid" — Put a card from your discard pile on top of the deck of the player to your left.
  [INSTINCT]: "Mary" — Rescue a Bystander.
  [COVERT]: "Bloody Mary" — Each other player gains a Wound.
  [TECH]: "Mutant Zero" — KO one of your cards that costs 0.
  [RANGED]: "Walker" — Put a card you played this turn on top of your deck.
Attack: 3+ | VP: 3

**Ultimaton (Weapon XV)** (×1⚠️)
Doubled Weapon X Sequence
Ambush: Each player discards a non-grey Hero.
Fight: Each player KOs one of their grey Heroes.
Escape: Each player KOs one of their non-grey Heroes.
Attack: 4+ | VP: 6

---

### Masterminds

---

### Omega Red

**Omega Red** (Normal)
Omega Red gets +2 Attack while you have any Wounds and +2 Attack while there are any Wounds in your discard pile.
When you KO any Wounds for the first time in a turn, put them on the bottom of the Wound Deck and gain a Wound to the bottom of your deck.
Always Leads: Any Villain Group
Master Strike: Each player discards one of their [COVERT] Heroes or gains a Wound.
Attack: 10+ | VP: 6

**Epic Omega Red**
Omega Red gets +3 Attack while you have any Wounds and +3 Attack while there are any Wounds in your discard pile.
Whenever you KO any Wounds, put them on the bottom of the Wound Deck and gain a Wound to the bottom of your deck.
Always Leads: Any Villain Group
Master Strike: Each player KOs one of their [COVERT] Heroes or gains a Wound.
Attack: 12+ | VP: 6

**Carbonadium Tentacles** (Tactic)
Fight: After you draw a new hand of cards at the end of this turn, each player discards down to three cards or gains a Wound.

**The Carbonadium Synthesizer** (Tactic)
Fight: You may return a Wound from your hand or any player's discard pile to the bottom of the Wound Deck. If you do, draw a card.

**Death Pheromones** (Tactic)
Fight: Each other player discards a [TECH] Hero or gains a Wound.

**Drain Life Force** (Tactic)
Fight: If this is not the final Tactic, and if you have at least two Wounds in your hand and/or discard pile, return all of them to the bottom of the Wound Deck and shuffle this Tactic back into Omega Red's other Tactics.

---

### Romulus

**Romulus** (Normal)
Weapon X Sequence
Always Leads: Weapon Plus
Master Strike: Each player reveals that they have a greater Weapon X Sequence than Romulus or gains a Wound. Then if this is the fifth Strike this game, this Strike becomes a Scheme Twist that takes effect immediately. (Once per game)
Attack: 9+ | VP: 6

**Epic Romulus**
Doubled Weapon X Sequence
Always Leads: Weapon Plus
Master Strike: Each player reveals that they have a greater Weapon X Sequence than Romulus (don't double his Sequence for this) or gains a Wound to the top of their deck. Then if this is the third Strike this game, this Strike becomes a Scheme Twist that takes effect immediately. (Once per game)
Attack: 10+ | VP: 6

**Anoint an Heir to Take My Place** (Tactic)
Fight: If this is not the last Tactic, a Hero from the HQ that costs 6 or more Ascends to become an additional Mastermind with Attack equal to its printed cost and only these abilities: "Fight: Choose a player to gain this as a Hero. Master Strike: Each player discards a card of this Hero Class or gains a Wound."

**Bite of the Muramasa Blade** (Tactic)
Fight: Each other player reveals three cards with different, adjacent costs (e.g. 2,3,4) or gains a Wound.

**Master of Schemes** (Tactic)
Fight: If this is not the last Tactic, reveal the top 2 cards of the Villain Deck. Play a Master Strike or Scheme Twist from among them, putting the rest back in any order.

**Take Over the Weapon X Program** (Tactic)
Fight: You get +Recruit equal to the Attack Romulus is gaining from Weapon X Sequence.

---

### Sabretooth

**Sabretooth** (Normal)
Sabretooth Berserks once for each Savagery stacked here.
Always Leads: Berserkers
Master Strike: Stack this Strike next to Sabretooth as a "Savagery." Each player KOs one of their Heroes that costs more than the number of Savageries. Any player that cannot do so gains a Wound instead.
Fail: KO a non-grey Hero discarded by Sabretooth's Berserking.
Attack: 8+ | VP: 6

**Epic Sabretooth**
Sabretooth Berserks once for each Savagery stacked here, plus two more times.
Always Leads: Berserkers
Master Strike: Stack this Strike next to Sabretooth as a "Savagery." Each player KOs one of their Heroes that costs at least 2 more than the number of Savageries. Any player that cannot do so gains a Wound instead.
Fail: KO a non-grey Hero discarded by Sabretooth's Berserking.
Attack: 9+ | VP: 6

**Adamantium-Laced Claws** (Tactic)
Fight: Each other player reveals a [INSTINCT] Hero or gains a Wound.

**Lethal Fangs** (Tactic)
Fight: KO a grey Hero discarded by Sabretooth's Berserking. (You can't KO cards you shuffled into your deck during the Berserking.)

**Salivating Prowl** (Tactic)
Fight: Reveal the top three cards of your deck. Draw one of them, discard one, and put the other back on top of your deck.

**Sudden Savagery** (Tactic)
Fight: Stack a card from the Wound Deck next to Sabretooth as a "Savagery."

---

### Schemes

---

**Condition Logan into Weapon X**
Setup: 8 Twists. Include exactly 1 Hero with Wolverine or Logan in its name.
Twist 1,3,5: "Induce Violent Rage": If you don't defeat an Enemy worth 2 VP or more this turn, then after you draw a new hand at the end of this turn, each player discards down to four cards.
Twist 2,4,6: "Test the Subject's Healing Factor": Each player discards a [STRENGTH] or [INSTINCT] Hero or gains a Wound.
Twist 7: "Unleash Weapon X": For each Wolverine and/or Logan Hero in the HQ, each player gains a Wound.
Twist 8: Evil Wins!

---

**Go After Heroes' Loved Ones**
Setup: Add an extra Hero. Don't use multiple Heroes that have the same Hero Name. 1 player: 8 Twists. 2-4 players: 10 Twists. 5 players: 11 Twists. Set aside a lowest-cost card for each Hero Name, face up, with 2 face up Bystanders under it as "Loved Ones."
Twist 1-6: KO the Hero in the rightmost HQ space. KO one of that Hero Name's Loved Ones. Each player discards a card of that Hero Name. If you discard a card this way during your turn, you Berserk. If that Hero Name has no more Loved Ones, that Hero is "Lost in Grief": KO all of that Hero Name from the HQ and Hero Deck, then shuffle it.
Twist 7-11: Do that Twist effect twice.
Evil Wins: When the Hero Deck runs out.

---

**Wipe Heroes' Memories**
Setup: Twists equal to the number of players plus 4.
Twist: You "forget your past": If you have any face up Villains or Tactics in your Victory Pile, put one of them on the bottom of your Victory Pile face down, then shuffle this Twist back into the Villain Deck, then play a card from the Villain Deck. If you didn't have any face up Villains or Tactics, then instead stack this Twist next to the Scheme as a "Total Memory Wipe."
Special Rules: Face down cards in your Victory Pile count as not being there at all until you count their VP at game end.
Evil Wins: When there are 4 Total Memory Wipes.

---

### Enraging Wounds

---

> 10 unique cards (1 copy each) shuffled into the Wound Deck. Each provides Attack and/or Recruit when played. Some have play costs. All have a Healing condition that allows KO.

**Blazing Vengeance** (×1)
2 Attack
Healing: When you defeat a Mastermind Tactic this turn, you may KO this Wound.

**Broken Bones** (×1)
3 Attack
To play this, you must put another card from your hand on top of your deck.
Healing: When you draw a card this turn (including drawing this card but not including drawing a new hand at the end of your turn), you may KO this Wound.

**Concussion** (×1)
2 Attack
Healing: When you play two cards of the same Hero Class this turn, you may KO this Wound.

**Erratic Powers** (×1)
3 Attack
To play this, you must discard three cards, then draw a card.
Healing: When you use a Superpower Ability this turn, you may KO this Wound.

**Insults and Injuries** (×1)
2 Attack
Healing: When you defeat a Villain worth at least 2 VP this turn, you may KO this Wound.

**Last Breath** (×1)
4 Attack
To play this, you must gain a Wound to the top of your deck.
Healing: When you KO another Wound this turn, you may KO this Wound.

**Massive Blood Loss** (×1)
3 Attack
To play this, you must discard a card.
Healing: When you discard a card this turn (not including discarding to play this card or discarding at the end of your turn), you may KO this Wound.

**Shell Shock** (×1)
1 Recruit, 1 Attack
Healing: When you recruit two Heroes this turn, you may KO this Wound.

**Sudden Terror** (×1)
2 Recruit
Healing: When you recruit a Hero that costs 7 or more this turn, you may KO this Wound.

**Wild Rage** (×1)
2 Attack
Healing: When you defeat a Henchman this turn, you may KO this Wound.
