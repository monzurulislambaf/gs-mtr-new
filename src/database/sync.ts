import NetInfo from '@react-native-community/netinfo';
import { syncChangedContacts, fetchAllContacts } from '@/firebase/firestore';
import { Contact } from '@/types/contact';
import {
  upsertContacts,
  deleteContacts as deleteLocalContacts,
  getSyncMeta,
  setSyncMeta,
  hasLocalData,
} from './database';

const LAST_SYNC_KEY = 'last_sync_time';
const LAST_FULL_SYNC_KEY = 'last_full_sync_time';
const FULL_SYNC_INTERVAL = 24 * 60 * 60 * 1000;

const SYNC_TIMEOUT_MS = 20000;
const CONNECTIVITY_TIMEOUT_MS = 8000;

/**
 * Guards against overlapping sync runs. A sync can be triggered by the store's
 * connectivity check, the NetInfo listener, and manual refresh — only one
 * Firebase sync may be in flight at a time.
 */
let syncInProgress = false;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

export async function performIncrementalSync(): Promise<{
  synced: number;
  deleted: number;
  fullSync: boolean;
}> {
  if (syncInProgress) {
    console.warn('[SYNC] Sync already in progress, skipping');
    return { synced: 0, deleted: 0, fullSync: false };
  }
  syncInProgress = true;

  try {
    const isOnline = await checkConnectivity();
    if (!isOnline) throw new Error('No internet connection');

    const hasData = await hasLocalData();
    const lastFullSyncStr = await getSyncMeta(LAST_FULL_SYNC_KEY);
    const lastFullSync = lastFullSyncStr ? parseInt(lastFullSyncStr, 10) : 0;
    const needsFullSync = !hasData || Date.now() - lastFullSync > FULL_SYNC_INTERVAL;

    let synced = 0;
    let deleted = 0;
    let fullSync = false;

    if (needsFullSync) {
      const contacts = await withTimeout(fetchAllContacts(), SYNC_TIMEOUT_MS, 'Full sync fetch');
      await upsertContacts(contacts);
      await setSyncMeta(LAST_FULL_SYNC_KEY, String(Date.now()));
      synced = contacts.length;
      fullSync = true;
    } else {
      const lastSyncStr = await getSyncMeta(LAST_SYNC_KEY);
      const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;

      const result = await withTimeout(syncChangedContacts(lastSync), SYNC_TIMEOUT_MS, 'Incremental sync fetch');
      if (result.changed.length > 0) {
        await upsertContacts(result.changed);
        synced = result.changed.length;
      }
      if (result.deleted.length > 0) {
        await deleteLocalContacts(result.deleted);
        deleted = result.deleted.length;
      }
    }

    await setSyncMeta(LAST_SYNC_KEY, String(Date.now()));
    return { synced, deleted, fullSync };
  } finally {
    syncInProgress = false;
  }
}

export async function checkConnectivity(): Promise<boolean> {
  try {
    const state = await withTimeout(NetInfo.fetch(), CONNECTIVITY_TIMEOUT_MS, 'Connectivity check');
    return state.isConnected ?? false;
  } catch {
    return false;
  }
}

export function onConnectivityChange(callback: (isConnected: boolean) => void): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    callback(state.isConnected ?? false);
  });
  return unsubscribe;
}
