// Secret Wars Vol. 1 Expansion
// 2026-06-22
//
// Effect implementation lands in Phase 3 (built against the frozen Phase 2.5 specs).
// Keystone Multiple-Masterminds engine change is built in Phase 3a-1 (in script.js),
// before its consumers (Apocalyptic Magneto ascension, Dark Alliance scheme).

// --- KEYWORDS & HELPERS ---

// gainSidekick() — cost-free, cap-free Sidekick gain (Secret Wars insert p.1: "gain" ≠ "recruit").
// Unlike recruitSidekick() (script.js), this does NOT touch sidekickRecruited or recruit points,
// so it ignores the 1-Sidekick-per-turn recruit cap and costs nothing.
// destination: "discard" (default) | "hand" | "deckTop".
// Consumers (Phase 3b/3c): Magik Rally, King of Wakanda (×3 deckTop on Illuminati), Maximus
// Enslave, Namor Lead, Ultimate Spidey Marvel Team-Up. (Corrupt the Next Generation does NOT use
// this — its defeated Sidekick-Villains convert via gainCorruptedSidekick, which gains the defeated
// CARD itself to the deck top rather than pulling a fresh Sidekick from the Stack.)
async function gainSidekick(destination = "discard") {
  if (sidekickDeck.length === 0) {
    onscreenConsole.log("No Sidekicks remain in the Sidekick Stack."); // graceful no-op
    return null;
  }
  const sk = sidekickDeck.pop();
  if (destination === "hand") {
    playerHand.push(sk);
  } else if (destination === "deckTop") {
    playerDeck.push(sk);
    sk.revealed = true;
  } else {
    playerDiscardPile.push(sk);
  }
  onscreenConsole.log(
    `Gained a Sidekick (<span class="console-highlights">${sk.name}</span>).`,
  );
  updateGameBoard();
  return sk;
}

// Cross-Dimensional Rampage (SHARED) — Secret Wars insert: "Cross-Dimensional <Family> Rampage" =
// "each player reveals a <Family> Hero or gains a Wound." Solo "each player" = the active player.
// Adapted from revealClassOrWound() (expansionRevelations.js:2329): swap the single-class predicate
// for a case-insensitive NAME-substring family match, and EXTEND the scanned pool to include the
// Victory Pile (spec: a defeated family villain in the VP — e.g. Apocalyptic Weapon X itself — counts).
// No family card available → forced Wound (drawWound() handles invulnerability).
// Consumers (3c): Apocalyptic Weapon X Escape + Wolverine of Future Past Escape (Wolverine family),
// Ultimate Thor Escape (Thor family).
function crossDimensionalRampage(familyNames, villainName) {
  const families = familyNames.map((f) => f.toLowerCase());
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(
      (c) =>
        !c.isCopied && !c.sidekickToDestroy && !c.markedForDeletion && !c.isSimulation,
    ),
    ...victoryPile,
  ];
  const isFamily = (c) =>
    c && c.name && families.some((f) => c.name.toLowerCase().includes(f));
  if (!cardsYouHave.some(isFamily)) {
    onscreenConsole.log(
      `No matching Hero to reveal — <span class="console-highlights">${villainName}</span><span class="bold-spans">'s</span> Cross-Dimensional Rampage forces a Wound.`,
    );
    return drawWound();
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal a matching Hero to avoid gaining a Wound?`,
      "Reveal Hero",
      "Gain Wound",
    );
    const title = document.querySelector(".info-or-choice-popup-title");
    if (title) title.textContent = villainName;
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      onscreenConsole.log(
        `Revealed a matching Hero — no Wound from <span class="console-highlights">${villainName}</span>.`,
      );
      resolve();
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      drawWound();
      resolve();
    };
  });
}

// gainVillainAsHero() — SHARED converter for "Fight: Gain this as a Hero" (Manhattan Earth-1610
// villains + Thor Corps henchmen). Generalizes gainScarletWitchAsHero() (expansionRevelations.js):
// runs on the fight COPY during defeat, flips it to its Hero form, and routes it to the discard pile.
// The real card's `gainAsHero` DB flag already skipped the Victory-Pile push (script.js defeat
// handlers), so this is the only place the card lands. Rules (insert p.1): a gained Hero's cost = its
// old Villain Attack value — passed in heroForm.cost. The installed ability fields fire only when the
// card is LATER played as a Hero (engine play-flow), never at gain time.
function gainVillainAsHero(villainCopy, heroForm) {
  if (!villainCopy) return;
  villainCopy.type = "Hero";
  villainCopy.heroName = heroForm.heroName || villainCopy.name;
  villainCopy.team = heroForm.team;
  villainCopy.classes = [...heroForm.classes];
  villainCopy.color = heroForm.color;
  villainCopy.cost = heroForm.cost;
  villainCopy.attack = heroForm.attack || 0;
  villainCopy.recruit = heroForm.recruit || 0;
  villainCopy.attackIcon = !!heroForm.attackIcon;
  villainCopy.recruitIcon = !!heroForm.recruitIcon;
  villainCopy.bonusAttack = heroForm.bonusAttack || 0;
  villainCopy.bonusRecruit = heroForm.bonusRecruit || 0;
  // Flat (non-multiplied) superpower payout — bonusAttack() reads these and takes its simple path.
  villainCopy.multiplier = "None";
  villainCopy.multiplierAttribute = "None";
  villainCopy.multiplierLocation = "None";
  villainCopy.unconditionalAbility = heroForm.unconditionalAbility || "None";
  villainCopy.conditionalAbility = heroForm.conditionalAbility || "None";
  villainCopy.conditionType = heroForm.conditionType || "None";
  villainCopy.condition = heroForm.condition || "None";
  villainCopy.invulnerability = "None";
  villainCopy.keywords = heroForm.keywords ? [...heroForm.keywords] : [];
  // Strip villain residue so the gained Hero carries no fight/escape/ambush behavior or attack overlay.
  villainCopy.fightEffect = "";
  villainCopy.escapeEffect = "None";
  villainCopy.ambushEffect = "None";
  villainCopy.gainAsHero = false;
  villainCopy.attackFromScheme = 0;
  villainCopy.overlayTextAttack = "";
  playerDiscardPile.push(villainCopy);
  onscreenConsole.log(
    `You defeated <span class="console-highlights">${villainCopy.name}</span> and gained it as a Hero — added to your discard pile.`,
  );
  updateGameBoard();
}

// --- HERO CARD ABILITIES ---

// Manhattan — Ultimate Wasp hero form: "[COVERT]: You get +2 Attack." Superpower (conditionType
// "playedCards", condition "Covert"). Mirrors the base ThorBonusAttack pattern: log + bonusAttack(),
// which adds card.bonusAttack (=2) to both attack totals.
function ultimateWaspBonusAttack(card) {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> Hero played. Superpower Ability activated.`,
  );
  onscreenConsole.log(
    `+2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  bonusAttack();
}

// ============================================================================
// PHASE 3b — HERO CARD ABILITIES
// ============================================================================
//
// Build map: docs/expansion-progress/secret-wars-vol1-3b-heroes-reusemap.md
// Frozen specs: docs/expansion-specs/secret-wars-vol1.md (lines 105-513)
// Engine dispatch (script.js:11363-11481): the engine adds base card.attack/recruit and gates
// conditionalAbility superpowers via isConditionMet() BEFORE calling fn(card). It does NOT
// auto-apply card.bonusAttack — flat/computed grants are applied directly to BOTH totals here.

// Shared: real (non-copied / non-simulated) cards played this turn EXCLUDING `self` — backs every
// "for each OTHER card you played this turn" count. Excludes the playing card by object identity
// (the engine pushes it to cardsPlayedThisTurn before firing its ability) and strips copy/simulation
// residue so it can't inflate counts.
// `includeSidekickResidue` (default false): a normally-played Sidekick is stamped
// sidekickToDestroy=true at play time by returnToSidekickDeck() (cardAbilitiesSidekicks.js), so by
// default it is treated as residue and excluded. Magik "Dimensional Portal" must COUNT played
// Sidekicks, so it opts in — keeping all other residue guards single-sourced here (no hand-copied
// drift if the guard list ever grows).
function otherRealCardsPlayedThisTurn(self, { includeSidekickResidue = false } = {}) {
  return cardsPlayedThisTurn.filter(
    (c) =>
      c !== self &&
      !c.isCopied &&
      (includeSidekickResidue || !c.sidekickToDestroy) &&
      !c.markedToDestroy &&
      !c.markedForDeletion &&
      !c.isSimulation,
  );
}

// --- Shared: "card with no rules text" predicate (Black Bolt) ---
// A card "has no rules text" when it carries no rules-bearing fields: no unconditional ability, no
// conditional ability, no keyword, and no superpower bonus icon. The explicit DB flag
// `noRulesText: true` is honored first as an override (set on Black Bolt "Speak No Words" + Proxima
// "Inspiration Through Power"); the runtime fallback also catches the ubiquitous vanilla no-text cards
// game-wide (basic S.H.I.E.L.D. Troopers/Agents and other vanilla cards) so Black Bolt counts them as
// intended — without it, Black Bolt would almost never fire. A naive ability-fields-only check would
// wrongly count keyword-only cards as no-text; checking `keywords` fixes that false positive.
function cardHasNoRulesText(card) {
  if (!card) return false;
  if (card.noRulesText === true) return true;
  const noUncond = !card.unconditionalAbility || card.unconditionalAbility === "None";
  const noCond = !card.conditionalAbility || card.conditionalAbility === "None";
  const noKeywords = !card.keywords || card.keywords.length === 0;
  const noBonus =
    (!card.bonusAttack || card.bonusAttack === 0) &&
    (!card.bonusRecruit || card.bonusRecruit === 0);
  return noUncond && noCond && noKeywords && noBonus;
}

// --- Black Bolt (Illuminati) — no-rules-text family ---

// Black Bolt — Destructive Whisper (Common A, special). "You get +1 Attack if you reveal four cards
// with no rules text." SPEC-Q4 ruling: reveal from HAND (contrasts Hypersonic Scream's explicit
// "played this turn" scoping). Black Bolt is already in cardsPlayedThisTurn and has rules text, so the
// hand scan never counts it.
function blackBoltDestructiveWhisper() {
  const count = playerHand.filter(cardHasNoRulesText).length;
  onscreenConsole.log(
    `<span class="console-highlights">Destructive Whisper</span> — reveal your hand: ${count} card(s) with no rules text.`,
  );
  if (count >= 4) {
    totalAttackPoints += 1;
    cumulativeAttackPoints += 1;
    updateGameBoard();
    onscreenConsole.log(
      `Four or more no-rules-text cards revealed. +1<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
    );
  } else {
    onscreenConsole.log(`Fewer than four no-rules-text cards — no bonus.`);
  }
}

// Black Bolt — Silence is Golden (Uncommon, special). "Choose a card you played this turn with no
// rules text. You get its Recruit and Attack again." Re-grants the chosen card's printed icon values a
// second time, to BOTH current-turn and Final-Showdown cumulative totals. No qualifying card → no-op.
async function blackBoltSilenceIsGolden() {
  const items = otherRealCardsPlayedThisTurn(null).filter(cardHasNoRulesText);
  if (items.length === 0) {
    onscreenConsole.log(
      `<span class="console-highlights">Silence is Golden</span> — no no-rules-text card was played this turn; nothing to repeat.`,
    );
    return;
  }
  const chosen = await showCardSelectionPopup({
    title: "Silence is Golden",
    instructions:
      "Choose a card you played this turn with no rules text. You get its Recruit and Attack again.",
    confirmText: "REPEAT",
    items,
  });
  if (!chosen) return;
  const addAttack = chosen.attack || 0;
  const addRecruit = chosen.recruit || 0;
  totalAttackPoints += addAttack;
  cumulativeAttackPoints += addAttack;
  totalRecruitPoints += addRecruit;
  cumulativeRecruitPoints += addRecruit;
  updateGameBoard();
  onscreenConsole.log(
    `<span class="console-highlights">Silence is Golden</span> repeats <span class="console-highlights">${chosen.name}</span>: +${addRecruit}<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> +${addAttack}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">.`,
  );
}

// Black Bolt — Hypersonic Scream (Rare, special). "For each card with no rules text you played this
// turn, draw a card." Hypersonic Scream itself has rules text → excluded by the predicate. drawCard()
// auto-reshuffles the discard when the deck runs out; guard against an exhausted deck + discard.
function blackBoltHypersonicScream() {
  const count = otherRealCardsPlayedThisTurn(null).filter(cardHasNoRulesText).length;
  onscreenConsole.log(
    `<span class="console-highlights">Hypersonic Scream</span> — ${count} no-rules-text card(s) played this turn.`,
  );
  let drawn = 0;
  for (let i = 0; i < count; i++) {
    if (playerDeck.length === 0 && playerDiscardPile.length === 0) break;
    drawCard();
    drawn++;
  }
  if (drawn > 0) {
    onscreenConsole.log(`Drew ${drawn} card(s).`);
  }
}

// --- Family 1: count cardsPlayedThisTurn / HQ by predicate → grant (IronManArcReactor pattern) ---

// Apocalyptic Kitty Pryde — Disrupt Circuits (Uncommon, special).
// "You get +1 Attack for each [TECH] Hero in the HQ." Counts dual-class Tech cards; empty HQ slots
// guarded. Source is the HQ (`hq`), NOT cards played this turn.
function apocalypticKittyPrydeDisruptCircuits() {
  const techInHQ = hq.filter(
    (c) => c && c.classes && c.classes.includes("Tech"),
  ).length;
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> Heroes in the HQ: ${techInHQ}. +${techInHQ}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += techInHQ;
  cumulativeAttackPoints += techInHQ;
  updateGameBoard();
}

// Black Panther — Multifaceted Genius (Common B, special).
// "You get +1 Attack for each other multicolored card you played this turn." Multicolored = dual-class
// (classes.length >= 2). Excludes self (Multifaceted Genius is itself dual-class).
function blackPantherMultifacetedGenius(card) {
  const count = otherRealCardsPlayedThisTurn(card).filter(
    (c) => c.classes && c.classes.length >= 2,
  ).length;
  onscreenConsole.log(
    `Other multicolored cards played this turn: ${count}. +${count}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += count;
  cumulativeAttackPoints += count;
  updateGameBoard();
}

// Captain Marvel — Absorb Energies (Common A, [RANGE] superpower).
// "For each other [RANGED] Hero you have played this turn, you get +1 Recruit." DB class string is
// "Range". Excludes self. (Engine already confirmed a Range Hero this turn before calling.)
function captainMarvelAbsorbEnergies(card) {
  const count = otherRealCardsPlayedThisTurn(card).filter(
    (c) => c.classes && c.classes.includes("Range"),
  ).length;
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero played. Superpower Ability activated.`,
  );
  onscreenConsole.log(
    `Other Range Heroes played this turn: ${count}. +${count}<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> gained.`,
  );
  totalRecruitPoints += count;
  cumulativeRecruitPoints += count;
  updateGameBoard();
}

// Captain Marvel — Marvelous Strength (Uncommon, [STRENGTH] superpower). Twin of Absorb Energies,
// Attack instead of Recruit. "For each other [STRENGTH] Hero you have played this turn, +1 Attack."
function captainMarvelMarvelousStrength(card) {
  const count = otherRealCardsPlayedThisTurn(card).filter(
    (c) => c.classes && c.classes.includes("Strength"),
  ).length;
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Strength.svg" alt="Strength Icon" class="console-card-icons"> Hero played. Superpower Ability activated.`,
  );
  onscreenConsole.log(
    `Other Strength Heroes played this turn: ${count}. +${count}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += count;
  cumulativeAttackPoints += count;
  updateGameBoard();
}

// Proxima Midnight — Master Combatant (Common B, special).
// "If the most recent Hero you have played this turn has a Recruit icon, +2 Recruit. If it has an
// Attack icon, +2 Attack." Looks at the most recent OTHER Hero (the one before this card). A card with
// both icons grants both. No prior Hero → nothing.
function proximaMidnightMasterCombatant(card) {
  const priorHeroes = otherRealCardsPlayedThisTurn(card).filter(
    (c) => c.type === "Hero",
  );
  const recent = priorHeroes[priorHeroes.length - 1];
  if (!recent) {
    onscreenConsole.log(
      `No prior Hero played this turn — <span class="console-highlights">Master Combatant</span> grants nothing.`,
    );
    return;
  }
  if (recent.recruitIcon) {
    onscreenConsole.log(
      `<span class="console-highlights">${recent.name}</span> has a Recruit icon. +2<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> gained.`,
    );
    totalRecruitPoints += 2;
    cumulativeRecruitPoints += 2;
  }
  if (recent.attackIcon) {
    onscreenConsole.log(
      `<span class="console-highlights">${recent.name}</span> has an Attack icon. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
    );
    totalAttackPoints += 2;
    cumulativeAttackPoints += 2;
  }
  updateGameBoard();
}

// Ultimate Spider-Man — Hero from Another Dimension (Rare, special).
// "You get +2 Attack for each other card you have played this turn that costs 1 or 2." Excludes self.
function ultimateSpiderManHeroFromAnotherDimension(card) {
  const count = otherRealCardsPlayedThisTurn(card).filter(
    (c) => c.cost === 1 || c.cost === 2,
  ).length;
  const bonus = count * 2;
  onscreenConsole.log(
    `Other cost-1/2 cards played this turn: ${count}. +${bonus}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += bonus;
  cumulativeAttackPoints += bonus;
  updateGameBoard();
}

// --- Trivial special abilities: draw a card ---

function blackPantherCatlikeReflexes() {
  onscreenConsole.log(`<span class="console-highlights">Catlike Reflexes</span> — draw a card.`);
  drawCard();
}

function captainMarvelSupersonicFlight() {
  onscreenConsole.log(`<span class="console-highlights">Supersonic Flight</span> — draw a card.`);
  drawCard();
}

function superiorIronManOptimizedTechnology() {
  onscreenConsole.log(`<span class="console-highlights">Optimized Technology</span> — draw a card.`);
  drawCard();
}

// --- Trivial flat icon-gated superpowers (condition already met by the engine) ---

// Captain Marvel — Cosmic Energies (Rare): [RANGE][RANGE][STRENGTH][STRENGTH] → +6 Attack.
function captainMarvelCosmicEnergies() {
  onscreenConsole.log(
    `Superpower Ability activated. +6<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += 6;
  cumulativeAttackPoints += 6;
  updateGameBoard();
}

// Lady Thor — Heir to the Hammer (Uncommon): [RANGE][STRENGTH] → +2 Attack.
function ladyThorHeirToTheHammer() {
  onscreenConsole.log(
    `Superpower Ability activated. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += 2;
  cumulativeAttackPoints += 2;
  updateGameBoard();
}

// Proxima Midnight — General of the Black Order (Uncommon): [INSTINCT] → +3 Recruit.
function proximaMidnightGeneralOfTheBlackOrder() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Instinct.svg" alt="Instinct Icon" class="console-card-icons"> Hero played. Superpower Ability activated. +3<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> gained.`,
  );
  totalRecruitPoints += 3;
  cumulativeRecruitPoints += 3;
  updateGameBoard();
}

// Proxima Midnight — Supernova Spear (Rare): [COVERT] → +4 Recruit and +4 Attack.
function proximaMidnightSupernovaSpear() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> Hero played. Superpower Ability activated. +4<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> and +4<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalRecruitPoints += 4;
  cumulativeRecruitPoints += 4;
  totalAttackPoints += 4;
  cumulativeAttackPoints += 4;
  updateGameBoard();
}

// Superior Iron Man — Armor Upgrades (Common A): [TECH] → +2 Attack.
function superiorIronManArmorUpgrades() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> Hero played. Superpower Ability activated. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += 2;
  cumulativeAttackPoints += 2;
  updateGameBoard();
}

// --- Family 3: gainSidekick() consumers (cost-free, cap-free; insert p.1: gain != recruit) ---

// Magik — Rally the New Mutants (Common A). Special: "Gain a Sidekick." Superpower [COVERT]: "Gain
// another Sidekick." Two separate functions: unconditional gains 1, the Covert superpower adds 1 more.
async function magikRallyTheNewMutants() {
  onscreenConsole.log(
    `<span class="console-highlights">Rally the New Mutants</span> — gain a Sidekick.`,
  );
  await gainSidekick("discard");
}
async function magikRallyTheNewMutantsCovert() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> Hero played. Superpower Ability activated — gain another Sidekick.`,
  );
  await gainSidekick("discard");
}

// Namor, the Sub-Mariner — Lead the Armies of Atlantis (Common A). Superpower [INSTINCT]: "Gain a
// Sidekick." (to discard, cost-free, does not burn the 1/turn recruit cap).
async function namorTheSubMarinerLeadTheArmiesOfAtlantis() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Instinct.svg" alt="Instinct Icon" class="console-card-icons"> Hero played. Superpower Ability activated — gain a Sidekick.`,
  );
  await gainSidekick("discard");
}

// --- Family 2: KO one card from the COMBINED hand+discard pool → conditional rider ---

