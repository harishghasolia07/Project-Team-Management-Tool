export function CapacityBar({ value }: { value: number }) {
  let barColor = 'bg-green-500';
  let textColor = 'text-green-600';

  if (value >= 85) {
    barColor = 'bg-red-500';
    textColor = 'text-red-600';
  } else if (value >= 60) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-600';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-600">Capacity</span>
        <span className={`font-semibold ${textColor}`}>{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`${barColor} h-full rounded-full transition-all duration-300`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
