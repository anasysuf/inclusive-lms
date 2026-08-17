'use client';

/**
 * =========================================================================
 * PANEL ADMINISTRATOR & MANAJEMEN AKUN LENGKAP (WCAG 2.1 LEVEL AA)
 * =========================================================================
 * - Manajemen peran pengguna (Admin, Instruktur, Siswa).
 * - Persetujuan pendaftaran (Approval / Rejection) untuk sistem tertutup.
 * - Konfigurasi akomodasi pendidikan khusus (waktu ekstra ujian).
 * - Fitur reset password dinonaktifkan sementara untuk keperluan demo.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  PlusCircle,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  Clock,
  ShieldCheck,
  UserPlus,
  X,
  Sparkles,
  UserCheck,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAccessibility } from '@/context/AccessibilityContext';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  registrationNote?: string | null;
  requiresExtendedTime: boolean;
  timeMultiplier: number;
  preferredTheme: string;
  preferredFont: string;
  createdAt: string;
  _count: {
    coursesTaught: number;
    quizSubmissions: number;
  };
}

export default function AdminDashboardPage() {
  const { announce } = useAccessibility();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'USERS' | 'PENDING'>('USERS');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal Tambah Pengguna
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [newRole, setNewRole] = useState<'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>('STUDENT');
  const [newRequiresExtendedTime, setNewRequiresExtendedTime] = useState(false);
  const [newTimeMultiplier, setNewTimeMultiplier] = useState(1.5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal Edit Pengguna
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editRole, setEditRole] = useState<'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>('STUDENT');
  const [editRequiresTime, setEditRequiresTime] = useState(false);
  const [editTimeMultiplier, setEditTimeMultiplier] = useState(1.5);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Gagal mengambil data pengguna');
      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error(err);
      announce('Terjadi kesalahan memuat data pengguna.', 'assertive');
    } finally {
      setIsLoading(false);
    }
  }, [announce]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          requiresExtendedTime: newRequiresExtendedTime,
          timeMultiplier: newTimeMultiplier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat pengguna');

      announce(`Pengguna "${newName}" berhasil ditambahkan ke sistem!`, 'polite');
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('password123');
      setNewRequiresExtendedTime(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
      announce(err.message, 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          requiresExtendedTime: editRequiresTime,
          timeMultiplier: editTimeMultiplier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pengguna');

      announce(`Hak akses ${editingUser.name} berhasil diperbarui.`, 'polite');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
      announce(err.message, 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveRegistration = async (userId: string, userName: string) => {
    try {
      const res = await fetch(`/api/admin/registrations/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyetujui pendaftaran');

      announce(`Pendaftaran ${userName} telah disetujui! Akun kini dapat digunakan untuk masuk.`, 'polite');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
      announce(err.message, 'assertive');
    }
  };

  const handleRejectRegistration = async (userId: string, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menolak permohonan pendaftaran dari ${userName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/registrations/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menolak pendaftaran');

      announce(`Pendaftaran ${userName} telah ditolak.`, 'polite');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
      announce(err.message, 'assertive');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${userName}" dari sistem?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus pengguna');

      announce(`Akun ${userName} berhasil dihapus.`, 'polite');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
      announce(err.message, 'assertive');
    }
  };

  const approvedUsers = users.filter((u) => u.status === 'APPROVED');
  const pendingUsers = users.filter((u) => u.status === 'PENDING');

  const filteredApprovedUsers = approvedUsers.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch =
      search.trim() === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <main id="main-content" className="container mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header Panel Administrator */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-yellow-500" aria-hidden="true" />
            <span>Pusat Manajemen Sistem Tertutup</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Panel Kontrol Administrator
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola pengguna aktif, setujui permohonan pendaftaran, dan konfigurasi hak akses serta akomodasi khusus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            className="font-bold gap-2 shadow-md"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah Pengguna Langsung</span>
          </Button>
        </div>
      </header>

      {/* Kartu Ringkasan Metrik Sistem */}
      {stats && (
        <section aria-labelledby="admin-metrics-heading" className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl border-2 border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Pengguna Aktif</span>
              <Users className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <p className="text-3xl font-black text-foreground">{stats.totalUsers}</p>
            <p className="text-[11px] text-muted-foreground">Akun disetujui</p>
          </div>

          <div
            onClick={() => setActiveTab('PENDING')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm space-y-1 ${
              stats.totalPending > 0
                ? 'border-amber-500/50 bg-amber-500/10 hover:border-amber-500'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
              <span className="text-xs font-bold uppercase tracking-wider">Menunggu ACC</span>
              <UserCheck className="w-4 h-4 text-amber-600" aria-hidden="true" />
            </div>
            <p className="text-3xl font-black text-foreground">{stats.totalPending}</p>
            <p className="text-[11px] text-muted-foreground">Permohonan pendaftaran</p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Instruktur PLB</span>
              <GraduationCap className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            </div>
            <p className="text-3xl font-black text-foreground">{stats.totalInstructors}</p>
            <p className="text-[11px] text-muted-foreground">Pendidik terverifikasi</p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Akomodasi Waktu</span>
              <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            </div>
            <p className="text-3xl font-black text-foreground">{stats.totalAccommodated}</p>
            <p className="text-[11px] text-muted-foreground">Siswa durasi 1.5x/2.0x</p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-border bg-card shadow-sm space-y-1 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Total Kursus</span>
              <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <p className="text-3xl font-black text-foreground">{stats.totalCourses}</p>
            <p className="text-[11px] text-muted-foreground">Kurikulum inklusif</p>
          </div>
        </section>
      )}

      {/* Navigasi Tab Utama */}
      <div role="tablist" aria-label="Navigasi Manajemen Administrator" className="flex items-center gap-3 border-b-2 border-border pb-1">
        <button
          type="button"
          role="tab"
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-b-2 -mb-1 ${
            activeTab === 'USERS'
              ? 'border-primary text-primary bg-primary/10'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          aria-selected={activeTab === 'USERS'}
        >
          <Users className="w-4 h-4" aria-hidden="true" />
          <span>Pengguna Aktif & Hak Akses ({approvedUsers.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          onClick={() => setActiveTab('PENDING')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-b-2 -mb-1 ${
            activeTab === 'PENDING'
              ? 'border-amber-500 text-amber-900 dark:text-amber-300 bg-amber-500/10'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          aria-selected={activeTab === 'PENDING'}
        >
          <UserCheck className="w-4 h-4 text-amber-600" aria-hidden="true" />
          <span>Persetujuan Pendaftaran</span>
          {pendingUsers.length > 0 && (
            <Badge variant="warning" className="ml-1 text-[10px]">
              {pendingUsers.length} Menunggu
            </Badge>
          )}
        </button>
      </div>

      {/* TAB 1: DAFTAR PENGGUNA AKTIF */}
      {activeTab === 'USERS' && (
        <section aria-labelledby="users-table-heading" className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h2 id="users-table-heading" className="text-xl font-bold text-foreground">
                Daftar Pengguna Terdaftar
              </h2>
              <p className="text-xs text-muted-foreground">
                Ubah peran pengguna menjadi Instruktur untuk mengizinkan pembuatan kursus
              </p>
            </div>

            {/* Kontrol Pencarian & Filter Peran */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau email..."
                  className="pl-9 pr-4 py-2 text-xs rounded-xl border-2 border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary w-56"
                  aria-label="Cari pengguna"
                />
              </div>

              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border/60 text-xs">
                {[
                  { id: 'ALL', label: 'Semua' },
                  { id: 'ADMIN', label: 'Admin' },
                  { id: 'INSTRUCTOR', label: 'Instruktur' },
                  { id: 'STUDENT', label: 'Siswa' },
                ].map((rf) => (
                  <button
                    key={rf.id}
                    type="button"
                    onClick={() => setRoleFilter(rf.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors text-xs ${
                      roleFilter === rf.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabel Responsif */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4">Nama Pengguna & Email</th>
                  <th scope="col" className="py-3 px-4">Peran (Role)</th>
                  <th scope="col" className="py-3 px-4">Status Akomodasi</th>
                  <th scope="col" className="py-3 px-4">Aktivitas</th>
                  <th scope="col" className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredApprovedUsers.map((u) => {
                  const isAdmin = u.role === 'ADMIN';
                  const isInstructor = u.role === 'INSTRUCTOR';

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0" aria-hidden="true">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">{u.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge
                          variant={isAdmin ? 'destructive' : isInstructor ? 'default' : 'secondary'}
                          className="text-xs font-semibold"
                        >
                          {isAdmin ? 'ADMINISTRATOR' : isInstructor ? 'INSTRUKTUR PLB' : 'SISWA'}
                        </Badge>
                      </td>

                      <td className="py-4 px-4">
                        {u.requiresExtendedTime ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Waktu {u.timeMultiplier}x Ekstra</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Standar (1.0x)</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-muted-foreground">
                        {isInstructor ? (
                          <span>{u._count.coursesTaught} Kursus Dibuat</span>
                        ) : (
                          <span>{u._count.quizSubmissions} Kuis Diikuti</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(u);
                              setEditRole(u.role);
                              setEditRequiresTime(u.requiresExtendedTime);
                              setEditTimeMultiplier(u.timeMultiplier);
                            }}
                            aria-label={`Ubah hak akses untuk ${u.name}`}
                            className="h-8 px-2.5 text-xs gap-1"
                          >
                            <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Kelola</span>
                          </Button>

                          {!isAdmin && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              aria-label={`Hapus pengguna ${u.name}`}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredApprovedUsers.length === 0 && !isLoading && (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" aria-hidden="true" />
                <p className="text-sm">Tidak ada pengguna yang cocok dengan kriteria pencarian.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: PERSETUJUAN PENDAFTARAN (APPROVALS) */}
      {activeTab === 'PENDING' && (
        <section aria-labelledby="pending-heading" className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 id="pending-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" aria-hidden="true" />
                <span>Permohonan Pendaftaran Akun Sistem Tertutup</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Tinjau calon pengguna sebelum memberikan hak akses ke platform AccessiLearn
              </p>
            </div>
            <Badge variant="warning">{pendingUsers.length} Permohonan Menunggu</Badge>
          </div>

          {pendingUsers.length > 0 ? (
            <div className="space-y-4">
              {pendingUsers.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-amber-500 shadow-sm"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-base text-foreground">{p.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">({p.email})</span>
                      <Badge variant={p.role === 'INSTRUCTOR' ? 'default' : 'secondary'} className="text-xs">
                        Diajukan: {p.role === 'INSTRUCTOR' ? 'Pengajar / Guru PLB' : 'Peserta Didik'}
                      </Badge>
                      {p.requiresExtendedTime && (
                        <Badge variant="warning" className="text-xs">
                          ✨ Akomodasi Waktu {p.timeMultiplier}x
                        </Badge>
                      )}
                    </div>

                    {p.registrationNote && (
                      <div className="p-3 rounded-xl bg-background/80 border border-border text-xs text-foreground/90 space-y-1">
                        <span className="font-bold block text-muted-foreground">Catatan / Alasan Pendaftaran:</span>
                        <p className="leading-relaxed">{p.registrationNote}</p>
                      </div>
                    )}

                    <p className="text-[11px] text-muted-foreground">
                      Diajukan pada: {new Date(p.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Tombol Aksi Persetujuan */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectRegistration(p.id, p.name)}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Tolak Pendaftaran</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApproveRegistration(p.id, p.name)}
                      className="gap-1.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Setujui Akun (ACC)</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border-2 border-dashed border-border text-muted-foreground space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-60" aria-hidden="true" />
              <h3 className="text-base font-bold text-foreground">Semua Permohonan Telah Diproses</h3>
              <p className="text-xs">Tidak ada pendaftaran yang sedang menunggu persetujuan saat ini.</p>
            </div>
          )}
        </section>
      )}

      {/* MODAL / DIALOG TAMBAH PENGGUNA BARU */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-labelledby="add-user-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 id="add-user-title" className="text-lg font-black text-foreground">
                  Tambah Akun Pengguna Langsung
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Tutup formulir tambah pengguna"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {formError && (
              <div role="alert" className="p-3 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="new-user-name" className="text-xs font-bold text-foreground">
                  Nama Lengkap *
                </label>
                <input
                  id="new-user-name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="contoh: Prof. Budi Santoso, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="new-user-email" className="text-xs font-bold text-foreground">
                  Alamat Email *
                </label>
                <input
                  id="new-user-email"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="budi@accessilearn.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="new-user-password" className="text-xs font-bold text-foreground">
                    Kata Sandi Awal *
                  </label>
                  <div className="relative">
                    <input
                      id="new-user-password"
                      type={showNewUserPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 rounded-xl border-2 border-border bg-background text-foreground text-sm font-mono focus-visible:ring-4 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                      aria-label={showNewUserPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="new-user-role" className="text-xs font-bold text-foreground">
                    Peran / Hak Akses *
                  </label>
                  <select
                    id="new-user-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-border bg-background text-foreground text-sm focus-visible:ring-4 focus-visible:ring-primary"
                  >
                    <option value="STUDENT">Siswa (Peserta Didik)</option>
                    <option value="INSTRUCTOR">Instruktur / Guru PLB</option>
                    <option value="ADMIN">Administrator Utama</option>
                  </select>
                </div>
              </div>

              {/* Opsi Akomodasi Khusus */}
              <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="new-user-time-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                    Akomodasi Waktu Tambahan Ujian
                  </label>
                  <Switch
                    id="new-user-time-toggle"
                    checked={newRequiresExtendedTime}
                    onCheckedChange={setNewRequiresExtendedTime}
                  />
                </div>

                {newRequiresExtendedTime && (
                  <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                    <span className="text-[11px] font-bold text-muted-foreground block">
                      Pengali Durasi Ujian:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[1.5, 2.0, 3.0].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNewTimeMultiplier(val)}
                          className={`py-1 rounded text-xs font-bold border ${
                            newTimeMultiplier === val
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

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <Button type="button" variant="ghost" size="md" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="font-bold">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Akun Baru'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL / DIALOG KELOLA HAK AKSES PENGGUNA */}
      {editingUser && (
        <div
          role="dialog"
          aria-labelledby="edit-user-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 id="edit-user-title" className="text-lg font-black text-foreground">
                  Kelola Hak Akses Pengguna
                </h3>
                <p className="text-xs text-muted-foreground font-mono">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Tutup dialog kelola pengguna"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="edit-user-role" className="text-xs font-bold text-foreground">
                  Ubah Peran Akun (Role)
                </label>
                <select
                  id="edit-user-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-border bg-background text-foreground text-sm font-bold focus-visible:ring-4 focus-visible:ring-primary"
                >
                  <option value="STUDENT">Siswa (Peserta Didik)</option>
                  <option value="INSTRUCTOR">Instruktur / Guru PLB (Bisa Buat Kursus)</option>
                  <option value="ADMIN">Administrator Utama (Akses Seluruh Sistem)</option>
                </select>
              </div>

              {/* Akomodasi Waktu */}
              <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="edit-user-time-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                    Akomodasi Waktu Tambahan Ujian
                  </label>
                  <Switch
                    id="edit-user-time-toggle"
                    checked={editRequiresTime}
                    onCheckedChange={setEditRequiresTime}
                  />
                </div>

                {editRequiresTime && (
                  <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                    <span className="text-[11px] font-bold text-muted-foreground block">
                      Pengali Durasi Ujian:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[1.5, 2.0, 3.0].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setEditTimeMultiplier(val)}
                          className={`py-1 rounded text-xs font-bold border ${
                            editTimeMultiplier === val
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

              {/* Catatan Fitur Reset Password Dinonaktifkan untuk Demo */}
              <div className="p-3.5 rounded-2xl border border-border bg-muted/40 text-xs text-muted-foreground flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                <span>
                  <strong>Informasi Demo:</strong> Fitur reset kata sandi oleh Admin dinonaktifkan sementara untuk menjaga stabilitas akun peraga presentasi.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <Button type="button" variant="ghost" size="md" onClick={() => setEditingUser(null)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="font-bold">
                  {isSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
