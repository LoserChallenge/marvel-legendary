---
name: inventory-creator
description: Use when building the Pass 1 card inventory file for a Marvel Legendary expansion. Works for any expansion — whether already in the game or not. Supports full or partial scope (heroes only, masterminds and schemes, etc.)
---

# Inventory Creator — Pass 1

Builds (or adds to) the card inventory file for one expansion. This is Pass 1 of a three-pass process:
- **Pass 1 (this skill):** Build the inventory file
- **Pass 2:** Independent verification in a fresh session — `/inventory-verifier`
- **Pass 3:** User spot-check with physical cards, focused on remaining `⚠️` flags and `[___]` placeholders

---

## Before Starting: Confirm Scope

The user states which expansion and which card types to cover this session. Default is all card types present in the expansion.

**Partial sessions are fully supported.** Examples of valid scopes:
- "Fantastic Four — all card types"
- "Fantastic Four — heroes only"
- "Core Set — villains, henchmen, and schemes"
- "Secret Wars Vol. 1 — masterminds and schemes only"

If the expansion's inventory file already exists with completed sections, append the new sections without disturbing completed ones. Maintain the status comment at the top of the file (see Output section).

---

## Pre-Session Setup (Mandatory)

Before reading any card data, read this single reference file:

```
docs/card-effects-reference/icons/icon-reference.md
```

This covers all class icons, team icons, recruit/attack icons, card layout anatomy, value notation, and inline trigger icon identification. It replaces loading multiple PNG files.

If any icon description proves insufficient for a specific card during the session, the original PNG files are available as a fallback — see Part 9 of the reference file for the file list and what each covers.

---

## Determine Sources

Answer one question: **Is this expansion already coded in the game?**

---

### YES — Expansion is in the game

*(Core Set, Dark City, Fantastic Four, Guardians of the Galaxy, Paint the Town Red, or any future coded expansion)*

**Source priority:**

1. **`cardDatabase.js`** — primary source for **structured fields only**:
   - Card names, class, team, cost (heroes), fight values (villains/masterminds/henchmen), VP
   - Hero copy counts: NOT stored directly — derive from the `rarity` field using the rule in `generateHeroDeck()` (`script.js:3649`): `"Common"` → 5, `"Common 2"` → 5, `"Uncommon"` → 3, `"Rare"` → 1. Flag ⚠️ if any hero deviates from the 1R/1U/2C pattern
   - Villain group totals, scheme names, mastermind names and `alwaysLeads` field

2. **Card images in `Visual Assets/Heroes/[Expansion Display Name]/`** — primary source for **all effect text**. The card images are the single source of truth for how the game works. Capture text as close to verbatim as possible, especially optionality language ("You may", "If you do") which is mechanically significant. Do not categorize or reinterpret effects based on how the code implements them.

3. **`cardAbilities.js` / `cardAbilitiesDarkCity.js` / `script.js` / relevant expansion files** — **cross-reference only** for effect text. Use to resolve ambiguity when a card image is unclear (e.g., a trigger icon is too small to read). Never let code override or reword what the card says. If the card text and the code appear to disagree, record the card text and flag ⚠️ for the user to investigate.

---

### NO — Expansion is not yet in the game

*(Revelations, Secret Wars Vol. 1, Heroes of Asgard, X-Men, and all other new/unbuilt expansions)*

**Source priority:**

1. **Card images in `expansions/[expansion-name]/` subfolders** — primary source for **all effect text**. Card images are the single source of truth for how the game works. Capture text as close to verbatim as possible, especially optionality language ("You may", "If you do") which is mechanically significant.

2. **PDF inventory in `expansions/[expansion-name]/`** — primary source for **structured fields**: card names, copy counts, costs, fight values, VP, team/class if listed. Also useful as a cross-check for effect text, but defer to card images when phrasing differs.

3. **`docs/card-effects-reference/[expansion].md`** if it exists — additional cross-check only

**Team and Class values (not-in-game expansions):**
- Fill from PDF if listed
- If PDF does not list them, leave `___` — user fills these from physical cards
- Never read team or class solely from card images

---

## Execution Strategy (Mandatory)

Use parallel subagents — one per card type within the stated scope. Do not work sequentially across card types.

**Orchestrator steps:**
1. Confirm which card types are in scope for this session
2. For not-in-game expansions: read the full PDF first to identify all card types and page ranges, then dispatch subagents
3. Dispatch one subagent per in-scope card type simultaneously — Heroes, Villains, Masterminds, Schemes, Henchmen, Bystanders/Sidekicks, and any expansion-specific types (e.g., Locations, Ambitions)
4. Each subagent receives: its card type, the relevant source sections, and instructions to use `icon-reference.md` for all icon identification
5. Collect results and assemble into the output file

Do not batch multiple card types into one subagent.

---

## Unfamiliar Card Types

If you encounter a card that does not clearly fit a standard type (Hero, Villain, Mastermind, Scheme, Henchmen, Bystander, Sidekick) and is not a previously documented expansion-specific type (e.g., Ambitions from Secret Wars, Locations from Revelations):

**Stop immediately.** Note the card name or filename and ask the user how to handle it before continuing.

---

## Notation Rules

| Notation | Meaning |
|---|---|
| `⚠️` | Uncertain value — needs human spot-check |
| `[___]` | Unresolved trigger icon in effect text |
| `___` | Team or Class not confirmed from source — user fills from physical cards |
| `0+` | Base 0, modified by ability |
| `[N]+` | Base value of N, plus conditional bonus from ability |
| `[N]*` | Asterisk value — record the card's specific effect text condition alongside it |
| `—` | Stat not applicable to this card type |

**Never use flavor, theme, or character reasoning to fill uncertain values.** If a value cannot be confirmed from available sources, use the appropriate placeholder.

---

## Output Format

Save to `docs/staging-plans/[expansion]-card-data.md`.

**Follow `docs/card-effects-reference/TEMPLATE.md` exactly** — same section structure, table columns, notation, and SPECIAL ABILITY / SUPERPOWER convention for all card types.

**Status comment (add or update at the top of the file):**
```
<!-- INVENTORY STATUS:
  Heroes: ✅ / ⏳ / — (not in scope)
  Villains: ✅ / ⏳ / —
  Masterminds: ✅ / ⏳ / —
  Schemes: ✅ / ⏳ / —
  Henchmen: ✅ / ⏳ / —
  Bystanders/Sidekicks: ✅ / ⏳ / —
  [Expansion-specific types]: ✅ / ⏳ / —
  Last updated: YYYY-MM-DD
-->
```

Update this comment each session as sections are completed.
