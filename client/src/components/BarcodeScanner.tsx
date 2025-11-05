import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onScan(inputValue.trim());
      setInputValue('');
    }
  };

  const handleCameraClick = () => {
    console.log('Camera scan requested - will be implemented with real hardware');
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-primary" />
          </div>
          Scan de barcode onder dit scher 
        </h2>
        <Button 
          variant="outline" 
          size="default"
          onClick={handleCameraClick}
          data-testid="button-camera"
        >
          <Camera className="w-4 h-4 mr-2" />
          Camera
        </Button>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-8 border-2 border-dashed border-primary/20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-48 h-32 border-4 border-primary/40 rounded-md relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-md" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-md" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-md" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-md" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-1 bg-primary/60 animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Idle
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="sr-only"
        placeholder="Scan barcode..."
        data-testid="input-barcode-scanner"
        autoFocus
      />
      
      <p className="text-xs text-center text-muted-foreground">
        Houd de barcode van het boek (op de achterkant) voor de scanner die zich onder dit scherm bevindt
      </p>
    </Card>
  );
}
