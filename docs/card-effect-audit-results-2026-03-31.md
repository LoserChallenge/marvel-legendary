# Card Effect Audit Results — 2026-03-31

First audit run across all 5 existing expansions.

## Summary

| Expansion | Cards Audited | HIGH | MEDIUM | LOW | Total |
|-----------|--------------|------|--------|-----|-------|
| Core Set | 127 | 3 | 5 | 4 | 12 |
| Dark City | 68+ | 20 | 7 | 3 | 30 |
| Fantastic Four | 36 | 3 | 3 | 1 | 7 |
| Guardians of the Galaxy | 52 | 3 | 3 | 3 | 9 |
| Paint the Town Red | 43 | 2 | 1 | 4 | 7 |
| **Totals** | **326+** | **31** | **19** | **15** | **65** |

---

## Core Set (11 issues + 1 reference correction)

### HIGH

```
CARD: Black Widow - Mission Accomplished (Hero — Core Set)
LAYER: 1
ISSUE: Wrong superpower condition type in database
EXPECTED: Superpower trigger should be [Covert] per card text: "[Covert]: Rescue a Bystander."
ACTUAL: DB has condition: "Tech" — triggers on Tech class instead of Covert
FILE: cardDatabase.js:4376
SEVERITY: HIGH
```

```
CARD: Gambit - Card Shark (Hero — Core Set)
LAYER: 1
ISSUE: Wrong condition check in ability function — checks X-Men team instead of Instinct class
EXPECTED: Card text says "If it's an [Instinct] Hero, draw it" — should check if revealed card has Instinct class
ACTUAL: Code checks topCardPlayerDeck.team === "X-Men" (team, not class)
FILE: cardAbilities.js:1348
SEVERITY: HIGH
```

```
CARD: Nick Fury - Battlefield Promotion (Hero — Core Set)
LAYER: 1
ISSUE: Wrong KO target filter — filters by S.H.I.E.L.D. team instead of Strength class
EXPECTED: Card text says "You may KO a [Strength] Hero from your hand or discard pile" — should filter for Strength class
ACTUAL: Code filters card.team === "S.H.I.E.L.D."
FILE: cardAbilities.js:6800
SEVERITY: HIGH
```

### MEDIUM

```
CARD: Nick Fury - Battlefield Promotion (Hero — Core Set)
LAYER: 1
ISSUE: DB has recruit: 0 but card shows 4 [Recruit] as base value
EXPECTED: recruit: 4, recruitIcon: true
ACTUAL: recruit: 0, recruitIcon: false
FILE: cardDatabase.js:5426-5428
SEVERITY: MEDIUM
NOTE: Needs manual card image verification
```

```
CARD: Gambit - Stack the Deck (Hero — Core Set)
LAYER: 1
ISSUE: DB has recruit: 0 but reference indicates 2 [Recruit] as base value
EXPECTED: recruit: 2
ACTUAL: recruit: 0
FILE: cardDatabase.js:4956-4958
SEVERITY: MEDIUM
NOTE: May be misread from card image (cost is also 2). Needs verification.
```

```
CARD: Iron Man - Endless Invention (Hero — Core Set)
LAYER: 1
ISSUE: DB has recruit: 0 but reference indicates 3 [Recruit]
ACTUAL: recruit: 0
FILE: cardDatabase.js:5308-5310
SEVERITY: MEDIUM
NOTE: May be misread from card image (cost is also 3). Needs verification.
```

```
CARD: Iron Man - Quantum Breakthrough (Hero — Core Set)
LAYER: 1
ISSUE: DB has recruit: 0 but reference indicates 7 [Recruit]
ACTUAL: recruit: 0
FILE: cardDatabase.js:5392-5394
SEVERITY: MEDIUM
NOTE: Likely misread from card image (cost is 7). Needs verification.
```

```
CARD: Gambit - Card Shark (Hero — Core Set)
LAYER: 1
ISSUE: DB has attack: 2 but reference indicates 4 [Attack]
ACTUAL: DB has attack: 2
FILE: cardDatabase.js:4983
SEVERITY: MEDIUM
NOTE: Needs manual card verification.
```

### LOW

