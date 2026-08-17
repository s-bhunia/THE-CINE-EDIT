import { useSyncExternalStore } from 'react';
import { activeVideoStore } from '@/store/activeVideo';

export function useActiveVideo(id: string) {
  const activeId = useSyncExternalStore(
    activeVideoStore.subscribe,
    activeVideoStore.getSnapshot,
  );

  return {
    isActive: activeId === id,
    requestPlayback: () => activeVideoStore.requestPlayback(id),
    release: () => activeVideoStore.release(id),
  };
}
