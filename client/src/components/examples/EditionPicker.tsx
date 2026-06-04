import EditionPicker from '../EditionPicker';

export default function EditionPickerExample() {
  const editions = [
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
      coverUrl: 'https://images.mind-books.nl/libris/book/cover/9780141188621'
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
      location: 'Fictie - Engelstalig'
    },
    {
      isbn: '9780141188623',
      title: 'The Fountainhead',
      author: 'Ayn Rand',
      price: 7.99,
      format: 'E-book',
      language: 'ENG',
      publisher: 'Penguin Classics',
      stock: 1,
      location: 'Online kopen'
    }
  ];

  return (
    <div className="max-w-md p-4">
      <EditionPicker 
        editions={editions} 
        onSelect={(book) => console.log('Selected edition:', book.isbn)}
      />
    </div>
  );
}
