# /game-test Pass/Fail Assertion Contract — Design Spec

**Date:** 2026-07-03
**Status:** DESIGN — spec only, no code.
**Addresses:** `docs/automation-readiness.md` **A2** (the single true BLOCKER for the auto-gate half — "no explicit pass/fail assertion contract").
**Scope guard:** this is the **assertion contract only** — the data shape a test declares, how state is read, and how a verdict is emitted. It is NOT a whole-harness redesign, and it does NOT build the executor. It attaches to the existing `/game-test` flow and the existing Phase-4d gate.
**Reads it was built from:** `.claude/skills/game-test/SKILL.md`; `docs/automation-readiness.md` §A; `docs/playwright-runs/2026-06-15/consolidated-dual-mode-results.md` (the hand-typed results file this replaces).

---

## 1. The problem, precisely

Today a Phase-2.5 "Executable assertion" is a sentence: *"trigger Apocalyptic Magneto Escape → assert a 2nd active mastermind exists occupying a 2nd board slot."* A human reads it, drives the state, looks at the screen, and types `✅` into a table like `consolidated-dual-mode-results.md` (columns: Item | What | golden | whatif). Two fatal properties for autonomy:

1. **The verdict is a human eyeball**, not a computed comparison. Nothing links the assertion to the state that was read.
2. **The "actual" is never captured** — only the `✅`/`❌`. A wrong pass (Magik "Dimensional Portal" wired +1 Attack/Sidekick but granted +0, per A-section) is indistinguishable from a right pass after the fact, because no number was recorded.

The contract fixes exactly this: an assertion becomes a **declared triple `(probe, comparator, expected)`** evaluated against live state, and the verdict is **computed** with the actual value captured. Everything else in the harness stays.

---

## 2. The contract — data model

A test is a declarative object. No control flow in the declaration; the executor supplies the flow. All in-page fragments (`setup`, `action`, `probe`) are strings evaluated via `browser_evaluate` (the executor is deliberately unspecified — see §6 and Open Q1).

### 2a. Assertion (the atom)

```
Assertion {
  label:    string      // human name, lifted from the prose post-condition
  probe:    string      // in-page expression → a JSON-serializable value (the "actual")
  cmp:      "eq" | "neq" | "gte" | "lte" | "gt" | "lt"
                        | "includes" | "excludes" | "present" | "absent"
  expected: <value>     // omitted for present/absent
  route:    "auto" | "human"   // default "auto"; "human" = cannot be machine-judged (RNG/subjective, A6)
}
```

