import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/users/[id] - Perbarui peran, akomodasi, atau kata sandi pengguna
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses Ditolak: Hanya Administrator yang berhak mengubah data pengguna.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, role, requiresExtendedTime, timeMultiplier, password } = body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name.trim();
    if (role) dataToUpdate.role = role;
    if (requiresExtendedTime !== undefined) dataToUpdate.requiresExtendedTime = Boolean(requiresExtendedTime);
    if (timeMultiplier !== undefined) dataToUpdate.timeMultiplier = Number(timeMultiplier);
    if (password && password.trim().length >= 6) {
      dataToUpdate.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        requiresExtendedTime: true,
        timeMultiplier: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user by admin:', error);
    return NextResponse.json({ error: 'Gagal memperbarui pengguna' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Hapus pengguna (Hanya untuk ADMIN)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const currentAdminId = (session?.user as any)?.id;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses Ditolak: Hanya Administrator yang berhak menghapus pengguna.' },
        { status: 403 }
      );
    }

    // Cegah admin menghapus dirinya sendiri
    if (params.id === currentAdminId) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus akun Administrator yang sedang aktif digunakan.' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user by admin:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengguna' }, { status: 500 });
  }
}
