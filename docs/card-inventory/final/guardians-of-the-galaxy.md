<!-- INVENTORY STATUS:
  Heroes: ✅ (all ⚠️ resolved)
  Villains: ✅ (both groups have non-standard quantity distributions)
  Masterminds: ✅
  Schemes: ✅
  Henchmen: — (none in this expansion)
  Bystanders/Sidekicks: — (none in this expansion)
  Shards: ✅ (18 tokens; documented in New Keywords)
  Last updated: 2026-04-04
-->

# Guardians of the Galaxy — Card Inventory

**Primary source**: Track B: `cardDatabase.js` (structured fields), card images (effect text)
**Cross-check**: `expansionGuardiansOfTheGalaxy.js`, `script.js`
**Pass 1 date**: 2026-04-03
**Pass 2 date**: 2026-04-04
**Pass 2 status**: ✅ Complete — 12 corrections applied

---

## New Keywords

- **Shard**: A token resource worth 1 Recruit that can be spent at any time. Shards on Villains add to their Fight value. 18 physical tokens; code uses a 30-Shard supply.
- **Artifact**: A card that stays in play in front of you rather than going to your discard pile. Artifact abilities with "once per turn" can be activated each turn. Some Villains (Infinity Gems) become Artifacts when defeated.

---

## Section 1: Structured Data Tables

### Heroes

Standard distribution per hero: 1 Rare (1 copy), 1 Uncommon (3 copies), 2 Commons (5 copies each) = 14 cards total.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Drax the Destroyer | Knives of the Hunter | Common A | 5 | 3 | Guardians of the Galaxy | Strength | 0+ | 0 |
| Drax the Destroyer | Interstellar Tracker | Common B | 5 | 3 | Guardians of the Galaxy | Instinct | 0 | 2 |
| Drax the Destroyer | The Destroyer | Uncommon | 3 | 6 | Guardians of the Galaxy | Instinct | 4 | 0 |
| Drax the Destroyer | Avatar of Destruction | Rare | 1 | 7 | Guardians of the Galaxy | Instinct | 0+ | 0 |
| Gamora | Bounty Hunter | Common A | 5 | 2 | Guardians of the Galaxy | Covert | 0 | 2 |
| Gamora | Deadliest Woman in the Universe | Common B | 5 | 3 | Guardians of the Galaxy | Instinct | 0 | 0 |
| Gamora | Galactic Assassin | Uncommon | 3 | 5 | Guardians of the Galaxy | Covert | 3 | 0 |
| Gamora | Godslayer Blade | Rare | 1 | 8 | Guardians of the Galaxy | Covert | 0+ | 0 |
| Groot | Surviving Sprig | Common A | 5 | 3 | Guardians of the Galaxy | Strength | 1 | 0 |
| Groot | Prune the Growths | Common B | 5 | 4 | Guardians of the Galaxy | Strength | 2 | 0 |
| Groot | Groot and Branches | Uncommon | 3 | 4 | Guardians of the Galaxy | Covert | 0 | 0+ |
| Groot | I Am Groot | Rare | 1 | 8 | Guardians of the Galaxy | Strength | 0 | 5 |
| Rocket Raccoon | Gritty Scavenger | Common A | 5 | 3 | Guardians of the Galaxy | Tech | 0 | 2 |
| Rocket Raccoon | Trigger Happy | Common B | 5 | 4 | Guardians of the Galaxy | Ranged | 2 | 0 |
| Rocket Raccoon | Incoming Detector | Uncommon | 3 | 4 | Guardians of the Galaxy | Instinct | 0 | 0 |
| Rocket Raccoon | Vengeance is Rocket | Rare | 1 | 7 | Guardians of the Galaxy | Tech | 5+ | 0 |
| Star-Lord | Element Guns | Common A | 5 | 4 | Guardians of the Galaxy | Ranged | 0 | 0 |
| Star-Lord | Legendary Outlaw | Common B | 5 | 4 | Guardians of the Galaxy | Covert | 0 | 2 |
| Star-Lord | Implanted Memory Chip | Uncommon | 3 | 6 | Guardians of the Galaxy | Tech | 0 | 0 |
| Star-Lord | Sentient Starship | Rare | 1 | 8 | Guardians of the Galaxy | Ranged | 0 | 0 |

