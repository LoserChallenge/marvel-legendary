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
- ⏳ **Remaining 1A work:** city-size resize for Earthquake (5 → 7 at setup) and Tsunami (7 → 3 on transform). Build `resizeCityForScheme(newSize)` helper, call from both side's twist handlers, and set initial citySize at game setup when Earthquake is selected.

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
