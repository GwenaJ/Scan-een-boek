import ErrorState from '../ErrorState';

export default function ErrorStateExample() {
  return (
    <div className="max-w-md p-4 space-y-4">
      <ErrorState
        title="Niet gevonden"
        message="Deze barcode is niet gevonden in onze database."
        action={{
          label: 'Zoek handmatig',
          onClick: () => console.log('Manual search clicked')
        }}
      />
    </div>
  );
}
