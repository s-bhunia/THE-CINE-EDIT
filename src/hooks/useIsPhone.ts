import { useEffect, useState } from 'react';

/** Matches Tailwind's `md` breakpoint, so JS and utility classes agree. */
const PHONE_QUERY = '(max-width: 767px)';

export function useIsPhone(): boolean {
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const sync = () => setIsPhone(query.matches);
    query.addEventListener('change', sync);
    sync();
    return () => query.removeEventListener('change', sync);
  }, []);

  return isPhone;
}
