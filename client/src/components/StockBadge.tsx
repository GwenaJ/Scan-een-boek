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
      <div className="inline-flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-semibold">
          {isInStock ? `Op voorraad in de winkel` : 'Niet op voorraad'}
        </span>
      </div>
    );
  }

  return (
    <Badge 
      variant={isInStock ? "default" : "destructive"}
      className="inline-flex items-center gap-2"
      data-testid={`badge-stock-${isInStock ? 'available' : 'unavailable'}`}
    >
      <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-white' : 'bg-white'}`} />
      <span>
        {isInStock 
          ? `Op voorraad: ${stock}${location ? ` @ ${location}` : ''}`
          : 'Niet op voorraad'
        }
      </span>
    </Badge>
  );
}
