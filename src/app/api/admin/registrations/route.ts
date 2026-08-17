import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/registrations - Ambil semua permohonan pendaftaran berstatus PENDING
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses Ditolak: Hanya Administrator yang berhak meninjau pendaftaran.' },
        { status: 403 }
      );
    }

    const pendingUsers = await prisma.user.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        registrationNote: true,
        requiresExtendedTime: true,
        timeMultiplier: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ error: 'Gagal memuat permohonan pendaftaran' }, { status: 500 });
  }
}
