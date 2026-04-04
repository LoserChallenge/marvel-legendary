# Revelations — Card Inventory (Pass 1)

**Primary source**: `expansions/revelations/revelations-inventory.pdf`
**Cross-check**: Card images in `expansions/revelations/` (all 36 hero cards verified against images; villain/mastermind spot-checked)
**Pass 1 date**: 2026-04-02
**Pass 2 status**: Pending — run `/inventory-verifier` in a fresh session

---

## New Keywords (from PDF)

- **Hyperspeed N**: Reveal the top N cards of your deck. Get +1 Attack for each card with an Attack icon revealed. Discard all those cards. Some variants say "for Recruit" (count Recruit icons) or "for Recruit and Attack" (count both separately).
- **Dark Memories**: Gets +1 Attack for each Hero Class (Strength, Instinct, Covert, Tech, Ranged) among cards in your discard pile. Max +5. Grey cards don't count. When on a Hero card: you get +1 Attack per Hero Class in your discard pile. "Double Dark Memories" = double the bonus.
- **Last Stand**: Gets +1 Attack for each empty city space. When on a Hero card: you get +1 Attack per empty space. "Double Last Stand" = double the bonus.
- **Location**: New card type. Placed above city spaces; doesn't move with Villains. Fight by spending listed Attack. Each Mastermind has at least one Tactic that can become a Location when fought. In 1-player solo: "each other player" effects apply to yourself.

---

## Section 1: Structured Data Tables

### Heroes

Standard distribution per hero: 1 Rare (1 copy), 1 Uncommon (3 copies), 2 Commons (5 copies each) = 14 cards total.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Captain Marvel, Agent of S.H.I.E.L.D. | The Sword of S.H.I.E.L.D. | Common A | 5 | 3 | S.H.I.E.L.D. | Strength | 0 | 2 |
| Captain Marvel, Agent of S.H.I.E.L.D. | Radiant Blast | Common B | 5 | 4 | S.H.I.E.L.D. | Ranged | 2+ | 0 |
| Captain Marvel, Agent of S.H.I.E.L.D. | Dominate the Battlefield | Uncommon | 3 | 6 | S.H.I.E.L.D. | Ranged | 2+ | 0 |
| Captain Marvel, Agent of S.H.I.E.L.D. | Higher, Further, Faster | Rare | 1 | 7 | S.H.I.E.L.D. | Strength | 0+ | 0 |
| Darkhawk | Balance the Darkforce | Common A | 5 | 3 | Avengers | Tech | 1 | 1 |
| Darkhawk | Hawk Dive | Common B | 5 | 4 | Avengers | Covert | 0+ | 0+ |
| Darkhawk | Travel to Nullspace | Uncommon | 3 | 6 | Avengers | Tech | 0+ | 0+ |
| Darkhawk | Warflight | Rare | 1 | 7 | Avengers | Tech | 0+ | 0+ |
| Hellcat | Catlike Agility | Common A | 5 | 2 | Avengers | Instinct | 1+ | 0 |
| Hellcat | Part-Time PI | Common B | 5 | 3 | Avengers | Instinct | 0 | 2+ |
| Hellcat | Demon Sight | Uncommon | 3 | 5 | Avengers | Covert | 2+ | 0 |
| Hellcat | Second Chance at Life | Rare | 1 | 8 | Avengers | Instinct | 6 | 0 |
| Photon | Infrared Conversation | Common A | 5 | 3 | Avengers | Ranged | 0 | 0 |
| Photon | Ultraviolet Radiation | Common B | 5 | 4 | Avengers | Ranged | 3+ | 0 |
| Photon | Light the Way | Uncommon | 3 | 6 | Avengers | Covert | 3+ | 0 |
| Photon | Coruscating Vengeance | Rare | 1 | 8 | Avengers | Ranged | 6+ | 0 |
| Quicksilver | Too Fast to See | Common A | 5 | 3 | Avengers | Instinct | 0+ | 0+ |
| Quicksilver | Perpetual Motion | Common B | 5 | 4 | Avengers | Strength | 2+ | 0 |
| Quicksilver | Jittery Impatience | Uncommon | 3 | 6 | Avengers | Instinct | 2 | 2 |
| Quicksilver | Around the World Punch | Rare | 1 | 8 | Avengers | Strength | 0+ | 0 |
| Ronin | Mysterious Identity | Common A | 5 | 3 | Avengers | Covert | 2 | 0 |
| Ronin | Storm of Arrows | Common B | 5 | 4 | Avengers | Ranged | 0+ | 0 |
| Ronin | Haunted by Loss | Uncommon | 3 | 5 | Avengers | Instinct | 2+ | 0 |
| Ronin | Brooding Fury | Rare | 1 | 7 | Avengers | Strength | 3+ | 0 |
| Scarlet Witch | Hex Bolt | Common A | 5 | 2 | Avengers | Ranged | 1 | 0 |
| Scarlet Witch | Alter Reality | Common B | 5 | 3 | Avengers | Covert | 0+ | 2 |
| Scarlet Witch | Chaos Magic | Uncommon | 3 | 4 | Avengers | Covert | 0 | 0 |
| Scarlet Witch | Warp Time and Space | Rare | 1 | 7 | Avengers | Covert | 0+ | 0 |
| Speed | Accelerate | Common A | 5 | 2 | Avengers | Instinct | 0+ | 0 |
| Speed | Speedy Delivery | Common B | 5 | 4 | Avengers | Instinct | 1 | 2 |
| Speed | Race to the Rescue | Uncommon | 3 | 5 | Avengers | Covert | 3 | 0 |
| Speed | Break the Sound Barrier | Rare | 1 | 8 | Avengers | Covert | 0+ | 0 |
| War Machine | Simulated Target Practice | Common A | 5 | 3 | Avengers | Tech | 2 | 0 |
| War Machine | Military-Industrial Complex | Common B | 5 | 4 | Avengers | Tech | 2 | 0+ |
| War Machine | Hypersonic Cannon | Uncommon | 3 | 5 | Avengers | Ranged | 0+ | 0 |
| War Machine | Overwhelming Firepower | Rare | 1 | 8 | Avengers | Tech | 5 | 0 |

