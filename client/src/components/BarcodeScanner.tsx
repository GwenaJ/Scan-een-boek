import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [inputValue, setInputValue] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onScan(inputValue.trim());
      setInputValue('');
    }
  };

  const handleCameraClick = async () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        setCameraError('Geen camera gevonden');
        return;
      }

      const selectedDeviceId = videoInputDevices[0].deviceId;

      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            console.log('Barcode gescand:', barcode);
            onScan(barcode);
            stopCamera();
          }
        }
      );

      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera fout:', err);
      setCameraError('Kan camera niet starten. Geef toestemming voor camera toegang.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-primary" />
          </div>
          Scan de barcode onder dit scherm 
        </h2>
        <Button 
          variant={isCameraActive ? "destructive" : "outline"}
          size="default"
          onClick={handleCameraClick}
          data-testid="button-camera"
        >
          {isCameraActive ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-8 border-2 border-dashed border-primary/20">
        {isCameraActive ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <video 
              ref={videoRef} 
              className="w-full max-w-md rounded-md border-2 border-primary"
              data-testid="video-camera"
            />
            <p className="text-sm text-muted-foreground text-center">
              Houd de barcode voor de camera
            </p>
          </div>
        ) : cameraError ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-destructive text-center">
              <p className="font-semibold">{cameraError}</p>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 border rounded-md text-center font-mono text-lg"
        placeholder="Of typ ISBN hier en druk Enter..."
        data-testid="input-barcode-scanner"
        autoFocus
      />
      
      <p className="text-xs text-center text-muted-foreground">
        Houd de barcode van het boek (op de achterkant) voor de scanner die zich onder dit scherm bevindt
      </p>
    </Card>
  );
}
