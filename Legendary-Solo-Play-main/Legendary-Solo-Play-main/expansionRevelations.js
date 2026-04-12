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

// --- VILLAIN CARD EFFECTS ---

// --- SCHEME TWIST EFFECTS ---

// --- MASTERMIND EFFECTS ---

// --- HENCHMEN EFFECTS ---

// --- BYSTANDER EFFECTS ---
