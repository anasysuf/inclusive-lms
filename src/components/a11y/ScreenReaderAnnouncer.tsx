'use client';

/**
 * =========================================================================
 * SCREEN READER ANNOUNCER (WCAG 2.1 AA - Success Criterion 4.1.3 Status Messages)
 * =========================================================================
 * Renders ARIA live regions that screen readers automatically announce when
 * async state updates (such as a11y toggles, timer milestones, or quiz alerts) occur.
 */

import React from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';

export function ScreenReaderAnnouncer() {
  const { announcement } = useAccessibility();

  return (
    <>
      {/* Polite live region for non-urgent feedback */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="a11y-polite-announcer"
      >
        {announcement?.politeness === 'polite' ? announcement.message : ''}
      </div>

      {/* Assertive live region for critical urgent alerts */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="a11y-assertive-announcer"
      >
        {announcement?.politeness === 'assertive' ? announcement.message : ''}
      </div>
    </>
  );
}
