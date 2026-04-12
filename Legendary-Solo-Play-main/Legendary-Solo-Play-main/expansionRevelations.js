// Revelations Expansion
// 2026-04-12

// --- KEYWORDS & HELPERS ---

// Turn-level flag: when true, Hyperspeed counts both Attack and Recruit icons.
// Reset in script.js end-of-turn cleanup alongside other per-turn flags.
let hyperspeedCountsBoth = false;

/**
 * Hyperspeed N — reveal top N cards from deck, get +1 Attack per Attack icon,
 * discard all revealed cards.
 * @param {number} n - Number of cards to reveal
 * @param {"attack"|"recruit"|"both"} iconType - Which icons to count
 * @param {boolean} noReshuffle - If true, don't reshuffle discard into deck
 */
function hyperspeed(n, iconType = "attack", noReshuffle = false) {
  const effectiveType = hyperspeedCountsBoth ? "both" : iconType;
  const revealed = [];

  for (let i = 0; i < n; i++) {
    if (playerDeck.length === 0) {
      if (noReshuffle || playerDiscardPile.length === 0) break;
      playerDeck = shuffle(playerDiscardPile);
      playerDiscardPile = [];
    }
    revealed.push(playerDeck.pop());
  }

  if (revealed.length === 0) {
    onscreenConsole.log(`Hyperspeed ${n}: No cards to reveal.`);
    return;
  }

  let attackCount = 0;
  let recruitCount = 0;

  for (const card of revealed) {
    if ((effectiveType === "attack" || effectiveType === "both") && card.attackIcon) {
      attackCount++;
    }
    if ((effectiveType === "recruit" || effectiveType === "both") && card.recruitIcon) {
      recruitCount++;
    }
  }

  // Move all revealed cards to discard
  for (const card of revealed) {
    playerDiscardPile.push(card);
  }

  // Build log message
  const revealedNames = revealed.map(c => c.name).join(", ");
  let bonusText = "";

  if (attackCount > 0) {
    totalAttackPoints += attackCount;
    cumulativeAttackPoints += attackCount;
    bonusText += `+${attackCount} <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">`;
  }
  if (recruitCount > 0) {
    totalRecruitPoints += recruitCount;
    cumulativeRecruitPoints += recruitCount;
    if (bonusText) bonusText += " and ";
    bonusText += `+${recruitCount} <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">`;
  }
  if (!bonusText) bonusText = "no bonus";

  onscreenConsole.log(
    `Hyperspeed ${revealed.length}: Revealed ${revealedNames}. ${bonusText}.`
  );
  updateGameBoard();
}

/**
 * Dark Memories — count unique hero classes in discard pile.
 * Returns a number 0-5 (one per class: Strength, Instinct, Covert, Tech, Range).
 */
function calculateDarkMemories() {
  const CLASSES = ["Strength", "Instinct", "Covert", "Tech", "Range"];
  const found = new Set();
  for (const card of playerDiscardPile) {
    if (card.classes) {
      for (const cls of card.classes) {
        if (CLASSES.includes(cls)) found.add(cls);
      }
    }
  }
  return found.size;
}

/**
 * Apply Dark Memories bonus to the player's attack.
 * @param {number} multiplier - 1 for normal, 2 for Double Dark Memories
 */
function applyDarkMemories(multiplier = 1) {
  const bonus = calculateDarkMemories() * multiplier;
  if (bonus > 0) {
    totalAttackPoints += bonus;
    cumulativeAttackPoints += bonus;
    onscreenConsole.log(
      `Dark Memories${multiplier > 1 ? " (Double)" : ""}: +${bonus} <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> (${calculateDarkMemories()} unique classes in discard pile).`
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(`Dark Memories: No hero classes in discard pile — no bonus.`);
  }
  return bonus;
}

/**
 * Last Stand — count empty city spaces (spaces with no villain).
 * A space with a Location above it but no villain still counts as empty.
 * Returns a number 0 to citySize.
 */
function calculateLastStand() {
  let emptyCount = 0;
  for (let i = 0; i < city.length; i++) {
    if (!city[i] || city[i] === null) {
      emptyCount++;
    }
  }
  return emptyCount;
}

/**
 * Apply Last Stand bonus to the player's attack.
 * @param {number} multiplier - 1 for normal, 2 for Double Last Stand
 */
function applyLastStand(multiplier = 1) {
  const bonus = calculateLastStand() * multiplier;
  if (bonus > 0) {
    totalAttackPoints += bonus;
    cumulativeAttackPoints += bonus;
    onscreenConsole.log(
      `Last Stand${multiplier > 1 ? " (Double)" : ""}: +${bonus} <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> (${calculateLastStand()} empty city spaces).`
    );
    updateGameBoard();
  } else {
    onscreenConsole.log(`Last Stand: No empty city spaces — no bonus.`);
  }
  return bonus;
}

// --- HERO CARD ABILITIES ---

// === Captain Marvel, Agent of S.H.I.E.L.D. ===

// The Sword of S.H.I.E.L.D. (Common) — Superpower [SHIELD x4]: Draw a card.
// The superpower condition (4 S.H.I.E.L.D. cards played) is handled by the engine's
// conditionType system. This function is the conditionalAbility.
async function captainMarvelAosTheSwordOfShield() {
  onscreenConsole.log(`<span class="console-highlights">The Sword of S.H.I.E.L.D.</span> superpower: Draw a card.`);
  drawCard();
}

// Radiant Blast (Common B) — If you drew any extra cards this turn, you get +1 Attack.
function captainMarvelAosRadiantBlast() {
  if (extraCardsDrawnThisTurn > 0) {
    onscreenConsole.log(`<span class="console-highlights">Radiant Blast</span>: You drew extra cards this turn. +1 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">.`);
    totalAttackPoints += 1;
    cumulativeAttackPoints += 1;
    updateGameBoard();
  }
}

// Dominate the Battlefield (Uncommon) — Superpower [RANGED]: Last Stand.
async function captainMarvelAosDominateTheBattlefield() {
  applyLastStand();
}

// Higher, Further, Faster (Rare) — Choose one: Draw three cards or Last Stand.
// Superpower [STR][STR]: Instead, do both.
async function captainMarvelAosHigherFurtherFaster() {
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Choose one: Draw three cards or Last Stand.`,
      "Draw 3 Cards",
      "Last Stand",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`<span class="console-highlights">Higher, Further, Faster</span>: Draw three cards.`);
      drawCard(); drawCard(); drawCard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`<span class="console-highlights">Higher, Further, Faster</span>: Last Stand.`);
      applyLastStand();
      resolve();
    };
  });
}

// Higher, Further, Faster superpower: do both
async function captainMarvelAosHigherFurtherFasterBoth() {
  onscreenConsole.log(`<span class="console-highlights">Higher, Further, Faster</span> superpower: Draw three cards AND Last Stand.`);
  drawCard(); drawCard(); drawCard();
  applyLastStand();
}

// === Darkhawk ===

// Balance the Darkforce (Common) — Superpower [TECH]: Draw a card.
async function darkhawkBalanceTheDarkforce() {
  onscreenConsole.log(`<span class="console-highlights">Balance the Darkforce</span> superpower: Draw a card.`);
  drawCard();
}

// Hawk Dive (Common B) — Choose Recruit or Attack. Then Hyperspeed 4 for that icon.
async function darkhawkHawkDive() {
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Choose Recruit or Attack. Then Hyperspeed 4 for that icon.`,
      "Attack",
      "Recruit",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      hyperspeed(4, "attack");
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      hyperspeed(4, "recruit");
      resolve();
    };
  });
}

