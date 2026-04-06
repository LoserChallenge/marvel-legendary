# Expansion Pipeline Status

Last updated: 2026-04-06 (Revelations implementation started)

## Pipeline Tracks

**Track A — New expansions (not yet in game):**
1. `/stage-expansion` — organize and rename files in staging folder
2. `/inventory-creator` — Pass 1: build card-data.md (PDF inventory as primary source)
3. `/inventory-verifier` — Pass 2: independent verification, flag discrepancies only
4. User final review with physical cards
5. Move finalized `docs/card-inventory/drafts/[expansion].md` → `docs/card-inventory/final/[expansion].md`
6. `/analyze-expansion` — collaborative rules analysis; produces mechanics reference in `docs/expansion-mechanics/`
7. `/new-expansion` — multi-phase code integration with progress tracking in `docs/expansion-progress/`

**Track B — In-game expansions (already coded):**
1. ~~Stage~~ — skip; images already in `Visual Assets/Heroes/[Expansion Display Name]/`
2. `/inventory-creator` — Pass 1: build card-data.md (**DB-primary** — see CLAUDE.md Track B sources)
3. `/inventory-verifier` — Pass 2: independent verification using same DB-primary sources
4. User final review (lighter bar — cards already work; confirming format + catching undocumented edge cases)
5. Move finalized `docs/card-inventory/drafts/[expansion].md` → `docs/card-inventory/final/[expansion].md`

*Track B expansions are already in the game — steps 6-7 do not apply.*

---

## Current Status

| Expansion | Track | Staged | Pass 1 | Pass 2 | User Review | In final/ | Analyze | Implement |
|---|---|---|---|---|---|---|---|---|
| core-set | B | n/a | ✅ 2026-04-03 | ✅ 2026-04-03 | ✅ 2026-04-03 | ✅ | n/a | n/a |
| dark-city | B | n/a | ✅ 2026-04-03 | ✅ 2026-04-03 | ✅ 2026-04-04 | ✅ | n/a | n/a |
| fantastic-four | B | n/a | ✅ 2026-04-03 | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ | n/a | n/a |
| guardians-of-the-galaxy | B | n/a | ✅ 2026-04-03 | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ | n/a | n/a |
| paint-the-town-red | B | n/a | ✅ 2026-04-03 | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ | n/a | n/a |
| revelations | A | ✅ | ✅ | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ | ✅ 2026-04-05 | ⏳ started 2026-04-06 |
| secret-wars-vol1 | A | ✅ | ✅ | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ | — | — |
| heroes-of-asgard | A | ✅ | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ | — | — |
| x-men | A | ✅ | ✅ 2026-04-04 | ✅ 2026-04-05 | ✅ 2026-04-05 | ✅ | — | — |
| into-the-cosmos | A | ✅ 2026-04-05 | ✅ 2026-04-05 | ✅ 2026-04-05 | ✅ 2026-04-05 | ✅ | — | — |
| messiah-complex | A | ✅ 2026-04-05 | — | — | — | — | — | — |
| shadows-of-nightmare | A | ✅ 2026-04-05 | — | — | — | — | — | — |
| shield | A | ✅ 2026-04-04 | ✅ 2026-04-05 | — | — | — | — | — |
| the-new-mutants | A | ✅ 2026-04-05 | — | — | — | — | — | — |
| weapon-x | A | ✅ 2026-04-05 | ✅ 2026-04-05 | — | — | — | — | — |
| world-war-hulk | A | ✅ 2026-04-05 | — | — | — | — | — | — |

---

## Expansion Notes (for session handoff)

### Core Set
✅ All passes complete (2026-04-03). Finalized at `docs/card-inventory/final/core-set.md`.

### Dark City
All passes complete (2026-04-04). Finalized at `docs/card-inventory/final/dark-city.md`. Pass 2 applied 10 corrections (icon swaps, Attack/Recruit mix-ups, scheme rewrites from physical cards). User review done during Pass 2 session (physical card confirmations provided inline).

Remaining notes:
- Cable Disaster Survivalist: verify in-game behavior matches card text
- "Other player" effects: broader review conversation for solo mode
- Death: code scope fix (includes played cards + artifacts, should be hand only)

### Fantastic Four
✅ All passes complete (2026-04-04). Finalized at `docs/card-inventory/final/fantastic-four.md`. Pass 2 applied 10 corrections (Unseen Rescue cap, Power Cosmic notation, Firelord/Stardust/Terrax text, Mole Man passive, 3 scheme rewrites).

