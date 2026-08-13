<<<<<<< HEAD
// Metro automatically resolves `./database` to `./database.web.ts` on web and
// `./database.ts` on native. The web shim avoids importing expo-sqlite (which
// crashes the web bundle via a Web Worker).
=======
export { withDb } from './schema';
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
export {
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
<<<<<<< HEAD
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  initializeSearchHistoryTable,
} from './database';

export { performIncrementalSync, checkConnectivity, onConnectivityChange } from './sync';
=======
} from './database';
export { performIncrementalSync, checkConnectivity, onConnectivityChange } from './sync';
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
