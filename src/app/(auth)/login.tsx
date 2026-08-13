import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME } from '@/utils/constants';

export default function LoginScreen() {
  const theme = useTheme();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)' as any);
    } catch (e: any) {
      setError(e.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text variant="displaySmall" style={[styles.appName, { color: theme.colors.primary }]}>
              {APP_NAME}
            </Text>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Office Contact Directory
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              mode="outlined"
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />

            {error ? (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>

            <Button
              mode="text"
              onPress={() => router.replace('/(tabs)' as any)}
              style={styles.skipButton}
            >
              Continue as Guest
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  appName: { fontWeight: '700', marginBottom: 8 },
  form: { gap: 16 },
  input: { borderRadius: 12 },
  button: { borderRadius: 24, marginTop: 8 },
  buttonContent: { paddingVertical: 6 },
  skipButton: { marginTop: 4 },
});
