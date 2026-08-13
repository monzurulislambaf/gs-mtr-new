# GS MTR — Fix Offline Cold-Start Black Screen

You are an expert Expo React Native developer. Fix the **GS MTR** app's Android cold-start black-screen problem without breaking the existing offline-first functionality.

## Problem

Current behavior:

1. GS MTR works normally while the app is running.
2. Turn OFF internet.
3. Android **Close All Apps**.
4. Open GS MTR.
5. App sometimes shows a **black screen**.
6. Turn internet ON.
7. Open GS MTR again — it can still show a black screen.
8. Only after **Close All Apps again** and reopening does the app work.

This indicates a possible **cold-start, splash-screen, initialization, Firebase, SQLite, NetInfo, or async race-condition problem**.

## Main Requirement

Make GS MTR truly **offline-first**.

### Critical rule

**The application UI must NEVER wait for Firebase, internet connectivity, or remote synchronization before rendering.**

Startup must work with:

- Internet OFF
- Internet ON
- Android cold start
- Android process restart
- Android "Close All Apps" followed by launch
- Empty SQLite database
- Existing SQLite database
- Firebase unavailable
- Firebase timeout/error

---

## Required Startup Architecture

Implement this flow:

```text
                    APP START
                       |
                       v
                Initialize SQLite
                       |
                       v
               Load local contacts
                       |
                       v
                 Render UI
                       |
                       v
               Check connectivity
                  /          \
             OFFLINE        ONLINE
                |              |
                v              v
          Use SQLite       Background Sync
                               |
                               v
                         Firebase fetch
                               |
                               v
                         Update SQLite
                               |
                               v
                         Refresh UI
```

Firebase synchronization must be a **background task**.

Never block the initial UI because of Firebase.

---

## 1. Fix Splash Screen Handling

Inspect all usage of:

```js
SplashScreen.preventAutoHideAsync()
SplashScreen.hideAsync()
```

Make sure the splash screen is ALWAYS hidden, including when initialization fails.

Use a safe pattern similar to:

```js
try {
  await initializeDatabase();
  await loadLocalData();
} catch (error) {
  console.error("Startup initialization failed:", error);
} finally {
  await SplashScreen.hideAsync();
}
```

Do not leave the application permanently waiting for an async operation.

---

## 2. SQLite Must Initialize First

SQLite is the primary source for the initial UI.

Startup should:

1. Open/create the local database.
2. Run required migrations.
3. Load existing contacts.
4. Set application state.
5. Render the UI.

Do NOT wait for:

- Firebase initialization
- Firebase authentication
- NetInfo
- Remote database fetch
- Network request
- Synchronization completion

---

## 3. Firebase Sync Must Not Block Startup

Do NOT use:

```js
await syncFirebase();
setAppReady(true);
```

Instead:

```js
setAppReady(true);

syncFirebaseInBackground().catch(error => {
  console.error("Background sync failed:", error);
});
```

The user must be able to use the local database even if Firebase fails.

---

## 4. Add Network Timeout

Every Firebase/network operation must have a reasonable timeout.

Do not allow a Firebase request to keep the application waiting indefinitely.

For example:

```text
Firebase request
      |
      +-- success → process data
      |
      +-- timeout → log error and continue offline
      |
      +-- error → log error and continue offline
```

A network failure must NEVER produce a black screen.

---

## 5. Fix NetInfo Startup Logic

Inspect the current NetInfo implementation.

Do not make the UI depend on:

```js
isConnected === null
```

Avoid code such as:

```js
if (isConnected === null) {
  return null;
}
```

because this can produce a blank screen if connectivity state is delayed.

The application should render from SQLite first and allow NetInfo to update connectivity state afterward.

Use NetInfo only to control synchronization.

---

## 6. Protect Against Async Race Conditions

Inspect all startup-related effects:

- `useEffect`
- `useFocusEffect`
- Firebase listeners
- NetInfo listeners
- SQLite initialization
- Context providers
- authentication state
- sync services
- navigation initialization

Make sure multiple initialization processes cannot overwrite each other's state.

Prevent:

```text
SQLite loading
       +
Firebase loading
       +
NetInfo loading
       +
Navigation loading
       +
Auth loading
       =
race condition
```

Create a single controlled bootstrap process if necessary.

---

## 7. App Must Render With Empty Database

Test this case:

```text
Fresh installation
       ↓
SQLite database empty
       ↓
Internet OFF
       ↓
Launch GS MTR
```

The application must still open normally.

Display an appropriate empty-state message such as:

```text
No contacts available offline.
Connect to the internet to synchronize contacts.
```

Do NOT show a black screen.

---

## 8. Existing SQLite Data Must Always Be Available

Test:

```text
Contacts already stored in SQLite
       ↓
Internet OFF
       ↓
Close All Apps
       ↓
Open GS MTR
```

Expected:

```text
App opens
↓
SQLite loads
↓
Contacts immediately displayed
↓
No Firebase required
```

---

## 9. Online Startup

Test:

```text
Internet ON
↓
Close All Apps
↓
Open GS MTR
```

Expected:

```text
App opens immediately
↓
SQLite contacts displayed
↓
Firebase synchronization runs in background
↓
Latest data updates SQLite
↓
UI refreshes
```

Do NOT show a full-screen loading screen while Firebase is synchronizing.

A small sync indicator is acceptable.

---

## 10. Offline → Online Transition

Test:

```text
Launch offline
↓
SQLite data displayed
↓
Internet becomes available
↓
NetInfo detects connection
↓
Background Firebase sync
↓
SQLite updated
↓
UI refreshed
```

