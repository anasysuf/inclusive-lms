'use client';

/**
 * =========================================================================
 * PANEL PUSAT KONTROL AKSESIBILITAS (STANDAR WCAG 2.1 LEVEL AA)
 * =========================================================================
 * Toolbar interaktif yang memudahkan pengguna dengan disabilitas visual,
 * motorik, dan kognitif (ADHD, Disleksia, Autisme) untuk menyesuaikan tampilan.
 */

import React, { useState, useEffect } from 'react';
import {
  Eye,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Sliders,
  X,
  Volume2,
  Clock,
  Check,
} from 'lucide-react';
import { useAccessibility, ContrastTheme, AccessibleFont } from '@/context/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme,
    setTheme,
    font,
    setFont,
    fontScale,
    setFontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    lineHeight,
    setLineHeight,
    reduceMotion,
    setReduceMotion,
    readingRuler,
    setReadingRuler,
    speechRate,
    setSpeechRate,
    requiresExtendedTime,
    setRequiresExtendedTime,
    extendedTimeMultiplier,
    setExtendedTimeMultiplier,
    resetAllSettings,
    announce,
  } = useAccessibility();

  // Pintasan Keyboard: Alt + A untuk membuka/menutup panel aksesibilitas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          announce(
            next ? 'Panel kontrol aksesibilitas dibuka.' : 'Panel kontrol aksesibilitas ditutup.',
            'polite'
          );
          return next;
        });
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        announce('Panel kontrol aksesibilitas ditutup.', 'polite');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, announce]);

  const themes: { id: ContrastTheme; name: string; desc: string; sampleBg: string; sampleFg: string }[] = [
    {
      id: 'default',
      name: 'Standar Bersih',
      desc: 'Kontras seimbang WCAG AA',
      sampleBg: '#FFFFFF',
      sampleFg: '#0F172A',
    },
    {
      id: 'high-contrast-dark',
      name: 'Kontras Tinggi Gelap',
      desc: 'Hitam Pekat & Putih Terang (>15:1)',
      sampleBg: '#000000',
      sampleFg: '#FACC15',
    },
    {
      id: 'yellow-on-black',
      name: 'Kuning di atas Hitam',
      desc: 'Khusus Low Vision & Gangguan Netra',
      sampleBg: '#000000',
      sampleFg: '#FFFF00',
    },
    {
      id: 'soft-tint',
      name: 'Lembut Krem (Anti-Silau)',
      desc: 'Mereduksi stres visual & disleksia',
      sampleBg: '#FAF5E9',
      sampleFg: '#1B2433',
    },
  ];

  const fonts: { id: AccessibleFont; name: string; desc: string; styleClass: string }[] = [
    {
      id: 'system',
      name: 'Huruf Standar (Inter)',
      desc: 'Geometris sans-serif modern',
      styleClass: 'font-sans',
    },
    {
      id: 'dyslexic',
      name: 'Ramah Disleksia (Lexend)',
      desc: 'Berbobot bawah, pembeda huruf kuat',
      styleClass: 'font-dyslexic font-bold',
    },
    {
      id: 'atkinson',
      name: 'Atkinson Hyperlegible',
      desc: 'Keterbacaan optimal low-vision',
      styleClass: 'font-atkinson',
    },
  ];

  return (
    <aside
      id="accessibility-toolbar"
      aria-label="Pusat Pengaturan Aksesibilitas"
      className="relative z-40"
    >
      {/* Tombol Melayang (Floating Toggle Button) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            setIsOpen(!isOpen);
            announce(
              !isOpen
                ? 'Laci pengaturan aksesibilitas dibuka.'
                : 'Laci pengaturan aksesibilitas ditutup.',
              'polite'
            );
          }}
          className="shadow-2xl flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full border-2 border-primary-foreground/30 font-bold bg-primary text-primary-foreground focus:ring-4 focus:ring-yellow-400 text-xs sm:text-sm"
          aria-expanded={isOpen}
          aria-controls="accessibility-drawer"
          aria-label="Pusat Kontrol Aksesibilitas (Pintasan: Alt+A)"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">Menu Aksesibilitas</span>
          <kbd className="hidden sm:inline-block text-[10px] bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded font-mono">
            Alt+A
          </kbd>
        </Button>
      </div>

      {/* Laci Geser Aksesibilitas */}
      {isOpen && (
        <div
          id="accessibility-drawer"
          role="dialog"
          aria-modal="false"
          aria-label="Panel Penyesuaian Aksesibilitas Global"
          className="fixed bottom-16 sm:bottom-24 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-full max-w-md max-h-[75vh] sm:max-h-[80vh] overflow-y-auto bg-card text-card-foreground border-2 border-primary shadow-2xl rounded-2xl p-4 sm:p-6 z-50 focus:outline-none transition-all duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Pusat Aksesibilitas</h2>
                <p className="text-xs text-muted-foreground">Sesuaikan tampilan visual & kebutuhan kognitif</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup panel aksesibilitas"
              className="h-9 w-9 rounded-full"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-5 space-y-6">
            {/* 1. Mode Kontras Warna */}
            <section aria-labelledby="theme-heading" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 id="theme-heading" className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Mode Kontras Warna</span>
                </h3>
                <Badge variant="a11y">WCAG 2.1 AA</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`p-3 text-left rounded-xl border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/40 bg-accent/60'
                          : 'border-border hover:border-foreground/40 bg-card'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-xs">{t.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary" aria-hidden="true" />}
                      </div>
                      <div
                        className="h-4 w-full rounded border flex items-center px-1 text-[9px] font-bold"
                        style={{ backgroundColor: t.sampleBg, color: t.sampleFg, borderColor: t.sampleFg }}
                        aria-hidden="true"
                      >
                        Aa
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Tipografi Disleksia */}
            <section aria-labelledby="typography-heading" className="space-y-3">
              <h3 id="typography-heading" className="text-sm font-semibold flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>Gaya Huruf & Membaca</span>
              </h3>
              <div className="space-y-2">
                {fonts.map((f) => {
                  const isSelected = font === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFont(f.id)}
                      className={`w-full p-2.5 px-3 text-left rounded-lg border-2 flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-primary bg-accent/60 font-semibold'
                          : 'border-border hover:border-foreground/30'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex flex-col">
                        <span className={`text-sm ${f.styleClass}`}>{f.name}</span>
                        <span className="text-[11px] text-muted-foreground">{f.desc}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Skala Ukuran Teks */}
            <section aria-labelledby="scaling-heading" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 id="scaling-heading" className="text-sm font-semibold flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Ukuran Teks ({Math.round(fontScale * 100)}%)</span>
                </h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseFontSize}
                    aria-label="Perkecil ukuran teks"
                    className="h-8 w-8 p-0"
                    disabled={fontScale <= 0.9}
                  >
                    <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFontSize}
                    aria-label="Kembalikan ukuran teks ke 100%"
                    className="h-8 px-2 text-xs"
                  >
                    100%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseFontSize}
                    aria-label="Perbesar ukuran teks"
                    className="h-8 w-8 p-0"
                    disabled={fontScale >= 2.0}
                  >
                    <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <Slider
                value={[fontScale]}
                min={0.9}
                max={2.0}
                step={0.05}
                onValueChange={(val) => setFontScale(val[0])}
                aria-label="Penggeser persentase skala teks"
              />
            </section>

            {/* 4. Jarak Antar Baris */}
            <section aria-labelledby="spacing-heading" className="space-y-2">
              <h3 id="spacing-heading" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Jarak Antar-Baris
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Standar (1.6x)', val: 1.6 },
                  { label: 'Longgar (1.8x)', val: 1.8 },
                  { label: 'Lebar (2.0x)', val: 2.0 },
                ].map((item) => (
                  <Button
                    key={item.val}
                    variant={lineHeight === item.val ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setLineHeight(item.val)}
                    className="text-xs py-1 h-8"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </section>

            {/* 5. Bantuan Kognitif & Sensorik */}
            <section aria-labelledby="cognitive-heading" className="space-y-3 pt-2 border-t border-border">
              <h3 id="cognitive-heading" className="text-sm font-semibold">
                Bantuan Kognitif & Sensorik
              </h3>

              {/* Penggaris Baca */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="reading-ruler-toggle" className="text-xs font-semibold cursor-pointer">
                    Penggaris Fokus Membaca
                  </label>
                  <p className="text-[11px] text-muted-foreground">Bilah panduan visual yang mengikuti kursor / fokus keyboard</p>
                </div>
                <Switch
                  id="reading-ruler-toggle"
                  checked={readingRuler}
                  onCheckedChange={setReadingRuler}
                  aria-label="Aktifkan penggaris fokus membaca"
                />
              </div>

              {/* Kurangi Animasi */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="reduce-motion-toggle" className="text-xs font-semibold cursor-pointer">
                    Kurangi Gerakan & Animasi
                  </label>
                  <p className="text-[11px] text-muted-foreground">Menghentikan animasi otomatis untuk meredakan stres vestibular</p>
                </div>
                <Switch
                  id="reduce-motion-toggle"
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                  aria-label="Aktifkan pengurangan gerakan animasi"
                />
              </div>
            </section>

            {/* 6. Akomodasi Ujian / Waktu Tambahan */}
            <section aria-labelledby="accommodations-heading" className="space-y-3 pt-2 border-t border-border bg-primary/5 -mx-6 p-6 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <h3 id="accommodations-heading" className="text-sm font-bold flex items-center gap-2 text-primary">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>Akomodasi Ujian Khusus</span>
                </h3>
                <Badge variant="warning">Pendidikan Khusus</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <label htmlFor="extended-time-toggle" className="text-xs font-semibold cursor-pointer">
                    Akomodasi Waktu Tambahan
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Secara otomatis memberikan perpanjangan durasi pada kuis & asesmen.
                  </p>
                </div>
                <Switch
                  id="extended-time-toggle"
                  checked={requiresExtendedTime}
                  onCheckedChange={setRequiresExtendedTime}
                  aria-label="Aktifkan akomodasi waktu tambahan"
                />
              </div>

              {requiresExtendedTime && (
                <div className="mt-3 p-3 bg-card border border-primary/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">Pengali Waktu Tambahan:</span>
                    <span className="font-bold text-primary">{extendedTimeMultiplier}x Waktu (+{Math.round((extendedTimeMultiplier - 1) * 100)}%)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '+50% (1.5x)', val: 1.5 },
                      { label: '+100% (2.0x)', val: 2.0 },
                      { label: '+200% (3.0x)', val: 3.0 },
                    ].map((item) => (
                      <Button
                        key={item.val}
                        variant={extendedTimeMultiplier === item.val ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setExtendedTimeMultiplier(item.val)}
                        className="text-xs h-8"
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Kecepatan Narasi Suara */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Kecepatan Narasi Suara ({speechRate}x)
                  </span>
                </div>
                <Slider
                  value={[speechRate]}
                  min={0.75}
                  max={1.5}
                  step={0.25}
                  onValueChange={(val) => setSpeechRate(val[0])}
                  aria-label="Atur kecepatan narasi text to speech"
                />
              </div>

              {/* Tombol Reset */}
              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAllSettings}
                  className="w-full text-xs text-muted-foreground hover:text-destructive gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Kembalikan Semua Pengaturan ke Standar</span>
                </Button>
              </div>
            </section>
          </div>
        </div>
      )}
    </aside>
  );
}
