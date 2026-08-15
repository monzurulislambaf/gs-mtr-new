import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { createAppTheme, useAppFonts, useIsDark } from '@/constants/theme';

export default function AuthLayout() {
  const isDark = useIsDark();
  const { loaded: fontsLoaded } = useAppFonts();
  const paperTheme = createAppTheme(isDark, fontsLoaded);

  return (
    <PaperProvider theme={paperTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="account-status" />
      </Stack>
    </PaperProvider>
  );
}
