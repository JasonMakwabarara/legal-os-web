# Legal OS — Word Add-in

AI contract review inside Microsoft Word: sign in with your Legal OS account,
analyze the open document, see risks with estimated exposure, and apply
AI-proposed redlines — as **tracked changes with comments** on hosts that
support WordApi 1.4 (Word ≥ 2208 / Mac ≥ 16.64 / Word on the web), or as
highlighted replacements on older hosts (2016–2021 LTSC).

## How it's served

The pane is a small React app built by `addin/vite.config.ts` into
`dist/public/addin/`. The production Express server serves it at
`https://<your-app>/addin/taskpane.html` — **same origin as the API**, so no
extra hosting and no CORS.

Auth uses a Bearer token (`auth.tokenLogin`) instead of cookies, because Word
on the web hosts panes in an iframe where our cookie is third-party. The token
is stored in `localStorage`, prefixed with `Office.context.partitionKey` where
defined. On Safari-based webviews, partitioned storage may occasionally forget
the token — you'll just be asked to sign in again.

## Production sideload

1. Deploy to Railway (see ../DEPLOYMENT.md) and note your domain.
2. In `addin/manifest.xml`, replace every `https://REPLACE-WITH-YOUR-APP-URL`
   with that domain (no trailing slash).
3. Validate: `pnpm addin:validate`
4. Sideload:
   - **Word on the web** — open a document → **Home → Add-ins → More Add-ins →
     My Add-ins → Upload My Add-in** → pick `manifest.xml`.
   - **Windows desktop** — `pnpm dlx office-addin-dev-settings sideload addin/manifest.xml word`
     (registers the manifest and offers to launch Word), or use a
     [shared-folder catalog](https://learn.microsoft.com/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins).
   - **Mac desktop** — copy `manifest.xml` to
     `~/Library/Containers/com.microsoft.Word/Data/Documents/wef/` and restart Word.
5. In Word: **Home tab → Legal OS → Contract Review**.

## Local development

```bash
# one-time: trusted https certs for localhost (expire after ~30 days)
pnpm addin:certs

# terminal 1 — the API + web app
pnpm dev            # http://localhost:3000

# terminal 2 — the pane with HMR
pnpm dev:addin      # https://localhost:3100/addin/taskpane.html (proxies /api → :3000)

# sideload the dev manifest into desktop Word (Windows)
pnpm addin:sideload
```

The dev manifest (`manifest.dev.xml`) has its own GUID, so the dev and
production add-ins can be installed side by side.

## When things look stale

Word caches add-in resources aggressively. After changing the manifest:

- **Windows**: close Word, delete everything under
  `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`, reopen.
- **Web**: remove the add-in (My Add-ins → … → Remove), hard-refresh, re-upload.

## Known limitations

- **Clause location is text-anchored.** Redlines anchor to a paragraph index
  plus the exact original wording; heavy edits between Analyze and Apply can
  break the match. The pane then offers "Copy text" so you can paste manually.
  Word's search API also caps needles at 255 characters — the model is
  instructed to quote spans under 200 characters.
- **Tracked changes need WordApi 1.4.** Older perpetual-license Word
  (2016/2019/2021 LTSC) gets plain replacement + amber highlight; the pane
  says so up front.
- **Dev certificates expire** roughly every 30 days — rerun `pnpm addin:certs`.
- Sideload-only for now (no AppSource submission this round).
