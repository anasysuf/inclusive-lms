'use client';

/**
 * =========================================================================
 * HALAMAN AKSES DIBATASI / 403 FORBIDDEN (WCAG 2.1 AA)
 * =========================================================================
 * Ditampilkan saat pengguna yang tidak memiliki peran Instruktur/Admin
 * mencoba mengakses fitur pembuatan kursus atau studio pengajar.
 */

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, BookOpen, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <main id="main-content" className="container mx-auto px-4 sm:px-6 py-16 max-w-xl text-center space-y-6">
      <div className="mx-auto h-20 w-20 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border-2 border-amber-500/40 flex items-center justify-center shadow-lg" aria-hidden="true">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300 tracking-wider">
          Akses Khusus Pengajar
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
          Hak Akses Terbatas
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Halaman ini hanya dapat diakses oleh akun dengan peran <strong>Instruktur / Guru PLB</strong> atau <strong>Administrator</strong>. Akun siswa/peserta didik hanya memiliki hak akses untuk mempelajari materi dan mengikuti asesmen.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/courses" className="w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full justify-center gap-2 font-bold">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Katalog Kursus</span>
          </Button>
        </Link>
        <Link href="/login" className="w-full sm:w-auto">
          <Button variant="outline" size="md" className="w-full justify-center gap-2 font-semibold">
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>Ganti Akun Pengajar</span>
          </Button>
        </Link>
      </div>
    </main>
  );
}
