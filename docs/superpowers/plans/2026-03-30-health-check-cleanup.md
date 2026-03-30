# Health Check Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two confirmed bugs and one structural HTML issue identified during the 2026-03-30 project health check, before starting Card Effect Auditor or expansion content work.

**Architecture:** Small, isolated fixes only — no refactoring, no architectural changes. One commit per task. Each task is independently verifiable.

**Tech Stack:** Vanilla JS, HTML, CSS — no build step. Open index.html in browser to test.

---

## Background: Health Check Summary

Full analysis performed 2026-03-30. All 36 original Golden Solo compatibility fixes confirmed applied. New issues found:

| # | Issue | Severity |
|---|---|---|
| 1 | 3 HQ fill-in-place bugs outside original audit scope | Critical |
| 2 | Duplicate HTML IDs in 5 setup sections | High |
| 3 | No explicit game reset between games | Medium (deferred) |
| 4 | Async anti-patterns (5 locations) | Low (dropped) |

Tasks 3 and 4 are **out of scope** for this plan — deferred pending evidence of actual problems.

---

## Task 1: Fix 3 HQ fill-in-place bugs

**What this fixes:** Three card effects fill HQ slots directly (`hq[index] = newCard`) without checking game mode. In Golden Solo, HQ must *rotate* (new card to rightmost slot, all others slide left) — not fill in place. These were outside the original 2026-03-26 audit scope but have the same root cause.

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (~line 6129)
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/cardAbilities.js` (~line 15113, ~line 15211)

**Functions to fix:**
1. `returnHeroToDeck()` in `script.js` — triggered when a hero ability returns a hero from play to the deck, then refills the HQ slot
2. `AmbushRightHeroSkrull()` in `cardAbilities.js` — Skrull Shapeshifters ambush effect that swaps a hero
3. `captureHeroBySkrullQueen()` in `cardAbilities.js` — Skrull Queen capture effect

**The fix pattern** (same as all previous audit fixes):
```javascript
// Before (broken in Golden Solo):
hq[hqIndex] = heroDeck.pop();

// After:
if (gameMode === 'golden') {
  goldenRefillHQ(hqIndex);
} else {
  hq[hqIndex] = heroDeck.pop();
}
```

- [ ] **Step 1: Locate and read `returnHeroToDeck()` in script.js**

Search for `returnHeroToDeck` in script.js. Read the full function. Find the line that does a bare `hq[hqIndex] =` assignment and confirm it has no game mode check.

- [ ] **Step 2: Apply the game mode guard to `returnHeroToDeck()`**

Replace the bare assignment with the guarded pattern above. Exact variable names may differ slightly — match whatever the function uses.

- [ ] **Step 3: Locate and read `AmbushRightHeroSkrull()` in cardAbilities.js**

Search for `AmbushRightHeroSkrull` in cardAbilities.js. Read the function. Find the bare `hq[...] =` assignment (around line 15113). Confirm no game mode check exists.

- [ ] **Step 4: Apply the game mode guard to `AmbushRightHeroSkrull()`**

Replace the bare assignment with the guarded pattern.

- [ ] **Step 5: Locate and read `captureHeroBySkrullQueen()` in cardAbilities.js**

Search for `captureHeroBySkrullQueen` in cardAbilities.js (around line 15211). Find the bare HQ assignment. Confirm no game mode check exists.

- [ ] **Step 6: Apply the game mode guard to `captureHeroBySkrullQueen()`**

Replace the bare assignment with the guarded pattern.

- [ ] **Step 7: Verify JS syntax hook passes on both files**

The JS syntax hook runs automatically after each Edit. Confirm no syntax errors were introduced in either file.

- [ ] **Step 8: Quick sanity check**

Search `cardAbilities.js` for any remaining bare `hq\[` assignments that have no `goldenRefillHQ` guard and are not already in the `else` branch of a game mode check. Flag any found before committing.

- [ ] **Step 9: Commit**

```
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/cardAbilities.js
git commit -m "Fix HQ fill-in-place in returnHeroToDeck, AmbushRightHeroSkrull, captureHeroBySkrullQueen for Golden Solo"
```

---

## Task 2: Fix duplicate HTML IDs in setup sections

**What this fixes:** Five setup section `<div>` containers each share their `id` with their inner scrollable list child `<div>`. This violates the HTML5 spec — `getElementById()` only returns the first match. Any JS targeting the inner list is silently hitting the outer container instead.

**Duplicate IDs found:**

| Section | Duplicate ID | Outer div line | Inner div line |
|---|---|---|---|
| Schemes | `scheme-section` | ~98 | ~115 |
| Masterminds | `mastermind-section` | ~236 | ~253 |
| Villains | `villain-section` | ~289 | ~306 |
| Henchmen | `henchmen-section` | ~349 | ~363 |
| Heroes | `hero-section` | ~433 | ~466 |

**Fix strategy:** Rename only the *inner* scrollable list `<div>` in each pair. Outer container IDs are kept as-is (they're used for section visibility/hiding). Inner list IDs get a `-list` suffix (e.g. `scheme-section` → `scheme-list`).

**Files:**
- Modify: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/index.html`
- Check: `Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js` (grep for each old inner ID)

- [ ] **Step 1: Grep script.js for each of the 5 old inner IDs**

Run these searches to find out whether any JS directly targets the inner list IDs:
- `getElementById('scheme-section')` or `querySelector('#scheme-section')`
- Same for `mastermind-section`, `villain-section`, `henchmen-section`, `hero-section`

Note every location that targets these IDs — you need to know if any of them intend the *inner* list rather than the outer container.

- [ ] **Step 2: Rename the inner list IDs in index.html**

For each of the 5 sections, find the *second* occurrence of the duplicate ID (the inner scrollable `<div>`) and rename it:
- `scheme-section` (inner) → `scheme-list`
- `mastermind-section` (inner) → `mastermind-list`
- `villain-section` (inner) → `villain-list`
- `henchmen-section` (inner) → `henchmen-list`
- `hero-section` (inner) → `hero-list`

- [ ] **Step 3: Update any JS references that targeted the inner IDs**

If Step 1 found any JS that targets these IDs intending the inner list, update those references to use the new `-list` IDs. If all JS was targeting the outer container, no JS changes needed.

- [ ] **Step 4: Verify no duplicates remain**

Search index.html for each of the 5 IDs and confirm each now appears exactly once.

- [ ] **Step 5: Smoke test in browser**

Open `index.html` in a browser. Verify the setup screen loads correctly — all 5 sections (Schemes, Masterminds, Villains, Henchmen, Heroes) display their scrollable lists normally. Select a scheme, mastermind, villain group, henchmen, and heroes — confirm the selection summary panel updates correctly.

- [ ] **Step 6: Commit**

```
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/index.html
# If JS was updated:
git add Legendary-Solo-Play-main/Legendary-Solo-Play-main/script.js
git commit -m "Fix duplicate HTML IDs in setup section containers vs scrollable lists"
```

---

## After This Plan

Once both tasks are committed to master, proceed to:

**Next: Card Effect Auditor system** — implementation plan needed. Spec at `docs/superpowers/specs/2026-03-29-card-effect-auditor-design.md`.
