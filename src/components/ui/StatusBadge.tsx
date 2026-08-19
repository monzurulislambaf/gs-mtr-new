import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { spacing, radius, typography } from '@/theme';

interface StatusBadgeProps {
  label: string;
  color?: string;
  dot?: boolean;
}

/** Small pill badge with an optional colored dot, used for status/role chips. */
export function StatusBadge({ label, color, dot = true }: StatusBadgeProps) {
  const theme = useTheme();
  const c = color || theme.colors.onSurfaceVariant;
  return (
    <View style={[styles.badge, { backgroundColor: `${c}1A`, borderColor: `${c}55` }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: c }]} /> : null}
      <Text variant="labelSmall" style={[styles.label, { color: c }]}>
        {label}
      </Text>
    </View>
  );
}

import { colors } from '@/theme';

export const STATUS_COLORS: Record<string, string> = {
  pending: colors.pending,
  approved: colors.approved,
  declined: colors.declined,
  suspended: colors.suspended,
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.sm + radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + spacing.xxs,
    paddingVertical: spacing.xxs,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    ...typography.micro,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
