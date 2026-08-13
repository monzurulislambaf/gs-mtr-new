import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

function createNativePersistence(storage: any): any {
  return class {
    type: 'LOCAL' = 'LOCAL';
    async _isAvailable() {
      try {
        if (!storage) return false;
        await storage.setItem('__firebase_key', '1');
        await storage.removeItem('__firebase_key');
        return true;
      } catch { return false; }
    }
    _set(key: string, value: any) { return storage.setItem(key, JSON.stringify(value)); }
    async _get(key: string) {
      const json = await storage.getItem(key);
      return json ? JSON.parse(json) : null;
    }
    _remove(key: string) { return storage.removeItem(key); }
    _addListener(_key: string, _listener: any) {}
    _removeListener(_key: string, _listener: any) {}
  };
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

export function initializeFirebase(): void {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: createNativePersistence(AsyncStorage),
    });
    db = getFirestore(app);
    storage = getStorage(app);
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) throw new Error('Firebase not initialized');
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) throw new Error('Firestore not initialized');
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) throw new Error('Storage not initialized');
  return storage;
}
