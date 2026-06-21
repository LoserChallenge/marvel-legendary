<!-- INVENTORY STATUS:
  Heroes: ✅
  Villains: ✅
  Masterminds: ✅
  Schemes: ✅
  Henchmen: — (none in expansion)
  Bystanders/Sidekicks: — (none in expansion)
  Last updated: 2026-06-21
-->

# Shadows of Nightmare — Card Inventory

**Primary source**: Card images in `expansions/shadows-of-nightmare/` (effect text + card titles) — the actual card art is authoritative for effect text and titles.
**Cross-check**: `expansions/shadows-of-nightmare/shadows-of-nightmare-reference.md` (BGG-derived; authoritative for structured fields — copy counts, costs, fight values, VP, class/team).
**Pass 1 date**: 2026-06-21
**Pass 2 status**: Pending — run `/inventory-verifier` in a fresh session

> **Set composition (per reference):** 100 cards — 5 Heroes (14 cards each), 2 Masterminds (5 cards each), 2 Villain Groups (8 cards each), 4 Schemes. No henchmen, bystanders, or sidekicks.

---

## New Keywords

- **Demonic Bargain**: When a card tells a player to "make a Demonic Bargain … to [benefit]", that player discards the top card of their deck. If the discarded card costs **1 or more**, that player gains a Wound; if it costs **0**, they resist (no Wound). Whether wounded or not, they then gain the listed benefit. When you *choose* a player to make a Demonic Bargain, that player cannot decline. Dormammu's bargains are all-downside (chance of a Wound plus an additional negative effect).
- **Astral Plane**: A single unique space immediately to the right of the Villain Deck (exists only in games using Astral Plane cards). While a Villain (or Nightmare) is in the Astral Plane it has no physical form: it can **only be fought with Recruit, not Attack** (spend Recruit equal to its total Attack). When a Villain enters the Astral Plane, any Villain already there **escapes** (all normal escape effects apply). Villains keep their −/+Attack modifiers there. The Astral Plane is **not** a city space and is not adjacent to any city space; Villains do **not** perform Ambush effects when they enter it. Effects can't move/swap Villains to/from it unless they explicitly mention the Astral Plane.
- **Ritual Artifacts**: A new type of Artifact (follows all normal Artifact rules). Reads "Ritual Artifact — If [condition] this turn, you may discard this Artifact to get [effect]." Using it is optional even when the condition is met (you may save it for a later turn). You may use any number of Ritual Artifacts in a turn, including multiple copies of the same name; one fulfilled condition (e.g. "drew a card") can satisfy multiple Rituals. (Artifacts generally: see Guardians of the Galaxy / Heroes of Asgard.)

---

## Section 1: Structured Data Tables

### Heroes

Standard distribution per hero: 1 Rare (1 copy), 1 Uncommon (3 copies), 2 Commons (5 copies each) = 14 cards total.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| Doctor Strange | Wand of Watoomb | Common A | 5 | 3 | Avengers | Range | — | — |
| Doctor Strange | Keeper of the Sanctum | Common B | 5 | 4 | Avengers | Instinct | 2 | 0 |
| Doctor Strange | Book of Cagliostro | Uncommon | 3 | 2 | Avengers | Instinct | — | — |
| Doctor Strange | The Eye of Agamotto | Rare | 1 | 8 | Avengers | Range | — | — |
| Clea | Prepare Dark Magic | Common A | 5 | 3 | Marvel Knights | Range | 2 | 0 |
| Clea | Demonic Descendant | Common B | 5 | 4 | Marvel Knights | Covert | 0 | 2+ |
| Clea | Bind the Dark Dimension | Uncommon | 3 | 6 | Marvel Knights | Range | 3 | 0+ |
| Clea | The Purple Gem | Rare | 1 | 7 | Marvel Knights | Covert | — | — |
| Doctor Voodoo | Commune with the Spirit World | Common A | 5 | 3 | Avengers | Covert | 0 | 2 |
| Doctor Voodoo | Medallion of Many Loas | Common B | 5 | 4 | Avengers | Tech | — | — |
| Doctor Voodoo | Staff of Legba | Uncommon | 3 | 6 ⚠️ | Avengers | Strength | — | — |
| Doctor Voodoo | Possessed by Brother's Spirit | Rare | 1 | 7 | Avengers | Instinct | 4+ | 0+ |
| The Ancient One | Astral Confrontation | Common A | 5 | 3 | — (Unaffiliated) | Covert | 0 | 2 |
| The Ancient One | Teachings of Kamar-Taj | Common B | 5 | 5 | — (Unaffiliated) | Instinct | 0 | 0 |
| The Ancient One | War of the Mind | Uncommon | 3 | 6 | — (Unaffiliated) | Covert | 0 | 3+ |
| The Ancient One | The Orb of Agamotto | Rare | 1 | 8 | — (Unaffiliated) | Instinct | — | — |
| The Vishanti | Oshtur | Common A | 5 | 3 | — (Unaffiliated) | Strength | 0 | 2 |
| The Vishanti | Hoggoth | Common B | 5 | 5 | — (Unaffiliated) | Instinct | 2+ | 0 |
| The Vishanti | Agamotto | Uncommon | 3 | 4 | — (Unaffiliated) | Range | 2 | 0 |
| The Vishanti | The Book of the Vishanti | Rare | 1 | 7 | — (Unaffiliated) | Covert | — | — |

