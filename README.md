# GS MTR

A production-ready Android office contact directory application built with Expo SDK 57, React Native, and Firebase. Designed to look and behave like Google Contacts.

## Features

### Contact Management
- **CRUD Operations** — Create, edit, delete (soft), and restore contacts
- **Offline First** — Contacts stored locally in SQLite with WAL mode; works instantly without internet
- **Automatic Sync** — Incremental and realtime sync run automatically; no manual triggers
- **Realtime Updates** — Firestore `onSnapshot` listeners keep local data in sync automatically
- **Favorites** — Mark contacts as favorites with the star icon for quick access
- **Duplicate Detection** — BD NO uniqueness enforced at both client and server level
- **Batch Selection** — Long-press to select multiple contacts for batch delete or restore
- **Share Contact** — Share contact details as a text file via the system share sheet

### Search
- **Fast Search** — Real-time offline search across all contact fields with partial matching
- **Search Filters** — Toggle specific fields to narrow search results (Name, Rank, BD No, Mobile, etc.)
- **Search History** — Recent searches saved locally for quick re-access
- **Alphabet Index** — Fast scroll sidebar for large contact lists

### Authentication & Access Control
- **BD Number Login** — Sign in with your BD Number + password (mapped securely via Firebase)
- **Self Registration** — Multi-category registration (Officer / Airman / Civilian) with admin approval workflow
- **Role-Based Access** — Admins can CRUD contacts; approved users can view and search
- **Account Status** — Pending / Approved / Declined / Suspended states with status checking
- **Remember Me** — Persistent session via AsyncStorage; approved users keep offline access
- **Forgot Password** — Password reset via Firebase Auth (accepts BD Number or email)
- **Session Caching** — Locally cached session so approved users retain offline contact access

### Admin Features
- **Pending Approvals** — Live-updating list with badge count; approve or decline with optional reason
- **User Management** — View all users, search by BD Number, suspend/reactivate accounts
- **Admin Users** — Dedicated view of all admin and super admin users
- **Role Management** — Super admins can promote/demote admin roles
- **CSV Import/Export** — Bulk import and export contacts as CSV files

### UI/UX
- **Material Design 3** — Google Contacts-like UI with light/dark/system theme support
- **Keyboard-Aware Forms** — Focused inputs auto-scroll above the keyboard on Android and iOS
- **Pull to Refresh** — Refresh the contact list with pull-down gesture
- **Phone Actions** — Call, copy phone numbers directly from contact details
- **Contact Avatars** — Colorful initial-based avatars generated from contact names
- **Loading Skeletons** — Shimmer loading placeholders while data loads
- **Error Boundaries** — Graceful error handling without app crashes
- **Offline Banner** — Visual indicator when device is offline

### Updates & Distribution
- **Online APK Updates** — Mandatory in-app update flow via Firebase + GitHub Releases
- **Fail-Open Design** — Offline users, broken configs, and failed checks never block the app

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
| Sync | Incremental via `updatedAt` timestamp |
| Lists | FlashList (virtualized) |
| Forms | React Hook Form |
| Secure Storage | Expo Secure Store |
| Icons | @expo/vector-icons (Ionicons, MaterialCommunityIcons) |

## Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS (macOS only) |
| `npm run web` | Run on web |
| `npm run lint` | Run ESLint (`expo lint`) |
| `npx tsc --noEmit` | Type check |

## Project Structure