// koOneFromHandOrDiscard() — ratified scout correction: CLAUDE.md's KO1To4FromDiscard is
// DISCARD-ONLY / 1-4 / returns nothing, so it does NOT fit "KO a card from your hand OR discard
// pile." This purpose-built helper offers the OPTIONAL ("may") KO over BOTH pools and RETURNS the
// KO'd card object (or null if declined / empty pool) so the caller can branch (e.g. Last Survivor
// checks type==="Wound"; others branch on KO-happened). Reuses the shared single-select picker
// showCardSelectionPopup (cardAbilitiesSidekicks.js) wrapped in a yes/no may-gate.
async function koOneFromHandOrDiscard(
  promptText = "You may KO a card from your hand or discard pile.",
) {
  const pool = [...playerHand, ...playerDiscardPile];
  if (pool.length === 0) {
    onscreenConsole.log("No cards in your hand or discard pile to KO.");
    return null;
  }
  const wantsTo = await new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      promptText,
      "KO a card",
      "Decline",
    );
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(true);
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(false);
    };
  });
  if (!wantsTo) {
    onscreenConsole.log("Declined to KO a card.");
    return null;
  }
  const chosen = await showCardSelectionPopup({
    title: "KO a Card",
    instructions: "Select a card from your hand or discard pile to KO.",
    confirmText: "KO CARD",
    items: pool,
  });
  if (!chosen) return null;
  // Remove the chosen card from its source array by object identity, then KO it.
  let idx = playerHand.indexOf(chosen);
  if (idx >= 0) {
    playerHand.splice(idx, 1);
  } else {
    idx = playerDiscardPile.indexOf(chosen);
    if (idx >= 0) playerDiscardPile.splice(idx, 1);
  }
  koPile.push(chosen);
  onscreenConsole.log(
    `KO'd <span class="console-highlights">${chosen.name}</span>.`,
  );
  updateGameBoard();
  return chosen;
}

// Apocalyptic Kitty Pryde — Phase Out (Common A, [COVERT] superpower).
// "You may KO a card from your hand or discard pile. If you do, you get +1 Attack."
async function apocalypticKittyPrydePhaseOut() {
  const koed = await koOneFromHandOrDiscard(
    "Phase Out: you may KO a card from your hand or discard pile for +1 Attack.",
  );
  if (koed) {
    onscreenConsole.log(
      `+1<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
    );
    totalAttackPoints += 1;
    cumulativeAttackPoints += 1;
    updateGameBoard();
  }
}

// Dr. Strange — Trust Me, I'm a Doctor (Common B, [ILLUMINATI] superpower).
// "You may KO a card from your hand or discard pile. If you do, you get +1 Recruit." Recruit twin.
async function drStrangeTrustMeImADoctor() {
  const koed = await koOneFromHandOrDiscard(
    "Trust Me, I'm a Doctor: you may KO a card from your hand or discard pile for +1 Recruit.",
  );
  if (koed) {
    onscreenConsole.log(
      `+1<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> gained.`,
    );
    totalRecruitPoints += 1;
    cumulativeRecruitPoints += 1;
    updateGameBoard();
  }
}

// Namor, the Sub-Mariner — Feed the Sharks (Uncommon, special).
// "You may KO a card from your hand or discard pile. If you do, draw a card."
async function namorTheSubMarinerFeedTheSharks() {
  const koed = await koOneFromHandOrDiscard(
    "Feed the Sharks: you may KO a card from your hand or discard pile to draw a card.",
  );
  if (koed) {
    onscreenConsole.log(
      `<span class="console-highlights">Feed the Sharks</span> — draw a card.`,
    );
    drawCard();
  }
}

// Old Man Logan — Last Survivor (Common A, [INSTINCT] superpower).
// "You may KO a card from your hand or discard pile. If you KO a Wound this way, draw a card."
// Draw is gated on the KO'd card being a Wound (type==="Wound"), not merely on a KO happening.
async function oldManLoganLastSurvivor() {
  const koed = await koOneFromHandOrDiscard(
    "Last Survivor: you may KO a card from your hand or discard pile. Draw if it's a Wound.",
  );
  if (koed && koed.type === "Wound") {
    onscreenConsole.log(
      `KO'd a Wound — <span class="console-highlights">Last Survivor</span> draws a card.`,
    );
    drawCard();
  }
}

// --- Family 7: reveal top of deck → conditional draw on cost ---

// revealTopDrawIfCost(maxCost) — reveal the top card of the player's deck; draw it if its cost
// <= maxCost, else leave it revealed on top. Reshuffles the discard pile in if the deck is empty.
// Consumers: Marvel Team-Up (<=2), Leaping Spider (<=2), Web-Slinger (<=2; built with Family 8).
function revealTopDrawIfCost(maxCost) {
  if (playerDeck.length === 0) {
    if (playerDiscardPile.length === 0) {
      onscreenConsole.log("Your deck and discard pile are empty — nothing to reveal.");
      return;
    }
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
    updateGameBoard();
  }
  const top = playerDeck[playerDeck.length - 1];
  if (top.cost <= maxCost) {
    onscreenConsole.log(
      `Revealed <span class="console-highlights">${top.name}</span> (cost ${top.cost}) — drawing it.`,
    );
    drawCard();
  } else {
    onscreenConsole.log(
      `Revealed <span class="console-highlights">${top.name}</span> (cost ${top.cost}) — too costly, left on top of your deck.`,
    );
    top.revealed = true;
    updateGameBoard();
  }
}

// --- Family 4: reveal top of deck → Draw or Teleport (shared with Apocalyptic Blink) ---

// revealTopThenDrawOrTeleport(label) — reveal the player's deck top; two-button choice Draw it (to
// hand) or Teleport it (set aside via the real teleport() so it returns next turn as a bonus card).
// Reshuffles if the deck is empty. The villain Apocalyptic Blink has an inline copy of this flow
// (committed/working); a future DRY pass can route it through here too.
async function revealTopThenDrawOrTeleport(label) {
  if (playerDeck.length === 0) {
    if (playerDiscardPile.length === 0) {
      onscreenConsole.log("Your deck and discard pile are empty — nothing to reveal.");
      return;
    }
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
    updateGameBoard();
  }
  const revealed = playerDeck[playerDeck.length - 1];
  onscreenConsole.log(
    `<span class="console-highlights">${label}</span> — revealed <span class="console-highlights">${revealed.name}</span> from the top of your deck. Draw it or Teleport it.`,
  );
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal: ${revealed.name}. Draw it or Teleport it?`,
      "Draw it",
      "Teleport it",
    );
    const title = document.querySelector(".info-or-choice-popup-title");
    if (title) title.textContent = label;
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      drawCard(); // pops the revealed top card into hand
      resolve();
    };
    denyButton.onclick = async () => {
      closeInfoChoicePopup();
      const card = playerDeck.pop(); // the revealed top card
      playerHand.push(card); // teleport() expects the card in hand; it queues it for next turn
      await teleport(card);
      resolve();
    };
  });
}

// Dr. Strange — Cloak of Levitation (Common A, [RANGE] superpower).
// "Reveal the top card of your deck. Draw it or Teleport it." Same flow as Apocalyptic Blink.
async function drStrangeCloakOfLevitation() {
  return revealTopThenDrawOrTeleport("Cloak of Levitation");
}

// Ultimate Spider-Man — Marvel Team-Up (Common A, special).
// "Gain a Sidekick. Reveal the top card of your deck. If it costs 2 or less, draw it."
async function ultimateSpiderManMarvelTeamUp() {
  onscreenConsole.log(
    `<span class="console-highlights">Marvel Team-Up</span> — gain a Sidekick.`,
  );
  await gainSidekick("discard");
  revealTopDrawIfCost(2);
}

// Ultimate Spider-Man — Leaping Spider (Common B).
// Special: "Reveal the top card of your deck. If it costs 2 or less, draw it." Superpower [STRENGTH]: +2 Attack.
function ultimateSpiderManLeapingSpider() {
  onscreenConsole.log(
    `<span class="console-highlights">Leaping Spider</span> — reveal the top card of your deck.`,
  );
  revealTopDrawIfCost(2);
}
function ultimateSpiderManLeapingSpiderStrength() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Strength.svg" alt="Strength Icon" class="console-card-icons"> Hero played. Superpower Ability activated. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += 2;
  cumulativeAttackPoints += 2;
  updateGameBoard();
}

// Magik — Travel through Limbo (Common B): [RANGE] superpower → +2 Attack. (The card's "Teleport."
// special ability is the Teleport keyword, handled by the engine play-flow; this is only the +2A
// superpower, which fires when the card is PLAYED — not when teleported.)
function magikTravelThroughLimboRange() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero played. Superpower Ability activated. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += 2;
  cumulativeAttackPoints += 2;
  updateGameBoard();
}

// Old Man Logan — Rage Out (Uncommon, [INSTINCT] superpower).
// "Cross-Dimensional Wolverine Rampage. For each other player who gained a Wound this way, +1 Attack."
// Reuses crossDimensionalRampage (Wolverine family). The "+1 per OTHER player who Wounded" rider = 0
// in solo (no other players), so no Attack is granted — only the self reveal-or-Wound resolves.
function oldManLoganRageOut() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Instinct.svg" alt="Instinct Icon" class="console-card-icons"> Hero played. Superpower Ability activated.`,
  );
  return crossDimensionalRampage(
    ["Wolverine", "Weapon X", "Old Man Logan"],
    "Rage Out",
  );
}

// Superior Iron Man — #Humblebrag (Rare, special).
// "Draw a card for each other player who has fewer cards in their Victory Pile than you." Solo: no
// other players → 0 → draw 0 (no-op per the ratified Q1 source/comparison rule).
function superiorIronManHumblebrag() {
  onscreenConsole.log(
    `<span class="console-highlights">#Humblebrag</span> — in solo there are no other players with a smaller Victory Pile, so no cards are drawn.`,
  );
}

// Thanos — Galactic Domination (Uncommon, [RANGE] superpower).
// "Each other player reveals a [RANGED] Hero or surrenders a Bystander from their Victory Pile. You
// rescue those Bystanders." RATIFIED NO-OP (2026-06-24): pulls from OTHER players' piles = source
// with no solo equivalent → nothing happens in solo.
function thanosGalacticDomination() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero played. Superpower Ability activated — but in solo there are no other players to surrender a Bystander, so nothing happens.`,
  );
}

// --- Family 3 (cont.): King of Wakanda — gain 3 Sidekicks, relocate to deck top on [ILLUMINATI] ---

// Tracks the Sidekicks gained by King of Wakanda's special so its [ILLUMINATI] superpower can relocate
// exactly those cards. The engine runs the unconditional ability immediately before the conditional one
// in the same play, so this scratch state is always fresh by the time the superpower reads it.
let kingOfWakandaGainedSidekicks = [];

// Black Panther — King of Wakanda (Rare). Special: "Gain three Sidekicks." (to discard, cost-free,
// cap-free). Superpower [ILLUMINATI]: "Put them on top of your deck."
async function blackPantherKingOfWakanda() {
  kingOfWakandaGainedSidekicks = [];
  onscreenConsole.log(
    `<span class="console-highlights">King of Wakanda</span> — gain three Sidekicks.`,
  );
  for (let i = 0; i < 3; i++) {
    const sk = await gainSidekick("discard");
    if (sk) kingOfWakandaGainedSidekicks.push(sk);
  }
}
async function blackPantherKingOfWakandaIlluminati() {
  if (kingOfWakandaGainedSidekicks.length === 0) return;
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Illuminati.png" alt="Illuminati Icon" class="console-card-icons"> Hero played. Superpower Ability activated — put the gained Sidekicks on top of your deck.`,
  );
  for (const sk of kingOfWakandaGainedSidekicks) {
    const idx = playerDiscardPile.indexOf(sk);
    if (idx < 0) continue; // already moved out of discard — don't duplicate it onto the deck
    playerDiscardPile.splice(idx, 1);
    playerDeck.push(sk); // top of deck = end of array
    sk.revealed = true;
  }
  kingOfWakandaGainedSidekicks = [];
  updateGameBoard();
}

// --- Thanos / Maximus / Dr. Strange singles (reuse) ---

// Thanos — Revel in Destruction (Common A, [CABAL] superpower).
// "KO a Bystander from the Bystander Stack. Then +1 Recruit for every three Bystanders in the KO pile."
// The just-KO'd Bystander counts toward the running total before the recruit calc (floor(count/3)).
function thanosRevelInDestruction() {
  if (bystanderDeck.length > 0) {
    const bystander = bystanderDeck.pop();
    koPile.push(bystander);
    onscreenConsole.log(
      `<img src="Visual Assets/Icons/Cabal.png" alt="Cabal Icon" class="console-card-icons"> Hero played. Superpower Ability activated — KO'd a Bystander (<span class="console-highlights">${bystander.name}</span>) from the Bystander Stack.`,
    );
  } else {
    onscreenConsole.log(
      `<img src="Visual Assets/Icons/Cabal.png" alt="Cabal Icon" class="console-card-icons"> Hero played. Superpower Ability activated — the Bystander Stack is empty.`,
    );
  }
  const bystandersInKO = koPile.filter((c) => c.type === "Bystander").length;
  const recruitGain = Math.floor(bystandersInKO / 3);
  onscreenConsole.log(
    `${bystandersInKO} Bystander(s) in the KO pile → +${recruitGain}<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> gained.`,
  );
  totalRecruitPoints += recruitGain;
  cumulativeRecruitPoints += recruitGain;
  updateGameBoard();
}

// Maximus — Pieces on a Chessboard (Uncommon, special).
// "You may have a Henchman Villain from your Victory Pile enter the city. If you do, draw a card."
// Re-entering costs the player that card's VP (it leaves the Victory Pile) — intended.
async function maximusPiecesOnAChessboard() {
  const henchmen = victoryPile.filter((c) => c.subtype === "Henchman");
  if (henchmen.length === 0) {
    onscreenConsole.log("No Henchman Villain in your Victory Pile.");
    return;
  }
  const wantsTo = await new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      "Pieces on a Chessboard: have a Henchman from your Victory Pile re-enter the city?",
      "Yes",
      "No",
    );
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(true);
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(false);
    };
  });
  if (!wantsTo) return;
  const chosen = await showCardSelectionPopup({
    title: "Henchman to Re-enter",
    instructions: "Choose a Henchman Villain to enter the city.",
    confirmText: "ENTER CITY",
    items: henchmen,
  });
  if (!chosen) return;
  const idx = victoryPile.indexOf(chosen);
  if (idx >= 0) victoryPile.splice(idx, 1);
  await enterCityFromRight(chosen);
  onscreenConsole.log(
    `<span class="console-highlights">${chosen.name}</span> re-enters the city — draw a card.`,
  );
  drawCard();
}

// Dr. Strange — Sorcerer Supreme (Rare, special).
// "Reveal the top three cards of your deck. Draw any number of them and Teleport the rest." Implemented
// as a per-card reveal→Draw/Teleport loop over the top 3 (reuse map's prescribed shape) — net: all 3
// end up in hand by end of turn (drawn now or Teleported back), Teleported ones skip this turn's play.
async function drStrangeSorcererSupreme() {
  const available = playerDeck.length + playerDiscardPile.length;
  const n = Math.min(3, available);
  if (n === 0) {
    onscreenConsole.log("Your deck and discard pile are empty — nothing to reveal.");
    return;
  }
  onscreenConsole.log(
    `<span class="console-highlights">Sorcerer Supreme</span> — reveal the top ${n} card(s) of your deck. Draw any number and Teleport the rest.`,
  );
  for (let i = 0; i < n; i++) {
    await revealTopThenDrawOrTeleport("Sorcerer Supreme");
  }
}

// Dr. Strange — Fight the Future (Uncommon, [INSTINCT] superpower). SPEC L233-238 (LOW).
// "Reveal the top card of the Villain Deck. If it's a Villain, you get +2 Attack and may fight that
// Villain this turn." [INSTINCT] gate handled by the engine dispatch (conditionType "playedCards" /
// condition "Instinct"); this function runs only when met.
//
// DESIGN — Option A (coordinator-confirmed 2026-06-25): the fight is resolved at THIS card's play-time
// via a popup, NOT a persistent deck-top fight target. The defeatVillain pipeline is hard-wired to
// city[]/HQ DOM slots, so a "fight in place on the deck" target would need a synthetic slot + a 4th
// affordability gate + turn-end lifecycle (HIGH risk); a popup-at-resolution is faithful (the player
// controls play order — play Attack generators first, then this) and matches the SHIPPED reveal-top-
// villain fight precedent below.
//
// REUSE — a paid-fight clone of punisherHailOfBulletsDefeat() (cardAbilitiesDarkCity.js:3131): peek the
// villain-deck top, run its fightEffect (with the Mr. Fantastic negate prompt), villainDeck.pop(), then
// defeatNonPlacedVillain() (script.js:14248 — already SWV1-aware: skips the VP push for skrulled /
// gainAsHero villains, fires defeatBonuses, and tallies a defeated Henchman for Inhuman Mastery). The
// ONLY addition vs Punisher (which defeats for free) is paying the villain's Attack. No createVillainCopy
// whitelist concern — this path operates on the live card, never a copy.
//
// NO DOUBLE-RESOLVE: if the player can't afford it or declines, the card is LEFT on top of the Villain
// Deck and the next villain-draw step's processVillainCard() pop() resolves it normally. Only a fought
// villain is popped here. "If it's a Villain" gate = type === "Villain" (matches Punisher; in this engine
// Henchmen carry type "Villain", so a deck-top Henchman is a valid target too).
async function drStrangeFightTheFuture() {
  if (villainDeck.length === 0) {
    onscreenConsole.log("The Villain Deck is empty — nothing to reveal.");
    return;
  }

  // Peek the top without marking it revealed: on any non-fight exit the card is left face-down on the
  // deck (the console message + fight popup already show the player its identity), so the deck-top
  // thumbnail doesn't render face-up and spoil the next villain draw. Matches punisherHailOfBulletsDefeat.
  const topCard = villainDeck[villainDeck.length - 1];

  if (topCard.type !== "Villain") {
    onscreenConsole.log(
      `<span class="console-highlights">Fight the Future</span> — revealed <span class="console-highlights">${topCard.name}</span> from the top of the Villain Deck. Not a Villain — no Attack gained; it stays on top of the Villain Deck.`,
    );
    updateGameBoard();
    return;
  }

  // It's a Villain → +2 Attack (BOTH current-turn AND Final-Showdown cumulative), unconditional on the
  // optional fight. Granted first so it counts toward affording the fight.
  totalAttackPoints += 2;
  cumulativeAttackPoints += 2;
  onscreenConsole.log(
    `<span class="console-highlights">Fight the Future</span> — revealed <span class="console-highlights">${topCard.name}</span> from the top of the Villain Deck. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  updateGameBoard();

  // Honor a villain's fightCondition exactly as showAttackButton does (position-independent check).
  if (
    topCard.fightCondition &&
    topCard.fightCondition !== "None" &&
    !isVillainConditionMet(topCard)
  ) {
    onscreenConsole.log(
      `You cannot fight <span class="console-highlights">${topCard.name}</span> right now (its fight condition is not met). It stays on top of the Villain Deck.`,
    );
    return;
  }

  // Effective Attack cost — recalculateVillainAttack honors attackFrom* modifiers (e.g. a global delta)
  // and skips city-location buffs because the card isn't placed (city.findIndex returns -1). Guard NaN:
  // updateVillainAttackValues reads cityPermBuff[-1] (undefined) for an off-grid card and, under the
  // "Portals to the Dark Dimension" scheme, assigns it straight into attackFromScheme → NaN cost. Fall
  // back to the printed Attack (the off-grid card has no city-position perm-buff anyway). [base-code edge
  // in updateVillainAttackValues — flagged to coordinator; guarded locally here.]
  let cost = recalculateVillainAttack(topCard);
  if (!Number.isFinite(cost) || cost < 0) cost = Math.max(0, topCard.attack || 0);

  // Affordability — mirror the engine fight gate (showAttackButton): recruit-as-attack (Thor "God of
  // Thunder"), Negative Zone, and Bribe (recruit pays a Bribe villain's Attack) honored; a deck-top
  // villain has no reserved attack. A revealed deck-top card can be any in-play villain incl. Bribe ones.
  const hasBribe = topCard.keywords && topCard.keywords.includes("Bribe");
  const available = negativeZoneAttackAndRecruit
    ? totalRecruitPoints + (hasBribe ? totalAttackPoints : 0)
    : totalAttackPoints + ((recruitUsedToAttack || hasBribe) ? totalRecruitPoints : 0);

  if (available < cost) {
    onscreenConsole.log(
      `You don't have enough Attack to fight <span class="console-highlights">${topCard.name}</span> (need ${cost}). It stays on top of the Villain Deck and will be drawn normally.`,
    );
    return;
  }

  // "may fight that Villain" — optional.
  const wantsToFight = await new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Fight ${topCard.name} now for ${cost} Attack? Its Fight effect will trigger.`,
      "Fight it",
      "Not now",
    );
    const title = document.querySelector(".info-or-choice-popup-title");
    if (title) title.textContent = "Fight the Future";
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(true);
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(false);
    };
  });

  if (!wantsToFight) {
    onscreenConsole.log(
      `You chose not to fight <span class="console-highlights">${topCard.name}</span>. It stays on top of the Villain Deck and will be drawn normally.`,
    );
    return;
  }

  // Pay the cost — mirror defeatVillain minus the reserve term (a deck card has no reserve). Bribe and
  // recruit-as-attack both route through the counter-popup so the player picks the Attack/Recruit split.
  playSFX("attack");
  if ((!negativeZoneAttackAndRecruit && recruitUsedToAttack === true) || hasBribe) {
    const result = await showCounterPopup(topCard, cost);
    totalAttackPoints -= result.attackUsed || 0;
    totalRecruitPoints -= result.recruitUsed || 0;
    onscreenConsole.log(
      `You used ${result.attackUsed || 0}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> and ${result.recruitUsed || 0}<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> to fight <span class="console-highlights">${topCard.name}</span>.`,
    );
  } else if (negativeZoneAttackAndRecruit) {
    totalRecruitPoints -= cost;
    onscreenConsole.log(
      `You used ${cost}<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> to fight <span class="console-highlights">${topCard.name}</span>.`,
    );
  } else {
    totalAttackPoints -= cost;
    onscreenConsole.log(
      `You used ${cost}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> to fight <span class="console-highlights">${topCard.name}</span>.`,
    );
  }
  updateReserveAttackAndRecruit();

  // Remove the fought villain from the top of the deck (nothing mutates villainDeck during the awaited
  // popup, so the top is still topCard). Pop BEFORE the fight effect — matches punisherHailOfBulletsDefeat
  // ordering, so a fight effect that itself peeks the villain-deck top doesn't see the card being defeated.
  villainDeck.pop();

  // Run the villain's Fight effect, with the Mr. Fantastic negate prompt (verbatim Punisher pattern).
  try {
    if (topCard.fightEffect && topCard.fightEffect !== "None") {
      const fightEffectFunction = window[topCard.fightEffect];
      if (typeof fightEffectFunction === "function") {
        let negate = false;
        if (typeof promptNegateFightEffectWithMrFantastic === "function") {
          negate = await promptNegateFightEffectWithMrFantastic(topCard, topCard);
        }
        if (!negate) {
          await fightEffectFunction(topCard);
        } else if (topCard.gainAsHero || topCard.corruptSidekick || topCard.skrulled) {
          // Q8 (rules-notes/secret-wars-vol1.md) — converter cancel on the deck-top path. Mirror of the
          // M2 fix in collectDefeatOperations: cancelling a converter's Fight effect ("Gain this as a
          // Hero" — Manhattan/Thor Corps gainAsHero; the Corrupt Sidekick-Villain's gain-to-deck,
          // corruptSidekick→skrulled; or a bare-`skrulled` converter — House of M Scarlet Witch / Secret
          // Invasion Skrull Shapeshifters) leaves the DEFEAT intact (Core p.13: defeat→Victory Pile is a
          // step separate from the Fight effect). Without firing the gain, the route-away flag `skrulled`
          // would make defeatNonPlacedVillain's VP gate (script.js: `!skrulled && !gainAsHero`) skip the
          // push and the card would VANISH (no gain, no VP). Clear the flags so the EXISTING VP push fires
          // — at printed VP for gainAsHero/corruptSidekick, or worth 0 for a skrulled-only converter
          // (gained form has no printed VP). Paul's ruling 2026-07-04 (B8-residual): path-of-least-
          // resistance, all converters fall back to the Victory Pile on cancel.
          topCard.gainAsHero = false;
          topCard.skrulled = false;
        }
      } else {
        console.error(`Fight effect function ${topCard.fightEffect} not found`);
      }
    }
  } catch (error) {
    console.error(`Error in Fight the Future fight effect: ${error}`);
  }

  // Non-placed defeat completion: VP push (SWV1-aware), Soul Gem, defeatBonuses, Henchman tally, etc.
  await defeatNonPlacedVillain(topCard);
  updateGameBoard();
}

// --- Family 5: Lady Thor — "Once per turn, if you made >=6 Recruit this turn" (deferred) ---
// Mirrors throgHighRecruitReward: grant immediately if cumulativeRecruitPoints is already >=6, else
// set a *Pending flag (script.js) that updateGameBoard pays out once 6 Recruit is crossed. Per-title
// once-per-turn via the *Used guard (SPEC-Q5). Reads cumulativeRecruitPoints (total GENERATED this
// turn) so spending Recruit doesn't re-lock. Flags declared/reset in script.js.

function ladyThorMysteriousOrigin() {
  if (ladyThorMysteriousOriginUsed) return; // once per turn
  if (cumulativeRecruitPoints >= 6) {
    ladyThorMysteriousOriginUsed = true;
    onscreenConsole.log(
      `<span class="console-highlights">Mysterious Origin</span> — already made 6 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> this turn. Draw a card.`,
    );
    drawCard();
  } else {
    ladyThorMysteriousOriginPending = true;
    onscreenConsole.log(
      `<span class="console-highlights">Mysterious Origin</span> — once this turn, if you make at least 6 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">, draw a card.`,
    );
  }
}

