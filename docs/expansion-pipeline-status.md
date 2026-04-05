# Expansion Pipeline Status

Last updated: 2026-04-04 (pipeline redesign: added analyze + implement steps)

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
| revelations | A | ✅ | ✅ | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ | — | — |
| secret-wars-vol1 | A | ✅ | ✅ | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ | — | — |
| heroes-of-asgard | A | ✅ | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ 2026-04-04 | ✅ | — | — |
| x-men | A | ✅ | ✅ 2026-04-04 | — | — | — | — | — |
| into-the-cosmos | A | ❌ | — | — | — | — | — | — |
| messiah-complex | A | ❌ | — | — | — | — | — | — |
| shadows-of-nightmare | A | ❌ | — | — | — | — | — | — |
| shield | A | ✅ 2026-04-04 | — | — | — | — | — | — |
| the-new-mutants | A | ❌ | — | — | — | — | — | — |
| weapon-x | A | ❌ | — | — | — | — | — | — |
| world-war-hulk | A | ❌ | — | — | — | — | — | — |

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

### Heroes of Asgard
✅ All passes complete (2026-04-04). Finalized at `docs/card-inventory/final/heroes-of-asgard.md`. 5 heroes, 2 villain groups (Dark Council, Omens of Ragnarok), 2 masterminds (Malekith, Hela), 4 schemes, no henchmen/bystanders/sidekicks. New card type: Villainous Weapons (2 per villain group, also on some mastermind tactics). New keywords: Worthy, Thrown Artifact, Villainous Weapon, Conqueror, Artifact. Pass 2 applied 3 corrections: "The this Tactic"→"Then this Tactic" (3 Malekith tactics), Surtur VP resolved as — (becomes Artifact), Thrown Artifact base values changed from 0+ to — (6 cards). Laufey Ambush text confirmed as card misprint ("Eternal" vs "Ancient Winters"). Solo notes: The Mangog and Naglfar have "player on your right" effects needing solo-mode decisions.

### Secret Wars Vol. 1
✅ All passes complete (2026-04-04). Finalized at `docs/card-inventory/final/secret-wars-vol1.md`. 14 heroes, 6 villain groups (incl. dual-nature Manhattan Earth-1610), 4 masterminds, 8 schemes, 3 henchmen groups (incl. dual-nature Thor Corps), 1 bystander, 1 sidekick type, 30 Ambitions. New keywords: Teleport, Rise of the Living Dead, Cross-Dimensional Rampage, Bribe. Pass 2 applied 8 corrections: tactic name typo ("Love to Have You for Dinner"), class icon fix (Revert to Bruce Banner: STRENGTH→TECH), 4 Sentinel Territories flavor prefixes already present in file, 2 minor wording fixes. All 11 icon flags resolved via BGG reference. Tactic VP/Fight values filled (user confirmed). **Deferred:** Deadlands/Wasteland/Ambitions implementation — unique rules, low priority.

### X-Men
Staged ✅. Pass 1 complete (2026-04-04), draft at `docs/card-inventory/drafts/x-men.md`. Awaiting Pass 2. Many new card types — see CLAUDE.md "X-Men Expansion — New Card Types" section. BGG reference file is 107K+ tokens; requires Grep + targeted line ranges for subagents.

### S.H.I.E.L.D.
Staged ✅ (2026-04-04). 44 card images organized into `expansions/shield/` with subfolders: Heroes (16), Masterminds (8), Villains (8), Schemes (4), Officers (8). Prefix: `Shield_`. Reference file: `shield-reference.md`.

**New card types:**
- **Adapting Masterminds** (HYDRA High Council, HYDRA Super-Adaptoid) — no lead card; 4 tactics rotate on top, whichever is face-up acts as the Mastermind.
- **Named S.H.I.E.L.D. Officers** — 8 unique cards (2 copies each) with individual abilities, replacing/supplementing the generic Officers from the Core Set.

**New keywords:** Undercover (send S.H.I.E.L.D. Hero to Victory Pile for 1VP), S.H.I.E.L.D. Level (count S.H.I.E.L.D./HYDRA cards in Victory Pile), Hydra Level (count S.H.I.E.L.D./HYDRA cards in Escape Pile).

**Production import note:** Existing `Visual Assets/Heroes/SHIELD/` holds grey starters (Agent, Trooper, Officer). The expansion's hero team and named Officers will need a folder naming strategy to coexist — e.g. `Visual Assets/Heroes/S.H.I.E.L.D./` for the hero team, Officers alongside existing grey starters in `SHIELD/`. Decision deferred to import time.
