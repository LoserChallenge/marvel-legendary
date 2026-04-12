<!-- INVENTORY STATUS:
  Heroes: ✅ Pass 2 verified + user review
  Villains: ✅ Pass 2 verified + user review
  Masterminds: ✅ Pass 2 verified + user review
  Schemes: ✅ Pass 2 verified + user review
  Henchmen: — (none in this expansion)
  Bystanders/Sidekicks: — (none in this expansion)
  Last updated: 2026-04-04
-->

# Paint the Town Red — Card Inventory

**Primary source**: Track B: `cardDatabase.js` (structured fields), card images (effect text)
**Cross-check**: `expansionPaintTheTownRed.js`, `script.js`
**Pass 1 date**: 2026-04-03
**Pass 2 date**: 2026-04-04
**User review**: 2026-04-04 (reference file provided; all flags resolved)

---

## New Keywords

- **Wall-Crawl**: When you recruit a Hero with Wall-Crawl, you may put it on top of your deck instead of into your discard pile.
- **Feast**: KO the top card of the affected player's deck. Individual cards may have additional riders that trigger based on what was KO'd.

---

## Section 1: Structured Data Tables

### Heroes

Standard distribution per hero: 1 Rare (1 copy), 1 Uncommon (3 copies), 2 Commons (5 copies each) = 14 cards total.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Black Cat | Pickpocket | Common A | 5 | 1 | Spider Friends | Covert | 0+ | 0 |
| Black Cat | Casual Bank Robbery | Common B | 5 | 4 | Spider Friends | Covert | 0 | 2+ |
| Black Cat | Jinx | Uncommon | 3 | 5 | Spider Friends | Instinct | 3 | 0 |
| Black Cat | Cat Burglar | Rare | 1 | 8 | Spider Friends | Covert | 5+ | 0 |
| Moon Knight | Climbing Claws | Common A | 5 | 3 | Marvel Knights | Tech | 0 | 2+ |
| Moon Knight | Lunar Communion | Common B | 5 | 3 | Marvel Knights | Instinct | 2 | 0 |
| Moon Knight | Crescent Moon Darts | Uncommon | 3 | 5 | Marvel Knights | Tech | 3 | 0 |
| Moon Knight | Golden Ankh of Khonshu | Rare | 1 | 8 | Marvel Knights | Instinct | 6 | 0 |
| Scarlet Spider | Flip Out | Common A | 5 | 2 | Spider Friends | Strength | 0 | 1 |
| Scarlet Spider | Perfect Hunter | Common B | 5 | 4 | Spider Friends | Instinct | 1 | 0 |
| Scarlet Spider | Leap From Above | Uncommon | 3 | 6 | Spider Friends | Covert | 3+ | 0 |
| Scarlet Spider | Sting of the Spider | Rare | 1 | 7 | Spider Friends | Strength | 5 | 0 |
| Spider-Woman | Radioactive Spider | Common A | 5 | 2 | Spider Friends | Strength | 0 | 3 |
| Spider-Woman | Bioelectric Shock | Common B | 5 | 4 | Spider Friends | Ranged | 2 | 0 |
| Spider-Woman | Venom Blast | Uncommon | 3 | 6 | Spider Friends | Ranged | 3 | 0 |
| Spider-Woman | Arachno-Pheromones | Rare | 1 | 7 | Spider Friends | Covert | 0 | 0 |
| Symbiote Spider-Man | Dark Strength | Common A | 5 | 2 | Spider Friends | Strength | 1+ | 0 |
| Symbiote Spider-Man | Spider-Sense Tingling | Common B | 5 | 2 | Spider Friends | Instinct | 0 | 0 |
| Symbiote Spider-Man | Shadowed Spider | Uncommon | 3 | 2 | Spider Friends | Covert | 1+ | 0 |
| Symbiote Spider-Man | Thwip! | Rare | 1 | 2 | Spider Friends | Ranged | 4 | 0 |

*Moon Knight is the only Marvel Knights hero in this set; the other 4 are Spider Friends.*
*Wall-Crawl keyword appears on 10 of 20 hero cards (all Commons A/B except Radioactive Spider and Spider-Sense Tingling, plus Scarlet Spider Leap From Above and Symbiote Spider-Man Shadowed Spider).*

