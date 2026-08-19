/**
 * Semantic version utilities for the GS MTR APK update system.
 *
 * Versions are compared numerically (major.minor.patch) — never as plain
 * strings — so `1.10.0` correctly sorts after `1.9.0`.
 */

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  raw: string;
}

/** Accepts "1.2.3", "v1.2.3" and pre-release/build suffixes like "1.2.3-beta.1". */
export function parseVersion(version: string): ParsedVersion | null {
  if (typeof version !== 'string') return null;
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version.trim());
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    raw: version.trim(),
  };
}

/**
 * Compares two semantic version strings.
 * Returns a negative number when `a < b`, `0` when equal, a positive number
 * when `a > b`. Malformed versions fall back to a plain comparison so the
 * update check can never throw or crash the app.
 */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return a.localeCompare(b);
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  return pa.patch - pb.patch;
}

/**
 * True when the installed version is strictly below the minimum required
 * version — i.e. a mandatory update is needed.
 */
export function isUpdateRequired(currentVersion: string, minimumVersion: string): boolean {
  return compareVersions(currentVersion, minimumVersion) < 0;
}

/**
 * Validates a Firestore config value for `minimumVersion` or `latestVersion`.
 * Returns null if valid, or a human-readable error string.
 *
 * Common mistakes this catches:
 *   - Putting the integer versionCode (e.g. 42) instead of semver (e.g. 1.1.0)
 *   - Empty string
 *   - Non-semver format
 */
export function validateVersionField(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) return `${fieldName} is empty`;
  const parsed = parseVersion(value);
  if (!parsed) return `${fieldName} "${value}" is not valid semver (expected e.g. 1.0.0)`;
  // Catch integer versionCode accidentally used as versionName
  if (/^\d+$/.test(value.trim())) {
    return `${fieldName} "${value}" looks like a versionCode (integer), not a versionName (semver like 1.0.0)`;
  }
  return null;
}
