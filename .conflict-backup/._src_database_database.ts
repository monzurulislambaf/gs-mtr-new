import { Contact, ContactRow } from '@/types/contact';
import { withDb } from './schema';

function contactRowToContact(row: ContactRow): Contact {
  return {
    id: row.id,
    'BD NO': row.bd_no,
    RANK: row.rank,
    NAME: row.name,
    DESIGNATION: row.designation,
    'BRANCH / TRADE': row.branch_trade,
<<<<<<< HEAD
    'OFFICE ADDRESS': row.office_address,
    'RESIDENCE ADDRESS': row.residence_address,
    'SERVICE MOBILE': row.service_mobile,
    'PERSONAL MOBILE': row.personal_mobile,
    'OFFICE TELEPHONE': row.office_telephone,
    'PERSONAL TELEPHONE': row.personal_telephone,
=======
    OFFICE: row.office,
    RESIDENCE: row.residence,
    'SERVICE MOBILE': row.service_mobile,
    'PERSONAL MOBILE': row.personal_mobile,
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
    REMARKS: row.remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: row.deleted === 1,
    version: row.version,
    favorite: row.favorite === 1,
  };
}

function contactToRow(contact: Contact): ContactRow {
  return {
    id: contact.id,
    bd_no: contact['BD NO'],
    rank: contact.RANK,
    name: contact.NAME,
    designation: contact.DESIGNATION || '',
    branch_trade: contact['BRANCH / TRADE'] || '',
<<<<<<< HEAD
    office_address: contact['OFFICE ADDRESS'] || '',
    residence_address: contact['RESIDENCE ADDRESS'] || '',
    service_mobile: contact['SERVICE MOBILE'] || '',
    personal_mobile: contact['PERSONAL MOBILE'] || '',
    office_telephone: contact['OFFICE TELEPHONE'] || '',
    personal_telephone: contact['PERSONAL TELEPHONE'] || '',
=======
    office: contact.OFFICE || '',
    residence: contact.RESIDENCE || '',
    service_mobile: contact['SERVICE MOBILE'] || '',
    personal_mobile: contact['PERSONAL MOBILE'] || '',
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
    remarks: contact.REMARKS || '',
    created_at: contact.createdAt,
    updated_at: contact.updatedAt,
    deleted: contact.deleted ? 1 : 0,
    version: contact.version,
    favorite: contact.favorite ? 1 : 0,
  };
}

export async function getAllContacts(): Promise<Contact[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<ContactRow>(
      'SELECT * FROM contacts WHERE deleted = 0 ORDER BY name ASC'
    );
    return rows.map(contactRowToContact);
  });
}

export async function getContactById(id: string): Promise<Contact | null> {
  return withDb(async (db) => {
    const row = await db.getFirstAsync<ContactRow>(
      'SELECT * FROM contacts WHERE id = ?',
      id
    );
    return row ? contactRowToContact(row) : null;
  });
}

export async function upsertContacts(contacts: Contact[]): Promise<void> {
  return withDb(async (db) => {
    const statement = await db.prepareAsync(
<<<<<<< HEAD
      `INSERT OR REPLACE INTO contacts (id, bd_no, rank, name, designation, branch_trade, office_address, residence_address, service_mobile, personal_mobile, office_telephone, personal_telephone, remarks, created_at, updated_at, deleted, version, favorite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
=======
      `INSERT OR REPLACE INTO contacts (id, bd_no, rank, name, designation, branch_trade, office, residence, service_mobile, personal_mobile, remarks, created_at, updated_at, deleted, version, favorite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
    );

    for (const contact of contacts) {
      const row = contactToRow(contact);
      await statement.executeAsync(
        row.id, row.bd_no, row.rank, row.name, row.designation, row.branch_trade,
<<<<<<< HEAD
        row.office_address, row.residence_address, row.service_mobile, row.personal_mobile,
        row.office_telephone, row.personal_telephone,
=======
        row.office, row.residence, row.service_mobile, row.personal_mobile,
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
        row.remarks, row.created_at, row.updated_at, row.deleted, row.version, row.favorite
      );
    }
    await statement.finalizeAsync();
  });
}

export async function deleteContacts(ids: string[]): Promise<void> {
  return withDb(async (db) => {
    for (const id of ids) {
      await db.runAsync('DELETE FROM contacts WHERE id = ?', id);
    }
  });
}

export async function softDeleteContactLocal(id: string): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync(
      'UPDATE contacts SET deleted = 1, updated_at = ? WHERE id = ?',
      Date.now(), id
    );
  });
}

