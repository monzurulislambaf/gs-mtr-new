import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout() {
  const theme = useTheme();
  const isAdmin = useAuthStore((s) => s.isAdmin);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/(tabs)' as any);
    }
  }, [isAdmin]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="pending-approvals" options={{ title: 'Pending Approvals' }} />
      <Stack.Screen name="approval/[id]" options={{ title: 'Registration Details' }} />
      <Stack.Screen name="users" options={{ title: 'User Management' }} />
    </Stack>
  );
}
