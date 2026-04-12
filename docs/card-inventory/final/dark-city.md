<!-- INVENTORY STATUS:
  Heroes: ✅ Pass 2 complete. Corrections applied: Bishop Absorb Energies (+2 Recruit not Attack), Blade Night Hunter (+2 Recruit not Attack), Cable Disaster Survivalist (confirmed card text), Colossus Russian Heavy Tank (confirmed card text — dead in solo), Ghost Rider Penance Stare (superpower text corrected). Note: Cable Disaster Survivalist may be coded differently than card text — verify in-game later.
  Villains: ✅ Pass 2 complete. Corrections applied: War & Famine icons ([INSTINCT] not [STRENGTH]), Organized Crime Wave ambush text. Death code bug noted (scope too broad). Dracula escape confirmed — no explicit escape effect on card.
  Masterminds: ✅ Pass 2 complete. Apocalypse Special confirmed correct (Four Horsemen only).
  Schemes: ✅ Pass 2 complete. Transform Citizens Into Demons and X-Cutioner's Song fully rewritten from physical cards. Evil Wins conditions confirmed by code for all 4 previously flagged schemes.
  Henchmen: ✅ Pass 2 complete. No changes needed.
  Bystanders: ✅ Pass 2 complete. No changes needed.
  Last updated: 2026-04-03 (Pass 2: 2026-04-03)
-->

# Dark City — Card Inventory

**Primary source**: Track B: `cardDatabase.js` (structured fields), card images (effect text)
**Cross-check**: `cardAbilitiesDarkCity.js`, `script.js`
**Pass 1 date**: 2026-04-03
**Pass 2 date**: 2026-04-03 — Complete. Corrections applied (see status comment).

---

## New Keywords

- **Versatile [N]**: This card's Attack can be used as Recruit instead. The number indicates the value.
- **Teleport**: When you play this card, you may set it aside. At the start of your next turn, add it to your new hand.
- **Bribe**: You may spend Recruit in addition to Attack to fight this enemy.

---

## Section 1: Structured Data Tables

### Heroes

