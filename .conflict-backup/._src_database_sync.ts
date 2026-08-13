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
<<<<<<< HEAD
const LAST_FULL_SYNC_KEY = 'last_full_sync_time';
const FULL_SYNC_INTERVAL = 24 * 60 * 60 * 1000;
=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0

export async function performIncrementalSync(): Promise<{
  synced: number;
  deleted: number;
  fullSync: boolean;
}> {
  const isOnline = await checkConnectivity();
  if (!isOnline) throw new Error('No internet connection');

  const hasData = await hasLocalData();
<<<<<<< HEAD
  const lastFullSyncStr = await getSyncMeta(LAST_FULL_SYNC_KEY);
  const lastFullSync = lastFullSyncStr ? parseInt(lastFullSyncStr, 10) : 0;
  const needsFullSync = !hasData || Date.now() - lastFullSync > FULL_SYNC_INTERVAL;

=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  let synced = 0;
  let deleted = 0;
  let fullSync = false;

<<<<<<< HEAD
  if (needsFullSync) {
    const contacts = await fetchAllContacts();
    await upsertContacts(contacts);
    await setSyncMeta(LAST_FULL_SYNC_KEY, String(Date.now()));
=======
  if (!hasData) {
    const contacts = await fetchAllContacts();
    await upsertContacts(contacts);
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
    synced = contacts.length;
    fullSync = true;
  } else {
    const lastSyncStr = await getSyncMeta(LAST_SYNC_KEY);
    const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;

    const result = await syncChangedContacts(lastSync);
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
}

export async function checkConnectivity(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
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
