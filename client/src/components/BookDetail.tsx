import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import type { Book } from "@shared/schema";
import { useEffect, useRef } from "react";
import { useTranslation } from "@/contexts/LanguageContext";

interface BookDetailProps {
  book: Book;
}

function formatDate(dateStr: string | null, language: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BookDetail({ book }: BookDetailProps) {
  const { t, language } = useTranslation();
  const hebbanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hebbanRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://static.hebban.nl/widget.js';
    script.setAttribute('data-isbn', book.isbn);
    script.setAttribute('data-affiliate-id', 'MXOBejPMc');
    script.setAttribute('data-structured_data', 'true');
    
    hebbanRef.current.appendChild(script);

    return () => {
      if (hebbanRef.current) {
        hebbanRef.current.innerHTML = '';
      }
    };
  }, [book.isbn]);

  const stock = book.storeStock ?? 0;
  const stockColor =
    stock >= 3
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : stock >= 1
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  const stockDot =
    stock >= 3
      ? 'bg-green-500'
      : stock >= 1
      ? 'bg-orange-500'
      : 'bg-red-500';
  const stockLabel =
    stock >= 3
      ? t.inStock
      : stock >= 1
      ? t.stockAvailable(stock)
      : t.outOfStock;

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6">
        {/* Responsive layout: vertical on mobile, horizontal on tablet+ */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Book cover - centered on mobile, left on tablet+ */}
          <div className="flex-shrink-0 mx-auto md:mx-0 flex flex-col items-center gap-2">
            <a
              href={`https://libris.nl/${book.isbn}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md hover-elevate active-elevate-2"
              data-testid="link-cover"
            >
              <div className="w-48 h-72 md:w-56 md:h-80 bg-muted rounded-md overflow-hidden shadow-lg">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground" />
                  </div>
                )}
              </div>
            </a>
            <a
              href={`https://libris.nl/${book.isbn}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-center text-primary underline-offset-4 hover:underline w-48 md:w-56"
              data-testid="link-detail-page"
            >
              {t.viewDetailPage}
            </a>
          </div>
          
          {/* Book information */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Title, Author, Price */}
            <div className="space-y-1.5 text-center md:text-left">
              <h1 className="text-2xl md:text-2xl font-bold leading-tight" data-testid="text-title">
                {book.title}
              </h1>
              <p className="text-lg md:text-lg text-muted-foreground" data-testid="text-author">
                {book.author}
              </p>
              <div className="text-4xl md:text-5xl font-bold text-primary" data-testid="text-price">
                €{Number(book.price).toFixed(2)}
              </div>
            </div>
            
            {/* Book details grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:gap-x-6 md:gap-y-2.5">
              {book.format && (
                <div>
                  <div className="text-xs md:text-sm text-muted-foreground">{t.format}</div>
                  <div className="text-sm md:text-sm font-semibold">{book.format}</div>
                </div>
              )}
              {book.language && (
                <div>
                  <div className="text-xs md:text-sm text-muted-foreground">{t.language}</div>
                  <div className="text-sm md:text-sm font-semibold">{book.language}</div>
                </div>
              )}
              {book.publisher && (
                <div>
                  <div className="text-xs md:text-sm text-muted-foreground">{t.publisher}</div>
                  <div className="text-sm md:text-sm font-semibold">{book.publisher}</div>
                </div>
              )}
              <div>
                <div className="text-xs md:text-sm text-muted-foreground">{t.isbn}</div>
                <div className="text-sm md:text-sm font-semibold">{book.isbn}</div>
              </div>
              {book.releaseDate && (
                <div>
                  <div className="text-xs md:text-sm text-muted-foreground">{t.released}</div>
                  <div className="text-sm md:text-sm font-semibold" data-testid="text-release-date">
                    {formatDate(book.releaseDate, language)}
                  </div>
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1.5" data-testid="container-availability">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${stockColor}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stockDot}`} />
                <span data-testid="text-stock-label">{stockLabel}</span>
              </div>
              {book.storeLocation && (
                <div className="text-xs text-muted-foreground" data-testid="text-stock-location">
                  {t.location}: {book.storeLocation}
                </div>
              )}
            </div>
            
            {/* Genre and Thema Codes section */}
            <div className="mt-auto space-y-2">
              {(book.nur || book.themaCodes) && (
                <div className="p-3 md:p-2 bg-muted rounded-lg">
                  {book.nur && (
                    <div className="text-sm font-medium mb-2" data-testid="text-genre">
                      <span className="font-semibold">Genre: </span>
                      <span>{book.nur}</span>
                    </div>
                  )}
                  {book.themaCodes && (
                    <div className="text-sm text-muted-foreground" data-testid="text-thema-codes">
                      {book.themaCodes.split(',').map((code) => code.trim()).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Reviews section */}
      {book.recensies && (
        <Card className="p-4 md:p-6 bg-card">
          <div className="text-xs font-bold tracking-widest text-muted-foreground mb-3" data-testid="text-recensies-title">
            {t.recensiesTitle}
          </div>
          <div className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed" data-testid="text-reviews">
            {book.recensies}
          </div>
        </Card>
      )}
      
      <div ref={hebbanRef} className="min-h-32" data-testid="container-hebban-widget" />
    </div>
  );
}
