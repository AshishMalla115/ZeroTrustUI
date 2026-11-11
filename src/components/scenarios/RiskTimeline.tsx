import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';
import { clsx } from 'clsx';
import type { RiskTimelineEvent } from '../../types/scenarios';

interface RiskTimelineProps {
  events: RiskTimelineEvent[];
  height?: number;
  className?: string;
}

const decisionColors = {
  allow: '#22c55e',
  restrict: '#f97316',
  mfa: '#3b82f6',
  block: '#ef4444',
  logged_out: '#9ca3af',
} as const;

export const RiskTimeline = ({ events, height = 300, className }: RiskTimelineProps) => {
  if (events.length === 0) {
    return (
      <div className={clsx('flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200', className)}>
        <div className="text-center text-gray-500">
          <p>No risk events yet</p>
          <p className="text-sm mt-1">Make API calls to see risk scores</p>
        </div>
      </div>
    );
  }

  const chartData = events.map((event, index) => ({
    ...event,
    index,
    time: new Date(event.timestamp).toLocaleTimeString(),
    scorePercent: Math.round(event.score * 100),
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: typeof chartData[0] }>; label?: string }) => {
    if (!active || !payload || !payload[0]) return null;

    const event = payload[0].payload;
    const color = decisionColors[event.decision];

    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700 min-w-[200px]">
        <div className="font-mono text-xs text-gray-400 mb-2">{label}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-400">Endpoint: </span><span className="font-mono">{event.endpoint}</span></div>
          <div><span className="text-gray-400">Score: </span><span className="font-bold" style={{ color }}>{(event.score * 100).toFixed(1)}%</span></div>
          <div><span className="text-gray-400">Decision: </span><span className="capitalize">{event.decision.replace('_', ' ')}</span></div>
          <div><span className="text-gray-400">Risk Level: </span><span className="uppercase">{event.riskLevel}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('w-full', className)}>
      <div className="h-64" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
              min={0}
              max={1}
            />
            <ReferenceLine y={0.4} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: 'MFA Threshold (0.4)', position: 'right', fill: '#3b82f6', fontSize: 10 }} />
            <ReferenceLine y={0.75} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Block Threshold (0.75)', position: 'right', fill: '#ef4444', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            {chartData.map((event, index) => (
              <Dot
                key={index}
                cx={event.index}
                cy={event.score}
                r={5}
                fill={decisionColors[event.decision]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {['allow', 'restrict', 'mfa', 'block', 'logged_out'].map((decision) => (
          <span key={decision} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: decisionColors[decision as keyof typeof decisionColors] }} />
            {decision.charAt(0).toUpperCase() + decision.slice(1).replace('_', ' ')}
          </span>
        ))}
      </div>
    </div>
  );
};