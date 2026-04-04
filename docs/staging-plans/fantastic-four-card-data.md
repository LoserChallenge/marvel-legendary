<!-- INVENTORY STATUS:
  Heroes: ✅ (8 ⚠️ — card images too small for verbatim text; effects derived from code cross-reference)
  Villains: ✅
  Masterminds: ✅
  Schemes: ✅
  Henchmen: — (none in this expansion)
  Bystanders/Sidekicks: — (none in this expansion)
  Last updated: 2026-04-03
-->

# Fantastic Four — Card Inventory

**Primary source**: Track B: `cardDatabase.js` (structured fields), card images (effect text)
**Cross-check**: `expansionFantasticFour.js`, `script.js`
**Pass 1 date**: 2026-04-03
**Pass 2 status**: Pending — run `/inventory-verifier` in a fresh session

---

## New Keywords

- **Focus [N]**: You may spend N Recruit. If you do, look at the top 2 cards of your deck. Draw one and discard the other, then apply the Focus effect.
- **Cosmic Threat ([Class])**: Once per turn, before fighting this enemy, you may reveal any number of [Class] Heroes from your hand. For each card revealed, this enemy gets -3 Attack this turn.
- **Burrow**: Fight: If the Streets are empty when you defeat this Villain outside the Streets, it moves back to the Streets instead of going to your Victory Pile. You must fight it again in the Streets.

---

## Section 1: Structured Data Tables

### Heroes

Standard distribution per hero: 1 Rare (1 copy), 1 Uncommon (3 copies), 2 Commons (5 copies each) = 14 cards total.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Human Torch | Call for Backup | Common A | 5 | 3 | Fantastic Four | Instinct | 0 | 2+ |
| Human Torch | Hothead | Common B | 5 | 4 | Fantastic Four | Ranged | 4 | 0 |
| Human Torch | Flame On! | Uncommon | 3 | 6 | Fantastic Four | Ranged | 4+ | 0 |
| Human Torch | Nova Flame | Rare | 1 | 8 | Fantastic Four | Ranged | 6+ | 0 |
| Invisible Woman | Disappearing Act | Common A | 5 | 4 | Fantastic Four | Covert | 0 | 2 |
| Invisible Woman | Four of a Kind | Common B | 5 | 4 | Fantastic Four | Ranged | 2+ | 0 |
| Invisible Woman | Unseen Rescue | Uncommon | 3 | 4 | Fantastic Four | Covert | 2 | 0 |
| Invisible Woman | Invisible Barrier | Rare | 1 | 7 | Fantastic Four | Covert | 5 | 0 |
| Mr. Fantastic | Twisting Equations | Common A | 5 | 3 | Fantastic Four | Tech | 0 | 2 |
| Mr. Fantastic | Unstable Molecules | Common B | 5 | 5 | Fantastic Four | Tech | 0 | 0 |
| Mr. Fantastic | One Gigantic Hand | Uncommon | 3 | 5 | Fantastic Four | Instinct | 1+ | 0 |
| Mr. Fantastic | Ultimate Nullifier | Rare | 1 | 7 | Fantastic Four | Tech | 4+ | 0 |
| Silver Surfer | Warp Speed | Common A | 5 | 3 | None | Covert | 0 | 2 |
| Silver Surfer | Epic Destiny | Common B | 5 | 4 | None | Strength | 0 | 2 |
| Silver Surfer | The Power Cosmic | Uncommon | 3 | 6 | None | Ranged | 0 | 3+ |
| Silver Surfer | Energy Surge | Rare | 1 | 7 | None | Ranged | 0 | 0+ |
| Thing | It Started on Yancy Street | Common A | 5 | 3 | Fantastic Four | Instinct | 0 | 2+ |
| Thing | Knuckle Sandwich | Common B | 5 | 5 | Fantastic Four | Strength | 0 | 3 |
| Thing | Crime Stopper | Uncommon | 3 | 6 | Fantastic Four | Strength | 4 | 0 |
| Thing | It's Clobberin' Time! | Rare | 1 | 8 | Fantastic Four | Strength | 5+ | 0 |

