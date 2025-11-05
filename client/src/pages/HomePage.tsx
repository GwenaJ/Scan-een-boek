import { useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";
import SearchBar from "@/components/SearchBar";
import { useLocation } from "wouter";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  const handleBarcodeScan = (barcode: string) => {
    console.log('Barcode scanned:', barcode);
    setLocation(`/scan?isbn=${barcode}`);
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      const parts = query.split(' - ');
      if (parts.length === 2) {
        setLocation(`/search?title=${encodeURIComponent(parts[0].trim())}&author=${encodeURIComponent(parts[1].trim())}`);
      } else {
        setLocation(`/search?title=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl text-primary-foreground font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold">Scan-een-Boek</h1>
          </div>
          <div className="text-sm text-muted-foreground">NL</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-8">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2 mb-8">
            <p className="text-muted-foreground">
              Scan de barcode hieronder, of zoek op titel of auteur.
            </p>
          </div>

          <BarcodeScanner onScan={handleBarcodeScan} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                of zoek hieronder
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Zoek op titel of auteur
            </label>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              placeholder="Bijvoorbeeld: The Prince - Machiavelli"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
