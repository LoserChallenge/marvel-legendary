# X-Men Pass 2 Verification Results

**Date:** 2026-04-05
**Scope:** All card types (Heroes, Villains, Masterminds, Schemes, Henchmen, Bystanders, Horrors)
**Sources used:** Card images (primary for effect text), BGG reference `xmen-reference.md` (primary for structured fields)
**Entries reviewed:** ~150+ cards

## Errors to Fix (❌)

### 1. Dark Angel (Shadow-X villain group) — Hero side X-Gene text
- **Pass 1 says:** X-Gene [INSTINCT]: "The next Hero you recruit **from the HQ** has Soaring Flight."
- **Card image says:** "The next Hero you recruit **this turn** has Soaring Flight."
- **Action:** Change "from the HQ" → "this turn" in the effects section

### 2. Guillotine Roller Coaster (Murderworld Trap) — Card name spelling
- **Pass 1 says:** "Guillotine Rollercoaster" (one word)
- **Card image says:** "GUILLOTINE ROLLER COASTER" (two words)
- **Action:** Change to "Guillotine Roller Coaster" in both structured data table and effects section

### 3. Deathbird Master Strike (Normal) — Token name spelling
- **Pass 1 says:** "Shi'ar Battlecruiser"
- **Card image + BGG say:** "Shi'ar Battle Cruiser" (two words)
- **Action:** Change to "Shi'ar Battle Cruiser" in Master Strike text AND Token Villains structured data table

### 4. Deathbird Master Strike (Epic) — Token name spelling
- **Pass 1 says:** "Shi'ar Battleship"
- **Card image + BGG say:** "Shi'ar Battle Ship" (two words)
- **Action:** Change to "Shi'ar Battle Ship" in Master Strike text AND Token Villains structured data table

## Spot-Checks for Pass 3 (⚠️)

### 5. Telepathic Ninjutsu vs Ninjitsu (Psylocke Rare) — Card name spelling
- BGG + Pass 1 say "Ninjutsu"; image filename says "Ninjitsu"
- **Check physical card** to confirm spelling

### 6. Nemesis (Dark Descendants) — Fight value
- Pass 1 + BGG say Attack: 5
- Card image may show 5+ (small + visible)
- **Check physical card** to confirm 5 or 5+

### 7. Animatronic Killer Clown Token — Attack value discrepancy (pre-existing)
- Trap card text says the token has "3 Attack"
- Token card image shows Attack 4
- **Check physical cards** — both the Trap text and the Token card

### 8. Prismatic Cascade (Jubilee Rare) — Base Attack value (pre-existing)
- BGG says 5+ Attack; card image hard to read
- **Check physical card** for base value

## Verified Clean

All other entries (~146+) confirmed ✅ across all card types.

## Next Steps

1. User performs Pass 3: physical card spot-check on items 5-8 above
2. Apply fixes for items 1-4 directly to `docs/card-inventory/drafts/x-men.md`
3. Move to `docs/card-inventory/final/x-men.md`
