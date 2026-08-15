import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

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

export const STATUS_COLORS: Record<string, string> = {
  pending: '#FF9800',
  approved: '#4CAF50',
  declined: '#F44336',
  suspended: '#9E9E9E',
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontWeight: '600',
    textTransform: 'capitalize',
    letterSpacing: 0.4,
  },
});