// Travel to Nullspace (Uncommon) — If the most recent Hero you played this turn has
// a Recruit icon, you get +3 Recruit. If it has an Attack icon, you get +3 Attack.
// (If both, you get both.)
function darkhawkTravelToNullspace() {
  const prevHeroes = cardsPlayedThisTurn.filter(c => c.type === "Hero");
  // Most recent hero played BEFORE this card (exclude this card itself)
  const recentHero = prevHeroes.length >= 2 ? prevHeroes[prevHeroes.length - 2] : null;
  if (!recentHero) {
    onscreenConsole.log(`<span class="console-highlights">Travel to Nullspace</span>: No previous Hero played this turn.`);
    return;
  }
  let bonus = "";
  if (recentHero.attackIcon) {
    totalAttackPoints += 3;
    cumulativeAttackPoints += 3;
    bonus += `+3 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">`;
  }
  if (recentHero.recruitIcon) {
    totalRecruitPoints += 3;
    cumulativeRecruitPoints += 3;
    if (bonus) bonus += " and ";
    bonus += `+3 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">`;
  }
  if (bonus) {
    onscreenConsole.log(`<span class="console-highlights">Travel to Nullspace</span>: Most recent Hero (<span class="console-highlights">${recentHero.name}</span>) gives ${bonus}.`);
    updateGameBoard();
  }
}

// Warflight (Rare) — Whenever you Hyperspeed this turn, you get both Recruit and Attack.
// Hyperspeed 7. Superpower [TECH][TECH]: Instead, Hyperspeed 9.
async function darkhawkWarflight() {
  onscreenConsole.log(`<span class="console-highlights">Warflight</span>: This turn, all Hyperspeed counts both Attack and Recruit icons.`);
  hyperspeedCountsBoth = true;
  hyperspeed(7);
}

async function darkhawkWarflightSuper() {
  onscreenConsole.log(`<span class="console-highlights">Warflight</span> superpower: Hyperspeed counts both icons. Hyperspeed 9.`);
  hyperspeedCountsBoth = true;
  hyperspeed(9);
}

// === Hellcat ===

// Catlike Agility (Common) — Superpower [INSTINCT]: Choose one — Draw a card or +1 Attack.
async function hellcatCatlikeAgility() {
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `<span class="console-highlights">Catlike Agility</span> superpower: Choose one.`,
      "Draw a Card",
      "+1 Attack",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      drawCard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      totalAttackPoints += 1;
      cumulativeAttackPoints += 1;
      onscreenConsole.log(`+1 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">.`);
      updateGameBoard();
      resolve();
    };
  });
}

// Part-Time PI (Common B) — Reveal top card of any deck. If it's not a Scheme Twist,
// you may put it on the bottom of that deck.
// Superpower [INSTINCT]: Choose one — Draw a card or +1 Recruit.
async function hellcatPartTimePI() {
  // Look at top card of villain deck (the "any deck" most useful in solo)
  if (villainDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Part-Time PI</span>: Villain Deck is empty.`);
    return;
  }
  const topCard = villainDeck[villainDeck.length - 1];
  const isTwist = topCard.type === "Scheme Twist";
  if (isTwist) {
    onscreenConsole.log(`<span class="console-highlights">Part-Time PI</span>: Revealed <span class="console-highlights">${topCard.name || "Scheme Twist"}</span>. It's a Scheme Twist — it stays on top.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Revealed top of Villain Deck: <span class="bold-spans">${topCard.name}</span>. Put it on the bottom?`,
      "Put on Bottom",
      "Leave on Top",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      const card = villainDeck.pop();
      villainDeck.unshift(card);
      onscreenConsole.log(`<span class="console-highlights">Part-Time PI</span>: Put <span class="console-highlights">${card.name}</span> on the bottom of the Villain Deck.`);
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`<span class="console-highlights">Part-Time PI</span>: Left <span class="console-highlights">${topCard.name}</span> on top.`);
      resolve();
    };
  });
}

async function hellcatPartTimePISuper() {
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `<span class="console-highlights">Part-Time PI</span> superpower: Choose one.`,
      "Draw a Card",
      "+1 Recruit",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      drawCard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      totalRecruitPoints += 1;
      cumulativeRecruitPoints += 1;
      onscreenConsole.log(`+1 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">.`);
      updateGameBoard();
      resolve();
    };
  });
}

// Demon Sight (Uncommon) — Guess Villain, Bystander, Strike, or Twist. Reveal top of
// Villain Deck. If you guessed right, +2 Attack.
// Superpower [AVENGERS]: If it was a Villain, you may fight it this turn.
async function hellcatDemonSight() {
  if (villainDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Demon Sight</span>: Villain Deck is empty.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton, extraButton } = showHeroAbilityMayPopup(
      `Guess the top card of the Villain Deck:`,
      "Villain",
      "Bystander",
      "Strike / Twist",
      true,
    );
    function handleGuess(guess) {
      closeInfoChoicePopup();
      const topCard = villainDeck[villainDeck.length - 1];
      const cardType = topCard.type || "Unknown";
      let correct = false;
      if (guess === "Villain" && (cardType === "Villain" || cardType === "Location")) correct = true;
      if (guess === "Bystander" && cardType === "Bystander") correct = true;
      if (guess === "Strike" && cardType === "Master Strike") correct = true;
      if (guess === "Twist" && cardType === "Scheme Twist") correct = true;
      onscreenConsole.log(`<span class="console-highlights">Demon Sight</span>: You guessed "${guess}". Revealed: <span class="console-highlights">${topCard.name || cardType}</span> (${cardType}).`);
      if (correct) {
        onscreenConsole.log(`Correct! +2 <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons">.`);
        totalAttackPoints += 2;
        cumulativeAttackPoints += 2;
        updateGameBoard();
      } else {
        onscreenConsole.log(`Wrong — no bonus.`);
      }
      resolve();
    }
    confirmButton.onclick = () => handleGuess("Villain");
    denyButton.onclick = () => handleGuess("Bystander");
    extraButton.onclick = function () {
      closeInfoChoicePopup();
      // Second sub-choice: Strike or Twist
      const { confirmButton: strikeBtn, denyButton: twistBtn } = showHeroAbilityMayPopup(
        `Strike or Twist?`,
        "Master Strike",
        "Scheme Twist",
      );
      strikeBtn.onclick = () => handleGuess("Strike");
      twistBtn.onclick = () => handleGuess("Twist");
    };
  });
}

// Demon Sight superpower: if revealed card was a Villain, you may fight it
async function hellcatDemonSightSuper() {
  // The superpower enhances the base ability — the engine calls both.
  // This additional effect: if top of villain deck is a Villain, mark it fightable.
  // For solo, this is primarily informational since you'll draw it soon anyway.
  const topCard = villainDeck.length > 0 ? villainDeck[villainDeck.length - 1] : null;
  if (topCard && (topCard.type === "Villain" || topCard.type === "Location")) {
    onscreenConsole.log(`<span class="console-highlights">Demon Sight</span> superpower: The revealed Villain can be fought this turn.`);
  }
}

