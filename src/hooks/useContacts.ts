import { useEffect, useCallback, useRef } from 'react';
import { useContactsStore } from '@/store/contactsStore';
import { useAuthStore } from '@/store/authStore';
import { useSyncStore } from '@/store/syncStore';
import { listenContactChanges } from '@/firebase/firestore';
import { getSyncMeta, upsertContacts, deleteContacts } from '@/database/database';
import { Contact } from '@/types/contact';

export function useContacts() {
  const store = useContactsStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const canAccessContacts = useAuthStore((s) => s.canAccessContacts);
  const isOnline = useSyncStore((s) => s.isOnline);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    store.loadContacts();
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    // Only approved users (and admins) receive realtime contact updates.
    if (!canAccessContacts) return;

    const setupListener = async () => {
      try {
        const lastSyncStr = await getSyncMeta('last_sync_time');
        const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : Date.now();

        unsubscribeRef.current = listenContactChanges(
          lastSync,
          (changed: Contact[]) => {
            upsertContacts(changed).then(() => {
              store.loadContacts();
            });
          },
          (deleted: string[]) => {
            deleteContacts(deleted).then(() => {
              store.loadContacts();
            });
          },
          () => {}
        );
      } catch (error) {
        // Firebase unavailable: realtime updates are skipped, SQLite data
        // remains fully usable.
        console.error('[SYNC] Realtime listener setup failed:', error);
      }
    };

    setupListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isOnline, canAccessContacts]);

  const refresh = useCallback(async () => {
    await store.loadContacts();
  }, []);

  return {
    contacts: store.contacts,
    searchResults: store.searchResults,
    searchQuery: store.searchQuery,
    isLoading: store.isLoading,
    isSelectionMode: store.isSelectionMode,
    selectedIds: store.selectedIds,
    totalCount: store.totalCount,
    isAuthenticated,
    refresh,
    toggleSelection: store.toggleSelection,
    clearSelection: store.clearSelection,
    selectAll: store.selectAll,
    performSearch: store.performSearch,
    clearSearch: store.clearSearch,
    setSearchQuery: store.setSearchQuery,
    toggleFavorite: store.toggleFavorite,
  };
}
