# Location System — Design Spec

Date: 2026-04-06
Status: Approved
Context: Revelations expansion Step 2 — new card type that sits above city spaces

---

## Goal

Add a Location card type that occupies a layer above city spaces. Locations are drawn from the villain deck, placed above city spaces, and remain fixed while villains advance beneath them. Players can fight Locations independently. Some Locations grant keywords to villains in their space, and some trigger effects when villains in their space are defeated.

## Why This Is Needed

Revelations introduces Locations as a core mechanic:
- **4 villain groups** each include 1-2 Location cards (8 Locations total across villain groups)
- **All 3 masterminds** have tactics that transform into Locations when defeated
- **HYDRA Base** henchmen are a Location-Henchman hybrid (10 cards)
- **Grim Reaper** Master Strike creates "Graveyard" Locations
- **2 Locations** grant keywords to villains in their space (Sentry's Watchtower → Last Stand, The Dark Dimension → Dark Memories)

---

## Data Structure

### New Array

```js
let cityLocations = [];
```

Parallel to `city[]` — same length, initialized in `initCityArrays()` via `new Array(citySize).fill(null)`. Each slot holds a Location card object or `null`.

### Location Card Object

Location cards in `cardDatabase.js` follow the villain card format with these distinctions:

```js
{
  name: "Sentry's Watchtower",
  group: "Dark Avengers",
  type: "Location",          // distinguishes from type: "Villain"
  attack: 8,
  vp: 5,
  image: "Visual Assets/Villains/SentrysWatchtower.webp",
  triggeredAbility: "sentrysWatchtowerTriggered",  // "Whenever you fight a Villain here"
  fightEffect: "sentrysWatchtowerFight",            // when Location itself is defeated
}
```

Fields:
- `type: "Location"` — routing flag for placement and rendering
- `triggeredAbility` — function name called after a villain in this space is defeated (optional, not all Locations have one)
- `fightEffect` — function name called when the Location itself is defeated (optional)
- Standard fields: `name`, `group`, `attack`, `vp`, `image`

### HYDRA Base (Henchman-Location Hybrid)

```js
{
  name: "HYDRA Base",
  group: "HYDRA Base",
  type: "Location",
  subtype: "Henchman",       // counts as Henchman for game effects
  attack: 2,
  vp: 1,
  // Gets +2 Attack while a Villain is in the same space — handled in updateVillainAttackValues or equivalent
}
```

The `subtype: "Henchman"` flag allows game logic to treat HYDRA Base as both a Location (placement, rendering) and a Henchman (for effects that count or target Henchmen).

---

## Placement Logic

### Normal Placement (drawn from villain deck)

When `processVillainCard()` draws a card with `type: "Location"`:

1. Route to `placeLocation(card)` instead of normal villain placement
2. Find the **rightmost** city space index where `cityLocations[i] === null`
3. Place the card: `cityLocations[i] = card`
4. Log placement to console
5. Call `updateGameBoard()` to render

Locations do **not** push existing villains. They occupy a separate layer.

### Overflow (all spaces occupied)

If every `cityLocations[i]` is non-null:

1. Find the Location(s) with the lowest `attack` value
2. If tied, player chooses which to KO (popup selection)
3. KO the chosen Location (remove from `cityLocations`, do not add to Victory Pile — KO'd cards go to KO pile)
4. Place the new Location in the freed space

### Locations Don't Move

When villains advance through the city (pushing left), Locations stay fixed. The `processRegularVillainCard()` movement loop only moves `city[i]` entries — `cityLocations[i]` is never shifted.

---

## Rendering

### Three Visual States

Rendered in the `updateGameBoard()` city loop, for each space `i`:

**State 1 — Location only (`cityLocations[i]` present, `city[i]` null):**
- Location card renders full-size in the city space
- Gold-tinted border/styling to distinguish from villain cards
- Click target: entire card → fight Location

**State 2 — Location + Villain (`cityLocations[i]` present, `city[i]` present):**
- Location card shifts to top of space, ~40% visible (showing name and type label)
- Villain card overlaps below in normal position
- Two independent click targets:
  - Location peek area (top portion) → fight Location
  - Villain card (main area) → fight Villain
- Both have independent affordability styling (green glow if affordable)

**State 3 — Villain only (`cityLocations[i]` null, `city[i]` present):**
- No change from current behavior

**State 4 — Empty space (`cityLocations[i]` null, `city[i]` null):**
- No change from current behavior (empty space, possibly with dark portal overlay)

**State 5 — Empty space with Location (`cityLocations[i]` present, `city[i]` null, space has dark portal or other overlay):**
- Location renders full-size, other overlays render on top as normal

### CSS Approach

New CSS classes:
- `.location-card` — gold border, Location-specific styling
- `.location-peek` — clipped to top ~40%, positioned above villain card
- `.city-space-layered` — added to city cells that have a Location, adjusts height to accommodate two layers

### Destroyed Spaces

If `destroyedSpaces[i]` is true, any Location in that space is KO'd (removed from `cityLocations[i]`). The destroyed space rendering takes priority.

---

## Fighting Locations

### Affordability Check

Locations use the same Attack-based affordability as villains:
- Check `totalAttackPoints >= location.attack`
- Bribe/recruit-to-fight rules do NOT apply to Locations (they are not Villains)
- Location attack is generally fixed (cityTempBuff/cityPermBuff don't apply — those are villain-only). Exception: some Locations have conditional attack bonuses (e.g., HYDRA Base gets +2 while a Villain is in the same space) — these are handled by the Location's own effect logic, not the buff arrays.

### Fight Flow

1. Player clicks Location (or Location peek area)
2. `showAttackButton()` called with a Location flag (e.g., `showAttackButton(i, "location")`)
3. Fight button shows Location name and attack cost
4. On confirm: deduct attack points, animate defeat, move Location to Victory Pile
5. Execute Location's `fightEffect` if it has one
6. Call `updateGameBoard()`

### Post-Villain-Fight Trigger

After defeating a villain at city index `i`:
1. Check if `cityLocations[i]` exists
2. If it has a `triggeredAbility`, execute it
3. This happens after the villain's own fight effect, before board update

---

## Tactic → Location Lifecycle

Some Mastermind Tactics say "If this was not already a Location, this card enters the city as a Location."

Implementation:
1. After the tactic's fight effect resolves, check if the tactic has a `becomesLocation` property
2. If present and the tactic is not already a Location: create a Location object from the tactic's `becomesLocation` data (name, attack, vp, triggeredAbility, image)
3. Place it via `placeLocation()` (normal placement logic — rightmost empty space, overflow if full)
4. The tactic card is consumed (does not go to Victory Pile as a tactic — it becomes the Location)

Data in `cardDatabase.js`:
```js
// Mastermind tactic example
{
  name: "Maze of Bones",
  // ... normal tactic fields ...
  becomesLocation: {
    name: "Maze of Bones",
    attack: 0,  // uses tactic's original attack
    vp: 0,      // uses tactic's original vp
    triggeredAbility: "mazeOfBonesTriggered",
    image: "Visual Assets/Masterminds/MazeOfBones.webp"
  }
}
```

---

## Integration with Existing Systems

### processVillainCard() Routing

Add a type check at the top of villain card processing:

```
if card.type === "Location" → placeLocation(card)
else → existing villain placement logic
```

### updateVillainAttackValues() — Location-Granted Keywords

Two Locations grant keywords to villains in their space:
- Sentry's Watchtower: villains get Last Stand (stacks with existing Last Stand)
- The Dark Dimension: villains get Dark Memories (stacks with existing Dark Memories)

In `updateVillainAttackValues()`, after calculating the villain's own modifiers, check `cityLocations[cityIndex]`. If it's Sentry's Watchtower or The Dark Dimension, calculate the keyword bonus independently and add to `attackFromOwnEffects`.

This is expansion-specific logic — it goes in `expansionRevelations.js`, called from a hook in `updateVillainAttackValues()`.

### cityLocationAttack[] — Repurposing

The existing `cityLocationAttack[]` array (used by hero abilities that grant location-specific attack bonuses) is **separate** from the Location card system. It continues to work as-is. Location cards do not interact with `cityLocationAttack` — that array modifies villain attack at a space, Location cards are a separate entity.

### Empty Space Checks (Last Stand, etc.)

A city space with a Location and no Villain counts as **empty** for Last Stand purposes. The Last Stand keyword checks `city[i] === null`, not `cityLocations[i]`. This is per the Revelations rules.

---

## Solo Mode

- "Each other player" Location triggered abilities → apply to yourself (per rules)
- No other solo-specific behavior for the Location system itself
- Individual Location effects may have solo adaptations (handled per-card in the expansion ability file)

---

## Files Modified

| File | Changes |
|---|---|
| **script.js** | Add `cityLocations[]` to `initCityArrays()`, `placeLocation()` function, routing in `processVillainCard()`, rendering in `updateGameBoard()`, fight flow additions in `showAttackButton()`/`defeatVillain()`, post-fight trigger hook |
| **styles.css** | New `.location-card`, `.location-peek`, `.city-space-layered` classes |
| **index.html** | No changes (city HTML is generated dynamically) |
| **expansionRevelations.js** | Location-granted keyword hooks (Watchtower/Dark Dimension), individual Location fight/trigger effects |
| **cardDatabase.js** | Location card entries (done in Phase 1 of /new-expansion, not this step) |

---

## What This Step Does NOT Include

- Individual Location card effects (those are Phase 3c-3f of /new-expansion)
- Location card data in cardDatabase.js (Phase 1)
- Keyword implementations (Hyperspeed, Dark Memories, Last Stand — Phase 3a)
- The `becomesLocation` tactic data entries (Phase 1)

This step builds the **infrastructure**: the array, placement, rendering, fighting, and trigger hooks. The expansion content phases fill in the specific cards and effects.

---

## Validation

1. Add a test Location card to any existing villain group temporarily
2. Verify: Location is drawn and placed above a city space
3. Verify: when a villain enters that space, two-layer rendering works
4. Verify: can fight Location independently, moves to Victory Pile
5. Verify: can fight villain in same space, Location trigger fires
6. Verify: Location overflow KOs the weakest when all spaces full
7. Remove test card after validation
