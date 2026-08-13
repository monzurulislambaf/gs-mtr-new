import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '@/utils/constants';

let db: SQLite.SQLiteDatabase | null = null;
let queue: Promise<void> = Promise.resolve();

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await initializeSchema(db);
  }
  return db;
}

async function initializeSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      bd_no TEXT NOT NULL,
      rank TEXT NOT NULL,
      name TEXT NOT NULL,
      designation TEXT DEFAULT '',
      branch_trade TEXT DEFAULT '',
      office_address TEXT DEFAULT '',
      residence_address TEXT DEFAULT '',
      service_mobile TEXT DEFAULT '',
      personal_mobile TEXT DEFAULT '',
      office_telephone TEXT DEFAULT '',
      personal_telephone TEXT DEFAULT '',
      remarks TEXT DEFAULT '',
      created_at INTEGER DEFAULT 0,
      updated_at INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      version INTEGER DEFAULT 0,
      favorite INTEGER DEFAULT 0
    );
  `);

  await migrateLegacyColumns(database);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_contacts_bd_no ON contacts(bd_no COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_contacts_rank ON contacts(rank COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_contacts_designation ON contacts(designation COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_contacts_branch_trade ON contacts(branch_trade COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_contacts_office_address ON contacts(office_address COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_contacts_service_mobile ON contacts(service_mobile COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_contacts_personal_mobile ON contacts(personal_mobile COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts(updated_at);
    CREATE INDEX IF NOT EXISTS idx_contacts_deleted ON contacts(deleted);
    CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON contacts(favorite);

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pending_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL,
      change_type TEXT NOT NULL,
      data TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_pending_contact_id ON pending_changes(contact_id);

    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL UNIQUE,
      timestamp INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);

  await database.execAsync('PRAGMA journal_mode = WAL');
  await database.execAsync('PRAGMA synchronous = NORMAL');
  await database.execAsync('PRAGMA cache_size = -20000');
  await database.execAsync('PRAGMA temp_store = MEMORY');
}

async function migrateLegacyColumns(database: SQLite.SQLiteDatabase): Promise<void> {
  try {
    const columns = await database.getAllAsync<{ name: string }>(
      'PRAGMA table_info(contacts)'
    );
    const names = new Set(columns.map((c) => c.name));
    if (names.has('office') && !names.has('office_address')) {
      await database.execAsync(
        'ALTER TABLE contacts RENAME COLUMN office TO office_address'
      );
    }
    if (names.has('residence') && !names.has('residence_address')) {
      await database.execAsync(
        'ALTER TABLE contacts RENAME COLUMN residence TO residence_address'
      );
    }
  } catch {
    // migration is best-effort; ignore failures (e.g. fresh installs)
  }
}

/**
 * Opens (or reuses) the SQLite database and ensures the schema is created.
 * Called once at app bootstrap so local data is available before the UI renders.
 */
export async function initDatabase(): Promise<void> {
  await getDatabase();
}

export async function withDb<T>(fn: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue = queue.then(async () => {
      try {
        const database = await getDatabase();
        resolve(await fn(database));
      } catch (e) {
        reject(e);
      }
    });
  });
}
