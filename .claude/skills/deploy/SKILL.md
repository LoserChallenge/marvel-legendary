---
name: deploy
description: Push current branch to master and deploy to GitHub Pages. Runs a pre-push checklist, pushes, and reminds user to verify the deployment.
disable-model-invocation: true
---

# Deploy to GitHub Pages

Follow these steps in order every time.

## Step 1 — Pre-push checklist

Run `git status` and confirm:
- No unintended files are staged
- No sensitive files (`.env`, credentials) are included
- You are on the `master` branch (run `git branch --show-current` to confirm)

If anything looks unexpected, stop and flag it to the user before continuing.

## Step 2 — Show what's being pushed

Run `git log origin/master..HEAD --oneline` to show the user which commits will be pushed. Read the list out loud in plain English so the user can confirm they're happy with it.

If there are no commits ahead of origin/master, tell the user there is nothing to push and stop.

## Step 3 — Service Worker cache gate (CRITICAL)

Forgetting this is the #1 cause of "changes don't show on GitHub Pages." Check the diff being pushed:
```
git diff origin/master..HEAD --name-only
```

- **If any game file changed** (`script.js`, `cardAbilities*.js`, `expansion*.js`, `cardDatabase.js`, `index.html`, `styles.css`, or assets), confirm `sw.js` `CACHE_NAME` was bumped in this same range — it should appear in the diff with a changed version string (e.g. `'legendary-v7'` → `'legendary-v8'`). If it was NOT bumped, STOP: browsers will serve stale files. Offer to bump it and commit the bump before pushing.
- **If a NEW expansion JS file was added**, also confirm its path is in the `FILES_TO_CACHE` array in `sw.js` — bumping `CACHE_NAME` alone won't serve it offline/PWA. If missing, STOP and offer to add it.

Only continue to the push once the cache is correct.

## Step 4 — Push

Run:
```
git push origin master
```

Report whether it succeeded or failed. If it failed, show the error and stop — do not retry without diagnosing the cause.

## Step 5 — Remind user to verify

Tell the user:
- GitHub Pages takes ~1 minute to deploy after a push
- To verify: open **https://LoserChallenge.github.io/marvel-legendary/** in their browser
- Use **Ctrl+Shift+R** (hard refresh) to bypass the browser cache and see the latest version
- If the page looks unchanged after 2 minutes, check the Actions tab on GitHub for deployment errors
