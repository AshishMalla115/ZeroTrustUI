import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot, children, ...props }, ref) => {
    const variants = {
      default: 'bg-blue-100 text-blue-800 border-blue-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      danger: 'bg-red-100 text-red-800 border-red-200',
      info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full border',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-blue-500': variant === 'default',
          'bg-green-500': variant === 'success',
          'bg-yellow-500': variant === 'warning',
          'bg-red-500': variant === 'danger',
          'bg-cyan-500': variant === 'info',
          'bg-gray-500': variant === 'gray',
        })} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';