---

### Villains

**Maximum Carnage** (8 cards) — All have the Feast keyword.

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Maximum Carnage | Carrion | 2 | 4 | 3 |
| Maximum Carnage | Demogoblin | 2 | 5 | 3 |
| Maximum Carnage | Doppelganger | 2 | * | 3 |
| Maximum Carnage | Shriek | 2 | 6 | 4 |

*Doppelganger has variable Attack (= Cost of HQ hero under him). Kraven and Sandman also have variable Attack (see Sinister Six below).*

**Sinister Six** (8 cards) — Non-standard quantity distribution.

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Sinister Six | Chameleon | 1 | 6 | 2 |
| Sinister Six | Hobgoblin | 1 | 5 | 3 |
| Sinister Six | Kraven the Hunter | 1 | * | 4 |
| Sinister Six | Sandman | 1 | * | 4 |
| Sinister Six | Shocker | 2 | 5 | 3 |
| Sinister Six | Vulture | 2 | 4 | 2 |

*Sinister Six has 6 unique cards (4 at ×1, 2 at ×2) = 8 total. Kraven and Sandman have variable Attack (see individual entries).*

---

### Masterminds

Each mastermind has 1 mastermind card + 4 tactic cards = 5 cards total.

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| Carnage | 9 | 6 | Maximum Carnage |
| Mysterio | 8 | 6 | Sinister Six |

*Carnage has the Feast keyword. All 4 Carnage tactics also have Feast.*

```
Carnage Tactics:
  Drooling Jaws, Endless Hunger, Feed Me, Om Nom Nom

Mysterio Tactics:
  Blurring Images, Captive Audience, Master of Illusions, Mists of Deception
```

---

### Schemes

| Scheme Name | Twist Count | Bystander Count |
|---|---|---|
| The Clone Saga | 8 | default |
| Invade the Daily Bugle News HQ | 8 | default |
| Splice Humans with Spider DNA | 8 | default |
| Weave a Web of Lies | 7 | default |

*All four schemes require 1 Villain Group, 1 Henchmen Group, 3 Heroes.*
*Splice Humans with Spider DNA requires the Sinister Six as the Villain Group.*

---

## Section 2: Card Effects

---

### Heroes

---

### Black Cat

**Pickpocket** (Common A)
- SPECIAL ABILITY: Reveal the top card of any player's deck. You get +Attack equal to that card's printed Recruit plus its printed Attack.
- SUPERPOWER: NA
- Keywords: Wall-Crawl

**Casual Bank Robbery** (Common B)
- SPECIAL ABILITY: You get another +1 Recruit usable only to recruit the Hero in the HQ space under the Bank.
- SUPERPOWER: NA
- Keywords: Wall-Crawl

**Jinx** (Uncommon)
- SPECIAL ABILITY: Each player reveals the top card of their deck. Choose any number of those cards to be discarded.
- SUPERPOWER: NA

**Cat Burglar** (Rare)
- SPECIAL ABILITY: Each other player reveals a [COVERT] Hero or chooses a Bystander from their Victory Pile. You rescue those Bystanders. *(Solo: suppressed — "each other player" effects do not apply.)*
- SUPERPOWER: [SPIDER FRIENDS]: You get +1 Attack for each Bystander you rescued this turn.

*Note: Card text says "Covert Hero" for the reveal requirement, but the superpower trigger is [SPIDER FRIENDS]. Confirmed by DB `condition: "Spider Friends"` and code.*

---

### Moon Knight

**Climbing Claws** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [INSTINCT]: You get +1 Recruit.
- Keywords: Wall-Crawl

*Note: Cross-class card — Tech class with Instinct trigger. Confirmed by DB `condition: "Instinct"` on a Tech card.*

**Lunar Communion** (Common B)
- SPECIAL ABILITY: Whenever you defeat a Villain on the Rooftops this turn, you may KO one of your cards or a card from your discard pile.
- SUPERPOWER: NA
- Keywords: Wall-Crawl

**Crescent Moon Darts** (Uncommon)
- SPECIAL ABILITY: Reveal the top card of your deck. If it's [INSTINCT] or [TECH], draw it.
- SUPERPOWER: NA

