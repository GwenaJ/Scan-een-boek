# Scan-een-Boek - Dutch Bookstore Kiosk Application

## Project Overview
Mobile-first web application for instant book price lookup via barcode scanning (USB scanner + camera fallback) with fuzzy search capabilities. Built for a Dutch bookstore kiosk.

## Tech Stack
- **Frontend**: React + TypeScript + Wouter + TanStack Query
- **Backend**: Express + Node.js
- **Database**: PostgreSQL (Neon) with pg_trgm extension for fuzzy search
- **ORM**: Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui components

## Recent Changes (November 12, 2025)

### Data Import Fix
- Fixed ISBN parsing to extract full 13-digit ISBNs from URLs (boekpagina_url and cover_url)
- CSV stores ISBNs in scientific notation (e.g., "9.78014E+12") which loses precision
- Solution: Extract ISBNs from URL fields instead of parsing scientific notation
- Re-imported all 1005 books with correct ISBNs

### API Backend
- **Route Ordering**: Fixed Express route matching by placing `/api/books/search` before `/api/books/:isbn`
- **SQL Fix**: Corrected trigram search to use plain column names instead of Drizzle column references
- **Endpoints**:
  - GET `/api/books/:isbn` - Barcode lookup (returns single Book object)
  - GET `/api/books/search?title=X&author=Y` - Fuzzy search (returns Book[] array)

### Frontend Integration
- Integrated SearchResultsPage with real API endpoints using TanStack Query
- Added proper TypeScript types using shared Book type from `@shared/schema`
- Implemented auto-return to idle (7-second timer, resets on interaction)
- Fixed queryKey structure to work with default fetcher: `queryKey: ['/full/url/path']`
- Changed timer from state to ref to prevent duplicate timers on re-render

### Database Schema
```typescript
books table:
- isbn: text (primary key)
- title: text
- author: text
- price: numeric(8,2)
- nstc: text (nullable)
- format: text (nullable)
- publisher: text (nullable)
- releaseDate: date (nullable)
- language: text (nullable)
- storeStock: integer (default 0)
- storeLocation: text (nullable)
- boekpaginaUrl: text (nullable)
- coverUrl: text (nullable)
```

### PostgreSQL Trigram Search
- Extension: pg_trgm v1.6
- Indexes: GIN indexes on lower(title) and lower(author)
- Search function: `word_similarity()` with 0.2 threshold
- Results ordered by similarity score (descending)

## Architecture

### Data Flow
1. User scans barcode or enters search query
2. HomePage routes to SearchResultsPage with query params
3. SearchResultsPage uses TanStack Query to fetch from API
4. API calls DbStorage methods with Drizzle ORM
5. PostgreSQL executes trigram similarity search
6. Results displayed with BookCard components
7. Auto-return to idle after 7 seconds

### Key Components
- **HomePage**: Barcode scanner + search input
- **SearchResultsPage**: Results display with auto-return
- **BookCard**: Book display with Libris/BLZ logos in header
- **BookDetail**: Detailed view with Hebban widget
- **BarcodeScanner**: USB + camera fallback support

## Remaining Features
- Add Hebban widget integration (affiliate ID: "MXOBejPMc", structured_data="true")
- Test barcode scanning end-to-end
- Verify camera fallback functionality

## Design Guidelines
- Mobile-first layout
- Red accent color scheme
- Libris and BLZ logos in header
- Language indicator: "ENG"
- Stock badge split: status (green/red) + location
- BookCard: 128px cover width, "Selecteer" button, release date display
- Auto-return to idle: 7 seconds

## Database Stats
- Total books: 1005
- Full ISBNs extracted from URLs
- Trigram indexes for fast fuzzy search
- Example query: "prince" returns 27 books in ~400ms
