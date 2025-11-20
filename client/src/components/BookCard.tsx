import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StockBadge from "./StockBadge";
import { BookOpen } from "lucide-react";
import type { Book } from "@shared/schema";
import { useTranslation } from "@/contexts/LanguageContext";

interface BookCardProps {
  book: Book & {
    boekpaginaUrl?: string;
  };
  onClick?: () => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  const { t } = useTranslation();
  
  return (
    <Card 
      className="flex gap-3 p-3 sm:gap-4 sm:p-4"
      data-testid={`card-book-${book.isbn}`}
    >
      <div className="w-20 sm:w-32 flex-shrink-0 bg-muted rounded-md overflow-hidden self-stretch">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={book.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-6 sm:w-8 h-6 sm:h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg leading-tight" data-testid="text-title">
              {book.title}
            </h3>
          </div>
          <Button 
            onClick={onClick}
            variant="outline"
            size="sm"
            className="flex-shrink-0 text-xs px-3"
            data-testid="button-select-book"
          >
            {t.selectButton}
          </Button>
        </div>
        
        <p className="text-sm sm:text-base text-muted-foreground" data-testid="text-author">
          {book.author}
        </p>
        
        <div className="flex items-baseline justify-between gap-2 flex-wrap mt-1">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {book.format && <span>{book.format}</span>}
            {book.format && book.language && <span> • </span>}
            {book.language && <span>{book.language}</span>}
          </div>
          <div className="text-lg sm:text-xl font-bold" data-testid="text-price">
            €{parseFloat(book.price).toFixed(2)}
          </div>
        </div>
        
        <div className="text-xs sm:text-sm text-muted-foreground">
          {book.releaseDate && <div>{t.released}: {book.releaseDate}</div>}
          {book.publisher && <div>{book.publisher}</div>}
        </div>
        
        <div className="mt-2">
          <StockBadge stock={book.storeStock} location={book.storeLocation ?? undefined} />
        </div>
      </div>
    </Card>
  );
}
