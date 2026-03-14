import { useCallback, useRef, useState } from 'react';

/**
 * Manages a Set<string> of IDs that are in "refreshing" state.
 * After `duration` ms each ID is automatically removed.
 */
export function useRefreshingSet(duration = 1500) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const refresh = useCallback(
    (id: string) => {
      const prev = timers.current.get(id);
      if (prev) clearTimeout(prev);

      setIds((s) => new Set(s).add(id));
      const timer = setTimeout(() => {
        setIds((s) => {
          const next = new Set(s);
          next.delete(id);
          return next;
        });
        timers.current.delete(id);
      }, duration);
      timers.current.set(id, timer);
    },
    [duration]
  );

  return { refreshingIds: ids, refresh } as const;
}
