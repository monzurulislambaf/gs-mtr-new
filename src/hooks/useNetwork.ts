import { useEffect, useState } from 'react';
import { checkConnectivity, onConnectivityChange } from '@/database/sync';

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    checkConnectivity().then(setIsOnline);
    const unsubscribe = onConnectivityChange(setIsOnline);
    return unsubscribe;
  }, []);

  return { isOnline };
}
