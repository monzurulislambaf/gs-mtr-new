/**
 * End-to-end verification of the GS MTR registration / login / approval flow.
 *
 * Runs against the LOCAL Firebase emulators (auth :9099, firestore :8080) using
 * the same client SDK calls the app makes, so the deployed firestore.rules are
 * exercised exactly as in production. firebase-admin is used ONLY to seed the
 * admin account and clean up afterwards.
 *
 * Usage: FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/verify-auth-flow.mjs
 */
import process from 'node:process';

process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';

const { initializeApp: initAdmin, cert: _cert } = await import('firebase-admin/app');
const { getAuth: getAdminAuth } = await import('firebase-admin/auth');
const { getFirestore: getAdminDb, Timestamp: AdminTimestamp } = await import('firebase-admin/firestore');

const { initializeApp } = await import('firebase/app');
const {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} = await import('firebase/auth');
const {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
} = await import('firebase/firestore');

// --- Client app (simulates the mobile app) -------------------------------
const clientApp = initializeApp({
  apiKey: 'emulator-key',
  projectId: 'pabx-mtr',
});
const auth = getAuth(clientApp);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
const db = getFirestore(clientApp);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

// --- Admin app (seeding + cleanup only) ----------------------------------
const adminApp = initAdmin({ projectId: 'pabx-mtr' }, 'admin-seed');
const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminDb(adminApp);

const ADMIN_EMAIL = 'verify.admin@gsmtr.test';
const ADMIN_PASS = 'AdminPass@123';
const USER_BD = '999999';
const USER_EMAIL = `verify.user.${Date.now()}@gsmtr.test`;
const USER_PASS = 'UserPass@123';

