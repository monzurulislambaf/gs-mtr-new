import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

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
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 16,
  },
});
