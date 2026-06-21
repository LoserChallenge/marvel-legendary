<!-- INVENTORY STATUS:
  Heroes: ✅
  Villains: ✅
  Masterminds: ✅
  Schemes: ✅
  Henchmen: ✅
  Bystanders/Sidekicks: ✅ (bystanders only; no sidekicks)
  Last updated: 2026-06-21
-->

# World War Hulk — Card Inventory

**Primary source**: Card images in `expansions/world-war-hulk/` (effect text + card titles) — card art is authoritative for effect text and titles.
**Cross-check**: `expansions/world-war-hulk/world-war-hulk-reference.md` (BGG-derived; authoritative for structured fields). Rules PDF: `expansions/world-war-hulk/Legendary_Rules-World_War_Hulk.pdf`.
**Pass 1 date**: 2026-06-21
**Pass 2 status**: Pending — run `/inventory-verifier` in a fresh session

> **Set composition (per reference):** 400 cards — 15 Transforming Heroes (14 Hero cards each + transform cards), 6 Transforming Masterminds (double-sided, 5 physical cards each), 7 Villain Groups (8 cards each), 3 Henchmen Groups (10 each), 8 Schemes, 4 special Bystanders. Teams: Avengers, S.H.I.E.L.D., Warbound, Crime Syndicate, Champions (and a "Brotherhood" referenced elsewhere; the Void Unchained / A-Bomb are unaffiliated).
> **Title verification (handoff concern):** all 78 hero image titles were confirmed to match their filenames — the staging deductions were correct. The `UltraMassiveArmor` "promo" worry is cleared (it is the genuine transform card).

---

## New Keywords

