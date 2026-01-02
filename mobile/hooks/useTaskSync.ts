import { useEffect, useState } from 'react';
import { syncService } from '@/core/sync/sync.service';
import { useNetwork } from './useNetwork';

export function useTaskSync() {
  const { isOnline } = useNetwork();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const sync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const result = await syncService.syncTasks();
      setLastSyncTime(new Date());
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Auto-sync when coming online
    if (isOnline && !isSyncing) {
      sync();
    }
  }, [isOnline]);

  return {
    sync,
    isSyncing,
    lastSyncTime,
  };
}

