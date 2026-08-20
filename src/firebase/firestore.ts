import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
  writeBatch,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb as _getFirebaseDb } from './config';
import { Contact, ContactInput } from '@/types/contact';
import { COLLECTIONS } from './collections';

function db() { return _getFirebaseDb(); }

export interface SyncResult<T> {
  changed: T[];
  deleted: string[];
  lastSyncTime: number;
}

function toMillis(value: any): number {
  if (value == null) return Date.now();
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value === 'number') return value;
  const parsed = typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function str(value: any): string {
  return value == null ? '' : String(value);
}

function contactFromFirestore(id: string, data: any): Contact {
  return {
    id,
    'BD NO': str(data['BD NO']),
    RANK: str(data.RANK),
    NAME: str(data.NAME),
    DESIGNATION: str(data.DESIGNATION),
    'BRANCH / TRADE': str(data['BRANCH / TRADE']),
    'OFFICE ADDRESS': str(data['OFFICE ADDRESS'] ?? data.OFFICE),
    'RESIDENCE ADDRESS': str(data['RESIDENCE ADDRESS'] ?? data.RESIDENCE),
    'SERVICE MOBILE': str(data['SERVICE MOBILE']),
    'PERSONAL MOBILE': str(data['PERSONAL MOBILE']),
    'OFFICE TELEPHONE': str(data['OFFICE TELEPHONE']),
    'PERSONAL TELEPHONE': str(data['PERSONAL TELEPHONE']),
    REMARKS: str(data.REMARKS),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
    deleted: data.deleted === true,
    version: typeof data.version === 'number' ? data.version : 0,
  };
}

export async function fetchAllContacts(): Promise<Contact[]> {
  const q = query(
    collection(db(), COLLECTIONS.CONTACTS),
    orderBy('NAME', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => contactFromFirestore(d.id, d.data()));
}

export async function syncChangedContacts(lastSyncTime: number): Promise<SyncResult<Contact>> {
  const since = Timestamp.fromMillis(lastSyncTime);
  const q = query(
    collection(db(), COLLECTIONS.CONTACTS),
    where('updatedAt', '>', since),
    orderBy('updatedAt', 'asc'),
    limit(500)
  );
  const snapshot = await getDocs(q);
  const changed: Contact[] = [];
  const deleted: string[] = [];

  snapshot.docs.forEach((d) => {
    const data = d.data();
    if (data.deleted) {
      deleted.push(d.id);
    } else {
      changed.push(contactFromFirestore(d.id, data));
    }
  });

  return {
    changed,
    deleted,
    lastSyncTime: Date.now(),
  };
}

export function listenContactChanges(
  lastSyncTime: number,
  onChanged: (contacts: Contact[]) => void,
  onDeleted: (ids: string[]) => void,
  onError: (error: Error) => void
): () => void {
  const since = Timestamp.fromMillis(lastSyncTime);
  const q = query(
    collection(db(), COLLECTIONS.CONTACTS),
    where('updatedAt', '>', since),
    orderBy('updatedAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const changed: Contact[] = [];
      const deleted: string[] = [];

      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        if (change.type === 'removed' || data.deleted) {
          deleted.push(change.doc.id);
        } else {
          changed.push(contactFromFirestore(change.doc.id, data));
        }
      });

      if (changed.length > 0) onChanged(changed);
      if (deleted.length > 0) onDeleted(deleted);
    },
    onError
  );
}

export async function getContact(id: string): Promise<Contact | null> {
  const d = await getDoc(doc(db(), COLLECTIONS.CONTACTS, id));
  if (!d.exists()) return null;
  return contactFromFirestore(d.id, d.data());
}

export async function createContact(data: ContactInput): Promise<string> {
  const ref = doc(collection(db(), COLLECTIONS.CONTACTS));
  const contact = {
    ...data,
    'BD NO': data['BD NO']?.trim() || '',
    NAME: data.NAME?.trim() || '',
    RANK: data.RANK?.trim() || '',
    DESIGNATION: data.DESIGNATION?.trim() || '',
    'BRANCH / TRADE': data['BRANCH / TRADE']?.trim() || '',
    'OFFICE ADDRESS': data['OFFICE ADDRESS']?.trim() || '',
    'RESIDENCE ADDRESS': data['RESIDENCE ADDRESS']?.trim() || '',
    'SERVICE MOBILE': data['SERVICE MOBILE']?.trim() || '',
    'PERSONAL MOBILE': data['PERSONAL MOBILE']?.trim() || '',
    'OFFICE TELEPHONE': data['OFFICE TELEPHONE']?.trim() || '',
    'PERSONAL TELEPHONE': data['PERSONAL TELEPHONE']?.trim() || '',
    REMARKS: data.REMARKS?.trim() || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deleted: false,
    version: 1,
  };
  await setDoc(ref, contact);
  return ref.id;
}

