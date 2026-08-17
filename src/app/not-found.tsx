'use client';

/**
 * =========================================================================
 * HALAMAN 404 TIDAK DITEMUKAN (STANDAR WCAG 2.1 LEVEL AA)
 * =========================================================================
 * - Tampilan visual kontras tinggi dan bebas kebingungan.
 * - Tombol navigasi kembali ke Beranda dan Katalog Kursus.
 */

import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="container mx-auto px-4 sm:px-6 py-20 max-w-xl text-center space-y-6"
    >
      <div
        className="mx-auto h-24 w-24 rounded-full bg-primary/10 text-primary border-2 border-primary/30 flex items-center justify-center shadow-lg"
        aria-hidden="true"
      >
        <FileQuestion className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <Badge variant="warning" className="mx-auto text-xs py-1">
          Galat 404: Halaman Tidak Ditemukan
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Halaman yang Anda Cari Tidak Tersedia
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Tautan yang Anda tuju mungkin telah dipindahkan, dihapus, atau Anda belum memiliki hak akses pada kurikulum terkait.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full justify-center gap-2 font-bold shadow-md">
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </Button>
        </Link>

        <Link href="/courses" className="w-full sm:w-auto">
          <Button variant="outline" size="md" className="w-full justify-center gap-2 font-bold border-2 border-primary/40">
            <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>Buka Katalog Kursus</span>
          </Button>
        </Link>
      </div>
    </main>
  );
}
