import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUser, isAdminRole, isSuperAdminRole, UserProfile } from '@/types/auth';
import {
  signInWithBDNumber,
  signOut as firebaseSignOut,
  onAuthChange,
  toAppUser,
} from '@/firebase/auth';
import { listenUserProfile } from '@/firebase/userService';

/** Local session cache so approved users keep offline access to contacts. */
const SESSION_KEY = 'gs_mtr_session_v1';

function computeFlags(user: AppUser | null) {
  const role = user?.role;
  const isAdmin = isAdminRole(role);
  return {
    user,
    isAuthenticated: !!user,
    isAdmin,
    isSuperAdmin: isSuperAdminRole(role),
    // Contact access is strictly status-gated (admins default to 'approved'
    // when no status is present, so this never blocks real admins).
    canAccessContacts: !!user && user.status === 'approved',
  };
}

interface AuthStore {
  user: AppUser | null;
  isAuthenticated: boolean;
  /** True once the session has resolved (cache or Firebase) — gates redirects. */
  authInitialized: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canAccessContacts: boolean;
  initialize: () => () => void;
  login: (bdNumber: string, password: string, rememberMe?: boolean) => Promise<AppUser>;
  logout: () => Promise<void>;
  setUser: (user: AppUser | null) => void;
  /** Re-fetch the Firestore profile for the current session user. */
  refreshProfile: () => Promise<void>;
}

async function cacheSession(user: AppUser | null) {
  try {
    if (user) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Caching must never break auth flow.
  }
}

async function restoreSession(): Promise<AppUser | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.uid) return parsed as AppUser;
    return null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  // The UI must render immediately and never wait for Firebase Auth. Session
  // state resolves in the background via restoreSession + onAuthChange.
  authInitialized: false,
  isLoading: false,
  isAdmin: false,
  isSuperAdmin: false,
  canAccessContacts: false,

  initialize: () => {
    let profileUnsubscribe: (() => void) | null = null;

    const subscribeProfile = (uid: string) => {
      try {
        if (profileUnsubscribe) profileUnsubscribe();
        profileUnsubscribe = listenUserProfile(
          uid,
          (profile: UserProfile) => {
            const next = toAppUser(profile);
            set({ ...computeFlags(next) });
            cacheSession(next);
          },
          () => {
            // Offline listener errors are ignored — cached session remains.
          }
        );
      } catch {
        // ignore
      }
    };

    try {
      // 1. Restore the cached session immediately (offline-first).
      restoreSession().then((cached) => {
        if (cached) {
          set({ ...computeFlags(cached), authInitialized: true, isLoading: false });
        } else {
          set({ authInitialized: true, isLoading: false });
        }
      });

      // 2. Resolve the real Firebase session in the background.
      const unsubscribe = onAuthChange((incoming) => {
        if (!incoming) {
          if (profileUnsubscribe) profileUnsubscribe();
          profileUnsubscribe = null;
          set({
            ...computeFlags(null),
            authInitialized: true,
            isLoading: false,
          });
          cacheSession(null);
          return;
        }

        // Always listen to users/{uid} so profile writes (registration, admin
        // approval/decline/suspension) update the session in real time.
        subscribeProfile(incoming.uid);

        const current = get().user;
        // Offline fallback profile (status unknown): keep the richer cached
        // session instead of downgrading an approved user to pending.
        if (!incoming.profileComplete && current && current.uid === incoming.uid) {
          set({ authInitialized: true, isLoading: false });
          return;
        }

        set({ ...computeFlags(incoming), authInitialized: true, isLoading: false });
        cacheSession(incoming);
      });

      return () => {
        try { unsubscribe(); } catch { /* ignore */ }
        if (profileUnsubscribe) {
          try { profileUnsubscribe(); } catch { /* ignore */ }
          profileUnsubscribe = null;
        }
      };
    } catch (error) {
      console.error('[AUTH] Auth listener initialization failed:', error);
      set({ isLoading: false, authInitialized: true });
      return () => {};
    }
  },

  login: async (bdNumber: string, password: string, rememberMe = true) => {
    const user = await signInWithBDNumber(bdNumber, password, rememberMe);
    set({ ...computeFlags(user), isLoading: false });
    await cacheSession(user);
    return user;
  },

  logout: async () => {
    try {
      await firebaseSignOut();
    } catch {
      // Local sign-out must succeed even if the network is down.
    }
    set({
      ...computeFlags(null),
      isLoading: false,
    });
    await cacheSession(null);
  },

  setUser: (user) => {
    set({ ...computeFlags(user), isLoading: false });
    cacheSession(user);
  },

  refreshProfile: async () => {
    const current = get().user;
    if (!current) return;
    try {
      const { getUserProfile } = await import('@/firebase/auth');
      const profile = await getUserProfile(current.uid);
      const next = toAppUser(profile);
      set({ ...computeFlags(next) });
      await cacheSession(next);
    } catch {
      // Offline: keep the cached session.
    }
  },
}));
