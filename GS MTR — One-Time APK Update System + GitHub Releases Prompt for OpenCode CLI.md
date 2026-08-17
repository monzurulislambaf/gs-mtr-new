# GS MTR — One-Time APK Update System with GitHub Releases

Modify the existing **GS MTR Expo React Native Android project** to implement a production-ready **online mandatory APK update system**.

The update system must be configured **once**. After that, for every new release, the developer should only need to:

1. Build a new APK.
2. Create a GitHub Release.
3. Update the Firebase release configuration.

Existing users must automatically receive the update when they open GS MTR with internet access.

Do not break the existing GS MTR offline-first functionality.

---

# 1. Existing GS MTR Requirements

Preserve the current:

- Expo React Native architecture
- Expo Router
- Firebase Realtime Database
- SQLite/local database
- NetInfo
- Authentication
- Contact CRUD
- Contact search
- Offline functionality
- Online synchronization
- Existing UI/UX
- Existing Firebase configuration

First inspect the project before making changes.

Do not migrate the project to another framework.

---

# 2. One-Time Update System

Create a reusable update service.

Recommended structure:

```text
src/
├── services/
│   └── appUpdateService.ts
├── utils/
│   └── version.ts
├── components/
│   └── UpdateRequiredScreen.tsx
└── hooks/
    └── useAppUpdate.ts
```

Adapt these locations to the existing project structure if necessary.

The update system must be reusable for all future GS MTR releases.

---

# 3. Firebase Configuration

Use the existing **Firebase Realtime Database**.

Create:

```text
appConfig
└── android
    ├── latestVersion
    ├── minimumVersion
    ├── apkUrl
    ├── versionCode
    └── releaseNotes
```

Example:

```json
{
  "appConfig": {
    "android": {
      "latestVersion": "1.0.0",
      "minimumVersion": "1.0.0",
      "apkUrl": "https://github.com/YOUR_USERNAME/gs-mtr/releases/download/v1.0.0/GS-MTR-v1.0.0.apk",
      "versionCode": 10,
      "releaseNotes": "Initial production release."
    }
  }
}
```

Do not hard-code the APK URL into the application.

---

# 4. Read Installed Version

Read the actual installed application version from Expo.

Use the existing Expo configuration.

Example:

```ts
import Constants from 'expo-constants';

const currentVersion =
  Constants.expoConfig?.version ?? '0.0.0';
```

The installed APK version is the source of truth.

Do NOT use AsyncStorage or another local flag such as:

```text
hasUpdated = true
```

to determine whether the app needs an update.

---

# 5. Version Comparison

Implement proper semantic version comparison.

Create:

```text
src/utils/version.ts
```

Functions:

```ts
compareVersions()
isUpdateRequired()
```

Examples:

```text
1.0.0 < 1.1.0 → true
1.1.0 = 1.1.0 → false
1.2.0 > 1.1.0 → false
1.10.0 > 1.9.0 → true
```

Never compare versions as plain strings.

---

# 6. Internet-First Update Check

Use the existing NetInfo implementation.

Startup logic:

```text
GS MTR starts
      ↓
Check Internet
      ↓
 ┌───────────────┐
 │               │
OFFLINE         ONLINE
 │               │
 ↓               ↓
Open app       Read Firebase
normally          ↓
             Check version
                  ↓
          Update required?
             /        \
           NO          YES
           ↓            ↓
       Open app     Update Screen
```

---

# 7. Offline Behavior — Critical

If there is no internet:

```text
DO NOT check Firebase
DO NOT show update screen
DO NOT block the app
DO NOT require APK download
DO NOT require online login
```

Immediately continue with the existing offline-first application.

The user must be able to:

- Open GS MTR
- View SQLite/local contacts
- Search contacts
- Use existing offline features

Even if Firebase says that the installed version is old, **offline users must still be allowed to use the app**.

---

# 8. Online Version Check

When internet is available:

Read:

```text
appConfig/android
```

Get:

```text
latestVersion
minimumVersion
apkUrl
versionCode
releaseNotes
```

Compare:

```text
currentVersion
        vs
minimumVersion
```

Rules:

```text
currentVersion < minimumVersion
→ Mandatory update

currentVersion >= minimumVersion
→ Open application
```

---

# 9. Why Use minimumVersion?

Support both:

```text
latestVersion
minimumVersion
```

Example:

