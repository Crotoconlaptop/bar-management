import { useEffect } from 'react';
import supabase from '../services/supabase';

export const useRealtimeSubscription = (table, callback) => {
  useEffect(() => {
    const subscription = supabase
      .from(table)
      .on('*', callback)
      .subscribe();

    return () => supabase.removeSubscription(subscription);
  }, [table, callback]);
};
