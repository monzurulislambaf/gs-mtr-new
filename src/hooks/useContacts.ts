import { useEffect, useCallback, useRef } from 'react';
import { useContactsStore } from '@/store/contactsStore';
import { useAuthStore } from '@/store/authStore';
import { useSyncStore } from '@/store/syncStore';
import { listenContactChanges } from '@/firebase/firestore';
import { getSyncMeta, setSyncMeta, upsertContacts, deleteContacts } from '@/database/database';
import { performIncrementalSync } from '@/database/sync';
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
        // Fresh installs have no sync cursor yet. The realtime query below only
        // covers docs whose updatedAt > cursor, so on first run it could miss
        // every existing contact. Seed the local cache with a full Firestore
        // fetch first — this also works for legacy docs without a valid
        // updatedAt timestamp (which range queries silently exclude).
        const lastSyncStr = await getSyncMeta('last_sync_time');
        let lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) || 0 : 0;

        if (!lastSyncStr) {
          try {
            await performIncrementalSync();
          } catch (error) {
            console.error('[SYNC] Initial full sync failed:', error);
          }
          const syncedAt = await getSyncMeta('last_sync_time');
          lastSync = syncedAt ? parseInt(syncedAt, 10) || 0 : 0;
        }

        unsubscribeRef.current = listenContactChanges(
          lastSync,
          (changed: Contact[]) => {
            upsertContacts(changed).then(() => {
              setSyncMeta('last_sync_time', String(Date.now()));
              store.loadContacts();
            }).catch((error) => {
              console.error('[SYNC] Local upsert failed:', error);
            });
          },
          (deleted: string[]) => {
            deleteContacts(deleted).then(() => {
              setSyncMeta('last_sync_time', String(Date.now()));
              store.loadContacts();
            }).catch((error) => {
              console.error('[SYNC] Local delete failed:', error);
            });
          },
          (error) => {
            console.error('[SYNC] Realtime listener error:', error);
          }
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
