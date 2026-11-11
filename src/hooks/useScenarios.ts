import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { adminApi } from '../api/admin';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { RequestResponse, FailedAuthAttempt, ValidationTestCase } from '../types/scenarios';

export const useScenario1 = () => {
  const { login } = useAuthStore();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: async (): Promise<RequestResponse> => {
      const startTime = Date.now();
      const request = {
        method: 'POST',
        url: '/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: { email: 'test@zerotrust.com', password: 'password123' },
      };

      try {
        const response = await authApi.login(request.body as { email: string; password: string });
        return {
          request,
          response: {
            status: 200,
            headers: {},
            body: response,
            duration: Date.now() - startTime,
          },
          isLoading: false,
          error: null,
        };
      } catch (error: unknown) {
        const err = error as Error & { response?: { status: number; data: unknown } };
        return {
          request,
          response: {
            status: err.response?.status || 0,
            headers: {},
            body: err.response?.data || { message: err.message },
            duration: Date.now() - startTime,
          },
          isLoading: false,
          error: err.message,
        };
      }
    },
    onSuccess: (data) => {
      if (data.response?.status === 200) {
        const loginData = data.response.body as { access_token: string; user: { email: string; role: string } };
        login(loginData.access_token, loginData.user as { id: string; email: string; role: 'user' | 'admin'; is_active: boolean; mfa_enabled: boolean; created_at: string }, false);
        addNotification({ type: 'success', message: 'Login successful! Token saved for Scenarios 3 & 4' });
      }
    },
  });
};

export const useScenario2 = () => {
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: async (): Promise<FailedAuthAttempt[]> => {
      const attempts: FailedAuthAttempt[] = [];

      for (let i = 1; i <= 3; i++) {
        const request = {
          email: 'test@zerotrust.com',
          password: 'wrongpassword',
        };

        try {
          await authApi.login(request);
          attempts.push({
            attempt: i,
            request,
            response: { status: 200, body: { message: 'Unexpected success' } },
          });
        } catch (error: unknown) {
          const err = error as Error & { response?: { status: number; data: unknown } };
          attempts.push({
            attempt: i,
            request,
            response: {
              status: err.response?.status || 0,
              body: err.response?.data || { message: err.message },
            },
          });
        }

        if (i < 3) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      return attempts;
    },
    onSuccess: (attempts) => {
      const allFailed = attempts.every((a) => a.response.status === 401);
      if (allFailed) {
        addNotification({ type: 'success', message: 'All 3 attempts failed with 401 as expected' });
      }
    },
  });
};

export const useScenario3 = () => {
  const { token } = useAuthStore();

  const callEndpoint = async (endpoint: string): Promise<RequestResponse> => {
    const startTime = Date.now();
    const request = {
      method: 'GET',
      url: endpoint,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: null,
    };

    try {
      let response: unknown;
      if (endpoint === '/protected') {
        response = await authApi.protected();
      } else if (endpoint === '/admin/sessions') {
        response = await adminApi.sessions({ limit: 10 });
      } else if (endpoint === '/health') {
        response = await authApi.health();
      } else {
        throw new Error('Unknown endpoint');
      }

      return {
        request,
        response: {
          status: 200,
          headers: {},
          body: response,
          duration: Date.now() - startTime,
        },
        isLoading: false,
        error: null,
      };
    } catch (error: unknown) {
      const err = error as Error & { response?: { status: number; data: unknown } };
      return {
        request,
        response: {
          status: err.response?.status || 0,
          headers: {},
          body: err.response?.data || { message: err.message },
          duration: Date.now() - startTime,
        },
        isLoading: false,
        error: err.message,
      };
    }
  };

  return { callEndpoint };
};

export const useScenario4 = () => {
  const { token, logout } = useAuthStore();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  const doLogout = useMutation({
    mutationFn: async (): Promise<RequestResponse> => {
      const startTime = Date.now();
      const request = {
        method: 'POST',
        url: '/auth/logout',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: {},
      };

      try {
        await authApi.logout();
        return {
          request,
          response: {
            status: 200,
            headers: {},
            body: { message: 'Successfully logged out' },
            duration: Date.now() - startTime,
          },
          isLoading: false,
          error: null,
        };
      } catch (error: unknown) {
        const err = error as Error & { response?: { status: number; data: unknown } };
        return {
          request,
          response: {
            status: err.response?.status || 0,
            headers: {},
            body: err.response?.data || { message: err.message },
            duration: Date.now() - startTime,
          },
          isLoading: false,
          error: err.message,
        };
      }
    },
    onSuccess: (data) => {
      if (data.response?.status === 200) {
        logout();
        queryClient.clear();
        addNotification({ type: 'success', message: 'Logged out successfully. Token is now blacklisted.' });
      }
    },
  });

  const reuseToken = useMutation({
    mutationFn: async (): Promise<RequestResponse> => {
      const startTime = Date.now();
      const request = {
        method: 'GET',
        url: '/protected',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: null,
      };

      try {
        await authApi.protected();
        return {
          request,
          response: {
            status: 200,
            headers: {},
            body: { message: 'Unexpected success' },
            duration: Date.now() - startTime,
          },
          isLoading: false,
          error: null,
        };
      } catch (error: unknown) {
        const err = error as Error & { response?: { status: number; data: unknown } };
        return {
          request,
          response: {
            status: err.response?.status || 0,
            headers: {},
            body: err.response?.data || { message: err.message },
            duration: Date.now() - startTime,
          },
          isLoading: false,
          error: err.message,
        };
      }
    },
    onSuccess: (data) => {
      if (data.response?.status === 401) {
        addNotification({ type: 'success', message: 'Token correctly rejected (401) - blacklist working!' });
      }
    },
  });

  return { doLogout, reuseToken };
};

export const useScenario5 = () => {
  return {
    sessions: adminApi.sessions,
    users: adminApi.users,
    auditLog: adminApi.auditLog,
    overrideSession: adminApi.overrideSession,
    deactivateUser: adminApi.deactivateUser,
    forceMfa: adminApi.forceMfa,
    resetMfa: adminApi.resetMfa,
    riskEvents: adminApi.riskEvents,
    getThreshold: adminApi.getThreshold,
    updateThreshold: adminApi.updateThreshold,
    alerts: adminApi.alerts,
    acknowledgeAlert: adminApi.acknowledgeAlert,
    devices: adminApi.devices,
    modelVersions: adminApi.modelVersions,
    userProfile: adminApi.userProfile,
    stats: adminApi.stats,
    reloadModel: adminApi.reloadModel,
  };
};

export const useScenario6 = () => {
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: async (testCases: ValidationTestCase[]): Promise<ValidationTestCase[]> => {
      const results = await Promise.all(
        testCases.map(async (tc) => {
          try {
            await authApi.login(tc.payload as { email: string; password: string });
            return {
              ...tc,
              result: { status: 200, body: { message: 'Unexpected success' } },
              isRunning: false,
            };
          } catch (error: unknown) {
            const err = error as Error & { response?: { status: number; data: unknown } };
            return {
              ...tc,
              result: {
                status: err.response?.status || 0,
                body: err.response?.data || { message: err.message },
              },
              isRunning: false,
            };
          }
        })
      );
      return results;
    },
    onSuccess: (results) => {
      const allValidated = results.every((r) => r.result?.status === 422);
      if (allValidated) {
        addNotification({ type: 'success', message: 'All 3 validation cases correctly returned 422' });
      }
    },
  });
};