---

### Villains

All villain groups: 8 cards total. "(Location)" = Location card type. Attack "+" = scales with a keyword or bonus; see effects section. "*" = special fight condition.

**Army of Evil** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Army of Evil | Blackout | 2 | 4 | 2 |
| Army of Evil | Count Nefaria | 1 | 7 | 5 |
| Army of Evil | Dome of Darkforce (Location) | 1 | 7 | 5 |
| Army of Evil | Klaw | 2 | 5 | 3 |
| Army of Evil | Mister Hyde | 2 | 6* | 4 |

⚠️ Mister Hyde 6* = spend Recruit instead of Attack when card is in Bank or Streets (as "Dr. Calvin Zabo").

**Dark Avengers** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Dark Avengers | Ares | 1 | 6+ | 6 |
| Dark Avengers | Captain Marvel (Noh-Varr) | 1 | 3+ | 3 |
| Dark Avengers | Dark Hawkeye (Bullseye) | 1 | 4+ | 4 |
| Dark Avengers | Dark Ms. Marvel (Moonstone) | 1 | 4+ | 4 |
| Dark Avengers | Dark Spider-Man (Scorpion) | 1 | 2+ | 2 |
| Dark Avengers | Dark Wolverine (Daken) | 1 | 5+ | 5 |
| Dark Avengers | Sentry | 1 | 7+ | 5 |
| Dark Avengers | Sentry's Watchtower (Location) | 1 | 8 | 5 |

All non-Location Dark Avengers have Last Stand (except Sentry — see effects). "+" = Last Stand bonus.

**Hood's Gang** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Hood's Gang | Cancer | 2 | 3+ | 2 |
| Hood's Gang | Chemistro | 2 | 4+ | 3 |
| Hood's Gang | Madam Masque | 2 | 5+ | 4 |
| Hood's Gang | The Brothers Grimm | 1 | 2* | 2 |
| Hood's Gang | The Dark Dimension (Location) | 1 | 9 | 5 |

Cancer/Chemistro/Madam Masque have Dark Memories — "+" = Dark Memories bonus. The Brothers Grimm 2* = must also discard two identical cards to fight.

**Lethal Legion** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Lethal Legion | Carnival of Wonders (Location) | 1 | 5 | 3 |
| Lethal Legion | Laser Maze (Location) | 1 | 7 | 5 |
| Lethal Legion | Living Laser | 1 | 6+ | 5 |
| Lethal Legion | M'Baku | 1 | 5+ | 4 |
| Lethal Legion | Power Man (Erik Josten) | 1 | 5+ | 4 |
| Lethal Legion | Swordsman | 1 | 4+ | 3 |
| Lethal Legion | "The Raft" Prison (Location) | 1 | 6 | 4 |
| Lethal Legion | White Gorilla Cult (Location) | 1 | 6 | 4 |

