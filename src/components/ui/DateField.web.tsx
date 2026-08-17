import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  maximumDate?: Date;
  placeholder?: string;
}

export function DateField({
  label,
  value,
  onChange,
  error,
  helperText,
  maximumDate,
  placeholder,
}: DateFieldProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={() => setVisible(true)}>
        <View pointerEvents="none">
          <TextInput
            label={label}
            value={value}
            mode="outlined"
            editable={false}
            placeholder={placeholder || 'Select date'}
            error={error}
            style={styles.input}
            right={<TextInput.Icon icon="calendar" />}
          />
        </View>
      </Pressable>
      {helperText && error ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 12, marginTop: 2 }}>
          {helperText}
        </Text>
      ) : null}
      <DatePickerModal
        locale="en"
        mode="single"
        visible={visible}
        date={value ? new Date(`${value}T00:00:00`) : undefined}
        validRange={{ startDate: new Date(1950, 0, 1), endDate: maximumDate }}
        onDismiss={() => setVisible(false)}
        onConfirm={({ date }) => {
          setVisible(false);
          if (date) {
            onChange(toDateString(date));
          }
        }}
        saveLabel="OK"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
  },
});