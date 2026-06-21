<!-- INVENTORY STATUS:
  Heroes: ✅
  Villains: ✅
  Masterminds: ✅
  Schemes: ✅
  Henchmen: — (none in expansion)
  Bystanders/Sidekicks: — (none in expansion)
  Last updated: 2026-06-21
-->

# New Mutants — Card Inventory

**Primary source**: Card images in `expansions/new-mutants/` (effect text + card titles) — the actual card art is authoritative for effect text and titles.
**Cross-check**: `expansions/new-mutants/new-mutants-reference.md` (BGG-derived; authoritative for structured fields — copy counts, costs, fight values, VP, class/team). Rules PDF also present: `expansions/new-mutants/2020_Marvel_Legendary_NewMutants_Rules_compressed.pdf`.
**Pass 1 date**: 2026-06-21
**Pass 2 status**: Pending — run `/inventory-verifier` in a fresh session

> **Set composition (per reference):** 100 cards — 5 Heroes (14 cards each, all X-Men team), 2 Masterminds (5 cards each), 2 Villain Groups (8 cards each), 4 Schemes. No henchmen, bystanders, or sidekicks.

---

## New Keywords

- **Moonlight / Sunlight**: A matched pair of conditional ability keywords appearing on some Heroes, Villains, and Masterminds. **Moonlight** abilities work only when **most Heroes in the HQ have odd-numbered costs**; **Sunlight** abilities work only when **most have even-numbered costs**. If odd and even are tied, neither is in effect. Only printed costs matter (cost-changing effects don't alter Moonlight/Sunlight). Check the condition at the moment you would use that ability; resolve a card's abilities in listed order (an earlier ability can shift the HQ to flip the condition for a later ability on the same card). Once you finish a card/fight, later changes don't retroactively apply. (Divided Cards count as one card.)
- **Waking Nightmare**: "Have a Waking Nightmare" means: **discard a non-grey Hero from your hand; if you discard a Hero this way, draw a card.** Used as an attack on sanity (downgrades your hand) and by Mirage to power dream/nightmare constructs.
- **Conflicting Card Abilities** (rules note, not a card keyword): when two effects act on the same card simultaneously, you choose which to apply. E.g. discarding **Empathic Link** to Belasco/Demon Bear — you may use Empathic Link's own set-aside instead of letting it be KO'd/captured (Demon Bear then captures another player's discard). Discarding Empathic Link to a Waking Nightmare and setting it aside still draws you a card for the Nightmare.

---

## Section 1: Structured Data Tables

### Heroes

Standard distribution per hero: 1 Rare (1 copy), 1 Uncommon (3 copies), 2 Commons (5 copies each) = 14 cards total. All heroes are **X-Men** team.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Sunspot | Absorb Radiation | Common A | 5 | 2 | X-Men | Range | 0 | 1 |
| Sunspot | Solar-Powered | Common B | 5 | 4 | X-Men | Strength | 2+ | 0 |
| Sunspot | Thermokinetic Fury | Uncommon | 3 | 6 | X-Men | Range | 4+ | 0 |
| Sunspot | Empyreal Force | Rare | 1 | 8 | X-Men | Strength | 3+ | 0 |
| Wolfsbane | Wolf Out | Common A | 5 | 3 | X-Men | Instinct | 0 | 2 |
| Wolfsbane | Night Vision | Common B | 5 | 3 | X-Men | Strength | 2 | 0 |
| Wolfsbane | Howl at the Moon | Uncommon | 3 | 5 | X-Men | Covert | 3 | 0 |
| Wolfsbane | Nocturnal Savagery | Rare | 1 | 7 | X-Men | Instinct | 4+ | 0 |
| Mirage | Empathic Link | Common A | 5 | 3 | X-Men | Instinct | 0 | 2 |
| Mirage | Dreams Made Real | Common B | 5 | 3 | X-Men | Range | 2 | 0 |
| Mirage | Nightmare Wolves | Uncommon | 3 | 6 | X-Men | Covert | 1+ | 0 |
| Mirage | Haunted By the Demon Bear | Rare | 1 | 7 | X-Men | Covert | 4+ | 0 |
| Warlock | Earthling Choices | Common A | 5 | 2 | X-Men | Tech | 0 | 0 |
| Warlock | Analyze Planetary Rotation | Common B | 5 | 3 | X-Men | Tech | 0+ | 0+ |
| Warlock | Techno-Organic Adaptation | Uncommon | 3 | 6 | X-Men | Covert | 3 | 0 |
| Warlock | Nanite Shapeshifter | Rare | 1 | 7 | X-Men | Tech | 0+ | 0+ |
| Karma | Sow Rivalry | Common A | 5 | 3 | X-Men | Covert | 2+ | 0 |
| Karma | Temporary Possession | Common B | 5 | 4 | X-Men | Covert | 2+ | 0 |
| Karma | Karmic Balance | Uncommon | 3 | 6 | X-Men | Range | 0 | 4 |
| Karma | Control Like a Puppet | Rare | 1 | 8 | X-Men | Range | 5+ | 0 |

**Attack / Recruit notation:** fixed `3`; `0+` = base 0 modified by ability; `[#]+` = base plus conditional bonus; `0` = none of that stat; `—` = N/A; `⚠️` = uncertain. Warlock's "Analyze Planetary Rotation" and "Nanite Shapeshifter" print **dual** base values (both a `0+` Recruit star and a `0+` Attack slash). "Earthling Choices" has no base-value icon (pure effect) → recorded 0/0.

---

### Villains

Standard villain group total: **8 cards**. No henchmen in this expansion.

**Hellions** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Hellions | Catseye | 2 | 3+ | 3 |
| Hellions | Thunderbird | 2 | 4+ | 4 |
| Hellions | Roulette | 1 | 5 | 3 |
| Hellions | Tarot | 1 | 5 | 3 |
| Hellions | Jetstream | 1 | 6 | 4 |
| Hellions | Empath | 1 | 4+ | 4 |

*Moonlight/Sunlight attack buffs (Catseye = Moonlight +2, Thunderbird = Sunlight +2). Empath has an always-on "+1 Attack per grey Hero you have." Waking Nightmare on Tarot and Empath.*

**Demons of Limbo** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Demons of Limbo | Crotus | 2 | 3+ | 3 |
| Demons of Limbo | Witchfire | 2 | 4+ | 4 |
| Demons of Limbo | N'astirh | 2 | 3+ | 3 |
| Demons of Limbo | Demon Bear | 1 | 5+ | 5 |
| Demons of Limbo | S'ym | 1 | 7 | 5 |

*Moonlight/Sunlight buffs (Crotus = Moonlight +4, Witchfire = Sunlight +2, N'astirh = Moonlight +3 plus a Sunlight recruit-cost gate). Witchfire & Demon Bear share the capture → "Fight: chosen player gains that Hero / Escape: KO the captured Hero" pattern. Waking Nightmare on Demon Bear and S'ym. N'astirh count confirmed = 2 (reference "2 copy" is a phrasing typo). Printed names retain apostrophes (N'astirh, S'ym) though filenames drop them.*

---

### Masterminds

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| Belasco, Demon Lord of Limbo | 9+ | 6 | Demons of Limbo |
| Epic Belasco | 10+ | 6 | Demons of Limbo |
| Emma Frost, The White Queen | 8+ | 6 | Hellions |
| Epic Emma Frost | 9+ | 6 | Hellions |

```
Belasco, Demon Lord of Limbo Tactics:
  A Demon's Mercy, Bargain for Souls, Cleaving Demonblade, Rescue from Limbo

Emma Frost, The White Queen Tactics:
  Assume Diamond Form, Contempt for Weaklings, Psychic X-Men Link, Tempting Bargain
```

*Both masterminds have variable attack (`+`): Belasco gains +Attack = non-grey Heroes in KO pile ÷ players (round down); Emma Frost gains +1 Attack (Epic +2) per grey Hero you have. Each tactic shows VP 6 and a Fight value (Belasco tactics 9, Emma Frost tactics 8); tactics have no recruit/attack cost.*

---

### Schemes

| Scheme Name | Twist Count | Bystander Count |
|---|---|---|
| The Demon Bear Saga | 8 | — (not on card; game-mode default) |
| Crash the Moon into the Sun | 11 | — (not on card; game-mode default) |
| Trapped in the Insane Asylum | 1 + 2 per player | — (not on card; game-mode default) |
| Superhuman Baseball Game | 9 | — (not on card; game-mode default) |

*Villain-group directives: **The Demon Bear Saga** requires the Demons of Limbo group (Demon Bear set beside the Scheme). **Superhuman Baseball Game** adds an extra Villain Group. No scheme card prints a bystander count.*

---

## Section 2: Card Effects

---

### Heroes

---

### Sunspot

**Absorb Radiation** (Common A)
- SPECIAL ABILITY: 1 Recruit. **Moonlight:** You may put a Hero from the HQ on the bottom of the Hero Deck. **Sunlight:** Draw a card.
- SUPERPOWER: NA

**Solar-Powered** (Common B)
- SPECIAL ABILITY: 2+ Attack. **Sunlight:** You may put a card from your hand on the bottom of your deck. If you do, you get **+2** Attack.
- SUPERPOWER: NA

**Thermokinetic Fury** (Uncommon)
- SPECIAL ABILITY: 4+ Attack. To play this, you must put a card from your hand on the bottom of your deck.
- SUPERPOWER: [X-MEN] **Sunlight:** You get **+1** Attack for each other X-Men card you played this turn. *(the Sunlight line counts other played X-Men cards; reference shows the X-Men trigger inline)*

**Empyreal Force** (Rare)
- SPECIAL ABILITY: 3+ Attack. Choose any number of Heroes in the HQ. Put them on the bottom of the Hero Deck. **Sunlight:** You get **+1** Attack for each Hero in the HQ with an even-numbered cost.
- SUPERPOWER: NA

### Wolfsbane

**Wolf Out** (Common A)
- SPECIAL ABILITY: 2 Recruit. **Sunlight:** You may put a Hero from the HQ on the bottom of the Hero Deck. **Moonlight:** Draw a card.
- SUPERPOWER: NA

**Night Vision** (Common B)
- SPECIAL ABILITY: 2 Attack. **Moonlight:** Look at the top two cards of your deck. Discard any number of them and put the rest back in any order.
- SUPERPOWER: NA

**Howl at the Moon** (Uncommon)
- SPECIAL ABILITY: 3 Attack. **Moonlight:** Look at the top card of your deck. KO it or put it back.
- SUPERPOWER: NA

**Nocturnal Savagery** (Rare)
- SPECIAL ABILITY: 4+ Attack. Look at the top three cards of your deck. Discard any number of them and put the rest back in any order. **Moonlight:** You get the total printed Attack of all the cards you discarded from your deck this turn.
- SUPERPOWER: NA

### Mirage

**Empathic Link** (Common A)
- SPECIAL ABILITY: 2 Recruit. When a card effect causes you to discard this card, set it aside. At the end of this turn, add it to your hand as an extra card.
- SUPERPOWER: NA

**Dreams Made Real** (Common B)
- SPECIAL ABILITY: 2 Attack. **Moonlight:** You may discard a card. If you do, draw a card.
- SUPERPOWER: NA

**Nightmare Wolves** (Uncommon)
- SPECIAL ABILITY: 1+ Attack. You may have a **Waking Nightmare**. You get **+**Attack equal to the cost of the card you discarded this way.
- SUPERPOWER: NA

**Haunted By the Demon Bear** (Rare)
- SPECIAL ABILITY: 4+ Attack. Whenever a card effect causes you to discard a card from your hand this turn, you get **+2** Attack. **Moonlight:** You may have a **Waking Nightmare**.
- SUPERPOWER: NA

### Warlock

**Earthling Choices** (Common A)
- SPECIAL ABILITY: Look at the top two cards of your deck. Draw one and discard the other.
- SUPERPOWER: NA

**Analyze Planetary Rotation** (Common B)
- SPECIAL ABILITY: 0+ Recruit. 0+ Attack. **Sunlight:** You get **+2** Recruit. **Moonlight:** You get **+2** Attack.
- SUPERPOWER: [TECH]: Instead, you get both.

**Techno-Organic Adaptation** (Uncommon)
- SPECIAL ABILITY: 3 Attack.
- SUPERPOWER: [TECH]: The first time you defeat a Villain this turn, you may KO one of your cards or a card from your discard pile.

**Nanite Shapeshifter** (Rare)
- SPECIAL ABILITY: 0+ Recruit. 0+ Attack. **Sunlight:** Draw 3 cards. **Moonlight:** You get **+3** Recruit and **+3** Attack.
- SUPERPOWER: [X-MEN][X-MEN][X-MEN][X-MEN]: Instead, you get both.

### Karma

**Sow Rivalry** (Common A)
- SPECIAL ABILITY: 2+ Attack.
- SUPERPOWER: [COVERT]: Choose a Villain. You get **+1** Attack for each Villain adjacent to it.

**Temporary Possession** (Common B)
- SPECIAL ABILITY: 2+ Attack. Guess a color. Then reveal the top card of the Hero Deck and put it back on the top or bottom of that deck. If you guessed right, you get **+2** Attack.
- SUPERPOWER: NA

**Karmic Balance** (Uncommon)
- SPECIAL ABILITY: 4 Recruit. Reveal the top card of the Hero Deck. You may recruit it this turn. If you do, you may KO one of your cards or a card from your discard pile.
- SUPERPOWER: NA

**Control Like a Puppet** (Rare)
- SPECIAL ABILITY: 5+ Attack.
- SUPERPOWER: [COVERT] ⚠️: Choose a Villain in the city. You get **+**Attack equal to its VP, usable only against other Villains or the Mastermind. *(⚠️ card art shows the Covert rotation icon; the BGG reference lists this trigger as "X-Men". Image-primary → recorded [COVERT]; confirm in Pass 2.)*

---

### Villains

---

### Hellions

**Catseye** (×2)
Moonlight: Catseye gets **+2** Attack.
Fight: KO one of your Heroes.
Attack: 3+ | VP: 3

**Thunderbird** (×2)
Sunlight: Thunderbird gets **+2** Attack.
Fight: KO one of your Heroes.
Attack: 4+ | VP: 4

**Roulette** (×1)
Ambush: Reveal the top card of the Hero Deck. If it's [TECH], each player gains a Wound. If it's [COVERT], you draw a card.
Fight: Same effect.
Escape: Same effect.
Attack: 5 | VP: 3

**Tarot** (×1)
Ambush: Reveal the top card of the Villain Deck. If it's a...
  Bystander: Rescue it.
  Scheme Twist: Play it.
  Master Strike: Each player gains a Wound.
  Villain: Each player has a **Waking Nightmare**.
Attack: 5 | VP: 3

**Jetstream** (×1)
Ambush: *(After this enters the Sewers)* Put Jetstream on the Bridge. If there's another Villain there, swap them.
Escape: Each player discards an X-Men Hero or gains a Wound.
Attack: 6 | VP: 4

**Empath** (×1)
During your turn, Empath gets **+1** Attack for each grey Hero you have.
Ambush: Each player reveals a [COVERT] Hero or has a **Waking Nightmare**.
Escape: Same effect.
Attack: 4+ | VP: 4

### Demons of Limbo

**Crotus** (×2)
Ambush: Crotus captures a Bystander. Put an even-numbered Hero on the bottom of the Hero Deck.
Moonlight: Crotus gets **+4** Attack.
Attack: 3+ | VP: 3

**Witchfire** (×2)
Ambush: Witchfire captures a Hero from the HQ with the lowest odd-numbered cost.
Sunlight: Witchfire gets **+2** Attack.
Fight: The player of your choice gains that Hero.
Escape: KO the captured Hero.
Attack: 4+ | VP: 4

**N'astirh** (×2)
Sunlight: To fight N'astirh, you must also spend 3 Recruit.
Moonlight: N'astirh gets **+3** Attack.
Fight: KO one of your Heroes.
Attack: 3+ | VP: 3

**Demon Bear** (×1)
Ambush: Each player has a **Waking Nightmare**. The Demon Bear captures one of the Heroes discarded this way that has the lowest cost. The Demon Bear gets **+**Attack equal to that Hero's cost.
Fight: The player of your choice gains that Hero.
Escape: KO the captured Hero.
Attack: 5+ | VP: 5

**S'ym** (×1)
Ambush: Sunlight: Each player reveals a [STRENGTH] Hero or gains a Wound. Moonlight: Each player has a **Waking Nightmare**.
Escape: Same effect.
Attack: 7 | VP: 5

---

### Masterminds

---

### Belasco, Demon Lord of Limbo

**Belasco, Demon Lord of Limbo** (Normal)
Belasco gets **+**Attack equal to the number of non-grey Heroes in the KO pile, divided by the number of players *(round down)*.
Always Leads: Demons of Limbo
Master Strike: Sunlight: Each player KOs a non-grey Hero from their discard pile. Moonlight: Each player has a **Waking Nightmare**. KO Heroes discarded this way.
Attack: 9+ | VP: 6

**Epic Belasco**
Belasco gets **+**Attack equal to the number of non-grey Heroes in the KO pile, divided by the number of players *(round down)*.
Always Leads: Demons of Limbo
Master Strike: Sunlight: Each player KOs two non-grey Heroes from their discard pile. Moonlight: Each player has two **Waking Nightmares**. KO Heroes discarded this way.
Attack: 10+ | VP: 6

**A Demon's Mercy** (Tactic)
Fight: Each other player KOs a non-grey Hero from their hand or discard pile.

**Bargain for Souls** (Tactic)
Fight: Reveal cards from the Hero Deck equal to the number of players. Gain one of them and KO the rest.

**Cleaving Demonblade** (Tactic)
Fight: Each player chooses a different card in the HQ. Then KO all chosen cards.

**Rescue from Limbo** (Tactic)
Fight: You may KO one of your non-grey Heroes or a non-grey Hero from your discard pile. If you do, gain a Hero from the KO pile.

---

### Emma Frost, The White Queen

**Emma Frost, The White Queen** (Normal)
During your turn, Emma Frost gets **+1** Attack for each grey Hero you have.
Always Leads: Hellions
Master Strike: Stack this Strike next to Emma Frost. Then each player has a **Waking Nightmare** for each Strike stacked here.
Attack: 8+ | VP: 6

**Epic Emma Frost**
During your turn, Emma Frost gets **+2** Attack for each grey Hero you have.
Always Leads: Hellions
Master Strike: Stack this Strike next to Emma Frost. Then each player has a **Waking Nightmare** for each Strike stacked here, then one more **Waking Nightmare**.
Attack: 9+ | VP: 6

**Assume Diamond Form** (Tactic)
Fight: Emma Frost cannot be fought again until the start of your next turn.

**Contempt for Weaklings** (Tactic)
Fight: Put a 0-cost Hero from the KO pile on top of each other player's deck.

**Psychic X-Men Link** (Tactic)
Fight: Each other player has a **Waking Nightmare**. Each of those players who did not discard an X-Men Hero this way gains a Wound.

**Tempting Bargain** (Tactic)
Fight: You may play the top card of the Villain Deck. If you do, you get **+5** Recruit.

---

### Schemes

---

**The Demon Bear Saga**
Setup: 8 Twists. Include Demons of Limbo as one of the Villain Groups. Put the Demon Bear Villain from that group next to the Scheme.
Special Rules: Whenever the Demon Bear escapes, stack a Twist next to the Scheme as a "Dream Horror."
Twist: If the Demon Bear is in the city, it escapes. Otherwise, the Demon Bear enters the city from wherever it is. If it was in a player's Victory Pile, that player rescues 4 Bystanders.
Evil Wins: When there are 3 Dream Horrors.

**Crash the Moon into the Sun**
Setup: 11 Twists.
Twist 1, 3, 5, 7: Moonlight: Stack this Twist next to the Scheme as an "Altered Orbit."
Twist 2, 4, 6, 8: Sunlight: Same effect.
Twist 9, 10, 11: Same effect.
Evil Wins: When there are 4 Altered Orbits.

**Trapped in the Insane Asylum**
Setup: 1 Twist, plus 2 Twists per player.
Special Rules: On each of your turns, before you play other cards from your hand, you must play two randomly-selected cards from your hand for each Psychotic Break you have.
Twist: You face a "Sanity Test": Either keep this Twist in front of you as a "Psychotic Break", or discard a card and pass this Twist to the player on your left and that player faces a Sanity Test.
Evil Wins: When a player has 3 Psychotic Breaks.

**Superhuman Baseball Game**
Setup: 9 Twists. Add an extra Villain Group.
Special Rules: The Bank and the Streets do not exist. Put the Villain Deck under the HQ as "Home Plate." The Sewers, Rooftops, and Bridge are First, Second, and Third Base.
Twist: Play the top card of the Villain Deck. If it's a Bystander, rescue that "Cheering Fan." If it's a Master Strike, then after it resolves, any Villain on Third Base "Steals Home" and Escapes. If it's a Villain, it "Hits a Double," pushes to Second Base *(the Rooftops)* and you play the top card from the Villain Deck.
Evil Wins: When Evil has 4 "runs" *(Villains in the Escape Pile)* per player.

---

## Pass 1 Flags Summary (for Pass 2 / Pass 3)

1. **⚠️ Karma — Control Like a Puppet superpower trigger:** card art shows the **Covert** rotation icon; BGG reference text says "X-Men". Recorded [COVERT] (image-primary). Confirm against physical card in Pass 2/3 — this changes which class enables the bonus.
2. **Warlock Rare title (RESOLVED, no action):** filename `XanticShapeshifter` is wrong — printed title is **Nanite Shapeshifter** (matches reference).
3. **Emma Frost tactic title (RESOLVED, no action):** printed title is **Contempt for Weaklings** (filename agrees; reference's "Contempt for Weakness" was wrong).
4. **Warlock dual base values:** "Analyze Planetary Rotation" and "Nanite Shapeshifter" print BOTH a `0+` Recruit and `0+` Attack base — confirm the DB models a dual-resource base.
5. **Scheme cards correct reference typos:** "that group" (not "groups"), "the player on your left" (not "PLayer"), "The Bank and the Streets" (not "nd"). Card text recorded.
6. **Scheme bystander counts** not printed on cards; left `—` (game-mode default).
7. **Class terminology:** "Ranged" recorded as **Range** per DB convention. All heroes are X-Men team.
8. **Moonlight/Sunlight is an HQ odd/even-cost mechanic** (not a class trigger) — new engine mechanic; Moonlight/Sunlight lines are part of SPECIAL ABILITY text, not superpower triggers.
