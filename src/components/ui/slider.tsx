import { cn } from '../../lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
  color?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className,
  color = '#3B82F6',
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span
            className="rounded-md px-2 py-0.5 text-sm font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {value}
          </span>
        </div>
      )}
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #E5E7EB ${pct}%, #E5E7EB 100%)`,
          }}
        />
      </div>
    </div>
  );
}