### Paint the Town Red
✅ All passes complete (2026-04-04). Finalized at `docs/card-inventory/final/paint-the-town-red.md`. Pass 2 applied 12 corrections (Pickpocket/Jinx text, Wall-Crawl count, 3 variable-attack villains, Shriek/Carrion/MaxCarnage text, 3 scheme rewrites). Shriek feast wound rider flags a potential code bug — card says "each other player" (suppressed in solo) but code applies to active player.

### Guardians of the Galaxy
✅ All passes complete (2026-04-04). Finalized at `docs/card-inventory/final/guardians-of-the-galaxy.md`. Pass 2 applied 12 corrections (Godslayer Blade missing "Once per turn", Soul Gem wrong passive trigger, Captain Atlas missing passive, Supreme Intel/Countermeasure/Guide Kree paraphrased, all 4 Thanos tactics solo-adapted, all 4 scheme bystander counts, Forge twist text). All original ⚠️ resolved. Kree-Skrull War tie handling documented as code decision (card text silent on ties).

### Revelations
✅ All passes complete (2026-04-04). Finalized at `docs/card-inventory/final/revelations.md`. New card types: Locations (4 per villain group), Transforming Schemes (4 double-sided), Mandarin's Rings (10 unique henchmen), HYDRA Base (Henchman Location). New keywords: Hyperspeed, Dark Memories, Last Stand. Pass 2 found 0 corrections — cleanest Pass 1 of any expansion.

`/analyze-expansion` complete (2026-04-05). Mechanics reference at `docs/expansion-mechanics/revelations.md`.

`/new-expansion` started (2026-04-06). Infrastructure-first build order — dynamic city refactor → Location system → small infrastructure bundle → content phases. Progress tracked at `docs/expansion-progress/revelations.md`.

### Heroes of Asgard
✅ All passes complete (2026-04-04). Finalized at `docs/card-inventory/final/heroes-of-asgard.md`. 5 heroes, 2 villain groups (Dark Council, Omens of Ragnarok), 2 masterminds (Malekith, Hela), 4 schemes, no henchmen/bystanders/sidekicks. New card type: Villainous Weapons (2 per villain group, also on some mastermind tactics). New keywords: Worthy, Thrown Artifact, Villainous Weapon, Conqueror, Artifact. Pass 2 applied 3 corrections: "The this Tactic"→"Then this Tactic" (3 Malekith tactics), Surtur VP resolved as — (becomes Artifact), Thrown Artifact base values changed from 0+ to — (6 cards). Laufey Ambush text confirmed as card misprint ("Eternal" vs "Ancient Winters"). Solo notes: The Mangog and Naglfar have "player on your right" effects needing solo-mode decisions.

### Secret Wars Vol. 1
✅ All passes complete (2026-04-04). Finalized at `docs/card-inventory/final/secret-wars-vol1.md`. 14 heroes, 6 villain groups (incl. dual-nature Manhattan Earth-1610), 4 masterminds, 8 schemes, 3 henchmen groups (incl. dual-nature Thor Corps), 1 bystander, 1 sidekick type, 30 Ambitions. New keywords: Teleport, Rise of the Living Dead, Cross-Dimensional Rampage, Bribe. Pass 2 applied 8 corrections: tactic name typo ("Love to Have You for Dinner"), class icon fix (Revert to Bruce Banner: STRENGTH→TECH), 4 Sentinel Territories flavor prefixes already present in file, 2 minor wording fixes. All 11 icon flags resolved via BGG reference. Tactic VP/Fight values filled (user confirmed). **Deferred:** Deadlands/Wasteland/Ambitions implementation — unique rules, low priority.

### X-Men
✅ All passes complete (2026-04-05). Finalized at `docs/card-inventory/final/x-men.md`. Pass 2 found 4 ❌ errors (Dark Angel X-Gene text, Guillotine Roller Coaster spelling, 2x Deathbird token compound words) + 4 ⚠️ spot-checks. Pass 3 physical check resolved all: Ninjutsu ✅, Nemesis 5→5+, Animatronic discrepancy confirmed (Trap=3, Token=4 — genuine printing error, token authoritative), Jubilee 5+ ✅.

