import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { spacing } from '@theme';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: keyof typeof spacing | 'none';
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  padding = 'md',
}) => {
  const paddingValue = padding === 'none' ? 0 : spacing[padding as keyof typeof spacing];

  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, padding !== 'none' && { padding: paddingValue }]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, padding !== 'none' && { padding: paddingValue }]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});

