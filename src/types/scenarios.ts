import type { Session, User, AuditLogEntry } from './api';

export interface Scenario {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  path: string;
  icon: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface RequestResponse {
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: unknown;
  };
  response: {
    status: number;
    headers: Record<string, string>;
    body: unknown;
    duration: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export interface RiskTimelineEvent {
  timestamp: string;
  endpoint: string;
  score: number;
  decision: 'allow' | 'restrict' | 'mfa' | 'block' | 'logged_out';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface FailedAuthAttempt {
  attempt: number;
  request: {
    email: string;
    password: string;
  };
  response: {
    status: number;
    body: unknown;
  };
}

export interface ValidationTestCase {
  id: number;
  name: string;
  description: string;
  payload: Record<string, string>;
  expectedStatus: number;
  result?: {
    status: number;
    body: unknown;
  };
  isRunning: boolean;
}

export interface AdminSessionRow extends Session {
  actions: React.ReactNode;
}

export interface AdminUserRow extends User {
  actions: React.ReactNode;
}

export interface AdminAuditLogRow extends AuditLogEntry {
  formattedDetails: string;
}