```
CARD: Captain America - A Day Unlike Any Other (Hero — Core Set)
LAYER: 1
ISSUE: Reference file error — lists [Covert] superpower but actual card uses [Avengers] team
ACTUAL: Code is correct (condition: "Avengers"). Reference file needs correction.
FILE: docs/card-effects-reference/core-set.md
SEVERITY: LOW (reference error, not code error)
```

```
CARD: Nick Fury - Pure Fury (Hero — Core Set)
LAYER: 1
ISSUE: Reference lists "8 [Attack]" which is actually the cost, not attack
ACTUAL: DB correctly has attack: 0, cost: 8. Reference needs correction.
FILE: docs/card-effects-reference/core-set.md
SEVERITY: LOW (reference error, not code error)
```

```
CARD: Gambit - Hypnotic Charm (Hero — Core Set)
LAYER: 1
ISSUE: "Each other player" conditional implementation — targets player's own deck in solo
ACTUAL: Reasonable solo adaptation. No fix needed.
FILE: cardAbilities.js:1830
SEVERITY: LOW
```

```
CARD: Green Goblin (Villain — Spider-Foes, Core Set)
LAYER: 1
ISSUE: Ambush effect — verify bystander capture targets correct villain
FILE: cardDatabase.js:2206
SEVERITY: LOW
NOTE: Needs gameplay verification.
```

---

## Dark City (30 issues)

### HIGH (20)

```
CARD: Elektra - First Strike (Hero — Dark City)
LAYER: 1
ISSUE: Wrong bonus attack value
EXPECTED: "+3 [Attack]" if first card played
ACTUAL: Code grants +1 Attack
FILE: cardAbilitiesDarkCity.js:1216
SEVERITY: HIGH
```

```
CARD: Elektra - Sai Blades (Hero — Dark City)
LAYER: 1
ISSUE: Wrong cost threshold for counting heroes
EXPECTED: Heroes that cost 1 or less
ACTUAL: Code counts heroes that cost 1 OR 2
FILE: cardAbilitiesDarkCity.js:1245
SEVERITY: HIGH
```

```
CARD: Bishop - Absorb Energies (Hero — Dark City)
LAYER: 1
ISSUE: Gives Recruit instead of Attack on KO
EXPECTED: "+2 [Attack]" per KO
ACTUAL: Code increments Recruit, not Attack
FILE: cardAbilitiesDarkCity.js:6965
SEVERITY: HIGH
```

```
CARD: Bishop - Absorb Energies (Hero — Dark City)
LAYER: 1
ISSUE: Database base values swapped
EXPECTED: attack: 0, recruit: 2
ACTUAL: attack: 2, recruit: 0
FILE: cardDatabase.js:6248-6249
SEVERITY: HIGH
```

```
CARD: Bishop - Firepower from the Future (Hero — Dark City)
LAYER: 1
ISSUE: Completely wrong implementation — reveals 4 cards instead of 1, uses attack value instead of cost
EXPECTED: Reveal top card, get +Attack equal to its cost
ACTUAL: Reveals top 4 cards, sums their attack values
FILE: cardAbilitiesDarkCity.js:6596-6601
SEVERITY: HIGH
```

```
CARD: Bishop - Firepower from the Future (Hero — Dark City)
LAYER: 1
ISSUE: KO ability wrongly gated on X-Men condition
EXPECTED: "You may KO any number of your cards" (unconditional)
ACTUAL: Only allows KO if an X-Men hero was played
FILE: cardAbilitiesDarkCity.js:6629-6643
SEVERITY: HIGH
```

```
CARD: Blade - Night Hunter (Hero — Dark City)
LAYER: 1
ISSUE: Gives Recruit instead of Attack
EXPECTED: "+2 [Attack]" for defeating Villains in Sewers or Rooftops
ACTUAL: Code adds to Recruit, not Attack
FILE: cardAbilitiesDarkCity.js:3317
SEVERITY: HIGH
```

```
CARD: Blade - Night Hunter (Hero — Dark City)
LAYER: 1
ISSUE: Database base values swapped
EXPECTED: attack: 0, recruit: 2
ACTUAL: attack: 2, recruit: 0
FILE: cardDatabase.js:6394-6395
SEVERITY: HIGH
```

