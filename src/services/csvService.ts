import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { ContactInput } from '@/types/contact';
import { getAllContacts } from '@/database/database';

const CSV_HEADER = [
  'BD NO', 'RANK', 'NAME', 'DESIGNATION', 'BRANCH / TRADE',
  'OFFICE ADDRESS', 'RESIDENCE ADDRESS', 'SERVICE MOBILE', 'PERSONAL MOBILE',
  'OFFICE TELEPHONE', 'PERSONAL TELEPHONE', 'REMARKS',
];

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportContactsToCsv(): Promise<string> {
  const contacts = await getAllContacts();
  const rows = [CSV_HEADER.join(',')];

  for (const c of contacts) {
    rows.push([
      escapeCsv(c['BD NO']),
      escapeCsv(c.RANK),
      escapeCsv(c.NAME),
      escapeCsv(c.DESIGNATION),
      escapeCsv(c['BRANCH / TRADE']),
      escapeCsv(c['OFFICE ADDRESS']),
      escapeCsv(c['RESIDENCE ADDRESS']),
      escapeCsv(c['SERVICE MOBILE']),
      escapeCsv(c['PERSONAL MOBILE']),
      escapeCsv(c['OFFICE TELEPHONE']),
      escapeCsv(c['PERSONAL TELEPHONE']),
      escapeCsv(c.REMARKS),
    ].join(','));
  }

  const csvContent = rows.join('\n');
  const filePath = `${FileSystem.cacheDirectory}contacts_export.csv`;
  await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Contacts',
    });
  }

  return filePath;
}

export async function importContactsFromCsv(): Promise<ContactInput[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'text/csv',
    copyToCacheDirectory: true,
  });

  if (result.canceled) return [];

  const file = result.assets[0];
  const content = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return parseCsv(content);
}

function parseCsv(content: string): ContactInput[] {
  const lines = content.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const contacts: ContactInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const contact: any = {};
    headers.forEach((h, idx) => {
      contact[h] = values[idx] || '';
    });
    if (contact['BD NO'] && contact.NAME && contact.RANK) {
      contacts.push(contact as ContactInput);
    }
  }

  return contacts;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function bulkImportFromCsv(
  importFn: (contacts: ContactInput[]) => Promise<number>
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const contacts = await importContactsFromCsv();
  if (contacts.length === 0) {
    return { imported: 0, skipped: 0, errors: ['No valid contacts found in CSV'] };
  }

  try {
    const imported = await importFn(contacts);
    return { imported, skipped: contacts.length - imported, errors: [] };
  } catch (error: any) {
    return { imported: 0, skipped: contacts.length, errors: [error.message] };
  }
}