*Silver Surfer has no team affiliation — this is correct, not missing data.*

---

### Villains

Standard villain group total: **8 cards** (all Fantastic Four groups use default quantity of 2 per card = 8 cards per group).

**Heralds of Galactus** (8 cards) — All have the Cosmic Threat keyword.

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Heralds of Galactus | Firelord | 2 | 9 | 4 |
| Heralds of Galactus | Morg | 2 | 12 | 6 |
| Heralds of Galactus | Stardust | 2 | 10 | 5 |
| Heralds of Galactus | Terrax the Tamer | 2 | 11 | 5 |

*Cosmic Threat classes: Firelord = Ranged, Morg = Instinct, Stardust = Covert, Terrax = Strength.*

**Subterranea** (8 cards) — All have the Burrow keyword.

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Subterranea | Giganto | 2 | 7 | 4 |
| Subterranea | Megataur | 2 | 6 | 4 |
| Subterranea | Moloids | 2 | 3 | 2 |
| Subterranea | Ra'ktar the Molan King | 2 | 4 | 2 |

---

### Masterminds

Each mastermind has 1 mastermind card + 4 tactic cards = 5 cards total.

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| Galactus | 20 | 7 | Heralds of Galactus |
| Mole Man | 7 | 6 | Subterranea |

*Galactus has the Cosmic Threat keyword (player chooses which class to reveal).*
*Mole Man's abilities apply to whichever Villain Group is in play, as if they were Subterranea (official errata).*

```
Galactus Tactics:
  Cosmic Entity, Force of Eternity, Panicked Mobs, Sunder the Earth

Mole Man Tactics:
  Dig to Freedom, Master of Monsters, Secret Tunnel, Underground Riches
```

---

### Schemes

| Scheme Name | Twist Count | Bystander Count |
|---|---|---|
| Bathe Earth in Cosmic Rays | 6 | default |
| Flood the Planet with Melted Glaciers | 8 | default |
| Invincible Force Field | 7 | default |
| Pull Reality Into the Negative Zone | 8 | default |

*All four schemes require 1 Villain Group, 1 Henchmen Group, 3 Heroes.*

---

## Section 2: Card Effects

---

### Heroes

---

### Human Torch

**Call for Backup** (Common A)
- SPECIAL ABILITY: You may KO a Wound from your hand or discard pile. If you do, you get +1 Recruit.
- SUPERPOWER: NA

⚠️ Card image too small for verbatim text — effect derived from code cross-reference. Verify with physical card.

**Hothead** (Common B)
- SPECIAL ABILITY: You gain a Wound.
- SUPERPOWER: NA

**Flame On!** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: NA
- Keywords: Focus 6 — You get +4 Attack.

⚠️ Card image too small — effect derived from code. Verify with physical card.

**Nova Flame** (Rare)
- SPECIAL ABILITY: NA
- SUPERPOWER: [FANTASTIC FOUR]: You get +1 Attack for each city space that contains a Villain.

⚠️ Card image too small — effect derived from code. Verify with physical card.

---

### Invisible Woman

**Disappearing Act** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: NA
- Keywords: Focus 2 — You may KO a card from your hand or discard pile.

⚠️ Card image too small — effect derived from code. Verify with physical card.

**Four of a Kind** (Common B)
- SPECIAL ABILITY: If you played any other cards that cost 4 this turn, you get +2 Attack.
- SUPERPOWER: NA

**Unseen Rescue** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: NA
- Keywords: Focus 2 — Rescue a Bystander.

⚠️ Card image too small — effect derived from code. Verify with physical card.

**Invisible Barrier** (Rare)
- SPECIAL ABILITY: If an Ambush effect would occur, you may reveal this card instead and draw two cards.
- SUPERPOWER: NA

⚠️ Card image too small — effect derived from code. Verify with physical card.

---

### Mr. Fantastic

**Twisting Equations** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: NA
- Keywords: Focus 2 — When you draw a new hand of cards next turn, draw an extra card.

