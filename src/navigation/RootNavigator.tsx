import { NavigationContainer } from '@react-navigation/native';
import { useSessionStore } from '@store/session.store';
import React from 'react';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';

export const RootNavigator: React.FC = () => {
  const { accessToken, isHydrated } = useSessionStore();
  const isAuthenticated = !!accessToken;

  if (!isHydrated) {
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

