'use client';

/**
 * =========================================================================
 * READING RULER / FOCUS GUIDE (Special Education & Dyslexia / ADHD Accommodation)
 * =========================================================================
 * Provides an adjustable horizontal tracking overlay that tracks either cursor
 * coordinates or active keyboard focused elements to mitigate visual crowding.
 */

import React, { useEffect, useState } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';

export function ReadingRuler() {
  const { readingRuler } = useAccessibility();
  const [topPosition, setTopPosition] = useState<number>(200);

  useEffect(() => {
    if (!readingRuler) return;

    // Track mouse pointer movement
    const handleMouseMove = (e: MouseEvent) => {
      setTopPosition(e.clientY - 24);
    };

    // Track keyboard focus shift
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && typeof target.getBoundingClientRect === 'function') {
        const rect = target.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          setTopPosition(rect.top + rect.height / 2 - 24);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [readingRuler]);

  if (!readingRuler) return null;

  return (
    <div
      aria-hidden="true"
      className="reading-ruler-guide"
      style={{ top: `${topPosition}px` }}
    />
  );
}
