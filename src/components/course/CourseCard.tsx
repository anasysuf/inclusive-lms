'use client';

/**
 * =========================================================================
 * KARTU KURSUS RAMAH AKSESIBILITAS (STANDAR WCAG 2.1 LEVEL AA)
 * =========================================================================
 * Menampilkan ringkasan materi kursus dengan teks alternatif gambar yang terverifikasi,
 * lencana fitur aksesibilitas, dan cincin fokus keyboard kontras tinggi.
 */

import React from 'react';
import Link from 'next/link';
import { BookOpen, User, Captions, FileText, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    coverImageUrl?: string | null;
    coverImageAlt: string;
    instructor?: { name: string } | null;
    lessons?: Array<{ id: string; hasTranscript: boolean; captionsUrl?: string | null }>;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const hasCaptions = course.lessons?.some((l) => Boolean(l.captionsUrl));
  const hasTranscripts = course.lessons?.some((l) => l.hasTranscript);

  return (
    <article
      aria-labelledby={`course-title-${course.id}`}
      className="group flex flex-col justify-between rounded-2xl border-2 border-border bg-card p-5 shadow-sm transition-all hover:border-primary hover:shadow-md focus-within:ring-4 focus-within:ring-primary focus-within:ring-offset-2"
    >
      <div>
        {/* Gambar Sampul dengan Teks Alternatif Terverifikasi */}
        {course.coverImageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted mb-4 border border-border/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.coverImageUrl}
              alt={course.coverImageAlt || `Ilustrasi sampul untuk kursus ${course.title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary" aria-hidden="true">
            <BookOpen className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        {/* Kategori & Tingkat */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <Badge variant="default" className="text-xs font-bold">
            {course.category}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {course.difficulty}
          </Badge>
        </div>

        {/* Judul Kursus */}
        <h3
          id={`course-title-${course.id}`}
          className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2"
        >
          {course.title}
        </h3>

        {/* Deskripsi */}
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        {/* Lencana Fitur Aksesibilitas */}
        <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {hasCaptions && (
            <Badge variant="success" className="gap-1 text-[11px] font-bold">
              <Captions className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Subtitel Teks</span>
            </Badge>
          )}
          {hasTranscripts && (
            <Badge variant="a11y" className="gap-1 text-[11px] font-bold">
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Transkrip Penuh</span>
            </Badge>
          )}
          <Badge variant="warning" className="gap-1 text-[11px] font-bold">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Siap Akomodasi</span>
          </Badge>
        </div>
      </div>

      {/* Footer Kartu & Tombol Aksi */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{course.instructor?.name || 'Dosen Spesialis'}</span>
        </div>
        <Link href={`/courses/${course.id}`}>
          <Button variant="primary" size="sm" className="font-semibold gap-1.5">
            <span>Pelajari</span>
            <span className="sr-only">kursus: {course.title}</span>
          </Button>
        </Link>
      </div>
    </article>
  );
}
