import BarcodeScanner from "@/components/BarcodeScanner";
import { useLocation } from "wouter";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import librisLogo from "@assets/Libris logo_1762932124504.png";
import blzLogo from "@assets/Blz logo_1762932137655.jpeg";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useTranslation();

  const handleBarcodeScan = (barcode: string) => {
    console.log('Barcode scanned:', barcode);
    setLocation(`/search?isbn=${barcode}`);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'nl' ? 'en' : 'nl');
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
            <h1 className="text-2xl font-bold">{t.appTitle}</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleLanguage}
            className="text-sm font-medium"
            data-testid="button-language-toggle"
          >
            {t.languageToggle}
          </Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-8">
        <div className="max-w-2xl w-full space-y-6">
          <BarcodeScanner onScan={handleBarcodeScan} />
        </div>
      </main>
    </div>
  );
}
