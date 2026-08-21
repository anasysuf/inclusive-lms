import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/lessons/[id] - Ambil detail pelajaran (Wajib Login)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Akses Ditolak: Anda wajib login untuk mengakses modul pelajaran.' },
        { status: 401 }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: {
        course: {
          include: {
            lessons: {
              select: { id: true, title: true, order: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        quizzes: {
          include: {
            submissions: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Pelajaran tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pelajaran' }, { status: 500 });
  }
}

// DELETE /api/lessons/[id] - Hapus pelajaran (HANYA ADMIN ATAU INSTRUKTUR PEMILIK KURSUS)
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

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: { course: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Pelajaran tidak ditemukan' }, { status: 404 });
    }

    if (userRole !== 'ADMIN' && lesson.course.instructorId !== userId) {
      return NextResponse.json(
        { error: 'Akses Ditolak: Anda tidak memiliki izin untuk menghapus modul pelajaran ini.' },
        { status: 403 }
      );
    }

    await prisma.lesson.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Modul pelajaran berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Gagal menghapus modul pelajaran' }, { status: 500 });
  }
}