**Golden Ankh of Khonshu** (Rare)
- SPECIAL ABILITY: Whenever you defeat a Villain on the Rooftops this turn, rescue Bystanders equal to that Villain's printed Victory Points.
- SUPERPOWER: [TECH]: You may move a Villain to the Rooftops. If another Villain is already there, swap them.

*Note: Cross-class card — Instinct class with Tech trigger. Confirmed by DB `condition: "Tech"` on an Instinct card.*

---

### Scarlet Spider

**Flip Out** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [SPIDER FRIENDS]: Draw a card.
- Keywords: Wall-Crawl

**Perfect Hunter** (Common B)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: NA
- Keywords: Wall-Crawl

**Leap From Above** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [INSTINCT]: You get +2 Attack.
- Keywords: Wall-Crawl

**Sting of the Spider** (Rare)
- SPECIAL ABILITY: Whenever you put a card on top of your deck this turn, you may draw that card.
- SUPERPOWER: NA

---

### Spider-Woman

**Radioactive Spider** (Common A)
- SPECIAL ABILITY: To play this card, you must put a card from your hand on top of your deck.
- SUPERPOWER: NA

**Bioelectric Shock** (Common B)
- SPECIAL ABILITY: Reveal the top card of your deck. If that card has an Attack icon, draw it.
- SUPERPOWER: NA
- Keywords: Wall-Crawl

**Venom Blast** (Uncommon)
- SPECIAL ABILITY: Reveal the top card of your deck. If that card has a Recruit icon, draw it.
- SUPERPOWER: NA
- Keywords: Wall-Crawl

**Arachno-Pheromones** (Rare)
- SPECIAL ABILITY: Recruit a Hero from the HQ for free.
- SUPERPOWER: [SPIDER FRIENDS]: Put that Hero on top of your deck.

---

### Symbiote Spider-Man

**Dark Strength** (Common A)
- SPECIAL ABILITY: Reveal the top card of your deck. If it costs 1 or 2, you get +2 Attack.
- SUPERPOWER: NA
- Keywords: Wall-Crawl

**Spider-Sense Tingling** (Common B)
- SPECIAL ABILITY: Reveal the top two cards of your deck. Put any that cost 2 or less into your hand. Put the rest back in any order.
- SUPERPOWER: NA

**Shadowed Spider** (Uncommon)
- SPECIAL ABILITY: You get +1 Attack for each other Hero you played this turn that costs 1 or 2.
- SUPERPOWER: NA
- Keywords: Wall-Crawl

**Thwip!** (Rare)
- SPECIAL ABILITY: To play this card, you must put two cards from your hand on top of your deck.
- SUPERPOWER: NA

---

### Villains

---

### Maximum Carnage

**Carrion** (×2)
Feast.
Whenever Carrion feasts on a Hero that costs 1 or more, put Carrion back in the city space where he was.
Attack: 4 | VP: 3

**Demogoblin** (×2)
Ambush: Demogoblin captures a Bystander.
Feast.
Attack: 5 | VP: 3

**Doppelganger** (×2)
Doppelganger's Attack is equal to the Cost of the Hero in the HQ space under him.
Feast.
Attack: * | VP: 3

**Shriek** (×2)
Feast.
When Shriek feasts on a 0-cost Hero, each other player gains a Wound. *(Solo: suppressed — "each other player" effects do not apply. Note: code currently applies wound to active player — potential code bug.)*
Escape: Each player gains a Wound.
Attack: 6 | VP: 4

---

### Sinister Six

**Chameleon** (×1)
Fight: Copy the effects (attack, recruit, and abilities) of the Hero in the HQ space directly beneath Chameleon in the city.
Attack: 6 | VP: 2

*Note: Fight effect is hardcoded by name in `script.js`, not in DB `fightEffect` field.*

**Hobgoblin** (×1)
Ambush: Each Sinister Six Villain in the city captures a Bystander.
Attack: 5 | VP: 3

**Kraven the Hunter** (×1)
Kraven's Attack is equal to the Cost of the highest-cost Hero in the HQ.
Escape: (After you do the normal escape KO) KO a Hero from the HQ with the highest cost.
Attack: * | VP: 4

**Sandman** (×1)
Sandman's Attack is twice the number of Villains in the city.
Escape: Each player reveals an [INSTINCT] Hero or gains a Wound.
Attack: * | VP: 4

