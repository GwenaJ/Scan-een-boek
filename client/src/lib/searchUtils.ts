/**
 * Parses search input and determines whether it's an ISBN or text search
 */

export interface ParsedSearch {
  type: 'isbn' | 'title' | 'title-author';
  isbn?: string;
  title?: string;
  author?: string;
}

/**
 * Detects if a string looks like an ISBN (10 or 13 digits, optionally with hyphens/spaces)
 * ISBN-10 can end with 'X' as check digit (case-insensitive)
 */
export function isISBN(input: string): boolean {
  const cleaned = input.replace(/[\s-]/g, '').toUpperCase();
  // ISBN-13: 13 digits
  // ISBN-10: 9 digits + digit or X
  return /^\d{13}$/.test(cleaned) || /^\d{9}[\dX]$/.test(cleaned);
}

/**
 * Parses search input into structured search parameters
 * 
 * Examples:
 * - "9789464520163" → { type: 'isbn', isbn: '9789464520163' }
 * - "978-94-645-2016-3" → { type: 'isbn', isbn: '9789464520163' }
 * - "On the Road - Jack Kerouac" → { type: 'title-author', title: 'On the Road', author: 'Jack Kerouac' }
 * - "De gangster" → { type: 'title', title: 'De gangster' }
 */
export function parseSearchInput(input: string): ParsedSearch {
  const trimmed = input.trim();
  
  // Check if it's an ISBN
  if (isISBN(trimmed)) {
    return {
      type: 'isbn',
      isbn: trimmed.replace(/[\s-]/g, '').toUpperCase() // Remove spaces/hyphens, normalize X
    };
  }
  
  // Check if it contains " - " separator for title - author format
  const parts = trimmed.split(' - ');
  if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
    return {
      type: 'title-author',
      title: parts[0].trim(),
      author: parts[1].trim()
    };
  }
  
  // Default to title search
  return {
    type: 'title',
    title: trimmed
  };
}

/**
 * Converts parsed search to URL query parameters
 */
export function buildSearchUrl(parsed: ParsedSearch): string {
  switch (parsed.type) {
    case 'isbn':
      return `/search?isbn=${encodeURIComponent(parsed.isbn!)}`;
    case 'title-author':
      return `/search?title=${encodeURIComponent(parsed.title!)}&author=${encodeURIComponent(parsed.author!)}`;
    case 'title':
      return `/search?title=${encodeURIComponent(parsed.title!)}`;
  }
}
