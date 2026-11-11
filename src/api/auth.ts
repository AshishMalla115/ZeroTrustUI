import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  MfaSetupResponse,
  MfaVerifyRequest,
  MfaVerifyResponse,
  ProtectedResponse,
  HealthResponse,
} from '../types/api';

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post('/auth/login', data),

  logout: (): Promise<{ message: string }> =>
    apiClient.post('/auth/logout'),

  me: (): Promise<ProtectedResponse> =>
    apiClient.get('/auth/me'),

  mfaSetup: (): Promise<MfaSetupResponse> =>
    apiClient.post('/auth/mfa/setup'),

  mfaVerify: (data: MfaVerifyRequest): Promise<MfaVerifyResponse> =>
    apiClient.post('/auth/mfa/verify', data),

  protected: (): Promise<ProtectedResponse> =>
    apiClient.get('/protected'),

  health: (): Promise<HealthResponse> =>
    apiClient.get('/health'),
};