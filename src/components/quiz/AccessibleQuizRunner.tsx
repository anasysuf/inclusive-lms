'use client';

/**
 * =========================================================================
 * RUNNER KUIS ASESMEN AKSESIBEL (AKOMODASI PENDIDIKAN KHUSUS & WCAG 2.1 AA)
 * =========================================================================
 * - Pengelompokan soal menggunakan <fieldset> dan <legend> semantik.
 * - Input radio terhubung dengan <label htmlFor="..."> eksplisit.
 * - Perhitungan Akomodasi Waktu Tambahan (1.5x / 2.0x durasi ekstra).
 * - Notifikasi audio dan visual rendah kecemasan.
 * - Tombol Text-to-Speech pada setiap butir soal untuk pembacaan suara.
 * - Kartu evaluasi pedagogis untuk penguatan pemahaman kognitif.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TextToSpeechButton } from '@/components/a11y/TextToSpeechButton';
import { useAccessibility } from '@/context/AccessibilityContext';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface AccessibleQuizRunnerProps {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    baseTimeLimit: number; // dalam detik
    questions: string; // JSON string
  };
  lessonId: string;
  courseId: string;
}

export function AccessibleQuizRunner({
  quiz,
  lessonId,
  courseId,
}: AccessibleQuizRunnerProps) {
  const {
    requiresExtendedTime,
    setRequiresExtendedTime,
    extendedTimeMultiplier,
    announce,
    reduceMotion,
  } = useAccessibility();

  const questions: Question[] = JSON.parse(quiz.questions || '[]');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [totalTimeAllowed, setTotalTimeAllowed] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Hitung total waktu yang diizinkan dengan memperhitungkan akomodasi
  useEffect(() => {
    const multiplier = requiresExtendedTime ? extendedTimeMultiplier : 1.0;
    const computedTotal = Math.round(quiz.baseTimeLimit * multiplier);
    setTotalTimeAllowed(computedTotal);
    if (!hasStarted) {
      setTimeRemaining(computedTotal);
    }
  }, [requiresExtendedTime, extendedTimeMultiplier, quiz.baseTimeLimit, hasStarted]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = totalTimeAllowed - timeRemaining;

    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          timeSpent,
          extendedTimeUsed: requiresExtendedTime,
        }),
      });

      const data = await res.json();
      setResults(data);

      if (data.passed && !reduceMotion) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      announce(
        `Kuis terkirim! Nilai Anda adalah ${data.score} dari ${data.totalQuestions} (${data.percentage}%). ${
          data.passed ? 'Selamat, Anda lulus pemahaman materi!' : 'Tinjau pembahasan di bawah dan coba kembali.'
        }`,
        'assertive'
      );
    } catch (err) {
      console.error('Gagal mengirimkan kuis:', err);
      announce('Terjadi kesalahan pengiriman. Silakan coba lagi.', 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  }, [totalTimeAllowed, timeRemaining, quiz.id, answers, requiresExtendedTime, reduceMotion, announce]);

  const handleAutoSubmit = useCallback(() => {
    announce('Batas waktu telah habis. Mengirimkan kuis secara otomatis.', 'assertive');
    handleSubmit();
  }, [announce, handleSubmit]);

  // Penghitung waktu mundur
  useEffect(() => {
    if (!hasStarted || results) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }

        // Pengumuman waktu berkala untuk pembaca layar
        if (prev === 60) {
          announce('Perhatian: Waktu ujian tersisa 1 menit.', 'assertive');
        } else if (prev === 30) {
          announce('Peringatan: Waktu ujian tersisa 30 detik.', 'assertive');
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, results, announce, handleAutoSubmit]);

  const handleStartQuiz = () => {
    setHasStarted(true);
    announce(
      `Kuis dimulai: ${quiz.title}. Total waktu yang diberikan adalah ${Math.round(totalTimeAllowed / 60)} menit. Selamat mengerjakan!`,
      'assertive'
    );
  };

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleRetake = () => {
    setAnswers({});
    setResults(null);
    setHasStarted(false);
    setCurrentQuestionIdx(0);
    const computedTotal = Math.round(
      quiz.baseTimeLimit * (requiresExtendedTime ? extendedTimeMultiplier : 1.0)
    );
    setTimeRemaining(computedTotal);
    announce('Kuis telah direset. Anda dapat mengulang saat siap.', 'polite');
  };

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIdx];
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  // 1. Tampilan Awal Sebelum Mulai Kuis
  if (!hasStarted && !results) {
    return (
      <main id="main-content" className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-6">
        {/* Navigasi Breadcrumb */}
        <nav aria-label="Navigasi Jejak Halaman" className="mb-4">
          <Link
            href={`/courses/${courseId}/lessons/${lessonId}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:ring-4 focus-visible:ring-primary rounded p-1"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Materi Pelajaran</span>
          </Link>
        </nav>

        <section
          aria-labelledby="quiz-start-heading"
          className="rounded-3xl border-2 border-border bg-card p-6 sm:p-10 shadow-lg space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-primary tracking-wider">
                Asesmen Pemahaman Materi
              </span>
              <h1 id="quiz-start-heading" className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {quiz.title}
              </h1>
            </div>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed">
            {quiz.description ||
              'Asesmen ini dirancang dengan struktur pertanyaan aksesibel, kompatibel dengan pembaca layar, dan mendukung akomodasi perpanjangan durasi.'}
          </p>

          {/* Parameter Ujian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
              <div>
                <span className="text-xs text-muted-foreground block">Jumlah Soal</span>
                <span className="text-sm font-bold text-foreground">{questions.length} Butir Pertanyaan</span>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
              <div>
                <span className="text-xs text-muted-foreground block">Durasi Standar</span>
                <span className="text-sm font-bold text-foreground">
                  {Math.round(quiz.baseTimeLimit / 60)} Menit
                </span>
              </div>
            </div>
          </div>

          {/* Banner Akomodasi Waktu Tambahan Khusus */}
          <div className="p-5 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <h2 className="text-sm font-bold">Akomodasi Waktu Tambahan (Pendidikan Khusus)</h2>
              </div>
              <Badge variant="warning">Universal Design</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Jika Anda memerlukan waktu pemrosesan kognitif tambahan atau navigasi teknologi asistif, Anda dapat mengaktifkan akomodasi waktu di bawah ini.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
              <label htmlFor="quiz-extend-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                Aktifkan Waktu Tambahan {extendedTimeMultiplier}x (Total {Math.round(totalTimeAllowed / 60)} menit)
              </label>
              <Switch
                id="quiz-extend-toggle"
                checked={requiresExtendedTime}
                onCheckedChange={setRequiresExtendedTime}
                aria-label="Aktifkan perpanjangan waktu untuk kuis ini"
              />
            </div>
          </div>

          {/* Tombol Mulai */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href={`/courses/${courseId}/lessons/${lessonId}`}>
              <Button variant="ghost" size="md">
                Baca Ulang Materi Dulu
              </Button>
            </Link>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartQuiz}
              className="w-full sm:w-auto font-extrabold text-base px-8 shadow-lg gap-2"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" aria-hidden="true" />
              <span>Mulai Asesmen</span>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  // 2. Tampilan Hasil & Pembahasan Pedagogis
  if (results) {
    return (
      <main id="main-content" className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-6">
        <section
          aria-labelledby="quiz-results-heading"
          className="rounded-3xl border-2 border-border bg-card p-6 sm:p-10 shadow-xl space-y-8"
        >
          {/* Ringkasan Hasil */}
          <div className="text-center space-y-3 pb-6 border-b border-border">
            <div
              className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${
                results.passed
                  ? 'bg-emerald-500/15 text-emerald-600 border-2 border-emerald-500/40'
                  : 'bg-amber-500/15 text-amber-700 border-2 border-amber-500/40'
              }`}
              aria-hidden="true"
            >
              {results.passed ? (
                <CheckCircle2 className="w-12 h-12" />
              ) : (
                <AlertTriangle className="w-12 h-12" />
              )}
            </div>

            <h1 id="quiz-results-heading" className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {results.passed ? 'Asesmen Berhasil Diselesaikan!' : 'Perlu Penguatan Materi'}
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              Skor Anda: <span className="font-bold text-foreground">{results.score}</span> dari{' '}
              <span className="font-bold text-foreground">{results.totalQuestions}</span> benar (
              <span className="font-extrabold text-primary">{results.percentage}%</span>).
            </p>

            {results.extendedTimeUsed && (
              <Badge variant="warning" className="mx-auto mt-2">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>Akomodasi Waktu Tambahan Diterapkan (Waktu: {formatTime(results.timeSpent)})</span>
              </Badge>
            )}
          </div>

          {/* Pembahasan Butir Soal Pedagogis */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>Pembahasan & Penguatan Pemahaman Kognitif</span>
            </h2>

            <div className="space-y-4">
              {results.feedbackDetails?.map((item: any, idx: number) => (
                <article
                  key={item.questionId}
                  aria-labelledby={`review-q-${idx}`}
                  className={`p-5 rounded-2xl border-2 space-y-3 ${
                    item.isCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-destructive/40 bg-destructive/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-muted font-mono mt-0.5">
                        Soal {idx + 1}
                      </span>
                      <h3 id={`review-q-${idx}`} className="text-sm sm:text-base font-bold text-foreground">
                        {item.question}
                      </h3>
                    </div>
                    {item.isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Jawaban Tepat</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/20 px-2.5 py-1 rounded-full shrink-0">
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Perlu Diulang</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm space-y-1 pl-8">
                    <p className="text-foreground/90">
                      <span className="font-semibold text-muted-foreground">Pilihan Anda: </span>
                      {item.userAnswerText}
                    </p>
                    {!item.isCorrect && (
                      <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                        <span className="font-semibold">Kunci Jawaban yang Benar: </span>
                        {item.correctAnswerText}
                      </p>
                    )}
                  </div>

                  {/* Catatan Pedagogis */}
                  <div className="mt-3 p-3 rounded-xl bg-background border border-border/70 text-xs text-muted-foreground space-y-1 pl-8">
                    <span className="font-bold text-foreground block">Catatan Penguatan Kognitif:</span>
                    <p className="leading-relaxed">{item.explanation}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Tombol Tindak Lanjut */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              size="md"
              onClick={handleRetake}
              className="w-full sm:w-auto gap-2"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Ulangi Asesmen</span>
            </Button>

            <Link href={`/courses/${courseId}/lessons/${lessonId}`} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full justify-center gap-2 font-bold">
                <span>Lanjutkan Pembelajaran</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // 3. Tampilan Lembar Soal Aktif
  return (
    <main id="main-content" className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Bilah Status & Pengingat Waktu Ramah Disabilitas */}
      <div
        role="region"
        aria-label="Status Kuis dan Waktu Tersisa"
        className="sticky top-20 z-20 rounded-2xl border-2 border-border bg-card/95 backdrop-blur p-3.5 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="text-xs font-mono font-bold">
            Soal {currentQuestionIdx + 1} dari {questions.length}
          </Badge>
          {requiresExtendedTime && (
            <Badge variant="warning" className="text-xs font-semibold">
              Waktu Tambahan {extendedTimeMultiplier}x
            </Badge>
          )}
        </div>

        {/* Indikator Waktu Rendah Tekanan */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 font-mono font-bold text-xs sm:text-sm ${
            timeRemaining < 60
              ? 'border-destructive bg-destructive/10 text-destructive animate-pulse'
              : 'border-primary/40 bg-primary/5 text-primary'
          }`}
          aria-live="off"
        >
          <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{formatTime(timeRemaining)}</span>
          <span className="sr-only">tersisa dalam kuis</span>
        </div>
      </div>

      {/* Kartu Pertanyaan */}
      {currentQ && (
        <section
          aria-labelledby={`question-title-${currentQ.id}`}
          className="rounded-3xl border-2 border-border bg-card p-6 sm:p-10 shadow-lg space-y-6"
        >
          {/* Header Soal & Pembacaan Suara */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Pertanyaan {currentQuestionIdx + 1}
              </span>
              <h2
                id={`question-title-${currentQ.id}`}
                className="text-lg sm:text-xl font-bold text-foreground leading-snug"
              >
                {currentQ.question}
              </h2>
            </div>
            <TextToSpeechButton
              text={currentQ.question}
              label="Bacakan Soal"
              size="sm"
              variant="outline"
              className="shrink-0"
            />
          </div>

          {/* Fieldset Form & Opsi Radio Eksplisit */}
          <fieldset className="space-y-3">
            <legend className="sr-only">
              Pilih satu jawaban yang tepat untuk pertanyaan: {currentQ.question}
            </legend>

            <div className="space-y-2.5">
              {currentQ.options.map((option, optIdx) => {
                const inputId = `q-${currentQ.id}-opt-${optIdx}`;
                const isSelected = answers[currentQ.id] === optIdx;

                return (
                  <div
                    key={optIdx}
                    className={`relative flex items-center rounded-xl border-2 p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                        : 'border-border hover:border-foreground/40 bg-background/50'
                    }`}
                    onClick={() => handleOptionSelect(currentQ.id, optIdx)}
                  >
                    <input
                      type="radio"
                      id={inputId}
                      name={`question-${currentQ.id}`}
                      value={optIdx}
                      checked={isSelected}
                      onChange={() => handleOptionSelect(currentQ.id, optIdx)}
                      className="h-5 w-5 text-primary border-2 border-border focus:ring-4 focus:ring-primary accent-primary cursor-pointer"
                    />
                    <label
                      htmlFor={inputId}
                      className="ml-3.5 text-sm sm:text-base font-medium text-foreground cursor-pointer select-none flex-1 leading-relaxed"
                    >
                      {option}
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {/* Kontrol Navigasi Soal & Pengiriman */}
          <div className="pt-6 border-t border-border flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              aria-label="Kembali ke pertanyaan sebelumnya"
              className="gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Sebelumnya</span>
            </Button>

            <div className="flex items-center gap-2">
              {currentQuestionIdx < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() =>
                    setCurrentQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))
                  }
                  aria-label="Lanjut ke pertanyaan berikutnya"
                  className="gap-1.5 font-bold"
                >
                  <span>Pertanyaan Berikutnya</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !allAnswered}
                  aria-label="Kirim seluruh jawaban kuis untuk dinilai"
                  className="gap-1.5 font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? 'Memeriksa Jawaban...' : 'Kirim Jawaban Asesmen'}
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
