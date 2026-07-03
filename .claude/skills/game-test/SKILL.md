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
- **Browser console errors** — `browser_console_logs` for `console.error` / `console.warn`. Ignore the known `sw.js` 404 in local-serve mode (path-prefix mismatch with GitHub Pages, not a real bug). Flag anything else.
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
- **State-injection binding trap:** `citySize`, `cityReserveAttack`, `totalAttackPoints`, `cumulativeAttackPoints` are top-level `let` (NOT window-aliased); only `mastermindReserveAttack` is `var` on `window`. Inject via bare assignments (`citySize = 7`) to hit the lexical bindings — `window.citySize = 7` won't take.
- **Implicit-global trap:** when testing functions that read globals, **wipe `window.<globalName>` before each invocation** to force the cold-start path: `window.<name> = undefined; delete window.<name>;`. Do NOT write `globalName = value` — in non-strict scripts that creates an implicit global and masks missing-initialization bugs (a `transformScheme()` diagnostic passed this way while the real game still crashed).
- **Always check dev-tools console after every invocation:** a function failing silently upstream (try/catch with `console.error`) produces no on-screen-console signal but leaves a clear trace in F12 → Console. When a test passes but the real game still fails, the test is wrong before the production code is.

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
- **Selection-driving harness (A4 complete) — `installGameTestHarness()` supersedes the bare `__autoPopup` snippet.** The bare interval above only auto-confirms yes/no popups; it cannot drive a card-SELECTION popup (pick WHICH card), and it dies on page reload. This consolidated installer adds both: a **declared selection queue** that actively picks the intended `.popup-card` then confirms via the real play path, and **idempotent re-install** so it survives navigation. Verified live 2026-07-03 (whatif) against the real `KO1To4FromDiscard` picker: single-pick-by-name, re-entrant 2nd-use of the shared popup, empty-queue → `POPUP-TIMEOUT` (env alive), and post-reload re-install all pass.
  ```js
  window.installGameTestHarness = function () {
    if (window.__gtHarness && window.__gtHarness.interval) clearInterval(window.__gtHarness.interval); // idempotent: never stack intervals
    window.__gtHarness = window.__gtHarness || {};
    const H = window.__gtHarness;
    H.selections = H.selections || []; // FIFO of intended actions for card-choice popups (see below)
    H.log = H.log || [];               // audit trail of what the driver did
    // Visible = element AND all ancestors are not display:none. The game hides some popups via a
    // CONTAINER (e.g. #intro-popup stays display:block inside a display:none container), so checking
    // the element's own display alone false-positives and starves real popups. Structural, not geometry (A8).
    const vis = el => { if (!el) return false; let n = el; while (n) { if (getComputedStyle(n).display === 'none') return false; n = n.parentElement; } return true; };
    const logOnce = m => { if (H.log[H.log.length - 1] !== m) H.log.push(m); };
    H.interval = setInterval(() => {
      // (1) card-CHOICE popups are QUEUE-DRIVEN (never blind-confirmed): multi-select pickers keep
      //     confirm enabled at 0 selections, so a blind auto-confirm would resolve the pick as "nothing".
      const choice = document.querySelector('.card-choice-popup');
      if (vis(choice)) {
        if (H.selections.length) {
          const a = H.selections[0];
          const confirmBtn = document.getElementById('card-choice-popup-confirm');
          const cards = [...choice.querySelectorAll('.popup-card')];
          let done = false;
          if (a.by === 'confirm') { if (confirmBtn && !confirmBtn.disabled) { confirmBtn.click(); done = true; logOnce('confirm'); } }
          else if (a.by === 'button') { const btn = document.getElementById(a.value); if (btn && vis(btn) && !btn.disabled) { btn.click(); done = true; logOnce('button:' + a.value); } }
          else {
            let el = null;
            if (a.by === 'index') el = cards[a.value] || null;
            else if (a.by === 'name') el = cards.find(c => (c.querySelector('.popup-card-image') || {}).alt === a.value) || null; // alt === card.name
            else if (a.by === 'id') el = cards.find(c => c.getAttribute('data-card-id') === a.value) || null;
            else if (a.by === 'first') el = cards[0] || null;
            if (el) { el.click(); done = true; logOnce('select ' + a.by + ':' + a.value); } // fires the game's selection listener → enables confirm
            else logOnce('NO-MATCH ' + a.by + ':' + a.value);
          }
          if (done) H.selections.shift();
        }
        return; // queue empty on a visible card-choice = undeclared popup → leave it → POPUP-TIMEOUT fires (fail-closed, no guess)
      }
      // (2) yes/no / proceed / intro popups: auto-confirm ENABLED buttons. #card-choice-popup-confirm is
      //     carved out (queue-driven above). Draining the start-popup queue falls out of this for free.
      const intro = document.querySelector('#intro-popup');
      const introClose = document.querySelector('#intro-popup-close-button');
      if (vis(intro) && introClose) { introClose.click(); logOnce('intro-close'); return; }
      document.querySelectorAll('#info-or-choice-popup-confirm, [id$="-popup-confirm"], .info-or-choice-popup-closebutton').forEach(b => {
        if (b.id === 'card-choice-popup-confirm') return; // A4 carve-out
        const p = b.closest('.info-or-choice-popup, .card-choice-popup, .popup');
        if (vis(p) && !b.disabled) { b.click(); logOnce('auto-confirm ' + (b.id || b.className)); }
      });
    }, 100);
    return 'installed';
  };
  window.installGameTestHarness();
  ```
  **How a test drives a selection.** Declare the intended actions on `window.__gtHarness.selections` (a FIFO) BEFORE invoking the ability, then invoke it inside the `Promise.race` timeout above. Each action is `{ by, value }`: `by: 'name'` (matches `.popup-card-image` alt = card name), `'index'`, `'id'` (`data-card-id`), `'first'`, `'button'` (click a named popup button, e.g. `card-choice-popup-nothanks` to decline), or `'confirm'` (click the enabled confirm). Selections are consumed one action per 100ms tick, so a **re-entrant** picker (popup reused N times) and a **multi-select** popup are both handled by queuing more actions — e.g. `[{by:'name',value:'BETA'},{by:'confirm'}]` for one pick, or `[{by:'name',value:'A'},{by:'confirm'},{by:'name',value:'B'},{by:'confirm'}]` across two uses. `H.log` records what fired. **Teardown between tests:** `clearInterval(window.__gtHarness.interval); window.__gtHarness.selections = [];`
  **RE-INSTALL AFTER ANY NAVIGATION.** A page reload / re-navigate wipes `window.__gtHarness` and the installer (verified). After every `browser_navigate` or page-close recovery, re-inject this source and call `installGameTestHarness()` again — it clears any prior interval first, so it never stacks.
  **Fail-closed preserved.** An undeclared selection popup (empty queue) or an unmatched target is NOT guessed — the driver leaves it, and the `Promise.race` `POPUP-TIMEOUT` fires (env stays alive). Never enqueue a default just to make a run pass.
  **Scope note (follow-up, NOT covered by A4).** The carve-out is `#card-choice-popup-confirm` only. Sibling SELECTION popups whose confirm ends in `-popup-confirm` (`order-choice-popup-confirm`, `draw-choice-popup-confirm`, `card-choice-city-hq-popup-confirm`) are still blind-auto-confirmed by section (2) — same premature-confirm risk class. If a test needs a specific selection in one of those, extend the queue-driven branch to that popup; until then treat their auto-confirm as unverified.
- **Live UI-refresh tests must go through the real play path** (`selectedCards=[idx]` → `confirmActions()`, or `endTurn()`) — abilities rely on the single trailing `updateGameBoard()`; an isolated ability call leaves the DOM stale and falsely reads as a refresh bug.
- **The Playwright page can close mid-session with the server still up** — re-navigate + re-`resize(1920×1080)` to recover.

## Cleanup

Leave the HTTP server running across multiple runs in the same session — costs nothing, saves restart time. Stop it at session end (kill the background PID) so the port frees cleanly.
