<!-- INVENTORY STATUS:
  Heroes: ✅
  Villains: ✅
  Masterminds: ✅
  Schemes: ✅
  Henchmen: ✅
  Bystanders/Sidekicks: — (not in scope)
  Last updated: 2026-04-03
-->

# Core Set — Card Inventory

**Primary source**: Track B: `cardDatabase.js`
**Cross-check**: Card images in `Visual Assets/Heroes/Reskinned Core/`
**Pass 1 date**: 2026-04-03
**Pass 2 status**: ✅ Complete (2026-04-03) — 6 effect text corrections, 2 invulnerability passives added, 3 scheme details refined
**Pass 3 status**: ✅ Complete (2026-04-03) — user reviewed with physical cards, all corrections applied

---

## Section 1: Structured Data Tables

### Heroes

Standard distribution per hero: 1 Rare (1 copy), 1 Uncommon (3 copies), 2 Commons (5 copies each) = 14 cards total.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Black Widow | Mission Accomplished | Common A | 5 | 2 | Avengers | Tech | 0 | 0 |
| Black Widow | Dangerous Rescue | Common B | 5 | 3 | Avengers | Covert | 2 | 0 |
| Black Widow | Covert Operation | Uncommon | 3 | 4 | Avengers | Covert | 0+ | 0 |
| Black Widow | Silent Sniper | Rare | 1 | 7 | Avengers | Covert | 4 | 0 |
| Captain America | Avengers Assemble! | Common A | 5 | 3 | Avengers | Instinct | 0 | 0+ |
| Captain America | Perfect Teamwork | Common B | 5 | 4 | Avengers | Strength | 0+ | 0 |
| Captain America | Diving Block | Uncommon | 3 | 6 | Avengers | Tech | 4 | 0 |
| Captain America | A Day Unlike Any Other | Rare | 1 | 7 | Avengers | Covert | 3 | 0 |
| Cyclops | Optic Blast | Common A | 5 | 3 | X-Men | Ranged | 3 | 0 |
| Cyclops | Determination | Common B | 5 | 2 | X-Men | Strength | 0 | 3 |
| Cyclops | Unending Energy | Uncommon | 3 | 6 | X-Men | Ranged | 4 | 0 |
| Cyclops | X-Men United | Rare | 1 | 8 | X-Men | Ranged | 6 | 0 |
| Deadpool | Here, Hold This For a Second | Common A | 5 | 3 | — | Tech | 0 | 2 |
| Deadpool | Oddball | Common B | 5 | 5 | — | Covert | 2+ | 0 |
| Deadpool | Hey, Can I Get a Do-Over? | Uncommon | 3 | 3 | — | Instinct | 2 | 0 |
| Deadpool | Random Acts of Unkindness | Rare | 1 | 7 | — | Instinct | 6 | 0 |
| Emma Frost | Mental Discipline | Common A | 5 | 3 | X-Men | Ranged | 0 | 1 |
| Emma Frost | Shadowed Thoughts | Common B | 5 | 4 | X-Men | Covert | 2+ | 0 |
| Emma Frost | Psychic Link | Uncommon | 3 | 5 | X-Men | Instinct | 3 | 0 |
| Emma Frost | Diamond Form | Rare | 1 | 7 | X-Men | Strength | 5 | 0+ |
| Gambit | Stack the Deck | Common A | 5 | 2 | X-Men | Covert | 0 | 0 |
| Gambit | Card Shark | Common B | 5 | 4 | X-Men | Ranged | 2 | 0 |
| Gambit | Hypnotic Charm | Uncommon | 3 | 3 | X-Men | Instinct | 0 | 2 |
| Gambit | High Stakes Jackpot | Rare | 1 | 7 | X-Men | Instinct | 4+ | 0 |
| Hawkeye | Quick Draw | Common A | 5 | 3 | Avengers | Instinct | 1 | 0 |
| Hawkeye | Team Player | Common B | 5 | 4 | Avengers | Tech | 2 | 0 |
| Hawkeye | Covering Fire | Uncommon | 3 | 5 | Avengers | Tech | 3 | 0 |
| Hawkeye | Impossible Trick Shot | Rare | 1 | 7 | Avengers | Tech | 5 | 0 |
| Hulk | Unstoppable Hulk | Common A | 5 | 4 | Avengers | Instinct | 2 | 0 |
| Hulk | Growing Anger | Common B | 5 | 3 | Avengers | Strength | 2 | 0 |
| Hulk | Crazed Rampage | Uncommon | 3 | 5 | Avengers | Strength | 4 | 0 |
| Hulk | Hulk Smash! | Rare | 1 | 8 | Avengers | Strength | 5 | 0 |
| Iron Man | Endless Invention | Common A | 5 | 3 | Avengers | Tech | 0 | 0 |
| Iron Man | Repulsor Rays | Common B | 5 | 3 | Avengers | Ranged | 2 | 0 |
| Iron Man | Arc Reactor | Uncommon | 3 | 5 | Avengers | Tech | 3+ | 0 |
| Iron Man | Quantum Breakthrough | Rare | 1 | 7 | Avengers | Tech | 0 | 0 |
| Nick Fury | Battlefield Promotion | Common A | 5 | 4 | S.H.I.E.L.D. | Covert | 0 | 0 |
| Nick Fury | High-Tech Weaponry | Common B | 5 | 3 | S.H.I.E.L.D. | Tech | 2 | 0 |
| Nick Fury | Legendary Commander | Uncommon | 3 | 6 | S.H.I.E.L.D. | Strength | 1+ | 0 |
| Nick Fury | Pure Fury | Rare | 1 | 8 | S.H.I.E.L.D. | Tech | 0 | 0 |
| Rogue | Energy Drain | Common A | 5 | 3 | X-Men | Covert | 0 | 2 |
| Rogue | Borrowed Brawn | Common B | 5 | 4 | X-Men | Strength | 1 | 0 |
| Rogue | Copy Powers | Uncommon | 3 | 5 | X-Men | Covert | 0 | 0 |
| Rogue | Steal Abilities | Rare | 1 | 8 | X-Men | Strength | 4 | 0 |
| Spider-Man | Astonishing Strength | Common A | 5 | 2 | Spider-Friends | Strength | 0 | 1 |
| Spider-Man | Great Responsibility | Common B | 5 | 2 | Spider-Friends | Instinct | 1 | 0 |
| Spider-Man | Web-Shooters | Uncommon | 3 | 2 | Spider-Friends | Tech | 0 | 0 |
| Spider-Man | The Amazing Spider-Man | Rare | 1 | 2 | Spider-Friends | Covert | 0 | 0 |
| Storm | Lightning Bolt | Common A | 5 | 4 | X-Men | Ranged | 2 | 0 |
| Storm | Gathering Stormclouds | Common B | 5 | 3 | X-Men | Ranged | 0 | 2 |
| Storm | Spinning Cyclone | Uncommon | 3 | 6 | X-Men | Covert | 4 | 0 |
| Storm | Tidal Wave | Rare | 1 | 7 | X-Men | Ranged | 5 | 0 |
| Thor | Surge of Power | Common A | 5 | 4 | Avengers | Ranged | 0 | 2 |
| Thor | Odinson | Common B | 5 | 3 | Avengers | Strength | 0 | 2 |
| Thor | Call Lightning | Uncommon | 3 | 6 | Avengers | Ranged | 3+ | 0 |
| Thor | God of Thunder | Rare | 1 | 8 | Avengers | Ranged | 0* | 5 |
| Wolverine | Healing Factor | Common A | 5 | 3 | X-Men | Instinct | 2 | 0 |
| Wolverine | Keen Senses | Common B | 5 | 2 | X-Men | Instinct | 1 | 0 |
| Wolverine | Frenzied Slashing | Uncommon | 3 | 5 | X-Men | Instinct | 2 | 0 |
| Wolverine | Berserker Rage | Rare | 1 | 8 | X-Men | Instinct | 0+ | 0 |

