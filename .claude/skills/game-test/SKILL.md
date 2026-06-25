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
- **Live UI-refresh tests must go through the real play path** (`selectedCards=[idx]` → `confirmActions()`, or `endTurn()`) — abilities rely on the single trailing `updateGameBoard()`; an isolated ability call leaves the DOM stale and falsely reads as a refresh bug.
- **The Playwright page can close mid-session with the server still up** — re-navigate + re-`resize(1920×1080)` to recover.

## Cleanup

Leave the HTTP server running across multiple runs in the same session — costs nothing, saves restart time. Stop it at session end (kill the background PID) so the port frees cleanly.
