import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  stock: number;
  location?: string;
  variant?: "default" | "compact";
}

export default function StockBadge({ stock, location, variant = "default" }: StockBadgeProps) {
  const isInStock = stock > 0;

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-semibold">
            {isInStock ? 'Op voorraad in de winkel' : 'Niet op voorraad'}
          </span>
        </div>
        {isInStock && location && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Bevindt zich:</span> {location}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <Badge 
        variant={isInStock ? "default" : "destructive"}
        className="inline-flex items-center gap-2"
        data-testid={`badge-stock-${isInStock ? 'available' : 'unavailable'}`}
      >
        <div className={`w-2 h-2 rounded-full bg-white`} />
        <span>
          {isInStock ? 'Op voorraad in de winkel' : 'Niet op voorraad'}
        </span>
      </Badge>
      {isInStock && location && (
        <div className="p-3 bg-muted/50 rounded-md border border-border">
          <div className="text-sm">
            <span className="font-medium text-foreground">Bevindt zich:</span>{' '}
            <span className="text-muted-foreground">{location}</span>
          </div>
        </div>
      )}
    </div>
  );
}
