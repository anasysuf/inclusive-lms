'use client';

/**
 * =========================================================================
 * PROFIL PENGGUNA & PREFERENSI AKOMODASI (WCAG 2.1 LEVEL AA)
 * =========================================================================
 * - Mengelola preferensi akomodasi kognitif, visual, dan motorik.
 * - Riwayat nilai kuis dan capaian pembelajaran.
 * - Fitur ubah kata sandi dinonaktifkan sementara untuk keperluan demo.
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Clock,
  Eye,
  CheckCircle2,
  Award,
  ChevronLeft,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAccessibility } from '@/context/AccessibilityContext';

export default function ProfilePage() {
  const { data: session } = useSession();
  const {
    theme,
    font,
    setFont,
    fontScale,
    requiresExtendedTime,
    setRequiresExtendedTime,
    extendedTimeMultiplier,
    setExtendedTimeMultiplier,
    readingRuler,
    setReadingRuler,
    announce,
  } = useAccessibility();

  const [profileData, setProfileData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/users/profile')
      .then((res) => res.json())
      .then((data) => setProfileData(data))
      .catch(console.error);
  }, []);

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requiresExtendedTime,
          timeMultiplier: extendedTimeMultiplier,
          preferredTheme: theme,
          preferredFont: font,
          fontSizeMultiplier: fontScale,
          enableReadingRuler: readingRuler,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        announce('Preferensi akomodasi berhasil disimpan ke profil basis data Anda.', 'polite');
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      announce('Gagal menyimpan preferensi ke server.', 'assertive');
    } finally {
      setIsSaving(false);
    }
  };

  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN';
  const isInstructor = user?.role === 'INSTRUCTOR' || isAdmin;

  return (
    <main id="main-content" className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Jejak Halaman">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:ring-4 focus-visible:ring-primary rounded p-1"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Katalog Kursus</span>
        </Link>
      </nav>

      {/* Header Profil */}
      <header className="rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary border-2 border-primary/30 flex items-center justify-center font-black text-2xl shrink-0" aria-hidden="true">
            {isAdmin ? 'AD' : user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground">{user?.name || 'Profil Pengguna'}</h1>
              <Badge variant={isAdmin ? 'destructive' : isInstructor ? 'default' : 'secondary'} className="text-xs">
                {isAdmin ? 'Administrator' : isInstructor ? 'Instruktur / Guru PLB' : 'Peserta Didik'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="font-bold gap-2 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>{isSaving ? 'Menyimpan...' : saveSuccess ? 'Tersimpan!' : 'Simpan Preferensi'}</span>
          </Button>
        </div>
      </header>

      {/* Grid Pengaturan Akomodasi Khusus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kartu 1: Akomodasi Ujian Khusus */}
        <section aria-labelledby="exam-accommodations-title" className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Clock className="w-5 h-5" aria-hidden="true" />
              <h2 id="exam-accommodations-title">Akomodasi Waktu Asesmen</h2>
            </div>
            <Badge variant="warning">Pendidikan Khusus</Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Menyesuaikan batas waktu pengerjaan kuis secara otomatis guna mengakomodasi ritme pemrosesan kognitif mandiri atau perangkat bantu navigasi.
          </p>

          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="profile-extended-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                Aktifkan Perpanjangan Durasi Ujian
              </label>
              <Switch
                id="profile-extended-toggle"
                checked={requiresExtendedTime}
                onCheckedChange={setRequiresExtendedTime}
                aria-label="Sakelar perpanjangan durasi ujian"
              />
            </div>

            {requiresExtendedTime && (
              <div className="pt-2 border-t border-border space-y-2">
                <span className="text-xs font-bold text-muted-foreground block">
                  Pengali Waktu ({extendedTimeMultiplier}x):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[1.5, 2.0, 3.0].map((val) => (
                    <Button
                      key={val}
                      variant={extendedTimeMultiplier === val ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setExtendedTimeMultiplier(val)}
                      className="text-xs"
                    >
                      {val}x Waktu
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Kartu 2: Bantuan Membaca & Visual */}
        <section aria-labelledby="visual-accommodations-title" className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Eye className="w-5 h-5" aria-hidden="true" />
              <h2 id="visual-accommodations-title">Bantuan Visual & Kognitif</h2>
            </div>
            <Badge variant="a11y">Universal</Badge>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="profile-ruler-toggle" className="text-xs font-bold text-foreground block cursor-pointer">
                  Penggaris Fokus Baca (Reading Ruler)
                </label>
                <span className="text-[11px] text-muted-foreground">Membantu fokus tracking baris untuk ADHD & Disleksia</span>
              </div>
              <Switch
                id="profile-ruler-toggle"
                checked={readingRuler}
                onCheckedChange={setReadingRuler}
                aria-label="Sakelar penggaris fokus baca"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-muted-foreground block">Pilihan Gaya Huruf:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'system', label: 'Inter' },
                { id: 'dyslexic', label: 'Lexend Disleksia' },
                { id: 'atkinson', label: 'Atkinson' },
              ].map((f) => (
                <Button
                  key={f.id}
                  variant={font === f.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFont(f.id as any)}
                  className="text-xs"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Kartu Status Keamanan Kata Sandi (Dinonaktifkan untuk Demo) */}
      <section aria-labelledby="password-notice-title" className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <KeyRound className="w-5 h-5" aria-hidden="true" />
            <h2 id="password-notice-title">Status Keamanan & Kata Sandi Akun</h2>
          </div>
          <Badge variant="outline">Kunci Demo Aktif</Badge>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-muted/40 text-xs text-muted-foreground flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold text-foreground">
              Fitur Ubah / Reset Kata Sandi Dinonaktifkan Sementara
            </p>
            <p>
              Untuk kelancaran sesi demonstrasi dan pengujian alur peran, seluruh akun menggunakan kata sandi standar bawaan (<code className="font-mono bg-background px-1.5 py-0.5 rounded border border-border font-bold">password123</code>).
            </p>
          </div>
        </div>
      </section>

      {/* Riwayat Asesmen Siswa (Jika Siswa) */}
      {profileData?.quizSubmissions && profileData.quizSubmissions.length > 0 && (
        <section aria-labelledby="history-title" className="rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Award className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 id="history-title" className="text-lg font-bold text-foreground">
              Riwayat Capaian Kuis & Asesmen
            </h2>
          </div>

          <div className="space-y-2.5">
            {profileData.quizSubmissions.map((sub: any) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-border bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-sm font-bold text-foreground block">{sub.quiz.title}</span>
                  <span className="text-xs text-muted-foreground">
                    Skor: {sub.score} / {sub.totalQuestions} ({Math.round((sub.score / sub.totalQuestions) * 100)}%) • Waktu: {sub.timeSpent} detik
                  </span>
                </div>
                {sub.extendedTimeUsed && (
                  <Badge variant="warning" className="text-[10px]">
                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                    <span>Akomodasi Waktu Tambahan</span>
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
