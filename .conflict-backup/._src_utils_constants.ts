export const APP_NAME = 'GS MTR';
export const APP_VERSION = '1.0.0';

export const SYNC_INTERVAL = 30000;
export const DEBOUNCE_DELAY = 150;

export const DB_NAME = 'pabx_mtr.db';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  LAST_SYNC: 'last_sync',
  THEME: 'theme',
  SETTINGS: 'settings',
  ROLE: 'user_role',
} as const;

export const CONTACT_FIELDS = [
  'BD NO',
  'RANK',
  'NAME',
  'DESIGNATION',
  'BRANCH / TRADE',
<<<<<<< HEAD
  'OFFICE ADDRESS',
  'RESIDENCE ADDRESS',
  'SERVICE MOBILE',
  'PERSONAL MOBILE',
  'OFFICE TELEPHONE',
  'PERSONAL TELEPHONE',
=======
  'OFFICE',
  'RESIDENCE',
  'SERVICE MOBILE',
  'PERSONAL MOBILE',
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  'REMARKS',
] as const;

export const PAGE_SIZE = 50;
