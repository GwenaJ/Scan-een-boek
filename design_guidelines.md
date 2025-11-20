# Design Guidelines: Scan-een-Boek Kiosk Application

## Design Philosophy

**Barcode-First Kiosk Interface** - A streamlined, touch-optimized design for iPad tablets in landscape orientation with mobile fallback support. The interface prioritizes speed, clarity, and minimal user interaction for bookstore self-service kiosks.

## Target Devices & Orientations

### Primary Target
- **iPad-sized tablets in landscape orientation** (1024×768 and similar)
- Large touch-friendly interface
- Horizontal layout optimized for landscape viewing
- USB barcode scanner as primary input method

### Secondary Support
- **Mobile phones in portrait orientation** (iPhone 12: 390×844 and similar)
- Vertical layout for smaller screens
- Camera-based barcode scanning as fallback
- Touch-optimized for one-handed operation

### Responsive Breakpoint
- **768px (md breakpoint)** separates mobile from tablet layouts
- Below 768px: Portrait-optimized vertical layout
- 768px and above: Landscape-optimized horizontal layout

## Color System

### Primary Colors
```css
/* Red accent - bookstore brand color */
--primary: 0 84% 45%;           /* Light mode */
--primary: 0 84% 50%;           /* Dark mode */
--primary-foreground: 0 0% 98%; /* White text on primary */
```

### Semantic Colors
```css
/* Backgrounds */
--background: 0 0% 100%;        /* Pure white (light mode) */
--card: 0 0% 98%;              /* Very light gray cards */
--muted: 0 5% 93%;             /* Muted backgrounds */

/* Text */
--foreground: 0 0% 9%;         /* Near-black primary text */
--muted-foreground: 0 0% 40%;  /* Gray secondary text */

/* Borders */
--border: 0 0% 89%;            /* Light gray borders */
--card-border: 0 0% 93%;       /* Even lighter card borders */

/* Interactive */
--destructive: 0 84% 45%;      /* Red for errors/warnings */
--accent: 0 8% 94%;            /* Subtle gray accent */
```

### Stock Status Colors
- **In Stock**: Green badge (success color)
- **Limited Stock**: Yellow/amber badge (warning color)
- **Out of Stock**: Red badge (destructive color)

## Typography System

