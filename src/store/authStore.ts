import { create } from 'zustand';
import { AppUser } from '@/types/auth';
import { signIn as firebaseSignIn, signOut as firebaseSignOut, onAuthChange } from '@/firebase/auth';

interface AuthStore {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  initialize: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AppUser | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  // Default to NOT loading: the UI must render immediately and never wait for
  // Firebase Auth. Auth state resolves in the background via onAuthChange.
  isLoading: false,
  isAdmin: false,

  initialize: () => {
    try {
      const unsubscribe = onAuthChange((user) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          isAdmin: user?.role === 'admin',
        });
      });
      return () => {
        try { unsubscribe(); } catch { /* ignore */ }
      };
    } catch (error) {
      // A Firebase Auth failure must never leave the app stuck in a loading
      // state or prevent rendering. Log and continue as a guest.
      console.error('[AUTH] Auth listener initialization failed:', error);
      set({ isLoading: false });
      return () => {};
    }
  },

  login: async (email: string, password: string) => {
    const user = await firebaseSignIn(email, password);
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: user.role === 'admin',
    });
  },

  logout: async () => {
    await firebaseSignOut();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
    });
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      isAdmin: user?.role === 'admin',
    });
  },
}));