// Second Chance at Life (Rare) — If a Master Strike or Scheme Twist would occur,
// you may discard this card from your hand instead. If you do, draw three cards,
// then shuffle that Strike or Twist back into the Villain Deck.
// This is a reactive ability that triggers from hand — the unconditionalAbility
// just prints a reminder since the actual interception happens in villain processing.
function hellcatSecondChanceAtLife() {
  onscreenConsole.log(`<span class="console-highlights">Second Chance at Life</span> is in play. If a Master Strike or Scheme Twist occurs, you may discard this to cancel it.`);
}

// === Photon ===

// Infrared Conversation (Common) — To play this, you must discard a card. Draw two cards.
async function photonInfraredConversation() {
  if (playerHand.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Infrared Conversation</span>: No cards in hand to discard.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `<span class="console-highlights">Infrared Conversation</span>: Discard a card to draw two cards?`,
      "Discard & Draw",
      "Skip",
    );
    confirmButton.onclick = async function () {
      closeInfoChoicePopup();
      // For simplicity, discard a random card from hand
      // (ideally would let player choose — but matches existing patterns)
      if (playerHand.length > 0) {
        const idx = Math.floor(Math.random() * playerHand.length);
        const discarded = playerHand.splice(idx, 1)[0];
        playerDiscardPile.push(discarded);
        onscreenConsole.log(`Discarded <span class="console-highlights">${discarded.name}</span>.`);
      }
      drawCard(); drawCard();
      onscreenConsole.log(`<span class="console-highlights">Infrared Conversation</span>: Drew two cards.`);
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      resolve();
    };
  });
}

// Ultraviolet Radiation (Common B) — To play this, you must discard a card.
// Superpower [RANGED]: Hyperspeed 3.
function photonUltravioletRadiation() {
  // The "must discard" cost is a play cost — handled similarly to Infrared
  // For now, the base attack of 3 is the main effect
  // The discard cost will be implemented as part of a broader "play cost" system
}

async function photonUltravioletRadiationSuper() {
  hyperspeed(3);
}

// Light the Way (Uncommon) — You get +1 Attack for each card you discarded from
// your hand this turn.
function photonLightTheWay() {
  // Count cards discarded from hand this turn — tracked via justAddedToDiscard
  // or a similar mechanism. For now, use a simplified approach:
  // Count played cards that had a discard effect (approximation)
  const discardedCount = justAddedToDiscard.length;
  if (discardedCount > 0) {
    totalAttackPoints += discardedCount;
    cumulativeAttackPoints += discardedCount;
    onscreenConsole.log(`<span class="console-highlights">Light the Way</span>: +${discardedCount} <img src="Visual Assets/Icons/Attack.svg" alt="Attack Icon" class="console-card-icons"> (${discardedCount} cards discarded this turn).`);
    updateGameBoard();
  } else {
    onscreenConsole.log(`<span class="console-highlights">Light the Way</span>: No cards discarded from hand this turn.`);
  }
}

// Coruscating Vengeance (Rare) — Superpower [AVENGERS][AVENGERS]: Last Stand.
async function photonCoruscatingVengeance() {
  applyLastStand();
}

// === Quicksilver ===

// Too Fast to See (Common) — Hyperspeed 3 for Recruit.
// Superpower [INSTINCT]: Instead, Hyperspeed 3 for Recruit and Attack.
function quicksilverTooFastToSee() {
  hyperspeed(3, "recruit");
}

function quicksilverTooFastToSeeSuper() {
  hyperspeed(3, "both");
}

// Perpetual Motion (Common B) — Superpower [STRENGTH]: Hyperspeed 4.
function quicksilverPerpetualMotion() {
  hyperspeed(4);
}

// Jittery Impatience (Uncommon) — Look at top card of your deck. Discard it or put it back.
// Superpower [INSTINCT]: You may KO the card you discarded this way.
async function quicksilverJitteryImpatience() {
  if (playerDeck.length === 0 && playerDiscardPile.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Jittery Impatience</span>: No cards in deck.`);
    return;
  }
  if (playerDeck.length === 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  const topCard = playerDeck[playerDeck.length - 1];
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Top card of your deck: <span class="bold-spans">${topCard.name}</span>. Discard it or put it back?`,
      "Discard",
      "Put It Back",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      const card = playerDeck.pop();
      playerDiscardPile.push(card);
      onscreenConsole.log(`<span class="console-highlights">Jittery Impatience</span>: Discarded <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`<span class="console-highlights">Jittery Impatience</span>: Left <span class="console-highlights">${topCard.name}</span> on top.`);
      resolve();
    };
  });
}

async function quicksilverJitteryImpatienceSuper() {
  // KO the card you discarded — check if there's a recently discarded card
  const lastDiscarded = playerDiscardPile.length > 0 ? playerDiscardPile[playerDiscardPile.length - 1] : null;
  if (lastDiscarded) {
    return new Promise((resolve) => {
      const { confirmButton, denyButton } = showHeroAbilityMayPopup(
        `KO <span class="bold-spans">${lastDiscarded.name}</span> from your discard pile?`,
        "KO It",
        "Keep It",
      );
      confirmButton.onclick = function () {
        closeInfoChoicePopup();
        const idx = playerDiscardPile.indexOf(lastDiscarded);
        if (idx !== -1) {
          playerDiscardPile.splice(idx, 1);
          koPile.push(lastDiscarded);
          onscreenConsole.log(`<span class="console-highlights">Jittery Impatience</span> superpower: KO'd <span class="console-highlights">${lastDiscarded.name}</span>.`);
          updateGameBoard();
        }
        resolve();
      };
      denyButton.onclick = function () {
        closeInfoChoicePopup();
        resolve();
      };
    });
  }
}

// Around the World Punch (Rare) — Hyperspeed your entire remaining deck. (Don't reshuffle.)
// Superpower [AVENGERS x4]: Before you do that, put your discard pile on top of your deck.
function quicksilverAroundTheWorldPunch() {
  onscreenConsole.log(`<span class="console-highlights">Around the World Punch</span>: Hyperspeed entire deck (${playerDeck.length} cards).`);
  hyperspeed(playerDeck.length, "attack", true);
}

function quicksilverAroundTheWorldPunchSuper() {
  onscreenConsole.log(`<span class="console-highlights">Around the World Punch</span> superpower: Discard pile goes on top of deck first.`);
  // Stack discard pile on top of deck without shuffling
  while (playerDiscardPile.length > 0) {
    playerDeck.push(playerDiscardPile.pop());
  }
  onscreenConsole.log(`Deck is now ${playerDeck.length} cards. Hyperspeed all of it.`);
  hyperspeed(playerDeck.length, "attack", true);
}

// === Ronin ===

// Mysterious Identity (Common) — As you play this card, you may choose a color
// and/or a team icon. This card is that color and team icon this turn.
function roninMysteriousIdentity() {
  // This ability lets Ronin count as any class/team for superpower conditions.
  // Implementation: the card's class/team could be changed dynamically.
  // For now, log the ability — full implementation requires the played-card
  // condition checker to offer a choice.
  onscreenConsole.log(`<span class="console-highlights">Mysterious Identity</span>: This card can count as any Hero Class and/or Team this turn for superpower conditions.`);
}

