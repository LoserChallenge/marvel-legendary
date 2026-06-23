# Base-Game Bug Audit (working catalog)

Discovery effort to find pre-existing bugs in the **base game** (everything but Revelations — Core Set, Dark City, Fantastic Four, Guardians of the Galaxy, Paint the Town Red). Read-only cataloging — **fixes happen later on a dedicated base-code branch**, NOT during the Secret Wars build. Confirmed items feed the base-engine backlog in `docs/priorities.md` (merge-reconciliation-checklist §7).

**STATUS: PINNED 2026-06-22** — paused to focus on the Secret Wars build. No fixes applied; resume whenever. Re-entry: pick up B1's Playwright repro, get user recollection on B2/B3, and/or run the wider proactive sweep (below).

Started 2026-06-22. Source so far: Paul's iPad screenshots, `C:\Users\Paul\Downloads\drive-download-20260623T022021Z-3-001\` (May 2026 sessions; IMG_0380/0381 circled).

**Status legend:** CONFIRMED (invariant violation or reproduced) · CANDIDATE (observed, not yet confirmed) · CLEARED (investigated, not a bug).

---

## CONFIRMED

### B1 — Unique Rare hero duplicated across HQ and discard
- **Symptom (user-observed, IMG_0380 + IMG_0381, back-to-back captures):** Invisible Woman Rare **"Invisible Barrier"** (cost 7, 1 copy in game) appears **THREE times at once** — 1 in the HQ (IMG_0380) + 2 in the discard pile (IMG_0381).
- **Why it's real:** a unique 1-copy card existing 3× is a state-duplication invariant violation, not a display artifact.
- **User recollection (LOW confidence):** the **Intergalactic Kree Nega-Bomb scheme** was the scheme active at the time — user flags this as correlation, NOT confirmed causation (it may simply have been what was running). Don't anchor the investigation on the scheme. Four-of-a-Kind ruled coincidental (matches the code investigation, which cleared it independently).
- **Context from console:** same May-22 game had recruits + scheme twists "return a Hero to the Hero Deck" firing.
- **Status:** CONFIRMED symptom; root cause DIAGNOSED (hypothesis, pending Playwright repro).
- **Root cause (hypothesis, evidence-traced 2026-06-22):** Golden Solo recruit-flow race. `recruitHeroConfirmed` (`script.js:18321`) removes the card from HQ by a **stale closure-bound index** — `refillHQSlot(hqIndex)` → `goldenRefillHQ` → `hq.splice(hqIndex,1)` (`script.js:5179`) — with **no `hq.indexOf(hero)` guard** before the splice. The re-entry lock `isRecruiting` clears on a **500ms `setTimeout`** (`script.js:18068-18070`) instead of on async completion. If a recruit's awaited branch outlasts 500ms (popup, `await rescueBystanderAbility` ~`18382`, Wall-Crawl awaits), a second recruit interleaves: the first splices a now-shifted slot (removing a different card) and leaves the recruited card in `hq[]` while it's already in `playerDiscardPile[]`.
- **NOT FF-specific** — affects any hero recruit in Golden Solo where a recruit branch runs >500ms. State-corrupting; high-priority for the base-code pass.
- **Open caveat (root cause NOT locked):** the recruit-race cleanly explains a *pairwise* duplication (HQ + discard = 2). The observed **3 instances** (1 HQ + 2 discard) need either the race firing twice or a compounding interaction not yet traced. The user's "Nega-Bomb scheme involved" recollection is *consistent* with the race (Nega-Bomb is bystander-heavy → the `await rescueBystanderAbility` recruit branch is exactly the >500ms window that trips it), i.e. the scheme likely supplies the timing rather than duplicating in its own code. Confirm the full mechanism via repro before treating the root cause as settled.
- **Fix direction (for the fix-pass, NOT applied):** re-derive index by identity right before splice (`const idx = hq.indexOf(hero); if (idx !== -1) hq.splice(idx,1)`); clear `isRecruiting` on promise resolution, not a timer.
- **Confirm via:** Playwright repro — Golden Solo, ≥2 affordable HQ heroes incl. a slow-async recruit branch; recruit slot 1, then recruit a higher slot before 500ms; assert a 1-copy card lands in both `hq[]` and `playerDiscardPile[]`.

---

## CANDIDATE (observed, symptom not yet pinned)

### B2 — Angel "Drop Off A Friend" (IMG_0383, May 23)
Popup shown ("select a card to discard to gain Recruit equal to its cost"); exact malfunction not yet recalled. Needs Paul's symptom + repro.

### B3 — Super-Skrull KO popup (IMG_0384, May 25)
Super-Skrull fight effect KO'ing heroes; popup shown. Exact malfunction not yet recalled. Needs Paul's symptom + repro.

