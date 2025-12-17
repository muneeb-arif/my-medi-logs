import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VitalsScreen } from './screens/VitalsScreen';
import { AddVitalScreen } from './screens/AddVitalScreen';

const Stack = createNativeStackNavigator();

export const VitalsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="VitalsList"
        component={VitalsScreen}
        options={{ title: 'Vitals' }}
      />
      <Stack.Screen
        name="AddVital"
        component={AddVitalScreen}
        options={{ title: 'Add Vital' }}
      />
    </Stack.Navigator>
  );
};

