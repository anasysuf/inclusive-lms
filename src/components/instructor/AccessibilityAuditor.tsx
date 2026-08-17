'use client';

/**
 * =========================================================================
 * AUDITOR AKSESIBILITAS KURIKULUM (Verifikasi Pra-Publikasi WCAG 2.1 AA)
 * =========================================================================
 * Melakukan audit otomatis terhadap kepatuhan aksesibilitas sebelum kursus
 * dipublikasikan:
 * 1. Alt-text pada gambar sampul.
 * 2. Ketersediaan berkas subtitel (.vtt) untuk media video.
 * 3. Ketersediaan transkrip teks lengkap.
 * 4. Panjang deskripsi dan judul untuk pembaca layar.
 */

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AuditItem {
  id: string;
  label: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  detail: string;
}

interface AccessibilityAuditorProps {
  courseTitle: string;
  courseDescription: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  hasVideo?: boolean;
  hasCaptions?: boolean;
  hasTranscript?: boolean;
}

export function AccessibilityAuditor({
  courseTitle,
  courseDescription,
  coverImageUrl,
  coverImageAlt,
  hasVideo,
  hasCaptions,
  hasTranscript,
}: AccessibilityAuditorProps) {
  const auditItems: AuditItem[] = [
    {
      id: 'title',
      label: 'Judul Kursus Deskriptif',
      passed: courseTitle.trim().length >= 5,
      severity: 'error',
      detail: 'Membantu pengguna pembaca layar mengidentifikasi isi materi pembelajaran.',
    },
    {
      id: 'description',
      label: 'Ringkasan Silabus Komprehensif',
      passed: courseDescription.trim().length >= 20,
      severity: 'error',
      detail: 'Menjelaskan capaian pembelajaran dan target kognitif.',
    },
    {
      id: 'altText',
      label: 'Validasi Alt-Text Gambar Sampul',
      passed:
        !coverImageUrl ||
        (Boolean(coverImageAlt) &&
          coverImageAlt!.trim().length >= 8 &&
          !['gambar', 'foto', 'image', 'photo', 'picture'].includes(coverImageAlt!.toLowerCase())),
      severity: 'error',
      detail: 'Wajib untuk peserta didik tunanetra dan parsing screen reader.',
    },
    {
      id: 'captions',
      label: 'Subtitel Teks Tertutup (WebVTT)',
      passed: !hasVideo || Boolean(hasCaptions),
      severity: 'error',
      detail: 'Dibutuhkan peserta didik tunarungu / gangguan pendengaran.',
    },
    {
      id: 'transcript',
      label: 'Transkrip Verbatim Teks',
      passed: !hasVideo || Boolean(hasTranscript),
      severity: 'warning',
      detail: 'Memberikan representasi ganda untuk perbedaan pemrosesan auditori.',
    },
  ];

  const errorsCount = auditItems.filter((i) => !i.passed && i.severity === 'error').length;
  const isReady = errorsCount === 0;

  return (
    <aside
      aria-labelledby="auditor-title"
      className="p-5 rounded-2xl border-2 border-border bg-card shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" aria-hidden="true" />
          <h3 id="auditor-title" className="text-sm font-bold text-foreground">
            Audit Aksesibilitas Pra-Publikasi
          </h3>
        </div>
        <Badge variant={isReady ? 'success' : 'warning'}>
          {isReady ? 'Siap Dipublikasikan' : `${errorsCount} Catatan Terdeteksi`}
        </Badge>
      </div>

      <ul className="space-y-2.5">
        {auditItems.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2.5 text-xs text-foreground p-2 rounded-lg bg-background/50 border border-border/50"
          >
            {item.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            ) : item.severity === 'error' ? (
              <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="flex-1">
              <span className="font-semibold block">{item.label}</span>
              <span className="text-[11px] text-muted-foreground">{item.detail}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
