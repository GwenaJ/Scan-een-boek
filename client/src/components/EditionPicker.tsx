import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, BookOpen } from "lucide-react";
import type { Book } from "./BookCard";

interface EditionPickerProps {
  editions: Book[];
  onSelect: (book: Book) => void;
}

export default function EditionPicker({ editions, onSelect }: EditionPickerProps) {
  const sortedEditions = [...editions].sort((a, b) => {
    if (a.stock > 0 && b.stock === 0) return -1;
    if (a.stock === 0 && b.stock > 0) return 1;
    return 0;
  });

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold px-4">Meerdere edities gevonden</h2>
      <p className="text-sm text-muted-foreground px-4">Selecteer de gewenste editie:</p>
      
      <div className="space-y-2">
        {sortedEditions.map((edition, index) => (
          <Card 
            key={edition.isbn}
            className="flex items-center gap-3 p-3 hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => onSelect(edition)}
            data-testid={`card-edition-${edition.isbn}`}
          >
            <div className="w-16 h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
              {edition.coverUrl ? (
                <img 
                  src={edition.coverUrl} 
                  alt={edition.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight">
                {edition.title} — {edition.format || 'Unknown'} ({edition.language || 'N/A'})
              </h3>
              <p className="text-sm text-muted-foreground">{edition.author}</p>
              
              <div className="flex gap-2 mt-2 flex-wrap">
                {edition.stock > 0 && (
                  <Badge variant="default" className="text-xs">
                    Op voorraad in de winkel
                  </Badge>
                )}
                {index === 0 && editions.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    Meest relevant
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-lg font-bold" data-testid={`text-price-${edition.isbn}`}>
                €{edition.price.toFixed(2)}
              </div>
              <Button 
                size="icon" 
                variant="ghost"
                className="flex-shrink-0"
                data-testid={`button-choose-${edition.isbn}`}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
