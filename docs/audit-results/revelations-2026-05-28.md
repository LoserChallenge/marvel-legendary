# Revelations — Expansion Audit Catalog

**Expansion:** Revelations
**Date:** 2026-05-28
**Pipeline:** `/expansion-audit` (inaugural run — executed via worker-agent workaround; subagents fed their own definition files because the session was rooted in the main folder, not the worktree. Findings are identical to a by-name dispatch.)

> **Pipeline self-test: PASS.** The three known seeded bugs were all independently re-discovered: E-1 transformScheme propagation gap (engine + scheme auditors), House of M setup-directive gap (scheme auditor), and the Korvac conditional-choice bug at `expansionRevelations.js:2330-2351` (scheme auditor).

> **Status caveat:** Revelations is mid-fix. Phase 4 Tier 1 fixes 1B–1F are applied; **1A (scheme transform + city resize) is still pending** — so E-4 and parts of the transform cluster are *already-known/in-progress*, not new. Dedup against `docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md` before triaging. See the "Dedup vs. existing fix plan" section at the end.

---

## Summary

| Auditor | Result | Issues (H / M / L) |
|---|---|---|
| engine-integration-auditor | 5 propagation gaps + 2 new touchpoints | 3 / 2 / 0 |
| expansion-validator | 2 async gaps (rules 1,2,4,5,6,7 pass) | 0 / 0 / 2 |
| scheme-card-auditor | transform system broken + missing setups | 7 / 2 / 1 |
| hero-card-auditor | conditionType bug + log-only abilities | 13 / 5 / 1 |
| villain-card-auditor | keyword attack scaling unwired | 10 / 3 / 1 |
| henchmen-card-auditor | Mandarin Rings What-If split bug | 1 / 4 / 1 |
| mastermind-card-auditor | Grim Reaper/Hood scaling + dead triggers | 6 / 1 / 3 |
| misc-card-auditor | Location trigger system dead | 7 / 5 / 1 |
| keyword-consistency-auditor | villain/location/mastermind keyword sides unwired | 6 / 0 / 0 |
| **Raw total** | | **53 / 22 / 10** |

**Heavy overlap:** the raw HIGH count includes the same root causes reported by multiple auditors (corroboration is good — it means the bug is real). Deduplicated, the HIGH findings collapse into **~8 root-cause clusters** below. Fixing a cluster's root cause clears many cards at once.

---

## HIGH severity — organized by root-cause cluster

> Deviates from strict per-card grouping because most HIGH findings share a handful of root causes; fixing the root clears the cluster. Cards affected are listed under each.

### Cluster A — Scheme transform system is fundamentally broken (E-1 / E-5 / E-6)
`transformScheme()` updates only `window.selectedScheme` + the card image. But every downstream reader resolves the scheme from the **setup-screen DOM radio** (`getSelectedScheme()` / inline `#scheme-section input:checked`), which never changes. After the first transform, the game keeps using **Side A** forever.

- **Twist dispatch** keeps firing Side A's `twistEffect`/`twistText`; Side B twists (`tsunamiCrushesTheCoastTwist`, `noMoreMutantsTwist`, `openHydraRevolutionTwist`, `korvacRevealedTwist`) never run. `script.js:5810,5864` vs `script.js:14051` vs `script.js:2170`.
- **`checkEvilWins()`** reads stale scheme (`script.js:9047-9055`) → `noMoreMutantsEvilWins` can never fire (House of M has *no* loss condition post-transform). Masked for Korvac/HYDRA only because their A/B sides share `endGame` strings. (E-5)
- **`updateVillainAttackValues()` + HQ twin** read stale scheme for scheme-based attack bonuses (`script.js:9961`, `~10137`). (E-6)
- **Affected:** all 4 transforming scheme pairs — Earthquake/Tsunami, House of M/No More Mutants, Secret/Open HYDRA, Korvac Saga/Korvac Revealed.
- **Fix direction:** resolve the active scheme from `window.selectedScheme` (fallback to DOM radio) in the twist dispatcher, `checkEvilWins`, and both attack-value functions. Single fix family. **Note: this is the pending Fix 1A territory.**

### Cluster B — Missing scheme setup directives & special rules
Core scheme mechanics never implemented (the "set up X" / "this counts as Y" text):

- **House of M** — "Add 14 Scarlet Witch Hero cards to the Villain Deck" is not implemented; no setup hook. The `houseOfMTwist` scarletWitchCount check (`expansionRevelations.js:2242`) can never find any → **House of M can never transform.** (This is the seeded known bug.)
- **Secret/Open HYDRA** — the 30-card S.H.I.E.L.D. Officer stack, "Hydra Sympathizers" (pay 3 Recruit → gain Officer as Hero), and Side-B "Hydra Traitor" villains are unimplemented. Officers tracked as a bare integer (`hydraOfficersNextToScheme`); the "stack runs out" evil-wins branch is missing (`script.js:9457-9465` only checks ≥15).
- **Korvac Revealed** — "counts as a 19-Attack 'Korvac' Villain worth 9VP; defeat it → KO Mastermind + all Tactics" is unimplemented. No fightable element, no defeat trigger, no win hook. (`expansionRevelations.js:2366-2394`, twist text only.)
- **Earthquake/Tsunami city resize** — twists call `transformScheme()` and log "city spaces reduced/restored" but no `resizeCityForScheme()` exists; the city is never resized, overflow villains never escape. (E-4) `expansionRevelations.js:2199-2219`. **This is pending Fix 1A.**

### Cluster C — Location "Whenever you fight a Villain here" trigger system is completely dead (E-2)
Two compounding failures:
1. **Field-name mismatch:** the 6 Tactic→Location objects set `locationTrigger:` but the engine post-fight hook reads `cityLocations[i].triggeredAbility` (`script.js:12046`). Never read.
2. **Functions don't exist:** the named trigger functions (`carnivalOfConcussionsTrigger`, `cultOfSkullsTrigger`, `mazeOfBonesTrigger`, `prisonOfCoffinsTrigger`, `dragonOfHeavenTrigger`, `hoodsWarehouseTrigger`) are not defined anywhere — so even with the right field name, nothing would run.
3. **Standalone group Locations** (Dome of Darkforce, Laser Maze, "The Raft" Prison, White Gorilla Cult, Carnival of Wonders) have **no trigger field at all** in the DB — only a `fightEffect` that just logs "defeated." Their defining "here" effect is missing entirely.
- **Affected:** 6 tactic-Locations + 5 group Locations + Dragon of Heaven Spaceship (its "here" trigger; its own Fight works).
- **Files:** `expansionRevelations.js:2474,2495,2516,2539,2717,2865`; `cardDatabase.js:3899,4254,4279,4384,4405`; `script.js:12046`.
- **Fix direction:** rename `locationTrigger`→`triggeredAbility`, define the trigger functions, and add trigger fields + functions to the group Locations.

### Cluster D — Villain / Location / mastermind keyword attack-scaling is unwired (E-3 + keyword gaps)
The keyword *hero* side is correctly built (`calculateDarkMemories`, `calculateLastStand` helpers). The **villain, Location-grant, and mastermind sides never call any handler** — `updateVillainAttackValues()` / its HQ twin / `recalculateMastermindAttack()` have no branches for these. Source comments claim the logic "lives in updateVillainAttackValues" but it does not exist.

