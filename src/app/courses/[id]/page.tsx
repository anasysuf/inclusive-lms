import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  BookOpen,
  User,
  Captions,
  FileText,
  PlayCircle,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TextToSpeechButton } from '@/components/a11y/TextToSpeechButton';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      instructor: {
        select: { id: true, name: true, email: true },
      },
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          quizzes: {
            select: { id: true, title: true, baseTimeLimit: true },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const firstLesson = course.lessons[0];

  return (
    <main id="main-content" className="container mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Navigasi Breadcrumb */}
      <nav aria-label="Jejak Halaman">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:ring-4 focus-visible:ring-primary rounded p-1"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Katalog Kursus</span>
        </Link>
      </nav>

      {/* Banner Utama Kursus */}
      <header className="grid grid-cols-1 lg:grid-cols-3 gap-8 rounded-3xl border-2 border-border bg-card p-6 sm:p-10 shadow-md">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-xs font-bold">
              {course.category}
            </Badge>
            <Badge variant="secondary" className="text-xs font-semibold">
              {course.difficulty}
            </Badge>
            <Badge variant="a11y" className="text-xs">
              Sertifikasi WCAG 2.1 AA
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-snug">
            {course.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
              <User className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Pengajar: {course.instructor.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>{course.lessons.length} Modul Pelajaran Aksesibel</span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            {firstLesson ? (
              <Link href={`/courses/${course.id}/lessons/${firstLesson.id}`}>
                <Button variant="primary" size="lg" className="font-extrabold gap-2 px-8 shadow-lg">
                  <PlayCircle className="w-5 h-5" aria-hidden="true" />
                  <span>Mulai Pelajaran Pertama</span>
                </Button>
              </Link>
            ) : (
              <Button disabled variant="primary">
                Belum ada materi tersedia
              </Button>
            )}

            <TextToSpeechButton
              text={`${course.title}. ${course.description}`}
              label="Dengarkan Ringkasan Kursus"
              size="md"
            />
          </div>
        </div>

        {/* Gambar Sampul dengan Teks Alternatif */}
        <div className="space-y-3">
          {course.coverImageUrl ? (
            <div className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden bg-muted border-2 border-border shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.coverImageUrl}
                alt={course.coverImageAlt}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video lg:aspect-square w-full rounded-2xl bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <BookOpen className="w-16 h-16 stroke-[1.5]" />
            </div>
          )}
          <p className="text-[11px] text-muted-foreground text-center italic">
            Deskripsi Alt Gambar: &quot;{course.coverImageAlt}&quot;
          </p>
        </div>
      </header>

      {/* Rincian Silabus Modul */}
      <section aria-labelledby="syllabus-heading" className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <span className="text-xs font-bold uppercase text-primary tracking-wider">
              Silabus & Struktur Modul
            </span>
            <h2 id="syllabus-heading" className="text-2xl font-extrabold text-foreground">
              Kurikulum Pelajaran
            </h2>
          </div>
          <span className="text-sm font-semibold text-muted-foreground">
            {course.lessons.length} Modul Materi
          </span>
        </div>

        <ol className="space-y-4">
          {course.lessons.map((lesson) => (
            <li
              key={lesson.id}
              className="rounded-2xl border-2 border-border bg-card p-5 sm:p-6 transition-all hover:border-primary shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary">
                    Pelajaran {lesson.order}
                  </span>
                  {lesson.captionsUrl && (
                    <Badge variant="success" className="text-[10px]">
                      <Captions className="w-3 h-3 mr-1" aria-hidden="true" />
                      <span>Subtitel Teks</span>
                    </Badge>
                  )}
                  {lesson.hasTranscript && (
                    <Badge variant="secondary" className="text-[10px]">
                      <FileText className="w-3 h-3 mr-1" aria-hidden="true" />
                      <span>Transkrip</span>
                    </Badge>
                  )}
                  {lesson.quizzes.length > 0 && (
                    <Badge variant="warning" className="text-[10px]">
                      <HelpCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                      <span>Asesmen</span>
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-foreground">
                  {lesson.title}
                </h3>

                {lesson.summary && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lesson.summary}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
                  <Button variant="outline" size="sm" className="font-semibold gap-1.5">
                    <span>Buka Materi</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
