# Revelations — Consolidated Dual-Mode /game-test (2026-06-15)

Final verification gate after all post-playtest batches landed (Batch D, Obs 12, Obs 1/7).
Served from a fresh port; all five fixes confirmed live on the loaded build (function
`.toString()` / DB values) before testing.

Method: in-game `browser_evaluate` against the real Chromium build. WHATIF mode was verified
per-fix during implementation; this run adds the **GOLDEN SOLO** confirmation (`gameMode ===
"golden"` in-game) plus the loss-trigger that the per-batch smokes didn't exercise.

| Item | What | golden | whatif |
|------|------|:------:|:------:|
| Obs 9 | Korvac no-Bystander → forces discard-to-4, **no** KO popup, transforms to Revealed | ✅ | ✅ |
| Obs 9 | Korvac has-Bystander → both choices still offered | ✅ | ✅ |
| Obs 10 | Korvac Revealed Side-B even twist → descriptive text, **no** bare "Scheme Twist #N!", transforms back | ✅ | ✅ |
| Obs 12 | Sword of S.H.I.E.L.D. superpower fires at **4 other** S.H.I.E.L.D. (5 total, bearer excluded), dead below; draws a card | ✅ | ✅ |
| Obs 1 | Earthquake display "N/3 Villains Escaped" (3/3 with villains+HYDRA Base henchman; bystander/hero/real-Location excluded; 2/3 with 2) | ✅ | ✅ |
| Obs 1 | Earthquake **loss check** (`updateGameBoard`): `finalTwist` fires at 3 escaped enemies incl. HYDRA Base henchman, NOT at 2 | ✅ | — |
| Obs 7 | House of M display "2/12 Non-Grey Heroes KO'd" (grey + bystander excluded) | ✅ | ✅ |

All fixes are mode-agnostic in code (no `gameMode` branch); golden run behaves identically to
whatif, confirmed empirically. Obs 12 threshold (4 *other* cards) matches the rules-oracle
ruling cached in `docs/rules-notes/core.md`.

**Result: Revelations is functionally complete.** Remaining before merge (coordinator-owned):
pre-merge full review pass + Paul's hands-on re-test. Obs 6 + Obs 18 deferred to the post-merge
overlay/layout UX pass (cosmetic; mechanics confirmed working).
