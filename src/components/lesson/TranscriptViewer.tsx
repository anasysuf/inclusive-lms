'use client';

/**
 * =========================================================================
 * PENAMPIL TRANSKRIP VERBATIM (STANDAR WCAG 2.1 AA - Kriteria 1.2.1)
 * =========================================================================
 * Menyediakan teks transkrip lengkap tersinkronisasi dengan fitur pencarian
 * kata kunci langsung, pembacaan suara (TTS), dan tombol salin teks.
 */

import React, { useState } from 'react';
import { Search, Copy, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextToSpeechButton } from '@/components/a11y/TextToSpeechButton';
import { useAccessibility } from '@/context/AccessibilityContext';

interface TranscriptViewerProps {
  transcript: string | null;
  lessonTitle: string;
}

export function TranscriptViewer({ transcript, lessonTitle }: TranscriptViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const { announce } = useAccessibility();

  if (!transcript) {
    return (
      <div className="p-6 rounded-2xl border-2 border-dashed border-border bg-card text-center text-muted-foreground">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
        <p className="text-sm">Belum ada transkrip verbatim yang tersedia untuk materi ini.</p>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      announce('Seluruh transkrip teks berhasil disalin ke papan klip', 'polite');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Gagal menyalin transkrip', err);
    }
  };

  const lines = transcript.split('\n').filter((l) => l.trim().length > 0);

  return (
    <section
      id="lesson-transcript"
      aria-labelledby="transcript-heading"
      className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm space-y-4"
    >
      {/* Header dengan Pencarian dan Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" aria-hidden="true">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 id="transcript-heading" className="text-base font-bold text-foreground">
              Transkrip Teks Lengkap
            </h2>
            <p className="text-xs text-muted-foreground">Alternatif teks verbatim untuk media suara/video</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Narasi Suara */}
          <TextToSpeechButton text={transcript} label="Dengarkan Transkrip" size="sm" />

          {/* Tombol Salin */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            aria-label="Salin seluruh teks transkrip ke papan klip"
            className="gap-1.5 text-xs font-semibold"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Salin Teks</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Input Pencarian */}
      <div className="relative">
        <label htmlFor="transcript-search" className="sr-only">
          Cari kata kunci dalam transkrip teks
        </label>
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <input
          id="transcript-search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari kata kunci dalam transkrip (misal: UDL, prinsip, akomodasi)..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
        />
      </div>

      {/* Isi Teks Transkrip */}
      <div
        tabIndex={0}
        role="region"
        aria-label={`Transkrip lengkap untuk ${lessonTitle}`}
        className="max-h-80 overflow-y-auto rounded-xl border border-border/80 bg-background/60 p-4 space-y-3 font-mono text-xs sm:text-sm leading-relaxed focus-visible:ring-4 focus-visible:ring-primary"
      >
        {lines.map((line, idx) => {
          const isMatch = searchTerm.trim() !== '' && line.toLowerCase().includes(searchTerm.toLowerCase());
          return (
            <p
              key={idx}
              className={`p-1.5 rounded transition-colors ${
                isMatch
                  ? 'bg-yellow-300 text-black font-bold ring-2 ring-yellow-500'
                  : 'text-foreground/90'
              }`}
            >
              {line}
            </p>
          );
        })}
      </div>
    </section>
  );
}