Standard distribution per hero: 1 Rare (1 copy), 1 Uncommon (3 copies), 2 Commons (5 copies each) = 14 cards total.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Angel | Diving Catch | Common A | 5 | 4 | X-Men | Strength | 0 | 2 |
| Angel | High-Speed Chase | Common B | 5 | 3 | X-Men | Covert | 0 | 0 |
| Angel | Drop Off A Friend | Uncommon | 3 | 5 | X-Men | Instinct | 2 | 0 |
| Angel | Strength of Spirit | Rare | 1 | 7 | X-Men | Strength | 4 | 0 |
| Bishop | Absorb Energies | Common A | 5 | 3 | X-Men | Covert | 2 | 0 |
| Bishop | Whatever the Cost | Common B | 5 | 2 | X-Men | Ranged | 0 | 0 |
| Bishop | Concussive Blast | Uncommon | 3 | 5 | X-Men | Ranged | 3+ | 0 |
| Bishop | Firepower from the Future | Rare | 1 | 7 | X-Men | Tech | 4+ | 0 |
| Blade | Stalk the Prey | Common A | 5 | 3 | Marvel Knights | Covert | 2 | 0 |
| Blade | Night Hunter | Common B | 5 | 4 | Marvel Knights | Strength | 2 | 0 |
| Blade | Nowhere To Hide | Uncommon | 3 | 6 | Marvel Knights | Tech | 3 | 0 |
| Blade | Vampiric Surge | Rare | 1 | 7 | Marvel Knights | Instinct | 0+ | 0 |
| Cable | Strike at the Heart of Evil | Common A | 5 | 4 | X-Force | Ranged | 2 | 0 |
| Cable | Disaster Survivalist | Common B | 5 | 3 | X-Force | Tech | 0 | 2 |
| Cable | Rapid Response Force | Uncommon | 3 | 6 | X-Force | Covert | 3+ | 0 |
| Cable | Army of One | Rare | 1 | 8 | X-Force | Ranged | 5+ | 0 |
| Colossus | Draw Their Fire | Common A | 5 | 1 | X-Force | Strength | 3 | 0 |
| Colossus | Invulnerability | Common B | 5 | 3 | X-Force | Strength | 0 | 2 |
| Colossus | Silent Statue | Uncommon | 3 | 6 | X-Force | Covert | 4+ | 0 |
| Colossus | Russian Heavy Tank | Rare | 1 | 8 | X-Force | Strength | 6 | 0 |
| Daredevil | Backflip | Common A | 5 | 3 | Marvel Knights | Strength | 0 | 2 |
| Daredevil | Radar Sense | Common B | 5 | 4 | Marvel Knights | Instinct | 2 | 0 |
| Daredevil | Blind Justice | Uncommon | 3 | 6 | Marvel Knights | Covert | 4 | 0 |
| Daredevil | The Man Without Fear | Rare | 1 | 8 | Marvel Knights | Instinct | 7 | 0 |
| Domino | Lucky Break | Common A | 5 | 1 | X-Force | Tech | 0 | 0 |
| Domino | Ready For Anything | Common B | 5 | 3 | X-Force | Instinct | 0 | 0 |
| Domino | Specialized Ammunition | Uncommon | 3 | 5 | X-Force | Tech | 0 | 0 |
| Domino | Against All Odds | Rare | 1 | 7 | X-Force | Covert | 0 | 0 |
| Elektra | First Strike | Common A | 5 | 1 | Marvel Knights | Covert | 1 | 0 |
| Elektra | Ninjitsu | Common B | 5 | 2 | Marvel Knights | Instinct | 0 | 0 |
| Elektra | Sai Blades | Uncommon | 3 | 6 | Marvel Knights | Instinct | 4+ | 0 |
| Elektra | Silent Meditation | Rare | 1 | 7 | Marvel Knights | Instinct | 0 | 5 |
| Forge | Reboot | Common A | 5 | 4 | X-Force | Tech | 0 | 2 |
| Forge | Dirty Work | Common B | 5 | 3 | X-Force | Tech | 2 | 0 |
| Forge | Overdrive | Uncommon | 3 | 5 | X-Force | Tech | 0 | 0 |
| Forge | B.F.G. | Rare | 1 | 7 | X-Force | Tech | 5 | 0 |
| Ghost Rider | Hell On Wheels | Common A | 5 | 3 | Marvel Knights | Tech | 0 | 2 |
| Ghost Rider | Blazing Hellfire | Common B | 5 | 5 | Marvel Knights | Ranged | 2+ | 0 |
| Ghost Rider | Infernal Chains | Uncommon | 3 | 2 | Marvel Knights | Strength | 0 | 0 |
| Ghost Rider | Penance Stare | Rare | 1 | 8 | Marvel Knights | Ranged | 3+ | 0 |
| Iceman | Ice Slide | Common A | 5 | 4 | X-Men | Ranged | 2+ | 0 |
| Iceman | Deep Freeze | Common B | 5 | 2 | X-Men | Ranged | 0 | 0 |
| Iceman | Frost Spike Armor | Uncommon | 3 | 5 | X-Men | Strength | 3 | 0 |
| Iceman | Impenetrable Ice Wall | Rare | 1 | 8 | X-Men | Ranged | 7 | 0 |
| Iron Fist | Focus Chi | Common A | 5 | 3 | Marvel Knights | Instinct | 0 | 0+ |
| Iron Fist | Wield the Iron Fist | Common B | 5 | 4 | Marvel Knights | Strength | 0+ | 0 |
| Iron Fist | Ancient Legacy | Uncommon | 3 | 1 | Marvel Knights | Strength | 0 | 0 |
| Iron Fist | Living Weapon | Rare | 1 | 9 | Marvel Knights | Strength | 8 | 0 |
| Jean Grey | Read Your Thoughts | Common A | 5 | 5 | X-Men | Covert | 0 | 3 |
| Jean Grey | Psychic Search | Common B | 5 | 3 | X-Men | Ranged | 2 | 0 |
| Jean Grey | Mind Over Matter | Uncommon | 3 | 6 | X-Men | Covert | 4 | 0 |
| Jean Grey | Telekinetic Mastery | Rare | 1 | 7 | X-Men | Ranged | 5 | 0 |
| Nightcrawler | Bamf! | Common A | 5 | 3 | X-Men | Instinct | 0 | 2 |
| Nightcrawler | Blend Into Shadows | Common B | 5 | 4 | X-Men | Covert | 2 | 0 |
| Nightcrawler | Swashbuckler | Uncommon | 3 | 5 | X-Men | Instinct | 3+ | 0 |
| Nightcrawler | Along for the Ride | Rare | 1 | 7 | X-Men | Covert | 5 | 0 |
| Professor X | Class Dismissed | Common A | 5 | 3 | X-Men | Instinct | 0 | 2 |
| Professor X | Psionic Astral Form | Common B | 5 | 2 | X-Men | Ranged | 1 | 0 |
| Professor X | Telepathic Probe | Uncommon | 3 | 5 | X-Men | Ranged | 3 | 0 |
| Professor X | Mind Control | Rare | 1 | 8 | X-Men | Covert | 6 | 0 |
| Punisher | Boom Goes the Dynamite | Common A | 5 | 2 | Marvel Knights | Tech | 0 | 0 |
| Punisher | Hail of Bullets | Common B | 5 | 5 | Marvel Knights | Tech | 2 | 0 |
| Punisher | Hostile Interrogation | Uncommon | 3 | 3 | Marvel Knights | Strength | 0 | 2 |
| Punisher | The Punisher | Rare | 1 | 8 | Marvel Knights | Tech | 4+ | 0 |
| X-Force Wolverine | Sudden Ambush | Common A | 5 | 4 | X-Force | Covert | 2+ | 0 |
| X-Force Wolverine | Animal Instincts | Common B | 5 | 2 | X-Force | Instinct | 0 | 0 |
| X-Force Wolverine | No Mercy | Uncommon | 3 | 4 | X-Force | Strength | 0 | 0 |
| X-Force Wolverine | Reckless Abandon | Rare | 1 | 7 | X-Force | Covert | 3+ | 0 |

