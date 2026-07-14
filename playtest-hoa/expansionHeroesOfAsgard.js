// Heroes of Asgard Expansion
// 2026-07-04
//
// Effect implementation lands in Phase 3 (built against the frozen Phase 2.5 specs).
// New card type this expansion: Villainous Weapon (see docs/expansion-mechanics/heroes-of-asgard.md).

// --- KEYWORDS & HELPERS ---
// Phase 3a: shared keyword machinery + helpers. Per-card abilities (heroes, villains,
// masterminds, schemes) build on these in Phases 3b–3f. Reuse-first per CLAUDE.md rule 9 —
// each helper cites the existing pattern it adapts (file:line drift; grep to confirm).
//
// Core-engine hooks this file DEPENDS ON (added to script.js / expansionGuardiansOfTheGalaxy.js,
// all guarded by `typeof ... === "function"` so they no-op if this file is absent):
//   - updateVillainAttackValues / updateHQVillainAttackValues: delegate to hoaVillainOwnAttackBonus()
//   - recalculateMastermindAttack: delegate to hoaMastermindOwnAttackBonus()
//   - processVillainCard: type "Villainous Weapon" -> hoaCaptureWeaponOnPlay()
//   - handlePostDefeat: release captured weapons via hoaReleaseWeaponsOnDefeat(); gainAsArtifact VP-skip
//   - handleVillainEscape: hoaTransferWeaponsOnEscape() (escaping holder -> Mastermind captures)
//   - createVillainCopy: whitelists capturedWeapons + passiveAbility (else fight copy is stripped)
//   - openArtifactsPopup: "Thrown Artifact" cards get a THROW button -> hoaThrowArtifact()

// ===== WORTHY =====
// "You are Worthy if you have a Hero that costs 5 or more" — counting hand + cards played this
// turn + controlled Hero Artifacts (NOT deck/discard; Villainous-Weapon Artifacts are cost 0 and
// classless, so they never qualify). Live predicate, recomputed on every read — never a setup flag.
// Reuse: three-zone union (expansionGuardiansOfTheGalaxy.js:2349) + cost-threshold filter (script.js:5287).
function isWorthy() {
  const heroZones = [
    ...(typeof playerHand !== "undefined" ? playerHand : []),
    ...(typeof cardsPlayedThisTurn !== "undefined" ? cardsPlayedThisTurn : []),
    ...(typeof playerArtifacts !== "undefined" ? playerArtifacts : []),
  ];
  return heroZones.some(
    (card) => card && card.type === "Hero" && (card.cost || 0) >= 5,
  );
}

// ===== CONQUEROR =====
// "[Space] Conqueror N" = +N Attack while ANY Villain occupies [Space]. Two sides:
//   - Hero-side: hoaGrantConqueror() — a conditional attack bump on play/throw (grants to BOTH the
//     current-turn total AND the Final Showdown cumulative; missing the cumulative silently breaks
//     Final Showdown — engine-gotchas). Clone of the Throg-style bump (script.js:~8400).
//   - Villain/Mastermind-side: the live attack pipeline delegates to the card's passiveAbility fn
//     (built per-card in 3c/3d) which calls hoaCityConquerorBonus(). See hoaVillainOwnAttackBonus().
// Space name -> index via citySpaceLabels.indexOf (never a hardcoded index — city-resize schemes
// shift indices; engine-gotchas Bank/Streets rule). Occupancy = city[idx] is non-null.

// Shared occupancy math — sum N for every listed space currently holding a Villain.
// spaceSpecs: [{ space: "The Bridge", n: 3 }, ...]. Used by both hero abilities and villain passives.
function hoaCityConquerorBonus(spaceSpecs) {
  if (typeof city === "undefined" || !Array.isArray(spaceSpecs)) return 0;
  let bonus = 0;
  for (const spec of spaceSpecs) {
    const idx = citySpaceLabels.indexOf(spec.space);
    if (idx >= 0 && city[idx]) bonus += spec.n || 0;
  }
  return bonus;
}

// Hero-side grant: if [spaceName] is occupied, add +n Attack this turn (both totals). Returns n granted.
function hoaGrantConqueror(spaceName, n) {
  if (typeof city === "undefined") return 0;
  const idx = citySpaceLabels.indexOf(spaceName);
  if (idx < 0 || !city[idx]) return 0;
  totalAttackPoints += n;
  cumulativeAttackPoints += n;
  onscreenConsole.log(
    `<span class="console-highlights">${spaceName}</span> Conqueror ${n}: +${n} <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> (a Villain occupies ${spaceName}).`,
  );
  updateGameBoard();
  return n;
}

// Live villain-side passive-attack contribution, summed into attackFromOwnEffects by BOTH attack
// twins (script.js). Combines (a) the card's own passive (Conqueror / not-Worthy / VP-scaling — the
// per-card passiveAbility function, built in 3c, must be PURE: read state, return a number, no side
// effects, since this runs every attack-recalc frame) and (b) captured Villainous Weapons' bonuses.
// Weapon bonus reads a STABLE `weaponAttackBonus` field (not card.attack) so a gained weapon whose
// player-facing attack is zeroed can still be re-captured (Q6) and re-add its bonus to a holder.
function hoaVillainOwnAttackBonus(villain) {
  if (!villain) return 0;
  let bonus = 0;
  if (villain.passiveAbility && typeof window[villain.passiveAbility] === "function") {
    bonus += window[villain.passiveAbility](villain) || 0;
  }
  bonus += hoaCapturedWeaponAttack(villain);
  // Thor — Royal Decree: while active this turn, every Villain worth < 5 VP gets -1 Attack. Read
  // here (a pure term) so it lands in BOTH attack twins automatically — city AND HQ Villains.
  if (royalDecreeDebuffActive && (villain.victoryPoints || 0) < 5) {
    bonus -= 1;
  }
  return bonus;
}

// ===== HEROES OF ASGARD — PER-TURN STATE =====
// HoA-local per-turn flags. Kept in this file (consistent with the Phase 3a architecture — all HoA
// state lives here; script.js gets only guarded delegating hooks). Reset each turn by
// hoaResetTurnFlags() (called from endTurn) except flyingStallionEndTurnDraw, which is self-clearing
// in hoaEndTurnExtraDraw() (consumed during endTurn's draw, AFTER the reset block runs).
let royalDecreeDebuffActive = false; // Thor — Royal Decree: -1 Attack to <5VP Villains this turn.
let usherToValhallaArmed = false; // Valkyrie — Usher: one-shot "next Villain defeat this turn" listener.
let helasCloakUsedThisTurn = false; // Hela's Cloak (gained): reactive Wound->draw, once per turn.
let flyingStallionEndTurnDraw = 0; // Valkyrie — Flying Stallion: extra cards to draw at end of turn.
// Jormungand Fight: HQ Heroes given a -1 recruit-cost discount this turn. The discount lives on the
// card object (card.infiltrateHQCostReduction — the engine's shared "costs N less this turn" field,
// read in the recruit cost calc at script.js:~19173, floored at 0). Tracked here so hoaResetTurnFlags
// can clear it wherever the card has moved. Reuses the Infiltrate-HQ field/mechanism (no new machinery).
let jormungandHQDiscountedHeroes = [];

// Count cards played this turn matching a predicate, optionally excluding one card (self).
function hoaCountPlayedThisTurn(predicate, exclude) {
  if (typeof cardsPlayedThisTurn === "undefined") return 0;
  return cardsPlayedThisTurn.filter(
    (c) => c && c !== exclude && predicate(c),
  ).length;
}

// Mastermind twin of the above (Hela's Conqueror passive + any Weapons a mastermind has captured
// via an escaping holder). Summed into mastermind.attackFromOwnEffects by recalculateMastermindAttack.
function hoaMastermindOwnAttackBonus(mastermind) {
  if (!mastermind) return 0;
  let bonus = 0;
  if (mastermind.passiveAbility && typeof window[mastermind.passiveAbility] === "function") {
    bonus += window[mastermind.passiveAbility](mastermind) || 0;
  }
  bonus += hoaCapturedWeaponAttack(mastermind);
  return bonus;
}

// Sum of the Attack bonuses of every Villainous Weapon a holder (Villain or Mastermind) controls.
function hoaCapturedWeaponAttack(holder) {
  if (!holder || !Array.isArray(holder.capturedWeapons)) return 0;
  return holder.capturedWeapons.reduce(
    (sum, w) => sum + (w ? (w.weaponAttackBonus != null ? w.weaponAttackBonus : w.attack || 0) : 0),
    0,
  );
}

// ===== ARTIFACT (reuse GotG zone) =====
// Hero Artifacts persist in `playerArtifacts` (GotG). HoA reuses that zone wholesale; the two gaps
// the mechanics doc flagged are closed as follows:
//   (b) isWorthy() reads playerArtifacts — done above (a controlled 5+ Hero Artifact makes you Worthy).
//   (a) an "it's your turn" gate on the USE button — DEFERRED as a documented minor gap: the engine
//       has no turn-phase flag (only `gameMode`), and in 1-player solo the artifact popup is only
//       user-openable during the player's own action window (automated villain/master-strike
//       sequences don't surface it), so the missing gate is not reachable in solo. Flagged, not
//       force-fixed with a fragile ad-hoc flag. Reactive cross-turn artifacts (Winged Helm, Hela's
//       Cloak) hook drawWound() directly and don't depend on this gate — built in 3b/3d.

// ===== THROWN ARTIFACT =====
// "Put this card on the bottom of your deck and use its ability." Throwable any number of times
// per turn, only on your turn (Winged Helm's cross-turn Wound reaction is handled separately via
// drawWound(), not here). Reuse: bottom-of-deck `playerDeck.unshift` (draw is `.pop()` —
// expansionRevelations.js:2054); the throw effect is the card's `unconditionalAbility` (DB convention).
// The THROW affordance is a keyword-driven branch in openArtifactsPopup (GotG file).
async function hoaThrowArtifact(card) {
  if (!card) return;
  // Per-card Worthy gate (Mjolnir/Stormbreaker set throwRequiresWorthy in the DB — wired in 3b).
  // Checked BEFORE the card leaves the zone so a blocked throw doesn't strand the card on the deck.
  if (card.throwRequiresWorthy && !isWorthy()) {
    onscreenConsole.log(
      `You cannot throw <span class="console-highlights">${card.name}</span> unless you are Worthy.`,
    );
    return;
  }
  // Remove from wherever it is held (artifact zone, else hand).
  let idx = playerArtifacts.indexOf(card);
  if (idx > -1) {
    playerArtifacts.splice(idx, 1);
  } else {
    idx = playerHand.indexOf(card);
    if (idx > -1) playerHand.splice(idx, 1);
  }
  // playedArtifact() pushes the SAME card reference into cardsPlayedThisTurn (misleadingly named
  // `secondCopy`) with markedToDestroy=true, so the end-of-turn sweep splice-skips it there while the
  // live copy lives in playerArtifacts. A thrown Artifact leaves play for the deck, so it must (a) drop
  // the markedToDestroy flag — else display/count filters (script.js:10330/19559 exclude markedToDestroy
  // cards) would wrongly skip it once redrawn — AND (b) be spliced OUT of cardsPlayedThisTurn, or the
  // end-turn sweep (script.js ~12061) no longer sees the flag and pushes it to the discard pile,
  // duplicating it (once on the deck, once in discard).
  delete card.markedToDestroy;
  if (typeof cardsPlayedThisTurn !== "undefined") {
    const playedIdx = cardsPlayedThisTurn.indexOf(card);
    if (playedIdx > -1) cardsPlayedThisTurn.splice(playedIdx, 1);
  }
  playerDeck.unshift(card); // bottom of the deck (draw pops off the end)
  playSFX("artifact");
  onscreenConsole.log(
    `You throw <span class="console-highlights">${card.name}</span>, placing it on the bottom of your deck.`,
  );
  const throwFn = card.unconditionalAbility ? window[card.unconditionalAbility] : null;
  if (typeof throwFn === "function") await throwFn(card);
  updateGameBoard();
}

// ===== VILLAINOUS WEAPON =====
// NOT a Villain. Lifecycle: play-from-deck -> captured by the Villain closest to the Villain Deck
// (rightmost occupied city index = Sewers-ward), or KO'd if the city is empty. Adds its Attack bonus
// to the holder (via hoaCapturedWeaponAttack, both twins). Holder escapes -> Mastermind captures all
// its Weapons. Holder defeated -> Weapons go to your discard pile as 0-cost, classless Artifacts (you
// get ONLY the written Artifact ability, never the printed Attack bonus). A later capture effect can
// pull a gained Weapon back onto an enemy (Q6). Reuse: bystander attach-array lifecycle + createVillainCopy
// whitelist + Infinity-Gems VP-skip converter (see mechanics-doc Villainous Weapon verdict).

// Capture-on-play: called from processVillainCard when a Villainous-Weapon card is revealed.
async function hoaCaptureWeaponOnPlay(weaponCard) {
  if (!weaponCard) return;
  // Stamp a stable bonus field once, so it survives the gain-as-Artifact zeroing (Q6 re-capture).
  if (weaponCard.weaponAttackBonus == null) {
    weaponCard.weaponAttackBonus = weaponCard.originalAttack != null ? weaponCard.originalAttack : weaponCard.attack || 0;
  }
  // Rightmost occupied city space = closest to the Villain Deck.
  let holderIndex = -1;
  for (let i = city.length - 1; i >= 0; i--) {
    if (city[i] && city[i].type === "Villain") {
      holderIndex = i;
      break;
    }
  }
  if (holderIndex === -1) {
    koPile.push(weaponCard);
    onscreenConsole.log(
      `No Villains are in the city, so <span class="console-highlights">${weaponCard.name}</span> is KO'd.`,
    );
    updateGameBoard();
    return;
  }
  const holder = city[holderIndex];
  if (!Array.isArray(holder.capturedWeapons)) holder.capturedWeapons = [];
  holder.capturedWeapons.push(weaponCard);
  onscreenConsole.log(
    `<span class="console-highlights">${holder.name}</span> captures <span class="console-highlights">${weaponCard.name}</span> (+${weaponCard.weaponAttackBonus} <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">).`,
  );
  updateGameBoard();
}

