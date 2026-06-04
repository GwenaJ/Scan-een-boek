import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/LanguageContext";

interface StockBadgeProps {
  stock: number;
  location?: string;
  variant?: "default" | "compact";
}

export default function StockBadge({ stock, location, variant = "default" }: StockBadgeProps) {
  const { t } = useTranslation();
  const isInStock = stock > 0;

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-semibold">
            {isInStock ? t.inStock : t.outOfStock}
          </span>
        </div>
        {isInStock && location && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{t.location}:</span> {location}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <Badge 
        variant={isInStock ? "default" : "destructive"}
        className={`inline-flex items-center gap-2 ${isInStock ? 'bg-green-600 hover:bg-green-700 border-green-700' : ''}`}
        data-testid={`badge-stock-${isInStock ? 'available' : 'unavailable'}`}
      >
        <div className={`w-2 h-2 rounded-full bg-white`} />
        <span>
          {isInStock ? `${t.inStock}: ${stock}` : t.outOfStock}
        </span>
      </Badge>
      {isInStock && location && (
        <div className="p-3 bg-muted/50 rounded-md border border-border">
          <div className="text-sm">
            <span className="font-medium text-foreground">{t.location}:</span>{' '}
            <span className="text-muted-foreground">{location}</span>
          </div>
        </div>
      )}
    </div>
  );
}