---

### Villains

Standard villain group total: **8 cards** (all Dark City groups use default quantity of 2 per card = 8 cards per group).

**Emissaries of Evil** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Emissaries of Evil | Rhino | 2 | 5 | 3 |
| Emissaries of Evil | Electro | 2 | 6 | 4 |
| Emissaries of Evil | Egghead | 2 | 4 | 2 |
| Emissaries of Evil | Gladiator | 2 | 5 | 3 |

**Four Horsemen** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Four Horsemen | War | 2 | 6 | 4 |
| Four Horsemen | Famine | 2 | 4 | 2 |
| Four Horsemen | Pestilence | 2 | 5 | 3 |
| Four Horsemen | Death | 2 | 7 | 5 |

**Marauders** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Marauders | Scalphunter | 2 | 4+ | 2 |
| Marauders | Chimera | 2 | 3+ | 3 |
| Marauders | Blockbuster | 2 | 4+ | 2 |
| Marauders | Vertigo | 2 | 5 | 3 |

*Scalphunter gets +1 Attack per captured Bystander. Chimera gets +3 Attack per captured Bystander. Blockbuster gets +2 Attack per captured Bystander.*

**Mutant Liberation Front** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| MLF | Zero | 2 | 0* | 2 |
| MLF | Wildside | 2 | 5 | 3 |
| MLF | Forearm | 2 | 4* | 4 |
| MLF | Reignfire | 2 | 6 | 4 |

*Zero: To fight Zero, you must also discard three cards that cost 0. Forearm: To fight Forearm, you must also reveal four Hero cards with different card names.*

**Streets of New York** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Streets of New York | Bullseye | 2 | 6 | 4 |
| Streets of New York | Jigsaw | 2 | 11 | 5 |
| Streets of New York | Hammerhead | 2 | 5 | 2 |
| Streets of New York | Tombstone | 2 | 8 | 4 |

*Jigsaw, Hammerhead, and Tombstone have the Bribe keyword.*

**Underworld** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Underworld | Blackheart | 2 | 6 | 4 |
| Underworld | Dracula | 2 | 3+ | 4 |
| Underworld | Azazel | 2 | 4 | 2 |
| Underworld | Lilith, Daughter of Dracula | 2 | 5 | 3 |

*Dracula: Attack increases by captured Hero's Cost.*

---

### Henchmen

Standard henchmen group total: **10 identical cards**.

**Maggia Goons** — Bribe keyword

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Maggia Goons | Maggia Goons | 10 | 4 | 1 |

**Phalanx** — standard

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Phalanx | Phalanx | 10 | 3 | 1 |

---

### Masterminds

Each mastermind has 1 mastermind card + 4 tactic cards = 5 cards total.

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| Apocalypse | 12 | 6 | Four Horsemen |
| Kingpin | 13 | 6 | Streets of New York |
| Mephisto | 10 | 6 | Underworld |
| Mr. Sinister | 8 | 6 | Marauders |
| Stryfe | 7 | 6 | Mutant Liberation Front |

*Apocalypse: Four Horsemen get +2 Attack when led by Apocalypse.*
*Kingpin: Has the Bribe keyword.*

```
Apocalypse Tactics:
  Apocalyptic Destruction, Horsemen Are Drawing Nearer, Immortal and Undefeated, The End Of All Things

Kingpin Tactics:
  Call A Hit, Criminal Empire, Dirty Cops, Mob War

Mephisto Tactics:
  Damned If You Do..., Devilish Torment, Pain Begets Pain, The Price of Failure

Mr. Sinister Tactics:
  Human Experimentation, Master Geneticist, Plans Within Plans, Telepathic Manipulation

Stryfe Tactics:
  Furious Wrath, Psychic Torment, Swift Vengeance, Tide of Retribution
```

---

### Schemes

| Scheme Name | Twist Count | Bystander Count |
|---|---|---|
| Capture Baby Hope | 8 | default |
| Detonate the Helicarrier | 8 | default |
| Massive Earthquake Generator | 8 | default |
| Organized Crime Wave | 8 | default |
| Save Humanity | 8 | default |
| Steal the Weaponized Plutonium | 8 | default |
| Transform Citizens Into Demons | 8 | 0 |
| X-Cutioner's Song | 8 | 0 |

*Detonate the Helicarrier requires 6 Heroes.*
*Organized Crime Wave requires Maggia Goons as the Henchmen group.*
*Steal the Weaponized Plutonium requires 2 Villain Groups.*
*Transform Citizens Into Demons: Villain Deck includes 14 extra Jean Grey cards.*
*X-Cutioner's Song: Villain Deck includes 14 extra cards for an extra Hero.*

---

### Bystanders

| Card Name | Count | VP |
|---|---|---|
| News Reporter | 4 | 1 |
| Radiation Scientist | 4 | 1 |
| Paramedic | 3 | 1 |

---

## Section 2: Card Effects

---

### Heroes

---

### Angel

**Diving Catch** (Common A)
- SPECIAL ABILITY: When a card effect causes you to discard this card, rescue a Bystander and draw two cards.
- SUPERPOWER: NA

