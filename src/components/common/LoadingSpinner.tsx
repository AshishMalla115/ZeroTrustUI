import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', className, label }, ref) => {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4',
    };

    return (
      <div ref={ref} className={clsx('flex flex-col items-center gap-2', className)}>
        <div
          className={clsx(
            'rounded-full border-blue-600 border-t-transparent animate-spin',
            sizes[size]
          )}
          role="status"
          aria-label="Loading"
        />
        {label && <span className="text-sm text-gray-500">{label}</span>}
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';