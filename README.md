# Wonder Woman — Just for you

A lilac mobile-friendly quiz for Aida, ending in a playful coffee-date invoice.

- Six questions, three attempts per question, with balloon-pop animation and optional generated sound.
- Both `aida` and `miss s.s` unlock the game (case-insensitive). Passwords are checked server-side; signed, HttpOnly cookies grant a 24-hour game session.
- The decline button runs away five times with mouse proximity, touch, or keyboard input, then disappears.
- Completed responses are saved in D1 before invoice acceptance; acceptance updates the same record idempotently.
- `/admin` lists the latest 100 completed games, all answers and attempts, and acceptance status, with JSON export.

## Configuration

Production secrets are configured through Sites, never committed: `GAME_PASSWORDS` (JSON array of lowercase passwords), `SESSION_SECRET`, `ADMIN_KEY`. The dashboard key is distinct from the game passwords. `.env.local` is ignored and contains local-test values only.

## Development

Use Node 22.13+ and the installed npm. `npm run dev` serves the development app. `npm run build` creates the production artifact. On Windows, when npm's system shim fails, call its JavaScript CLI directly or use the checkout-local shim under `.sites-runtime/bin`.

Generate schema migrations with `npm run db:generate`. Apply the generated SQL to the local D1 database only using the documented Sites starter workflow. Production migrations are applied by Sites publication.

`node scripts/check-game.mjs` checks answer aliases, password behavior, and unauthorized access against the running local preview at port 5173. `node node_modules/typescript/bin/tsc --noEmit` checks types. Test records remain in the local database; production starts empty.