**High-Speed Chase** (Common B)
- SPECIAL ABILITY: Draw two cards, then discard a card.
- SUPERPOWER: NA

**Drop Off A Friend** (Uncommon)
- SPECIAL ABILITY: You may discard a card. You get +Attack equal to that card's Cost.
- SUPERPOWER: NA

**Strength of Spirit** (Rare)
- SPECIAL ABILITY: Discard any number of cards. Draw that many cards.
- SUPERPOWER: NA

---

### Bishop

**Absorb Energies** (Common A)
- SPECIAL ABILITY: Whenever a card you own is KO'd this turn, you get +2 Recruit.
- SUPERPOWER: NA

**Whatever the Cost** (Common B)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: [COVERT]: You may KO a card from your hand or discard pile.

**Concussive Blast** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [RANGED][RANGED]: You get +3 Attack.

**Firepower from the Future** (Rare)
- SPECIAL ABILITY: Discard the top four cards of your deck. You get +Attack equal to their total Attack. [X-MEN]: KO any number of those cards.
- SUPERPOWER: NA


---

### Blade

**Stalk the Prey** (Common A)
- SPECIAL ABILITY: You may move a Villain to an adjacent city space. If another Villain is already there, swap them.
- SUPERPOWER: NA

**Night Hunter** (Common B)
- SPECIAL ABILITY: Whenever you defeat a Villain in the Sewers or Rooftops this turn, you get +2 Recruit.
- SUPERPOWER: NA

**Nowhere To Hide** (Uncommon)
- SPECIAL ABILITY: Whenever you defeat a Villain in the Sewers or Rooftops this turn, draw two cards.
- SUPERPOWER: NA

**Vampiric Surge** (Rare)
- SPECIAL ABILITY: You get +1 Attack for each Villain in your Victory Pile.
- SUPERPOWER: NA

---

### Cable

**Strike at the Heart of Evil** (Common A)
- SPECIAL ABILITY: You get +2 Attack only when fighting the Mastermind.
- SUPERPOWER: NA

**Disaster Survivalist** (Common B)
- SPECIAL ABILITY: When a Master Strike is played, before it takes effect, you may discard this card. If you do, draw three extra cards at the end of this turn.
- SUPERPOWER: NA

✅ Pass 2: Card text confirmed by physical card. Note: the card does NOT cancel the Master Strike — it just gives draw-3 compensation. ⚠️ Code note: ability may be coded differently than card text describes (possibly as a popup-based discard trigger). Verify in-game behavior in a future session.

**Rapid Response Force** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [X-FORCE]: You get +1 Attack for each other X-Force Hero you played this turn.
- Keywords: Teleport

**Army of One** (Rare)
- SPECIAL ABILITY: KO any number of cards from your hand. You get +1 Attack for each card KO'd this way.
- SUPERPOWER: NA

---

### Colossus

**Draw Their Fire** (Common A)
- SPECIAL ABILITY: You gain a Wound.
- SUPERPOWER: NA

**Invulnerability** (Common B)
- SPECIAL ABILITY: If you would gain a Wound, you may discard this card instead. If you do, draw two cards.
- SUPERPOWER: NA

**Silent Statue** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [STRENGTH]: You get +2 Attack.

**Russian Heavy Tank** (Rare)
- SPECIAL ABILITY: If another player would gain a Wound, you may reveal this card to gain that Wound and draw a card.
- SUPERPOWER: NA

✅ Pass 2: Card text confirmed by physical card. Effect is dead in solo play (no "another player" to trigger from). Not coded, which is correct. ⚠️ General note: "other player" effects in solo mode merit a broader review conversation — some apply, some don't.

---

### Daredevil

**Backflip** (Common A)
- SPECIAL ABILITY: When you play Backflip, the next Hero you recruit this turn goes on top of your deck.
- SUPERPOWER: NA

**Radar Sense** (Common B)
- SPECIAL ABILITY: Choose a number, then reveal the top card of your deck. If the card is that Cost, you get +2 Attack.
- SUPERPOWER: NA

**Blind Justice** (Uncommon)
- SPECIAL ABILITY: Choose a number, then reveal the top card of your deck. If the card is that Cost, draw it.
- SUPERPOWER: NA

**The Man Without Fear** (Rare)
- SPECIAL ABILITY: Choose a number, then reveal the top card of your deck. If the card is that Cost, draw it and repeat this process.
- SUPERPOWER: NA

---

### Domino

**Lucky Break** (Common A)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: [X-FORCE]: Versatile 1.
- Keywords: Versatile

**Ready For Anything** (Common B)
- SPECIAL ABILITY: Versatile 2.
- SUPERPOWER: NA
- Keywords: Versatile

**Specialized Ammunition** (Uncommon)
- SPECIAL ABILITY: You may discard a card from your hand. If that card has a Recruit icon, you get +4 Recruit. If that card has an Attack icon, you get +4 Attack.
- SUPERPOWER: NA

**Against All Odds** (Rare)
- SPECIAL ABILITY: Versatile 5.
- SUPERPOWER: [X-FORCE]: This card and each other Versatile ability you use this turn produce both Recruit and Attack.
- Keywords: Versatile

