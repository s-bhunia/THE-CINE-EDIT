import { useState, useEffect } from 'react';
import { fromScrollProgress } from '@/lib/format/timecode';

export function useScrollTimecode(durationSeconds: number = 60, fps: number = 24) {
  const [timecode, setTimecode] = useState('00:00:00:00');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;

      setTimecode(fromScrollProgress(progress, durationSeconds, fps));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [durationSeconds, fps]);

  return timecode;
}