// Convert a captured Weapon into the player's controllable Artifact form: 0 cost, no class, never
// counts as Hero/Villain (so it can never make you Worthy), keeps ONLY its written Artifact ability,
// and NEVER grants the player its Attack bonus. Player-facing attack/recruit are zeroed; the stable
// weaponAttackBonus is preserved for a possible Q6 re-capture. Tagged keyword "Artifact" (+ "Thrown
// Artifact" if the weapon had it) so the existing play-from-hand flow (script.js:11705) routes it
// into the GotG artifact zone when replayed.
function hoaWeaponToArtifact(weapon) {
  if (weapon.weaponAttackBonus == null) {
    weapon.weaponAttackBonus = weapon.originalAttack != null ? weapon.originalAttack : weapon.attack || 0;
  }
  weapon.type = "Artifact";
  weapon.classes = [];
  weapon.cost = 0;
  weapon.attack = 0;
  weapon.recruit = 0;
  weapon.artifactAbilityUsed = false;
  const wasThrown = Array.isArray(weapon.keywords) && weapon.keywords.includes("Thrown Artifact");
  weapon.keywords = ["Artifact"];
  if (wasThrown) weapon.keywords.push("Thrown Artifact");
  return weapon;
}

// Gain-on-defeat: called from handlePostDefeat for a defeated holder — every captured Weapon becomes
// an Artifact in your discard pile.
function hoaReleaseWeaponsOnDefeat(villainCard) {
  if (!villainCard || !Array.isArray(villainCard.capturedWeapons) || villainCard.capturedWeapons.length === 0) return;
  for (const weapon of villainCard.capturedWeapons) {
    if (!weapon) continue;
    hoaWeaponToArtifact(weapon);
    playerDiscardPile.push(weapon);
    onscreenConsole.log(
      `You gain <span class="console-highlights">${weapon.name}</span> as an Artifact (added to your discard pile).`,
    );
  }
  villainCard.capturedWeapons.length = 0;
}

// Gain-on-Mastermind-defeat: called from handleMastermindPostDefeat. HoA rules p.2 — "When you fight a
// Villain OR MASTERMIND holding any number of Weapons, put all those Weapons into your discard pile as
// Artifacts." A Mastermind fight defeats ONE Tactic and you only win once no face-down Tactics remain,
// so this fires on the non-final fights too: the player is owed the Artifacts and the Mastermind must
// lose the Weapons' Attack bonus. Mirrors hoaReleaseWeaponsOnDefeat.
// Reads the BASE mastermind's array via hoaMastermindCapturedWeapons() — the same accessor the capture
// path (hoaTransferWeaponsOnEscape) writes through — rather than the object handed in, which may be the
// transient {...base, ...base.epic} Epic overlay that getSelectedMastermind() re-derives every render.
function hoaReleaseMastermindWeaponsOnDefeat() {
  const weapons =
    typeof hoaMastermindCapturedWeapons === "function" ? hoaMastermindCapturedWeapons() : null;
  if (!Array.isArray(weapons) || weapons.length === 0) return;
  for (const weapon of weapons) {
    if (!weapon) continue;
    hoaWeaponToArtifact(weapon);
    playerDiscardPile.push(weapon);
    onscreenConsole.log(
      `You gain <span class="console-highlights">${weapon.name}</span> as an Artifact (added to your discard pile).`,
    );
  }
  weapons.length = 0; // mutate in place so the Epic overlay's shared reference sees the clear
}

// Escape-transfer: called from handleVillainEscape — a fleeing holder's Weapons go to the Mastermind,
// which then gains their Attack bonuses (via hoaCapturedWeaponAttack in recalculateMastermindAttack).
function hoaTransferWeaponsOnEscape(escapedVillain) {
  if (!escapedVillain || !Array.isArray(escapedVillain.capturedWeapons) || escapedVillain.capturedWeapons.length === 0) return;
  // Snapshot the held-Weapon names BEFORE the transfer clears them — the escapeEffect runs AFTER this
  // (script.js: transfer ~6370 then escapeEffect ~6442), and Laufey/Surtur riders key on "if it holds
  // [weapon]." Read via hoaHeldWeaponAtEscape.
  escapedVillain.weaponsHeldAtEscape = escapedVillain.capturedWeapons.filter(Boolean).map((w) => w.name);
  const mastermind = getSelectedMastermind();
  if (!mastermind) return;
  // Attach to the BASE mastermind object (hoaMastermindCapturedWeapons) so the bonus survives Epic
  // getSelectedMastermind() re-derivation — see that helper.
  const mmWeapons = typeof hoaMastermindCapturedWeapons === "function"
    ? hoaMastermindCapturedWeapons()
    : (Array.isArray(mastermind.capturedWeapons) ? mastermind.capturedWeapons : (mastermind.capturedWeapons = []));
  for (const weapon of escapedVillain.capturedWeapons) {
    if (!weapon) continue;
    mmWeapons.push(weapon);
    onscreenConsole.log(
      `<span class="console-highlights">${mastermind.name}</span> captures <span class="console-highlights">${weapon.name}</span> as <span class="console-highlights">${escapedVillain.name}</span> escapes.`,
    );
  }
  escapedVillain.capturedWeapons.length = 0;
}

// --- SHARED HERO HELPERS ---

// Icon shorthands (match the existing onscreenConsole idiom).
const HOA_ATK_ICON = `<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">`;
const HOA_REC_ICON = `<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">`;

// "Cards you discarded from your hand this turn" — reuse Photon's proven pattern (cardsInHandThisTurn
// is seeded with the opening hand at turn start AND every draw; script.js:11506/12324). A card that
// was in hand this turn and now sits in the discard pile = a hand-discard this turn. Catches EVERY
// hand-discard (voluntary or forced) without instrumenting each discard site.
function hoaCardsDiscardedFromHandThisTurn() {
  if (typeof cardsInHandThisTurn === "undefined") return 0;
  return [...cardsInHandThisTurn].filter((c) => playerDiscardPile.includes(c)).length;
}

// Player chooses a hand card to discard, routed through the invulnerability-safe discard path
// (Cyclops etc. can bounce back). Reuse: revelationsPickOneCard for selection (expansionRevelations.js)
// + checkDiscardForInvulnerability for the discard itself (cardAbilities.js). Returns the discarded
// card, or null if nothing was actually discarded (empty hand, declined, or invulnerability rescued it).
async function hoaDiscardOneFromHand({ title, instructions, optional = false } = {}) {
  if (playerHand.length === 0) return null;
  let chosen;
  if (playerHand.length === 1 && !optional) {
    chosen = playerHand[0];
  } else {
    chosen = await revelationsPickOneCard(playerHand, {
      title,
      instructions,
      allowNoThanks: optional,
    });
  }
  if (!chosen) return null;
  const idx = playerHand.indexOf(chosen);
  if (idx !== -1) playerHand.splice(idx, 1);
  const { returned } = await checkDiscardForInvulnerability(chosen);
  if (returned && returned.length) playerHand.push(...returned);
  updateGameBoard();
  // If invulnerability bounced the card back into hand, it was NOT discarded.
  return playerHand.includes(chosen) ? null : chosen;
}

// Player may KO one card from hand OR discard pile. Reuse: revelationsPickOneCard for selection +
// koControlledHeroByIdentity (expansionSecretWarsVol1.js) which finds the card wherever it lives and
// KOs it (+ koBonuses + board update). Returns the KO'd card or null.
async function hoaKOOneFromHandOrDiscard({ title, optional = true } = {}) {
  const pool = [...playerHand, ...playerDiscardPile];
  if (pool.length === 0) {
    onscreenConsole.log(`You have no cards in your hand or discard pile to KO.`);
    return null;
  }
  const chosen = await revelationsPickOneCard(pool, {
    title,
    instructions: "You may KO a card from your hand or discard pile.",
    allowNoThanks: optional,
  });
  if (!chosen) return null;
  koControlledHeroByIdentity(chosen);
  return chosen;
}

// --- HERO CARD ABILITIES ---

// ===== THOR =====

