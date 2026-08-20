import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { ContactInput } from '@/types/contact';
import { getAllContacts } from '@/database/database';
import { getFriendlyErrorMessage } from '@/utils/errors';

const CSV_HEADER = [
  'BD NO', 'RANK', 'NAME', 'DESIGNATION', 'BRANCH / TRADE',
  'OFFICE ADDRESS', 'RESIDENCE ADDRESS', 'SERVICE MOBILE', 'PERSONAL MOBILE',
  'OFFICE TELEPHONE', 'PERSONAL TELEPHONE', 'REMARKS',
];

/**
 * Header aliases so CSV files exported to match the contact form's field
 * labels (e.g. the form labels the PERSONAL TELEPHONE input as
 * "RESIDENCE TELEPHONE") map onto the app's internal column names.
 */
const HEADER_ALIASES: Record<string, string> = {
  'RESIDENCE TELEPHONE': 'PERSONAL TELEPHONE',
};

function canonicalHeader(header: string): string {
  const key = header.trim().toUpperCase();
  return HEADER_ALIASES[key] ?? header.trim();
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function readFileAsText(file: DocumentPickerAsset): Promise<string> {
  if (Platform.OS === 'web') {
    if (file.file && typeof file.file.text === 'function') {
      return await file.file.text();
    }
    const response = await fetch(file.uri);
    return await response.text();
  }
  return await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
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

  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return url;
  }

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
    type: [
      'text/csv',
      'text/comma-separated-values',
      'application/csv',
      'application/vnd.ms-excel',
      'application/octet-stream',
      'text/plain',
      '*/*',
    ],
    copyToCacheDirectory: true,
  });

  if (result.canceled) return [];

  const file = result.assets[0];
  const content = await readFileAsText(file);

  return parseCsv(content);
}

function parseCsv(content: string): ContactInput[] {
  const text = content.replace(/^\uFEFF/, '');
  const delimiter = detectDelimiter(text);
  const records = parseCsvRecords(text, delimiter);
  if (records.length < 2) return [];

  const headers = records[0].map(canonicalHeader);
  const contacts: ContactInput[] = [];

  for (let i = 1; i < records.length; i++) {
    const values = records[i];
    if (values.every((v) => !v.trim())) continue;
    const contact: any = {};
    headers.forEach((h, idx) => {
      if (h) contact[h] = (values[idx] ?? '').trim();
    });
    contacts.push(contact as ContactInput);
  }

  return contacts;
}

function detectDelimiter(content: string): string {
  const firstLine = content.split('\n', 1)[0] ?? '';
  const comma = (firstLine.match(/,/g) || []).length;
  const semicolon = (firstLine.match(/;/g) || []).length;
  const tab = (firstLine.match(/\t/g) || []).length;
  if (semicolon > comma && semicolon > tab) return ';';
  if (tab > comma) return '\t';
  return ',';
}

function parseCsvRecords(content: string, delimiter: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => {
    record.push(field);
    field = '';
  };

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      pushField();
    } else if (char === '\n' || char === '\r') {
      pushField();
      if (char === '\r' && content[i + 1] === '\n') i++;
      records.push(record);
      record = [];
    } else {
      field += char;
    }
  }
  pushField();
  records.push(record);

  return records.filter((r) => r.some((f) => f.trim()));
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
    return { imported: 0, skipped: contacts.length, errors: [getFriendlyErrorMessage(error)] };
  }
}
