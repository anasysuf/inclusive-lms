'use client';

/**
 * =========================================================================
 * ERROR BOUNDARY GLOBAL (STANDAR WCAG 2.1 LEVEL AA)
 * =========================================================================
 * - Menangani galat runtime tanpa memutus seluruh antarmuka aplikasi.
 * - Tombol coba lagi dan tombol kembali ke halaman utama.
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <main
      id="main-content"
      role="alert"
      className="container mx-auto px-4 sm:px-6 py-20 max-w-xl text-center space-y-6"
    >
      <div
        className="mx-auto h-24 w-24 rounded-full bg-destructive/10 text-destructive border-2 border-destructive/30 flex items-center justify-center shadow-lg"
        aria-hidden="true"
      >
        <AlertTriangle className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <Badge variant="destructive" className="mx-auto text-xs py-1">
          Terjadi Gangguan Sistem
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Maaf, Terjadi Kesalahan Tak Terduga
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sistem kami mengalami kendala teknis saat memproses permintaan Anda. Anda dapat mencoba memuat ulang halaman ini.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => reset()}
          className="w-full sm:w-auto justify-center gap-2 font-bold shadow-md"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Muat Ulang Halaman</span>
        </Button>

        <Link href="/" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            className="w-full justify-center gap-2 font-bold border-2 border-primary/40"
          >
            <Home className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>Ke Beranda</span>
          </Button>
        </Link>
      </div>
    </main>
  );
}
