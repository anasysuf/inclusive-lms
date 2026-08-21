import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Sesi login tidak valid atau telah berakhir.' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const userEmail = session.user.email.toLowerCase().trim();

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Seluruh kolom kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Kata sandi baru harus minimal 8 karakter demi keamanan akun Anda.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Konfirmasi kata sandi baru tidak cocok.' },
        { status: 400 }
      );
    }

    // Cari pengguna berdasarkan ID atau Email dari sesi pengguna yang terotentikasi
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    }

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan dalam sistem.' }, { status: 404 });
    }

    // Verifikasi kata sandi saat ini
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Kata sandi saat ini yang Anda masukkan salah.' },
        { status: 400 }
      );
    }

    // Cegah penggunaan kata sandi baru yang sama dengan yang lama
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.' },
        { status: 400 }
      );
    }

    // Enkripsi kata sandi baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Kata sandi Anda berhasil diperbarui!',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memperbarui kata sandi.' },
      { status: 500 }
    );
  }
}
