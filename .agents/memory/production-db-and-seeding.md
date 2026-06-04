---
name: Production DB connection & catalog seeding
description: How this app reaches the right DB in production and self-seeds the book catalog
---

# Production database URL

**Rule:** In production (`NODE_ENV==='production'`), read the DB URL from `/tmp/replitdb` FIRST, fall back to `DATABASE_URL` only if that's absent. See `server/db.ts`.

**Why:** The global `DATABASE_URL` secret points at the internal dev-only Neon host `helium`, which is unreachable from the deployed app (`getaddrinfo EAI_AGAIN helium`). Replit writes the real production Neon URL to `/tmp/replitdb`. The Replit publish flow migrates *schema* to prod automatically but never copies *data*.

**How to apply:** Any time prod can't connect to the DB or behaves like it's hitting an empty/dev DB, check which URL `server/db.ts` resolved (it logs "Using database URL from /tmp/replitdb (production)").

# Catalog seeding on boot

**Rule:** The book catalog is seeded at server startup via `ensureDatabaseSeeded()` (`server/seed.ts`), wired into the startup IIFE in `server/index.ts` before `registerRoutes`. The build only builds; it does NOT run `db:push` or seed.

**Why:** A freshly provisioned prod DB has tables (via publish flow) but zero books and no `pg_trgm` extension (needed for `word_similarity` title/author search in `server/storage.ts`). Without boot seeding, prod search/lookups return nothing.

**How to apply / invariants to preserve when editing seeding:**
- **Never block `server.listen()` on seeding.** Open the port FIRST, then run `ensureDatabaseSeeded()` inside the listen callback as fire-and-forget (`.catch(...)`). Importing the full catalog into a fresh prod DB takes many seconds; doing it before listening exceeds the autoscale deploy health-check window → deploy fails with "built successfully but failed to start." (This exact mistake happened once.)
- Wrap seeding in a Postgres **advisory lock** (`pg_advisory_lock`, fixed key) on a dedicated `pool.connect()` client — autoscale boots multiple instances concurrently and they will race otherwise.
- Inserts must be conflict-safe: `db.insert(books).values(batch).onConflictDoNothing()`.
- Gate on **completeness**, not mere non-emptiness: compare DB count vs CSV count and re-import when `count < expected` so a partial import self-heals on next boot. Do NOT use `count > 0 → skip` (a partial import would be frozen forever).
- The CSV (`attached_assets/Nieuw_Book_DB_*.csv`) is git-tracked so it ships with the deploy; `~1272` unique books after dedup by ISBN.
- Standalone scripts `server/import-books.ts` and `server/setup-trigram.ts` call `process.exit` and TRUNCATE — they are manual tools, not the boot path. Keep boot seeding non-destructive.
