# Revelations Phase 4 — Playwright Verification Triage

Scope: every Phase 4 fix (open + fixed-but-unverified) plus the two Tier 3 deferred items, sorted into what Playwright can prove vs. what needs Paul's eyes vs. what only a full playtest covers. No runs this session.

Status legend: ⏳ Open · ✅ Fixed (regression-verify) · ⛔ Tier 3 deferred

Sources: `docs/superpowers/plans/2026-04-12-revelations-phase4-fixes.md`, `docs/expansion-progress/revelations.md`, `docs/known-issues.md`.

---

## Bucket 1 — Scriptable (deterministic; Playwright owns it)

Ordered easiest → hardest. For each, the basic shape is: `preview_navigate` → setup form fills / `preview_eval` to inject game state → trigger action via `preview_click` or `preview_eval` → assert DOM / globals / on-screen console text.

### 1D ✅ Locations enter city with announcement
- Eval: force `placeLocation(<known location card>)`.
- Assert: `#onscreenConsole` (or its current selector) innerText contains the location's name wrapped in `.console-highlights`.
- 1 step. No randomness.

### 1F ✅ Secret HYDRA Corruption — 30-Officer stack
- Setup: select Secret HYDRA Corruption scheme, any mastermind, start game.
- Assert via `preview_eval`: `shieldOfficers.length === 30` and `shieldDeck.length === 30` immediately after `initGame()`.
- Also confirm a non-Hydra scheme yields `=== 20` (control).

### 1E ✅ Earthquake — extra-villain-group setup validation
- Golden Solo + Earthquake selected, 2 villain groups checked.
- Click Start; assert validation popup blocks ("3 groups required" message present).
- Re-check 3 groups, assert game initializes (`gameStarted === true`).
- Repeat for What If? Solo: assert `extraVillainGroups` is **not** applied (1 group still works).

### 1C ✅ Mandarin attack modifiers
- Inject: `mastermind = masterminds.find(m=>m.name==='Mandarin')`, push 2 Ring cards onto `victoryPile`, call `recalculateMastermindAttack()`.
- Assert: `mastermind.attack === originalAttack - 6` (normal: -3 × 2).
- Repeat for Epic Mandarin: `-12`.
- Ring city bonus: place a Ring in city, call `updateVillainAttackValues()`, assert that Ring's `attackFromMastermind === 1` (normal) / `2` (epic).

### 1B ✅ Klaw capture round-trip (logic only)
- Inject Klaw into sewers, force `klawAmbush(klaw)`, pick a hero from HQ.
- Assert: `klaw.capturedHero` is the chosen hero **after** the city-write step.
- Trigger `defeatVillain(klaw)`; assert the captured hero ends up in the player's discard/victory pile per Klaw's fight text. (Visual overlay → Bucket 2.)

### 2A / 2B / 2D / 2E ✅ KO/retrieve popups exist (DOM presence checks)
- One scriptable case per helper:
  - 2A ✅ **Verified clean 2026-05-28** (10/10): `koUpToNFromDiscardPile('source', 1)` — popup visible, 3 staged discard cards render, title `"KO a Card from Discard"`, NO THANKS visible/enabled, confirm starts disabled/`"KO CARD"` → after 1 click enables/`"KO 1 CARD"`, FIFO drops oldest when 2nd click exceeds `maxCount=1`. All 3 wrappers (`mandarinRingIncandescence`, `brothersGrimmFight`, `warMachineHypersonicCannonSuper`) call the helper.
  - 2B ✅ **Verified clean 2026-05-28** (14/14): `koUpToNFromDiscardPile('source', 2)` — title `"KO up to 2 Cards from Discard"`, multi-select to 2 enables `"KO 2 CARDS"`, FIFO drops oldest on 3rd click, click-to-deselect toggles off. `sentryFight` and `grimReaperCultOfSkulls` both call the helper with `maxCount=2`.
  - 2D Remaker: same shape, target = move-to-hand.
  - 2D MazeOfBones: assert popup shows exactly 4 cards revealed from villain deck top.
  - 2E: trigger `mandarinDragonOfHeavenSpaceship` with ≥2 played/artifact heroes, assert hero-choice popup with maxCount=2.
