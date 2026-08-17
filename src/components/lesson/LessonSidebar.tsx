'use client';

/**
 * =========================================================================
 * NAVIGASI SILABUS PELAJARAN (STANDAR WCAG 2.1 LEVEL AA)
 * =========================================================================
 * Navigasi kurikulum terstruktur dengan penanda aktif aria-current="page"
 * dan tautan langsung menuju kuis asesmen.
 */

import React from 'react';
import Link from 'next/link';
import { PlayCircle, HelpCircle, ChevronRight } from 'lucide-react';

interface LessonSidebarProps {
  courseId: string;
  courseTitle: string;
  currentLessonId: string;
  lessons: Array<{
    id: string;
    order: number;
    title: string;
    quizzes?: Array<{ id: string; title: string }>;
  }>;
}

export function LessonSidebar({
  courseId,
  courseTitle,
  currentLessonId,
  lessons,
}: LessonSidebarProps) {
  return (
    <nav
      aria-label="Kurikulum & Daftar Materi Kursus"
      className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm space-y-4"
    >
      <div className="pb-3 border-b border-border">
        <span className="text-xs font-bold uppercase text-primary tracking-wider">
          Navigasi Kurikulum
        </span>
        <h2 className="text-base font-bold text-foreground line-clamp-1 mt-0.5">
          {courseTitle}
        </h2>
      </div>

      <ol className="space-y-2">
        {lessons.map((lesson) => {
          const isActive = lesson.id === currentLessonId;
          const hasQuiz = lesson.quizzes && lesson.quizzes.length > 0;

          return (
            <li key={lesson.id} className="space-y-1">
              <Link
                href={`/courses/${courseId}/lessons/${lesson.id}`}
                className={`group flex items-start gap-3 p-3 rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary ${
                  isActive
                    ? 'border-primary bg-primary/10 text-foreground font-bold shadow-sm'
                    : 'border-border/60 hover:border-border hover:bg-muted/50 text-foreground/80'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`mt-0.5 p-1 rounded-md ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                  aria-hidden="true"
                >
                  <PlayCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground font-mono block">
                    Pelajaran {lesson.order}
                  </span>
                  <span className="text-sm block line-clamp-2">{lesson.title}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 mt-1 transition-transform ${
                    isActive ? 'text-primary rotate-90' : 'text-muted-foreground opacity-50 group-hover:opacity-100'
                  }`}
                  aria-hidden="true"
                />
              </Link>

              {/* Tautan Kuis Asesmen jika tersedia */}
              {hasQuiz && (
                <div className="pl-6 pt-0.5">
                  <Link
                    href={`/courses/${courseId}/lessons/${lesson.id}/quiz`}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors focus-visible:ring-4 focus-visible:ring-primary"
                  >
                    <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Ikuti Kuis Pemahaman</span>
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