- **Comparators are a closed set** — deliberately small so every assertion is unambiguous. `eq/neq` deep-equal primitives + small objects; `gte/lte/gt/lt` numeric (attack/recruit deltas, counts); `includes/excludes` for arrays/strings (KO pile contains card X, onscreen-console text contains phrase); `present/absent` for DOM structural presence.
- **`probe` MUST return a JSON-serializable value** — number, string, boolean, or a small flat object/array. `browser_evaluate` serializes across the boundary; a probe returning a DOM node or a function is invalid.
- **`route: "human"`** marks an assertion the harness cannot judge (an RNG-dependent outcome, a subjective "looks right"). It is **never auto-PASS** — it forces the TestCase to `BLOCKED` and routes to a person (fail-closed; references A6, don't solve here).

### 2b. Deltas via pre-action snapshots

Most hero abilities assert a *change* ("+N Attack"). The contract captures named snapshots immediately before `action`; probes read them via a provided `snap` object.

```
snapshots: [ { name: "attackBefore", probe: "totalAttackPoints" } ]
// then an assertion:
{ label: "Dimensional Portal grants +1 Attack per Sidekick",
  probe: "totalAttackPoints - snap.attackBefore", cmp: "eq", expected: "sidekickCountAtPlay" }
```

`expected` may be a literal OR the name of another snapshot (resolved to its captured value) — so "+1 per Sidekick" is `delta eq snap.sidekickCount`, not a hard-coded number.

### 2c. TestCase (the unit)

```
TestCase {
  id:         string                  // e.g. "magik-dimensional-portal"
  card:       string                  // display name
  mode:       "golden" | "whatif" | "both"
  confidence: "HIGH" | "LOW"          // carried from the Phase-2.5 spec
  setup:      string   // state injection — via the vetted A5 path ONLY, never free-form eval
  snapshots:  [ ... ]  // captured just before action
  action:     string   // drive via the REAL play path, wrapped in the A4 timeout (see §5)
  assertions: [ ... ]
  consoleCheck: true    // A3 console-error gate, on by default (see §5)
}
```

- **`setup` and any mode switch go through the vetted injection path (A5)** — the contract *requires* it and forbids ad-hoc `window.x=` / implicit-global writes. (References A5; the helper itself is built elsewhere.)
- **`action` uses the real play path** — trusted `pointerdown` on `#begin-game`, `selectedCards=[idx]` → `confirmActions()`, or `endTurn()` — so the trailing `updateGameBoard()` runs. An isolated ability call is not a valid `action` (SKILL.md "Live UI-refresh tests must go through the real play path").
- **`mode: "both"`** = run the whole TestCase twice, injecting `gameMode` `'golden'` then `'whatif'` through the A5 path; emit a verdict per mode.

---

## 3. Evaluation — how probes read state (reuse, don't invent)

Probes reuse the read patterns already established in `game-test` SKILL.md and A-section **A8**. The contract standardizes an **approved probe vocabulary** and forbids geometry.

**State globals (read by bare reference in the evaluate — reads are safe; the binding trap in A5 only bites on writes):**
- Points: `totalAttackPoints`, `cumulativeAttackPoints`, `totalRecruitPoints`, `cumulativeRecruitPoints`
- Board arrays (read `.length` / `.map(c=>c.name)` / `.some(...)`): `hq`, `playerDiscardPile`, `playerHand`, `koPile`, `city`, `cityLocations`, active-mastermind slots
- Objects: `currentScheme`/`selectedScheme` name, `currentMastermind`, `gameMode`

**DOM structural selectors (never geometry — A8):**
- `#player-hand-element.children.length`; `.cell-label` text; `.card-container[data-city-index]`; `.popup-card`
- Popup visibility: `getComputedStyle(document.querySelector('#defeat-popup')).display` (NOT `offsetParent`)
- Player-visible events: `#onscreen-console` textContent `includes` a phrase

**Rules for probes:**
- Return a JSON-serializable value (§2a).
- Prefer a state-global read; fall back to a structural DOM read; **never** a bounding-box / `offsetParent` / geometry read (broken card art collapses layout and makes those lie — A8).
- The approved vocabulary is a **closed catalog** the executor draws from; a probe outside it is a review flag, not a silent new pattern (keeps the loop from drifting to geometry).

---

## 4. Verdict output — structured, computed, captures actual

### 4a. Result schema (per TestCase × mode)

```
TestResult {
  id, card, mode,
  verdict: "PASS" | "FAIL" | "ERROR" | "BLOCKED",
  buildFresh: boolean,             // A1 precondition result
  timedOut:  boolean,              // A4 popup/softlock timeout fired
  assertions: [
    { label, cmp, expected, actual, pass }   // <-- actual is CAPTURED, incl. on pass
  ],
  consoleCheck: { pass, unexpected: [ ...messages ] },   // A3
  error?: string                   // set when verdict === "ERROR"
}
```

### 4b. Verdict resolution — fail-closed order

Evaluated top-down; first match wins:

1. `buildFresh === false` → **BLOCKED** (whole run; A1 precondition failed — cannot trust anything).
2. `setup`/`action` threw, or any probe threw → **ERROR** (name the throwing step in `error`).
3. `timedOut === true` (A4) → **BLOCKED** (a selection popup couldn't be driven — route to human, do NOT guess a pick).
4. any assertion `route === "human"` → **BLOCKED** (RNG/subjective; A6).
5. any assertion `pass === false` OR `consoleCheck.pass === false` (A3) → **FAIL** (the failing assertion names itself with expected-vs-actual).
6. else → **PASS**.

**The only path to PASS is all-green.** Every ambiguous state (stale build, timeout, RNG, thrown probe) is BLOCKED/ERROR and routes to a human — never a silent pass. That is the whole point of A2.

**Run-level verdict:** `PASS` only if every required (TestCase × mode) is PASS. Any `FAIL` → run FAIL. Any `BLOCKED`/`ERROR` with no FAIL → run **BLOCKED** (needs a human), never PASS.

### 4c. The generated results file (replaces the hand-typed table)

The executor emits a **structured results object** (JSON) as the machine record, and renders the same human-readable table from it — so `docs/playwright-runs/<date>/<expansion>-results.md` keeps its familiar `Item | What | golden | whatif` shape, but:
- each cell is a **computed** `PASS`/`FAIL`/`BLOCKED`, not a typed `✅`;
- a FAIL cell carries `expected N, actual M` inline;
- the JSON sibling (`<expansion>-results.json`) is the durable, diffable record that A2 says is missing today.

### 4d. Worked example — decomposing one real prose row

The hand-typed row *"Korvac no-Bystander → forces discard-to-4, **no** KO popup, transforms to Revealed"* (Obs 9, current results file) becomes three atomic assertions on one TestCase:

```
assertions: [
  { label:"discard to 4",        probe:"playerHand.length",                                  cmp:"eq",     expected:4 },
  { label:"no KO popup",         probe:"getComputedStyle(document.querySelector('#ko-popup')).display", cmp:"eq", expected:"none" },
  { label:"transforms to Revealed", probe:"currentScheme.name",                               cmp:"eq",     expected:"Korvac Revealed" },
]
```

And the motivating 4d bug — Magik "Dimensional Portal" granting +0 instead of +1/Sidekick — would have read `actual: 0` against `expected: snap.sidekickCount (=N)` → **FAIL** with the number captured, instead of a human glancing at a busy board and typing `✅`.

---

## 5. Compatibility hooks (referenced, NOT built here)

The contract is *shaped to accept* these; each is designed elsewhere (see `automation-readiness.md`):

| Hook | How the contract accommodates it | Where built |
|---|---|---|
| **A1** stale-build | `buildFresh` is a **run precondition**; false → whole run BLOCKED before any assertion is trusted. | A1 fix |
| **A3** console/sw.js-404 | `consoleCheck` is a default-on implicit assertion; unexpected `console.error`/`warn` (sw.js 404 whitelisted) → FAIL. | A3 fix |
| **A4** popup/softlock | `action` is wrapped in the in-page `Promise.race` timeout; fire → TestCase BLOCKED (never FAIL, never PASS). | A4 fix (part (a) already shipped) |
| **A5** state injection | `setup` + mode switch **must** call the vetted injection API; free-form `window.x=` is contract-invalid. | A5 fix |
| **A6** RNG | `route:"human"` assertions → BLOCKED, routed to a person, never auto-PASS. | A6 carve-out |

This spec depends on none of them being *finished* — it defines the slots. If A1/A3/A4/A5 aren't ready, those checks report `BLOCKED`, which is the correct fail-closed behavior (a human still runs it), not a false pass.

---

## 6. Integration with the existing flow

### 6a. Where TestCases live — freeze with the spec

The structured TestCase(s) are authored **in the Phase-2.5 spec, as the executable form of the prose "Executable assertion" line**, and **frozen (committed) with it before Phase-3 code** — same discipline that already governs the prose. The prose becomes the assertion `label`; the triple becomes the machine form. This *upgrades* the existing "author + freeze specs before code" step (`new-expansion` SKILL.md Phase 2.5) from aspirational-"executable" to actually-executable — no new pipeline stage. (Co-located-in-spec vs sibling-file is Open Q1.)

### 6b. Dual-mode `/game-test` (Phase 4c)

A `mode:"both"` TestCase satisfies the dual-mode gate structurally: it runs and emits a verdict in each mode; PASS requires both. The mode-divergence checklist still decides *which* cards need `"both"` (unchanged); the contract just makes each mode's result a computed verdict instead of a typed cell.

### 6c. Phase-4d per-ability gate — the payoff

Phase-4d's done-criterion today: *"every new hero ability has a recorded runtime PASS (dual-mode where required); a FAIL or a missing run blocks the merge gate."* With the contract, that becomes machine-literal:

- Every new hero ability has ≥1 TestCase whose verdict is **PASS** in each required mode, recorded in the results JSON.
- **FAIL, ERROR, and BLOCKED all block the merge gate** — BLOCKED means "a human must resolve this one" (selection popup the harness can't drive, RNG assertion), which is exactly today's "needs a human" outcome, now explicit rather than a silent gap.
- A hero ability with **no TestCase** is a missing run → blocks the gate (same rule as today).

This is what lets 4d eventually run without a human reading screenshots: the verdict is computed and the actual is captured, so the only things that reach a person are the genuinely un-automatable BLOCKED cases — not every green check.

---

## 7. Open questions / needs Paul or a rules call

1. **Co-located vs sibling file (design decision, low stakes).** Do the structured TestCases live inside `docs/expansion-specs/<name>.md` as fenced blocks (keeps ONE frozen contract, best for the freeze-before-code discipline) or in a sibling `docs/expansion-specs/<name>.tests.js`/`.json` (cleaner for a machine executor to load)? Lean: **co-located fenced blocks**, so the machine assertion freezes with the prose and can't drift from it. Confirm before first use.
2. **The executor is deliberately unspecified — and that's the spec→implementation boundary.** This contract defines the *shape* (data model + verdict rules), which is runner-agnostic: it can be executed by (a) a CC operator following the structured steps by hand, (b) an in-page harness function, or (c) an external Node runner. **Choosing the executor is an implementation decision, not part of this contract** — flagging it per the task's "flag if this pushes into implementation." Recommend deciding the executor as its own next step *after* A1/A3/A4/A5 land, since the executor has to call those.
3. **Approved probe vocabulary is a starter set (§3), not exhaustive.** It covers the common reads (points, board arrays, popup display, onscreen-console text). A genuinely new card mechanic may need a new canonical probe; the process for adding one (review gate so it doesn't silently become a geometry read) needs a one-line owner. Cheap, but name it.
4. **Deep-equal scope for `eq` on objects.** `eq` on small flat objects is fine; if any assertion needs to compare a large/nested structure, that's a smell (decompose into atomic probes instead). Worth stating as a lint rule; confirm no card genuinely needs nested-object equality.
5. **No rules call is required for this contract itself** — it's pure test infrastructure. Rules decisions stay where they are (the Phase-2.5 spec's *content* — what the assertion should expect — is still authored from the inventory + rules-oracle, unchanged). The contract only defines how that expectation is checked.
