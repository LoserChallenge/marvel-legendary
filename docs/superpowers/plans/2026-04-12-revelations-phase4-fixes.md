# Revelations Phase 4 — Playtest Fix Plan

## Context

First playtest of the Revelations expansion (from `.worktrees/revelations` branch) revealed 9 real issues plus 1 expected deferred stub. Issues fall into three tiers: core mechanics that make the game unplayable as intended, player choice UI that auto-picks instead of letting the player decide, and simplified stub implementations.

All fixes target:
`D:/Games/Digital/Marvel Legendary/Claude Code/marvel-legendary/.worktrees/revelations/Legendary-Solo-Play-main/Legendary-Solo-Play-main/`

---

## Tier 1 — Core Mechanics (game-breaking, fix first)

### Fix 1A: Scheme Transformation — City Size Not Changing
**Problem:** `transformScheme()` in `script.js:2137` works (swaps scheme image + name), but Earthquake/Tsunami twist handlers (`expansionRevelations.js:1548-1571`) never change `citySize`. No runtime city resize function exists.

**Root cause:** Step 3 infrastructure built `transformScheme()` but deferred city size toggling — the twist handlers have comments saying "will be handled by the dynamic city system" but nobody wrote that code.

**Fix:**
1. Add `resizeCityForScheme(newSize)` helper to `script.js` that:
   - Updates `citySize`
   - Handles villains in destroyed/added spaces (escape or initialize)
   - Reinitializes arrays via `initCityArrays()` (preserving existing occupants)
   - Regenerates city HTML via `generateCityHTML()`
   - Calls `renderCityCards()` + `updateGameBoard()`
2. Call `resizeCityForScheme(3)` in `earthquakeDrainsTheOceanTwist()` after `transformScheme()`
3. Call `resizeCityForScheme(7)` in `tsunamiCrushesTheCoastTwist()` after `transformScheme()`
4. Earthquake Side A should start at 7 spaces (not 5) — need to set initial citySize in game setup when this scheme is selected

**Key files:** `script.js` (new helper ~line 2160), `expansionRevelations.js:1548-1571`
**Complexity:** High — most complex fix; needs careful array management

**⚠️ SCOPE CONCERN (added 2026-04-13):** Paul observed that Secret HYDRA Corruption also fails to transform on its twist, mirroring the Earthquake behaviour. This contradicts this fix's original assumption that `transformScheme()` works correctly and only the city-resize piece is missing. Two possibilities:

1. **`transformScheme()` itself is broken** — it doesn't actually swap the scheme image/name, and the prior playtest observation was misread. In that case Fix 1A is much bigger than described: it needs to fix the transform mechanism AND add city resize.
2. **The twist handler functions aren't calling `transformScheme()`** — the Earthquake and Hydra twist handlers may have incomplete implementations that never reach the transform call.

**Before implementing Fix 1A, verify empirically:** instrument `transformScheme()` and both twist handlers (`earthquakeDrainsTheOceanTwist`, `secretHydraCorruptionTwist`) with temporary `onscreenConsole.log` statements, trigger the twists in a playtest, and observe which (if any) actually fire. The answer determines whether Fix 1A is "add resize to a working transform" (small) or "fix broken transform + add resize" (large).

### Fix 1B: Klaw Capture Not Functioning
**Problem:** `klawAmbush()` (`expansionRevelations.js:1104-1130`) stores captured hero on the Klaw card object, but when the villain is cloned/placed into the city array, the `capturedHero` property isn't preserved. `klawFight()` (line 1132) searches the city copy and finds nothing.

**Root cause:** Villain card cloning in `processRegularVillainCard()` doesn't carry over custom properties added by ambush effects.

**Fix:**
1. Investigate how `processRegularVillainCard()` in `script.js` clones villain cards — determine if it's a shallow clone that drops `capturedHero`
2. Either: (a) ensure the clone preserves extra properties, or (b) have `klawAmbush()` store the capture on the city copy directly (find Klaw in `city[]` after placement, then attach)
3. Also add visual indicator — use existing captured-bystander overlay pattern or the Location fan-out CSS

**Key files:** `script.js` (~line 12200 villain cloning), `expansionRevelations.js:1104-1144`
**Complexity:** Medium — need to trace the clone path carefully

