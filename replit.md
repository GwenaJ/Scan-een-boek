# Scan-een-Boek - Dutch Bookstore Kiosk Application

A barcode-scanning kiosk application built for iPad-sized tablets in landscape orientation, designed for a Dutch bookstore. Supports both USB barcode scanners (primary) and mobile phone cameras (fallback) for looking up books by ISBN.

## Project Purpose

This application serves as a self-service kiosk where customers can:
1. Scan a book's barcode using a USB scanner or phone camera
2. Instantly view book details including price, availability, and store location
3. Access the webshop to purchase books online
4. View Hebban reviews and ratings

The app is optimized for landscape iPad tablets but remains fully functional on mobile phones.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Wouter (routing) + TanStack Query v5
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon) with 1,005 books
- **ORM**: Drizzle ORM
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Barcode Scanning**: ZXing library for camera-based scanning
- **Internationalization**: Custom bilingual system (Dutch/English)

## Core Features

### 1. Barcode Scanning (Primary Feature)
- **USB Scanner**: Keyboard event listener continuously monitors for scanned barcodes
- **Camera Fallback**: Tap-to-start camera scanner using ZXing library
  - 30-second timeout with auto-stop
  - Tap-to-restart capability after timeout
  - Works on mobile devices with rear camera
- **Direct Navigation**: Scanning immediately navigates to book detail page (no intermediate list view)

### 2. Bilingual Interface
- **Languages**: Dutch (NL) and English (EN)
- **Toggle**: Top-right language button switches between "NL" ↔ "ENG"
- **Persistence**: Language preference maintained throughout session
- **Translation System**: Custom context-based translation provider

### 3. Responsive Design
**Mobile (<768px - Portrait)**
- Vertical layout with book cover centered above information
- Compact spacing and smaller fonts
- Full-width buttons
- Price: text-4xl (prominent but appropriately sized)

**Tablet (≥768px - Landscape iPad)**
- Horizontal layout: book cover left (224×320px), info right
- Optimized for landscape orientation
- Larger, more readable fonts
- Price: text-5xl (most prominent element)
- Compact availability section to maximize space efficiency

### 4. Auto-Return to Idle
- **Timer**: 15-second inactivity timer
- **Reset Triggers**: Mouse, keyboard, touch, or scroll activity
- **Disabled During**: Book detail viewing (allows reading without interruption)
- **Purpose**: Returns kiosk to home screen for next customer

### 5. Book Detail Display
Shows comprehensive book information:
- Cover image (from external URL)
- Title and author
- Price (prominently displayed)
- Format, language, publisher, ISBN
- Store availability status (in stock / limited / out of stock)
- Store location (if available)
- Webshop button (external link to boekpagina.nl)
- Hebban widget integration (book reviews/ratings)

## Database Schema

### Books Table
```sql
CREATE TABLE books (
  isbn TEXT PRIMARY KEY,              -- 13-digit ISBN (e.g., "9789400509573")
  title TEXT NOT NULL,                -- Book title
  author TEXT NOT NULL,               -- Author name
  price NUMERIC(8,2) NOT NULL,        -- Price in EUR (e.g., 15.00)
  nstc TEXT,                          -- NSTC code (optional)
  format TEXT,                        -- Format (e.g., "Paperback", "Hardcover")
  publisher TEXT,                     -- Publisher name
  release_date DATE,                  -- Release date
  language TEXT,                      -- Language (e.g., "Nederlands", "English")
  store_stock INTEGER NOT NULL DEFAULT 0,  -- Stock quantity
  store_location TEXT,                -- Physical location in store
  boekpagina_url TEXT,               -- External webshop URL
  cover_url TEXT                      -- Cover image URL
);
```

**Data Source**: 1,005 books imported from CSV
**ISBN Extraction**: Full 13-digit ISBNs extracted from URL fields (CSV stored ISBNs in scientific notation which lost precision)

## API Endpoints

### GET `/api/books/:isbn`
**Purpose**: Fetch book by ISBN (barcode lookup)
**Parameters**: 
- `isbn` (path parameter) - 13-digit ISBN
**Returns**: Single Book object
**Status Codes**:
- `200` - Book found
- `404` - Book not found
- `500` - Server error