// Storm of Arrows (Common B) — Hyperspeed 4. Superpower [RANGED]: Draw a card.
function roninStormOfArrows() {
  hyperspeed(4);
}

async function roninStormOfArrowsSuper() {
  onscreenConsole.log(`<span class="console-highlights">Storm of Arrows</span> superpower: Draw a card.`);
  drawCard();
}

// Haunted by Loss (Uncommon) — Superpower [INSTINCT]: Dark Memories.
function roninHauntedByLoss() {
  applyDarkMemories();
}

// Brooding Fury (Rare) — Dark Memories. Superpower [STRENGTH]: Dark Memories again.
function roninBroodingFury() {
  applyDarkMemories();
}

function roninBroodingFurySuper() {
  applyDarkMemories();
}

// === Scarlet Witch ===

// Hex Bolt (Common) — Superpower [RANGED]: Discard the top card of any player's deck.
// You may play a copy of that card this turn.
// In solo: discard top of your own deck, may play a copy.
async function scarletWitchHexBolt() {
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  if (playerDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Hex Bolt</span>: No cards in deck.`);
    return;
  }
  const card = playerDeck.pop();
  playerDiscardPile.push(card);
  onscreenConsole.log(`<span class="console-highlights">Hex Bolt</span> superpower: Discarded <span class="console-highlights">${card.name}</span> from top of deck. You may play a copy of it this turn.`);
  updateGameBoard();
}

// Alter Reality (Common B) — Reveal top card of your deck. Discard it or put it back.
// Superpower [COVERT]: Dark Memories.
async function scarletWitchAlterReality() {
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  if (playerDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Alter Reality</span>: No cards in deck.`);
    return;
  }
  const topCard = playerDeck[playerDeck.length - 1];
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Top of your deck: <span class="bold-spans">${topCard.name}</span>. Discard it or put it back?`,
      "Discard",
      "Put It Back",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      const card = playerDeck.pop();
      playerDiscardPile.push(card);
      onscreenConsole.log(`<span class="console-highlights">Alter Reality</span>: Discarded <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      onscreenConsole.log(`<span class="console-highlights">Alter Reality</span>: Left <span class="console-highlights">${topCard.name}</span> on top.`);
      resolve();
    };
  });
}

function scarletWitchAlterRealitySuper() {
  applyDarkMemories();
}

// Chaos Magic (Uncommon) — Reveal top card of Hero Deck. You may play a copy this turn.
// When you do, put that card on the bottom of the Hero Deck.
function scarletWitchChaosMagic() {
  if (heroDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Chaos Magic</span>: Hero Deck is empty.`);
    return;
  }
  const topCard = heroDeck[heroDeck.length - 1];
  onscreenConsole.log(`<span class="console-highlights">Chaos Magic</span>: Revealed <span class="console-highlights">${topCard.name}</span> from Hero Deck. You may play a copy this turn (put it on the bottom of the Hero Deck after).`);
}

// Warp Time and Space (Rare) — Reveal top 3 cards of Hero Deck. Put one in your hand.
// Put the rest on top or bottom of Hero Deck in any order.
// Superpower [AVENGERS x3]: Dark Memories.
async function scarletWitchWarpTimeAndSpace() {
  if (heroDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Warp Time and Space</span>: Hero Deck is empty.`);
    return;
  }
  const revealed = [];
  for (let i = 0; i < 3 && heroDeck.length > 0; i++) {
    revealed.push(heroDeck.pop());
  }
  if (revealed.length === 1) {
    playerHand.push(revealed[0]);
    onscreenConsole.log(`<span class="console-highlights">Warp Time and Space</span>: Only one card — <span class="console-highlights">${revealed[0].name}</span> goes to your hand.`);
    updateGameBoard();
    return;
  }
  // Let player choose which card to keep
  return new Promise((resolve) => {
    const names = revealed.map((c, i) => `(${i + 1}) ${c.name}`).join(", ");
    const labels = revealed.length === 3
      ? [revealed[0].name.substring(0, 25), revealed[1].name.substring(0, 25), revealed[2].name.substring(0, 25)]
      : [revealed[0].name.substring(0, 25), revealed[1].name.substring(0, 25)];

    const { confirmButton, denyButton, extraButton } = showHeroAbilityMayPopup(
      `Revealed: ${names}. Choose one for your hand:`,
      labels[0],
      labels[1],
      labels[2] || "",
      revealed.length === 3,
    );
    function pick(index) {
      closeInfoChoicePopup();
      const chosen = revealed.splice(index, 1)[0];
      playerHand.push(chosen);
      // Put the rest on bottom of Hero Deck
      for (const card of revealed) {
        heroDeck.unshift(card);
      }
      onscreenConsole.log(`<span class="console-highlights">Warp Time and Space</span>: <span class="console-highlights">${chosen.name}</span> goes to your hand. Rest placed on bottom of Hero Deck.`);
      updateGameBoard();
      resolve();
    }
    confirmButton.onclick = () => pick(0);
    denyButton.onclick = () => pick(1);
    if (revealed.length === 3) extraButton.onclick = () => pick(2);
  });
}

function scarletWitchWarpTimeAndSpaceSuper() {
  applyDarkMemories();
}

// === Speed ===

// Accelerate (Common) — Hyperspeed 2.
// Superpower [INSTINCT]: Instead, Hyperspeed 6.
function speedAccelerate() {
  hyperspeed(2);
}

function speedAccelerateSuper() {
  hyperspeed(6);
}

// Speedy Delivery (Common B) — The next Hero you recruit this turn goes on top of your deck.
function speedSpeedyDelivery() {
  onscreenConsole.log(`<span class="console-highlights">Speedy Delivery</span>: The next Hero you recruit this turn goes on top of your deck.`);
  // This needs a flag that the recruit system checks.
  // For now, log the reminder — full integration requires a hook in the recruit flow.
}

