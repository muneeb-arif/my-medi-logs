import { authApi } from '@features/auth/api/auth.api';
import { useSessionStore } from '@store/session.store';
import { useActiveProfileStore } from '@store/activeProfile.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Placeholder - theme implementation will be added later
  return <>{children}</>;
};

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const { hydrate, accessToken, refreshToken, setAccount, setTokens, clearSession } = useSessionStore();
  const { hydrate: hydrateActiveProfile } = useActiveProfileStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      await hydrate();
      await hydrateActiveProfile();

      const currentAccessToken = useSessionStore.getState().accessToken;
      const currentRefreshToken = useSessionStore.getState().refreshToken;

      if (currentAccessToken && currentRefreshToken) {
        try {
          const account = await authApi.getCurrentAccount();
          setAccount(account);
        } catch (error) {
          const apiError = error as { status?: number };
          if (apiError.status === 401 && currentRefreshToken) {
            try {
              const newTokens = await authApi.refreshToken({ refreshToken: currentRefreshToken });
              await setTokens(newTokens);
              const account = await authApi.getCurrentAccount();
              setAccount(account);
            } catch {
              await clearSession();
            }
          } else {
            await clearSession();
          }
        }
      }

      setIsInitializing(false);
    };

    initializeSession();
  }, [hydrate, setAccount, setTokens, clearSession]);

  if (isInitializing) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
};
