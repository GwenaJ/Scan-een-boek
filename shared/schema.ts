import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const books = pgTable("books", {
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
  recensies: text("recensies"),
});

export const insertBookSchema = createInsertSchema(books).omit({});
export const selectBookSchema = createInsertSchema(books);

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;
