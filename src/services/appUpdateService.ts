import { Platform } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { getFirebaseDb } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { isUpdateRequired } from '@/utils/version';
import { APP_VERSION } from '@/utils/constants';

/**
 * Reusable one-time APK update system for GS MTR.
 *
 * The release configuration lives in Firestore under `appConfig/android`
 * (see GS_MTR_RELEASE.md). The installed APK version is always the source of
 * truth — no AsyncStorage "updated" flags are ever used.
 */

/** Release configuration published under Firestore: appConfig/android. */
export interface AppUpdateConfig {
  latestVersion: string;
  minimumVersion: string;
  apkUrl: string;
  versionCode?: number;
  releaseNotes: string;
}

/** Structured result of a version check. */
export interface UpdateCheckResult {
  updateRequired: boolean;
  currentVersion: string;
  latestVersion: string;
  minimumVersion: string;
  apkUrl: string;
  releaseNotes: string;
}

export interface DownloadProgressInfo {
  /** Bytes written so far. */
  written: number;
  /** Expected total; -1 when the server omits Content-Length. */
  total: number;
  /** 0–100 percentage; falls back to 0 while the total is unknown. */
  percent: number;
}

const DEFAULT_VERSION = '0.0.0';
const CONFIG_TIMEOUT_MS = 10_000;
const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes — slow networks included
const MIN_FREE_BYTES = 10 * 1024 * 1024; // refuse to start when <10 MB free

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/**
 * Reads the version from the installed APK via the Expo config embedded in
 * the build. The installed APK version is the source of truth (same value
 * shown in Settings, from `@/utils/constants`).
 */
export function getCurrentVersion(): string {
  return APP_VERSION || DEFAULT_VERSION;
}

/**
 * Reads the release configuration from Firestore (`appConfig/android`).
 * Returns `null` when the document does not exist.
 */
export async function getRemoteAppConfig(): Promise<AppUpdateConfig | null> {
  const ref = doc(getFirebaseDb(), COLLECTIONS.APP_CONFIG, 'android');
  const snapshot = await withTimeout(getDoc(ref), CONFIG_TIMEOUT_MS, 'Update config read');
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    latestVersion: String(data.latestVersion ?? ''),
    minimumVersion: String(data.minimumVersion ?? ''),
    apkUrl: String(data.apkUrl ?? ''),
    versionCode: typeof data.versionCode === 'number' ? data.versionCode : undefined,
    releaseNotes: String(data.releaseNotes ?? ''),
  };
}

/**
 * Compares the installed version against the remote `minimumVersion`.
 *
 * Fails open: any read/parse problem yields `updateRequired: false` so the
 * update system can never block or crash the app. Offline behavior is handled
 * by the caller (the hook never calls this without connectivity).
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const currentVersion = getCurrentVersion();
  const base: UpdateCheckResult = {
    updateRequired: false,
    currentVersion,
    latestVersion: currentVersion,
    minimumVersion: currentVersion,
    apkUrl: '',
    releaseNotes: '',
  };

  const config = await getRemoteAppConfig();
  if (!config) return base;

  return {
    ...base,
    updateRequired: isUpdateRequired(currentVersion, config.minimumVersion),
    latestVersion: config.latestVersion,
    minimumVersion: config.minimumVersion,
    apkUrl: config.apkUrl,
    releaseNotes: config.releaseNotes,
  };
}

/**
 * Downloads the APK from the Firebase-provided URL into the app cache with
 * progress reporting. Returns the local `file://` URI on success.
 *
 * Handles: invalid URL, missing storage, insufficient space, slow networks,
 * timeouts, failed/interrupted downloads and zero-byte files.
 */
export async function downloadUpdate(
  apkUrl: string,
  onProgress: (progress: DownloadProgressInfo) => void
): Promise<string> {
  if (!apkUrl || !/^https?:\/\//i.test(apkUrl)) {
    throw new Error('Invalid download URL.');
  }

  let cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) throw new Error('Download storage is unavailable.');
  if (!cacheDir.endsWith('/')) cacheDir += '/';

  try {
    const freeBytes = await FileSystem.getFreeDiskStorageAsync();
    if (freeBytes < MIN_FREE_BYTES) {
      throw new Error('Not enough storage space for the update.');
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Not enough')) throw error;
    // A storage-query failure is non-fatal; the write itself fails if full.
  }

  const folder = `${cacheDir}gs-mtr-updates/`;
  try {
    await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  } catch {
    // Directory already exists.
  }

  const fileName = apkUrl.split('/').pop()?.split('?')[0] || `GS-MTR-${getCurrentVersion()}.apk`;
  const fileUri = `${folder}${fileName}`;

  const download = FileSystem.createDownloadResumable(
    apkUrl,
    fileUri,
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      const total = totalBytesExpectedToWrite;
      const percent = total > 0 ? Math.min(100, Math.round((totalBytesWritten / total) * 100)) : 0;
      onProgress({ written: totalBytesWritten, total, percent });
    }
  );

  const result = await withTimeout(download.downloadAsync(), DOWNLOAD_TIMEOUT_MS, 'APK download');
  if (!result?.uri) throw new Error('Update download failed.');

  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists || (info.size ?? 0) === 0) {
    throw new Error('Downloaded update is invalid.');
  }

  return fileUri;
}

/**
 * Hands the downloaded APK to the Android package installer via a
 * FileProvider content URI. Android upgrades the existing installation in
 * place — app data (SQLite, session, settings) is preserved and GS MTR is
 * never uninstalled.
 */
export async function installUpdate(localUri: string): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('APK installation is only available on Android.');
  }
  const contentUri = await FileSystem.getContentUriAsync(localUri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    type: 'application/vnd.android.package-archive',
    // FLAG_GRANT_READ_URI_PERMISSION — lets the package installer read the
    // FileProvider URI granted by our app.
    flags: 1,
  });
}