// Test of Virtue (Common A) — SPECIAL: if you are Worthy, +2 Attack. (Base +2 Recruit from card data.)
async function thorTestOfVirtue(card) {
  if (isWorthy()) {
    totalAttackPoints += 2;
    cumulativeAttackPoints += 2;
    onscreenConsole.log(
      `You are Worthy — <span class="console-highlights">Test of Virtue</span>: +2 ${HOA_ATK_ICON}.`,
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(
      `You are not Worthy — <span class="console-highlights">Test of Virtue</span> grants no bonus ${HOA_ATK_ICON}.`,
    );
  }
}

// Divine Lightning (Common B) — SPECIAL: +1 Attack for each OTHER card played this turn that makes
// you Worthy (i.e. an other Hero costing 5+). (Base +3 Attack from card data.) Q1: count every such
// other card, not only the one that tipped you over.
async function thorDivineLightning(card) {
  const count = hoaCountPlayedThisTurn(
    (c) => c.type === "Hero" && (c.cost || 0) >= 5,
    card,
  );
  if (count > 0) {
    totalAttackPoints += count;
    cumulativeAttackPoints += count;
    onscreenConsole.log(
      `<span class="console-highlights">Divine Lightning</span>: +1 ${HOA_ATK_ICON} for each other card played this turn that makes you Worthy (${count}) = +${count} ${HOA_ATK_ICON}.`,
    );
    updateGameBoard();
  }
}

// Mjolnir (Uncommon, Thrown Artifact) — Throw (Worthy-gated by hoaThrowArtifact via throwRequiresWorthy):
// +3 Attack, then +1 per Range Hero you played this turn. Fired on THROW (not on play).
async function thorMjolnir(card) {
  const rangeCount = hoaCountPlayedThisTurn(
    (c) => c.type === "Hero" && c.classes && c.classes.includes("Range"),
    card,
  );
  const total = 3 + rangeCount;
  totalAttackPoints += total;
  cumulativeAttackPoints += total;
  onscreenConsole.log(
    `<span class="console-highlights">Mjolnir</span>: +3 ${HOA_ATK_ICON}, then +${rangeCount} for Range Heroes played this turn = +${total} ${HOA_ATK_ICON}.`,
  );
  updateGameBoard();
}

// Royal Decree (Rare) — SUPERPOWER [Heroes of Asgard]: if you are Worthy, draw a card; each Villain
// worth < 5 VP gets -1 Attack this turn. (Base +5 Attack from card data.) The -1 debuff is applied
// via royalDecreeDebuffActive, read in hoaVillainOwnAttackBonus (both attack twins → city AND HQ).
async function thorRoyalDecree(card) {
  if (isWorthy()) {
    onscreenConsole.log(
      `You are Worthy — <span class="console-highlights">Royal Decree</span>: draw a card.`,
    );
    drawCard();
  }
  royalDecreeDebuffActive = true;
  onscreenConsole.log(
    `<span class="console-highlights">Royal Decree</span>: each Villain worth less than 5 VP gets -1 ${HOA_ATK_ICON} this turn.`,
  );
  updateGameBoard();
}

// ===== BETA RAY BILL =====

// Hope of the Korbinites (Common A) — SPECIAL: to play, discard a card; then if Worthy, draw a card.
// (Base +2 Recruit from card data.) Discard is a mandatory cost ("discard if able" when hand empty).
async function betaRayBillHopeOfTheKorbinites(card) {
  await hoaDiscardOneFromHand({
    title: "HOPE OF THE KORBINITES",
    instructions: "You must discard a card.",
    optional: false,
  });
  if (isWorthy()) {
    onscreenConsole.log(
      `You are Worthy — <span class="console-highlights">Hope of the Korbinites</span>: draw a card.`,
    );
    drawCard();
    updateGameBoard();
  }
}

// Bio-Engineered Cyborg (Common B) — SPECIAL: you may discard a card; if you do, draw a card.
// (Base +3 Attack from card data.)
async function betaRayBillBioEngineeredCyborg(card) {
  const discarded = await hoaDiscardOneFromHand({
    title: "BIO-ENGINEERED CYBORG",
    instructions: "You may discard a card. If you do, draw a card.",
    optional: true,
  });
  if (discarded) {
    onscreenConsole.log(
      `<span class="console-highlights">Bio-Engineered Cyborg</span>: draw a card.`,
    );
    drawCard();
    updateGameBoard();
  }
}

// Stormbreaker (Uncommon, Thrown Artifact) — Throw (Worthy-gated): discard a card from hand, then +2
// Attack per card discarded from your hand THIS turn (including the one just discarded to throw).
async function betaRayBillStormbreaker(card) {
  await hoaDiscardOneFromHand({
    title: "STORMBREAKER",
    instructions: "To throw Stormbreaker, discard a card from your hand.",
    optional: false,
  });
  const discardedCount = hoaCardsDiscardedFromHandThisTurn();
  const bonus = 2 * discardedCount;
  totalAttackPoints += bonus;
  cumulativeAttackPoints += bonus;
  onscreenConsole.log(
    `<span class="console-highlights">Stormbreaker</span>: +2 ${HOA_ATK_ICON} per card discarded from your hand this turn (${discardedCount}) = +${bonus} ${HOA_ATK_ICON}.`,
  );
  updateGameBoard();
}

// The Warship Skuttlebutt (Rare) — SPECIAL: you may discard a card; then draw a number of cards equal
// to the cards you discarded from your hand this turn. (Base +4 Attack from card data.)
async function betaRayBillTheWarshipSkuttlebutt(card) {
  await hoaDiscardOneFromHand({
    title: "THE WARSHIP SKUTTLEBUTT",
    instructions: "You may discard a card.",
    optional: true,
  });
  const drawCount = hoaCardsDiscardedFromHandThisTurn();
  onscreenConsole.log(
    `<span class="console-highlights">The Warship Skuttlebutt</span>: cards discarded from your hand this turn: ${drawCount}. Draw that many.`,
  );
  for (let i = 0; i < drawCount; i++) drawCard();
  updateGameBoard();
}

// ===== VALKYRIE =====

// Dragonfang (Common A, Thrown Artifact) — Throw: Sewers Conqueror 2 (+2 Attack if a Villain occupies
// The Sewers). No Worthy gate.
async function valkyrieDragonfang(card) {
  hoaGrantConqueror("The Sewers", 2);
}

// Flying Stallion (Common B) — SPECIAL on play: Rooftops Conqueror 1. (Base +2 Attack from card data.)
// The reactive "discard when an Ambush is played -> draw 2 at end of turn" lives in
// hoaFlyingStallionAmbushReact (hooked into the ambush dispatch), not here.
async function valkyrieFlyingStallion(card) {
  hoaGrantConqueror("The Rooftops", 1);
}

// Usher to Valhalla (Uncommon) — SPECIAL on play: Bridge Conqueror 1. (Base +2 Attack from card data.)
async function valkyrieUsherToValhalla(card) {
  hoaGrantConqueror("The Bridge", 1);
}

// Usher to Valhalla SUPERPOWER [Heroes of Asgard]: arm a one-shot listener — the first Villain you
// defeat AFTER this resolves (this turn) lets you KO a card. Q2: arm-on-resolve, fire-on-next-defeat.
async function valkyrieUsherToValhallaSuperpower(card) {
  usherToValhallaArmed = true;
  onscreenConsole.log(
    `<span class="console-highlights">Usher to Valhalla</span>: the first time you defeat a Villain this turn, you may KO one of your cards or a card from your discard pile.`,
  );
}

// Ride of the Valkyries (Rare) — SPECIAL on play: Streets Conqueror 1. (Base +4 Attack from card data.)
async function valkyrieRideOfTheValkyries(card) {
  hoaGrantConqueror("The Streets", 1);
}

// Ride of the Valkyries SUPERPOWER [Instinct]: +1 Attack for every 4 Heroes in the KO pile (floor).
async function valkyrieRideOfTheValkyriesSuperpower(card) {
  const heroesInKO = koPile.filter((c) => c && c.type === "Hero").length;
  const bonus = Math.floor(heroesInKO / 4);
  if (bonus > 0) {
    totalAttackPoints += bonus;
    cumulativeAttackPoints += bonus;
    onscreenConsole.log(
      `<span class="console-highlights">Ride of the Valkyries</span>: +1 ${HOA_ATK_ICON} for every 4 Heroes in the KO pile (${heroesInKO}) = +${bonus} ${HOA_ATK_ICON}.`,
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(
      `<span class="console-highlights">Ride of the Valkyries</span>: fewer than 4 Heroes in the KO pile — no bonus ${HOA_ATK_ICON}.`,
    );
  }
}

// ===== LADY SIF =====

// Dimensional Blade (Common A, Thrown Artifact) — Throw: +1 Recruit and +1 Attack. No Worthy gate.
async function ladySifDimensionalBlade(card) {
  totalAttackPoints += 1;
  cumulativeAttackPoints += 1;
  totalRecruitPoints += 1;
  cumulativeRecruitPoints += 1;
  onscreenConsole.log(
    `<span class="console-highlights">Dimensional Blade</span>: +1 ${HOA_ATK_ICON} and +1 ${HOA_REC_ICON}.`,
  );
  updateGameBoard();
}

// Weapons Master (Common B) — SPECIAL: if you control any Artifacts, +2 Attack. (Base +2 Attack from
// card data.) "Any Artifacts" includes Hero Artifacts and gained Villainous-Weapon Artifacts.
async function ladySifWeaponsMaster(card) {
  if (typeof playerArtifacts !== "undefined" && playerArtifacts.length > 0) {
    totalAttackPoints += 2;
    cumulativeAttackPoints += 2;
    onscreenConsole.log(
      `You control ${playerArtifacts.length} Artifact(s) — <span class="console-highlights">Weapons Master</span>: +2 ${HOA_ATK_ICON}.`,
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(
      `You control no Artifacts — <span class="console-highlights">Weapons Master</span> grants no bonus ${HOA_ATK_ICON}.`,
    );
  }
}

// Winged Helm (Uncommon, Thrown Artifact) — Throw mode (a), your turn: +1 Attack. (Mode (b), the
// reactive Wound-prevention throw, lives in hoaWingedHelmPreventWound, hooked into drawWound().)
async function ladySifWingedHelm(card) {
  totalAttackPoints += 1;
  cumulativeAttackPoints += 1;
  onscreenConsole.log(
    `<span class="console-highlights">Winged Helm</span>: +1 ${HOA_ATK_ICON}.`,
  );
  updateGameBoard();
}

// Golden Apples of Idunn (Rare, Thrown Artifact) — Throw: +4 Attack, then you may KO a card from your
// hand or discard pile.
async function ladySifGoldenApplesOfIdunn(card) {
  totalAttackPoints += 4;
  cumulativeAttackPoints += 4;
  onscreenConsole.log(
    `<span class="console-highlights">Golden Apples of Idunn</span>: +4 ${HOA_ATK_ICON}.`,
  );
  updateGameBoard();
  await hoaKOOneFromHandOrDiscard({ title: "GOLDEN APPLES OF IDUNN", optional: true });
}

// ===== THE WARRIORS THREE =====

// Fandral the Dashing (Common A) — SPECIAL: you may move a Villain to an adjacent city space (swap if
// occupied). (Base +2 Attack from card data.) Q4: optional; player picks the Villain AND the adjacent
// space; a move toward the Bridge end does NOT force-escape. SUPERPOWER handled separately.
async function fandralTheDashing(card) {
  if (typeof city === "undefined") return;
  const villainsInCity = city.filter((c) => c && c.type === "Villain");
  if (villainsInCity.length === 0) {
    onscreenConsole.log(
      `<span class="console-highlights">Fandral the Dashing</span>: there are no Villains in the city to move.`,
    );
    return;
  }
  const chosen = await revelationsPickOneCard(villainsInCity, {
    title: "FANDRAL THE DASHING",
    instructions: "You may move a Villain to an adjacent city space. Choose a Villain (or No Thanks).",
    allowNoThanks: true,
  });
  if (!chosen) {
    onscreenConsole.log(
      `<span class="console-highlights">Fandral the Dashing</span>: you chose not to move a Villain.`,
    );
    return;
  }
  const fromIndex = city.indexOf(chosen);
  const neighbors = [];
  if (fromIndex - 1 >= 0) neighbors.push(fromIndex - 1);
  if (fromIndex + 1 < city.length) neighbors.push(fromIndex + 1);
  let destIndex;
  if (neighbors.length === 1) {
    destIndex = neighbors[0];
  } else {
    destIndex = await new Promise((resolve) => {
      const { confirmButton, denyButton } = showHeroAbilityMayPopup(
        `Move <span class="console-highlights">${chosen.name}</span> to which adjacent city space?`,
        citySpaceLabels[neighbors[0]],
        citySpaceLabels[neighbors[1]],
      );
      const t = document.querySelector(".info-or-choice-popup-title");
      if (t) t.textContent = "FANDRAL THE DASHING";
      confirmButton.onclick = () => {
        closeInfoChoicePopup();
        resolve(neighbors[0]);
      };
      denyButton.onclick = () => {
        closeInfoChoicePopup();
        resolve(neighbors[1]);
      };
    });
  }
  const occupant = city[destIndex];
  city[destIndex] = chosen;
  city[fromIndex] = occupant || null;
  if (occupant) {
    onscreenConsole.log(
      `<span class="console-highlights">Fandral the Dashing</span>: moved <span class="console-highlights">${chosen.name}</span> to ${citySpaceLabels[destIndex]}, swapping with <span class="console-highlights">${occupant.name}</span>.`,
    );
  } else {
    onscreenConsole.log(
      `<span class="console-highlights">Fandral the Dashing</span>: moved <span class="console-highlights">${chosen.name}</span> to ${citySpaceLabels[destIndex]}.`,
    );
  }
  updateGameBoard();
}

// Fandral the Dashing SUPERPOWER [Covert]: draw a card.
async function fandralTheDashingSuperpower(card) {
  onscreenConsole.log(
    `<span class="console-highlights">Fandral the Dashing</span> Superpower: draw a card.`,
  );
  drawCard();
  updateGameBoard();
}

// Hogun the Grim (Common B) — SUPERPOWER [Strength]: you may KO a card from your hand or discard pile.
// (Base +2 Recruit from card data.)
async function hogunTheGrim(card) {
  await hoaKOOneFromHandOrDiscard({ title: "HOGUN THE GRIM", optional: true });
}

// Volstagg the Valiant (Uncommon) — SPECIAL on play: Bridge Conqueror 1. (Base +3 Attack from card data.)
async function volstaggTheValiant(card) {
  hoaGrantConqueror("The Bridge", 1);
}

// Volstagg the Valiant SUPERPOWER [Instinct]: "Instead, Bridge Conqueror 3." Replacement, not additive
// — the base already granted Bridge Conqueror 1, so grant the +2 delta (total 3). Both gate on The
// Bridge being occupied, so the delta is always correct (0 when The Bridge is empty).
async function volstaggTheValiantSuperpower(card) {
  hoaGrantConqueror("The Bridge", 2);
}

// Three Stand as One (Rare) — SPECIAL: if you played >= 3 OTHER non-grey Heroes with DIFFERENT card
// names this turn, +3 Attack. (Base +4 Attack from card data.)
async function threeStandAsOne(card) {
  const names = new Set();
  for (const c of cardsPlayedThisTurn) {
    if (
      c &&
      c !== card &&
      c.type === "Hero" &&
      c.color !== "Grey" &&
      c.name !== card.name
    ) {
      names.add(c.name);
    }
  }
  if (names.size >= 3) {
    totalAttackPoints += 3;
    cumulativeAttackPoints += 3;
    onscreenConsole.log(
      `You played ${names.size} other non-grey Heroes with different names — <span class="console-highlights">Three Stand as One</span>: +3 ${HOA_ATK_ICON}.`,
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(
      `<span class="console-highlights">Three Stand as One</span>: needs 3 other differently-named non-grey Heroes (you have ${names.size}) — no bonus ${HOA_ATK_ICON}.`,
    );
  }
}

// Three Stand as One SUPERPOWER [Heroes of Asgard]: Streets Conqueror 3.
async function threeStandAsOneSuperpower(card) {
  hoaGrantConqueror("The Streets", 3);
}

// --- REACTIVE / CROSS-TURN HOOKS (called from guarded delegating hooks in script.js/cardAbilities.js) ---

// Valkyrie — Flying Stallion reactive: when an Ambush is about to resolve, if a Flying Stallion is in
// hand, offer to discard it for +2 cards at end of turn (Q3). Called from the ambush dispatch, BEFORE
// the ambush effect runs. Solo: fires on your turns only.
async function hoaFlyingStallionAmbushReact() {
  const stallion = playerHand.find((c) => c && c.name === "Valkyrie - Flying Stallion");
  if (!stallion) return;
  await new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `An Ambush is about to trigger. Discard <span class="console-highlights">Flying Stallion</span> from your hand to draw two extra cards at the end of this turn?`,
      "Discard Flying Stallion",
      "No",
    );
    const t = document.querySelector(".info-or-choice-popup-title");
    if (t) t.textContent = "FLYING STALLION";
    confirmButton.onclick = async () => {
      closeInfoChoicePopup();
      const idx = playerHand.indexOf(stallion);
      if (idx !== -1) playerHand.splice(idx, 1);
      const { returned } = await checkDiscardForInvulnerability(stallion);
      if (returned && returned.length) playerHand.push(...returned);
      flyingStallionEndTurnDraw += 2;
      onscreenConsole.log(
        `You discard <span class="console-highlights">Flying Stallion</span> — draw two extra cards at the end of this turn.`,
      );
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      resolve();
    };
  });
}

// Valkyrie — Usher to Valhalla defeat trigger: called from defeatBonuses() on every defeat. Fires only
// on the first VILLAIN defeat after the superpower armed it (not masterminds; the HoA set has no
// henchmen). One-shot: disarms on fire.
async function hoaUsherDefeatTrigger(isMastermindDefeat) {
  if (!usherToValhallaArmed || isMastermindDefeat) return;
  usherToValhallaArmed = false; // one-shot
  onscreenConsole.log(
    `<span class="console-highlights">Usher to Valhalla</span>: you defeated a Villain — you may KO one of your cards or a card from your discard pile.`,
  );
  await hoaKOOneFromHandOrDiscard({ title: "USHER TO VALHALLA", optional: true });
}

// Lady Sif — Winged Helm reactive Wound prevention: called at the TOP of drawWound(). If a Winged Helm
// is in the artifact zone, offer to throw it (to the bottom of the deck) to prevent the Wound and draw
// 2 instead (Q3). Returns true if the Wound was prevented (caller must then skip the Wound). This throw
// does NOT grant the +1 Attack of the normal throw mode.
async function hoaWingedHelmPreventWound() {
  if (typeof playerArtifacts === "undefined") return false;
  const helm = playerArtifacts.find((c) => c && c.name === "Lady Sif - Winged Helm");
  if (!helm) return false;
  return await new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `You would gain a Wound. Throw <span class="console-highlights">Winged Helm</span> to prevent it and draw two cards instead?`,
      "Throw Winged Helm",
      "Gain Wound",
    );
    const t = document.querySelector(".info-or-choice-popup-title");
    if (t) t.textContent = "WINGED HELM";
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      const idx = playerArtifacts.indexOf(helm);
      if (idx !== -1) playerArtifacts.splice(idx, 1);
      // Returns to the deck as a normal card (see hoaThrowArtifact): drop the flag AND splice the same
      // reference out of cardsPlayedThisTurn, or the end-turn sweep pushes it to discard → duplicate.
      delete helm.markedToDestroy;
      if (typeof cardsPlayedThisTurn !== "undefined") {
        const playedIdx = cardsPlayedThisTurn.indexOf(helm);
        if (playedIdx > -1) cardsPlayedThisTurn.splice(playedIdx, 1);
      }
      playerDeck.unshift(helm);
      if (typeof playSFX === "function") playSFX("artifact");
      onscreenConsole.log(
        `You throw <span class="console-highlights">Winged Helm</span> to prevent the Wound and draw two cards.`,
      );
      drawCard();
      drawCard();
      updateGameBoard();
      resolve(true);
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(false);
    };
  });
}

