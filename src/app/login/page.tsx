'use client';

/**
 * =========================================================================
 * GERBANG MASUK SISTEM TERTUTUP (WCAG 2.1 AA & ROLE-BASED ACCESS CONTROL)
 * =========================================================================
 * Autentikasi untuk platform tertutup (Closed LMS). Dilengkapi tombol 1-Click
 * Akses Cepat untuk Pengajar PLB, Siswa Berakomodasi, dan Siswa Standar,
 * serta formulir manual yang 100% aksesibel bagi pembaca layar & keyboard.
 */

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  GraduationCap,
  ShieldCheck,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/context/AccessibilityContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/courses';
  const { announce } = useAccessibility();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const targetEmail = loginEmail || email;
    const targetPassword = loginPassword || password;

    if (!targetEmail || !targetPassword) {
      setErrorMessage('Email dan kata sandi wajib diisi.');
      announce('Email dan kata sandi wajib diisi.', 'assertive');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: targetEmail,
        password: targetPassword,
        callbackUrl,
      });

      if (result?.error) {
        setErrorMessage(result.error);
        announce(`Gagal masuk: ${result.error}`, 'assertive');
      } else {
        announce('Berhasil masuk ke sistem tertutup. Mengalihkan...', 'assertive');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Terjadi kesalahan koneksi saat memproses login.');
      announce('Terjadi kesalahan koneksi.', 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'ADMIN',
      title: 'Administrator Utama',
      roleLabel: 'Akses Seluruh Sistem & Akun',
      email: 'admin@accessilearn.edu',
      desc: 'Hak akses penuh: Manajemen seluruh akun pengguna, ubah hak akses instruktur, dan pantau sistem.',
      badgeVariant: 'destructive' as const,
      badgeText: 'Admin Utama',
      icon: KeyRound,
      accommodations: 'Akses Penuh',
    },
    {
      role: 'INSTRUCTOR',
      title: 'Dr. Maya Lin, M.Pd.',
      roleLabel: 'Instruktur / Guru PLB',
      email: 'maya.lin@accessilearn.edu',
      desc: 'Hak akses penuh: Buat kursus baru, kelola silabus, dan audit aksesibilitas materi.',
      badgeVariant: 'default' as const,
      badgeText: 'Hak Akses Instruktur',
      icon: GraduationCap,
      accommodations: 'Akses Pendidik Khusus',
    },
    {
      role: 'STUDENT_ACCOMMODATED',
      title: 'Jordan Pratama',
      roleLabel: 'Siswa Akomodasi Khusus',
      email: 'jordan.pratama@accessilearn.edu',
      desc: 'Hak akses belajar: Dilengkapi akomodasi waktu ujian 1.5x, kontras tinggi, & huruf disleksia.',
      badgeVariant: 'warning' as const,
      badgeText: 'Akomodasi Waktu 1.5x',
      icon: ShieldCheck,
      accommodations: 'Akomodasi Khusus Aktif',
    },
    {
      role: 'STUDENT_STANDARD',
      title: 'Alex Wijaya',
      roleLabel: 'Peserta Didik Standar',
      email: 'alex.wijaya@accessilearn.edu',
      desc: 'Hak akses belajar: Belajar modul, putar video subtitel, dan ikuti asesmen.',
      badgeVariant: 'secondary' as const,
      badgeText: 'Siswa Reguler',
      icon: User,
      accommodations: 'Durasi Standar',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header Banner Sistem Tertutup */}
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-primary/40 bg-primary/10 text-primary text-xs font-bold shadow-sm">
          <Lock className="w-4 h-4 text-primary" aria-hidden="true" />
          <span>Sistem Pembelajaran Tertutup & Terproteksi (Closed LMS)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          Pintu Masuk <span className="text-primary">AccessiLearn</span>
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed">
          Platform ini dirancang khusus dan tertutup hanya bagi peserta didik serta instruktur yang memiliki hak akses terdaftar.
        </p>
      </header>

      {/* Kotak Pesan Kesalahan */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="max-w-xl mx-auto p-4 rounded-2xl border-2 border-destructive/50 bg-destructive/10 text-destructive text-sm font-bold flex items-start gap-3 shadow-md"
        >
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* 1-Click Demo Login Quick Access Section */}
      <section aria-labelledby="quick-access-title" className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 id="quick-access-title" className="text-lg font-bold text-foreground">
              Akses Cepat Pengujian Peran (1-Click Login)
            </h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Pilih salah satu profil untuk masuk instan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoAccounts.map((account) => {
            const Icon = account.icon;
            return (
              <button
                key={account.email}
                type="button"
                onClick={() => handleLogin(account.email, 'password123')}
                disabled={isLoading}
                className="group relative p-5 rounded-2xl border-2 border-border bg-card text-left transition-all hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary flex flex-col justify-between space-y-4"
                aria-label={`Masuk sebagai ${account.title} (${account.roleLabel})`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors" aria-hidden="true">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant={account.badgeVariant} className="text-[10px]">
                      {account.badgeText}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {account.title}
                    </h3>
                    <p className="text-xs font-semibold text-primary/80">{account.roleLabel}</p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {account.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Masuk Instan</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Formulir Masuk Manual Tradisional */}
      <section
        aria-labelledby="manual-login-title"
        className="max-w-xl mx-auto rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-md space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 id="manual-login-title" className="text-base font-bold text-foreground">
              Atau Masuk dengan Akun Terdaftar
            </h2>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-bold text-foreground flex items-center gap-1">
              <span>Alamat Email Pengguna</span>
              <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@accessilearn.edu"
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
              autoComplete="email"
            />
          </div>

          {/* Kata Sandi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>Kata Sandi</span>
                <span className="text-destructive" aria-hidden="true">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-sm"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              Kata sandi default semua akun demo: <code className="font-mono bg-muted px-1.5 py-0.5 rounded font-bold">password123</code>
            </p>
          </div>

          {/* Tombol Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full font-extrabold text-base py-3.5 shadow-md gap-2"
          >
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>{isLoading ? 'Memverifikasi Akses...' : 'Masuk ke Platform'}</span>
          </Button>

          {/* Tautan Daftar Akun Baru */}
          <div className="pt-2 text-center border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              Belum memiliki akun terdaftar?{' '}
              <Link href="/register" className="font-bold text-primary hover:underline">
                Daftar sebagai Siswa atau Pengajar di sini
              </Link>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main id="main-content" className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Memuat gerbang login...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
