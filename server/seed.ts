import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { sql } from 'drizzle-orm';
import { db, pool } from './db';
import { books } from '@shared/schema';
import type { InsertBook } from '@shared/schema';

const CSV_PATH = 'attached_assets/Nieuw_Book_DB_1764690694107.csv';

// Fixed key for the Postgres advisory lock that serializes seeding across
// concurrently-booting instances (e.g. autoscale cold starts).
const SEED_LOCK_KEY = 538201764;

async function setupTrigram() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_title_trgm
    ON books USING gin (lower(title) gin_trgm_ops)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_author_trgm
    ON books USING gin (lower(author) gin_trgm_ops)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_title_author
    ON books (lower(title), lower(author))
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_store_location
    ON books (store_location)
  `);
}

function parseBooks(csvContent: string): InsertBook[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: false,
    bom: true,
  });

  const booksMap = new Map<string, InsertBook>();

  records.forEach((record: any) => {
    let releaseDate: string | null = null;
    if (record.release_date && record.release_date.trim()) {
      try {
        const cleanDate = record.release_date.trim().replace(/[\r\n]/g, '');
        const [day, month, year] = cleanDate.split('/');
        if (day && month && year && day.length <= 2 && month.length <= 2 && year.length === 4) {
          const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          const testDate = new Date(formattedDate);
          if (!isNaN(testDate.getTime())) {
            releaseDate = formattedDate;
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    }

    const isbn = record.isbn?.trim();
    if (!isbn) return;

    const book: InsertBook = {
      isbn,
      title: record.title?.trim() || '',
      author: record.author?.trim() || '',
      price: record.price ? parseFloat(record.price).toString() : '0',
      nstc: record.nstc?.trim() || null,
      format: record.format?.trim() || null,
      publisher: record.publisher?.trim() || null,
      releaseDate,
      language: record.Language?.trim() || record.language?.trim() || null,
      storeStock: record.store_stock ? parseInt(record.store_stock) : 0,
      storeLocation: record.store_location?.trim() || null,
      nur: record.nur?.trim() || null,
      themaCodes: record.thema_codes?.trim() || null,
      boekpaginaUrl: record.libris_url?.trim() || null,
      coverUrl: record.cover_url?.trim() || null,
      recensies: record.Recensies?.trim() || null,
    };

    if (!booksMap.has(isbn)) {
      booksMap.set(isbn, book);
    }
  });

  return Array.from(booksMap.values());
}

// Conflict-safe insert: ON CONFLICT (isbn) DO NOTHING so concurrent seeders
// and re-runs over partially-imported data never abort on duplicate keys.
async function insertBooksIfMissing(booksToInsert: InsertBook[]): Promise<void> {
  const batchSize = 100;
  for (let i = 0; i < booksToInsert.length; i += batchSize) {
    const batch = booksToInsert.slice(i, i + batchSize);
    await db.insert(books).values(batch).onConflictDoNothing();
  }
}

async function seedWithinLock(): Promise<void> {
  // Set up search prerequisites (idempotent). If this fails in production we
  // log loudly but still continue so the core barcode-lookup feature works.
  try {
    await setupTrigram();
  } catch (err) {
    console.error('WARNING: failed to set up pg_trgm extension/indexes. Title/author search may not work:', err);
  }

  if (!existsSync(CSV_PATH)) {
    console.warn(`Seed CSV not found at ${CSV_PATH}, skipping book import.`);
    return;
  }

  const csvContent = await readFile(CSV_PATH, 'utf-8');
  const parsedBooks = parseBooks(csvContent);
  const expected = parsedBooks.length;

  const result = await db.select({ count: sql<number>`count(*)::int` }).from(books);
  const existingCount = result[0]?.count ?? 0;

  // Re-import whenever the catalog is incomplete (empty OR a previous run only
  // partially imported). ON CONFLICT DO NOTHING fills the gaps idempotently.
  if (existingCount >= expected) {
    console.log(`Catalog complete (${existingCount}/${expected} books), skipping seed.`);
    return;
  }

  console.log(`Catalog incomplete (${existingCount}/${expected} books), importing...`);
  await insertBooksIfMissing(parsedBooks);

  const after = await db.select({ count: sql<number>`count(*)::int` }).from(books);
  console.log(`✅ Catalog now has ${after[0]?.count ?? 0}/${expected} books.`);
}

/**
 * Ensures the database is correctly set up on startup:
 * 1. Enables the pg_trgm extension and creates search indexes.
 * 2. Imports the book catalog from CSV if it is missing or incomplete.
 *
 * Idempotent and safe to run on every boot. A Postgres advisory lock
 * serializes the work so concurrent instances (autoscale cold starts) cannot
 * race; an incomplete catalog is self-healed on the next boot.
 */
export async function ensureDatabaseSeeded(): Promise<void> {
  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error('Failed to acquire DB connection for seeding:', err);
    return;
  }

  try {
    // Session-level advisory lock held on this dedicated connection. Other
    // instances block here until the holder finishes, then re-check and skip.
    await client.query('SELECT pg_advisory_lock($1)', [SEED_LOCK_KEY]);
    await seedWithinLock();
  } catch (err) {
    console.error('Database seeding failed:', err);
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [SEED_LOCK_KEY]);
    } catch (err) {
      console.error('Failed to release seed advisory lock:', err);
    }
    client.release();
  }
}
