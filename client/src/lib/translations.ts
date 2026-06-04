export const translations = {
  nl: {
    // HomePage
    appTitle: "Barcode scanner",
    scanInstructions: "Scan de barcode, of zoek op titel en/of auteur.",
    searchLabel: "Of zoek op titel en/of auteur",
    searchPlaceholder: "Bijvoorbeeld: On the Road - Jack Kerouac",
    
    // BarcodeScanner
    scannerTitle: "Scan de barcode",
    cameraButton: "Camera",
    scannerInstructions: "Scan de barcode met de scanner of houd de barcode voor de camera op je mobiel",
    barcodeInputPlaceholder: "Of typ ISBN hier en druk Enter...",
    cameraStarting: "Camera wordt gestart...",
    cameraActivating: "Camera wordt geactiveerd...",
    searchingBarcode: "Zoeken naar barcode...",
    cameraPermissionDenied: "Camera toegang geweigerd. Sta camera toegang toe om de barcode scanner te gebruiken.",
    noCamera: "Geen camera gevonden op dit apparaat",
    cameraInitFailed: "Camera initialisatie mislukt",
    scanTimeoutMessage: "Geen barcode gevonden. Probeer opnieuw of typ het ISBN handmatig in.",
    tapToScan: "Tik hier om camera te gebruiken",
    
    // SearchResultsPage
    resultsCount: (count: number) => `${count} ${count === 1 ? 'resultaat' : 'resultaten'} gevonden`,
    bookNotFoundTitle: "Boek niet gevonden",
    bookNotFoundMessage: (isbn: string) => `Het boek met ISBN/barcode ${isbn} is niet gevonden in onze database.`,
    noResultsTitle: "Geen resultaten",
    noResultsMessage: "We konden geen boeken vinden voor uw zoekopdracht.",
    newSearchButton: "Nieuwe zoekopdracht",
    backButton: "Terug",
    errorTitle: "Fout bij ophalen",
    errorMessage: "Er is een fout opgetreden bij het ophalen van de gegevens. Probeer het opnieuw.",
    
    // BookDetail
    viewWebshop: "Bekijk in de webshop",
    viewDetailPage: "Ga naar de detailpagina op de website",
    availability: "Beschikbaarheid",
    format: "Formaat",
    language: "Taal",
    publisher: "Uitgever",
    isbn: "ISBN",
    price: "Prijs",
    
    // StockBadge
    inStock: "Op voorraad",
    limitedStock: "Beperkt op voorraad",
    outOfStock: "Niet op voorraad",
    location: "Locatie",
    stockAvailable: (n: number) => `Nog ${n} beschikbaar`,
    recensiesTitle: "RECENSIES",
    
    // LoadingState
    searching: "Zoeken...",
    
    // BookCard
    selectButton: "Selecteer",
    released: "Verschenen",
    
    // Language toggle
    languageToggle: "ENG",
  },
  en: {
    // HomePage
    appTitle: "Barcode scanner",
    scanInstructions: "Scan the barcode, or search by title and/or author.",
    searchLabel: "Or search by title and/or author",
    searchPlaceholder: "Example: On the Road - Jack Kerouac",
    
    // BarcodeScanner
    scannerTitle: "Scan the barcode",
    cameraButton: "Camera",
    scannerInstructions: "Scan the barcode with the scanner or hold the barcode in front of your mobile camera",
    barcodeInputPlaceholder: "Or type ISBN here and press Enter...",
    cameraStarting: "Camera is starting...",
    cameraActivating: "Camera is activating...",
    searchingBarcode: "Searching for barcode...",
    cameraPermissionDenied: "Camera access denied. Please allow camera access to use the barcode scanner.",
    noCamera: "No camera found on this device",
    cameraInitFailed: "Camera initialization failed",
    scanTimeoutMessage: "No barcode found. Please try again or enter the ISBN manually.",
    tapToScan: "Tap here to use camera",
    
    // SearchResultsPage
    resultsCount: (count: number) => `${count} ${count === 1 ? 'result' : 'results'} found`,
    bookNotFoundTitle: "Book not found",
    bookNotFoundMessage: (isbn: string) => `The book with ISBN/barcode ${isbn} was not found in our database.`,
    noResultsTitle: "No results",
    noResultsMessage: "We couldn't find any books for your search query.",
    newSearchButton: "New search",
    backButton: "Back",
    errorTitle: "Error loading",
    errorMessage: "An error occurred while loading the data. Please try again.",
    
    // BookDetail
    viewWebshop: "View in webshop",
    viewDetailPage: "Go to the detail page on the website",
    availability: "Availability",
    format: "Format",
    language: "Language",
    publisher: "Publisher",
    isbn: "ISBN",
    price: "Price",
    
    // StockBadge
    inStock: "In stock",
    limitedStock: "Limited stock",
    outOfStock: "Out of stock",
    location: "Location",
    stockAvailable: (n: number) => `Only ${n} available`,
    recensiesTitle: "REVIEWS",
    
    // LoadingState
    searching: "Searching...",
    
    // BookCard
    selectButton: "Select",
    released: "Released",
    
    // Language toggle
    languageToggle: "NL",
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.nl;
