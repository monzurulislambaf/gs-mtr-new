export { initializeFirebase, getFirebaseApp, getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from './config';
export { signIn, signUp, signOut, onAuthChange, resetPassword } from './auth';
export {
  fetchAllContacts,
  syncChangedContacts,
  listenContactChanges,
  getContact,
  createContact,
  updateContact,
  softDeleteContact,
  restoreContact,
  checkDuplicateBDNO,
  bulkImportContacts,
  seedDemoContacts,
  getAllContactsCursor,
} from './firestore';
export { COLLECTIONS } from './collections';
