import { useState } from "react";
import { useLocation } from "wouter";
import BookCard from "@/components/BookCard";
import EditionPicker from "@/components/EditionPicker";
import BookDetail from "@/components/BookDetail";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import SearchBar from "@/components/SearchBar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchResultsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // TODO: remove mock functionality
  const [isLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  
  // Mock data for demonstration
  const mockResults = [
    {
      isbn: '9780141395876',
      title: 'The Prince',
      author: 'Niccolo Machiavelli',
      price: 9.95,
      format: 'Paperback',
      language: 'ENG',
      publisher: 'Penguin Classics',
      stock: 2,
      location: 'Fictie - Engelstalig',
      coverUrl: 'https://images.mind-books.nl/libris/book/cover/9780141395876',
      boekpaginaUrl: 'https://libris.nl/zoek?q=9780141395876',
      releaseDate: '2014-03-27'
    },
    {
      isbn: '9780141188621',
      title: 'The Fountainhead',
      author: 'Ayn Rand',
      price: 9.95,
      format: 'Paperback',
      language: 'ENG',
      publisher: 'Penguin Classics',
      stock: 2,
      location: 'Fictie - Engelstalig',
      coverUrl: 'https://images.mind-books.nl/libris/book/cover/9780141188621',
      releaseDate: '2007-03-29'
    },
    {
      isbn: '9780099272779',
      title: 'Amsterdam',
      author: 'Ian McEwan',
      price: 5.00,
      format: 'Paperback',
      language: 'ENG',
      publisher: 'Vintage',
      stock: 0,
      location: 'Fictie - Engelstalig',
      coverUrl: 'https://images.mind-books.nl/libris/book/cover/9780099272779',
      releaseDate: '1999-02-04'
    }
  ];

  // Mock multiple editions
  const mockEditions = [
    {
      isbn: '9780141188621',
      title: 'The Fountainhead',
      author: 'Ayn Rand',
      price: 9.95,
      format: 'Paperback',
      language: 'ENG',
      publisher: 'Penguin Classics',
      stock: 2,
      location: 'Fictie - Engelstalig',
      coverUrl: 'https://images.mind-books.nl/libris/book/cover/9780141188621',
      releaseDate: '2007-03-29'
    },
    {
      isbn: '9780141188622',
      title: 'The Fountainhead',
      author: 'Ayn Rand',
      price: 15.99,
      format: 'Hardcover',
      language: 'ENG',
      publisher: 'Penguin Classics',
      stock: 0,
      location: 'Fictie - Engelstalig',
      releaseDate: '2005-10-15'
    }
  ];

  const [viewMode, setViewMode] = useState<'list' | 'editions' | 'detail'>('list');

  const handleSearchSubmit = (query: string) => {
    console.log('Search submitted:', query);
  };

  const handleBookClick = (book: any) => {
    setSelectedBook(book);
    setViewMode('detail');
  };

  const handleBack = () => {
    if (viewMode === 'detail') {
      setViewMode('list');
      setSelectedBook(null);
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b sticky top-0 bg-background z-10">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold flex-1">Scan-een-Boek</h1>
          </div>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
          />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <LoadingState />
          ) : viewMode === 'detail' && selectedBook ? (
            <BookDetail book={selectedBook} />
          ) : viewMode === 'editions' ? (
            <EditionPicker 
              editions={mockEditions}
              onSelect={handleBookClick}
            />
          ) : mockResults.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">{mockResults.length} resultaten gevonden</h2>
              {mockResults.map((book) => (
                <BookCard 
                  key={book.isbn} 
                  book={book}
                  onClick={() => handleBookClick(book)}
                />
              ))}
            </div>
          ) : (
            <ErrorState
              title="Geen resultaten"
              message="We konden geen boeken vinden voor uw zoekopdracht."
              action={{
                label: 'Nieuwe zoekopdracht',
                onClick: () => setLocation('/')
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