⚠️ Card image too small — effect derived from code. Verify with physical card.

**Unstable Molecules** (Common B)
- SPECIAL ABILITY: Draw two cards.
- SUPERPOWER: NA

**One Gigantic Hand** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [FANTASTIC FOUR]: You get +1 Attack for each card in your hand.

**Ultimate Nullifier** (Rare)
- SPECIAL ABILITY: If an enemy you fight this turn would have a Fight effect, you may cancel that effect instead.
- SUPERPOWER: NA
- Keywords: Focus 1 — You get +1 Attack usable only against the Mastermind.

⚠️ Card image too small — effect derived from code. Verify with physical card.

---

### Silver Surfer

**Warp Speed** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: NA
- Keywords: Focus 2 — Draw a card.

**Epic Destiny** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: NA
- Keywords: Focus 6 — Defeat a Villain with 5 or 6 Fight.

⚠️ Card image too small — effect derived from code. Verify exact wording with physical card.

**The Power Cosmic** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: NA
- Keywords: Focus 9 — You get +9 Attack.

**Energy Surge** (Rare)
- SPECIAL ABILITY: Double the Recruit you have.
- SUPERPOWER: NA

---

### Thing

**It Started on Yancy Street** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [FANTASTIC FOUR]: You get +2 Recruit.

**Knuckle Sandwich** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: NA
- Keywords: Focus 3 — You get +2 Attack.

⚠️ DB shows both attackIcon and recruitIcon = true with recruit base 3. Card provides 3 Recruit; Focus spends that Recruit for Attack. Verify with physical card.

**Crime Stopper** (Uncommon)
- SPECIAL ABILITY: Whenever you defeat a Villain in the Bank this turn, rescue a Bystander.
- SUPERPOWER: NA
- Keywords: Focus 1 — Move a Villain to an adjacent city space. If another Villain is already there, swap them.

⚠️ Card image too small — effect derived from code. Verify with physical card.

**It's Clobberin' Time!** (Rare)
- SPECIAL ABILITY: NA
- SUPERPOWER: [STRENGTH]: You get +3 Attack for each Strength Hero you played this turn.

⚠️ Card image too small — effect derived from code. Verify with physical card.

---

### Villains

---

### Heralds of Galactus

**Firelord** (×2)
Cosmic Threat (Ranged) — reveal Ranged cards to reduce Attack by 3 each.
Fight: Reveal a Ranged Hero or gain a Wound.
Escape: Reveal a Ranged Hero or gain a Wound.
Attack: 9 | VP: 4

**Morg** (×2)
Cosmic Threat (Instinct) — reveal Instinct cards to reduce Attack by 3 each.
Ambush: Put each non-Instinct Hero from the HQ on the bottom of the Hero Deck. Refill the HQ.
Attack: 12 | VP: 6

**Stardust** (×2)
Cosmic Threat (Covert) — reveal Covert cards to reduce Attack by 3 each.
Fight: Choose one of your Covert Heroes. Add it to your hand next turn as a seventh card.
Attack: 10 | VP: 5

**Terrax the Tamer** (×2)
Cosmic Threat (Strength) — reveal Strength cards to reduce Attack by 3 each.
Ambush: For each Strength Hero in the HQ, Terrax the Tamer captures a Bystander.
Attack: 11 | VP: 5

---

### Subterranea

**Giganto** (×2)
Burrow.
Fight: When you draw a new hand of cards at the end of this turn, draw two extra cards.
Attack: 7 | VP: 4

**Megataur** (×2)
Burrow.
Ambush: Megataur captures two Bystanders.
Attack: 6 | VP: 4

**Moloids** (×2)
Burrow.
Fight: KO one of your Heroes.
Attack: 3 | VP: 2

**Ra'ktar the Molan King** (×2)
Burrow.
Ambush: Any Villain in the Streets moves to the Bridge, pushing any Villain already there to escape.
Attack: 4 | VP: 2

---

### Masterminds

---

### Galactus

