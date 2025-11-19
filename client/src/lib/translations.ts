export const translations = {
  nl: {
    // HomePage
    appTitle: "Scan-een-Boek",
    scanInstructions: "Scan de barcode, of zoek op titel en/of auteur.",
    searchLabel: "Of zoek op titel en/of auteur",
    searchPlaceholder: "Bijvoorbeeld: On the Road - Jack Kerouac",
    
    // BarcodeScanner
    scannerTitle: "Scan de barcode onder dit scherm",
    cameraButton: "Camera",
    scannerInstructions: "Houd de barcode van het boek (op de achterkant) voor de scanner die zich onder dit scherm bevindt",
    barcodeInputPlaceholder: "Of typ ISBN hier en druk Enter...",
    cameraStarting: "Camera wordt gestart...",
    cameraActivating: "Camera wordt geactiveerd...",
    searchingBarcode: "Zoeken naar barcode...",
    cameraPermissionDenied: "Camera toegang geweigerd. Sta camera toegang toe om de barcode scanner te gebruiken.",
    noCamera: "Geen camera gevonden op dit apparaat",
    cameraInitFailed: "Camera initialisatie mislukt",
    scanTimeoutMessage: "Geen barcode gevonden. Probeer opnieuw of typ het ISBN handmatig in.",
    
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
    appTitle: "Scan-a-Book",
    scanInstructions: "Scan the barcode, or search by title and/or author.",
    searchLabel: "Or search by title and/or author",
    searchPlaceholder: "Example: On the Road - Jack Kerouac",
    
    // BarcodeScanner
    scannerTitle: "Scan the barcode below this screen",
    cameraButton: "Camera",
    scannerInstructions: "Hold the book's barcode (on the back) in front of the scanner located below this screen",
    barcodeInputPlaceholder: "Or type ISBN here and press Enter...",
    cameraStarting: "Camera is starting...",
    cameraActivating: "Camera is activating...",
    searchingBarcode: "Searching for barcode...",
    cameraPermissionDenied: "Camera access denied. Please allow camera access to use the barcode scanner.",
    noCamera: "No camera found on this device",
    cameraInitFailed: "Camera initialization failed",
    scanTimeoutMessage: "No barcode found. Please try again or enter the ISBN manually.",
    
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