The app must remain usable throughout the entire process.

---

## 11. Firebase Failure Test

Simulate:

- Firebase unavailable
- invalid Firebase response
- timeout
- DNS/network failure
- permission error
- empty Firebase data

Expected:

```text
App remains open
SQLite remains usable
No black screen
No infinite loading
Error logged
User can continue offline
```

---

## 12. Error Boundary

Add or verify a React error boundary around the main application.

A runtime component error should display a proper recovery screen instead of a completely black screen.

Example concept:

```text
Something went wrong.

Reload App
```

Do not expose technical stack traces to normal users.

Log detailed errors for debugging.

---

## 13. Navigation Startup

Inspect Expo Router initialization.

Make sure the root layout does not wait indefinitely for:

- Firebase
- SQLite data
- NetInfo
- authentication
- synchronization

Navigation should become available as soon as the basic local application initialization is complete.

Check:

```text
app/_layout.tsx
```

and all relevant providers.

Avoid circular initialization between:

```text
Root Layout
→ Context
→ Firebase
→ Navigation
→ Context
```

---

## 14. Context Providers

Inspect all React Context providers.

Identify providers that perform async initialization during render or before children are displayed.

Refactor if necessary so that:

```text
Provider initializes
      ↓
Children can render
      ↓
Background services start
```

Do not make every provider block the complete application.

---

## 15. Prevent Multiple Sync Processes

When the app becomes online, make sure only one Firebase synchronization process runs at a time.

Example:

```js
let syncInProgress = false;

async function syncFirebaseInBackground() {
  if (syncInProgress) return;

  syncInProgress = true;

  try {
    await syncFirebase();
  } catch (error) {
    console.error("Sync failed:", error);
  } finally {
    syncInProgress = false;
  }
}
```

Adapt this to the existing architecture rather than blindly copying it.

---

## 16. Logging

Add temporary startup diagnostics.

Log:

```text
[BOOT] App starting
[BOOT] SQLite initialization started
[BOOT] SQLite initialized
[BOOT] Local contacts loaded
[BOOT] UI ready
[NETWORK] Connectivity changed
[SYNC] Firebase sync started
[SYNC] Firebase sync completed
[SYNC] Firebase sync failed
[SPLASH] Splash hidden
```

This will help identify exactly where the cold-start process is stopping.

Remove excessive debug logs before production, but retain useful error logging.

---

# Required Testing Matrix

After implementing the fix, test all of these:

| Test | Expected Result |
|---|---|
| Online normal launch | App opens |
| Offline normal launch | App opens |
| Online → Close All → Launch | App opens |
| Offline → Close All → Launch | App opens |
| Offline launch → Internet ON | App stays open |
| Online launch → Internet OFF | App stays open |
| Firebase unavailable | App stays open |
| Firebase timeout | App stays open |
| Empty SQLite | App opens |
| Existing SQLite data | Contacts appear |
| Fresh install + offline | App opens |
| Multiple rapid launches | No crash/black screen |
| Background sync failure | App remains usable |

---

# Important Constraints

Do NOT:

- remove offline SQLite functionality
- remove Firebase synchronization
- require internet to launch the app
- fetch Firebase before displaying SQLite data
- clear SQLite merely because Firebase is temporarily unavailable
- add an unnecessary authentication requirement
- replace the existing database architecture without a reason
- introduce unnecessary dependencies
- hide errors with arbitrary delays such as `setTimeout`
- solve the problem by forcing Android to restart the app

Do NOT use a fake loading delay as a fix.

Find and fix the actual initialization/lifecycle problem.

---

# Codebase Investigation

Before changing code:

1. Inspect the entire project structure.
2. Find `app/_layout.tsx`.
3. Find the root `App` component if present.
4. Find SQLite initialization.
5. Find Firebase initialization.
6. Find Firebase synchronization.
7. Find NetInfo listeners.
8. Find SplashScreen usage.
9. Find React Context providers.
10. Find navigation initialization.
11. Find all startup `useEffect()` hooks.
12. Find all places that return `null` during loading.
13. Find all global loading states.
14. Find unhandled promises.
15. Find possible infinite async waits.

Do not guess the cause before inspecting the code.

---

# Implementation Strategy

Use the existing project architecture where possible.

Prefer minimal, safe changes.

The final startup lifecycle should be:

```text
Cold Start
   ↓
Initialize SQLite
   ↓
Load local data
   ↓
Mark app ready
   ↓
Hide splash
   ↓
Render UI
   ↓
Start NetInfo monitoring
   ↓
If online → background Firebase sync
   ↓
Update SQLite
   ↓
Refresh UI
```

The **first successful screen render must not depend on internet connectivity or Firebase**.

---

# Final Acceptance Criteria

The fix is complete only when:

- GS MTR launches successfully after Android **Close All Apps** while offline.
- GS MTR launches successfully after Android **Close All Apps** while online.
- The app does not require closing all apps a second time.
- Local SQLite contacts are available immediately.
- Firebase synchronization happens in the background.
- Network failures never produce a black screen.
- Splash screen cannot remain permanently visible.
- No startup operation can remain indefinitely pending.
- Existing GS MTR features continue working.
- Offline-first behavior remains intact.

After making the changes, provide:

1. Root cause of the black screen.
2. Files modified.
3. What was changed in each file.
4. Why the fix works.
5. Testing performed.
6. Any remaining warnings or issues.

Do not claim the problem is fixed unless the code has actually been inspected and the relevant startup paths have been tested.