# PABX-MTR

A production-ready Android office contact directory application built with Expo SDK 57, React Native, and Firebase. Designed to look and behave like Google Contacts.

## Features

- **Fast Search** — Real-time offline search across all contact fields with partial matching
- **Offline First** — Contacts stored locally in SQLite; works instantly without internet
- **Automatic Sync** — Incremental and realtime sync run automatically; no manual triggers
- **Realtime Updates** — Firestore listeners keep local data in sync automatically
- **Material Design 3** — Google Contacts-like UI with light/dark/system theme support
- **Role-Based Access** — Admins can CRUD; users can view and search
- **CRUD Operations** — Create, edit, delete, and restore contacts
- **CSV Import/Export** — Bulk import and export contacts (admin only)
- **Favorites & Recents** — Mark favorite contacts and view recently accessed
- **Alphabet Index** — Fast scroll sidebar for large contact lists
- **Phone Actions** — Call, copy, share contact details
- **Pull to Refresh** — Refresh the contact list

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 57 + React Native 0.86 |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| UI | React Native Paper (Material 3) |
| State | Zustand |
| Server State | TanStack Query |
| Local DB | Expo SQLite (WAL mode) |
| Backend | Firebase Firestore + Auth |
| Sync | Incremental via updatedAt |
| Lists | FlashList |
| Forms | React Hook Form |
| Secure Storage | Expo Secure Store |
| Icons | @expo/vector-icons |

## Project Structure

```
src/
  app/                    # Expo Router pages (file-based routing)
    _layout.tsx           # Root layout with auth guard
    (auth)/               # Auth group (login)
    (tabs)/               # Tab navigator (contacts, search, settings)
    contact/              # Contact CRUD screens
  components/ui/           # Reusable components
  database/               # SQLite database + sync engine
  firebase/               # Firebase config + services
  hooks/                  # Custom hooks
  services/               # Business logic services
  store/                  # Zustand stores
  types/                  # TypeScript types
  utils/                  # Utilities (validation, formatting, permissions)
  constants/              # Theme and app constants
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI (`npx expo`)
- Android Studio (for Android emulator)
- Firebase project

### Installation

```bash
# Navigate to the project
cd MyApp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Email/Password** authentication
3. Create a **Cloud Firestore** database
4. Generate a web app config and copy the values
5. Fill in your `.env` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

6. Deploy Firestore indexes and security rules:
```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:indexes,firestore:rules
```

### Initial Admin Account

Create an admin user in Firebase Console:
1. Go to **Authentication** → Add user
2. Sign in with that user in the app
3. In Firestore, create a document at `users/{uid}` with `role: "admin"`

Or seed via Firebase Console directly.

### Running the App

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (if on macOS)
npm run ios

# Run on web
npm run web
```

## Building for Production

### Android APK (Local)

```bash
# Build an unsigned APK
npx expo run:android

# Build a debug APK
cd android
./gradlew assembleDebug
```

### Android App Bundle (Play Store)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Play Store
eas build --platform android --profile production
```

### Release Build with EAS

Create `eas.json` in the project root:

```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

Then build:
```bash
eas build --platform android --profile production
```

## Architecture Highlights

### Offline-First Sync

1. **First launch**: Downloads all contacts from Firestore → saves to local SQLite
2. **Subsequent launches**: Reads from SQLite instantly
3. **On connectivity**: Queries only `updatedAt > lastSyncTime` for incremental updates
4. **Conflict resolution**: Latest `updatedAt` wins
5. **Soft deletes**: Contacts marked as `deleted: true` rather than removed

All sync operations are fully automatic — there are no manual sync, auto-sync toggle, or cache-clear controls in Settings. When the device reconnects, pending changes are synced transparently, without any offline notification banner.

### Performance for 50,000+ Contacts

- FlashList with estimated item sizes
- SQLite with WAL mode and optimized indexes
- Memoized components with React.memo
- Search with LIKE queries on indexed columns
- LIMIT 200 on search results
- Alphabet index for fast scrolling
- No Firestore queries for search — always local

### Realtime Sync

Firestore `onSnapshot` listeners watch for changes after `lastSyncTime`. When a change is detected:
1. Listener callback receives changed/deleted documents
2. Local SQLite is updated immediately
3. UI refreshes automatically via Zustand store

## Contact Fields

| Field | Type | Required | Searchable |
|-------|------|----------|------------|
| BD NO | string | Yes | Yes |
| RANK | string | Yes | Yes |
| NAME | string | Yes | Yes |
| DESIGNATION | string | No | Yes |
| BRANCH / TRADE | string | No | Yes |
| OFFICE | string | No | Yes |
| RESIDENCE | string | No | Yes |
| SERVICE MOBILE | string | No | Yes |
| PERSONAL MOBILE | string | No | Yes |
| REMARKS | string | No | Yes |

## Firebase Security Rules

See `firebase.rules` for the complete ruleset. Key rules:
- All authenticated users can read contacts
- Only users with `role: "admin"` can create/update/delete contacts
- Users can read their own user document

## Firestore Indexes

See `firestore.indexes.json`. Required composite indexes:
- `deleted ASC, NAME ASC`
- `deleted ASC, updatedAt ASC`
- `deleted ASC, BD NO ASC`
- `deleted ASC, SERVICE MOBILE ASC`
- `deleted ASC, PERSONAL MOBILE ASC`
- `updatedAt ASC`

## License

MIT
