import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MedicationsScreen } from './screens/MedicationsScreen';
import { MedicationEditorScreen } from './screens/MedicationEditorScreen';

const Stack = createNativeStackNavigator();

export const MedicationsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="MedicationsList"
        component={MedicationsScreen}
        options={{ title: 'Medications' }}
      />
      <Stack.Screen
        name="MedicationEditor"
        component={MedicationEditorScreen}
        options={{ title: 'Medication' }}
      />
    </Stack.Navigator>
  );
};