- **Transform** (Heroes): each transforming Hero has "Transformed" cards kept in a separate **Transformation Pile** (NOT shuffled into the Hero Deck, NOT recruitable). A card saying "Transform this into [X]" — complete the played card's effects + get its Recruit/Attack, then remove it from the game (to the Transformation Pile) and put [X] into your hand (or on top of deck / discard, **only if the card says so**); you may play the new card the same turn. You still count as having played the removed card.
- **Transform** (Masterminds): each Mastermind is a double-sided card with a **Base** side (has "Always Leads") and a **Transformed** side (no "Always Leads"). "Transform" = flip to the other side; do **not** also do the new side's Master Strike. Only the face-up side's abilities/Attack apply. (No Epic masterminds in this set.)
- **Outwit**: use an "Outwit" ability only if you reveal Heroes with **3 different costs** (can count the Outwit card itself). Some Villains/Masterminds punish failing to Outwit them. (M.O.D.O.K.'s base side changes this to **4 different costs** globally.)
- **Smash N**: "You may discard another card from your hand. If you do, you get +N Attack."
- **Wounded Fury**: Hero — "You get +1 Attack for each Wound in your discard pile." Villain/Mastermind — "It gets +1 Attack for each Wound in your discard pile."
- **Cross-Dimensional [Hulk/Void/Illuminati] Rampage**: "Each player reveals one of their [Hulk]-name Heroes (or a [Hulk] card in their Victory Pile) or gains a Wound." Reference defines the **Hulk** variant explicitly and notes Void/Illuminati variants exist by analogy. ⚠️ The exact text of the **Void** and **Illuminati** Rampage variants is not spelled out in this reference — confirm against the rules PDF.
- **⚠️ Feast** — used on many cards (Miek, No-Name, The Void Unchained, Demonform, Great Devil Corker, Cytoplasm Spikes, Sakaaran Hivelings, etc.) but **NOT defined** in this expansion's reference keyword section (carried from a prior set). Captured verbatim everywhere; **definition must come from the rules PDF / prior set** before implementation. Do not guess.
- **⚠️ Trap!** — a villain card type (header "TRAP – [GROUP]") with "By End of Turn: [X]" / "Or Suffer: (after you draw your new hand) [Y]" lines. **NOT defined** in this reference's keyword section (prior-set mechanic). Trap! cards carry a VP but **no Attack/Fight value**. Confirm exact handling against the rules PDF.

---

## Section 1: Structured Data Tables

### Heroes

Standard structure per hero: 4 acquirable cards in 5/5/3/1 copies (Common A, Common B, Uncommon, Rare) + Transformed card(s) in the Transformation Pile (copy count = the source card's count).

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Amadeus Cho | Extrapolate | Common A | 5 | 2 | Champions | Instinct | 0 | 1 |
| Amadeus Cho | Gamma-Draining Nanites | Common B | 5 | 3 | Champions | Tech | 0 | 0 |
| Amadeus Cho | Renegade Genius | Uncommon | 3 | 6 | Champions | Tech | 0+ | 0 |
| Amadeus Cho | Visualize the Variables | Rare | 1 | 8 | Champions | Tech | 4 | 0 |
| Amadeus Cho | Like Totally Smart Hulk | Transform | 5 | 5 | Champions | Strength | 2+ | 0 |
| Bruce Banner | Solve the Impossible | Common A | 5 | 2 | Avengers | Tech | 1 | 0 |
| Bruce Banner | Gamma Bomb Disaster | Common B | 5 | 4 | Avengers | Tech | 0 | 2 |
| Bruce Banner | Dangerous Testing | Uncommon | 3 | 6 | Avengers | Tech | 3 | 0 |
| Bruce Banner | Gamma Ray Experiment | Rare | 1 | 7 | Avengers | Tech | 4 | 0 |
| Bruce Banner | Savage Hulk Unleashed | Transform | 5 | 5 | Avengers | Strength | 0+ | 0 |
| Caiera | Shadow Queen | Common A | 5 | 2 | Warbound | Covert | 1 | 0 |
| Caiera | Shadowforged Blade | Common B | 5 | 4 | Warbound | Covert | 2+ | 0 |
| Caiera | Focus the Old Power | Uncommon | 3 | 6 | Warbound | Strength | 2 | 0 |
| Caiera | Dutiful Protector | Rare | 1 | 7 | Warbound | Instinct | 0 | 0+* |
| Caiera | Vengeful Destructor | Transform | 1 | 7 | Warbound | Strength | 0+* | 0 |
| Gladiator Hulk | Don't Make Me Angry | Common A | 5 | 3 | Warbound | Strength | 0+ | 0 |
| Gladiator Hulk | Seize the Throne | Common B | 5 | 4 | Warbound | Instinct | 0+ | 0 |
| Gladiator Hulk | The Green Scar | Uncommon | 3 | 5 | Warbound | Strength | 3+ | 0 |
| Gladiator Hulk | Double-Fisted Smashing | Rare | 1 | 8 | Warbound | Strength | 0+ | 0 |
| Gladiator Hulk | Hulk Is King | Transform | 5 | 5 | Warbound | Strength | 3 | 0 |
| Hiroim | Seek Redemption | Common A | 5 | 3 | Warbound | Covert | 2 | 0 |
| Hiroim | Save from the Rubble | Common B | 5 | 4 | Warbound | Covert | 0 | 1 |
| Hiroim | Mystic Shadow Priest | Uncommon | 3 | 6 | Warbound | Covert | 2 | 0 |
| Hiroim | Blade of the People | Rare | 1 | 7 | Warbound | Instinct | 0 | 0 |
| Hiroim | Hiroim Redeemed | Transform | 5 | 5 | Warbound | Strength | 1+ | 0 |
| Hulkbuster Iron Man | Pound for Pound | Common A | 5 | 2 | Avengers | Strength | 0+ | 0 |
| Hulkbuster Iron Man | Attune Tectonic Transducer | Common B | 5 | 4 | Avengers | Tech | 2+ | 0 |
| Hulkbuster Iron Man | Build the Suit | Uncommon | 3 | 5 | Avengers | Tech | 0 | 3 |
| Hulkbuster Iron Man | Final Battle | Rare | 1 | 8 | Avengers | Tech | 5+ | 0 |
| Hulkbuster Iron Man | Ultra-Massive Armor | Transform | 3 | 6 | Avengers | Tech | 0+ | 0 |
| Joe Fixit, Grey Hulk | Carefully Considered Smashing | Common A | 5 | 3 | Crime Syndicate | Strength | 0+ | 2 |
| Joe Fixit, Grey Hulk | Threaten and Bribe | Common B | 5 | 4 | Crime Syndicate | Covert | 0 | 2 |
| Joe Fixit, Grey Hulk | Ambitious Enforcer | Uncommon | 3 | 6 | Crime Syndicate | Strength | 3 | 0 |
| Joe Fixit, Grey Hulk | Hulk Runs This Town | Rare | 1 | 7 | Crime Syndicate | Covert | 4 | 0 |
| Joe Fixit, Grey Hulk | Underworld Boss | Transform | 3 | 6 | Crime Syndicate | Instinct | 0+ | 0 |
| Korg | Nothing Beats Rock | Common A | 5 | 2 | Warbound | Strength | 0+ | 0 |
| Korg | Move Mountains | Common B | 5 | 4 | Warbound | Strength | 2 | 0 |
| Korg | Forged by Fire | Uncommon | 3 | 3 | Warbound | Strength | 0 | 2 |
| Korg | Kronan Tactician | Rare | 1 | 8 | Warbound | Strength | 0+ | 0 |
| Korg | Lord of Granite | Transform | 3 | 5 | Warbound | Covert ⚠️ | 0+ | 0 |
| Miek the Unhived | This Bug Smashes You | Common A | 5 | 3 | Warbound | Instinct | 2+ | 0 |
| Miek the Unhived | Devouring Frenzy | Common B | 5 | 4 | Warbound | Instinct | 0 | 2 |
| Miek the Unhived | Endless Appetite | Uncommon | 3 | 5 | Warbound | Instinct | 3 | 0 |
| Miek the Unhived | Metamorphosis | Rare | 1 | 7 | Warbound | Covert | 0 | 5 |
| Miek the Unhived | Hive King Miek | Transform | 1 | 8 | Warbound | Strength | 6 | 0 |
| Namora | Crushing Tsunami | Common A | 5 | 3 | Champions | Range | 0+ | 0 |
| Namora | Heart of the Ocean | Common B | 5 | 4 | Champions | Covert | 2+ | 0 |
| Namora | Herculean Effort | Uncommon | 3 | 5 | Champions | Range | 0 | 3 |
| Namora | Turning the Tide | Rare | 1 | 7 | Champions | Covert | 5 | 0 |
| Namora | Master of Depths | Transform | 3 | 6 | Champions | Strength | 0+ | 0 |
| No-Name, Brood Queen | Surprise Attack | Common A | 5 | 2 | Warbound | Covert | 1 | 0 |
| No-Name, Brood Queen | Appetite for Destruction | Common B | 5 | 4 | Warbound | Covert | 2 | 0 |
| No-Name, Brood Queen | Bursting with Life | Uncommon | 3 | 3 | Warbound | Strength | 0 | 2 |
| No-Name, Brood Queen | World-Spanning Hunger | Rare | 1 | 8 | Warbound | Instinct | 4+ | 0 |
| No-Name, Brood Queen | Torrent of Broodlings | Transform | 3 | 5 | Warbound | Covert | 2 | 0 |
| Rick Jones | Hacktivist | Common A | 5 | 3 | S.H.I.E.L.D. | Tech | 2 | 0 |
| Rick Jones | Seek the Nega-Bands | Common B | 5 | 4 | S.H.I.E.L.D. | Instinct | 0 | 2 |
| Rick Jones | Irradiated Blood | Uncommon | 3 | 5 | S.H.I.E.L.D. | Tech | 3 | 0 |
| Rick Jones | Caught in Kree-Skrull War | Rare | 1 | 7 | S.H.I.E.L.D. | Covert | 4 | 0 |
| Rick Jones | Captain Marvel | Transform | 5 | 5 | Avengers | Range | 2 | 0 |
| Rick Jones | A-Bomb | Transform | 3 | 6 | (none) | Strength | 0+ | 0 |
| Rick Jones | The Destiny Force | Transform | 1 | 9 | Avengers | Range | 0+ | 0 |
| Sentry | Agoraphobia | Common A | 5 | 2 | Avengers | Covert | 0 | 0 |
| Sentry | Rival Personalities | Common B | 5 | 4 | Avengers | Strength | 2+ | 0 |
| Sentry | Mournful Sentinel | Uncommon | 3 | 3 | Avengers | Range | 0 | 2 |
| Sentry | Vast Unstable Power | Rare | 1 | 8 | Avengers | Range | 0+ | 0 |
| Sentry | Golden Guardian of Good | Transform | 5 | 6 | Avengers | Strength | 0+ | 0 |
| Sentry | The Void Unchained | Transform | 3 | 5 | (none — Unaffiliated) | Covert | 3 | 0 |
| She-Hulk | Hurl Legal Objections | Common A | 5 | 3 | Avengers | Instinct | 0 | 2 |
| She-Hulk | Window of Opportunity | Common B | 5 | 4 | Avengers | Strength | 0 | 2 |
| She-Hulk | Radioactive Riot | Uncommon | 3 | 6 | Avengers | Strength | 3 | 0 |
| She-Hulk | Jade Giantess | Rare | 1 | 8 | Avengers | Strength | 0+ | 4 |
| She-Hulk | Hurl Trucks | Transform | 5 | 6 | Avengers | Strength | 2+ | 0 |
| Skaar, Son of Hulk | Anger Management | Common A | 5 | 3 | Avengers | Strength | 1+ | 0 |
| Skaar, Son of Hulk | Scarred Past | Common B | 5 | 3 | Avengers | Instinct | 2+ | 0 |
| Skaar, Son of Hulk | Mood Swings | Uncommon | 3 | 5 | Avengers | Instinct | 0 | 3 |
| Skaar, Son of Hulk | Planetary-Level Revenge | Rare | 1 | 8 | Avengers | Strength | 4+ | 0 |
| Skaar, Son of Hulk | Raging Savage | Transform | 3 | 6 | Avengers | Strength | 3+ | 0 |

**Notation:** `0+`/`2+` etc. = base plus a conditional/Smash/Wounded-Fury bonus; `*` = value governed by special effect text (Caiera's "double the X you have"); `0` = none / no printed value. DB class convention "Range" not "Ranged". Transform-card copy counts equal their source card's count.

---

### Villains

Standard group total: **8 cards** each. `N*` = Shatter-style/variable Attack; `N+` = conditional bonus; "— (Trap!)" = Trap! card (no Attack, has VP).

**Aspects of the Void** (8)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Aspects of the Void | Black Anti-Hurricane | 2 | 6 | 4 |
| Aspects of the Void | Demonform | 1 | 7 | 5 |
| Aspects of the Void | Infini-Tendrils | 2 | 4+ ⚠️ | 3 |
| Aspects of the Void | Psychotic Break | 1 | — (Trap!) | 2 |
| Aspects of the Void | Shadow Man | 2 | 5 | 3 |

*⚠️ Infini-Tendrils Attack: card art reads **4+**; reference says **6+**. Recorded card value (image-primary); resolve in Pass 2/3. Wounded Fury on Infini-Tendrils; Feast on Demonform; Trap! on Psychotic Break.*

**Code Red** (8) — Covert-Hero themed throughout

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Code Red | Caught Red-Handed | 1 | — (Trap!) | 3 |
| Code Red | Crimson Dynamo | 2 | 4 | 2 |
| Code Red | Elektra, Red Blades | 2 | 5 | 3 |
| Code Red | Punisher, Red Dot Sniper | 1 | 6 | 4 |
| Code Red | Red She-Hulk | 1 | 6+ | 5 |
| Code Red | Thundra | 1 | 4+ | 3 |

*Wounded Fury on Red She-Hulk; Trap! on Caught Red-Handed.*

**Illuminati** (8)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Illuminati | Black Bolt | 2 | 13* | 5 |
| Illuminati | Dr. Strange | 2 | 5 | 3 |
| Illuminati | Dr. Strange, Possessed by Zom | 1 | 5+ | 3 |
| Illuminati | Enchain the Hulk | 1 | — (Trap!) | 4 |
| Illuminati | Hulkbuster Iron Man | 2 | 6+ | 4 |

*Outwit (Dr. Strange, Hulkbuster Iron Man); Trap! + Cross-Dimensional Hulk Rampage (Enchain the Hulk); Cross-Dimensional Illuminati Rampage (Hulkbuster Iron Man).*

**Intelligencia** (8)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Intelligencia | Battle of Wits | 2 | — (Trap!) | 3 |
| Intelligencia | Cosmic Hulk Robot | 2 | 5+ | 4 |
| Intelligencia | Doc Samson | 2 | 4+ | 3 |
| Intelligencia | The Leader, Gamma Fiend | 2 | 5 | 3 |

*Outwit on all four; Wounded Fury on Cosmic Hulk Robot; Trap! on Battle of Wits.*

**Sakaar Imperial Guard** (8)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Sakaar Imperial Guard | Gladiators' Colosseum | 1 | — (Trap!) | 4 |
| Sakaar Imperial Guard | Great Devil Corker | 2 | 6 | 4 |
| Sakaar Imperial Guard | Headman Charr | 2 | 2+ | 2 |
| Sakaar Imperial Guard | Lieutenant Caiera | 1 | 7 | 5 |
| Sakaar Imperial Guard | Primus Vand | 2 | 3+ | 3 |

*Feast on Great Devil Corker; Trap! on Gladiators' Colosseum; Outwit on Lieutenant Caiera.*

**U-Foes** (8)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| U-Foes | Ironclad | 1 | 6 | 4 |
| U-Foes | Unidentified Flying U-Foes | 1 | — (Trap!) | 3 |
| U-Foes | Vapor | 2 | 4 | 2 |
| U-Foes | Vector | 2 | 4 | 2 |
| U-Foes | X-Ray | 2 | 5 | 3 |

*Trap! on Unidentified Flying U-Foes. Each Fight keys off a Hero class (Strength/Covert/Instinct/Ranged).*

**Warbound** (8)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Warbound | Elloe Kaifi | 1 | 5 | 3 |
| Warbound | Hiroim | 1 | 7 | 5 |
| Warbound | Korg | 1 | 6 | 4 |
| Warbound | Miek the Unhived | 2 | 5 | 3 |
| Warbound | No-Name, Brood Queen | 2 | 4+ | 3 |
| Warbound | Warbound Rescue | 1 | — (Trap!) | 7 |

*Feast on Miek + No-Name; Wounded Fury on No-Name; Trap! on Warbound Rescue.*

---

### Masterminds (double-sided Transforming — no Epic)

| Name | Side | Fight Value | VP | Always Leads |
|---|---|---|---|---|
| General "Thunderbolt" Ross | Base | 6* | 6 | Code Red |
| Red Hulk | Transformed | 9+ | 6 | — |
| Illuminati, Secret Society | Base | 11+ | 7 | Illuminati |
| Illuminati, Open Warfare | Transformed | 13 | 7 | — |
| King Hulk, Sakaarson | Base | 9+ | 6 | Warbound |
| King Hulk, Worldbreaker | Transformed | 10+ | 6 | — |
| M.O.D.O.K. | Base | 9 | 6 | Intelligencia |
| M.O.D.O.K., Network Nightmare | Transformed | 8* | 6 | — |
| The Red King | Base | 7* | 6 | Sakaar Imperial Guard |
| The Red King, Power Armored | Transformed | 10 | 6 | — |
| The Sentry | Base | 10 | 6 | Aspects of the Void |
| The Void | Transformed | 11+ | 6 | — |

```
Ross / Red Hulk Tactics:        Bust You Down to Private, Call Out the Army, Personal Arsenal, Urban Warfare
Illuminati Tactics:             Black Bolt's Omni-Shout, Dr. Strange's Orb of Agamotto, Hulkbuster's Hammer Fist, Zom's Manacles of Living Bondage
King Hulk Tactics:              Fury of the Green Scar, Oath of the Warbound, Revenge from the Stars, Rule by the Strongest
M.O.D.O.K. Tactics:             Brain Scramble, Designed Only For... K.O.ing, Don't Get a Big Head About It, Redundancy Algorithms
The Red King Tactics:           Haughty Spite, Royal Bodyguard, Treasury of Sakaar, Vast Armies of Sakaar
The Sentry / The Void Tactics:  Pacifying Light, Power of a Million Exploding Suns, Reflexive Teleportation, Repressed Darkness
```

*Ross `6*` = Helicopter lock (can't fight while he has Helicopters). Red King `7*`/M.O.D.O.K. Network Nightmare `8*` = altered fight conditions. `+` values = passives/Wounded Fury. Each tactic ends "[Mastermind] Transforms" (flip).*

---

### Schemes

| Scheme Name | Twist Count | Bystander Count |
|---|---|---|
| Break the Planet Asunder | 9 | — |
| Cytoplasm Spike Invasion | 10 | — |
| Fall of the Hulks | 10 | — |
| Gladiator Pits of Sakaar | 6 | — |
| Mutating Gamma Rays | 7 | — |
| Shoot Hulk into Space | 8 | — |
| Subjugate with Obedience Disks | 11 | — |
| World War Hulk | 9 | — |

*No scheme prints a bystander count. Several have special setup directives (extra "Hulk"-name Heroes, special decks, Wound stacks, Lurking Masterminds) — see effects.*

---

### Henchmen (3 groups, 10 cards each)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Cytoplasm Spikes | Cytoplasm Spikes | 10 | 3 | 1 |
| Death's Heads | Death's Heads | 10 | 3 | 1 |
| Sakaaran Hivelings | Sakaaran Hivelings | 10 | 3 | 1 |

*⚠️ Printed name is "Cytoplasm Spikes" (the reference Main-list's "Cytoplasmic Spikes" is the outlier typo). Feast on Cytoplasm Spikes + Sakaaran Hivelings; Outwit on Death's Heads.*

---

### Bystanders (4 special, 1 each)

| Card Name | Count | VP |
|---|---|---|
| Actor | 1 | 1 |
| Animal Trainer | 1 | 1 |
| Tourist Couple | 1 | 1 |
| Triage Nurse | 1 | 1 |

---

## Section 2: Card Effects

---

### Heroes

---

### Amadeus Cho (Champions)

**Extrapolate** (Common A)
- SPECIAL ABILITY: 1 Recruit. Outwit: Draw a card.
- SUPERPOWER: NA

**Gamma-Draining Nanites** (Common B)
- SPECIAL ABILITY: Draw a card. Then, if you drew two cards this turn, Transform this into Like Totally Smart Hulk.
- SUPERPOWER: NA
- TRANSFORM: → Like Totally Smart Hulk (no destination printed → default to hand)

**Renegade Genius** (Uncommon)
- SPECIAL ABILITY: You get +1 Attack for each different cost of Hero you have. Outwit: Draw a card.
- SUPERPOWER: NA

**Visualize the Variables** (Rare)
- SPECIAL ABILITY: 4 Attack. Whenever you use an Outwit ability this turn, you may use it an extra time. Outwit: Look at the top card of your deck. KO it or put it back.
- SUPERPOWER: NA

**Like Totally Smart Hulk** (Transform)
- SPECIAL ABILITY: Outwit: You get +2 Attack.
- SUPERPOWER: NA

### Bruce Banner (Avengers)

**Solve the Impossible** (Common A)
- SPECIAL ABILITY: 1 Attack. Outwit: When you draw a new hand of cards at the end of this turn, draw an extra card.
- SUPERPOWER: NA

**Gamma Bomb Disaster** (Common B)
- SPECIAL ABILITY: 2 Recruit. Outwit: Transform this into Savage Hulk Unleashed.
- SUPERPOWER: NA
- TRANSFORM: → Savage Hulk Unleashed (no destination printed → default to hand)

**Dangerous Testing** (Uncommon)
- SPECIAL ABILITY: 3 Attack.
- SUPERPOWER: [TECH]: Reveal the top card of your deck. If it costs 0, KO it.

**Gamma Ray Experiment** (Rare)
- SPECIAL ABILITY: 4 Attack. Outwit: Look at the top three cards of your deck. Draw one of them, KO one, and put one back.
- SUPERPOWER: NA

**Savage Hulk Unleashed** (Transform)
- SPECIAL ABILITY: Smash 4
- SUPERPOWER: NA

### Caiera (Warbound)

**Shadow Queen** (Common A)
- SPECIAL ABILITY: 1 Attack. Outwit: Draw a card.
- SUPERPOWER: NA

**Shadowforged Blade** (Common B)
- SPECIAL ABILITY: 2+ Attack.
- SUPERPOWER: [COVERT]: Smash 2

**Focus the Old Power** (Uncommon)
- SPECIAL ABILITY: 2 Attack. Outwit: You may KO a card from your hand or discard pile.
- SUPERPOWER: NA

**Dutiful Protector** (Rare)
- SPECIAL ABILITY: Double the Recruit you have. If there are at least 3 Heroes per player in the KO pile, Transform this into Vengeful Destructor.
- SUPERPOWER: NA
- TRANSFORM: → Vengeful Destructor (no destination printed → default to hand)

**Vengeful Destructor** (Transform)
- SPECIAL ABILITY: Double the Attack you have.
- SUPERPOWER: NA

### Gladiator Hulk (Warbound)

**Don't Make Me Angry** (Common A)
- SPECIAL ABILITY: Draw a card. Smash 2
- SUPERPOWER: NA

**Seize the Throne** (Common B)
- SPECIAL ABILITY: Smash 3. Then, if you discarded at least two cards this turn, Transform this into Hulk Is King and put it on top of your deck.
- SUPERPOWER: NA
- TRANSFORM: → Hulk Is King, **top of deck**

**The Green Scar** (Uncommon)
- SPECIAL ABILITY: 3+ Attack.
- SUPERPOWER: [STRENGTH]: Cross-Dimensional Hulk Rampage. If any players gained a Wound this way, you get Wounded Fury.

**Double-Fisted Smashing** (Rare)
- SPECIAL ABILITY: You get double Attack from each Smash this turn. Smash 3
- SUPERPOWER: NA

**Hulk Is King** (Transform)
- SPECIAL ABILITY: When a card effect causes you to discard this card, you may return this card to your hand.
- SUPERPOWER: NA

### Hiroim (Warbound)

**Seek Redemption** (Common A)
- SPECIAL ABILITY: 2 Attack.
- SUPERPOWER: [COVERT]: The first time you defeat a Villain this turn, rescue a Bystander.

**Save from the Rubble** (Common B)
- SPECIAL ABILITY: 1 Recruit. Draw a card. If there are at least two Bystanders in your Victory Pile, Transform this into Hiroim Redeemed.
- SUPERPOWER: NA
- TRANSFORM: → Hiroim Redeemed (no destination printed → default to hand)

**Mystic Shadow Priest** (Uncommon)
- SPECIAL ABILITY: 2 Attack.
- SUPERPOWER: [WARBOUND]: You may KO a 0-cost card from any player's discard pile. If you KO a Wound this way, rescue a Bystander.

**Blade of the People** (Rare)
- SPECIAL ABILITY: Choose one: Rescue three Bystanders, or defeat any Villain or Mastermind whose Attack is less than the number of Bystanders in your Victory Pile.
- SUPERPOWER: NA

**Hiroim Redeemed** (Transform)
- SPECIAL ABILITY: You get +1 Attack for every two Bystanders in your Victory Pile.
- SUPERPOWER: NA

### Hulkbuster Iron Man (Avengers)

**Pound for Pound** (Common A)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: [TECH]: You get +2 Attack.

**Attune Tectonic Transducer** (Common B) *(card prints "Tectonic"; reference "Techtonic")*
- SPECIAL ABILITY: 2+ Attack. Outwit: Smash 2
- SUPERPOWER: NA

**Build the Suit** (Uncommon)
- SPECIAL ABILITY: 3 Recruit.
- SUPERPOWER: [TECH][STRENGTH]: Transform this into Ultra-Massive Armor
- TRANSFORM: → Ultra-Massive Armor (no destination printed → default to hand)

**Final Battle** (Rare)
- SPECIAL ABILITY: 5+ Attack. You get +2 Attack for each other Tech and/or Strength card you played this turn.
- SUPERPOWER: NA

**Ultra-Massive Armor** (Transform)
- SPECIAL ABILITY: Draw two cards. Smash 2
- SUPERPOWER: NA

### Joe Fixit, Grey Hulk (Crime Syndicate)

**Carefully Considered Smashing** (Common A)
- SPECIAL ABILITY: 2 Recruit. 0+ Attack.
- SUPERPOWER: [STRENGTH]: Smash 2

**Threaten and Bribe** (Common B)
- SPECIAL ABILITY: 2 Recruit. Choose a Villain. You can spend any combination of Recruit and Attack to fight it this turn.
- SUPERPOWER: NA

**Ambitious Enforcer** (Uncommon)
- SPECIAL ABILITY: 3 Attack. When you defeat a Villain this turn that has 6 Attack or more, Transform this into Underworld Boss and put it on top of your deck.
- SUPERPOWER: NA
- TRANSFORM: → Underworld Boss, **top of deck**

**Hulk Runs This Town** (Rare)
- SPECIAL ABILITY: 4 Attack. You can spend any combination of Recruit and Attack to fight the Mastermind this turn.
- SUPERPOWER: NA

**Underworld Boss** (Transform)
- SPECIAL ABILITY: Choose a Villain in your Victory Pile. You get +Attack equal to its printed VP.
- SUPERPOWER: NA

### Korg (Warbound)

**Nothing Beats Rock** (Common A)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: [STRENGTH]: Smash 2. If you Smash a Wound this way, KO it.

**Move Mountains** (Common B)
- SPECIAL ABILITY: 2 Attack. Outwit: Draw a card.
- SUPERPOWER: NA

**Forged by Fire** (Uncommon)
- SPECIAL ABILITY: 2 Recruit.
- SUPERPOWER: [STRENGTH] ⚠️: Transform this into Lord of Granite. *(⚠️ card art shows a single Strength trigger icon; reference shows two [STRENGTH][STRENGTH] — verify icon count in Pass 2)*
- TRANSFORM: → Lord of Granite (no destination printed → default to hand)

**Kronan Tactician** (Rare)
- SPECIAL ABILITY: Put all cards from the HQ on the bottom of the Hero Deck in random order. You get their total printed Attack.
- SUPERPOWER: NA

**Lord of Granite** (Transform) *(⚠️ class: reference says Covert; art ambiguous — verify Pass 2)*
- SPECIAL ABILITY: Draw a card. Smash 3
- SUPERPOWER: NA

### Miek the Unhived (Warbound)

**This Bug Smashes You** (Common A)
- SPECIAL ABILITY: 2+ Attack. Smash 1
- SUPERPOWER: NA

**Devouring Frenzy** (Common B)
- SPECIAL ABILITY: 2 Recruit. Look at the top card of your deck. Put it back on the top or bottom.
- SUPERPOWER: [INSTINCT]: You may Feast.

**Endless Appetite** (Uncommon)
- SPECIAL ABILITY: 3 Attack. Whenever a card is KO'd from your deck this turn, you may draw a card.
- SUPERPOWER: NA

**Metamorphosis** (Rare)
- SPECIAL ABILITY: 5 Recruit. You may Feast. Then, if a card with an Attack icon was KO'd from your deck this turn, Transform this into Hive King Miek.
- SUPERPOWER: NA
- TRANSFORM: → Hive King Miek (no destination printed → default to hand)

**Hive King Miek** (Transform)
- SPECIAL ABILITY: 6 Attack. Look at the top three cards of your deck and put them back in any order. Then you may Feast.
- SUPERPOWER: NA

### Namora (Champions)

**Crushing Tsunami** (Common A)
- SPECIAL ABILITY: Draw a card.
- SUPERPOWER: [RANGE]: Smash 3

**Heart of the Ocean** (Common B)
- SPECIAL ABILITY: 2+ Attack. You get +1 Attack, usable only against Villains in the Sewers or Bridge or the Mastermind.
- SUPERPOWER: NA

**Herculean Effort** (Uncommon)
- SPECIAL ABILITY: 3 Recruit. When you defeat a Villain in the Sewers or Bridge, Transform this into Master of Depths and put it on top of your deck.
- SUPERPOWER: NA
- TRANSFORM: → Master of Depths, **top of deck**

**Turning the Tide** (Rare)
- SPECIAL ABILITY: 5 Attack.
- SUPERPOWER: [COVERT]: If the Bridge is empty, you may move a Villain there from another city space. A Villain moved this way gets -3 Attack this turn.

**Master of Depths** (Transform)
- SPECIAL ABILITY: Smash 3. If you Smash a 0-cost Hero this way, KO it.
- SUPERPOWER: NA

### No-Name, Brood Queen (Warbound)

**Surprise Attack** (Common A)
- SPECIAL ABILITY: 1 Attack. If this is the first card you played this turn, draw a card.
- SUPERPOWER: NA

**Appetite for Destruction** (Common B)
- SPECIAL ABILITY: 2 Attack. Look at the top card of your deck. Discard it or put it back.
- SUPERPOWER: [COVERT]: You may Feast.

**Bursting with Life** (Uncommon)
- SPECIAL ABILITY: 2 Recruit. You may Feast. Then, if a non-grey Hero was KO'd from your deck this turn, Transform this into Torrent of Broodlings.
- SUPERPOWER: NA
- TRANSFORM: → Torrent of Broodlings (no destination printed → default to hand)

**World-Spanning Hunger** (Rare)
- SPECIAL ABILITY: 4+ Attack. Look at the top card of your deck. Then Feast up to three times. You get +2 Attack for each non-grey Hero that was KO'd from your deck this turn.
- SUPERPOWER: NA

**Torrent of Broodlings** (Transform)
- SPECIAL ABILITY: 2 Attack. Draw a card.
- SUPERPOWER: NA

### Rick Jones (dual-team: S.H.I.E.L.D. → Avengers)

**Hacktivist** (Common A) — S.H.I.E.L.D.
- SPECIAL ABILITY: 2 Attack.
- SUPERPOWER: [TECH]: Reveal the top card of your deck. If it's a S.H.I.E.L.D., draw it.

**Seek the Nega-Bands** (Common B) — S.H.I.E.L.D.
- SPECIAL ABILITY: 2 Recruit. Reveal the top card of your deck. If it costs 3 or more, Transform this into Captain Marvel.
- SUPERPOWER: NA
- TRANSFORM: → Captain Marvel (no destination printed → default to hand)

**Irradiated Blood** (Uncommon) — S.H.I.E.L.D.
- SPECIAL ABILITY: 3 Attack. If you have at least 5 Villains in your Victory Pile, Transform this into A-Bomb and put it on top of your deck.
- SUPERPOWER: NA
- TRANSFORM: → A-Bomb, **top of deck**

**Caught in Kree-Skrull War** (Rare) — S.H.I.E.L.D.
- SPECIAL ABILITY: 4 Attack. If you defeat two Villains this turn, Transform this into The Destiny Force and put it on top of your deck.
- SUPERPOWER: NA
- TRANSFORM: → The Destiny Force, **top of deck**

**Captain Marvel** (Transform) — Avengers
- SPECIAL ABILITY: 2 Attack. Reveal the top card of your deck. If it costs 3 or more, draw it.
- SUPERPOWER: NA

**A-Bomb** (Transform) — (no team)
- SPECIAL ABILITY: Smash 5
- SUPERPOWER: NA

**The Destiny Force** (Transform) — Avengers
- SPECIAL ABILITY: Count the number of different printed VP values in your Victory Pile. Draw that many cards.
- SUPERPOWER: NA

### Sentry (Avengers)

**Agoraphobia** (Common A)
- SPECIAL ABILITY: Transform this into Golden Guardian of Good and put it in your discard pile.
- SUPERPOWER: NA
- TRANSFORM: → Golden Guardian of Good, **discard pile**

**Rival Personalities** (Common B)
- SPECIAL ABILITY: 2+ Attack. You get +1 Attack for each card that Transformed this turn.
- SUPERPOWER: NA

**Mournful Sentinel** (Uncommon)
- SPECIAL ABILITY: 2 Recruit. Reveal the top card of your deck. If it costs 1 or more, Transform this into The Void Unchained and put it on top of your deck.
- SUPERPOWER: NA
- TRANSFORM: → The Void Unchained, **top of deck** (conditional)

**Vast Unstable Power** (Rare)
- SPECIAL ABILITY: Reveal the top five cards of the Hero Deck, gain their total printed Attack, and put them on the bottom of that deck. If this card makes 12 Attack or more, then Transform this card into The Void Mastermind and add it to the game at the start of the next turn with one random Tactic.
- SUPERPOWER: NA
- TRANSFORM: → **The Void MASTERMIND** (hero→mastermind transform; added at start of next turn with one random Tactic; conditional on 12+ Attack)

**Golden Guardian of Good** (Transform)
- SPECIAL ABILITY: You may Transform this into Agoraphobia and put it in your discard pile. If you do, you get +4 Attack.
- SUPERPOWER: NA
- TRANSFORM: → Agoraphobia, **discard pile** (optional; +4 Attack)

**The Void Unchained** (Transform) — (Unaffiliated)
- SPECIAL ABILITY: Reveal the top card of your deck. If it costs 0, then Feast. Otherwise, Transform this into Mournful Sentinel and put it in your discard pile.
- SUPERPOWER: NA
- TRANSFORM: → Mournful Sentinel, **discard pile** (conditional)

### She-Hulk (Avengers)

**Hurl Legal Objections** (Common A)
- SPECIAL ABILITY: 2 Recruit. Once this turn, if you made at least 6 Recruit this turn, Transform this into Hurl Trucks.
- SUPERPOWER: NA
- TRANSFORM: → Hurl Trucks (no destination printed → default to hand)

**Window of Opportunity** (Common B)
- SPECIAL ABILITY: 2 Recruit. Outwit: Draw a card.
- SUPERPOWER: NA

**Radioactive Riot** (Uncommon)
- SPECIAL ABILITY: 3 Attack. Once this turn, if you made at least 6 Recruit this turn, you may KO a card from your hand or discard pile.
- SUPERPOWER: NA

**Jade Giantess** (Rare)
- SPECIAL ABILITY: 4 Recruit. For every 2 Recruit you made this turn, reveal the top card of the Hero Deck, put it on the bottom of that deck, and you get that card's printed Attack.
- SUPERPOWER: NA

**Hurl Trucks** (Transform)
- SPECIAL ABILITY: Smash 2. Smash 2 *(two separate Smash 2 lines)*
- SUPERPOWER: NA

### Skaar, Son of Hulk (Avengers)

**Anger Management** (Common A)
- SPECIAL ABILITY: 1+ Attack.
- SUPERPOWER: [STRENGTH] ⚠️: Smash 3 *(⚠️ reference says Strength trigger; card-art icon read gray — verify Pass 2)*

**Scarred Past** (Common B)
- SPECIAL ABILITY: 2+ Attack.
- SUPERPOWER: [INSTINCT]: Wounded Fury

**Mood Swings** (Uncommon)
- SPECIAL ABILITY: 3 Recruit.
- SUPERPOWER: [INSTINCT]: You may gain a Wound. If you do, Transform this into Raging Savage.
- TRANSFORM: → Raging Savage (no destination printed → default to hand)

**Planetary-Level Revenge** (Rare)
- SPECIAL ABILITY: 4+ Attack. Wounded Fury. Then, you may KO any number of Wounds from your hand and/or discard pile, then draw that many cards.
- SUPERPOWER: NA

**Raging Savage** (Transform)
- SPECIAL ABILITY: 3+ Attack. Wounded Fury
- SUPERPOWER: NA

---

### Villains

---

### Aspects of the Void

**Black Anti-Hurricane** (×2)
Fight: Each player simultaneously puts a card from their discard pile into the discard pile of the player on their right.
Escape: Same effect.
Attack: 6 | VP: 4

**Demonform** (×1)
Fight: Feast. If Demonform feasts on a non-grey Hero, gain a Hero from the HQ of that cost or less.
Attack: 7 | VP: 5

**Infini-Tendrils** (×2)
Wounded Fury
Ambush: Infini-Tendrils captures a Bystander.
Attack: 4+ ⚠️ (reference says 6+) | VP: 3

**Psychotic Break** (×1)
Trap!
Ambush: Play another card from the Villain Deck.
By End of Turn: Defeat a Villain.
Or Suffer: *(After you draw your new hand)* Psychotic Break becomes a Master Strike that takes effect immediately.
Attack: — (Trap!) | VP: 2

**Shadow Man** (×2)
Fight: You get +2 Recruit.
Attack: 5 | VP: 3

### Code Red

**Caught Red-Handed** (×1)
Trap!
By End of Turn: Recruit a [COVERT] Hero or recruit any two Heroes.
Or Suffer: *(After you draw your new hand)* Each player reveals a [COVERT] Hero or gains a Wound.
Attack: — (Trap!) | VP: 3

**Crimson Dynamo** (×2)
Fight: Choose a [COVERT] Hero in the HQ. It costs 2 less this turn.
Attack: 4 | VP: 2

**Elektra, Red Blades** (×2)
Fight: If you played a [COVERT] Hero this turn, KO one of your Heroes.
Attack: 5 | VP: 3

**Punisher, Red Dot Sniper** (×1)
Fight: Reveal the top card of your deck. If it costs 0, KO it. If it's [COVERT], draw it.
Attack: 6 | VP: 4

**Red She-Hulk** (×1)
Wounded Fury
Fight: Each player reveals a [COVERT] Hero or gains a Wound.
Escape: Same effect.
Attack: 6+ | VP: 5

**Thundra** (×1)
Thundra gets +2 Attack if there are any number of [COVERT] Heroes in the HQ.
Ambush: Put each non-[COVERT] Hero from the HQ on the bottom of the Hero Deck.
Attack: 4+ | VP: 3

### Illuminati

**Black Bolt** (×2)
During your turn, any number of times, you may discard a card that has no rules text to give Black Bolt -2 Attack this turn.
Escape: Each player discards a card with no rules text.
Attack: 13* | VP: 5

**Dr. Strange** (×2)
Ambush: Each player who can't Outwit Dr. Strange discards a card.
Attack: 5 | VP: 3

**Dr. Strange, Possessed by Zom** (×1)
This Villain gets +1 Attack for each Bystander in the city.
Ambush: This Villain captures 3 Bystanders.
Attack: 5+ | VP: 3

**Enchain the Hulk** (×1)
Trap!
By End of Turn: Discard two cards of the same Hero Class or recruit two cards of the same Hero Class. ([Strength], [Instinct], [Covert], [Tech], [Range], but not grey)
Or Suffer: *(After you draw your new hand)* Cross-Dimensional Hulk Rampage
Attack: — (Trap!) | VP: 4

**Hulkbuster Iron Man** (×2)
Hulkbuster Iron Man gets +3 Attack unless you Outwit him.
Escape: Cross-Dimensional Illuminati Rampage
Attack: 6+ | VP: 4

### Intelligencia

**Battle of Wits** (×2)
Trap!
By End of Turn: Outwit this Trap.
Or Suffer: *(After you draw your new hand)* Each player discards down to 4 cards.
Attack: — (Trap!) | VP: 3

**Cosmic Hulk Robot** (×2)
Wounded Fury
Ambush: Each player who can't Outwit Cosmic Hulk Robot gains a Wound.
Escape: Same effect.
Attack: 5+ | VP: 4

**Doc Samson** (×2)
Doc Samson has +4 Attack unless you Outwit him.
Fight: KO one of your Heroes.
Attack: 4+ | VP: 3

**The Leader, Gamma Fiend** (×2)
Ambush: If you can't Outwit the Leader, play the top card of the Villain Deck.
Fight: Same effect.
Attack: 5 | VP: 3

### Sakaar Imperial Guard

**Gladiators' Colosseum** (×1)
Trap!
By End of Turn: Only play cards from a single Team of your choice this turn. (e.g. S.H.I.E.L.D., Avengers, X-Men, Warbound, etc.)
Or Suffer: *(After you draw your new hand)* Each player reveals their hand, chooses a Team, and discards all cards that don't belong to that Team.
Attack: — (Trap!) | VP: 4

**Great Devil Corker** (×2)
Fight: Look at the top three cards of your deck. Put them back in any order. Then Feast.
Attack: 6 | VP: 4

**Headman Charr** (×2)
During your turn, Headman Charr gets +1 Attack for each Villain in your Victory Pile.
Escape: Each player gains a Wound.
Attack: 2+ | VP: 2

**Lieutenant Caiera** (×1)
Fight: If you Outwit Lieutenant Caiera, draw two cards.
Attack: 7 | VP: 5

**Primus Vand** (×2)
Primus Vand gets +1 Attack for each Villain adjacent to him.
Fight: KO one of your Heroes.
Attack: 3+ | VP: 3

### U-Foes

**Ironclad** (×1)
Fight: Each player reveals a [STRENGTH] Hero or KOs a Hero that costs 1 or more from their discard pile.
Escape: Same effect.
Attack: 6 | VP: 4

**Unidentified Flying U-Foes** (×1)
Trap!
By End of Turn: Discard a [TECH] Hero or discard three cards.
Or Suffer: Play two extra cards from the Villain Deck next turn.
Attack: — (Trap!) | VP: 3

**Vapor** (×2)
Fight: Each player reveals a [COVERT] Hero or gains a Wound.
Escape: Same effect.
Attack: 4 | VP: 2

**Vector** (×2)
Fight: Each player who reveals an [INSTINCT] Hero draws a card.
Attack: 4 | VP: 2

**X-Ray** (×2)
Fight: Each player who reveals a [RANGE] Hero may KO a card from their discard pile.
Attack: 5 | VP: 3

### Warbound

**Elloe Kaifi** (×1)
Fight: Draw a card. Another player of your choice also draws a card.
Attack: 5 | VP: 3

**Hiroim** (×1)
Fight: KO a card from the HQ. Each player reveals their hand and KOs a card with that same cost.
Escape: Same effect.
Attack: 7 | VP: 5

**Korg** (×1)
Ambush: KO a Hero from the HQ. Each player reveals their hand and discards a card with that same cost.
Escape: Same effect.
Attack: 6 | VP: 4

**Miek the Unhived** (×2)
Fight: Look at the top two cards of your deck. Put them back on the top and/or bottom. Then Feast.
Attack: 5 | VP: 3

**No-Name, Brood Queen** (×2)
Wounded Fury
Fight: Feast. If this feasts on a non-grey Hero, draw two cards.
Attack: 4+ | VP: 3

**Warbound Rescue** (×1)
Trap!
By End of Turn: Put a Warbound Villain and a Henchman Villain from your Victory Pile back into the city.
Or Suffer: Each player gains a Wound.
Attack: — (Trap!) | VP: 7

---

### Masterminds

---

### General "Thunderbolt" Ross / Red Hulk

**General "Thunderbolt" Ross** (Base side)
Start of Game: Stack 8 Bystanders next to General Ross as "Helicopter" Villains with 2 Attack. You can fight them to rescue them as Bystanders. You can't fight General Ross while he has any Helicopters.
Always Leads: Code Red
Master Strike: General Ross Transforms, then Cross-Dimensional Hulk Rampage.
Attack: 6* | VP: 6

**Red Hulk** (Transformed side)
Wounded Fury. You can't fight Helicopters, and they don't stop you from fighting Red Hulk.
Master Strike: Red Hulk Transforms, then stack a random Bystander from each player's Victory Pile next to this as a Helicopter. Each player who didn't have a Bystander gains a Wound instead.
Attack: 9+ | VP: 6

**Bust You Down to Private** (Tactic)
Fight: Each other player puts a non-grey Hero from their hand on the bottom of the Hero Deck, then puts a 0-cost Hero from the KO pile into their hand. This Mastermind Transforms.

**Call Out the Army** (Tactic)
Fight: Put 3 Bystanders from the Bystander Stack next to this Mastermind as "Helicopters." This Mastermind Transforms.

**Personal Arsenal** (Tactic)
Fight: For each Master Strike in the KO pile, put a Bystander from the Bystander Stack next to this Mastermind as a "Helicopter." This Mastermind Transforms.

**Urban Warfare** (Tactic)
Fight: Put a random Bystander next to this Mastermind as a "Helicopter" from each of these places: the Bystander Stack, the Escape Pile, each city space, and each other player's Victory Pile. This Mastermind Transforms.

---

### Illuminati, Secret Society / Open Warfare

**Illuminati, Secret Society** (Base side)
This Mastermind has +4 Attack unless you Outwit them.
Always Leads: Illuminati
Master Strike: Each player reveals their hand and discards two cards that each cost between 1 and 4. The Illuminati Transform.
Attack: 11+ | VP: 7

**Illuminati, Open Warfare** (Transformed side)
Whenever a card effect causes a player to draw any number of cards, that player must then also discard a card.
Master Strike: Each player reveals their hand and discards two cards that each cost between 5 and 8. The Illuminati Transform.
Attack: 13 | VP: 7

**Black Bolt's Omni-Shout** (Tactic)
Fight: Each other player reveals their hand and discards two cards with no rules text. The Illuminati Transform.

**Dr. Strange's Orb of Agamotto** (Tactic)
Fight: Each other player reveals their hand and discards a [RANGE] or [INSTINCT] Hero. The Illuminati Transform.

**Hulkbuster's Hammer Fist** (Tactic)
Fight: Each other player reveals their hand and KOs a [TECH] or [STRENGTH] Hero from their hand or discard pile. The Illuminati Transform.

**Zom's Manacles of Living Bondage** (Tactic)
Fight: Each other player reveals a [COVERT] Hero or gains a Wound. The Illuminati Transform.

---

### King Hulk, Sakaarson / Worldbreaker

**King Hulk, Sakaarson** (Base side)
King Hulk gets +1 Attack for each Warbound Villain in the city and in the Escape Pile.
Always Leads: Warbound
Master Strike: Each player KOs a Warbound Villain from their Victory Pile or gains a Wound. King Hulk Transforms.
Attack: 9+ | VP: 6

**King Hulk, Worldbreaker** (Transformed side)
Wounded Fury
Master Strike: Each player reveals their hand, then KOs a card from their hand or discard pile that has the same card name as a card in the HQ. King Hulk Transforms.
Attack: 10+ | VP: 6

**Fury of the Green Scar** (Tactic)
Fight: Each other player reveals their hand and discards a Hero that isn't grey and isn't [STRENGTH]. King Hulk Transforms.

**Oath of the Warbound** (Tactic)
Fight: The Villain in the Escape Pile with the highest printed Attack enters the Sewers. King Hulk Transforms.

**Revenge from the Stars** (Tactic)
Fight: After you put this in your Victory Pile, Cross-Dimensional Hulk Rampage. King Hulk Transforms.

**Rule by the Strongest** (Tactic)
Fight: You get +1 Recruit for each of your [STRENGTH] Heroes. King Hulk Transforms.

---

### M.O.D.O.K. / Network Nightmare

**M.O.D.O.K.** (Base side)
All cards' Outwit abilities require four different costs instead of three.
Always Leads: Intelligencia
Master Strike: Each player who can't Outwit M.O.D.O.K. gains a Wound, then M.O.D.O.K. Transforms.
Attack: 9 | VP: 6

**M.O.D.O.K., Network Nightmare** (Transformed side)
You can only fight M.O.D.O.K. with Recruit, not Attack.
Master Strike: Each player who can't Outwit M.O.D.O.K. KOs a non-grey Hero from their discard pile. M.O.D.O.K. Transforms.
Attack: 8* | VP: 6

**Brain Scramble** (Tactic)
Fight: Each other player discards their hand, then draws as many cards as they discarded. M.O.D.O.K. Transforms.

**Designed Only For... K.O.ing** (Tactic)
Fight: Reveal the top three cards of your deck. KO one of them, draw one, and discard one. M.O.D.O.K. Transforms.

**Don't Get a Big Head About It** (Tactic)
Fight: Draw a card for each Intelligencia Villain in your Victory Pile. M.O.D.O.K. Transforms.

**Redundancy Algorithms** (Tactic)
Fight: Each other player reveals their hand and discards two cards that have the same cost. M.O.D.O.K. Transforms.

---

### The Red King / Power Armored

**The Red King** (Base side)
You can't fight the Red King while any Villains are in the city.
Always Leads: Sakaar Imperial Guard
Master Strike: The Red King Transforms, then each player reveals a [TECH] card or gains a Wound.
Attack: 7* | VP: 6

**The Red King, Power Armored** (Transformed side)
Master Strike: The Red King Transforms, then play another card from the Villain Deck.
Attack: 10 | VP: 6

**Haughty Spite** (Tactic)
Fight: Each other player without a Red King Tactic in their Victory Pile gains a Wound. The Red King Transforms.

**Royal Bodyguard** (Tactic)
Fight: Reveal cards from the Villain Deck until you reveal a Sakaar Imperial Guard. If you find one, play it. Either way, shuffle all the other revealed cards back into the Villain Deck. The Red King Transforms.

**Treasury of Sakaar** (Tactic)
Fight: You get +1 Recruit for each Sakaar Imperial Guard and Red King Tactic in your Victory Pile, including this one. The Red King Transforms.

**Vast Armies of Sakaar** (Tactic)
Fight: If this is not the final Tactic, reveal the top three cards of the Villain Deck. Play all the Villains you revealed. Put the rest back in random order. The Red King Transforms.

---

### The Sentry / The Void

**The Sentry** (Base side)
Start of Game: Shuffle 2 Wounds into each player's deck before drawing starting hands.
Always Leads: Aspects of the Void
Master Strike: The Sentry Transforms, then Cross-Dimensional Void Rampage.
Attack: 10 | VP: 6

**The Void** (Transformed side)
Wounded Fury
Master Strike: Feast on each player. If this feasts on a player's grey Hero, that player gains a Wound. The Void Transforms.
Attack: 11+ | VP: 6

**Pacifying Light** (Tactic)
Fight: Each other player reveals their hand and discards two cards with Recruit icons. This Mastermind Transforms.

**Power of a Million Exploding Suns** (Tactic)
Fight: Put all Heroes from the HQ on the bottom of the Hero Deck. Each other player reveals their hand and discards each card with the same card name as any of those cards. This Mastermind Transforms.

**Reflexive Teleportation** (Tactic)
Fight: Choose one of your Heroes that costs 5 or less. When you draw a new hand of cards at the end of this turn, add that Hero to your hand as an extra card. This Mastermind Transforms.

**Repressed Darkness** (Tactic)
Fight: Each other player reveals a [RANGE] Hero or plays an Aspects of the Void Villain from their Victory Pile as if playing it from the Villain Deck. This Mastermind Transforms.

---

### Henchmen

---

**Cytoplasm Spikes** (×10)
Fight: Feast. If Cytoplasm Spikes feasts on a non-grey Hero, you get +2 Recruit.
Attack: 3 | VP: 1

**Death's Heads** (×10)
Fight: If you Outwit these Death's Heads, KO one of your cards that costs 0.
Attack: 3 | VP: 1

**Sakaaran Hivelings** (×10)
Fight: Look at the top card of your deck. Put it back on the top or bottom. Then Feast.
Attack: 3 | VP: 1

---

### Schemes

---

**Break the Planet Asunder**
Setup: 9 Twists. 7 Heroes.
Twist: Stack this Twist next to the Scheme as a "Tectonic Break." Then KO each Hero from the HQ whose printed Attack is less than the number of Tectonic Breaks (no printed Attack counts as 0).
Evil Wins: When 25 non-grey Heroes are KO'd.

**Cytoplasm Spike Invasion**
Setup: 10 Twists. Shuffle together 20 Bystanders and 10 Cytoplasm Spike Henchmen as an "Infected Deck."
Twist: Reveal the top three cards of the Infected Deck. KO all Bystanders you revealed. All Spikes you revealed enter the city.
Evil Wins: When the KO pile and Escape Pile combine to have 18 Bystanders and/or Spikes.

**Fall of the Hulks**
Setup: 10 Twists. 6 Wounds per player in Wound Stack. Use exactly two Heroes with "Hulk" in their Hero Names.
Twist 3-6: Cross-Dimensional Hulk Rampage.
Twist 7-10: Each player gains a Wound.
Evil Wins: When the Wound Stack runs out.

**Gladiator Pits of Sakaar**
Setup: 6 Twists.
Twist: Until the start of your next turn, each player can only play cards from a single Team of their choice during their turn. (e.g. S.H.I.E.L.D., Avengers, X-Men, Warbound, etc.)
Evil Wins: When 2 Villains per player have escaped or the Villain Deck runs out.

**Mutating Gamma Rays**
Setup: 7 Twists. Take 14 cards from an extra Hero with "Hulk" in its Hero Name. Put them in a face-up "Mutation Pile."
Twist 1-6: Each player in turn does the following: Put a non-grey Hero from your hand into the Mutation Pile. Then you may put a different card name with the same cost from the Mutation Pile into your discard pile.
Twist 7: Evil Wins!

**Shoot Hulk into Space**
Setup: 8 Twists. Take 14 cards from an extra Hero with "Hulk" in its Hero Name. Shuffle them into a "Hulk Deck."
Twist: Put 2 cards from the Hulk Deck into a face-up "Prison Ship" stack next to the S.H.I.E.L.D. Officer Stack.
Special Rules: You may recruit the top card of the Prison Ship stack.
Evil Wins: When there are 10 cards in the Prison Ship or the Hulk Deck runs out.

**Subjugate with Obedience Disks**
Setup: 11 Twists.
Twist: Put this Twist under an HQ space as an "Obedience Disk." No space can have two more Obedience Disks than any other space.
Special Rules: To recruit a Hero in the HQ, you must also pay 1 Recruit for each Obedience Disk under it.
Evil Wins: When each HQ space has 2 Obedience Disks.

**World War Hulk**
Setup: 9 Twists. Put three additional Masterminds out of play, "Lurking." Each of the four Masterminds has two random Tactics.
Special Rules: When you defeat all of a Mastermind's Tactics, KO its face card and a random Lurking Mastermind enters play.
Twist 1-8: Swap the current Mastermind with a random Lurking Mastermind.
Twist 9: Evil Wins!

---

### Bystanders

---

**Actor** (×1)
When you rescue this Bystander, choose a Hero in the HQ that costs 4 or less. You get its printed Recruit and Attack.
VP: 1

**Animal Trainer** (×1)
When you rescue this Bystander, each [INSTINCT] and/or [COVERT] Hero currently in the HQ costs 1 less this turn.
VP: 1

**Tourist Couple** (×1)
When you rescue this Bystander, you get +1 Recruit if the Rooftops are empty and +1 Recruit if the Bridge is empty.
VP: 1

**Triage Nurse** (×1)
When you rescue this Bystander, look at the top three cards of your deck. KO one, discard one, and put one back.
VP: 1

---

## Pass 1 Flags Summary (for Pass 2 / Pass 3)

**Title verification (RESOLVED — handoff's main concern):** all 78 hero image titles match their filenames; the `UltraMassiveArmor` "promo" concern is cleared (genuine transform card). No mislabeled hero files found.

**Undefined keywords (must come from rules PDF / prior set — NOT guessed):**
1. **Feast** — used on Heroes (Miek, No-Name, The Void Unchained), Villains (Demonform, Great Devil Corker, Miek, No-Name), Masterminds (The Void), Henchmen (Cytoplasm Spikes, Sakaaran Hivelings). Not defined in this reference. Get its definition before implementation.
2. **Trap!** — villain card type ("By End of Turn / Or Suffer" structure; VP, no Attack). Used by Psychotic Break, Caught Red-Handed, Enchain the Hulk, Battle of Wits, Gladiators' Colosseum, Unidentified Flying U-Foes, Warbound Rescue. Not defined here.
3. **Cross-Dimensional Void / Illuminati Rampage** — reference defines only the **Hulk** variant explicitly; Void (Sentry) and Illuminati (Hulkbuster Iron Man villain) variants need their exact text from the rules PDF.

**Open ⚠️ card-data flags:**
4. **Infini-Tendrils Attack** — card art reads **4+**, reference says **6+**. Recorded card value; resolve against physical card.
5. **Korg "Forged by Fire" transform trigger** — card art shows a single Strength icon; reference shows two ([STRENGTH][STRENGTH]). Verify icon count.
6. **Korg "Lord of Granite" class** — reference says Covert; transformed-card art ambiguous. Verify.
7. **Skaar "Anger Management" superpower trigger** — reference says Strength; card-art icon read gray. Verify.
8. **Transform destinations** — many transform cards print NO destination clause ("put it on top of your deck / in your discard pile"), so by the Transform keyword the new card defaults to **hand**: Gamma-Draining Nanites, Gamma Bomb Disaster, Dutiful Protector, Save from the Rubble, Build the Suit, Forged by Fire, Metamorphosis, Bursting with Life, Seek the Nega-Bands, Hurl Legal Objections, Mood Swings. Cards that DO specify (top of deck): Seize the Throne, Ambitious Enforcer, Herculean Effort, Irradiated Blood, Caught in Kree-Skrull War, Mournful Sentinel. Cards that specify discard pile: Agoraphobia, Golden Guardian of Good, The Void Unchained. Confirm the default-destination rule against the rules PDF.

**Name / spelling (image wins; recorded):**
9. "Attune **Tectonic** Transducer" (card) vs "Techtonic" (reference). 
10. "Cytoplasm Spikes" (printed henchman name) vs "Cytoplasmic Spikes" (reference Main-list outlier).
11. "Cross-Dimensional" (card) vs "Cross-Dimension" (reference Fall of the Hulks typo).
12. Primus Vand "adjacent to him" (card) vs "next to him" (reference); Ironclad "or KOs" (card) vs "of KO's" (reference typo); Battle of Wits "your new hand" (card) vs "your new turn" (reference typo). Card text recorded throughout.

**Structural notes for implementation:**
13. **Transforming Heroes** — Transformed cards live in a separate Transformation Pile (not recruitable). 15 heroes; Rick Jones (+9 transforms, dual S.H.I.E.L.D./Avengers, A-Bomb has no team) and Sentry (+8 transforms, two flip-pairs) are the most complex.
14. **Sentry "Vast Unstable Power" → The Void Mastermind** — unique hero→Mastermind transform (adds The Void as a Mastermind with a random Tactic at the start of the next turn).
15. **Transforming Masterminds** — double-sided (Base + Transformed), NO Epic variants. Tactics flip the card. Asterisk attacks: Ross 6* (Helicopter lock), M.O.D.O.K. Network Nightmare 8* (Recruit-only fight), Red King 7* (can't fight while Villains in city), Black Bolt villain 13* (discard-to-reduce).
16. **M.O.D.O.K. base passive** globally changes Outwit to require 4 different costs (cross-card interaction).
17. **"Brotherhood" team** is referenced in some prior-set contexts; not used on WWH cards read here. Class terminology "Range" not "Ranged" throughout.
18. **City spaces** referenced: Sewers, Rooftops, Bridge, Bank, HQ — confirm engine city-space naming during analyze-expansion.
