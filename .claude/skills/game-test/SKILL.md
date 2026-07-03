---
name: game-test
description: Use when Paul wants Playwright-driven work against the Legendary game — bug verification, pre-implementation diagnostic scoping, repro, or regression checks. Triggers on "test with Playwright", "verify this fix with Playwright", "diagnose this with Playwright", "Playwright check on X", "test the game", "run a game test", or explicit /game-test. Sets up the environment, picks the right mode, runs the work, updates tracking docs.
---

# Game Test Orchestrator

Drive the Legendary game in a real Chromium browser via Playwright MCP. Handles bug verification, pre-implementation diagnostic scoping, reproduction, and regression checks against the live web app.

## Mode selection

Identify which mode applies before setup:

- **Diagnostic** — scope a bug or fix BEFORE implementation. Highest-leverage use; often skipped. Read state, evaluate, snapshot, report scope finding. No code changes.
- **Verification** — confirm a fix works AFTER implementation. Stage the state that should trigger the fixed behavior, run the action, check outcome.
- **Reproduction** — recreate a reported bug to confirm it's real and capture trigger conditions.
- **Regression** — re-run a previously-verified scenario to confirm it still works after unrelated changes.

If the request is ambiguous, ask Paul which mode before launching.

## Setup ritual (every session)

1. **Confirm location.** `pwd` must resolve inside marvel-legendary (main or `.worktrees/<branch>/`). Playwright MCP is local-scope and unavailable elsewhere — stop and tell Paul if you're in the wrong project.
2. **Spin up local HTTP server.** `file://` is blocked by Playwright MCP. Use Python `http.server` on a free port (default 8765), pointed at the game's directory:
   - Main checkout: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/`
   - Worktree: `.worktrees/<branch>/Legendary-Solo-Play-main/Legendary-Solo-Play-main/` — use this path when testing active expansion work.
   - Run in background. First run prompts Windows Firewall; Paul knows to allow.
3. **Set viewport** to 1920×1080 before any navigation. Default is ~400px (mobile layout) and renders the wrong UI.
4. **Navigate** to `http://localhost:<port>/index.html`. Wait for the setup screen to render before any further action.

## State injection patterns

Use `browser_evaluate` to skip manual setup and jump straight to the state that reproduces the issue:

- **Skip setup screen** — assign `window.gameState`, then trigger the start function directly.
- **Pre-stack villain deck** — mutate `villainDeck` to put a specific card on top.
- **Force scheme / mastermind** — assign `currentScheme` / `currentMastermind` before `initGame()`.
- **Force HQ contents** — mutate the `hq[]` array.
- **Trigger specific phase** — call the relevant `script.js` function with state pre-loaded (e.g. `processVillainCard(card)`).

When unsure of the right injection point, read `script.js` first to find the function or state variable controlling the behavior under test.

## Verification methods

Layer these based on what's being checked:

- **DOM reads** — `browser_snapshot` for structural checks; targeted `browser_evaluate` returning a value for specific element states.
- **onscreenConsole** — read `#onscreen-console` contents for in-game event messages (what players see during play).
- **Browser console errors** — `browser_console_logs` for `console.error` / `console.warn`. Don't eyeball this: use the codified **console-check gate** (Harness gotchas → *Console-check gate (A3)*), which whitelists the benign `sw.js` 404 and fails on anything else, producing the A2 contract's `consoleCheck` result.
- **Screenshots** — at start, after each major state change, and at the verification checkpoint. Save under `docs/playwright-runs/<YYYY-MM-DD>/` (create folder if missing).

## Default reporting cadence

Screenshot + one-line narration after every major action: "stacked Mr. Sinister on top of villain deck", "drew villain card", "checked attack overlay". Paul wants visibility into what's happening, not silence followed by a verdict. Skip this only when explicitly told ("just give me the result").

## Session shape

- Batch verification runs in chunks of 3–5 at a time. Pause and let Paul decide whether to continue or break.
- Break at natural seams: end of a fix-plan section, completed bucket, ~60% context fill.
- Diagnostic runs are single-target by default — finish the one diagnostic, stop, let Paul interpret before running more.

## Updating tracking docs

After each run, update results inline:

- **Verification plan** (`docs/playwright-verification-plan.md` in the active worktree): mark items ✅ verified / ❌ failed / ⏭ skipped with one-line evidence.
- **Known issues** (`docs/known-issues.md`): if a run surfaces a NEW bug, append with date, repro steps, and severity guess.
- **Active fix plan** (current `docs/superpowers/plans/<active-fix-plan>.md`): if a diagnostic changes scope, note the finding inline at the relevant section.

## What NOT to use Playwright for

Push back before launching if Paul's ask falls in any of these — Playwright is the wrong tool:

- **Subjective UX feel** — animations, pacing, "does this look right" — needs Paul's eyes.
- **Randomness-dependent multi-turn flows** — RNG variation makes scripted runs unreliable; play the game.
- **Pure code review** — if there's no behavior to observe, use code-review tools instead.