function ladyThorChosenByAsgard() {
  if (ladyThorChosenByAsgardUsed) return;
  if (cumulativeRecruitPoints >= 6) {
    ladyThorChosenByAsgardUsed = true;
    onscreenConsole.log(
      `<span class="console-highlights">Chosen by Asgard</span> — already made 6 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> this turn. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
    );
    totalAttackPoints += 2;
    cumulativeAttackPoints += 2;
    updateGameBoard();
  } else {
    ladyThorChosenByAsgardPending = true;
    onscreenConsole.log(
      `<span class="console-highlights">Chosen by Asgard</span> — once this turn, if you make at least 6 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">, +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">.`,
    );
  }
}

function ladyThorLivingThunderstorm() {
  if (ladyThorLivingThunderstormUsed) return;
  if (cumulativeRecruitPoints >= 6) {
    ladyThorLivingThunderstormUsed = true;
    onscreenConsole.log(
      `<span class="console-highlights">Living Thunderstorm</span> — already made 6 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> this turn. +6<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
    );
    totalAttackPoints += 6;
    cumulativeAttackPoints += 6;
    updateGameBoard();
  } else {
    ladyThorLivingThunderstormPending = true;
    onscreenConsole.log(
      `<span class="console-highlights">Living Thunderstorm</span> — once this turn, if you make at least 6 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">, +6<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">.`,
    );
  }
}

// --- Family 8: position-restricted reserve attack (reuse cityReserveAttack / mastermindReserveAttack) ---
// Restricted attack is a separate per-target pool (NOT totalAttackPoints) consumed at fight time, so it
// does NOT touch the cumulative totals (mirrors moleManSecretTunnel). Space indices resolved by LABEL
// (citySpaceLabels.indexOf) — resize-safe; never hardcoded. No-op gracefully if a space is absent.

// Namor, the Sub-Mariner — Ruler of the Seas (Common B, [STRENGTH] superpower).
// "You get +2, usable only against Villains on the Bridge or the Mastermind."
function namorTheSubMarinerRulerOfTheSeas() {
  const bridgeIdx = citySpaceLabels.indexOf("The Bridge");
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Strength.svg" alt="Strength Icon" class="console-card-icons"> Hero played. Superpower Ability activated. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> usable only against Villains on the Bridge or the Mastermind.`,
  );
  if (bridgeIdx >= 0) cityReserveAttack[bridgeIdx] += 2;
  mastermindReserveAttack += 2;
  updateGameBoard();
}

// Ultimate Spider-Man — Web-Slinger (Uncommon, special).
// "+2 Attack usable only against the Mastermind or Villains on the Rooftops or Bridge. Reveal the top
// card of your deck. If it costs 2 or less, draw it."
function ultimateSpiderManWebSlinger() {
  const rooftopsIdx = citySpaceLabels.indexOf("The Rooftops");
  const bridgeIdx = citySpaceLabels.indexOf("The Bridge");
  onscreenConsole.log(
    `<span class="console-highlights">Web-Slinger</span> — +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> usable only against the Mastermind or Villains on the Rooftops or Bridge.`,
  );
  if (rooftopsIdx >= 0) cityReserveAttack[rooftopsIdx] += 2;
  if (bridgeIdx >= 0) cityReserveAttack[bridgeIdx] += 2;
  mastermindReserveAttack += 2;
  updateGameBoard();
  revealTopDrawIfCost(2);
}

// --- Family 6 (REUSE half): Henchman free-defeat ---

// Maximus — Mental Domination (Common A, [COVERT] superpower).
// "Defeat a Henchman Villain for free." Reuses defeatVillain(idx, true) (the instant-defeat path runs
// the full chain incl. the target's Fight effect, no Attack spend). Targets restricted to Henchman-class
// (subtype==='Henchman') villains in the city — Henchmen are city-only in this engine (HQ holds Heroes).
// No-op gracefully if none. (The Mastermind / regular-Villain free-defeat branches are built later.)
async function maximusMentalDomination() {
  // Pass ORIGINAL city card refs (not copies) so the target can be resolved by identity at defeat
  // time — robust to any city shift while the modal is open (mirrors Pieces on a Chessboard).
  const items = city.filter((c) => c && c.subtype === "Henchman");
  if (items.length === 0) {
    onscreenConsole.log("No Henchman Villain in the city to defeat for free.");
    return;
  }
  const chosen = await showCardSelectionPopup({
    title: "Defeat a Henchman for Free",
    instructions:
      "Choose a Henchman Villain to defeat for free — its Fight effect still triggers, no Attack is spent.",
    confirmText: "DEFEAT",
    items,
  });
  if (!chosen) return;
  const idx = city.indexOf(chosen);
  if (idx < 0) return;
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> <span class="console-highlights">Mental Domination</span> — defeated <span class="console-highlights">${chosen.name}</span> for free (no Attack spent).`,
  );
  await defeatVillain(idx, true);
}

// --- Singles: deck-peek (reuse drawCard) ---

// Superior Iron Man — Superior to Others (Uncommon, [RANGE] superpower).
// "Look at the top two cards of your deck. If one has a higher cost than the other, draw it. Put the
// rest back in any order." SPEC-Q6: equal cost → draw NOTHING (neither is strictly higher), both stay.
// Reshuffles the discard pile in if fewer than 2 cards remain (existing deck stays on top).
function superiorIronManSuperiorToOthers() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero played. Superpower Ability activated.`,
  );
  if (playerDeck.length < 2 && playerDiscardPile.length > 0) {
    const reshuffled = shuffle(playerDiscardPile);
    playerDiscardPile = [];
    playerDeck = [...reshuffled, ...playerDeck]; // existing deck cards stay on top
    updateGameBoard();
  }
  if (playerDeck.length < 2) {
    onscreenConsole.log("Not enough cards in your deck to look at the top two.");
    return;
  }
  const len = playerDeck.length;
  const top = playerDeck[len - 1];
  const second = playerDeck[len - 2];
  if (top.cost === second.cost) {
    onscreenConsole.log(
      `Top two cards (<span class="console-highlights">${top.name}</span>, <span class="console-highlights">${second.name}</span>) have equal cost — draw nothing; both stay on top.`,
    );
    return;
  }
  if (second.cost > top.cost) {
    // Swap so the higher-cost card is on top, then reuse drawCard() (handles hand + tracking).
    playerDeck[len - 1] = second;
    playerDeck[len - 2] = top;
  }
  const higher = playerDeck[len - 1];
  onscreenConsole.log(
    `Drawing the higher-cost card (<span class="console-highlights">${higher.name}</span>, cost ${higher.cost}); the other stays on top.`,
  );
  drawCard();
}

