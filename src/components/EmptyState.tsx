import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '@theme';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: '#8E8E93',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    minWidth: 200,
  },
});

