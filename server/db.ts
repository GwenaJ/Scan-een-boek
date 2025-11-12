import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { readFileSync, existsSync } from "fs";

// Get database URL from environment or /tmp/replitdb (for Replit deployments)
let databaseUrl = process.env.DATABASE_URL;

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

export const db = drizzle(pool, { schema });

console.log(`Database connected (${process.env.NODE_ENV || 'production'})`);
