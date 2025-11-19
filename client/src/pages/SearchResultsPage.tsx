import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Book } from "@shared/schema";
import BookCard from "@/components/BookCard";
import BookDetail from "@/components/BookDetail";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import SearchBar from "@/components/SearchBar";
import { parseSearchInput, buildSearchUrl } from "@/lib/searchUtils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchResultsPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const autoReturnTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Parse URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isbnRaw = urlParams.get('isbn');
  const title = urlParams.get('title');
  const author = urlParams.get('author');
  
  // Normalize ISBN (remove hyphens/spaces, uppercase for X check digit)
  const isbn = isbnRaw ? isbnRaw.replace(/[\s-]/g, '').toUpperCase() : null;
  
  // Fetch book by ISBN if isbn param exists
  const { data: isbnBook, isLoading: isbnLoading, error: isbnError } = useQuery<Book>({
    queryKey: [`/api/books/${isbn}`],
    enabled: !!isbn,
    retry: false, // Don't retry on 404
  });
  
  // Fetch books by title/author if search params exist
  const searchParams = new URLSearchParams();
  if (title) searchParams.append('title', title);
  if (author) searchParams.append('author', author);
  const searchUrl = `/api/books/search?${searchParams.toString()}`;
  
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery<Book[]>({
    queryKey: [searchUrl],
    enabled: !isbn && (!!title || !!author)
  });
  
  // Determine the display data based on query type
  const results: Book[] = isbn ? (isbnBook ? [isbnBook] : []) : searchResults ?? [];
  const isLoading = isbn ? isbnLoading : searchLoading;
  
  // For ISBN lookup, treat 404 as "not found" (empty results) rather than error
  const is404Error = (err: any) => {
    return err?.message?.includes('404') || err?.response?.status === 404;
  };
  
  const error = isbn 
    ? (isbnError && !is404Error(isbnError) ? isbnError : null)
    : searchError;
  
  // Centralized function to reset the auto-return timer
  const resetAutoReturnTimer = () => {
    if (autoReturnTimerRef.current) {
      clearTimeout(autoReturnTimerRef.current);
    }
    autoReturnTimerRef.current = setTimeout(() => {
      setLocation('/');
    }, 15000); // 15 seconds to allow for testing and real user interaction
  };
  
  // Auto-return to idle after 15 seconds of inactivity
  // Only start timer after data has loaded
  useEffect(() => {
    // Don't start timer while loading
    if (isLoading) {
      return;
    }
    
    resetAutoReturnTimer();
    
    // Reset timer on any user activity
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetAutoReturnTimer);
    });
    
    return () => {
      if (autoReturnTimerRef.current) {
        clearTimeout(autoReturnTimerRef.current);
      }
      // Cleanup activity listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetAutoReturnTimer);
      });
    };
  }, [location, isLoading]);
  
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const handleSearchSubmit = (query: string) => {
    resetAutoReturnTimer();
    if (query.trim()) {
      const parsed = parseSearchInput(query);
      const url = buildSearchUrl(parsed);
      setLocation(url);
    }
  };
  
  const handleSearchChange = (value: string) => {
    resetAutoReturnTimer();
    setSearchQuery(value);
  };

  const handleBookClick = (book: Book) => {
    resetAutoReturnTimer();
    setSelectedBook(book);
    setViewMode('detail');
  };

  const handleBack = () => {
    resetAutoReturnTimer();
    if (viewMode === 'detail') {
      setViewMode('list');
      setSelectedBook(null);
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b sticky top-0 bg-background z-10">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold flex-1">Scan-een-Boek</h1>
          </div>
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState
              title="Fout bij ophalen"
              message="Er is een fout opgetreden bij het ophalen van de gegevens. Probeer het opnieuw."
              action={{
                label: 'Terug',
                onClick: () => setLocation('/')
              }}
            />
          ) : viewMode === 'detail' && selectedBook ? (
            <BookDetail book={selectedBook} />
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold" data-testid="text-results-count">
                {results.length} {results.length === 1 ? 'resultaat' : 'resultaten'} gevonden
              </h2>
              {results.map((book: any) => (
                <BookCard 
                  key={book.isbn} 
                  book={book}
                  onClick={() => handleBookClick(book)}
                />
              ))}
            </div>
          ) : (
            <ErrorState
              title={isbn ? "Boek niet gevonden" : "Geen resultaten"}
              message={
                isbn 
                  ? `Het boek met ISBN/barcode ${isbn} is niet gevonden in onze database.`
                  : "We konden geen boeken vinden voor uw zoekopdracht."
              }
              action={{
                label: 'Nieuwe zoekopdracht',
                onClick: () => setLocation('/')
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
