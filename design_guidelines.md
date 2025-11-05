# Design Guidelines: Scan-een-Boek Kiosk App

## Design Approach
**Utility-First Mobile Kiosk Design** - Optimized for speed, clarity, and single-handed operation in bookstore environments. Drawing from Material Design principles for touch-friendly components and clear visual hierarchy, adapted for Dutch retail context.

## Typography System
- **Primary Font**: Inter or system font stack for maximum readability on various devices
- **Heading Hierarchy**:
  - App title/logo: 24px, bold
  - Book titles: 18px, bold
  - Section headers: 16px, semibold
  - Author names: 16px, regular
- **Body Text**: 14px for metadata, ISBN, publisher
- **Price Display**: 20-24px, bold (highly prominent in Result Card)
- **Micro Text**: 12px for timestamps, fine print

## Layout & Spacing System
- **Core Spacing Units**: Tailwind 4, 6, 8, 12, 16 for consistent rhythm
- **Container**: Max-width 480px, centered with px-4 horizontal padding
- **Card Spacing**: mb-4 between stacked result cards
- **Internal Card Padding**: p-4 for standard cards, p-6 for detail view
- **Section Gaps**: space-y-6 between major sections

## Component Library

### Idle/Scan State
- Full-height centered layout with vertical flow
- Logo/branding at top (h-16)
- Large scan icon/illustration (h-48 to h-64)
- Primary instruction text centered below
- Search bar positioned in lower third for easy thumb access
- Compact "of zoek hieronder" hint text above search

### Search Bar
- Fixed or sticky positioning for constant access
- Height: h-12 to h-14
- Rounded corners (rounded-lg)
- Left-aligned search icon (w-5 h-5)
- Clear/reset button on right when active
- Typeahead dropdown: white background, subtle shadow, max-h-64 with scroll

### Result Cards (List View)
**Standard Card Structure**:
- Horizontal flex layout with gap-4
- Cover image: w-24 h-36 (96×140px), rounded corners (rounded-md), object-cover
- Content area: flex-1 with vertical stack
  - Title + author block (space-y-1)
  - Meta row: format • language • price (flex justify-between, items-baseline)
  - ISBN + publisher (text-sm, muted)
  - Stock badge at bottom

**Stock Badge**:
- Inline-flex with gap-2
- Small dot indicator (w-2 h-2, rounded-full)
- Compact text (text-sm, semibold)
- Padding: px-3 py-1, rounded-full

### Edition Picker (Compact Choice Cards)
- Slightly reduced card height vs. standard cards
- Cover: w-16 h-24 (smaller than main cards)
- Edition info emphasized: "Paperback (2023)" in semibold
- Right-aligned "Kies →" button (or chevron icon)
- Optional badges: "Nieuwste editie", "Op voorraad" as small pills
- Border or background tint to distinguish from regular results

### Detail Card (Single Result)
- Larger cover: w-48 h-72 or w-56 h-84, centered or left-aligned
- Prominent price display: text-3xl to text-4xl, bold, isolated in its own row
- Title: text-2xl, bold
- Author: text-xl, regular
- Meta grid: 2-column layout for format, language, publisher, release date
- Stock section with location: background tint, p-4, rounded-lg
- Hebban widget container: mt-6, min-h-32 (reserve space during load)
- "Bekijk op webshop" link/button: w-full, mt-4

### Error States
- Centered icon (h-16, warning/error color)
- Clear message text (text-lg, semibold)
- Suggested action button below (mt-4)
- "Probeer opnieuw" or "Zoek handmatig" CTAs

### Buttons
- Primary: h-12, rounded-lg, semibold text, w-full or min-w-32
- Secondary/Ghost: border variant, same dimensions
- Icon buttons: w-10 h-10, rounded-full for scan/clear actions

## Interaction Patterns
- **Auto-advance**: Result cards appear with subtle slide-up animation (duration-300)
- **Idle timeout**: Fade transition back to scan state after 6-8s
- **Loading states**: Centered spinner (w-8 h-8) with "Zoeken..." text
- **Touch targets**: Minimum 44px height for all interactive elements
- **Ripple feedback**: On card taps (Material Design style)

## Visual Treatments
- **Card Elevation**: Subtle shadow (shadow-sm to shadow-md)
- **Dividers**: 1px gray borders between sections, not between list cards
- **Rounded Corners**: Consistent rounded-lg for major elements, rounded-md for nested
- **Background**: Light neutral (white or very light gray), books stand out
- **Accent Usage**: Reserved for primary actions, active states, and in-stock indicators (per existing design)

## Responsive Behavior
- Base: Mobile portrait (360-428px)
- Tablet: Increase max-width to 640px, maintain single column
- Desktop/Kiosk: Max 768px centered, larger touch targets (h-14 buttons)

## Images
No decorative hero images needed - this is a utility kiosk. All images are book covers from database (cover_url column). Reserve space for missing covers with placeholder icon.