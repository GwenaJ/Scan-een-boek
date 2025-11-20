# Scan-een-Boek - Dutch Bookstore Kiosk Application

## Project Overview
Mobile-first web application for instant book price lookup via barcode scanning (USB scanner + camera fallback). Built for a Dutch bookstore kiosk.

## Tech Stack
- **Frontend**: React + TypeScript + Wouter + TanStack Query
- **Backend**: Express + Node.js
- **Database**: PostgreSQL (Neon) with pg_trgm extension for fuzzy search
- **ORM**: Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui components

## Recent Changes

### November 20, 2025 - Simplified to Barcode-Only
- **Removed** title/author search functionality
- **Removed** SearchBar component from HomePage
- **Removed** `/api/books/search` API endpoint
- **Removed** title/author query handling from SearchResultsPage
- **Auto-start scanning**: Camera now starts automatically on page load (no button needed)
- **USB Scanner Support**: Added keyboard event listener for USB barcode scanners
- **Removed** camera start/stop button - scanning is now automatic for both USB and camera
- App now exclusively uses barcode scanning for ISBN lookup (USB scanner or camera)

### November 12, 2025

### Data Import Fix
- Fixed ISBN parsing to extract full 13-digit ISBNs from URLs (boekpagina_url and cover_url)
- CSV stores ISBNs in scientific notation (e.g., "9.78014E+12") which loses precision
- Solution: Extract ISBNs from URL fields instead of parsing scientific notation
- Re-imported all 1005 books with correct ISBNs

### API Backend
- **Endpoint**:
  - GET `/api/books/:isbn` - Barcode lookup (returns single Book object or 404)

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


## Architecture

### Data Flow
1. User scans barcode via USB scanner or camera
2. HomePage routes to SearchResultsPage with ISBN query param
3. SearchResultsPage uses TanStack Query to fetch book by ISBN from API
4. API calls DbStorage.getBookByIsbn() with exact ISBN match
5. Result displayed with BookCard component
6. Auto-return to idle after 15 seconds

### Key Components
- **HomePage**: Barcode scanner only (USB + camera fallback)
- **SearchResultsPage**: Single book result display with auto-return
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
