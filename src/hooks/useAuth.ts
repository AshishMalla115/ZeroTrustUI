import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { LoginRequest } from '../types/api';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      const isAdmin = data.user.role === 'admin';
      login(data.access_token, data.user, isAdmin);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      addNotification({
        type: 'success',
        message: `Logged in as ${data.user.email} (${data.user.role})`,
      });
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      const message = error.response?.data?.detail || error.message || 'Login failed';
      addNotification({ type: 'error', message });
    },
  });
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  const { login, setAdminToken } = useAuthStore();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      if (data.user.role !== 'admin') {
        addNotification({ type: 'error', message: 'Admin access required' });
        return;
      }
      login(data.access_token, data.user, true);
      setAdminToken(data.access_token);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      addNotification({ type: 'success', message: `Admin logged in: ${data.user.email}` });
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      const message = error.response?.data?.detail || error.message || 'Admin login failed';
      addNotification({ type: 'error', message });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      addNotification({ type: 'success', message: 'Logged out successfully' });
    },
    onError: (error: Error) => {
      addNotification({ type: 'error', message: error.message });
    },
  });
};

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.me(),
    enabled: isAuthenticated,
    retry: false,
  });
};

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => authApi.health(),
    refetchInterval: 30000,
    retry: 3,
  });
};