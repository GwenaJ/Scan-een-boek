import { pool } from './db';

async function setupTrigram() {
  try {
    console.log('Setting up PostgreSQL trigram extension...');
    
    // Enable pg_trgm extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    console.log('✓ pg_trgm extension enabled');

    // Create GIN index on lower(title) for trigram search
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_books_title_trgm 
      ON books USING gin (lower(title) gin_trgm_ops)
    `);
    console.log('✓ Created trigram index on title');

    // Create GIN index on lower(author) for trigram search
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_books_author_trgm 
      ON books USING gin (lower(author) gin_trgm_ops)
    `);
    console.log('✓ Created trigram index on author');

    // Create multicolumn index for combined title+author lookups (optional but recommended)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_books_title_author 
      ON books (lower(title), lower(author))
    `);
    console.log('✓ Created combined title+author index');

    // Create index on store_location for filtering by shelf
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_books_store_location 
      ON books (store_location)
    `);
    console.log('✓ Created store_location index');

    console.log('\n✅ All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up trigram:', error);
    process.exit(1);
  }
}

setupTrigram();
