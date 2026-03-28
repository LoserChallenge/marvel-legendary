# Villain Deck Rules Fix — Always Leads & Golden Solo

**Date:** 2026-03-28
**Scope:** `cardDatabase.js`, `script.js`
**Game modes affected:** Golden Solo (villain count + Always Leads lock); both modes (Apocalypse +2 attack)

---

## Problem

Golden Solo currently has two bugs:

1. **Villain count** — Golden Solo should always use 2 villain groups by default, but the setup screen reads `scheme.requiredVillains` (usually 1), so only 1 villain group is required.
2. **Always Leads assignment** — `window.alwaysLeadsVillain` is randomly picked from whichever groups the player selected. It has no knowledge of the mastermind's actual Always Leads group from the physical card.

Additionally, Apocalypse's +2 attack bonus to Four Horsemen cards is not implemented in either game mode.

---

## Rules Summary

**Golden Solo villain setup:**
- Always 2 villain groups (overrides `scheme.requiredVillains` default of 1)
- One slot is locked to the mastermind's Always Leads group (auto-required)
- The second slot is the player's free choice
- If the scheme also has a `specificVillainRequirement`, that takes one slot and Always Leads takes the other
- If a scheme fills both slots with specific requirements (e.g. Kree-Skrull War), those scheme requirements win and the Always Leads lock does not apply
- If the mastermind's Always Leads is a henchmen group (Dr. Doom → Doombot Legion): the henchmen slot locks to that group; both villain slots remain free choice
- What If? Solo: no change — villain count and group selection follow scheme as before

**Apocalypse +2 attack:**
- When Apocalypse is mastermind AND Four Horsemen are in the villain deck, each Four Horsemen villain card gets +2 attack
- Applies in both What If? Solo and Golden Solo
- Generalised pattern: any mastermind with `alwaysLeadsBonus` applies that bonus to their Always Leads group if it is in the selected villain deck

---

## Design

### Section 1 — Data layer (`cardDatabase.js`)

Two new fields on every mastermind object:

```js
alwaysLeads: "Four Horsemen",   // string — the group name from the physical card
alwaysLeadsType: "villain",      // "villain" | "henchmen"
```

One optional field for masterminds with group-specific attack bonuses:

```js
alwaysLeadsBonus: { attack: 2 } // optional — only Apocalypse currently
```

Full mastermind data:

| Mastermind | `alwaysLeads` | `alwaysLeadsType` |
|---|---|---|
| Dr. Doom | `"Doombot Legion"` | `"henchmen"` |
| Loki | `"Enemies of Asgard"` | `"villain"` |
| Red Skull | `"HYDRA"` | `"villain"` |
| Magneto | `"Brotherhood"` | `"villain"` |
| Apocalypse | `"Four Horsemen"` | `"villain"` |
| Kingpin | `"Streets of New York"` | `"villain"` |
| Mephisto | `"Underworld"` | `"villain"` |
| Mr. Sinister | `"Marauders"` | `"villain"` |
| Stryfe | `"Mutant Liberation Front"` | `"villain"` |
| Galactus | `"Heralds of Galactus"` | `"villain"` |
| Mole Man | `"Subterranea"` | `"villain"` |
| Thanos | `"Infinity Gems"` | `"villain"` |
| Supreme Intelligence | `"Kree Starforce"` | `"villain"` |
| Carnage | `"Maximum Carnage"` | `"villain"` |
| Mysterio | `"Sinister Six"` | `"villain"` |

---

### Section 2 — Central helper function (`script.js`)

New function placed near the top of the setup logic section:

```js
function getEffectiveSetupRequirements(scheme, mastermind, gameMode) { ... }
```

Returns:

```js
{
  requiredVillains: 2,
  specificVillainRequirement: ["Four Horsemen"],  // array of locked group names
  requiredHenchmen: 1,
  specificHenchmenRequirement: null               // or "Doombot Legion" for Dr. Doom
}
```

**Logic:**

