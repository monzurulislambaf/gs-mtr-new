export type UserRole = 'user' | 'admin' | 'super_admin';

export type UserStatus = 'pending' | 'approved' | 'declined' | 'suspended';

export type UserCategory = 'Officer' | 'Airman' | 'Civilian';

/** Field labels that vary by registration category. */
export const CATEGORY_LABELS = {
  Officer: { course: 'Course', date: 'Date of Commission', branch: 'Branch' },
  Airman: { course: 'Entry', date: 'Date of Enrolment', branch: 'Trade' },
  Civilian: { course: null, date: 'Date of Enrolment', branch: 'Trade' },
} as const;


/** Full Firestore users/{uid} profile document. */
export interface UserProfile {
  uid: string;
  fullName: string;
  category: UserCategory;
  bdNumber: string;
  retired: boolean;
  rank: string;
  branch: string;
  trade: string;
  course: string;
  commissionDate: string;
  designation: string;
  office: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
  approvedBy?: string;
  declinedAt?: number;
  declinedBy?: string;
  declineReason?: string;
}

/** Subset of the profile exposed to the app session (auth store). */
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  bdNumber: string;
  category?: UserCategory;
  rank?: string;
  branch?: string;
  photoURL?: string;
  createdAt: number;
  declineReason?: string;
  /** True when the profile came from a real Firestore users/{uid} document. */
  profileComplete?: boolean;
}

/** Data collected by the Request Registration form. */
export interface RegistrationInput {
  fullName: string;
  category: UserCategory;
  bdNumber: string;
  retired: boolean;
  rank: string;
  branch: string;
  trade: string;
  course: string;
  commissionDate: string;
  designation: string;
  office: string;
  email: string;
  mobile: string;
  password: string;
}

export const USER_STATUSES: UserStatus[] = ['pending', 'approved', 'declined', 'suspended'];

export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isSuperAdminRole(role: UserRole | undefined | null): boolean {
  return role === 'super_admin';
}
