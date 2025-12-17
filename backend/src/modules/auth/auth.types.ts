export interface Account {
  id: string;
  email: string;
  name: string;
  settings?: {
    language?: string;
    timezone?: string;
    notificationPreferences?: {
      appointments?: boolean;
      medications?: boolean;
      reports?: boolean;
      security?: boolean;
    };
  };
  createdAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