export async function updateContact(id: string, data: Partial<ContactInput>): Promise<void> {
  const updateData: any = { ...data };
  updateData.updatedAt = serverTimestamp();
  updateData.version = Timestamp.now().toMillis();
  await setDoc(doc(db(), COLLECTIONS.CONTACTS, id), updateData, { merge: true });
}

export async function softDeleteContact(id: string): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.CONTACTS, id), {
    deleted: true,
    updatedAt: serverTimestamp(),
    version: Timestamp.now().toMillis(),
  });
}

export async function restoreContact(id: string): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.CONTACTS, id), {
    deleted: false,
    updatedAt: serverTimestamp(),
    version: Timestamp.now().toMillis(),
  });
}

export async function checkDuplicateBDNO(bdNo: string, excludeId?: string): Promise<boolean> {
  const q = query(
    collection(db(), COLLECTIONS.CONTACTS),
    where('BD NO', '==', bdNo.trim()),
    where('deleted', '==', false)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.some((d) => d.id !== excludeId);
}

const PHONE_FIELDS = [
  'SERVICE MOBILE',
  'PERSONAL MOBILE',
  'OFFICE TELEPHONE',
  'PERSONAL TELEPHONE',
] as const;

function normalizeMergeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function normalizeMergePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export async function bulkImportContacts(contacts: ContactInput[]): Promise<number> {
  const BATCH_SIZE = 500;
  const existing = await fetchAllContacts();

  // Identity index for merging so re-imports update existing contacts instead
  // of duplicating them. Precedence: BD NO, then any phone number, then NAME.
  // Phone/BD NO keys are normalized (e.g. "01769-405000" == "01769405000").
  const byBdNo = new Map<string, string>();
  const byPhone = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const c of existing) {
    const bd = normalizeMergeKey(c['BD NO']);
    const name = normalizeMergeKey(c.NAME);
    if (bd) byBdNo.set(bd, c.id);
    if (name) byName.set(name, c.id);
    for (const field of PHONE_FIELDS) {
      const phone = normalizeMergePhone(c[field] ?? '');
      if (phone) byPhone.set(phone, c.id);
    }
  }

  const phoneKeysOf = (contact: ContactInput): string[] =>
    PHONE_FIELDS.map((field) => normalizeMergePhone(contact[field] ?? '')).filter(Boolean);

  let imported = 0;
  let batch = writeBatch(db());
  const commitBatch = async () => {
    await batch.commit();
    batch = writeBatch(db());
  };

  for (const contact of contacts) {
    const bdKey = normalizeMergeKey(contact['BD NO'] ?? '');
    const nameKey = normalizeMergeKey(contact.NAME ?? '');
    const phoneKeys = phoneKeysOf(contact);
    let existingId: string | undefined;
    if (bdKey && byBdNo.has(bdKey)) {
      existingId = byBdNo.get(bdKey);
    } else {
      existingId = phoneKeys.map((k) => byPhone.get(k)).find((id) => !!id);
    }
    if (!existingId && nameKey && byName.has(nameKey)) {
      existingId = byName.get(nameKey);
    }

    // Only store values that are actually present so an update never wipes
    // fields the CSV doesn't include (or clears them with empty cells).
    const fields: Record<string, string> = {};
    for (const [key, value] of Object.entries(contact)) {
      const trimmed = typeof value === 'string' ? value.trim() : '';
      if (trimmed !== '') fields[key] = trimmed;
    }

    let ref;
    if (existingId) {
      ref = doc(db(), COLLECTIONS.CONTACTS, existingId);
      batch.set(
        ref,
        {
          ...fields,
          updatedAt: serverTimestamp(),
          deleted: false,
          version: Timestamp.now().toMillis(),
        },
        { merge: true }
      );
    } else {
      ref = doc(collection(db(), COLLECTIONS.CONTACTS));
      batch.set(ref, {
        ...fields,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deleted: false,
        version: 1,
      });
    }

    // Register this row's keys so duplicates within the same file collapse too.
    if (bdKey) byBdNo.set(bdKey, ref.id);
    if (nameKey) byName.set(nameKey, ref.id);
    for (const phone of phoneKeys) byPhone.set(phone, ref.id);

    imported++;
    if (imported % BATCH_SIZE === 0) {
      await commitBatch();
    }
  }
  if (imported % BATCH_SIZE !== 0) {
    await commitBatch();
  }
  return imported;
}

