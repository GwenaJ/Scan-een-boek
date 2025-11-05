import BookCard from '../BookCard';

export default function BookCardExample() {
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
    coverUrl: 'https://images.mind-books.nl/libris/book/cover/9780141395876'
  };

  return (
    <div className="max-w-md p-4">
      <BookCard book={sampleBook} onClick={() => console.log('Book clicked')} />
    </div>
  );
}
