import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { spacing, typography } from '@theme';

interface ListRowProps {
  title: string;
  subtitle?: string;
  rightAccessory?: React.ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
  style?: ViewStyle;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  rightAccessory,
  onPress,
  showDivider = true,
  style,
}) => {
  const content = (
    <View style={[styles.row, showDivider && styles.rowWithDivider, style]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightAccessory && <View style={styles.accessory}>{rightAccessory}</View>}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  rowWithDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
  },
  accessory: {
    marginLeft: spacing.md,
  },
});

