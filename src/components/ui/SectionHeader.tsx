import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { spacing } from '@/theme';

interface SectionHeaderProps {
  title: string;
  count?: number;
}

export const SectionHeader = memo(function SectionHeader({ title, count }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
        {title}
      </Text>
      {count !== undefined && (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {count}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingTop: spacing.lg,
  },
});
