import { useCallback, useSyncExternalStore } from 'react';
import { activeVideoStore } from '@/store/activeVideo';

export function useActiveVideo(id: string) {
  const activeId = useSyncExternalStore(
    activeVideoStore.subscribe,
    activeVideoStore.getSnapshot,
  );

  // These are handed to effect dependency arrays, so they have to keep a stable
  // identity for as long as the id does. Fresh closures on every render made the
  // observer in MicroPreview tear down and release playback each time the store
  // ticked, which left previews looping between active and idle instead of playing.
  const requestPlayback = useCallback(() => activeVideoStore.requestPlayback(id), [id]);
  const release = useCallback(() => activeVideoStore.release(id), [id]);

  return {
    isActive: activeId === id,
    requestPlayback,
    release,
  };
}