```
CARD: Ghost Rider - Penance Stare (Hero — Dark City)
LAYER: 1
ISSUE: Wrong attack calculation — gives flat +1 instead of VP-based
EXPECTED: "+1 [Attack] for each VP on the cards KO'd this way"
ACTUAL: Flat +1 Attack regardless of VP
FILE: cardAbilitiesDarkCity.js:2784
SEVERITY: HIGH
```

```
CARD: Ghost Rider - Penance Stare (Hero — Dark City)
LAYER: 1
ISSUE: Wrong condition check — checks Marvel Knights before allowing villain KO
EXPECTED: Unconditional villain KO effect
ACTUAL: Gated on Marvel Knights condition
FILE: cardAbilitiesDarkCity.js:2521-2534
SEVERITY: HIGH
```

```
CARD: Ghost Rider - Penance Stare (Hero — Dark City)
LAYER: 1
ISSUE: KO'd villain goes to KO pile instead of Victory Pile
EXPECTED: "Put the cards into your Victory Pile" after KO
ACTUAL: Code puts KO'd villain into koPile
FILE: cardAbilitiesDarkCity.js:2783
SEVERITY: HIGH
```

```
CARD: Iron Fist - Focus Chi (Hero — Dark City)
LAYER: 1
ISSUE: Counts unique costs across ALL cards instead of counting Instinct heroes
EXPECTED: "+1 [Recruit] for each Hero with a different [Instinct] you have"
ACTUAL: Counts unique costs across all played cards (no Instinct filter)
FILE: cardAbilitiesDarkCity.js:2817-2852
SEVERITY: HIGH
```

```
CARD: Iron Fist - Wield the Iron Fist (Hero — Dark City)
LAYER: 1
ISSUE: Counts unique costs across ALL cards instead of counting Strength heroes
EXPECTED: "+1 [Attack] for each Hero with a different [Strength] you have"
ACTUAL: Counts unique costs across all played cards (no Strength filter)
FILE: cardAbilitiesDarkCity.js:2855-2891
SEVERITY: HIGH
```

```
CARD: Iron Fist - Living Weapon (Hero — Dark City)
LAYER: 1
ISSUE: Wrong stop condition for reveal loop
EXPECTED: Reveal until you find a card that costs 0
ACTUAL: Stops on duplicate cost instead of cost-0 card
FILE: cardAbilitiesDarkCity.js:2992-3047
SEVERITY: HIGH
```

```
CARD: Cable - Rapid Response Force (Hero — Dark City)
LAYER: 1
ISSUE: Completely wrong implementation — counts X-Force heroes instead of KO'ing Tech heroes
EXPECTED: "KO one of each other [Tech] Hero you played. +1 [Attack] per card KO'd"
ACTUAL: Counts X-Force team heroes, no KO mechanic
FILE: cardAbilitiesDarkCity.js:4634-4654
SEVERITY: HIGH
```

```
CARD: Cable - Rapid Response Force (Hero — Dark City)
LAYER: 1
ISSUE: Database has wrong multiplier (X-Force team instead of Tech class)
FILE: cardDatabase.js:6543-6547
SEVERITY: HIGH
```

```
CARD: Cable - Strike at the Heart of Evil (Hero — Dark City)
LAYER: 1
ISSUE: Gives +2 mastermind-only attack instead of +1
EXPECTED: "+1 [Attack] only when fighting a Mastermind"
ACTUAL: mastermindReserveAttack incremented twice
FILE: cardAbilitiesDarkCity.js:4626-4627
SEVERITY: HIGH
```

```
CARD: Cable - Army of One (Hero — Dark City)
LAYER: 1
ISSUE: Only KOs from hand, missing discard pile
EXPECTED: "KO any number of cards from your hand and discard pile"
ACTUAL: Only presents hand cards for KO
FILE: cardAbilitiesDarkCity.js:4656-4697
SEVERITY: HIGH
```

```
CARD: Domino - Specialized Ammunition (Hero — Dark City)
LAYER: 1
ISSUE: Wrong bonus values (+4 instead of +3) AND wrong icon checks (attackIcon/recruitIcon instead of Tech/Covert)
EXPECTED: +3 [Attack] for Tech icon, +3 [Recruit] for Covert icon
ACTUAL: +4 for each, checks attackIcon/recruitIcon instead of class
FILE: cardAbilitiesDarkCity.js:4565-4570
SEVERITY: HIGH
```