- **Last Stand (villain):** Ares, Captain Marvel (Noh-Varr), Dark Hawkeye, Dark Ms. Marvel, Dark Wolverine (+1/empty space); **Dark Spider-Man (Scorpion)** Double Last Stand (+2/empty). All fight at base value.
- **Dark Memories (villain):** Cancer, Chemistro, Madam Masque (+1 per unique discard class, max +5). All at base.
- **Lethal Legion +3-while-Location:** Living Laser (Maze), M'Baku (Cult), Power Man (Prison), Swordsman (Carnival) — no Location-name scan, no flag in DB, never applied.
- **Sentry → "The Void" +5** in Bank/Streets — fight effect gates on position correctly, but +5 never added and name never changes. `expansionRevelations.js:1916`.
- **Sentry's Watchtower** grants Last Stand (stacking) to villains in its space — grant not implemented. `expansionRevelations.js:1934`.
- **The Dark Dimension** grants Dark Memories (stacking) — not implemented; its Fight "Take another turn" is a no-op stub. `expansionRevelations.js:2066`.
- **Grim Reaper (mastermind)** "+1 Attack per Location in city" (Epic +2) — no branch in `recalculateMastermindAttack()` (`script.js:14798-14808`). Stays at 8/9.
- **The Hood (mastermind)** Dark Memories (Epic Hood Double) — no branch. Stays at 9/10.
- **Graveyard Location** (`graveyardBonus: 2`/epic 3) — field written, never read; engine only grants the "+attack while villain present" bonus for `subtype === "Henchman"` (`script.js:11689`). (E-3)
- **Fix direction:** add the missing branches to `updateVillainAttackValues()` **and** its HQ twin (patch both — duplicate-function hazard) and to `recalculateMastermindAttack()`, reusing the existing helpers; replace `graveyardBonus`/`subtype` special-casing with a generic engine-read attack field.
- **⚠ Audit pipeline gap (logged 2026-05-29, Cluster D Batch 1):** the catalog did NOT flag that the Lethal Legion "+3 while a '[keyword]' Location" trigger matches by KEYWORD, so it fires on BOTH the Lethal Legion's own Locations (Laser Maze, etc.) **and** Grim Reaper's Always-Leads tactic-Locations (Maze of Bones / Cult of Skulls / Prison of Coffins / Carnival of Concussions) — because Grim Reaper "Always Leads: Lethal Legion" puts both sets in play together (this is correct by design; resolved as case-insensitive substring match in Batch 1). The keyword-consistency dimension of `/expansion-audit` should learn to flag this class of interaction: **when a trigger's quoted keyword can match Locations/cards brought in by the always-leading mastermind, not just the card's own group.** (Improving the skill itself is a post-merge follow-on; this is the gap record.)

### Cluster E — Five hero superpowers never fire (`conditionType: "None"`)
`isConditionMet()` (`script.js:10980`) has no case for `conditionType: "None"` → default returns false. Five hero superpowers are encoded this way with a real `conditionalAbility`, so they silently never trigger. Correct pattern is `conditionType: "playedCards"` + `condition: "Class&Class"` (e.g. `cardDatabase.js:8117,8439`).
- **Affected:** Captain Marvel "Higher, Further, Faster" (`cardDatabase.js:10925`), Darkhawk "Warflight" (`11039`), Photon "Coruscating Vengeance" (`11267`), Quicksilver "Around the World Punch" (`11382`), Scarlet Witch "Warp Time and Space" (`11610`).
- **Single highest-leverage hero fix.**

### Cluster F — Hero abilities that are log-only / no-op / broken
- **Speed "Speedy Delivery"** — no-op (log only); no flag, no recruit hook. `expansionRevelations.js:1474`.
- **War Machine "Military-Industrial Complex"** — no-op; no per-turn flag / villain-defeat hook. `1630`.
- **War Machine "Overwhelming Firepower"** — no-op; no hook. `1647`.
- **War Machine "Simulated Target Practice"** — **ReferenceError** on undefined `bystanderStack` (real global is `bystanderDeck`) aborts mid-effect; also skips `rescueBystander()` and the henchman fight-effect clause. `expansionRevelations.js:1613`.
- **Hellcat "Second Chance at Life"** — reactive cancel-Strike/Twist unimplemented (log only); no interception in Master Strike / Scheme Twist processing. `1132`.
- **Scarlet Witch "Hex Bolt"** & **"Chaos Magic"** — "play a copy of that card" unimplemented (a copy mechanism exists: `RogueCopyPowers`, `cardAbilities.js:7419`). `1343`, `1398`.
- **Photon "Light the Way"** — counts `justAddedToDiscard.length`, but nothing ever pushes to that array (`script.js:709,11224`) → always 0 attack. `1185`.

### Cluster G — Mister Hyde dual-identity / cost
`usesRecruitToFight: true` is hard-coded **unconditionally** (`cardDatabase.js:3952`) instead of only in Bank/Streets (as "Dr. Calvin Zabo"). Player can never spend Attack on Hyde anywhere; the name change never happens. No position-conditional setter.

### Cluster H — Mandarin's Rings What-If? special-henchman split bug
In **What If? Solo**, if Mandarin's Rings is randomly chosen as the "special henchman," the 2+2 split branch (`script.js:4259-4288`) ignores the `cards` array and pushes 4 copies of the **group template** (generic name, `fightEffect: "None"`, placeholder image) instead of 10 unique Rings. Golden Solo (`4239`) and the non-special What-If branch (`4291`) check `cards` correctly; only this path is broken.

---

## MEDIUM severity

**Schemes**
- **The Korvac Saga twist** — "KO a Bystander" auto-picks `bystanders[0]`; "discard to 4" pops hand from the tail. No player choice. `expansionRevelations.js:2330-2351`. (seeded known bug) `RELATED: —`
- **Korvac Revealed twist** — `korvacRevealedTwist` unreachable post-transform (Side A runs instead); even-twist Avengers-discard penalty never executes. `2366-2394`. `RELATED: E-1`

**Villains**
- **Dark Hawkeye (Bullseye)** — the "Then choose one" branch is dropped with no log (acceptable solo each-other-player skip, but silent). `expansionRevelations.js:1859`.
- **Swordsman** — Bystanders captured onto Locations stored on `cityLocations[i].capturedBystanders`, never read/rescued and not in `createVillainCopy()` whitelist → lost. `1859`/`script.js:12277`.
- **Chemistro** — Fight effect early-returns "not supported in Golden Solo" → does nothing in one of two supported modes. **Gameplay decision needed.** `1992`.

**Henchmen**
- **Nightbringer** — "you **may** defeat a Villain" auto-resolves (no choice/opt-out); and "(Do its Fight effect)" never runs. `expansionRevelations.js:2980-2993`.
- **HYDRA Base** — +2 "while a Villain is here" is computed at fight time but never displayed (no Location attack overlay); the green "attackable" highlight uses base attack (2) not effective (4), so it lights up affordable when it isn't. `script.js:8449,11688-11691,8442-8451`.

**Mastermind**
- **Epic Hood Master Strike** — "shuffle 6 random grey cards" filters `color === "Grey"`, excluding Wounds (`color: "None"`), though grey-bordered Wounds should qualify. `expansionRevelations.js:2794`.

**Misc / Locations**
- **Dome of Darkforce / Carnival of Wonders / Dragon of Heaven Spaceship** — partial: the Fight half works but the "here" trigger half is dead (Cluster C). `RELATED: E-2`
- **Sentry's Watchtower Fight** — `hq[wtIdx] = heroDeck.pop()` (fill-in-place) for all modes; Golden Solo should use `goldenRefillHQ` rotation. `expansionRevelations.js:1941`.
- **Lawyer (Bystander)** — "draw each revealed card with 10+ words of rules text" approximated by "has any ability" heuristic → wrong card set. `expansionRevelations.js:3063`.
- **`handleLocationOverflow`** — player-facing overflow events use `console.log` (`script.js:653,659`) instead of `onscreenConsole` → Location silently vanishes. (onscreenConsole-vs-console gotcha.)

**Heroes**
- **Speed "Break the Sound Barrier"** — auto-draws the 2 highest-cost of 6 revealed; no player selection, no top/bottom ordering choice. `1570`.
- **Photon "Infrared Conversation"** — discard cost randomized + made optional rather than forced player-chosen. `1139`.
- **Ronin "Mysterious Identity"** — color/team reassignment unimplemented (log only). `1306`.
- **Hellcat "Demon Sight"** super — "may fight the revealed villain this turn" not actually enabled (log only). `1117`.
- **Photon "Ultraviolet Radiation"** — mandatory "must discard a card" play-cost is an empty stub. `1173`.

