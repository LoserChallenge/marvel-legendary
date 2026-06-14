# Revelations — Paul's Hands-On Playtest Log (2026-06-11)

Final gate before merge. Paul plays the worktree build directly; observations logged here
verbatim-ish for later triage. **Log first, triage/fix later** (Paul's call per item).

Status key: 🆕 logged · 🔬 reproducing · ✅ confirmed-fix-landed · 💭 intended/no-change · ❓ needs-ruling

## Triage decisions (2026-06-11, Paul)

- **Effect popups (Obs 5, 16):** KEEP CONSOLE-ONLY — not a bug, no change. Many auto-resolving
  effects already work this way.
- **Token rendering (Obs 3, 6):** FIX Obs 6 now (rescued-Bystander stale render), DEFER Obs 3
  (Klaw captured-Hero not shown) to the post-merge overlay UX pass in known-issues.md.
- **Workflow:** Batch related fixes; run the gate (expansion-validator + fresh-subagent
  `/code-review` + dual-mode `/game-test`) once per batch.
- **Obs 2** (henchmen count) → `rules-oracle`; gates Obs 1 counter.
- **Plan:** one more playtest round after fixes, then merge.

### Fix batches
- **A — Fight prerequisites:** Obs 17 (Dr. Calvin Zabo recruit gate), Obs 15 (Brothers Grimm discard gate)
- **B — Hero effects:** Obs 13 (Speed 5-class picker), Obs 11 (Part-Time PI any deck)
- **C — House of M / Scarlet Witch:** Obs 4 (attack creep), Obs 8 (hero exclusion in setup)
- **D — Korvac scheme:** Obs 9 (KO-bystander-with-none guard), Obs 10 (Revealed twist text)
- **E — Display:** Obs 6 (rescued-bystander render), Obs 18 (HYDRA officer placement), Obs 1/7 counter (after Obs 2 ruling)
- **Investigate:** Obs 12 (Captain Marvel draw — confirm 4-icon threshold)

---

## Game 1 — Golden Solo

**Setup**
- Scheme: Earthquake Drains the Ocean (requires 3 villain groups, 1 henchmen, 5 heroes)
- Mastermind: Mandarin
- Villains: Army of Evil, Dark Avengers, Lethal Legion
- Henchmen: Mandarin's Rings
- Heroes: Hellcat, Photon, Ronin, Scarlet Witch, War Machine

### Obs 1 — 🆕 Earthquake "Evil Wins" shows "SEE SCHEME" instead of a live escape counter
- Under the Scheme, the Evil Wins readout says **"EVIL WINS: SEE SCHEME."**
- Expected: like other schemes with an escape-based loss condition, it should show a live
  **counter** toward the threshold (3 escaped, solo) rather than the static "SEE SCHEME" text.
- **Display issue only** — *what exactly the counter counts* (Villains only vs. Henchmen too) is a
  separate rules question, logged in `docs/rules-notes/open-rules-questions.md`
  ("Earthquake/Tsunami '3 Villains escaped' — do escaped Henchmen count?"). The counter's
  implementation should follow whatever that resolves to.

### Obs 2 — ❓ Earthquake/Tsunami escape count: do Henchmen count toward the 3? → see open-rules-questions.md
- Split out of Obs 1. Paul's reading from card text: **Villains only, NOT Henchmen.** Needs
  rulebook vetting before the counter logic is finalized. Full entry in
  `docs/rules-notes/open-rules-questions.md`.

### Obs 3 — 🆕 Klaw's captured Hero not visible in the city (visibility only — mechanic works)
- Action order observed: (1) White Gorilla Cult (Location) entered Sewers. (2) Klaw entered the
  city, sitting above White Gorilla Cult. (3) Klaw's Ambush captured a Tech/Ranged Hero costing ≤5
  from the HQ — captured **Photon — Infrared Conversation**.
- Bug: that captured Hero card is **not shown** in the city alongside the Klaw card.
- Confirmed mechanic is correct: Paul fought Klaw and **gained that hero card** as expected. So this
  is purely a **visibility/display** issue — the captured Hero isn't rendered on/under Klaw.
- (Likely related to the deferred "Villain/Mastermind overlay UX pass" in known-issues — captured
  heroes / bystanders shrink to thumbnails or don't show; verify during triage.)

**Game cut short:** the Scheme Twist fired right after, shrank the city, and multiple Villains
(+ henchmen) escaped — didn't get much further this game.

---

## Game 2 — Golden Solo

**Setup**
- Scheme: House of M (requires 2 villain groups, 1 henchmen, 6 heroes)
- Mastermind: Grim Reaper
- Villains: Dark Avengers, Lethal Legion
- Henchmen: HYDRA Base
- Heroes: Cyclops, Emma Frost, Rogue, Angel, Photon, War Machine (4 X-Men + 2 non-X-Men ✓)

### Obs 4 — 🔬 Scarlet Witch attack "creep" — INVESTIGATED, attack math empirically CORRECT (Batch C)
**Triage hypothesis (`+=` stacking / both bonuses applied) DISPROVEN.** Scheme rule: each Scarlet
Witch in the city is a Villain with Attack = **cost + 3** (Side A) / **cost + 4** (Side B).
- Code read: the scheme bonus is a single **assignment** (`villain.attackFromScheme = villain.cost +
  (Side B ? 4 : 3)`) keyed on the side-stable `scheme.endGame`, in BOTH attack-value twins
  (`updateVillainAttackValues` city ~10362, `updateHQVillainAttackValues` HQ ~10638). Seeded SW base
  `attack` is 0; `originalAttack` is never added. Every consuming path — the city overlay
  (`script.js:8843-8863`), the fight-cost (`recalculateVillainAttack` ~12318), and the HQ helper —
  computes `base(0) + cost+N` with no accumulation.
- **Deterministic Playwright repro (House of M game, 2026-06-14):**
  - Side A: two **Alter Reality** (cost 3) placed → DOM attack overlays read **6, 6** (= 3+3). ✓
  - After `transformScheme()` → No More Mutants (Side B): same two read **7, 7** (= 3+4). ✓ Clean
    recalc, no stacking, no +3.
  - **Hex Bolt** (cost 2, the only SW card with `originalAttack`=1) in the sewers entry slot reads
    **cost+N**, NOT +1 — proving `originalAttack` does not leak into the display.
- Every term in the display formula was checked empirically and is 0 except the scheme bonus
  (mastermind 0, own/hero/shards 0, `cityTempBuff` 0 for House of M, shattered 0). There is **no code
  path** that adds +1 or +3 to a Scarlet Witch villain. **Fight cost is also correct** — gameplay is
  unaffected.
- **Conclusion / recommendation:** not a reproducible attack-calc bug — NO speculative fix applied
  (per diagnose-before-patching). Paul's 7/10 readings most likely a transient overlay-overlap misread
  (cf. the known Obs 3/6 token-rendering glitches) or a non-SW effect in that specific game (Grim
  Reaper mastermind). **Re-test ask:** if it recurs, capture the exact on-screen number + full board
  (mastermind, every city card, whether mid-animation). Otherwise → defer/close.

### Obs 5 — 💭 Dark Spider-Man Fight effect: no popup — NO CHANGE (Paul: keep console-only)
- Fought Dark Spider-Man; initially thought the Fight effect didn't trigger. It **did** — visible
  in the in-game console log. But **no popup** appeared, which Paul expected for that effect
  (reveal top two, KO one costing ≤2, put rest back).
- Likely a missing/auto-resolved choice popup. Triage: should this effect present a popup, or is
  silent console-only acceptable? (Compare to how other reveal-and-KO effects notify.)

### Obs 6 — 🆕 Rescued Bystander icon remains (and oversized) after rescue
- A Bystander entered captured by a Villain in the Sewers. Paul fought the Villain; log said the
  Bystander was **rescued**, but the Bystander **icon stayed** on the space and is **larger than
  usual**.
- Same family as Obs 3 (Klaw captured-Hero not shown) and the deferred "Villain/Mastermind overlay
  UX pass" in known-issues — captured/rescued tokens rendering wrong. Triage together.

### Obs 7 — 🆕 Scheme counter shows "SEE SCHEME" again (House of M)
- Same display gap as Obs 1, now on House of M. (House of M Evil Wins = non-grey Heroes in KO pile
  ≥ 10 + 2×players; solo threshold = 12.) Counter should show a live tally, not static text.

### Obs 8 — ✅ Scarlet Witch selectable as a Hero under House of M — FIXED (Batch C)
- House of M shuffles **14 Scarlet Witch Hero cards** into the Villain Deck — she can't also be a
  chosen playable Hero.
- Fix: generalized the existing hardcoded **Jean Grey ↔ Transform Citizens Into Demons** hero-
  exclusion into a data-driven **`scheme.excludedHeroes`** array. Added `excludedHeroes:
  ["Scarlet Witch"]` to House of M and `["Jean Grey"]` to Transform Citizens (cardDatabase.js). New
  helper `applySchemeHeroExclusions(schemeName)` (script.js) greys out + unchecks each barred hero for
  the active scheme and re-enables heroes barred only by other schemes. All 5 former hardcoded Jean
  Grey sites replaced with the generic helper/check; **also wired into the live scheme-radio `change`
  listener** (a hole the Jean Grey precedent left open). Validator in `showConfirmChoicesPopup` blocks
  Begin + shows an error if a barred hero is selected.
- **Bonus fix (found by cold-read review):** the old Jean Grey disable used an unqualified
  `input[value="Jean Grey"]` selector that matched the **wrong element** (the x-cutioner radio,
  earlier in document order) — so Jean Grey's checkbox was never actually greyed out. The new
  `input[name="hero"][value=...]` selector fixes that latent bug too.
- Gate: cold-read `/code-review` "ship it" (no Jean Grey regression; the bonus fix noted). Runtime
  smoke (Playwright, whatif setup, 2026-06-14): House of M → SW disabled (JG enabled); pre-checked SW
  auto-unchecks on scheme select; Transform Citizens → JG disabled + SW re-enabled (regression check
  PASS); neutral scheme → both enabled; Randomize ×6 under House of M never picks SW; force-selecting
  SW with an otherwise-valid 6-hero comp → exactly one error ("Scarlet Witch cannot be chosen…") +
  Begin disabled. PASS.
- Note: `expansion-validator` not run for this batch — no expansion-file (`expansionRevelations.js`)
  changes; the fix is entirely in `script.js` + `cardDatabase.js` (engine files outside the
  validator's scope).

---

## Game 3 — Golden Solo

**Setup**
- Scheme: The Korvac Saga (requires 2 villain groups, 1 henchmen, 5 heroes)
- Mastermind: Grim Reaper
- Villains: Hood's Gang, Lethal Legion
- Henchmen: Mandarin's Rings
- Heroes: Captain Marvel (Agent of S.H.I.E.L.D.), Darkhawk, Hellcat, Quicksilver, Speed

### Obs 9 — 🆕 Korvac Saga Twist offered "KO a Bystander" with no Bystanders to KO
- Twist text: each player discards down to four cards **or** KOs a Bystander from their Victory Pile.
- Paul had **no Bystanders**, but the game still presented **KO a Bystander** as a selectable option.
- Should only offer the KO option if the player actually has a Bystander; otherwise force/auto the
  discard-to-4 branch.

### Obs 10 — 🆕 "Korvac Revealed" Twist shows the Side-A twist text, not the Revealed version
- After the scheme transformed to **Korvac Revealed**, the Scheme Twist message read the **same as
  the original Korvac Saga twist** instead of the Side-B "Revealed" text.
- Side-B twists differ: Twist 2/4/6 = "each player discards an Avengers Hero or gains a Wound, then
  Transform"; Twist 8 = "Evil Wins!". The wrong/stale twist text is showing post-transform.

### Obs 11 — ✅ Hellcat "Part-Time PI" only reveals from the Villain Deck — FIXED (Batch B)
- Card: "Reveal the top card of **any deck**. If it's not a Scheme Twist, you may put it on the
  bottom of that deck."
- Root cause: `hellcatPartTimePI()` hardcoded `villainDeck` (the old comment even said "the 'any
  deck' most useful in solo"), dropping the card's deck choice.
- Fix: present a deck choice among the non-empty decks (Villain / Hero / your own player deck), reveal
  that deck's top, log the reveal, and offer put-on-bottom. Only the Villain Deck can hold a Scheme
  Twist (`canTwist`) → twist stays on top. Bottoming = `chosen.deck.unshift(chosen.deck.pop())`
  (in-place mutation of the live deck — no reassignment of the `let`s). Player deck is reshuffled from
  discard if empty so "your own deck" is offered when it has cards. Auto-picks when only one deck is
  non-empty.
- Gate: expansion-validator clean (0 issues); cold-read review "ship it" (one minor — add a reveal
  log line — applied).
- Runtime smoke (Playwright, whatif, 2026-06-14): 3-way deck choice rendered (Villain/Hero/your own);
  picked Hero Deck → revealed its top → Put on Bottom reordered ONLY the heroDeck (Villain + Player
  untouched); promise resolved. PASS.

### Obs 12 — 🆕 Captain Marvel "The Sword of S.H.I.E.L.D." didn't draw after playing S.H.I.E.L.D. agents
- Card SUPERPOWER: **[S.H.I.E.L.D.]×4 → Draw a card** (needs four S.H.I.E.L.D. team icons present).
- Paul reported no card drawn after playing S.H.I.E.L.D. agents. **Triage:** confirm whether he had
  the full 4 S.H.I.E.L.D. icons (threshold not met = correct), vs. the icon-count not triggering
  when it should. Reproduce with a known 4-icon board.

### Obs 13 — ✅ Speed "Race to the Rescue" picker showed 3 combined buttons, not 5 classes — FIXED (Batch B)
- Card: "Choose a Hero Class (Strength, Instinct, Covert, Tech, or Ranged)" — should be **5** options.
- Root cause: `speedRaceToTheRescue()` was built on the 3-button `showHeroAbilityMayPopup` with
  color-paired buttons (Strength/Instinct, Covert/Tech, Range) + a sub-choice.
- Fix: rebuilt the picker on the in-file 5-tile `chooseIconOption()` (same icon paths as
  `roninMysteriousIdentity`), presenting all 5 classes directly. The choice is MANDATORY, so
  `chooseIconOption` gained an optional `allowSkip` param (default `true`, preserves its 3 existing
  callers) and Speed passes `false` → skip button hidden, the only exit is select+confirm. Reveal /
  match / put-on-top-or-bottom logic unchanged from the prior working version.
- Gate: expansion-validator clean (0 issues); cold-read review "ship it".
- Runtime smoke (Playwright, whatif, 2026-06-14): picker rendered 5 distinct tiles
  (Strength/Instinct/Covert/Tech/Range); confirm disabled until a tile is selected; skip button
  hidden. Named matching class → card drawn to hand, deck decremented, `updateGameBoard()` ran clean,
  promise resolved. PASS.

### Obs 14 — 💭 Laser Maze (Location) "no effect" when fought = WORKING AS DESIGNED (code-verified)
- Paul fought Laser Maze and saw no effect mentioned. **Verified in code 2026-06-11 — intended.**
- Two separate functions: `laserMazeFight()` (expansionRevelations.js:3201) runs when you fight the
  **Location card itself** → just logs "defeated" + awards VP (no reveal/wound). `laserMazeTrigger()`
  (:5009) is the "reveal a Range Hero or gain a Wound" effect, fired by the Location-trigger system
  in `defeatVillain` (script.js:12641) **only when you defeat a Villain sharing the Location's city
  index**. Matches the card: "*Whenever you fight a Villain here*…".
- So fighting the Location itself legitimately has no reveal/wound effect. **No change.** (Trigger
  path is wired and self-applies in solo per GP-3; not separately re-verified this game but the
  wiring is present.)

### Obs 15 — ✅ Brothers Grimm "discard two identical cards" cost — FIXED (commit 4eacd39, Batch A)
- Root cause: prerequisite unimplemented (DB `fightCondition: "None"`), so nothing gated the fight.
- Fix: new `twoIdenticalCards` fight condition (hand has a same-name pair) gates all fight-button
  sites; `payBrothersGrimmDiscardCost()` (called at start of `brothersGrimmFight`) discards two
  same-name cards, player picking the pair when more than one qualifies.
- **⚠️ Playtest-attention (timing):** the discard cost is paid DURING the fight effect (after Attack
  is committed), not as a pre-fight prompt. The condition gate guarantees a pair exists before the
  fight button appears, so it's always payable — but watch the ordering feels OK when you re-test.
- Nit (no change): name-only check means two Wounds / two Officers in hand also count as "identical"
  — rules-correct (any two same-name cards), flagged for awareness.
- Gate: expansion-validator clean; cold-read review no blockers.
- Runtime smoke (Playwright, golden, 2026-06-14): condition false + button HIDDEN with no same-name
  pair in hand; condition true + button SHOWN with a pair; payBrothersGrimmDiscardCost discarded
  exactly the two same-name cards (auto-resolve path), distinct card remained. PASS.
- Original report: Paul fought it without discarding, with an empty hand — prerequisite not blocking.

---

## Game 4 — What If? Solo

**Setup** (1 villain group + 3 heroes ⇒ What If? mode)
- Scheme: Secret HYDRA Corruption
- Mastermind: The Hood
- Villains: Army of Evil
- Henchmen: HYDRA Base
- Heroes: Darkhawk, Ronin, War Machine

### Obs 16 — 💭 Blackout Ambush: no popup on discard — NO CHANGE (Paul: keep console-only)
- Ambush: "Reveal a [RANGED] Hero or discard a card." Paul took the discard branch — **no popup**
  shown when the discard occurred. Same popup-less family as Obs 5. Triage: should reveal-or-discard
  ambushes surface a popup/confirmation, or is auto-discard + console line acceptable?

### Obs 17 — ✅ Dr. Calvin Zabo (Mister Hyde) drove Recruit NEGATIVE — FIXED (commit 4eacd39, Batch A)
- Root cause: `showAttackButton()` (the REAL city click gate) checked Attack affordability with no
  `usesRecruitToFight` branch (the two `updateHighlights()` twins had it; the real gate didn't).
  Enough Attack → button shows → `defeatVillain` charges Recruit → negative.
- Fix: added recruit-only affordability branch to `showAttackButton` (`totalRecruitPoints >= cost`).
- Gate: expansion-validator clean; cold-read review confirmed it mirrors the twins (recruit-only,
  reserve excluded) and the flag is fresh at the read site.
- Runtime smoke (Playwright, golden, 2026-06-14): button HIDDEN at recruit 2 (attack 20) and recruit
  5; SHOWN at recruit 6; usesRecruitToFight=true at Bank, cost 6. Full defeat with recruit 6 → 0
  (never negative), slot cleared. PASS.
- Original report: Hyde in the Bank correctly required Recruit (cost 6), but Paul had only 2 Recruit
  and was let fight anyway → −4 Recruit.

### Obs 18 — 🆕 HYDRA Officer placement (Secret HYDRA Corruption) is cut off on the left, hard to see
- Each Scheme Twist places an Officer next to the Scheme. It places on the **left side**, appears
  **cut off / hard to see** on screen.
- Paul's suggestion: render the Officer(s) **smaller, between the Scheme and Mastermind**, sitting
  on top of / slightly overlapping them. Display/layout polish.