## Harness gotchas

Stale-serve / caching (the #1 false-confidence source):
- **Chromium aggressively caches `script.js` and other static files** served by Python `http.server`. The Service Worker is not active in local-serve mode (registration 404s — path-prefix mismatch with GitHub Pages), but the HTTP cache alone serves stale code through normal `Ctrl+R`.
- **Stale-serve persists across a fresh port/process** — even a new server port or a fresh browser process can serve STALE `script.js` / `cardAbilities.js` / `expansionRevelations.js`. Before trusting any result, confirm the served build carries your freshness markers; if a code-on-disk fix isn't reflected in `<function>.toString()`, monkey-patch the real implementation into `window.<funcName>` via `browser_evaluate` to verify the LOGIC.
- **Most reliable cache flush** for interactive playtests: F12 → right-click the toolbar refresh button → "Empty Cache and Hard Reload" (plain `Ctrl+Shift+R` may not suffice). Recommend this to Paul whenever a fix has just been applied.
- **Serve-path trap (worktree work):** root the HTTP server at the WORKTREE's game directory using a path relative to the worktree root — NEVER an absolute path. An absolute path can resolve to the MAIN folder (`master`) and silently serve stale code without the branch's changes, so you verify against the wrong code. Confirm the served build has your changes before trusting any result.

Eval / state-injection correctness:
- **The two traps (why the vetted helper below exists):** (1) `citySize`, `cityReserveAttack`, `totalAttackPoints`, `cumulativeAttackPoints`, `totalRecruitPoints`, `cumulativeRecruitPoints`, `gameMode` are top-level `let` (NOT window-aliased) — `window.citySize = 7` silently no-ops; only `mastermindReserveAttack` is `var` on `window`. (2) A bare `name = value` for a name with **no** global binding (e.g. `selectedScheme` — only `const` locals + `getSelectedScheme()` exist, no global) creates an **implicit global that MASKS a missing-initialization bug** — a `transformScheme()` diagnostic "passed" this way while the real game crashed. Both verified live 2026-07-03.
- **Vetted state-injection helper (A5) — `window.gtInject` (use this, NOT free-form `browser_evaluate` assignments).** The A2 assertion contract's `setup` slot MUST go through this path; ad-hoc `window.x=` / bare-assignment injection in the auto-loop is contract-invalid. It exposes exactly two writes, both fail-closed:
  - `gtInject.set(name, value)` — assigns to the **real** binding via a vetted per-name get/set registry (lexical `let`s use STRICT set arrows; `var`s use `window[name]`). Throws LOUD — never creating a masking implicit global — if `name` is not vetted, if the binding's declaration is gone (strict `ReferenceError`), if a lexical write leaks onto `window`, or if read-back ≠ value. Returns `{name, kind, ok, actual}`.
  - `gtInject.coldStart(name)` — forces the real init path by wiping any leftover **window** property (esp. a masking implicit global from an earlier bad injection): `window[name]=undefined; delete window[name];`. Permissive by name (only deletes, never creates); reports `{cleared}` (a non-configurable `var`-global reports `cleared:false`).
  - **Adding a binding:** confirm its `let`/`var` declaration in `script.js`, then add a literal `get`/`set` pair to `INJECTABLE_BINDINGS` with its `kind`. Never inject an unvetted name — the throw is the guard against re-creating the transformScheme mask.
  - **Verified live 2026-07-03** (whatif, setup screen): `set('citySize',777)` changed the lexical binding with no window leak (a bare `window.citySize=999` left it at 5); `set('selectedScheme',…)` THREW and created **no** masking global (contrast: bare assign made one); `coldStart` cleared a planted mask; `set('mastermindReserveAttack',13)` set the `var`; strict-mode nonexistent-assign throws `ReferenceError` (the stale-registry backstop) and never masks.
  ```js
  window.installGameTestInjector = function () {
    const NAME_RE = /^[A-Za-z_$][\w$]*$/;
    // Vetted registry. kind:'lexical' = top-level `let` in script.js (NOT a window property; window.<name>=
    // no-ops). get/set arrows reference the name literally so they resolve to the real global lexical binding;
    // set arrows are STRICT so assigning a removed/renamed binding throws (fail loud) instead of masking.
    // kind:'window' = `var` at global scope (a real window property).
    const INJECTABLE_BINDINGS = {
      citySize:                { kind: 'lexical', get: () => citySize,                set: v => { 'use strict'; citySize = v; } },
      cityReserveAttack:       { kind: 'lexical', get: () => cityReserveAttack,       set: v => { 'use strict'; cityReserveAttack = v; } },
      totalAttackPoints:       { kind: 'lexical', get: () => totalAttackPoints,       set: v => { 'use strict'; totalAttackPoints = v; } },
      cumulativeAttackPoints:  { kind: 'lexical', get: () => cumulativeAttackPoints,  set: v => { 'use strict'; cumulativeAttackPoints = v; } },
      totalRecruitPoints:      { kind: 'lexical', get: () => totalRecruitPoints,      set: v => { 'use strict'; totalRecruitPoints = v; } },
      cumulativeRecruitPoints: { kind: 'lexical', get: () => cumulativeRecruitPoints, set: v => { 'use strict'; cumulativeRecruitPoints = v; } },
      gameMode:                { kind: 'lexical', get: () => gameMode,                set: v => { 'use strict'; gameMode = v; } },
      mastermindReserveAttack: { kind: 'window',  get: () => window.mastermindReserveAttack, set: v => { window.mastermindReserveAttack = v; } },
    };
    const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    function set(name, value) {
      const b = INJECTABLE_BINDINGS[name];
      if (!b) throw new Error('gtInject.set: "' + name + '" is not a vetted injectable binding. A bare `' + name +
        ' = value` would create a MASKING implicit global (the transformScheme trap). Confirm its declaration in ' +
        'script.js and add a literal get/set pair to INJECTABLE_BINDINGS with its kind first.');
      const hadWindowProp = has(window, name);
      try { b.set(value); }
      catch (e) { throw new Error('gtInject.set: "' + name + '" could not be assigned (strict ' + e.name +
        '); the `' + (b.kind === 'lexical' ? 'let ' : 'var ') + name + '` declaration may be gone. NOT creating an implicit global.'); }
      if (b.kind === 'lexical' && !hadWindowProp && has(window, name)) throw new Error('gtInject.set: "' + name +
        '" leaked onto window — the assignment did NOT reach the lexical binding (masking implicit global).');
      const actual = b.get();
      if (actual !== value) throw new Error('gtInject.set: "' + name + '" read back ' + JSON.stringify(actual) +
        ', expected ' + JSON.stringify(value) + ' — write did not take.');
      return { name: name, kind: b.kind, ok: true, actual: actual };
    }
    function coldStart(name) {
      if (!NAME_RE.test(name)) throw new Error('gtInject.coldStart: invalid name "' + name + '".');
      const had = has(window, name);
      window[name] = undefined;
      const deleted = delete window[name];
      const stillThere = has(window, name);
      if (had && !deleted && stillThere) return { name: name, cleared: false, hadWindowProp: true,
        reason: 'non-configurable var/global — cannot force uninitialized' };
      return { name: name, cleared: true, hadWindowProp: had };
    }
    window.gtInject = { set: set, coldStart: coldStart, bindings: INJECTABLE_BINDINGS };
    return 'installed';
  };
  window.installGameTestInjector();
  ```
  **Usage.** After navigation, inject this source and call `installGameTestInjector()` (re-call after any reload — a page reload wipes it, same as the A4 harness). Then a TestCase's `setup` does e.g. `gtInject.set('gameMode','golden'); gtInject.set('totalAttackPoints',0);`, and a cold-start test does `gtInject.coldStart('<name>')` before the action. Never fall back to bare `browser_evaluate` assignment for state — that is the trap this replaces.
- **Always check dev-tools console after every invocation:** a function failing silently upstream (try/catch with `console.error`) produces no on-screen-console signal but leaves a clear trace in F12 → Console. When a test passes but the real game still fails, the test is wrong before the production code is. (Codified as the A3 console-check gate below.)

Driving the harness:
- **Game start needs a TRUSTED `pointerdown` on `#begin-game`** — the handler listens for `pointerdown`, not `click`. Use a real Playwright click (`page.locator('#begin-game').click()`); a scripted `element.click()` fires only a click event and silently no-ops.
- **Never batch a localhost `fetch`/curl with file ops in one tool call** — curl-to-localhost is permission-denied, and a denied call cancels its sibling calls in the same batch. Use Playwright `fetch` from the page instead.
- **Python `http.server` is single-threaded** — bursts of webp/m4a requests throw `ERR_CONNECTION_REFUSED` and break card ART in screenshots (counts/DOM/logic unaffected). Use a threaded server for clean screenshots.
- **Detect DOM state with STRUCTURAL selectors, not geometry** — broken images collapse layout, so bounding-box/`offsetParent` tests are unreliable. Use `#player-hand-element.children.length`, `.cell-label` text, `.card-container[data-city-index]`, `.popup-card`; for `position:fixed` popups (`#defeat-popup`) test `getComputedStyle(el).display`, not `offsetParent===null`.
- **Drain the start popup QUEUE via real buttons before driving popup-heavy abilities** — `display:none` does NOT dequeue; later loops reusing the shared `.info-or-choice-popup` element collide with un-dequeued start popups (looks like an "orphaned Master Strike"). Close via `#intro-popup-close-button`, then `#info-or-choice-popup-confirm` until none remain.
- **An awaited choice-popup ability DEADLOCKS inside a single `browser_evaluate`** — `await ability(card)` can't return until the popup's button is pressed, but you can't issue a click while blocked in that same evaluate, so it hangs until an *external* click (the human manually pressing it). The popup buttons are plain `.onclick` (NOT trusted-`pointerdown`), so a scripted click works fine — the problem is timing, not trust. FIX: install a concurrent in-page auto-dismiss interval BEFORE invoking the ability, so the click fires from the page's own event loop while the ability awaits:
  ```js
  window.__autoPopup ??= setInterval(() => {
    document.querySelectorAll('#info-or-choice-popup-confirm, [id$="-popup-confirm"], .info-or-choice-popup-closebutton').forEach(b => {
      const p = b.closest('.info-or-choice-popup, .card-choice-popup, .popup');
      if (p && getComputedStyle(p).display !== 'none' && !b.disabled) b.click();
    });
  }, 100);
  ```
  `clearInterval(window.__autoPopup); window.__autoPopup = null;` when done. This auto-CONFIRMS yes/no + "proceed" popups (and incidentally drains the start-popup queue above). CAVEAT: for card-SELECTION popups (pick WHICH card to KO/discard/gain), drive the specific selection yourself BEFORE the confirm fires — auto-confirm alone picks nothing or the default. Use `getComputedStyle(popup).display`, not `offsetParent`, for visibility (broken-image layout collapse makes geometry unreliable — see structural-selector note above).
