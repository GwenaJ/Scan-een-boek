import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Zoeken..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="icon-loading" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