*Deadpool: No team affiliation — correct per DB and physical cards.*
*Spider-Man "The Amazing Spider-Man": Cost 2 for a Rare — confirmed correct via physical cards and Quick-Inventory PDF.*
*Thor "God of Thunder": Attack 0\* — Recruit 5 can be spent as Attack this turn (1:1 conversion).*

---

### Villains

Standard villain group total: **8 cards**. Groups with non-standard quantities noted below.

**Brotherhood** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Brotherhood | Blob | 2 | 4 | 2 |
| Brotherhood | Juggernaut | 2 | 6 | 4 |
| Brotherhood | Mystique | 2 | 5 | 3 |
| Brotherhood | Sabretooth | 2 | 5 | 3 |

*Blob requires an X-Men Hero to fight (fight condition, not a fight effect).*

**Enemies of Asgard** (8 cards — non-standard quantities)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Enemies of Asgard | Frost Giant | 3 | 4 | 2 |
| Enemies of Asgard | Destroyer | 1 | 7 | 5 |
| Enemies of Asgard | Enchantress | 2 | 6 | 4 |
| Enemies of Asgard | Ymir, Frost Giant King | 2 | 6 | 4 |

**HYDRA** (8 cards — non-standard quantities)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| HYDRA | Viper | 1 | 5 | 3 |
| HYDRA | Supreme HYDRA | 1 | 6 | 3 |
| HYDRA | Endless Armies of HYDRA | 3 | 4 | 3 |
| HYDRA | HYDRA Kidnappers | 3 | 3 | 1 |

