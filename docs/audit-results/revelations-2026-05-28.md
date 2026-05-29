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
- **PT-2 — Swordsman ambush "he and each Location captures a Bystander"** [type-handling / unimplemented]. Only Swordsman captured a Bystander; the Locations in the city did not. The "each Location also captures" half is unimplemented.
- **PT-3 — HYDRA transforming Scheme, S.H.I.E.L.D. Officer stack** [feature gap]: (a) no on-screen count of Officers stacked by the Scheme; (b) no "pay 3 Recruit → gain a stacked Officer" player action.
- **PT-4 — Twist count off-by-one** [logic]: 2 Twists in the KO pile but the console said "3 Twist(s)", and Officers were added as if 3. Twist counter over-counts by one.
- **PT-5 — Storm "Lightning Bolt" (−2 to a Villain on Rooftops) wrongly hit a Location there** [type-handling]: the −2 should be Villain-only; it applied to a Location in the Rooftops space.
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