**Attack / Recruit notation:** fixed value (e.g. `3`) = printed base, always provided; `0+` = base 0, modified by ability; `[#]+` = base value plus conditional bonus; `0` = none of that stat; `—` = not applicable. The eight **Ritual Artifact** cards (Wand of Watoomb, Book of Cagliostro, The Eye of Agamotto, The Purple Gem, Medallion of Many Loas, Staff of Legba, The Orb of Agamotto, The Book of the Vishanti) print no base Attack/Recruit — all value comes from the discard/Ritual effect, so both stat columns are `—`.

⚠️ **Staff of Legba cost** — reference lists **6**; the card image clearly reads **5** in the cost box. Recorded the reference value (6); flagged for physical-card spot-check (Pass 2/3) as a possible reference error.

---

### Villains

Standard villain group total: **8 cards**. No henchmen in this expansion.

**Fear Lords** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Fear Lords | D'Spayre | 2 | 5 | 3 |
| Fear Lords | Dreamstalker | 2 | 5 | 3 |
| Fear Lords | Nox | 2 | 4 | 2 |
| Fear Lords | The Lurking Unknown | 2 | 2 | 3 |

*All four Fear Lords use **Astral Plane** mechanics. No always-on keyword line on any card. The Lurking Unknown's Fight value of 2 is atypically low — confirmed on both image and reference.*

