---
name: Production DB connection & catalog seeding
description: How this app reaches the right DB in production and self-seeds the book catalog
---

# Production database URL

**Rule (authoritative — confirmed by the user):** The LIVE/production app must connect to the **same Neon database used in development** (host `ep-calm-darkness-...neon.tech/neondb`, the one that actually holds the ~1272 books). `server/db.ts` resolves the URL as: `process.env.PROD_DATABASE_URL || process.env.DATABASE_URL`, then falls back to `/tmp/replitdb` only if both are unset.

**Why:**
- In the deployed app, Replit injects its own `DATABASE_URL` pointing at the internal host **`helium`**, which is unreachable from the autoscale runtime (`getaddrinfo EAI_AGAIN helium`). So relying on `DATABASE_URL` in production fails completely.
- There is also a *separate, empty* production Neon DB referenced by `/tmp/replitdb`. Connecting there "works" but shows no books — which looks like data loss. Do NOT default to it.
- The fix the user wants is one shared database for dev + live, so `PROD_DATABASE_URL` is a **production-scoped env var** holding the dev Neon connection string, and `db.ts` prefers it.

**How to apply:**
- The dev Neon URL lives in the global `DATABASE_URL` secret (visible only in dev). To mirror it into production without exposing it: write `$DATABASE_URL` to a temp file in bash, read that file in the code-execution sandbox, `setEnvVars({values:{PROD_DATABASE_URL: url}, environment:"production"})`, then delete the temp file. The sandbox does NOT expose `process.env` — read the value via bash/fs, never print it.
- Changes to `db.ts` / env vars only take effect in production after **re-publishing**.
- If prod shows "Fout bij ophalen" / empty data again, check the prod logs for which host it resolved and whether `Using PROD_DATABASE_URL override: true` is printed.

**Tradeoff the user accepted:** dev and live share ONE database, so edits in dev affect the live app, and the dev-tier DB now backs production.

# Catalog seeding on boot

**Rule:** The book catalog is seeded at startup via `ensureDatabaseSeeded()` (`server/seed.ts`), run as fire-and-forget AFTER `server.listen()` in `server/index.ts`. The build only builds; it does NOT run `db:push` or seed.

**Why:** Originally added for a fresh/empty prod DB. Against the shared dev Neon DB it is a **no-op** (count 1272/1272 → "Catalog complete, skipping seed"). Harmless, but only relevant if a fresh empty DB is ever used.

**Invariants to preserve when editing seeding:**
- **Never block `server.listen()` on seeding.** Open the port FIRST, then run `ensureDatabaseSeeded()` inside the listen callback as fire-and-forget (`.catch(...)`). Blocking startup on a long import exceeds the autoscale health-check window → deploy fails with "built successfully but failed to start." (This exact mistake happened once.)
- Wrap seeding in a Postgres **advisory lock** (`pg_advisory_lock`, fixed key) on a dedicated `pool.connect()` client — autoscale boots multiple instances concurrently and they will race otherwise.
- Inserts must be conflict-safe: `db.insert(books).values(batch).onConflictDoNothing()`.
- Gate on **completeness**, not mere non-emptiness: compare DB count vs CSV count and re-import when `count < expected` so a partial import self-heals. Do NOT use `count > 0 → skip`.
- The CSV (`attached_assets/Nieuw_Book_DB_*.csv`) is git-tracked so it ships with the deploy; `~1272` unique books after dedup by ISBN.
- `server/import-books.ts` and `server/setup-trigram.ts` call `process.exit` and TRUNCATE — manual tools, not the boot path. Keep boot seeding non-destructive.
- `pg_trgm` extension (needed for `word_similarity` search in `server/storage.ts`) already exists in the dev Neon DB.
