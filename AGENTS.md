# PABX-MTR Project

A production-ready Android office contact directory app.

## Tech Stack
- Expo SDK 57, React Native 0.86, TypeScript
- Expo Router (file-based routing)
- React Native Paper (Material 3)
- Zustand (state management)
- TanStack Query (server state)
- Expo SQLite (local database)
- Firebase Firestore + Auth
- FlashList (virtualized lists)

## Commands
- `npm start` - Start Expo dev server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npx tsc --noEmit` - Type check

## Project Structure
```
src/app/          - Expo Router pages
src/components/   - Reusable UI components
src/database/     - SQLite schema, queries, sync engine
src/firebase/     - Firebase config, auth, firestore
src/hooks/        - Custom React hooks
src/services/     - Business logic (contacts, CSV)
src/store/        - Zustand stores
src/types/        - TypeScript types
src/utils/        - Validation, formatting, permissions
```

## Architecture
- Offline-first with SQLite local DB
- Incremental sync via updatedAt > lastSyncTime
- Real-time Firestore listeners for live updates
- Search always local (SQLite LIKE queries)
- Role-based auth (admin/user)
- Material 3 theme with light/dark/system support
