import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './config';
import { AppUser, UserRole } from '@/types/auth';

const ADMIN_EMAILS = (process.env.EXPO_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

function mapFirebaseUser(user: FirebaseUser, role: UserRole = 'user'): AppUser {
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || '',
    role,
    photoURL: user.photoURL || undefined,
    createdAt: Date.now(),
  };
}

async function ensureUserDoc(db: any, uid: string, email: string, displayName: string): Promise<UserRole> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return (userDoc.data().role || 'user') as UserRole;
  }
  const role: UserRole = isAdminEmail(email) ? 'admin' : 'user';
  await setDoc(userRef, {
    uid,
    email: email || '',
    displayName: displayName || email?.split('@')[0] || '',
    role,
    createdAt: serverTimestamp(),
  });
  return role;
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const role = await ensureUserDoc(
    db,
    credential.user.uid,
    credential.user.email || email,
    credential.user.displayName || ''
  );
  return mapFirebaseUser(credential.user, role);
}

export async function signUp(email: string, password: string, name: string): Promise<AppUser> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const role = await ensureUserDoc(
    db,
    credential.user.uid,
    credential.user.email || email,
    name
  );
  return mapFirebaseUser(credential.user, role);
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: AppUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const role = await ensureUserDoc(
        db,
        firebaseUser.uid,
        firebaseUser.email || '',
        firebaseUser.displayName || ''
      );
      callback(mapFirebaseUser(firebaseUser, role));
    } else {
      callback(null);
    }
  });
}

export async function resetPassword(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
}
