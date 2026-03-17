import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

export type KeepAliveOutletProps = {
  max?: number;
  excludePathnames?: string[];
  activeKey: string;
  evictKey?: string | null;
};

const ACTIVE_PANEL_STYLE: React.CSSProperties = { display: 'block', height: '100%' };
const HIDDEN_PANEL_STYLE: React.CSSProperties = { display: 'none', height: '100%' };

export default function KeepAliveOutlet({ max = 6, excludePathnames = ['/'], activeKey, evictKey }: KeepAliveOutletProps) {
  const outlet = useOutlet();
  const location = useLocation();
  const pathname = location.pathname;

  const excludeSet = useMemo(() => new Set(excludePathnames), [excludePathnames]);
  const cacheRef = useRef<Map<string, React.ReactNode>>(new Map());
  const outletRef = useRef(outlet);
  outletRef.current = outlet;
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!evictKey) {
      return;
    }
    cacheRef.current.delete(evictKey);
    setCacheKeys((prev) => prev.filter((key) => key !== evictKey));
  }, [evictKey]);

  useEffect(() => {
    const currentOutlet = outletRef.current;
    if (!currentOutlet) {
      return;
    }

    if (excludeSet.has(pathname)) {
      return;
    }

    cacheRef.current.set(activeKey, currentOutlet);
    setCacheKeys((prev) => {
      const already = prev.includes(activeKey);
      let next = already ? prev : [...prev, activeKey];

      while (next.length > max) {
        const removeCandidate = next.find((key) => key !== activeKey);
        if (!removeCandidate) {
          break;
        }
        next = next.filter((key) => key !== removeCandidate);
        cacheRef.current.delete(removeCandidate);
      }

      return next;
    });
  }, [activeKey, excludeSet, max, pathname]);

  if (excludeSet.has(pathname)) {
    return outlet;
  }

  return (
    <>
      {cacheKeys.map((key) => (
        <div key={key} style={key === activeKey ? ACTIVE_PANEL_STYLE : HIDDEN_PANEL_STYLE}>
          {cacheRef.current.get(key)}
        </div>
      ))}
    </>
  );
}
