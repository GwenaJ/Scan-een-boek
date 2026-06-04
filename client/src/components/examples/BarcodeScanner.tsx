import BarcodeScanner from '../BarcodeScanner';

export default function BarcodeScannerExample() {
  return (
    <div className="max-w-md p-4">
      <BarcodeScanner onScan={(barcode) => console.log('Scanned:', barcode)} />
    </div>
  );
}