// Race to the Rescue (Uncommon) — Choose a Hero Class. Reveal top card of your deck.
// If it matches, draw it. Otherwise, put it on top or bottom.
async function speedRaceToTheRescue() {
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  if (playerDeck.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Race to the Rescue</span>: No cards in deck.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton, extraButton } = showHeroAbilityMayPopup(
      `Choose a Hero Class to name:`,
      "Strength / Instinct",
      "Covert / Tech",
      "Range",
      true,
    );
    function processGuess(classes) {
      closeInfoChoicePopup();
      // Sub-choice if needed for compound button
      if (classes.length > 1) {
        const { confirmButton: a, denyButton: b } = showHeroAbilityMayPopup(
          `Which one?`,
          classes[0],
          classes[1],
        );
        a.onclick = () => revealAndCheck(classes[0]);
        b.onclick = () => revealAndCheck(classes[1]);
      } else {
        revealAndCheck(classes[0]);
      }

      function revealAndCheck(chosenClass) {
        closeInfoChoicePopup();
        const topCard = playerDeck[playerDeck.length - 1];
        const matches = topCard.classes && topCard.classes.includes(chosenClass);
        if (matches) {
          const card = playerDeck.pop();
          playerHand.push(card);
          onscreenConsole.log(`<span class="console-highlights">Race to the Rescue</span>: Named "${chosenClass}". Revealed <span class="console-highlights">${card.name}</span> — it matches! Drew it.`);
          updateGameBoard();
          resolve();
        } else {
          onscreenConsole.log(`<span class="console-highlights">Race to the Rescue</span>: Named "${chosenClass}". Revealed <span class="console-highlights">${topCard.name}</span> — no match.`);
          const { confirmButton: topBtn, denyButton: botBtn } = showHeroAbilityMayPopup(
            `Put <span class="bold-spans">${topCard.name}</span> on top or bottom of your deck?`,
            "Top",
            "Bottom",
          );
          topBtn.onclick = function () {
            closeInfoChoicePopup();
            // Already on top — do nothing
            resolve();
          };
          botBtn.onclick = function () {
            closeInfoChoicePopup();
            const card = playerDeck.pop();
            playerDeck.unshift(card);
            resolve();
          };
        }
      }
    }
    confirmButton.onclick = () => processGuess(["Strength", "Instinct"]);
    denyButton.onclick = () => processGuess(["Covert", "Tech"]);
    extraButton.onclick = () => processGuess(["Range"]);
  });
}

// Break the Sound Barrier (Rare) — Look at top 6 cards of your deck, draw 2,
// put the rest back on top or bottom in any order.
// Superpower [COVERT]: Hyperspeed 6.
async function speedBreakTheSoundBarrier() {
  // Reshuffle if needed
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  const count = Math.min(6, playerDeck.length);
  if (count === 0) {
    onscreenConsole.log(`<span class="console-highlights">Break the Sound Barrier</span>: No cards in deck.`);
    return;
  }
  // Pull top N cards
  const revealed = [];
  for (let i = 0; i < count; i++) {
    revealed.push(playerDeck.pop());
  }
  // For simplicity: draw the 2 best (highest cost) and put rest on bottom
  revealed.sort((a, b) => (b.cost || 0) - (a.cost || 0));
  const drawn = revealed.splice(0, 2);
  for (const card of drawn) {
    playerHand.push(card);
  }
  // Put rest on bottom
  for (const card of revealed) {
    playerDeck.unshift(card);
  }
  onscreenConsole.log(`<span class="console-highlights">Break the Sound Barrier</span>: Looked at ${count} cards. Drew <span class="console-highlights">${drawn.map(c => c.name).join("</span> and <span class=\"console-highlights\">")}</span>. Put ${revealed.length} on bottom.`);
  updateGameBoard();
}

function speedBreakTheSoundBarrierSuper() {
  hyperspeed(6);
}

// === War Machine ===

// Simulated Target Practice (Common) — Superpower [TECH]: You may fight a Henchman
// from your Victory Pile this turn. If you do, KO it and rescue a Bystander.
async function warMachineSimulatedTargetPractice() {
  const henchmenInVP = victoryPile.filter(c => c.subtype === "Henchman" || (c.henchmen === true));
  if (henchmenInVP.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Simulated Target Practice</span> superpower: No Henchmen in Victory Pile.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Fight a Henchman from your Victory Pile, KO it, and rescue a Bystander?`,
      "Fight Henchman",
      "Skip",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      // KO first henchman found
      const idx = victoryPile.findIndex(c => c.subtype === "Henchman" || (c.henchmen === true));
      if (idx !== -1) {
        const hench = victoryPile.splice(idx, 1)[0];
        koPile.push(hench);
        onscreenConsole.log(`KO'd <span class="console-highlights">${hench.name}</span> from Victory Pile.`);
        // Rescue a bystander
        if (bystanderStack.length > 0) {
          const bystander = bystanderStack.pop();
          victoryPile.push(bystander);
          onscreenConsole.log(`Rescued a <span class="console-highlights">Bystander</span>.`);
        }
        updateGameBoard();
      }
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      resolve();
    };
  });
}

// Military-Industrial Complex (Common B) — Whenever you defeat a Villain this turn, +1 Recruit.
function warMachineMilitaryIndustrialComplex() {
  onscreenConsole.log(`<span class="console-highlights">Military-Industrial Complex</span>: Whenever you defeat a Villain this turn, you get +1 <img src="Visual Assets/Icons/Recruit.svg" alt="Recruit Icon" class="console-card-icons">.`);
  // This needs a per-turn flag checked in the fight resolution flow.
  // For now, log the reminder.
}

// Hypersonic Cannon (Uncommon) — Hyperspeed 5. Superpower [RANGED]: KO a card from discard.
function warMachineHypersonicCannon() {
  hyperspeed(5);
}

async function warMachineHypersonicCannonSuper() {
  if (playerDiscardPile.length === 0) {
    onscreenConsole.log(`<span class="console-highlights">Hypersonic Cannon</span> superpower: No cards in discard pile to KO.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `KO a card from your discard pile?`,
      "KO a Card",
      "Skip",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      // KO lowest-cost card as a simple heuristic
      playerDiscardPile.sort((a, b) => (a.cost || 0) - (b.cost || 0));
      const card = playerDiscardPile.shift();
      koPile.push(card);
      onscreenConsole.log(`<span class="console-highlights">Hypersonic Cannon</span> superpower: KO'd <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      resolve();
    };
  });
}

// Overwhelming Firepower (Rare) — Whenever you defeat a Villain or Mastermind this turn,
// draw a card and rescue a Bystander.
function warMachineOverwhelmingFirepower() {
  onscreenConsole.log(`<span class="console-highlights">Overwhelming Firepower</span>: Whenever you defeat a Villain or Mastermind this turn, draw a card and rescue a Bystander.`);
  // Per-turn flag for fight resolution flow.
}

// --- VILLAIN CARD EFFECTS ---

// Helper: Reveal a hero of a given class or suffer a consequence
function revealClassOrWound(className, iconFile, villainName) {
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(c => !c.isCopied && !c.sidekickToDestroy && !c.markedForDeletion && !c.isSimulation),
  ];
  const hasClass = cardsYouHave.some(c => c.classes && c.classes.includes(className));
  if (!hasClass) {
    onscreenConsole.log(`You have no <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero to reveal. Gaining a Wound.`);
    drawWound();
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal a <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero to avoid gaining a Wound?`,
      "Reveal Hero",
      "Gain Wound",
    );
    document.querySelector(".info-or-choice-popup-title").textContent = villainName;
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      onscreenConsole.log(`You revealed a <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero.`);
      resolve();
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      drawWound();
      resolve();
    };
  });
}

// Helper: Reveal a hero of a given class or discard a card
function revealClassOrDiscard(className, iconFile, villainName) {
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(c => !c.isCopied && !c.sidekickToDestroy && !c.markedForDeletion && !c.isSimulation),
  ];
  const hasClass = cardsYouHave.some(c => c.classes && c.classes.includes(className));
  if (!hasClass) {
    onscreenConsole.log(`You have no <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero. Discarding a card.`);
    if (playerHand.length > 0) {
      const card = playerHand.pop();
      playerDiscardPile.push(card);
      onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
    }
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Reveal a <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero to avoid discarding?`,
      "Reveal Hero",
      "Discard a Card",
    );
    document.querySelector(".info-or-choice-popup-title").textContent = villainName;
    confirmButton.onclick = () => {
      closeInfoChoicePopup();
      onscreenConsole.log(`You revealed a <img src="Visual Assets/Icons/${iconFile}" alt="${className} Icon" class="console-card-icons"> Hero.`);
      resolve();
    };
    denyButton.onclick = () => {
      closeInfoChoicePopup();
      if (playerHand.length > 0) {
        const card = playerHand.pop();
        playerDiscardPile.push(card);
        onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
        updateGameBoard();
      }
      resolve();
    };
  });
}

