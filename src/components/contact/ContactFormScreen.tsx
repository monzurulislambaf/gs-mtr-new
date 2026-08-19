import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  HelperText,
  useTheme,
  Snackbar,
  Portal,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScreen, useKeyboardAwareForm } from '@/components/ui/KeyboardAwareScreen';
import { spacing, radius, typography } from '@/theme';

/** Contact form data shape — single source of truth for add and edit screens. */
export interface ContactFormData {
  'BD NO': string;
  RANK: string;
  NAME: string;
  DESIGNATION: string;
  'BRANCH / TRADE': string;
  'OFFICE ADDRESS': string;
  'RESIDENCE ADDRESS': string;
  'SERVICE MOBILE': string;
  'PERSONAL MOBILE': string;
  'OFFICE TELEPHONE': string;
  'PERSONAL TELEPHONE': string;
  REMARKS: string;
}

export const EMPTY_FORM: ContactFormData = {
  'BD NO': '',
  RANK: '',
  NAME: '',
  DESIGNATION: '',
  'BRANCH / TRADE': '',
  'OFFICE ADDRESS': '',
  'RESIDENCE ADDRESS': '',
  'SERVICE MOBILE': '',
  'PERSONAL MOBILE': '',
  'OFFICE TELEPHONE': '',
  'PERSONAL TELEPHONE': '',
  REMARKS: '',
};

interface FieldDef {
  key: keyof ContactFormData;
  label: string;
  required?: boolean;
  keyboardType?: 'phone-pad' | 'default';
  multiline?: boolean;
}

/** Logical field groups for organized form layout. */
const FIELD_GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Identity',
    fields: [
      { key: 'BD NO' as const, label: 'BD NO', required: true },
      { key: 'RANK' as const, label: 'RANK', required: true },
      { key: 'NAME' as const, label: 'NAME', required: true },
      { key: 'DESIGNATION' as const, label: 'DESIGNATION' },
      { key: 'BRANCH / TRADE' as const, label: 'BRANCH / TRADE' },
    ],
  },
  {
    title: 'Address',
    fields: [
      { key: 'OFFICE ADDRESS' as const, label: 'OFFICE ADDRESS' },
      { key: 'RESIDENCE ADDRESS' as const, label: 'RESIDENCE ADDRESS' },
    ],
  },
  {
    title: 'Phone',
    fields: [
      { key: 'SERVICE MOBILE' as const, label: 'SERVICE MOBILE', keyboardType: 'phone-pad' as const, required: true },
      { key: 'PERSONAL MOBILE' as const, label: 'PERSONAL MOBILE', keyboardType: 'phone-pad' as const },
      { key: 'OFFICE TELEPHONE' as const, label: 'OFFICE TELEPHONE', keyboardType: 'phone-pad' as const },
      { key: 'PERSONAL TELEPHONE' as const, label: 'RESIDENCE TELEPHONE', keyboardType: 'phone-pad' as const },
    ],
  },
  {
    title: 'Notes',
    fields: [
      { key: 'REMARKS' as const, label: 'REMARKS', multiline: true },
    ],
  },
];

interface ContactFormScreenProps {
  /** 'add' or 'edit' mode — affects button label. */
  mode: 'add' | 'edit';
  /** Initial form data for edit mode. */
  initialData?: ContactFormData;
  /** Called when the user taps Save. Receives validated form data. */
  onSubmit: (data: ContactFormData) => Promise<void>;
  /** Snackbar message to show after successful save. */
  successMessage?: string;
}

/**
 * Shared contact form screen with logical field grouping.
 *
 * Used by both contact/add.tsx and contact/edit/[id].tsx to eliminate
 * duplication. Handles form state, validation errors, keyboard awareness,
 * and loading/success feedback.
 */
export function ContactFormScreen({
  mode,
  initialData,
  onSubmit,
  successMessage,
}: ContactFormScreenProps) {
  const theme = useTheme();
  const keyboardForm = useKeyboardAwareForm();
  const { captureLayout, focusField } = keyboardForm;
  const [form, setForm] = useState<ContactFormData>(initialData ?? EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  function showSnackbar(message: string) {
    setSnackbar({ visible: true, message });
  }

  function updateField(field: keyof ContactFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSave() {
    // Validate required fields
    const requiredFields = FIELD_GROUPS.flatMap((g) =>
      g.fields.filter((f) => f.required).map((f) => f.key),
    );
    const newErrors: Record<string, string> = {};
    for (const field of requiredFields) {
      if (!form[field]?.trim()) {
        newErrors[field] = `${field} is required`;
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      showSnackbar(successMessage ?? (mode === 'add' ? 'Contact created' : 'Contact updated'));
    } catch (e: any) {
      showSnackbar(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAwareScreen form={keyboardForm} contentContainerStyle={styles.scroll}>
        {FIELD_GROUPS.map((group, groupIndex) => (
          <View key={group.title} style={styles.fieldGroup}>
            {groupIndex > 0 && <View style={styles.groupDivider} />}
            <Text variant="labelSmall" style={[styles.groupTitle, { color: theme.colors.primary }]}>
              {group.title.toUpperCase()}
            </Text>
            {group.fields.map((field) => (
              <View key={field.key}>
                <TextInput
                  label={field.label}
                  value={form[field.key]}
                  onChangeText={(t) => updateField(field.key, t)}
                  onFocus={() => focusField(field.key)}
                  onLayout={captureLayout(field.key)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors[field.key]}
                  keyboardType={field.keyboardType}
                  multiline={field.multiline}
                  numberOfLines={field.multiline ? 3 : undefined}
                />
                {errors[field.key] && (
                  <HelperText type="error">{errors[field.key]}</HelperText>
                )}
              </View>
            ))}
          </View>
        ))}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          {mode === 'add' ? 'Save Contact' : 'Update Contact'}
        </Button>
      </KeyboardAwareScreen>

      <Portal>
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
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  fieldGroup: {
    marginBottom: spacing.sm,
  },
  groupTitle: {
    ...typography.overline,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  groupDivider: {
    height: 1,
    backgroundColor: 'transparent',
    marginVertical: spacing.xs,
  },
  input: {
    marginBottom: spacing.xs,
    borderRadius: radius.md,
  },
  saveButton: {
    marginTop: spacing.lg,
    borderRadius: radius.xxl,
  },
  saveButtonContent: {
    paddingVertical: spacing.xs,
  },
});
