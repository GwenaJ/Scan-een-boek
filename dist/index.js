var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  books: () => books,
  insertBookSchema: () => insertBookSchema,
  insertUserSchema: () => insertUserSchema,
  selectBookSchema: () => selectBookSchema,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var books = pgTable("books", {
  isbn: text("isbn").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  price: numeric("price", { precision: 8, scale: 2 }).notNull(),
  nstc: text("nstc"),
  format: text("format"),
  publisher: text("publisher"),
  releaseDate: date("release_date"),
  language: text("language"),
  storeStock: integer("store_stock").notNull().default(0),
  storeLocation: text("store_location"),
  nur: text("nur"),
  themaCodes: text("thema_codes"),
  boekpaginaUrl: text("boekpagina_url"),
  coverUrl: text("cover_url"),
  recensies: text("recensies")
});
var insertBookSchema = createInsertSchema(books).omit({});
var selectBookSchema = createInsertSchema(books);

// server/db.ts
import { readFileSync, existsSync } from "fs";
var isProduction = process.env.NODE_ENV === "production";
console.log("Environment:", process.env.NODE_ENV || "development");
var databaseUrl;
if (isProduction && existsSync("/tmp/replitdb")) {
  try {
    databaseUrl = readFileSync("/tmp/replitdb", "utf-8").trim();
    console.log("Using database URL from /tmp/replitdb (production)");
  } catch (err) {
    console.error("Error reading /tmp/replitdb:", err);
  }
}
if (!databaseUrl) {
  databaseUrl = process.env.DATABASE_URL;
}
console.log("DATABASE_URL exists:", !!databaseUrl);
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : false
});
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});
var db = drizzle(pool, { schema: schema_exports });
console.log(`Database pool created successfully`);

