import { create } from 'zustand';
import { performIncrementalSync, checkConnectivity, onConnectivityChange } from '@/database/sync';

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
<<<<<<< HEAD
    checkConnectivity().then((online) => {
      set({ isOnline: online });
      if (online) {
        get().manualSync();
      }
    });
=======
    checkConnectivity().then((online) => set({ isOnline: online }));
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
    const unsubscribe = onConnectivityChange((online) => {
      set({ isOnline: online });
      if (online) {
        get().manualSync();
      }
    });
    return unsubscribe;
  },

  manualSync: async () => {
    const { isSyncing, isOnline } = get();
    if (isSyncing || !isOnline) return;

    set({ isSyncing: true, syncError: null });
    try {
      const result = await performIncrementalSync();
      set({
        lastSyncTime: Date.now(),
        isSyncing: false,
        syncError: null,
      });
    } catch (error: any) {
      set({
        isSyncing: false,
        syncError: error.message || 'Sync failed',
      });
    }
  },

  setIsOnline: (online) => set({ isOnline: online }),
}));
