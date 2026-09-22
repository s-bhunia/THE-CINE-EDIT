import { useState, useEffect } from 'react';

export function SafeAreaGuides() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'g' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    // Behind the page rather than over it: main is z-10, so the frame can never
    // cross content. It only shows through where a section leaves ground bare.
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-12">
      <div className="absolute inset-[5%] border border-bone-dim" />
      <div className="absolute inset-[10%] border border-bone-dim" />

      <div className="absolute top-[5%] left-[5%] w-4 h-4 border-t-2 border-l-2 border-bone transform -translate-x-1 -translate-y-1" />
      <div className="absolute top-[5%] right-[5%] w-4 h-4 border-t-2 border-r-2 border-bone transform translate-x-1 -translate-y-1" />
      <div className="absolute bottom-[5%] left-[5%] w-4 h-4 border-b-2 border-l-2 border-bone transform -translate-x-1 translate-y-1" />
      <div className="absolute bottom-[5%] right-[5%] w-4 h-4 border-b-2 border-r-2 border-bone transform translate-x-1 translate-y-1" />
    </div>
  );
}
