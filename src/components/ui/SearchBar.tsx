import { memo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar, useTheme } from 'react-native-paper';
import { spacing, radius, typography } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const SearchBar = memo(function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search contacts',
}: SearchBarProps) {
  const theme = useTheme();
  const inputRef = useRef<any>(null);

  return (
    <Searchbar
      ref={inputRef}
      placeholder={placeholder}
      onChangeText={onChangeText}
      value={value}
      onClearIconPress={onClear}
      style={[
        styles.searchBar,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
      inputStyle={styles.input}
      iconColor={theme.colors.onSurfaceVariant}
      clearIcon="close"
    />
  );
});

const styles = StyleSheet.create({
  searchBar: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: radius.xxl,
    elevation: 0,
  },
  input: {
    ...typography.bodySmall,
  },
});
