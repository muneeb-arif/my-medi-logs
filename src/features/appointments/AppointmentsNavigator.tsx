import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { AppointmentEditorScreen } from './screens/AppointmentEditorScreen';

const Stack = createNativeStackNavigator();

export const AppointmentsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="AppointmentsList"
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Stack.Screen
        name="AppointmentEditor"
        component={AppointmentEditorScreen}
        options={{ title: 'Appointment' }}
      />
    </Stack.Navigator>
  );
};

