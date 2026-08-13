import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, Searchbar, Chip, IconButton } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useContacts } from '@/hooks/useContacts';
import { ContactCard } from '@/components/ui/ContactCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeaderActions } from '@/components/ui/HeaderActions';
import { Contact } from '@/types/contact';
import { useSettingsStore } from '@/store/settingsStore';
import { getSearchHistory, addToSearchHistory, clearSearchHistory } from '@/database/database';

const SEARCH_FIELDS = [
  { key: 'NAME', label: 'Name' },
  { key: 'RANK', label: 'Rank' },
  { key: 'BD NO', label: 'BD No' },
  { key: 'SERVICE MOBILE', label: 'Service Mobile' },
  { key: 'PERSONAL MOBILE', label: 'Personal Mobile' },
  { key: 'DESIGNATION', label: 'Designation' },
  { key: 'OFFICE ADDRESS', label: 'Office Address' },
];

export default function SearchScreen() {
  const theme = useTheme();
  const {
    contacts,
    searchQuery,
    searchResults,
    isLoading,
    isSelectionMode,
    selectedIds,
    isAuthenticated,
    toggleSelection,
    performSearch,
    clearSearch,
    setSearchQuery,
    toggleFavorite,
  } = useContacts();

  const [localQuery, setLocalQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(SEARCH_FIELDS.map(f => f.key));
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  async function loadSearchHistory() {
    try {
      const history = await getSearchHistory();
      setRecentSearches(history);
    } catch (e) {
      console.error('Failed to load search history:', e);
    }
  }

  const handleSearch = useCallback(async (text: string) => {
    setLocalQuery(text);
    setSearchQuery(text);
    if (text.trim()) {
      await performSearch(text);
      await addToSearchHistory(text);
      const history = await getSearchHistory();
      setRecentSearches(history);
      setShowRecent(false);
    }
  }, [performSearch, setSearchQuery]);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    clearSearch();
  }, [clearSearch]);

  const handleFieldToggle = useCallback((field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field) 
        : [...prev, field]
    );
  }, []);

  const displayResults = useMemo(() => {
    if (localQuery.trim() && searchResults !== null) return searchResults;
    return [];
  }, [localQuery, searchResults]);

  const handleContactPress = useCallback((contact: Contact) => {
    router.push(`/contact/${contact.id}` as any);
  }, []);

  const handleContactLongPress = useCallback((contact: Contact) => {
    toggleSelection(contact.id);
  }, [toggleSelection]);

  const handleRecentPress = useCallback(async (query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
    await performSearch(query);
    setShowRecent(false);
  }, [performSearch, setSearchQuery]);

  const handleClearHistory = useCallback(async () => {
    await clearSearchHistory();
    setRecentSearches([]);
  }, []);

  const renderItem = useCallback(({ item }: { item: Contact }) => (
    <ContactCard
      contact={item}
      isSelected={selectedIds.has(item.id)}
      isSelectionMode={isSelectionMode}
      isAdmin={isAuthenticated}
      onPress={() => handleContactPress(item)}
      onLongPress={() => handleContactLongPress(item)}
      onEditPress={() => router.push(`/contact/edit/${item.id}` as any)}
      onFavoritePress={toggleFavorite}
    />
  ), [selectedIds, isSelectionMode, isAuthenticated, handleContactPress, handleContactLongPress, toggleFavorite]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: '600' }}>
          Search
        </Text>
        <View style={styles.headerRight}>
          <HeaderActions />
          <IconButton
            icon="tune"
            size={24}
            onPress={() => setShowFilters(!showFilters)}
            // @ts-expect-error - IconButton accepts color prop in react-native-paper v5
            color={selectedFields.length !== SEARCH_FIELDS.length ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        </View>
      </View>

      <Searchbar
        placeholder="Search all fields..."
        onChangeText={handleSearch}
        value={localQuery}
        onClearIconPress={handleClear}
        style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
        inputStyle={styles.input}
        autoFocus
      />

      {showFilters && (
        <View style={styles.filterContainer}>
          <Text variant="labelMedium" style={styles.filterTitle}>Search in:</Text>
          <View style={styles.filterChips}>
            {SEARCH_FIELDS.map((field) => (
              <Chip
                key={field.key}
                selected={selectedFields.includes(field.key)}
                onPress={() => handleFieldToggle(field.key)}
                style={[styles.filterChip, { backgroundColor: theme.colors.primaryContainer }]}
              >
                {field.label}
              </Chip>
            ))}
          </View>
        </View>
      )}

      {showRecent && recentSearches.length > 0 && !localQuery && !isLoading && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text variant="labelMedium" style={styles.filterTitle}>Recent searches</Text>
            <Pressable onPress={handleClearHistory}>
              <Text variant="labelMedium" style={{ color: theme.colors.primary }}>Clear</Text>
            </Pressable>
          </View>
          <View style={styles.recentChips}>
            {recentSearches.slice(0, 5).map((query) => (
              <Chip
                key={query}
                onPress={() => handleRecentPress(query)}
                style={[styles.recentChip, { backgroundColor: theme.colors.surfaceVariant }]}
              >
                {query}
              </Chip>
            ))}
          </View>
        </View>
      )}

      {!isLoading && !localQuery && !showRecent && recentSearches.length > 0 && (
        <Pressable onPress={() => setShowRecent(true)} style={styles.showRecentBtn}>
          <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
            Show recent searches ({recentSearches.length})
          </Text>
        </Pressable>
      )}

      {isLoading ? <LoadingSkeleton count={5} /> : null}
      {!isLoading && localQuery && displayResults.length === 0 ? (
        <EmptyState
          title="No results"
          subtitle={'No contacts match "' + localQuery + '"'}
        />
      ) : null}
      {!isLoading && !localQuery && displayResults.length === 0 && recentSearches.length === 0 ? (
        <EmptyState
          title="Search contacts"
          subtitle="Search by name, rank, BD No, phone number, or any other field"
        />
      ) : null}
      {displayResults.length > 0 ? (
        <FlashList
          data={displayResults}
          renderItem={renderItem}
          keyExtractor={(item: Contact) => item.id}
          // @ts-ignore - estimatedItemSize is valid in FlashList v2
          estimatedItemSize={72}
          contentContainerStyle={styles.list}
          extraData={[selectedIds, isSelectionMode]}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 24,
    elevation: 0,
  },
  input: {
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterTitle: {
    marginBottom: 8,
    color: '#5F6368',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    height: 32,
  },
  recentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    height: 32,
  },
  showRecentBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  list: {
    paddingBottom: 80,
  },
});
