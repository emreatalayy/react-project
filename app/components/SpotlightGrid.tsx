'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';

// Feeds the cursor position to every .spotlight card so the glow follows the pointer.
export function SpotlightGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    ref.current?.querySelectorAll<HTMLElement>('.spotlight').forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--y', `${event.clientY - rect.top}px`);
    });
  }

  return (
    <div ref={ref} onPointerMove={handlePointerMove} className={`spotlight-group ${className}`}>
      {children}
    </div>
  );
}
