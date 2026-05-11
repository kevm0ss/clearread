# Deployment Workflow

## The Two-System Rule

There are two completely separate deployment systems. They do not interact. Forgetting this is the most common source of "why hasn't my change appeared?" confusion.

| System | What it deploys | How it triggers | How long it takes |
|---|---|---|---|
| Cloudflare Pages | All HTML/CSS/JS files | Automatic — git push to main | ~30–60 seconds |
| Cloudflare Worker | worker.js only | Manual — paste into Cloudflare dashboard | ~5 seconds after clicking Deploy |

---

## Deploying Frontend Changes (HTML/CSS/JS)

1. Edit files locally (VS Code)
2. Commit changes:
   ```bash
   git add index.html read.html scan.html prompt.html  # list specific files
   git commit -m "Description of change"
   git push origin main
   ```
3. Cloudflare Pages auto-deploys within ~60 seconds
4. Hard refresh in browser to clear cache: **Cmd+Shift+R** (Mac) / **Ctrl+Shift+F5** (Windows)

---

## Deploying Worker Changes (worker.js)

1. Edit `worker.js` locally
2. Open [dash.cloudflare.com](https://dash.cloudflare.com)
3. Workers & Pages → **readclear-worker**
4. Click **Edit Code**
5. Select all existing code in the editor, paste the full new `worker.js`
6. Click **Deploy**
7. Verify the Worker is live:
   ```bash
   curl https://readclear-worker.kev-958.workers.dev/health
   # Should return: {"status":"ok"}
   ```

**Also commit worker.js to GitHub** (for version history) — but the GitHub push does NOT deploy it:
```bash
git add worker.js
git commit -m "Update Worker: description of change"
git push origin main
```

---

## Branch Workflow

### Feature branches
Work on a branch, test against the v2 Worker if needed, then merge to main.

**Before merging to main — always check Worker URLs in HTML files:**
```bash
grep -r "readclear-worker-v2" *.html
# Should return nothing. If it returns results, fix them:
sed -i '' 's/readclear-worker-v2\.kev-958\.workers\.dev/readclear-worker.kev-958.workers.dev/g' index.html read.html scan.html prompt.html
```

### Testing environments
- `readclear-worker` — production Worker (matches main branch HTML files)
- `readclear-worker-v2` — staging Worker (used during reformat-v2 branch development)

When testing on a feature branch with the v2 Worker, make sure the v2 Worker has the latest worker.js pasted. Stale v2 Worker code caused behaviour differences between branches in the past.

---

## Troubleshooting Deployments

### Change isn't appearing on the live site (Pages issue)
1. Check Cloudflare Pages dashboard → Deployments — did the latest commit trigger a deployment?
2. If not: click "Retry deployment" on the latest commit
3. If that fails: Settings → Git Integration → disconnect and reconnect GitHub
4. Last resort: force a re-deploy with an empty commit:
   ```bash
   git commit --allow-empty -m "Trigger Cloudflare Pages redeploy"
   git push origin main
   ```

### Worker change isn't working (Worker issue)
1. Verify the Worker was redeployed: `curl .../health`
2. If `/health` returns old behaviour: the paste-and-deploy step was missed
3. Check the Cloudflare Workers dashboard for deployment errors

### "Not found" when visiting the Worker URL in a browser
This is **correct behaviour** — the Worker is an API, not a web page. It only responds to:
- `GET /health`
- `POST /reformat`
- `POST /reformat-image`

A `GET /` returns "Not found" by design.

### Behaviour differences between branches
If a feature branch produces different output quality than main, check:
- Is the branch HTML file pointing to `readclear-worker-v2`?
- Is `readclear-worker-v2` running the current `worker.js`?
- Was the v2 Worker pasted with the latest code?

---

## Checklist for a Complete Deployment

- [ ] All HTML changes committed and pushed to main
- [ ] Cloudflare Pages deployment triggered and completed
- [ ] Hard refresh in browser
- [ ] If worker.js changed: pasted and deployed in Cloudflare dashboard
- [ ] Worker verified: `curl .../health` returns `{"status":"ok"}`
- [ ] Tested in browser: profile selection, reformatting, and reading aids work
- [ ] worker.js also committed to GitHub for version history
