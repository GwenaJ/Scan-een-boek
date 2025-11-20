import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StockBadge from "./StockBadge";
import { BookOpen, ExternalLink } from "lucide-react";
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
      <Card className="p-8">
        {/* Landscape iPad layout: Cover left, Info right */}
        <div className="flex flex-row gap-8">
          {/* Left side: Book cover */}
          <div className="flex-shrink-0">
            <div className="w-64 h-96 bg-muted rounded-md overflow-hidden shadow-lg">
              {book.coverUrl ? (
                <img 
                  src={book.coverUrl} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          
          {/* Right side: Book information */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Title, Author, Price */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold leading-tight" data-testid="text-title">
                {book.title}
              </h1>
              <p className="text-xl text-muted-foreground" data-testid="text-author">
                {book.author}
              </p>
              <div className="text-5xl font-bold text-primary" data-testid="text-price">
                €{Number(book.price).toFixed(2)}
              </div>
            </div>
            
            {/* Book details grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {book.format && (
                <div>
                  <div className="text-sm text-muted-foreground">{t.format}</div>
                  <div className="text-base font-semibold">{book.format}</div>
                </div>
              )}
              {book.language && (
                <div>
                  <div className="text-sm text-muted-foreground">{t.language}</div>
                  <div className="text-base font-semibold">{book.language}</div>
                </div>
              )}
              {book.publisher && (
                <div>
                  <div className="text-sm text-muted-foreground">{t.publisher}</div>
                  <div className="text-base font-semibold">{book.publisher}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">{t.isbn}</div>
                <div className="text-base font-semibold">{book.isbn}</div>
              </div>
            </div>
            
            {/* Availability section */}
            <div className="mt-auto space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-semibold mb-2">{t.availability}</div>
                <StockBadge stock={book.storeStock} location={book.storeLocation ?? undefined} />
              </div>
              
              {/* Webshop button */}
              {book.boekpaginaUrl && (
                <Button 
                  variant="default" 
                  size="lg"
                  className="w-full"
                  asChild
                  data-testid="button-view-webshop"
                >
                  <a href={book.boekpaginaUrl} target="_blank" rel="noopener noreferrer">
                    {t.viewWebshop}
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      <div ref={hebbanRef} className="min-h-32" data-testid="container-hebban-widget" />
    </div>
  );
}
