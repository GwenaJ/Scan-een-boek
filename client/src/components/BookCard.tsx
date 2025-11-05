import { Card } from "@/components/ui/card";
import StockBadge from "./StockBadge";
import { BookOpen } from "lucide-react";

export interface Book {
  isbn: string;
  title: string;
  author: string;
  price: number;
  format?: string;
  language?: string;
  publisher?: string;
  stock: number;
  location?: string;
  coverUrl?: string;
}

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  return (
    <Card 
      className="flex gap-4 p-4 hover-elevate active-elevate-2 cursor-pointer"
      onClick={onClick}
      data-testid={`card-book-${book.isbn}`}
    >
      <div className="w-24 h-36 flex-shrink-0 bg-muted rounded-md overflow-hidden">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div>
          <h3 className="font-bold text-lg leading-tight" data-testid="text-title">
            {book.title}
          </h3>
          <p className="text-base text-muted-foreground" data-testid="text-author">
            {book.author}
          </p>
        </div>
        
        <div className="flex items-baseline justify-between gap-2 flex-wrap mt-1">
          <div className="text-sm text-muted-foreground">
            {book.format && <span>{book.format}</span>}
            {book.format && book.language && <span> • </span>}
            {book.language && <span>{book.language}</span>}
          </div>
          <div className="text-xl font-bold" data-testid="text-price">
            €{book.price.toFixed(2)}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <div>ISBN: {book.isbn}</div>
          {book.publisher && <div>{book.publisher}</div>}
        </div>
        
        <div className="mt-2">
          <StockBadge stock={book.stock} location={book.location} />
        </div>
      </div>
    </Card>
  );
}
