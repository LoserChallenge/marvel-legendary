# Card Effect Audit Results — 2026-03-31 v2

Full audit of all 5 expansions against the card reference files in `docs/card-effects-reference/`.

---

## Core Set

### Issues Found

---

```
CARD: Iron Man - Arc Reactor (Hero — Core Set)
LAYER: 1
ISSUE: Log message reports "Tech Heroes" count but bonusAttack() calculates using Black-colored cards.
EXPECTED: Reference says "+1 [Attack] for each other [Tech] Hero you played this turn." Calculation should
          count cards with class "Tech" in playedCards.
ACTUAL: DB has multiplier: "Black", multiplierAttribute: "color". bonusAttack() counts playedCards where
        card.color === "Black". IronManArcReactorBonusAttack() independently logs the Tech count but does
        not add points itself — it delegates to bonusAttack() which uses the color-based count. In Core Set
        play, all Tech heroes happen to be Black-colored so results appear correct, but the log shown to the
        player is inaccurate, and mixed-expansion play would give wrong values.
FILE: cardAbilities.js:1157–1177 (function), cardDatabase.js:5369–5375 (multiplier fields)
SEVERITY: MEDIUM
```

---

### Audit Summary — Core Set

- Total cards audited: 60 hero cards (15 heroes × 4), 4 masterminds, 8 schemes, 4 henchmen groups, 7 villain groups
- Issues found: 1 (0 high, 1 medium, 0 low)
- Cards that could not be fully audited: None

---

## Dark City

### Issues Found

No issues found.

### Audit Summary — Dark City

- Total cards audited: 68 hero cards (17 heroes × 4), 5 masterminds, 8 schemes, 6 villain groups, 2 henchmen groups, 3 special bystanders
- Issues found: 0
- Notes:
  - Bishop - Firepower from the Future correctly bundles the X-Men conditional KO inside its unconditional function body.
  - Bishop - Concussive Blast correctly uses `condition: "Range&Range"` to enforce the double-Range trigger.
  - Domino's Versatile chain (Lucky Break → Ready For Anything → Against All Odds) all correctly feed into the `versatile()` and `trueVersatility` system.
  - All Blade, Nightcrawler, Daredevil, Jean Grey, Professor X, Punisher, Cable, Forge, Elektra, Iceman, Iron Fist functions audited; no discrepancies against reference.

---

## Fantastic Four

### Issues Found

---

```
CARD: Invisible Woman - Four of a Kind (Hero — Fantastic Four)
LAYER: 3
ISSUE: Missing cumulativeAttackPoints update.
EXPECTED: Consistent with all other attack-granting functions in the codebase, both totalAttackPoints and
          cumulativeAttackPoints should be incremented together.
ACTUAL: invisibleWomanFourOfAKind() increments totalAttackPoints += 2 but does not increment
        cumulativeAttackPoints. Every comparable function (humanTorchNovaFlame, humanTorchFlameOn,
        mrFantasticOneGiganticHand, thingKnuckleSandwich, etc.) also increments cumulativeAttackPoints.
        This means the Throg sidekick cumulative-check and any future cumulative-based logic would
        undercount the player's total attack when Invisible Woman - Four of a Kind fires.
FILE: expansionFantasticFour.js:4304–4308
SEVERITY: LOW
```

---

### Audit Summary — Fantastic Four

- Total cards audited: 20 hero cards (5 heroes × 4), 2 masterminds, 4 schemes, 2 villain groups
- Issues found: 1 (0 high, 0 medium, 1 low)
- Notes:
  - Focus system (getFocusDetails) correctly wires all Focus abilities for all 5 FF heroes; no missing entries.
  - Morg Ambush (morgAmbush) uses hardcoded `i < 5` loop — already tracked as deferred low-priority item L6.
  - Silver Surfer "Energy Surge" correctly doubles both totalRecruitPoints and cumulativeRecruitPoints.
  - Mr. Fantastic "Ultimate Nullifier" fight-effect negation correctly integrated via promptNegateFightEffectWithMrFantastic.

---

## Guardians of the Galaxy

### Issues Found

---

```
CARD: Rocket Raccoon - Vengeance is Rocket (Hero — Guardians of the Galaxy)
LAYER: 3
ISSUE: References undefined variable cumulativePlayerAttack instead of cumulativeAttackPoints.
EXPECTED: Attack bonus from Master Strikes should be tracked in the shared cumulativeAttackPoints variable,
          consistent with every other attack-granting function across all 5 expansion files.
ACTUAL: rocketRaccoonVengeanceIsRocket() at line 6513 does:
          cumulativePlayerAttack += masterStrikeCount;
        The variable cumulativePlayerAttack is not declared anywhere in script.js or any other file.
        This means the cumulative attack tracking silently fails (assigning to an implicit global or
        throwing a ReferenceError in strict mode). totalAttackPoints is correctly incremented on line 6512,
        so the in-turn attack value displays correctly — but the cumulative tracking used by Throg and
        any future cumulative checks is wrong.
FILE: expansionGuardiansOfTheGalaxy.js:6513
SEVERITY: HIGH
```

---

