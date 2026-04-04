# [Expansion Name] — Card Inventory

> **This is the canonical format template for all expansion inventories.**
> Strip placeholder text and fill in real data. Omit any section that does not apply to the expansion being cataloged.

**Primary source**: [Track A: `expansions/[name]/[name]-inventory.pdf` | Track B: `cardDatabase.js`]
**Cross-check**: [Track A: Card images in `expansions/[name]/` | Track B: Card images in `Visual Assets/Heroes/[Display Name]/`]
**Pass 1 date**: YYYY-MM-DD
**Pass 2 status**: Pending — run `/inventory-verifier` in a fresh session

---

## New Keywords *(omit section if none)*

- **[Keyword]**: [Definition as stated in the PDF or rulebook — do not paraphrase]

---

## Section 1: Structured Data Tables

### Heroes

Standard distribution per hero: 1 Rare (1 copy), 1 Uncommon (3 copies), 2 Commons (5 copies each) = 14 cards total.

> **Track A:** Copy counts come from the PDF (shown as "X copies" next to each card name).
> **Track B:** Copy counts are not stored in `cardDatabase.js`. Derive from the `rarity` field using the rule hardcoded in `generateHeroDeck()` (`script.js:3649`): `"Common"` → 5, `"Common 2"` → 5, `"Uncommon"` → 3, `"Rare"` → 1. Flag ⚠️ if any hero deviates from this pattern.

