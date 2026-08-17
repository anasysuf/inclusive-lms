'use client';

/**
 * =========================================================================
 * PEMBUAT KURSUS AKSESIBEL & PENEGAK ALT-TEXT
 * =========================================================================
 * Formulir dilengkapi:
 * - Penegak Alt-Text Ketat (menolak alt-text kosong atau generik seperti "gambar")
 * - Auditor aksesibilitas pra-publikasi otomatis
 * - Struktur label semantik eksplisit
 * - Pembuatan modul pelajaran awal dan asesmen kuis
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Video,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AltTextEnforcer } from '@/components/instructor/AltTextEnforcer';
import { AccessibilityAuditor } from '@/components/instructor/AccessibilityAuditor';
import { useAccessibility } from '@/context/AccessibilityContext';

export default function CreateCoursePage() {
  const router = useRouter();
  const { announce } = useAccessibility();

  // State kursus
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pendidikan Luar Biasa & Pedagogi');
  const [difficulty, setDifficulty] = useState('Pemula');
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80'
  );
  const [coverImageAlt, setCoverImageAlt] = useState('');

  // State pelajaran awal
  const [includeLesson, setIncludeLesson] = useState(true);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [captionsUrl, setCaptionsUrl] = useState('/captions/lesson1-udl.vtt');
  const [transcript, setTranscript] = useState('');

  // State kuis
  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOption1, setQuizOption1] = useState('');
  const [quizOption2, setQuizOption2] = useState('');
  const [quizOption3, setQuizOption3] = useState('');
  const [quizExplanation, setQuizExplanation] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validasi Aksesibilitas
    if (!title || title.trim().length < 5) {
      setErrorMessage('Persyaratan Aksesibilitas: Judul kursus harus minimal 5 karakter.');
      announce('Judul kursus harus minimal 5 karakter.', 'assertive');
      return;
    }

    if (!description || description.trim().length < 20) {
      setErrorMessage('Persyaratan Aksesibilitas: Deskripsi kursus harus minimal 20 karakter.');
      announce('Deskripsi kursus harus minimal 20 karakter.', 'assertive');
      return;
    }

    // PENEGAKAN ALT-TEXT KETAT
    if (coverImageUrl && coverImageUrl.trim()) {
      const trimmedAlt = coverImageAlt.trim().toLowerCase();
      const genericForbidden = ['gambar', 'foto', 'lukisan', 'skrinsot', 'file', 'image', 'photo', 'picture', 'screenshot', 'img', 'icon'];

      if (!coverImageAlt || coverImageAlt.trim().length < 8) {
        setErrorMessage('Pelanggaran Aksesibilitas: Teks alternatif deskriptif (minimal 8 karakter) wajib diisi untuk gambar sampul.');
        announce('Teks alternatif deskriptif wajib diisi untuk gambar sampul.', 'assertive');
        return;
      }

      if (genericForbidden.includes(trimmedAlt) || genericForbidden.some((g) => trimmedAlt === `sebuah ${g}` || trimmedAlt === `suatu ${g}` || trimmedAlt === `a ${g}` || trimmedAlt === `an ${g}`)) {
        setErrorMessage(
          'Pelanggaran Aksesibilitas: Alt-text generik seperti "gambar" atau "foto" ditolak. Mohon deskripsikan isi visual materi untuk pengguna pembaca layar.'
        );
        announce('Alt-text generik tidak diperbolehkan. Mohon deskripsikan gambar secara jelas.', 'assertive');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Simpan Kursus
      const courseRes = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty,
          coverImageUrl,
          coverImageAlt,
        }),
      });

      const courseData = await courseRes.json();

      if (!courseRes.ok) {
        throw new Error(courseData.error || 'Gagal menyimpan kursus');
      }

      // Jika ada materi pelajaran awal, simpan
      if (includeLesson && lessonTitle.trim()) {
        const quizPayload =
          includeQuiz && quizQuestion.trim()
            ? {
                title: `Kuis Pemahaman ${lessonTitle}`,
                baseTimeLimit: 180,
                questions: [
                  {
                    id: 'q1',
                    question: quizQuestion.trim(),
                    options: [quizOption1.trim(), quizOption2.trim(), quizOption3.trim()].filter(Boolean),
                    correctIndex: 0,
                    explanation: quizExplanation.trim() || 'Tinjau kembali konsep inti pada materi pelajaran.',
                  },
                ],
              }
            : null;

        await fetch(`/api/courses/${courseData.id}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: lessonTitle,
            summary: lessonSummary,
            content: lessonContent || `<p>Catatan instruksional untuk materi ${lessonTitle}.</p>`,
            videoUrl: videoUrl || null,
            captionsUrl: captionsUrl || null,
            hasTranscript: Boolean(transcript),
            transcript: transcript || null,
            quiz: quizPayload,
          }),
        });
      }

      announce(`Kursus "${title}" berhasil dibuat dan lolos uji aksesibilitas!`, 'assertive');
      router.push(`/courses/${courseData.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan kursus.');
      announce(err.message || 'Gagal menyimpan kursus', 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Jejak Halaman">
        <Link
          href="/instructor"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:ring-4 focus-visible:ring-primary rounded p-1"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Studio Pengajar</span>
        </Link>
      </nav>

      {/* Header */}
      <header className="space-y-2 pb-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-yellow-500" aria-hidden="true" />
          <span>Pengembangan Kurikulum Universal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Buat Kursus Aksesibel Baru
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Rancang kurikulum yang mematuhi kriteria WCAG 2.1 AA. Formulir ini secara otomatis menegakkan alt-text deskriptif, subtitel teks, dan transkrip terstruktur.
        </p>
      </header>

      {/* Kotak Pesan Kesalahan */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-2xl border-2 border-destructive/50 bg-destructive/10 text-destructive text-sm font-bold flex items-start gap-3 shadow-md"
        >
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Input Formulir */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Informasi Kursus */}
          <section
            aria-labelledby="section-basic-info"
            className="rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm space-y-5"
          >
            <h2 id="section-basic-info" className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>1. Informasi Utama Kursus</span>
            </h2>

            {/* Judul Kursus */}
            <div className="space-y-1.5">
              <label htmlFor="course-title" className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>Judul Kursus</span>
                <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <input
                id="course-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="contoh: Teknologi Asistif & Komunikasi Multi-Modal"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label htmlFor="course-description" className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>Deskripsi Lengkap & Capaian Pembelajaran</span>
                <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <textarea
                id="course-description"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan tujuan instruksional dan keterampilan kognitif yang akan diperoleh peserta didik..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
              />
            </div>

            {/* Kategori & Tingkat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="course-category" className="text-xs font-bold text-foreground">
                  Bidang Spesialisasi
                </label>
                <select
                  id="course-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
                >
                  <option value="Pendidikan Luar Biasa & Pedagogi">Pendidikan Luar Biasa & Pedagogi</option>
                  <option value="Aksesibilitas Web & Teknologi Asistif">Aksesibilitas Web & Teknologi Asistif</option>
                  <option value="Neurodiversity & Desain Kognitif">Neurodiversity & Desain Kognitif</option>
                  <option value="Universal Design for Learning (UDL)">Universal Design for Learning (UDL)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="course-difficulty" className="text-xs font-bold text-foreground">
                  Tingkat Sasaran Siswa
                </label>
                <select
                  id="course-difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
                >
                  <option value="Pemula">Pemula (Fondasi Awal)</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Lanjutan">Lanjutan Spesialis</option>
                  <option value="Semua Tingkatan">Semua Tingkatan (Universal)</option>
                </select>
              </div>
            </div>

            {/* URL Gambar & Validator Alt-Text */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="space-y-1.5">
                <label htmlFor="course-image-url" className="text-xs font-bold text-foreground">
                  URL Gambar Sampul Kursus
                </label>
                <input
                  id="course-image-url"
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
                />
              </div>

              {/* PENEGAK ALT-TEXT AKSESIBILITAS KETAT */}
              <AltTextEnforcer
                imageUrl={coverImageUrl}
                altText={coverImageAlt}
                onAltTextChange={setCoverImageAlt}
                required={Boolean(coverImageUrl)}
              />
            </div>
          </section>

          {/* 2. Modul Pelajaran Awal */}
          <section
            aria-labelledby="section-initial-lesson"
            className="rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 id="section-initial-lesson" className="text-lg font-bold text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" aria-hidden="true" />
                <span>2. Modul Pelajaran Awal</span>
              </h2>
              <Badge variant="secondary">Pelajaran 1</Badge>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lesson-title" className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>Judul Pelajaran</span>
                <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <input
                id="lesson-title"
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="1. Pengenalan Konsep & Prinsip Inti"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lesson-summary" className="text-xs font-bold text-foreground">
                Ringkasan Pelajaran
              </label>
              <input
                id="lesson-summary"
                type="text"
                value={lessonSummary}
                onChange={(e) => setLessonSummary(e.target.value)}
                placeholder="Ringkasan singkat poin-poin utama materi..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lesson-content" className="text-xs font-bold text-foreground">
                Catatan Instruksional (Format HTML / Teks)
              </label>
              <textarea
                id="lesson-content"
                rows={4}
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                placeholder="<h2>Pengantar Materi</h2><p>Jelaskan konsep pedagogis di sini...</p>"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground font-mono focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-xs"
              />
            </div>

            {/* Video & Subtitel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="lesson-video-url" className="text-xs font-bold text-foreground">
                  URL Video (MP4 / WebM)
                </label>
                <input
                  id="lesson-video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="lesson-captions-url" className="text-xs font-bold text-foreground flex items-center gap-1">
                  <span>Berkas Subtitel WebVTT</span>
                  <Badge variant="success" className="text-[10px]">WCAG 1.2.2</Badge>
                </label>
                <input
                  id="lesson-captions-url"
                  type="text"
                  value={captionsUrl}
                  onChange={(e) => setCaptionsUrl(e.target.value)}
                  placeholder="/captions/lesson1-udl.vtt"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
                />
              </div>
            </div>

            {/* Transkrip */}
            <div className="space-y-1.5">
              <label htmlFor="lesson-transcript" className="text-xs font-bold text-foreground flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>Transkrip Teks Verbatim (Suara / Dialog Lengkap)</span>
              </label>
              <textarea
                id="lesson-transcript"
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="[00:00] Selamat datang dalam materi...&#10;[00:30] Konsep penting yang kita pelajari..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground font-mono focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-xs"
              />
            </div>
          </section>

          {/* 3. Kuis Asesmen (Opsional) */}
          <section
            aria-labelledby="section-initial-quiz"
            className="rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 id="section-initial-quiz" className="text-lg font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" aria-hidden="true" />
                <span>3. Kuis Asesmen Pemahaman Materi</span>
              </h2>
              <Button
                type="button"
                variant={includeQuiz ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setIncludeQuiz(!includeQuiz)}
                className="text-xs"
              >
                {includeQuiz ? 'Kuis Diaktifkan' : '+ Tambah Kuis Asesmen'}
              </Button>
            </div>

            {includeQuiz && (
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="space-y-1.5">
                  <label htmlFor="quiz-q1" className="text-xs font-bold text-foreground">
                    Teks Soal Pertanyaan 1
                  </label>
                  <input
                    id="quiz-q1"
                    type="text"
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    placeholder="contoh: Manakah prinsip UDL yang menyediakan beragam cara representasi informasi?"
                    className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background text-foreground focus-visible:ring-4 focus-visible:ring-primary text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">
                    Pilihan Jawaban (Pilihan 1 adalah kunci jawaban yang benar):
                  </span>
                  <input
                    type="text"
                    value={quizOption1}
                    onChange={(e) => setQuizOption1(e.target.value)}
                    placeholder="Pilihan 1 (Kunci Benar): Multiple Means of Representation"
                    className="w-full px-3.5 py-2 rounded-lg border-2 border-emerald-500/50 bg-emerald-500/5 text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
                  />
                  <input
                    type="text"
                    value={quizOption2}
                    onChange={(e) => setQuizOption2(e.target.value)}
                    placeholder="Pilihan 2: Hafalan Tunggal Tanpa Alternatif"
                    className="w-full px-3.5 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
                  />
                  <input
                    type="text"
                    value={quizOption3}
                    onChange={(e) => setQuizOption3(e.target.value)}
                    placeholder="Pilihan 3: Ujian Waktu Ketat Tanpa Akomodasi"
                    className="w-full px-3.5 py-2 rounded-lg border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="quiz-explanation" className="text-xs font-bold text-foreground">
                    Penjelasan Pedagogis & Penguatan Kognitif
                  </label>
                  <textarea
                    id="quiz-explanation"
                    rows={2}
                    value={quizExplanation}
                    onChange={(e) => setQuizExplanation(e.target.value)}
                    placeholder="Jelaskan alasan mengapa jawaban ini benar untuk memperkuat retensi belajar..."
                    className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background text-foreground text-xs focus-visible:ring-4 focus-visible:ring-primary"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Tombol Simpan */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <Link href="/instructor">
              <Button variant="ghost" size="md">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="font-extrabold text-base px-8 shadow-lg gap-2"
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span>{isSubmitting ? 'Memvalidasi & Menerbitkan...' : 'Terbitkan Kursus'}</span>
            </Button>
          </div>
        </div>

        {/* Kolom Kanan: Auditor Aksesibilitas Pra-Publikasi */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <AccessibilityAuditor
            courseTitle={title}
            courseDescription={description}
            coverImageUrl={coverImageUrl}
            coverImageAlt={coverImageAlt}
            hasVideo={Boolean(videoUrl)}
            hasCaptions={Boolean(captionsUrl)}
            hasTranscript={Boolean(transcript)}
          />
        </div>
      </form>
    </main>
  );
}