```
CARD: Gamora - Galactic Assassin (Hero — Guardians of the Galaxy)
LAYER: 1
ISSUE: Popup title displays the wrong card name.
EXPECTED: The popup shown by gamoraGalacticAssassin() should be labelled "GAMORA - GALACTIC ASSASSIN".
ACTUAL: titleElement.textContent = "GAMORA - BOUNTY HUNTER"; — the title of a different Gamora card is
        shown. The effect logic itself is correct (choosing a Villain to negate Shard Attack from).
FILE: expansionGuardiansOfTheGalaxy.js:5013
SEVERITY: LOW
```

---

### Notes on GotG Condition Checks (Previously Flagged as Bugs)

The CLAUDE.md known-issues table listed three GotG condition mismatches. After comparing both the reference file and the code, these are **not bugs** per the reference:

| Card | Code Condition Checked | Reference Text | Status |
|------|----------------------|----------------|--------|
| Gamora - Deadliest Woman in the Universe | Covert | "[Covert]: Gain another Shard." | Correct — code matches reference |
| Rocket Raccoon - Trigger Happy | Guardians of the Galaxy (team) | "[Guardians]: You gain a Shard for each other [Guardians] Hero..." | Correct — code matches reference |
| Rocket Raccoon - Vengeance is Rocket | Tech (class) | "[Tech]: You get +1 [Attack] for each Master Strike..." | Correct — code matches reference |

The reference file was built from card images after the CLAUDE.md entry was written. The reference file is authoritative per the audit process instructions.

### Audit Summary — Guardians of the Galaxy

- Total cards audited: 20 hero cards (5 heroes × 4), 2 masterminds, 4 schemes, 2 villain groups
- Issues found: 2 (1 high, 0 medium, 1 low)
- Cards that could not be fully audited: None

---

## Paint the Town Red

### Issues Found

No issues found.

### Audit Summary — Paint the Town Red

- Total cards audited: 20 hero cards (5 heroes × 4), 2 masterminds, 4 schemes, 2 villain groups
- Issues found: 0
- Notes:
  - Wall-Crawl keyword correctly implemented as a recruitment mechanic (put on top of deck on recruit), independent of hero ability triggers.
  - Black Cat - Jinx correctly adapts "each player reveals top card" to solo (1 card, your deck) with discard-or-return choice.
  - Symbiote Spider-Man - Thwip! correctly requires 2 cards in hand, cancels itself if insufficient, and removes card from play.
  - Symbiote Spider-Man - Spider-Sense Tingling correctly reveals 2 cards (not 3), puts cost ≤ 2 cards in hand, and uses handleCardReturnOrder for the rest.
  - Moon Knight - Golden Ankh of Khonshu correctly chains the Rooftops defeat trigger and the [Tech] conditional move-a-villain.
  - Spider-Woman - Arachno-Pheromones correctly implements the [Spider-Friends] conditional (put recruited Hero on top of deck).

---

## Cross-Expansion Summary

| Expansion | Cards Audited | Issues | High | Medium | Low |
|-----------|--------------|--------|------|--------|-----|
| Core Set | ~100 | 1 | 0 | 1 | 0 |
| Dark City | ~100+ | 0 | 0 | 0 | 0 |
| Fantastic Four | ~30 | 1 | 0 | 0 | 1 |
| Guardians of the Galaxy | ~30 | 2 | 1 | 0 | 1 |
| Paint the Town Red | ~30 | 0 | 0 | 0 | 0 |
| **TOTAL** | **~290** | **4** | **1** | **1** | **2** |

---

## All Issues by Severity

### HIGH (1)

1. **Rocket Raccoon - Vengeance is Rocket** — `cumulativePlayerAttack` undefined variable at `expansionGuardiansOfTheGalaxy.js:6513`. Fix: replace with `cumulativeAttackPoints`.

### MEDIUM (1)

2. **Iron Man - Arc Reactor** — `IronManArcReactorBonusAttack()` logs "Tech Heroes" count but `bonusAttack()` calculates from Black-colored cards. Log is inaccurate; mixed-expansion play gives wrong attack values. Fix: change DB `multiplier` from `"Black"` / `multiplierAttribute: "color"` to use class-based counting, or rewrite the function to not delegate to `bonusAttack()`.

### LOW (2)

3. **Invisible Woman - Four of a Kind** — missing `cumulativeAttackPoints += 2` at `expansionFantasticFour.js:4305`. Fix: add the line after `totalAttackPoints += 2`.

4. **Gamora - Galactic Assassin** — wrong popup title "GAMORA - BOUNTY HUNTER" at `expansionGuardiansOfTheGalaxy.js:5013`. Fix: change to `"GAMORA - GALACTIC ASSASSIN"`.

---

## Previously Known Deferred Items (Not Re-audited)

The following items are tracked in CLAUDE.md and the health-check report. They are confirmed still present but were not re-audited in this run (fix timing deferred):

- **L6**: `morgAmbush` in `expansionFantasticFour.js:3239` iterates `i < 5` hardcoded instead of `i < hq.length`. Low impact since HQ is always 5 slots.

---

*Audit run: 2026-03-31. Reference files: `docs/card-effects-reference/`. Auditor: Card Effect Auditor subagent.*