Living Laser/M'Baku/Power Man/Swordsman "+" = +3 bonus when a named Location type is in city. Locations have fixed values.

---

### Masterminds

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| Grim Reaper | 8+ | 6 | Lethal Legion |
| Mandarin | 16* | 6 | Mandarin's Rings |
| The Hood | 9+ | 6 | Hood's Gang |

Each mastermind has Normal and Epic versions sharing the same 4 tactics.

```
Grim Reaper Tactics (all 4 → Location when fought):
  Carnival of Concussions, Cult of Skulls, Maze of Bones, Prison of Coffins

Mandarin Tactics (Dragon of Heaven Spaceship → Location when fought):
  Circles Unbroken, Dragon of Heaven Spaceship, Intertwining Powers, Rings Seek Their True Hand

The Hood Tactics (The Hood's Warehouse → Location when fought):
  Demonic Revelation, Focus Magic Through Guns, Paean to Dormammu, The Hood's Warehouse
```

---

### Schemes

All 4 schemes are double-sided Transforming Schemes. Start with Side A face-up. Flip when told to "Transform this Scheme."

| Scheme (Side A) | Scheme (Side B) | Side A Twist Count |
|---|---|---|
| Earthquake Drains the Ocean | Tsunami Crushes the Coast | 11 |
| House of M | "No More Mutants" | 8 |
| Secret HYDRA Corruption | Open HYDRA Revolution | 7 / 9 / 11 (player count) |
| The Korvac Saga | Korvac Revealed | 8 |

Secret HYDRA Corruption also uses a 30-card S.H.I.E.L.D. Officer stack.

---

### Henchmen

**HYDRA Base** — Henchman Location (unique combined type)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| HYDRA Base | HYDRA Base | 10 | 2+ | 1 |

Gets +2 Attack while a Villain is in the same city space (base 2, active 4+).

**Mandarin's Rings** — 10 unique named rings, 1 copy each, all Fight Value 3, VP 1

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Mandarin's Rings | Daimonic, The White Light | 1 | 3 | 1 |
| Mandarin's Rings | Incandescence, The Flame Blast | 1 | 3 | 1 |
| Mandarin's Rings | Influence, The Impact Beam | 1 | 3 | 1 |
| Mandarin's Rings | Liar, The Mento-Intensifier | 1 | 3 | 1 |
| Mandarin's Rings | Lightning, The Electro-Blast | 1 | 3 | 1 |
| Mandarin's Rings | Nightbringer, The Black Light | 1 | 3 | 1 |
| Mandarin's Rings | Remaker, The Matter Rearranger | 1 | 3 | 1 |
| Mandarin's Rings | Spectral, The Disintegration Beam | 1 | 3 | 1 |
| Mandarin's Rings | Spin, The Vortex Beam | 1 | 3 | 1 |
| Mandarin's Rings | Zero, The Ice Blast | 1 | 3 | 1 |

---

### Bystanders

| Card Name | Count | VP |
|---|---|---|
| Dog Show Judge | 1 | 1 |
| Lawyer | 1 | 1 |
| Rocket Test Pilot | 1 | 1 |

---

## Section 2: Card Effects

---

### Heroes

---

### Captain Marvel, Agent of S.H.I.E.L.D.

**The Sword of S.H.I.E.L.D.** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [S.H.I.E.L.D.][S.H.I.E.L.D.][S.H.I.E.L.D.][S.H.I.E.L.D.]: Draw a card.

**Radiant Blast** (Common B)
- SPECIAL ABILITY: If you drew any extra cards this turn, you get +1 Attack.
- SUPERPOWER: NA

**Dominate the Battlefield** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [RANGED]: Last Stand.

**Higher, Further, Faster** (Rare)
- SPECIAL ABILITY: Choose one: Draw three cards or Last Stand.
- SUPERPOWER: [STRENGTH][STRENGTH]: Instead, do both.

---

### Darkhawk

**Balance the Darkforce** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [TECH]: Draw a card.

**Hawk Dive** (Common B)
- SPECIAL ABILITY: Choose Recruit or Attack. Then Hyperspeed 4 for that icon.
- SUPERPOWER: NA

**Travel to Nullspace** (Uncommon)
- SPECIAL ABILITY: If the most recent Hero you played this turn has a Recruit icon, you get +3 Recruit. If it has an Attack icon, you get +3 Attack. (If both, you get both.)
- SUPERPOWER: NA

