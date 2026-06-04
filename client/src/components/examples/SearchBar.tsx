import SearchBar from '../SearchBar';
import { useState } from 'react';

export default function SearchBarExample() {
  const [value, setValue] = useState('');

  return (
    <div className="max-w-md p-4">
      <SearchBar
        value={value}
        onChange={setValue}
        onSubmit={(val) => console.log('Search submitted:', val)}
      />
    </div>
  );
}