// Old Man Logan — No More Heroes (Rare, special).
// "Reveal your hand. You get +5 Attack if you haven't played any S.H.I.E.L.D. or HYDRA cards this turn
// and don't have any in your hand." Team tags confirmed in cardDatabase.js: "S.H.I.E.L.D." / "HYDRA".
// Old Man Logan is X-Men, so it never self-disqualifies. (HYDRA Base is a villain group, not a
// player-deck card team, so it is intentionally excluded.)
function oldManLoganNoMoreHeroes() {
  const tags = ["S.H.I.E.L.D.", "HYDRA"];
  onscreenConsole.log(
    `<span class="console-highlights">No More Heroes</span> — reveal your hand.`,
  );
  // Strip copy/simulation residue from the played scan (null self = exclude nothing) so an
  // affordability-simulation artifact can't falsely deny the bonus — consistent with other counts.
  const playedHas = otherRealCardsPlayedThisTurn(null).some((c) =>
    tags.includes(c.team),
  );
  const handHas = playerHand.some((c) => tags.includes(c.team));
  if (!playedHas && !handHas) {
    onscreenConsole.log(
      `No S.H.I.E.L.D. or HYDRA cards played this turn or in your hand. +5<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
    );
    totalAttackPoints += 5;
    cumulativeAttackPoints += 5;
    updateGameBoard();
  } else {
    onscreenConsole.log(
      `A S.H.I.E.L.D. or HYDRA card is ${playedHas ? "among those played this turn" : "in your hand"} — no bonus.`,
    );
  }
}

// --- Teleport-keyword riders (RULING 2026-06-24: either/or — rider fires ONLY on the PLAY branch) ---
// These 3 cards carry keywords:["Teleport"], so the engine routes them through playOrTeleport():
// the player MAY set the card aside (Teleport → rejoins next turn's hand as a bonus card, SKIPS these
// riders) OR PLAY it (playOrTeleport's play branch runs the card's abilities below). No special-casing,
// no Nightcrawler both-fire override — these cards lack an "or Teleport" trigger.

// Magik — Dimensional Portal (Uncommon). "Teleport. For each Sidekick you played this turn, +1 Attack."
function magikDimensionalPortal(card) {
  // Count Sidekicks played this turn. A normally-played Sidekick is stamped sidekickToDestroy=true at
  // play time by returnToSidekickDeck() (cardAbilitiesSidekicks.js), which the shared helper treats as
  // residue and excludes by default — but Magik must count exactly those. Opt in via
  // includeSidekickResidue so all OTHER residue guards stay single-sourced in the helper. Each played
  // Sidekick leaves exactly one copy in cardsPlayedThisTurn (the clone lives in sidekickDeck), so this
  // cannot double-count.
  const sidekickCount = otherRealCardsPlayedThisTurn(card, {
    includeSidekickResidue: true,
  }).filter((c) => c.secondaryType === "Sidekick").length;
  onscreenConsole.log(
    `Sidekicks played this turn: ${sidekickCount}. +${sidekickCount}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += sidekickCount;
  cumulativeAttackPoints += sidekickCount;
  updateGameBoard();
}

// Magik — Wield the Soulsword (Rare). "Teleport. Choose a Villain or Mastermind in your Victory Pile.
// You get +Attack equal to its printed VP."
async function magikWieldTheSoulsword(card) {
  const targets = victoryPile.filter(
    (c) => c.type === "Villain" || c.type === "Mastermind",
  );
  if (targets.length === 0) {
    onscreenConsole.log("No Villain or Mastermind in your Victory Pile.");
    return;
  }
  const chosen = await showCardSelectionPopup({
    title: "Wield the Soulsword",
    instructions:
      "Choose a Villain or Mastermind in your Victory Pile — gain +Attack equal to its printed VP.",
    confirmText: "CHOOSE",
    items: targets,
  });
  if (!chosen) return;
  const vp = chosen.victoryPoints || 0;
  onscreenConsole.log(
    `Chose <span class="console-highlights">${chosen.name}</span> (VP ${vp}). +${vp}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += vp;
  cumulativeAttackPoints += vp;
  updateGameBoard();
}

// Thanos — Transdimensional Overlord (Common B). "Teleport. You may KO a Bystander from your Victory
// Pile. If you do, +2 Attack." The inner "may KO" is a SECOND nested 'may' on the play branch — distinct
// from Teleport's own optional choice (which the engine already handled before this rider runs).
async function thanosTransdimensionalOverlord(card) {
  const bystanders = victoryPile.filter((c) => c.type === "Bystander");
  if (bystanders.length === 0) {
    onscreenConsole.log("No Bystander in your Victory Pile to KO.");
    return;
  }
  const wantsTo = await new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      "Transdimensional Overlord: KO a Bystander from your Victory Pile for +2 Attack?",
      "Yes",
      "No",
    );
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(true);
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(false);
    };
  });
  if (!wantsTo) return;
  let chosen;
  if (bystanders.length === 1) {
    chosen = bystanders[0];
  } else {
    chosen = await showCardSelectionPopup({
      title: "KO a Bystander",
      instructions: "Choose a Bystander from your Victory Pile to KO.",
      confirmText: "KO",
      items: bystanders,
    });
    if (!chosen) return;
  }
  const idx = victoryPile.indexOf(chosen);
  if (idx < 0) return;
  victoryPile.splice(idx, 1);
  koPile.push(chosen);
  onscreenConsole.log(
    `KO'd <span class="console-highlights">${chosen.name}</span> from your Victory Pile. +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += 2;
  cumulativeAttackPoints += 2;
  updateGameBoard();
}

// ============================================================================
// PHASE 3b — BUILD-NEW ENGINE SURFACES (mid-risk batch)
// ============================================================================
// Each pairs with an engine flag/hook in script.js (declared near the Sentinel flags, reset in
// endTurn + initGame). See docs/expansion-progress/secret-wars-vol1-3b-heroes-reusemap.md (Family 10).

// --- Surface 10d: Loner (Old Man Logan) — recruit-this-turn tracker ---
// "If you don't recruit any Heroes this turn, you get +2 Attack." Provisional grant: +2 now if no Hero
// recruited yet (heroRecruitedThisTurn); recruitHeroConfirmed() claws it back from BOTH totals if a Hero
// is later recruited. A Sidekick recruit is NOT a Hero recruit (it uses recruitSidekick()). Multiple
// Loners each stack +2 via lonerAttackApplied.
function oldManLoganLoner() {
  if (!heroRecruitedThisTurn) {
    totalAttackPoints += 2;
    cumulativeAttackPoints += 2;
    lonerAttackApplied += 2;
    onscreenConsole.log(
      `<span class="console-highlights">Loner</span> — no Hero recruited yet this turn: +2<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained (removed if you recruit a Hero this turn).`,
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(
      `<span class="console-highlights">Loner</span> — you already recruited a Hero this turn, so no bonus.`,
    );
  }
}

// --- Surface 10a: Untouchable (Apocalyptic Kitty Pryde) — reactive cancel of a Fight effect ---
// "When any player defeats a Villain or Mastermind with a 'Fight' effect, you may discard this card to
// cancel that fight effect. If you do, draw three cards." A REACTIVE from-hand interceptor — the same
// engine primitive as Mr. Fantastic's Ultimate Nullifier (promptNegateFightEffectWithMrFantastic): both
// cancel a pending Villain/Mastermind Fight effect at the resolution window. Hooked alongside that prompt
// in collectDefeatOperations() (all Villain/Henchman defeats) and resolveTacticEffects() (Mastermind
// tactics) in script.js — offered only when the player did NOT already negate with Mr. Fantastic. Solo
// "any player" = the active player. Cancels ONLY the Fight effect; the Villain/tactic is still defeated
// (the Victory-Pile push happens separately in the caller, exactly as for the Mr. Fantastic negate).
// Locations and the Burrow keyword are NOT card Fight effects → deliberately out of scope (no hook there).

// On play: Untouchable's value is its reactive from-hand cancel (offerUntouchableCancel below). Playing
// the card just yields its printed Recruit and prints this reminder — the interception happens later,
// during Villain/Mastermind Fight-effect resolution while the card sits in hand. Mirrors Hellcat's
// hellcatSecondChanceAtLife (expansionRevelations.js).
function apocalypticKittyPrydeUntouchable() {
  onscreenConsole.log(
    `<span class="console-highlights">Untouchable</span>: while this card is in your hand, you may discard it to cancel a Villain or Mastermind Fight effect, then draw three cards.`,
  );
}

// Reactive from-hand interceptor. Returns true if the Fight effect was cancelled (caller must skip it),
// false otherwise. No-op (no prompt) unless the player holds Untouchable in hand. On accept: discard
// Untouchable from hand (plain discard) and draw three cards. effectLabel = the Villain/tactic name, for
// the prompt + log only.
async function offerUntouchableCancel(effectLabel) {
  const card = playerHand.find(
    (c) => c && c.name === "Apocalyptic Kitty Pryde - Untouchable",
  );
  if (!card) return false;

  const accepted = await askToDiscardUntouchable(card, effectLabel);
  if (!accepted) return false;

  // Discard Untouchable from hand (plain discard — not an invulnerability-return card).
  const idx = playerHand.findIndex((c) => c === card);
  if (idx !== -1) playerHand.splice(idx, 1);
  playerDiscardPile.push(card);

  // Draw three cards (drawCard, not drawOne — the latter is the turn-cleanup queue wrapper).
  drawCard();
  drawCard();
  drawCard();

  onscreenConsole.log(
    `<span class="console-highlights">Untouchable</span> discarded to cancel ${
      effectLabel
        ? `<span class="console-highlights">${effectLabel}</span>'s`
        : "the"
    } Fight effect. Drew three cards.`,
  );
  updateGameBoard();
  return true;
}

// Yes/No popup for Untouchable — mirrors askToDiscardSecondChance (expansionRevelations.js).
async function askToDiscardUntouchable(card, effectLabel) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { confirmButton, denyButton } = showHeroAbilityMayPopup(
        `${
          effectLabel
            ? `<span class="console-highlights">${effectLabel}</span>'s`
            : "This"
        } Fight effect is about to resolve. Discard <span class="console-highlights">${card.name}</span> to cancel it and draw three cards?`,
        "Yes",
        "No",
      );

      // Title is a plain constant string — textContent (not innerHTML) is equivalent and safe.
      const titleEl = document.querySelector(".info-or-choice-popup-title");
      if (titleEl) titleEl.textContent = "Apocalyptic Kitty Pryde - Untouchable";

      const previewArea = document.querySelector(
        ".info-or-choice-popup-preview",
      );
      if (previewArea && card.image) {
        previewArea.style.backgroundImage = `url('${card.image}')`;
        previewArea.style.backgroundSize = "contain";
        previewArea.style.backgroundRepeat = "no-repeat";
        previewArea.style.backgroundPosition = "center";
        previewArea.style.display = "block";
      }

      confirmButton.onclick = () => {
        closeInfoChoicePopup();
        resolve(true);
      };

      denyButton.onclick = () => {
        closeInfoChoicePopup();
        resolve(false);
      };
    }, 10);
  });
}

// --- Surface 10e: Infiltrate HQ (Apocalyptic Kitty Pryde) — per-card cost reduction ---
// "You may put a Hero from the HQ on the bottom of the Hero Deck. The Hero that replaces it in the HQ
// costs 1 less during this turn." Optional (the card picker is cancellable = decline). Reuses
// returnHeroToDeck() (hero → bottom of Hero Deck, slot refills — mode-aware: Golden rotates the new card
// to the rightmost slot, What If? fills in place). The discount is tagged on the replacement CARD object
// (not the slot) so it stays with that specific Hero across rotation, and is read in showHeroRecruitButton().
async function apocalypticKittyPrydeInfiltrateHQ() {
  const heroesInHQ = hq.filter((c) => c && c.type === "Hero");
  if (heroesInHQ.length === 0) {
    onscreenConsole.log("No Hero in the HQ to put on the bottom of the Hero Deck.");
    return;
  }
  const chosen = await showCardSelectionPopup({
    title: "Infiltrate HQ",
    instructions:
      "You may put a Hero from the HQ on the bottom of the Hero Deck — its replacement costs 1 less this turn.",
    confirmText: "INFILTRATE",
    items: heroesInHQ,
  });
  if (!chosen) return; // cancel = decline the optional "may"
  const hqIndex = hq.indexOf(chosen);
  if (hqIndex < 0) return;
  // Capture the replacement BEFORE the move: both refill modes pop the current top of the Hero Deck, so
  // the top element is the replacement regardless of Golden-rotate vs What If?-in-place. (Empty deck →
  // no replacement to discount.)
  const replacement = heroDeck.length > 0 ? heroDeck[heroDeck.length - 1] : null;
  onscreenConsole.log(
    `<span class="console-highlights">Infiltrate HQ</span> — <span class="console-highlights">${chosen.name}</span> goes to the bottom of the Hero Deck.`,
  );
  returnHeroToDeck(hqIndex); // hero → bottom of deck, slot refills (mode-aware), logs + redraws
  if (replacement) {
    replacement.infiltrateHQCostReduction =
      (replacement.infiltrateHQCostReduction || 0) + 1;
    infiltrateHQDiscountedCards.push(replacement);
    onscreenConsole.log(
      `<span class="console-highlights">${replacement.name}</span> costs 1 less <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> to recruit this turn.`,
    );
  }
}

// --- Surface 10c: per-turn space-keyed / any-villain defeat listeners ---

// Black Panther — Stalk the Urban Jungle (Uncommon, special). "Whenever you defeat a Villain on the
// Rooftops or Streets this turn, you may KO one of your cards or a card from your discard pile."
// Arms the listener; handlePostDefeat (script.js) fires the optional KO on each qualifying defeat. The
// forward-looking "this turn" buff applies only to defeats AFTER this card is played (SPEC reading).
function blackPantherStalkTheUrbanJungle() {
  blackPantherStalkActive = true;
  onscreenConsole.log(
    `<span class="console-highlights">Stalk the Urban Jungle</span> — this turn, whenever you defeat a Villain on the Rooftops or Streets, you may KO a card from your hand or discard pile.`,
  );
}

// Maximus — Enslave the Will (Common B, [TECH] superpower). "Whenever you defeat a Villain this turn,
// you gain a Sidekick." Arms the listener; defeatBonuses (cardAbilities.js) gains a Sidekick on every
// Villain defeat this turn (cost-free, cap-free; does NOT touch the 1-per-turn recruit cap). The engine
// only calls this when a [TECH] Hero was played this turn.
function maximusEnslaveTheWill() {
  maximusEnslaveActive = true;
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> Hero played. Superpower Ability activated — <span class="console-highlights">Enslave the Will</span>: this turn, whenever you defeat a Villain, gain a Sidekick.`,
  );
}

// --- Surface 6 (consumer) / 10c: Maximus — Inhuman Mastery (Rare) ---
// Special: "Each other player reveals a [TECH] Hero or chooses a Henchman Villain from their Victory
// Pile. You defeat all those Henchmen for free." RATIFIED NO-OP (2026-06-24): pulls from OTHER players'
// Victory Piles = a source with no solo equivalent → nothing happens in solo (Family-9 / Q1 split rule).
function maximusInhumanMastery() {
  onscreenConsole.log(
    `<span class="console-highlights">Inhuman Mastery</span> — the special asks each OTHER player to surrender a Henchman from their Victory Pile; in solo there are no other players, so nothing happens.`,
  );
}

// Superpower [CABAL]: "You get +1 Attack for each Henchman you defeated this turn." Reads the engine's
// henchmenDefeatedThisTurn tally (incremented in the 3 villain post-defeat handlers, so it captures
// defeats by ANY means this turn — normal fights, Mental Domination, Enslave-driven, etc.), not just
// this card. Engine only calls this when a [CABAL] Hero (team) was played this turn.
function maximusInhumanMasteryCabal() {
  const bonus = henchmenDefeatedThisTurn;
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Cabal.png" alt="Cabal Icon" class="console-card-icons"> Hero played. Superpower Ability activated — Henchmen you defeated this turn: ${bonus}. +${bonus}<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> gained.`,
  );
  totalAttackPoints += bonus;
  cumulativeAttackPoints += bonus;
  updateGameBoard();
}

// --- Surface 6: free defeat of a city/HQ Villain or the (MAIN) Mastermind ---
// "Defeat a Villain/Mastermind for free" = run the full defeat chain (the target's Fight effect still
// fires) with NO Attack spent. City villains → defeatVillain(idx, true); HQ villains →
// instantDefeatHQVillain(idx); the Mastermind → freeDefeatMastermind(). Under the Multiple-Masterminds
// keystone, "the Mastermind" = the MAIN mastermind (task brief / rules-notes Q1). Henchmen carry
// type:"Villain", so a type-Villain filter includes them.

// Defeat the city/HQ Villain referenced by `chosen` (by object identity) for free. Returns true on hit.
async function defeatCityOrHQVillainByRef(chosen) {
  const cityIdx = city.indexOf(chosen);
  if (cityIdx >= 0) {
    await defeatVillain(cityIdx, true);
    return true;
  }
  const hqIdx = hq.indexOf(chosen);
  if (hqIdx >= 0) {
    await instantDefeatHQVillain(hqIdx);
    return true;
  }
  return false;
}

// Present a picker over city + HQ Villains passing filterFn; free-defeat the chosen one. Returns true if
// a villain was defeated, false if there were no targets or the player cancelled.
async function freeDefeatVillainFromCityOrHQ(filterFn, title, instructions) {
  const targets = [];
  city.forEach((c) => {
    if (c && c.type === "Villain" && filterFn(c)) targets.push(c);
  });
  hq.forEach((c) => {
    if (c && c.type === "Villain" && filterFn(c)) targets.push(c);
  });
  if (targets.length === 0) return false;
  const chosen = await showCardSelectionPopup({
    title,
    instructions,
    confirmText: "DEFEAT",
    items: targets,
  });
  if (!chosen) return false;
  onscreenConsole.log(
    `Defeated <span class="console-highlights">${chosen.name}</span> for free (no Attack spent).`,
  );
  return defeatCityOrHQVillainByRef(chosen);
}

// Free-defeat the MAIN mastermind: ONE mastermind fight with no Attack spent. Reuses the engine's own
// normal mastermind-defeat tail (createMastermindCopy → collectMastermindRescueOperations →
// handleMastermindPostDefeat), so a free defeat fires the SAME path a paid fight does — captured-
// Bystander rescue, shards, rescueExtraBystanders, defeat bonuses, and popping ONE Tactic (its effect +
// win check via revealMastermindTactic → checkMastermindState) — minus only the Attack spend.
// There is NO separate "4-defeat" integer counter: the Golden 4 defeats / What If? progress are both
// modeled as the 4 Tactics, so removing one Tactic IS one defeat. The tactics===0 guard keeps a free
// defeat from delivering the Golden Final Showdown (a free defeat removes a Tactic; it never skips the
// strength+4 finale) — if no Tactics remain it is a graceful no-op. [INTERIM Golden-interaction read —
// flagged to coordinator.]
async function freeDefeatMastermind() {
  const mastermind = getSelectedMastermind();
  if (mastermind.tactics.length === 0) {
    onscreenConsole.log(
      `<span class="console-highlights">${mastermind.name}</span> has no Tactics left to remove — defeat them in the Final Showdown to win.`,
    );
    checkMastermindState();
    return;
  }
  onscreenConsole.log(
    `You defeat <span class="console-highlights">${mastermind.name}</span> once for free — no Attack spent.`,
  );
  const mastermindCopy = createMastermindCopy(mastermind);
  const operations = await collectMastermindRescueOperations(mastermindCopy);
  if (operations.length > 1) {
    await executeOperationsInPlayerOrder(operations, mastermindCopy);
  } else if (operations.length === 1) {
    await operations[0].execute();
  }
  await handleMastermindPostDefeat(
    mastermind,
    mastermindCopy,
    recalculateMastermindAttack(mastermind),
  );
}

// Namor — Imperius Rex (Rare). Special: "Defeat a Villain for free." Superpower
// [INSTINCT][INSTINCT][STRENGTH][STRENGTH]: "Instead, defeat the Mastermind once for free." The
// superpower REPLACES the special (either/or), so this is a SINGLE unconditional ability that checks the
// threshold itself and offers the choice — the DB's conditionalAbility is "None" (a two-function split
// would let the engine fire BOTH, double-resolving "Instead"). The threshold uses the same
// isConditionMet() the engine would, which excludes this card via slice(0,-1).
async function namorTheSubMarinerImperiusRex(card) {
  const superpowerMet = isConditionMet(
    "playedCards",
    "Instinct&Instinct&Strength&Strength",
  );
  if (!superpowerMet) {
    await imperiusRexDefeatVillainFree();
    return;
  }
  const choseMastermind = await new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      "Imperius Rex — your superpower is active. Defeat the Mastermind once for free, or instead defeat a Villain for free?",
      "Defeat the Mastermind",
      "Defeat a Villain",
    );
    const title = document.querySelector(".info-or-choice-popup-title");
    if (title) title.textContent = "Imperius Rex";
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(true);
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      resolve(false);
    };
  });
  if (choseMastermind) {
    await freeDefeatMastermind();
  } else {
    await imperiusRexDefeatVillainFree();
  }
}

async function imperiusRexDefeatVillainFree() {
  const defeated = await freeDefeatVillainFromCityOrHQ(
    () => true,
    "Imperius Rex",
    "Choose a Villain to defeat for free — its Fight effect still triggers, no Attack is spent.",
  );
  if (!defeated) {
    onscreenConsole.log("No Villain available to defeat for free.");
  }
}

// Thanos — Utter Annihilation (Rare, special). "KO six Bystanders from the Bystander Stack. Then, defeat
// any Villain or Mastermind whose Attack is less than the number of Bystanders in the KO pile."
// Sequencing: KO up to 6 FIRST (so they count toward the threshold), THEN compare each target's LIVE
// (recalculated) Attack — strictly less-than. The Mastermind option = the MAIN mastermind (keystone).
async function thanosUtterAnnihilation(card) {
  // (1) KO up to six Bystanders from the Bystander Stack (fewer if the Stack is short).
  let koed = 0;
  for (let i = 0; i < 6 && bystanderDeck.length > 0; i++) {
    koPile.push(bystanderDeck.pop());
    koed++;
  }
  onscreenConsole.log(
    `<span class="console-highlights">Utter Annihilation</span> — KO'd ${koed} Bystander(s) from the Bystander Stack.`,
  );
  updateGameBoard();
  // (2) Count Bystanders now in the KO pile (includes the ones just KO'd).
  const threshold = koPile.filter((c) => c.type === "Bystander").length;
  // (3) Build the eligible-target list: city/HQ Villains + the MAIN Mastermind whose LIVE Attack < threshold.
  const items = [];
  city.forEach((c) => {
    if (c && c.type === "Villain" && recalculateVillainAttack(c) < threshold) items.push(c);
  });
  hq.forEach((c) => {
    if (c && c.type === "Villain" && recalculateVillainAttack(c) < threshold) items.push(c);
  });
  const mastermind = getSelectedMastermind();
  let mmItem = null;
  if (recalculateMastermindAttack(mastermind) < threshold) {
    // A lightweight pseudo-item for the picker; resolved by object identity below.
    mmItem = { name: mastermind.name, image: mastermind.image, _utterAnnihilationMM: true };
    items.push(mmItem);
  }
  if (items.length === 0) {
    onscreenConsole.log(
      `No Villain or Mastermind has Attack less than ${threshold} — nothing is defeated.`,
    );
    return;
  }
  const chosen = await showCardSelectionPopup({
    title: "Utter Annihilation",
    instructions: `Defeat any Villain or Mastermind whose Attack is less than ${threshold} for free — its Fight effect still triggers, no Attack is spent.`,
    confirmText: "DEFEAT",
    items,
  });
  if (!chosen) return;
  if (chosen === mmItem) {
    await freeDefeatMastermind();
    return;
  }
  onscreenConsole.log(
    `Defeated <span class="console-highlights">${chosen.name}</span> for free (no Attack spent).`,
  );
  await defeatCityOrHQVillainByRef(chosen);
}

// --- VILLAIN CARD EFFECTS ---

// Domain of Apocalypse — Apocalyptic Magneto (DB id 282, Attack 8 / VP 6).
// Fight: "Gain an X-Men Hero from the HQ for free." Reuse recruitXMen() (cardAbilities.js) — the
// shipped "free X-Men Hero from HQ → discard, refill slot" operation (base Magneto's Bitter Captor
// tactic). It greys-out non-X-Men slots and no-ops gracefully when no X-Men Hero is available.
async function apocalypticMagnetoFight(villainCard) {
  await recruitXMen();
}

// Escape: "Magneto ascends to become a new Mastermind." Registers a second active (ascended)
// Mastermind via the shared Multiple-Masterminds keystone (script.js ascendToMastermind):
// no Tactics, defeated by one fight at printed Attack 8, reverts to a VP-6 Villain in the Victory
// Pile on defeat. Granted ability is the base Magneto Master Strike ("Each player reveals an X-Men
// Hero or discards down to four cards") — identical text; reuse magnetoStrike() (cardAbilities.js),
// which already self-applies correctly in solo. Win now requires defeating this Mastermind too
// (Golden Solo: additional must-kill gate outside Final Showdown math; What If? Solo: per p.19).
async function apocalypticMagnetoEscape(villainCard) {
  ascendToMastermind(villainCard, {
    masterStrikeFn: "magnetoStrike",
    masterStrikeConsoleLog:
      "Each player reveals an <img src='Visual Assets/Icons/X-Men.svg' alt='X-Men Icon' class='console-card-icons'> Hero or discards down to four cards.",
    defeatAttack: 8,
    vp: 6,
  });
}