**Masters of Evil** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Masters of Evil | Ultron | 2 | 6 | 2 |
| Masters of Evil | Whirlwind | 2 | 4 | 2 |
| Masters of Evil | Baron Zemo | 2 | 6 | 4 |
| Masters of Evil | Melter | 2 | 5 | 3 |

**Radiation** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Radiation | Abomination | 2 | 5 | 3 |
| Radiation | The Leader | 2 | 4 | 2 |
| Radiation | Maestro | 2 | 6 | 4 |
| Radiation | Zzzax | 2 | 5 | 3 |

**Skrulls** (8 cards — non-standard quantities)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Skrulls | Super-Skrull | 3 | 4 | 2 |
| Skrulls | Skrull Shapeshifters | 3 | 0* | 2 |
| Skrulls | Skrull Queen Veranke | 1 | 0* | 4 |
| Skrulls | Paibok the Power Skrull | 1 | 8 | 3 |

*Skrull Shapeshifters and Skrull Queen Veranke: DB fight value is 0; at Ambush time the value is set to the captured Hero's cost.*

**Spider-Foes** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Spider-Foes | Venom | 2 | 5 | 3 |
| Spider-Foes | Green Goblin | 2 | 6 | 4 |
| Spider-Foes | The Lizard | 2 | 3 | 2 |
| Spider-Foes | Doctor Octopus | 2 | 4 | 2 |

*Venom requires a Covert Hero to fight (fight condition, not a fight effect).*

---

### Henchmen

Standard henchmen group total: **10 identical cards**.

**Doombot Legion** — standard

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Doombot Legion | Doombot | 10 | 3 | 1 |

**Hand Ninjas** — standard

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Hand Ninjas | Hand Ninja | 10 | 3 | 1 |

**Savage Land Mutates** — standard

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Savage Land Mutates | Savage Land Mutate | 10 | 3 | 1 |

**Sentinel** — standard

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Sentinel | Sentinel | 10 | 3 | 1 |

### Masterminds

Each mastermind has 1 mastermind card + 4 tactic cards = 5 cards total. No Epic variants exist for any Core Set mastermind.

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| Dr. Doom | 9 | 5 | Doombot Legion (Henchmen) |
| Loki | 10 | 5 | Enemies of Asgard |
| Magneto | 8 | 5 | Brotherhood |
| Red Skull | 7 | 5 | HYDRA |

```
Dr. Doom Tactics:
  Dark Technology, Monarch's Decree, Secrets of Time Travel, Treasures of Latveria

Loki Tactics:
  Cruel Ruler, Maniacal Tyrant, Vanishing Illusions, Whispers and Lies

Magneto Tactics:
  Bitter Captor, Crushing Shockwave, Electromagnetic Bubble, Xavier's Nemesis

Red Skull Tactics:
  Endless Resources, HYDRA Conspiracy, Negablast Grenades, Ruthless Dictator
```

---

### Schemes

| Scheme Name | Twist Count | Bystander Count |
|---|---|---|
| The Legacy Virus | 8 | default |
| Midtown Bank Robbery | 8 | 12 |
| Negative Zone Prison Breakout | 8 | default |
| Portals to the Dark Dimension | 7 | default |
| Replace Earth's Leaders with Killbots | 5 (+3 pre-stacked) | 0 (18 become Killbots) |
| Secret Invasion of the Skrull Shapeshifters | 8 | default |
| Super Hero Civil War | 8 | default |
| Unleash the Power of the Cosmic Cube | 8 | default |

*Secret Invasion requires Skrulls as the villain group and 6 Heroes.*
*Super Hero Civil War uses 4 Heroes instead of the standard 3.*
*Replace Earth's Leaders with Killbots: 3 Twists start pre-stacked next to the Mastermind; 18 Bystanders become Killbot Villains (3 Attack, 1 VP) shuffled into the Villain Deck.*

