import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Sparkles,
  BookOpen,
  Eye,
  Type,
  Volume2,
  Clock,
  ArrowRight,
  Users,
} from 'lucide-react';
import { CourseCard } from '@/components/course/CourseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featuredCourses = await prisma.course.findMany({
    take: 3,
    include: {
      instructor: {
        select: { name: true, email: true },
      },
      lessons: {
        select: {
          id: true,
          hasTranscript: true,
          captionsUrl: true,
          quizzes: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main id="main-content" className="flex-1 space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section
        aria-labelledby="hero-title"
        className="container mx-auto px-4 sm:px-6 text-center max-w-4xl space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-primary/30 bg-primary/10 text-primary text-xs sm:text-sm font-bold">
          <Sparkles className="w-4 h-4 text-yellow-500 fill-current" aria-hidden="true" />
          <span>Universal Design for Learning (UDL) & Standar WCAG 2.1 AA</span>
        </div>

        <h1
          id="hero-title"
          className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.15]"
        >
          Pembelajaran Ramah Aksesibilitas untuk <span className="text-primary underline decoration-yellow-400 decoration-wavy decoration-2">Setiap Potensi Siswa</span>.
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Platform e-learning yang dirancang khusus bagi peserta didik dengan hambatan penglihatan, pendengaran, motorik, dan profil neurodivergen (ADHD, Disleksia, Autisme). Berlandaskan keilmuan Pendidikan Luar Biasa.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/courses">
            <Button variant="primary" size="lg" className="font-extrabold text-base px-8 shadow-lg gap-2">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              <span>Jelajahi Kursus Inklusif</span>
            </Button>
          </Link>
          <Link href="/instructor">
            <Button variant="outline" size="lg" className="font-bold text-base px-8 gap-2 border-2 border-primary/40">
              <Users className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>Studio Pengajar & Guru</span>
            </Button>
          </Link>
        </div>

        {/* Sorotan Fitur Aksesibilitas */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="p-4 rounded-2xl border-2 border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span>Kontras Tinggi</span>
            </div>
            <p className="text-xs text-muted-foreground">Mode gelap & kuning di atas hitam low-vision</p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Type className="w-4 h-4" aria-hidden="true" />
              <span>Huruf Disleksia</span>
            </div>
            <p className="text-xs text-muted-foreground">Tipografi OpenDyslexic & Atkinson</p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>Narasi Suara TTS</span>
            </div>
            <p className="text-xs text-muted-foreground">Pembacaan suara Web Speech Bahasa Indonesia</p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>Waktu Tambahan</span>
            </div>
            <p className="text-xs text-muted-foreground">Akomodasi durasi ujian 1.5x / 2.0x</p>
          </div>
        </div>
      </section>

      {/* Bagian Kursus Unggulan */}
      <section
        aria-labelledby="featured-courses-heading"
        className="container mx-auto px-4 sm:px-6 space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold uppercase text-primary tracking-wider">
              Kurikulum Spesialisasi
            </span>
            <h2
              id="featured-courses-heading"
              className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight"
            >
              Kursus Inklusif Unggulan
            </h2>
          </div>
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="font-semibold text-primary gap-1">
              <span>Buka Seluruh Katalog</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Landasan Pedagogis Pendidikan Luar Biasa */}
      <section
        aria-labelledby="pedagogy-heading"
        className="container mx-auto px-4 sm:px-6"
      >
        <div className="rounded-3xl border-2 border-border bg-card p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-3">
            <Badge variant="a11y">Landasan Pendidikan Luar Biasa</Badge>
            <h2 id="pedagogy-heading" className="text-2xl sm:text-4xl font-extrabold text-foreground">
              Mengapa Aksesibilitas Adalah Prioritas Utama?
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Banyak LMS memperlakukan aksesibilitas sekadar pelengkap. Di platform ini, setiap interaksi dibangun berdasarkan 3 pilar Universal Design for Learning (UDL):
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-background space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                1
              </div>
              <h3 className="text-base font-bold text-foreground">Beragam Cara Keterlibatan (Engagement)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mendorong otonomi belajar dengan penggaris fokus baca, pengurangan animasi, dan pengaturan tempo belajar untuk menghilangkan kecemasan ujian.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-background space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                2
              </div>
              <h3 className="text-base font-bold text-foreground">Beragam Cara Representasi (Representation)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Menyediakan subtitel WebVTT tersinkronisasi, transkrip lengkap, narasi suara (TTS), dan kewajiban teks alternatif deskriptif pada setiap media.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-background space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                3
              </div>
              <h3 className="text-base font-bold text-foreground">Beragam Cara Aksi & Ekspresi (Action)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Navigasi 100% menggunakan keyboard dengan cincin fokus jelas, formulir semantik, dan akomodasi waktu tambahan tanpa stigma.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