- **Wrap awaited popup-abilities in an IN-PAGE timeout so a stuck SELECTION popup fails FAST + CLEAN instead of hanging the whole session.** `__autoPopup` correctly won't click a *disabled* confirm, so a card-SELECTION popup whose selection wasn't driven stalls the `await ability()` indefinitely; Playwright's own evaluate-timeout then fires at the *connection* level and can tear down the page/server (the "env died mid-session" symptom — the #1 game-test reliability complaint). Prevent that with a `Promise.race` that rejects WITHIN the evaluate, so the page + server stay alive to retry:
  ```js
  await Promise.race([
    ability(card),
    new Promise((_, rej) => setTimeout(
      () => rej(new Error('POPUP-TIMEOUT — a choice/selection popup needs its selection driven before confirm; auto-confirm alone cannot resolve it')),
      8000)) // tune up for legitimately long multi-popup chains
  ]);
  ```
  This converts an indefinite hang into a fast, labelled failure that leaves the env up. It does NOT auto-resolve the selection (auto-picking a default would silently corrupt the test result — worse than failing); for selection popups still drive the specific pick yourself per the caveat above. The timeout is the SAFETY NET for a missed or unexpected selection popup.
- **Selection-driving harness (A4) — `installGameTestHarness()` supersedes the bare `__autoPopup` snippet.** The bare interval above only auto-confirms yes/no popups; it cannot drive a SELECTION popup (pick WHICH card/action), and it dies on page reload. This consolidated installer adds both: a **declared selection queue** that actively picks the intended candidate then confirms via the real play path, and **idempotent re-install** so it survives navigation. It drives every real SELECTION popup via a registry (`card-choice`, `card-choice-city-hq`, `order-choice`); YES/NO popups (`info-or-choice`, `draw-choice` = "draw this card?", `final-blow` = acknowledge) stay auto-confirmed. Verified live 2026-07-03 (whatif): `card-choice` named-pick + re-entrant 2nd-use + post-reload re-install (`KO1To4FromDiscard`); `order-choice` named-pick of a non-default item (`showOperationSelectionPopup`); empty-queue → `POPUP-TIMEOUT` (env alive) on both; no card-choice regression.
  ```js
  window.installGameTestHarness = function () {
    if (window.__gtHarness && window.__gtHarness.interval) clearInterval(window.__gtHarness.interval); // idempotent: never stack intervals
    window.__gtHarness = window.__gtHarness || {};
    const H = window.__gtHarness;
    H.selections = H.selections || []; // FIFO of intended actions for the active selection popup (see below)
    H.log = H.log || [];               // audit trail of what the driver did
    // Visible = element AND all ancestors are not display:none. The game hides #intro-popup via a
    // display:none CONTAINER while the element itself stays block, so checking the element's own
    // display alone false-positives and starves real popups. Structural, not geometry (A8).
    const vis = el => { if (!el) return false; let n = el; while (n) { if (getComputedStyle(n).display === 'none') return false; n = n.parentElement; } return true; };
    const logOnce = m => { if (H.log[H.log.length - 1] !== m) H.log.push(m); };
    // A modal is genuinely up only when #modal-overlay is shown (it's display:none when idle). This is
    // the gate that tells a genuinely-pending selection popup (e.g. a setup Scheme-Twist city-hq choice
    // left block/awaiting input) apart from a truly-idle board.
    const modalUp = () => { const mo = document.getElementById('modal-overlay'); return mo && getComputedStyle(mo).display !== 'none'; };
    // Frontmost = the popup contains the topmost element at its own centre. When two popups overlap (a
    // pending one + a newly-opened one, both z-index 999), this drives the one physically on top first.
    // Overlay/modal stacking, NOT card-art geometry (A8's caution is about broken-image layout collapse).
    const frontmost = el => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false; return el.contains(document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2))); };
    // Registry of SELECTION popups (pick WHICH). Each is queue-driven, NEVER blind-confirmed: confirm on
    // all of them is gated behind a selection (disabled at 0), so an undriven popup already stalls -> timeout;
    // the value of queue-driving is (a) picking the INTENDED candidate not a default, and (b) controlling
    // confirm TIMING so a blind auto-confirm can't fire it between/after picks. `cards` = clickable candidate
    // selector; `nameOf` = how to read a candidate's name for {by:'name'}. Order = priority when >1 is active.
    const SELECTION_POPUPS = [
      { name: 'card-choice',         popup: '.card-choice-popup',         confirm: 'card-choice-popup-confirm',        cards: '.popup-card',                                 nameOf: el => (el.querySelector('.popup-card-image') || {}).alt }, // alt === card.name
      { name: 'card-choice-city-hq', popup: '.card-choice-city-hq-popup', confirm: 'card-choice-city-hq-popup-confirm', cards: '.city-hq-chosen-card-image:not(.greyed-out)', nameOf: el => el.alt },                                        // eligible HQ/city cards only
      { name: 'order-choice',        popup: '.order-choice-popup',        confirm: 'order-choice-popup-confirm',        cards: 'button.order-choice-button',                  nameOf: el => el.textContent.trim() },
    ];
    const carveOut = new Set(SELECTION_POPUPS.map(p => p.confirm)); // these confirms are queue-driven, never blind-confirmed
    const isActive = el => vis(el) && modalUp() && frontmost(el);
    H.interval = setInterval(() => {
      // (1) SELECTION popups: queue-driven. Find the genuinely-active one; drive the current action against it.
      let sp = null;
      for (const s of SELECTION_POPUPS) { if (isActive(document.querySelector(s.popup))) { sp = s; break; } }
      if (sp) {
        if (H.selections.length) {
          const a = H.selections[0];
          const popupEl = document.querySelector(sp.popup);
          const confirmBtn = document.getElementById(sp.confirm);
          const cards = [...popupEl.querySelectorAll(sp.cards)];
          let done = false;
          if (a.by === 'confirm') { if (confirmBtn && !confirmBtn.disabled) { confirmBtn.click(); done = true; logOnce('confirm@' + sp.name); } }
          else if (a.by === 'button') { const btn = document.getElementById(a.value); if (btn && vis(btn) && !btn.disabled) { btn.click(); done = true; logOnce('button:' + a.value); } }
          else {
            let el = null;
            if (a.by === 'index') el = cards[a.value] || null;
            else if (a.by === 'name') el = cards.find(c => sp.nameOf(c) === a.value) || null;
            else if (a.by === 'id') el = cards.find(c => c.getAttribute('data-card-id') === a.value) || null;
            else if (a.by === 'first') el = cards[0] || null;
            if (el) { el.click(); done = true; logOnce('select ' + a.by + ':' + a.value + '@' + sp.name); } // fires the game's selection listener → enables confirm
            else logOnce('NO-MATCH ' + a.by + ':' + a.value + '@' + sp.name);
          }
          if (done) H.selections.shift();
        }
        return; // queue empty on an active selection popup = undeclared → leave it → POPUP-TIMEOUT (fail-closed, no guess)
      }
      // (2) yes/no / proceed / intro popups: auto-confirm ENABLED buttons. Selection confirms are carved
      //     out (queue-driven above). Draining the start-popup queue falls out of this for free.
      const intro = document.querySelector('#intro-popup');
      const introClose = document.querySelector('#intro-popup-close-button');
      if (vis(intro) && introClose) { introClose.click(); logOnce('intro-close'); return; }
      document.querySelectorAll('#info-or-choice-popup-confirm, [id$="-popup-confirm"], .info-or-choice-popup-closebutton').forEach(b => {
        if (carveOut.has(b.id)) return; // selection popups are queue-driven (section 1)
        const p = b.closest('.info-or-choice-popup, .card-choice-popup, .popup');
        if (vis(p) && !b.disabled) { b.click(); logOnce('auto-confirm ' + (b.id || b.className)); }
      });
    }, 100);
    return 'installed';
  };
  window.installGameTestHarness();
  ```
  **How a test drives a selection.** Declare the intended actions on `window.__gtHarness.selections` (a FIFO) BEFORE invoking the ability, then invoke it inside the `Promise.race` timeout above. Each action is `{ by, value }`: `by: 'name'` (matches the active popup's `nameOf` — card name for card-choice/city-hq, button text for order-choice), `'index'`, `'id'` (`data-card-id`), `'first'`, `'button'` (click a named popup button, e.g. `*-popup-nothanks` to decline), or `'confirm'`. Actions are consumed one per 100ms tick, so a **re-entrant** picker (popup reused N times) and a **multi-select** popup are both handled by queuing more actions — e.g. `[{by:'name',value:'BETA'},{by:'confirm'}]` for one pick, or `[{by:'name',value:'A'},{by:'confirm'},{by:'name',value:'B'},{by:'confirm'}]` across two uses. Queue selections in the order popups actually appear — the driver targets the frontmost active popup, so a genuinely-pending popup (e.g. a setup Scheme-Twist city-hq choice) must be resolved before the next. `H.log` records what fired. **Teardown between tests:** `clearInterval(window.__gtHarness.interval); window.__gtHarness.selections = [];`
  **RE-INSTALL AFTER ANY NAVIGATION.** A page reload / re-navigate wipes `window.__gtHarness` and the installer (verified). After every `browser_navigate` or page-close recovery, re-inject this source and call `installGameTestHarness()` again — it clears any prior interval first, so it never stacks.
  **Fail-closed preserved.** An undeclared selection popup (empty queue) or an unmatched target is NOT guessed — the driver leaves it, and the `Promise.race` `POPUP-TIMEOUT` fires (env stays alive). Never enqueue a default just to make a run pass.
  **Coverage.** Queue-driven selection popups: `card-choice`, `card-choice-city-hq`, `order-choice` (all verified as genuine selection popups whose confirm is disabled until a pick). Left auto-confirmed as YES/NO: `info-or-choice`, `draw-choice` ("Would you like to draw X?" — one predetermined card, no candidate list), `final-blow` (acknowledgement, `onclick=closeFinalBlowPopup`). To add a new selection popup, append a registry entry (`popup`/`confirm`/`cards`/`nameOf`) — its confirm auto-joins the carve-out.
- **Console-check gate (A3) — codified pass/fail, not "eyeball the console".** After each ability action, read the browser console via `browser_console_messages` (level `warning` = warn **and** error), then classify with the pure function below. It whitelists the benign `sw.js` 404 — emitted every local-serve run as a PAIR (a generic worker-script fetch 404 that does NOT name sw.js, plus the registration wrapper that does; **one substring entry covers both**, which is the trap to get right) — and fails on anything else. The returned `{ pass, unexpected }` IS the A2 contract's `consoleCheck` slot; per the contract, `consoleCheck.pass === false` → the TestCase FAILs. Verified live 2026-07-03: real sw.js-only console → **PASS** (no false-fail); an injected `console.error` → **FAIL** with the offending line captured, sw.js still suppressed.
  ```js
  // Named, extensible whitelist of benign console messages. Adding a future benign entry is one object.
  const CONSOLE_WHITELIST = [
    { name: 'sw.js Service Worker registration 404 (local-serve only)',
      // SW path is GH-Pages-absolute, so registration always 404s locally and no SW runs. BOTH the generic
      // worker-script fetch 404 ("...fetching the script. @ :0") and the wrapper naming sw.js contain this
      // phrase, so one substring matches the whole pair. Safe here because no other script fetch 404s in
      // this static game (a real game-JS load failure surfaces as a different error / a broken game). If
      // dynamic script loading is ever added, tighten this to require the sw.js / ServiceWorker context.
      match: 'A bad HTTP response code (404) was received when fetching the script' },
  ];
  // Pure classifier. `messages` = the text of each ERROR+WARNING console entry (from
  // browser_console_messages / page.on('console')). Returns the A2 consoleCheck slot: { pass, unexpected }.
  function classifyConsole(messages, whitelist = CONSOLE_WHITELIST) {
    const unexpected = (messages || [])
      .map(m => String(m).trim()).filter(Boolean)
      .filter(text => !whitelist.some(w => text.includes(w.match)));
    return { pass: unexpected.length === 0, unexpected };
  }
  ```
  **How a test consumes it.** After the action: read `browser_console_messages` (level `warning`), extract each entry's text into an array, call `classifyConsole(texts)`, and set `TestResult.consoleCheck` to the result. Level-filtering to ERROR+WARNING is the *source's* job (info/debug are not gate signals); whitelist-filtering is the classifier's. Only the sw.js 404 is whitelisted today. This gate reads the *browser* console (where the load-time sw.js 404 lives) — an in-page `console.error` hook installed post-load can't see it, so use `browser_console_messages`, not an in-page override.
- **Executor CORE (A2 contract runner) — `installGameTestExecutor()` → `window.gtRunTestCase(tc, opts)` + `window.gtRenderResults(results)`.** Runs ONE `TestCase` (A2 spec §2c) through the contract and emits a structured `TestResult` (§4a) with the actual value captured *even on pass*. It **self-applies the A4 `Promise.race` timeout around the action** — this closes T1 gap #2: a hung/undriven action is timed out and BLOCKED *by the executor*, not dependent on the caller wrapping it. Depends on `window.gtInject` (A5, for `setup`) and — when the action opens real popups — `window.installGameTestHarness` (A4, for popup driving; the executor calls it if present).
  - **Interface.** `await gtRunTestCase(tc, opts)`. `tc` = the A2 TestCase (`setup`/`snapshots`/`action`/`assertions` are in-page strings). `opts.buildFresh` **must be `true`** (the A1 precondition slot; anything else → whole run BLOCKED, fail-closed until A1 is built). `opts.timeoutMs` tunes the self-applied action timeout (default 8000). `opts.consoleMessages`, if given, overrides the default in-page console capture with the authoritative `browser_console_messages` array. Returns the `TestResult`; `gtRenderResults([...])` renders the familiar `Item | What | <mode>` table (FAIL cells carry `expected N, actual M`).
  - **Verdict = A2 §4b resolution order, first match wins:** `buildFresh` false → **BLOCKED** → `setup`/`action`/probe threw → **ERROR** → `timedOut` → **BLOCKED** → any `route:"human"` assertion → **BLOCKED** → any assertion or `consoleCheck` fail → **FAIL** → else **PASS**. Only all-green reaches PASS. **Console source note:** the executor captures `console.error`/`warn` + `error`/`unhandledrejection` events *during the run* (action-time errors — what per-action gating needs); the load-time sw.js 404 is pre-run and separately whitelisted. Pass `opts.consoleMessages` for the `browser_console_messages` path when the authoritative browser-level read is wanted.
  - **Verified live 2026-07-03** (`harness-hardening`, three synthetic TestCases): **PASS** (all-green, `actual` captured 5/5/true, console clean); **FAIL** (delta `expected 5, actual 3` captured → FAIL); **BLOCKED** (never-resolving action → executor's own 1500ms timeout fired, `timedOut:true` → BLOCKED — gap #2 proof). Ladder also spot-checked: `buildFresh:false`→BLOCKED, setup-throw→ERROR (outranks the would-be timeout; an unvetted `setup` injection surfaces as ERROR, never a silent mask), human-route→BLOCKED despite a passing machine assertion.
  - **Scope (core only).** NOT yet wired into the dual-mode `/game-test` flow or the Phase-4d per-ability gate, and does NOT re-drive `card-choice-city-hq` — those are the next unit.
  ```js
  window.installGameTestExecutor = function () {
    const CONSOLE_WHITELIST = [
      { name: 'sw.js Service Worker registration 404 (local-serve only)',
        match: 'A bad HTTP response code (404) was received when fetching the script' },
    ];
    function classifyConsole(messages, whitelist) {
      whitelist = whitelist || CONSOLE_WHITELIST;
      const unexpected = (messages || []).map(m => String(m).trim()).filter(Boolean)
        .filter(text => !whitelist.some(w => text.includes(w.match)));
      return { pass: unexpected.length === 0, unexpected: unexpected };
    }
    function deepEq(a, b) {
      if (a === b) return true;
      if (typeof a !== typeof b) return false;
      if (a && b && typeof a === 'object') { try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; } }
      return false;
    }
    function compare(cmp, actual, expected) {
      switch (cmp) {
        case 'eq':       return deepEq(actual, expected);
        case 'neq':      return !deepEq(actual, expected);
        case 'gt':       return Number(actual) >  Number(expected);
        case 'gte':      return Number(actual) >= Number(expected);
        case 'lt':       return Number(actual) <  Number(expected);
        case 'lte':      return Number(actual) <= Number(expected);
        case 'includes': return actual != null && typeof actual.includes === 'function' && actual.includes(expected);
        case 'excludes': return actual != null && typeof actual.includes === 'function' && !actual.includes(expected);
        case 'present':  return !!actual;               // truthy (0 count / '' / null → absent)
        case 'absent':   return !actual;
        default: throw new Error('gtExecutor: unknown comparator "' + cmp + '"');
      }
    }
    async function gtRunTestCase(tc, opts) {
      opts = opts || {};
      const result = { id: tc.id, card: tc.card, mode: tc.mode, verdict: null, buildFresh: opts.buildFresh === true, timedOut: false, assertions: [], consoleCheck: null };
      const captured = [];
      const origErr = console.error, origWarn = console.warn;
      const onErr = e => captured.push(String((e && (e.message || e.error)) || e));
      const onRej = e => captured.push('unhandledrejection: ' + String(e && e.reason));
      console.error = function () { captured.push(Array.prototype.map.call(arguments, String).join(' ')); return origErr.apply(console, arguments); };
      console.warn  = function () { captured.push(Array.prototype.map.call(arguments, String).join(' ')); return origWarn.apply(console, arguments); };
      window.addEventListener('error', onErr);
      window.addEventListener('unhandledrejection', onRej);
      let setupThrew = false, actionThrew = false, probeThrew = false, humanRoute = false, errorStep = null;
      const snap = {};
      const resolveExpected = a => (typeof a.expected === 'string' && Object.prototype.hasOwnProperty.call(snap, a.expected)) ? snap[a.expected] : a.expected;
      try {
        if (typeof window.installGameTestHarness === 'function') window.installGameTestHarness();
        if (tc.setup) { try { eval(tc.setup); } catch (e) { setupThrew = true; errorStep = 'setup: ' + String(e && e.message || e); } }
        if (!setupThrew && Array.isArray(tc.snapshots)) {
          for (const s of tc.snapshots) { try { snap[s.name] = eval(s.probe); } catch (e) { probeThrew = true; errorStep = errorStep || ('snapshot "' + s.name + '": ' + String(e && e.message || e)); } }
        }
        if (!setupThrew && !probeThrew && tc.action) {
          const TIMEOUT_MS = opts.timeoutMs || 8000;
          const actionPromise = Promise.resolve().then(() => eval(tc.action));          // may return a promise
          const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej({ __gtTimeout: true, message: 'POPUP-TIMEOUT — action did not resolve within ' + TIMEOUT_MS + 'ms' }), TIMEOUT_MS));
          try { await Promise.race([actionPromise, timeoutPromise]); }               // SELF-APPLIED timeout (gap #2)
          catch (e) { if (e && e.__gtTimeout) { result.timedOut = true; } else { actionThrew = true; errorStep = errorStep || ('action: ' + String(e && e.message || e)); } }
        }
        if (!setupThrew && !actionThrew && !probeThrew && !result.timedOut && Array.isArray(tc.assertions)) {
          for (const a of tc.assertions) {
            const row = { label: a.label, cmp: a.cmp, expected: (a.expected !== undefined ? a.expected : null), actual: null, pass: false };
            if (a.route === 'human') { humanRoute = true; row.route = 'human'; row.pass = false; result.assertions.push(row); continue; }
            try {
              const actual = eval(a.probe);
              const expected = resolveExpected(a);
              row.actual = actual;
              row.expected = (a.cmp === 'present' || a.cmp === 'absent') ? undefined : expected;
              row.pass = compare(a.cmp, actual, expected);
            } catch (e) { probeThrew = true; row.error = String(e && e.message || e); errorStep = errorStep || ('probe "' + a.label + '": ' + row.error); }
            result.assertions.push(row);
          }
        }
      } finally {
        console.error = origErr; console.warn = origWarn;
        window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onRej);
      }
      result.consoleCheck = classifyConsole(opts.consoleMessages != null ? opts.consoleMessages : captured);
      const anyAssertFail = result.assertions.some(r => r.route !== 'human' && r.pass === false && !r.error);
      if (!result.buildFresh) result.verdict = 'BLOCKED';                                              // 1
      else if (setupThrew || actionThrew || probeThrew) { result.verdict = 'ERROR'; result.error = errorStep; } // 2
      else if (result.timedOut) result.verdict = 'BLOCKED';                                            // 3
      else if (humanRoute) result.verdict = 'BLOCKED';                                                 // 4
      else if (anyAssertFail || result.consoleCheck.pass === false) result.verdict = 'FAIL';           // 5
      else result.verdict = 'PASS';                                                                    // 6
      return result;
    }
    function gtRenderResults(results) {
      results = Array.isArray(results) ? results : [results];
      const modes = results.map(r => r.mode).filter((m, i, a) => m && a.indexOf(m) === i);
      const cols = modes.length ? modes : ['result'];
      const cell = r => {
        if (r.verdict === 'FAIL') {
          const f = r.assertions.find(a => a.route !== 'human' && a.pass === false && !a.error);
          if (f) return 'FAIL (' + f.label + ': expected ' + JSON.stringify(f.expected) + ', actual ' + JSON.stringify(f.actual) + ')';
          if (r.consoleCheck && !r.consoleCheck.pass) return 'FAIL (console: ' + JSON.stringify(r.consoleCheck.unexpected) + ')';
          return 'FAIL';
        }
        if (r.verdict === 'ERROR') return 'ERROR (' + (r.error || '') + ')';
        if (r.verdict === 'BLOCKED') return 'BLOCKED' + (r.timedOut ? ' (timeout)' : (r.assertions.some(a => a.route === 'human') ? ' (human-route)' : (!r.buildFresh ? ' (stale build)' : '')));
        return 'PASS';
      };
      const byId = {};
      for (const r of results) { (byId[r.id] = byId[r.id] || {}).card = r.card; (byId[r.id][r.mode || 'result']) = cell(r); }
      const lines = ['| Item | What | ' + cols.join(' | ') + ' |', '|---|---|' + cols.map(() => '---').join('|') + '|'];
      for (const id of Object.keys(byId)) { const row = byId[id]; lines.push('| ' + id + ' | ' + (row.card || '') + ' | ' + cols.map(c => row[c] || '—').join(' | ') + ' |'); }
      return lines.join('\n');
    }
    window.gtRunTestCase = gtRunTestCase;
    window.gtRenderResults = gtRenderResults;
    return 'installed';
  };
  window.installGameTestExecutor();
  ```
  **RE-INSTALL AFTER ANY NAVIGATION** (same as the A4/A5 installers — a reload wipes `window.gt*`).
- **Live UI-refresh tests must go through the real play path** (`selectedCards=[idx]` → `confirmActions()`, or `endTurn()`) — abilities rely on the single trailing `updateGameBoard()`; an isolated ability call leaves the DOM stale and falsely reads as a refresh bug.
- **The Playwright page can close mid-session with the server still up** — re-navigate + re-`resize(1920×1080)` to recover.

## Cleanup

Leave the HTTP server running across multiple runs in the same session — costs nothing, saves restart time. Stop it at session end (kill the background PID) so the port frees cleanly.
