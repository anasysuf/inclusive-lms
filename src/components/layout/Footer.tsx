'use client';

/**
 * =========================================================================
 * FOOTER AKSESIBILITAS (STANDAR WCAG 2.1 LEVEL AA)
 * =========================================================================
 * Menggunakan <footer> semantik, memuat pernyataan aksesibilitas,
 * dan daftar pintasan keyboard untuk kemudahan navigasi motorik.
 */

import React from 'react';
import { Heart, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-card py-12 px-4 sm:px-6 text-foreground mt-auto">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolom 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight">
              Accessi<span className="text-primary">Learn</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Platform pembelajaran daring yang dirancang berbasis keilmuan Pendidikan Luar Biasa (PLB) dan Universal Design for Learning (UDL), untuk memberdayakan setiap peserta didik berkebutuhan khusus dan neurodivergen.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>Sesuai Standar WCAG 2.1 Level AA</span>
          </div>
        </div>

        {/* Kolom 2 */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Fitur Aksesibilitas Utama
          </h2>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li>• Subtitel teks tertutup (WebVTT) & transkrip verbatim</li>
            <li>• Mode kontras tinggi & reduksi silau disleksia</li>
            <li>• Tipografi OpenDyslexic & Atkinson Hyperlegible</li>
            <li>• Narasi suara terintegrasi (Web Speech API)</li>
            <li>• Penggaris fokus membaca untuk ADHD & Disleksia</li>
            <li>• Akomodasi perpanjangan durasi asesmen (1.5x / 2.0x)</li>
          </ul>
        </div>

        {/* Kolom 3 */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Pintasan Navigasi Keyboard
          </h2>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>
              <kbd className="px-2 py-0.5 bg-muted rounded font-mono border">Alt + A</kbd> : Buka/Tutup Menu Aksesibilitas
            </li>
            <li>
              <kbd className="px-2 py-0.5 bg-muted rounded font-mono border">Tab</kbd> : Berpindah ke elemen interaktif berikutnya
            </li>
            <li>
              <kbd className="px-2 py-0.5 bg-muted rounded font-mono border">Shift + Tab</kbd> : Berpindah ke elemen sebelumnya
            </li>
            <li>
              <kbd className="px-2 py-0.5 bg-muted rounded font-mono border">Spasi / Enter</kbd> : Mengaktifkan tombol & pilihan
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
        <p>© 2026 AccessiLearn. Platform Pembelajaran Inklusif & Pendidikan Khusus.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-red-500 fill-current mx-0.5" aria-hidden="true" /> untuk Pendidikan Inklusif
          </span>
        </div>
      </div>
    </footer>
  );
}
