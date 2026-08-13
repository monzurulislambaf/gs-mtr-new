import { Platform } from 'react-native';
import { Contact, ContactRow } from '@/types/contact';

const isWeb = Platform.OS === 'web';

const STORAGE_KEY = 'gsmtr_contacts_v1';
const META_KEY = 'gsmtr_sync_meta_v1';
const HISTORY_KEY = 'gsmtr_search_history_v1';

interface StoredContact extends Contact {}

function readStore(): Map<string, StoredContact> {
  if (!isWeb) return new Map();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: StoredContact[] = raw ? JSON.parse(raw) : [];
    return new Map(arr.map((c) => [c.id, c]));
  } catch {
    return new Map();
  }
}

function writeStore(store: Map<string, StoredContact>): void {
  if (!isWeb) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(store.values())));
  } catch {}
}

function readMeta(): Record<string, string> {
  if (!isWeb) return {};
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMeta(meta: Record<string, string>): void {
  if (!isWeb) return;
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {}
}

function readHistory(): string[] {
  if (!isWeb) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHistory(history: string[]): void {
  if (!isWeb) return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

function cloneContact(c: StoredContact): StoredContact {
  return { ...c };
}

export async function initializeDatabase(): Promise<void> {
  // No-op on web: storage is localStorage, no explicit init required.
}

export async function getAllContacts(): Promise<Contact[]> {
  const store = readStore();
  return Array.from(store.values())
    .filter((c) => !c.deleted)
    .sort((a, b) => a.NAME.localeCompare(b.NAME));
}

export async function getContactById(id: string): Promise<Contact | null> {
  const store = readStore();
  return store.get(id) ? cloneContact(store.get(id)!) : null;
}

export async function upsertContacts(contacts: Contact[]): Promise<void> {
  const store = readStore();
  for (const c of contacts) {
    store.set(c.id, cloneContact(c));
  }
  writeStore(store);
}

export async function deleteContacts(ids: string[]): Promise<void> {
  const store = readStore();
  for (const id of ids) {
    store.delete(id);
  }
  writeStore(store);
}

export async function softDeleteContactLocal(id: string): Promise<void> {
  const store = readStore();
  const c = store.get(id);
  if (c) {
    c.deleted = true;
    c.updatedAt = Date.now();
    store.set(id, c);
    writeStore(store);
  }
}

export async function restoreContactLocal(id: string): Promise<void> {
  const store = readStore();
  const c = store.get(id);
  if (c) {
    c.deleted = false;
    c.updatedAt = Date.now();
    store.set(id, c);
    writeStore(store);
  }
}

export async function insertContact(contact: Contact): Promise<void> {
  const store = readStore();
  store.set(contact.id, cloneContact(contact));
  writeStore(store);
}

export async function updateContactLocal(id: string, data: Partial<Contact>): Promise<void> {
  const store = readStore();
  const c = store.get(id);
  if (c) {
    Object.assign(c, data, { updatedAt: Date.now() });
    store.set(id, c);
    writeStore(store);
  }
}

export async function setFavorite(id: string, favorite: boolean): Promise<void> {
  const store = readStore();
  const c = store.get(id);
  if (c) {
    c.favorite = favorite;
    store.set(id, c);
    writeStore(store);
  }
}

export async function getFavoriteContacts(): Promise<Contact[]> {
  const store = readStore();
  return Array.from(store.values())
    .filter((c) => !c.deleted && c.favorite)
    .sort((a, b) => a.NAME.localeCompare(b.NAME));
}

export async function getRecentContacts(): Promise<Contact[]> {
  const store = readStore();
  return Array.from(store.values())
    .filter((c) => !c.deleted)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 20);
}

export async function searchContacts(query: string): Promise<Contact[]> {
  const store = readStore();
  const q = query.toLowerCase();
  const all = Array.from(store.values()).filter((c) => !c.deleted);
  const filtered = all.filter((c) =>
    c.NAME.toLowerCase().includes(q) ||
    c['BD NO'].toLowerCase().includes(q) ||
    c.RANK.toLowerCase().includes(q) ||
    c.DESIGNATION.toLowerCase().includes(q) ||
    c['BRANCH / TRADE'].toLowerCase().includes(q) ||
    c['OFFICE ADDRESS'].toLowerCase().includes(q) ||
    c['RESIDENCE ADDRESS'].toLowerCase().includes(q) ||
    c['SERVICE MOBILE'].toLowerCase().includes(q) ||
    c['PERSONAL MOBILE'].toLowerCase().includes(q) ||
    c['OFFICE TELEPHONE'].toLowerCase().includes(q) ||
    c['PERSONAL TELEPHONE'].toLowerCase().includes(q) ||
    c.REMARKS.toLowerCase().includes(q)
  );
  return filtered
    .sort((a, b) => {
      const aStarts = a.NAME.toLowerCase().startsWith(q) || a['BD NO'].toLowerCase().startsWith(q);
      const bStarts = b.NAME.toLowerCase().startsWith(q) || b['BD NO'].toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.NAME.localeCompare(b.NAME);
    })
    .slice(0, 200);
}

export async function getAllContactsCount(): Promise<number> {
  const store = readStore();
  return Array.from(store.values()).filter((c) => !c.deleted).length;
}

export async function getDatabaseSize(): Promise<string> {
  if (!isWeb) return '0 KB';
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const size = raw.length;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return '0 KB';
  }
}

export async function clearAllContacts(): Promise<void> {
  if (!isWeb) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(META_KEY);
}

export async function getSyncMeta(key: string): Promise<string | null> {
  const meta = readMeta();
  return meta[key] ?? null;
}

export async function setSyncMeta(key: string, value: string): Promise<void> {
  const meta = readMeta();
  meta[key] = value;
  writeMeta(meta);
}

export async function hasLocalData(): Promise<boolean> {
  const count = await getAllContactsCount();
  return count > 0;
}

let searchHistoryInitialized = false;

export async function initializeSearchHistoryTable(): Promise<void> {
  searchHistoryInitialized = true;
}

export async function addToSearchHistory(query: string): Promise<void> {
  if (!query.trim()) return;
  const history = readHistory();
  const idx = history.indexOf(query.trim());
  if (idx >= 0) history.splice(idx, 1);
  history.unshift(query.trim());
  if (history.length > 20) history.length = 20;
  writeHistory(history);
}

export async function getSearchHistory(limit: number = 10): Promise<string[]> {
  const history = readHistory();
  return history.slice(0, limit);
}

export async function clearSearchHistory(): Promise<void> {
  writeHistory([]);
}