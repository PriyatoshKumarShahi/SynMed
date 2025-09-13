import { useEffect } from 'react';
import { flushQueue } from '../utils/offlineSync';
import API from '../utils/api';

export default function useOffline() {
  useEffect(() => {
    const onOnline = () => flushQueue(API);
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);
}
