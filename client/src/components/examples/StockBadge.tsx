import StockBadge from '../StockBadge';

export default function StockBadgeExample() {
  return (
    <div className="space-y-4 p-4">
      <StockBadge stock={3} location="Fictie - Engelstalig" />
      <StockBadge stock={0} />
      <StockBadge stock={5} location="Non-fictie" variant="compact" />
    </div>
  );
}