---

### Elektra

**First Strike** (Common A)
- SPECIAL ABILITY: If this is the first card you played this turn, you get +1 Attack.
- SUPERPOWER: NA

**Ninjitsu** (Common B)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: [COVERT]: You get +2 Recruit.

**Sai Blades** (Uncommon)
- SPECIAL ABILITY: You get +1 Attack for each Hero you played this turn that costs 1 or 2.
- SUPERPOWER: NA

**Silent Meditation** (Rare)
- SPECIAL ABILITY: When you play Silent Meditation, the next Hero you recruit this turn goes into your hand.
- SUPERPOWER: [MARVEL KNIGHTS]: You get +2 Recruit.

---

### Forge

**Reboot** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [TECH]: You may discard a card. If you do, draw two cards.

**Dirty Work** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [TECH]: Any Villain you fight in the Sewers this turn gets -2 Attack.

**Overdrive** (Uncommon)
- SPECIAL ABILITY: Versatile 3.
- SUPERPOWER: NA
- Keywords: Versatile

**B.F.G.** (Rare)
- SPECIAL ABILITY: NA
- SUPERPOWER: [TECH][TECH]: Defeat the Mastermind once for free.

---

### Ghost Rider

**Hell On Wheels** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [MARVEL KNIGHTS]: You get +2 Recruit.

**Blazing Hellfire** (Common B)
- SPECIAL ABILITY: You may KO a Villain from your Victory Pile. If you do, you get +3 Attack.
- SUPERPOWER: NA

**Infernal Chains** (Uncommon)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: [STRENGTH]: Defeat a Villain of 3 Attack or less for free.

**Penance Stare** (Rare)
- SPECIAL ABILITY: Each player KOs a Villain from their Victory Pile. You get +1 Attack for each Villain KO'd this way.
- SUPERPOWER: [MARVEL KNIGHTS]: Put one of those Villains into your Victory Pile.

✅ Pass 2: Card text confirmed by physical card. In solo, "each player" = just you → KO one Villain, get +1 Attack. With [MARVEL KNIGHTS] superpower, you put one KO'd Villain back into your VP (net effect: +1 Attack, Villain stays). Code takes a shortcut (skips KO entirely with MK active) but result is functionally equivalent in solo.

---

### Iceman

**Ice Slide** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [RANGED]: You get +1 Attack for each other Ranged Hero you played this turn.

**Deep Freeze** (Common B)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: [RANGED]: You get +1 Recruit for each other Ranged Hero you played this turn.

**Frost Spike Armor** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [RANGED]: Draw a card for each Ranged Hero you played this turn.

**Impenetrable Ice Wall** (Rare)
- SPECIAL ABILITY: If a Villain, Master Strike, or Mastermind Tactic would cause you to get any Wounds or discard from your deck, you may reveal this card instead.
- SUPERPOWER: NA


---

### Iron Fist

**Focus Chi** (Common A)
- SPECIAL ABILITY: You get +1 Recruit for each Hero with a different cost you have.
- SUPERPOWER: NA

**Wield the Iron Fist** (Common B)
- SPECIAL ABILITY: You get +1 Attack for each Hero with a different cost you have.
- SUPERPOWER: NA

**Ancient Legacy** (Uncommon)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: [STRENGTH][STRENGTH]: Versatile 2.
- Keywords: Versatile

**Living Weapon** (Rare)
- SPECIAL ABILITY: Reveal cards from your deck until you find two cards with the same cost. Draw all the cards you revealed.
- SUPERPOWER: NA


---

### Jean Grey

**Read Your Thoughts** (Common A)
- SPECIAL ABILITY: Whenever you rescue a Bystander this turn, you get +1 Recruit.
- SUPERPOWER: NA

**Psychic Search** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [X-MEN]: Rescue a Bystander.

**Mind Over Matter** (Uncommon)
- SPECIAL ABILITY: Whenever you rescue a Bystander this turn, draw a card.
- SUPERPOWER: NA

**Telekinetic Mastery** (Rare)
- SPECIAL ABILITY: Whenever you rescue a Bystander this turn, you get +1 Attack.
- SUPERPOWER: [X-MEN]: Rescue a Bystander for each other X-Men Hero you played this turn.


---

### Nightcrawler

**Bamf!** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: NA
- Keywords: Teleport

**Blend Into Shadows** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: NA
- Keywords: Teleport

**Swashbuckler** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [INSTINCT][COVERT]: You get +3 Attack.

**Along for the Ride** (Rare)
- SPECIAL ABILITY: When you play or Teleport this card, you may also Teleport up to three other cards from your hand.
- SUPERPOWER: NA
- Keywords: Teleport

---

### Professor X

**Class Dismissed** (Common A)
- SPECIAL ABILITY: You may put a Hero from the HQ on the bottom of the Hero Deck.
- SUPERPOWER: [INSTINCT]: You may KO a card from your hand or discard pile.

**Psionic Astral Form** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [X-MEN]: You get +2 Attack.

