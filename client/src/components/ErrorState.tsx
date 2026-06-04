import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Search } from "lucide-react";

interface ErrorStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function ErrorState({ title, message, action }: ErrorStateProps) {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold" data-testid="text-error-title">{title}</h2>
          <p className="text-muted-foreground" data-testid="text-error-message">{message}</p>
        </div>
        
        {action && (
          <Button 
            onClick={action.onClick}
            className="mt-4"
            data-testid="button-error-action"
          >
            <Search className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
}
