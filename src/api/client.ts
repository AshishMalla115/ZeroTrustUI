import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const { token, adminToken } = useAuthStore.getState();
        const isAdminRoute = config.url?.startsWith('/admin');
        const tokenToUse = isAdminRoute ? adminToken : token;

        if (tokenToUse && config.headers) {
          config.headers.Authorization = `Bearer ${tokenToUse}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          const { logout, clearAdminToken } = useAuthStore.getState();
          const isAdminRoute = error.config?.url?.startsWith('/admin');

          if (isAdminRoute) {
            clearAdminToken();
          } else {
            logout();
          }

          if (typeof window !== 'undefined') {
            window.location.href = '/scenario/1';
          }
        }
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private normalizeError(error: AxiosError): Error & { response?: AxiosError['response']; status?: number } {
    const normalized = new Error(error.message) as Error & { response?: AxiosError['response']; status?: number };
    normalized.response = error.response;
    normalized.status = error.response?.status;
    return normalized;
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;