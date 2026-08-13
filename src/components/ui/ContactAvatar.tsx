import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { getInitials, getAvatarColor } from '@/utils/formatters';

interface ContactAvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function ContactAvatar({ name, size = 56, color }: ContactAvatarProps) {
  const initials = getInitials(name);
  const bgColor = color || getAvatarColor(name);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: size * 0.4 },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