### Into the Cosmos
✅ All passes complete (2026-04-05). Finalized at `docs/card-inventory/final/into-the-cosmos.md`. 9 heroes, 4 villain groups (Black Order of Thanos, Celestials, Elders of the Universe, From Beyond), 3 masterminds (Magus, The Grandmaster, The Beyonder), 4 schemes, 2 henchmen groups, 3 special bystanders. New mechanics: Shards (unlimited supply, overrides GotG cap), Burn N Shards, Danger Sense (hero + villain variant for Black Order), Celestial Boons (permanent fight rewards), Contest of Champions, Cosmic Threat expanded (cost-based for Beyonder, dual-class for Celestials). Pass 2 found 0 corrections — all effect text verified clean. 10 hero cards confirmed to have no Attack/Recruit icon (all value from abilities). Galactic Rogue cost 5 and Martyr cost 3 confirmed correct against reference.

### Messiah Complex
✅ Staged 2026-04-05. 90 images organized into Heroes/ (32), Masterminds/ (18), Villains/ (20), Henchmen/ (2), Schemes/ (8), Bystanders/ (3), Sidekicks/ (7). Key finding: 7 Special Sidekick cards, 8 Schemes (4 Veiled + 4 Unveiled paired mechanic). **Next:** Pass 1 inventory.

### Shadows of Nightmare
✅ Staged 2026-04-05. 45 images organized into Heroes/ (20), Masterminds/ (12), Villains/ (9), Schemes/ (4). Note: DoctorStrange has two `_3` files (_3Common + _3Uncommon) — both correct. **Next:** Pass 1 inventory.

### New Mutants (the-new-mutants)
✅ Staged 2026-04-05. 47 images organized into Heroes/ (20), Masterminds/ (12), Villains/ (11), Schemes/ (4). Flag: Warlock Rare named "XanticShapeshifter" — verify spelling with physical card at Pass 3. **Next:** Pass 1 inventory.

### Weapon X
✅ Staged 2026-04-05. Pass 1 complete 2026-04-05. Full inventory at `docs/card-inventory/drafts/weapon-x.md`. 4 heroes, 2 villain groups (Berserkers, Weapon Plus), 3 masterminds (Omega Red, Romulus, Sabretooth), 3 schemes, 10 Enraging Wounds (unique card type). No henchmen/bystanders/sidekicks. New keywords: Berserk (hero + villain variants), Weapon X Sequence (hero + enemy variants), Fail, Enraging Wounds with Healing. Open ⚠️ flags: all villain copy counts unknown (reference lists "?"); Feral VP unclear (dual-nature card becomes Hero on defeat); Violent Conditioning cost 3 lower than both Commons; Omega Red "Always Leads: Any Villain Group" unusual. **Next:** Pass 2 inventory (`/inventory-verifier` in fresh session).

### World War Hulk
✅ Staged 2026-04-05. 165 images organized into Heroes/ (78), Masterminds/ (36), Villains/ (36), Henchmen/ (3), Schemes/ (8), Bystanders/ (4). Key notes: 15 transforming heroes (each has 4 standard cards + 1–3 transform cards); 6 transforming masterminds (each has lead + transformed form + 4 tactics); Sentry exists as both hero and mastermind (different cards). `HulkbusterIronMan_4UncommonPromo` confirmed via image read as Ultra-Massive Armor (the transform card — mislabeled in source). Hero card titles deduced from reference file (cost/copy-count logic) rather than image reads — Pass 1/2 should verify against card images. **Next:** Pass 1 inventory.

### S.H.I.E.L.D.
✅ Staged 2026-04-04. Pass 1 complete 2026-04-05. Full inventory at `docs/card-inventory/drafts/shield.md`. 4 heroes (all S.H.I.E.L.D. team), 2 villain groups (HYDRA Elite, A.I.M. HYDRA Offshoot), 2 Adapting Masterminds (HYDRA High Council, HYDRA Super-Adaptoid — no lead card, 4 rotating tactics each), 4 schemes, 8 named S.H.I.E.L.D. Officers (2 copies each). New keywords: Undercover, S.H.I.E.L.D. Level, Hydra Level, Adapting Masterminds. Open ⚠️ flags: Taskmaster erratum (printed 3+/4VP, errata 3/2VP); Hail Hydra twist count discrepancy (11 setup but effects only to Twist 10). Production import note: `Visual Assets/Heroes/SHIELD/` already holds grey starters — folder naming strategy deferred to import time. **Next:** Pass 2 inventory (`/inventory-verifier` in fresh session).