```text
latestVersion = 1.3.0
minimumVersion = 1.2.0
```

Then:

```text
1.1.0 → Update Required
1.2.0 → Allowed
1.3.0 → Allowed
```

This allows the developer to release an APK without immediately forcing every user to update.

When the update becomes mandatory:

```text
latestVersion = 1.3.0
minimumVersion = 1.3.0
```

---

# 10. Update Required Screen

Create a GS MTR styled screen:

```text
GS MTR

Update Required

A new version of GS MTR is available.

Current Version: 1.0.0
Required Version: 1.1.0

Release Notes:
• Bug fixes
• Performance improvements

[ UPDATE NOW ]
```

Do not provide a Skip/Later button when:

```text
currentVersion < minimumVersion
```

The user must update before accessing the online application.

---

# 11. GitHub Release APK URL

The APK will be hosted using GitHub Releases.

Use this URL pattern:

```text
https://github.com/USERNAME/REPOSITORY/releases/download/TAG/APK-FILENAME
```

Example:

```text
https://github.com/YOUR_USERNAME/gs-mtr/releases/download/v1.1.0/GS-MTR-v1.1.0.apk
```

Firebase stores this URL in:

```text
appConfig/android/apkUrl
```

The app must never assume a fixed GitHub URL.

Always read `apkUrl` from Firebase.

---

# 12. APK Download

When the user presses:

```text
UPDATE NOW
```

download the APK from:

```text
apkUrl
```

Show:

```text
Downloading update...

75%
```

Handle:

- Download progress
- Slow internet
- Timeout
- Download failure
- Invalid URL
- Insufficient storage
- Interrupted download

On failure:

```text
Update download failed.

Please check your internet connection.

[ RETRY ]
```

---

# 13. Android Installation

After download:

1. Verify APK exists.
2. Launch Android APK installer.
3. Allow Android to install the update.
4. Preserve existing application data.
5. Do not uninstall GS MTR.
6. Do not delete SQLite data.

The new APK must upgrade the existing GS MTR installation.

If Expo Go cannot support the required APK installation API, configure the appropriate Expo production/development build and native capability.

Inspect the current Expo SDK before adding dependencies.

---

# 14. After New APK Installation

This is critical.

Suppose:

```text
Old APK:
1.0.0
```

Firebase:

```text
minimumVersion = 1.1.0
```

The old APK shows:

```text
Update Required
```

User installs:

```text
GS-MTR-v1.1.0.apk
```

Now:

```text
Installed version = 1.1.0
Firebase minimumVersion = 1.1.0
```

Comparison:

```text
1.1.0 < 1.1.0
```

is false.

Therefore:

```text
NO UPDATE REQUIRED
→ Open GS MTR normally
```

Never store a permanent "updated" flag.

The installed APK version must always determine the result.

---

# 15. Future Release Process

After this implementation is complete, the future release process should be very simple.

## Release 1.1.0

### Step 1 — Change Expo version

```json
{
  "expo": {
    "version": "1.1.0",
    "android": {
      "versionCode": 11
    }
  }
}
```

### Step 2 — Build APK

Use the existing production APK profile:

```bash
eas build --platform android --profile production-apk
```

### Step 3 — Create GitHub Release

Create:

```text
Tag: v1.1.0
```

Upload:

```text
GS-MTR-v1.1.0.apk
```

### Step 4 — Update Firebase

Change:

```text
latestVersion = 1.1.0
minimumVersion = 1.1.0
apkUrl = GitHub v1.1.0 APK URL
versionCode = 11
releaseNotes = ...
```

That's all.

Existing users do not need a new version of the old APK.

---

# 16. Next Release

For version `1.2.0`:

Build:

```text
GS-MTR-v1.2.0.apk
```

GitHub:

```text
v1.2.0
```

Firebase:

```text
latestVersion = 1.2.0
minimumVersion = 1.2.0
apkUrl = https://github.com/YOUR_USERNAME/gs-mtr/releases/download/v1.2.0/GS-MTR-v1.2.0.apk
versionCode = 12
```

Users with:

```text
1.1.0
```

will automatically see:

```text
Update Required
```

when they have internet.

Users without internet:

```text
Open offline app normally
```

---

# 17. Version Code Rules

Every Android production APK must have a higher `versionCode`.

Example:

```text
1.0.0 → 10
1.1.0 → 11
1.2.0 → 12
1.3.0 → 13
```

