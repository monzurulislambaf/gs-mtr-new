import { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Checkbox,
  SegmentedButtons,
  useTheme,
  Dialog,
  Portal,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { requestRegistration } from '@/firebase/auth';
import { validateRegistration, ValidationError } from '@/utils/validation';
import { getFriendlyErrorMessage } from '@/utils/errors';
import { DateField } from '@/components/ui/DateField';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { KeyboardAwareScreen, useKeyboardAwareForm } from '@/components/ui/KeyboardAwareScreen';
import { CATEGORY_LABELS, UserCategory } from '@/types/auth';

interface FormState {
  fullName: string;
  category: UserCategory;
  bdNumber: string;
  retired: boolean;
  rank: string;
  branch: string;
  course: string;
  commissionDate: string;
  designation: string;
  office: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  category: 'Officer',
  bdNumber: '',
  retired: false,
  rank: '',
  branch: '',
  course: '',
  commissionDate: '',
  designation: '',
  office: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
};

function SectionTitle({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <View style={styles.sectionRow}>
      <View style={[styles.sectionBar, { backgroundColor: theme.colors.primary }]} />
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        {title.toUpperCase()}
      </Text>
    </View>
  );
}

export default function RegisterScreen() {
  const theme = useTheme();
  const keyboardForm = useKeyboardAwareForm();
  const { captureLayout, focusField, setBaseOffset } = keyboardForm;
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  function showSnackbar(message: string) {
    setSnackbar({ visible: true, message });
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  }

  function applyErrorList(list: ValidationError[]) {
    const map: Record<string, string> = {};
    list.forEach((e) => { map[e.field] = e.message; });
    setErrors(map);
  }

  async function handleSubmit() {
    const input = {
      fullName: form.fullName,
      category: form.category,
      bdNumber: form.bdNumber,
      retired: form.retired,
      rank: form.rank,
      branch: form.branch,
      trade: '',
      course: form.course,
      commissionDate: form.commissionDate,
      designation: form.designation,
      office: form.office,
      email: form.email,
      mobile: form.mobile,
      password: form.password,
    };
    const validationErrors = validateRegistration(input, form.confirmPassword);
    if (validationErrors.length > 0) {
      applyErrorList(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await requestRegistration(input);
      setSuccessVisible(true);
    } catch (e: any) {
      showSnackbar(getFriendlyErrorMessage(e, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAwareScreen form={keyboardForm} contentContainerStyle={styles.scroll}>
        <AuthHeader
          compact
          showBack
          icon="create"
          title="Request Registration"
          subtitle="Join the GS MTR directory"
        />

        <View
          onLayout={(e) => {
            setBaseOffset(e.nativeEvent.layout.y);
          }}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                shadowColor: theme.dark ? '#000000' : '#0B7F74',
              },
            ]}
          >
            <SectionTitle title="Personal Information" />

            <TextInput
              label="Full Name *"
              value={form.fullName}
              onChangeText={(t) => updateField('fullName', t)}
              onFocus={() => focusField('fullName')}
              onLayout={captureLayout('fullName')}
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.fullName}
            />
            {errors.fullName && <HelperText type="error">{errors.fullName}</HelperText>}

            <Text variant="bodyMedium" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
              Category *
            </Text>
            <SegmentedButtons
              value={form.category}
              onValueChange={(v) => updateField('category', v as UserCategory)}
              buttons={[
                { value: 'Officer', label: 'Officer' },
                { value: 'Airman', label: 'Airman' },
                { value: 'Civilian', label: 'Civilian' },
              ]}
              style={styles.segmented}
            />

            <TextInput
              label={form.category === 'Civilian' ? 'Service Number *' : 'BD Number *'}
              value={form.bdNumber}
              onChangeText={(t) => updateField('bdNumber', t.replace(/[^\d]/g, ''))}
              onFocus={() => focusField('bdNumber')}
              onLayout={captureLayout('bdNumber')}
              mode="outlined"
              keyboardType="number-pad"
              placeholder={form.category === 'Airman' ? 'e.g. 470504' : undefined}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.bdNumber}
            />
            {errors.bdNumber && <HelperText type="error">{errors.bdNumber}</HelperText>}

            <Pressable
              style={styles.retiredRow}
              onPress={() => updateField('retired', !form.retired)}
            >
              <Checkbox
                status={form.retired ? 'checked' : 'unchecked'}
                onPress={() => updateField('retired', !form.retired)}
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Retired
              </Text>
            </Pressable>

            <SectionTitle title="Service Details" />

            <TextInput
              label="Rank *"
              value={form.rank}
              onChangeText={(t) => updateField('rank', t)}
              onFocus={() => focusField('rank')}
              onLayout={captureLayout('rank')}
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.rank}
            />
            {errors.rank && <HelperText type="error">{errors.rank}</HelperText>}

            <TextInput
              label={`${CATEGORY_LABELS[form.category].branch} *`}
              value={form.branch}
              onChangeText={(t) => updateField('branch', t)}
              onFocus={() => focusField('branch')}
              onLayout={captureLayout('branch')}
              mode="outlined"
              placeholder={form.category === 'Airman' ? 'e.g. GS' : undefined}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.branch}
            />
            {errors.branch && <HelperText type="error">{errors.branch}</HelperText>}

            {form.category !== 'Civilian' && (
              <TextInput
                label={form.category === 'Airman' ? 'Entry' : 'Course'}
                value={form.course}
                onChangeText={(t) => updateField('course', t)}
                onFocus={() => focusField('course')}
                onLayout={captureLayout('course')}
                mode="outlined"
                placeholder={form.category === 'Airman' ? 'e.g. 40' : 'e.g. DE2022B'}
                style={styles.input}
                outlineStyle={styles.inputOutline}
              />
            )}

            <DateField
              label={`${form.category === 'Officer' ? 'Date of Commission' : 'Date of Enrolment'} *`}
              value={form.commissionDate}
              onChange={(v) => updateField('commissionDate', v)}
              error={!!errors.commissionDate}
              helperText={errors.commissionDate}
              maximumDate={new Date()}
              placeholder={form.category === 'Airman' ? 'e.g. 01 Apr 2012' : undefined}
            />

            <TextInput
              label="Designation"
              value={form.designation}
              onChangeText={(t) => updateField('designation', t)}
              onFocus={() => focusField('designation')}
              onLayout={captureLayout('designation')}
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />

            <TextInput
              label="Office/Unit"
              value={form.office}
              onChangeText={(t) => updateField('office', t)}
              onFocus={() => focusField('office')}
              onLayout={captureLayout('office')}
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />

            <SectionTitle title="Contact" />

            <TextInput
              label="Email *"
              value={form.email}
              onChangeText={(t) => updateField('email', t)}
              onFocus={() => focusField('email')}
              onLayout={captureLayout('email')}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.email}
            />
            {errors.email && <HelperText type="error">{errors.email}</HelperText>}

            <TextInput
              label="Mobile Number *"
              value={form.mobile}
              onChangeText={(t) => updateField('mobile', t)}
              onFocus={() => focusField('mobile')}
              onLayout={captureLayout('mobile')}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.mobile}
            />
            {errors.mobile && <HelperText type="error">{errors.mobile}</HelperText>}

            <SectionTitle title="Security" />

            <TextInput
              label="Password *"
              value={form.password}
              onChangeText={(t) => updateField('password', t)}
              onFocus={() => focusField('password')}
              onLayout={captureLayout('password')}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.password}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword((v) => !v)}
                />
              }
            />
            {errors.password && <HelperText type="error">{errors.password}</HelperText>}

            <TextInput
              label="Confirm Password *"
              value={form.confirmPassword}
              onChangeText={(t) => updateField('confirmPassword', t)}
              onFocus={() => focusField('confirmPassword')}
              onLayout={captureLayout('confirmPassword')}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.confirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword((v) => !v)}
                />
              }
            />
            {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              contentStyle={styles.submitContent}
              labelStyle={styles.submitLabel}
            >
              Request Registration
            </Button>

            <Text
              variant="bodySmall"
              style={[styles.note, { color: theme.colors.onSurfaceVariant }]}
            >
              Your request will be reviewed by an administrator. You will be able to access
              GS MTR contacts after your registration is approved.
            </Text>
          </View>
        </KeyboardAwareScreen>

        <Portal>
          <Dialog visible={successVisible} onDismiss={() => router.replace('/(auth)/account-status' as any)}>
            <Dialog.Title>Registration Submitted</Dialog.Title>
            <Dialog.Content>
              <Text>
                Your registration is pending admin approval. You will get access to GS MTR
                contacts once an administrator approves your request.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => router.replace('/(auth)/account-status' as any)}>
                OK
              </Button>
            </Dialog.Actions>
          </Dialog>

          <Snackbar
            visible={snackbar.visible}
            onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
            duration={3000}
          >
            {snackbar.message}
          </Snackbar>
        </Portal>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingBottom: 40 },
  card: {
    marginTop: -24,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    elevation: 6,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: 'Oswald_600SemiBold',
    letterSpacing: 1.2,
  },
  fieldLabel: { marginBottom: 6, fontWeight: '500' },
  segmented: { marginBottom: 12 },
  input: {
    marginBottom: 4,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 14,
  },
  retiredRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  submitButton: {
    marginTop: 24,
    borderRadius: 28,
    height: 52,
  },
  submitContent: {
    height: 52,
  },
  submitLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 16,
    letterSpacing: 1,
  },
  note: { textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
