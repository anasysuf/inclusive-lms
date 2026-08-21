import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/courses/[id] - Ambil detail kursus (Wajib Login)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Akses Ditolak: Anda wajib login untuk mengakses materi kursus ini.' },
        { status: 401 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            quizzes: {
              select: { id: true, title: true, baseTimeLimit: true },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Kursus tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Gagal memuat kursus' }, { status: 500 });
  }
}

// DELETE /api/courses/[id] - Hapus kursus (HANYA ADMIN atau INSTRUKTUR PEMILIK KURSUS)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Akses Ditolak: Sesi login tidak ditemukan.' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    const course = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!course) {
      return NextResponse.json({ error: 'Kursus tidak ditemukan' }, { status: 404 });
    }

    // Hanya ADMIN atau instruktur pembuat kursus yang berhak menghapus
    if (userRole !== 'ADMIN' && course.instructorId !== userId) {
      return NextResponse.json(
        { error: 'Akses Ditolak: Anda tidak memiliki izin untuk menghapus kursus milik instruktur lain.' },
        { status: 403 }
      );
    }

    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Kursus berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Gagal menghapus kursus' }, { status: 500 });
  }
}
