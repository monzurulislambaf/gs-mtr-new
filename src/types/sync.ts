export interface SyncState {
  lastSyncTime: number;
  isSyncing: boolean;
  syncError: string | null;
  isOnline: boolean;
  pendingChanges: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
