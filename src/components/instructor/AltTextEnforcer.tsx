'use client';

/**
 * =========================================================================
 * PENEGAK AKSESIBILITAS ALT-TEXT (WCAG 1.1.1 Konten Non-Teks)
 * =========================================================================
 * Mencegah instruktur mengunggah gambar tanpa teks alternatif atau
 * menggunakan kata generik seperti "gambar"/"foto". Memberikan panduan
 * langsung untuk mendeskripsikan konteks visual bagi peserta didik tunanetra.
 */

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AltTextEnforcerProps {
  imageUrl: string;
  altText: string;
  onAltTextChange: (val: string) => void;
  required?: boolean;
}

export function AltTextEnforcer({
  imageUrl,
  altText,
  onAltTextChange,
  required = true,
}: AltTextEnforcerProps) {
  const [validation, setValidation] = useState<{
    isValid: boolean;
    error: string | null;
    warning: string | null;
    tip: string | null;
  }>({
    isValid: false,
    error: null,
    warning: null,
    tip: null,
  });

  useEffect(() => {
    if (!imageUrl || !imageUrl.trim()) {
      setValidation({ isValid: true, error: null, warning: null, tip: null });
      return;
    }

    const trimmed = altText.trim();
    const lower = trimmed.toLowerCase();
    const forbidden = [
      'gambar',
      'foto',
      'lukisan',
      'tangkapan layar',
      'skrinsot',
      'file',
      'berkas',
      'ikon',
      'grafis',
      'image',
      'photo',
      'picture',
      'pic',
      'screenshot',
      'img',
      'banner',
    ];

    if (!trimmed) {
      setValidation({
        isValid: false,
        error: 'Teks alternatif (alt-text) wajib diisi untuk semua grafik kursus (WCAG 1.1.1).',
        warning: null,
        tip: 'Deskripsikan objek utama, aktivitas, dan tujuan pembelajaran dari gambar tersebut.',
      });
      return;
    }

    if (trimmed.length < 8) {
      setValidation({
        isValid: false,
        error: 'Teks alternatif terlalu singkat (minimal 8 karakter).',
        warning: null,
        tip: 'Berikan rincian yang cukup agar siswa tunanetra atau pengguna pembaca layar memahami konteks gambar.',
      });
      return;
    }

    const isGenericWord =
      forbidden.includes(lower) ||
      forbidden.some((w) => lower === `sebuah ${w}` || lower === `suatu ${w}` || lower === `a ${w}` || lower === `an ${w}`);

    if (isGenericWord) {
      setValidation({
        isValid: false,
        error: `Kata generik "${trimmed}" ditolak. Pembaca layar secara otomatis telah menyebutkan bahwa elemen ini adalah gambar.`,
        warning: null,
        tip: 'Contoh alt-text yang baik: "Diagram alur 3 prinsip UDL: Keterlibatan, Representasi, dan Aksi/Ekspresi."',
      });
      return;
    }

    if (lower.startsWith('gambar ') || lower.startsWith('foto ')) {
      setValidation({
        isValid: true,
        error: null,
        warning: 'Saran: Anda tidak perlu mengawali dengan "gambar" atau "foto" karena pembaca layar mengumumkannya secara otomatis.',
        tip: 'Fokuskan deskripsi langsung pada subjek dan konteks visual materi.',
      });
      return;
    }

    // Valid
    setValidation({
      isValid: true,
      error: null,
      warning: null,
      tip: 'Deskripsi alt-text sangat baik! Memenuhi standar aksesibilitas WCAG 2.1 AA.',
    });
  }, [imageUrl, altText]);

  if (!imageUrl || !imageUrl.trim()) return null;

  return (
    <div
      role="group"
      aria-labelledby="alt-text-section-title"
      className="p-5 rounded-2xl border-2 border-border bg-card space-y-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" aria-hidden="true" />
          <h3 id="alt-text-section-title" className="text-sm font-bold text-foreground">
            Validator Aksesibilitas Gambar & Alt-Text
          </h3>
        </div>
        <Badge variant={validation.isValid ? 'success' : 'warning'}>
          {validation.isValid ? 'Sesuai Standar WCAG' : 'Perlu Tindakan'}
        </Badge>
      </div>

      {/* Pratinjau Gambar */}
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-32 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={altText || 'Pratinjau'}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label htmlFor="course-image-alt" className="text-xs font-bold text-foreground flex items-center gap-1">
            <span>Deskripsi Teks Alternatif (Alt-Text)</span>
            <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <input
            id="course-image-alt"
            type="text"
            required={required}
            value={altText}
            onChange={(e) => onAltTextChange(e.target.value)}
            placeholder="Deskripsikan isi visual (misal: Seorang siswa tunanetra menggunakan keyboard adaptif di kelas)"
            className={`w-full px-3.5 py-2 text-sm rounded-lg border-2 bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary ${
              validation.error
                ? 'border-destructive ring-1 ring-destructive/40'
                : validation.isValid
                ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                : 'border-border'
            }`}
            aria-invalid={!validation.isValid}
            aria-describedby="alt-text-feedback"
          />
        </div>
      </div>

      {/* Kotak Pesan Validasi */}
      <div
        id="alt-text-feedback"
        className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
          validation.error
            ? 'bg-destructive/10 border-destructive/40 text-destructive'
            : validation.warning
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
        }`}
      >
        <div className="flex items-start gap-2 font-bold">
          {validation.error ? (
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <span>
            {validation.error || validation.warning || 'Alt-Text Sesuai Standar Aksesibilitas'}
          </span>
        </div>
        {validation.tip && (
          <p className="text-[11px] opacity-90 pl-6">{validation.tip}</p>
        )}
      </div>
    </div>
  );
}