---

## Section 2: Card Effects

---

### Heroes

---

### Black Widow

**Mission Accomplished** (Common A)
- SPECIAL ABILITY: Draw an extra card.
- SUPERPOWER: [TECH]: Rescue a Bystander from the deck.

**Dangerous Rescue** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [COVERT]: You may KO a card from your hand or discard pile. If you do, rescue a Bystander.

**Covert Operation** (Uncommon)
- SPECIAL ABILITY: Gain +1 Attack for each Bystander in your Victory Pile.
- SUPERPOWER: NA

**Silent Sniper** (Rare)
- SPECIAL ABILITY: Choose a Villain that has captured a Bystander and rescue that Bystander.
- SUPERPOWER: NA

---

### Captain America

**Avengers Assemble!** (Common A)
- SPECIAL ABILITY: Count the number of different card classes/colors among cards in hand and played this turn; gain that much Recruit.
- SUPERPOWER: NA

**Perfect Teamwork** (Common B)
- SPECIAL ABILITY: Count the number of different card classes/colors among cards in hand and played this turn; gain that much Attack.
- SUPERPOWER: NA

**Diving Block** (Uncommon)
- SPECIAL ABILITY: If you would gain a Wound, you may reveal this card and draw a card instead.
- SUPERPOWER: NA

**A Day Unlike Any Other** (Rare)
- SPECIAL ABILITY: NA
- SUPERPOWER: [AVENGERS]: Gain +3 Attack for each Avengers Hero played this turn.

---

### Cyclops

**Optic Blast** (Common A)
- SPECIAL ABILITY: Discard a card from your hand to play this card again.
- SUPERPOWER: NA

**Determination** (Common B)
- SPECIAL ABILITY: Discard a card from your hand to play this card again.
- SUPERPOWER: NA

**Unending Energy** (Uncommon)
- SPECIAL ABILITY: If a card effect makes you discard this card, you may return this card to your hand.
- SUPERPOWER: NA

**X-Men United** (Rare)
- SPECIAL ABILITY: NA
- SUPERPOWER: [X-MEN]: Gain +2 Attack for each X-Men Hero played this turn.

---

### Deadpool

**Here, Hold This For a Second** (Common A)
- SPECIAL ABILITY: Assign a Bystander to a Villain, capturing it.
- SUPERPOWER: NA

**Oddball** (Common B)
- SPECIAL ABILITY: Gain +1 Attack for each card with an odd-numbered Cost played this turn (excluding this card).
- SUPERPOWER: NA

**Hey, Can I Get a Do-Over?** (Uncommon)
- SPECIAL ABILITY: If this is the first card played this turn, you may discard your entire hand and draw 4 new cards.
- SUPERPOWER: NA

**Random Acts of Unkindness** (Rare)
- SPECIAL ABILITY: You may gain a Wound to gain additional Attack benefits.
- SUPERPOWER: NA

---

### Emma Frost

**Mental Discipline** (Common A)
- SPECIAL ABILITY: Draw an extra card.
- SUPERPOWER: NA

**Shadowed Thoughts** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [COVERT]: You may play the top card of the Villain Deck. If you do, you get +2 Attack.

**Psychic Link** (Uncommon)
- SPECIAL ABILITY: Draw an extra card if you have X-Men Heroes among your played or in-hand cards this turn.
- SUPERPOWER: NA

**Diamond Form** (Rare)
- SPECIAL ABILITY: Gain +3 Recruit whenever you defeat a Villain or Mastermind this turn.
- SUPERPOWER: NA

---

### Gambit

**Stack the Deck** (Common A)
- SPECIAL ABILITY: Draw 2 cards, then put 1 card from your hand on top of your deck.
- SUPERPOWER: NA

**Card Shark** (Common B)
- SPECIAL ABILITY: Reveal the top card of your deck; if it is an X-Men Hero, draw it.
- SUPERPOWER: NA

**Hypnotic Charm** (Uncommon)
- SPECIAL ABILITY: Reveal the top card of your deck; you may discard it or put it back on top.
- SUPERPOWER: [INSTINCT]: *(Solo: not triggered — "another player plays Instinct" effect.)* When another player plays an Instinct Hero, reveal the second card from the top of your deck; you may discard it or return it.

**High Stakes Jackpot** (Rare)
- SPECIAL ABILITY: Reveal the top card of your deck; gain Attack equal to that card's Cost.
- SUPERPOWER: NA

---

### Hawkeye