const DEMO_CONTACTS: ContactInput[] = [
  { 'BD NO': '001', RANK: 'Colonel', NAME: 'Abdur Rahman', DESIGNATION: 'Commanding Officer', 'OFFICE ADDRESS': 'Dhaka Cantonment', 'SERVICE MOBILE': '01711110001' },
  { 'BD NO': '002', RANK: 'Major', NAME: 'Shahidul Islam', DESIGNATION: 'Second in Command', 'OFFICE ADDRESS': 'Dhaka Cantonment', 'SERVICE MOBILE': '01711110002' },
  { 'BD NO': '003', RANK: 'Captain', NAME: 'Farhad Hossain', DESIGNATION: 'Adjutant', 'OFFICE ADDRESS': 'Dhaka Cantonment', 'SERVICE MOBILE': '01711110003' },
  { 'BD NO': '004', RANK: 'Lieutenant', NAME: 'Tanvir Ahmed', DESIGNATION: 'Platoon Commander', 'OFFICE ADDRESS': 'Savar Cantonment', 'SERVICE MOBILE': '01711110004' },
  { 'BD NO': '005', RANK: 'Subedar', NAME: 'Mohammad Ali', DESIGNATION: 'Company Havildar Major', 'OFFICE ADDRESS': 'Dhaka Cantonment', 'SERVICE MOBILE': '01711110005' },
  { 'BD NO': '006', RANK: 'Havildar', NAME: 'Abdul Malek', DESIGNATION: 'Section Commander', 'OFFICE ADDRESS': 'Chittagong Cantonment', 'SERVICE MOBILE': '01711110006' },
  { 'BD NO': '007', RANK: 'Naik', NAME: 'Shahidul Haque', 'OFFICE ADDRESS': 'Dhaka Cantonment', 'SERVICE MOBILE': '01711110007' },
  { 'BD NO': '008', RANK: 'Sepoy', NAME: 'Rafiqul Islam', 'OFFICE ADDRESS': 'Bogra Cantonment', 'SERVICE MOBILE': '01711110008' },
  { 'BD NO': '009', RANK: 'Colonel', NAME: 'Zahidul Alam', DESIGNATION: 'Brigade Commander', 'OFFICE ADDRESS': 'Comilla Cantonment', 'SERVICE MOBILE': '01711110009' },
  { 'BD NO': '010', RANK: 'Major', NAME: 'Atiqur Rahman', DESIGNATION: 'Brigade Major', 'OFFICE ADDRESS': 'Comilla Cantonment', 'SERVICE MOBILE': '01711110010' },
  { 'BD NO': '011', RANK: 'Wing Commander', NAME: 'Sayed Hossain', DESIGNATION: 'Base Commander', 'OFFICE ADDRESS': 'BAF Dhaka', 'SERVICE MOBILE': '01711110011' },
  { 'BD NO': '012', RANK: 'Squadron Leader', NAME: 'Kamrul Hasan', DESIGNATION: 'Flight Commander', 'OFFICE ADDRESS': 'BAF Dhaka', 'SERVICE MOBILE': '01711110012' },
  { 'BD NO': '013', RANK: 'Flight Lieutenant', NAME: 'Nazmul Huda', DESIGNATION: 'Pilot', 'OFFICE ADDRESS': 'BAF Jessore', 'SERVICE MOBILE': '01711110013' },
  { 'BD NO': '014', RANK: 'Commander', NAME: 'Moinul Islam', DESIGNATION: 'Base Commander', 'OFFICE ADDRESS': 'BNS Haji Mohiuddin', 'SERVICE MOBILE': '01711110014' },
  { 'BD NO': '015', RANK: 'Lieutenant Commander', NAME: 'Rashid Ahmed', DESIGNATION: 'Executive Officer', 'OFFICE ADDRESS': 'BNS Haji Mohiuddin', 'SERVICE MOBILE': '01711110015' },
  { 'BD NO': '016', RANK: 'Lieutenant', NAME: 'Faisal Mahmud', DESIGNATION: 'Watch Officer', 'OFFICE ADDRESS': 'BNS Sheikh Mujib', 'SERVICE MOBILE': '01711110016' },
  { 'BD NO': '017', RANK: 'ASP', NAME: 'Ruhul Amin', DESIGNATION: 'Officer-in-Charge', 'OFFICE ADDRESS': 'Ramna Police Station', 'SERVICE MOBILE': '01711110017' },
  { 'BD NO': '018', RANK: 'Inspector', NAME: 'Mizanur Rahman', DESIGNATION: 'Investigation Officer', 'OFFICE ADDRESS': 'Gulshan Police Station', 'SERVICE MOBILE': '01711110018' },
  { 'BD NO': '019', RANK: 'SI', NAME: 'Jahangir Alam', 'OFFICE ADDRESS': 'Mirpur Police Station', 'SERVICE MOBILE': '01711110019' },
  { 'BD NO': '020', RANK: 'Additional DIG', NAME: 'Harun-or-Rashid', DESIGNATION: 'DIG Headquarters', 'OFFICE ADDRESS': 'Police Headquarters Dhaka', 'SERVICE MOBILE': '01711110020' },
  { 'BD NO': '021', RANK: 'Colonel', NAME: 'A K M Shafiullah', DESIGNATION: 'Director', 'OFFICE ADDRESS': 'Mirpur Cantonment', 'SERVICE MOBILE': '01711110021' },
  { 'BD NO': '022', RANK: 'Major', NAME: 'Shafiqur Rahman', DESIGNATION: 'Staff Officer', 'OFFICE ADDRESS': 'Army Headquarters', 'SERVICE MOBILE': '01711110022' },
  { 'BD NO': '023', RANK: 'Captain', NAME: 'Sohel Rana', DESIGNATION: 'Training Officer', 'OFFICE ADDRESS': 'School of Infantry and Tactics', 'SERVICE MOBILE': '01711110023' },
  { 'BD NO': '024', RANK: 'Lance Corporal', NAME: 'Kuddus Ali', 'OFFICE ADDRESS': 'Rangpur Cantonment', 'SERVICE MOBILE': '01711110024' },
  { 'BD NO': '025', RANK: 'Sepoy', NAME: 'Iqbal Hossain', 'OFFICE ADDRESS': 'Sylhet Cantonment', 'SERVICE MOBILE': '01711110025', 'PERSONAL MOBILE': '01811110025' },
];

