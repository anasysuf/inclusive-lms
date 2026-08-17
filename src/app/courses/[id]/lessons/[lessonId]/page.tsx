import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Captions,
  FileText,
} from 'lucide-react';
import { AccessibleVideoPlayer } from '@/components/lesson/AccessibleVideoPlayer';
import { TranscriptViewer } from '@/components/lesson/TranscriptViewer';
import { LessonSidebar } from '@/components/lesson/LessonSidebar';
import { TextToSpeechButton } from '@/components/a11y/TextToSpeechButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function LessonPlayerPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              quizzes: {
                select: { id: true, title: true },
              },
            },
          },
        },
      },
      quizzes: true,
    },
  });

  if (!lesson || lesson.courseId !== params.id) {
    notFound();
  }

  const allLessons = lesson.course.lessons;
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const firstQuiz = lesson.quizzes[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. SEMANTIC BREADCRUMB NAVIGATION (<nav>) */}
      <nav aria-label="Navigasi Pelajaran dan Silabus" className="flex items-center justify-between gap-4">
        <Link
          href={`/courses/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:ring-4 focus-visible:ring-primary rounded p-1"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Silabus Kursus</span>
        </Link>

        {firstQuiz && (
          <Link href={`/courses/${params.id}/lessons/${lesson.id}/quiz`}>
            <Button variant="outline" size="sm" className="gap-1.5 font-bold border-2 border-primary/50 text-xs">
              <HelpCircle className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Ikuti Kuis Pemahaman</span>
            </Button>
          </Link>
        )}
      </nav>

      {/* Grid Tata Letak Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 2. SEMANTIC MAIN CONTENT AREA (<main id="main-content">) */}
        <main id="main-content" className="lg:col-span-8 space-y-8">
          {/* Header Materi */}
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="text-xs font-mono font-bold">
                Pelajaran {lesson.order} dari {allLessons.length}
              </Badge>
              {lesson.captionsUrl && (
                <Badge variant="success" className="text-xs">
                  <Captions className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                  <span>Subtitel WebVTT</span>
                </Badge>
              )}
              {lesson.hasTranscript && (
                <Badge variant="secondary" className="text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                  <span>Transkrip Teks Tersedia</span>
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
              {lesson.title}
            </h1>

            {lesson.summary && (
              <p className="text-base text-muted-foreground leading-relaxed">
                {lesson.summary}
              </p>
            )}

            {/* Tombol Narasi Seluruh Materi */}
            <div className="pt-1">
              <TextToSpeechButton
                text={`${lesson.title}. ${lesson.summary || ''}. ${lesson.content}`}
                label="Dengarkan Seluruh Materi Pelajaran"
                size="md"
              />
            </div>
          </header>

          {/* 3. PEMUTAR VIDEO AKSESIBEL */}
          <AccessibleVideoPlayer
            videoUrl={lesson.videoUrl}
            captionsUrl={lesson.captionsUrl}
            lessonTitle={lesson.title}
          />

          {/* 4. BAGIAN TRANSKRIP VERBATIM */}
          {lesson.hasTranscript && (
            <TranscriptViewer
              transcript={lesson.transcript}
              lessonTitle={lesson.title}
            />
          )}

          {/* 5. ARTIKEL SEMANTIK CATATAN PELAJARAN (<article>) */}
          <article
            aria-labelledby="lesson-notes-title"
            className="rounded-3xl border-2 border-border bg-card p-6 sm:p-10 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 id="lesson-notes-title" className="text-xl font-bold text-foreground">
                Catatan Instruksional & Konsep Inti
              </h2>
              <TextToSpeechButton text={lesson.content} label="Bacakan Catatan" size="sm" />
            </div>

            {/* Render teks instruksional */}
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-foreground/90 leading-relaxed space-y-4 [&>h2]:text-2xl [&>h2]:font-extrabold [&>h2]:text-foreground [&>h2]:mt-6 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-foreground [&>h3]:mt-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </article>

          {/* 6. KONTROL NAVIGASI SEBELUMNYA / BERIKUTNYA */}
          <nav
            aria-label="Navigasi Pelajaran Sebelumnya dan Berikutnya"
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border"
          >
            {prevLesson ? (
              <Link href={`/courses/${params.id}/lessons/${prevLesson.id}`} className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="w-full sm:w-auto gap-2">
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span className="truncate max-w-[200px]">Sebelumnya: {prevLesson.title}</span>
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {firstQuiz ? (
              <Link href={`/courses/${params.id}/lessons/${lesson.id}/quiz`} className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                  <HelpCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Mulai Kuis Pemahaman Materi</span>
                </Button>
              </Link>
            ) : nextLesson ? (
              <Link href={`/courses/${params.id}/lessons/${nextLesson.id}`} className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto font-bold gap-2">
                  <span>Berikutnya: {nextLesson.title}</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
            ) : (
              <Link href={`/courses/${params.id}`} className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto font-bold">
                  Selesai Mempelajari Kursus!
                </Button>
              </Link>
            )}
          </nav>
        </main>

        {/* 7. SEMANTIC ASIDE LANDMARK UNTUK SILABUS (<aside>) */}
        <aside
          aria-label="Bilah Samping Kurikulum"
          className="lg:col-span-4 space-y-6 sticky top-24"
        >
          <LessonSidebar
            courseId={params.id}
            courseTitle={lesson.course.title}
            currentLessonId={lesson.id}
            lessons={allLessons}
          />
        </aside>
      </div>
    </div>
  );
}
