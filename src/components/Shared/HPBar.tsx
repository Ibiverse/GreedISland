interface HPBarProps {
  current: number;
  max: number;
  size?: 'sm' | 'md' | 'lg';
  showNumbers?: boolean;
}

export default function HPBar({ current, max, size = 'md', showNumbers = true }: HPBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500';
  const heights = { sm: 'h-1.5', md: 'h-3', lg: 'h-4' };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${color} ${heights[size]} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showNumbers && (
        <div className="text-center text-xs text-gray-300 mt-0.5">
          {current} / {max}
        </div>
      )}
    </div>
  );
}