**Warflight** (Rare)
- SPECIAL ABILITY: Whenever you Hyperspeed this turn, you get both Recruit from Recruit icons and Attack from Attack icons. Hyperspeed 7.
- SUPERPOWER: [TECH][TECH]: Instead, Hyperspeed 9.

---

### Hellcat

**Catlike Agility** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [INSTINCT]: Choose one — Draw a card or you get +1 Attack.

**Part-Time PI** (Common B)
- SPECIAL ABILITY: Reveal the top card of any deck. If it's not a Scheme Twist, you may put it on the bottom of that deck.
- SUPERPOWER: [INSTINCT]: Choose one — Draw a card or you get +1 Recruit.

**Demon Sight** (Uncommon)
- SPECIAL ABILITY: Guess Villain, Bystander, Strike, or Twist. Then reveal the top card of the Villain Deck. If you guessed right, you get +2 Attack.
- SUPERPOWER: [AVENGERS]: If it was a Villain, you may fight it this turn.

**Second Chance at Life** (Rare)
- SPECIAL ABILITY: If a Master Strike or Scheme Twist would occur, you may discard this card from your hand instead. If you do, draw three cards, then shuffle that Strike or Twist back into the Villain Deck.
- SUPERPOWER: NA

---

### Photon

**Infrared Conversation** (Common A)
- SPECIAL ABILITY: To play this, you must discard a card. Draw two cards.
- SUPERPOWER: NA

**Ultraviolet Radiation** (Common B)
- SPECIAL ABILITY: To play this, you must discard a card.
- SUPERPOWER: [RANGED]: Hyperspeed 3.

**Light the Way** (Uncommon)
- SPECIAL ABILITY: You get +1 Attack for each card you discarded from your hand this turn.
- SUPERPOWER: NA

**Coruscating Vengeance** (Rare)
- SPECIAL ABILITY: NA
- SUPERPOWER: [AVENGERS][AVENGERS]: Last Stand.

---

### Quicksilver

**Too Fast to See** (Common A)
- SPECIAL ABILITY: Hyperspeed 3 for Recruit.
- SUPERPOWER: [INSTINCT]: Instead, Hyperspeed 3 for Recruit and Attack.

**Perpetual Motion** (Common B)
- SPECIAL ABILITY: NA
- SUPERPOWER: [STRENGTH]: Hyperspeed 4.

**Jittery Impatience** (Uncommon)
- SPECIAL ABILITY: Look at the top card of your deck. Discard it or put it back.
- SUPERPOWER: [INSTINCT]: You may KO the card you discarded this way.