### Font Stack
```css
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Type Scale - Mobile (<768px)

**Display Elements:**
- App Title: `text-2xl` (1.5rem/24px), font-bold
- Book Title: `text-xl` (1.25rem/20px), font-semibold
- Book Author: `text-base` (1rem/16px), font-normal

**Prominent Elements:**
- Price: `text-4xl` (2.25rem/36px), font-bold - Most prominent on page

**Body Text:**
- Book Details: `text-sm` (0.875rem/14px), font-semibold for values
- Detail Labels: `text-xs` (0.75rem/12px), text-muted-foreground
- Availability Label: `text-xs` (0.75rem/12px), font-semibold

**Micro Text:**
- Scanner Instructions: `text-xs` (0.75rem/12px)

### Type Scale - Tablet (≥768px)

**Display Elements:**
- App Title: `text-2xl` (1.5rem/24px), font-bold
- Book Title: `md:text-2xl` (1.5rem/24px), font-semibold
- Book Author: `md:text-lg` (1.125rem/18px), font-normal

**Prominent Elements:**
- Price: `md:text-5xl` (3rem/48px), font-bold - **MOST PROMINENT ELEMENT**

**Body Text:**
- Book Details: `md:text-sm` (0.875rem/14px), font-semibold
- Detail Labels: `text-xs` (0.75rem/12px), text-muted-foreground
- Availability Label: `text-xs` (0.75rem/12px), font-semibold

### Typography Principles
1. **Price is King**: Always the largest, most prominent text on screen
2. **Hierarchy**: Clear distinction between primary (title), secondary (author), and tertiary (metadata) information
3. **Readability**: All text readable at arm's length on kiosk tablets
4. **Compact**: Tighter spacing on tablet to fit more information above the fold

## Layout System

### Spacing Scale
- **Micro**: `gap-1` (0.25rem/4px) - Between small related items
- **Tight**: `gap-2` (0.5rem/8px) - Within compact sections
- **Small**: `gap-4` (1rem/16px) - Between related elements (mobile default)
- **Medium**: `md:gap-6` (1.5rem/24px) - Between sections (tablet default)
- **Large**: `gap-8` (2rem/32px) - Between major page sections

### Container Padding
**Mobile (<768px):**
- Cards: `p-4` (1rem/16px)
- Availability section: `p-3` (0.75rem/12px)
- Page: `p-4` (1rem/16px)

**Tablet (≥768px):**
- Cards: `md:p-6` (1.5rem/24px)
- Availability section: `md:p-2` (0.5rem/8px) - **Very compact**
- Page: `p-4` (1rem/16px)

### Grid System
**Book Details Grid (2-column):**
```tsx
grid grid-cols-2 gap-x-4 gap-y-2 md:gap-x-6 md:gap-y-2.5
```
- Format, Language, Publisher, ISBN displayed in 2×2 grid
- Horizontal gap larger than vertical for better scanning
- Slightly more generous spacing on tablet

## Component Design Patterns

### HomePage (Barcode Scanner View)

**Header:**
- Height: Auto-height with `p-4` padding
- Border: Bottom border (`border-b`)
- Layout: `flex items-center justify-between`
- Left: Libris + BLZ logos + App title
- Right: Language toggle button

**Main Content:**
- Layout: `flex-1 flex flex-col items-center justify-center`
- Max width: `max-w-2xl w-full`
- Centered vertically and horizontally

**BarcodeScanner Card:**
- Component: shadcn/ui `<Card>`
- Padding: `p-6`
- Spacing: `space-y-4`
- Scanner area: Large clickable zone with hover/active states
- Animated scanner image with red laser beam effect
- Status text below scanner

### SearchResultsPage (Book Detail View)

**Header:**
- Sticky positioning: `sticky top-0 bg-background z-10`
- Back button (left): Ghost variant icon button with `<ArrowLeft>`
- Title: App name centered
- Language toggle (right): Ghost variant text button

**Mobile Layout (<768px):**
```tsx
<Card className="p-4">
  <div className="flex flex-col gap-4">
    {/* Book cover - centered */}
    <img className="w-48 h-72 rounded-md mx-auto object-cover" />
    
    {/* Book info - centered */}
    <div className="space-y-4 text-center">
      <h1 className="text-xl font-semibold">Title</h1>
      <p className="text-base text-muted-foreground">Author</p>
      <p className="text-4xl font-bold text-primary">€15.00</p>
      
      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {/* Format, Language, Publisher, ISBN */}
      </div>
      
      {/* Availability - compact */}
      <div className="p-3 bg-muted rounded-lg">
        <div className="text-xs font-semibold">Availability</div>
        <StockBadge />
      </div>
      
      {/* Webshop button - full width */}
      <Button className="w-full" size="lg">View in webshop</Button>
    </div>
  </div>
</Card>
```

**Tablet Layout (≥768px):**
```tsx
<Card className="md:p-6">
  <div className="md:flex-row md:gap-6">
    {/* Left: Book cover */}
    <img className="md:w-56 md:h-80 rounded-md object-cover" />
    
    {/* Right: Book info */}
    <div className="flex-1 flex flex-col md:text-left">
      <h1 className="md:text-2xl font-semibold">Title</h1>
      <p className="md:text-lg text-muted-foreground">Author</p>
      <p className="md:text-5xl font-bold text-primary">€15.00</p>
      
      {/* Details grid - more spacing */}
      <div className="grid grid-cols-2 md:gap-x-6 md:gap-y-2.5">
        {/* Format, Language, Publisher, ISBN */}
      </div>
      
      {/* Availability - VERY compact on tablet */}
      <div className="mt-auto space-y-2">
        <div className="md:p-2 bg-muted rounded-lg">
          <div className="text-xs font-semibold mb-1">Availability</div>
          <StockBadge />
        </div>
        
        {/* Webshop button */}
        <Button className="w-full" size="lg">View in webshop</Button>
      </div>
    </div>
  </div>
</Card>
```

### StockBadge Component

**Structure:**
- `inline-flex items-center gap-1.5`
- Badge variant determined by stock level
- Optional location badge displayed alongside

**Stock Status Badge:**
- In Stock: `<Badge variant="default">` with green styling
- Limited Stock: `<Badge variant="secondary">` with yellow styling
- Out of Stock: `<Badge variant="destructive">` with red styling

**Location Badge:**
- `<Badge variant="secondary">` with location text
- Only shown if `storeLocation` exists
- Compact size for space efficiency

### BarcodeScanner Component

**Idle State:**
- Large scanner image: `w-72 h-48`
- Animated red laser beam scanning effect
- "Tap to scan" instruction text
- Click anywhere to activate camera

**Active State:**
- Video preview: `max-w-md rounded-md border-2 border-primary`
- Status text below video feed
- Scan attempt counter badge
- 30-second timeout with status message

**Error State:**
- Red destructive color for error text
- Clear error message
- Permission denied helper text
- Retry option

### Button Patterns

**Primary Actions:**
```tsx
<Button variant="default" size="lg" className="w-full">
  View in webshop
  <ExternalLink className="ml-2 w-4 h-4 md:w-5 md:h-5" />