```
src/
  app/                    # Expo Router pages (file-based routing)
    _layout.tsx           # Root layout with auth guard + splash
    (auth)/               # Auth group (login, register, forgot-password, account-status)
    (tabs)/               # Tab navigator (contacts, favorites, search, settings)
    contact/              # Contact CRUD screens ([id], add, edit/[id])
    admin/                # Admin screens (users, pending-approvals, admin-users)
  components/
    ui/                   # Reusable UI components (ContactCard, SearchBar, etc.)
    auth/                 # Auth-specific components (AuthHeader)
    admin/                # Admin-specific components (UserManageDialog)
  database/               # SQLite database + sync engine
  firebase/               # Firebase config, auth, firestore, user services
  hooks/                  # Custom hooks (useContacts, useAppUpdate, etc.)
  services/               # Business logic (contact, CSV, app update)
  store/                  # Zustand stores (auth, contacts, settings, sync)
  theme/                  # Design tokens (colors, spacing, typography, etc.)
  types/                  # TypeScript types (auth, contact, navigation, sync)
  utils/                  # Utilities (validation, formatting, permissions, version)
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
cd gs-mtr

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
5. Fill in your gitignored `.env` file (copy `.env.example` first):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

   The `.env` file is gitignored, so the Firebase config is never pushed to GitHub.

6. For EAS builds, set the same variables as EAS environment variables (values live
   on EAS servers, never in git). Run once per environment (`production`, `preview`, `development`):

```bash
eas env:set --name EXPO_PUBLIC_FIREBASE_API_KEY --value your-api-key --environment production --visibility plaintext
# ... repeat for AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID
```

   Do **not** put Firebase values in `eas.json` — that file is committed to git. The
   build profiles only reference the environment name (`"environment": "production"`).

7. Deploy Firestore indexes and security rules:

```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:indexes,firestore:rules
```

Deploy the rules and indexes after any change:

```bash
firebase deploy --only firestore:indexes,firestore:rules
```

### Initial Admin Account

Create an admin user in Firebase Console:
1. Go to **Authentication** → Add user (email/password)
2. In Firestore, create a document at `users/{uid}` with `role: "admin"` and `status: "approved"`

For a super admin, use `role: "super_admin"` instead. Admins are provisioned through the
Firebase console only — regular users can never change their own role or approval status.

### Registration & Admin Approval

- New users sign in with their **BD Number + password** (the app securely maps the BD number
  to their Firebase Auth identity via the `userLookup` collection — passwords never touch Firestore).
- Users request registration through the **Request Registration** screen, selecting their
  category (Officer / Airman / Civilian), which creates the Firebase Auth account and a
  `users/{uid}` profile with `status: "pending"`.
- Pending users cannot access contacts until an admin approves them.
- Admins see **Settings → Pending Approvals** (with a live count badge) and can approve or
  decline registrations with an optional reason.
- **User Management** lets admins view all users, suspend/reactivate accounts, and (for
  super admins) manage admin roles.
- Approved users keep offline access through a locally cached session.

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

### EAS Build Profiles

`eas.json` uses remote version management (`"appVersionSource": "remote"`) so EAS
increments the Android `versionCode` automatically on every production build. The
Firebase `EXPO_PUBLIC_FIREBASE_*` values are set as EAS environment variables, not committed:

```json
{
  "cli": { "version": ">=21.3.0", "appVersionSource": "remote" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal", "environment": "development" },
    "preview": { "distribution": "internal", "environment": "preview" },
    "production": { "autoIncrement": true, "environment": "production" },
    "production-apk": { "distribution": "internal", "environment": "production", "android": { "buildType": "apk" } }
  },
  "submit": { "production": {} }
}
```

## Releasing Updates (Online APK Update System)

GS MTR ships with a **one-time, online mandatory APK update system**. The update
logic lives in the app itself (`src/services/appUpdateService.ts`,
`src/hooks/useAppUpdate.ts`, `src/components/UpdateRequiredScreen.tsx`) and is
configured through **Firebase** + **GitHub Releases**.

After the initial setup you never touch update code again. Every new release is
just: bump the version → build an APK → create a GitHub Release → update the
Firebase config.

### How it works (summary)

| Step | Where |
|------|-------|
| Installed version | Read from the APK itself via `expo-application` — never a stored flag |
| Release configuration | Firestore document `appConfig/android` (public read, admin write) |
| Mandatory minimum | `minimumVersion` — below it the app shows the Update screen |
| Latest release info | `latestVersion`, `apkUrl`, `releaseNotes`, `versionCode` |
| APK hosting | GitHub Releases (direct download URL stored in Firebase) |
| Offline behavior | No internet → the offline-first app opens normally, never blocked |
| Download + install | `expo-file-system` download with progress → Android package installer via `expo-intent-launcher` |

The check runs at startup **after the UI is ready and never blocks the app**.
Offline users, malformed configs and failed checks all fail open to the normal
offline-first app.

### The Firebase configuration

The app reads a single Firestore document — the **release config**:

```
appConfig/android
```

#### First-time setup — create the release data

The collection is created the first time its document is written. Do this once:

1. Deploy the security rules first (they grant public read + admin write):

   ```bash
   firebase deploy --only firestore:rules
   ```

2. Open the **Firebase console → Firestore Database → Data**.
3. Click **Start collection** → Collection ID: `appConfig`.
4. Click **Add document** → Document ID: `android`.
5. Add the five fields (seed values are in `firebase-seed/release-config.json`):

   | Field | Type | Value |
   |-------|------|-------|
   | `latestVersion` | string | `1.0.0` |
   | `minimumVersion` | string | `1.0.0` |
   | `apkUrl` | string | your GitHub Releases APK URL |
   | `versionCode` | number | `10` |
   | `releaseNotes` | string | `Initial production release.` |

6. Save. The app fetches this document on every startup (online) and compares
   it against the installed version.

**Or seed it automatically** with `scripts/seed-release-data.mjs` (values come
from `firebase-seed/release-config.json`, overridable per field):

```bash
# Local Firestore emulator (no credentials, great for testing)
firebase emulators:exec "node scripts/seed-release-data.mjs" --only firestore