**Quick Draw** (Common A)
- SPECIAL ABILITY: Draw an extra card.
- SUPERPOWER: NA

**Team Player** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [AVENGERS]: Gain +1 Attack when an Avengers Hero is played this turn.

**Covering Fire** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [TECH]: *(Solo: not triggered — "another player plays Tech" effect.)* When another player plays a Tech Hero, that player does not draw or discard cards from that hero's abilities.

**Impossible Trick Shot** (Rare)
- SPECIAL ABILITY: Whenever you defeat a Villain or Mastermind this turn, rescue 3 Bystanders.
- SUPERPOWER: NA

---

### Hulk

**Unstoppable Hulk** (Common A)
- SPECIAL ABILITY: You may KO a Wound from your hand or discard pile. If you do, get +2 Attack.
- SUPERPOWER: NA

**Growing Anger** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [STRENGTH]: Gain +1 Attack when a Strength Hero is played this turn.

**Crazed Rampage** (Uncommon)
- SPECIAL ABILITY: You must draw a Wound card from the Wound stack.
- SUPERPOWER: NA

**Hulk Smash!** (Rare)
- SPECIAL ABILITY: NA
- SUPERPOWER: [STRENGTH]: Gain +5 Attack when a Strength Hero is played this turn.

---

### Iron Man

**Endless Invention** (Common A)
- SPECIAL ABILITY: Draw an extra card.
- SUPERPOWER: [TECH]: Draw an additional card when a Tech Hero is played this turn.

**Repulsor Rays** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [RANGED]: Gain +1 Attack when a Ranged Hero is played this turn.

**Arc Reactor** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [TECH]: Gain Attack equal to the number of Tech Heroes played this turn.

**Quantum Breakthrough** (Rare)
- SPECIAL ABILITY: Draw 2 cards.
- SUPERPOWER: [TECH]: Draw 2 additional cards when a Tech Hero is played this turn.

---

### Nick Fury

**Battlefield Promotion** (Common A)
- SPECIAL ABILITY: KO a S.H.I.E.L.D. Hero from your hand or discard pile to recruit a S.H.I.E.L.D. Officer.
- SUPERPOWER: NA

**High-Tech Weaponry** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [TECH]: Gain +1 Attack when a Tech Hero is played this turn.

**Legendary Commander** (Uncommon)
- SPECIAL ABILITY: Gain Attack equal to the number of S.H.I.E.L.D. Heroes played this turn.
- SUPERPOWER: NA

**Pure Fury** (Rare)
- SPECIAL ABILITY: Defeat any Villain or Mastermind whose Attack is less than the number of S.H.I.E.L.D. Heroes in the KO pile.
- SUPERPOWER: NA

---

### Rogue

**Energy Drain** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [COVERT]: KO a card from your hand or discard pile to gain Recruit.

**Borrowed Brawn** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [STRENGTH]: Gain +3 Attack.

**Copy Powers** (Uncommon)
- SPECIAL ABILITY: Play this card as a copy of another Hero you played this turn. This card is both [COVERT] and the class you copy.
- SUPERPOWER: NA

**Steal Abilities** (Rare)
- SPECIAL ABILITY: Draw the top card of your deck, discard it, then activate a copy of that card's abilities.
- SUPERPOWER: NA

---

### Spider-Man

**Astonishing Strength** (Common A)
- SPECIAL ABILITY: Reveal the top card of your deck; if its Cost is 2 or less, draw it.
- SUPERPOWER: NA

**Great Responsibility** (Common B)
- SPECIAL ABILITY: Reveal the top card of your deck; if its Cost is 2 or less, draw it.
- SUPERPOWER: NA

**Web-Shooters** (Uncommon)
- SPECIAL ABILITY: Rescue a Bystander. Then reveal the top card of your deck; if its Cost is 2 or less, draw it.
- SUPERPOWER: NA

**The Amazing Spider-Man** (Rare)
- SPECIAL ABILITY: Reveal the top 3 cards of your deck; draw any with Cost 2 or less, return the rest to the top of the deck in any order.
- SUPERPOWER: NA

---

### Storm

**Lightning Bolt** (Common A)
- SPECIAL ABILITY: Villains in the Rooftops get -2 Fight value this turn.
- SUPERPOWER: NA

**Gathering Stormclouds** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [RANGED]: Draw a card.

**Spinning Cyclone** (Uncommon)
- SPECIAL ABILITY: Move one Villain in the city to a different city location.
- SUPERPOWER: NA

