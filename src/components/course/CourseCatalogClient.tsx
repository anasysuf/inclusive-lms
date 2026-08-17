'use client';

/**
 * =========================================================================
 * KATALOG KURSUS RAMAH AKSESIBILITAS (STANDAR WCAG 2.1 LEVEL AA)
 * =========================================================================
 * - Pencarian langsung dengan pengumuman ARIA live untuk pembaca layar.
 * - Tombol filter kategori ramah keyboard dengan aria-pressed.
 * - Navigasi 100% menggunakan tombol Tab & Enter.
 */

import React, { useState, useMemo } from 'react';
import { Search, BookOpen, X } from 'lucide-react';
import { CourseCard } from '@/components/course/CourseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/context/AccessibilityContext';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  coverImageUrl?: string | null;
  coverImageAlt: string;
  instructor?: { name: string } | null;
  lessons?: Array<{ id: string; hasTranscript: boolean; captionsUrl?: string | null }>;
}

export function CourseCatalogClient({ initialCourses }: { initialCourses: Course[] }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const { announce } = useAccessibility();

  // Ekstraksi kategori unik
  const categories = useMemo(() => {
    const set = new Set(initialCourses.map((c) => c.category));
    return ['Semua', ...Array.from(set)];
  }, [initialCourses]);

  // Filter kursus
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      const matchCategory = selectedCategory === 'Semua' || course.category === selectedCategory;
      const matchSearch =
        search.trim() === '' ||
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [initialCourses, selectedCategory, search]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    announce(`Filter diubah ke kategori ${cat}. Menampilkan ${filteredCourses.length} kursus.`, 'polite');
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('Semua');
    announce('Pencarian dan filter telah direset.', 'polite');
  };

  return (
    <div className="space-y-8">
      {/* Kontrol Pencarian & Filter Kategori */}
      <section
        aria-label="Pencarian dan Filter Kursus"
        className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm space-y-5"
      >
        {/* Bilah Pencarian */}
        <div className="relative">
          <label htmlFor="catalog-search" className="block text-xs font-bold text-foreground mb-1.5">
            Cari Materi & Kurikulum Inklusif
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="catalog-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari topik (contoh: UDL, Disleksia, Aksesibilitas Web, Neurodiversity)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Hapus kata kunci pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Tombol Pilihan Kategori */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Filter Berdasarkan Bidang Spesialisasi
          </span>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Kategori Kursus">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/30'
                      : 'bg-background hover:bg-muted border-border text-foreground'
                  }`}
                  aria-pressed={isSelected}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Header Status Hasil */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span>Daftar Kursus Tersedia</span>
          <Badge variant="secondary" className="font-mono">
            {filteredCourses.length}
          </Badge>
        </h2>

        {(search || selectedCategory !== 'Semua') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-primary gap-1"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Filter</span>
          </Button>
        )}
      </div>

      {/* Grid Kursus */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border-2 border-dashed border-border bg-card space-y-4">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto opacity-50" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Tidak ada kursus yang cocok</h3>
            <p className="text-sm text-muted-foreground">
              Coba sesuaikan kata kunci pencarian atau pilih kategori spesialisasi yang berbeda.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Tampilkan Semua Kursus
          </Button>
        </div>
      )}
    </div>
  );
}