**Around the World Punch** (Rare)
- SPECIAL ABILITY: Hyperspeed your entire remaining deck. (Don't reshuffle.)
- SUPERPOWER: [AVENGERS][AVENGERS][AVENGERS][AVENGERS]: Before you do that, put your discard pile on top of your deck.

---

### Ronin

**Mysterious Identity** (Common A)
- SPECIAL ABILITY: As you play this card, you may choose a color and/or a team icon. This card is that color and team icon this turn. (instead of Covert and Avengers)
- SUPERPOWER: NA

**Storm of Arrows** (Common B)
- SPECIAL ABILITY: Hyperspeed 4.
- SUPERPOWER: [RANGED]: Draw a card.

**Haunted by Loss** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [INSTINCT]: Dark Memories.

**Brooding Fury** (Rare)
- SPECIAL ABILITY: Dark Memories.
- SUPERPOWER: [STRENGTH]: Dark Memories again.

---

### Scarlet Witch

**Hex Bolt** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [RANGED]: Discard the top card of any player's deck. You may play a copy of that card this turn.

**Alter Reality** (Common B)
- SPECIAL ABILITY: Reveal the top card of your deck. Discard it or put it back.
- SUPERPOWER: [COVERT]: Dark Memories.

**Chaos Magic** (Uncommon)
- SPECIAL ABILITY: Reveal the top card of the Hero Deck. You may play a copy of that card this turn. When you do, put that card on the bottom of the Hero Deck.
- SUPERPOWER: NA

**Warp Time and Space** (Rare)
- SPECIAL ABILITY: Reveal the top three cards of the Hero Deck. Put one of them in your hand. Put the rest on the top or bottom of the Hero Deck in any order.
- SUPERPOWER: [AVENGERS][AVENGERS][AVENGERS]: Dark Memories.

---

### Speed

**Accelerate** (Common A)
- SPECIAL ABILITY: Hyperspeed 2.
- SUPERPOWER: [INSTINCT]: Instead, Hyperspeed 6.

**Speedy Delivery** (Common B)
- SPECIAL ABILITY: The next Hero you recruit this turn goes on top of your deck.
- SUPERPOWER: NA

**Race to the Rescue** (Uncommon)
- SPECIAL ABILITY: Choose a Hero Class. (Strength, Instinct, Covert, Tech, or Ranged.) Reveal the top card of your deck. If it's the Hero Class you named, draw it. Otherwise, put it back on the top or bottom.
- SUPERPOWER: NA

**Break the Sound Barrier** (Rare)
- SPECIAL ABILITY: Look at the top six cards of your deck, draw two of them, and put the rest back on the top or bottom in any order.
- SUPERPOWER: [COVERT]: Hyperspeed 6.

---

### War Machine

**Simulated Target Practice** (Common A)
- SPECIAL ABILITY: NA
- SUPERPOWER: [TECH]: You may fight a Henchman from your Victory Pile this turn. If you do, KO it and rescue a Bystander. (Do that Henchman's Fight effect too.)

**Military-Industrial Complex** (Common B)
- SPECIAL ABILITY: Whenever you defeat a Villain this turn, you get +1 Recruit.
- SUPERPOWER: NA

**Hypersonic Cannon** (Uncommon)
- SPECIAL ABILITY: Hyperspeed 5.
- SUPERPOWER: [RANGED]: You may KO a card from your discard pile.

**Overwhelming Firepower** (Rare)
- SPECIAL ABILITY: Whenever you defeat a Villain or Mastermind this turn, draw a card and rescue a Bystander.
- SUPERPOWER: NA

---

### Villains

---

### Army of Evil

**Blackout** (×2)
Ambush: Each player reveals a [RANGED] Hero or discards a card.
Fight: Draw two cards.
Attack: 4 | VP: 2

**Count Nefaria** (×1)
Ambush: All players reveal their hands. Unless all those revealed cards together include [STRENGTH], [INSTINCT], [COVERT], [TECH], and [RANGED] Heroes, each player gains a Wound.
Escape: Same Effect.
Attack: 7 | VP: 5

**Dome of Darkforce** (×1) — Location
Whenever you fight a Villain here, each other player reveals a [RANGED] Hero or discards a card.
Fight: Draw two cards.
Attack: 7 | VP: 5

**Klaw** (×2)
Ambush: Klaw captures a [TECH] or [RANGED] Hero that costs 5 or less from the HQ.
Fight: Gain that Hero.
Attack: 5 | VP: 3

**Mister Hyde** (×2)
While in the Bank or Streets, this card's name is "Dr. Calvin Zabo", and you must spend Recruit to fight him instead of Attack.
Fight: KO one of your Heroes.
Attack: 6* | VP: 4

---

### Dark Avengers

**Ares** (×1)
Last Stand.
Fight: KO one of your Heroes.
Attack: 6+ | VP: 6

**Captain Marvel (Noh-Varr)** (×1)
Last Stand.
Ambush: If any other Dark Avengers are in the city, each player gains a Wound.
Escape: Same effect.
Attack: 3+ | VP: 3

**Dark Hawkeye (Bullseye)** (×1)
Last Stand.
Fight: KO one of your Heroes. Then choose one:
— Each other player KOs one of their Heroes.
— Each other player gains a 0-cost Hero from the KO pile.
Attack: 4+ | VP: 4

**Dark Ms. Marvel (Moonstone)** (×1)
Last Stand.
Fight: Each other player discards two cards then draws a card.
Attack: 4+ | VP: 4

**Dark Spider-Man (Scorpion)** (×1)
Double Last Stand.
Fight: Reveal the top two cards of your deck. KO one of them that costs 2 or less. Put the rest back in any order.
Attack: 2+ | VP: 2

**Dark Wolverine (Daken)** (×1)
Last Stand.
Ambush: Each player reveals an [INSTINCT] Hero or gains a Wound.
Escape: Same effect, then shuffle Dark Wolverine back into the Villain Deck.
Attack: 5+ | VP: 5

**Sentry** (×1)
While in the Bank or Streets, this card's name is "The Void", it gets +5 Attack, and it gets "Fight: KO up to two cards from your discard pile."
Escape: Each player gains a Wound.
Attack: 7+ | VP: 5

**Sentry's Watchtower** (×1) — Location
Villains here get Last Stand. (Villains who already have it get the bonus again.)
Fight: You gain the Hero in the HQ space under this.
Attack: 8 | VP: 5

---

### Hood's Gang

**Cancer** (×2)
Dark Memories.
Ambush: Each player that has any cards in their discard pile gains a Wound.
Escape: Same effect.
Attack: 3+ | VP: 2

**Chemistro** (×2)
Dark Memories.
Fight: Exchange a card you played this turn with a card in the HQ that has the same or lower cost. (The card you gained goes to your discard pile.)
Attack: 4+ | VP: 3

**Madam Masque** (×2)
Dark Memories.
Ambush: Guess Villain, Bystander, Strike, or Twist. Then reveal the top card of the Villain Deck. If you guessed wrong, play that card.
Fight: KO one of your Heroes.
Attack: 5+ | VP: 4

**The Brothers Grimm** (×1)
To fight The Brothers Grimm, you must also discard two identical cards.
Fight: You may KO a card from your discard pile.
Attack: 2* | VP: 2

**The Dark Dimension** (×1) — Location
Villains here get Dark Memories. (Villains who already have it get the bonus again.)
Fight: Take another turn after this one.
Attack: 9 | VP: 5

---

### Lethal Legion

**Carnival of Wonders** (×1) — Location
Whenever you fight a Villain here, each other player chooses a Bystander from their Victory Pile to be captured by Carnival of Wonders.
Attack: 5 | VP: 3

**Laser Maze** (×1) — Location
Whenever you fight a Villain here, each other player reveals a [RANGED] Hero or gains a Wound.
Attack: 7 | VP: 5

**Living Laser** (×1)
Living Laser gets +3 Attack while there's a "Maze" Location in the city.
Fight: Each player reveals a [RANGED] Hero or gains a Wound.
Escape: Same effect.
Attack: 6+ | VP: 5

**M'Baku** (×1)
M'Baku gets +3 Attack while there's a "Cult" Location in the city.
Fight: Each player reveals their hand and discards a [TECH] card.
Escape: Same effect.
Attack: 5+ | VP: 4

**Power Man (Erik Josten)** (×1)
Power Man gets +3 Attack while there's a "Prison" Location in the city.
Escape: Each player puts a Villain from their Victory Pile into the Escape Pile or gains a Wound.
Attack: 5+ | VP: 4

**Swordsman** (×1)
Swordsman gets +3 Attack while there's a "Carnival" Location in the city.
Ambush: Swordsman and each Location in the city each capture a Bystander.
Attack: 4+ | VP: 3

**"The Raft" Prison** (×1) — Location
Whenever you fight a Villain here, each other player puts a Villain from their Victory Pile into the Escape Pile or gains a Wound.
Attack: 6 | VP: 4

**White Gorilla Cult** (×1) — Location
Whenever you fight a Villain here, each other player reveals their hand and discards a [TECH] card.
Attack: 6 | VP: 4

---

### Masterminds

---

### Grim Reaper

**Grim Reaper** (Normal)
Grim Reaper gets +1 Attack for each Location card in the city.
Always Leads: Lethal Legion
Master Strike: This Strike enters the city as a 7 Attack "Graveyard" Location that says "This gets +2 Attack while there's a Villain here." It's worth 5VP.
Attack: 8+ | VP: 6

**Epic Grim Reaper**
Grim Reaper gets +2 Attack for each Location card in the city.
Always Leads: Lethal Legion
Master Strike: This Strike enters the city as an 8 Attack "Graveyard" Location that says "This gets +3 Attack while there's a Villain here." It's worth 6VP. Then, if there are at least three Location cards in the city, each player gains a Wound.
Attack: 9+ | VP: 6

**Carnival of Concussions** (Tactic → Location)
Fight: If this was not already a Location, draw three cards, and this card enters the city as a Location with this ability:
  Whenever you fight a Villain here, each other player KOs a Bystander from their Victory Pile.

**Cult of Skulls** (Tactic → Location)
Fight: If this was not already a Location, KO up to two cards from your discard pile, and this card enters the city as a Location with this ability:
  Whenever you fight a Villain here, each other player reveals their hand and discards a non-grey card.

**Maze of Bones** (Tactic → Location)
Fight: If this was not already a Location, look at the top four cards of your deck, KO any number of them, and put the rest back in any order. Then this card enters the city as a Location with this ability:
  Whenever you fight a Villain here, each other player gains a Wound.

**Prison of Coffins** (Tactic → Location)
Fight: If this was not already a Location, you get +5 Recruit, and this card enters the city as a Location with this ability:
  Whenever you fight a Villain here, each other player puts a Villain from their Victory Pile into the Escape Pile.

---

### Mandarin

**Mandarin** (Normal)
All Mandarin's Rings get +1 Attack.
Mandarin gets -1 Attack for each Mandarin's Ring among all players' Victory Piles. (-3 Attack for each in solo.)
Always Leads: Mandarin's Rings
Master Strike: Each player chooses a Mandarin's Ring from their Victory Pile to enter the city. Any player who didn't have a Ring gains a Wound instead.
Attack: 16* | VP: 6

**Epic Mandarin**
All Mandarin's Rings get +2 Attack.
Mandarin gets -2 Attack for each Mandarin's Ring among all players' Victory Piles. (-6 Attack for each in solo.)
Always Leads: Mandarin's Rings
Master Strike: Each player chooses a Mandarin's Ring from their Victory Pile to enter the city. Any player who didn't have a Ring gains a Wound to the top of their deck instead.
Attack: 26* | VP: 6

**Circles Unbroken** (Tactic)
Fight: Draw a card for each Mandarin's Ring in your Victory Pile.

**Dragon of Heaven Spaceship** (Tactic → Location)
*As Tactic:*
Fight: If this was not already a Location, KO up to two of your Heroes, and this card enters the city as a Location with this ability:
*As Location:*
  Whenever you fight a Villain here, each other player reveals their hand and KOs one of their non-grey Heroes.
  Fight: KO up to two of your Heroes.

**Intertwining Powers** (Tactic)
Fight: Each other player without at least two Mandarin's Rings in their Victory Pile gains a Wound.

**Rings Seek Their True Hand** (Tactic)
Fight: Each other player reveals a [TECH] Hero or puts a Mandarin's Ring from their Victory Pile into the Escape Pile.

---

### The Hood

**The Hood** (Normal)
Dark Memories.
Always Leads: Hood's Gang
Master Strike: Each player reveals the top 6 cards of their deck, discards all the non-grey Heroes revealed, and puts the rest back in any order.
Attack: 9+ | VP: 6

**Epic Hood**
Double Dark Memories.
Always Leads: Hood's Gang
Master Strike: Each player discards their deck, then shuffles 6 random grey cards from their discard pile to form their new deck.
Attack: 10+ | VP: 6

**Demonic Revelation** (Tactic)
Fight: Each other player reveals their hand and discards a non-grey Hero.

**Focus Magic Through Guns** (Tactic)
Fight: Each other player reveals a [COVERT] Hero or discards a card. Then each other player reveals a [TECH] Hero or gains a Wound.

**Paean to Dormammu** (Tactic)
Fight: Each other player discards their deck.

**The Hood's Warehouse** (Tactic → Location)
Fight: If this was not already a Location, rescue 4 Bystanders, and this card enters the city as a Location with this ability:
  When you fight a Villain here, play another card from the Villain Deck.

---

### Schemes

---

**Earthquake Drains the Ocean** (Side A)
Setup: 11 Twists. Add an extra Villain Group.
Special Rules: Two extra "Low Tide" city spaces on the left side; city has 7 spaces total.
Twist: The tide rushes in. This Scheme Transforms.
Evil Wins: When 3 Villains per player have escaped or the Villain Deck runs out.

**Tsunami Crushes the Coast** (Side B — Transformed from Earthquake)
Special Rules: Low Tide, Bridge, and Streets city spaces no longer exist. City has 3 spaces total. Put this Scheme on the Streets to mark the edge. Villains in destroyed spaces escape, starting from the left.
Twist: The tide rushes out. This Scheme Transforms, then play another card from the Villain Deck.
Evil Wins: When 3 Villains per player have escaped or the Villain Deck runs out.

---

**House of M** (Side A)
Setup: 8 Twists. Hero Deck is 4 X-Men Heroes and 2 non-X-Men Heroes. (Or substitute another team for all X-Men icons on both sides.) Add 14 Scarlet Witch Hero cards to the Villain Deck.
Special Rules: Each Scarlet Witch in the city is a Villain with Attack equal to its cost +3. If you fight one, gain it as a Hero.
Twist: KO all non-X-Men Heroes from the HQ. If there are at least 2 Scarlet Witch cards in the city, this Scheme Transforms. Otherwise play another card from the Villain Deck.

**"No More Mutants"** (Side B — Transformed from House of M)
Special Rules: Each Scarlet Witch in the city is a Villain with Attack equal to its cost +4. If you fight one, gain it as a Hero.
Twist: KO all X-Men Heroes from the HQ. Play another card from the Villain Deck.
Evil Wins: When the number of non-grey Heroes in the KO pile is ten plus double the number of players.

---

**Secret HYDRA Corruption** (Side A)
Setup: 30 Officers in the S.H.I.E.L.D. Officer stack. 1 player: 7 Twists. 2-3 players: 9 Twists. 4-5 players: 11 Twists.
Special Rules: Officers stacked next to this Scheme are "Hydra Sympathizers." You may pay 3 Recruit to have the player of your choice gain one as a Hero.
Twist: For each Twist in the KO pile (including this one), put a card from the S.H.I.E.L.D. Officer stack next to this Scheme. Then this Scheme Transforms.

**Open HYDRA Revolution** (Side B — Transformed from Secret HYDRA Corruption)
Special Rules: Officers next to this Scheme are 3 Attack "Hydra Traitor" Villains. When you fight one, return it to the Officer Stack and KO one of your Heroes.
Twist: For each Twist in the KO pile (including this one), put a card from the S.H.I.E.L.D. Officer stack next to this Scheme. Then if Evil hasn't won yet, this Scheme Transforms.
Evil Wins: When there are 15 Officers next to this Scheme or the S.H.I.E.L.D. Officer Stack runs out.

---

**The Korvac Saga** (Side A)
Setup: 8 Twists.
Twist: Each player must discard down to four cards or KO a Bystander from their Victory Pile to "search for the Korvac Entity." This Scheme Transforms.

**Korvac Revealed** (Side B — Transformed from The Korvac Saga)
Special Rules: This Scheme counts as a 19 Attack "Korvac" Villain worth 9VP. If you defeat Korvac, KO the Mastermind and all its Tactics.
Twist 2, 4, 6: Each player discards an Avengers Hero or gains a Wound. This Scheme Transforms.
Twist 8: Evil Wins!

---

### Henchmen

---

### HYDRA Base

**HYDRA Base** (×10) — Henchman Location
HYDRA Base gets +2 Attack while there's a Villain here.
Fight: KO one of your Heroes.
Attack: 2+ | VP: 1

---

### Mandarin's Rings

All rings: Attack 3, VP 1.

**Daimonic, The White Light** (×1)
Fight: Draw a card.

**Incandescence, The Flame Blast** (×1)
Fight: You may KO a card from your discard pile.

**Influence, The Impact Beam** (×1)
Fight: You get +1 Recruit.

**Liar, The Mento-Intensifier** (×1)
Fight: Look at the top card of another player's deck. Say it is "Good" or "Bad." That player chooses to put it in your discard pile or their discard pile.

**Lightning, The Electro-Blast** (×1)
Fight: Reveal the top card of your deck. You may KO it.

**Nightbringer, The Black Light** (×1)
Fight: Reveal the top three cards of the Villain Deck. You may defeat a Villain you revealed worth 2VP or less. (Do its Fight effect.) Put the rest back in any order.

**Remaker, The Matter Rearranger** (×1)
Fight: You may choose a card from your hand or discard pile. The player on your right puts it in their hand.

**Spectral, The Disintegration Beam** (×1)
Fight: KO one of your Heroes.

**Spin, The Vortex Beam** (×1)
Fight: Reveal the top six cards of your deck. Discard all of them that cost 0, then put the rest back in any order.

**Zero, The Ice Blast** (×1)
Fight: Choose a card you played this turn that costs 0. When you draw a new hand of cards at the end of this turn, add that card to your hand as an extra card.

---

### Bystanders

**Dog Show Judge** (×1)
When you rescue this Bystander, each player reveals the top card of their deck. Judge one of those cards to be the "best in show." That player draws that card.
VP: 1

**Lawyer** (×1)
When you rescue this Bystander, reveal the top 3 cards of your deck. Draw each of them that has at least 10 words of rules text. Put the rest back in any order. (Numerals, icons, and punctuation don't count.)
VP: 1

**Rocket Test Pilot** (×1)
When you rescue this Bystander, choose Recruit or Attack. Then Hyperspeed 3 for that icon.
VP: 1
