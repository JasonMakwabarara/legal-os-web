# Deploying Legal OS

Two deployment targets, one repo:

| Target | What it serves | Build command |
|---|---|---|
| **Netlify** | Marketing landing + in-browser demo (no server, no DB) | `pnpm build:web` (`VITE_DEMO_MODE=true`, already in `netlify.toml`) |
| **Railway** | The live product — Express API + built client + Word add-in pane, single origin | `pnpm build` |

Single-origin means cookie auth just works and there is no CORS configuration.

## 1. Railway — the live app

### Prerequisites

- A Railway account (https://railway.app)
- An Anthropic API key (https://console.anthropic.com → API keys)

### Steps

1. **Create the project.** Railway dashboard → *New Project* → *Deploy from GitHub repo* and pick this repository. If `legal-os-web/` is nested inside your repo, set the service's **Root Directory** to `legal-os-web`. `railway.json` supplies the build (`pnpm install --frozen-lockfile && pnpm build`), the start command (`pnpm start`), the pre-deploy migration (`pnpm db:push`), and the `/` healthcheck.

2. **Add MySQL.** In the project: *Create → Database → MySQL*.

3. **Set service variables** on the app service (*Variables* tab):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `${{ MySQL.MYSQL_URL }}` (reference to the MySQL service) |
   | `JWT_SECRET` | A long random string — generate with `openssl rand -hex 32` (or PowerShell: `-join ((1..64) \| %{ '{0:x}' -f (Get-Random -Max 16) })`) |
   | `ANTHROPIC_API_KEY` | Your key from console.anthropic.com |
   | `LLM_MODEL` | `claude-sonnet-5` (optional — this is the default; use `claude-opus-5` for an Enterprise tenant) |
   | `NODE_ENV` | `production` |

   Optional:

   | Variable | Purpose |
   |---|---|
   | `LLM_PROVIDER=openai_compatible` + `LLM_BASE_URL` + `LLM_API_KEY` + `LLM_MODEL` | Route inference through any OpenAI-compatible endpoint (e.g. BytePlus ModelArk / DeepSeek) instead of Anthropic |
   | `DATABASE_SSL=false` | Only if your MySQL server has TLS disabled |

4. **Deploy.** First deploy runs `pnpm db:push` (creates/updates all tables) before starting the server. Generate a public domain under *Settings → Networking*.

5. **Create the first account.** Open `https://<your-app>.up.railway.app/login`, switch to **Create account**, register, then complete **Firm setup**. Registrants are admins of their own firm; teammates join via firm invitations.

   *Optional CLI seeding instead* (test fixtures + a superadmin):

   ```bash
   railway run --service <app-service> env LOCAL_ADMIN_PASSWORD='<long-random>' pnpm seed:accounts
   ```

6. **Verify the live loop.** Upload a `.docx`/`.pdf`/`.txt` agreement from the dashboard → the AI review fills risks, exposure, and the `[REDLINE]` text on the contract page (reviewProgress hits 100) → ask the assistant about the contract and confirm the answer cites it.

### Inference cost expectations

A typical contract review (~15K tokens in / ~4K out on `claude-sonnet-5`) costs roughly **$0.07–0.13** ($2/$10 per MTok intro pricing through 2026-08-31, then $3/$15). A maxed-out Starter firm (50 reviews/month) is ~$4–7/month of inference against $99 revenue.

## 2. Netlify — marketing + demo

Unchanged: connect the repo, `netlify.toml` builds the demo (`pnpm build:web`). After Railway is live, add one build environment variable so the landing CTAs (“Sign In” / “Get Started”) land on the real product:

```
VITE_APP_URL=https://<your-app>.up.railway.app
```

Without it the buttons fall back to the local `/login` demo flow.

## 3. Word add-in

The production build serves the task pane at `https://<railway-domain>/addin/taskpane.html` (same origin as the API — no extra hosting). To sideload:

1. Edit `addin/manifest.xml` and replace every `https://REPLACE-WITH-YOUR-APP-URL` with your Railway domain.
2. Validate: `pnpm addin:validate`
3. Follow `addin/README.md` for sideloading (Windows/Mac/Word on the web) and the localhost dev loop.
