import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Checkbox,
  useTheme,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME } from '@/utils/constants';
import { AuthHeader } from '@/components/auth/AuthHeader';

const REMEMBER_KEY = 'gs_mtr_remember_me';

export default function LoginScreen() {
  const theme = useTheme();
  const login = useAuthStore((s) => s.login);
  const [bdNumber, setBdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(REMEMBER_KEY)
      .then((v) => {
        if (v !== null) setRememberMe(v === 'true');
      })
      .catch(() => {});
  }, []);

  function toggleRemember(value: boolean) {
    setRememberMe(value);
    AsyncStorage.setItem(REMEMBER_KEY, String(value)).catch(() => {});
  }

  async function handleLogin() {
    if (!bdNumber.trim() || !password.trim()) {
      setError('Please enter your BD Number and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(bdNumber.trim(), password, rememberMe);
      // Routing (tabs vs. account status) is handled by the root layout guard.
    } catch (e: any) {
      setError(e.message || 'Sign in failed. Please check your credentials.');
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
          <AuthHeader title={APP_NAME} subtitle="Office Contact Directory" />

          <View              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  shadowColor: theme.dark ? '#000000' : '#0B7F74',
                },
              ]}
          >
            <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Sign In
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
              Sign in with your BD Number to access the directory
            </Text>

            <TextInput
              label="BD Number"
              value={bdNumber}
              onChangeText={(t) => { setBdNumber(t); setError(''); }}
              mode="outlined"
              keyboardType="number-pad"
              autoCapitalize="none"
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              mode="outlined"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword((v) => !v)}
                />
              }
            />

            <View style={styles.rememberRow}>
              <Pressable style={styles.rememberPress} onPress={() => toggleRemember(!rememberMe)}>
                <Checkbox
                  status={rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => toggleRemember(!rememberMe)}
                  color={theme.colors.primary}
                />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Remember me
                </Text>
              </Pressable>
              <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)}>
                <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                  Forgot Password?
                </Text>
              </Pressable>
            </View>

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
              style={styles.signInButton}
              contentStyle={styles.signInContent}
              labelStyle={styles.buttonLabel}
            >
              Sign In
            </Button>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginHorizontal: 12 }}>
                New to {APP_NAME}?
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
            </View>

            <Button
              mode="outlined"
              onPress={() => router.push('/(auth)/register' as any)}
              style={styles.registerButton}
              contentStyle={styles.registerContent}
              labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
            >
              Request Registration
            </Button>
          </View>

          <Text variant="bodySmall" style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
            {APP_NAME} · Office Contact Directory
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  card: {
    marginTop: -26,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 22,
    elevation: 6,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  cardTitle: {
    fontFamily: 'Oswald_600SemiBold',
    letterSpacing: 1,
  },
  input: {
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 14,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rememberPress: { flexDirection: 'row', alignItems: 'center' },
  signInButton: {
    borderRadius: 28,
    marginTop: 10,
    height: 52,
  },
  signInContent: {
    height: 52,
  },
  buttonLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 16,
    letterSpacing: 1.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  registerButton: {
    borderRadius: 28,
    height: 50,
  },
  registerContent: {
    height: 50,
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.5,
  },
});
