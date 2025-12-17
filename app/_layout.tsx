import { AppProviders } from '@app/AppProviders';
import { RootNavigator } from '@navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
      <StatusBar style="auto" />
    </AppProviders>
  );
}