**Shocker** (×2)
Ambush: Each player reveals an [INSTINCT] Hero or discards a card.
Attack: 5 | VP: 3

**Vulture** (×2)
Ambush: (After Vulture enters the city) If there is a Villain on the Rooftops or Bridge, swap Vulture with one of those Villains.
Escape: Each player reveals an [INSTINCT] Hero or gains a Wound.
Attack: 4 | VP: 2

*Note: Vulture's ambush is hardcoded by name in `script.js`, not in DB `ambushEffect` field.*

---

### Masterminds

---

### Carnage

**Carnage** (Normal)
Feast.
Always Leads: Maximum Carnage
Master Strike: Feast on each player. Whenever this Master Strike feasts on a player's 0-cost Hero, that player gains a Wound.
Attack: 9 | VP: 6

**Drooling Jaws** (Tactic)
Fight: Each player reveals the top card of their deck. Then Carnage feasts on the player of your choice.

**Endless Hunger** (Tactic)
Fight: Feast. If Carnage feasts on a 0-cost Hero this way, repeat this process.

**Feed Me** (Tactic)
Fight: Feast. You get +Recruit equal to the Cost of the card Carnage feasts on.

**Om Nom Nom** (Tactic)
Fight: Feast. If Carnage feasts on a 0-cost Hero this way, each other player KOs a Bystander from their Victory Pile.

---

### Mysterio

**Mysterio** (Normal)
Always Leads: Sinister Six
Special: Mysterio's tactics scale based on how many tactics remain after the one being fought.
Master Strike: Shuffle this Master Strike into Mysterio's face-down Mastermind Tactics. That card becomes a Mastermind Tactic worth 6 Victory Points.
Attack: 8 | VP: 6

*Note: Converted Master Strikes are renamed "Mysterio Mastermind Tactic" and have no fight effect.*

**Blurring Images** (Tactic)
Fight: You get +1 Recruit for each Mastermind Tactic Mysterio has left after this one.

**Captive Audience** (Tactic)
Fight: Rescue a Bystander for each Mastermind Tactic Mysterio has left after this one.

**Master of Illusions** (Tactic)
Fight: If this is not the final Tactic, shuffle a Master Strike Tactic from each other player's Victory Pile back into Mysterio's Mastermind Tactics.

**Mists of Deception** (Tactic)
Fight: If this is not the final Tactic, reveal the top five cards of the Villain Deck. Play all the Master Strikes you revealed. Put the rest on the bottom of that deck in random order.

---

### Schemes

---

**The Clone Saga**
Setup: 8 Twists. 1 Villain Group, 1 Henchmen Group, 3 Heroes.
Twist: Each player reveals two non-grey Heroes with the same card name or discards down to 3 cards.
Evil Wins: When 2 Villains with the same card name have escaped or the Villain Deck runs out.

---

**Invade the Daily Bugle News HQ**
Setup: 8 Twists. 1 Villain Group, 1 Henchmen Group, 3 Heroes. Add 6 extra Henchmen from a single Henchman Group to the Hero Deck.
Special Rules: You can fight Villains in the HQ.
Twist: KO a Hero from the HQ. Put the highest-Attack Villain from the city into that HQ space.
Evil Wins: When there are 5 Villains in the HQ.

---

**Splice Humans with Spider DNA**
Setup: 8 Twists. 1 Villain Group, 1 Henchmen Group, 3 Heroes. Include Sinister Six as one of the Villain Groups.
Special Rules: Sinister Six Villains get +3 Attack. All Hero cards have Wall-Crawl.
Twist: Each player puts a Sinister Six Villain from their Victory Pile on top of the Villain Deck. No matter how many players did so, play a single card from the Villain Deck.
Evil Wins: When 6 Sinister Six Villains have escaped or the Villain Deck runs out.

---

**Weave a Web of Lies**
Setup: 7 Twists. 1 Villain Group, 1 Henchmen Group, 3 Heroes.
Special Rules: Whenever you defeat a Villain, you may pay 1 Recruit. If you do, rescue a Bystander. You can't fight the Mastermind unless you have a Bystander in your Victory Pile for each Twist next to the Mastermind.
Twist: Stack this Twist next to the Mastermind.
Twist 7: Evil Wins!
