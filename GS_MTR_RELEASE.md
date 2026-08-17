# GS MTR — APK Release Process

This project has a **one-time, online mandatory APK update system**. The update
logic lives in the app itself (`src/services/appUpdateService.ts`,
`src/hooks/useAppUpdate.ts`, `src/components/UpdateRequiredScreen.tsx`) and is
configured through **Firebase** + **GitHub Releases**.

After the initial setup you never touch update code again. Every new release is
just: bump the version → build an APK → create a GitHub Release → update the
Firebase config.

---

## How it works (summary)

| Step | Where |
|------|-------|
| Installed version | Read from the APK itself via `expo-constants` — never a stored flag |
| Release configuration | Firestore document `appConfig/android` (public read, admin write) |
| Mandatory minimum | `minimumVersion` — below it the app shows the Update screen |
| Latest release info | `latestVersion`, `apkUrl`, `releaseNotes`, `versionCode` |
| APK hosting | GitHub Releases (direct download URL stored in Firebase) |
| Offline behavior | No internet → the offline-first app opens normally, never blocked |
| Download + install | `expo-file-system` download with progress → Android package installer via `expo-intent-launcher` |

The check runs at startup **after the UI is ready and never blocks the app**.
Offline users, malformed configs and failed checks all fail open to the normal
offline-first app.

---

## The Firebase configuration

The app reads a single Firestore document — the **release config**:

```
appConfig/android
```

### First-time setup — create the release data

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

6. Save. That's it — the app fetches this document on every startup (online)
   and compares it against the installed version.

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

---

## Release checklist (example: version 1.1.0)

### Step 1 — Change the version

In `app.json`, set the user-facing version. **Do not reuse a version.**

```json
{
  "expo": {
    "version": "1.1.0"
  }
}
```

**About `versionCode`:** this project uses EAS remote version management
(`"appVersionSource": "remote"` in `eas.json`), so EAS increments the Android
`versionCode` automatically on every production build — you never reuse one and
never edit it by hand. The convention is `1.0.0 → 10`, `1.1.0 → 11`,
`1.2.0 → 12`, … (see `android.versionCode` in `app.json`). To inspect the
current remote value: `eas build:version:get`.

> If you prefer fully manual versioning, set `"appVersionSource": "local"` in
> `eas.json`, remove `autoIncrement`, and bump `android.versionCode` in
> `app.json` yourself each release (11, 12, 13, …). Never go backwards — Android
> refuses to install an APK whose `versionCode` is not higher than the
> installed one.

### Step 2 — Build the APK

```bash
eas build --platform android --profile production-apk
```

The `production-apk` profile (in `eas.json`) produces a signed, installable APK
with the **same package name (`com.gs.mtr`) and same signing credentials** as
your production build — that is what lets Android treat it as an in-place
upgrade (app data, SQLite and session are preserved; GS MTR is never
uninstalled).

### Step 3 — Create the GitHub Release

1. Go to `https://github.com/YOUR_USERNAME/gs-mtr/releases/new`
2. Tag: `v1.1.0`
3. Title: `GS MTR v1.1.0`
4. Attach the APK file from the EAS build (download it from the build page).

### Step 4 — Copy the direct APK URL

The direct download URL follows this pattern (use it exactly, with the asset
filename you uploaded):

```
https://github.com/YOUR_USERNAME/gs-mtr/releases/download/v1.1.0/GS-MTR-v1.1.0.apk
```

### Step 5 — Update Firebase

In the Firebase console, edit the existing `appConfig/android` document
(Firestore Database → Data → `appConfig` → `android`) with the new values. The
app reads this document directly from Firestore at startup — the APK URL
always comes from the database, never from the app code:

```json
{
  "latestVersion": "1.1.0",
  "minimumVersion": "1.1.0",
  "apkUrl": "https://github.com/YOUR_USERNAME/gs-mtr/releases/download/v1.1.0/GS-MTR-v1.1.0.apk",
  "versionCode": 11,
  "releaseNotes": "Bug fixes\nPerformance improvements"
}
```

### Step 6 — Test the update

Install the previous APK on a device, then:

- **Online:** open GS MTR → Update Required → UPDATE NOW → progress bar → APK
  downloads → Android installer → install → new APK opens with **no update
  prompt**.
- **Offline (airplane mode):** open GS MTR → the offline app opens normally,
  contacts searchable, no update prompt, never blocked.

---

## Example — next release 1.2.0

1. `app.json` → `"version": "1.2.0"`
2. `eas build --platform android --profile production-apk`
3. GitHub Release `v1.2.0` with `GS-MTR-v1.2.0.apk`
4. Firebase:

```json
{
  "latestVersion": "1.2.0",
  "minimumVersion": "1.2.0",
  "apkUrl": "https://github.com/YOUR_USERNAME/gs-mtr/releases/download/v1.2.0/GS-MTR-v1.2.0.apk",
  "versionCode": 12,
  "releaseNotes": "New features and fixes"
}
```

Users on 1.1.0 who open the app online see **Update Required**. Users with no
internet open the offline app normally.

---

## Testing scenarios

| # | Installed | Internet | Firebase minimum | Expected |
|---|-----------|----------|------------------|----------|
| A | 1.0.0 | OFF | 1.1.0 | Open offline app |
| B | 1.0.0 | ON | 1.1.0 | Update Required |
| C | 1.1.0 | ON | 1.1.0 | Open app |
| D | 1.2.0 | ON | 1.1.0 | Open app |
| E | Install new APK | — | — | Old update prompt disappears |
| F | Broken Firebase config | ON | — | App opens, does not crash |
| G | APK download fails | ON | — | RETRY button shown |

---

## Notes / constraints

- The **installed APK version is the source of truth**. The app never stores an
  "updated" flag, so the prompt reappears until the version really is updated.
- Do **not** hard-code the APK URL; always read `apkUrl` from Firebase.
- Keep the same Android **package name** and **signing credentials** for every
  release, or Android will treat the APK as a different app.
- The update system is Android-only; on iOS/web/Expo Go the check is skipped.
- Update code is isolated and fails open — a Firebase or download failure can
  never crash or lock the app.