// End-of-turn extra-draw consumer (Flying Stallion). Returns the count to draw and self-clears. Called
// from the endTurn draw section (AFTER the reset block), so it is NOT reset by hoaResetTurnFlags.
function hoaEndTurnExtraDraw() {
  const n = flyingStallionEndTurnDraw;
  flyingStallionEndTurnDraw = 0;
  return n;
}

// Per-turn flag reset — called from the endTurn reset block. (flyingStallionEndTurnDraw is cleared in
// hoaEndTurnExtraDraw, which runs later in endTurn, so it is intentionally not reset here.)
function hoaResetTurnFlags() {
  royalDecreeDebuffActive = false;
  usherToValhallaArmed = false;
  helasCloakUsedThisTurn = false;
  // Jormungand Fight: strip the -1 recruit-cost discount from every Hero tagged this turn, wherever it
  // has since moved (HQ / deck / hand / discard). Mirrors the Infiltrate-HQ end-of-turn cleanup.
  jormungandHQDiscountedHeroes.forEach((h) => {
    if (h) delete h.infiltrateHQCostReduction;
  });
  jormungandHQDiscountedHeroes = [];
}

// Per-GAME flag reset — called from initGame's reset block (script.js), alongside the SWV1 per-turn
// flags cleared there for the same reason. hoaResetTurnFlags() only ever runs at endTurn, so a game
// that ends MID-TURN (Mastermind defeated, or Evil Wins during the villain phase) never clears these,
// and they leak into the next game started without a page reload: a stale royalDecreeDebuffActive
// silently gives every <5 VP Villain -1 Attack, a stale usherToValhallaArmed pops an unearned KO
// prompt on the first Villain defeat, and so on. Unlike hoaResetTurnFlags this ALSO zeroes
// flyingStallionEndTurnDraw — safe here (no pending draw to consume at game start), and unsafe there
// (hoaResetTurnFlags runs before the end-of-turn draw loop that consumes it).
function hoaResetGameFlags() {
  hoaResetTurnFlags();
  flyingStallionEndTurnDraw = 0;
}

// --- VILLAIN CARD EFFECTS ---

// ===== SHARED VILLAIN/WEAPON HELPERS (3c) =====

// HoA wound entry point. Every HoA effect that makes YOU gain a Wound (Mangog/Surtur escapes here;
// Hela Master Strike) calls this, NOT defaultWoundDraw() directly. Delegates to the canonical base
// drawWound(), which does prevention -> base invulnerability -> default IN ORDER: (1) HoA reactive
// prevention (Hela's Cloak / Winged Helm's Q3 throw-to-cancel) fires FIRST, exactly once; (2) the
// base-game invulnerability choice (discardWound/revealWound heroes, e.g. Colossus) is then honored.
// Calling drawWound() rather than re-offering prevention here avoids a double prevention-prompt.
// AWAITED (carry-forward #3): drawWound() opens a blocking popup, so all call sites must await it.
async function hoaGainWound() {
  if (typeof drawWound === "function") { await drawWound(); return; }
  if (typeof defaultWoundDraw === "function") await defaultWoundDraw();
}

// Find a named Villainous Weapon wherever it currently lives (a city Villain's or the Mastermind's
// capturedWeapons, your artifact zone as a gained Artifact — Q6 steal-back, or your discard pile),
// detach it, and return it (or null). Reused by Laufey's Ambush (and available for the Mastermind
// capture tactics in 3d). Search order matches the card text "any Villain, Mastermind, player's
// control, or discard pile."
function hoaDetachWeaponFromAnywhere(weaponName) {
  if (typeof city !== "undefined" && Array.isArray(city)) {
    for (const c of city) {
      if (c && Array.isArray(c.capturedWeapons)) {
        const i = c.capturedWeapons.findIndex((w) => w && w.name === weaponName);
        if (i > -1) return c.capturedWeapons.splice(i, 1)[0];
      }
    }
  }
  const mm = typeof getSelectedMastermind === "function" ? getSelectedMastermind() : null;
  if (mm && Array.isArray(mm.capturedWeapons)) {
    const i = mm.capturedWeapons.findIndex((w) => w && w.name === weaponName);
    if (i > -1) return mm.capturedWeapons.splice(i, 1)[0];
  }
  if (typeof playerArtifacts !== "undefined") {
    const i = playerArtifacts.findIndex((w) => w && w.name === weaponName);
    if (i > -1) return playerArtifacts.splice(i, 1)[0];
  }
  if (typeof playerDiscardPile !== "undefined") {
    const i = playerDiscardPile.findIndex((w) => w && w.name === weaponName);
    if (i > -1) return playerDiscardPile.splice(i, 1)[0];
  }
  return null;
}

// Restore a weapon (possibly gained as a 0-cost Artifact) back to its Villainous-Weapon form so, once
// re-captured onto an enemy, it re-adds its printed Attack bonus (Q6). weaponAttackBonus persists
// across the gain-as-Artifact zeroing (see hoaWeaponToArtifact), so it is the source of truth.
function hoaRestoreWeaponForm(weapon) {
  if (!weapon) return weapon;
  if (weapon.weaponAttackBonus == null) {
    weapon.weaponAttackBonus = weapon.originalAttack != null ? weapon.originalAttack : weapon.attack || 0;
  }
  weapon.type = "Villainous Weapon";
  weapon.attack = weapon.weaponAttackBonus;
  if (!Array.isArray(weapon.keywords)) weapon.keywords = [];
  if (!weapon.keywords.includes("Villainous Weapon")) weapon.keywords.push("Villainous Weapon");
  return weapon;
}

// Did this Villain hold a named Weapon at escape time? On escape, hoaTransferWeaponsOnEscape hands the
// Weapons to the Mastermind and CLEARS capturedWeapons BEFORE the escapeEffect runs (script.js order:
// transfer ~6370, escapeEffect ~6442) — so escape riders keyed on "if it holds [weapon]" must read the
// pre-transfer snapshot (weaponsHeldAtEscape, stamped by the transfer) as well as the (now usually
// empty) live list.
function hoaHeldWeaponAtEscape(villain, weaponName) {
  if (!villain) return false;
  if (Array.isArray(villain.weaponsHeldAtEscape) && villain.weaponsHeldAtEscape.includes(weaponName)) return true;
  if (Array.isArray(villain.capturedWeapons) && villain.capturedWeapons.some((w) => w && w.name === weaponName)) return true;
  return false;
}

// Rebuild a fresh Villain object from the villain DB by name (fresh capturedWeapons). Used by the
// Eternal Flame's reverse transform (Surtur's Crown -> Surtur). Clone matches how generateVillainDeck
// builds villains ({ ...dbCard }), so the attack pipeline reads it correctly.
function hoaBuildVillainFromDB(name) {
  const groups = typeof window !== "undefined" && Array.isArray(window.villains) ? window.villains : (typeof villains !== "undefined" ? villains : []);
  for (const g of groups) {
    const tpl = (g.cards || []).find((c) => c && c.name === name);
    if (tpl) return { ...tpl, capturedWeapons: [] };
  }
  return null;
}

// ===== DARK COUNCIL =====

// Ulik, the Troll — passive: +2 Attack while you are NOT Worthy (pure term, summed into
// attackFromOwnEffects by both attack twins; recomputes live as your Worthy state changes mid-turn).
function ulikTheTrollNotWorthyBonus(villain) {
  return isWorthy() ? 0 : 2;
}

// Ulik — Fight (on defeat): KO one of your Heroes (you pick from Heroes you control).
async function ulikTheTrollFight(villainCard) {
  await FightKOHeroYouHave(villainCard);
}

