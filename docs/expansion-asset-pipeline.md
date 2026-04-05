# Expansion Asset Pipeline

Detailed reference for staging, naming, inventory, and import processes. Referenced from CLAUDE.md.

---

## Overview
- **Staging area**: `expansions/[name]/` at project root — raw images + PDFs per expansion; outside game root so never served by GitHub Pages
- **Production**: `Visual Assets/` inside the game root — heroes go in `Visual Assets/Heroes/[Expansion Display Name]/`, everything else in flat type folders
- **Import mapping** (staging subfolder → production folder):
  - `Heroes/` → `Visual Assets/Heroes/[Expansion Display Name]/`
  - `Villains/` → `Visual Assets/Villains/`
  - `Masterminds/` → `Visual Assets/Masterminds/`
  - `Schemes/` → `Visual Assets/Schemes/`
  - `Henchmen/` → `Visual Assets/Henchmen/`
  - `Bystanders/` → `Visual Assets/Other/Bystanders/`
  - `Sidekicks/` → `Visual Assets/Sidekicks/`
- When it's time to import: copy files directly — no renaming needed at that stage, names are already production-ready

## Staging Subfolder Structure
Every organized expansion folder must have these subfolders (create only what the expansion has cards for):
```
expansions/[expansion-name]/
  Heroes/
  Villains/
  Masterminds/
  Schemes/
  Henchmen/
  Bystanders/
  Sidekicks/
  Locations/   <- only for expansions with Location cards (e.g. Revelations)
  Officers/    <- only for S.H.I.E.L.D. expansion (named S.H.I.E.L.D. Officers)
```

## File Naming Convention
Prefix = CamelCase expansion name, no spaces (e.g. `Revelations_`, `HeroesOfAsgard_`, `XMen_`, `SecretWarsV1_`)

| Card type | Format |
|---|---|
| Hero | `[Prefix]_[HeroName]_[CardTitle].webp` |
| Villain | `[Prefix]_[VillainGroup]_[CardName].webp` |
| Mastermind lead | `[Prefix]_[MastermindName].webp` |
| Mastermind tactic | `[Prefix]_[MastermindName]_[TacticName].webp` |
| Mastermind epic | `[Prefix]_[MastermindName]_Epic.webp` |
| Scheme | `[Prefix]_[SchemeName].webp` |
| Henchmen (standalone) | `[Prefix]_[CardName].webp` |
| Henchmen (grouped) | `[Prefix]_[HenchmenGroup]_[CardName].webp` |
| Bystander / Sidekick | `[Prefix]_[CardName].webp` |
| Location (villain-group) | `[Prefix]_[VillainGroup]_[LocationName].webp` |

**Name formatting rules:**
- All names CamelCase, no spaces
- Article "The": always at the front — `TheHood`, `TheKorvacSaga` (not `HoodThe`)
- Hyphens: keep when part of the actual card name (`Noh-Varr`, `World-Serpent`, `Electro-Blast`); remove if they replaced spaces in the source filename
- Disambiguators in parentheses: fold in, drop parens — `CaptainMarvelNohVarr` not `CaptainMarvel(Noh-Varr)`
- `+` signs in source filenames: remove, run words together CamelCase
- Villain group cards: parse the group name and individual card name — insert underscore between them

## Staging Process (for each unorganized expansion)
1. Run `ls` on the raw staging folder to see all files
2. Read card images in batches to extract card names where filenames have `_1Rare`/`_2Common`/`_3Common`/`_4Uncommon` suffixes
3. Read mastermind tactic images (numbered Tactic1-4) to extract tactic names
4. **Stop and ask the user before proceeding** when:
   - A card title is partially obscured or unreadable
   - An unfamiliar card type appears (e.g. Henchman-Villain, Location, Henchman Location, or any type not in the table above)
5. Present the full rename plan as a table for user approval before executing any changes
6. After approval: create subfolders, rename files, move into subfolders
7. After organizing: produce the **hero data list** in-chat (see below) — hero name, 4 card names, cost of each, team affiliation, class; flag uncertain icon reads for user confirmation
8. Once user confirms/corrects the list, save finalized version to `docs/card-inventory/drafts/[expansion].md`
9. **Update CLAUDE.md** after each expansion: mark it done, remove resolved pending details, add any interim plan/next-step context needed for seamless session handoff
10. Do NOT invoke `/new-expansion` or `/analyze-expansion` during staging — those skills are for the implementation phase after inventory is finalized

## Card Inventory

**Three-pass process for every expansion:**
- **Pass 1** — Build the file in a fresh session: `/inventory-creator`
- **Pass 2** — Independent verification in a fresh session: `/inventory-verifier`
- **Pass 3** — User spot-check with physical cards; focused on remaining flags and placeholders

**Partial sessions are supported** — state the scope at the start (e.g., "heroes only"). The file accumulates sections across sessions.

**Sources — answer one question to determine which to use:**

> Is this expansion already coded in the game?

**Yes (Core Set, Dark City, F4, GotG, PtTR, any future coded expansion):**
1. `cardDatabase.js` — all structured fields; copy counts derived from `rarity` field
2. Card images in `Visual Assets/Heroes/[Expansion Display Name]/` — primary source for hero effect text (DB doesn't store it)
3. `cardAbilities*.js` / expansion files / `script.js` — cross-reference for all effect text; trust card text over code when they disagree

**No (Revelations, Secret Wars, Heroes of Asgard, X-Men, all unstaged expansions):**
1. PDF inventory in `expansions/[expansion-name]/` — everything
2. Card images in `expansions/[expansion-name]/` subfolders — cross-check
3. `docs/card-inventory/final/[expansion].md` if exists — additional cross-check

**Output:** `docs/card-inventory/drafts/[expansion].md`, following `docs/card-inventory/TEMPLATE.md` exactly. After all passes complete, move from `drafts/` to `final/` (same filename).

## Pipeline Status

See `docs/expansion-pipeline-status.md` for the full status table and per-expansion session handoff notes.

## Visual Reference Setup

At the start of each expansion inventory session, `Read` `docs/card-inventory/icons/icon-reference.md` — a single text file with hyper-detailed descriptions of all class icons, team icons, recruit/attack icons, card layout anatomy, value notation, and inline trigger icon identification.

If any description proves insufficient for a specific card, the original PNG files are available in `docs/card-inventory/icons/` as fallback — `icon-reference.md` Part 9 lists what each file covers.

**Source:** `Icons.pdf` saved to `docs/card-inventory/icons/Icons.pdf`; card layout pages extracted from `rules/Legendary_Rules-Core_Set.pdf` pages 5, 7, 8, 10 via `pdftoppm -r 150 -png`.
