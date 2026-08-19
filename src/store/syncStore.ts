import { create } from 'zustand';
import { performIncrementalSync, checkConnectivity, onConnectivityChange } from '@/database/sync';
import { useAuthStore } from '@/store/authStore';
import { useContactsStore } from '@/store/contactsStore';
import { getFriendlyErrorMessage } from '@/utils/errors';

interface SyncStore {
  lastSyncTime: number | null;
  isSyncing: boolean;
  syncError: string | null;
  isOnline: boolean;
  pendingChanges: number;
  initialize: () => () => void;
  manualSync: () => Promise<void>;
  setIsOnline: (online: boolean) => void;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  lastSyncTime: null,
  isSyncing: false,
  syncError: null,
  isOnline: true,
  pendingChanges: 0,

  initialize: () => {
    try {
      checkConnectivity().then((online) => {
        console.log(`[NETWORK] Connectivity checked: ${online ? 'online' : 'offline'}`);
        set({ isOnline: online });
        if (online) {
          get().manualSync();
        }
      }).catch(() => {
        // checkConnectivity never rejects, but guard anyway
      });
      const unsubscribe = onConnectivityChange((online) => {
        console.log(`[NETWORK] Connectivity changed: ${online ? 'online' : 'offline'}`);
        set({ isOnline: online });
        if (online) {
          get().manualSync();
        }
      });
      return unsubscribe;
    } catch (error) {
      // NetInfo/Firebase setup failure must not break app startup.
      console.error('[SYNC] Sync initialization failed:', error);
      return () => {};
    }
  },

  manualSync: async () => {
    const { isSyncing, isOnline } = get();
    if (isSyncing || !isOnline) return;

    // Only approved users (and admins) may sync contacts.
    if (!useAuthStore.getState().canAccessContacts) return;

    set({ isSyncing: true, syncError: null });
    console.log('[SYNC] Firebase sync started');
    try {
      const result = await performIncrementalSync();
      set({
        lastSyncTime: Date.now(),
        isSyncing: false,
        syncError: null,
      });
      // Reload the local contacts into the store so the UI reflects the
      // freshly synced cache without waiting for a future listener event.
      useContactsStore.getState().loadContacts();
      console.log(
        `[SYNC] Firebase sync completed (${result.synced} synced, ${result.deleted} deleted)`
      );
    } catch (error: any) {
      set({
        isSyncing: false,
        syncError: getFriendlyErrorMessage(error, 'Sync failed'),
      });
      console.error('[SYNC] Firebase sync failed:', error?.message || error);
    }
  },

  setIsOnline: (online) => set({ isOnline: online }),
}));
