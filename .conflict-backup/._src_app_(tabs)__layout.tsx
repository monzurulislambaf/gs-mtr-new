import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
<<<<<<< HEAD

export default function TabLayout() {
  const theme = useTheme();
=======
import { useSyncStore } from '@/store/syncStore';

export default function TabLayout() {
  const theme = useTheme();
  const isOnline = useSyncStore((s) => s.isOnline);
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
<<<<<<< HEAD
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
