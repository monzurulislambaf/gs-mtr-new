// Metro automatically resolves `./database` to `./database.web.ts` on web and
// `./database.ts` on native. The web shim avoids importing expo-sqlite (which
// crashes the web bundle via a Web Worker).
export {
  initializeDatabase,
  getAllContacts,
  getContactById,
  upsertContacts,
  deleteContacts,
  softDeleteContactLocal,
  restoreContactLocal,
  insertContact,
  updateContactLocal,
  setFavorite,
  getFavoriteContacts,
  getRecentContacts,
  searchContacts,
  getAllContactsCount,
  getDatabaseSize,
  clearAllContacts,
  getSyncMeta,
  setSyncMeta,
  hasLocalData,
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  initializeSearchHistoryTable,
} from './database';

export { performIncrementalSync, checkConnectivity, onConnectivityChange } from './sync';