---

## LOW severity

- **expansion-validator:** `madamMasqueAmbush()` (`~2034`) calls async `processVillainCard()` without `await` (race if drawn card triggers a popup); `revealClassOrWound()` (`1664,1682`) calls `drawWound()` without `await`. Both fire-and-forget per Rule 3.
- **villain-card-auditor:** `revealClassOrWound`/`revealClassOrDiscard` unawaited `drawWound()` in no-class fallback (Blackout, Count Nefaria, Dark Wolverine, Living Laser, M'Baku) — same as above.
- **villain — Dark Ms. Marvel:** entire Fight is an each-other-player effect, skipped in solo (confirm "skip" vs "self" intent — Location effects apply to self, villain effects skip; confirm split). `1865`.
- **scheme — Earthquake** `extraVillainGroups: 1` honored in Golden Solo only; What If? ignores it (documented design, but deviates from card text for What If?). `script.js:3289`.
- **henchmen — Zero, The Ice Blast** — "choose a cost-0 card you played" auto-picks first. `expansionRevelations.js:3041`.
- **mastermind — Maze of Bones** DB effect text drops "Then" ordering word (cosmetic). `cardDatabase.js:1743`.
- **mastermind — Rings Seek Their True Hand** — auto-moves `rings[0]` to Escape when no Tech Hero (no "which ring" picker; functionally correct penalty). `expansionRevelations.js:2746`.
- **mastermind — Epic Grim Reaper Strike** — confirmed correct solo Wound handling (informational PASS).
- **hero — Darkhawk "Hawk Dive"** — popup labels Attack first while card says "Recruit or Attack"; both map correctly (cosmetic). `916`.
- **misc — Dog Show Judge** — solo auto-draws revealed card, no reveal/decline step (acceptable solo). `3051`.

---

## Could not be audited
None. Every auditor located all DB entries and effect functions in scope (or confirmed them missing as a finding). No cards were skipped for lack of reference.

---

## Engine touchpoints discovered this run
Two new touchpoints proposed by the engine-integration-auditor (NOT yet appended — this run was read-only; apply to `docs/audit-pipeline/engine-touchpoints.md`):

1. **Location triggered abilities (`.triggeredAbility`)** — dispatcher at `script.js:12046` runs `window[cityLocations[i].triggeredAbility](...)` after a villain in that space is fought. Locations use TWO distinct hooks: `fightEffect` (the Location's own fight, `script.js:11891`) and `triggeredAbility` (fires when a villain in the space is fought, `12046`). Gap **E-2**.
2. **Location attack-while-villain-present bonus** — `showLocationAttackButton()` `script.js:11679` adds +2 when `locationCard.subtype === "Henchman"` and a villain shares the space. Inline-created Locations (strikes/tactics) get no subtype and need a generic engine-read field. Gap **E-3**.

---

## Triage decisions (2026-05-28, Paul)

Source of truth for effects = the finalized, Pass-2-verified inventory (`docs/card-inventory/final/revelations.md`). All clusters are **code-wrong** unless the inventory text itself is found wrong on spot-check.

- **Chemistro Fight effect** (Cluster-adjacent MED) → **FIX**. No reason to gate it to one mode; make it work in both Golden Solo and What If?.
- **Auto-pick vs. present-choice** (Korvac KO-bystander, Nightbringer, Speed "Break the Sound Barrier", Zero, Korvac discard, etc.) → **FIX ALL**. Any card text saying "choose" / "may" / non-mandatory must present the choice to the player; the game must never auto-resolve it.
- **"Each other player" effects** (Dark Hawkeye "then choose one", Dark Ms. Marvel) → **DEFER**. Roll into the existing standing "other player effects in solo" review (`docs/known-issues.md`). Add any other each-other-player Revelations cards to that list as found.
- All other clusters (A–H) → code-wrong, fix per recommended order.

## Dedup vs. existing fix plan (do before triage)
Cross-reference `docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md`:
- **Already known / in-progress:** Cluster A + B's Earthquake/Tsunami city resize = **pending Fix 1A** (scheme transform + city resize). E-4 is part of this.
- **Likely genuinely new (not in the Phase 4 plan):** Cluster C (Location trigger field-name mismatch + undefined trigger functions), Cluster D (villain/Location/mastermind keyword attack scaling unwired), Cluster E (conditionType "None" hero superpowers), Cluster F (log-only hero abilities + `bystanderStack` typo), Cluster H (Mandarin Rings What-If split).
- **Action:** walk these with Paul, confirm code-wrong vs reference-wrong per card, tag Fix Now / Defer / Reject.

---

## Deferred polish / follow-up (non-blocking)

- **Destroyed city-space placeholder art** (low / deferred polish) — Destroyed cells in the Earthquake/Tsunami "Drains the Ocean / Crushes the Coast" scheme (rendered via `destroyedSpaces`, overlay drawn in `updateGameBoard`) currently reuse the **Galactus Master Strike** card image as the "destroyed space" overlay — borrowed from an unrelated scheme. Functionally fine; reads as thematically wrong. **Want:** a more generic destroyed-space visual, or one unique to this scheme. Not blocking the expansion. Surfaced during the 1A playtest (2026-05-28).
- **Sentry / "The Void" name-swap display deferred** (low / deferred polish) — Cluster D Batch 1 shipped Sentry's mechanical "The Void" behaviour: the +5 Attack while in the Streets (city index 1) or Bank (index 3) is wired via `attackFromOwnEffects` in `updateVillainAttackValues`, and the position-conditional Fight effect ("KO up to two cards from your discard pile") was already live in `sentryFight()`. **Not done:** swapping the *displayed name* from "Sentry" to "The Void" while in Bank/Streets (the card art's printed name still shows). Display-only nicety — the overlay reads the card's name from the art, so a name swap needs a separate label-overlay mechanism. Deferred; +5 attack + Fight effect are correct and sufficient for play.

---

## Milestone playtest findings — 2026-05-29

Paul playtested the full Cluster C + D stack (on Batch 3 commit `48988e4`). Worked one at a time; durable capture below.

**CONFIRMED WORKING:**
- Grim Reaper +1 Attack per Location, counting a HYDRA Base Location (Cluster D Batch 2).
- HYDRA Base Location +2 Attack while a Villain shares its space (Cluster D Batch 3, generic `bonusWhileVillain`).

**OPEN (one at a time):**
- **PT-1 — Villain-draw popup doesn't fire for Location/Henchman cards** [type-handling]. HYDRA Base entered the city with no villain-draw popup; board + console were otherwise correct. The draw/popup path likely doesn't branch for `type === "Location"` (or Henchman-Locations).
  - **ROOT CAUSE CONFIRMED (2026-05-29, diagnose-only).** `processVillainCard()` routes `type === "Location"` cards to `placeLocation()` (`script.js:6151-6152`). Each card-type branch is responsible for its OWN popup — Villain/Master Strike/Scheme Twist/Bystander handlers each call `showPopup(...)`, but `placeLocation()` (`script.js:584-605`) only logs to `onscreenConsole` + `updateGameBoard()` and never shows a popup. `showPopup()`'s type switch (`script.js:6623-6759`) has no `"Location"` case either (unknown type → image hidden at the `else`). So Location draws enter silently (board + console correct, no modal).
  - **Not deliberate:** git history (`placeLocation` + the Location branch both added in `c0e5203`) shows it was wired straight to `placeLocation` with no popup from day one — oversight, not a guard. Fix 1D only swapped `console.log`→`onscreenConsole.log`; the console line was never meant to substitute for the modal (villains get both).
  - **Mode:** identical both modes — both call the same `processVillainCard()` (Golden `script.js:5200`, What If? `5218`); only the draw COUNT differs, not the per-card popup logic.
  - **Fix direction:** add a `"Location Arrival"` case to `showPopup()` (alongside `"Villain Arrival"` ~6700-6706: title, `drawnCard.image`, instruction text matching the console line, confirm button) and an awaited `showPopup("Location Arrival", locationCard, resolve)` in `placeLocation()`'s NORMAL-placement path only (after `cityLocations[targetIndex] = locationCard;` ~line 600) — NOT the overflow path (`handleLocationOverflow` already prompts via `showOperationSelectionPopup`, so don't double-popup). Small fix. Reuses the villain `showPopup` pattern.