export async function restoreContactLocal(id: string): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync(
      'UPDATE contacts SET deleted = 0, updated_at = ? WHERE id = ?',
      Date.now(), id
    );
  });
}

export async function insertContact(contact: Contact): Promise<void> {
  return withDb(async (db) => {
    const row = contactToRow(contact);
    await db.runAsync(
<<<<<<< HEAD
      `INSERT OR REPLACE INTO contacts (id, bd_no, rank, name, designation, branch_trade, office_address, residence_address, service_mobile, personal_mobile, office_telephone, personal_telephone, remarks, created_at, updated_at, deleted, version, favorite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      row.id, row.bd_no, row.rank, row.name, row.designation, row.branch_trade,
      row.office_address, row.residence_address, row.service_mobile, row.personal_mobile,
      row.office_telephone, row.personal_telephone,
=======
      `INSERT OR REPLACE INTO contacts (id, bd_no, rank, name, designation, branch_trade, office, residence, service_mobile, personal_mobile, remarks, created_at, updated_at, deleted, version, favorite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      row.id, row.bd_no, row.rank, row.name, row.designation, row.branch_trade,
      row.office, row.residence, row.service_mobile, row.personal_mobile,
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
      row.remarks, row.created_at, row.updated_at, row.deleted, row.version, row.favorite
    );
  });
}

export async function updateContactLocal(id: string, data: Partial<Contact>): Promise<void> {
  return withDb(async (db) => {
    const fields: string[] = [];
    const values: any[] = [];

    if (data['BD NO'] !== undefined) { fields.push('bd_no = ?'); values.push(data['BD NO']); }
    if (data.RANK !== undefined) { fields.push('rank = ?'); values.push(data.RANK); }
    if (data.NAME !== undefined) { fields.push('name = ?'); values.push(data.NAME); }
    if (data.DESIGNATION !== undefined) { fields.push('designation = ?'); values.push(data.DESIGNATION); }
    if (data['BRANCH / TRADE'] !== undefined) { fields.push('branch_trade = ?'); values.push(data['BRANCH / TRADE']); }
<<<<<<< HEAD
    if (data['OFFICE ADDRESS'] !== undefined) { fields.push('office_address = ?'); values.push(data['OFFICE ADDRESS']); }
    if (data['RESIDENCE ADDRESS'] !== undefined) { fields.push('residence_address = ?'); values.push(data['RESIDENCE ADDRESS']); }
    if (data['SERVICE MOBILE'] !== undefined) { fields.push('service_mobile = ?'); values.push(data['SERVICE MOBILE']); }
    if (data['PERSONAL MOBILE'] !== undefined) { fields.push('personal_mobile = ?'); values.push(data['PERSONAL MOBILE']); }
    if (data['OFFICE TELEPHONE'] !== undefined) { fields.push('office_telephone = ?'); values.push(data['OFFICE TELEPHONE']); }
    if (data['PERSONAL TELEPHONE'] !== undefined) { fields.push('personal_telephone = ?'); values.push(data['PERSONAL TELEPHONE']); }
=======
    if (data.OFFICE !== undefined) { fields.push('office = ?'); values.push(data.OFFICE); }
    if (data.RESIDENCE !== undefined) { fields.push('residence = ?'); values.push(data.RESIDENCE); }
    if (data['SERVICE MOBILE'] !== undefined) { fields.push('service_mobile = ?'); values.push(data['SERVICE MOBILE']); }
    if (data['PERSONAL MOBILE'] !== undefined) { fields.push('personal_mobile = ?'); values.push(data['PERSONAL MOBILE']); }
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
    if (data.REMARKS !== undefined) { fields.push('remarks = ?'); values.push(data.REMARKS); }
    if (data.version !== undefined) { fields.push('version = ?'); values.push(data.version); }
    if (data.deleted !== undefined) { fields.push('deleted = ?'); values.push(data.deleted ? 1 : 0); }

    fields.push('updated_at = ?');
    values.push(data.updatedAt || Date.now());

    values.push(id);
    await db.runAsync(
      `UPDATE contacts SET ${fields.join(', ')} WHERE id = ?`,
      ...values
    );
  });
}

export async function setFavorite(id: string, favorite: boolean): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync('UPDATE contacts SET favorite = ? WHERE id = ?', favorite ? 1 : 0, id);
  });
}

