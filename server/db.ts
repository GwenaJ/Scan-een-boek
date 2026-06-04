import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { readFileSync, existsSync } from "fs";

// In the production deployment, Replit injects its own DATABASE_URL that points
// at an internal host ("helium") which is unreachable from the autoscale runtime.
// PROD_DATABASE_URL is a production-scoped override holding the Neon connection
// string for the same database used in development, so the live app connects
// to the catalog data. In development this is unset and we fall back to
// DATABASE_URL (the dev Neon database).
let databaseUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;

console.log('Environment:', process.env.NODE_ENV || 'production');
console.log('Using PROD_DATABASE_URL override:', !!process.env.PROD_DATABASE_URL);
console.log('DATABASE_URL exists:', !!databaseUrl);

if (!databaseUrl && existsSync('/tmp/replitdb')) {
  try {
    databaseUrl = readFileSync('/tmp/replitdb', 'utf-8').trim();
    console.log('Using database URL from /tmp/replitdb');
  } catch (err) {
    console.error('Error reading /tmp/replitdb:', err);
  }
}

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use standard node-postgres connection for both dev and production
// This provides better compatibility with Replit deployments
export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

// Test the connection and log any errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export const db = drizzle(pool, { schema });

console.log(`Database pool created successfully`);
