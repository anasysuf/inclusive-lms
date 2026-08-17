'use client';

/**
 * =========================================================================
 * PEMBUAT MODUL PELAJARAN & KUIS ASESMEN AKSESIBEL (WCAG 2.1 AA)
 * =========================================================================
 * Formulir penambahan materi dengan subtitel WebVTT, transkrip verbatim,
 * dan kuis asesmen terakomodasi.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Video,
  FileText,
  HelpCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/context/AccessibilityContext';

export default function NewLessonPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { announce } = useAccessibility();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [captionsUrl, setCaptionsUrl] = useState('/captions/lesson1-udl.vtt');
  const [transcript, setTranscript] = useState('');

  // Kuis
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOption1, setQuizOption1] = useState('');
  const [quizOption2, setQuizOption2] = useState('');
  const [quizOption3, setQuizOption3] = useState('');
  const [quizExplanation, setQuizExplanation] = useState('');
  const [baseTimeLimit, setBaseTimeLimit] = useState(180);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title || title.trim().length < 3) {
      setErrorMessage('Judul pelajaran harus minimal 3 karakter.');
      announce('Judul pelajaran harus minimal 3 karakter.', 'assertive');
      return;
    }

    if (!content || content.trim().length < 10) {
      setErrorMessage('Catatan instruksional materi pelajaran wajib diisi.');
      announce('Catatan instruksional materi pelajaran wajib diisi.', 'assertive');
      return;
    }

    setIsSubmitting(true);

    try {
      const quizPayload =
        includeQuiz && quizQuestion.trim()
          ? {
              title: quizTitle || `Kuis Pemahaman ${title}`,
              baseTimeLimit,
              questions: [
                {
                  id: 'q1',
                  question: quizQuestion.trim(),
                  options: [quizOption1.trim(), quizOption2.trim(), quizOption3.trim()].filter(Boolean),
                  correctIndex: 0,
                  explanation: quizExplanation.trim() || 'Tinjau kembali materi pelajaran.',
                },
              ],
            }
          : null;

      const res = await fetch(`/api/courses/${params.id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          content,
          videoUrl,
          captionsUrl,
          hasTranscript: Boolean(transcript),
          transcript,
          quiz: quizPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan pelajaran');
      }

      announce(`Pelajaran "${title}" berhasil disimpan!`, 'assertive');
      router.push(`/courses/${params.id}/lessons/${data.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan pelajaran.');
      announce(err.message || 'Gagal menyimpan pelajaran', 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Jejak Halaman">
        <Link
          href={`/courses/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:ring-4 focus-visible:ring-primary rounded p-1"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Silabus Kursus</span>
        </Link>
      </nav>

      {/* Header */}
      <header className="space-y-2 pb-4 border-b border-border">
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Tambah Modul Pelajaran Baru
        </h1>
        <p className="text-sm text-muted-foreground">
          Sertakan materi instruksional, video dengan subtitel WebVTT, dan asesmen kuis aksesibel.
        </p>
      </header>

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-2xl border-2 border-destructive/50 bg-destructive/10 text-destructive text-sm font-bold flex items-center gap-3"
        >
          <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informasi Materi */}
        <section className="rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" aria-hidden="true" />
            <span>Konten & Materi Pelajaran</span>
          </h2>

          <div className="space-y-1.5">
            <label htmlFor="new-lesson-title" className="text-xs font-bold text-foreground">
              Judul Pelajaran *
            </label>
            <input
              id="new-lesson-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Pertimbangan Sensorik & Prinsip Kontras"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-lesson-summary" className="text-xs font-bold text-foreground">
              Ringkasan Pelajaran
            </label>
            <input
              id="new-lesson-summary"
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ringkasan singkat tujuan instruksional..."
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-lesson-content" className="text-xs font-bold text-foreground">
              Catatan Instruksional (HTML / Teks) *
            </label>
            <textarea
              id="new-lesson-content"
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<h2>Poin-Poin Utama</h2><p>Jelaskan materi pembelajaran di sini...</p>"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground font-mono text-xs focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="new-video-url" className="text-xs font-bold text-foreground">
                URL Video (MP4 / WebM)
              </label>
              <input
                id="new-video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://.../video.mp4"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-captions-url" className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>Berkas Subtitel WebVTT</span>
                <Badge variant="success" className="text-[10px]">WCAG 1.2.2</Badge>
              </label>
              <input
                id="new-captions-url"
                type="text"
                value={captionsUrl}
                onChange={(e) => setCaptionsUrl(e.target.value)}
                placeholder="/captions/lesson1-udl.vtt"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-transcript" className="text-xs font-bold text-foreground flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>Transkrip Teks Lengkap (Verbatim)</span>
            </label>
            <textarea
              id="new-transcript"
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="[00:00] Transkrip verbatim..."
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground font-mono text-xs focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
            />
          </div>
        </section>

        {/* Pembuat Kuis */}
        <section className="rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>Kuis Asesmen Pemahaman</span>
            </h2>
            <Button
              type="button"
              variant={includeQuiz ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIncludeQuiz(!includeQuiz)}
              className="text-xs"
            >
              {includeQuiz ? 'Kuis Diaktifkan' : '+ Tambah Kuis'}
            </Button>
          </div>

          {includeQuiz && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <label htmlFor="new-quiz-question" className="text-xs font-bold text-foreground">
                  Teks Pertanyaan Soal
                </label>
                <input
                  id="new-quiz-question"
                  type="text"
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  placeholder="contoh: Mengapa teks alternatif wajib untuk gambar non-dekoratif?"
                  className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Pilihan Jawaban (Pilihan 1 adalah kunci jawaban benar):
                </span>
                <input
                  type="text"
                  value={quizOption1}
                  onChange={(e) => setQuizOption1(e.target.value)}
                  placeholder="Pilihan 1 (Kunci Benar): Memungkinkan pembaca layar menyampaikan konteks visual"
                  className="w-full px-3.5 py-2 rounded-lg border-2 border-emerald-500/50 bg-emerald-500/5 text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
                />
                <input
                  type="text"
                  value={quizOption2}
                  onChange={(e) => setQuizOption2(e.target.value)}
                  placeholder="Pilihan 2: Mempercepat pengindeksan database"
                  className="w-full px-3.5 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
                />
                <input
                  type="text"
                  value={quizOption3}
                  onChange={(e) => setQuizOption3(e.target.value)}
                  placeholder="Pilihan 3: Mengubah warna font teks"
                  className="w-full px-3.5 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="new-quiz-explanation" className="text-xs font-bold text-foreground">
                  Penjelasan Pedagogis
                </label>
                <textarea
                  id="new-quiz-explanation"
                  rows={2}
                  value={quizExplanation}
                  onChange={(e) => setQuizExplanation(e.target.value)}
                  placeholder="Penjelasan yang diberikan kepada peserta didik setelah menyelesaikan kuis..."
                  className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background text-foreground text-xs focus-visible:ring-4 focus-visible:ring-primary"
                />
              </div>
            </div>
          )}
        </section>

        {/* Tombol Simpan */}
        <div className="flex items-center justify-between gap-4">
          <Link href={`/courses/${params.id}`}>
            <Button variant="ghost" size="md">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="font-extrabold px-8 shadow-lg gap-2"
          >
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pelajaran'}</span>
          </Button>
        </div>
      </form>
    </main>
  );
}
