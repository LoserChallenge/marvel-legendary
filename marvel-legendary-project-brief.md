# **Project Brief: Golden Solo Mode**

## **Vision**

Add a Golden Solo game mode to the existing Legendary Solo Play web app, selectable alongside the existing What If? Solo mode on the setup screen.

## **Scope**

**In scope:**

* Unzip and set up the existing project from `Legendary-Solo-Play-main.zip`  
* Add a mode selector to the existing setup screen with two options: **What If? Solo** (current behavior, unchanged) and **Golden Solo** (new)  
* Implement Golden Solo rules as a distinct mode

**Out of scope:**

* Any changes to What If? Solo behavior  
* Two Handed mode  
* New expansion card data

## **Constraints**

* Platform: Windows, VS Code, local browser (no server needed — this is a static HTML/JS/CSS project)  
* Project folder: `D:\AI\Claude Code\marvel-legendary`  
* Source file: `Legendary-Solo-Play-main.zip` is in that folder — unzip it and work from those files  
* User is on Claude Pro (no paid API usage)

## **Golden Solo Rules to Implement**

All rules come from the Golden Solo Ruleset PDF (summarized here as implementation reference — not prescriptive):

**Setup differences:**

* Villain deck uses standard 2-player rules  
* Hero deck: remove each hero's unique high card, shuffle remaining cards, deal 10 into a small stack, add unique cards back into the large stack and shuffle, place the 10-card stack on top  
* Two play modes within Golden Solo: **Standard** (5 heroes) and **Quick Play** (3 heroes)  
* HQ is populated normally with 5 heroes at the start

**Each round (turn structure):**

1. Draw hand of 6 cards  
2. Draw 1 hero card → add to rightmost HQ slot, slide all existing cards left, leftmost card is removed from the game *(skip this step on Round 1\)*  
3. Optional: discard 1 rescued bystander from victory pile to prevent 1 villain card draw this round (max 1 per round)  
4. Draw **2** villain cards and resolve  
5. Play 6 cards per normal rules

**HQ refill rule:** When a hero is recruited or villain-triggered KO removes a card, new card goes in the **rightmost** slot and all others slide left — same rotation as above, not fill-in-place

**"Other player" rule:** Card effects targeting "each other player" are applied to the top card of the hero deck (KO it or cycle it to the bottom, depending on the effect)

**Win/Lose:**

* Win: Defeat the Mastermind 4 times  
* Lose: Scheme triggers  
* Ultimate Victory (optional): After the 4th defeat, trigger Final Showdown — player's 6-card total (recruit \+ attack combined) must equal or exceed Mastermind's strength \+ 4

**Schemes not recommended for Quick Play:**

* Super Hero Civil War  
* Secret Invasion of the Skrull Shapeshifters  
* Save Humanity

## **Problem Types Involved**

* **Mode-switching logic** — the app needs to know which ruleset is active and adjust behavior accordingly throughout a game session  
* **Turn structure changes** — draw sequence and villain card count differ from the existing mode  
* **HQ behavior change** — rotation logic replaces the current fill-in-place refill  
* **New setup flow** — hero deck construction is different; setup screen needs a Standard vs Quick Play sub-option when Golden Solo is selected

## **Relevant Claude Code Capabilities**

* Plan mode is available for exploring approach before making changes — worth using given this touches the core game loop  
* Checkpoints (auto-saved snapshots) mean mistakes are recoverable

## **Recommended Tools**

* `claude-code-setup` — run first before anything else; it will scan the project and recommend tailored automations  
* `planning-with-files` — saves plan state between sessions; useful here since this spans multiple work sessions  
* `hookify` — install early and set a hook to warn before any destructive file operations

## **Success Criteria**

* Existing What If? Solo mode plays exactly as before — no regressions  
* Golden Solo mode is selectable on the setup screen  
* Standard (5 hero) and Quick Play (3 hero) sub-options appear when Golden Solo is selected  
* HQ rotation works correctly each round  
* 2 villain cards are drawn per round in Golden Solo  
* Bystander discard option is presented each round  
* Final Showdown is triggered and resolved correctly after the 4th Mastermind defeat  
* Schemes not recommended for Quick Play are flagged or noted in the UI

## **Notes for Claude Code**

* User is a **complete beginner** — no coding background, explain everything in plain English including all terminal steps and VS Code navigation  
* User has never used a terminal independently — walk through every command step by step  
* User prefers to **approve changes before they're made**  
* Start by unzipping `Legendary-Solo-Play-main.zip` in the project folder and confirming the file structure before doing anything else  
* When creating CLAUDE.md, include an "About the User" section: complete beginner, no terminal experience, no mental model of file/folder structure, learns best by seeing the result first, will not always know what follow-up questions to ask so flag things proactively, prefers to approve before changes are made