// Sindr, Fire Giant Queen — Fight (on defeat): if you are Worthy, +2 Recruit (both totals — the
// cumulative feeds Final Showdown).
async function sindrFireGiantQueenFight(villainCard) {
  if (isWorthy()) {
    totalRecruitPoints += 2;
    cumulativeRecruitPoints += 2;
    onscreenConsole.log(
      `<span class="console-highlights">Sindr</span>: you are Worthy — +2 ${HOA_REC_ICON}.`,
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(
      `<span class="console-highlights">Sindr</span>: you are not Worthy — no Recruit.`,
    );
  }
}

// The Mangog — passive: +1 Attack per Villain-type card in YOUR OWN Victory Pile (Q5 self-apply for
// "the player on your right"). Grows over the game. Pure term.
function theMangogVictoryPileScaling(villain) {
  if (typeof victoryPile === "undefined" || !Array.isArray(victoryPile)) return 0;
  return victoryPile.filter((c) => c && c.type === "Villain").length;
}

// The Mangog — Escape: each not-Worthy player (Q5 self-apply -> you, if not Worthy) gains a Wound.
async function theMangogEscape(villainCard) {
  if (!isWorthy()) {
    onscreenConsole.log(
      `<span class="console-highlights">The Mangog</span> escapes — you are not Worthy and gain a Wound.`,
    );
    await hoaGainWound();
  } else {
    onscreenConsole.log(
      `<span class="console-highlights">The Mangog</span> escapes — you are Worthy, so no Wound.`,
    );
  }
}

// Laufey, Father of Loki — Ambush: capture The Casket of Ancient Winters (misprint-corrected: the card
// prints "Eternal", the actual weapon is "Ancient") from wherever it is — a Villain/Mastermind holding
// it, your control (gained Artifact), or your discard pile — and attach it to Laufey as a +4 Weapon.
// No-op if the Casket is not in play.
async function laufeyFatherOfLokiAmbush(villainCard) {
  const weapon = hoaDetachWeaponFromAnywhere("The Casket of Ancient Winters");
  if (!weapon) {
    onscreenConsole.log(
      `<span class="console-highlights">The Casket of Ancient Winters</span> is not in play — <span class="console-highlights">Laufey</span>'s Ambush has no effect.`,
    );
    return;
  }
  hoaRestoreWeaponForm(weapon);
  if (!Array.isArray(villainCard.capturedWeapons)) villainCard.capturedWeapons = [];
  villainCard.capturedWeapons.push(weapon);
  onscreenConsole.log(
    `<span class="console-highlights">${villainCard.name}</span> captures <span class="console-highlights">${weapon.name}</span> (+${weapon.weaponAttackBonus} ${HOA_ATK_ICON}).`,
  );
  updateGameBoard();
}

// Laufey — Escape: if Laufey holds the Casket, "Fimbulwinter has come" — each player (solo -> you)
// discards down to 3 cards in hand. (Reads the pre-transfer snapshot; see hoaHeldWeaponAtEscape.)
async function laufeyFatherOfLokiEscape(villainCard) {
  if (!hoaHeldWeaponAtEscape(villainCard, "The Casket of Ancient Winters")) return;
  onscreenConsole.log(
    `<span class="console-highlights">${villainCard.name}</span> escapes holding the Casket — <span class="bold-spans">"Fimbulwinter has come."</span> Discard down to 3 cards.`,
  );
  if (typeof discardDownToN === "function") await discardDownToN(3, "FIMBULWINTER — DISCARD TO 3");
}

// The Casket of Ancient Winters — gained-Artifact ability (0 cost, classless): once per turn, if you
// are Worthy, +2 Recruit. (Once/turn gating handled by the GotG artifact USE flow.)
async function casketOfAncientWintersArtifact(card) {
  if (isWorthy()) {
    totalRecruitPoints += 2;
    cumulativeRecruitPoints += 2;
    onscreenConsole.log(
      `<span class="console-highlights">The Casket of Ancient Winters</span>: you are Worthy — +2 ${HOA_REC_ICON}.`,
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(
      `<span class="console-highlights">The Casket of Ancient Winters</span>: you are not Worthy — no Recruit this use.`,
    );
  }
}

// Jarnbjorn, First Axe of Thor — gained Thrown Artifact: when thrown, +3 Attack (both totals). The
// throw itself (move to deck bottom) is handled by hoaThrowArtifact before this fires. No Worthy gate.
async function jarnbjornFirstAxeOfThorThrow(card) {
  totalAttackPoints += 3;
  cumulativeAttackPoints += 3;
  onscreenConsole.log(
    `<span class="console-highlights">Jarnbjorn</span> is thrown: +3 ${HOA_ATK_ICON}.`,
  );
  updateGameBoard();
}

// ===== OMENS OF RAGNAROK =====

// Skurge, the Executioner — passive: Bridge Conqueror 3 (+3 while any Villain occupies The Bridge).
function skurgeTheExecutionerConqueror(villain) {
  return hoaCityConquerorBonus([{ space: "The Bridge", n: 3 }]);
}

// Skurge — Fight (on defeat): KO one of your Heroes.
async function skurgeTheExecutionerFight(villainCard) {
  await FightKOHeroYouHave(villainCard);
}

// The Fenris Wolf — passive: Streets Conqueror 2 (+2 while any Villain occupies The Streets).
function theFenrisWolfConqueror(villain) {
  return hoaCityConquerorBonus([{ space: "The Streets", n: 2 }]);
}

// The Fenris Wolf — Ambush (on entry): Fenris (already placed at the Sewers by the normal reveal) moves
// forward to The Rooftops (index 2), pushing occupants of Rooftops/Streets one step toward the Bridge,
// escaping a Villain off index 0 if the cascade reaches it — the same cascade enterCityFromRight uses.
// RULING (settled 2026-07-07, docs/rules-notes/heroes-of-asgard.md): the shift is scoped to indices
// 2→1→0 (Rooftops occupant + Villains AHEAD toward the Bridge), cascading an escape off index 0. The
// Bank(3) and Sewers(4) behind Fenris's landing spot do NOT shift. Code below matches this ruling.
async function theFenrisWolfAmbush(villainCard) {
  if (typeof city === "undefined") return;
  const rooftopsIdx = citySpaceLabels.indexOf("The Rooftops");
  if (rooftopsIdx < 0) return;
  const fenrisIdx = city.indexOf(villainCard);
  if (fenrisIdx < 0) return;
  if (fenrisIdx === rooftopsIdx) return; // already there
  city[fenrisIdx] = null; // lift Fenris out of the Sewers
  let carry = city[rooftopsIdx]; // occupant to displace (may be null)
  city[rooftopsIdx] = villainCard;
  onscreenConsole.log(
    `<span class="console-highlights">The Fenris Wolf</span> moves forward to <span class="console-highlights">The Rooftops</span>, pushing other Villains forward.`,
  );
  for (let j = rooftopsIdx - 1; j >= 0; j--) {
    if (carry === null) break;
    if (city[j] === null) {
      city[j] = carry;
      carry = null;
      break;
    }
    const temp = city[j];
    city[j] = carry;
    carry = temp;
    if (j === 0 && carry) {
      await new Promise((resolve) => {
        showPopup("Villain Escape", carry, resolve);
      });
      await handleVillainEscape(carry);
      addHRToTopWithInnerHTML();
      carry = null;
    }
  }
  updateGameBoard();
}

// Jormungand, the World-Serpent — passive: +1 Attack for EACH of the 5 city spaces currently occupied
// by a Villain (all five Conqueror terms stack; effectively +1 per occupied space, max +5).
function jormungandConqueror(villain) {
  return hoaCityConquerorBonus([
    { space: "The Sewers", n: 1 },
    { space: "The Bank", n: 1 },
    { space: "The Rooftops", n: 1 },
    { space: "The Streets", n: 1 },
    { space: "The Bridge", n: 1 },
  ]);
}

// Jormungand — Fight (on defeat): each Hero currently in the HQ costs 1 Recruit less for the rest of
// this turn (floored at 0, cleared at turn end). Reuses the engine's shared cost-discount field.
async function jormungandTheWorldSerpentFight(villainCard) {
  if (typeof hq === "undefined") return;
  let count = 0;
  for (let i = 0; i < hq.length; i++) {
    const hero = hq[i];
    if (hero) {
      hero.infiltrateHQCostReduction = (hero.infiltrateHQCostReduction || 0) + 1;
      if (!jormungandHQDiscountedHeroes.includes(hero)) jormungandHQDiscountedHeroes.push(hero);
      count++;
    }
  }
  onscreenConsole.log(
    `<span class="console-highlights">Jormungand</span>: each Hero in the HQ costs 1 Recruit less this turn${count ? "" : " (the HQ is empty)"}.`,
  );
  updateGameBoard();
}

// Surtur, Fire Giant King — Fight (on defeat): does NOT score VP (DB gainAsArtifact:true skips the
// Victory-Pile push). Instead a "Surtur's Crown" 0-cost Artifact goes to your discard pile.
async function surturFireGiantKingFight(villainCard) {
  const crown = hoaBuildSurturCrown();
  playerDiscardPile.push(crown);
  onscreenConsole.log(
    `<span class="console-highlights">Surtur</span> is defeated and becomes <span class="console-highlights">Surtur's Crown</span>, an Artifact in your discard pile.`,
  );
  updateGameBoard();
}

// Build the Surtur's Crown Artifact (transform-on-defeat form). 0 cost, classless, once/turn Sewers
// Conqueror 1. Marked surtursCrown so the Eternal Flame's reverse transform can find it. Uses Surtur's
// art (no separate Crown asset).
function hoaBuildSurturCrown() {
  const tpl = hoaBuildVillainFromDB("Surtur, Fire Giant King");
  return {
    name: "Surtur's Crown",
    type: "Artifact",
    classes: [],
    cost: 0,
    attack: 0,
    recruit: 0,
    victoryPoints: 0,
    keywords: ["Artifact"],
    unconditionalAbility: "surtursCrownArtifact",
    artifactAbilityUsed: false,
    surtursCrown: true,
    image: tpl ? tpl.image : "",
  };
}

// Surtur's Crown — gained-Artifact ability: once per turn, Sewers Conqueror 1 (+1 Attack if a Villain
// occupies The Sewers).
async function surtursCrownArtifact(card) {
  const granted = hoaGrantConqueror("The Sewers", 1);
  if (!granted) {
    onscreenConsole.log(
      `<span class="console-highlights">Surtur's Crown</span>: no Villain in The Sewers — no Attack this use.`,
    );
  }
}

// Surtur — Escape: if Surtur was holding The Eternal Flame, "Ragnarok has come" — KO every Heroes of
// Asgard Hero from the HQ, and each player (solo -> you) gains TWO Wounds. (Reads the pre-transfer
// snapshot; the Flame itself has already been handed to the Mastermind by the escape transfer.)
async function surturFireGiantKingEscape(villainCard) {
  if (!hoaHeldWeaponAtEscape(villainCard, "The Eternal Flame")) return;
  onscreenConsole.log(
    `<span class="console-highlights">Surtur</span> escapes holding The Eternal Flame — <span class="bold-spans">"Ragnarok has come!"</span>`,
  );
  if (typeof hq !== "undefined") {
    const targets = [];
    for (let i = 0; i < hq.length; i++) {
      if (hq[i] && hq[i].team === "Heroes of Asgard") targets.push(i);
    }
    for (const i of targets) {
      if (hq[i] && hq[i].team === "Heroes of Asgard" && typeof koHeroInHQ === "function") {
        onscreenConsole.log(
          `<span class="console-highlights">${hq[i].name}</span> is KO'd from the HQ.`,
        );
        koHeroInHQ(i);
      }
    }
  }
  await hoaGainWound();
  await hoaGainWound();
}

// The Eternal Flame — Ambush (on play from the Villain Deck; a Villainous Weapon with its own capture
// rule): if Surtur is in the city, he captures the Flame. Else if you control a Surtur's Crown, that
// Crown reverse-transforms into the Villain Surtur, enters the city, and captures the Flame. Otherwise
// fall back to the standard Villainous-Weapon capture (rightmost Villain, or KO if the city is empty).
async function theEternalFlameAmbush(weaponCard) {
  if (!weaponCard) return;
  if (weaponCard.weaponAttackBonus == null) {
    weaponCard.weaponAttackBonus = weaponCard.originalAttack != null ? weaponCard.originalAttack : weaponCard.attack || 0;
  }
  // (1) Surtur already in the city -> he captures the Flame.
  let surtur = typeof city !== "undefined" && Array.isArray(city)
    ? city.find((c) => c && c.name === "Surtur, Fire Giant King")
    : null;
  if (surtur) {
    if (!Array.isArray(surtur.capturedWeapons)) surtur.capturedWeapons = [];
    surtur.capturedWeapons.push(weaponCard);
    onscreenConsole.log(
      `<span class="console-highlights">Surtur</span> captures <span class="console-highlights">${weaponCard.name}</span> (+${weaponCard.weaponAttackBonus} ${HOA_ATK_ICON}).`,
    );
    updateGameBoard();
    return;
  }
  // (2) A controlled Surtur's Crown reverse-transforms into Surtur, who enters the city and captures.
  const crownIdx = typeof playerArtifacts !== "undefined"
    ? playerArtifacts.findIndex((c) => c && (c.surtursCrown === true || c.name === "Surtur's Crown"))
    : -1;
  if (crownIdx > -1) {
    playerArtifacts.splice(crownIdx, 1); // consume the Crown
    surtur = hoaBuildVillainFromDB("Surtur, Fire Giant King");
    if (surtur) {
      onscreenConsole.log(
        `<span class="console-highlights">Surtur's Crown</span> blazes back to life — <span class="console-highlights">Surtur</span> enters the city.`,
      );
      await enterCityFromRight(surtur);
      if (!Array.isArray(surtur.capturedWeapons)) surtur.capturedWeapons = [];
      surtur.capturedWeapons.push(weaponCard);
      onscreenConsole.log(
        `<span class="console-highlights">Surtur</span> captures <span class="console-highlights">${weaponCard.name}</span> (+${weaponCard.weaponAttackBonus} ${HOA_ATK_ICON}).`,
      );
      updateGameBoard();
      return;
    }
  }
  // (3) Fallback: standard Villainous-Weapon capture (rightmost occupied Villain, or KO).
  if (typeof hoaCaptureWeaponOnPlay === "function") await hoaCaptureWeaponOnPlay(weaponCard);
}

// The Eternal Flame — gained-Artifact ability: once per turn, return a 0-cost card from your discard
// pile to your hand (you choose). Reuses the shared discard->hand picker with a cost===0 filter.
async function theEternalFlameArtifact(card) {
  if (typeof takeOneFromDiscardToHand === "function") {
    await takeOneFromDiscardToHand("The Eternal Flame", (c) => (c.cost || 0) === 0);
  }
}

// The Hel-Crown — gained-Artifact ability: once per turn, Streets Conqueror 1 (+1 Attack if a Villain
// occupies The Streets).
async function theHelCrownArtifact(card) {
  const granted = hoaGrantConqueror("The Streets", 1);
  if (!granted) {
    onscreenConsole.log(
      `<span class="console-highlights">The Hel-Crown</span>: no Villain in The Streets — no Attack this use.`,
    );
  }
}

// --- SCHEME TWIST EFFECTS ---

// --- MASTERMIND EFFECTS ---
// Phase 3d. Reuse-first (CLAUDE.md rule 9): every helper below adapts a Phase-3a/3c HoA primitive or an
// existing engine pattern. Dispatch: master strikes fire as window[mastermind.masterStrike]() from
// handleMasterStrikeEffect (NO args, inside showPopup's confirm callback — so a strike that shows a popup
// MUST hop one macrotask first: engine-gotchas "Master Strike effects that show a popup"). Tactic fights
// fire as window[tactic.fightEffect]() (NO args) from resolveTacticEffects (the tactic popup is already
// closed, so tactics need no macrotask hop). Mastermind passives run through the Phase-3a
// recalculateMastermindAttack -> hoaMastermindOwnAttackBonus hook (must be PURE — no side effects).

// Tactic-weapon art (the tactic keeps its own card face when it becomes a Villainous Weapon). The popped
// tactic card is not passed to its fightEffect (engine dispatches with no args), so — exactly like the
// Revelations tactic->Location transforms (mandarinDragonOfHeavenSpaceship) — the Fight builds a FRESH
// Weapon object rather than mutating the popped card, which is left to GC. transformsToLocation (set in
// the DB) suppresses that popped card's Victory-Pile push so no VP is double-scored.
const HOA_IMG_BLACK_HAMMER = "Visual Assets/Masterminds/HeroesOfAsgard_MalekithTheAccursed_BlackhammerOfTheAccursed.webp";
const HOA_IMG_DAGGER = "Visual Assets/Masterminds/HeroesOfAsgard_MalekithTheAccursed_DaggerOfLivingAbyss.webp";
const HOA_IMG_HUNTING_HORN = "Visual Assets/Masterminds/HeroesOfAsgard_MalekithTheAccursed_TheHuntingHornOfFaerie.webp";
const HOA_IMG_HELAS_CLOAK = "Visual Assets/Masterminds/HeroesOfAsgard_HelaGoddessOfDeath_HelasCloak.webp";
const HOA_IMG_NIGHTSWORD = "Visual Assets/Masterminds/HeroesOfAsgard_HelaGoddessOfDeath_TheNightsword.webp";

// ===== SHARED MASTERMIND HELPERS =====

// Rescue up to n Bystanders (reuse cardAbilities.js rescueBystander, which handles the empty deck and all
// per-bystander bonuses/abilities). Stops early if the Bystander deck runs dry ("rescue what's there").
async function hoaRescueBystanders(n) {
  let rescued = 0;
  for (let i = 0; i < n; i++) {
    if (typeof bystanderDeck === "undefined" || bystanderDeck.length === 0) break;
    if (typeof rescueBystander === "function") {
      await rescueBystander();
      rescued++;
    }
  }
  onscreenConsole.log(
    `Rescued ${rescued} Bystander${rescued === 1 ? "" : "s"}${rescued < n ? " (no more to rescue)" : ""}.`,
  );
}

// Build a fresh Villain token (Army of the Dead; Frost Giant Invader in 3e). Mirrors a DB villain-card
// shape ({ ...dbCard }) so the attack pipeline, defeat/VP push, and city plumbing all read it correctly.
function hoaBuildVillainToken({ name, attack, victoryPoints, image, passiveAbility, team }) {
  return {
    name,
    type: "Villain",
    classes: [],
    attack,
    originalAttack: attack,
    victoryPoints,
    ambushEffect: "None",
    fightEffect: "None",
    escapeEffect: "None",
    passiveAbility: passiveAbility || undefined,
    fightCondition: "None",
    conditionType: "None",
    condition: "None",
    alwaysLeads: "false",
    keywords: passiveAbility ? ["Conqueror"] : [],
    capturedWeapons: [],
    team: team || "",
    image: image || "",
    hoaToken: true,
  };
}

// Build a fresh Villainous-Weapon object (Darkspear; the tactic weapons). Same field convention as the DB
// Villainous Weapons (weaponAttackBonus is the stable capture bonus; thrown adds the Thrown-Artifact
// keyword so the gained form throws). artifactAbility is the gained-Artifact ability (fires via the GotG
// USE button, or on THROW for thrown weapons).
function hoaBuildWeaponToken({ name, bonus, image, artifactAbility, thrown }) {
  return {
    name,
    type: "Villainous Weapon",
    classes: [],
    attack: bonus,
    originalAttack: bonus,
    weaponAttackBonus: bonus,
    victoryPoints: 0,
    ambushEffect: "None",
    fightEffect: "None",
    escapeEffect: "None",
    unconditionalAbility: artifactAbility || undefined,
    keywords: thrown ? ["Villainous Weapon", "Thrown Artifact"] : ["Villainous Weapon"],
    image: image || "",
    hoaToken: true,
  };
}

// Return the Mastermind's capturedWeapons array, ALWAYS attached to the BASE mastermind DB object (never
// the transient {...base,...epic} overlay). getSelectedMastermind() re-derives a fresh overlay object on
// every render for Epic masterminds, so a capturedWeapons array assigned onto that transient object is
// lost next render (its bonus vanishes). The base object is a stable reference the overlay's shallow
// spread shares by reference, so weapons pushed here survive re-derivation for Epic and Normal alike.
function hoaMastermindCapturedWeapons() {
  let base = null;
  const radio =
    typeof document !== "undefined"
      ? document.querySelector("#mastermind-section input[type=radio]:checked")
      : null;
  if (radio && typeof masterminds !== "undefined") {
    base = masterminds.find((m) => m && m.name === radio.value) || null;
  }
  const target = base || getSelectedMastermind();
  if (!target) return [];
  if (!Array.isArray(target.capturedWeapons)) target.capturedWeapons = [];
  return target.capturedWeapons;
}

// Capture a Weapon onto the closest-to-the-Villain-Deck city Villain (rightmost occupied), else — with no
// city Villain — the Mastermind holds it (Darkspear's placement recommendation; contrast
// hoaCaptureWeaponOnPlay, which KOs a Weapon when the city is empty).
async function hoaCaptureWeaponRightmostElseMastermind(weapon) {
  if (!weapon) return;
  if (weapon.weaponAttackBonus == null) {
    weapon.weaponAttackBonus = weapon.originalAttack != null ? weapon.originalAttack : weapon.attack || 0;
  }
  let holder = null;
  if (typeof city !== "undefined" && Array.isArray(city)) {
    for (let i = city.length - 1; i >= 0; i--) {
      if (city[i] && city[i].type === "Villain") {
        holder = city[i];
        break;
      }
    }
  }
  if (!holder) {
    const mm = getSelectedMastermind();
    onscreenConsole.log(
      `No Villains are in the city, so <span class="console-highlights">${mm.name}</span> holds <span class="console-highlights">${weapon.name}</span> (+${weapon.weaponAttackBonus} ${HOA_ATK_ICON}).`,
    );
    hoaMastermindCapturedWeapons().push(weapon); // base object (survives Epic re-derivation)
  } else {
    onscreenConsole.log(
      `<span class="console-highlights">${holder.name}</span> captures <span class="console-highlights">${weapon.name}</span> (+${weapon.weaponAttackBonus} ${HOA_ATK_ICON}).`,
    );
    if (!Array.isArray(holder.capturedWeapons)) holder.capturedWeapons = [];
    holder.capturedWeapons.push(weapon);
  }
  updateGameBoard();
}

// Detach a Weapon (by object identity) from wherever it currently lives — a city Villain's or the
// Mastermind's capturedWeapons, your artifact zone (gained), or your discard pile (gained). Reference-
// based (not name) because multiple same-named tokens (e.g. two Darkspears) can coexist.
function hoaDetachWeaponByReference(weapon) {
  if (!weapon) return null;
  if (typeof city !== "undefined" && Array.isArray(city)) {
    for (const c of city) {
      if (c && Array.isArray(c.capturedWeapons)) {
        const i = c.capturedWeapons.indexOf(weapon);
        if (i > -1) return c.capturedWeapons.splice(i, 1)[0];
      }
    }
  }
  const mm = typeof getSelectedMastermind === "function" ? getSelectedMastermind() : null;
  if (mm && Array.isArray(mm.capturedWeapons)) {
    const i = mm.capturedWeapons.indexOf(weapon);
    if (i > -1) return mm.capturedWeapons.splice(i, 1)[0];
  }
  if (typeof playerArtifacts !== "undefined") {
    const i = playerArtifacts.indexOf(weapon);
    if (i > -1) return playerArtifacts.splice(i, 1)[0];
  }
  if (typeof playerDiscardPile !== "undefined") {
    const i = playerDiscardPile.indexOf(weapon);
    if (i > -1) return playerDiscardPile.splice(i, 1)[0];
  }
  return null;
}

// Gather Villainous Weapons capturable from the given zones ("city" = any city Villain's captured Weapons;
// "control" = gained Weapon-Artifacts in your artifact zone; "discard" = gained Weapon-Artifacts in your
// discard pile). A gained Weapon is identifiable by its stable weaponAttackBonus (normal Hero Artifacts
// lack it). The capturing Mastermind's own Weapons are never a source.
function hoaGatherCapturableWeapons(zones) {
  const out = [];
  if (zones.includes("city") && typeof city !== "undefined" && Array.isArray(city)) {
    for (const c of city) {
      if (c && Array.isArray(c.capturedWeapons)) {
        for (const w of c.capturedWeapons) if (w) out.push(w);
      }
    }
  }
  if (zones.includes("control") && typeof playerArtifacts !== "undefined") {
    for (const a of playerArtifacts) if (a && a.weaponAttackBonus != null) out.push(a);
  }
  if (zones.includes("discard") && typeof playerDiscardPile !== "undefined") {
    for (const d of playerDiscardPile) if (d && d.weaponAttackBonus != null) out.push(d);
  }
  return out;
}

// The Mastermind captures one Villainous Weapon from the given zones (Malekith Master Strikes + tactics,
// Q6 targeting). Auto-captures if there's exactly one; prompts a choice if 2+; no-ops if none. The
// captured Weapon is restored to Weapon form and attached to the Mastermind (its bonus flows in via
// hoaMastermindOwnAttackBonus).
async function hoaMastermindCaptureWeapon(zones, title) {
  const mm = getSelectedMastermind();
  if (!mm) return null;
  const candidates = hoaGatherCapturableWeapons(zones);
  if (candidates.length === 0) {
    onscreenConsole.log(
      `<span class="console-highlights">${mm.name}</span> finds no Villainous Weapon to capture.`,
    );
    return null;
  }
  let chosen;
  if (candidates.length === 1) {
    chosen = candidates[0];
  } else {
    chosen = await revelationsPickOneCard(candidates, {
      title,
      instructions: `<span class="console-highlights">${mm.name}</span> captures a Villainous Weapon.`,
      allowNoThanks: false,
    });
    if (!chosen) chosen = candidates[0]; // capture is mandatory ("captures a")
  }
  const weapon = hoaDetachWeaponByReference(chosen);
  if (!weapon) return null;
  hoaRestoreWeaponForm(weapon);
  hoaMastermindCapturedWeapons().push(weapon); // base object (survives Epic re-derivation)
  onscreenConsole.log(
    `<span class="console-highlights">${mm.name}</span> captures <span class="console-highlights">${weapon.name}</span> (+${weapon.weaponAttackBonus} ${HOA_ATK_ICON}).`,
  );
  updateGameBoard();
  return weapon;
}

// Specific-space placement glue (Q7; Seize Bifrost + Naglfar). A chosen/revealed Villain enters The Bridge
// (index 0) if empty, else The Streets (index 1) if empty; if BOTH are occupied it does NOT enter (returns
// false — the caller decides where the card goes instead). Direct city[] placement (no Sewers entry, no
// ambush). removeFromVictoryPile is checked only AFTER a target is confirmed, so a "both full" outcome
// leaves the card untouched in the Victory Pile (Naglfar edge).
async function hoaPlaceInBridgeOrStreets(card, { removeFromVictoryPile = false } = {}) {
  if (!card || typeof city === "undefined") return false;
  const bridgeIdx = citySpaceLabels.indexOf("The Bridge");
  const streetsIdx = citySpaceLabels.indexOf("The Streets");
  let target = -1;
  if (bridgeIdx >= 0 && !city[bridgeIdx]) target = bridgeIdx;
  else if (streetsIdx >= 0 && !city[streetsIdx]) target = streetsIdx;
  if (target === -1) {
    onscreenConsole.log(
      `Both The Bridge and The Streets are occupied — <span class="console-highlights">${card.name}</span> does not enter.`,
    );
    return false;
  }
  if (removeFromVictoryPile && typeof victoryPile !== "undefined") {
    const i = victoryPile.indexOf(card);
    if (i > -1) victoryPile.splice(i, 1);
  }
  city[target] = card;
  onscreenConsole.log(
    `<span class="console-highlights">${card.name}</span> enters <span class="console-highlights">${citySpaceLabels[target]}</span>.`,
  );
  updateGameBoard();
  return true;
}

// ===== WOUND-PREVENTION REACTIVES (Hela's Cloak + Lady Sif's Winged Helm) =====

// Hela's Cloak — reactive gained-Artifact ability: once per turn, when you would gain a Wound, you may
// draw a card INSTEAD. Detected by scanning the artifact zone by name (like Winged Helm), NOT via a USE
// button. Gated once/turn by helasCloakUsedThisTurn (reset in hoaResetTurnFlags).
async function helasCloakPreventWound() {
  if (typeof playerArtifacts === "undefined") return false;
  if (helasCloakUsedThisTurn) return false;
  const cloak = playerArtifacts.find((c) => c && c.name === "Hela's Cloak");
  if (!cloak) return false;
  return await new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `You would gain a Wound. Use <span class="console-highlights">Hela's Cloak</span> to draw a card instead? (Once per turn.)`,
      "Draw a card",
      "Gain Wound",
    );
    const t = document.querySelector(".info-or-choice-popup-title");
    if (t) t.textContent = "HELA'S CLOAK";
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      helasCloakUsedThisTurn = true;
      onscreenConsole.log(
        `You use <span class="console-highlights">Hela's Cloak</span> — draw a card instead of gaining a Wound.`,
      );
      drawCard();
      updateGameBoard();
      resolve(true);
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(false);
    };
  });
}

