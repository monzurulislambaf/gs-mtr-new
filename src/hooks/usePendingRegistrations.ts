import { useEffect, useState, useCallback } from 'react';
import { listenPendingRegistrations, getPendingRegistrations } from '@/firebase/userService';
import { UserProfile } from '@/types/auth';

export function usePendingRegistrations(enabled = true) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const unsubscribe = listenPendingRegistrations(
      (profiles) => {
        if (mounted) {
          setUsers(profiles);
          setLoading(false);
        }
      },
      () => {
        if (mounted) setLoading(false);
      }
    );
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [enabled]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const profiles = await getPendingRegistrations();
      setUsers(profiles);
    } catch {
      // listener still running; ignore
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  return { users, count: users.length, loading, refresh };
}
