import { useCallback, useRef, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { FAB, Text, useTheme, Snackbar, Portal } from 'react-native-paper';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useContacts } from '@/hooks/useContacts';
import { useAuthStore } from '@/store/authStore';
import { useSyncStore } from '@/store/syncStore';
import { ContactCard } from '@/components/ui/ContactCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AlphabetIndex } from '@/components/ui/AlphabetIndex';
import { HeaderActions } from '@/components/ui/HeaderActions';
import { Contact } from '@/types/contact';
import { deleteContact } from '@/services/contactService';
import { restoreContactById } from '@/services/contactService';
import { getFriendlyErrorMessage } from '@/utils/errors';

export default function HomeScreen() {
  const theme = useTheme();
  const {
    contacts,
    isLoading,
    isSelectionMode,
    selectedIds,
    toggleSelection,
    clearSelection,
    performSearch,
    searchQuery,
    searchResults,
    setSearchQuery,
    toggleFavorite,
  } = useContacts();

  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isOnline = useSyncStore((s) => s.isOnline);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    
    try {
      for (const id of ids) {
        await deleteContact(id);
      }
      clearSelection();
      showSnackbar(`${ids.length} contact(s) deleted`);
    } catch (e: any) {
      showSnackbar(getFriendlyErrorMessage(e, 'Batch delete failed'));
    }
  }, [selectedIds, clearSelection, showSnackbar]);

  const handleBatchRestore = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      for (const id of ids) {
        await restoreContactById(id);
      }
      clearSelection();
      showSnackbar(`${ids.length} contact(s) restored`);
    } catch (e: any) {
      showSnackbar(getFriendlyErrorMessage(e, 'Restore failed'));
    }
  }, [selectedIds, clearSelection, showSnackbar]);
  const listRef = useRef<FlashListRef<Contact>>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { useContactsStore } = await import('@/store/contactsStore');
      await useContactsStore.getState().loadContacts();
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const displayContacts = useMemo(() => {
    const list = searchQuery && searchResults !== null ? searchResults : contacts;
    return [...list].sort((a, b) => a.NAME.localeCompare(b.NAME));
  }, [contacts, searchResults, searchQuery]);

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

  const renderItem = useCallback(({ item }: { item: Contact }) => (
    <ContactCard
      contact={item}
      isSelected={selectedIds.has(item.id)}
      isSelectionMode={isSelectionMode}
      isAdmin={isAdmin}
      onPress={() => handleContactPress(item)}
      onLongPress={() => handleContactLongPress(item)}
      onEditPress={() => router.push(`/contact/edit/${item.id}` as any)}
      onFavoritePress={toggleFavorite}
    />
  ), [selectedIds, isSelectionMode, isAdmin, handleContactPress, handleContactLongPress, toggleFavorite]);

  const renderSectionHeader = useCallback(({ section }: { section: { key: string } }) => (
    <SectionHeader title={section.key} />
  ), []);

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  if (isLoading && contacts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: '600' }}>
            Contacts
          </Text>
          <HeaderActions />
        </View>
        <SearchBar value="" onChangeText={() => {}} onClear={() => {}} />
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: '600' }}>
          Contacts
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
      {isSelectionMode && isAdmin && selectedIds.size > 0 && (
        <View style={styles.batchActions}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {selectedIds.size} selected
          </Text>
          <Pressable onPress={handleBatchDelete} style={styles.batchActionBtn}>
            <Text variant="labelLarge" style={{ color: theme.colors.error }}>Delete</Text>
          </Pressable>
        </View>
      )}
      {displayContacts.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No contacts found' : 'No contacts yet'}
          subtitle={
            searchQuery
              ? 'No results for "' + searchQuery + '"'
              : isOnline
                ? 'Contacts will appear here once synced'
                : 'No contacts available offline. Connect to the internet to synchronize contacts.'
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
      {isAdmin ? (
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
  batchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  batchActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
