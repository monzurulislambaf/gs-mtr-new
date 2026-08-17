import Constants from 'expo-constants';
import * as Application from 'expo-application';

export const APP_NAME = 'GS MTR';

/**
 * Version of the installed APK, read dynamically from the installed app's
 * native manifest (Android PackageManager versionName). Never hard-code this
 * — it must always match the actual installed version, otherwise the update
 * check would show "Update Required" forever even after installing the new
 * APK. `expoConfig?.version` is only a fallback for dev/web where the native
 * module may not report an installed APK version.
 */
export const APP_VERSION =
  Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? '0.0.0';

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
  'OFFICE ADDRESS',
  'RESIDENCE ADDRESS',
  'SERVICE MOBILE',
  'PERSONAL MOBILE',
  'OFFICE TELEPHONE',
  'PERSONAL TELEPHONE',
  'REMARKS',
] as const;

export const PAGE_SIZE = 50;
