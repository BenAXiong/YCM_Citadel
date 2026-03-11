import { useEffect, RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent) => void,
  active: boolean = true
) {
  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    // Defer listener attachment to next tick to avoid catching the opening click
    const id = setTimeout(() => document.addEventListener('click', listener), 0);
    
    return () => {
      clearTimeout(id);
      document.removeEventListener('click', listener);
    };
  }, [ref, handler, active]);
}