---

## ADDITIONAL LATENT (found via code-trace during B1, not user-reported)

### B4 — `morgAmbush` forward-loop HQ index shift (`expansionFantasticFour.js:3215-3224`)
Sets `hq[i] = null` then calls `refillHQSlot(i)` in a **forward** loop; in Golden Solo `refillHQSlot`→`goldenRefillHQ` splices+compacts, so subsequent indices shift and the wrong slots get processed. (Moves heroes to the Hero Deck, so symptom differs from B1.) Correct pattern exists in `expansionRevelations.js:3503/3538` (iterates **backward**). Candidate fix: iterate backward or remove by identity. Status: CANDIDATE (code-traced, not reproduced).

### B5 — `KOAllHeroesInHQ()` under-refill (`cardAbilities.js:16763`)
When all 5 HQ slots are heroes, the post-loop refill reads the shortened `hq.length` and under-refills. Minor. Status: CANDIDATE (code-traced, not reproduced).

### B6 — `recruitXMen()` over-credits recruit by the hero's cost (found via Secret Wars reuse, 2026-06-23)
- **Symptom (code-traced):** recruiting an X-Men hero via `recruitXMen()` nets **+hero.cost Recruit** (the recruit is effectively free *and* refunds its cost) instead of being free.
- **Why it's real:** `recruitHeroConfirmed` was changed so the caller now spends via `spendRecruitCost`, and `recruitHeroConfirmed` no longer deducts. But `recruitXMen()` still does `totalRecruitPoints += hero.cost` (plus its Final-Showdown cumulative twin) with **no offsetting deduction** — a leftover from the old flow. Net effect: +cost.
- **Scope — base-game, NOT Secret Wars-specific:** hits any base card routing through `recruitXMen`, including the **base Magneto "Bitter Captor" tactic**. Surfaced because SWV1 Apocalyptic Magneto's Fight reuses `recruitXMen()`; SWV1 inherits the existing base behavior, it does not introduce the bug.
- **Fix direction (for the base-code pass, NOT applied):** drop the `totalRecruitPoints += hero.cost` and its `cumulativeRecruitPoints` twin in `recruitXMen` (one central fix repairs base + every reuse). Verify against the current `spendRecruitCost` flow before applying.
- **Status:** CANDIDATE (code-traced via SWV1 build, not reproduced live). **Not patched** — base fix, deferred to the dedicated base-code branch per this catalog's discipline.

