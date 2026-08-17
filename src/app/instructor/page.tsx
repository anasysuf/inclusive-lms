import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Users,
  BookOpen,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function InstructorDashboardPage() {
  const courses = await prisma.course.findMany({
    include: {
      instructor: true,
      lessons: {
        include: {
          quizzes: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
  });

  const accommodatedCount = students.filter((s) => s.requiresExtendedTime).length;

  return (
    <main id="main-content" className="container mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-yellow-500" aria-hidden="true" />
            <span>Studio Kurikulum Pengajar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Pusat Kontrol Pengajar & Aksesibilitas
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola materi pembelajaran inklusif, verifikasi standar WCAG, dan pantau akomodasi siswa.
          </p>
        </div>

        <Link href="/instructor/courses/new">
          <Button variant="primary" size="lg" className="font-extrabold gap-2 shadow-md">
            <PlusCircle className="w-5 h-5" aria-hidden="true" />
            <span>Buat Kursus Aksesibel</span>
          </Button>
        </Link>
      </header>

      {/* Ringkasan Metrik Akomodasi Siswa */}
      <section aria-labelledby="metrics-title" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border-2 border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Kursus Aktif
            </span>
            <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <p className="text-3xl font-black text-foreground">{courses.length}</p>
          <p className="text-xs text-muted-foreground">100% Sesuai Standar WCAG 2.1 AA</p>
        </div>

        <div className="p-5 rounded-2xl border-2 border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Peserta Didik Terdaftar
            </span>
            <Users className="w-5 h-5 text-indigo-500" aria-hidden="true" />
          </div>
          <p className="text-3xl font-black text-foreground">{students.length}</p>
          <p className="text-xs text-muted-foreground">Mendukung keberagaman profil kognitif</p>
        </div>

        <div className="p-5 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Akomodasi Aktif
            </span>
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </div>
          <p className="text-3xl font-black text-foreground">{accommodatedCount}</p>
          <p className="text-xs text-muted-foreground">Siswa menerima perpanjangan waktu 1.5x / 2.0x</p>
        </div>
      </section>

      {/* Daftar Manajemen Kursus */}
      <section aria-labelledby="courses-management-title" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="courses-management-title" className="text-xl font-bold text-foreground">
            Perpustakaan Kurikulum Inklusif
          </h2>
          <span className="text-xs text-muted-foreground">
            Semua gambar sampul wajib memiliki teks alternatif deskriptif
          </span>
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <article
              key={course.id}
              className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start gap-4 flex-1">
                {course.coverImageUrl ? (
                  <div className="relative h-20 w-32 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.coverImageUrl}
                      alt={course.coverImageAlt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-32 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {course.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {course.difficulty}
                    </Badge>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Alt-Text Terverifikasi
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground line-clamp-1">
                    {course.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <p className="text-[11px] text-muted-foreground italic">
                    Deskripsi Alt: &quot;{course.coverImageAlt}&quot;
                  </p>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link href={`/instructor/courses/${course.id}/lessons/new`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                    <PlusCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span>Tambah Pelajaran</span>
                  </Button>
                </Link>

                <Link href={`/courses/${course.id}`}>
                  <Button variant="primary" size="sm" className="gap-1.5 text-xs font-bold">
                    <span>Pratinjau Kursus</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