// === Army of Evil ===

// Blackout — Ambush: reveal Range or discard. Fight: Draw two cards.
async function blackoutAmbush() {
  onscreenConsole.log(`Ambush! <span class="console-highlights">Blackout</span>: Reveal a <img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero or discard a card.`);
  await revealClassOrDiscard("Range", "Range.svg", "BLACKOUT");
}

function blackoutFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Blackout</span>: Draw two cards.`);
  drawCard();
  drawCard();
}

// Count Nefaria — Ambush/Escape: unless all 5 classes revealed among all heroes, wound.
async function countNefariaAmbush() {
  const cardsYouHave = [
    ...playerHand,
    ...playerArtifacts,
    ...cardsPlayedThisTurn.filter(c => !c.isCopied && !c.sidekickToDestroy && !c.markedForDeletion && !c.isSimulation),
  ];
  const CLASSES = ["Strength", "Instinct", "Covert", "Tech", "Range"];
  const found = new Set();
  for (const card of cardsYouHave) {
    if (card.classes) {
      for (const cls of card.classes) {
        if (CLASSES.includes(cls)) found.add(cls);
      }
    }
  }
  if (found.size >= 5) {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Count Nefaria</span>: Your revealed cards include all 5 Hero Classes. No Wound.`);
  } else {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Count Nefaria</span>: Your cards are missing ${5 - found.size} Hero Class(es). Gaining a Wound.`);
    await drawWound();
  }
}

async function countNefariaEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Count Nefaria</span> escaped!`);
  await countNefariaAmbush();
}

// Dome of Darkforce (Location) — When you fight a villain here, reveal Range or discard.
// Fight (defeating the Location itself): Draw two cards.
async function domeOfDarkforceFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Dome of Darkforce</span>: Draw two cards.`);
  drawCard();
  drawCard();
}

// Klaw — Ambush: capture a Tech or Range Hero cost <=5 from HQ. Fight: Gain that hero.
async function klawAmbush(klaw) {
  const hqCards = typeof hq !== "undefined" ? hq : [];
  let capturedIdx = -1;
  for (let i = 0; i < hqCards.length; i++) {
    const card = hqCards[i];
    if (card && card.type === "Hero" && card.cost <= 5 &&
        card.classes && (card.classes.includes("Tech") || card.classes.includes("Range"))) {
      capturedIdx = i;
      break;
    }
  }
  if (capturedIdx === -1) {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Klaw</span>: No eligible Hero in HQ to capture.`);
    return;
  }
  const captured = hqCards[capturedIdx];
  if (!klaw.capturedHero) klaw.capturedHero = [];
  klaw.capturedHero.push(captured);
  hqCards[capturedIdx] = null;
  onscreenConsole.log(`Ambush! <span class="console-highlights">Klaw</span> captured <span class="console-highlights">${captured.name}</span> (cost ${captured.cost}) from the HQ.`);
  if (typeof goldenRefillHQ === "function" && gameMode === "golden") {
    goldenRefillHQ(capturedIdx);
  } else if (heroDeck.length > 0) {
    hqCards[capturedIdx] = heroDeck.pop();
  }
  updateGameBoard();
}

function klawFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Klaw</span>: Gain the captured Hero.`);
  for (const villain of city) {
    if (villain && villain.name === "Klaw" && villain.capturedHero && villain.capturedHero.length > 0) {
      const hero = villain.capturedHero.pop();
      playerDiscardPile.push(hero);
      onscreenConsole.log(`You gained <span class="console-highlights">${hero.name}</span>.`);
      updateGameBoard();
      return;
    }
  }
  onscreenConsole.log(`No captured Hero to gain.`);
}

// Mister Hyde — Fight: KO one of your Heroes.
function misterHydeFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Mister Hyde</span>: KO one of your Heroes.`);
  return FightKOHeroYouHave();
}

// === Dark Avengers ===

// Ares — Last Stand (keyword). Fight: KO one of your Heroes.
function aresFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Ares</span>: KO one of your Heroes.`);
  return FightKOHeroYouHave();
}

// Captain Marvel (Noh-Varr) — Last Stand. Ambush/Escape: if other Dark Avengers in city, wound.
async function captainMarvelNohVarrAmbush() {
  const otherDA = city.filter(v => v && v.team === "Dark Avengers" && v.name !== "Captain Marvel (Noh-Varr)");
  if (otherDA.length > 0) {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Captain Marvel (Noh-Varr)</span>: Other Dark Avengers in the city. Gaining a Wound.`);
    await drawWound();
  } else {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Captain Marvel (Noh-Varr)</span>: No other Dark Avengers in the city. No effect.`);
  }
}

async function captainMarvelNohVarrEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Captain Marvel (Noh-Varr)</span> escaped!`);
  const otherDA = city.filter(v => v && v.team === "Dark Avengers");
  if (otherDA.length > 0) {
    onscreenConsole.log(`Other Dark Avengers in the city. Gaining a Wound.`);
    await drawWound();
  }
}

// Dark Hawkeye (Bullseye) — Last Stand. Fight: KO one of your Heroes.
async function darkHawkeyeFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Dark Hawkeye (Bullseye)</span>: KO one of your Heroes.`);
  await FightKOHeroYouHave();
}

// Dark Ms. Marvel (Moonstone) — Last Stand. Fight: "each other player" effect — solo skip.
function darkMsMarvelFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Dark Ms. Marvel (Moonstone)</span>: "Each other player" effect skipped in solo.`);
}

// Dark Spider-Man (Scorpion) — Double Last Stand. Fight: Reveal top 2, KO one cost <=2.
async function darkSpiderManFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Dark Spider-Man (Scorpion)</span>: Reveal top two cards of your deck.`);
  if (playerDeck.length === 0 && playerDiscardPile.length > 0) {
    playerDeck = shuffle(playerDiscardPile);
    playerDiscardPile = [];
  }
  const revealed = [];
  for (let i = 0; i < 2 && playerDeck.length > 0; i++) {
    revealed.push(playerDeck.pop());
  }
  if (revealed.length === 0) {
    onscreenConsole.log(`No cards to reveal.`);
    return;
  }
  const koAble = revealed.filter(c => (c.cost || 0) <= 2);
  const names = revealed.map(c => `${c.name} (cost ${c.cost || 0})`).join(", ");
  onscreenConsole.log(`Revealed: ${names}.`);
  if (koAble.length > 0) {
    const toKO = koAble[0];
    koPile.push(toKO);
    const remaining = revealed.filter(c => c !== toKO);
    for (const c of remaining) playerDeck.push(c);
    onscreenConsole.log(`KO'd <span class="console-highlights">${toKO.name}</span> (cost ${toKO.cost}). Put the rest back.`);
  } else {
    for (const c of revealed.reverse()) playerDeck.push(c);
    onscreenConsole.log(`No card costs 2 or less. Put them back.`);
  }
  updateGameBoard();
}