**Tidal Wave** (Rare)
- SPECIAL ABILITY: Villains on the Bridge get -2 Fight value this turn.
- SUPERPOWER: [RANGED]: The Mastermind gets -2 Fight value this turn.

---

### Thor

**Surge of Power** (Common A)
- SPECIAL ABILITY: If you gained 8 or more Recruit this turn, gain +3 Attack.
- SUPERPOWER: NA

**Odinson** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [STRENGTH]: Gain +2 Recruit.

**Call Lightning** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [RANGED]: Gain +3 Attack.

**God of Thunder** (Rare)
- SPECIAL ABILITY: Your Recruit points can be spent as Attack this turn (1 Recruit = 1 Attack).
- SUPERPOWER: NA

---

### Wolverine

**Healing Factor** (Common A)
- SPECIAL ABILITY: KO a Wound from your hand or discard pile to draw a card.
- SUPERPOWER: NA

**Keen Senses** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [INSTINCT]: Draw a card.

**Frenzied Slashing** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [INSTINCT]: Draw 2 cards.

**Berserker Rage** (Rare)
- SPECIAL ABILITY: Draw 3 cards.
- SUPERPOWER: [INSTINCT]: Gain +1 Attack for each extra card drawn this turn (beyond your normal draw).

---

### Villains

---

### Brotherhood

**Blob** (×2)
Fight Condition: Must have an X-Men Hero to fight this villain.
Attack: 4 | VP: 2

**Juggernaut** (×2)
Ambush: KO two Heroes from your discard pile (if fewer than 2, KO all available).
Escape: KO two Heroes from your hand (if fewer than 2, KO all available).
Attack: 6 | VP: 4

**Mystique** (×2)
Escape: Removed from the Escaped Villains pile, renamed to "Scheme Twist", placed on top of the Villain Deck, and immediately processed as a new villain draw.
Attack: 5 | VP: 3

**Sabretooth** (×2)
Fight: Reveal an X-Men Hero you have, or gain a Wound.
Escape: Reveal an X-Men Hero you have, or gain a Wound.
Attack: 5 | VP: 3

---

### Enemies of Asgard

**Frost Giant** (×3)
Fight: Reveal a Ranged Hero you have, or gain a Wound.
Escape: Reveal a Ranged Hero you have, or gain a Wound.
Attack: 4 | VP: 2

**Destroyer** (×1)
Fight: KO all your S.H.I.E.L.D. Heroes.
Escape: KO two Heroes of your choice.
Attack: 7 | VP: 5

**Enchantress** (×2)
Fight: Draw three cards.
Attack: 6 | VP: 4

**Ymir, Frost Giant King** (×2)
Ambush: Reveal a Ranged Hero you have, or gain a Wound.
Fight: KO any number of Wounds from your hand or discard pile.
Attack: 6 | VP: 4

---

### HYDRA

**Viper** (×1)
Fight: Reveal a HYDRA Villain from your Victory Pile, or gain a Wound.
Escape: Reveal a HYDRA Villain from your Victory Pile, or gain a Wound.
Attack: 5 | VP: 3

**Supreme HYDRA** (×1)
VP Bonus: Scores 3 × (total HYDRA Villains in your Victory Pile) − 1 additional VP at end of game.
Attack: 6 | VP: 3

**Endless Armies of HYDRA** (×3)
Fight: Draw the top two cards of the Villain Deck. *(Note: effect hardcoded in `handlePostDefeat()` by name-check, not via the `fightEffect` DB field — verified correct in Pass 2.)*
Attack: 4 | VP: 3

**HYDRA Kidnappers** (×3)
Fight: You may gain a S.H.I.E.L.D. Officer.
Attack: 3 | VP: 1

---

### Masters of Evil

**Ultron** (×2)
Escape: Reveal a Tech Hero you have, or gain a Wound.
VP Bonus: Scores +1 VP per Tech card in your entire deck at end of game.
Attack: 6 | VP: 2

**Whirlwind** (×2)
Fight: If fought on the Rooftops or Bridge, KO two of your Heroes.
Attack: 4 | VP: 2

**Baron Zemo** (×2)
Fight: For each Avengers Hero you have, rescue a Bystander.
Attack: 6 | VP: 4

**Melter** (×2)
Fight: Reveal the top card of your deck; choose to KO it or put it back.
Attack: 5 | VP: 3

---

### Radiation

**Abomination** (×2)
Fight: If fought on the Streets or Bridge, rescue 3 Bystanders.
Attack: 5 | VP: 3

