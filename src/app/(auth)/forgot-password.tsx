import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { resetPassword } from '@/firebase/auth';
import { AuthHeader } from '@/components/auth/AuthHeader';

function friendlyError(e: any): string {
  const code: string = e?.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many reset requests. Please try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return e?.message?.replace(/^Firebase: Error \(([^)]+)\)\.\s*/, '') ||
        'Password reset failed. Please try again.';
  }
}

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!identifier.trim()) {
      setError('Please enter your email or BD Number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(identifier);
      setSent(true);
    } catch (e: any) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <AuthHeader
            compact
            showBack
            icon="key"
            title="Forgot Password"
            subtitle="Reset your password"
          />

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                shadowColor: theme.dark ? '#000000' : '#0B7F74',
              },
            ]}
          >
            <Text variant="bodyMedium" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
              Enter your registered email address or BD Number. We will send you a password
              reset link by email. Check your email inbox or spam folder.
            </Text>

            <TextInput
              label="Email or BD Number"
              value={identifier}
              onChangeText={(t) => { setIdentifier(t); setError(''); setSent(false); }}
              mode="outlined"
              placeholder="e.g. john@example.com or 10498"
              autoCapitalize="none"
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />

            {error ? <HelperText type="error" visible={true}>{error}</HelperText> : null}

            {sent ? (
              <HelperText type="info" visible={true}>
                Password reset email sent. Check your email inbox or spam folder and follow
                the link to reset your password.
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleReset}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Send Reset Link
            </Button>

            <Button
              mode="text"
              onPress={() => router.back()}
              style={styles.backButton}
              labelStyle={styles.backLabel}
            >
              Back to Sign In
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingBottom: 40 },
  card: {
    marginTop: -24,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 22,
    elevation: 6,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  hint: { marginBottom: 16, lineHeight: 20 },
  input: {
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 14,
  },
  button: {
    borderRadius: 28,
    marginTop: 12,
    height: 52,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 16,
    letterSpacing: 1.2,
  },
  backButton: { marginTop: 8 },
  backLabel: {
    fontFamily: 'Oswald_500Medium',
    letterSpacing: 0.8,
  },
});