// Domain of Apocalypse — Apocalyptic Blink (DB id 281, Attack 5 / VP 3).
// Fight: "Reveal the top card of your deck. Draw it or Teleport it." Solo = active player only.
// Reveal playerDeck top (reshuffle the discard pile in if the deck is empty); two-button choice —
// Draw (drawCard() pops the revealed top card to hand) or Teleport (route through the real teleport()
// so it returns next turn via cardsToBeDrawnNextTurn). Same reveal→draw-or-teleport shape as
// Dr. Strange "Cloak of Levitation" and Inferno Darkchilde (KO variant, Limbo).
async function apocalypticBlinkFight(villainCard) {
  if (playerDeck.length === 0) {
    if (playerDiscardPile.length === 0) {
      onscreenConsole.log("Your deck and discard pile are empty — nothing to reveal.");
      return;
    }
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
    updateGameBoard();
  }
  const revealed = playerDeck[playerDeck.length - 1]; // top of deck = end of array
  onscreenConsole.log(
    `<span class="console-highlights">Apocalyptic Blink</span> — revealed <span class="console-highlights">${revealed.name}</span> from the top of your deck. Draw it or Teleport it.`,
  );
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal: ${revealed.name}. Draw it or Teleport it?`,
      "Draw it",
      "Teleport it",
    );
    const title = document.querySelector(".info-or-choice-popup-title");
    if (title) title.textContent = "Apocalyptic Blink";
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      drawCard(); // pops the revealed top card into hand
      resolve();
    };
    denyButton.onclick = async () => {
      closeInfoChoicePopup();
      const card = playerDeck.pop(); // the revealed top card
      playerHand.push(card); // teleport() expects the card in hand; it removes it to the next-turn queue
      await teleport(card);
      resolve();
    };
  });
}

// Domain of Apocalypse — Apocalyptic Rogue (DB id 283, Attack 6 / VP 4).
// Fight: "Reveal the top card of the Hero deck. The player of your choice gains it." Solo: the only
// player is the active player, who gains the revealed Hero (from the Hero DECK top, not an HQ slot →
// no HQ refill) to their discard pile.
async function apocalypticRogueFight(villainCard) {
  if (heroDeck.length === 0) {
    onscreenConsole.log("The Hero deck is empty — nothing to reveal.");
    return;
  }
  const card = heroDeck.pop(); // top of Hero deck = end of array
  playerDiscardPile.push(card);
  onscreenConsole.log(
    `<span class="console-highlights">Apocalyptic Rogue</span> — you gain <span class="console-highlights">${card.name}</span> from the top of the Hero deck to your discard pile.`,
  );
  updateGameBoard();
}

// Escape: "Reveal the top card of the Hero deck. Each player reveals their hand and discards a card
// of that class." Solo: the active player. PEEK the Hero deck top to name a class (it is NOT gained on
// Escape — leave it on top). Force-discard one hand card matching that class (any class for dual-class
// cards), routed through checkDiscardForInvulnerability(). Multiple matches → player picks which (the
// mandatory discard is the player's own card); reuse showCardSelectionPopup(). No match → no discard.
async function apocalypticRogueEscape(villainCard) {
  if (heroDeck.length === 0) {
    onscreenConsole.log("The Hero deck is empty — no class to reveal.");
    return;
  }
  const revealed = heroDeck[heroDeck.length - 1]; // peek; stays on top of the Hero deck
  const wantedClasses = (revealed.classes || []).map((c) => String(c).toLowerCase());
  onscreenConsole.log(
    `<span class="console-highlights">Apocalyptic Rogue</span> — revealed <span class="console-highlights">${revealed.name}</span> (${(revealed.classes || []).join("/") || "no class"}). Discard a matching card from your hand.`,
  );
  const isMatch = (c) =>
    c.classes && c.classes.some((cl) => wantedClasses.includes(String(cl).toLowerCase()));
  const eligible = playerHand.filter(isMatch);
  if (eligible.length === 0) {
    onscreenConsole.log("No matching card in your hand — nothing discarded.");
    return;
  }
  let chosen = eligible[0];
  if (eligible.length > 1) {
    chosen = await showCardSelectionPopup({
      title: "Apocalyptic Rogue",
      instructions: `Discard a matching card from your hand (${(revealed.classes || []).join("/")}).`,
      confirmText: "DISCARD",
      items: eligible,
    });
  }
  playerHand.splice(playerHand.indexOf(chosen), 1);
  await checkDiscardForInvulnerability(chosen);
  updateGameBoard();
}

// Domain of Apocalypse — Apocalyptic Weapon X (DB id 284, Attack 7 / VP 5).
// Fight: "KO one of your Heroes." Reuse FightKOHeroYouHave() (cardAbilities.js) — picker over Heroes
// in hand/artifacts/played; parameterized title + empty-pool guard confirmed fixed. Mandatory if able.
async function apocalypticWeaponXFight(villainCard) {
  await FightKOHeroYouHave("Apocalyptic Weapon X");
}

// Escape: "Cross-Dimensional Wolverine Rampage." SHARED helper — reveal a Wolverine-family card
// (name contains "Wolverine", "Weapon X", or "Old Man Logan") or gain a Wound.
async function apocalypticWeaponXEscape(villainCard) {
  await crossDimensionalRampage(
    ["Wolverine", "Weapon X", "Old Man Logan"],
    "Apocalyptic Weapon X",
  );
}

// Limbo — Inferno Colossus (DB id 285, Attack 5 / VP 3).
// Ambush: "The Mastermind captures a Bystander." The bystander attaches to the MASTERMIND (its
// .bystanders array), not to Colossus. Reuse the bystanderDeck source (mirrors demogoblinAmbush) +
// the MM-capture plumbing attachBystanderToMastermindFromVillainDeck() (popup + attach to the main
// mastermind via getSelectedMastermind). Multi-mastermind "the Mastermind" picker is deferred to 3e
// (secondary-MM captured-bystander wiring); main mastermind is correct for the common case.
async function infernoColossusAmbush(villainCard) {
  onscreenConsole.log(
    `Ambush! <span class="console-highlights">Inferno Colossus</span> — the Mastermind captures a Bystander.`,
  );
  if (bystanderDeck.length === 0) {
    onscreenConsole.log("There are no Bystanders left to be captured.");
    return;
  }
  // Q7 (rules-notes/secret-wars-vol1.md): a Bystander captured by Madelyne becomes a "Demon Goblin"
  // Villain regardless of WHICH effect triggered the capture (her card overrides generic handling;
  // Core p.16). Madelyne Always Leads Limbo, so she is the default Mastermind here. Route through the
  // canonical madelyneCapture() conversion path (Bystander Stack -> shared demonGoblinDeck) instead of
  // attaching to the generic mastermind.bystanders store. Marker: the unfightableWhileDemonGoblins flag.
  const mastermind = getSelectedMastermind();
  if (mastermind && mastermind.unfightableWhileDemonGoblins === true) {
    await madelyneCapture(1);
    return;
  }
  const card = bystanderDeck.pop();
  await attachBystanderToMastermindFromVillainDeck(card);
}

// Fight: "KO one of your Heroes." Reuse FightKOHeroYouHave() (parameterized title + empty-pool guard).
async function infernoColossusFight(villainCard) {
  await FightKOHeroYouHave("Inferno Colossus");
}

// Limbo — Inferno Cyclops (DB id 286, Attack 6 / VP 4).  (confidence: LOW)
// Ambush: "Inferno Cyclops captures a Bystander." The bystander attaches to THIS villain card
// (city[index].bystander array) — mirror demogoblinAmbush exactly.
async function infernoCyclopsAmbush(villainCard) {
  onscreenConsole.log(
    `Ambush! <span class="console-highlights">Inferno Cyclops</span> captures a Bystander.`,
  );
  if (bystanderDeck.length === 0) {
    onscreenConsole.log("There are no Bystanders left to be captured.");
    return;
  }
  const card = bystanderDeck.pop();
  const cyclopsIndex = city.findIndex((c) => c === villainCard);
  if (cyclopsIndex === -1) {
    onscreenConsole.log("Inferno Cyclops is not in the city — Bystander not captured.");
    return;
  }
  await attachBystanderToVillain(cyclopsIndex, card);
}

// Escape: "The Mastermind captures all the Bystanders this Villain had. (Players still discard for the
// Bystander being carried away.)" handleVillainEscape() runs FIRST and, by default, pushes a villain's
// attached bystanders to escapedVillainsDeck (lost) and fires the carry-away discard (showDiscardCardPopup,
// 1 card) via handleVillainEscapeActions.handleDiscard — both BEFORE this escapeEffect runs. So this
// effect REDIRECTS those bystanders out of escapedVillainsDeck and onto the Mastermind's .bystanders
// (the card OVERRIDES the default "bystander is lost"); the discard penalty has already been applied by
// the default path, satisfying "players still discard." Main mastermind per the 3e multi-MM deferral.
async function infernoCyclopsEscape(villainCard) {
  const carried = villainCard.bystander || [];
  if (carried.length === 0) {
    onscreenConsole.log(
      `<span class="console-highlights">Inferno Cyclops</span> was carrying no Bystanders.`,
    );
    return;
  }
  const mastermind = getSelectedMastermind();
  // Q7 (rules-notes/secret-wars-vol1.md): Bystanders captured by Madelyne become "Demon Goblin" Villains
  // regardless of the triggering effect (her card overrides generic handling; Core p.16). When the
  // Mastermind is Madelyne (unfightableWhileDemonGoblins), redirect the carried Bystanders — already
  // undone from escapedVillainsDeck below — into the shared demonGoblinDeck instead of the generic
  // mastermind.bystanders store. The carry-away discard penalty already fired in the default
  // handleVillainEscape path (Core p.15); conversion neither adds nor removes a discard — independent.
  const toGoblins = !!mastermind && mastermind.unfightableWhileDemonGoblins === true;
  if (!toGoblins && mastermind && !mastermind.bystanders) mastermind.bystanders = [];
  carried.forEach((b) => {
    const i = escapedVillainsDeck.indexOf(b); // undo the default "escaped with the villain" push
    if (i !== -1) escapedVillainsDeck.splice(i, 1);
    if (toGoblins) {
      demonGoblinDeck.push(b); // captured by Madelyne -> fightable 2-Attack Demon Goblin
    } else {
      mastermind.bystanders.push(b);
    }
  });
  villainCard.bystander = []; // transferred off the villain
  updateMastermindOverlay();
  onscreenConsole.log(
    toGoblins
      ? `Madelyne captures ${carried.length} Bystander${carried.length !== 1 ? "s" : ""} that <span class="console-highlights">Inferno Cyclops</span> was carrying — ${carried.length === 1 ? 'it becomes a "Demon Goblin" Villain' : 'they become "Demon Goblin" Villains'}.`
      : `The Mastermind captures ${carried.length} Bystander${carried.length !== 1 ? "s" : ""} that <span class="console-highlights">Inferno Cyclops</span> was carrying.`,
  );
  updateGameBoard();
}

// Limbo — Inferno Darkchilde (DB id 287, Attack 5 / VP 3).
// Fight: "Reveal the top card of your deck. KO it or Teleport it." Same reveal→choice shape as
// Apocalyptic Blink, but the non-Teleport branch KOs (koPile) instead of drawing (mirrors demogoblinFeast's
// KO-the-deck-top: koPile.push + koBonuses).
async function infernoDarkchildeFight(villainCard) {
  if (playerDeck.length === 0) {
    if (playerDiscardPile.length === 0) {
      onscreenConsole.log("Your deck and discard pile are empty — nothing to reveal.");
      return;
    }
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
    updateGameBoard();
  }
  const revealed = playerDeck[playerDeck.length - 1];
  onscreenConsole.log(
    `<span class="console-highlights">Inferno Darkchilde</span> — revealed <span class="console-highlights">${revealed.name}</span> from the top of your deck. KO it or Teleport it.`,
  );
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal: ${revealed.name}. KO it or Teleport it?`,
      "KO it",
      "Teleport it",
    );
    const title = document.querySelector(".info-or-choice-popup-title");
    if (title) title.textContent = "Inferno Darkchilde";
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      const card = playerDeck.pop();
      koPile.push(card);
      koBonuses();
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = async () => {
      closeInfoChoicePopup();
      const card = playerDeck.pop();
      playerHand.push(card); // teleport() removes it from hand into the next-turn queue
      await teleport(card);
      resolve();
    };
  });
}

// Escape: "Each player Teleports a random card from their hand." Solo: the active player Teleports ONE
// engine-chosen random hand card (returns next turn via the real teleport()). Empty hand → no-op.
async function infernoDarkchildeEscape(villainCard) {
  if (playerHand.length === 0) {
    onscreenConsole.log("Your hand is empty — nothing to Teleport.");
    return;
  }
  const idx = Math.floor(Math.random() * playerHand.length);
  const card = playerHand[idx];
  onscreenConsole.log(
    `<span class="console-highlights">Inferno Darkchilde</span> — you Teleport a random card (<span class="console-highlights">${card.name}</span>) from your hand.`,
  );
  await teleport(card);
}

// Limbo — Inferno Nightcrawler (DB id 288, Attack 4 / VP 2).
// Fight: "Up to two cards in your hand that have a Recruit icon gain Teleport this turn." Player may
// grant Teleport to 0, 1, or 2 eligible hand cards (recruitIcon === true, not already Teleport). Reuse
// the Azazel grant pattern (keywords.push("Teleport"); temporaryTeleport = true) — the engine's
// end-of-turn / on-teleport cleanup strips the temp keyword. Up-to-2 via a loop over the proven
// showCardSelectionPopup() with a "DONE" sentinel tile (no bespoke multi-select needed).
async function infernoNightcrawlerFight(villainCard) {
  let eligible = playerHand.filter(
    (c) => c.recruitIcon === true && !(c.keywords || []).includes("Teleport"),
  );
  if (eligible.length === 0) {
    onscreenConsole.log(
      "No cards with a Recruit icon in your hand to gain Teleport.",
    );
    return;
  }
  let granted = 0;
  while (granted < 2 && eligible.length > 0) {
    const doneTile = { name: "Done", text: "DONE", _doneSentinel: true };
    const choice = await showCardSelectionPopup({
      title: "Inferno Nightcrawler",
      instructions: `Choose a card with a Recruit icon to gain Teleport this turn (${granted}/2 chosen), or choose DONE.`,
      confirmText: "CONFIRM",
      items: [...eligible, doneTile],
    });
    if (!choice || choice._doneSentinel) break;
    if (!choice.keywords) choice.keywords = [];
    choice.keywords.push("Teleport");
    choice.temporaryTeleport = true;
    granted++;
    onscreenConsole.log(
      `<span class="console-highlights">${choice.name}</span> gains Teleport this turn.`,
    );
    eligible = eligible.filter((c) => c !== choice);
  }
  updateGameBoard();
}

// Manhattan (Earth-1610) — all four: "Fight: Gain this as a Hero." The DB entries carry gainAsHero:true
// (skips the Victory-Pile push, script.js defeat handlers) and a fightEffect that calls the shared
// gainVillainAsHero() converter with the card's Hero form (inventory Section 1 hero-stats table).
// Hero cost = old Villain Attack value (insert p.1). These have no VP (gained as Heroes, not scored).

// Ultimate Captain America (DB id 289, Villain Attack 6) → Avengers / Strength / 0+ Attack,
// "You get +1 Attack for each color of Hero you have" (unconditional, fires on later play).
// RULING (Finding G, rules-notes BATCH 3): this is a reskin of Core "Captain America – Perfect
// Teamwork" — identical effect. REUSE the shipped counter CaptainAmericaCountUniqueColorsAndAddAttack
// (cardAbilities.js), which counts DISTINCT Hero colors across HAND + Artifacts + play this turn
// (includes this card), updating both Attack totals. (Only 5 colors exist, so the +5 cap is implicit.)
async function ultimateCaptainAmericaFight(villainCopy) {
  gainVillainAsHero(villainCopy, {
    team: "Avengers",
    classes: ["Strength"],
    color: "Green",
    cost: 6,
    attack: 0,
    attackIcon: true,
    unconditionalAbility: "CaptainAmericaCountUniqueColorsAndAddAttack",
  });
}

// Ultimate Captain Marvel (DB id 290, Villain Attack 4) → Avengers / Range / 2 Recruit, Teleport keyword.
async function ultimateCaptainMarvelFight(villainCopy) {
  gainVillainAsHero(villainCopy, {
    team: "Avengers",
    classes: ["Range"],
    color: "Blue",
    cost: 4,
    recruit: 2,
    recruitIcon: true,
    keywords: ["Teleport"],
  });
}

// Ultimate Thor (DB id 291, Villain Attack 7) → Avengers / Range / 3+ Attack, "[RANGED]: You get +3
// Attack" (superpower → reuse base ThorBonusAttack + bonusAttack:3, condition Range).
async function ultimateThorFight(villainCopy) {
  gainVillainAsHero(villainCopy, {
    team: "Avengers",
    classes: ["Range"],
    color: "Blue",
    cost: 7,
    attack: 3,
    attackIcon: true,
    bonusAttack: 3,
    conditionalAbility: "ThorBonusAttack",
    conditionType: "playedCards",
    condition: "Range",
  });
}

// Ultimate Thor Escape: "Cross-Dimensional Thor Rampage." SHARED helper — reveal a "Thor"-family card
// (name contains "Thor") in hand / played / Victory Pile, or gain a Wound. Independent of the Fight
// converter (an escaping Thor is never gained as a Hero).
async function ultimateThorEscape(villainCard) {
  await crossDimensionalRampage(["Thor"], "Ultimate Thor");
}

// Ultimate Wasp (DB id 292, Villain Attack 5) → Avengers / Covert / 2+ Attack, "[COVERT]: You get +2
// Attack" (superpower → ultimateWaspBonusAttack + bonusAttack:2, condition Covert).
async function ultimateWaspFight(villainCopy) {
  gainVillainAsHero(villainCopy, {
    team: "Avengers",
    classes: ["Covert"],
    color: "Red",
    cost: 5,
    attack: 2,
    attackIcon: true,
    bonusAttack: 2,
    conditionalAbility: "ultimateWaspBonusAttack",
    conditionType: "playedCards",
    condition: "Covert",
  });
}

// Sentinel Territories (Earth-1610) — "alters/changes the future" delayed effects. Each schedules a
// bonus/penalty for the active player's OWN next turn (solo: "the next player" = you). Deferred via the
// engine flags declared in script.js, consumed at their turn-start sites (Colossus → drawVillainCard;
// Kate Pryde recruit + Rachel attack-delta promote → endTurn tail). Rules-notes SPEC-Q2 (Colossus).

// Colossus of Future Past (DB id 293, Attack 5 / VP 3).
// Fight: "Colossus changes the future: Don't play a Villain card at the beginning of next turn."
// = skip ONE villain card next turn (Golden 2→1, What If? 1→0). Stacks if fought twice (rules-notes
// SPEC-Q2). Sets the deferred skip counter; drawVillainCard() consumes + clears it next turn.
async function colossusOfFuturePastFight(villainCard) {
  sentinelSkipVillainNextTurn += 1;
  onscreenConsole.log(
    `<span class="console-highlights">Colossus of Future Past</span> changes the future — one fewer Villain card will be played at the start of your next turn.`,
  );
}

// Kate Pryde of Future Past (DB id 294, Attack 4 / VP 2).
// Fight: "You get +1 Recruit. Then, Kate Pryde alters the future: At the beginning of the next
// player's turn, that player gets +1 Recruit." Solo: +1 Recruit now + +1 Recruit at the start of your
// own next turn. Twin rule: both grants update totalRecruitPoints AND cumulativeRecruitPoints (the
// deferred one pays out in endTurn).
async function katePrydeOfFuturePastFight(villainCard) {
  totalRecruitPoints += 1;
  cumulativeRecruitPoints += 1;
  sentinelRecruitNextTurn += 1; // paid out at the start of next turn (endTurn consumer)
  onscreenConsole.log(
    `<span class="console-highlights">Kate Pryde of Future Past</span> — you get +1<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> now, and +1<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> at the start of your next turn.`,
  );
  updateGameBoard();
}

// Rachel Summers of Future Past (DB id 295, Attack 6 / VP 4).
// Fight: "Rachel Summers alters the future: During the next player's turn, all Villains and the
// Mastermind get -1 Attack." Solo: schedule -1 to all villains + Mastermind during your next turn
// (deferred delta promoted to active in endTurn). Escape: this turn, +1 to all villains + Mastermind.
async function rachelSummersOfFuturePastFight(villainCard) {
  sentinelVillainAttackDeltaNextTurn -= 1;
  onscreenConsole.log(
    `<span class="console-highlights">Rachel Summers of Future Past</span> alters the future — all Villains and the Mastermind get -1<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> during your next turn.`,
  );
}

// Escape: "This turn, all Villains and the Mastermind get +1 Attack." Applies immediately (active
// delta) for the turn the player is about to take; expires at the next endTurn promote.
async function rachelSummersOfFuturePastEscape(villainCard) {
  sentinelVillainAttackDelta += 1;
  onscreenConsole.log(
    `<span class="console-highlights">Rachel Summers of Future Past</span> escapes — all Villains and the Mastermind get +1<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> this turn.`,
  );
  updateGameBoard();
}

// Wolverine of Future Past (DB id 296, Attack 7 / VP 5).
// Fight: "Wolverine alters the future: At the start of the next player's turn, you draw a card, and
// that player draws a card." Solo: "you" and "that player" are the same active player → draw 2 cards
// at the start of next turn. Reuse the engine's nextTurnsDraw mechanic (consumed in endTurn).
async function wolverineOfFuturePastFight(villainCard) {
  nextTurnsDraw += 2;
  onscreenConsole.log(
    `<span class="console-highlights">Wolverine of Future Past</span> alters the future — you draw 2 extra cards at the start of your next turn.`,
  );
}

// Escape: "Cross-Dimensional Wolverine Rampage." SHARED helper — reveal a Wolverine-family card
// (name contains "Wolverine", "Weapon X", or "Old Man Logan") or gain a Wound.
async function wolverineOfFuturePastEscape(villainCard) {
  await crossDimensionalRampage(
    ["Wolverine", "Weapon X", "Old Man Logan"],
    "Wolverine of Future Past",
  );
}

// --- SCHEME TWIST EFFECTS ---

// --- MASTERMIND EFFECTS ---

// ============================================================================
// PHASE 3d — MASTERMIND: Nimrod, Super Sentinel
// ============================================================================
//
// Frozen specs (build-to contract): docs/expansion-specs/secret-wars-vol1.md →
//   "MASTERMIND — Nimrod, Super Sentinel" (passive recruit-gate + Master Strike + 4 Tactics).
//   Inventory source of truth: docs/card-inventory/final/secret-wars-vol1.md (lines 759-777).
//
// The recruit-gate ("can't fight Nimrod unless ≥6 Recruit this turn") is the DB flag
// `unfightableUnlessRecruit: 6`, gated in script.js (handleMastermindClick + isMastermindRecruitLocked
// across the mastermind highlight surfaces) — NOT here. This file holds the Master Strike + Tactic
// fight effects, dispatched by the engine: masterStrike via handleMasterStrikeEffect (window[name]()),
// tactics via resolveTacticEffects (window[fightEffect]()).
//
// SHARED across the Master Strike + all 4 Tactics: the "Choose Recruit or Attack, then act on that
// icon" pattern. Built once below (chooseRecruitOrAttackIcon + nimrodCardHasIcon + nimrodIconHTML).

// Icon-choice popup ("Choose Recruit or Attack"). Reuses showHeroAbilityMayPopup. Returns "recruit"
// or "attack".
function chooseRecruitOrAttackIcon(sourceName) {
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Choose <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> Recruit or <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> Attack.`,
      "Recruit",
      "Attack",
    );
    const t = document.querySelector(".info-or-choice-popup-title");
    if (t) t.textContent = sourceName;
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      onscreenConsole.log(`Chose ${nimrodIconHTML("recruit")}.`);
      resolve("recruit");
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      onscreenConsole.log(`Chose ${nimrodIconHTML("attack")}.`);
      resolve("attack");
    };
  });
}

// Does this card bear the chosen Recruit/Attack icon? Mirrors the established icon-presence reads
// (M.O.D.O.K.s recruit check, Ghost Racers attack check): explicit *Icon flag OR a printed value.
function nimrodCardHasIcon(card, icon) {
  if (!card) return false;
  if (icon === "recruit") return card.recruitIcon === true || (card.recruit || 0) > 0;
  return card.attackIcon === true || (card.attack || 0) > 0;
}

function nimrodIconHTML(icon) {
  return icon === "recruit"
    ? `<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">`
    : `<img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">`;
}

