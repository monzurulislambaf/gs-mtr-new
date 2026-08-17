export const COLLECTIONS = {
  USERS: 'users',
  CONTACTS: 'contacts',
  SETTINGS: 'settings',
  /** Secure bdNumber -> { uid, email } mapping used only for BD-number login. */
  USER_LOOKUP: 'userLookup',
  /** APK release configuration (doc id `android`). */
  APP_CONFIG: 'appConfig',
} as const;
