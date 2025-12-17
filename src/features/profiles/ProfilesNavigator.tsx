import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfilesScreen } from './screens/ProfilesScreen';
import { ProfileDetailScreen } from './screens/ProfileDetailScreen';
import { ProfileEditorScreen } from './screens/ProfileEditorScreen';

const Stack = createNativeStackNavigator();

export const ProfilesNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="ProfilesList"
        component={ProfilesScreen}
        options={{ title: 'Profiles' }}
      />
      <Stack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{ title: 'Profile Details' }}
      />
      <Stack.Screen
        name="ProfileEditor"
        component={ProfileEditorScreen}
        options={{ title: 'Edit Profile' }}
      />
    </Stack.Navigator>
  );
};

