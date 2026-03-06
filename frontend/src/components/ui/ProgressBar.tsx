interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  className?: string;
}

export default function ProgressBar({ value, color = "bg-brand-600", className = "" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
