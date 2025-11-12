import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Search books by title and/or author (must come before :isbn route)
  app.get("/api/books/search", async (req, res) => {
    try {
      const { title, author } = req.query;
      
      if (!title && !author) {
        return res.status(400).json({ error: "Please provide title and/or author" });
      }
      
      const books = await storage.searchBooksByTitleAuthor(
        title as string | undefined,
        author as string | undefined
      );
      
      res.json(books);
    } catch (error) {
      console.error("Error searching books:", error);
      res.status(500).json({ error: "Failed to search books" });
    }
  });

  // Book lookup by ISBN (barcode scanning)
  app.get("/api/books/:isbn", async (req, res) => {
    try {
      const { isbn } = req.params;
      const book = await storage.getBookByIsbn(isbn);
      
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      console.error("Error fetching book by ISBN:", error);
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