**The Leader** (×2)
Ambush: Draw the top card of the Villain Deck (single draw via `processVillainCard()`).
Attack: 4 | VP: 2

**Maestro** (×2)
Fight: For each Strength Hero you have, KO one of your Heroes.
Attack: 6 | VP: 4

**Zzzax** (×2)
Fight: Reveal a Strength Hero you have, or gain a Wound.
Escape: Reveal a Strength Hero you have, or gain a Wound.
Attack: 5 | VP: 3

---

### Skrulls

**Super-Skrull** (×3)
Fight: KO one of your Heroes.
Attack: 4 | VP: 2

**Skrull Shapeshifters** (×3)
Ambush: Capture the rightmost Hero from the HQ; this villain's Attack is set to that hero's Cost.
Fight: Gain the captured Hero.
Escape: The captured Hero is lost.
Attack: 0* | VP: 2

*Attack set to captured hero's Cost at Ambush time.*

**Skrull Queen Veranke** (×1)
Ambush: Capture the highest-Cost Hero from the HQ (player chooses if tied); this villain's Attack is set to that hero's Cost.
Fight: Gain the captured Hero.
Escape: The captured Hero is lost.
Attack: 0* | VP: 4

*Attack set to captured hero's Cost at Ambush time.*

**Paibok the Power Skrull** (×1)
Fight: Choose any Hero from the HQ and gain it for free.
Attack: 8 | VP: 3

---

### Spider-Foes

**Venom** (×2)
Fight Condition: Must have a Covert Hero to fight this villain.
Escape: Gain a Wound.
Attack: 5 | VP: 3

**Green Goblin** (×2)
Ambush: A Bystander is captured (placed in the city space where Green Goblin landed).
Attack: 6 | VP: 4

**The Lizard** (×2)
Fight: If fought in the Sewers, gain a Wound.
Attack: 3 | VP: 2

**Doctor Octopus** (×2)
Fight: Draw 8 cards at the start of your next turn instead of 6 (+2 next-turn draw; does not stack if fought twice in one turn).
Attack: 4 | VP: 2

---

### Henchmen

---

### Doombot Legion

**Doombot** (×10)
Fight: Reveal the top 2 cards of your deck; KO one of your choice, return the other to your deck.
Attack: 3 | VP: 1

---

### Hand Ninjas

**Hand Ninja** (×10)
Fight: Gain +1 Recruit.
Attack: 3 | VP: 1

---

### Savage Land Mutates

**Savage Land Mutate** (×10)
Fight: Draw 1 extra card at the start of your next turn.
Attack: 3 | VP: 1

---

### Sentinel

**Sentinel** (×10)
Fight: KO one of your Heroes.
Attack: 3 | VP: 1

---

### Masterminds

---

### Dr. Doom

**Dr. Doom** (Normal)
Always Leads: Doombot Legion (Henchmen)
Master Strike: Each player with exactly 6 cards in hand reveals a [TECH] Hero or puts two cards from their hand on top of their deck.
Attack: 9 | VP: 5

**Dark Technology** (Tactic)
Fight: You may recruit a [TECH] or [RANGED] Hero from the HQ for free.

**Monarch's Decree** (Tactic)
Fight: Choose one: each other player draws a card or each other player discards a card. *(Solo: skipped — "each other player" effect.)*

**Secrets of Time Travel** (Tactic)
Fight: Take another turn after this one.

**Treasures of Latveria** (Tactic)
Fight: When you draw a new hand of cards at the end of this turn, draw three extra cards.

---

### Loki

**Loki** (Normal)
Always Leads: Enemies of Asgard
Master Strike: Each player reveals a [STRENGTH] Hero or gains a Wound.
Attack: 10 | VP: 5

**Cruel Ruler** (Tactic)
Fight: Defeat a Villain in the City for free.

**Maniacal Tyrant** (Tactic)
Fight: KO up to four cards from your discard pile.

**Vanishing Illusions** (Tactic)
Fight: Each other player KOs a Villain from their Victory Pile. *(Solo: skipped — "each other player" effect.)*

**Whispers and Lies** (Tactic)
Fight: Each other player KOs two Bystanders from their Victory Pile. *(Solo: skipped — "each other player" effect.)*

---

### Magneto

**Magneto** (Normal)
Always Leads: Brotherhood
Master Strike: Each player reveals an [X-MEN] Hero or discards down to four cards.
Attack: 8 | VP: 5