### GET `/api/health`
**Purpose**: Health check with database connection test
**Returns**: 
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "production",
  "timestamp": "2025-11-20T12:00:00.000Z"
}
```

## Application Architecture

### Routes
- `/` - HomePage (barcode scanner)
- `/search?isbn={isbn}` - SearchResultsPage (book detail view)
- `/scan` - Alias for `/search` (legacy support)

### Data Flow
1. User scans barcode via USB scanner or camera
2. BarcodeScanner component captures ISBN
3. HomePage navigates to `/search?isbn={scannedISBN}`
4. SearchResultsPage fetches book via TanStack Query: `GET /api/books/{isbn}`
5. API queries database: `storage.getBookByIsbn(isbn)`
6. If found: Book detail automatically displayed (skips list view)
7. If not found: Error message with ISBN shown
8. After 15 seconds of inactivity (when not viewing detail): Auto-return to home

### Key Components

#### HomePage (`client/src/pages/HomePage.tsx`)
- Displays BarcodeScanner component
- Shows Libris and BLZ logos in header
- Language toggle button (top-right)
- Handles barcode scan events and navigation

#### BarcodeScanner (`client/src/components/BarcodeScanner.tsx`)
- **Dual-mode scanner**: USB keyboard listener + camera fallback
- **USB Scanner**: Listens for rapid keyboard input (typical scanner behavior)
- **Camera Scanner**: 
  - Tap-to-start (not auto-start)
  - 30-second timeout with status messages
  - Tap-to-restart after timeout
  - ZXing library for barcode detection
- **Visual**: Animated scanner image with red laser beam effect

#### SearchResultsPage (`client/src/pages/SearchResultsPage.tsx`)
- Parses `?isbn={isbn}` from URL
- Fetches book via TanStack Query
- Automatically shows BookDetail when book found
- Skips intermediate list view (direct scan-to-detail)
- Manages 15-second auto-return timer
- Handles 404 as "book not found" (not error)

#### BookDetail (`client/src/components/BookDetail.tsx`)
- **Responsive Layout**:
  - Mobile: Vertical (cover above, info below)
  - Tablet: Horizontal (cover left, info right)
- **Information Display**:
  - Book cover (left on tablet, centered on mobile)
  - Title, author, price
  - Format, language, publisher, ISBN grid
  - Compact availability/location section
  - Webshop button
- **Hebban Integration**: Reviews widget loads below book info

#### StockBadge (`client/src/components/StockBadge.tsx`)
- **Status Badge**: Green (in stock), Yellow (limited), Red (out of stock)
- **Location Badge**: Shows physical store location if available
- **Compact Display**: Minimal padding and spacing for landscape layout

#### LanguageContext (`client/src/contexts/LanguageContext.tsx`)
- Global language state (Dutch/English)
- Translation function provider
- Language persistence

### Translation System

Located in `client/src/lib/translations.ts`:
- All UI text defined in Dutch and English
- Accessed via `useTranslation()` hook
- Returns `t` object with translated strings
- Example: `t.appTitle` returns "Barcode scanner" in both languages

## Design Guidelines

### Color Scheme
- **Primary**: Red accent color (bookstore brand)
- **Background**: Light/neutral tones
- **Logos**: Libris and BLZ logos in header

### Typography Hierarchy
**Mobile (<768px)**:
- Title: text-xl
- Author: text-base
- Price: text-4xl (prominent)
- Details: text-sm
- Availability label: text-xs

**Tablet (≥768px)**:
- Title: text-2xl
- Author: text-lg
- Price: text-5xl (most prominent element)
- Details: text-sm
- Availability label: text-xs

### Layout Principles
- **Landscape First**: Optimized for iPad in landscape orientation
- **Compact Design**: Maximizes information density without clutter
- **Touch-Friendly**: Large touch targets for kiosk use
- **Minimal Scrolling**: Most info visible above the fold on tablet
- **Responsive Breakpoint**: 768px (md) separates mobile/tablet layouts

### Spacing
- **Mobile**: Tighter spacing (p-4, gap-4)
- **Tablet**: Slightly more generous (md:p-6, md:gap-6)
- **Availability Section**: Very compact (md:p-2) to save space

### Interactive Elements
- **Back Button**: Arrow icon (top-left)
- **Language Toggle**: Text button "NL" or "ENG" (top-right)
- **Webshop Button**: Full-width on mobile, prominent on tablet
- **Scanner Tap Area**: Large clickable area with visual feedback

## Known Issues & Limitations

### Four Known Bugs (Not Fixed Per User Request)
1. **Camera Initialization**: Occasional delay in video stream readiness
2. **Video Play Warnings**: Browser console warnings about video playback
3. **Case-Sensitive Search**: ISBN normalization may have edge cases
4. **Wrong selectBookSchema**: Schema uses createInsertSchema instead of proper select schema

### Current Limitations
- **No Manual ISBN Entry**: BarcodeScanner has no text input field (scan-only)
- **No Title/Author Search**: Removed per simplification requirements
- **Single Book Display**: Always shows one book at a time (no list view)
- **External Dependencies**: Cover images and webshop links from external sources
- **Camera Permission**: Requires user to grant camera access on first use

## Testing

### Automated Tests
- Responsive layout verified on iPhone 12 (390×844) and iPad landscape (1024×768)
- Book detail page tested with ISBN 9789400509573
- Both mobile and tablet layouts confirmed working

### Manual Testing Requirements
- USB barcode scanner end-to-end flow
- Camera fallback on actual mobile devices
- Hebban widget loading and display
- Auto-return timer in kiosk environment

## Development Notes

### Workflow
- **Command**: `npm run dev`
- **Workflow Name**: "Start application"
- **Auto-Restart**: Enabled after package installation

### Environment
- **Node.js**: Version 20
- **Database**: PostgreSQL via Neon (development database)
- **Port**: Frontend and backend served on same port via Vite proxy

### Future Enhancements (Not Implemented)
- Manual ISBN input field in BarcodeScanner
- Title/author search capability
- Multiple book list view
- Offline mode support
- Print receipt functionality
- Analytics/usage tracking

## Hebban Widget Integration

**Affiliate ID**: `MXOBejPMc`
**Configuration**: `structured_data="true"`
**Implementation**: Widget div with ref in BookDetail component
**Purpose**: Display book reviews and ratings from Hebban.nl

## Deployment

The application is designed for:
- **Primary**: iPad tablets in landscape orientation
- **Fallback**: Mobile phones in portrait orientation
- **Input**: USB barcode scanners (primary), phone cameras (fallback)
- **Environment**: Bookstore kiosk with stable WiFi connection
- **User Type**: Non-technical customers (minimal UI, self-explanatory)

## File Structure

```
├── client/src/
│   ├── components/
│   │   ├── BarcodeScanner.tsx      # USB + camera barcode scanning
│   │   ├── BookCard.tsx             # Book preview card (legacy)
│   │   ├── BookDetail.tsx           # Responsive book detail view
│   │   ├── StockBadge.tsx           # Availability/location badges
│   │   ├── ErrorState.tsx           # Error display
│   │   └── LoadingState.tsx         # Loading spinner
│   ├── pages/
│   │   ├── HomePage.tsx             # Barcode scanner page
│   │   └── SearchResultsPage.tsx    # Book detail page
│   ├── contexts/
│   │   └── LanguageContext.tsx      # Bilingual state management
│   ├── lib/
│   │   └── translations.ts          # Dutch/English translations
│   └── App.tsx                      # Route configuration
├── server/
│   ├── routes.ts                    # API endpoints
│   └── storage.ts                   # Database interface
└── shared/
    └── schema.ts                    # Database schema & types
```

## Database Statistics

- **Total Books**: 1,005
- **ISBN Format**: 13-digit (extracted from URLs)
- **Average Query Time**: <100ms for single book lookup
- **Data Source**: CSV import from bookstore inventory

---

**Last Updated**: November 20, 2025
**Version**: 2.0 (Barcode-Only, Responsive Layout)
**Status**: Production-Ready
