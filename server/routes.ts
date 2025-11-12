import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint with database connection test
  app.get("/api/health", async (req, res) => {
    try {
      const testResult = await storage.testConnection();
      res.json({
        status: "ok",
        database: testResult ? "connected" : "disconnected",
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "error",
        database: "error",
        error: error instanceof Error ? error.message : String(error),
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Search books by title and/or author (must come before :isbn route)
  app.get("/api/books/search", async (req, res) => {
    try {
      const { title, author } = req.query;
      
      if (!title && !author) {
        return res.status(400).json({ error: "Please provide title and/or author" });
      }
      
      console.log(`Searching books - title: ${title}, author: ${author}`);
      const books = await storage.searchBooksByTitleAuthor(
        title as string | undefined,
        author as string | undefined
      );
      
      console.log(`Found ${books.length} books`);
      res.json(books);
    } catch (error) {
      console.error("Error searching books:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        error: "Failed to search books",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Book lookup by ISBN (barcode scanning)
  app.get("/api/books/:isbn", async (req, res) => {
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
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        error: "Failed to fetch book",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
