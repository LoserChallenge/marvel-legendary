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

## Cleanup

Leave the HTTP server running across multiple runs in the same session — costs nothing, saves restart time. Stop it at session end (kill the background PID) so the port frees cleanly.
