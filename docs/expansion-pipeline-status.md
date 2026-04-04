# Expansion Pipeline Status

Last updated: 2026-04-03

## Pipeline Tracks

**Track A — New expansions (not yet in game):**
1. `/stage-expansion` — organize and rename files in staging folder
2. `/inventory-creator` — Pass 1: build card-data.md (PDF inventory as primary source)
3. `/inventory-verifier` — Pass 2: independent verification, flag discrepancies only
4. User final review with physical cards
5. Move finalized `docs/staging-plans/[expansion]-card-data.md` → `docs/card-effects-reference/[expansion].md`

**Track B — In-game expansions (already coded):**
1. ~~Stage~~ — skip; images already in `Visual Assets/Heroes/[Expansion Display Name]/`
2. `/inventory-creator` — Pass 1: build card-data.md (**DB-primary** — see CLAUDE.md Track B sources)
3. `/inventory-verifier` — Pass 2: independent verification using same DB-primary sources
4. User final review (lighter bar — cards already work; confirming format + catching undocumented edge cases)
5. Replace existing `docs/card-effects-reference/[expansion].md` with finalized file

---

## Current Status

| Expansion | Track | Staged | Pass 1 | Pass 2 | User Review | In card-effects-reference |
|---|---|---|---|---|---|---|
| core-set | B | n/a | ✅ 2026-04-03 | ✅ 2026-04-03 | ✅ 2026-04-03 | ✅ |
| dark-city | B | n/a | ✅ 2026-04-03 | ✅ 2026-04-03 | — | ⚠️ old format |
| fantastic-four | B | n/a | ✅ 2026-04-03 | ⏳ | — | ⚠️ old format |
| guardians-of-the-galaxy | B | n/a | — | — | — | ⚠️ old format |
| paint-the-town-red | B | n/a | — | — | — | ⚠️ old format |
| revelations | A | ✅ | ✅ | ✅ | ⏳ awaiting | — |
| secret-wars-vol1 | A | ✅ | ✅ | ⏳ | — | — |
| heroes-of-asgard | A | ✅ | — | — | — | — |
| x-men | A | ✅ | — | — | — | — |
| into-the-cosmos | A | ❌ | — | — | — | — |
| messiah-complex | A | ❌ | — | — | — | — |
| shadows-of-nightmare | A | ❌ | — | — | — | — |
| shield | A | ❌ | — | — | — | — |
| the-new-mutants | A | ❌ | — | — | — | — |
| weapon-x | A | ❌ | — | — | — | — |
| world-war-hulk | A | ❌ | — | — | — | — |