Never reuse a previous `versionCode`.

Keep the same:

```text
Android package name
Android signing credentials
```

so Android recognizes the APK as an update.

---

# 18. Firebase Admin Workflow

Do not place Firebase Admin credentials inside the mobile application.

The mobile app should only read:

```text
appConfig/android
```

Use Firebase security rules appropriate for the existing project.

The developer/admin can modify the release configuration.

---

# 19. Update Service API

Create a clean reusable service with functions similar to:

```ts
getCurrentVersion()

getRemoteAppConfig()

checkForUpdate()

downloadUpdate()

installUpdate()
```

Return structured results such as:

```ts
{
  updateRequired: boolean,
  currentVersion: string,
  latestVersion: string,
  minimumVersion: string,
  apkUrl: string,
  releaseNotes: string
}
```

Handle errors safely.

The update system must never crash the application.

---

# 20. Startup Integration

Integrate the update check into the existing startup flow.

Do not create a second Firebase initialization.

Do not create a second NetInfo system.

Reuse the project's existing:

- Firebase instance
- NetInfo service
- navigation
- loading screen
- theme
- error handling

Recommended:

```text
App Launch
    ↓
Existing startup
    ↓
NetInfo
    ↓
Offline?
 ┌──────┴──────┐
YES           NO
 ↓             ↓
Open local   Version check
app             ↓
            Update required?
             /       \
           NO         YES
           ↓           ↓
       Open app    Update screen
```

---

# 21. Release Configuration File

Also create a developer documentation file:

```text
GS_MTR_RELEASE.md
```

Document exactly how to release a new version.

Include:

```text
1. Change version
2. Increase versionCode
3. Build APK
4. Create GitHub Release
5. Upload APK
6. Copy direct APK URL
7. Update Firebase
8. Test update
```

Include example Firebase configuration.

---

# 22. Testing

Test all scenarios.

### Scenario A

```text
Installed: 1.0.0
Internet: OFF
Firebase minimum: 1.1.0
```

Expected:

```text
Open offline app
```

### Scenario B

```text
Installed: 1.0.0
Internet: ON
Firebase minimum: 1.1.0
```

Expected:

```text
Update Required
```

### Scenario C

```text
Installed: 1.1.0
Internet: ON
Firebase minimum: 1.1.0
```

Expected:

```text
Open app
```

### Scenario D

```text
Installed: 1.2.0
Firebase minimum: 1.1.0
```

Expected:

```text
Open app
```

### Scenario E

Install the new APK.

Expected:

```text
Old update prompt disappears.
```

### Scenario F

Break the Firebase configuration temporarily.

Expected:

```text
App does not crash.
```

### Scenario G

APK download fails.

Expected:

```text
Retry option.
```

---

# 23. Final Acceptance Criteria

The implementation is complete only when:

- [ ] Update system is configured once.
- [ ] Future releases do not require modifying update code.
- [ ] APK URL comes from Firebase.
- [ ] APK is hosted on GitHub Releases.
- [ ] Installed version is detected automatically.
- [ ] Semantic version comparison works.
- [ ] `minimumVersion` controls mandatory updates.
- [ ] `latestVersion` identifies the latest release.
- [ ] Online old users receive Update Required.
- [ ] Online current users open normally.
- [ ] Offline users always open the offline app.
- [ ] Offline users are never blocked.
- [ ] APK downloads from GitHub.
- [ ] Download progress is shown.
- [ ] Failed downloads can be retried.
- [ ] Android installer launches.
- [ ] Existing app data remains intact.
- [ ] New APK stops the update prompt automatically.
- [ ] Same package name is preserved.
- [ ] Same signing credentials are preserved.
- [ ] Android versionCode increases every release.
- [ ] Existing GS MTR features continue working.
- [ ] `GS_MTR_RELEASE.md` documents the future release process.

## Final Instruction

Inspect the existing GS MTR codebase first.

Implement this update system with the **minimum necessary changes**.

Do not replace or break the existing Firebase, SQLite, authentication, synchronization, navigation, or offline-first architecture.

After implementation, verify the complete flow on a real Android production APK:

```text
Old APK
→ Internet
→ Update Required
→ GitHub APK download
→ Android installation
→ New APK
→ No update prompt
```

and:

```text
Old APK
→ No Internet
→ Open offline GS MTR normally
```