// Master Strike: "Each player who does not reveal a [TECH] Hero must choose Recruit or Attack, then
// discard all their cards with that icon." Solo: "each player" = the active (only) player (spec Q1 —
// self-resolves the reveal-or-penalty). Reveal a Tech Hero to avoid; otherwise choose an icon and
// discard ALL hand cards with it. Reveal-or-penalty control flow mirrors revealClassOrWound
// (expansionRevelations.js:2329). Dispatched (and awaited) by handleMasterStrikeEffect.
async function nimrodStrike() {
  // Defer past the Master Strike popup's own close. handleMasterStrikeEffect runs us inside
  // showPopup's confirm callback, which calls confirmCallback() then SYNCHRONOUSLY closePopup()
  // (closeInfoChoicePopup). Both share the .info-or-choice-popup element, so opening our prompt
  // before yielding a macrotask would have it closed out from under us → the await never resolves
  // (hang). One macrotask hop lets closePopup() run first, then we open our popup cleanly. Same
  // reason LokiRevealStrengthOrWound (cardAbilities.js:10427) wraps its popup in setTimeout. The
  // 4 Tactics don't need this — their dispatch (revealMastermindTactic onConfirm) closes the tactic
  // popup BEFORE running the fight effect.
  await new Promise((r) => setTimeout(r, 0));
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(
      (c) =>
        !c.isCopied &&
        !c.sidekickToDestroy &&
        !c.markedToDestroy &&
        !c.markedForDeletion &&
        !c.isSimulation,
    ),
  ];
  const hasTechHero = cardsYouHave.some((c) => c.classes && c.classes.includes("Tech"));
  if (hasTechHero) {
    const reveal = await new Promise((resolve) => {
      const { confirmButton, denyButton } = showHeroAbilityMayPopup(
        `Reveal a <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> Hero to avoid discarding, or choose an icon and discard all your cards with it?`,
        "Reveal Tech Hero",
        "Choose & Discard",
      );
      const t = document.querySelector(".info-or-choice-popup-title");
      if (t) t.textContent = "Nimrod, Super Sentinel";
      confirmButton.onclick = () => {
        closeInfoChoicePopup();
        resolve(true);
      };
      denyButton.onclick = () => {
        closeInfoChoicePopup();
        resolve(false);
      };
    });
    if (reveal) {
      onscreenConsole.log(
        `You revealed a <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> Hero — no cards discarded.`,
      );
      return;
    }
  }
  const icon = await chooseRecruitOrAttackIcon("Nimrod, Super Sentinel");
  const toDiscard = playerHand.filter((c) => nimrodCardHasIcon(c, icon));
  if (toDiscard.length === 0) {
    onscreenConsole.log(`You have no cards with that icon to discard.`);
    return;
  }
  // Remove from hand first, then route through the discard-invulnerability path (Cyclops "Unending
  // Energy" etc. can resist the discard and return to hand) — engine-gotchas KO/discard rule.
  for (const c of toDiscard) {
    const i = playerHand.indexOf(c);
    if (i !== -1) playerHand.splice(i, 1);
  }
  const { returned } = await checkDiscardForInvulnerability(toDiscard);
  if (returned && returned.length) playerHand.push(...returned);
  onscreenConsole.log(
    `Discarded all your cards with a ${nimrodIconHTML(icon)} icon.`,
  );
  updateGameBoard();
}

// Tactic — Adapt and Destroy: "Choose Recruit or Attack. Each other player reveals their hand and
// discards a card with that icon." Solo (spec Q1 / What If? p.24 "do it yourself"): the ACTIVE player
// discards ONE chosen card with the chosen icon (single discard — contrast the Master Strike's "all").
async function nimrodAdaptAndDestroy() {
  const icon = await chooseRecruitOrAttackIcon("Adapt and Destroy");
  const matching = playerHand.filter((c) => nimrodCardHasIcon(c, icon));
  if (matching.length === 0) {
    onscreenConsole.log(`You have no card with that icon in hand — nothing discarded.`);
    return;
  }
  let chosen = matching[0];
  if (matching.length > 1) {
    chosen = await showCardSelectionPopup({
      title: "Adapt and Destroy",
      instructions: `Discard one card with a ${nimrodIconHTML(icon)} icon.`,
      confirmText: "DISCARD",
      items: matching,
    });
    if (!chosen) chosen = matching[0]; // mandatory discard — fall back if the picker is dismissed
  }
  const i = playerHand.indexOf(chosen);
  if (i !== -1) playerHand.splice(i, 1);
  const { returned } = await checkDiscardForInvulnerability(chosen);
  if (returned && returned.length) playerHand.push(...returned);
  updateGameBoard();
}

// Tactic — Detect Mutation: "Choose Recruit or Attack. Then, reveal the top card of your deck. If
// that card has that icon, draw it and repeat this process." Self-only. Chain continues while each
// revealed top card carries the chosen icon; a non-matching card is LEFT on top (undrawn).
async function nimrodDetectMutation() {
  const icon = await chooseRecruitOrAttackIcon("Detect Mutation");
  let drawn = 0;
  // Defensive cap only — drawn cards go to HAND (not back to discard), so the deck+discard pool
  // strictly shrinks and the loop always terminates on its own.
  const cap = playerDeck.length + playerDiscardPile.length + 1;
  for (let guard = 0; guard <= cap; guard++) {
    if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
      playerDeck = shuffle(playerDiscardPile);
      playerDiscardPile = [];
      onscreenConsole.log(`Reshuffled your discard pile into your deck.`);
    }
    if (playerDeck.length === 0) break; // deck + discard both empty
    const top = playerDeck[playerDeck.length - 1]; // top of deck = end of array (drawCard pops it)
    if (nimrodCardHasIcon(top, icon)) {
      drawCard();
      drawn++;
    } else {
      onscreenConsole.log(
        `Revealed <span class="console-highlights">${top.name}</span> — no ${nimrodIconHTML(icon)} icon. Detect Mutation stops.`,
      );
      break;
    }
  }
  if (drawn > 0) {
    onscreenConsole.log(
      `Detect Mutation: drew ${drawn} card${drawn === 1 ? "" : "s"}.`,
    );
  }
}

// Tactic — Scatter the Mutants: "Choose Recruit or Attack. Put all Heroes from the HQ with that icon
// on the bottom of the Hero Deck." Self-only. Vacated HQ slots refill per the current mode
// (refillHQSlot: Golden rotation / What If? fill-in-place).
async function nimrodScatterTheMutants() {
  const icon = await chooseRecruitOrAttackIcon("Scatter the Mutants");
  // Collect matching HQ Heroes by IDENTITY first — Golden goldenRefillHQ splices+compacts, shifting
  // indices, so re-locate each card right before moving it (engine-gotchas: don't loop forward over
  // HQ slots while refilling).
  const matching = hq.filter(
    (c) => c && c.type === "Hero" && nimrodCardHasIcon(c, icon),
  );
  if (matching.length === 0) {
    onscreenConsole.log(`No HQ Hero has that icon — nothing scattered.`);
    return;
  }
  for (const card of matching) {
    const idx = hq.indexOf(card);
    if (idx === -1) continue;
    // Refill FIRST (draws from the current top), THEN put the scattered card on the bottom — order
    // matters: unshift-then-refill would let refillHQSlot's heroDeck.pop() pull the just-scattered
    // card straight back into the vacated slot when the Hero Deck is otherwise empty (the card we
    // captured in `card` survives the refill, which evicts it from HQ).
    // GUARD: refillHQSlot's What If? branch calls showHeroDeckEmptyPopup() — a LATENT BASE
    // ReferenceError (the function is never defined; script.js:5254) that throws when the Hero Deck
    // is empty. Swallow it so the scatter still completes and the card is never lost: the slot is
    // already vacated inside refillHQSlot before the throw, so we just proceed to bank the card on
    // the bottom. (Base bug reported to coordinator — affects every What If? HQ refill on an empty
    // Hero Deck, not just this tactic.) Golden's goldenRefillHQ never calls it, so it can't throw.
    try {
      refillHQSlot(idx);
    } catch (e) {
      if (hq[idx] === card) hq[idx] = null; // ensure the slot is vacated even if the refill aborted
    }
    heroDeck.unshift(card); // bottom of the Hero Deck (top = end, drawn via heroDeck.pop())
    onscreenConsole.log(
      `<span class="console-highlights">${card.name}</span> put on the bottom of the Hero Deck.`,
    );
  }
  updateGameBoard();
}

// Tactic — Teleport and Incarcerate: "Choose Recruit or Attack. Then, reveal the top card of [the]
// Hero Deck. If that card has that icon, gain that card, and Teleport it." Self-only. Teleport (insert
// p.1) = set aside → returns at end of this turn as an extra card in your next hand (NOT "top of
// deck", per rules-notes 6a). Reuse the engine Teleport queue primitive (cardsToBeDrawnNextTurn +
// nextTurnsDraw) directly — teleport() is hand-scoped and this card comes from the Hero Deck.
async function nimrodTeleportAndIncarcerate() {
  const icon = await chooseRecruitOrAttackIcon("Teleport and Incarcerate");
  if (heroDeck.length === 0) {
    onscreenConsole.log(`The Hero Deck is empty — nothing to reveal.`);
    return;
  }
  const top = heroDeck[heroDeck.length - 1]; // top of the Hero Deck (HQ refills via heroDeck.pop())
  onscreenConsole.log(
    `Revealed the top Hero: <span class="console-highlights">${top.name}</span>.`,
  );
  if (nimrodCardHasIcon(top, icon)) {
    heroDeck.pop(); // gain it (remove from the Hero Deck)
    cardsToBeDrawnNextTurn.push(top);
    nextTurnsDraw++;
    onscreenConsole.log(
      `It has a ${nimrodIconHTML(icon)} icon — you gain <span class="console-highlights">${top.name}</span> and Teleport it (added to your next hand).`,
    );
  } else {
    onscreenConsole.log(
      `No ${nimrodIconHTML(icon)} icon — <span class="console-highlights">${top.name}</span> stays on top of the Hero Deck.`,
    );
  }
  updateGameBoard();
}

// ============================================================================
// PHASE 3d — MASTERMIND: Madelyne Pryor, Goblin Queen
// ============================================================================
//
// Frozen specs (build-to contract): docs/expansion-specs/secret-wars-vol1.md →
//   "MASTERMIND — Madelyne Pryor, Goblin Queen" (passive Demon-Goblin gate + Master Strike + 4 Tactics).
//   Inventory source of truth: docs/card-inventory/final/secret-wars-vol1.md (lines 739-757).
//
// REUSE NOTE — the Demon-Goblin mechanic ALREADY EXISTS as the Dark City `demonGoblinDeck` system
// (NOT the captureBystanderFromVPToLocation / Korvac / placeLocation path the frozen spec's Shared-
// Mechanics block + passive entry cite — those are rescue-on-carrier-defeat plumbing and are WRONG for
// this build; a spec note records the correction so the Phase-4 blind-compare won't false-flag).
//   - demonGoblinDeck (script.js) — global fightable pile; render/affordability/click all gated ONLY on
//     demonGoblinDeck.length > 0, so it works standalone in a Madelyne game (no Dark City scheme needed).
//   - rescueDemonGoblin() / showDemonGoblinAttackButton() (cardAbilitiesDarkCity.js) — the existing
//     off-grid #demon-goblin-deck fight UI (2 Attack → pop a goblin → Bystander to Victory Pile, runs
//     defeatBonuses + bystanderBonuses + rescueBystanderAbility, e.g. the Banker recruit rider). NO new
//     fight UI built here.
//   - BystanderstToDemonGoblins(count) (cardAbilitiesDarkCity.js) — the bystanderDeck→demonGoblinDeck
//     mover, generalized from fixed-5 to take a count. madelyneCapture() wraps it as the SINGLE capture
//     path for ALL Madelyne effects → her captured Bystanders ARE Demon Goblins (one store; no
//     mastermind.bystanders for her).
// The can't-fight-Madelyne-while-goblins gate is the DB flag `unfightableWhileDemonGoblins: true`, read
// by isMastermindDemonGoblinLocked() across the 4 mastermind surfaces in script.js — NOT here.

// Single capture path for every Madelyne effect: move `n` Bystanders into the shared demonGoblinDeck
// (each → fightable 2-Attack Demon Goblin), capped at the Bystander Stack size. Refreshes the board so
// the #demon-goblin-deck overlay/count and the Madelyne fight-lock update immediately.
async function madelyneCapture(n) {
  if (n <= 0) {
    onscreenConsole.log("Madelyne captures no Bystanders.");
    return;
  }
  await BystanderstToDemonGoblins(n);
  updateGameBoard();
}

// Reveal-or-Wound keyed on TEAM (X-Men), not class. Adapts revealClassOrWound (expansionRevelations.js)
// — same control flow, but the predicate is c.team === "X-Men". Used by the Corrupted Clone tactic.
function madelyneRevealXMenOrWound(sourceName) {
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(
      (c) =>
        !c.isCopied &&
        !c.sidekickToDestroy &&
        !c.markedToDestroy &&
        !c.markedForDeletion &&
        !c.isSimulation,
    ),
  ];
  const hasXMen = cardsYouHave.some((c) => c.team === "X-Men");
  if (!hasXMen) {
    onscreenConsole.log(
      `You have no <img src="Visual Assets/Icons/X-Men.svg" alt="X-Men Icon" class="console-card-icons"> X-Men Hero to reveal. Gaining a Wound.`,
    );
    return drawWound();
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal an <img src="Visual Assets/Icons/X-Men.svg" alt="X-Men Icon" class="console-card-icons"> X-Men Hero to avoid gaining a Wound?`,
      "Reveal X-Men Hero",
      "Gain Wound",
    );
    const t = document.querySelector(".info-or-choice-popup-title");
    if (t) t.textContent = sourceName;
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      onscreenConsole.log(
        `You revealed an <img src="Visual Assets/Icons/X-Men.svg" alt="X-Men Icon" class="console-card-icons"> X-Men Hero.`,
      );
      resolve();
    };
    denyButton.onclick = async () => {
      closeInfoChoicePopup();
      await drawWound();
      resolve();
    };
  });
}

// Master Strike: "Madelyne captures 4 Bystanders. If she already had any Bystanders before that, then
// each player gains a Wound." Order matters — snapshot her Demon-Goblin count BEFORE the +4, else the
// Wound clause always fires. Solo: "each player" = the active (only) player (spec Q1). setTimeout(0)
// defer for the SAME reason as nimrodStrike: we run inside the Master Strike showPopup confirm callback,
// which synchronously closes the shared .info-or-choice-popup; drawWound() may open its own popup, so
// hop one macrotask first to let the Master Strike popup close cleanly.
async function madelynePryorStrike() {
  await new Promise((r) => setTimeout(r, 0));
  const hadGoblinsBefore = demonGoblinDeck.length > 0;
  await madelyneCapture(4);
  if (hadGoblinsBefore) {
    onscreenConsole.log(
      `Madelyne already had Demon Goblins — you gain a Wound.`,
    );
    await drawWound();
  }
  updateGameBoard();
}

// Tactic — City of Demon Goblins: "Fight: Madelyne captures five Bystanders." Self-applies (no "each
// player" clause). The 5 captured Demon Goblins then block fighting Madelyne until rescued (passive gate).
async function madelynePryorCityOfDemonGoblins() {
  await madelyneCapture(5);
}

// Tactic — Corrupted Clone of Jean Grey: "Fight: Each other player reveals an X-Men Hero or gains a
// Wound." Solo (spec Q1 SELF-APPLY / What If? p.24 "do it yourself"): the ACTIVE player reveals an
// X-Men Hero or gains a Wound. TEAM-based predicate (X-Men), not class.
async function madelynePryorCorruptedCloneOfJeanGrey() {
  await madelyneRevealXMenOrWound("Corrupted Clone of Jean Grey");
}

// Tactic — Everyone's a Demon on the Inside: "Fight: Madelyne captures a Bystander from each other
// player's Victory Pile." Solo (spec Q1 NO-OP): names OTHER players' piles specifically — in 1-player
// solo there is no such source, so announce-and-skip (do NOT self-target — contrast the Master Strike's
// "each player", which DOES include the active player).
async function madelynePryorEveryonesADemonOnTheInside() {
  onscreenConsole.log(
    `<span class="console-highlights">Everyone's a Demon on the Inside</span>: there are no other players' Victory Piles to capture from — no effect in solo.`,
  );
}

// Tactic — Gather the Harvest: "Fight: For each Limbo Villain in the city and/or Escape Pile, Madelyne
// captures a Bystander." Count Limbo-team villains in the city AND escapedVillainsDeck, capture that
// many. Self-applies (no "each player"). Limbo villains tagged team:"Limbo" in cardDatabase.js.
async function madelynePryorGatherTheHarvest() {
  const inCity = city.filter((c) => c && c.team === "Limbo").length;
  const inEscape = escapedVillainsDeck.filter((c) => c && c.team === "Limbo").length;
  const total = inCity + inEscape;
  onscreenConsole.log(
    `<span class="console-highlights">Gather the Harvest</span>: ${total} Limbo Villain${total === 1 ? "" : "s"} (${inCity} in the city, ${inEscape} in the Escape Pile) — Madelyne captures ${total} Bystander${total === 1 ? "" : "s"}.`,
  );
  await madelyneCapture(total);
}

// ============================================================================
// PHASE 3f — HENCHMEN FIGHT EFFECTS
// ============================================================================
//
// Henchmen are DB cards with type:"Villain" + henchmen:true, shuffled into the villain deck and
// fought from the city via the SAME defeat path as villains. Their `fightEffect` string is dispatched
// (and awaited) through window[fightEffect](villainCopy) inside collectDefeatOperations
// (script.js:13158), receiving the fight COPY — identical to the Manhattan Earth-1610 villain pattern
// above.
//
// Frozen specs (build-to contract): docs/expansion-specs/secret-wars-vol1.md →
//   "Henchmen — M.O.D.O.K.s" (HIGH) and "Henchmen — Thor Corps" (LOW).
//   Ghost Racers has NO frozen-spec block — the /analyze-expansion + spec phases scoped it OUT with
//   the deferred Deadlands "Rise of the Living Dead" theme. It is built here to the inventory text
//   (docs/card-inventory/final/secret-wars-vol1.md → "Ghost Racers"), Fight effect ONLY (its Deadlands
//   Ambush stays deferred). Flagged to the coordinator for a ratified spec block + KO-pool reading.

// Shared: KO a specific Hero the player controls, locating it by object identity wherever it currently
// lives (HQ / Played-this-turn / Artifacts / Hand / Discard) and applying the standard KO convention
// (mirrors FightKOHeroYouHave @ cardAbilities.js:8811): push to koPile BEFORE koBonuses() (koBonuses
// reads koPile[last]); a played-this-turn card is flagged markedToDestroy (removed at end of turn),
// not spliced; an HQ Hero is KO'd then its slot refilled via refillHQSlot() (mode-correct: Golden
// rotates, What If? fills in place).
function koControlledHeroByIdentity(hero) {
  if (!hero) return;
  const hqIdx = hq.indexOf(hero);
  if (hqIdx !== -1) {
    koPile.push(hero);
    refillHQSlot(hqIdx);
  } else {
    if (cardsPlayedThisTurn.includes(hero)) {
      hero.markedToDestroy = true; // removed at end of turn; not spliced out now
    } else {
      let i = playerArtifacts.indexOf(hero);
      if (i !== -1) playerArtifacts.splice(i, 1);
      else if ((i = playerHand.indexOf(hero)) !== -1) playerHand.splice(i, 1);
      else if ((i = playerDiscardPile.indexOf(hero)) !== -1) playerDiscardPile.splice(i, 1);
    }
    koPile.push(hero);
  }
  koBonuses();
  onscreenConsole.log(
    `<span class="console-highlights">${hero.name}</span> has been KO'd.`,
  );
  updateGameBoard();
}

// Ghost Racers (×10) — Fight: "Reveal a [COVERT] Hero or KO one of your Heroes with an Attack icon."
// Attack 3 / VP 1. Reveal is the free escape (mirrors revealClassOrWound @ expansionRevelations.js:2329):
// if you can show a Covert Hero you suffer nothing. Otherwise KO one of your Heroes that carries an
// Attack icon. "One of your Heroes" (no source qualifier) = the FightKOHeroYouHave pool — Artifacts +
// Hand + Played-this-turn — NOT discard (M.O.D.O.K.s names discard explicitly; Ghost Racers does not).
// [BUILD FLAG] No frozen spec — KO-pool reading (your-heroes incl. attack icon) is the worker's, pending
// coordinator ratification.
async function ghostRacersFight(villainCopy) {
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(
      (c) =>
        !c.isCopied &&
        !c.sidekickToDestroy &&
        !c.markedToDestroy &&
        !c.markedForDeletion &&
        !c.isSimulation,
    ),
  ];
  const canReveal = cardsYouHave.some((c) => c.classes && c.classes.includes("Covert"));
  const koPool = [
    ...playerArtifacts.filter((c) => c.type === "Hero" && c.attackIcon === true),
    ...playerHand.filter((c) => c.type === "Hero" && c.attackIcon === true),
    ...cardsPlayedThisTurn.filter(
      (c) =>
        c.type === "Hero" &&
        c.attackIcon === true &&
        !c.isCopied &&
        !c.sidekickToDestroy &&
        !c.markedToDestroy &&
        !c.markedForDeletion &&
        !c.isSimulation,
    ),
  ];

  // Resolve the "or": only offer a real choice when BOTH sides are payable. Otherwise the single
  // possible outcome resolves automatically (and if neither is possible, the effect is a no-op).
  if (canReveal && koPool.length > 0) {
    const reveal = await new Promise((resolve) => {
      const { confirmButton, denyButton } = showHeroAbilityMayPopup(
        `Reveal a <img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> Hero, or KO one of your Heroes with an <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> icon?`,
        "Reveal Covert Hero",
        "KO an Attack Hero",
      );
      const t = document.querySelector(".info-or-choice-popup-title");
      if (t) t.textContent = "Ghost Racers";
      confirmButton.onclick = () => {
        closeInfoChoicePopup();
        resolve(true);
      };
      denyButton.onclick = () => {
        closeInfoChoicePopup();
        resolve(false);
      };
    });
    if (reveal) {
      onscreenConsole.log(
        `You revealed a <img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> Hero — no Hero KO'd.`,
      );
      return;
    }
  } else if (canReveal) {
    // Have a Covert Hero but no Attack-icon Hero to KO → reveal is the only payable side.
    onscreenConsole.log(
      `<span class="console-highlights">Ghost Racers</span> — you revealed a <img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> Hero. No Hero KO'd.`,
    );
    return;
  } else if (koPool.length === 0) {
    // No Covert Hero to reveal AND no Attack-icon Hero to KO → nothing to do.
    onscreenConsole.log(
      `<span class="console-highlights">Ghost Racers</span> — no <img src="Visual Assets/Icons/Covert.svg" alt="Covert Icon" class="console-card-icons"> Hero to reveal and no Hero with an <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> icon to KO.`,
    );
    return;
  }

  // KO branch: forced (no Covert Hero) or chosen (declined the reveal).
  const chosen = await showCardSelectionPopup({
    title: "Ghost Racers",
    instructions:
      'KO one of your Heroes with an <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> icon.',
    confirmText: "KO HERO",
    items: koPool,
  });
  if (!chosen) return;
  koControlledHeroByIdentity(chosen);
}

