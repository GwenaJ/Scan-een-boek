import { readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { storage } from './storage';
import type { InsertBook } from '@shared/schema';

async function importBooks() {
  try {
    console.log('Reading CSV file...');
    const csvContent = await readFile('attached_assets/Nieuw Book DB_1764080742651.csv', 'utf-8');
    
    console.log('Parsing CSV...');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: false,
      bom: true
    });

    console.log(`Found ${records.length} records in CSV`);

    const booksMap = new Map<string, InsertBook>();
    
    records.forEach((record: any) => {
      // Parse release date from DD/MM/YYYY format
      let releaseDate = null;
      if (record.release_date && record.release_date.trim()) {
        try {
          const [day, month, year] = record.release_date.split('/');
          if (day && month && year) {
            releaseDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        } catch (e) {
          console.warn(`Could not parse date: ${record.release_date}`);
        }
      }

      // ISBN is now directly in the csv column
      const isbn = record.isbn?.trim();
      
      if (!isbn) {
        console.warn(`Missing ISBN for: ${record.title}`);
        return;
      }

      const book: InsertBook = {
        isbn: isbn,
        title: record.title?.trim() || '',
        author: record.author?.trim() || '',
        price: record.price ? parseFloat(record.price).toString() : '0',
        nstc: record.nstc?.trim() || null,
        format: record.format?.trim() || null,
        publisher: record.publisher?.trim() || null,
        releaseDate: releaseDate,
        language: record.Language?.trim() || record.language?.trim() || null,
        storeStock: record.store_stock ? parseInt(record.store_stock) : 0,
        storeLocation: record.store_location?.trim() || null,
        nur: record.nur?.trim() || null,
        themaCodes: record.thema_codes?.trim() || null,
        boekpaginaUrl: record.libris_url?.trim() || null,
        coverUrl: record.cover_url?.trim() || null,
      };
      
      // Deduplicate by ISBN - keep the first occurrence
      if (!booksMap.has(isbn)) {
        booksMap.set(isbn, book);
      }
    });

    const books: InsertBook[] = Array.from(booksMap.values());
    console.log(`After deduplication: ${books.length} unique books`);

    console.log('Importing books to database...');
    
    // First, clear existing books to avoid duplicates
    console.log('Clearing existing books...');
    const { db } = await import('./db');
    const { sql } = await import('drizzle-orm');
    
    await db.execute(sql`TRUNCATE TABLE books`);
    console.log('✓ Existing books cleared');
    
    await storage.createBooks(books);
    
    console.log(`✅ Successfully imported ${books.length} books!`);
    process.exit(0);
  } catch (error) {
    console.error('Error importing books:', error);
    process.exit(1);
  }
}

importBooks();
