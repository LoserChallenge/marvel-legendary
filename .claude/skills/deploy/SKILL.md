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

## Step 3 — Push

Run:
```
git push origin master
```

Report whether it succeeded or failed. If it failed, show the error and stop — do not retry without diagnosing the cause.

## Step 4 — Remind user to verify

Tell the user:
- GitHub Pages takes ~1 minute to deploy after a push
- To verify: open **https://LoserChallenge.github.io/marvel-legendary/** in their browser
- Use **Ctrl+Shift+R** (hard refresh) to bypass the browser cache and see the latest version
- If the page looks unchanged after 2 minutes, check the Actions tab on GitHub for deployment errors