```
CARD: Punisher - The Punisher (Hero — Dark City)
LAYER: 1
ISSUE: Adds attack points not mentioned in card text
EXPECTED: Reveal cards from Hero Deck until two match cost — no attack gain
ACTUAL: Code adds +1 Attack per revealed card
FILE: cardAbilitiesDarkCity.js:3074-3076
SEVERITY: HIGH
```

```
CARD: Cable - Disaster Survivalist (Hero — Dark City)
LAYER: 1
ISSUE: Ability not implemented at all
EXPECTED: "When a Master Strike is played, you may discard this card. Draw three extra cards."
ACTUAL: Both ability fields set to "None" in database
FILE: cardDatabase.js:6520-6524
SEVERITY: HIGH
```

### MEDIUM (7)

```
CARD: Ghost Rider - Blazing Hellfire (Hero — Dark City)
LAYER: 1
ISSUE: Database has phantom bonusRecruit: 2 not mentioned on card
FILE: cardDatabase.js:7217
SEVERITY: MEDIUM
```

```
CARD: Domino - Ready For Anything (Hero — Dark City)
LAYER: 1
ISSUE: Missing second-Domino bonus mechanic
FILE: cardAbilitiesDarkCity.js:4303-4308
SEVERITY: MEDIUM
```

```
CARD: Domino - Against All Odds (Hero — Dark City)
LAYER: 1
ISSUE: "True Versatility" implementation differs from card text
FILE: cardAbilitiesDarkCity.js:4310-4325
SEVERITY: MEDIUM
```

```
CARD: Punisher - The Punisher (Hero — Dark City)
LAYER: 1
ISSUE: Puts revealed cards on bottom instead of keeping the matching pair
FILE: cardAbilitiesDarkCity.js:3088-3097
SEVERITY: MEDIUM
```

```
CARD: Punisher - Hostile Interrogation (Hero — Dark City)
LAYER: 1
ISSUE: "Each other player" effect completely skipped in solo (should target hero deck in Golden Solo)
FILE: cardAbilitiesDarkCity.js:3280-3284
SEVERITY: MEDIUM
```

```
CARD: Angel - Drop Off A Friend (Hero — Dark City)
LAYER: 1
ISSUE: Attack gain happens even when invulnerability returns card to hand
FILE: cardAbilitiesDarkCity.js:428-431
SEVERITY: MEDIUM
```

```
CARD: Colossus - Russian Heavy Tank (Hero — Dark City)
LAYER: 1
ISSUE: "Each other player" wound redirect not implemented
FILE: cardDatabase.js:6693-6697
SEVERITY: MEDIUM
```

### LOW (3)

```
CARD: Ghost Rider - Infernal Chains (Hero — Dark City)
LAYER: 1
ISSUE: Phrasing difference ("less than 4" vs "3 or less") — functionally equivalent
FILE: cardAbilitiesDarkCity.js:1641
SEVERITY: LOW
```

```
CARD: Domino - Against All Odds (Hero — Dark City)
LAYER: 1
ISSUE: X-Force condition checked manually instead of through engine condition system
FILE: cardAbilitiesDarkCity.js:4311-4319
SEVERITY: LOW
```

```
CARD: Nightcrawler - Along for the Ride (Hero — Dark City)
LAYER: 1
ISSUE: Teleport ability handled via name-matching special case, not DB ability fields
FILE: cardDatabase.js:7744-7748
SEVERITY: LOW
```

---

## Fantastic Four (7 issues)

### HIGH (3)

```
CARD: Thing - It's Clobberin' Time! (Hero — Fantastic Four)
LAYER: 1
ISSUE: Missing KO effect from Strength superpower
EXPECTED: "Strength: You may KO a card from your hand or discard pile"
ACTUAL: thingItsClobberinTime() only calls bonusAttack(), no KO option
FILE: expansionFantasticFour.js:5036
SEVERITY: HIGH
```

