import type { Account, Tokens } from '@features/auth/types';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  account: Account | null;
  isHydrated: boolean;
  setTokens: (tokens: Tokens) => Promise<void>;
  setAccount: (account: Account) => void;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const useSessionStore = create<SessionState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  account: null,
  isHydrated: false,

  setTokens: async (tokens: Tokens) => {
    await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  },

  setAccount: (account: Account) => {
    set({ account });
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    set({
      accessToken: null,
      refreshToken: null,
      account: null,
    });
  },

  hydrate: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
      set({
        accessToken,
        refreshToken,
        isHydrated: true,
      });
    } catch (error) {
      // If secure storage fails, clear state
      set({
        accessToken: null,
        refreshToken: null,
        account: null,
        isHydrated: true,
      });
    }
  },
}));

