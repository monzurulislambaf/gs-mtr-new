/**
 * Centralized friendly error messages.
 *
 * Firebase throws errors whose `message` looks like:
 *   "Firebase: Error (auth/wrong-password). The password is invalid..."
 * Never show that raw text to a user. Route every caught error through
 * `getFriendlyErrorMessage` so known Firebase error codes are translated
 * into clear, user-facing copy, and the "Firebase: Error (code)." prefix is
 * stripped from anything we haven't explicitly mapped.
 */

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Sign in
  'auth/invalid-credential': 'Incorrect BD Number or password. Please try again.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/user-not-found': 'No account found with this email address. Please check and try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact the administrator.',
  // Registration
  'auth/email-already-in-use': 'This email address is already registered. Please sign in instead.',
  'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact the administrator.',
  'auth/missing-password': 'Please enter your password.',
  'auth/missing-email': 'Please enter your email address.',
  // Reset password
  'auth/expired-action-code': 'This link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This link is invalid or has already been used.',
  // Rate limiting / network
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Check your internet connection and try again.',
  'auth/quota-exceeded': 'Too many requests. Please try again later.',
  // Session / configuration
  'auth/requires-recent-login': 'For your security, please sign in again to continue.',
  'auth/user-token-expired': 'Your session has expired. Please sign in again.',
  'auth/unverified-email': 'Please verify your email address before signing in.',
  'auth/invalid-api-key': 'App configuration error. Please contact the administrator.',
  'auth/app-not-authorized': 'This app is not authorized to use this service. Please contact the administrator.',
  'auth/internal-error': 'Something went wrong. Please try again.',
};

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'You do not have permission to perform this action. Please contact the administrator.',
  unauthenticated: 'Please sign in again to continue.',
  'not-found': 'The requested item was not found. It may have been deleted.',
  'already-exists': 'This item already exists.',
  'failed-precondition': 'This action could not be completed in the current state. Please refresh and try again.',
  'deadline-exceeded': 'The request took too long. Please check your connection and try again.',
  'resource-exhausted': 'Too many requests. Please try again later.',
  aborted: 'The operation was cancelled. Please try again.',
  unavailable: 'Network error. Check your connection and try again.',
  internal: 'Something went wrong. Please try again.',
};

const STORAGE_ERROR_MESSAGES: Record<string, string> = {
  'storage/unauthorized': 'You do not have permission to access this file.',
  'storage/canceled': 'The upload was cancelled.',
  'storage/unknown': 'Something went wrong while accessing the file.',
};

function errorCode(error: unknown): string {
  if (error && typeof error === 'object' && typeof (error as any).code === 'string') {
    return (error as any).code as string;
  }
  return '';
}

/** Strips the "Firebase: Error (code)." prefix Firebase prepends to messages. */
function stripFirebasePrefix(message: string): string {
  return message.replace(/^Firebase: Error \(([^)]+)\)\.\s*/i, '').trim();
}

/**
 * Returns a friendly, user-facing message for any thrown value (Firebase or
 * otherwise). Known error codes are translated; unknown codes fall back to the
 * raw error message with the Firebase prefix stripped, then to `fallback`.
 */
export function getFriendlyErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (!error) return fallback;

  const code = errorCode(error);
  if (code) {
    const mapped =
      AUTH_ERROR_MESSAGES[code] ??
      FIRESTORE_ERROR_MESSAGES[code] ??
      STORAGE_ERROR_MESSAGES[code];
    if (mapped) return mapped;
  }

  const raw =
    typeof error === 'string'
      ? error
      : typeof (error as any)?.message === 'string'
        ? (error as any).message
        : '';
  const cleaned = stripFirebasePrefix(raw);
  if (cleaned) return cleaned;

  return fallback;
}
