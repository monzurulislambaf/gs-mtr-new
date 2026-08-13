import '@/utils/secureStorePolyfill';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LightTheme, DarkTheme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useSyncStore } from '@/store/syncStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useContactsStore } from '@/store/contactsStore';
import { initializeFirebase } from '@/firebase/config';
import { initializeDatabase } from '@/database';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

function useIsDark(): boolean {
  const themeSetting = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();
  if (themeSetting === 'system') return systemScheme === 'dark';
  return themeSetting === 'dark';
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const isDark = useIsDark();
  const paperTheme = isDark ? DarkTheme : LightTheme;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const segments = useSegments();
  const cleanupRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      console.log('[BOOT] App starting');

      // 1. SQLite first — local data is the source of the initial UI.
      try {
        await initializeDatabase();
        console.log('[BOOT] SQLite initialized');
      } catch (error) {
        console.error('[BOOT] SQLite initialization failed:', error);
      }

      // 2. Local settings (theme) — pure AsyncStorage, fast and offline-safe.
      try {
        await useSettingsStore.getState().loadSettings();
      } catch (error) {
        console.error('[BOOT] Settings load failed:', error);
      }

      // 3. Load local contacts into the store so the UI paints immediately.
      try {
        await useContactsStore.getState().loadContacts();
        console.log('[BOOT] Local contacts loaded');
      } catch (error) {
        console.error('[BOOT] Local contacts load failed:', error);
      }

      // 4. UI is ready. The splash ALWAYS hides here — even if steps above failed.
      if (!mounted) return;
      try {
        await SplashScreen.hideAsync();
        console.log('[SPLASH] Splash hidden');
      } catch (error) {
        console.error('[SPLASH] Splash hide failed:', error);
      }
      setAppReady(true);
      console.log('[BOOT] UI ready');

      // 5. Background services (Firebase, auth, sync). None of these may block
      //    or break the already-rendered UI.
      if (!mounted) return;
      startBackgroundServices(cleanupRef);
    }

    bootstrap();

    return () => {
      mounted = false;
      cleanupRef.current.forEach((fn) => {
        try { fn(); } catch { /* ignore */ }
      });
      cleanupRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!appReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, appReady, segments]);

  if (!appReady) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider theme={paperTheme}>
          <SafeAreaProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="contact/[id]"
                options={{ headerShown: true, title: 'Contact Details', presentation: 'card' }}
              />
              <Stack.Screen
                name="contact/add"
                options={{ headerShown: true, title: 'Add Contact', presentation: 'modal' }}
              />
              <Stack.Screen
                name="contact/edit/[id]"
                options={{ headerShown: true, title: 'Edit Contact', presentation: 'modal' }}
              />
            </Stack>
          </SafeAreaProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

/**
 * Starts all network/remote services in the background after the UI is ready.
 * Every step is isolated so a Firebase failure can never cascade into the app.
 */
function startBackgroundServices(cleanupRef: MutableRefObject<(() => void)[]>) {
  try {
    initializeFirebase();
    console.log('[BOOT] Firebase initialized');
  } catch (error) {
    console.error('[BOOT] Firebase initialization failed:', error);
  }

  try {
    const unsubscribeAuth = useAuthStore.getState().initialize();
    if (typeof unsubscribeAuth === 'function') cleanupRef.current.push(unsubscribeAuth);
  } catch (error) {
    console.error('[BOOT] Auth listener setup failed:', error);
  }

  try {
    const unsubscribeSync = useSyncStore.getState().initialize();
    if (typeof unsubscribeSync === 'function') cleanupRef.current.push(unsubscribeSync);
  } catch (error) {
    console.error('[BOOT] Sync setup failed:', error);
  }
}
