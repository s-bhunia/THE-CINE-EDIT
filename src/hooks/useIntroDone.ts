import { useSyncExternalStore } from 'react';
import { bootStore } from '@/store/boot';

export function useIntroDone() {
  return useSyncExternalStore(bootStore.subscribe, bootStore.getSnapshot);
}