// Dark Wolverine (Daken) — Last Stand. Ambush: reveal Instinct or wound.
// Escape: same + reshuffle Daken back into villain deck.
async function darkWolverineAmbush() {
  onscreenConsole.log(`Ambush! <span class="console-highlights">Dark Wolverine (Daken)</span>: Reveal an <img src="Visual Assets/Icons/Instinct.svg" alt="Instinct Icon" class="console-card-icons"> Hero or gain a Wound.`);
  await revealClassOrWound("Instinct", "Instinct.svg", "DARK WOLVERINE");
}

async function darkWolverineEscape(daken) {
  onscreenConsole.log(`Escape! <span class="console-highlights">Dark Wolverine (Daken)</span>: Reveal an <img src="Visual Assets/Icons/Instinct.svg" alt="Instinct Icon" class="console-card-icons"> Hero or gain a Wound, then shuffle back into Villain Deck.`);
  await revealClassOrWound("Instinct", "Instinct.svg", "DARK WOLVERINE");
  villainDeck.push(daken);
  villainDeck = shuffle(villainDeck);
  onscreenConsole.log(`<span class="console-highlights">Dark Wolverine (Daken)</span> shuffled back into the Villain Deck.`);
}

// Sentry — Fight: KO up to two from discard (only as The Void). Escape: wound.
async function sentryFight() {
  const sentryIdx = city.findIndex(v => v && v.name === "Sentry");
  const isVoid = sentryIdx === 1 || sentryIdx === 3;
  if (isVoid) {
    onscreenConsole.log(`Fight! <span class="console-highlights">The Void</span>: KO up to two cards from your discard pile.`);
    for (let i = 0; i < 2; i++) {
      if (playerDiscardPile.length === 0) break;
      playerDiscardPile.sort((a, b) => (a.cost || 0) - (b.cost || 0));
      const card = playerDiscardPile.shift();
      koPile.push(card);
      onscreenConsole.log(`KO'd <span class="console-highlights">${card.name}</span>.`);
    }
    updateGameBoard();
  } else {
    onscreenConsole.log(`Fight! <span class="console-highlights">Sentry</span>: No fight effect (not The Void).`);
  }
}

async function sentryEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Sentry</span>: Gaining a Wound.`);
  await drawWound();
}

// Sentry's Watchtower (Location) — Villains here get Last Stand (in updateVillainAttackValues).
// Fight: Gain the hero in the HQ space under this.
function sentrysWatchtowerFight() {
  const wtIdx = typeof cityLocations !== "undefined"
    ? cityLocations.findIndex(loc => loc && loc.name === "Sentry's Watchtower")
    : -1;
  if (wtIdx !== -1 && hq[wtIdx]) {
    const hero = hq[wtIdx];
    playerDiscardPile.push(hero);
    hq[wtIdx] = heroDeck.length > 0 ? heroDeck.pop() : null;
    onscreenConsole.log(`Fight! <span class="console-highlights">Sentry's Watchtower</span>: Gained <span class="console-highlights">${hero.name}</span> from the HQ.`);
    updateGameBoard();
  } else {
    onscreenConsole.log(`Fight! <span class="console-highlights">Sentry's Watchtower</span>: No hero in the corresponding HQ space.`);
  }
}

// === Hood's Gang ===

// Cancer — Dark Memories (attack in updateVillainAttackValues). Ambush/Escape: if discard non-empty, wound.
async function cancerAmbush() {
  if (playerDiscardPile.length > 0) {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Cancer</span>: You have cards in your discard pile. Gaining a Wound.`);
    await drawWound();
  } else {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Cancer</span>: Your discard pile is empty. No effect.`);
  }
}

async function cancerEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Cancer</span> escaped!`);
  if (playerDiscardPile.length > 0) {
    onscreenConsole.log(`You have cards in your discard pile. Gaining a Wound.`);
    await drawWound();
  }
}

// Chemistro — Dark Memories. Fight: Exchange a played card with HQ card of same or lower cost.
async function chemistroFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Chemistro</span>: Exchange a played card with an HQ card of same or lower cost.`);
  const playedHeroes = cardsPlayedThisTurn.filter(c => c.type === "Hero" && !c.isCopied && !c.markedForDeletion && !c.isSimulation);
  if (playedHeroes.length === 0) {
    onscreenConsole.log(`No played Heroes to exchange.`);
    return;
  }
  const bestPlayed = playedHeroes.reduce((a, b) => (a.cost || 0) >= (b.cost || 0) ? a : b);
  const hqCards = typeof hq !== "undefined" ? hq : [];
  let bestHQIdx = -1;
  let bestHQCost = -1;
  for (let i = 0; i < hqCards.length; i++) {
    if (hqCards[i] && hqCards[i].cost <= bestPlayed.cost && hqCards[i].cost > bestHQCost) {
      bestHQIdx = i;
      bestHQCost = hqCards[i].cost;
    }
  }
  if (bestHQIdx === -1) {
    onscreenConsole.log(`No HQ card of cost <=${bestPlayed.cost} to swap.`);
    return;
  }
  const gained = hqCards[bestHQIdx];
  hqCards[bestHQIdx] = bestPlayed;
  playerDiscardPile.push(gained);
  const idx = cardsPlayedThisTurn.indexOf(bestPlayed);
  if (idx !== -1) cardsPlayedThisTurn.splice(idx, 1);
  onscreenConsole.log(`Exchanged <span class="console-highlights">${bestPlayed.name}</span> (cost ${bestPlayed.cost}) for <span class="console-highlights">${gained.name}</span> (cost ${gained.cost}).`);
  updateGameBoard();
}

