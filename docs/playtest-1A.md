# Playtest 1A — Earthquake / Tsunami City Resize (the on-screen check)

This is the manual playtest for the Earthquake scheme's shrinking-and-growing city.
The robot tests (Playwright) already proved the *logic* works. This one is about how
it **looks and feels** on screen — the part only your eyes can judge.

Take your time. There's nothing you can break: this is a separate practice copy of the
game, completely walled off from the real (master) version.

---

## Step 1 — Open the right copy of the game

You must open the **practice (worktree) copy**, not your normal one, or you won't see the new work.

1. In File Explorer, go to this exact folder:
   `D:\Games\Digital\Marvel Legendary\Claude Code\marvel-legendary\.worktrees\revelations\Legendary-Solo-Play-main\Legendary-Solo-Play-main\`
2. Double-click **`index.html`**. It opens in your web browser.
3. **Important — force a fresh load:** press **Ctrl + Shift + R** once the page is open.
   This throws away any old saved copy of the game's code so you're testing the newest version.
   (If you skip this, the browser can quietly show you yesterday's version and you'll wonder why nothing changed.)

---

## Step 2 — Set up a quick game (so you don't have to decide anything)

On the setup screen, make these picks. The names are just to save you choosing — anything works,
but these keep it simple:

1. **Game mode:** choose **Golden Solo**.
2. **Scheme:** choose **Earthquake Drains the Ocean**. *(This is the whole point of the test — don't change it.)*
3. **Mastermind:** **Red Skull** (or honestly any mastermind — pick whatever).
4. **Heroes:** pick **3** heroes. Easy choice: **Spider-Man, Iron Man, Captain America**.
5. **Villains:** this scheme needs **3 villain groups**. Don't agonize — pick any 3.
6. **Henchmen:** pick **1** henchman group (any).

**Shortcut if that feels fiddly:** each section has a **Randomize** button — click Randomize for
Mastermind, Villains, Henchmen, and Heroes, but leave the **scheme on Earthquake**. That fills in
valid choices automatically.

If the **Start / Begin** button is greyed out, the screen will show in **red** what still needs
fixing (usually "pick one more villain group" or "pick one fewer hero"). Adjust to match, then start.

---

## Step 3 — What you should see the MOMENT the game starts

Look at the **city** — the row of card spaces along the middle of the board.

- A **normal** game has **5** city spaces.
- This game should have **7** spaces — it's noticeably **wider** than usual.
- The **two left-most** spaces should be labelled **"Low Tide"** (instead of the usual "Bridge",
  "Streets", etc.). Read the little labels under/above the city cells — the far-left two say **Low Tide**.

✅ If you see 7 spaces with two "Low Tide" cells on the left, setup worked. That's the first win.

---

## Step 4 — Play normally until the tide comes in

Now just play the game the way you normally would — draw your cards, fight, end your turn, repeat.
You're waiting for a **Scheme Twist** to come up (these are shuffled into the villain deck).

- There are **11** twist cards in this scheme's deck, so one usually shows up within the **first
  few turns** — keep ending turns and it'll come.
- You don't need to win or play well. If you just want to reach the twist fast, keep drawing
  villain cards and ending your turn — there's no legitimate button to force it sooner; it's the
  luck of the draw, but with 11 twists in there it comes quickly.

**The exact message to watch for** in the game's message panel (the running text log of what's happening):

> **Scheme Twist #… ! The tide rushes in. Transforming to Tsunami Crushes the Coast.**

That's the moment. Read on for what should happen next.

---

## Step 5 — When it transforms (the main thing to watch)

Right after that "tide rushes in" message, you should see, in order:

1. A message: **"The coast floods — city spaces are destroyed. Villains in destroyed spaces escape!"**
2. The **scheme card picture** (off to the side) **changes** from the Earthquake art to the
   **Tsunami** art.
3. The city **shrinks to 3 active spaces** on the right (Rooftops, Bank, Sewers). The **left 4
   spaces** (the two Low Tide + Bridge + Streets) now show a **"destroyed" overlay image** sitting
   on top of them.
   - ⚠️ Heads-up so you don't think it's a bug: that destroyed overlay reuses an existing piece of
     art (it may look like a Galactus / Master Strike card image). That's a **placeholder** for
     "this space is gone" — the picture itself isn't important, just that the 4 left spaces are
     clearly marked as destroyed.
4. If any **villains** were sitting in those 4 left spaces, each one **escapes** — you'll see a
   little escape popup and messages like **"[Villain] escapes as Low Tide is destroyed!"** followed
   by **"[Villain] has escaped."** They escape from the **left first**, working rightward.

✅ Looks right if: city is now 3 real spaces + 4 destroyed, scheme art changed to Tsunami, and any
villains that were in the destroyed spaces escaped with messages.

### What happens the NEXT time a twist comes up (it flips back)

Keep playing. The **next** Scheme Twist flips it back the other way. Watch for:

> **Scheme Twist #… ! The tide rushes out. Transforming back to Earthquake Drains the Ocean.**

Then:
- Message: **"City spaces restored. Playing another card from the Villain Deck."**
- The **4 destroyed spaces become normal again** (the destroyed overlay disappears; those spaces
  are empty since their villains already escaped earlier).
- Scheme art changes **back** to Earthquake.
- One **extra villain card** is played automatically (that's part of the Tsunami rule).

It will keep flip-flopping 7 ⇄ 3 each time a twist comes up. Seeing it go both ways at least once
is the goal.

---

## Step 6 — Quick regression check (make sure normal games still work)

This proves the change didn't break ordinary setups.

1. Start a **brand-new game** (reload the page with Ctrl+Shift+R, or use the game's restart).
2. This time pick **any NORMAL scheme** — anything that is **not** Earthquake (e.g. a plain
   core-set scheme).
3. Set up and start as usual.
4. **Check the city has the normal 5 spaces** — no "Low Tide", no extra width.

✅ If a normal scheme gives you the usual 5-space city, the shared setup code is healthy.

---

## Step 7 — "Looks right" vs. "report back"

**Looks right (expected):**
- 7-space city with two "Low Tide" cells at setup for Earthquake.
- First twist: shrinks to 3 active + 4 destroyed, scheme art → Tsunami, villains in destroyed
  spaces escape.
- Second twist: restores to 7, scheme art → Earthquake, one extra villain card played.
- Normal schemes still give a 5-space city.

**Report back / screenshot if you see any of these:**
- City doesn't shrink/grow, or the number of active spaces looks wrong.
- Destroyed spaces look broken — half-drawn cells, overlapping/leftover villain pictures sitting on
  a destroyed space, blank gaps, or the layout looks mangled.
- A villain that was in a destroyed space **didn't** escape (still sitting there), or escaped twice.
- The scheme picture doesn't change when the messages say it transformed.
- Anything that just looks visually "off," janky, or confusing during the redraw.
- Any normal (non-Earthquake) game that comes up with the wrong number of city spaces.

Jot a quick note or grab a screenshot of anything odd and hand it back — that's exactly the kind of
thing this playtest is for.

---

## One rules assumption to spot-check later (low priority)

While building this, one small rules call was made: **if a Location card is sitting in a city space
that gets destroyed, that Location is sent to the KO pile.** The card text covers villains escaping
but doesn't spell out Locations (Locations are a newer Revelations addition). This is an edge case —
worth a quick glance at the Revelations rulesheet **sometime**, not urgent. If the rules say
something different, it's a one-line change.
