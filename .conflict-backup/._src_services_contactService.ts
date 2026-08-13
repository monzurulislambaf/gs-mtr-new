import { Contact, ContactInput } from '@/types/contact';
import {
  createContact as fbCreate,
  updateContact as fbUpdate,
  softDeleteContact as fbDelete,
  restoreContact as fbRestore,
  checkDuplicateBDNO,
} from '@/firebase/firestore';
import {
  insertContact as localInsert,
  updateContactLocal,
  softDeleteContactLocal,
  restoreContactLocal,
} from '@/database/database';

export async function createNewContact(data: ContactInput): Promise<string> {
<<<<<<< HEAD
  if (data['BD NO']?.trim()) {
    const isDuplicate = await checkDuplicateBDNO(data['BD NO']);
    if (isDuplicate) {
      throw new Error('A contact with this BD NO already exists');
    }
=======
  const isDuplicate = await checkDuplicateBDNO(data['BD NO']);
  if (isDuplicate) {
    throw new Error('A contact with this BD NO already exists');
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  }

  const id = await fbCreate(data);
  const contact: Contact = {
    id,
    ...data,
    DESIGNATION: data.DESIGNATION || '',
    'BRANCH / TRADE': data['BRANCH / TRADE'] || '',
<<<<<<< HEAD
    'OFFICE ADDRESS': data['OFFICE ADDRESS'] || '',
    'RESIDENCE ADDRESS': data['RESIDENCE ADDRESS'] || '',
    'SERVICE MOBILE': data['SERVICE MOBILE'] || '',
    'PERSONAL MOBILE': data['PERSONAL MOBILE'] || '',
    'OFFICE TELEPHONE': data['OFFICE TELEPHONE'] || '',
    'PERSONAL TELEPHONE': data['PERSONAL TELEPHONE'] || '',
=======
    OFFICE: data.OFFICE || '',
    RESIDENCE: data.RESIDENCE || '',
    'SERVICE MOBILE': data['SERVICE MOBILE'] || '',
    'PERSONAL MOBILE': data['PERSONAL MOBILE'] || '',
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
    REMARKS: data.REMARKS || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deleted: false,
    version: 1,
  };
  await localInsert(contact);
  return id;
}

export async function editContact(id: string, data: Partial<ContactInput>): Promise<void> {
  if (data['BD NO']) {
    const isDuplicate = await checkDuplicateBDNO(data['BD NO'], id);
    if (isDuplicate) {
      throw new Error('A contact with this BD NO already exists');
    }
  }
  await fbUpdate(id, data);
  await updateContactLocal(id, data as any);
}

export async function deleteContact(id: string): Promise<void> {
  await fbDelete(id);
  await softDeleteContactLocal(id);
}

export async function restoreContactById(id: string): Promise<void> {
  await fbRestore(id);
  await restoreContactLocal(id);
}