*All 5 heroes are Guardians of the Galaxy team.*
*6 hero cards are Artifacts: Knives of the Hunter, Godslayer Blade, Element Guns, Incoming Detector, Implanted Memory Chip, Sentient Starship.*

---

### Villains

**Infinity Gems** (8 cards) — All are Artifacts (become player-controlled when defeated). All have 0 VP. Non-standard quantity distribution.

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Infinity Gems | Mind Gem | 1 | 6 | 0 |
| Infinity Gems | Power Gem | 1 | 7 | 0 |
| Infinity Gems | Reality Gem | 2 | 5 | 0 |
| Infinity Gems | Soul Gem | 1 | 6 | 0 |
| Infinity Gems | Space Gem | 2 | 5 | 0 |
| Infinity Gems | Time Gem | 1 | 6 | 0 |

*6 unique cards (4×1 + 2×2 = 8 total). All have 0 VP — value is in the Artifact ability when controlled.*

**Kree Starforce** (8 cards) — Non-standard quantity distribution.

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Kree Starforce | Captain Atlas | 1 | 6+ | 4 |
| Kree Starforce | Demon Druid | 1 | 5 | 3 |
| Kree Starforce | Dr. Minerva | 1 | 5 | 3 |
| Kree Starforce | Korath the Pursuer | 1 | 5 | 3 |
| Kree Starforce | Ronan the Accuser | 1 | 7 | 5 |
| Kree Starforce | Shatterax | 1 | 5 | 3 |
| Kree Starforce | Supremor | 2 | 3 | 2 |

*7 unique cards (6×1 + 1×2 = 8 total).*

---

### Masterminds

Each mastermind has 1 mastermind card + 4 tactic cards = 5 cards total.

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| The Supreme Intelligence of the Kree | 9 | 6 | Kree Starforce |
| Thanos | 24 | 7 | Infinity Gems |

*Thanos gets -2 Attack for each Infinity Gem Artifact controlled (or per led-group villain in VP if not using Infinity Gems). Official errata.*

```
The Supreme Intelligence of the Kree Tactics:
  Combined Knowledge of All Kree, Cosmic Omniscience, Countermeasure Protocols, Guide Kree Evolution

Thanos Tactics:
  Centuries of Envy, God of Death, Keeper of Souls, The Mad Titan
```

---

### Schemes

| Scheme Name | Twist Count | Bystander Count |
|---|---|---|
| Forge the Infinity Gauntlet | 8 | 1 |
| Intergalactic Kree Nega-Bomb | 8 | 1 |
| The Kree-Skrull War | 8 | 1 |
| Unite the Shards | 6 | 1 |

*Forge the Infinity Gauntlet always includes the Infinity Gems Villain Group.*
*The Kree-Skrull War always includes Kree Starforce and Skrull Villain Groups (2 groups).*
*Unite the Shards twist count is variable: number of players + 5 (solo = 6).*

---

## Section 2: Card Effects

---

### Heroes

---

### Drax the Destroyer

**Knives of the Hunter** (Common A)
- SPECIAL ABILITY: Artifact — Once per turn, you get +1 Attack.
- SUPERPOWER: NA
- Keywords: Artifact

**Interstellar Tracker** (Common B)
- SPECIAL ABILITY: Look at the top card of your deck. Discard it or put it back.
- SUPERPOWER: [INSTINCT]: You may KO the card you discarded this way.

**The Destroyer** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [GUARDIANS OF THE GALAXY]: Each other player reveals an Instinct Hero or discards an Artifact they control. For each Artifact discarded this way, you gain a Shard.