export async function seedDemoContacts(): Promise<number> {
  const batch = writeBatch(db());
  for (const contact of DEMO_CONTACTS) {
    const ref = doc(collection(db(), COLLECTIONS.CONTACTS));
    batch.set(ref, {
      ...contact,
      DESIGNATION: contact.DESIGNATION || '',
      'BRANCH / TRADE': contact['BRANCH / TRADE'] || '',
      'OFFICE ADDRESS': contact['OFFICE ADDRESS'] || '',
      'RESIDENCE ADDRESS': contact['RESIDENCE ADDRESS'] || '',
      'SERVICE MOBILE': contact['SERVICE MOBILE'] || '',
      'PERSONAL MOBILE': contact['PERSONAL MOBILE'] || '',
      'OFFICE TELEPHONE': contact['OFFICE TELEPHONE'] || '',
      'PERSONAL TELEPHONE': contact['PERSONAL TELEPHONE'] || '',
      REMARKS: contact.REMARKS || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deleted: false,
      version: 1,
    });
  }
  await batch.commit();
  return DEMO_CONTACTS.length;
}

export async function getAllContactsCursor(pageSize: number = 100, cursor?: DocumentSnapshot) {
  const constraints: QueryConstraint[] = [
    where('deleted', '==', false),
    orderBy('NAME', 'asc'),
    limit(pageSize),
  ];
  if (cursor) constraints.push(startAfter(cursor));

  const q = query(collection(db(), COLLECTIONS.CONTACTS), ...constraints);
  const snapshot = await getDocs(q);
  const contacts = snapshot.docs.map((d) => contactFromFirestore(d.id, d.data()));
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  return { contacts, cursor: lastDoc, hasMore: snapshot.docs.length === pageSize };
}
