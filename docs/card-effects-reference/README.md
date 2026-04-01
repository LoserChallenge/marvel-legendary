# Card Effects Reference

Comprehensive inventory of every card in the game, grouped by expansion.

## File Structure

One file per expansion:
- `core-set.md` — 15 heroes, 7 villain groups, 4 masterminds, 8 schemes, 4 henchmen
- `dark-city.md` — 17 heroes, 6 villain groups, 5 masterminds, 8 schemes, 2 henchmen, 3 special bystanders
- `fantastic-four.md` — 5 heroes, 2 villain groups, 2 masterminds, 4 schemes
- `guardians-of-the-galaxy.md` — 5 heroes, 2 villain groups, 2 masterminds, 4 schemes
- `paint-the-town-red.md` — 5 heroes, 2 villain groups, 2 masterminds, 4 schemes

## Icon Notation

Effect text uses shorthand for game icons:

| Icon | Notation |
|------|----------|
| Attack value | `[Attack]` |
| Recruit value | `[Recruit]` |
| Tech class | `[Tech]` |
| Ranged class | `[Ranged]` |
| Covert class | `[Covert]` |
| Strength class | `[Strength]` |
| Instinct class | `[Instinct]` |
| Piercing energy | `[Piercing]` |

## Data Sources

- **Hero effect text**: Extracted from card images in `Visual Assets/Heroes/`
- **Villain/Mastermind/Scheme/Henchmen data**: Extracted from `cardDatabase.js`
- **Special Bystander data**: Extracted from `cardDatabase.js` (expansion bystanders)

## How to Add a New Expansion

1. Create a new file: `docs/card-effects-reference/<expansion-name>.md`
2. Follow the same section structure as existing files
3. Populate hero cards from card images
4. Populate other card types from `cardDatabase.js`
5. Run the Card Effect Auditor against the new file