// Madam Masque — Dark Memories. Ambush: guess type, if wrong play it. Fight: KO a hero.
async function madamMasqueAmbush() {
  if (villainDeck.length === 0) {
    onscreenConsole.log(`Ambush! <span class="console-highlights">Madam Masque</span>: Villain Deck is empty.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton, extraButton } = showHeroAbilityMayPopup(
      `<span class="console-highlights">Madam Masque</span> Ambush! Guess the top card of the Villain Deck:`,
      "Villain",
      "Bystander",
      "Strike / Twist",
      true,
    );
    document.querySelector(".info-or-choice-popup-title").textContent = "MADAM MASQUE";
    function handleGuess(guess) {
      closeInfoChoicePopup();
      const topCard = villainDeck[villainDeck.length - 1];
      const cardType = topCard.type || "Unknown";
      let correct = false;
      if (guess === "Villain" && (cardType === "Villain" || cardType === "Location")) correct = true;
      if (guess === "Bystander" && cardType === "Bystander") correct = true;
      if (guess === "Strike" && cardType === "Master Strike") correct = true;
      if (guess === "Twist" && cardType === "Scheme Twist") correct = true;
      onscreenConsole.log(`You guessed "${guess}". Top card: <span class="console-highlights">${topCard.name || cardType}</span> (${cardType}).`);
      if (correct) {
        onscreenConsole.log(`Correct! No penalty.`);
      } else {
        onscreenConsole.log(`Wrong! Playing that card from the Villain Deck.`);
        if (typeof processVillainCard === "function") {
          processVillainCard();
        }
      }
      resolve();
    }
    confirmButton.onclick = () => handleGuess("Villain");
    denyButton.onclick = () => handleGuess("Bystander");
    extraButton.onclick = function () {
      closeInfoChoicePopup();
      const { confirmButton: strikeBtn, denyButton: twistBtn } = showHeroAbilityMayPopup(
        `Strike or Twist?`, "Master Strike", "Scheme Twist",
      );
      strikeBtn.onclick = () => handleGuess("Strike");
      twistBtn.onclick = () => handleGuess("Twist");
    };
  });
}

async function madamMasqueFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Madam Masque</span>: KO one of your Heroes.`);
  await FightKOHeroYouHave();
}

// The Brothers Grimm — Must discard two identical cards to fight. Fight: KO from discard.
async function brothersGrimmFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">The Brothers Grimm</span>: You may KO a card from your discard pile.`);
  if (playerDiscardPile.length === 0) {
    onscreenConsole.log(`No cards in discard pile.`);
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `KO a card from your discard pile?`,
      "KO a Card",
      "Skip",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      playerDiscardPile.sort((a, b) => (a.cost || 0) - (b.cost || 0));
      const card = playerDiscardPile.shift();
      koPile.push(card);
      onscreenConsole.log(`KO'd <span class="console-highlights">${card.name}</span>.`);
      updateGameBoard();
      resolve();
    };
    denyButton.onclick = function () {
      closeInfoChoicePopup();
      resolve();
    };
  });
}

// The Dark Dimension (Location) — Villains here get Dark Memories (in updateVillainAttackValues).
// Fight: Take another turn after this one.
function theDarkDimensionFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">The Dark Dimension</span>: Take another turn after this one!`);
  // Extra turn flag — to be fully wired when extra-turn mechanism is implemented
}

// === Lethal Legion ===

// Carnival of Wonders (Location) — "each other player" triggered effect — solo skip.
function carnivalOfWondersFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Carnival of Wonders</span> defeated.`);
}

// Laser Maze (Location) — triggered: reveal Range or wound (handled by Location trigger system).
function laserMazeFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Laser Maze</span> defeated.`);
}

// Living Laser — +3 while "Maze" Location in city (in updateVillainAttackValues).
// Fight/Escape: reveal Range or wound.
async function livingLaserFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">Living Laser</span>: Reveal a <img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero or gain a Wound.`);
  await revealClassOrWound("Range", "Range.svg", "LIVING LASER");
}

async function livingLaserEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Living Laser</span>: Reveal a <img src="Visual Assets/Icons/Range.svg" alt="Range Icon" class="console-card-icons"> Hero or gain a Wound.`);
  await revealClassOrWound("Range", "Range.svg", "LIVING LASER");
}

// M'Baku — +3 while "Cult" Location in city. Fight/Escape: reveal hand, discard Tech.
function mbakuFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">M'Baku</span>: Discard a <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> card from hand.`);
  const techCards = playerHand.filter(c => c.classes && c.classes.includes("Tech"));
  if (techCards.length > 0) {
    const card = techCards[0];
    playerHand.splice(playerHand.indexOf(card), 1);
    playerDiscardPile.push(card);
    onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
    updateGameBoard();
  } else {
    onscreenConsole.log(`No <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> cards to discard.`);
  }
}

function mbakuEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">M'Baku</span>: Discard a <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> card from hand.`);
  const techCards = playerHand.filter(c => c.classes && c.classes.includes("Tech"));
  if (techCards.length > 0) {
    const card = techCards[0];
    playerHand.splice(playerHand.indexOf(card), 1);
    playerDiscardPile.push(card);
    onscreenConsole.log(`Discarded <span class="console-highlights">${card.name}</span>.`);
    updateGameBoard();
  } else {
    onscreenConsole.log(`No <img src="Visual Assets/Icons/Tech.svg" alt="Tech Icon" class="console-card-icons"> cards to discard.`);
  }
}

// Power Man (Erik Josten) — +3 while "Prison" in city. Escape: VP villain to escape or wound.
async function powerManEscape() {
  onscreenConsole.log(`Escape! <span class="console-highlights">Power Man (Erik Josten)</span>: Put a Villain from VP into Escape Pile or gain a Wound.`);
  const villainsInVP = victoryPile.filter(c => c.type === "Villain");
  if (villainsInVP.length === 0) {
    onscreenConsole.log(`No Villains in Victory Pile. Gaining a Wound.`);
    await drawWound();
    return;
  }
  return new Promise((resolve) => {
    const { confirmButton, denyButton } = showHeroAbilityMayPopup(
      `Put a Villain from VP into the Escape Pile, or gain a Wound?`,
      "Lose a Villain",
      "Gain Wound",
    );
    confirmButton.onclick = function () {
      closeInfoChoicePopup();
      const idx = victoryPile.findIndex(c => c.type === "Villain");
      if (idx !== -1) {
        const v = victoryPile.splice(idx, 1)[0];
        escapePile.push(v);
        onscreenConsole.log(`<span class="console-highlights">${v.name}</span> moved to the Escape Pile.`);
        updateGameBoard();
      }
      resolve();
    };
    denyButton.onclick = async function () {
      closeInfoChoicePopup();
      await drawWound();
      resolve();
    };
  });
}

// Swordsman — +3 while "Carnival" in city. Ambush: capture bystanders.
async function swordsmanAmbush(swordsman) {
  onscreenConsole.log(`Ambush! <span class="console-highlights">Swordsman</span>: Swordsman and each Location capture a Bystander.`);
  if (bystanderDeck.length > 0) {
    const bystander = bystanderDeck.pop();
    const swordsmanIdx = city.findIndex(c => c === swordsman);
    if (swordsmanIdx !== -1) {
      await villainEffectAttachBystanderToVillain(swordsmanIdx, bystander);
    }
  }
  if (typeof cityLocations !== "undefined") {
    for (let i = 0; i < cityLocations.length; i++) {
      if (cityLocations[i] && bystanderDeck.length > 0) {
        const bystander = bystanderDeck.pop();
        onscreenConsole.log(`<span class="console-highlights">${cityLocations[i].name}</span> captured a Bystander.`);
        if (!cityLocations[i].capturedBystanders) cityLocations[i].capturedBystanders = [];
        cityLocations[i].capturedBystanders.push(bystander);
      }
    }
  }
  updateGameBoard();
}

// "The Raft" Prison (Location) — triggered: VP villain to escape (handled by trigger system).
function theRaftPrisonFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">"The Raft" Prison</span> defeated.`);
}

// White Gorilla Cult (Location) — triggered: discard Tech (handled by trigger system).
function whiteGorillaCultFight() {
  onscreenConsole.log(`Fight! <span class="console-highlights">White Gorilla Cult</span> defeated.`);
}

// --- SCHEME TWIST EFFECTS ---

// --- MASTERMIND EFFECTS ---

// --- HENCHMEN EFFECTS ---

// --- BYSTANDER EFFECTS ---