### Fix 1C: Mandarin Attack Modifiers Missing
**Problem:** Mandarin should get -3 Attack per Ring in Victory Pile (solo), and Rings should get +1 Attack while Mandarin is the mastermind. Neither is implemented.

**Root cause:** `recalculateMastermindAttack()` in `script.js:14699` has no Mandarin-specific logic. Ring attack bonus also not wired up.

**Fix:**
1. In `recalculateMastermindAttack()`, add Mandarin check:
   - Count Rings in `victoryPile` where `team === "Mandarin's Rings"`
   - Normal: `-3 * ringCount` from `originalAttack`
   - Epic: `-6 * ringCount` from `originalAttack`
2. For Ring +1/+2 Attack bonus: modify Ring attack values in `updateHighlights()` or wherever henchman fight costs are displayed — add +1 (normal) or +2 (epic) when Mandarin is the active mastermind
3. Call `recalculateMastermindAttack()` after any Ring enters/leaves Victory Pile

**Key files:** `script.js:14699` (`recalculateMastermindAttack`), `expansionRevelations.js` (Ring fight handlers)
**Complexity:** Medium

### Fix 1D: Locations Enter City Silently
**Problem:** `placeLocation()` in `script.js:584` uses `console.log()` (dev tools only) instead of `onscreenConsole.log()`.

**Fix:** Change `console.log()` to `onscreenConsole.log()` with highlighted card name, matching the villain announcement pattern at `script.js:5138-5140`.

**Key files:** `script.js:601`
**Complexity:** Low — one-line fix

---

## Tier 2 — Player Choice UI (playable but wrong, fix second)

### Fix 2A: KO From Discard — Wrong Popup (×3 functions)
**Problem:** These use `showHeroAbilityMayPopup` (Yes/No text popup) + auto-pick cheapest card instead of the proper `card-choice-popup` with card images.

| Function | Line | Effect |
|----------|------|--------|
| `mandarinRingIncandescence` | 2163 | Fight: You may KO a card from discard |
| `brothersGrimmFight` | 1388 | Fight: You may KO a card from discard |
| `warMachineHypersonicCannonSuper` | 937 | Superpower: KO a card from discard |

**Fix:** Replace all 3 with the `card-choice-popup` pattern from `KO1To4FromDiscard()` (`cardAbilities.js:11814`), adapted for single-card selection. Create a shared helper function in `expansionRevelations.js` to avoid tripling the code:

```
async function koOneFromDiscardPile(sourceName) {
  // card-choice-popup, single-row, single-select, "NO THANKS" skip
  // Adapted from KO1To4FromDiscard pattern
}
```

Then each function just calls `await koOneFromDiscardPile("Incandescence, The Flame Blast")`.

**Key files:** `expansionRevelations.js:937, 1388, 2163`, pattern from `cardAbilities.js:11814`
**Complexity:** Medium — one helper + 3 call sites

### Fix 2B: KO From Discard — No Popup At All (×2 functions)
**Problem:** These silently auto-KO cards without any player interaction.

| Function | Line | Effect |
|----------|------|--------|
| `sentryFight` | 1238 | Fight: KO up to 2 cards from discard (as Void) |
| `grimReaperCultOfSkulls` | 1831 | Tactic Fight: KO up to 2 cards from discard |

**Fix:** Replace with `card-choice-popup` pattern allowing multi-select up to 2. Can reuse `KO1To4FromDiscard` pattern with `maxSelections = 2`.

**Key files:** `expansionRevelations.js:1238, 1831`
**Complexity:** Medium

### Fix 2C: Mandarin Master Strike — Auto-Pick, Wrong Placement, Duplicate Ambush (3 problems in one function)

**Problem 1 (original):** `mandarinStrike()` / `epicMandarinStrike()` use `rings[0]` instead of letting the player choose which Ring from Victory Pile re-enters the city.

