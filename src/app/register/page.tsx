'use client';

/**
 * =========================================================================
 * HALAMAN PENDAFTARAN AKUN SISTEM TERTUTUP (WCAG 2.1 LEVEL AA)
 * =========================================================================
 * Pendaftaran untuk calon Peserta Didik dan Pengajar / Guru PLB.
 * Permintaan pendaftaran akan ditinjau dan disetujui/ditolak oleh Administrator.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  UserPlus,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAccessibility } from '@/context/AccessibilityContext';

export default function RegisterPage() {
  const { announce } = useAccessibility();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'STUDENT' | 'INSTRUCTOR'>('STUDENT');
  const [registrationNote, setRegistrationNote] = useState('');
  const [requiresExtendedTime, setRequiresExtendedTime] = useState(false);
  const [timeMultiplier, setTimeMultiplier] = useState(1.5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || name.trim().length < 2) {
      setErrorMessage('Nama lengkap harus minimal 2 karakter.');
      announce('Nama lengkap harus minimal 2 karakter.', 'assertive');
      return;
    }

    if (!email || !email.includes('@')) {
      setErrorMessage('Alamat email tidak valid.');
      announce('Alamat email tidak valid.', 'assertive');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Kata sandi harus minimal 6 karakter.');
      announce('Kata sandi harus minimal 6 karakter.', 'assertive');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          registrationNote,
          requiresExtendedTime,
          timeMultiplier,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim pendaftaran.');
      }

      setIsSubmitted(true);
      announce('Pendaftaran berhasil dikirim dan sedang menunggu persetujuan Administrator.', 'polite');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
      announce(err.message || 'Gagal mengirim pendaftaran.', 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main id="main-content" className="container mx-auto px-4 sm:px-6 py-16 max-w-xl text-center space-y-6">
        <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg" aria-hidden="true">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <Badge variant="warning" className="mx-auto text-xs py-1">
            Status: Menunggu Persetujuan Admin
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Permohonan Pendaftaran Terkirim!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Terima kasih, <strong>{name}</strong>. Karena <strong>AccessiLearn</strong> beroperasi sebagai sistem pembelajaran tertutup dan terproteksi, akun Anda akan diverifikasi terlebih dahulu oleh Administrator sebelum dapat digunakan untuk masuk.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card text-left text-xs space-y-2">
          <span className="font-bold text-foreground block">Ringkasan Pendaftaran:</span>
          <p className="text-muted-foreground"><span className="font-semibold">Email:</span> {email}</p>
          <p className="text-muted-foreground"><span className="font-semibold">Peran Diajukan:</span> {role === 'INSTRUCTOR' ? 'Pengajar / Guru PLB' : 'Peserta Didik'}</p>
          {requiresExtendedTime && (
            <p className="text-amber-700 dark:text-amber-300 font-semibold">
              ✨ Akomodasi Waktu Tambahan Ujian {timeMultiplier}x Diajukan
            </p>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full justify-center gap-2 font-bold">
              <span>Kembali ke Halaman Masuk</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl space-y-8">
      {/* Header */}
      <header className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-primary/40 bg-primary/10 text-primary text-xs font-bold shadow-sm">
          <Lock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span>Registrasi Sistem Tertutup & Inklusif</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Daftar Akun <span className="text-primary">AccessiLearn</span>
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Ajukan akun baru sebagai Peserta Didik atau Instruktur. Permohonan pendaftaran akan ditinjau dan disetujui langsung oleh Administrator.
        </p>
      </header>

      {/* Kotak Error */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-2xl border-2 border-destructive/50 bg-destructive/10 text-destructive text-sm font-bold flex items-start gap-3 shadow-md"
        >
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Formulir Pendaftaran */}
      <form onSubmit={handleSubmit} className="rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-md space-y-6">
        {/* Pilihan Peran Akun */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground block">
            Pilih Peran Akun yang Diajukan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Peran Akun">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                role === 'STUDENT'
                  ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                  : 'border-border hover:border-border/80 bg-background/50'
              }`}
              role="radio"
              aria-checked={role === 'STUDENT'}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${role === 'STUDENT' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <BookOpen className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block">Peserta Didik (Siswa)</span>
                <span className="text-xs text-muted-foreground">Akses materi inklusif, video subtitel, & asesmen.</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('INSTRUCTOR')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                role === 'INSTRUCTOR'
                  ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                  : 'border-border hover:border-border/80 bg-background/50'
              }`}
              role="radio"
              aria-checked={role === 'INSTRUCTOR'}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${role === 'INSTRUCTOR' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <GraduationCap className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block">Instruktur / Guru PLB</span>
                <span className="text-xs text-muted-foreground">Buat kurikulum aksesibel & audit materi WCAG.</span>
              </div>
            </button>
          </div>
        </div>

        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <label htmlFor="reg-name" className="text-xs font-bold text-foreground flex items-center gap-1">
            <span>Nama Lengkap & Gelar (jika ada)</span>
            <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <input
            id="reg-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="contoh: Sarah Oktavia / Dr. Hendra, M.Pd."
            className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="text-xs font-bold text-foreground flex items-center gap-1">
            <span>Alamat Email</span>
            <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
          />
        </div>

        {/* Kata Sandi */}
        <div className="space-y-1.5">
          <label htmlFor="reg-password" className="text-xs font-bold text-foreground flex items-center gap-1">
            <span>Kata Sandi (Minimal 6 karakter)</span>
            <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-4 pr-12 py-2.5 rounded-xl border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Alasan / Catatan Pendaftaran */}
        <div className="space-y-1.5">
          <label htmlFor="reg-note" className="text-xs font-bold text-foreground">
            Alasan Pendaftaran / Latar Belakang Institusi
          </label>
          <textarea
            id="reg-note"
            rows={2}
            value={registrationNote}
            onChange={(e) => setRegistrationNote(e.target.value)}
            placeholder={
              role === 'INSTRUCTOR'
                ? 'Sebutkan institusi/sekolah dan rencana materi pembelajaran inklusif yang ingin Anda terbitkan...'
                : 'Sebutkan minat pembelajaran atau profil khusus yang ingin Anda pelajari...'
            }
            className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background text-foreground text-xs focus-visible:ring-4 focus-visible:ring-primary"
          />
        </div>

        {/* Permohonan Akomodasi Khusus (Bagi Siswa) */}
        {role === 'STUDENT' && (
          <div className="p-4 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <label htmlFor="reg-extend-toggle" className="text-xs font-bold cursor-pointer">
                  Ajukan Akomodasi Waktu Tambahan Asesmen
                </label>
              </div>
              <Switch
                id="reg-extend-toggle"
                checked={requiresExtendedTime}
                onCheckedChange={setRequiresExtendedTime}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Bagi siswa dengan disleksia, ADHD, hambatan motorik, atau pengguna pembaca layar.
            </p>

            {requiresExtendedTime && (
              <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                <span className="text-[11px] font-bold text-muted-foreground block">
                  Pilihan Pengali Waktu yang Diajukan:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[1.5, 2.0, 3.0].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTimeMultiplier(val)}
                      className={`py-1 rounded text-xs font-bold border transition-colors ${
                        timeMultiplier === val
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border'
                      }`}
                    >
                      {val}x Durasi
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tombol Kirim */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
          <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-primary">
            Sudah memiliki akun? Masuk di sini
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto font-extrabold px-8 shadow-md gap-2"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>{isSubmitting ? 'Mengirimkan Permohonan...' : 'Kirim Pendaftaran'}</span>
          </Button>
        </div>
      </form>
    </main>
  );
}