- Each test confirms the popup *appears* and accepts input — visual layout is Bucket 2.

### 2C ✅ Mandarin Strike — placement + selection logic
- ✅ **Verified clean 2026-05-28** (all checks pass; placement behavior confirmed against Paul's rules call — "push-from-the-right" cascade, NOT universal step-left):
  - 1-Ring case: no popup, ring auto-placed rightmost, VP drained.
  - 2-Ring case: popup appears with both rings, title `"Master Strike — Return a Ring"`, RETURN RING button disabled until click, NO THANKS hidden, chosen ring lands rightmost, unchosen stays in VP.
  - No ambush re-trigger: spy ambush count = 0 after Master Strike returns the ring.
  - 0-Ring normal: `drawWound()` called; 0-Ring epic: wound placed on top of player deck.
  - Shared helper: both strikes + `processRegularVillainCard` all call `pickRingFromVictoryPile` + `enterCityFromRight`.
  - Placement semantics: when sewers is empty before placement, the new card lands rightmost and no other villains shift (correct per Paul's design — villains only move when something pushes them).

### 3B ⛔ Hover preview attack modifier
- Setup Mandarin + place a Ring in city; assert Ring's printed attack vs. computed.
- Trigger hover (`preview_hover` on the city cell), then read the hover-preview DOM for the attack number; compare against `city[i].attack + city[i].attackFromMastermind`.
- Pure DOM diff — no human judgment needed once we know the selector.

### 2F ⏳ Chemistro Fight — Golden Solo bailout + auto-pick
- Trigger `chemistroFight()` in Golden Solo with multiple played heroes + populated HQ.
- Assert (current bug): on-screen console contains the "not supported" string (proves bailout still fires).
- After fix: assert `#card-choice-popup` appears twice (one for played-card sacrifice, one for HQ pick).

### 1A ⏳ Scheme transform + city resize
- **Two cascading bugs found 2026-05-28**, both in `transformScheme()`:
  1. **`ReferenceError: selectedScheme is not defined`** at script.js:2140 — the function read a global that was never initialized. Other parts of script.js use a *local* pattern (`const selectedScheme = schemes.find(...)` from the setup-screen radio), so the global the function expected didn't exist. Function threw on its first line, caught silently upstream, never reached the image swap. Caught by Paul's F12 dev-tools console.
  2. **Wrong selector** (`'#scheme-place img'`) — would have matched the always-hidden BabyHope token in `#scheme-token` rather than the visible appended `.card-image`. Latent bug — never observable until #1 was fixed.
- ✅ **Both fixes applied 2026-05-28** (`script.js:2139-2180`):
  - Lazy-init `selectedScheme` from DOM radio on first call: `window.selectedScheme = schemes.find(...)` if undefined
  - Selector now `'#scheme-place img.card-image'`
  - Subsequent transforms read the global set by previous transform
- ✅ **Verified in Playwright 2026-05-28:**
  - Earlier session (Playwright-only): all 8 transform directions correctly swap card image while leaving BabyHope untouched.
  - Cold-start scenario (no `selectedScheme` global, scheme radio checked) — lazy init works, image swaps Korvac Saga → Korvac Revealed → back → forward across 3 transforms.
- ⚠️ **Process learning:** Initial 2026-05-27 diagnostic said SMALL scope because Playwright test passed. The test was misleading — I'd implicitly assigned `selectedScheme` in eval (creating an implicit global in non-strict mode), masking the actual ReferenceError that fires in production. Future Playwright tests of game-state functions should run cold (no implicit assignments) AND check dev-tools console for errors after each invocation.
- ✅ **Piece 1 — stale-reader fix verified clean 2026-05-28** (5/5 asserts via `/game-test`). Added `getActiveScheme()` (`script.js:14059`); repointed the 5 post-transform readers (`handleSchemeTwist` 5810, `handlePlutoniumSchemeTwist` 5864, `checkEvilWins` 9047, `updateVillainAttackValues` 9961, `updateHQVillainAttackValues` 10189). Cold-start test (DOM radio = Earthquake, `window.selectedScheme` deleted): `getActiveScheme()` lazy-inits → Earthquake; after `transformScheme()`, `window.selectedScheme` AND `getActiveScheme()` → Tsunami while `getSelectedScheme()` (DOM) stays stale at Earthquake (the exact bug); `getActiveScheme().twistEffect === "tsunamiCrushesTheCoastTwist"` → dispatcher now fires the B-side. Console clean (only the expected `sw.js` 404). Addresses E-1/E-5/E-6.
- ✅ **Piece 2 — city resize (E-4) implemented + verified clean 2026-05-28** (Model B: `destroyedSpaces[]` flagging, no array realloc). `resizeCityForScheme(activeSpaceIndices)` (`script.js` ~663) flags spaces destroyed/active, escapes occupants of newly-destroyed cells (left-to-right, attached bystanders ride along), KOs Locations there, refreshes board. Setup wires `scheme.citySpaces` in `initGame()` (Earthquake DB entry gets a 7-space "Low Tide" layout; defaults reset to 5 otherwise). Twist handlers (`expansionRevelations.js`) call `resizeCityForScheme([4,5,6])` (Tsunami shrink) / `[0..6]` (Earthquake restore). Composes with Piece 1: dispatcher now fires the correct side each twist.
  - `/game-test` 8/8 asserts: setup sizes Earthquake→7 (defaults intact for other schemes); shrink → `destroyedSpaces=[T,T,T,T,F,F,F]`, cells 0–3 cleared & 4–6 preserved, `escapedVillainsCount`+4 (no double-count, feeds `earthquakeEvilWins`), escape order V0→V3, destroyed Location KO'd; restore → all flags false, active cells preserved; `updateGameBoard()` called once per resize. Console clean (only `sw.js` 404).
  - ⚠️ **Gate findings (all green):** `destroyedSpaces` had NO write sites pre-fix (system dormant) and every read evaluates live → toggle-safe, not monotonic. `processMovementWithDestroyedSpaces()` + the destroyed-overlay render (in `updateGameBoard` ~8466, incl. `.destroyed-space` CSS + overlay art) already exist → reused, not rebuilt. Tsunami keeps Sewers (idx 6) active so villain draws keep working.
  - ⏭ **Visual refresh = Bucket 2** (below): logic verified here; the live 7↔3 redraw (no orphan villain images, escape reads cleanly) still needs Paul's eyes in a real game.

---

## Bucket 2 — Hybrid (Playwright reproduces state; Paul judges visuals)

Ordered easiest → hardest.

### 1B visual capture indicator
- Playwright: set up the captured-hero state cleanly.
- Paul: confirm the overlay/fan-out on Klaw reads as "this hero is captured" at a glance.

### 2A–2E popup visual layout
- Playwright: trigger each popup with known card sets.
- Paul: confirm card images render at the right size, hover preview works, "NO THANKS" button placement feels right, multi-select state is visually obvious.
- Take a screenshot per popup variant with `preview_screenshot` for side-by-side review.

### 2C city shift animation
- Playwright: reproduce the Bank-occupied → Master-Strike-returns-a-Ring case.
- Paul: confirm the shift-left motion looks correct and the Ring's arrival reads as "entered from the sewers," not "appeared in a random slot."

### 1E / 1F setup-screen banner copy
- Playwright: select each scheme; screenshot the banner area.
- Paul: confirm the banner string is clear ("requires 3 villain groups" / "Officer stack uses 30 cards") and shows at selection time, not just validation time.

### 1A post-fix city resize visual
- After implementation: trigger Earthquake twist (7→3) and Tsunami twist (back up).
- Playwright: assert `citySize` and `city.length` change correctly, villains migrate or escape as designed.
- Paul: confirm the redraw looks right — no half-rendered cells, no orphan villain images, escape animation reads cleanly.

---

## Bucket 3 — Manual only (full playtest required)

Ordered easiest → hardest.

### 3A ⛔ Scarlet Witch Chaos Magic
- Deferred stub. The "play the revealed copy" branch never wires up; verifying it works needs interactive multi-card reveal under varied hand states. Not worth scripting until the stub is implemented.

### Cross-effect playtest — full Mandarin + Earthquake game
- Many fixes (1A, 1C, 2C) interact through a single game arc. A real playthrough is the only way to surface order-of-operations bugs the unit-style Playwright checks won't catch — e.g. Ring entering via Master Strike *while* Earthquake has just collapsed the city to 3 spaces.

### "Other player" solo-mode audit
- Cross-expansion review noted in `known-issues.md`. Not a Phase 4 deliverable; logged here so it's not lost.

### Kree-Skrull War villain-count rules decision
- Not a bug — needs a design call from Paul before any code or test work.

### Hero name truncation
- UX judgment call; accepted as-is per `known-issues.md`. Listed for completeness.

---

## Suggested run order when Playwright session opens

1. Bucket 1 top-to-bottom for fast green ticks (1D → 1F → 1E → 1C → 1B → 2A-block → 2C → 3B → 2F).
2. 1A diagnostic before any 1A implementation work.
3. Bucket 2 screenshots in one batch for Paul to review async.
4. Bucket 3 items only after fixes land + Paul has time to sit down for a real game.

---

## F-G4 — Scarlet Witch play-a-copy (commit c20ee07) — ✅ VERIFIED 2026-06-01 (dual-mode)

Verified against fresh on-disk source (no-store fetch + live-fn match confirmed, not stale cache). Both `gameMode` golden + whatif:
- **Chaos Magic:** copy grants +atk/+rec on total AND cumulative; real revealed card removed from top and placed on heroDeck bottom (`heroDeck[0]`); deck length preserved; phantom in `cardsPlayedThisTurn` flagged isCopied+markedForDeletion+isSimulation; endTurn sweep removes phantom and it does NOT enter `playerDiscardPile` (golden). Decline ("No Thanks") leaves card on top, grants nothing, no phantom.
- **Hex Bolt symbol-timing:** with a prior Range card played → copied [RANGED] superpower FIRES; with no prior Range and the copy's OWN class = Range → superpower does NOT fire (copy can't self-satisfy; `isConditionMet` slices off the last-pushed phantom). Unconditional ability always fires; real discarded card stays in discard.

## R2-13 — Break the Sound Barrier picker softlock (commit 931670d) — ✅ VERIFIED 2026-06-20 (real end-to-end flow, tip 5830123)

Served build confirmed branch (not stale): `pickFromCardsSingleRow` hides `.info-or-choice-popup`, `handleCardPlacement` hides `.card-choice-popup` — both R2-13 guards present in the live functions.

Drove the REAL flow (not a synthetic forced-lingering-popup): injected Speed deck of 6 trackable cards, played `speedBreakTheSoundBarrier()`, multi-selected 2 to keep (BSB-1/2), then placed all 4 leftovers (BSB-3/4/5/6) one at a time through picker → TOP/BOTTOM:
- **1st picker (4 cards):** no overlay, card topmost/clickable.
- **2nd picker (3 cards) — the original softlock spot:** 0 overlaying info popups; all 3 cards `elementFromPoint`-topmost; a real Playwright click on a card REGISTERED and enabled "PLACE THIS CARD" (the previously-dead button). Screenshot: `docs/playwright-runs/2026-06-20/bsb-02-second-picker-3card.png`.
- **3rd picker (2 cards):** clean, all clickable.
- **Final card (1 left):** correctly skips picker, direct TOP/BOTTOM.
- **Completion:** promise resolved (no hang), no exception, no lingering popup; all 6 cards accounted for (2 in hand, 4 back in deck), placement order correct (TOP=push, BOTTOM=unshift). Console clean except expected sw.js 404.

PASS — no dead PLACE button, all leftovers placed, loop completes, no softlock. (Note: a first attempt that force-cleared the random start-cascade popups produced a stranded-promise stall — harness error, not a card bug; re-run with a clean start passed fully.)
