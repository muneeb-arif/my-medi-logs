import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AddReportScreen } from './screens/AddReportScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { ReportViewerScreen } from './screens/ReportViewerScreen';

const Stack = createNativeStackNavigator();

export const ReportsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="ReportsList"
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <Stack.Screen
        name="AddReport"
        component={AddReportScreen}
        options={{ title: 'Add Report' }}
      />
      <Stack.Screen
        name="ReportViewer"
        component={ReportViewerScreen}
        options={{ title: 'Report' }}
      />
    </Stack.Navigator>
  );
};