**Bitter Captor** (Tactic)
Fight: Recruit an [X-MEN] Hero from the HQ for free.

**Crushing Shockwave** (Tactic)
Fight: Each other player reveals an [X-MEN] Hero or gains two Wounds. *(Solo: skipped — "each other player" effect.)*

**Electromagnetic Bubble** (Tactic)
Fight: Choose one of your [X-MEN] Heroes. When you draw a new hand of cards at the end of this turn, add that Hero to your hand as a seventh card.

**Xavier's Nemesis** (Tactic)
Fight: For each of your [X-MEN] Heroes, rescue a Bystander.

---

### Red Skull

**Red Skull** (Normal)
Always Leads: HYDRA
Master Strike: Each player KOs a Hero from their hand.
Attack: 7 | VP: 5

**Endless Resources** (Tactic)
Fight: You gain +4 [RECRUIT].

**HYDRA Conspiracy** (Tactic)
Fight: Draw two cards. Then draw another card for each HYDRA Villain in your Victory Pile.

**Negablast Grenades** (Tactic)
Fight: You gain +3 [ATTACK].

**Ruthless Dictator** (Tactic)
Fight: Look at the top three cards of your deck. KO one, discard one, and put one back on top of your deck.

---

### Schemes

---

**The Legacy Virus**
Setup: 8 Twists. Wound Deck reduced to 6 cards (6 Wounds per player).
Twist: Reveal a [TECH] Hero or gain a Wound.
Evil Wins: When the Wound Deck runs out.

---

**Midtown Bank Robbery**
Setup: 8 Twists. 12 Bystanders in the Villain Deck.
Twist: Any Villain in the Bank captures 2 Bystanders. Then play the top card of the Villain Deck.
Evil Wins: When 8 Bystanders have been carried away by escaping Villains.

---

**Negative Zone Prison Breakout**
Setup: 8 Twists. 2 Henchmen Groups.
Twist: Play the top two cards of the Villain Deck.
Evil Wins: When 12 Villains have escaped.

---

**Portals to the Dark Dimension**
Setup: 7 Twists.
Special Rules: Each Twist opens a Dark Portal, permanently granting +1 Attack. Twist 1 targets the Mastermind; subsequent Twists target city spaces from left to right.
Twist:
  - Twist 1: Dark Portal opens above the Mastermind (+1 Attack).
  - Twist 2: Dark Portal opens above the Bridge (+1 Attack).
  - Twist 3: Dark Portal opens above the Streets (+1 Attack).
  - Twist 4: Dark Portal opens above the Rooftops (+1 Attack).
  - Twist 5: Dark Portal opens above the Bank (+1 Attack).
  - Twist 6: Dark Portal opens above the Sewers (+1 Attack).
  - Twist 7: Evil Wins!
Evil Wins: When the 7th Twist is revealed (all portals opened).

---

**Replace Earth's Leaders with Killbots**
Setup: 5 Twists (+3 pre-stacked next to Mastermind = 8 total). 0 Bystanders in Villain Deck. 18 Bystanders become Killbot Villains (3 Attack, 1 VP each) shuffled into the Villain Deck.
Special Rules: Killbots start at 3 Attack. Scheme Twists are not KO'd when resolved — they stack next to the Mastermind.
Twist: All Killbots gain +1 Attack.
Evil Wins: When 5 Killbots have escaped.

---

**Secret Invasion of the Skrull Shapeshifters**
Setup: 8 Twists. Requires Skrulls as the Villain Group. 6 Heroes.
Twist: The highest-cost Hero from the HQ is "Skrulled" — it becomes a Villain (0 Attack) and is shuffled into the Villain Deck. The HQ slot is refilled, then the top card of the Villain Deck is played. Defeating a Skrulled Hero restores it as a hero card.
Evil Wins: When 6 Skrull Heroes have escaped.

---

**Super Hero Civil War**
Setup: 8 Twists. 4 Heroes.
Twist: KO all the Heroes in the HQ. (Slots are immediately refilled.)
Evil Wins: When the Hero Deck is empty.

---

**Unleash the Power of the Cosmic Cube**
Setup: 8 Twists.
Special Rules: Twist effects escalate as more Twists are revealed.
Twist:
  - Twists 1-4: Nothing happens.
  - Twist 5: Gain a Wound.
  - Twist 6: Gain a Wound.
  - Twist 7: Gain three Wounds.
  - Twist 8: Evil Wins!
Evil Wins: When the 8th Twist is revealed.
