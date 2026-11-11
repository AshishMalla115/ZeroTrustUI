export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  risk_score: number;
  decision: Decision;
  mfa_required: boolean;
  mfa_enrolled: boolean;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface MfaSetupResponse {
  secret: string;
  qr_code: string;
}

export interface MfaVerifyRequest {
  code: string;
}

export interface MfaVerifyResponse {
  verified: boolean;
  access_token?: string;
  risk_score?: number;
  decision?: Decision;
}

export interface ProtectedResponse {
  message: string;
  user: User;
  risk_score: number;
  decision: Decision;
}

export type Decision = 'allow' | 'restrict' | 'mfa' | 'block' | 'logged_out';

export interface Session {
  session_id: string;
  user_id: string;
  user_email: string;
  risk_score: number;
  decision: Decision;
  device_hash: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_activity: string;
  is_revoked: boolean;
}

export interface AdminSessionsResponse {
  sessions: Session[];
  total: number;
}

export interface AdminUsersResponse {
  users: User[];
  total: number;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface AdminAuditLogResponse {
  logs: AuditLogEntry[];
  total: number;
}

export interface OverrideRequest {
  session_id: string;
}

export interface OverrideResponse {
  success: boolean;
  message: string;
  previous_risk_score: number;
  new_risk_score: number;
}

export interface RiskEvent {
  id: string;
  user_id: string;
  session_id: string;
  event_type: string;
  risk_score: number;
  decision: Decision;
  details: Record<string, unknown>;
  timestamp: string;
  hmac: string;
}

export interface AdminRiskEventsResponse {
  events: RiskEvent[];
  total: number;
}

export interface ThresholdConfig {
  mfa_threshold: number;
  block_threshold: number;
}

export interface Alert {
  alert_id: string;
  user_id: string;
  session_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'open' | 'acknowledged' | 'resolved';
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export interface AdminAlertsResponse {
  alerts: Alert[];
  total: number;
}

export interface Device {
  device_id: string;
  device_hash: string;
  name: string;
  platform: string;
  browser: string;
  is_trusted: boolean;
  last_seen: string;
  created_at: string;
}

export interface AdminDevicesResponse {
  devices: Device[];
}

export interface ModelVersion {
  version: string;
  path: string;
  loaded_at: string;
  is_active: boolean;
  metrics?: Record<string, number>;
}

export interface AdminModelVersionsResponse {
  versions: ModelVersion[];
}

export interface UserProfile {
  user_id: string;
  profile_blob_size: number;
  profile_version: number;
  last_updated: string;
  event_count: number;
}

export interface AdminStatsResponse {
  total_users: number;
  active_sessions: number;
  total_risk_events: number;
  alerts_open: number;
  avg_risk_score: number;
  decisions: Record<Decision, number>;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ErrorResponse {
  detail: string | ValidationError[];
}

export interface WebSocketRiskUpdate {
  type: 'risk_update';
  user_id: string;
  session_id: string;
  path: string;
  score: number;
  decision: Decision;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface WebSocketAlert {
  type: 'alert';
  data: Alert;
}

export interface WebSocketConnected {
  type: 'connected';
  message: string;
}

export type WebSocketMessage = WebSocketRiskUpdate | WebSocketAlert | WebSocketConnected;