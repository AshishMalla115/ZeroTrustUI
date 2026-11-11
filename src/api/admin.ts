import apiClient from './client';
import type {
  AdminSessionsResponse,
  AdminUsersResponse,
  AdminAuditLogResponse,
  OverrideResponse,
  AdminRiskEventsResponse,
  ThresholdConfig,
  AdminAlertsResponse,
  AdminDevicesResponse,
  AdminModelVersionsResponse,
  UserProfile,
  AdminStatsResponse,
} from '../types/api';

export const adminApi = {
  sessions: (params?: {
    user_id?: string;
    decision?: string;
    min_score?: number;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminSessionsResponse> =>
    apiClient.get('/admin/sessions', params),

  users: (params?: {
    q?: string;
    role?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AdminUsersResponse> =>
    apiClient.get('/admin/users', params),

  auditLog: (params?: {
    admin_id?: string;
    action?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminAuditLogResponse> =>
    apiClient.get('/admin/audit-log', params),

  overrideSession: (sessionId: string): Promise<OverrideResponse> =>
    apiClient.post(`/admin/sessions/${sessionId}/override`),

  deactivateUser: (userId: string): Promise<{ message: string }> =>
    apiClient.post(`/admin/users/${userId}/deactivate`),

  forceMfa: (userId: string): Promise<{ message: string }> =>
    apiClient.post(`/admin/users/${userId}/force-mfa`),

  resetMfa: (userId: string): Promise<{ message: string }> =>
    apiClient.post(`/admin/users/${userId}/reset-mfa`),

  riskEvents: (params?: {
    user_id?: string;
    session_id?: string;
    decision?: string;
    min_score?: number;
    max_score?: number;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminRiskEventsResponse> =>
    apiClient.get('/admin/risk-events', params),

  getThreshold: (): Promise<{ current: ThresholdConfig; pending: ThresholdConfig | null }> =>
    apiClient.get('/admin/threshold'),

  updateThreshold: (data: ThresholdConfig): Promise<ThresholdConfig> =>
    apiClient.post('/admin/threshold', data),

  alerts: (params?: {
    severity?: string;
    status?: string;
    user_id?: string;
    session_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminAlertsResponse> =>
    apiClient.get('/admin/alerts', params),

  acknowledgeAlert: (alertId: string): Promise<{ message: string }> =>
    apiClient.post(`/admin/alerts/${alertId}/acknowledge`),

  devices: (userId: string): Promise<AdminDevicesResponse> =>
    apiClient.get(`/admin/devices/${userId}`),

  modelVersions: (): Promise<AdminModelVersionsResponse> =>
    apiClient.get('/admin/model-versions'),

  userProfile: (userId: string): Promise<UserProfile> =>
    apiClient.get(`/admin/users/${userId}/profile`),

  stats: (hours?: number): Promise<AdminStatsResponse> =>
    apiClient.get('/admin/stats', { hours }),

  reloadModel: (modelPath?: string): Promise<{ message: string }> =>
    apiClient.post('/admin/model/reload', null, { params: { model_path: modelPath } }),
};