```
CARD: Galactus - Sunder the Earth (Mastermind Tactic — Fantastic Four)
LAYER: 2
ISSUE: "Each other player" effect applied to solo player instead of being skipped
EXPECTED: Solo: skip "each other player KOs all Heroes from discard pile"
ACTUAL: Applies KO effect to the solo player
FILE: expansionFantasticFour.js:2225
SEVERITY: HIGH
```

```
CARD: Mole Man - Dig to Freedom (Mastermind Tactic — Fantastic Four)
LAYER: 2
ISSUE: "Each other player" effect applied to solo player instead of being skipped
EXPECTED: Solo: skip villain return to escaped pile
ACTUAL: Forces solo player to return a villain
FILE: expansionFantasticFour.js:2306
SEVERITY: HIGH
```

### MEDIUM (3)

```
CARD: Invisible Woman - Four of a Kind (Hero — Fantastic Four)
LAYER: 1
ISSUE: cumulativeAttackPoints not updated when +2 Attack is granted
FILE: expansionFantasticFour.js:4305
SEVERITY: MEDIUM
```

```
CARD: Bathe Earth in Cosmic Rays (Scheme — Fantastic Four)
LAYER: 1
ISSUE: KO targets include artifacts, but card text says "Reveal your hand" only
FILE: expansionFantasticFour.js:694
SEVERITY: MEDIUM
```

```
CARD: Pull Reality Into the Negative Zone (Scheme — Fantastic Four)
LAYER: 1
ISSUE: Twist numbering offset — Twist 1 does nothing but should activate odd-twist swap
FILE: expansionFantasticFour.js:671
SEVERITY: MEDIUM (may be reference error)
```

### LOW (1)

```
CARD: Morg (Villain — Heralds of Galactus)
LAYER: 3
ISSUE: HQ iteration uses hardcoded i < 5 instead of hq.length (already known as L6)
FILE: expansionFantasticFour.js:3232
SEVERITY: LOW
```

---

## Guardians of the Galaxy (9 issues)

### HIGH (3)

```
CARD: Forge the Infinity Gauntlet (Scheme — Guardians of the Galaxy)
LAYER: 1
ISSUE: Order of operations reversed — shards placed on city gems BEFORE new gem enters, so new gem misses its shard
EXPECTED: Gem enters city first, then all gems (including new one) get shards
ACTUAL: Shards placed first, then gem enters
FILE: expansionGuardiansOfTheGalaxy.js:848
SEVERITY: HIGH
```

```
CARD: Space Gem (Villain — Guardians of the Galaxy)
LAYER: 1
ISSUE: Empty space calculation excludes type "Villain" but not "Henchman" — henchmen counted as empty
FILE: expansionGuardiansOfTheGalaxy.js:3130
SEVERITY: HIGH
```

```
CARD: Rocket Raccoon - Vengeance is Rocket (Hero — Guardians of the Galaxy)
LAYER: 1
ISSUE: Uses cumulativePlayerAttack instead of cumulativeAttackPoints — bonus may not display correctly
FILE: expansionGuardiansOfTheGalaxy.js:6513
SEVERITY: HIGH
```

### MEDIUM (3)

```
CARD: Soul Gem (Villain — Guardians of the Galaxy)
LAYER: 1
ISSUE: Counts only type "Villain" in city, not henchmen
FILE: expansionGuardiansOfTheGalaxy.js:3107
SEVERITY: MEDIUM
```

```
CARD: Rocket Raccoon - Vengeance is Rocket (Hero — Guardians of the Galaxy)
LAYER: 1
ISSUE: Only counts Master Strikes in KO pile, not those stacked next to Mastermind
EXPECTED: Card says "KO pile AND/OR stacked next to the Mastermind"
FILE: expansionGuardiansOfTheGalaxy.js:6503
SEVERITY: MEDIUM
```

```
CARD: Groot - Prune the Growths (Hero — Guardians of the Galaxy)
LAYER: 1
ISSUE: Wrong popup title ("Groot and Branches" instead of "Prune the Growths") and typo ("hard" instead of "hand")
FILE: expansionGuardiansOfTheGalaxy.js:5823
SEVERITY: MEDIUM
```

### LOW (3)

