---
name: inventory-verifier
description: Use when independently verifying a Marvel Legendary card inventory log (Pass 2 of three). Run in a fresh session from Pass 1. Works for any expansion and any scope.
---

# Inventory Verifier — Pass 2

Independently verify the card data log built in Pass 1. You did **not** create this log — your job is to catch errors with fresh eyes, without any bias from the original session.

Run this in a **separate session** from Pass 1.

After this pass, the user performs Pass 3: a final spot-check with physical cards focused on any remaining `⚠️` flags and `[___]` placeholders.

---

## Before Starting: Confirm Scope

Read the status comment at the top of `docs/staging-plans/[expansion]-card-data.md` to identify which sections were completed in Pass 1.

Verify only the sections that Pass 1 completed (marked ✅ in the status comment). Confirm with the user before beginning: "I'm verifying [list of card types]. Is that the correct scope?"

---

## Pre-Session Setup (Mandatory)

Before reading any card data, read this single reference file:

```
docs/card-effects-reference/icons/icon-reference.md
```

Same as Pass 1. If any description proves insufficient for a specific icon, the original PNG files are available as a fallback — see Part 9 of the reference file.

---

## Determine Sources

Use the same source question as Pass 1: **Is this expansion already coded in the game?**

**YES — in the game:**
1. `cardDatabase.js` — primary source for **structured fields only** (names, costs, teams, classes, values)
2. Card images in `Visual Assets/Heroes/[Expansion Display Name]/` — primary source for **all effect text**. Card images are the single source of truth for how the game works. Do not categorize or reinterpret effects based on how the code implements them.
3. `cardAbilities.js` / `cardAbilitiesDarkCity.js` / `script.js` / expansion files — **cross-reference only** for effect text. If card text and code appear to disagree, trust the card text and flag ⚠️ for the user.

**NO — not yet in the game:**
1. Card images in `expansions/[expansion-name]/` subfolders — primary source for **all effect text**. Card images are the single source of truth for how the game works.
2. PDF inventory in `expansions/[expansion-name]/` — primary source for **structured fields** (names, counts, costs, values). Cross-check for effect text, but defer to card images when phrasing differs.
3. `docs/card-effects-reference/[expansion].md` if it exists — additional cross-check only

**Do not refer to the Pass 1 log while consulting these sources.** Build your own independent understanding from the source materials first, then compare against the log.

---

## Execution Strategy (Mandatory)

Use parallel subagents — one per card type in scope. Do not verify card types sequentially.

**Orchestrator steps:**
1. Read the card-data.md log to identify which sections are in scope
2. Dispatch one subagent per in-scope card type simultaneously
3. Each subagent receives: its section of the card-data.md log, the relevant source materials, and the flagging rules from this skill
4. Each subagent consults sources independently first, then compares against the Pass 1 log entries
5. Collect all results and assemble the final verification summary and annotated log

---

## Verification Process (per subagent)

For each entry, check in this order:

1. **Against primary source** (DB or PDF): card name, copy count, cost/fight value, VP, team/class (if determinable from source)
2. **Against code or images**: effect text accuracy; trigger icons in Superpowers — use `icon-reference.md` for identification
3. **Internal consistency**: hero distribution (expected 1R/1U/2C per hero), villain group totals, value plausibility for cost tier

---

## Flagging Rules

**Only flag. Do not edit the card-data.md file.**

| Marker | Meaning |
|---|---|
| ✅ | Confirmed against reference source |
| ⚠️ | Could not fully verify — needs human spot-check |
| ❌ | Contradicts reference source |

**Preserve all existing `⚠️` flags and `[___]` placeholders from Pass 1.** Do not remove them even if you believe the value is correct. If you can confirm a previously flagged value, write `⚠️ ✅ confirmed` alongside it — the `⚠️` stays visible for the user; the `✅ confirmed` records your finding.

**Effect text:** Minor wording differences are acceptable if the mechanical meaning is identical. Flag `❌` only if the effect would function differently in play. **Exception:** Optionality language is never a "minor" difference. "You may X" vs "X" (optional vs mandatory) and "If you do, Y" vs "to gain Y" (conditional vs automatic) change how the card plays — flag `❌` if optionality is missing or added.

**Team/Class from images only:** Do not attempt to verify team or class values from card images alone — use the PDF or DB. If the source doesn't list them, leave the existing `___` in place and note `⚠️` for the user.

---

## Output

Produce two things in-chat. **Do not overwrite or modify card-data.md.**

**1. Verification Summary** (lead with this):

```
## Verification Summary

Expansion: [name]
Scope verified: [card types]
Sources used: [list]
Entries reviewed: [N]

Issues found:
- ❌ [Card name] — [what contradicts the source; what the correct value should be]
- ⚠️ [Card name] — [why uncertain; what the user should spot-check]

Verified clean: [N] ✅
```

If no issues are found, say so explicitly: "No discrepancies found. All entries verified clean."

**2. Annotated log** — paste the relevant sections of the log with confidence markers added inline to flagged entries only. Do not reformat or restructure tables — only insert markers where needed.

---

## After This Pass

Your output feeds directly into the user's Pass 3 spot-check with physical cards. The user reviews your flags, checks physical cards for remaining `⚠️` and `[___]` items, and makes any corrections directly to card-data.md. When the user is satisfied with Pass 3, the file moves:

```
docs/staging-plans/[expansion]-card-data.md
→ docs/card-effects-reference/[expansion].md
```