// Combined reactive Wound-prevention offer (the single hook drawWound() and hoaGainWound() both call).
// DECISION (Winged Helm + Hela's Cloak both controlled at one Wound): offer them IN SEQUENCE and stop as
// soon as one prevents the Wound — Cloak first (cheaper: keeps the card, once/turn, draw 1), then Winged
// Helm (throw the card to the deck, draw 2). Declining the first still offers the second, so both are
// always reachable and AT MOST ONE fires per Wound (no silent double-prevent, no silent non-fire). If the
// Cloak was already used this turn it self-skips (no prompt) and only the Helm is offered.
async function hoaOfferWoundPrevention() {
  if (typeof helasCloakPreventWound === "function") {
    if (await helasCloakPreventWound()) return true;
  }
  if (typeof hoaWingedHelmPreventWound === "function") {
    if (await hoaWingedHelmPreventWound()) return true;
  }
  return false;
}

// ===== MALEKITH THE ACCURSED (leads Dark Council) =====

// Darkspear — the Master Strike's generated Villainous Weapon (+2 normal / +3 Epic capture bonus; its
// gained Thrown-Artifact form always throws for +2). Uses Malekith's card face.
function hoaBuildDarkspear(captureBonus) {
  const mm = getSelectedMastermind();
  return hoaBuildWeaponToken({
    name: "Darkspear",
    bonus: captureBonus,
    image: mm ? mm.image : "",
    artifactAbility: "hoaDarkspearThrow",
    thrown: true,
  });
}

// Darkspear — gained Thrown-Artifact ability: throw for +2 Attack (both totals). Deck-bottom placement +
// logging are handled by hoaThrowArtifact; this only grants the bonus.
async function hoaDarkspearThrow(card) {
  totalAttackPoints += 2;
  cumulativeAttackPoints += 2;
  onscreenConsole.log(`<span class="console-highlights">Darkspear</span> thrown: +2 ${HOA_ATK_ICON}.`);
  updateGameBoard();
}

// Malekith — Master Strike (Normal): capture a Villainous Weapon (city / your control / discard), then a
// Darkspear (+2) Weapon enters the city (rightmost Villain, else Malekith holds it).
async function malekithTheAccursedStrike() {
  await new Promise((r) => setTimeout(r, 0)); // hop past the Master Strike popup's own close
  await hoaMastermindCaptureWeapon(["city", "control", "discard"], "MALEKITH — CAPTURE A WEAPON");
  onscreenConsole.log(
    `A <span class="console-highlights">Darkspear</span> enters the city as a Villainous Weapon (+2 ${HOA_ATK_ICON}).`,
  );
  await hoaCaptureWeaponRightmostElseMastermind(hoaBuildDarkspear(2));
}

// Malekith — Master Strike (Epic): capture one Weapon from the city, then one from your control/discard,
// then a Darkspear (+3) enters the city.
async function epicMalekithTheAccursedStrike() {
  await new Promise((r) => setTimeout(r, 0));
  await hoaMastermindCaptureWeapon(["city"], "EPIC MALEKITH — CAPTURE A CITY WEAPON");
  await hoaMastermindCaptureWeapon(["control", "discard"], "EPIC MALEKITH — CAPTURE A CONTROLLED WEAPON");
  onscreenConsole.log(
    `A <span class="console-highlights">Darkspear</span> enters the city as a Villainous Weapon (+3 ${HOA_ATK_ICON}).`,
  );
  await hoaCaptureWeaponRightmostElseMastermind(hoaBuildDarkspear(3));
}

