import { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

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
  const [showPicker, setShowPicker] = useState(false);

  function openPicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: value ? new Date(`${value}T00:00:00`) : new Date(2000, 0, 1),
        mode: 'date',
        maximumDate,
        onChange: (event, date) => {
          if (event.type === 'set' && date) {
            onChange(toDateString(date));
          }
        },
      });
    } else {
      setShowPicker(true);
    }
  }

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={openPicker}>
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
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(`${value}T00:00:00`) : new Date(2000, 0, 1)}
          mode="date"
          maximumDate={maximumDate}
          display="spinner"
          onChange={(event, date) => {
            setShowPicker(false);
            if (event.type === 'set' && date) {
              onChange(toDateString(date));
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  input: {
    borderRadius: 14,
  },
});