### B7 — Granted "Teleport" (`temporaryTeleport`) leaks on unplayed hand cards — FIXED ON SW BRANCH
- **Symptom:** a card granted temporary Teleport via the Azazel pattern (`keywords.push("Teleport")` + `temporaryTeleport = true`) that is **not played** keeps Teleport permanently. End-of-turn cleanup for PLAYED cards strips the keyword (`script.js:11616-11622`), but the `playerHand` cleanup (`script.js:11762-11767`) only deletes the `temporaryTeleport` flag, NOT the keyword from the `keywords` array — and eligibility reads the array (`script.js:11288`).
- **Scope:** pre-existing base bug; affects shipped **Azazel** identically. Surfaced because SWV1 **Inferno Nightcrawler** reuses the Azazel grant pattern verbatim, and Nightcrawler's frozen spec assertion ("end turn → temp Teleport cleaned off") fails under the current engine.
- **Resolution — fixed on the `secret-wars-vol1` branch (coordinator ruling 2026-06-23), NOT deferred to the base pass.** Distinguishing principle from B6: this base bug breaks a **NEW expansion card's spec**, and the only non-duplicative fix is in shared cleanup code. Fix = add a `"Teleport"` keyword-strip alongside the existing `temporaryTeleport` delete at ~`11762` (must stay gated to `temporaryTeleport` cards so innate-Teleport cards are untouched). One line repairs Nightcrawler AND base Azazel.
- **Status:** FIXED on SW branch — **verify it has merged to master before any base-code-pass work touches Azazel** (so it isn't redone or reverted).

**Policy note (B6 vs B7):** base bugs a NEW expansion card's spec directly depends on → minimal fix on the expansion branch + catalogued here as fixed-on-branch. Pure-inheritance base bugs with no expansion-spec impact (B6) → catalogued here untouched, await the dedicated base-code branch. **Third pattern (B8/B9):** the defect lives in a BASE card's handling of a general mechanic *class* (villain→hero converters), and the same bug already ships for a base card — catalogue here even though a new expansion mechanic (`gainAsHero`) adds another instance; the SW converter cards themselves are correct, so nothing is fixed on the SW branch.

### B8 — Mr. Fantastic "Ultimate Nullifier" negating a villain→hero converter makes the villain VANISH (found via SWV1 Manhattan, 2026-06-23)
- **Symptom:** if Ultimate Nullifier negates a "gain this as a Hero" defeat converter, the villain is neither gained as a Hero nor placed in the Victory Pile — it disappears from the game entirely.
- **Scope — base/shared:** shipped **Scarlet Witch** (`gainScarletWitchAsHero`) has the IDENTICAL interaction; SWV1's new `gainAsHero` flag is just another instance of the same converter class. Very low frequency (needs FF + the converter expansion in play + the player choosing to nullify a beneficial-to-them effect).
- **Fix direction (base branch):** Ultimate Nullifier's negation of a villain→hero converter should fall back to the NORMAL defeat outcome (villain → Victory Pile for its VP), not vanish. Cover BOTH `skrulled`/`gainScarletWitchAsHero` AND `gainAsHero` (the latter requires SWV1 merged first).
- **Open rules sub-question (for the base fix):** when "gain as a Hero" is nullified, does the villain go to the Victory Pile as a normally-defeated villain (coordinator lean — nullify the special reward, keep the ordinary defeat), or is it treated as un-defeated? Confirm via rules-oracle at fix time.
- **Status:** CANDIDATE (code-traced via SWV1, not reproduced live). **Not patched** — base/shared, deferred to the base-code branch.

### B9 — Professor X "Mind Control" double-gains a villain→hero converter (found via SWV1 Manhattan, 2026-06-23)
- **Symptom:** using Professor X "Mind Control" on a villain that has a "gain as a Hero" converter yields TWO Heroes from one villain — the Mind Control gain AND the converter both fire.
- **Why:** the Mind Control call-site condition gates only on `hasProfessorXMindControl`, not on the villain→hero converter flags, so both paths resolve.
- **Scope — base/shared:** shipped **Scarlet Witch** has the identical double-gain; SWV1 `gainAsHero` adds another instance. More plausible in real play than B8 (Professor X + Manhattan villains can co-occur in an SWV1 game).
- **Fix direction (base branch):** add `&& !skrulled && !gainAsHero` (i.e. exclude all villain→hero converters) to the Professor X Mind Control call-site condition. `gainAsHero` coverage requires SWV1 merged first.
- **Status:** CANDIDATE (code-traced via SWV1, not reproduced live). **Not patched** — base/shared, deferred to the base-code branch.

---

## CLEARED (investigated this session)

- **Invisible Woman "Four of a Kind" / Focus cards** — investigated as B1's prime suspect; CLEARED. `invisibleWomanFourOfAKind` (`expansionFantasticFour.js:4241`) only reads `cardsPlayedThisTurn` for +2 attack; Focus reveal cards touch hand/discard only, never HQ. The FF/Invisible Woman context in B1 is coincidental — the trigger is the generic Golden Solo recruit path.
- **Intergalactic Kree Nega-Bomb core logic** — verified faithful to card text (twist shuffled into deck `script.js:5964`, deck built from 6 bystanders `script.js:4491`, reveal → bystander rescue / "Scheme Twist" → KO it + `KOAllHeroesInHQ()` + `drawWound()`). The basic mechanic is not the bug.
- **"X has been deployed — removed from HQ"** log — normal Golden Solo HQ rotation (`goldenHQRotate`, `script.js:5201`), leftmost HQ card removed from game each round. Not a bug.

---

## Planned: wider proactive sweep (NOT yet run)

Agreed approach (user picked "both in parallel", 2026-06-22) for finding base-game bugs beyond the screenshot leads. Run in a **dedicated session** — it's a heavy parallel job with a lot of output to triage.

**Scope:** the whole base game = everything but Revelations — **Core Set, Dark City, Fantastic Four, Guardians of the Galaxy, Paint the Town Red** (finalized inventories exist for all five in `docs/card-inventory/final/`).

**Two tracks, parallel:**
1. **Known-issues track** — drive from the user's screenshots/recollections (B1 repro; B2/B3 once recalled).
2. **Card-text-vs-code audit net** — run the per-card-type auditors (hero/villain/henchmen/mastermind/scheme/misc) against each base expansion using its finalized inventory. Catches the #1 bug bucket (card text not matching code). Bounded + parallelizable.

**Tooling notes:** `/code-review` is diff-based — NOT a whole-codebase scanner; use the card-type auditors + targeted subsystem reviews instead. Behavior bugs (like B1) need a repro / live `/game-test`, not just static review. Expect candidates + false positives to triage, not a clean complete list.

**Discipline:** read-only cataloging into this doc. **Fixes happen later on a dedicated base-code branch**, NOT on master or the Secret Wars branch. Confirmed items also feed `docs/priorities.md` base-engine backlog.
