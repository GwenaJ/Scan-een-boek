import { type User, type InsertUser, type Book, type InsertBook } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { books, users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book operations
  getBookByIsbn(isbn: string): Promise<Book | undefined>;
  searchBooksByTitleAuthor(title?: string, author?: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  createBooks(books: InsertBook[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private books: Map<string, Book>;

  constructor() {
    this.users = new Map();
    this.books = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBookByIsbn(isbn: string): Promise<Book | undefined> {
    return this.books.get(isbn);
  }

  async searchBooksByTitleAuthor(title?: string, author?: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter((book) => {
      if (title && !book.title.toLowerCase().includes(title.toLowerCase())) {
        return false;
      }
      if (author && !book.author.toLowerCase().includes(author.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const book: Book = insertBook as Book;
    this.books.set(book.isbn, book);
    return book;
  }

  async createBooks(books: InsertBook[]): Promise<void> {
    for (const book of books) {
      await this.createBook(book);
    }
  }
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getBookByIsbn(isbn: string): Promise<Book | undefined> {
    const result = await db.select().from(books).where(eq(books.isbn, isbn));
    return result[0];
  }

  async searchBooksByTitleAuthor(title?: string, author?: string): Promise<Book[]> {
    if (!title && !author) {
      return [];
    }

    // Use PostgreSQL trigram similarity search with word_similarity
    let query = db.select().from(books);
    
    if (title && author) {
      // Search by both title and author
      query = query
        .where(sql`word_similarity(${title}, lower(title)) >= 0.2 AND word_similarity(${author}, lower(author)) >= 0.2`)
        .orderBy(sql`word_similarity(${title}, lower(title)) + word_similarity(${author}, lower(author)) DESC`);
    } else if (title) {
      // Search by title only
      query = query
        .where(sql`word_similarity(${title}, lower(title)) >= 0.2`)
        .orderBy(sql`word_similarity(${title}, lower(title)) DESC`);
    } else {
      // Search by author only
      query = query
        .where(sql`word_similarity(${author}, lower(author)) >= 0.2`)
        .orderBy(sql`word_similarity(${author}, lower(author)) DESC`);
    }

    const result = await query.limit(50);
    return result;
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const result = await db.insert(books).values(insertBook).returning();
    return result[0];
  }

  async createBooks(booksToInsert: InsertBook[]): Promise<void> {
    if (booksToInsert.length === 0) return;
    
    // Insert in batches of 100 to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < booksToInsert.length; i += batchSize) {
      const batch = booksToInsert.slice(i, i + batchSize);
      await db.insert(books).values(batch);
    }
  }
}

export const storage = new DbStorage();
