import { prisma } from '@/lib/prisma';
import { CourseCatalogClient } from '@/components/course/CourseCatalogClient';
import { Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      instructor: {
        select: { name: true, email: true },
      },
      lessons: {
        select: {
          id: true,
          hasTranscript: true,
          captionsUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main id="main-content" className="container mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <header className="space-y-3 pb-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-yellow-500" aria-hidden="true" />
          <span>Katalog Kurikulum Inklusif</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Kursus Pembelajaran Aksesibel
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Setiap materi dilengkapi opsi multi-modal: subtitel teks tertutup WebVTT, transkrip verbatim, tipografi ramah disleksia, dan akomodasi ujian khusus.
        </p>
      </header>

      {/* Komponen Klien Katalog */}
      <CourseCatalogClient initialCourses={courses} />
    </main>
  );
}