**Problem 2 (added 2026-04-13 — Paul's second playtest):** Placement logic uses "find leftmost empty slot" instead of "enter rightmost + shift left." Observed during playtest: a Ring returned via Master Strike was placed in the leftmost empty slot while a villain currently in the Bank stayed put — the correct behaviour is that the Ring should have entered the Sewers (rightmost) and the Bank villain should have shifted one space left, same as any normal villain-deck draw.

**Problem 3 (consequence of fixing Problem 2):** If we route returning Rings through `processRegularVillainCard()` to fix placement, the Ring's ambush effect fires AGAIN — but the player already saw the ambush when the Ring first entered the city. A returning Ring should get the placement-and-shift behaviour but NOT re-trigger its ambush.

**Root cause of 2 & 3:** The current code in `mandarinStrike()` and `epicMandarinStrike()` manually rolls its own placement logic (`for (i = city.length - 1; i >= 0; i--) { if (!city[i]) { city[i] = ring; break; } }`) rather than using the engine's existing placement flow at `script.js:5142-5181`.

**Fix:**
1. **Player choice (Problem 1):** When multiple Rings are in VP, show a `card-choice-popup` for selection. When only 1 Ring exists, auto-pick is fine (no choice needed).
2. **Placement (Problems 2 & 3):** Extract the "place card in sewers + shift everyone left + escape overflow" logic from `processRegularVillainCard()` (`script.js:5142-5181`) into a reusable helper function — e.g. `enterCityFromRight(card)` — and have BOTH `processRegularVillainCard()` AND `mandarinStrike()`/`epicMandarinStrike()` call it. Because the helper contains only the placement logic (not the ambush step), calling it from the Master Strike path automatically skips ambush.
3. **Alternative (simpler but less clean):** Add an optional `{ skipAmbush: true }` flag to `processRegularVillainCard()` and call it from the strike path. Avoids the refactor but scatters "is this a fresh arrival or a return?" conditionals.

Option 2 is recommended — it's a cleaner separation of concerns and the extracted helper is useful beyond just this fix (any future "return a card to the city" mechanic benefits from the same code path).

**Key files:** `expansionRevelations.js:1919-1939` (`mandarinStrike`), `1942-1964` (`epicMandarinStrike`), `script.js:5142-5181` (source of the placement logic to extract)
**Complexity:** Medium-High — bigger than the original 2C scope because of the placement refactor. If Option 3 is chosen, closer to Medium.

### Fix 2D: Other Auto-Pick Effects (×2)
| Function | Line | Problem |
|----------|------|---------|
| `mandarinRingRemaker` | 2291 | "Choose a card from discard to hand" — auto-picks highest cost |
| `grimReaperMazeOfBones` | 1858 | "Look at top 4, KO any number" — auto-KOs cost-0 only |

**Fix:** Both need card selection popups. Remaker needs single-select from discard (similar to Fix 2A but moves to hand instead of KO pile). MazeOfBones needs a "reveal top 4, multi-select to KO" popup.

**Key files:** `expansionRevelations.js:2291, 1858`
**Complexity:** Medium

### Fix 2E: Partial KO Stubs (×2)
| Function | Line | Problem |
|----------|------|---------|
| `mandarinDragonOfHeavenSpaceship` | 1974 | "KO up to 2 heroes" — effect entirely skipped |
| `...LocationFight` | 1996 | "KO up to 2 heroes" — only KOs 1 via `FightKOHeroYouHave()` |

**Fix:** Need a "KO up to 2 heroes" helper — similar to `FightKOHeroYouHave()` but with multi-select (max 2) and a skip option. The Location version can reuse the same helper.

**Key files:** `expansionRevelations.js:1974, 1996`
**Complexity:** Medium

### Fix 1E: Earthquake/Tsunami Scheme — Extra Villain Group Not Enforced at Setup
**Problem:** The Earthquake Drains the Ocean / Tsunami Crushes the Coast scheme starts on the Earthquake side, which instructs players to add an extra villain group to the villain deck. A player can complete setup with the normal villain group count (2 for Golden Solo, 1 for What If?) and start the game, skipping the scheme's mandated extra group entirely.

**Root cause:** The Earthquake scheme's DB entry in `cardDatabase.js` almost certainly lacks a `specificVillainRequirement` declaration (or an equivalent new field like `extraVillainGroups`). The setup-validation layer already enforces similar rules for other schemes — the gap is in the data, not the validator.

**Fix:**
1. Locate the Earthquake scheme entry in `cardDatabase.js` and check whether `specificVillainRequirement` supports a relative value (e.g. "+1 over base") or only absolute counts.
2. If absolute only: may need to extend the validator to understand "extra group" semantics (i.e. base count + 1 for this scheme).
3. If relative already supported: add the declaration to the scheme's DB entry.
4. Also update the setup-screen banner/hint so the player understands the requirement at selection time, not just at validation time.
5. Verify the behavior matches for both game modes — Golden Solo should require 3 groups total, What If? should require 2.

**Key files:** `cardDatabase.js` (scheme entry), `script.js` (`showConfirmChoicesPopup` validation + setup banner logic)
**Complexity:** Low (if relative field exists) to Medium (if validator extension needed)

**Caught by:** Paul's 2026-04-13 session, post-Fix 1C. Not observed in the 2026-04-12 playtest because the player unknowingly started the game with the wrong villain group count.

### Fix 1F: Secret HYDRA Corruption — 30-Officer Stack Not Enforced at Setup
**Problem:** Secret HYDRA Corruption requires the S.H.I.E.L.D. Officer stack to contain 30 cards instead of the default (20 in Golden Solo). A player can complete setup with the default stack size and start the game, entering the Officer-draining twist effect with an undersized stack that will run out too quickly.

**Root cause:** Unlike "extra villain group" (Fix 1E) which can reuse existing `specificVillainRequirement` infrastructure, scheme-specific Officer counts are a **new data dimension**. No scheme in the existing DB declares an Officer-count override, so the DB schema and setup validator both lack the field and the handling code.

**Fix:**
1. Add a new optional field `officerCount` to the scheme schema (convention: if unset, use the default).
2. Populate `officerCount: 30` on the Secret HYDRA Corruption entry (and Open HYDRA Revolution, since it transforms back into Secret HYDRA Corruption — the stack size presumably stays 30 throughout).
3. In the setup flow (likely near where `shieldOfficers` / the S.H.I.E.L.D. Officer stack is constructed), check `scheme.officerCount` and build the stack to that size instead of the default.
4. Add a setup-screen banner hint so the player understands the larger stack at selection time.
5. Verify the Officer pool has enough cards to support 30 (should be fine — there are 30 Officers in the base game).

**Key files:** `cardDatabase.js` (scheme entries + potentially the schema comment), `script.js` (Officer stack construction + setup banner)
**Complexity:** Low-Medium — straightforward schema extension, one validator hook, one setup banner string. Bigger than 1E because it adds a new field; smaller than 1A.

**Caught by:** Paul's 2026-04-13 session. Not observed in the 2026-04-12 playtest because Mandarin was the mastermind (not a Hydra-themed mastermind), so Secret HYDRA Corruption wasn't the scheme played.

---

## Tier 3 — Known Deferred (no fix needed now)

| Issue | Status |
|-------|--------|
| Scarlet Witch Chaos Magic — no play option for revealed copy | Deferred stub, expected |

---

## Execution Order

1. **Fix 1D** ✅ (Location announcement) — quick win, one-line change (completed 2026-04-13)
2. **Fix 1C** ✅ (Mandarin modifiers) — important for fight balance (completed 2026-04-13)
3. **Fix 1B** (Klaw capture) — requires clone investigation
4. **Fix 2A** (KO from discard helper) — creates reusable helper for 2B/2D/2E
5. **Fix 2B** (multi-select KO variants) — builds on 2A helper
6. **Fix 2C** (Mandarin strike selection) — standalone popup
7. **Fix 2D** (Remaker + MazeOfBones) — each unique but same popup system
8. **Fix 2E** (KO up to 2 heroes) — needs new multi-hero-KO helper
9. **Fix 1E** (Earthquake +1 villain group) — setup validation; reuses existing infrastructure
10. **Fix 1F** (Hydra 30-Officer stack) — setup validation; adds a new scheme field
11. **Fix 1A** (scheme transformation + city resize) — most complex, save for focused session; verify transform mechanism empirically before implementing

## Verification

After all fixes:
- Run expansion-validator subagent
- Full playtest game with Mandarin + Earthquake scheme to hit all fixed paths
- Check console for Location announcements, scheme transformation messages, correct Mandarin attack values
- Verify card selection popups show actual card images with hover preview