**Telepathic Probe** (Uncommon)
- SPECIAL ABILITY: Reveal the top card of the Villain Deck. If it's a Bystander, you may rescue it. If it's a Villain, you may fight it this turn.
- SUPERPOWER: NA

**Mind Control** (Rare)
- SPECIAL ABILITY: Whenever you defeat a Villain this turn, you may gain it. It becomes a grey Hero with no text that gives +Attack equal to its Attack. (You still get its Victory Points.)
- SUPERPOWER: NA

---

### Punisher

**Boom Goes the Dynamite** (Common A)
- SPECIAL ABILITY: Reveal the top card of your deck. If it costs 0 Recruit, KO it.
- SUPERPOWER: [TECH]: Draw a card.

**Hail of Bullets** (Common B)
- SPECIAL ABILITY: Reveal the top card of the Villain Deck. If it's a Villain, you get +Attack equal to that Villain's VP.
- SUPERPOWER: [TECH][TECH]: You may defeat that Villain for free.

**Hostile Interrogation** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [STRENGTH]: Each other player reveals the top card of their deck. If it costs 4 or more, discard it.

**The Punisher** (Rare)
- SPECIAL ABILITY: Reveal cards from the Hero Deck until you reveal two cards with the same cost. Put them all on the bottom of the Hero Deck in random order. You get +1 Attack for each card revealed this way.
- SUPERPOWER: NA

---

### X-Force Wolverine

**Sudden Ambush** (Common A)
- SPECIAL ABILITY: If you drew any extra cards this turn, you get +2 Attack.
- SUPERPOWER: NA

**Animal Instincts** (Common B)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: [INSTINCT]: You get +2 Attack.

**No Mercy** (Uncommon)
- SPECIAL ABILITY: Draw a card. You may KO a card from your hand or discard pile.
- SUPERPOWER: NA

**Reckless Abandon** (Rare)
- SPECIAL ABILITY: Count the number of extra cards you drew this turn. Draw that many cards.
- SUPERPOWER: NA

---

### Villains

---

### Emissaries of Evil

**Rhino** (×2)
Ambush: Reveal the top card of the Villain Deck. If it's a Master Strike, each player gains a Wound.
Escape: Each player gains a Wound.
Attack: 5 | VP: 3

**Electro** (×2)
Ambush: Reveal the top card of the Villain Deck. If it's a Scheme Twist, play it.
Attack: 6 | VP: 4

**Egghead** (×2)
Ambush: Reveal the top card of the Villain Deck. If it's a Villain, play it.
Attack: 4 | VP: 2

**Gladiator** (×2)
Ambush: Reveal the top card of the Villain Deck. If it's a Bystander, Gladiator captures it.
Attack: 5 | VP: 3

---

### Four Horsemen

**War** (×2)
Fight: Each other player reveals a [INSTINCT] Hero or gains a Wound.
Escape: Each player does that same effect.
Attack: 6 | VP: 4

**Famine** (×2)
Fight: Each other player reveals a [INSTINCT] Hero or discards a card.
Escape: Each player does that same effect.
Attack: 4 | VP: 2

**Pestilence** (×2)
Fight: Each other player reveals the top three cards of their deck, discards each of those cards that costs 1 or more, and puts the rest back in any order.
Escape: Each player does that same effect.
Attack: 5 | VP: 3

**Death** (×2)
Fight: Each other player reveals their hand and KOs one of their Heroes that costs 1 or more.
Escape: Each player does that same effect.
Attack: 7 | VP: 5

⚠️ Code bug: `deathFight()` scope includes hand + played cards + artifacts (should be hand only per card text). `deathEscape()` includes hand + played cards (no artifacts). Both are too broad. Low priority — address in a future code cleanup pass.

---

### Marauders

**Scalphunter** (×2)
Scalphunter gets +1 Attack for each Bystander he has.
Ambush: Each player chooses a Bystander from their Victory Pile. Scalphunter captures those Bystanders.
Attack: 4+ | VP: 2

**Chimera** (×2)
Chimera gets +3 Attack for each Bystander she has.
Ambush: Reveal the top three cards of the Villain Deck. Chimera captures all the Bystander cards you revealed. Put the rest back in random order.
Attack: 3+ | VP: 3

**Blockbuster** (×2)
Blockbuster gets +2 Attack for each Bystander he has.
Ambush: If there is a Villain in the Bank, that Villain and Blockbuster each capture a Bystander.
Attack: 4+ | VP: 2

**Vertigo** (×2)
Fight: Each player discards all the cards in their hand, then draws as many cards as they discarded.
Attack: 5 | VP: 3

---

### Mutant Liberation Front

**Zero** (×2)
To fight Zero, you must also discard three cards that cost 0.
Attack: 0* | VP: 2

**Wildside** (×2)
Fight: If you fight Wildside in the Sewers or Bank, KO two of your Heroes.
Attack: 5 | VP: 3

**Forearm** (×2)
To fight Forearm, you must also reveal four Hero cards with different card names.
Attack: 4* | VP: 4

**Reignfire** (×2)
Escape: Reignfire becomes a Master Strike that takes effect immediately.
Attack: 6 | VP: 4

---

### Streets of New York

