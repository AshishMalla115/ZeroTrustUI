import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import type { Scenario } from '../../types/scenarios';

interface ScenarioCardProps {
  scenario: Scenario;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const ScenarioCard = forwardRef<HTMLDivElement, ScenarioCardProps>(
  ({ scenario, onClick, disabled, className, ...props }, ref) => {
    const statusColors = {
      pending: 'gray',
      running: 'info',
      completed: 'success',
      failed: 'danger',
    } as const;

    return (
      <Card
        ref={ref}
        variant="outlined"
        padding="md"
        className={clsx('cursor-pointer transition-all hover:shadow-md hover:border-blue-300', disabled && 'opacity-50 cursor-not-allowed', className)}
        onClick={onClick}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                {scenario.id}
              </span>
              <h3 className="font-semibold text-gray-900 text-lg">{scenario.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">{scenario.shortDescription}</p>
            <div className="flex items-center gap-2">
              <Badge variant={statusColors[scenario.status]} size="sm" dot>
                {scenario.status.charAt(0).toUpperCase() + scenario.status.slice(1)}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" disabled={disabled}>
            Run Demo
          </Button>
        </div>
      </Card>
    );
  }
);

ScenarioCard.displayName = 'ScenarioCard';