// Shared body for Malekith's three transforming tactics: rescue 4, Malekith captures a Weapon, then this
// tactic enters the city as a Villainous Weapon (standard capture — rightmost Villain, or KO if the city
// is empty). The popped tactic card's VP push was suppressed by its DB transformsToLocation flag.
async function hoaMalekithTacticTransform({ name, bonus, image, artifactAbility }) {
  await hoaRescueBystanders(4);
  await hoaMastermindCaptureWeapon(["city", "control", "discard"], "MALEKITH — CAPTURE A WEAPON");
  const weapon = hoaBuildWeaponToken({ name, bonus, image, artifactAbility });
  onscreenConsole.log(
    `<span class="console-highlights">${name}</span> enters the city as a Villainous Weapon (+${bonus} ${HOA_ATK_ICON}).`,
  );
  await hoaCaptureWeaponOnPlay(weapon);
}

async function blackHammerOfTheAccursedFight() {
  await hoaMalekithTacticTransform({
    name: "Black Hammer of the Accursed",
    bonus: 4,
    image: HOA_IMG_BLACK_HAMMER,
    artifactAbility: "hoaBlackHammerArtifact",
  });
}

async function daggerOfLivingAbyssFight() {
  await hoaMalekithTacticTransform({
    name: "Dagger of Living Abyss",
    bonus: 2,
    image: HOA_IMG_DAGGER,
    artifactAbility: "hoaDaggerArtifact",
  });
}

async function theHuntingHornOfFaerieFight() {
  await hoaMalekithTacticTransform({
    name: "The Hunting Horn of Faerie",
    bonus: 3,
    image: HOA_IMG_HUNTING_HORN,
    artifactAbility: "hoaHuntingHornArtifact",
  });
}

// Black Hammer — gained-Artifact ability: once per turn, you may KO a Hero from your discard pile.
async function hoaBlackHammerArtifact(card) {
  const heroes = playerDiscardPile.filter((c) => c && c.type === "Hero");
  if (heroes.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Black Hammer</span>: no Hero in your discard pile to KO.`);
    return;
  }
  const chosen = await revelationsPickOneCard(heroes, {
    title: "BLACK HAMMER OF THE ACCURSED",
    instructions: "You may KO a Hero from your discard pile.",
    allowNoThanks: true,
  });
  if (!chosen) return;
  koControlledHeroByIdentity(chosen);
}

// Dagger — gained-Artifact ability: once per turn, you may free-defeat a Villain worth 2 VP or less (its
// Fight effect still fires; no Attack spent). Reuse the SWV1 free-defeat machinery.
async function hoaDaggerArtifact(card) {
  const defeated = await freeDefeatVillainFromCityOrHQ(
    (v) => (v.victoryPoints || 0) <= 2,
    "DAGGER OF LIVING ABYSS",
    "You may free-defeat a Villain worth 2 VP or less (its Fight effect still fires).",
  );
  if (!defeated) {
    onscreenConsole.log(`<span class="console-highlights">Dagger of Living Abyss</span>: no Villain worth 2 VP or less to defeat.`);
  }
}

// Hunting Horn — gained-Artifact ability: once per turn, draw a card.
async function hoaHuntingHornArtifact(card) {
  drawCard();
  onscreenConsole.log(`<span class="console-highlights">The Hunting Horn of Faerie</span>: draw a card.`);
  updateGameBoard();
}

// Vulnerable to Cold Iron (no transform) — Fight: +2 Recruit for each Tech Hero you have (hand + played
// this turn + Hero Artifacts). Recruit to both totals (cumulative feeds Final Showdown).
async function vulnerableToColdIronFight() {
  const heroZones = [
    ...(typeof playerHand !== "undefined" ? playerHand : []),
    ...(typeof cardsPlayedThisTurn !== "undefined" ? cardsPlayedThisTurn : []),
    ...(typeof playerArtifacts !== "undefined" ? playerArtifacts : []),
  ];
  const techCount = heroZones.filter(
    (c) => c && c.type === "Hero" && Array.isArray(c.classes) && c.classes.includes("Tech"),
  ).length;
  if (techCount > 0) {
    totalRecruitPoints += 2 * techCount;
    cumulativeRecruitPoints += 2 * techCount;
    onscreenConsole.log(
      `<span class="console-highlights">Vulnerable to Cold Iron</span>: +${2 * techCount} ${HOA_REC_ICON} (${techCount} Tech Hero${techCount === 1 ? "" : "s"}).`,
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(`<span class="console-highlights">Vulnerable to Cold Iron</span>: you have no Tech Heroes — no Recruit.`);
  }
}

// ===== HELA, GODDESS OF DEATH (leads Omens of Ragnarok) =====

// Hela — passive (Conqueror): +5 Attack per occupied Bridge/Streets (Normal); +6 per occupied
// Bridge/Streets/Rooftops (Epic — inherited passiveAbility on the {...base, ...base.epic} overlay, so it
// branches on the overlay name). PURE: read state, return a number.
function helaGoddessOfDeathConqueror(mastermind) {
  const isEpic = mastermind && typeof mastermind.name === "string" && mastermind.name.indexOf("Epic") === 0;
  if (isEpic) {
    return hoaCityConquerorBonus([
      { space: "The Bridge", n: 6 },
      { space: "The Streets", n: 6 },
      { space: "The Rooftops", n: 6 },
    ]);
  }
  return hoaCityConquerorBonus([
    { space: "The Bridge", n: 5 },
    { space: "The Streets", n: 5 },
  ]);
}

// Shared Hela Master Strike body (Normal 5/3VP, return ≥3VP; Epic 6/4VP, return ≥4VP). Spawn an Army of
// the Dead Villain token into the city; then return a ≥threshold-VP Villain from YOUR Victory Pile
// (including a defeated Army of the Dead) to the city; if you have none, gain a Wound (solo self-apply).
// MODE-DIVERGENT (each-player Wound + player-count scaling) — tested in both Golden and What If?.
async function hoaHelaMasterStrike(armyAttack, armyVP, returnThreshold) {
  await new Promise((r) => setTimeout(r, 0)); // hop past the Master Strike popup's own close
  const mm = getSelectedMastermind();
  const army = hoaBuildVillainToken({
    name: "Army of the Dead",
    attack: armyAttack,
    victoryPoints: armyVP,
    image: mm ? mm.masterStrikeImage || mm.image : "",
    team: "Omens of Ragnarok",
  });
  onscreenConsole.log(
    `An <span class="console-highlights">Army of the Dead</span> (${armyAttack} ${HOA_ATK_ICON}, ${armyVP} VP) rises into the city.`,
  );
  await enterCityFromRight(army);
  const eligible =
    typeof victoryPile !== "undefined"
      ? victoryPile.filter((c) => c && c.type === "Villain" && (c.victoryPoints || 0) >= returnThreshold)
      : [];
  if (eligible.length > 0) {
    let chosen;
    if (eligible.length === 1) {
      chosen = eligible[0];
    } else {
      chosen = await revelationsPickOneCard(eligible, {
        title: "HELA — RETURN A VILLAIN",
        instructions: `Choose a Villain worth ${returnThreshold}+ VP from your Victory Pile to enter the city.`,
        allowNoThanks: false,
      });
      if (!chosen) chosen = eligible[0];
    }
    const idx = victoryPile.indexOf(chosen);
    if (idx > -1) victoryPile.splice(idx, 1);
    onscreenConsole.log(
      `<span class="console-highlights">${chosen.name}</span> returns from your Victory Pile to the city.`,
    );
    await enterCityFromRight(chosen);
  } else {
    onscreenConsole.log(
      `You have no Villain worth ${returnThreshold}+ VP in your Victory Pile — you gain a Wound.`,
    );
    await hoaGainWound();
  }
  updateGameBoard();
}

async function helaGoddessOfDeathStrike() {
  await hoaHelaMasterStrike(5, 3, 3);
}

async function epicHelaGoddessOfDeathStrike() {
  await hoaHelaMasterStrike(6, 4, 4);
}

// Hela's Cloak — Fight: rescue 4, then Hela captures this card as a Villainous Weapon (+2) — it attaches
// to HELA (does NOT enter the city, unlike Malekith's tactics). Gained form is the reactive Wound->draw
// (helasCloakPreventWound), so no USE/throw ability.
async function helasCloakFight() {
  await hoaRescueBystanders(4);
  const mm = getSelectedMastermind();
  const weapon = hoaBuildWeaponToken({ name: "Hela's Cloak", bonus: 2, image: HOA_IMG_HELAS_CLOAK });
  hoaMastermindCapturedWeapons().push(weapon); // base object (survives Epic re-derivation)
  onscreenConsole.log(
    `<span class="console-highlights">${mm.name}</span> captures <span class="console-highlights">Hela's Cloak</span> as a Villainous Weapon (+2 ${HOA_ATK_ICON}).`,
  );
  updateGameBoard();
}

// The Nightsword — Fight: rescue 4, then Hela captures this as a Villainous Weapon (+3, attaches to HELA).
// Gained form is a Thrown Artifact (throw -> Bridge Conqueror 3).
async function theNightswordFight() {
  await hoaRescueBystanders(4);
  const mm = getSelectedMastermind();
  const weapon = hoaBuildWeaponToken({
    name: "The Nightsword",
    bonus: 3,
    image: HOA_IMG_NIGHTSWORD,
    artifactAbility: "hoaNightswordThrow",
    thrown: true,
  });
  hoaMastermindCapturedWeapons().push(weapon); // base object (survives Epic re-derivation)
  onscreenConsole.log(
    `<span class="console-highlights">${mm.name}</span> captures <span class="console-highlights">The Nightsword</span> as a Villainous Weapon (+3 ${HOA_ATK_ICON}).`,
  );
  updateGameBoard();
}

// The Nightsword — gained Thrown-Artifact ability: throw -> Bridge Conqueror 3 (+3 Attack if a Villain
// occupies The Bridge). Deck-bottom + logging handled by hoaThrowArtifact.
async function hoaNightswordThrow(card) {
  const granted = hoaGrantConqueror("The Bridge", 3);
  if (!granted) {
    onscreenConsole.log(`<span class="console-highlights">The Nightsword</span>: no Villain in The Bridge — no Attack this throw.`);
  }
}

// Seize Bifrost — Fight: reveal the top card of the Villain Deck. If it's a Villain, it enters The Bridge
// (else The Streets) if empty; if both are full it goes to the bottom of the Villain Deck (Q7). A non-
// Villain reveal stays on top of the deck (drawn normally next Villain phase).
async function seizeBifrostTheRainbowBridgeFight() {
  if (typeof villainDeck === "undefined" || villainDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Seize Bifrost</span>: the Villain Deck is empty.`);
    return;
  }
  const top = villainDeck[villainDeck.length - 1]; // top = last (draw is .pop())
  onscreenConsole.log(
    `<span class="console-highlights">Seize Bifrost</span>: the top of the Villain Deck is <span class="console-highlights">${top.name}</span>.`,
  );
  if (!top || top.type !== "Villain") {
    onscreenConsole.log(`It is not a Villain — it stays on top of the Villain Deck.`);
    return;
  }
  villainDeck.pop(); // remove from the deck
  const placed = await hoaPlaceInBridgeOrStreets(top);
  if (!placed) {
    villainDeck.unshift(top); // both spaces full — to the bottom of the Villain Deck (Q7)
    onscreenConsole.log(
      `<span class="console-highlights">${top.name}</span> goes to the bottom of the Villain Deck.`,
    );
    updateGameBoard();
  }
}

// Naglfar — Fight: reveal YOUR highest-VP Villain from YOUR Victory Pile (Q5 self-apply of "the player on
// your right"); it enters The Bridge (else The Streets) if empty. If both are full, it stays in your
// Victory Pile. If your Victory Pile holds no Villain, no effect.
async function naglfarLongshipOfFingernailsFight() {
  const villainsInVP =
    typeof victoryPile !== "undefined"
      ? victoryPile.filter((c) => c && c.type === "Villain")
      : [];
  if (villainsInVP.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Naglfar</span>: you have no Villain in your Victory Pile.`);
    return;
  }
  let best = villainsInVP[0];
  for (const v of villainsInVP) {
    if ((v.victoryPoints || 0) > (best.victoryPoints || 0)) best = v;
  }
  onscreenConsole.log(
    `<span class="console-highlights">Naglfar</span>: your highest-VP Villain is <span class="console-highlights">${best.name}</span> (${best.victoryPoints || 0} VP).`,
  );
  await hoaPlaceInBridgeOrStreets(best, { removeFromVictoryPile: true });
}

// ============================================================================
// HEROES OF ASGARD — SCHEMES (Phase 3e)
// Each scheme = a custom Twist handler (top-level fn dispatched via
// window[scheme.twistEffect]() from handleSchemeTwist, script.js) + an Evil-Wins
// case in the endGameConditions switch (script.js) + a twin case in
// updateEvilWinsTracker() for the live N/5 on-screen counter.
// Counters that CAN'T be derived from live board state (Moral Failings, Guardians
// Defeated) are per-game globals below; the rest are derived (Eternal Darkness from
// the flag arrays, Frost Giant Invaders from city+escape). All per-game state is
// reset by hoaResetSchemeState(), called from initCityArrays() at game setup.
// ============================================================================

// --- Per-game scheme state (reset at setup by hoaResetSchemeState) ---
let hoaMoralFailings = 0; // Asgardian Test of Worth — Evil Wins at 5.
let hoaGuardiansDefeated = 0; // Ragnarok, Twilight of the Gods — Evil Wins at 5.
let hoaCityDarkness = []; // Svartalfheim — per-city-space Eternal Darkness flags (reuses the destroyedSpaces model).
let hoaHQDarkness = []; // Svartalfheim — per-HQ-slot Eternal Darkness flags (NEW: HQ has no native flag array).

