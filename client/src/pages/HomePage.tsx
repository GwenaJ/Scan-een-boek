import { useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";
import SearchBar from "@/components/SearchBar";
import { useLocation } from "wouter";
import librisLogo from "@assets/Libris logo_1762932124504.png";
import blzLogo from "@assets/Blz logo_1762932137655.jpeg";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  const handleBarcodeScan = (barcode: string) => {
    console.log('Barcode scanned:', barcode);
    setLocation(`/search?isbn=${barcode}`);
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src={librisLogo} alt="Libris" className="h-10 w-auto" />
              <img src={blzLogo} alt="BLZ" className="h-10 w-auto" />
            </div>
            <h1 className="text-2xl font-bold">Scan-een-Boek</h1>
          </div>
          <div className="text-sm text-muted-foreground">ENG</div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-8">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2 mb-8">
            <p className="text-muted-foreground">
              Scan de barcode, of zoek op titel en/of auteur.
            </p>
          </div>

          <BarcodeScanner onScan={handleBarcodeScan} />

          <div>
            <label className="block text-sm font-medium mb-2">
              Of zoek op titel en/of auteur
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
