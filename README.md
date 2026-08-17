# AccessiLearn - Platform E-Learning Ramah Aksesibilitas & Pendidikan Khusus

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.18.0-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG%202.1-Level%20AA-success?style=flat)](https://www.w3.org/WAI/standards-guidelines/wcag/)

**AccessiLearn** adalah Learning Management System (LMS) berbasis web yang dirancang khusus dengan mengedepankan prinsip **Universal Design for Learning (UDL)** dan kepatuhan penuh terhadap standar **WCAG 2.1 Level AA**. Dibangun dengan pendekatan pedagogis keilmuan **Pendidikan Luar Biasa (PLB)** guna mendukung peserta didik dengan disabilitas visual, pendengaran, motorik, dan profil neurodivergen (ADHD, Disleksia, Autisme).

---

## 🌟 Fitur Utama Aksesibilitas

1. **Pusat Kontrol Aksesibilitas Terpadu (`Alt + A`)**:
   - **4 Mode Kontras Warna**: Standar Bersih, Kontras Tinggi Gelap (>15:1), Kuning di atas Hitam (*Low Vision*), dan Lembut Krem (Anti-Silau Disleksia).
   - **Tipografi Disleksia**: Dukungan font OpenDyslexic dan Atkinson Hyperlegible.
   - **Skala Ukuran Huruf**: Pembesaran teks 90% hingga 150% tanpa merusak tata letak.
   - **Penggaris Fokus Baca (*Reading Ruler*)**: Membantu pelacakan baris baca bagi pembaca dengan ADHD & Disleksia.
   - **Reduksi Animasi (*Reduce Motion*)**: Mencegah pemicu vestibular bagi pengguna sensitif gerak.
2. **Multi-Modal Learning**:
   - Pemutar video dengan dukungan subtitel tertutup WebVTT multi-bahasa.
   - Transkrip verbatim teks lengkap yang terhubung dengan audio/video.
   - Narasi suara berbasis Text-to-Speech (TTS) terintegrasi pada setiap materi dan pertanyaan kuis.
3. **Akomodasi Waktu Asesmen Pendidikan Khusus**:
   - Perhitungan perpanjangan durasi kuis (1.5x, 2.0x, 3.0x) secara otomatis bagi peserta didik berakomodasi.
   - Antarmuka kuis bebas kecemasan (*low anxiety timer*) dengan umpan balik pedagogis penguatan kognitif.
4. **Sistem Registrasi Tertutup & Alur Persetujuan Administrator**:
   - Calon peserta didik dan instruktur mendaftar secara mandiri melalui `/register`.
   - Administrator memiliki wewenang penuh untuk menyetujui (ACC) atau menolak pendaftaran di `/admin`.
5. **Auditor Aksesibilitas Studio Pengajar**:
   - Validasi otomatis teks alternatif gambar (Alt-Text) dan ketersediaan subtitel sebelum materi dipublikasikan.

---

## 🚀 Panduan Deployment (Vercel & Neon PostgreSQL)

### 1. Persiapan Basis Data di [Neon.tech](https://neon.tech)
1. Buat proyek baru di [Neon Console](https://console.neon.tech).
2. Salin **Connection String** database PostgreSQL Anda (dengan mode `Pooled connection` / `sslmode=require`). Contoh:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### 2. Konfigurasi Environment Variables di Vercel
Tambahkan variabel lingkungan berikut pada menu **Settings -> Environment Variables** di proyek Vercel Anda:

| Key | Contoh Nilai | Deskripsi |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...@ep-xyz.neon.tech/neondb?sslmode=require` | Connection String Neon PostgreSQL |
| `NEXTAUTH_URL` | `https://inclusive-lms.vercel.app` | URL domain produksi Vercel Anda |
| `NEXTAUTH_SECRET` | *(Generate acak min. 32 karakter)* | Kunci enkripsi token sesi JWT |

### 3. Migrasi & Seeding Basis Data Awal
Jalankan perintah berikut di terminal lokal untuk mendorong skema dan data awal ke database Neon:
```bash
# Push schema tabel ke Neon PostgreSQL
npx prisma db push

# Isi data kurikulum awal & akun demo (seed)
npx prisma db seed
```

---

## 🌿 Struktur Percabangan Git (Branching Strategy)

- **`main`**: Cabang produksi utama yang terhubung langsung dengan *Production Deployment* di Vercel & Neon.
- **`development`**: Cabang pengembangan untuk pengujian fitur baru sebelum digabungkan ke `main`.

---

## 👥 Akun Demo & Uji Coba

| Akun | Peran | Email | Kata Sandi | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator Utama** | `ADMIN` | `admin@accessilearn.edu` | `password123` | `APPROVED` *(Akses Penuh & Panel ACC)* |
| **Dr. Maya Lin, M.Pd.** | `INSTRUCTOR` | `maya.lin@accessilearn.edu` | `password123` | `APPROVED` *(Studio Pengajar)* |
| **Jordan Pratama** | `STUDENT` | `jordan.pratama@accessilearn.edu` | `password123` | `APPROVED` *(Siswa Akomodasi Waktu 1.5x)* |
| **Alex Wijaya** | `STUDENT` | `alex.wijaya@accessilearn.edu` | `password123` | `APPROVED` *(Siswa Standar)* |
| **Rizky Kurniawan, S.Pd.** | `INSTRUCTOR` | `rizky.kurniawan@sekolahluarbiasa.sch.id` | `password123` | `PENDING` *(Sampel Uji ACC Admin)* |

---

## 💻 Menjalankan Secara Lokal

```bash
# 1. Clone repository
git clone https://github.com/anasysuf/inclusive-lms.git
cd inclusive-lms

# 2. Install dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada peramban Anda.