// server/storage.ts
import { eq, sql as sql2 } from "drizzle-orm";
var DbStorage = class {
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async getBookByIsbn(isbn) {
    const result = await db.select().from(books).where(eq(books.isbn, isbn));
    return result[0];
  }
  async searchBooksByTitleAuthor(title, author) {
    if (!title && !author) {
      return [];
    }
    if (title && author) {
      const result = await db.select().from(books).where(sql2`word_similarity(${title}, lower(title)) >= 0.2 AND word_similarity(${author}, lower(author)) >= 0.2`).orderBy(sql2`word_similarity(${title}, lower(title)) + word_similarity(${author}, lower(author)) DESC`).limit(50);
      return result;
    } else if (title) {
      const result = await db.select().from(books).where(sql2`word_similarity(${title}, lower(title)) >= 0.2`).orderBy(sql2`word_similarity(${title}, lower(title)) DESC`).limit(50);
      return result;
    } else {
      const result = await db.select().from(books).where(sql2`word_similarity(${author}, lower(author)) >= 0.2`).orderBy(sql2`word_similarity(${author}, lower(author)) DESC`).limit(50);
      return result;
    }
  }
  async createBook(insertBook) {
    const result = await db.insert(books).values(insertBook).returning();
    return result[0];
  }
  async createBooks(booksToInsert) {
    if (booksToInsert.length === 0) return;
    const batchSize = 100;
    for (let i = 0; i < booksToInsert.length; i += batchSize) {
      const batch = booksToInsert.slice(i, i + batchSize);
      await db.insert(books).values(batch);
    }
  }
  async testConnection() {
    try {
      await db.execute(sql2`SELECT 1`);
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }
};
var storage = new DbStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/health", async (req, res) => {
    try {
      const testResult = await storage.testConnection();
      res.json({
        status: "ok",
        database: testResult ? "connected" : "disconnected",
        environment: process.env.NODE_ENV || "production",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "error",
        database: "error",
        error: error instanceof Error ? error.message : String(error),
        environment: process.env.NODE_ENV || "production",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.get("/api/books/:isbn", async (req, res) => {
    try {
      const { isbn } = req.params;
      console.log(`Fetching book with ISBN: ${isbn}`);
      const book = await storage.getBookByIsbn(isbn);
      if (!book) {
        console.log(`Book not found: ${isbn}`);
        return res.status(404).json({ error: "Book not found" });
      }
      console.log(`Book found: ${book.title}`);
      res.json(book);
    } catch (error) {
      console.error("Error fetching book by ISBN:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({
        error: "Failed to fetch book",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/seed.ts
import { readFile } from "fs/promises";
import { existsSync as existsSync2 } from "fs";
import { parse } from "csv-parse/sync";
import { sql as sql3 } from "drizzle-orm";
var CSV_PATH = "attached_assets/Nieuw_Book_DB_1764690694107.csv";
var SEED_LOCK_KEY = 538201764;
async function setupTrigram() {
  await pool.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");
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
function parseBooks(csvContent) {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: false,
    bom: true
  });
  const booksMap = /* @__PURE__ */ new Map();
  records.forEach((record) => {
    let releaseDate = null;
    if (record.release_date && record.release_date.trim()) {
      try {
        const cleanDate = record.release_date.trim().replace(/[\r\n]/g, "");
        const [day, month, year] = cleanDate.split("/");
        if (day && month && year && day.length <= 2 && month.length <= 2 && year.length === 4) {
          const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          const testDate = new Date(formattedDate);
          if (!isNaN(testDate.getTime())) {
            releaseDate = formattedDate;
          }
        }
      } catch (e) {
      }
    }
    const isbn = record.isbn?.trim();
    if (!isbn) return;
    const book = {
      isbn,
      title: record.title?.trim() || "",
      author: record.author?.trim() || "",
      price: record.price ? parseFloat(record.price).toString() : "0",
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
      recensies: record.Recensies?.trim() || null
    };
    if (!booksMap.has(isbn)) {
      booksMap.set(isbn, book);
    }
  });
  return Array.from(booksMap.values());
}
async function insertBooksIfMissing(booksToInsert) {
  const batchSize = 100;
  for (let i = 0; i < booksToInsert.length; i += batchSize) {
    const batch = booksToInsert.slice(i, i + batchSize);
    await db.insert(books).values(batch).onConflictDoNothing();
  }
}
async function seedWithinLock() {
  try {
    await setupTrigram();
  } catch (err) {
    console.error("WARNING: failed to set up pg_trgm extension/indexes. Title/author search may not work:", err);
  }
  if (!existsSync2(CSV_PATH)) {
    console.warn(`Seed CSV not found at ${CSV_PATH}, skipping book import.`);
    return;
  }
  const csvContent = await readFile(CSV_PATH, "utf-8");
  const parsedBooks = parseBooks(csvContent);
  const expected = parsedBooks.length;
  const result = await db.select({ count: sql3`count(*)::int` }).from(books);
  const existingCount = result[0]?.count ?? 0;
  if (existingCount >= expected) {
    console.log(`Catalog complete (${existingCount}/${expected} books), skipping seed.`);
    return;
  }
  console.log(`Catalog incomplete (${existingCount}/${expected} books), importing...`);
  await insertBooksIfMissing(parsedBooks);
  const after = await db.select({ count: sql3`count(*)::int` }).from(books);
  console.log(`\u2705 Catalog now has ${after[0]?.count ?? 0}/${expected} books.`);
}
async function ensureDatabaseSeeded() {
  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error("Failed to acquire DB connection for seeding:", err);
    return;
  }
  try {
    await client.query("SELECT pg_advisory_lock($1)", [SEED_LOCK_KEY]);
    await seedWithinLock();
  } catch (err) {
    console.error("Database seeding failed:", err);
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [SEED_LOCK_KEY]);
    } catch (err) {
      console.error("Failed to release seed advisory lock:", err);
    }
    client.release();
  }
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await ensureDatabaseSeeded();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