⚠️ Solo play note: Superpower targets other players — no effect in Golden Solo. Base 4 Attack still applies.

**Avatar of Destruction** (Rare)
- SPECIAL ABILITY: Double the Attack you have.
- SUPERPOWER: NA

---

### Gamora

**Bounty Hunter** (Common A)
- SPECIAL ABILITY: A Villain gains a Shard.
- SUPERPOWER: NA

**Deadliest Woman in the Universe** (Common B)
- SPECIAL ABILITY: Gain two Shards.
- SUPERPOWER: [COVERT]: Gain another Shard.

*Note: Cross-class card — Instinct class with Covert trigger.*

**Galactic Assassin** (Uncommon)
- SPECIAL ABILITY: A Villain of your choice gets no Attack from Shards this turn.
- SUPERPOWER: [COVERT][COVERT]: The Mastermind gets no Attack from Shards this turn.

*Pass 2: Double-Covert trigger confirmed by BGG card reference.*

**Godslayer Blade** (Rare)
- SPECIAL ABILITY: Artifact — Once per turn, gain two Shards. Once per turn, you may spend 5 Shards to get +10 Attack.
- SUPERPOWER: NA
- Keywords: Artifact

---

### Groot

**Surviving Sprig** (Common A)
- SPECIAL ABILITY: When you draw a new hand of cards at the end of this turn, draw an extra card.
- SUPERPOWER: NA

**Prune the Growths** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [STRENGTH]: You may KO a card from your hand or discard pile. If you do, gain a Shard.

**Groot and Branches** (Uncommon)
- SPECIAL ABILITY: Gain two Shards. You may spend Shards to get Recruit this turn.
- SUPERPOWER: [COVERT]: You may choose another player. That player gains a Shard.

⚠️ Solo play note: Covert superpower targets another player — no effect in Golden Solo.

**I Am Groot** (Rare)
- SPECIAL ABILITY: When you recruit your next Hero this turn, you gain Shards equal to that Hero's cost.
- SUPERPOWER: NA

---

### Rocket Raccoon

**Gritty Scavenger** (Common A)
- SPECIAL ABILITY: You may discard a card. If you do, draw a card.
- SUPERPOWER: NA

**Trigger Happy** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [GUARDIANS OF THE GALAXY]: You gain a Shard for each other Guardians of the Galaxy Hero you played this turn.

**Incoming Detector** (Uncommon)
- SPECIAL ABILITY: Artifact — Whenever a Master Strike or a Villain's Ambush ability is completed, you may gain a Shard.
- SUPERPOWER: NA
- Keywords: Artifact

**Vengeance is Rocket** (Rare)
- SPECIAL ABILITY: NA
- SUPERPOWER: [TECH]: You get +1 Attack for each Master Strike in the KO pile and/or stacked next to the Mastermind.

---

### Star-Lord

**Element Guns** (Common A)
- SPECIAL ABILITY: Artifact — Once per turn, gain a Shard.
- SUPERPOWER: NA
- Keywords: Artifact

*Pass 2: Confirmed unconditional — no Instinct trigger. Orange icon in card image was a misread; BGG card reference shows Ranged class, no trigger.*

**Legendary Outlaw** (Common B)
- SPECIAL ABILITY: Choose an Artifact any player controls with a "once per turn" ability. Play a copy of one of those abilities.
- SUPERPOWER: NA

**Implanted Memory Chip** (Uncommon)
- SPECIAL ABILITY: Artifact — Once per turn, draw a card.
- SUPERPOWER: NA
- Keywords: Artifact

**Sentient Starship** (Rare)
- SPECIAL ABILITY: Artifact — Once per turn, gain a Shard for each Artifact you control.
- SUPERPOWER: NA
- Keywords: Artifact

*Pass 2: Confirmed unconditional — same resolution as Element Guns.*

---

### Villains

---

### Infinity Gems

