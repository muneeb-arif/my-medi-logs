import { HomeScreen } from '@features/home/screens/HomeScreen';
import { ProfilesNavigator } from '@features/profiles/ProfilesNavigator';
import { ReportsNavigator } from '@features/reports/ReportsNavigator';
import { SettingsScreen } from '@features/settings/screens/SettingsScreen';
import { VitalsNavigator } from '@features/vitals/VitalsNavigator';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';

const Tab = createBottomTabNavigator();

export const MainTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profiles"
        component={ProfilesNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Vitals"
        component={VitalsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="pulse" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

