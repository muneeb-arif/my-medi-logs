import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, radius, shadows } from '@theme';

interface SectionCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SectionCard: React.FC<SectionCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
});

