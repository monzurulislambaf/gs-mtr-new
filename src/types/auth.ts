export type UserRole = 'admin' | 'user';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: number;
}

export interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
