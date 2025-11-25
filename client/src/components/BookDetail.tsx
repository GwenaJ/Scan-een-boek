import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import type { Book } from "@shared/schema";
import { useEffect, useRef } from "react";
import { useTranslation } from "@/contexts/LanguageContext";

interface BookDetailProps {
  book: Book;
}

export default function BookDetail({ book }: BookDetailProps) {
  const { t } = useTranslation();
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

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6">
        {/* Responsive layout: vertical on mobile, horizontal on tablet+ */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Book cover - centered on mobile, left on tablet+ */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
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
      
      <div className="w-full px-2 md:px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-sm font-semibold mb-3 text-muted-foreground">Related Books</div>
          <div 
            ref={hebbanRef} 
            className="w-full min-h-64" 
            data-testid="container-hebban-widget"
            style={{ display: 'block', overflow: 'visible' }}
          />
        </div>
      </div>
    </div>
  );
}
