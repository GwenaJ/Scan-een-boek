import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StockBadge from "./StockBadge";
import { BookOpen, ExternalLink } from "lucide-react";
import type { Book } from "@shared/schema";
import { useEffect, useRef } from "react";

interface BookDetailProps {
  book: Book & { boekpaginaUrl?: string };
}

export default function BookDetail({ book }: BookDetailProps) {
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
      <Card className="p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="w-48 h-72 bg-muted rounded-md overflow-hidden shadow-lg">
            {book.coverUrl ? (
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="w-full text-center space-y-2">
            <div className="text-4xl font-bold text-primary" data-testid="text-price">
              €{Number(book.price).toFixed(2)}
            </div>
            
            <h1 className="text-2xl font-bold" data-testid="text-title">{book.title}</h1>
            <p className="text-xl text-muted-foreground" data-testid="text-author">{book.author}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
          {book.format && (
            <div>
              <div className="text-muted-foreground">Formaat</div>
              <div className="font-semibold">{book.format}</div>
            </div>
          )}
          {book.language && (
            <div>
              <div className="text-muted-foreground">Taal</div>
              <div className="font-semibold">{book.language}</div>
            </div>
          )}
          {book.publisher && (
            <div>
              <div className="text-muted-foreground">Uitgever</div>
              <div className="font-semibold">{book.publisher}</div>
            </div>
          )}
          <div>
            <div className="text-muted-foreground">ISBN</div>
            <div className="font-semibold">{book.isbn}</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="text-sm font-semibold mb-2">Beschikbaarheid</div>
          <StockBadge stock={book.stock} location={book.location} />
        </div>
        
        {book.boekpaginaUrl && (
          <Button 
            variant="default" 
            className="w-full mt-6"
            asChild
            data-testid="button-view-webshop"
          >
            <a href={book.boekpaginaUrl} target="_blank" rel="noopener noreferrer">
              Bekijk op webshop
              <ExternalLink className="ml-2 w-4 h-4" />
            </a>
          </Button>
        )}
      </Card>
      
      <div ref={hebbanRef} className="min-h-32" data-testid="container-hebban-widget" />
    </div>
  );
}