**Bullseye** (×2)
Fight: KO one of your Heroes with a Recruit icon and one of your Heroes with an Attack icon.
Attack: 6 | VP: 4

**Jigsaw** (×2)
Bribe.
Ambush: Each player discards three cards, then draws two cards.
Attack: 11 | VP: 5

**Hammerhead** (×2)
Bribe.
Fight: KO one of your Heroes with a Recruit icon.
Attack: 5 | VP: 2

**Tombstone** (×2)
Bribe.
Escape: Each player reveals a [STRENGTH] Hero or gains a Wound.
Attack: 8 | VP: 4

---

### Underworld

**Blackheart** (×2)
Ambush: The player to your right reveals a [MARVEL KNIGHTS] Hero or gains a Wound.
Fight: Same effect.
Escape: Same effect.
Attack: 6 | VP: 4

**Dracula** (×2)
Ambush: Dracula captures the top card of the Hero Deck. Dracula gets +Attack equal to that card's Cost.
Fight: Gain that card.
Attack: 3+ | VP: 4

**Azazel** (×2)
Fight: A card in your hand gains Teleport this turn.
Attack: 4 | VP: 2

**Lilith, Daughter of Dracula** (×2)
Escape: Each player without Dracula in their Victory Pile gains a Wound.
Attack: 5 | VP: 3

---

### Henchmen

---

### Maggia Goons

**Maggia Goons** (×10)
Bribe.
Fight: KO one of your Heroes.
Attack: 4 | VP: 1

---

### Phalanx

**Phalanx** (×10)
Fight: Reveal a [TECH] Hero or KO one of your Heroes with an Attack icon.
Attack: 3 | VP: 1

---

### Masterminds

---

### Apocalypse

**Apocalypse** (Normal)
Always Leads: Four Horsemen
Special: Four Horsemen get +2 Attack when led by Apocalypse.
Master Strike: Each player reveals their hand and puts all their Heroes that cost 1 or more on the top of their deck.
Attack: 12 | VP: 6

**Apocalyptic Destruction** (Tactic)
Fight: Each other player KOs two Heroes from their discard pile that each cost 1 or more.

**Horsemen Are Drawing Nearer** (Tactic)
Fight: Each other player plays a Four Horsemen Villain from their Victory Pile as if playing it from the Villain Deck.

**Immortal and Undefeated** (Tactic)
Fight: If this is not the final Tactic, rescue six Bystanders and shuffle this Tactic back into the other Tactics.

**The End Of All Things** (Tactic)
Fight: Each other player reveals the top three cards of their deck, KOs each one of those cards that cost 1 or more, and puts the rest back in any order.

---

### Kingpin

**Kingpin** (Normal)
Bribe.
Always Leads: Streets of New York
Master Strike: Each player reveals a [MARVEL KNIGHTS] Hero or discards their hand and draws 5 cards.
Attack: 13 | VP: 6

**Call A Hit** (Tactic)
Fight: Choose a Hero from each player's discard pile and KO it.

**Criminal Empire** (Tactic)
Fight: If this is not the final Tactic, reveal the top three cards of the Villain Deck. Play all the Villains you revealed. Put the rest back in random order.

**Dirty Cops** (Tactic)
Fight: Put a 0-cost Hero from the KO pile on top of each other player's deck.

**Mob War** (Tactic)
Fight: Each other player plays a Henchman Villain from their Victory Pile as if playing it from the Villain Deck.

---

### Mephisto

**Mephisto** (Normal)
Always Leads: Underworld
Special: Whenever a player gains a Wound, put it on top of their deck.
Master Strike: Each player reveals a [MARVEL KNIGHTS] Hero or gains a Wound.
Attack: 10 | VP: 6

**Damned If You Do...** (Tactic)
Fight: Each other player KOs a Bystander from their Victory Pile or gains a Wound.

**Devilish Torment** (Tactic)
Fight: Each other player puts all 0-cost cards from their discard pile on top of their deck in any order.

**Pain Begets Pain** (Tactic)
Fight: Choose any number of Wounds from your hand and discard pile. The player to your right gains them.

**The Price of Failure** (Tactic)
Fight: Each other player without a Mastermind Tactic in their Victory Pile gains a Wound.

---

### Mr. Sinister

**Mr. Sinister** (Normal)
Always Leads: Marauders
Master Strike: Mr. Sinister captures a Bystander. Then each player with exactly 6 cards reveals a [COVERT] Hero or discards cards equal to the number of Bystanders Mr. Sinister has.
Attack: 8 | VP: 6

**Human Experimentation** (Tactic)
Fight: Mr. Sinister captures Bystanders equal to the number of Villains in the city.

**Master Geneticist** (Tactic)
Fight: Reveal the top seven cards of the Villain Deck. Mr. Sinister captures all the Bystanders you revealed. Put the rest back in random order.

**Plans Within Plans** (Tactic)
Fight: Mr. Sinister captures a Bystander for each Mr. Sinister Tactic in players' Victory Piles, including this Tactic.

**Telepathic Manipulation** (Tactic)
Fight: Mr. Sinister captures a Bystander from each other player's Victory Pile.

---

### Stryfe