| Hero | Card Title | Rarity | Count | Cost | Team | Class | Attack | Recruit |
|---|---|---|---|---|---|---|---|---|
| [Hero Name] | [Card Title] | Common A | 5 | [#] | [Team] | [Class] | [#] | [#] |
| [Hero Name] | [Card Title] | Common B | 5 | [#] | [Team] | [Class] | [#] | [#] |
| [Hero Name] | [Card Title] | Uncommon | 3 | [#] | [Team] | [Class] | [#] | [#] |
| [Hero Name] | [Card Title] | Rare | 1 | [#] | [Team] | [Class] | [#] | [#] |

**Attack / Recruit notation:**
- Fixed value (e.g., `3`) = base printed on card, always provided
- `0+` = base 0, modified entirely by ability
- `[#]+` = base value shown, plus a conditional bonus on top
- `0` = this card provides none of this stat type
- `—` = stat type not applicable to this card type

---

### Villains

Standard villain group total: **8 cards** (verify from source — some groups differ).
`(Location)` = Location card type. Flag any non-standard card type with ⚠️ and stop for user confirmation.

**[Group Name]** ([total] cards)

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| [Group] | [Villain Name] | [#] | [#] | [#] |

*[Note any shared keyword (e.g., "All have Last Stand"), special fight conditions, or non-standard mechanics.]*

---

### Masterminds

| Name | Fight Value | VP | Always Leads |
|---|---|---|---|
| [Mastermind Name] | [#] | [#] | [Villain Group] |

```
[Mastermind Name] Tactics:
  [Tactic 1], [Tactic 2], [Tactic 3], [Tactic 4]

Epic Tactic: [Name]  (omit line if no Epic version)
```

---

### Schemes

Standard scheme: single-sided. Transforming schemes (double-sided) list both sides.

| Scheme Name | Twist Count | Bystander Count |
|---|---|---|
| [Scheme Name] | [#] | [#] |

*[Note any scheme-specific setup rules: variable twist counts by player count, special stacks, transforming sides, etc.]*

---

### Henchmen

Standard henchmen group total: **10 cards** (verify from source).
`(Henchman Location)` = dual Henchman/Location card type.

**[Group Name]** — [standard / Henchman Location / other]

| Group | Card Name | Count | Fight Value | VP |
|---|---|---|---|---|
| [Group] | [Card Name] | [#] | [#] | [#] |

---

### Bystanders / Sidekicks *(omit section if none)*

| Card Name | Count | VP |
|---|---|---|
| [Bystander or Sidekick Name] | [#] | [#] |

---

### [Expansion-Specific Card Type] *(e.g., Ambitions, Locations as a separate deck — omit if not applicable)*

> Stop and confirm with the user before cataloging any card type not covered above.

---

## Section 2: Card Effects

---

### Heroes

---

### [Hero Name]

**[Card Title]** (Common A)
- SPECIAL ABILITY: [Unconditional effect that fires every time the card is played — or NA]
- SUPERPOWER: [CLASSNAME] or [TEAMNAME]: [Conditional effect requiring a prior matching card — or NA]

**[Card Title]** (Common B)
- SPECIAL ABILITY: [Effect — or NA]
- SUPERPOWER: NA

**[Card Title]** (Uncommon)
- SPECIAL ABILITY: NA
- SUPERPOWER: [CLASSNAME]: [Effect]

**[Card Title]** (Rare)
- SPECIAL ABILITY: [Effect]
- SUPERPOWER: NA

> **SPECIAL ABILITY** = fires unconditionally every time the card is played.
> **SUPERPOWER** = conditional on a prior card of matching class or team having been played this turn. Always begins with a trigger icon prefix, e.g. `[TECH]:`, `[AVENGERS]:`, `[___]:` (placeholder when icon is uncertain).
> Multiple trigger icons are written inline: `[AVENGERS][AVENGERS]:` means two Avengers cards must have been played.
> **DB cross-reference (Track B):** `unconditionalAbility` ≠ "None" → SPECIAL ABILITY; `conditionalAbility` ≠ "None" → SUPERPOWER. Trigger label comes from the `condition` field (e.g. `"Tech"` → `[TECH]:`, `"Avengers"` → `[AVENGERS]:`); `conditionType` distinguishes class vs team triggers.
>
> **Phrasing precision:** Capture card text as close to verbatim as possible. Preserve optionality language exactly: "You may" = optional action; "If you do" = conditional on the optional action being taken; no qualifier = mandatory. Never paraphrase "You may X. If you do, Y" as just "X to gain Y" — the optionality is mechanically significant.

---

### Villains

---

### [Group Name]

**[Villain Name]** (×[count])
[Always-on keyword or passive, e.g. "Dark Memories." or "Last Stand." — omit line if none]
Ambush: [Effect — omit line if none]
Fight: [Effect — omit line if none]
Escape: [Effect — omit line if none]
Attack: [#] | VP: [#]

> For Location card types, use "Ongoing:" instead of "Fight:" for the passive location effect, then "Fight:" for the effect when you defeat it.

---

### Masterminds

---

### [Mastermind Name]

**[Mastermind Name]** (Normal)
[Always-on passive text — omit line if none]
Always Leads: [Group]
Master Strike: [Effect]
Attack: [#] | VP: [#]

**Epic [Mastermind Name]**
[Always-on passive text — omit line if none]
Always Leads: [Group]
Master Strike: [Effect]
Attack: [#] | VP: [#]

**[Tactic Name]** (Tactic)
Fight: [Effect]

**[Tactic Name]** (Tactic → Location)
Fight: If this was not already a Location, [setup effect], and this card enters the city as a Location with this ability:
  [Location ongoing effect]

---

### Schemes

---

**[Scheme Name]**
Setup: [Twist count] Twists. [Any other setup rules.]
Special Rules: [If any — omit line if none]
Twist: [Effect]
Evil Wins: [Condition]

> For Transforming Schemes, document Side A then Side B with a label. For variable twist counts (by player count), list all values.

---

### Henchmen

---

### [Group Name]

**[Card Name]** (×[count])
[Always-on effect — omit line if none]
Fight: [Effect — omit line if none]
Attack: [#] | VP: [#]

---

### Bystanders / Sidekicks *(omit section if none)*

**[Card Name]** (×[count])
When you rescue this Bystander, [Effect]
VP: [#]
