import { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { FAB, Text, useTheme, Snackbar, Portal } from 'react-native-paper';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useContacts } from '@/hooks/useContacts';
import { useAuthStore } from '@/store/authStore';
import { ContactCard } from '@/components/ui/ContactCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AlphabetIndex } from '@/components/ui/AlphabetIndex';
import { HeaderActions } from '@/components/ui/HeaderActions';
import { Contact } from '@/types/contact';
import { getFavoriteContacts } from '@/database/database';

export default function FavoritesScreen() {
  const theme = useTheme();
  const {
    contacts,
    isLoading,
    isSelectionMode,
    selectedIds,
    isAuthenticated,
    toggleSelection,
    clearSelection,
    toggleFavorite,
    performSearch,
    searchQuery,
    searchResults,
    setSearchQuery,
  } = useContacts();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const listRef = useRef<FlashListRef<Contact>>(null);
  const [refreshing, setRefreshing] = useState(false);

  const favoriteContacts = useMemo(() => {
    return contacts.filter((c) => c.favorite);
  }, [contacts]);

  const displayContacts = useMemo(() => {
    if (searchQuery && searchResults !== null) return searchResults;
    return favoriteContacts;
  }, [favoriteContacts, searchResults, searchQuery]);

  const groupedContacts = useMemo(() => {
    const map = new Map<string, Contact[]>();
    for (const c of displayContacts) {
      const char = c.NAME ? c.NAME[0].toUpperCase() : '#';
      const group = /[A-Z]/.test(char) ? char : '#';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(c);
    }
    const sections: { key: string; data: Contact[] }[] = [];
    const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    for (const [key, data] of sorted) {
      sections.push({ key, data });
    }
    return sections;
  }, [displayContacts]);

  const handleContactPress = useCallback((contact: Contact) => {
    if (isSelectionMode) {
      toggleSelection(contact.id);
    } else {
      router.push(`/contact/${contact.id}` as any);
    }
  }, [isSelectionMode, toggleSelection]);

  const handleContactLongPress = useCallback((contact: Contact) => {
    if (!isSelectionMode) {
      toggleSelection(contact.id);
    }
  }, [isSelectionMode, toggleSelection]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      performSearch(text);
    }
  }, [performSearch, setSearchQuery]);

  const handleLetterPress = useCallback((letter: string) => {
    const index = displayContacts.findIndex((c) => {
      const first = c.NAME ? c.NAME[0].toUpperCase() : '#';
      return first >= letter;
    });
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, animated: true });
    }
  }, [displayContacts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await performSearch('');
    setRefreshing(false);
  }, [performSearch]);

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

  const renderSectionHeader = useCallback(({ section }: { section: { key: string } }) => (
    <SectionHeader title={section.key} />
  ), []);

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  if (isLoading && contacts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: '600' }}>
            Favorites
          </Text>
          <HeaderActions />
        </View>
        <SearchBar value="" onChangeText={() => {}} onClear={() => {}} />
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: '600' }}>
          Favorites
        </Text>
        {isSelectionMode ? (
          <Pressable onPress={clearSelection}>
            <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>Cancel</Text>
          </Pressable>
        ) : (
          <HeaderActions />
        )}
      </View>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        onClear={() => {
          setSearchQuery('');
          performSearch('');
        }}
      />
      {displayContacts.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No favorites found' : 'No favorites yet'}
          subtitle={
            searchQuery
              ? 'No results for "' + searchQuery + '"'
              : 'Tap the star icon on any contact to add to favorites'
          }
        />
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            ref={listRef}
            data={displayContacts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            // @ts-ignore - estimatedItemSize is valid in FlashList v2
            estimatedItemSize={72}
            contentContainerStyle={styles.list}
            extraData={[selectedIds, isSelectionMode]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
          <AlphabetIndex onLetterPress={handleLetterPress} />
        </View>
      )}
      {isAuthenticated ? (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => router.push('/contact/add' as any)}
        />
      ) : null}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
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
  listContainer: { flex: 1 },
  list: { paddingBottom: 80 },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
});