*All Gems are Artifacts — Fight: Put this into your discard pile as an Artifact. Each Gem has an Ambush (Shard-gain trigger) and an Artifact ability (active while controlled).*

**Mind Gem** (×1)
Artifact.
Ambush: Gains Shards equal to the number of Scheme Twists in the KO pile and/or stacked next to the Scheme.
Artifact ability: +2 Recruit.
Attack: 6 | VP: 0

**Power Gem** (×1)
Artifact.
Ambush: Gains Shards equal to the number of Master Strikes in the KO pile and/or stacked next to the Mastermind.
Artifact ability: +2 Attack.
Attack: 7 | VP: 0

**Reality Gem** (×2)
Artifact.
Ambush: Gains a Shard for each Infinity Gem Villain card in the city and/or Escape pile.
Artifact ability: Before you play a card from the Villain Deck, you may first reveal the top card of the Villain Deck. If it's not a Scheme Twist, you may put it on the bottom of the Villain Deck. If you do, gain a Shard.
Attack: 5 | VP: 0

**Soul Gem** (×1)
Artifact.
Ambush: Soul Gem gains a Shard for each Villain in the city.
Artifact ability: Whenever you defeat a Villain, put a Shard on Soul Gem from the supply. Once per turn, you get +Attack equal to the number of Shards on Soul Gem.
Attack: 6 | VP: 0

**Space Gem** (×2)
Artifact.
Ambush: Gains Shards equal to the number of empty spaces in the city.
Artifact ability: Once per turn, you may move a Villain to another city space. If another Villain is already there, swap them. If you moved any Villains this way, gain a Shard.
Attack: 5 | VP: 0

**Time Gem** (×1)
Artifact.
Ambush: Play another card from the Villain Deck. Gains Shards equal to that card's printed Victory Points.
Artifact ability: When you play this Artifact, take another turn after this one. Use this ability only if this is the first time any player has played the Time Gem this game.
Attack: 6 | VP: 0

---

### Kree Starforce

**Captain Atlas** (×1)
Captain Atlas gets +1 Attack for each Shard on the Mastermind.
Escape: Each player loses a Shard. Each player that cannot do so gains a Wound.
Attack: 6+ | VP: 4

**Demon Druid** (×1)
Ambush: Another Villain in the city gains 2 Shards.
Attack: 5 | VP: 3

**Dr. Minerva** (×1)
Ambush: Each Kree Villain in the city gains a Shard (including this Villain).
Attack: 5 | VP: 3

**Korath the Pursuer** (×1)
Ambush: Each player may draw a card. Korath gains a Shard for each card drawn this way.
Escape: If Korath had any Shards, each player gains a Wound.
Attack: 5 | VP: 3

**Ronan the Accuser** (×1)
Ambush: Each player simultaneously points their finger to accuse another player. Each player who was accused the most gains a Wound.
Escape: Same effect.
Attack: 7 | VP: 5

**Shatterax** (×1)
Fight: Put a Shard on each Hero in the HQ. When a player gains that Hero, they gain that Shard. If that Hero leaves the HQ some other way, return that Shard to the supply.
Attack: 5 | VP: 3

**Supremor** (×2)
Ambush: Supremor and the Mastermind each gain a Shard.
Attack: 3 | VP: 2

---

### Masterminds

---

### The Supreme Intelligence of the Kree

**The Supreme Intelligence of the Kree** (Normal)
Always Leads: Kree Starforce
Special: Accumulates Shards via Master Strike and Tactic effects. Shard count drives the Master Strike discard threshold.
Master Strike: The Supreme Intelligence gains a Shard. Then each player reveals their hand and discards each with cost equal to, and cost one higher than, the number of Shards on the Supreme Intelligence.
Attack: 9 | VP: 6

**Combined Knowledge of All Kree** (Tactic)
Fight: The Supreme Intelligence gains a Shard for each Kree Villain in the city and/or the Escape Pile.