# Real Firebase project (needs a gitignored service account JSON)
FIREBASE_SERVICE_ACCOUNT=/path/to/key.json node scripts/seed-release-data.mjs

# Inspect the current document without writing
node scripts/seed-release-data.mjs --check
```

Example document:

```json
{
  "latestVersion": "1.1.0",
  "minimumVersion": "1.1.0",
  "apkUrl": "https://github.com/YOUR_USERNAME/gs-mtr/releases/download/v1.1.0/GS-MTR-v1.1.0.apk",
  "versionCode": 11,
  "releaseNotes": "Bug fixes\nPerformance improvements"
}
```

| Field | Purpose |
|-------|---------|
| `latestVersion` | The newest published release (display/notes). |
| `minimumVersion` | **Mandatory floor.** Installed < minimum → Update Required. |
| `apkUrl` | Direct GitHub Releases download URL. **Always read from Firebase — never hard-coded.** |
| `versionCode` | Android build code of the release (informational). |
| `releaseNotes` | Shown on the Update screen, one bullet per line. |

You can set `minimumVersion` lower than `latestVersion` to let some users keep
running an older APK (e.g. `latestVersion = 1.3.0`, `minimumVersion = 1.2.0`).
When the update must become mandatory, set `minimumVersion` equal to
`latestVersion`.

Security rules (already in `firestore.rules`): `appConfig` is publicly readable
(the check runs before login) but only admins can write it.

### Release checklist (example: version 1.1.0)

1. **Change the version** in `app.json`. **Do not reuse a version.**

   ```json
   { "expo": { "version": "1.1.0" } }
   ```

   About `versionCode`: EAS remote version management increments the Android
   `versionCode` automatically on every production build — you never reuse one
   and never edit it by hand. The convention is `1.0.0 → 10`, `1.1.0 → 11`,
   `1.2.0 → 12`, … To inspect the current remote value: `eas build:version:get`.

   > If you prefer fully manual versioning, set `"appVersionSource": "local"` in
   > `eas.json`, remove `autoIncrement`, and bump `android.versionCode` in
   > `app.json` yourself each release (11, 12, 13, …). Never go backwards — Android
   > refuses to install an APK whose `versionCode` is not higher than the
   > installed one.

2. **Build the APK.**

   ```bash
   eas build --platform android --profile production-apk
   ```

   The `production-apk` profile produces a signed, installable APK with the
   **same package name (`com.gs.mtr`) and same signing credentials** as the
   production build — that is what lets Android treat it as an in-place upgrade
   (app data, SQLite and session are preserved; GS MTR is never uninstalled).

3. **Create the GitHub Release.**
   - Go to `https://github.com/YOUR_USERNAME/gs-mtr/releases/new`
   - Tag: `v1.1.0`
   - Title: `GS MTR v1.1.0`
   - Attach the APK file from the EAS build (download it from the build page).

4. **Copy the direct APK URL** — it follows this pattern (use the asset filename you uploaded):

   ```
   https://github.com/YOUR_USERNAME/gs-mtr/releases/download/v1.1.0/GS-MTR-v1.1.0.apk
   ```

5. **Update Firebase** — edit the existing `appConfig/android` document with the
   new values. The app reads this document directly from Firestore at startup,
   so the APK URL always comes from the database, never from the app code:

   ```json
   {
     "latestVersion": "1.1.0",
     "minimumVersion": "1.1.0",
     "apkUrl": "https://github.com/YOUR_USERNAME/gs-mtr/releases/download/v1.1.0/GS-MTR-v1.1.0.apk",
     "versionCode": 11,
     "releaseNotes": "Bug fixes\nPerformance improvements"
   }
   ```

6. **Test the update** — install the previous APK on a device, then:
   - **Online:** open GS MTR → Update Required → UPDATE NOW → progress bar → APK
     downloads → Android installer → install → new APK opens with **no update prompt**.
   - **Offline (airplane mode):** open GS MTR → the offline app opens normally,
     contacts searchable, no update prompt, never blocked.

### Testing scenarios

| # | Installed | Internet | Firebase minimum | Expected |
|---|-----------|----------|------------------|----------|
| A | 1.0.0 | OFF | 1.1.0 | Open offline app |
| B | 1.0.0 | ON | 1.1.0 | Update Required |
| C | 1.1.0 | ON | 1.1.0 | Open app |
| D | 1.2.0 | ON | 1.1.0 | Open app |
| E | Install new APK | — | — | Old update prompt disappears |
| F | Broken Firebase config | ON | — | App opens, does not crash |
| G | APK download fails | ON | — | RETRY button shown |

