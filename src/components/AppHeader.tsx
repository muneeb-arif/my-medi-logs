import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { spacing, typography } from '@theme';

interface AppHeaderProps {
  title: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, rightAction }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {rightAction && (
        <TouchableOpacity onPress={rightAction.onPress}>
          <Text style={styles.rightAction}>{rightAction.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    ...typography.h2,
  },
  rightAction: {
    ...typography.bodyBold,
    color: '#007AFF',
  },
});

