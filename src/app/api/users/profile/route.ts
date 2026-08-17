import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/users/profile - Ambil data profil pengguna yang sedang login
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Belum login' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const userEmail = session.user.email.toLowerCase().trim();

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          requiresExtendedTime: true,
          timeMultiplier: true,
          preferredTheme: true,
          preferredFont: true,
          fontSizeMultiplier: true,
          enableReadingRuler: true,
          quizSubmissions: {
            include: {
              quiz: {
                select: { title: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    }

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          requiresExtendedTime: true,
          timeMultiplier: true,
          preferredTheme: true,
          preferredFont: true,
          fontSizeMultiplier: true,
          enableReadingRuler: true,
          quizSubmissions: {
            include: {
              quiz: {
                select: { title: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Gagal mengambil data profil' }, { status: 500 });
  }
}

// POST /api/users/profile - Perbarui preferensi akomodasi pengguna
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Belum login' }, { status: 401 });
    }

    const body = await request.json();
    const {
      requiresExtendedTime,
      timeMultiplier,
      preferredTheme,
      preferredFont,
      fontSizeMultiplier,
      enableReadingRuler,
    } = body;

    const userId = (session.user as any)?.id;
    const userEmail = session.user.email.toLowerCase().trim();

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(requiresExtendedTime !== undefined ? { requiresExtendedTime } : {}),
        ...(timeMultiplier !== undefined ? { timeMultiplier: Number(timeMultiplier) } : {}),
        ...(preferredTheme ? { preferredTheme } : {}),
        ...(preferredFont ? { preferredFont } : {}),
        ...(fontSizeMultiplier !== undefined ? { fontSizeMultiplier: Number(fontSizeMultiplier) } : {}),
        ...(enableReadingRuler !== undefined ? { enableReadingRuler } : {}),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Gagal memperbarui preferensi' }, { status: 500 });
  }
}