**Cosmic Omniscience** (Tactic)
Fight: The Supreme Intelligence gains a Shard for each Master Strike in the KO pile.

**Countermeasure Protocols** (Tactic)
Fight: The Supreme Intelligence gains a Shard for each Mastermind Tactic (including this one) in any player's Victory Pile.

**Guide Kree Evolution** (Tactic)
Fight: The Supreme Intelligence and Kree Villains in the city each gain a Shard.

---

### Thanos

**Thanos** (Normal)
Always Leads: Infinity Gems
Special: Bound Souls pile — Heroes captured by Thanos persist across the game and are referenced by his Tactics. Gets -2 Attack for each Infinity Gem Artifact card controlled by any player (official errata; or -2 per led-group villain in VP if not using Infinity Gems).
Master Strike: Each player reveals their hand and puts one of their non-grey Heroes next to Thanos in a "Bound Souls" pile.
Attack: 24 | VP: 7

**Centuries of Envy** (Tactic)
Fight: Each other player discards an Infinity Gem Artifact card they control.

**God of Death** (Tactic)
Fight: Each other player reveals their hand and gains a Wound for each card that player has with the same card name as any card in Thanos' Bound Souls pile.

**Keeper of Souls** (Tactic)
Fight: Gain a Hero from Thanos' Bound Souls pile. Then each other player puts a non-grey Hero from their discard pile into Thanos' Bound Souls pile.

**The Mad Titan** (Tactic)
Fight: Each other player reveals their hand and discards all cards with the same card name as any card in Thanos' Bound Souls pile.

---

### Schemes

---

**Forge the Infinity Gauntlet**
Setup: 8 Twists. 1 Henchmen Group, 3 Heroes. Always include the Infinity Gems Villain Group.
Twist: Starting to your left and going clockwise, the first player with an Infinity Gem Artifact card in play or in their discard pile chooses one of those Infinity Gems to enter the city. Then put a Shard on each Infinity Gem in the city.
Evil Wins: When 6 Infinity Gem Villains are in the city and/or the Escape Pile. OR when a player controls 4 Infinity Gem Artifacts, that player is corrupted by power — that player wins, Evil wins, and all other players lose.

---

**Intergalactic Kree Nega-Bomb**
Setup: 8 Twists. 1 Villain Group, 1 Henchmen Group, 3 Heroes. Make a face down "Nega-Bomb Deck" of 6 Bystanders.
Twist: Shuffle this Twist into the Nega-Bomb Deck. Then reveal a random card from that deck. If it's a Bystander, rescue it. If it's a Twist, KO it, KO all Heroes from the HQ, and each player gains a Wound.
Evil Wins: When 16 non-grey Heroes are in the KO pile.

---

**The Kree-Skrull War**
Setup: 8 Twists. 1 Henchmen Group, 3 Heroes. Always include Kree Starforce and Skrull Villain Groups.
Twists 1-7: All Kree and Skrulls escape from the city. Then, if there are more Kree than Skrulls in the Escape Pile, stack this Twist next to the Mastermind as a Kree Conquest. If there are more Skrulls than Kree in the Escape Pile, stack this Twist next to the Villain Deck as a Skrull Conquest.
Twist 8: Stack this Twist on the side with the most Conquests.
Evil Wins: When there are 4 Kree Conquests or 4 Skrull Conquests.

*Note: Card text does not specify tie handling. Code KOs the twist on a tie (twists 1-7 and twist 8).*

---

**Unite the Shards**
Setup: 30 Shards in the supply. Twists equal to the number of players plus 5. 1 Villain Group, 1 Henchmen Group, 3 Heroes.
Special Rules: During your turn, any number of times, you may spend 2 Recruit to gain one of the Mastermind's Shards.
Twist: Stack this Twist next to the Scheme. Then for each Twist in that stack, the Mastermind gains a Shard.
Evil Wins: When the Mastermind has 10 Shards or when there are no more Shards in the supply.
