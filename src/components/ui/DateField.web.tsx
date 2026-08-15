import { View, StyleSheet } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  maximumDate?: Date;
}

export function DateField({
  label,
  value,
  onChange,
  error,
  helperText,
}: DateFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      <TextInput
        label={label}
        value={value}
        mode="outlined"
        placeholder="YYYY-MM-DD"
        onChangeText={onChange}
        error={error}
        style={styles.input}
      />
      {helperText && error ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 12, marginTop: 2 }}>
          {helperText}
        </Text>
      ) : null}
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