```
CARD: Gamora - Galactic Assassin (Hero — Guardians of the Galaxy)
LAYER: 1
ISSUE: Popup title says "BOUNTY HUNTER" instead of "GALACTIC ASSASSIN"
FILE: expansionGuardiansOfTheGalaxy.js:5013
SEVERITY: LOW
```

```
CARD: Rocket Raccoon - Incoming Detector (Hero — Guardians of the Galaxy)
LAYER: 1
ISSUE: Title typo "ROCKECT RACCOON" instead of "ROCKET RACCOON"
FILE: expansionGuardiansOfTheGalaxy.js:6453
SEVERITY: LOW
```

```
CARD: Groot - Groot and Branches (Hero — Guardians of the Galaxy)
LAYER: 1
ISSUE: Covert conditional "other player" message shown unconditionally
FILE: expansionGuardiansOfTheGalaxy.js:6063
SEVERITY: LOW
```

---

## Paint the Town Red (7 issues)

### HIGH (2)

```
CARD: Spider-Woman - Arachno-Pheromones (Hero — Paint the Town Red)
LAYER: 1
ISSUE: Covert conditional checks Spider Friends team instead of Covert class
EXPECTED: Check for Covert class hero played
ACTUAL: Checks spiderFriends.length > 0
FILE: script.js:17382, expansionPaintTheTownRed.js:4265
SEVERITY: HIGH
```

```
CARD: Black Cat - Cat Burglar (Hero — Paint the Town Red)
LAYER: 1
ISSUE: Covert conditional wired as unconditional — bystander Attack bonus always fires
EXPECTED: Should only trigger if Covert hero played this turn
ACTUAL: unconditionalAbility in DB, fires every time
FILE: cardDatabase.js:8804, expansionPaintTheTownRed.js:2683
SEVERITY: HIGH
```

### MEDIUM (1)

```
CARD: Black Cat - Cat Burglar (Hero — Paint the Town Red)
LAYER: 1
ISSUE: Dead "each other player" handler function never called
FILE: expansionPaintTheTownRed.js:2677
SEVERITY: MEDIUM
```

### LOW (4)

```
CARD: Symbiote Spider-Man - Shadowed Spider (Hero — Paint the Town Red)
LAYER: 1
ISSUE: Inverted plural suffix in log message ("1 Heroes" / "N Hero")
FILE: expansionPaintTheTownRed.js:4628
SEVERITY: LOW
```

```
CARD: koHero function (Paint the Town Red)
LAYER: 2
ISSUE: Dead function with Golden Solo incompatibility (already documented as L1)
FILE: expansionPaintTheTownRed.js:1735
SEVERITY: LOW
```

```
CARD: Mysterio - Blurring Images / Captive Audience (Tactic — Paint the Town Red)
LAYER: 1
ISSUE: .length called on a number instead of comparing the number
FILE: expansionPaintTheTownRed.js:5447, 5464
SEVERITY: LOW
```

```
CARD: Splice Humans with Spider DNA (Scheme — Paint the Town Red)
LAYER: 1
ISSUE: Duplicate specificVillainRequirement property (already documented as L8)
FILE: cardDatabase.js:520,525
SEVERITY: LOW
```

---

## Notes

### Reference file corrections needed
The auditor found several cases where the reference file itself had errors (from misreading card images):
- Captain America "A Day Unlike Any Other" — reference says [Covert] but actual card uses [Avengers]
- Nick Fury "Pure Fury" — reference says "8 [Attack]" but 8 is the cost
- Several cards may have cost/recruit confusion in base values (Gambit, Iron Man)

### Already-known issues confirmed
Several findings overlap with items already tracked in CLAUDE.md Known Issues:
- L1: koHero dead function (Paint the Town Red)
- L6: Morg hardcoded HQ loop (Fantastic Four)
- L8: Splice Humans duplicate property (Paint the Town Red)

### Patterns across expansions
1. **Attack/Recruit swaps** — multiple Dark City cards give the wrong resource type
2. **Wrong condition checks** — cards checking team instead of class (or vice versa) across all expansions
3. **"Each other player" handling** — inconsistent: some skip in solo (correct), some apply to solo player (incorrect)
4. **Completely wrong implementations** — several Dark City cards have fundamentally different logic than card text