**Lords of the Netherworld** (8 cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| Lords of the Netherworld | Baron Mordo | 2 | 5 | 3 |
| Lords of the Netherworld | Mindless Ones | 2 | 4 | 2 |
| Lords of the Netherworld | Satana Hellstrom | 2 | 5 | 3 |
| Lords of the Netherworld | Satannish | 1 | 6 | 4 |
| Lords of the Netherworld | Umar | 1 | 7 | 5 |

*All use **Demonic Bargain**. Uneven copy counts (2/2/2/1/1) — Satannish and Umar are singletons. Mindless Ones' Fight names the **group** ("Demonic Bargain with the Lords of the Netherworld"), unlike the other cards which name the specific villain.*

---

### Masterminds

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| Dormammu | 11 | 6 | Lords of the Netherworld |
| Epic Dormammu | 13 | 6 | Lords of the Netherworld |
| Nightmare | 6 | 6 | Fear Lords |
| Epic Nightmare | 8 | 6 | Fear Lords |

```
Dormammu Tactics:
  Barter for Souls, Demonic Hellfire, Flames of Regency, Torments of the Dark Dimension

Nightmare Tactics:
  Deadly Waking Nightmares, Don't Fall Asleep, Dream Weaver, Night Terrors
```

⚠️ Each tactic card shows a VP value of **6** (image-derived — the reference does not list per-tactic VP). Tactics carry no recruit/attack cost. Confirm in Pass 2.

---

### Schemes

| Scheme Name | Twist Count | Bystander Count |
|---|---|---|
| Claim Souls for Demons | 8 | — (not on card; game-mode default) |
| War for the Dream Dimension | 7 | — (not on card; game-mode default) |
| Cursed Pages of the Darkhold Tome | 11 | — (not on card; game-mode default) |
| Duels of Science and Magic | 2p: 9 / 1 or 4p: 10 / 3 or 5p: 11 | — (not on card; game-mode default) |

*Extra-villain-group setup directives: **War for the Dream Dimension** and **Cursed Pages of the Darkhold Tome** both say "Add an extra Villain Group." The other two do not. No scheme card prints a bystander count.*

---

## Section 2: Card Effects

---

### Heroes

---

### Doctor Strange

**Wand of Watoomb** (Common A)
- SPECIAL ABILITY: Ritual Artifact — If you drew a card, you may discard Wand of Watoomb to get **+3** Attack.
- SUPERPOWER: NA

**Keeper of the Sanctum** (Common B)
- SPECIAL ABILITY: 2 Attack. If you control an Artifact, draw a card.
- SUPERPOWER: NA

**Book of Cagliostro** (Uncommon)
- SPECIAL ABILITY: Ritual Artifact — If you fought a Villain, you may discard Book of Cagliostro to get **+**Recruit equal to that enemy's VP.
- SUPERPOWER: NA

**The Eye of Agamotto** (Rare)
- SPECIAL ABILITY: Ritual Artifact — If you played another Artifact or three other cards of the same Hero Class, you may discard the Eye of Agamotto to get **+7** Attack.
- SUPERPOWER: NA

### Clea

**Prepare Dark Magic** (Common A)
- SPECIAL ABILITY: 2 Attack. Draw a card. Then put a card from your hand on top of your deck.
- SUPERPOWER: NA

**Demonic Descendant** (Common B)
- SPECIAL ABILITY: 2+ Recruit. You may make a **Demonic Bargain** to get **+2** Recruit.
- SUPERPOWER: NA

**Bind the Dark Dimension** (Uncommon)
- SPECIAL ABILITY: 3 Attack.
- SUPERPOWER: [RANGE]: You may choose a player to make a **Demonic Bargain** to KO up to one Hero of their choice from their hand or discard pile.

**The Purple Gem** (Rare)
- SPECIAL ABILITY: Ritual Artifact — If any cards were "revealed", "looked at", or "discarded" from any deck, you may discard the Purple Gem to get **+6** Attack. (Just drawing or playing a card from a deck doesn't count.)
- SUPERPOWER: NA

### Doctor Voodoo

**Commune with the Spirit World** (Common A)
- SPECIAL ABILITY: 2 Recruit. You may discard an Artifact you control or three cards from your hand. If you do, KO a card from your hand or discard pile.
- SUPERPOWER: NA

**Medallion of Many Loas** (Common B)
- SPECIAL ABILITY: Ritual Artifact — If you have at least three Hero Classes, you may discard Medallion of Many Loas to get **+1** Attack for each Hero Class you have, including this one.
- SUPERPOWER: NA

**Staff of Legba** (Uncommon)
- SPECIAL ABILITY: Ritual Artifact — If you recruited a Hero, you may discard Staff of Legba to get **+**Attack equal to that Hero's cost.
- SUPERPOWER: NA

**Possessed by Brother's Spirit** (Rare)
- SPECIAL ABILITY: 0+ Recruit. 4+ Attack. The first time that one of your Heroes or a Hero from your deck or discard pile is KO'd this turn, you get **+4** Recruit or **+4** Attack.
- SUPERPOWER: NA

### The Ancient One

**Astral Confrontation** (Common A)
- SPECIAL ABILITY: 2 Recruit. You may have a Villain from the city enter the **Astral Plane**.
- SUPERPOWER: NA

**Teachings of Kamar-Taj** (Common B)
- SPECIAL ABILITY: Draw two cards.
- SUPERPOWER: NA

**War of the Mind** (Uncommon)
- SPECIAL ABILITY: 3+ Recruit. You may fight the Mastermind using only Recruit instead of Attack this turn.
- SUPERPOWER: [COVERT]: You get **+3** Recruit.

**The Orb of Agamotto** (Rare)
- SPECIAL ABILITY: Ritual Artifact — If you fought a Villain or Mastermind, you may set aside the Orb of Agamotto to reveal the top four cards of your deck. KO up to one of them, put two of them in your hand, and put the rest back on top in any order. Then discard the Orb of Agamotto.
- SUPERPOWER: NA

### The Vishanti

**Oshtur** (Common A)
- SPECIAL ABILITY: 2 Recruit. You may KO a Wound from your hand or discard pile. If you do, draw a card.
- SUPERPOWER: NA

**Hoggoth** (Common B)
- SPECIAL ABILITY: 2+ Attack. You may make a **Demonic Bargain** to get **+2** Attack.
- SUPERPOWER: NA

**Agamotto** (Uncommon)
- SPECIAL ABILITY: 2 Attack. Reveal the top card of your deck. Discard it or put it back.
- SUPERPOWER: [RANGE]: You may choose a player to make a **Demonic Bargain** to draw two extra cards at the end of this turn.

**The Book of the Vishanti** (Rare)
- SPECIAL ABILITY: Ritual Artifact — If any player gained a Wound, you may set aside the Book of the Vishanti to KO up to one Wound from any player's discard pile, then draw three cards. Then discard the Book of the Vishanti. You can use this during any player's turn.
- SUPERPOWER: NA

---

### Villains

---

### Fear Lords

**D'Spayre** (×2)
Ambush: D'Spayre enters the **Astral Plane** and captures a Bystander.
Fight: KO a Hero. Then, if D'Spayre was in the **Astral Plane**, he enters the city, ignoring his Ambush ability.
Attack: 5 | VP: 3

**Dreamstalker** (×2)
Fight: Draw two cards. Then, if Dreamstalker was in the city, it enters the **Astral Plane**.
Escape: Each player discards down to four cards.
Attack: 5 | VP: 3

**Nox** (×2)
Fight: KO one of your Heroes. Then, if Nox was in the city, she enters the **Astral Plane** and captures a Bystander.
Attack: 4 | VP: 2

**The Lurking Unknown** (×2)
Fight: Reveal the top card of the Hero Deck. You may spend Recruit equal to that card's cost to have the player of your choice gain that Hero. If you don't, the Lurking Unknown enters the **Astral Plane** (even if it was already there).
Escape: Reveal the top card of the Hero Deck. Each player reveals their hand and KOs a Hero with that cost.
Attack: 2 | VP: 3

### Lords of the Netherworld

**Baron Mordo** (×2)
Fight: Choose a player to make a **Demonic Bargain** with Baron Mordo to draw two extra cards at the end of this turn.
Attack: 5 | VP: 3

**Mindless Ones** (×2)
Ambush: Mindless Ones capture the rightmost Hero in the HQ that costs 4 or less.
Fight: Choose a player to make a **Demonic Bargain** with the Lords of the Netherworld to gain that Hero.
Attack: 4 | VP: 2

**Satana Hellstrom** (×2)
Fight: Choose a player to make a **Demonic Bargain** with Satana Hellstrom to rescue three Bystanders.
Attack: 5 | VP: 3

**Satannish** (×1)
Ambush: Choose a player to make a **Demonic Bargain** with Satannish to reveal the top card of the Hero Deck and gain it if it costs 4 or less.
Fight: Same effect, but cost 6 or less.
Escape: Same effect, but cost 2 or less.
Attack: 6 | VP: 4

**Umar** (×1)
Ambush: Choose a player to make a **Demonic Bargain** with Umar to KO a Hero of their choice from the HQ.
Fight: Choose a player to make a **Demonic Bargain** with Umar to gain a Hero of their choice that costs 6 or less from the KO pile.
Escape: Same as Fight effect, but cost 0.
Attack: 7 | VP: 5

---

### Masterminds

---

### Dormammu

**Dormammu** (Normal)
Always Leads: Lords of the Netherworld
Master Strike: Each player makes a **Demonic Bargain** with Dormammu to discard down to four cards.
Attack: 11 | VP: 6

**Epic Dormammu**
Always Leads: Lords of the Netherworld
Master Strike: Each player reveals the top card of their deck and discards it if it costs 0. Then each player makes a **Demonic Bargain** with Dormammu to discard down to three cards.
Attack: 13 | VP: 6

**Barter for Souls** (Tactic)
Fight: Choose a player to make a **Demonic Bargain** with Dormammu to gain a Hero from the HQ that costs 6 or less.

**Demonic Hellfire** (Tactic)
Fight: Each other player makes a **Demonic Bargain** with Dormammu to KO a non-grey Hero from their discard pile.

**Flames of Regency** (Tactic)
Fight: Each other player makes a **Demonic Bargain** with Dormammu to discard a card with an Attack icon.

**Torments of the Dark Dimension** (Tactic)
Fight: Each other player makes a **Demonic Bargain** with Dormammu to gain a 0-cost Hero from the KO pile.

---

### Nightmare

**Nightmare** (Normal)
When you fight Nightmare in the **Astral Plane**, instead of revealing a Tactic, KO one of your Heroes and Nightmare moves to the Mastermind Space.
Always Leads: Fear Lords
Master Strike: Nightmare enters the **Astral Plane**. If he was already there, each player discards a random card.
Escape: Each player KOs one of their non-grey Heroes. Nightmare moves to the Mastermind space.
Attack: 6 | VP: 6

**Epic Nightmare**
When you fight Nightmare in the **Astral Plane**, instead of revealing a Tactic, KO one of your Heroes and Nightmare moves to the Mastermind Space.
Always Leads: Fear Lords
Master Strike: Nightmare enters the **Astral Plane**. If he was already there, each player discards two random cards.
Escape: Each player KOs one of their non-grey Heroes. Nightmare moves to the Mastermind space.
Attack: 8 | VP: 6

**Deadly Waking Nightmares** (Tactic)
Fight: Each other player KOs one of their non-grey Heroes. Each player who KO'd a Hero this way draws a card. Nightmare enters the **Astral Plane**.

**Don't Fall Asleep** (Tactic)
Fight: Each other player discards two cards with Recruit icons. Nightmare enters the **Astral Plane**.

**Dream Weaver** (Tactic)
Fight: For each of your [RANGE] Heroes, rescue a Bystander. Nightmare enters the **Astral Plane**.

**Night Terrors** (Tactic)
Fight: Each other player reveals a [COVERT] Hero or gains a Wound. Nightmare enters the **Astral Plane**.

---

### Schemes

---

**Claim Souls for Demons**
Setup: 8 Twists.
Twist 1-3: Each player makes a **Demonic Bargain** to rescue a Bystander. If that Bargain wounds that player, stack that Bystander next to the Scheme as a "Tormented Soul" instead.
Twist 4-8: Each player makes a **Demonic Bargain** to gain a S.H.I.E.L.D. Officer. If that Bargain wounds that player, stack that Officer next to the Scheme as a "Tormented Soul" instead.
Evil Wins: When the number of Tormented Souls is four times the number of players.

**War for the Dream Dimension**
Setup: 7 Twists. Add an extra Villain Group.
Twist: Reveal the top two cards of the Villain Deck. The Villain you revealed with the highest printed Attack enters the **Astral Plane**. (It does not do any Ambush abilities.) If you revealed a second Villain this way, that Villain enters the city. Put the rest of the revealed cards back in any order.
Evil Wins: When there are 3 Villains per player in the Escape Pile or the Villain Deck runs out.

**Cursed Pages of the Darkhold Tome**
Setup: 11 Twists, representing Cursed Pages of the Darkhold Tome. Add an extra Villain Group.
Special Rules: Cursed Pages are **Ritual Artifacts** with "If you fought a Villain or Mastermind, you may discard this to get **+3** Recruit."
Twist: Put this Cursed Page next to the Mastermind, plus a Cursed Page from any player's control or discard pile or the KO pile. For this turn only, the first time you fight a Villain or Mastermind, put one of the Mastermind's Cursed Pages into your discard pile.
Evil Wins: When the Mastermind has 7 Cursed Pages at the end of any player's turn or the Villain Deck runs out.

**Duels of Science and Magic**
Setup: 2 players: 9 Twists. 1 or 4 players: 10 Twists. 3 or 5 players: 11 Twists.
Twist 1, 3, and 5 ("Duel of Science"): Each player reveals a [TECH] or [RANGE] Hero or discards down to 4 cards. If at least half the players (round up) failed to reveal, put this Twist next to the Mastermind as a "Duel Won."
Twist 2, 4, and 6 ("Duel of Magic"): Same effect, but with [INSTINCT] or [COVERT].
Twist 7-11 ("Duel of Science and Magic"): Same effect, but each player must reveal at least three of these colors: [INSTINCT], [COVERT], [TECH], [RANGE].
Evil Wins: When the Mastermind has won 5 Duels.

---

## Pass 1 Flags Summary (for Pass 2 / Pass 3)

1. **⚠️ Staff of Legba cost** — reference 6 vs card image 5. Recorded 6; resolve against physical card.
2. **⚠️ Tactic VP = 6** — image-derived (reference lists no per-tactic VP). Confirm the circled "6" on each of the 8 tactic cards is VP.
3. **Image filenames vs printed titles (RESOLVED, no action):** filenames `MasterOfTheSanctum`, `FleetingDarkMagic`, `MedallionOfManyCoats` are misnomers — the printed card titles are Keeper of the Sanctum, Prepare Dark Magic, Medallion of Many Loas (match the reference).
4. **Scheme bystander counts** — not printed on any scheme card; left `—` (game-mode default).
5. **Class/team** — confirmed from card images: Doctor Strange & Doctor Voodoo = Avengers; Clea = Marvel Knights; The Ancient One & The Vishanti = unaffiliated (no team icon). Note: this set has **no** Tech/Range terminology conflict — DB convention uses `"Range"` (not "Ranged"); recorded as Range.
