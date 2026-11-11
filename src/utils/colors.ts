export const riskColors = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
} as const;

export const decisionColors = {
  allow: '#22c55e',
  restrict: '#f97316',
  mfa: '#3b82f6',
  block: '#ef4444',
  logged_out: '#9ca3af',
} as const;

export const severityColors = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
} as const;

export const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score >= 0.75) return 'critical';
  if (score >= 0.5) return 'high';
  if (score >= 0.25) return 'medium';
  return 'low';
};

export const getRiskColor = (score: number): string => {
  const level = getRiskLevel(score);
  return riskColors[level];
};

export const getDecisionColor = (decision: keyof typeof decisionColors): string => {
  return decisionColors[decision];
};

export const getSeverityColor = (severity: keyof typeof severityColors): string => {
  return severityColors[severity];
};

export const statusColors = {
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  info: '#3b82f6',
  gray: '#9ca3af',
} as const;