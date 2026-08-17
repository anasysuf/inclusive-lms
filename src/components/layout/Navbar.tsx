'use client';

/**
 * =========================================================================
 * NAVIGASI UTAMA RAMAH DISABILITAS & SISTEM TERTUTUP (WCAG 2.1 LEVEL AA)
 * =========================================================================
 * - Mendukung status sesi login peran (Admin, Instruktur, Siswa).
 * - Menampilkan lencana akomodasi dan peran pengguna secara visual & terstruktur.
 * - Tombol aksi "Panel Admin" & "Buat Kursus" sesuai tingkat izin pengguna.
 * - Navigasi mobile responsif dengan target sentuh ergonomis (>44px).
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  BookOpen,
  GraduationCap,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  User,
  UserPlus,
  LogOut,
  LogIn,
  Lock,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/context/AccessibilityContext';

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { requiresExtendedTime } = useAccessibility();

  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN';
  const isInstructor = user?.role === 'INSTRUCTOR' || isAdmin;
  const isLoggedIn = status === 'authenticated';

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/courses', label: 'Katalog Kursus', requiresAuth: true },
    ...(isInstructor ? [{ href: '/instructor', label: 'Studio Pengajar', requiresAuth: true }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Panel Admin', requiresAuth: true }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b-2 border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-extrabold text-lg sm:text-xl text-foreground focus-visible:ring-4 focus-visible:ring-primary rounded-lg p-1"
            aria-label="AccessiLearn - Halaman Utama"
          >
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-sm" aria-hidden="true">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="tracking-tight">
              Accessi<span className="text-primary font-black">Learn</span>
            </span>
          </Link>

          {/* Lencana Sistem Tertutup */}
          <Badge variant="outline" className="hidden lg:inline-flex items-center gap-1 py-0.5 text-[11px] font-mono border-primary/40 bg-primary/5">
            <Lock className="w-3 h-3 text-primary" aria-hidden="true" />
            <span>Closed LMS</span>
          </Badge>

          {/* Status Akomodasi Waktu Tambahan Aktif */}
          {requiresExtendedTime && (
            <Badge variant="warning" className="hidden xl:inline-flex items-center gap-1.5 py-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Akomodasi Waktu Aktif</span>
            </Badge>
          )}
        </div>

        {/* Navigasi Desktop */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-1.5"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-muted'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Tombol Aksi Kanan & Profil Akun */}
        <div className="hidden md:flex items-center gap-3">
          {/* Tombol Buat Kursus (HANYA UNTUK INSTRUKTUR / ADMIN) */}
          {isInstructor && (
            <Link href="/instructor/courses/new">
              <Button variant="outline" size="sm" className="gap-2 border-2 border-primary/50 font-semibold text-xs">
                <PlusCircle className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>Buat Kursus</span>
              </Button>
            </Link>
          )}

          {isLoggedIn ? (
            <div className="relative">
              {/* User Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full border-2 border-border bg-card hover:border-primary transition-all focus-visible:ring-4 focus-visible:ring-primary"
                aria-expanded={userDropdownOpen}
                aria-label={`Menu Akun: ${user?.name || 'Pengguna'} (${user?.role || 'Siswa'})`}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs" aria-hidden="true">
                  {isAdmin ? 'AD' : user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-xs font-bold block line-clamp-1 text-foreground">
                    {user?.name || 'Pengguna'}
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {isAdmin ? 'Administrator' : isInstructor ? 'Instruktur PLB' : 'Siswa Terdaftar'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl border-2 border-border bg-card shadow-2xl p-3 z-50 space-y-2 animate-in fade-in"
                  role="menu"
                  aria-label="Menu Pengguna"
                >
                  <div className="p-2 border-b border-border space-y-1">
                    <span className="text-xs font-extrabold text-foreground block line-clamp-1">
                      {user?.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground block font-mono truncate">
                      {user?.email}
                    </span>
                    <Badge variant={isAdmin ? 'destructive' : isInstructor ? 'default' : 'secondary'} className="text-[10px] mt-1">
                      {isAdmin ? 'Role: Administrator' : isInstructor ? 'Role: Instruktur PLB' : 'Role: Peserta Didik'}
                    </Badge>
                  </div>

                  <div className="space-y-1 pt-1">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                        role="menuitem"
                      >
                        <Shield className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                        <span>Panel Manajemen Admin</span>
                      </Link>
                    )}

                    <Link
                      href="/courses"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium hover:bg-muted text-foreground transition-colors"
                      role="menuitem"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                      <span>Katalog Kursus Belajar</span>
                    </Link>

                    {isInstructor && (
                      <Link
                        href="/instructor"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium hover:bg-muted text-foreground transition-colors"
                        role="menuitem"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                        <span>Studio Pengajar</span>
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium hover:bg-muted text-foreground transition-colors"
                      role="menuitem"
                    >
                      <User className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                      <span>Profil & Akomodasi Saya</span>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
                      role="menuitem"
                    >
                      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/register">
                <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-xs border-2 border-primary/40">
                  <UserPlus className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  <span>Daftar Akun</span>
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="primary" size="sm" className="gap-1.5 font-extrabold text-xs">
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  <span>Masuk</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Tombol Menu Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Buka menu navigasi ponsel"
            className="h-10 w-10"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Laci Navigasi Mobile Responsif */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi Ponsel"
          className="md:hidden border-t-2 border-border bg-card p-4 space-y-3 shadow-lg"
        >
          {isLoggedIn && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-extrabold text-foreground block">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground block">{user?.email}</span>
              </div>
              <Badge variant={isAdmin ? 'destructive' : isInstructor ? 'default' : 'secondary'} className="text-[10px]">
                {isAdmin ? 'Admin' : isInstructor ? 'Instruktur' : 'Siswa'}
              </Badge>
            </div>
          )}

          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-muted'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isInstructor && (
              <Link href="/instructor/courses/new" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center gap-2 text-xs">
                  <PlusCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Buat Kursus Baru</span>
                </Button>
              </Link>
            )}

            {isLoggedIn ? (
              <Button
                variant="destructive"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full justify-center gap-2 text-xs"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Keluar Akun</span>
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center gap-2 text-xs">
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    <span>Masuk ke Akun Anda</span>
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center gap-2 text-xs border-2 border-primary/40">
                    <UserPlus className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span>Daftar Akun Baru</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