export async function getFavoriteContacts(): Promise<Contact[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<ContactRow>(
      'SELECT * FROM contacts WHERE deleted = 0 AND favorite = 1 ORDER BY name ASC'
    );
    return rows.map(contactRowToContact);
  });
}

export async function getRecentContacts(): Promise<Contact[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<ContactRow>(
      'SELECT * FROM contacts WHERE deleted = 0 ORDER BY updated_at DESC LIMIT 20'
    );
    return rows.map(contactRowToContact);
  });
}

export async function searchContacts(query: string): Promise<Contact[]> {
  return withDb(async (db) => {
    const searchTerm = `%${query}%`;
    const rows = await db.getAllAsync<ContactRow>(
      `SELECT * FROM contacts WHERE deleted = 0 AND (
        name LIKE ? OR
        bd_no LIKE ? OR
        rank LIKE ? OR
        designation LIKE ? OR
        branch_trade LIKE ? OR
<<<<<<< HEAD
        office_address LIKE ? OR
        residence_address LIKE ? OR
        service_mobile LIKE ? OR
        personal_mobile LIKE ? OR
        office_telephone LIKE ? OR
        personal_telephone LIKE ? OR
=======
        office LIKE ? OR
        residence LIKE ? OR
        service_mobile LIKE ? OR
        personal_mobile LIKE ? OR
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
        remarks LIKE ?
      ) ORDER BY
        CASE
          WHEN name LIKE ? THEN 0
          WHEN bd_no LIKE ? THEN 1
          ELSE 2
        END,
        name ASC
      LIMIT 200`,
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
<<<<<<< HEAD
      searchTerm, searchTerm,
=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
      `${query}%`, `${query}%`
    );
    return rows.map(contactRowToContact);
  });
}

export async function getAllContactsCount(): Promise<number> {
  return withDb(async (db) => {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM contacts WHERE deleted = 0'
    );
    return result?.count || 0;
  });
}

export async function getDatabaseSize(): Promise<string> {
  return withDb(async (db) => {
    const result = await db.getFirstAsync<{ size: number }>(
      "SELECT page_count * page_size as size FROM pragma_page_count, pragma_page_size"
    );
    if (!result) return '0 KB';
    const size = result.size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  });
}

export async function clearAllContacts(): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync('DELETE FROM contacts');
    await db.runAsync('DELETE FROM sync_meta');
  });
}

export async function getSyncMeta(key: string): Promise<string | null> {
  return withDb(async (db) => {
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM sync_meta WHERE key = ?', key
    );
    return result?.value || null;
  });
}

export async function setSyncMeta(key: string, value: string): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync(
      'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
      key, value
    );
  });
}

export async function hasLocalData(): Promise<boolean> {
  const count = await getAllContactsCount();
  return count > 0;
}
<<<<<<< HEAD

const SEARCH_HISTORY_TABLE = 'search_history';

export async function initializeSearchHistoryTable(): Promise<void> {
  return withDb(async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${SEARCH_HISTORY_TABLE} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL UNIQUE,
        timestamp INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
    `);
  });
}

export async function addToSearchHistory(query: string): Promise<void> {
  if (!query.trim()) return;
  return withDb(async (db) => {
    await db.runAsync(
      `INSERT OR REPLACE INTO ${SEARCH_HISTORY_TABLE} (query, timestamp) VALUES (?, ?)`,
      query.trim(), Date.now()
    );
  });
}

export async function getSearchHistory(limit: number = 10): Promise<string[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<{ query: string }>(
      `SELECT query FROM ${SEARCH_HISTORY_TABLE} ORDER BY timestamp DESC LIMIT ?`,
      limit
    );
    return rows.map(r => r.query);
  });
}

export async function clearSearchHistory(): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync(`DELETE FROM ${SEARCH_HISTORY_TABLE}`);
  });
}
=======
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
