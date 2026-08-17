'use client';

/**
 * =========================================================================
 * TAUTAN LOMPAT NAVIGASI (WCAG 2.1 AA - Kriteria 2.4.1 Bypass Blocks)
 * =========================================================================
 * Memungkinkan pengguna keyboard dan pembaca layar untuk langsung melompati
 * menu navigasi atas yang berulang langsung menuju area konten utama.
 */

import React from 'react';

export function SkipLink() {
  return (
    <div className="relative">
      <a
        href="#main-content"
        className="skip-link focus:outline-none focus:ring-4 focus:ring-yellow-400"
      >
        Lompat ke konten utama (Tekan Enter)
      </a>
      <a
        href="#accessibility-toolbar"
        className="skip-link focus:outline-none focus:ring-4 focus:ring-yellow-400"
        style={{ left: '16rem' }}
      >
        Lompat ke panel aksesibilitas
      </a>
    </div>
  );
}
