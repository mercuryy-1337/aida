# Wonder Woman — Just for you

A mobile-friendly lilac quiz for Aida, with balloon animations, a soft bubble pop, and a coffee-date invoice. This checkout is prepared for **Netlify** using standard Next.js and Netlify Blobs.

## Deploy to Netlify

1. Push this project to your GitHub, GitLab, or Bitbucket repository.
2. In Netlify, choose **Add new project → Import an existing project** and select that repository.
3. Keep the settings from `netlify.toml`: build command **npm run build**, publish directory **.next**, Node **22**.
4. Add these environment variables in Netlify for the production Functions runtime (or all scopes). Keep these out of source control:

| Variable | Value |
| --- | --- |
| `GAME_PASSWORDS` | `["aida","miss s.s"]` |
| `SESSION_SECRET` | A long random secret used to sign session cookies |
| `ADMIN_KEY` | Your separate private dashboard key |

Generate a strong secret by running `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. Run it separately for each secret, or use the previously provided dashboard key for `ADMIN_KEY` if you want to retain it.

5. Deploy. Netlify detects Next.js and configures its server-side adapter automatically. Netlify Blobs needs no manually provisioned database; the response store is created when the first game is saved.
6. Share the site URL. Both game passwords are case-insensitive. Visit **/admin** and enter `ADMIN_KEY` to see answers, attempts, invoice acceptance, and JSON export.

Use the repository/build deployment flow: dragging the old `dist` folder onto Netlify will not deploy the backend.

The existing Sites-hosted deployment remains separate. Its stored responses and environment variables are not copied into Netlify. A new Netlify site starts with an empty response store.

## Local development

Requires Node 22.13 or newer.

```sh
npm ci
# Copy .env.example to .env.local and set your local test secrets.
npm run dev
```

The app runs at **http://127.0.0.1:5173**. The dev launcher starts Netlify's official local Blobs emulator and stores test data in ignored `.netlify/local-blobs/`. Local records never go to the live site.

```sh
npm run build
node scripts/dev.mjs --production
# In another terminal:
npm test
```

`npm test` tests passwords, protected response access, and answer aliases. The integration test additionally exercises persistence, invoice acceptance, and out-of-order retries using a test-only dashboard key.

The `GAME_PASSWORDS`, `SESSION_SECRET`, and `ADMIN_KEY` values in ignored local files are development-only; Netlify must receive its own values through the environment settings.

## Storage behavior

Completed games and invoice acceptances use separate immutable keys in a site-wide Blobs store. Acceptance cannot be undone by a late completion request. Strong consistency makes new results available immediately to the dashboard. The dashboard returns the latest 100 completed games.

The previous Cloudflare/Sites build scaffolding is retained for history, but the active `dev`, `build`, and `start` scripts and API routes now target Netlify/Next.js.

References: [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) · [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/).

For phone testing, the dev server binds to **0.0.0.0:5173**. Open **http://YOUR-COMPUTER-LAN-IP:5173** on a phone connected to the same network.