- **PT-2 — Swordsman ambush "he and each Location captures a Bystander"** [type-handling / unimplemented]. Only Swordsman captured a Bystander; the Locations in the city did not. The "each Location also captures" half is unimplemented.
  - **DIAGNOSIS CORRECTS THE HYPOTHESIS (2026-05-29, diagnose-only).** The capture half is ALREADY implemented; the missing half is RESCUE + DISPLAY.
  - **Verbatim** (`revelations.md:529-532`): "**Swordsman** (×1) / Swordsman gets +3 Attack while there's a 'Carnival' Location in the city. / Ambush: Swordsman and each Location in the city each capture a Bystander. / Attack: 4+ | VP: 3". DB `cardDatabase.js:4383-4403` (id 107, `ambushEffect:"swordsmanAmbush"`).
  - **(a) ambush capture onto each Location — IMPLEMENTED** (`expansionRevelations.js:2212-2221`: loops `cityLocations[]`, pops a bystander per non-null Location into `cityLocations[i].capturedBystanders`). **(b) Location holds capture state — IMPLEMENTED** (field `capturedBystanders`, array). **(c) rescue on Location defeat — MISSING:** `capturedBystanders` is written but read NOWHERE; `defeatLocation()` (`script.js:12022-12064`) has no rescue block, so captured bystanders are silently destroyed on defeat. **Display — MISSING:** no overlay renders `cityLocations[i].capturedBystanders` (villain bystanders render at `script.js:8913-8956`), so the player never sees the Location holding one → likely the source of the "didn't work" perception (capture is happening invisibly).
  - **Existing villain capture/rescue pattern to mirror:** capture `villainEffectAttachBystanderToVillain` (`script.js:5424`, stores on `city[i].bystander[]`); rescue `collectDefeatOperations` (`script.js:12449-12473`, pushes each to victoryPile + `bystanderBonuses()` + `rescueBystanderAbility()`).
  - **Cloning-safe:** `cityLocations[]` is NOT cloned (unlike villains' `createVillainCopy()` whitelist gotcha). `defeatLocation` reads the LIVE `cityLocations[cityIndex]` (`script.js:12023`), so ambush-set `capturedBystanders` persists to defeat — NO whitelist entry needed; a rescue block can read `locationCard.capturedBystanders` directly.
  - **Mode:** `swordsmanAmbush` + `defeatLocation` have no `gameMode` branching — identical both modes.
  - **Implementation outline (feature sub-step):** (1) rescue block in `defeatLocation` after `victoryPile.push(locationCard)` (~12047), before fight-effect (~12053): loop `locationCard.capturedBystanders`, log + `victoryPile.push` + `bystanderBonuses()` + `await rescueBystanderAbility(b)` (simple sequential loop — the 3 Lethal Legion Locations have no fight effect, so no order-choice needed). (2) captured-bystander overlay on the Location card render, mirroring `script.js:8913-8956`. (3) Playwright verify both modes: after Swordsman ambush with ≥1 Location, each `cityLocations[i].capturedBystanders.length===1`; on Location defeat the bystander lands in `victoryPile`. NOTE: this display overlay overlaps the deferred "Villain/Mastermind overlay UX pass" in known-issues — consider scope alignment.
- **PT-3 — HYDRA transforming Scheme, S.H.I.E.L.D. Officer stack** [feature gap]: (a) no on-screen count of Officers stacked by the Scheme; (b) no "pay 3 Recruit → gain a stacked Officer" player action.
- **PT-4 — Twist count off-by-one** [logic]: 2 Twists in the KO pile but the console said "3 Twist(s)", and Officers were added as if 3. Twist counter over-counts by one.
  - **ROOT CAUSE CONFIRMED (2026-05-29, diagnose-only):** Scheme = **Secret HYDRA Corruption** (Side A) / **Open HYDRA Revolution** (Side B). Twist handlers: `secretHydraCorruptionTwist()` (`expansionRevelations.js:2332`) and `openHydraRevolutionTwist()` (`expansionRevelations.js:2344`). Both compute `const twistsInKO = koPile.filter(c => c.type === "Scheme Twist").length + 1;` (lines 2335 / 2346) — the `+ 1` is a manual "including this one" adjustment.
  - **The off-by-one:** the engine's `handleSchemeTwist()` (`script.js:5881`) pushes the current twist to `koPile` at **line 5887** BEFORE it `await`s the scheme's twist effect at **line 5917**. So by the time the HYDRA counter runs, the current twist is ALREADY in `koPile`. The filter therefore already counts "this one" (N cards for the Nth twist) — and the extra `+ 1` counts it a second time → N+1. Twist cards carry `type: "Scheme Twist"` (`script.js:4797-4799`), so the filter matches them. Empirically reproduced: KO holding 2 twists at effect-time → `length+1 = 3` (matches Paul's "3 Twist(s)"); without `+1` → 2 (correct). 3rd twist: buggy 4 / correct 3.
  - **Correct semantics:** for the Nth twist, count = N (N-1 already in KO from prior twists + this one, which 5887 just added). N=2 → 2.
  - **Relationship to PT-3:** SAME scheme. This count (`twistsInKO`) drives `hydraOfficersNextToScheme += twistsInKO` — i.e. how many S.H.I.E.L.D. Officers get placed next to the Scheme. PT-4 is purely the over-count; **PT-3 is the separate missing feature** (Officer-stack count indicator + the "pay 3 Recruit → gain a Hydra Sympathizer Hero" action). Fixing PT-4 makes the Officer-placement number correct; it does not address PT-3's display/spend gap.
  - **Fix direction (NOT yet implemented):** remove the `+ 1` in BOTH handlers — `const twistsInKO = koPile.filter(c => c.type === "Scheme Twist").length;`. The "(including this one)" wording in the Side-A log stays accurate (the KO pile genuinely includes this one now). **Blast radius:** `expansionRevelations.js` — 2 lines (2335, 2346); no engine change, no twin function. **Regression note:** any OTHER scheme twist effect that counts `koPile` "Scheme Twist" cards must use the post-push convention (no `+1`), since 5887 always pushes before the effect runs — worth a grep for `+ 1` patterns on koPile twist filters when touching this.
- **PT-5 — Storm "Lightning Bolt" (−2 to a Villain on Rooftops) wrongly hit a Location there** [type-handling]: the −2 should be Villain-only; it applied to a Location in the Rooftops space.
  - **DIAGNOSIS CORRECTS THE HYPOTHESIS (2026-05-29, diagnose-only) — likely DISPLAY-ONLY, needs empirical confirm before treating as cosmetic.** Storm is a CORE SET hero (verbatim `core-set.md:496`: "Villains in the Rooftops get -2 Fight value this turn."), not Revelations.
  - **Mechanism:** `StormMinus2ToRooftops()` (`cardAbilities.js:7711-7718`) decrements `cityLocationAttack[2]` — a per-CITY-SPACE array (Rooftops = index 2), NOT a per-card field and NOT a villain `attackFrom*` field. Villains and Locations occupy the same space via separate arrays (`city[]` vs `cityLocations[]`).
  - **The −2 is applied CORRECTLY to villains and does NOT actually reduce the Location's fight cost.** Villain fight cost reads `cityLocationAttack` (`script.js:11558-11559`, `12107-12110`) → villains get −2 (correct). But `getLocationEffectiveAttack()` (`script.js:11776-11782`, = base + `bonusWhileVillain` only) does NOT read `cityLocationAttack`, and the Location fight path (`showLocationAttackButton`→`defeatLocation`→`payLocationAttackCost`) deducts only that effective attack. So per the on-disk code the Location's cost is unaffected.
  - **The visible artifact is the city-space LABEL overlay** (`script.js:8583-8589`, `cardAbilities.js:11676-11695`) rendering the −2 on the space label next to/under the Location card (peek layout), making it LOOK like the Location is reduced.
  - **Mode:** mode-agnostic — no `gameMode` branching touches the Storm path or `cityLocationAttack`.
  - **EMPIRICAL CONFIRM — DISPLAY-ONLY (2026-05-29, /game-test live worktree build).** With `cityLocationAttack[2] = -2` (Storm active on Rooftops): `getLocationEffectiveAttack(2)` returned **8** for a base-8 Location (UNCHANGED — the −2 is ignored by the Location cost; `getLocationEffectiveAttack`'s source does not reference `cityLocationAttack`). Control: a base-7 Villain on Rooftops → `recalculateVillainAttack = 7`, villain fight cost = 7 + `cityLocationAttack[2]` = **5** (villain correctly gets −2). So the −2 is real and correctly Villain-only; the Location's fight cost is NOT affected. The playtest observation was the city-space LABEL overlay rendering −2 next to the Location card. **CONFIRMED display-only, not a real attack bug.**
  - **Fix direction (display-only, not yet applied):** gate the label overlay to render only when a Villain occupies the space — `if (locationAttackValue !== 0 && city[i])` at `script.js:8583` and the mirror at `cardAbilities.js:11679` (2-line twin fix). No change to `getLocationEffectiveAttack`/`defeatLocation` (cost is already correct).
- **PT-6 — Thor "God of Thunder" recruit-as-attack NOT applied to Location fight cost** [affordability]: Thor active (6 Attack + 3 Recruit = 9 available) vs a cost-8 Location → fight was rejected. Location affordability ignores the recruit-as-attack pool.
- **PT-7 — Location affordability let an 8-cost Location (Carnival of Concussions) be defeated with ~4 points** [affordability — possible Batch 3 regression]. Directly contradicts PT-6; both are affordability bugs, opposite directions.
- **PT-8 — Carnival of Concussions appears TWICE in Victory Pile after defeat** [cloning]: the tactic→Location transform appears to duplicate the card.
  - **ORIGIN CONFIRMED (2026-05-29, diagnose-only):** NOT a `defeatLocation` bug (`script.js:12038` pushes exactly 1 Location copy). The double comes from the tactic-reveal path: `revealMastermindTactic()` (`script.js:15657`) pops the Mastermind Tactic and **unconditionally** `victoryPile.push(tacticCard)` at `script.js:15661`, THEN `resolveTacticEffects()` runs the tactic's `fightEffect` (e.g. `grimReaperCarnivalOfConcussions` in `expansionRevelations.js:2503`), which calls `placeLocation({...})` to create a **separate** Location object in the city. Later defeating that Location pushes IT to the pile too → 2 entries for one physical card. `calculateVictoryPoints()` (`script.js:16428`) sums `victoryPoints` over every pile entry, so both score.
  - **VP detail:** the duplicate is tactic VP **5** (`cardDatabase.js` tactic entries, e.g. line 1734) + Location VP **6** (post-Root-B placeLocation) = **11** scored for one card (coordinator estimated 12; actual is 11 because the stale DB tactic is 5, not 6). Pre-Root-B the Location was VP 0, masking the double (5+0=5 ≈ expected 6, looked "close enough").
  - **Transform-tactic set (exactly 6, all `placeLocation`-calling fightEffects):** `grimReaperCarnivalOfConcussions`, `grimReaperCultOfSkulls`, `grimReaperMazeOfBones`, `grimReaperPrisonOfCoffins`, `mandarinDragonOfHeavenSpaceship`, `theHoodWarehouse`. (The two `Graveyard` `placeLocation` calls at `expansionRevelations.js:2466`/`2490` are Master-Strike effects, NOT tactics — they never hit `15661`.)
  - **Rules verdict (no ambiguity, no Paul call):** inventory (`docs/card-inventory/final/revelations.md:562-571`, `expansions/revelations/revelations-reference.md`) describes ONE physical card worth 6 VP: "*this card enters the city as a Location*" — it does NOT go to the Victory Pile when fought as a Tactic; it scores its 6 VP once, when the Location is later defeated. Per the inventory-as-source rule, the Location's VP 6 is authoritative; the DB tactic VP 5 is stale and becomes dead once the tactic stops scoring.
  - **Fix direction (NOT yet implemented):** suppress the `15661` push for transform-tactics only — add an explicit `transformsToLocation: true` flag to the 6 tactic DB entries, then gate the push: `if (!tacticCard.transformsToLocation) victoryPile.push(tacticCard);`. The popup + `resolveTacticEffects` still run (the effect places the Location). **Regression guard:** all non-transform Mastermind Tactics (base game + other expansions) lack the flag → push unchanged → score normally. Blast radius: `cardDatabase.js` (6 entries) + `script.js` (1 guarded line). No HQ/city twin (not the attack pipeline). `15661` is the ONLY tactic push (verified).
- **PT-9 (minor) — Defeated Carnival showed "Worth 0 VP"** [verify]: confirm correct VP against the finalized inventory.

(Diagnosis of PT-6 + PT-7 recorded inline in session; fixes pending — to be worked one at a time after Paul's dispatch.)

### Location type-handling batch (PT-1 / PT-5 / PT-2) — cross-cutting + grouping (2026-05-29, diagnose-only)

**Cross-cutting verdict:** these are NOT one shared "Villain vs Location" type-guard. They're three DIFFERENT per-type code paths that were never extended to the (newer) Location card type:
- PT-1 = per-type POPUP dispatch (each card-type branch shows its own popup; Location branch never adopted it).
- PT-5 = per-SPACE attack modifier (`cityLocationAttack`) shared by villain-cost (correct) + a label overlay (misleading display); no type filter involved — fight cost already excludes Locations.
- PT-2 = capture-state RESCUE + display (capture implemented; the read/rescue + overlay for the Location field were never added).
A single speculative shared guard would NOT have prevented these (different mechanisms). The real theme: "Location is a newer card type; several per-type paths (popup dispatch, capture rescue, overlay rendering) lack Location coverage." Recommend a LIGHTWEIGHT CHECKLIST when adding/auditing a per-type path ("does this handle Location alongside Villain/Henchman?") rather than building a shared abstraction now. Flag only — do not build speculatively.

**Recommended implementation grouping (stage approvals):**
- **Group 1 — PT-1 (Location draw popup):** small, self-contained, mode-agnostic, real bug. Clean standalone fix. Good first/trigger candidate.
- **Group 2 — PT-5 (Storm label overlay):** likely DISPLAY-ONLY — **empirical `/game-test` confirm REQUIRED first** (does the live build actually reduce the Location's cost, or only mislead via the label?). If display-only, a 2-line overlay-gate fix; if cost is genuinely reduced, re-scope. Hold until confirmed.
- **Group 3 — PT-2 (Location bystander rescue + display):** feature sub-step (capture already done) — rescue-on-defeat block in `defeatLocation` + a captured-bystander overlay. Larger; its overlay overlaps the deferred "Villain/Mastermind overlay UX pass". Stage after Groups 1-2.
(Coordinator note: PT-1's fix-commit is Paul's Golden Solo playtest trigger.)

## Catch-up review findings — 2026-05-29

Cold-read review (subagent-delegated) of the fix campaign diff `6c81aca..HEAD` (1A → PT-4), plus expansion-validator on expansionRevelations.js. Triaged with Paul. Campaign-new findings fixed (see commit `7ff574f`: H1/M2/L2 + comment cleanups); the items below are NOT yet actioned.

**QUEUED (fix after dispatch):**
- **M1 — PT-8 negate edge: transform-tactic loses 6 VP AND places no Location when its fight effect is nullified** [logic, campaign-new]. **DIAGNOSIS CONFIRMED (2026-05-29, diagnose-only).**
  - **Reachable in solo? YES (both modes).** `promptNegateFightEffectWithMrFantastic` (`expansionFantasticFour.js:4422`) gates on `canRevealMrFantasticUltimateNullifier()` (`4410`), which only checks the player holds "Mr. Fantastic - Ultimate Nullifier" in hand or played-this-turn — NOT mode-gated. A solo player who drafts Mr. Fantastic (Fantastic Four) alongside a Location-placing Revelations mastermind (Grim Reaper / Mandarin / The Hood) can negate its tactic. So M1 is a real, reachable issue.
  - **Mechanism:** `revealMastermindTactic` (`script.js:15675`) suppresses the VP push for `transformsToLocation` tactics, relying on the fightEffect to place the scoring Location. `resolveTacticEffects` (`script.js:15739-15746`) lets `promptNegateFightEffectWithMrFantastic()` set `negate=true`, and the `if (!negate)` guard then SKIPS the fightEffect → `placeLocation` never runs. Net: tactic not in VP + no Location = card vanishes, 6 VP lost. Empirically reproduced (hang-proof, negate forced true): `vp_afterReveal=0`, `fightEffectRan=false`, `placeLocationRan=false`, `locationsInCity=0`.
  - **Rules verdict (NOT genuinely ambiguous → option (a)):** Ultimate Nullifier text (inventory `fantastic-four.md:190`) = "cancel that [Fight] effect" — it cancels the ABILITY, not the card's VP. Base Legendary: a defeated Mastermind Tactic always goes to the Victory Pile for its printed VP. Confirming this is the right read: NORMAL (non-transform) tactics are pushed to VP UNCONDITIONALLY at `15676` (before the negate), so a negated normal tactic still scores — transform-tactics alone lose everything because PT-8 moved their scoring to the Location. The cancelled fight effect includes the transform (it's part of the "Fight:" text), so no Location should enter. Correct behavior: negated transform-tactic → push tactic to Victory Pile (scores its 6 VP, like a normal defeated tactic) and do NOT transform. This restores parity with normal tactics; (b) "Location still enters" and (c) "can't be negated" have no rules basis. Recommend (a); flagging the one judgment point (the transform is cancelled along with the rest of the fight effect) for confirmation, not blocking.
  - **Fix direction (NOT implemented):** in `resolveTacticEffects`, when `negate === true && tacticCard.transformsToLocation`, `victoryPile.push(tacticCard)` (and skip the transform, which the existing `if (!negate)` already does). **Blast radius:** `script.js` `resolveTacticEffects` — ~3 lines (one conditional in the negate branch). No twin. Regression-safe: normal tactics already pushed at reveal; only transform-tactics gain the negate fallback. When negate=false, behavior unchanged (effect runs → Location placed → scores via Location).
- **M3 — HQ index-drift in `houseOfMTwist` (`expansionRevelations.js:2274-2302`) + `noMoreMutantsTwist` (`2305-2326`)** [logic]. **DIAGNOSIS CONFIRMED (2026-05-29, diagnose-only).**
  - **Verbatim intent (inventory `revelations.md:669/673`):** House of M Twist = "KO **all** non-X-Men Heroes from the HQ. If there are at least 2 Scarlet Witch cards in the city, this Scheme Transforms. Otherwise play another card from the Villain Deck." No More Mutants Twist = "KO **all** X-Men Heroes from the HQ. Play another card from the Villain Deck." Intent is ALL qualifying heroes.
  - **The skip (Golden mode only):** both loop `for (i=0; i<hqCards.length; i++)`; inside the golden branch they do `hqCards[i]=null; goldenRefillHQ(i)`. `goldenRefillHQ` (`script.js:5115`) does `hq.splice(i,1)` (removes slot i, shifting every element after i LEFT one) then `hq.push(newCard)`. So after KOing index i, the hero that was at i+1 slides down to i — but the loop then does `i++`, jumping over it. Adjacent qualifying heroes get skipped. EMPIRICALLY REPRODUCED with HQ `[A,B (non-XM), C (XM), D,E (non-XM)]` + golden: real `houseOfMTwist` KO'd only `[A,D]`, leaving `[B,E]` un-KO'd (survivors). Backward iteration KO'd all `[A,B,D,E]`.
  - **Mode picture (rule 7):** GOLDEN-ONLY bug. The What If? branch (`else: hqCards[i] = heroDeck.pop()`) is fill-in-place — no splice, no shift — so the forward loop processes each index exactly once and is correct. The defect lives entirely in the `goldenRefillHQ` path.
  - **Correct approach:** iterate BACKWARD (`for (i = hqCards.length-1; i >= 0; i--)`). `goldenRefillHQ(i)` shifts only elements AFTER i (already processed) and pushes the new card at the end (already passed) — pending indices (< i) are untouched, so nothing is skipped and no freshly-drawn card is re-examined. Verified backward = all KO'd. (Cleaner than collect-then-KO, which is itself index-fragile against the same splice.) Backward is also safe/harmless for the What If? fill-in-place branch (order-independent), so a single `for` direction change fixes both modes' code paths.
  - **Fix + blast radius:** flip the loop direction in BOTH `houseOfMTwist` and `noMoreMutantsTwist` (`expansionRevelations.js`) — 2 lines, one per function. No twin in script.js; no engine change. Regression-safe (What If? unaffected; Golden now KOs all).
- **(also surfaced by review gate, 2026-05-29) `sentrysWatchtowerFight` (`expansionRevelations.js:~1985`) ungated HQ fill-in-place** [Rule 2, pre-existing/campaign content]. `hq[wtIdx] = heroDeck.pop()` has no `gameMode === 'golden'` rotation branch — in Golden Solo HQ refill must rotate (rightmost via `goldenRefillHQ`), not fill-in-place. Needs a gameplay-intent call: is "gain the hero under this Location" a refill (rotate) or a one-off slot replacement? Flag for triage — not in the H1/M2/L2 fix-group scope.

**DEFERRED (logged, not scheduled):**
- **INFO — double `checkMastermindState()` on the tactic negate=FALSE sub-path** (`script.js` `resolveTacticEffects` ~15743-15746). When Fantastic Four is loaded the `if (typeof promptNegateFightEffectWithMrFantastic === "function")` block always runs and calls `checkMastermindState(); resolve();` unconditionally (even when the player declines to negate); the code then falls through to `if (!negate)` and calls `checkMastermindState(); resolve()` again. The second `resolve()` is a harmless no-op on a settled Promise, but `checkMastermindState()` (→ `checkWinCondition` / `finalBlowNeededPopup`) runs twice per non-negated tactic. Pre-existing structural quirk, surfaced during M1 review; harmless. Not scheduled.
- **L3 — unawaited async `drawWound()` in `revealClassOrWound` (`expansionRevelations.js:1705`, `1723`)** [async, pre-existing]. The no-eligible-class path and the deny-button handler call `drawWound()` without `await`, so the wound (which can show an invulnerability popup) resolves detached from the ambush/fight sequence. Fix needs the deny callback to become `async`. Low impact (wound still draws); deferred.
- **L4 — unguarded DOM lookups in 5 popup helpers** [Rule 6, pre-existing]: `koUpToNFromDiscardPile` (~205), `takeOneFromDiscardToHand` (~385), `revealTopNKOAny` (~535), `koUpToNHeroesYouHave` (~704), `pickRingFromVictoryPile` (~2618) in `expansionRevelations.js`. Grab `.card-choice-popup*` elements and mutate without null checks. Low crash risk (static elements, mid-game only); inconsistent with the file's own guarded info-popups. Deferred.

**Mode-divergence scan (`gameMode` lens, report-only):** LOW risk — the campaign added zero new `gameMode` branches and built on already-mode-aware primitives. No Critical/High/Medium. Residual exposure is coverage, not code: Hood's Warehouse mid-turn `processVillainCard` draw, PT-8 transform-tactic VP deferral (matters slightly more in Golden's Final Showdown scoring), and Location payment with reserved attack have only been exercised in What If?. Recommend one Golden Solo playtest with a Location-placing Revelations mastermind (Grim Reaper or The Hood) paired with Earthquake/Tsunami for the large-city sentinel paths. (Note: Hood's Warehouse trigger uses `processVillainCard`, which — like in both modes — does NOT re-check `destroyedSpaces[citySize-1]`; could place a villain past a destroyed-city endgame guard. Same in both modes; edge-of-edge.)

**Triage outcomes (2026-05-29, Paul):**
- **W1 (Sentry's Watchtower "villains here get Last Stand", unimplemented) → Cluster D Batch 4.** Comment relabelled NOT-IMPLEMENTED + TODO in commit `7ff574f`; the keyword-grant itself is scheduled with Batch 4. (Note: `sentrysWatchtowerFight` HQ-refill fill-in-place is the separate Rule-2 item above, still needs a refill-vs-rotate gameplay call.)
- **Hood's Warehouse / `destroyedSpaces` endgame edge → DEFERRED** (edge-of-edge; same in both modes).
- **`cumulativeAttackPoints` possibly-dead → VERIFY BEFORE ACTION.** Two reviewers found no read site (only incremented at `script.js:8060`/`10943`, reset `11322`; the L2 fix removed the lone decrement). If a careful sweep confirms zero reads, the "Attack-Granting Function Pattern" gotcha in CLAUDE.md (which currently mandates pairing every `totalAttackPoints +=` with a `cumulativeAttackPoints +=` for Final Showdown) is STALE and should be updated/removed — but DO NOT change attack-granting code or the gotcha until the no-read-site claim is independently verified (a missed read would silently break Final Showdown). Logged for a dedicated verification pass; not scheduled.

---

## Golden Solo milestone playtest findings (GP) — 2026-05-29

Paul's Golden Solo milestone playtest, one finding at a time. GP-3 / GP-4 / GP-5 diagnosed in the diagnose-only pass; GP-1 / GP-2 / GP-6 from the coordinator's playtest notes (not yet independently investigated — refine wording as each is worked).

**Implementation order (coordinator green-light 2026-05-29):** GP-3 first, staged GP-3a → GP-3e through the Rule-7 gate. GP-1, GP-2, GP-6 sequenced after (not yet scheduled).

### GP-1 — Ronin "Mysterious Identity": log-only, no choice UI (Cluster F shape)
Currently logs the class/team-reassignment text but has no selection UI — the actual class/team choice is never wired. Same log-only pattern as Cluster F hero abilities. `expansionRevelations.js:~1306`. Needs the player picker for the color/team reassignment. **Not yet investigated in detail.**

### GP-2 — Grim Reaper Master Strike "Graveyard" Location: display-only overlay bug
The Graveyard Location renders the **mastermind card image + Attack 8** instead of the **Graveyard image + Attack 7**. The game **honors the correct 7** (fight cost is right); only the overlay/display is wrong. DISPLAY-ONLY. Likely the same family as PT-5 (label/overlay rendering) — the placeLocation'd Graveyard card's image/attack overlay reads the wrong source. **Not yet investigated in detail** (candidate: the Graveyard `placeLocation({...})` call at `expansionRevelations.js:2466`/`2490` — confirm the image + attack passed vs what the overlay renders).

### GP-6 — HYDRA Base: Nullifier didn't nullify it, AND the Nullifier popup wrongly shows "Super Skrull"
Two bugs: (a) Mr. Fantastic's Ultimate Nullifier did not cancel HYDRA Base's Fight effect; (b) the Nullifier confirm popup displays the wrong card reference ("Super Skrull") — a card-reference/arg bug in the popup. Relates to the Nullifier arg area touched in M1 / Fix A: `script.js:~15743` (tactic negate path) + `expansionFantasticFour.js:~4422`/`~4461` (`promptNegateFightEffectWithMrFantastic` — note the hardcoded `MR_FANTASTIC_IMAGE` at 4423 and the title set at 4441; a wrong card image/name there is the likely (b) culprit). **Not yet investigated in detail.** (Overlaps GP-5's Nullifier work — sequence together if convenient.)

### GP-3 — "each other player" LOCATION effects must SELF-APPLY in solo (REVERSAL of shipped Cluster C announce-and-skip)

**Rules basis (DECIDED, scope = LOCATIONS ONLY):** Revelations rulebook + inventory (`docs/card-inventory/final/revelations.md:16`): *"In 1-player solo: 'each other player' effects apply to yourself."* This supersedes Cluster C's announce-and-skip **for Location triggers only**. Non-Location "each other player" effects (villain Fight/Ambush/Escape, mastermind tactics, Master Strikes — Dark Hawkeye, Dark Ms. Marvel, Intertwining Powers, Rings Seek Their True Hand, Demonic Revelation, Focus Magic Through Guns, Paean to Dormammu, etc.) **STAY DEFERRED** to the standing project-wide other-player review (`docs/known-issues.md`). Do NOT touch them.

**Current shipped state (Cluster C):** the trigger dispatch reads `triggeredAbility` correctly (`script.js:12256`, fires after a Villain sharing the Location's space is defeated). All 10 each-other-player Location triggers route to `announceOtherPlayerLocationTrigger()` (`expansionRevelations.js:2941`) — they log the verbatim effect + "No other players in solo — skipped." Only `hoodsWarehouseTrigger` (11th Location trigger) already self-applies ("play another card from the Villain Deck" — not an each-other-player effect; leave it).

**Mode:** the dispatch is mode-agnostic (same in Golden + What If?); both are 1-player, so self-apply is correct for both. No `gameMode` branching needed.

**The 10 triggers → solo self-apply semantics + implementation:**

| # | Location (group) | Verbatim trigger effect | Solo self-apply | Implementation |
|---|---|---|---|---|
| 1 | **Dome of Darkforce** (Army of Evil) | reveals a [RANGE] Hero or discards a card | you reveal a Range Hero, else discard a card | **REUSE** `revealClassOrDiscard("Range", "Range.svg", "Dome of Darkforce")` |
| 2 | **Laser Maze** (Lethal Legion) | reveals a [RANGE] Hero or gains a Wound | you reveal a Range Hero, else gain a Wound | **REUSE** `revealClassOrWound("Range", "Range.svg", "Laser Maze")` |
| 3 | **Maze of Bones** (Grim Reaper tactic) | gains a Wound | you gain a Wound | **REUSE** `await drawWound()` |
| 4 | **White Gorilla Cult** (Lethal Legion) | reveals their hand and discards a [TECH] card | reveal hand; discard a Tech card (choose if >1; none → nothing) | **NEW** `revealHandDiscardMatching(pred, label)`, pred = has Tech class |
| 5 | **Cult of Skulls** (Grim Reaper tactic) | reveals their hand and discards a non-grey card | reveal hand; discard a non-grey card (choose if >1) | **NEW** same helper, pred = non-grey |
| 6 | **Carnival of Concussions** (Grim Reaper tactic) | KOs a Bystander from their Victory Pile | KO a Bystander from your VP (choose if >1; none → nothing) | **NEW** `koBystanderFromVictoryPile(label)` |
| 7 | **Prison of Coffins** (Grim Reaper tactic) | puts a Villain from their Victory Pile into the Escape Pile | put a Villain from your VP → Escape Pile (choose if >1) | **NEW** `escapeVillainFromVictoryPile(label)` |
| 8 | **"The Raft" Prison** (Lethal Legion) | puts a Villain from VP into Escape Pile **or** gains a Wound | choose: escape a Villain from VP, or gain a Wound (no Villain → Wound) | **NEW** `escapeVillainOrWound(label)` (wraps #7 + `drawWound`) |
| 9 | **Carnival of Wonders** (Lethal Legion) | chooses a Bystander from VP to be captured by Carnival of Wonders | choose a Bystander from your VP; capture it onto this Location | **NEW** `captureBystanderFromVPToLocation(locationCard, label)` — pushes to `locationCard.capturedBystanders` (PT-2 infra; rescued on the Location's own defeat, `script.js:12084`) |
| 10 | **Dragon of Heaven Spaceship** (Mandarin tactic) | reveals their hand and KOs one of their non-grey Heroes | reveal hand; KO one of your non-grey Heroes (choose; none → nothing) | **ADAPT** `koUpToNHeroesYouHave` → forced 1, non-grey filter (or thin new `koOneNonGreyHeroYouHave`) |

**Existing helpers to reuse** (all in `expansionRevelations.js` unless noted): `revealClassOrWound` (1696), `revealClassOrDiscard` (1730), `drawWound` (`cardAbilities.js:280`), `koUpToNHeroesYouHave` (680), `escapePile.push` pattern (2188/2810), PT-2 `capturedBystanders` array (rescued in `defeatLocation`, `script.js:12084`). All trigger fns become `async`; dispatch at `script.js:12256` already `await`s.

**Design points — SETTLED (coordinator 2026-05-29):**
- **"non-grey" predicate** (Cult of Skulls #5, Dragon of Heaven #10): define ONE shared predicate; reuse the existing Epic Hood grey definition already in code if present. Boundary resolved against the Revelations rules PDF (`expansions/revelations/2019_Marvel_Legendary_Revelations_Rules_compressed.pdf`) + inventory per CLAUDE.md rule 8 — default: EXCLUDES grey S.H.I.E.L.D. starting cards and treats Wounds as grey (excluded). Escalate to Paul only if PDF + inventory genuinely leave it open.
- **Choose-vs-auto:** use a picker (per 2026-05-28 "present choices" triage), even where text reads "KOs/puts/discards." Confirmed.

**Grouping proposal (stage approvals, each through the Rule-7 gate):**
- **GP-3a (reuse-only, smallest/safest first):** #1 Dome, #2 Laser Maze, #3 Maze of Bones — swap announce-skip → await existing helper. No new helpers.
- **GP-3b (hand-discard helper):** new `revealHandDiscardMatching` → #4 White Gorilla Cult + #5 Cult of Skulls. (Also closes out GP-4's WGC behaviour question — see below.)
- **GP-3c (VP-manipulation helpers):** `koBystanderFromVictoryPile`, `escapeVillainFromVictoryPile`, `escapeVillainOrWound` → #6 Carnival of Concussions, #7 Prison of Coffins, #8 The Raft Prison.
- **GP-3d (bystander-capture + hero-KO):** `captureBystanderFromVPToLocation` (#9 Carnival of Wonders, leans on PT-2) + adapt `koUpToNHeroesYouHave` (#10 Dragon of Heaven).
- **GP-3e (GP-5 Nullifier wiring):** do LAST — see GP-5.

### GP-4 — White Gorilla Cult "didn't leave the board" until a Tech card was held — ROOT CAUSE: NOT a Tech-coupling bug

**Verdict: the premise is not reproduced. There is no Tech requirement and no Tech-removal coupling anywhere.** Diagnosis (static + empirical `/game-test`, worktree build, 2026-05-29):
- **DB:** White Gorilla Cult (`cardDatabase.js:4426`) — `attack:6`, `classes:[]`, `fightCondition:"None"`, `fightEffect:"whiteGorillaCultFight"` (log-only), `triggeredAbility:"whiteGorillaCultTrigger"`. **No Tech fight/defeat requirement.** Inventory (`revelations.md:538-540`) agrees — Attack 6, no special cost.
- **`defeatLocation` (`script.js:12050`):** removal is **unconditional** — `cityLocations[cityIndex] = null` at 12103, after the (log-only) fight effect. No Tech branch, no class check.
- **Trigger dispatch is in `defeatVillain` only (`script.js:12256`), never in `defeatLocation`** — fighting the Location itself does NOT fire its "fight a Villain here" trigger; fighting a Villain sharing its space does.
- **Empirical confirm (live worktree build, Golden mode path):** with **no Tech card in hand** and sufficient attack, `defeatLocation(0, 6)` on a standalone White Gorilla Cult → `cityLocations[0]===null` (left the board), card in Victory Pile, attack 50→44. Trigger did NOT fire on self-defeat (`triggerFiredOnLocationSelfDefeat:false`). (A post-removal `updateGameBoard` render error is a harness artifact of minimal state injection, not the game.)

**Most likely explanation of Paul's observation (the Tech correlation is incidental):**
1. **Affordability** — the only gate to removing the Location is being able to pay its 6 Attack (`showLocationAttackButton` rejects with "You need 6 Attack" and removes nothing if you can't afford it). The Tech-symbol card Paul drew/held simply **supplied the Attack/Recruit points** that let him finally afford the 6-cost fight. "No Tech card" ≈ "not enough points that turn." **This may also be a facet of the open Location-affordability cluster (PT-6 recruit-as-attack not applied / PT-7 over-credit) — worth checking whether his point pool was being mis-counted.** OR
2. **Expectation mismatch** — if a Villain shared the White Gorilla Cult space, fighting the **Villain** (trigger announces+skips, Villain leaves) correctly leaves the **Location** standing. Paul may have read "Location didn't leave" when the Location simply requires its own separate 6-Attack fight.

**Recommendation:** GP-4 is **not a code bug in removal/Tech-coupling**. To pin which of (1)/(2) Paul hit, one clarifying question: *when it "didn't leave," were you fighting the White Gorilla Cult card itself (paying 6 Attack), or a Villain sitting in its space? And what was your Attack/Recruit total that turn?* If (1) and his pool was mis-counted, it folds into the PT-6/PT-7 affordability work; otherwise GP-4 is correct behaviour. Once GP-3b ships, WGC's trigger will also actually do something (reveal hand + discard a Tech card) — which is a separate axis from its removal.

**STATUS: DEFERRED — no code (coordinator 2026-05-29).** Paul thinks he was fighting the Cult card itself but isn't certain. Static + live findings stand (unconditional removal; trigger fires only on `defeatVillain`; reproduced correct removal with zero Tech cards). Re-verify on the next Golden playtest; if it recurs, the candidate cause is the PT-6/PT-7 Location-affordability tangle, NOT Tech-coupling. Not scheduled.

### GP-5 — Mr. Fantastic's Ultimate Nullifier should be able to cancel a self-applying Location trigger (couldn't when they skipped)

**Why it couldn't before:** an announce-and-skip trigger is a no-op — there's nothing to negate, and the dispatch at `script.js:12256` never invokes the negate prompt. Once GP-3 makes triggers self-apply, negation becomes meaningful.

**Wiring (do in GP-3e, after triggers self-apply):** wrap the trigger dispatch (`script.js:12256-12260`) in the standard negate pattern used elsewhere (`script.js:12530`, `cardAbilitiesDarkCity.js:2483`, etc.):
```js
if (cityLocations[cityIndex] && cityLocations[cityIndex].triggeredAbility) {
  const triggerFn = window[cityLocations[cityIndex].triggeredAbility];
  if (typeof triggerFn === "function") {
    let negate = false;
    if (typeof promptNegateFightEffectWithMrFantastic === "function") {
      negate = await promptNegateFightEffectWithMrFantastic(cityLocations[cityIndex], cityLocations[cityIndex]);
    }
    if (!negate) await triggerFn(cityLocations[cityIndex], cityIndex);
    else onscreenConsole.log(`... ${cityLocations[cityIndex].name} trigger cancelled by Ultimate Nullifier.`);
  }
}
```
Mechanically trivial (engine-side, no twin).

**SETTLED (coordinator 2026-05-29):**
- **Scope = the 10 self-applying each-other-player Location triggers ONLY.** Leave `hoodsWarehouseTrigger` (the 11th) OUT — it plays a Villain card, a different effect class; revisit separately if needed.
- **RAW nuance noted but OVERRIDDEN by intent** — implement per Paul's "should work" expectation. (Card text `fantastic-four.md:190`: *"If an enemy you fight this turn would have a Fight effect, you may cancel that effect"* — the trigger is the Location's, not the fought Villain's, but intent wins.)
- **Do GP-3e LAST** (after the 10 triggers self-apply). UX note: prompt pops per Villain-defeat in a triggered-Location space — acceptable.
