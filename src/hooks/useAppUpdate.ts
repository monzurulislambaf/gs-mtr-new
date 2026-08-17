import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import { checkConnectivity } from '@/database/sync';
import {
  checkForUpdate,
  downloadUpdate,
  installUpdate,
  UpdateCheckResult,
} from '@/services/appUpdateService';

/**
 * Startup logic:
 *
 *   App launch
 *     → existing startup (SQLite first, UI ready)
 *     → connectivity check (existing NetInfo)
 *       → OFFLINE: open the offline app normally, never block
 *       → ONLINE: read appConfig/android, compare versions
 *         → current >= minimum: open the app
 *         → current < minimum: show the mandatory update screen
 *
 * The check always fails open — any error simply opens the app.
 */

type UpdatePhase =
  | 'idle' // not checked yet
  | 'checking' // (re)check in flight
  | 'up-to-date' // no update required — app opens normally
  | 'update-required' // mandatory update — update screen shown
  | 'downloading' // APK downloading
  | 'installing' // handing off to the Android installer
  | 'failed'; // last download/install attempt failed

export interface UseAppUpdateResult {
  /** True while the mandatory update screen must be shown. */
  updateRequired: boolean;
  info: UpdateCheckResult | null;
  downloading: boolean;
  installing: boolean;
  /** 0–100 download progress. */
  downloadProgress: number;
  /** Non-null after a failed download/install attempt. */
  error: string | null;
  /** Starts the download + install flow (UPDATE NOW). */
  startDownload: () => void;
  /** Re-runs the version check (RETRY and app-resume paths). */
  recheck: () => void;
}

function isExpoGo(): boolean {
  try {
    return Constants.executionEnvironment === 'storeClient';
  } catch {
    return false;
  }
}

export function useAppUpdate(): UseAppUpdateResult {
  const [phase, setPhase] = useState<UpdatePhase>('idle');
  const [info, setInfo] = useState<UpdateCheckResult | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const checkInFlight = useRef(false);
  const phaseRef = useRef<UpdatePhase>('idle');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const runCheck = useCallback(async () => {
    // The APK update system is Android-only, and Expo Go cannot install
    // APKs — never gate development inside Expo Go.
    if (Platform.OS !== 'android' || isExpoGo()) {
      setPhase('up-to-date');
      return;
    }
    if (checkInFlight.current) return;
    checkInFlight.current = true;
    try {
      // Keep 'idle' during the very first check so the update screen never
      // flashes on launch; use 'checking' for re-checks while the update
      // screen is already visible.
      setPhase((p) => (p === 'idle' ? p : 'checking'));
      const online = await checkConnectivity();
      if (!online) {
        // Offline-first: never block the app, even when Firebase says the
        // installed version is old.
        setPhase('up-to-date');
        return;
      }
      const result = await checkForUpdate();
      setInfo(result);
      setError(null);
      if (result.updateRequired) {
        setDownloadProgress(0);
        setPhase('update-required');
      } else {
        setPhase('up-to-date');
      }
    } catch (e) {
      console.error('[UPDATE] Version check failed — continuing normally:', e);
      setPhase('up-to-date'); // fail-open, never crash
    } finally {
      checkInFlight.current = false;
    }
  }, []);

  // Check once at startup (the UI is already rendered — this never blocks)
  // and again whenever the app returns to the foreground while the update
  // flow is active. The resume path covers coming back from the Android
  // installer after a successful install or a cancel.
  useEffect(() => {
    runCheck();
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const prev = phaseRef.current;
      const inUpdateFlow =
        prev === 'update-required' ||
        prev === 'downloading' ||
        prev === 'installing' ||
        prev === 'failed';
      if (inUpdateFlow) runCheck();
    });
    return () => sub.remove();
  }, [runCheck]);

  const startDownload = useCallback(async () => {
    if (!info) return;
    setError(null);
    setDownloadProgress(0);
    setPhase('downloading');
    try {
      const localUri = await downloadUpdate(info.apkUrl, ({ percent }) => {
        setDownloadProgress(percent);
      });
      setPhase('installing');
      await installUpdate(localUri);
      // Control returns here when the user cancels the installer. Re-check so
      // the screen clears (installed) or stays (cancelled). A successful
      // install replaces the process, so the fresh APK re-checks on launch.
      setTimeout(() => {
        runCheck();
      }, 1500);
    } catch (e: any) {
      console.error('[UPDATE] Download/install failed:', e);
      setError(e?.message || 'Update download failed.');
      setPhase('failed');
    }
  }, [info, runCheck]);

  const recheck = useCallback(() => {
    runCheck();
  }, [runCheck]);

  const updateRequired =
    phase === 'update-required' ||
    phase === 'downloading' ||
    phase === 'installing' ||
    phase === 'failed' ||
    // During a re-check the previous result still requires an update.
    (phase === 'checking' && info?.updateRequired === true);

  return {
    updateRequired,
    info,
    downloading: phase === 'downloading',
    installing: phase === 'installing',
    downloadProgress,
    error,
    startDownload,
    recheck,
  };
}
