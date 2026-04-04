---
name: stage-expansion
description: Use when organizing a raw Marvel Legendary expansion staging folder — surveys files, extracts card names from images, and executes a rename-and-sort plan approved by the user
---

# Stage Expansion

Organizes the raw staging folder for one expansion: survey files, extract card names, present a rename plan for approval, then execute.

This skill covers file organization only. Card inventory and cataloging are separate steps.

---

## Step 1: Survey the folder

```bash
ls expansions/[expansion-name]/
```

Note all filenames. Raw files typically use suffixes: `_1Rare`, `_2Common`, `_3Common`, `_4Uncommon` (hero cards); `Tactic1`–`Tactic4` (mastermind tactics).

---

## Step 2: Read card images for names (Parallel)

Dispatch one subagent per card type simultaneously. Each subagent reads its images to extract card titles and returns rename mappings plus any flagged files.

Card type groups:
- **Heroes** — read all 4 images per hero to get card titles
- **Mastermind tactics** — read Tactic1–4 images for tactic names
- **Villains** — read each group's cards for group name + individual card names
- **Schemes, Henchmen, Bystanders, Sidekicks** — read each for names

**If a card is unreadable, unrecognizable, or does not clearly fit a standard card type:**
- Leave the file exactly where it is — do not rename, move, or categorize it
- Record it in a "Needs Manual Review" list
- Continue processing all remaining files normally

Do not stop mid-process to ask the user. All flagged files are presented together at the end of the rename plan.

---

## Step 3: Present the rename plan for approval

Show the complete rename table, followed by any flagged files:

| Current filename | Renamed to |
|---|---|
| ... | ... |

If any files were flagged during Step 2, list them after the table:

**Needs Manual Review:**
- `[filename]` — reason (unreadable title / unfamiliar card type / does not fit standard types)

Do NOT execute any changes until the user approves.

---

## Step 4: Execute

Create subfolders, rename files, move into subfolders:

```
expansions/[expansion-name]/
  Heroes/
  Villains/
  Masterminds/
  Schemes/
  Henchmen/
  Bystanders/    ← only if expansion has bystanders
  Sidekicks/     ← only if expansion has sidekicks
```

---

## File Naming Convention

**Prefix** = CamelCase expansion name, no spaces (e.g. `Revelations_`, `HeroesOfAsgard_`, `XMen_`)

| Card type | Format |
|---|---|
| Hero card | `[Prefix]_[HeroName]_[CardTitle].webp` |
| Villain card | `[Prefix]_[VillainGroup]_[CardName].webp` |
| Mastermind lead | `[Prefix]_[MastermindName].webp` |
| Mastermind tactic | `[Prefix]_[MastermindName]_[TacticName].webp` |
| Mastermind epic tactic | `[Prefix]_[MastermindName]_Epic.webp` |
| Scheme | `[Prefix]_[SchemeName].webp` |
| Henchmen (standalone) | `[Prefix]_[CardName].webp` |
| Henchmen (grouped) | `[Prefix]_[HenchmenGroup]_[CardName].webp` |
| Bystander / Sidekick | `[Prefix]_[CardName].webp` |

**Name formatting rules:**
- CamelCase, no spaces
- "The": always at front — `TheHood`, not `HoodThe`
- Hyphens: keep when part of the real name (`Noh-Varr`, `Electro-Blast`); remove if they replaced spaces in the source filename
- Disambiguators in parentheses: fold in, drop parens — `CaptainMarvelNohVarr` not `CaptainMarvel(Noh-Varr)`
- `+` signs: remove, run words together CamelCase
- Villain group cards: parse group name and individual card name — insert underscore between them
