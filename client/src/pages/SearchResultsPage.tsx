import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Book } from "@shared/schema";
import BookCard from "@/components/BookCard";
import BookDetail from "@/components/BookDetail";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import { useTranslation } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchResultsPage() {
  const [location, setLocation] = useLocation();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const autoReturnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { t, language, setLanguage } = useTranslation();
  
  // Parse URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isbnRaw = urlParams.get('isbn');
  
  // Normalize ISBN (remove hyphens/spaces, uppercase for X check digit)
  const isbn = isbnRaw ? isbnRaw.replace(/[\s-]/g, '').toUpperCase() : null;
  
  // Fetch book by ISBN if isbn param exists
  const { data: isbnBook, isLoading, error: isbnError } = useQuery<Book>({
    queryKey: [`/api/books/${isbn}`],
    enabled: !!isbn,
    retry: false, // Don't retry on 404
  });
  
  // Determine the display data
  const results: Book[] = isbnBook ? [isbnBook] : [];
  
  // For ISBN lookup, treat 404 as "not found" (empty results) rather than error
  const is404Error = (err: any) => {
    return err?.message?.includes('404') || err?.response?.status === 404;
  };
  
  const error = isbnError && !is404Error(isbnError) ? isbnError : null;
  
  // View mode state (must be declared before useEffect that uses it)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
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
  // Only start timer after data has loaded and when not in detail view
  useEffect(() => {
    // Don't start timer while loading or in detail view
    if (isLoading || viewMode === 'detail') {
      // Clear any existing timer when entering detail view
      if (autoReturnTimerRef.current) {
        clearTimeout(autoReturnTimerRef.current);
        autoReturnTimerRef.current = null;
      }
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
  }, [location, isLoading, viewMode]);

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

  const toggleLanguage = () => {
    resetAutoReturnTimer(); // Reset timer on language toggle
    setLanguage(language === 'nl' ? 'en' : 'nl');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b sticky top-0 bg-background z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold flex-1">{t.appTitle}</h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleLanguage}
              className="text-sm font-medium"
              data-testid="button-language-toggle"
            >
              {t.languageToggle}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState
              title={t.errorTitle}
              message={t.errorMessage}
              action={{
                label: t.backButton,
                onClick: () => setLocation('/')
              }}
            />
          ) : viewMode === 'detail' && selectedBook ? (
            <BookDetail book={selectedBook} />
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold" data-testid="text-results-count">
                {t.resultsCount(results.length)}
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
              title={t.bookNotFoundTitle}
              message={t.bookNotFoundMessage(isbn || '')}
              action={{
                label: t.newSearchButton,
                onClick: () => setLocation('/')
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