// M.O.D.O.K.s (×10) — Fight: "KO a Hero from your discard pile or the HQ. If that Hero has a Recruit
// icon, you get +1 Recruit." Attack 3 / VP 1. Combined picker over discard-pile Heroes + HQ Heroes
// (showCardSelectionPopup). Recruit-icon check captured BEFORE the KO (a Hero with a Recruit icon, i.e.
// recruitIcon true or a printed Recruit value). Mandatory when any Hero is available in either pool.
async function modoksFight(villainCopy) {
  const discardHeroes = playerDiscardPile.filter((c) => c.type === "Hero");
  const hqHeroes = hq.filter((c) => c && c.type === "Hero");
  const pool = [...discardHeroes, ...hqHeroes];
  if (pool.length === 0) {
    onscreenConsole.log(
      `<span class="console-highlights">M.O.D.O.K.s</span> — no Hero in your discard pile or the HQ to KO.`,
    );
    return;
  }
  const chosen = await showCardSelectionPopup({
    title: "M.O.D.O.K.s",
    instructions: "KO a Hero from your discard pile or the HQ.",
    confirmText: "KO HERO",
    items: pool,
  });
  if (!chosen) return;
  const hadRecruitIcon = chosen.recruitIcon === true || (chosen.recruit || 0) > 0;
  koControlledHeroByIdentity(chosen);
  if (hadRecruitIcon) {
    totalRecruitPoints += 1;
    cumulativeRecruitPoints += 1;
    updateGameBoard();
    onscreenConsole.log(
      `That Hero had a <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> icon. +1<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> gained.`,
    );
  }
}

// Thor Corps (×10, dual-nature Henchman/Hero) — Fight: "Gain this as a Hero." Attack 3 / VP 0.
// Hero form: Avengers / Strength + Range (dual-class) / 2+ Recruit; "[STRENGTH][RANGED]: You get +1
// Recruit". Reuses the SHARED gainVillainAsHero() converter (same path as the Manhattan villains). The
// DB entry carries gainAsHero:true so the henchman defeat path skips the Victory-Pile push
// (script.js:13581 names Thor Corps); the flag is whitelisted in createVillainCopy() (script.js:13124).
// Hero cost = old henchman Attack value (3, insert p.1). Color = first class's color (Strength = Green).
// The superpower fires only when the gained Hero is LATER played.
async function thorCorpsFight(villainCopy) {
  gainVillainAsHero(villainCopy, {
    team: "Avengers",
    classes: ["Strength", "Range"],
    color: "Green",
    cost: 3,
    recruit: 2,
    recruitIcon: true,
    bonusRecruit: 1,
    conditionalAbility: "thorCorpsBonusRecruit",
    conditionType: "playedCards",
    condition: "Strength&Range",
  });
}

// Thor Corps hero-form superpower: "[STRENGTH][RANGED]: You get +1 Recruit." Gate is engine-standard
// (isConditionMet excludes the playing card, so the Strength + Range symbols must come from OTHER cards
// played this turn — consistent with base Thor "Call Lightning" and the Manhattan Ultimate Thor). On
// fire, bonusRecruit() reads the just-played card's bonusRecruit (1) and adds it to BOTH recruit totals.
function thorCorpsBonusRecruit() {
  onscreenConsole.log(
    `<img src="Visual Assets/Icons/Strength.svg" alt="Strength Icon" class="console-card-icons"><img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero played. Superpower Ability activated.`,
  );
  onscreenConsole.log(
    `+1<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> gained.`,
  );
  bonusRecruit();
}

// ============================================================================
// PHASE 3f — BYSTANDER (Banker)
// ============================================================================

// getBankHQReserveIndex() — resolve the 1-indexed HQ reserve slot (for getHQReserved/setHQReserved,
// hq1..hq5ReserveRecruit) of the HQ space directly UNDER the Bank city space. Resize-aware. Returns
// null when there is no Bank in the current layout, or no HQ cell sits under it.
//
// WHY this mapping rather than a hardcoded index (cf. FF moleManUndergroundRiches @
// expansionFantasticFour.js:2640, which hardcodes hq2ReserveRecruit for "under the Streets"): the
// engine has NO general city→HQ map; moleMan's hardcode is correct ONLY for the default 5-space
// layout and silently breaks under city-resize schemes. The HQ is always hq.length (5) cells
// (#hq-1..#hq-5) and RIGHT-aligns under the rightmost hq.length city spaces. Empirically verified
// in-browser (2026-06-25), both layouts:
//   - default 5-space: city space i ↔ HQ cell i+1 exactly (Bank city index 3 ↔ #hq-4 → reserve 4),
//     matching moleMan's Streets(1)→hq2.
//   - Earthquake (Revelations) 7-space: two extra "Low Tide" spaces are added on the LEFT
//     (cardDatabase.js citySpaces), shifting the Bank to city index 5; HQ stays 5 cells, so the Bank
//     still maps to reserve 4 (the 4th of the 5 canonical spaces Bridge/Streets/Rooftops/Bank/Sewers →
//     hq1..hq5). The 7-vs-5 rows don't pixel-align, but hq4 is both the canonical and the nearest cell.
// So the HQ cell under city space C = C - (citySize - hq.length); the reserve var is 1-indexed (+1).
// Resolved off the LIVE citySpaceLabels every call (resize-safe, like isBankOrStreets @ script.js:10398).
// ASSUMPTION (only resize pattern shipped): extra city spaces are added on the LEFT (Earthquake) — a
// future scheme that extends the city on the RIGHT would need this offset revisited.
function getBankHQReserveIndex() {
  const bankCityIndex = citySpaceLabels.indexOf("The Bank");
  if (bankCityIndex === -1) return null; // Bank not in this layout (defensive — no shipped scheme
  // removes the Bank; Tsunami destroys city indices 0-3 only and the Bank stays active). Future
  // Bank-less layouts no-op gracefully.
  const leftExtra = citySize - hq.length; // # of extra city spaces added on the left (0 by default)
  const hqSlot0 = bankCityIndex - leftExtra; // 0-indexed HQ cell sitting under the Bank
  if (hqSlot0 < 0 || hqSlot0 > 4) return null; // only 5 reserve slots exist (hq1..hq5) → no HQ under it
  return hqSlot0 + 1; // 1-indexed reserve hqIndex for getHQReserved/setHQReserved
}

// Banker (×3, VP 1) — "When you rescue this Bystander, you get +2 Recruit, usable only to recruit
// Heroes in the HQ space under the Bank." Reuses the position-keyed reserve-recruit pool
// (hq1..hq5ReserveRecruit via getHQReserved/setHQReserved) that showHeroRecruitButton @ script.js:18583
// consumes ONLY when recruiting that slot's Hero — identical machinery to FF moleManUndergroundRiches.
// Additive: multiple Bankers stack (+= via the get→set). This restricted pool is SEPARATE from
// totalRecruitPoints/cumulativeRecruitPoints by design (restricted-use), so the cumulative-twin rule
// deliberately does NOT apply. Dispatched on rescue via rescueBystanderAbility() (the DB rows carry
// bystanderUnconditionalAbility:'bystanderBanker'). No-op gracefully if the Bank space is absent.
function bystanderBanker() {
  const hqIndex = getBankHQReserveIndex();
  if (hqIndex === null) {
    onscreenConsole.log(
      `You rescued the <span class="console-highlights">Banker</span>, but there is no Bank space in the city right now — no reserved <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> granted.`,
    );
    return;
  }
  setHQReserved(hqIndex, getHQReserved(hqIndex) + 2);
  onscreenConsole.log(
    `You rescued the <span class="console-highlights">Banker</span>. +2 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons"> usable only to recruit the Hero in the HQ space under the Bank.`,
  );
  updateGameBoard();
}

// ============================================================================
// Dark Alliance scheme (Secret Wars Vol.1) — Multiple-Masterminds keystone consumer
// ----------------------------------------------------------------------------
// T1   : add a random 2nd Mastermind (Core pool via DB flag darkAllianceEligible) with one Tactic.
// T2-4 : if the 2nd MM is still in play, it gains another Tactic (accrues 1 -> up to 4).
// T5-6 : EACH Mastermind (main + 2nd, if alive) captures a Bystander from the Bystander Stack
//        (Q-B: literal "each" includes the MAIN MM; source is the Stack, empty-stack = no-op).
// T7   : Evil Wins — handled by the endGameConditions "darkAllianceTwist7" case (twist count >= 7),
//        with the on-screen counter twin in updateEvilWinsTracker (case "Dark Alliance").
// The eligible 2nd-MM pool ships as Core Set Masterminds only; widen later by adding the
// darkAllianceEligible flag to more Masterminds (one-flag change, no picker rewrite). Rulings: BATCH 7
// of docs/rules-notes/secret-wars-vol1.md.