- If `gameMode === 'whatif'`: return scheme values unchanged.
- If `gameMode === 'golden'`:
  1. Start with `requiredVillains = 2`
  2. Build `lockedVillains` from scheme's `specificVillainRequirement` (normalised to array)
  3. If `mastermind.alwaysLeadsType === 'villain'` AND `mastermind.alwaysLeads` not already in `lockedVillains` AND `lockedVillains.length < requiredVillains` → add it
  4. If `lockedVillains.length > requiredVillains` → bump `requiredVillains` to match
  5. If `mastermind.alwaysLeadsType === 'henchmen'` → set `specificHenchmenRequirement = mastermind.alwaysLeads`; pass scheme henchmen count through unchanged
  6. Return effective object

**Kree-Skrull War case:** scheme `specificVillainRequirement: ["Kree Starforce", "Skrulls"]` fills both slots → step 3 condition `lockedVillains.length < requiredVillains` is false → Always Leads not added → scheme wins cleanly.

---

### Section 3 — Setup screen callers (`script.js`)

Four call sites updated to use `getEffectiveSetupRequirements` instead of reading `scheme.*` directly. All four read game mode from the DOM (same pattern as the existing hero count fix):

```js
const _gameMode = document.querySelector('input[name="gameMode"]:checked')?.value || 'whatif';
const req = getEffectiveSetupRequirements(scheme, mastermind, _gameMode);
```

1. **`showConfirmChoicesPopup`** — villain count validation, error messages, and "X Villain groups required" display line all use `req` values. Mastermind is already available at this call site.

2. **`randomizeVillainWithRequirements`** — uses `req.specificVillainRequirement` to lock required slots first, then fills remaining free slots randomly from the filtered pool.

3. **`randomizeVillain`** (standalone button) — currently hardcoded to pick 1. In Golden Solo, uses effective `requiredVillains` count (2) and locks the Always Leads slot. Needs mastermind to be read from the DOM at call time.

4. **`updateSummaryPanel`** — villain count display compares selected count against `req.requiredVillains` instead of `scheme.requiredVillains`.

---

### Section 4 — Always Leads assignment at game start (`script.js`)

Around line 4349, the block that sets `window.alwaysLeadsVillain`:

- **Golden Solo:** set directly from `mastermind.alwaysLeads` (remove random pick logic for this path)
- **What If? Solo:** keep existing logic unchanged (1 villain group → that group; already correct)

---

### Section 5 — Apocalypse +2 attack generalised pattern (`script.js`)

Inside `generateVillainDeck`, after villain cards are assembled, add:

```
if mastermind.alwaysLeadsBonus exists
  AND mastermind.alwaysLeads group is present in the selected villain deck
→ for each card in that group: apply bonus (e.g. card.attack += alwaysLeadsBonus.attack)
```

For Apocalypse: each Four Horsemen villain card gets `attack += 2`.
Works in both game modes.
Future masterminds with group bonuses: add `alwaysLeadsBonus` to their data entry only — no code change required.

---

## Files Changed

| File | Changes |
|---|---|
| `cardDatabase.js` | Add `alwaysLeads`, `alwaysLeadsType`, and (where applicable) `alwaysLeadsBonus` to all 15 mastermind objects |
| `script.js` | New `getEffectiveSetupRequirements` helper; update 4 setup screen callers; update `alwaysLeadsVillain` assignment; add `alwaysLeadsBonus` application in `generateVillainDeck` |

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Kree-Skrull War in Golden Solo | Scheme fills both villain slots; Always Leads lock does not apply |
| Dr. Doom in Golden Solo | Henchmen slot locked to Doombot Legion; both villain slots free |
| Scheme `specificVillainRequirement` matches mastermind's `alwaysLeads` | Requirement satisfied by one group; second slot is free choice |
| Apocalypse selected but Four Horsemen not in villain deck (What If?) | No +2 bonus applied |
| What If? Solo | All villain requirements follow scheme as before; no changes |

---

## Out of Scope

- Scheme-mastermind pairing (auto-forcing Supreme Intelligence for Kree-Skrull War) — noted as future enhancement
- Adding Doombot Legion henchmen data (already in app; Dr. Doom henchmen lock is fully implementable)
- Any changes to What If? Solo villain count or group selection logic
