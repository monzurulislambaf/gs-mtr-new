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
  const isOnline = useSyncStore((s) => s.isOnline);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    store.loadContacts();
  }, []);

  useEffect(() => {
    if (!isOnline) return;

    const setupListener = async () => {
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
    };

    setupListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isOnline]);

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
<<<<<<< HEAD
    toggleFavorite: store.toggleFavorite,
=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  };
}