// Random 2nd-MM picker: opt-in Core pool, excluding the currently-selected MAIN Mastermind, base side.
function pickRandomDarkAllianceMastermind() {
  const main = getSelectedMastermind();
  const pool = masterminds.filter(
    (m) => m.darkAllianceEligible === true && m.name !== main.name,
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// The live Dark Alliance 2nd Mastermind (the non-ascended secondary it added), if still in play.
function getDarkAllianceSecondMastermind() {
  return secondaryMasterminds.find((sm) => sm.darkAlliance && !sm.defeated);
}

async function darkAllianceTwist(villainCard) {
  const twistNumber = schemeTwistCount; // already incremented before this dispatch (1-based)

  // T1: add a random 2nd Mastermind with one Tactic.
  if (twistNumber === 1) {
    const chosen = pickRandomDarkAllianceMastermind();
    if (!chosen) {
      onscreenConsole.log(
        "No eligible Mastermind is available to join the Dark Alliance.",
      );
      return;
    }
    // Shuffled Tactic pool (mapped to type:"Mastermind" like generateMastermindDeck), drawn one at a
    // time over Twists 1-4. Each cleared Tactic later scores its own VP into the Victory Pile.
    const tacticPool = shuffle(
      chosen.tactics.map((t) => ({ ...t, type: "Mastermind" })),
    );
    const firstTactic = tacticPool.pop();
    const sm = addSecondaryMastermind({
      name: chosen.name,
      image: chosen.image,
      attack: chosen.attack, // per-Tactic fight cost (printed Attack; escalating bonusAttack omitted)
      victoryPoints: 0, // VP lives on the Tactic cards, not the MM card (Core p.14/p.21) — terminal card 0 VP
      tactics: firstTactic ? [firstTactic] : [],
      masterStrike: chosen.masterStrike,
      masterStrikeConsoleLog: chosen.masterStrikeConsoleLog,
      unfightableUnlessRecruit: chosen.unfightableUnlessRecruit || null,
    });
    sm.darkAlliance = true;
    sm.tacticPool = tacticPool;
    // addSecondaryMastermind already announces the join; add only the Dark-Alliance-specific note
    // (one Tactic now + the multi-Mastermind win condition) to avoid a duplicate "joins" line.
    onscreenConsole.log(
      `The <span class="console-highlights">Dark Alliance</span> is formed — <span class="console-highlights">${chosen.name}</span> starts with one Mastermind Tactic. Defeat every Mastermind to win.`,
    );
    updateGameBoard();
    return;
  }

  // T2-4: the 2nd MM gains another Tactic if still in play.
  if (twistNumber >= 2 && twistNumber <= 4) {
    const sm = getDarkAllianceSecondMastermind();
    if (!sm) {
      onscreenConsole.log(
        "The second Mastermind has been defeated — no Tactic is added.",
      );
      return;
    }
    const nextTactic = sm.tacticPool && sm.tacticPool.pop();
    if (nextTactic) {
      sm.tactics.push(nextTactic);
      onscreenConsole.log(
        `<span class="console-highlights">${sm.name}</span> gains another Mastermind Tactic — now ${sm.tactics.length}.`,
      );
    }
    updateGameBoard();
    return;
  }

  // T5-6: EACH Mastermind captures a Bystander from the Bystander Stack.
  if (twistNumber === 5 || twistNumber === 6) {
    const main = getSelectedMastermind();
    captureBystanderFromStackToMastermind(main);
    const sm = getDarkAllianceSecondMastermind();
    if (sm) captureBystanderFromStackToMastermind(sm);
    updateMastermindOverlay();
    updateGameBoard();
    return;
  }

  // T7+: Evil Wins — handled by the endGameConditions "darkAllianceTwist7" case (twist count >= 7).
}

// ============================================================================
// Crush Them With My Bare Hands scheme (Secret Wars Vol.1)
// ----------------------------------------------------------------------------
// Setup: 5 Twists. Solo adds one extra Villain Group (cardDatabase: requiredVillains:2 +
//        extraVillainGroups:1 — Golden 2->3, What If? bakes the +1 into requiredVillains).
// Twist: this Twist becomes a Master Strike that takes effect immediately.
// Evil Wins: when 8 Master Strikes have taken effect — counted in koPile as type "Master Strike",
//        capturing BOTH these twist-driven strikes AND natural villain-deck Master Strike cards
//        (the 5 twists alone can't reach 8). One Master-Strike EVENT counts once even under
//        multiple Masterminds. Wiring: endGameConditions "crush8MasterStrikes" + the
//        updateEvilWinsTracker "Crush Them With My Bare Hands" twin ("N/8"). Rulings: BATCH 8 ① /
//        SPEC-Q3 of docs/rules-notes/secret-wars-vol1.md.
async function crushThemWithMyBareHandsTwist() {
  const mastermind = getSelectedMastermind();
  // Same shape as the natural Master Strike card (script.js generateVillainDeck): name + type drive
  // the koPile tally; image drives the popup. handleMasterStrike fires the active Mastermind(s)'
  // Strike ability AND pushes this card to koPile, so we must NOT push it ourselves.
  const masterStrikeCard = {
    name: "Master Strike",
    type: "Master Strike",
    image: mastermind.masterStrikeImage,
  };
  onscreenConsole.log(
    `<span class="console-highlights">Crush Them With My Bare Hands</span> — this Twist becomes a <span class="console-highlights">Master Strike</span> that takes effect immediately.`,
  );
  await handleMasterStrike(masterStrikeCard);
  // Re-run the board update so the "crush8MasterStrikes" end-game check + "N/8" tracker re-evaluate.
  updateGameBoard();
}

// ============================================================================
// Pan-Dimensional Plague scheme (Secret Wars Vol.1)
// ----------------------------------------------------------------------------
// Setup: 10 Twists. The default Wound Stack applies (no scheme-specific size).
// Twist: KO all Wounds next to the HQ (-> KO pile), then place one Wound from the Wound Stack next
//        to each Hero in the HQ (drains the stack). State = hqWound[slot] (script.js), slot-keyed.
// Special: recruiting a Hero with a Wound next to its slot resolves the Wound at the recruit instant
//        (gain it -> discard, or pay 1 Recruit -> back to the Wound Stack) — see
//        resolvePlagueWoundOnRecruit, hooked into showHeroRecruitButton.
// Evil Wins: when the Wound Stack runs out (endGameConditions "plagueWoundStackOut" + the
//        updateEvilWinsTracker "Pan-Dimensional Plague" twin). Rulings: BATCH 8 ② of
//        docs/rules-notes/secret-wars-vol1.md (slot-keyed = inferred faithful low-bookkeeping read).
async function panDimensionalPlagueTwist() {
  // Step 1: KO all Wounds currently next to HQ slots — to the KO pile, NOT back to the Wound Stack.
  let koCount = 0;
  for (let i = 0; i < hqWound.length; i++) {
    if (hqWound[i]) {
      koPile.push(hqWound[i]);
      hqWound[i] = null;
      koCount++;
    }
  }
  if (koCount > 0) {
    onscreenConsole.log(
      `<span class="console-highlights">Pan-Dimensional Plague</span> — ${koCount} ${koCount === 1 ? "Wound" : "Wounds"} next to the HQ KO'd.`,
    );
  }

  // Step 2: place one Wound from the Wound Stack next to each Hero in the HQ (drains the stack).
  // If the stack empties mid-placement, stop — the empty stack triggers Evil Wins via the end-game
  // check that updateGameBoard runs below.
  let placed = 0;
  for (let i = 0; i < hq.length && i < hqWound.length; i++) {
    const card = hq[i];
    if (card && card.type === "Hero") {
      if (woundDeck.length === 0) break;
      hqWound[i] = woundDeck.pop();
      placed++;
    }
  }
  if (placed > 0) {
    onscreenConsole.log(
      `A Wound from the Wound Stack is placed next to each Hero in the HQ — ${placed} drawn (${woundDeck.length} left in the stack).`,
    );
  }
  updateGameBoard();
}

// Resolve the Wound next to an HQ slot when its Hero is recruited (Pan-Dimensional Plague). Called
// from showHeroRecruitButton AFTER the hero's own cost is paid and BEFORE the slot refills, so no
// Wound lingers on an emptied slot. The player may gain the Wound (-> discard) or pay 1 Recruit to
// return it to the Wound Stack (offered only when at least 1 Recruit remains). hqIndex is 1-based.
async function resolvePlagueWoundOnRecruit(hqIndex) {
  const slot = hqIndex - 1;
  const wound = hqWound[slot];
  if (!wound) return;

  const recruitIcon = `<img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">`;
  // Use the canonical recruit-currency helpers (NOT a raw totalRecruitPoints check) so the pay-1
  // path honours engine rules — notably the Negative Zone, where Recruit is paid with Attack. No
  // reserved pool is passed: the Banker's reserved Recruit is restricted to recruiting Heroes, so
  // the Wound's 1 Recruit comes from the general pool only.
  const canPay = canAffordRecruitCost(1);

  let pay = false;
  if (canPay) {
    pay = await new Promise((resolve) => {
      const { confirmButton, denyButton } = showHeroAbilityMayPopup(
        `That Hero has a Wound next to it (<span class="console-highlights">Pan-Dimensional Plague</span>). Pay 1 ${recruitIcon} to return the Wound to the Wound Stack, or gain the Wound into your discard pile?`,
        "Pay 1 Recruit",
        "Gain Wound",
      );
      confirmButton.onclick = () => {
        closeInfoChoicePopup();
        resolve(true);
      };
      denyButton.onclick = () => {
        closeInfoChoicePopup();
        resolve(false);
      };
    });
  }

  if (pay) {
    spendRecruitCost(1); // spend only (cumulative is generation, untouched by spending); honours Negative Zone
    woundDeck.push(wound);
    hqWound[slot] = null;
    onscreenConsole.log(
      `You paid 1 ${recruitIcon} to return the Wound to the Wound Stack (${woundDeck.length} left).`,
    );
  } else {
    playerDiscardPile.push(wound);
    hqWound[slot] = null;
    onscreenConsole.log(`You gained the Wound into your discard pile.`);
  }
  updateGameBoard();
}

// ============================================================================
// Corrupt the Next Generation of Heroes scheme (Secret Wars Vol.1)
// ----------------------------------------------------------------------------
// Setup (generateVillainDeck, script.js): 10 Sidekicks pulled from the Sidekick Stack, stamped as
//   in-deck Villains (corruptSidekick) via the shared stampCardsAsInDeckVillains helper.
// Special: Sidekick-Villains in the Villain Deck AND city have Attack = 2 + Twists-stacked-next-to-
//   scheme (attackFromScheme, both updateVillainAttackValues twins). Defeat → gainCorruptedSidekick
//   converts the card back to a Sidekick on the TOP of your deck (skrulled:true skips the VP push).
// Twists 1-7: active player (solo "each player") returns a Sidekick from discard to the Stack if
//   present, then 2 Sidekicks from the Stack enter the city as Sidekick-Villains.
// Twist 8: all Sidekick-Villains in the city escape.
// Evil Wins: 4 Sidekicks escape (endGameConditions "corrupt4SidekicksEscape" + updateEvilWinsTracker
//   "Corrupt the Next Generation of Heroes" twin "N/4"). Rulings: rules-notes BATCH 8 ③.

async function corruptTheNextGenerationOfHeroesTwist() {
  const twist = schemeTwistCount; // 1-based; incremented before this dispatch

  if (twist <= 7) {
    // 1) "Each player returns a Sidekick from their discard pile to the Sidekick Stack." Solo = the
    //    active player returns one if present, else skip (rules-notes BATCH 8 ③a, INFERRED).
    const idx = playerDiscardPile.findIndex(
      (c) => c && c.secondaryType === "Sidekick",
    );
    if (idx !== -1) {
      const returned = playerDiscardPile.splice(idx, 1)[0];
      sidekickDeck.push(returned);
      onscreenConsole.log(
        `You return a <span class="console-highlights">Sidekick</span> from your discard pile to the Sidekick Stack.`,
      );
    } else {
      onscreenConsole.log(
        `No <span class="console-highlights">Sidekick</span> in your discard pile to return.`,
      );
    }

    // 2) "Then, two Sidekicks from the Sidekick Stack enter the city." Each is stamped as a
    //    Sidekick-Villain and enters from the right (enterCityFromRight cascades / overflow-escapes
    //    like any city entry). Graceful stop if the Stack empties.
    for (let n = 0; n < 2; n++) {
      if (sidekickDeck.length === 0) {
        onscreenConsole.log(
          `The Sidekick Stack is empty — no Sidekick enters the city.`,
        );
        break;
      }
      const sk = sidekickDeck.pop();
      const [stamped] = stampCardsAsInDeckVillains([sk], {
        corruptSidekick: true,
        fightEffect: "gainCorruptedSidekick",
        overlayText: `<span style="filter:drop-shadow(0vh 0vh 0.3vh black);">SIDEKICK</span>`,
      });
      await enterCityFromRight(stamped);
    }
    updateGameBoard();
    return;
  }

  // Twist 8: "All Sidekicks in the city escape." Direct push + count (mirrors the
  // escapedVillainsDeck.push / escapedVillainsCount++ in handleVillainEscape) but WITHOUT
  // handleVillainEscapeActions — the card states a plain escape, no KO-an-HQ-Hero / discard penalty.
  if (twist === 8) {
    let escaped = 0;
    for (let i = 0; i < city.length; i++) {
      const c = city[i];
      if (c && c.corruptSidekick) {
        // Any Bystanders captured on this Sidekick-Villain escape WITH it — mirror handleVillainEscape
        // (script.js ~6310) so the manual escape path doesn't silently orphan them when the slot is
        // nulled. (Corrupt Sidekick-Villains have no ascension, so only the plain bystander case applies.)
        if (Array.isArray(c.bystander) && c.bystander.length > 0) {
          c.bystander.forEach((bystander) => {
            escapedVillainsDeck.push(bystander);
            onscreenConsole.log(
              `Bystander escaped with <span class="console-highlights">${c.name}</span>.`,
            );
          });
        }
        city[i] = null;
        escapedVillainsDeck.push(c);
        escapedVillainsCount++;
        escaped++;
        onscreenConsole.log(
          `<span class="console-highlights">${c.name}</span> escapes the city.`,
        );
      }
    }
    onscreenConsole.log(
      escaped > 0
        ? `${escaped} corrupted ${escaped === 1 ? "Sidekick" : "Sidekicks"} escaped the city.`
        : `No Sidekicks in the city to escape.`,
    );
    updateGameBoard();
  }
}

// Defeat converter (fightEffect on the fight COPY): flip a defeated Sidekick-Villain back to a
// Sidekick and gain it to the TOP of your deck (NOT the Victory Pile — skrulled:true already made
// the post-defeat handlers skip the VP push). Mirrors gainScarletWitchAsHero, but the card stays a
// Sidekick and goes to the deck top (gainSidekick "deckTop" semantics: playerDeck.push + revealed).
function gainCorruptedSidekick(villainCopy) {
  if (!villainCopy) return;
  villainCopy.type = villainCopy.originalType || "Hero";
  villainCopy.attack = villainCopy.originalAttack || 0;
  villainCopy.skrulled = false;
  villainCopy.corruptSidekick = false;
  villainCopy.fightEffect = ""; // gained Sidekick carries no villain fight effect (mirrors unskrull)
  villainCopy.attackFromScheme = 0;
  villainCopy.overlayText = "";
  villainCopy.overlayTextAttack = "";
  villainCopy.revealed = true; // visible on top of the deck (matches gainSidekick "deckTop")
  playerDeck.push(villainCopy); // playerDeck draws from the end → push = top of deck
  onscreenConsole.log(
    `You defeated a corrupted <span class="console-highlights">Sidekick</span> and gained it to the top of your deck.`,
  );
  updateGameBoard();
}

// ============================================================================
// Build an Army of Annihilation scheme (Secret Wars Vol.1)
// ----------------------------------------------------------------------------
// "Setup: 9 Twists. Put 10 extra Annihilation Wave Henchmen in that KO pile. / Twist: KO all
// Annihilation Henchmen from the players' Victory Piles. Stack this Twist next to the Scheme. Then,
// for each Twist in that stack, put an Annihilation Henchman from the KO pile next to the Mastermind.
// Players can fight those Henchmen. / Evil Wins: When there are 10 Annihilation Henchmen next to the
// Mastermind."
//
// STAND-IN: "Annihilation Wave Henchmen" is a pre-release printing error; per the ruling (rules-notes
// BATCH 8 ④ / Q1) we use the M.O.D.O.K.s henchman art + stats (Attack 3, VP 1) as a scheme-spawned,
// dedicated 10-Henchman army — NOT the villain-deck M.O.D.O.K.s group, and NOT shuffled into the deck.
//
// STATE (script.js): `annihilationSupply` (off-board KO/reserve pool, seeded to 10 at setup in initGame),
// `annihilationHenchmenNextToMM` (LIVE count next to the Mastermind = the loss meter), and the dedicated
// `annihilationTwistStack` (escalating per-twist placement amount). This is the HYDRA-Traitor
// next-to-scheme pattern (expansionRevelations.js) adapted: a count-badge of fightable entities with a
// click-to-fight affordance, paying 3 Attack — but defeat sends the Henchman to the Victory Pile
// (scores VP 1), and each twist first recycles defeated ones from the Victory Pile back to the supply.
//
// LOSS MODEL (rules-notes BATCH 8 ④, coordinator-confirmed): placement is ADDITIVE — the count
// ACCUMULATES (worst case, no defeats: 1+2+3+4 = 10 by Twist 4). It is NOT re-derived from the
// twist-stack size each twist (that snapshot model caps at 9 and makes the loss unreachable).

// Mint one fungible Annihilation Henchman (M.O.D.O.K. stand-in). Stats from the M.O.D.O.K.s henchman
// (Attack 3, VP 1). `isAnnihilationHenchman` tags it so the per-twist recycle can find it in the
// Victory Pile. No fightEffect — these are plain Annihilation Henchmen, fought via the badge.
function makeAnnihilationHenchman() {
  return {
    type: "Villain",
    name: "Annihilation Henchman",
    team: "M.O.D.O.K.s",
    henchmen: true,
    attack: 3,
    originalAttack: 3,
    victoryPoints: 1,
    classes: [],
    keywords: [],
    image: "Visual Assets/Henchmen/SecretWarsVol1_MODOKS.webp",
    isAnnihilationHenchman: true,
  };
}

async function buildAnArmyOfAnnihilationTwist() {
  // Step 1: KO all Annihilation Henchmen from the Victory Pile back to the scheme's supply pool
  // ("KO all Annihilation Henchmen from the players' Victory Piles"). They leave the Victory Pile,
  // so the player loses that VP — by design (the recycle re-arms the army).
  const recovered = victoryPile.filter((c) => c.isAnnihilationHenchman).length;
  if (recovered > 0) {
    victoryPile = victoryPile.filter((c) => !c.isAnnihilationHenchman);
    annihilationSupply += recovered;
    onscreenConsole.log(
      `<span class="console-highlights">Build an Army of Annihilation</span> — ${recovered} defeated Annihilation Henchman/Henchmen KO'd from the Victory Pile back to the supply.`,
    );
  }

  // Step 2: stack this Twist next to the Scheme (escalating count). Dedicated counter — see the
  // annihilationTwistStack declaration note (avoids the shared stackedTwistNextToMastermind badge).
  annihilationTwistStack++;

  // Step 3: for each Twist in that stack, put an Annihilation Henchman from the supply next to the
  // Mastermind. ADDITIVE — adds to whatever is already there, bounded by the supply.
  const toPlace = Math.min(annihilationTwistStack, annihilationSupply);
  annihilationSupply -= toPlace;
  annihilationHenchmenNextToMM += toPlace;
  onscreenConsole.log(
    `Placed ${toPlace} Annihilation Henchman/Henchmen next to <span class="console-highlights">${getSelectedMastermind().name}</span> (${annihilationHenchmenNextToMM} now next to the Mastermind; ${annihilationSupply} left in the supply).`,
  );

  // updateGameBoard runs the end-game check (Evil Wins at 10 next to the Mastermind) and refreshes
  // the badge + the "N/10" tracker.
  updateGameBoard();
}

// Fight one Annihilation Henchman next to the Mastermind: pay 3 Attack → defeat → Victory Pile (VP 1).
// Mirrors fightHydraTraitor's attack-spend (honours recruitUsedToAttack via showCounterPopup; spending
// Attack does NOT touch cumulativeAttackPoints). Unlike the Traitor, the Henchman is DEFEATED (scored
// to the Victory Pile), not returned to the supply — and no Hero is KO'd.
async function fightAnnihilationHenchman() {
  const COST = 3;
  const activeScheme = getActiveScheme();
  if (!activeScheme || activeScheme.name !== "Build an Army of Annihilation") {
    return false;
  }
  if (annihilationHenchmenNextToMM <= 0) {
    onscreenConsole.log("No Annihilation Henchmen are next to the Mastermind.");
    return false;
  }
  // Affordability honors Negative Zone (Recruit pays Attack costs) + recruit-as-attack — mirror the
  // Fight the Future hero fight (~line 947-949), minus its Bribe term (a plain Henchman has no Bribe).
  // TWIN: keep identical to showAnnihilationHenchmanFightPrompt's affordability line.
  const available = negativeZoneAttackAndRecruit
    ? totalRecruitPoints
    : totalAttackPoints + (recruitUsedToAttack === true ? totalRecruitPoints : 0);
  if (available < COST) {
    onscreenConsole.log(
      `You need 3 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> to fight an <span class="console-highlights">Annihilation Henchman</span>.`,
    );
    return false;
  }

  // Spend the cost — mirror the Fight the Future hero fight's spend (~line 987-1004), minus its Bribe
  // term. Under Negative Zone the cost is paid entirely in Recruit (precedence over recruit-as-attack,
  // exactly as Fight the Future gates it). Spending Attack/Recruit here does NOT touch the cumulative
  // (Final Showdown) totals — this is a cost, not a grant.
  if (negativeZoneAttackAndRecruit) {
    totalRecruitPoints -= COST;
  } else if (recruitUsedToAttack === true) {
    const result = await showCounterPopup(
      { name: "Annihilation Henchman", image: makeAnnihilationHenchman().image },
      COST,
    );
    totalAttackPoints -= result.attackUsed || 0;
    totalRecruitPoints -= result.recruitUsed || 0;
  } else {
    totalAttackPoints -= COST;
  }

  // Defeat: the Henchman leaves the Mastermind and joins the Victory Pile (scores VP 1). The next
  // Twist's Step 1 will KO it back out to the supply.
  annihilationHenchmenNextToMM--;
  victoryPile.push(makeAnnihilationHenchman());
  // Cost-source wording: under Negative Zone the 3 was paid in Recruit, not Attack (the recruit-as-attack
  // split case is shown to the player via showCounterPopup above, so keep the generic "Attack" there).
  const costLabel = negativeZoneAttackAndRecruit ? "3 Recruit" : "3 Attack";
  onscreenConsole.log(
    `You defeated an <span class="console-highlights">Annihilation Henchman</span> (${costLabel}) — worth 1 VP. (${annihilationHenchmenNextToMM} left next to the Mastermind.)`,
  );

  if (typeof playSFX === "function") playSFX("attack");
  updateGameBoard();
  return true;
}

// Click affordance on the Annihilation-army badge: confirm the optional fight before resolving
// (fighting is a choice). Guards keep it scheme-only, count>0, affordable (3 Attack).
function showAnnihilationHenchmanFightPrompt() {
  const activeScheme = getActiveScheme();
  if (!activeScheme || activeScheme.name !== "Build an Army of Annihilation") return;
  if (annihilationHenchmenNextToMM <= 0) return;
  // TWIN of fightAnnihilationHenchman's affordability — honors Negative Zone + recruit-as-attack
  // (mirror of Fight the Future ~line 947-949, minus Bribe). Keep the two lines identical.
  const available = negativeZoneAttackAndRecruit
    ? totalRecruitPoints
    : totalAttackPoints + (recruitUsedToAttack === true ? totalRecruitPoints : 0);
  if (available < 3) {
    onscreenConsole.log(
      `You need 3 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> to fight an <span class="console-highlights">Annihilation Henchman</span>.`,
    );
    return;
  }
  const { confirmButton, denyButton } = showHeroAbilityMayPopup(
    `Pay 3 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> to fight an <span class="console-highlights">Annihilation Henchman</span>? You defeat it (worth 1 VP) and it leaves the Mastermind.`,
    "Fight (3 Attack)",
    "Cancel",
  );
  const titleEl = document.querySelector(".info-or-choice-popup-title");
  if (titleEl) titleEl.textContent = "ANNIHILATION HENCHMAN";
  confirmButton.onclick = async () => {
    closeInfoChoicePopup();
    await fightAnnihilationHenchman();
  };
  denyButton.onclick = () => {
    closeInfoChoicePopup();
  };
}

// ============================================================================
// Master of Tyrants scheme (Secret Wars Vol.1) — the last Phase 3e scheme
// ----------------------------------------------------------------------------
// "Setup: 8 Twists. Choose 3 other Masterminds, and shuffle their 12 Tactics into the Villain Deck.
// Those Tactics are 'Tyrant Villains' with their printed Attack and no abilities. / Twists 1-7: Put
// this Twist under a Tyrant Villain as 'Dark Power.' It gets +2 Attack. / Twist 8: All Tyrant Villains
// in the city escape. / Evil Wins: When 5 Tyrant Villains escape."
//
// RULINGS (rules-notes BATCH 8 ⑤, coordinator-confirmed 2026-06-26):
//   • "Choose 3 other Masterminds" = RANDOM, 3 DISTINCT, excluding the main, from the Core pool (the 5
//     `darkAllianceEligible` Masterminds). Reuses the Dark Alliance picker pool.
//   • Tyrant "printed Attack" = the SOURCE MASTERMIND's Attack (Mastermind Tactic cards print the
//     Mastermind's Attack; the tactic objects carry no `attack` field of their own).
//   • Tyrant defeat VP = the Tactic's PRINTED VP (each tactic's own `victoryPoints` — usually 6, but
//     5 for Dr. Doom). HOUSE INTERPRETATION (rulebook silent; research
//     ~/.claude/research/2026-06-26-legendary-master-of-tyrants-tyrant-villain-vp.md). The DB tactic
//     already carries the right value, so the stamp preserves it (skrulled:false → normal VP push).
//   • Dark Power STACKS: +2 Attack per Twist under the SAME Tyrant (two → +4), via per-villain
//     `darkPower` count folded into `attackFromScheme` in BOTH updateVillain/HQ attack twins; the
//     `darkPower`/`isTyrant` fields are whitelisted in createVillainCopy so they survive the fight copy.
//
// REUSE: setup-inject via the shared `stampCardsAsInDeckVillains` helper (per source Mastermind, to set
// the per-MM printed Attack), the Dark Alliance eligible pool, `showCardSelectionPopup` for the Dark
// Power target, and the Corrupt Twist-8 escape-all pattern. The ONE genuinely-new piece is the
// persistent villain-identity-keyed `darkPower` +2 token (cityPermBuff is position-keyed,
// sentinelVillainAttackDelta is global — neither fit; modelled on the per-villain `shards` field).

// Pick 3 DISTINCT eligible Masterminds (Dark Alliance Core pool), excluding the main. Returns [] if the
// pool is too small (defensive; the 5-MM pool minus the main always yields ≥4, so 3 is safe).
function pickThreeDistinctTyrantMasterminds() {
  const main = getSelectedMastermind();
  const pool = masterminds.filter(
    (m) => m.darkAllianceEligible === true && m.name !== main.name,
  );
  // The 5-MM eligible pool minus the main always yields ≥4, so 3 distinct is safe; slice handles a
  // smaller pool defensively. Reuses the canonical shuffle() helper (script.js).
  return shuffle([...pool]).slice(0, 3);
}

// Build the 12 Tyrant Villains (3 Masterminds × 4 Tactics). Each Tactic is stamped type:"Villain" with
// the source Mastermind's printed Attack, no abilities (fightEffect stripped), skrulled:false (defeats
// to the Victory Pile normally → scores the Tactic's printed VP), and isTyrant:true. Called from
// generateVillainDeck (script.js) at setup.
function buildMasterOfTyrantsTyrants() {
  const chosen = pickThreeDistinctTyrantMasterminds();
  let tyrants = [];
  chosen.forEach((mm) => {
    // stampCardsAsInDeckVillains spreads ...card (keeps the tactic's victoryPoints), sets type:"Villain"
    // + originalAttack/originalType, then applies this stamp. We override attack to the Mastermind's
    // printed Attack, clear skrulled (so VP scores), strip the ability, and tag isTyrant + darkPower:0.
    const stamped = stampCardsAsInDeckVillains(mm.tactics, {
      attack: mm.attack, // printed Attack = source Mastermind's Attack (tactics carry no attack field)
      originalAttack: mm.attack, // self-consistent base for any future attack-restore path (helper would set undefined)
      skrulled: false, // defeat → Victory Pile normally (scores the Tactic's printed VP)
      fightEffect: "", // "no abilities" — the Tactic's fight effect is stripped (villains resolve via fightEffect only)
      isTyrant: true,
      darkPower: 0, // count of Dark Power Twists under this Tyrant (each = +2 Attack)
      tyrantSource: mm.name, // provenance (display/debug only)
    });
    tyrants = tyrants.concat(stamped);
  });
  onscreenConsole.log(
    `<span class="console-highlights">Master of Tyrants</span> — ${chosen.map((m) => m.name).join(", ")} chosen; their ${tyrants.length} Tactics shuffled into the Villain Deck as Tyrant Villains.`,
  );
  return tyrants;
}

async function masterOfTyrantsTwist() {
  const twist = schemeTwistCount; // 1-based; incremented before this dispatch (Corrupt/Dark Alliance precedent)

  if (twist <= 7) {
    // Twists 1-7: "Put this Twist under a Tyrant Villain as 'Dark Power.' It gets +2 Attack."
    // The turn player resolving the Twist chooses which city Tyrant (no random/auto qualifier on the
    // card). Auto-place if exactly one; no-op if none are in the city.
    const cityTyrants = city.filter((c) => c && c.isTyrant === true);
    if (cityTyrants.length === 0) {
      onscreenConsole.log(
        `No Tyrant Villain is in the city — this Dark Power Twist has no target.`,
      );
      return;
    }
    let target = cityTyrants[0];
    if (cityTyrants.length > 1) {
      const chosen = await showCardSelectionPopup({
        title: "DARK POWER",
        instructions: "Choose a Tyrant Villain to gain Dark Power (+2 Attack).",
        confirmText: "PLACE DARK POWER",
        items: cityTyrants,
      });
      if (chosen) target = chosen;
    }
    target.darkPower = (target.darkPower || 0) + 1;
    onscreenConsole.log(
      `Dark Power placed under <span class="console-highlights">${target.name}</span> — +2 Attack (now +${target.darkPower * 2} from Dark Power).`,
    );
    updateGameBoard();
    return;
  }

  // Twist 8: "All Tyrant Villains in the city escape." Direct push + escapedVillainsCount++ (mirrors
  // the Corrupt Twist-8 escape-all; plain escape, no KO/discard penalty). The isTyrant flag rides into
  // escapedVillainsDeck → counted by the tyrants5Escape end-game + the "N/5" tracker twin.
  let escaped = 0;
  for (let i = 0; i < city.length; i++) {
    const c = city[i];
    if (c && c.isTyrant === true) {
      // Any Bystanders captured on this Tyrant escape WITH it — mirror handleVillainEscape
      // (script.js ~6310) so the manual escape path doesn't silently orphan them when the slot is
      // nulled. (Tyrants have no fightEffect/ascension, so only the plain bystander case applies.)
      if (Array.isArray(c.bystander) && c.bystander.length > 0) {
        c.bystander.forEach((bystander) => {
          escapedVillainsDeck.push(bystander);
          onscreenConsole.log(
            `Bystander escaped with <span class="console-highlights">${c.name}</span>.`,
          );
        });
      }
      city[i] = null;
      escapedVillainsDeck.push(c);
      escapedVillainsCount++;
      escaped++;
      onscreenConsole.log(
        `<span class="console-highlights">${c.name}</span> (Tyrant Villain) escapes the city.`,
      );
    }
  }
  onscreenConsole.log(
    escaped > 0
      ? `${escaped} Tyrant ${escaped === 1 ? "Villain" : "Villains"} escaped the city.`
      : `No Tyrant Villains in the city to escape.`,
  );
  updateGameBoard();
}
