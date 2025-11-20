import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScanLine, Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from '@zxing/library';
import { useTranslation } from "@/contexts/LanguageContext";
import barcodeScannerImg from "@assets/Scan de barcode image_1763554608129.png";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const { t } = useTranslation();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanAttempts, setScanAttempts] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delayedStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorCountRef = useRef(0);
  const isCameraActiveRef = useRef(false);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, []);

  const cleanupCamera = () => {
    console.info('[BarcodeScanner] Cleanup camera started...');
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    if (delayedStopTimeoutRef.current) {
      clearTimeout(delayedStopTimeoutRef.current);
      delayedStopTimeoutRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    
    // Stop MediaStream tracks manually FIRST
    if (streamRef.current) {
      console.info('[BarcodeScanner] Stopping media stream tracks...');
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.debug(`[BarcodeScanner] Stopped track: ${track.label} (id: ${track.id})`);
      });
      streamRef.current = null;
    }
    
    // Clear video srcObject
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Reset code reader AFTER stopping stream
    if (codeReaderRef.current) {
      try {
        console.info('[BarcodeScanner] Resetting code reader...');
        codeReaderRef.current.reset();
      } catch (err) {
        console.warn('[BarcodeScanner] Error resetting code reader:', err);
      }
      codeReaderRef.current = null;
    }
    
    console.info('[BarcodeScanner] Cleanup camera completed');
  };

  const handleCameraClick = async () => {
    if (isCameraActive || isInitializing) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const startCamera = async () => {
    try {
      console.info('[BarcodeScanner] Starting camera initialization...');
      
      // First cleanup any existing camera
      if (isCameraActiveRef.current || isInitializingRef.current) {
        console.info('[BarcodeScanner] Cleaning up previous camera session...');
        cleanupCamera();
      }
      
      // Set initializing state FIRST to trigger video element render
      setIsInitializing(true);
      isInitializingRef.current = true;
      setCameraError(null);
      setScanStatus(t.cameraStarting);
      setScanAttempts(0);
      errorCountRef.current = 0;
      
      // Wait for next render cycle to ensure video element is in DOM
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify video element exists (after render)
      if (!videoRef.current) {
        throw new Error('Video element niet gevonden');
      }
      
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // MANUAL MediaStream acquisition with EXACT environment constraint
      // This ensures we ALWAYS request back camera, and manage the stream ourselves
      console.info('[BarcodeScanner] Requesting camera with EXACT environment constraint...');
      
      let stream: MediaStream;
      try {
        // Try EXACT environment first (forces back camera on mobile)
        console.info('[BarcodeScanner] Attempting EXACT environment facingMode...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        console.info(`[BarcodeScanner] ✓ Got EXACT environment camera: facingMode=${settings.facingMode}, device=${settings.deviceId?.substring(0, 8)}...`);
        
      } catch (exactError) {
        // Fallback 1: Try IDEAL environment (prefers back camera)
        const exactErrorMsg = exactError instanceof Error ? exactError.message : String(exactError);
        console.warn(`[BarcodeScanner] EXACT environment failed: ${exactErrorMsg}, trying IDEAL...`);
        try {
          console.info('[BarcodeScanner] Attempting IDEAL environment facingMode...');
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          const track = stream.getVideoTracks()[0];
          const settings = track.getSettings();
          console.info(`[BarcodeScanner] ✓ Got IDEAL environment camera: facingMode=${settings.facingMode}, device=${settings.deviceId?.substring(0, 8)}...`);
          
        } catch (idealError) {
          // Fallback 2: Any available camera
          const idealErrorMsg = idealError instanceof Error ? idealError.message : String(idealError);
          console.warn(`[BarcodeScanner] IDEAL environment failed: ${idealErrorMsg}, using default...`);
          try {
            console.info('[BarcodeScanner] Attempting default video constraint...');
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            });
            const track = stream.getVideoTracks()[0];
            const settings = track.getSettings();
            console.info(`[BarcodeScanner] ✓ Got default camera: facingMode=${settings.facingMode || 'unknown'}, device=${settings.deviceId?.substring(0, 8)}...`);
          } catch (defaultError) {
            // All fallbacks failed - this is a real permission/hardware issue
            const defaultErrorMsg = defaultError instanceof Error ? defaultError.message : String(defaultError);
            console.error(`[BarcodeScanner] All camera attempts failed. Last error: ${defaultErrorMsg}`);
            throw new Error(defaultErrorMsg || 'Camera toegang geweigerd');
          }
        }
      }
      
      // Abort guard: check if user stopped camera during async operation
      if (!isInitializingRef.current) {
        console.info('[BarcodeScanner] Camera initialization aborted by user');
        stream.getTracks().forEach(track => track.stop());
        codeReader.reset();
        return;
      }

      // Store stream in ref for cleanup
      streamRef.current = stream;
      
      // Attach stream to video element
      videoRef.current.srcObject = stream;
      setScanStatus(t.cameraActivating);

      // Start continuous scanning from the manual stream
      // decodeFromStream accepts a MediaStream and provides continuous callback
      // NOTE: Don't await this - it's a long-running promise that only resolves when scanning stops
      console.info('[BarcodeScanner] Starting continuous decode from manual stream...');
      
      codeReader.decodeFromStream(
        stream,
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            console.info(`[BarcodeScanner] ✓ Barcode successfully scanned: ${barcode}`);
            setScanStatus(`Barcode gevonden: ${barcode}`);
            onScan(barcode);
            stopCamera();
          } else if (error) {
            // No barcode found - this is normal during continuous scanning
            errorCountRef.current++;
            if (errorCountRef.current % 20 === 0) {
              console.debug(`[BarcodeScanner] Scan attempt ${errorCountRef.current}`);
            }
            setScanAttempts(prev => prev + 1);
          }
        }
      ).catch((err) => {
        // Handle stream decoding failures
        const errorMessage = err instanceof Error ? err.message : t.cameraInitFailed;
        console.error('[BarcodeScanner] decodeFromStream failed:', err);
        setCameraError(errorMessage);
        setScanStatus('');
        setIsCameraActive(false);
        setIsInitializing(false);
        isCameraActiveRef.current = false;
        isInitializingRef.current = false;
        cleanupCamera();
      });

      // Verify video stream is ready
      const checkVideoReady = () => {
        // Guard: only continue polling if still initializing (use ref to avoid stale closure)
        if (!isInitializingRef.current && !isCameraActiveRef.current) {
          console.info('[BarcodeScanner] Polling stopped - camera no longer initializing');
          return;
        }
        
        if (videoRef.current) {
          const readyState = videoRef.current.readyState;
          console.info(`[BarcodeScanner] Video readyState: ${readyState}`);
          
          if (readyState >= 2) { // HAVE_CURRENT_DATA or better
            console.info('[BarcodeScanner] ✓ Video stream is ready');
            setIsInitializing(false);
            isInitializingRef.current = false;
            setIsCameraActive(true);
            isCameraActiveRef.current = true;
            setScanStatus(t.searchingBarcode);
            
            // Set timeout for scanning (15 seconds)
            scanTimeoutRef.current = setTimeout(() => {
              console.warn('[BarcodeScanner] Scan timeout reached (15s)');
              setScanStatus(t.scanTimeoutMessage);
              // Schedule delayed stop (2s) and track it to prevent conflicts with manual restart
              delayedStopTimeoutRef.current = setTimeout(() => {
                stopCamera();
              }, 2000);
            }, 15000);
          } else {
            // Retry after a short delay and track the timeout
            pollingTimeoutRef.current = setTimeout(checkVideoReady, 200);
          }
        }
      };

      // Start checking video readiness
      checkVideoReady();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.cameraInitFailed;
      console.error('[BarcodeScanner] Camera initialization failed:', err);
      setCameraError(errorMessage);
      setScanStatus('');
      setIsCameraActive(false);
      setIsInitializing(false);
      isCameraActiveRef.current = false;
      isInitializingRef.current = false;
      cleanupCamera();
    }
  };

  const stopCamera = () => {
    console.info('[BarcodeScanner] Stopping camera...');
    cleanupCamera();
    setIsCameraActive(false);
    setIsInitializing(false);
    isCameraActiveRef.current = false;
    isInitializingRef.current = false;
    setCameraError(null);
    setScanStatus('');
    setScanAttempts(0);
    errorCountRef.current = 0;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-primary" />
          </div>
          {t.scannerTitle}
        </h2>
        <Button 
          variant={(isCameraActive || isInitializing) ? "destructive" : "outline"}
          size="default"
          onClick={handleCameraClick}
          data-testid="button-camera"
        >
          {(isCameraActive || isInitializing) ? (
            <>
              <X className="w-4 h-4 mr-2" />
              {t.cameraButton}
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              {t.cameraButton}
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-8 border-2 border-dashed border-primary/20">
        {(isCameraActive || isInitializing) ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <video 
              ref={videoRef} 
              className="w-full max-w-md rounded-md border-2 border-primary"
              autoPlay
              playsInline
              muted
              data-testid="video-camera"
            />
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground text-center">
                {scanStatus || 'Houd de barcode voor de camera'}
              </p>
              {scanAttempts > 0 && (
                <Badge variant="secondary" data-testid="badge-scan-attempts">
                  {scanAttempts}
                </Badge>
              )}
            </div>
          </div>
        ) : cameraError ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-destructive text-center space-y-2">
              <p className="font-semibold" data-testid="text-camera-error">{cameraError}</p>
              {cameraError.toLowerCase().includes('geweigerd') || 
               cameraError.toLowerCase().includes('denied') || 
               cameraError.toLowerCase().includes('permission') ? (
                <p className="text-sm">{t.cameraPermissionDenied}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-72 h-48 flex items-center justify-center overflow-hidden">
              <img 
                src={barcodeScannerImg} 
                alt="Barcode Scanner"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-full h-2 bg-destructive shadow-lg shadow-destructive/50"
                  style={{
                    animation: 'scannerBeam 3.5s ease-in-out infinite'
                  }}
                />
              </div>
              <style>{`
                @keyframes scannerBeam {
                  0%, 100% {
                    transform: translateY(-60px);
                    opacity: 0.6;
                  }
                  50% {
                    transform: translateY(60px);
                    opacity: 1;
                  }
                }
              `}</style>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-center text-muted-foreground">
        {t.scannerInstructions}
      </p>
    </Card>
  );
}