**Stryfe** (Normal)
Always Leads: Mutant Liberation Front
Master Strike: Stack this Master Strike next to Stryfe. Stryfe gets +1 Attack for each Master Strike stacked next to him. Each player reveals a [X-FORCE] Hero or discards a card at random.
Attack: 7 | VP: 6

**Furious Wrath** (Tactic)
Fight: Reveal the top six cards of the Villain Deck. Play all the Master Strikes you revealed. Put the rest back in random order.

**Psychic Torment** (Tactic)
Fight: Look at the top five cards of your deck. Put one into your hand and discard the rest.

**Swift Vengeance** (Tactic)
Fight: A Wound from the Wound Stack becomes a Master Strike that takes effect immediately.

**Tide of Retribution** (Tactic)
Fight: Each other player reveals an [X-FORCE] Hero or gains a Wound.

---

### Schemes

---

**Capture Baby Hope**
Setup: 8 Twists. Put a "Baby Hope" token on this Scheme.
Special Rules: A Villain holding the baby gets +4 Attack. If you defeat that Villain, you get the baby. You can spend 2 Recruit to move the baby to an adjacent Villain. You can spend 6 Recruit to rescue the baby from any Villain. When you have the baby, put it on this Scheme.
Twist: If a Villain has the baby, that Villain escapes. Otherwise, the baby is captured by the closest Villain to the Villain Deck. (If there are no Villains, do nothing.)
Evil Wins: 3 Villains with the baby escape.

---

**Detonate the Helicarrier**
Setup: 8 Twists. 6 Heroes in the Hero Deck.
Special Rules: Whenever a Hero is KO'd from the HQ, count how many times a Hero has been KO'd from that space. If that count is 6 or more, that HQ space is "destroyed" for the rest of the game.
Twist: Stack this Twist next to the Scheme. Then for each Twist in that stack, KO the leftmost Hero in the HQ and immediately refill that space.
Evil Wins: All 5 HQ spaces are destroyed. ✅ (Confirmed by code.)

---

**Massive Earthquake Generator**
Setup: 8 Twists.
Twist: Each player reveals a [STRENGTH] Hero or KOs the top card of their deck.
Evil Wins: When the number of non-grey Heroes in the KO pile is 3 times the number of players.

---

**Organized Crime Wave**
Setup: 8 Twists. Add 10 Maggia Goons to the Villain Deck.
Special Rules: Maggia Goons also have the ability "Ambush: Play another card from the Villain Deck."
Twist: Each Maggia Goons in the city escapes. Shuffle all Maggia Goons from each players' Victory Piles into the Villain Deck.
Evil Wins: 5 Maggia Goons escape.

---

**Save Humanity**
Setup: 8 Twists. Put 12 Bystanders in the Hero Deck. (Count them as 2-cost Heroes.)
Twist: KO all Bystanders in the HQ. Then each player reveals an [INSTINCT] Hero or KOs a Bystander from their Victory Pile.
Evil Wins: When 4 or more Bystanders are in the KO pile or Escaped Villains pile. ✅ (Confirmed by code.)

---

**Steal the Weaponized Plutonium**
Setup: 8 Twists. 2 Villain Groups.
Special Rules: Each Twist is a "Plutonium" that is captured by a Villain. When a Villain escapes with Plutonium, stack that Plutonium next to the Mastermind.
Twist: This Plutonium is captured by the closest Villain to the Villain Deck. If there are no Villains in the city, KO this Plutonium. Either way, play another card from the Villain Deck.
Evil Wins: 4 Plutonium stacked next to the Mastermind.

---

**Transform Citizens Into Demons**
Setup: 8 Twists. Villain Deck includes 14 extra Jean Grey cards and no Bystanders.
Special Rules: Each Jean Grey card counts as a "Goblin Queen" Villain. It's worth 4 VP. It has Attack equal to its Cost plus the number of Demon Goblins stacked next to the Scheme.
Twist: Stack 5 Bystanders face down next to the Scheme. Bystanders stacked here are "Demon Goblin" Villains. They have 2 Attack. Players can fight these Demon Goblins to rescue them as Bystanders.
Evil Wins: 4 Goblin Queen cards escape. ✅ (Confirmed by physical card and code.)

---

**X-Cutioner's Song**
Setup: 8 Twists. Villain Deck includes 14 extra cards for an extra Hero and no Bystanders.
Special Rules: Whenever you play a Hero from the Villain Deck, that Hero is captured by the closest enemy to the Villain Deck. Each Villain gets +2 Attack for each Hero it has. When you fight an enemy, gain all the Heroes captured by that enemy.
Twist: KO all Heroes captured by enemies. Then play another card from the Villain Deck.
Evil Wins: 9 non-grey Heroes are KO'd or carried off. ✅ (Confirmed by physical card and code.)

---

### Bystanders

**News Reporter** (×4)
When you rescue this Bystander, draw a card.

**Paramedic** (×3)
When you rescue this Bystander, you may KO a Wound from your hand or discard pile.

**Radiation Scientist** (×4)
When you rescue this Bystander, you may KO one of your Heroes or a Hero from your discard pile.
