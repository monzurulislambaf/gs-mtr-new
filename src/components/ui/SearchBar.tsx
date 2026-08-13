import { memo, useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar, IconButton, useTheme } from 'react-native-paper';

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
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 24,
    elevation: 0,
  },
  input: {
    fontSize: 16,
  },
});
