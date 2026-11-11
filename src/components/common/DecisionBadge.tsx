import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ShieldCheck, ShieldAlert, ShieldOff, UserCheck, Lock } from 'lucide-react';

interface DecisionBadgeProps {
  decision: 'allow' | 'restrict' | 'mfa' | 'block' | 'logged_out';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const decisionConfig = {
  allow: {
    label: 'Allow',
    icon: ShieldCheck,
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    iconColor: 'text-green-600',
  },
  restrict: {
    label: 'Restrict',
    icon: ShieldAlert,
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    iconColor: 'text-orange-600',
  },
  mfa: {
    label: 'MFA Required',
    icon: UserCheck,
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
  block: {
    label: 'Blocked',
    icon: ShieldOff,
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    iconColor: 'text-red-600',
  },
  logged_out: {
    label: 'Logged Out',
    icon: Lock,
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    iconColor: 'text-gray-600',
  },
};

const sizeConfig = {
  sm: { px: 'px-2', py: 'py-0.5', text: 'text-xs', icon: 'w-3 h-3', gap: 'gap-1' },
  md: { px: 'px-3', py: 'py-1', text: 'text-sm', icon: 'w-4 h-4', gap: 'gap-1.5' },
  lg: { px: 'px-4', py: 'py-1.5', text: 'text-base', icon: 'w-5 h-5', gap: 'gap-2' },
};

export const DecisionBadge = forwardRef<HTMLSpanElement, DecisionBadgeProps>(
  ({ decision, size = 'md', showIcon = true, className }, ref) => {
    const config = decisionConfig[decision];
    const sizes = sizeConfig[size];
    const Icon = config.icon;

    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center font-medium rounded-full border',
          config.bg,
          config.text,
          config.border,
          sizes.px,
          sizes.py,
          sizes.text,
          sizes.gap,
          className
        )}
      >
        {showIcon && <Icon className={clsx(config.iconColor, sizes.icon)} />}
        <span>{config.label}</span>
      </span>
    );
  }
);

DecisionBadge.displayName = 'DecisionBadge';