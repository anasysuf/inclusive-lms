import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/registrations/[id] - Setujui (APPROVE) atau Tolak (REJECT) pendaftaran
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses Ditolak: Hanya Administrator yang berhak menyetujui pendaftaran.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, role, requiresExtendedTime, timeMultiplier } = body;

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json({ error: 'Aksi harus berupa APPROVE atau REJECT.' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          ...(role ? { role } : {}),
          ...(requiresExtendedTime !== undefined ? { requiresExtendedTime: Boolean(requiresExtendedTime) } : {}),
          ...(timeMultiplier !== undefined ? { timeMultiplier: Number(timeMultiplier) } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Pendaftaran ${updatedUser.name} berhasil disetujui!`,
        user: updatedUser,
      });
    } else {
      // REJECT
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: { status: 'REJECTED' },
      });

      return NextResponse.json({
        success: true,
        message: `Pendaftaran ${updatedUser.name} telah ditolak.`,
        user: updatedUser,
      });
    }
  } catch (error) {
    console.error('Error processing registration action:', error);
    return NextResponse.json(
      { error: 'Gagal memproses permohonan pendaftaran.' },
      { status: 500 }
    );
  }
}
