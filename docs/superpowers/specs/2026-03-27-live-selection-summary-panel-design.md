# Live Selection Summary Panel — Design Spec

## Problem

The setup screen is long and scrollable. Once you scroll past a section, you can't see what you picked. The only way to review all selections is to hit START GAME and read the CONFIRM CHOICES popup — then go back and scroll to fix any issues. This is tedious and error-prone.

## Solution

A fixed bottom panel on the setup screen that shows all current selections at a glance, updates live as checkboxes and radio buttons are clicked, and uses color-coded counts to indicate whether requirements are met.

## Panel Structure

### Position & Sizing

- **Fixed to the bottom of the viewport** — does not scroll with page content
- **Full width** of the screen
- **Flexible height** — grows to fit content; never truncates names
- **Visible only on the setup screen** — hidden during gameplay
- The scrollable setup area sits above the panel; bottom padding added to prevent content from being hidden behind it

### Layout: Two Rows

**Row 1 — Single-select items + controls:**

| Element | Display |
|---------|---------|
| Scheme | Label + selected name (or "None") |
| Mastermind | Label + selected name (or "None") |
| Villains | Label + all selected names + count (e.g. "2/1") |
| Henchmen | Label + all selected names + count (e.g. "1/1") |
| Game Mode | Compact radio toggle (What If? / Golden Solo) |
| Final Blow | Compact toggle switch |

**Row 2 — Heroes + action buttons:**

| Element | Display |
|---------|---------|
| Heroes | Label + all selected names + count (e.g. "5/5") |
| Action buttons | RANDOMIZE ALL, LOAD LAST SETUP, START GAME (right-aligned) |

### Name Display Rule

All selected names are always shown in full. No truncation, no "+N more". If names wrap, the panel grows taller to accommodate. This is the core purpose of the panel — the user must see exactly what they've chosen.

## Interaction Behavior

### Live Updates

The panel updates instantly when any selection changes:

- Clicking a scheme radio → scheme name appears
- Checking/unchecking a hero checkbox → hero name added/removed, count updates
- Changing Game Mode → hero required count updates (What If? uses scheme's requirement; Golden Solo always 5)
- Changing a scheme → required counts for villains, henchmen, heroes update to match the new scheme's requirements

### Count Display Logic

| State | Color |
|-------|-------|
| Nothing selected (0/N) | Grey |
| Too few (still selecting) | Amber/yellow |
| Correct count (N/N) | Green |
| Too many (over-filled) | Red |
| Scheme not selected (requirements unknown) | Count shows "?" (e.g. "2/?") |

Color applies to the count numbers only (e.g. "(2/1)"), not the names.

### START GAME Button

Works exactly as it does now — opens the CONFIRM CHOICES popup. The panel is informational only; it does not block or gate the START GAME action.

## Existing UI Changes

### Removed from current position

The following elements move from the right-side floating cluster into the summary panel:

- GAME MODE section (radio buttons for What If? / Golden Solo)
- FINAL BLOW section (heading + toggle switch)
- RANDOMIZE ALL button (bottom instance, `#randomize-all2`)
- LOAD LAST SETUP button (bottom instance, `#load-last-setup-2`)
- START GAME button (bottom instance, `#start-game2`)

The top button cluster (RANDOMIZE ALL, LOAD LAST SETUP, START GAME at the top of the setup screen) remains unchanged.

### Bottom padding

The setup screen's scrollable content area gets bottom padding equal to the panel's height, so the lowest sections (heroes, bystanders) are never hidden behind the panel.

## Visual Styling

### Panel Background

- Dark charcoal matching the page background
- Gold/yellow top border (2-3px) separating it from scrolling content
- Subtle upward box-shadow for a "floating" effect

### Typography

| Element | Style |
|---------|-------|
| Category labels (SCHEME, MASTERMIND, etc.) | Gold/yellow, bold, small caps |
| Selection names | White, normal weight |
| Count numbers | Grey / amber / green / red per state |

### Controls

- Game Mode: compact radio buttons, same style as current but smaller
- Final Blow: same toggle switch as current, smaller
- Action buttons: same gold/yellow buttons as current, sized to fit the row

### Responsive Behavior

If the browser window is narrow, the panel stacks into more rows rather than cutting off content. Names always fully visible.

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Add summary panel HTML; remove right-side button/control cluster |
| `styles.css` | Panel fixed positioning, two-row layout, color-coded counts, responsive stacking, bottom padding on setup content |
| `script.js` | Live update listeners on all selection inputs; count calculation logic reading scheme requirements and game mode; panel show/hide tied to setup screen visibility |

## Verification

- [ ] Panel visible at bottom of setup screen on page load
- [ ] Panel stays fixed while scrolling through sections
- [ ] Selecting a scheme → name appears in panel immediately
- [ ] Selecting a mastermind → name appears immediately
- [ ] Checking heroes → each name appears, count updates
- [ ] Count turns green when correct number selected
- [ ] Count turns amber when too few (still selecting)
- [ ] Count turns red when too many (over-filled)
- [ ] Count shows "?" when no scheme selected
- [ ] Changing Game Mode to Golden Solo → hero required count changes to 5
- [ ] All hero names visible (no truncation) even with 5+ heroes
- [ ] All villain/henchmen names visible (no truncation)
- [ ] RANDOMIZE ALL button in panel works
- [ ] LOAD LAST SETUP button in panel works
- [ ] START GAME button in panel opens CONFIRM CHOICES popup as before
- [ ] Game Mode toggle in panel works (changes mode)
- [ ] Final Blow toggle in panel works
- [ ] Old right-side button cluster is removed
- [ ] Bottom of setup screen content not hidden behind panel
- [ ] Panel hidden during gameplay
- [ ] No regressions to CONFIRM CHOICES popup behavior
- [ ] No regressions to What If? Solo or Golden Solo game modes