</Button>
```
- Full width on mobile
- Large size for touch targets
- Icon on right side
- Primary red color

**Navigation:**
```tsx
<Button variant="ghost" size="icon">
  <ArrowLeft className="w-5 h-5" />
</Button>
```
- Icon-only buttons for back/close
- Ghost variant for subtle appearance
- Consistent icon sizing

**Language Toggle:**
```tsx
<Button variant="ghost" size="sm">
  {language === 'nl' ? 'ENG' : 'NL'}
</Button>
```
- Small ghost button
- Text-only (no icon)
- Toggles between "NL" and "ENG"

## Visual Treatments

### Borders & Corners
- **Border Radius**: `rounded-lg` (0.5rem/8px) for cards and major elements
- **Border Radius**: `rounded-md` (0.375rem/6px) for nested elements (images, badges)
- **Border Width**: Default 1px, never thicker except for emphasis
- **Border Color**: Subtle, low-contrast (`border`, `card-border`)

### Shadows & Elevation
- **Cards**: `shadow-sm` for subtle elevation
- **Minimal shadows**: This is a utility interface, not decorative
- **Focus states**: Ring color matches primary (`ring-primary`)

### Backgrounds
- **Page**: Pure white (`bg-background`)
- **Cards**: Very light gray (`bg-card`)
- **Muted sections**: Light gray (`bg-muted`) for availability area
- **Contrast**: Minimal contrast between elements for calm appearance

### Images
- **Book Covers**: 
  - Mobile: 192×288px (w-48 h-72, aspect 2:3)
  - Tablet: 224×320px (w-56 h-80, aspect 2:3)
  - `object-cover` to maintain aspect ratio
  - `rounded-md` corners
- **Logo Images**: 
  - Height: `h-10` (2.5rem/40px)
  - Width: Auto (`w-auto`)
  - Displayed side-by-side in header

## Interaction Patterns

### Touch Targets
- **Minimum height**: 44px (iOS/Android guideline)
- **Buttons**: Default button heights are min-h-9, min-h-8, min-h-10
- **Large buttons**: `size="lg"` for primary actions
- **Icon buttons**: `size="icon"` creates perfect square

### Hover & Active States
- **Buttons**: Use built-in shadcn button hover states
- **Cards**: Subtle elevation on hover for clickable cards
- **Scanner area**: `hover-elevate active-elevate-2` classes
- **Cursor**: `cursor-pointer` on interactive elements

### Auto-Return Timer
- **Duration**: 15 seconds of inactivity
- **Disabled**: When viewing book detail (allows reading)
- **Reset triggers**: Any mouse, keyboard, touch, or scroll activity
- **Behavior**: Silent return to homepage

### Loading States
- **Spinner**: Centered loading spinner
- **Text**: "Zoeken..." / "Searching..." message
- **Skeleton**: Optional skeleton states for content areas

### Error States
- **Icon**: Large error/warning icon
- **Message**: Clear, bilingual error text
- **Action**: Prominent retry/back button
- **Color**: Destructive red for critical errors

## Responsive Behavior Patterns

### Layout Adaptation
| Element | Mobile (<768px) | Tablet (≥768px) |
|---------|----------------|-----------------|
| BookDetail layout | `flex-col` (vertical) | `md:flex-row` (horizontal) |
| Book cover position | Centered with `mx-auto` | Left-aligned with `mx-0` |
| Text alignment | `text-center` | `md:text-left` |
| Card padding | `p-4` | `md:p-6` |
| Content gap | `gap-4` | `md:gap-6` |
| Cover size | `w-48 h-72` | `md:w-56 md:h-80` |
| Price size | `text-4xl` | `md:text-5xl` |
| Title size | `text-xl` | `md:text-2xl` |
| Author size | `text-base` | `md:text-lg` |
| Availability padding | `p-3` | `md:p-2` |

### Breakpoint Strategy
- **Mobile-first approach**: Base styles for mobile, `md:` prefix for tablet+
- **Single breakpoint**: 768px (md) is the only breakpoint needed
- **No desktop optimizations**: Max content width prevents over-expansion
- **Touch-optimized**: All sizes work for finger taps, not mouse precision

## Branding Elements

### Logos
- **Libris logo**: PNG image, `h-10 w-auto`
- **BLZ logo**: JPEG image, `h-10 w-auto`
- **Placement**: Header left side, before app title
- **Spacing**: `gap-2` between logos, `gap-3` between logo group and title

### Color Identity
- **Primary red**: HSL(0, 84%, 45%) in light mode
- **Bookstore context**: Red is traditional bookstore/library color
- **Consistent usage**: Primary actions, price emphasis, scanner border, stock badges

### Language Indicator
- **Button text**: "NL" when Dutch active, "ENG" when English active
- **Position**: Top-right corner of header
- **Style**: Ghost button, small size, subtle appearance

## Accessibility Considerations

### Test IDs (for automated testing)
Every interactive element includes `data-testid` attributes:
- Buttons: `button-{action}` (e.g., `button-back`, `button-language-toggle`)
- Inputs: `input-{field}` (e.g., `input-isbn`)
- Text: `text-{content}` (e.g., `text-camera-error`)
- Containers: `container-{section}` (e.g., `container-hebban-widget`)

### Touch Accessibility
- Large touch targets (minimum 44px)
- Generous spacing between interactive elements
- Clear visual feedback on touch
- No hover-dependent interactions (works on touch-only devices)

### Visual Accessibility
- High contrast text (near-black on white)
- Clear visual hierarchy
- Readable font sizes at arm's length
- Color not the only indicator (icons + text for status)

## Animations & Transitions

### Scanner Laser Beam
```css
@keyframes scannerBeam {
  0%, 100% {
    transform: translateY(-60px);
    opacity: 0.6;
  }
  50% {
    transform: translateY(60px);
    opacity: 1;
  }
}
animation: scannerBeam 3.5s ease-in-out infinite;
```
- Red horizontal bar that moves up and down
- Creates "scanning" effect on idle scanner
- Draws attention to scanner interaction area

### Transitions
- **Duration**: Quick (200-300ms) for UI feedback
- **Easing**: `ease-in-out` for natural feel
- **Properties**: Opacity, transform, background color only
- **No layout animations**: Avoid shifting content during transitions

## Design Constraints & Decisions

### What This App IS
- **Kiosk-first**: Designed for unattended self-service
- **Barcode-focused**: Primary input is scanning, not typing
- **Single-book view**: One book at a time, no list views
- **Bilingual**: Equal support for Dutch and English
- **Responsive**: Works on tablets and phones
- **Utility interface**: Function over decoration

### What This App IS NOT
- **Not a search engine**: No text search for titles/authors
- **Not a catalog browser**: No browsing, filtering, or sorting
- **Not multi-select**: Single book lookup only
- **Not conversational**: Minimal text, maximum clarity
- **Not decorative**: No hero images, illustrations, or branding beyond logos

### Design Priorities (in order)
1. **Speed**: Instant feedback, minimal steps
2. **Clarity**: Obvious what to do and what's happening
3. **Touch-friendly**: Large targets, generous spacing
4. **Bilingual**: Equal quality in both languages
5. **Responsive**: Optimized for landscape iPad, works on mobile
6. **Compact**: Maximum information in minimum space (especially on tablet)

## Implementation Notes

### Component Library
- **shadcn/ui**: All UI components (Button, Card, Badge, etc.)
- **Tailwind CSS**: All styling and responsive design
- **Lucide React**: All icons (ArrowLeft, ExternalLink, ScanLine, etc.)

### State Management
- **TanStack Query**: Data fetching and caching
- **React Context**: Language preference
- **URL state**: ISBN passed via query parameter
- **Local state**: UI interactions (camera active, selected book, etc.)

### Key Files
- `client/src/components/BookDetail.tsx`: Responsive book display
- `client/src/components/BarcodeScanner.tsx`: USB + camera scanning
- `client/src/pages/HomePage.tsx`: Scanner interface
- `client/src/pages/SearchResultsPage.tsx`: Book detail page
- `client/src/index.css`: Color system and custom utilities

---

**Design Version**: 2.0 (Barcode-Only, Responsive Layout)
**Last Updated**: November 20, 2025
**Optimized For**: iPad landscape (1024×768) with mobile support
