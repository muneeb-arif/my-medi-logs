import { NavigationContainer } from '@react-navigation/native';
import { useSessionStore } from '@store/session.store';
import React from 'react';
import { AuthNavigator } from './AuthNavigator';
import { MainTabsNavigator } from './MainTabsNavigator';

export const RootNavigator: React.FC = () => {
  const { accessToken, isHydrated } = useSessionStore();
  const isAuthenticated = !!accessToken;

  if (!isHydrated) {
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabsNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