// Reset all per-game HoA scheme state. Called from initCityArrays() (the per-game city reset) via a
// guarded hook, so a new game starts clean even without a page reload. The darkness arrays exist in
// EVERY game (all-false) — harmless; every modifier that reads them is gated on Svartalfheim being the
// active scheme (hoaSvartalfheimActive), so no cross-expansion leakage. HQ is a fixed 5 slots; sizing
// to a literal 5 avoids a timing trap (hq[] isn't built yet when initCityArrays runs at setup).
function hoaResetSchemeState() {
  hoaMoralFailings = 0;
  hoaGuardiansDefeated = 0;
  const cSize = typeof citySize === "number" && citySize > 0 ? citySize : 5;
  hoaCityDarkness = new Array(cSize).fill(false);
  hoaHQDarkness = new Array(5).fill(false);
}

// Svartalfheim active? Guards every Eternal Darkness modifier — the flag arrays exist in every game
// but the +1 Attack / +1 Recruit only apply under this scheme (cross-expansion safety).
function hoaSvartalfheimActive() {
  const s = typeof getActiveScheme === "function" ? getActiveScheme() : null;
  return !!(s && s.name === "The Dark World of Svartalfheim");
}

// City-space Eternal Darkness attack bonus: +1 to a Villain in a darkened CITY space. Called from
// updateVillainAttackValues (the CITY twin ONLY — HQ Eternal Darkness is a recruit-cost effect, not a
// villain-attack effect) via a guarded hook. i is the city index; off-grid (i < 0) → 0.
function hoaCityDarknessAttackBonus(i) {
  if (!hoaSvartalfheimActive()) return 0;
  if (typeof i !== "number" || i < 0) return 0;
  return hoaCityDarkness[i] === true ? 1 : 0;
}

// HQ-slot Eternal Darkness recruit surcharge: +1 Recruit to recruit a Hero in a darkened HQ slot.
// Called from the recruit-cost pipeline (showHeroRecruitButton charge + the affordability-highlight
// twins). hqSlot is 0-based; off-grid → 0.
function hoaHQRecruitSurcharge(hqSlot) {
  if (!hoaSvartalfheimActive()) return 0;
  if (typeof hqSlot !== "number" || hqSlot < 0) return 0;
  return hoaHQDarkness[hqSlot] === true ? 1 : 0;
}

// Svartalfheim Evil Wins: all CITY spaces OR all HQ spaces covered. Length-guarded so an un-initialised
// (length-0) array never reports "complete" via Array.every's vacuous-true.
function hoaEternalDarknessComplete() {
  const cityFull = hoaCityDarkness.length > 0 && hoaCityDarkness.every(Boolean);
  const hqFull = hoaHQDarkness.length > 0 && hoaHQDarkness.every(Boolean);
  return cityFull || hqFull;
}

// Darkened-space counts for the live tracker.
function hoaDarknessCounts() {
  return {
    city: hoaCityDarkness.filter(Boolean).length,
    cityTotal: hoaCityDarkness.length,
    hq: hoaHQDarkness.filter(Boolean).length,
    hqTotal: hoaHQDarkness.length,
  };
}

// Frost Giant Invader live count (city + escape pile) — War of the Frost Giants Evil Wins + tracker.
function hoaFrostGiantInvaderCount() {
  let n = 0;
  if (typeof city !== "undefined")
    n += city.filter((c) => c && c.name === "Frost Giant Invader").length;
  if (typeof escapedVillainsDeck !== "undefined")
    n += escapedVillainsDeck.filter((c) => c && c.name === "Frost Giant Invader").length;
  return n;
}

// Frost Giant Invader passive: +4 Attack while you are not Worthy (live). Dispatched from
// hoaVillainOwnAttackBonus via the token's passiveAbility string. Same shape as ulikTheTrollNotWorthyBonus.
function frostGiantInvaderNotWorthyBonus(villain) {
  return isWorthy() ? 0 : 4;
}

// --- Ragnarok per-Twist Guardian Attack thresholds, keyed by 1-based twist number (from
// cardDatabase.js twistText1..11 — non-monotonic). Index 0 unused. ---
const HOA_RAGNAROK_THRESHOLDS = [0, 11, 24, 19, 16, 12, 7, 8, 6, 6, 6, 6];
const HOA_RAGNAROK_GUARDIANS = [
  null, "Balder", "Odin", "Vidar", "Tyr", "Heimdall", "Frey", "Frigga",
  "Warriors of Valhalla", "Warriors of Valhalla", "Warriors of Valhalla", "Warriors of Valhalla",
];

// Ragnarok, Twilight of the Gods — Twist: return a >=2VP Villain from your Victory Pile to the city
// (native solo), then if the total EFFECTIVE (modifier-inclusive) Attack of Villains in the city meets
// this Twist's Guardian threshold, mark a Guardian Defeated. No eligible Villain → nothing enters, but
// the threshold is still checked against the current city. Evil Wins at 5. NOT mode-divergent.
async function ragnarokTwilightOfTheGodsTwist() {
  const twistN = typeof schemeTwistCount === "number" ? schemeTwistCount : 1;
  const threshold =
    HOA_RAGNAROK_THRESHOLDS[twistN] != null ? HOA_RAGNAROK_THRESHOLDS[twistN] : 6;
  const guardian = HOA_RAGNAROK_GUARDIANS[twistN] || "Warriors of Valhalla";

  const eligible =
    typeof victoryPile !== "undefined"
      ? victoryPile.filter(
          (c) => c && c.type === "Villain" && (c.victoryPoints || 0) >= 2,
        )
      : [];
  if (eligible.length > 0) {
    let chosen;
    if (eligible.length === 1) {
      chosen = eligible[0];
    } else {
      chosen = await revelationsPickOneCard(eligible, {
        title: "RAGNAROK — RETURN A VILLAIN",
        instructions: "Choose a Villain worth 2+ VP from your Victory Pile to enter the city.",
        allowNoThanks: false,
      });
      if (!chosen) chosen = eligible[0];
    }
    const idx = victoryPile.indexOf(chosen);
    if (idx > -1) victoryPile.splice(idx, 1);
    onscreenConsole.log(
      `<span class="console-highlights">${chosen.name}</span> returns from your Victory Pile to the city.`,
    );
    await enterCityFromRight(chosen);
  } else {
    onscreenConsole.log(
      `You have no Villain worth 2+ VP in your Victory Pile — none enters the city.`,
    );
  }

  // Sum EFFECTIVE Attack of all Villains currently in the city (the same modifier-inclusive read the
  // board display uses).
  let totalCityAttack = 0;
  if (typeof city !== "undefined") {
    for (const c of city) {
      if (c && c.type === "Villain") totalCityAttack += recalculateVillainAttack(c);
    }
  }
  if (totalCityAttack >= threshold) {
    hoaGuardiansDefeated++;
    onscreenConsole.log(
      `Total city Attack ${totalCityAttack} ${HOA_ATK_ICON} meets ${guardian}'s threshold (${threshold}) — a <span class="console-highlights">Guardian Defeated</span>! (${hoaGuardiansDefeated}/5)`,
    );
  } else {
    onscreenConsole.log(
      `Total city Attack ${totalCityAttack} ${HOA_ATK_ICON} is below ${guardian}'s threshold (${threshold}) — no Guardian Defeated.`,
    );
  }
  updateGameBoard();
}

// War of the Frost Giants — Twist 1-9: a Frost Giant Invader Villain (6 Atk / 6 VP; +4 Atk while not
// Worthy) enters the city. Twist 8-9 ALSO: a Frost Giant Invader from each player's Victory Pile
// re-enters — solo self-apply (your VP). Evil Wins at 5 Invaders across city AND escape pile.
// MODE-DIVERGENT (row 8, "each player's Victory Pile") — tested in Golden AND What If?.
async function warOfTheFrostGiantsTwist() {
  const twistN = typeof schemeTwistCount === "number" ? schemeTwistCount : 1;
  await hoaSpawnFrostGiantInvader();
  if (twistN >= 8) {
    const idx =
      typeof victoryPile !== "undefined"
        ? victoryPile.findIndex((c) => c && c.name === "Frost Giant Invader")
        : -1;
    if (idx > -1) {
      const returning = victoryPile.splice(idx, 1)[0];
      onscreenConsole.log(
        `A defeated <span class="console-highlights">Frost Giant Invader</span> rises from your Victory Pile and re-enters the city.`,
      );
      await enterCityFromRight(returning);
    } else {
      onscreenConsole.log(
        `No defeated <span class="console-highlights">Frost Giant Invader</span> in your Victory Pile to re-enter.`,
      );
    }
  }
  updateGameBoard();
}

// Build + drop one Frost Giant Invader token into the city. The +4 not-Worthy bonus rides the token's
// passiveAbility string through hoaVillainOwnAttackBonus (read live every frame, so it flips as Worthy
// status changes — no createVillainCopy whitelist needed, the bonus is a pure attack term on the live
// city card). NOTE: hoaBuildVillainToken auto-tags a passiveAbility token with keywords:["Conqueror"];
// that keyword is inert (no engine consumer) — harmless, purely a token-shape artifact.
async function hoaSpawnFrostGiantInvader() {
  const invader = hoaBuildVillainToken({
    name: "Frost Giant Invader",
    attack: 6,
    victoryPoints: 6,
    image: "Visual Assets/Villains/EnemiesOfAsgard_FrostGiant.webp",
    passiveAbility: "frostGiantInvaderNotWorthyBonus",
    team: "Frost Giants",
  });
  onscreenConsole.log(
    `A <span class="console-highlights">Frost Giant Invader</span> (6 ${HOA_ATK_ICON}, 6 VP; +4 ${HOA_ATK_ICON} while you are not Worthy) enters the city.`,
  );
  await enterCityFromRight(invader);
}

// Asgardian Test of Worth — Twist 1-7: if you are not Worthy, discard a card and this Twist becomes a
// Moral Failing; if you ARE Worthy, nothing. Twist 8-11: always a Moral Failing. Evil Wins at 5.
// MODE-DIVERGENT (rows 8/9 — "each player" / "half round up" scaling; solo = 1 player, so being
// not-Worthy is >= half round up -> a Moral Failing). Tested in Golden AND What If?.
async function asgardianTestOfWorthTwist() {
  const twistN = typeof schemeTwistCount === "number" ? schemeTwistCount : 1;
  if (twistN <= 7) {
    if (!isWorthy()) {
      onscreenConsole.log(
        `You are not Worthy — discard a card, and this Twist becomes a <span class="console-highlights">Moral Failing</span>.`,
      );
      await hoaDiscardOneFromHand({
        title: "ASGARDIAN TEST — DISCARD",
        instructions: "You are not Worthy — discard a card.",
        optional: false,
      });
      hoaMoralFailings++;
      onscreenConsole.log(
        `<span class="console-highlights">Moral Failing</span> ${hoaMoralFailings}/5.`,
      );
    } else {
      onscreenConsole.log(
        `You are Worthy — no card discarded, and no Moral Failing.`,
      );
    }
  } else {
    hoaMoralFailings++;
    onscreenConsole.log(
      `This Twist becomes a <span class="console-highlights">Moral Failing</span> ${hoaMoralFailings}/5.`,
    );
  }
  updateGameBoard();
}

// The Dark World of Svartalfheim — Twist: cover one uncovered city space OR HQ space with Eternal
// Darkness. In solo the PLAYER chooses (Q8). Darkened city spaces give Villains there +1 Attack;
// darkened HQ slots cost +1 Recruit. Evil Wins when all city OR all HQ spaces are covered. Reuses the
// existing card-picker UI (revelationsPickOneCard) with synthesized space pseudo-cards — no bespoke
// board-click handler. NOT mode-divergent, but LOW-confidence → dual-mode tested.
async function theDarkWorldOfSvartalfheimTwist() {
  const scheme = typeof getActiveScheme === "function" ? getActiveScheme() : null;
  const schemeImg = scheme && scheme.image ? scheme.image : "";
  const choices = [];
  if (typeof city !== "undefined") {
    for (let i = 0; i < city.length && i < hoaCityDarkness.length; i++) {
      if (hoaCityDarkness[i] !== true) {
        const label =
          typeof citySpaceLabels !== "undefined" && citySpaceLabels[i]
            ? citySpaceLabels[i]
            : `Space ${i + 1}`;
        choices.push({
          name: `City: ${label}`,
          image: city[i] && city[i].image ? city[i].image : schemeImg,
          _darkTarget: { zone: "city", index: i },
        });
      }
    }
  }
  if (typeof hq !== "undefined") {
    for (let i = 0; i < hoaHQDarkness.length; i++) {
      if (hoaHQDarkness[i] !== true) {
        const occupant = hq[i];
        choices.push({
          name: `HQ ${i + 1}${occupant && occupant.name ? ": " + occupant.name : ""}`,
          image: occupant && occupant.image ? occupant.image : schemeImg,
          _darkTarget: { zone: "hq", index: i },
        });
      }
    }
  }
  if (choices.length === 0) {
    onscreenConsole.log(
      `Every space is already covered in <span class="console-highlights">Eternal Darkness</span>.`,
    );
    return;
  }
  let chosen;
  if (choices.length === 1) {
    chosen = choices[0];
  } else {
    chosen = await revelationsPickOneCard(choices, {
      title: "ETERNAL DARKNESS — CHOOSE A SPACE",
      instructions:
        "Cover a city space or HQ space (without one already) with Eternal Darkness.",
      allowNoThanks: false,
    });
    if (!chosen) chosen = choices[0];
  }
  const t = chosen._darkTarget;
  if (t.zone === "city") {
    hoaCityDarkness[t.index] = true;
    onscreenConsole.log(
      `<span class="console-highlights">Eternal Darkness</span> covers ${chosen.name}. Villains there get +1 ${HOA_ATK_ICON}.`,
    );
  } else {
    hoaHQDarkness[t.index] = true;
    onscreenConsole.log(
      `<span class="console-highlights">Eternal Darkness</span> covers ${chosen.name}. Recruiting a Hero there costs +1 Recruit.`,
    );
  }
  updateGameBoard();
}
