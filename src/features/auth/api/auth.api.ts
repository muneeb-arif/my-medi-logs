import { apiClient } from '@services/apiClient';
import type {
  Account,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>('/auth/register', data);
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', data);
  },

  logout: async (data: LogoutRequest): Promise<void> => {
    return apiClient.post<void>('/auth/logout', data);
  },

  getCurrentAccount: async (): Promise<Account> => {
    return apiClient.get<Account>('/account/me');
  },
};

