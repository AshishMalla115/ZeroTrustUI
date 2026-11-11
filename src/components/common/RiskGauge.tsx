import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface RiskGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
  showValue?: boolean;
  strokeWidth?: number;
  className?: string;
}

const getRiskLevel = (score: number): { label: string; color: string; bgColor: string } => {
  if (score >= 0.75) return { label: 'CRITICAL', color: 'text-red-600', bgColor: 'bg-red-100' };
  if (score >= 0.5) return { label: 'HIGH', color: 'text-orange-600', bgColor: 'bg-orange-100' };
  if (score >= 0.25) return { label: 'MEDIUM', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  return { label: 'LOW', color: 'text-green-600', bgColor: 'bg-green-100' };
};

const getStrokeColor = (score: number): string => {
  if (score >= 0.75) return '#ef4444';
  if (score >= 0.5) return '#f97316';
  if (score >= 0.25) return '#eab308';
  return '#22c55e';
};

export const RiskGauge = forwardRef<HTMLDivElement, RiskGaugeProps>(
  ({ score, size = 120, showLabel = true, showValue = true, strokeWidth = 8, className }, ref) => {
    const clampedScore = Math.max(0, Math.min(1, score));
    const circumference = 2 * Math.PI * (size / 2 - strokeWidth);
    const offset = circumference * (1 - clampedScore);
    const { label, color, bgColor } = getRiskLevel(clampedScore);
    const strokeColor = getStrokeColor(clampedScore);

    return (
      <div ref={ref} className={clsx('flex flex-col items-center gap-3', className)}>
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - strokeWidth}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - strokeWidth}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 4px ${strokeColor}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {showValue && (
              <span className="font-bold text-2xl text-gray-900">
                {(clampedScore * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        {showLabel && (
          <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', color, bgColor)}>
            {label}
          </span>
        )}
      </div>
    );
  }
);

RiskGauge.displayName = 'RiskGauge';