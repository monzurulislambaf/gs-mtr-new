import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from './config';
import { COLLECTIONS } from './collections';
import { profileFromFirestore, toAppUser } from './auth';
import { AppUser, UserProfile, UserRole, UserStatus } from '@/types/auth';

function db() {
  return getFirebaseDb();
}

/** Real-time listener for a single user profile (used by the auth store). */
export function listenUserProfile(
  uid: string,
  onProfile: (profile: UserProfile) => void,
  onError?: (error: Error) => void
): () => void {
  return onSnapshot(
    doc(db(), COLLECTIONS.USERS, uid),
    (snap) => {
      if (snap.exists()) onProfile(profileFromFirestore(snap.id, snap.data()));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function getPendingRegistrations(): Promise<UserProfile[]> {
  const q = query(
    collection(db(), COLLECTIONS.USERS),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => profileFromFirestore(d.id, d.data()));
}

/** Real-time pending registration list + count for the admin badge. */
export function listenPendingRegistrations(
  onResult: (profiles: UserProfile[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db(), COLLECTIONS.USERS),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      onResult(snapshot.docs.map((d) => profileFromFirestore(d.id, d.data())));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(db(), COLLECTIONS.USERS));
  return snapshot.docs.map((d) => profileFromFirestore(d.id, d.data()));
}

export async function getUserProfileById(uid: string): Promise<UserProfile | null> {
  const d = await getDoc(doc(db(), COLLECTIONS.USERS, uid));
  if (!d.exists()) return null;
  return profileFromFirestore(d.id, d.data());
}

/**
 * Approve a registration. Sets status = "approved" with server timestamp and
 * the approving admin's UID.
 */
export async function approveRegistration(uid: string, adminUid: string): Promise<void> {
  await setDoc(
    doc(db(), COLLECTIONS.USERS, uid),
    {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: adminUid,
      declinedAt: null,
      declinedBy: null,
      declineReason: null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Decline a registration with an optional admin-provided reason.
 */
export async function declineRegistration(
  uid: string,
  adminUid: string,
  reason?: string
): Promise<void> {
  await setDoc(
    doc(db(), COLLECTIONS.USERS, uid),
    {
      status: 'declined',
      declinedAt: serverTimestamp(),
      declinedBy: adminUid,
      declineReason: reason ? reason.trim() : '',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Generic status change (suspend, re-activate, etc.) by an admin. */
export async function setUserStatus(
  uid: string,
  status: UserStatus,
  adminUid: string,
  reason?: string
): Promise<void> {
  const update: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (status === 'approved') {
    update.approvedAt = serverTimestamp();
    update.approvedBy = adminUid;
  }
  if (status === 'declined') {
    update.declinedAt = serverTimestamp();
    update.declinedBy = adminUid;
    update.declineReason = reason ? reason.trim() : '';
  }
  await setDoc(doc(db(), COLLECTIONS.USERS, uid), update, { merge: true });
}

/** Role change (super admin only). */
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  await setDoc(
    doc(db(), COLLECTIONS.USERS, uid),
    { role, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export function userToAppUser(profile: UserProfile): AppUser {
  return toAppUser(profile);
}