let failures = 0;
function check(name, ok, extra = '') {
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${name}${extra ? ` — ${extra}` : ''}`);
  if (!ok) failures += 1;
}

function expectDenied(error) {
  return !!error && (error.code === 'permission-denied' || /permission/i.test(error.message || ''));
}

async function waitForAuthState(userUid) {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u?.uid === userUid) {
        unsub();
        resolve(u);
      }
    });
  });
}

// --- 1. Seed admin ---------------------------------------------------------
console.log('\n=== Setup: seed admin account ===');
let adminUid;
try {
  const adminRecord = await adminAuth.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
    displayName: 'Verify Admin',
  });
  adminUid = adminRecord.uid;
  await adminDb.doc(`users/${adminUid}`).set({
    uid: adminUid,
    fullName: 'Verify Admin',
    email: ADMIN_EMAIL,
    role: 'admin',
    status: 'approved',
    createdAt: AdminTimestamp.now(),
    updatedAt: AdminTimestamp.now(),
  });
  check('admin seeded (auth user + users doc)', !!adminUid);
} catch (e) {
  check('admin seeded (auth user + users doc)', false, e.message);
}

// --- 2. User registration (exact app logic) --------------------------------
console.log('\n=== Registration ===');
let userUid;
try {
  // duplicate BD check (public userLookup read)
  const dup = await getDoc(doc(db, 'userLookup', USER_BD));
  check('userLookup readable pre-auth (anonymous)', true, `exists=${dup.exists()}`);

  const credential = await createUserWithEmailAndPassword(auth, USER_EMAIL, USER_PASS);
  userUid = credential.user.uid;

  const now = serverTimestamp();
  await setDoc(doc(db, 'users', userUid), {
    uid: userUid,
    fullName: 'Verify User',
    category: 'Airman',
    bdNumber: USER_BD,
    retired: false,
    rank: 'Sergeant',
    branch: 'GS',
    trade: '',
    course: '40',
    commissionDate: '2012-04-01',
    designation: 'Clerk',
    office: 'GS Office',
    email: USER_EMAIL,
    mobile: '01711110000',
    role: 'user',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });
  await setDoc(doc(db, 'userLookup', USER_BD), { uid: userUid, email: USER_EMAIL });

  const profile = (await getDoc(doc(db, 'users', userUid))).data();
  check('profile created with status pending', profile?.status === 'pending', `status=${profile?.status}`);
  check('profile created with role user', profile?.role === 'user', `role=${profile?.role}`);
  check('user can read own profile', true);
} catch (e) {
  check('registration creates account + profile + lookup', false, e.message);
}

// --- 3. Pending user gating -------------------------------------------------
console.log('\n=== Pending status gating ===');
try {
  await getDocs(collection(db, 'contacts'));
  check('pending user CANNOT read contacts', false, 'contacts were readable');
} catch (e) {
  check('pending user CANNOT read contacts', expectDenied(e), e.code || e.message);
}
try {
  await getDoc(doc(db, 'users', adminUid));
  check('pending user CANNOT read another user\'s profile', false, 'was readable');
} catch (e) {
  check('pending user CANNOT read another user\'s profile', expectDenied(e), e.code || e.message);
}

// --- 4. BD-number login -----------------------------------------------------
console.log('\n=== BD Number login ===');
try {
  await signOut(auth);
  const lookup = await getDoc(doc(db, 'userLookup', USER_BD));
  const email = lookup.data()?.email;
  const credential = await signInWithEmailAndPassword(auth, email, USER_PASS);
  const profile = (await getDoc(doc(db, 'users', credential.user.uid))).data();
  check('sign in with BD number + password works', credential.user.uid === userUid);
  check('status still pending after login', profile?.status === 'pending', `status=${profile?.status}`);
} catch (e) {
  check('sign in with BD number + password works', false, e.message);
}

// --- 5. Security: user cannot escalate --------------------------------------
console.log('\n=== Security rules ===');
try {
  await setDoc(doc(db, 'users', userUid), { role: 'admin', status: 'approved' }, { merge: true });
  check('user cannot change own role/status', false, 'write was allowed');
} catch (e) {
  check('user cannot change own role/status', expectDenied(e), e.code || e.message);
}
try {
  await setDoc(doc(db, 'userLookup', USER_BD), { uid: 'someone-else' }, { merge: true });
  check('user cannot modify userLookup mapping', false, 'write was allowed');
} catch (e) {
  check('user cannot modify userLookup mapping', expectDenied(e), e.code || e.message);
}

// --- 6. Admin approval -------------------------------------------------------
console.log('\n=== Admin approval ===');
try {
  await signOut(auth);
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);

  // admin sees the pending registration
  const pending = await getDocs(
    query(collection(db, 'users'), where('status', '==', 'pending'))
  );
  const found = pending.docs.some((d) => d.id === userUid);
  check('admin sees pending registrations', found, `count=${pending.size}`);

  // approve (app logic: approveRegistration)
  await setDoc(
    doc(db, 'users', userUid),
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
  const after = (await getDoc(doc(db, 'users', userUid))).data();
  check('approval sets status approved + approvedBy admin', after?.status === 'approved' && after?.approvedBy === adminUid);

  // approval removes it from pending
  const pending2 = await getDocs(
    query(collection(db, 'users'), where('status', '==', 'pending'))
  );
  check('approved registration removed from pending list', !pending2.docs.some((d) => d.id === userUid));
} catch (e) {
  check('admin approves registration', false, e.message);
}

// --- 7. Approved user access -------------------------------------------------
console.log('\n=== Approved user access ===');
try {
  await signOut(auth);
  await signInWithEmailAndPassword(auth, USER_EMAIL, USER_PASS);
  const snapshot = await getDocs(collection(db, 'contacts'));
  check('approved user can read contacts', true, `contacts visible=${snapshot.size}`);
} catch (e) {
  check('approved user can read contacts', false, e.message);
}

// --- Cleanup -----------------------------------------------------------------
console.log('\n=== Cleanup ===');
try {
  await adminDb.doc(`users/${userUid}`).delete();
  await adminDb.doc(`userLookup/${USER_BD}`).delete();
  await adminDb.doc(`users/${adminUid}`).delete();
  await adminAuth.deleteUser(userUid);
  await adminAuth.deleteUser(adminUid);
  check('test data removed', true);
} catch (e) {
  check('test data removed', false, e.message);
}

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
