import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  inMemoryPersistence,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb, nativePersistence } from './config';
import { COLLECTIONS } from './collections';
import {
  AppUser,
  UserProfile,
  UserRole,
  UserStatus,
  RegistrationInput,
  isAdminRole,
} from '@/types/auth';

const VALID_STATUSES: UserStatus[] = ['pending', 'approved', 'declined', 'suspended'];

function normalizeStatus(status: unknown, role: UserRole): UserStatus {
  if (VALID_STATUSES.includes(status as UserStatus)) return status as UserStatus;
  // Admins provisioned via Firebase console may not carry a status field yet.
  return isAdminRole(role) ? 'approved' : 'pending';
}

function str(value: any): string {
  return value == null ? '' : String(value);
}

function num(value: any): number {
  if (value == null) return Date.now();
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value === 'number') return value;
  const parsed = typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function bool(value: any): boolean {
  return value === true;
}

export function profileFromFirestore(uid: string, data: any): UserProfile {
  const role: UserRole =
    data.role === 'super_admin' ? 'super_admin'
    : data.role === 'admin' ? 'admin'
    : 'user';
  return {
    uid,
    fullName: str(data.fullName) || str(data.displayName) || str(data.email) || '',
    category: data.category === 'Airman' || data.category === 'Civilian' ? data.category : 'Officer',
    bdNumber: str(data.bdNumber),
    retired: bool(data.retired),
    rank: str(data.rank),
    branch: str(data.branch),
    trade: str(data.trade),
    course: str(data.course),
    commissionDate: str(data.commissionDate),
    designation: str(data.designation),
    office: str(data.office),
    email: str(data.email),
    mobile: str(data.mobile),
    role,
    status: normalizeStatus(data.status, role),
    createdAt: num(data.createdAt),
    updatedAt: num(data.updatedAt),
    approvedAt: data.approvedAt == null ? undefined : num(data.approvedAt),
    approvedBy: data.approvedBy ? str(data.approvedBy) : undefined,
    declinedAt: data.declinedAt == null ? undefined : num(data.declinedAt),
    declinedBy: data.declinedBy ? str(data.declinedBy) : undefined,
    declineReason: data.declineReason ? str(data.declineReason) : undefined,
  };
}

export function toAppUser(profile: UserProfile): AppUser {
  return {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.fullName,
    role: profile.role,
    status: profile.status,
    bdNumber: profile.bdNumber,
    category: profile.category,
    rank: profile.rank,
    branch: profile.branch,
    createdAt: profile.createdAt,
    declineReason: profile.declineReason,
    profileComplete: true,
  };
}

function fallbackUser(firebaseUser: FirebaseUser): AppUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
    role: 'user',
    status: 'pending',
    bdNumber: '',
    createdAt: Date.now(),
    profileComplete: false,
  };
}

/** Fetches the Firestore users/{uid} profile document. */
export async function getUserProfile(uid: string): Promise<UserProfile> {
  const db = getFirebaseDb();
  const d = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!d.exists()) throw new Error('User profile not found');
  return profileFromFirestore(d.id, d.data());
}

/**
 * Request Registration: creates the Firebase Auth account and the Firestore
 * user profile with status = "pending" / role = "user", plus the BD-number
 * -> { uid, email } login mapping. Passwords never touch Firestore.
 */
export async function requestRegistration(input: RegistrationInput): Promise<void> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const bdNumber = input.bdNumber.trim();
  const email = input.email.trim();

  // BD numbers are unique: check the login mapping before creating anything.
  const lookupRef = doc(db, COLLECTIONS.USER_LOOKUP, bdNumber);
  const existing = await getDoc(lookupRef);
  if (existing.exists()) {
    throw new Error('This BD Number is already registered.');
  }

  const credential = await createUserWithEmailAndPassword(auth, email, input.password);
  const uid = credential.user.uid;
  const now = serverTimestamp();

  await setDoc(doc(db, COLLECTIONS.USERS, uid), {
    uid,
    fullName: input.fullName.trim(),
    category: input.category,
    bdNumber,
    retired: input.retired,
    rank: input.rank.trim(),
    branch: input.branch.trim(),
    trade: input.trade.trim(),
    course: input.course.trim(),
    commissionDate: input.commissionDate,
    designation: input.designation.trim(),
    office: input.office.trim(),
    email,
    mobile: input.mobile.trim(),
    role: 'user',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });

  await setDoc(lookupRef, { uid, email });
}

/**
 * BD Number login. Resolves the BD number to the Firebase Auth identity via
 * the userLookup mapping, authenticates with email + password (handled only by
 * Firebase Auth), then loads users/{uid} and returns the profile so the caller
 * can enforce the account status check.
 */
export async function signInWithBDNumber(
  bdNumber: string,
  password: string,
  rememberMe = true
): Promise<AppUser> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const bd = bdNumber.trim();

  const lookup = await getDoc(doc(db, COLLECTIONS.USER_LOOKUP, bd));
  if (!lookup.exists()) {
    throw new Error('No account found for this BD Number. Please request registration first.');
  }
  const email = str(lookup.data().email);
  if (!email) {
    throw new Error('Account lookup failed. Please contact the administrator.');
  }

  // Remember Me: keep the session on this device, otherwise keep it in memory only.
  await setPersistence(auth, rememberMe ? nativePersistence : inMemoryPersistence);

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);
  return toAppUser(profile);
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

/**
 * Firebase Auth state listener. Yields the session user (AppUser) or null.
 * If the Firestore profile cannot be loaded (offline), a minimal profile is
 * derived from the Firebase user so the app can keep its cached session.
 */
export function onAuthChange(callback: (user: AppUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();

  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    try {
      const d = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
      if (d.exists()) {
        callback(toAppUser(profileFromFirestore(d.id, d.data())));
        return;
      }
    } catch {
      // Offline or rules rejection: fall through to the fallback identity.
    }
    // No profile doc (yet): report a minimal pending user so contact access
    // is never granted without an approved profile. The profile listener in
    // the auth store picks up the real document as soon as it is written.
    callback(fallbackUser(firebaseUser));
  });
}

/**
 * Forgot Password: accepts either an email address or a BD number. Passwords
 * are reset by Firebase Auth only — never stored or handled by this app.
 */
export async function resetPassword(identifier: string): Promise<void> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const input = identifier.trim();

  let email = input;
  if (!input.includes('@')) {
    const lookup = await getDoc(doc(db, COLLECTIONS.USER_LOOKUP, input));
    if (!lookup.exists()) {
      throw new Error('No account found for this BD Number.');
    }
    email = str(lookup.data().email);
    if (!email) throw new Error('Account lookup failed. Please contact the administrator.');
  }
  await sendPasswordResetEmail(auth, email);
}
