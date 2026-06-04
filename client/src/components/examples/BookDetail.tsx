import BookDetail from '../BookDetail';

export default function BookDetailExample() {
  const sampleBook = {
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
    boekpaginaUrl: 'https://libris.nl/zoek?q=9780141395876'
  };

  return (
    <div className="max-w-md p-4">
      <BookDetail book={sampleBook} />
    </div>
  );
}