**Galactus** (Normal)
Cosmic Threat — Before fighting Galactus, you may reveal any number of cards of one class from your hand and played cards. Galactus gets -3 Attack for each card revealed.
Always Leads: Heralds of Galactus
Master Strike: Destroy the city space closest to Galactus. Any Villain there escapes. Put this Master Strike there.
Evil Wins: The entire city is destroyed (all 5 city spaces).
Attack: 20 | VP: 7

**Cosmic Entity** (Tactic)
Fight: Choose Strength, Instinct, Covert, Tech, or Ranged. Each player reveals any number of cards of that class, then draws that many cards.

**Force of Eternity** (Tactic)
Fight: When you draw a new hand of cards at the end of this turn, draw six extra cards, then discard six cards.

**Panicked Mobs** (Tactic)
Fight: Choose Strength, Instinct, Covert, Tech, or Ranged. Each player reveals any number of cards of that class, then rescues that many Bystanders.

**Sunder the Earth** (Tactic)
Fight: Each other player KOs all Heroes from their discard pile with the same card name as a Hero in the HQ.

---

### Mole Man

**Mole Man** (Normal)
Special: Mole Man's abilities apply to whichever Villain Group you are using, as if they were Subterranea (official errata).
Always Leads: Subterranea
Master Strike: All Subterranea Villains in the city escape. If any Villains escaped this way, each player gains a Wound.
Attack: 7 | VP: 6

**Dig to Freedom** (Tactic)
Fight: Each other player chooses a Subterranea Villain in their Victory Pile and puts it into the Escaped Villains pile.

**Master of Monsters** (Tactic)
Fight: If this is not the final Tactic, reveal the top six cards of the Villain Deck. Play all the Subterranea Villains you revealed. Put the rest on the bottom of the Villain Deck in random order.

**Secret Tunnel** (Tactic)
Fight: You get +6 Attack usable only against Villains in the Streets.

**Underground Riches** (Tactic)
Fight: You get +6 Recruit usable only to recruit Heroes in the HQ space under the Streets.

---

### Schemes

---

**Bathe Earth in Cosmic Rays**
Setup: 6 Twists. 1 Villain Group, 1 Henchmen Group, 3 Heroes.
Twist: Reveal your hand. KO one of your non-grey Heroes. Then choose a Hero from the HQ with the same or lower cost and put it into your hand.
Evil Wins: 6 or more non-grey Heroes in the KO pile.

---

**Flood the Planet with Melted Glaciers**
Setup: 8 Twists. 1 Villain Group, 1 Henchmen Group, 3 Heroes.
Special Rules: A "Rising Waters" stack accumulates next to the Scheme (one per Twist played).
Twist: Stack this Twist next to the Scheme as a Rising Waters card. Then KO each Hero from the HQ whose cost is less than or equal to the current Rising Waters count. Refill each KO'd slot.
Evil Wins: 20 or more non-grey Heroes in the KO pile.

---

**Invincible Force Field**
Setup: 7 Twists. 1 Villain Group, 1 Henchmen Group, 3 Heroes.
Special Rules: Each Twist adds 1 Force Field to the Mastermind. Each Force Field increases the total Attack/Recruit required to fight the Mastermind by 1 (the extra cost can be paid with either Attack or Recruit).
Twist: Stack this Twist next to the Mastermind as a Force Field.
Evil Wins: All 7 Twists have been played.

---

**Pull Reality Into the Negative Zone**
Setup: 8 Twists. 1 Villain Group, 1 Henchmen Group, 3 Heroes.
Special Rules: Odd-numbered Twists swap costs: enemies cost Recruit to fight and Heroes cost Attack to recruit. Even-numbered Twists revert to normal.
Twist 1: Nothing happens yet.
Twist 2: Until the next Twist, enemies cost Recruit to fight and Heroes cost Attack to recruit.
Twist 3: Costs revert to normal.
Twist 4: Costs swap again.
Twist 5: Costs revert to normal.
Twist 6: Costs swap again.
Twist 7: Evil Wins!
Evil Wins: 7 or more Twists have been played.