### Update system notes / constraints

- The **installed APK version is the source of truth**. The app never stores an
  "updated" flag, so the prompt reappears until the version really is updated.
- Do **not** hard-code the APK URL; always read `apkUrl` from Firebase.
- Keep the same Android **package name** and **signing credentials** for every
  release, or Android will treat the APK as a different app.
- The update system is Android-only; on iOS/web/Expo Go the check is skipped.
- Update code is isolated and fails open — a Firebase or download failure can
  never crash or lock the app.

## Architecture Highlights

### Offline-First Sync

1. **First launch**: Downloads all contacts from Firestore → saves to local SQLite
2. **Subsequent launches**: Reads from SQLite instantly
3. **On connectivity**: Queries only `updatedAt > lastSyncTime` for incremental updates
4. **Conflict resolution**: Latest `updatedAt` wins
5. **Soft deletes**: Contacts marked as `deleted: true` rather than removed

All sync operations are fully automatic — there are no manual sync, auto-sync toggle, or cache-clear controls in Settings. When the device reconnects, pending changes are synced transparently, without any offline notification banner.

### Keyboard-Aware Forms

All form screens (Registration, Login, Forgot Password, Create/Edit Contact) use a
single reusable `KeyboardAwareScreen` component
(`src/components/ui/KeyboardAwareScreen.tsx`) that:

- Wraps forms in a `KeyboardAvoidingView` (iOS `padding` only) + `ScrollView` with
  `keyboardShouldPersistTaps="handled"`.
- On focus, measures the input and the real keyboard height and scrolls the field
  above the keyboard on Android (edge-to-edge) and iOS.
- Re-aligns the focused field once the keyboard is fully shown, so the Register /
  Save button stays reachable with the keyboard open.
- Uses `useKeyboardAwareForm()` to wire each input's `onFocus` / `onLayout`.

### Performance for 50,000+ Contacts

- FlashList with estimated item sizes for virtualized rendering
- SQLite with WAL mode and optimized indexes on all searchable columns
- Memoized components with `useCallback` and `useMemo`
- Search with `LIKE` queries on indexed columns
- `LIMIT 200` on search results to prevent UI lag
- Alphabet index for fast scrolling to any letter
- No Firestore queries for search — always local SQLite

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
| OFFICE ADDRESS | string | No | Yes |
| RESIDENCE ADDRESS | string | No | Yes |
| SERVICE MOBILE | string | No | Yes |
| PERSONAL MOBILE | string | No | Yes |
| OFFICE TELEPHONE | string | No | Yes |
| PERSONAL TELEPHONE | string | No | Yes |
| REMARKS | string | No | Yes |

## Firebase Security Rules

See `firestore.rules` for the complete ruleset. Key rules:

### Contacts (`contacts/{contactId}`)
- **Read**: Approved users and admins
- **Create / Update / Delete**: Admins only

### Users (`users/{uid}`)
- **Read**: Own profile (self) or any profile (admin)
- **Create**: Self-registration only — must set `role: "user"` and `status: "pending"`
- **Update (self)**: Limited to profile fields (`fullName`, `category`, `rank`, `branch`, etc.) — never `role`, `status`, or approval fields
- **Update (admin)**: Full access including `role`, `status`, approval/decline fields

### User Lookup (`userLookup/{bdNumber}`)
- **Read**: Public (needed for login before authentication)
- **Create**: Self only (must match `request.auth.uid`)
- **Update / Delete**: Admins only

### App Config (`appConfig/{key}`)
- **Read**: Public (mandatory update check runs before login)
- **Write**: Admins only

## Firestore Indexes

See `firestore.indexes.json`. Required composite indexes:

### Contacts collection
| Fields | Purpose |
|--------|---------|
| `deleted ASC, NAME ASC` | Full contact list sorted by name |
| `deleted ASC, BD NO ASC` | Duplicate BD NO check |
| `deleted ASC, SERVICE MOBILE ASC` | Search by service mobile |
| `deleted ASC, PERSONAL MOBILE ASC` | Search by personal mobile |
| `updatedAt ASC` | Incremental sync (`where updatedAt > lastSync, orderBy updatedAt`) |
| `BD NO ASC, deleted ASC` | Duplicate BD NO check (alternative order) |

### Users collection
| Fields | Purpose |
|--------|---------|
| `status ASC, createdAt ASC` | Pending registrations list (orderBy createdAt) |
| `role ASC` | Admin users query (`where role in ['admin', 'super_admin']`) |

## License

MIT
