import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/courses - Daftar semua kursus inklusif (Wajib Login pada Sistem Tertutup)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Akses Ditolak: Anda wajib masuk ke akun terdaftar untuk melihat kurikulum.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const whereClause: any = {};
    if (category && category !== 'Semua' && category !== 'All') {
      whereClause.category = category;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
            hasTranscript: true,
            captionsUrl: true,
            videoUrl: true,
            _count: {
              select: { quizzes: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Gagal mengambil data kursus' }, { status: 500 });
  }
}

// POST /api/courses - Buat kursus baru (HANYA UNTUK INSTRUKTUR / ADMIN DENGAN ALT-TEXT KETAT)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Hak Akses Dibatasi: Hanya akun Instruktur / Guru PLB yang diizinkan membuat kursus.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, difficulty, coverImageUrl, coverImageAlt } = body;

    // Validasi Aksesibilitas: Judul dan Deskripsi
    if (!title || title.trim().length < 5) {
      return NextResponse.json(
        { error: 'Judul kursus harus minimal 5 karakter untuk kejelasan identifikasi kognitif.' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 20) {
      return NextResponse.json(
        { error: 'Deskripsi kursus harus minimal 20 karakter untuk menginformasikan tujuan pembelajaran pada pengguna pembaca layar.' },
        { status: 400 }
      );
    }

    // PENEGAKAN ALT-TEXT KETAT (WCAG 1.1.1 Konten Non-Teks)
    if (coverImageUrl && coverImageUrl.trim()) {
      if (!coverImageAlt || coverImageAlt.trim().length < 8) {
        return NextResponse.json(
          {
            error:
              'Pelanggaran Aksesibilitas: Teks alternatif (alt-text) gambar sampul harus deskriptif dan minimal 8 karakter.',
          },
          { status: 400 }
        );
      }

      const lowerAlt = coverImageAlt.trim().toLowerCase();
      const forbiddenGeneric = [
        'gambar',
        'foto',
        'lukisan',
        'skrinsot',
        'tangkapan layar',
        'file',
        'berkas',
        'image',
        'photo',
        'picture',
        'screenshot',
        'icon',
        'graphic',
        'img',
      ];
      if (
        forbiddenGeneric.includes(lowerAlt) ||
        forbiddenGeneric.some((f) => lowerAlt === `sebuah ${f}` || lowerAlt === `suatu ${f}` || lowerAlt === `a ${f}` || lowerAlt === `an ${f}`)
      ) {
        return NextResponse.json(
          {
            error:
              'Pelanggaran Aksesibilitas: Alt-text tidak boleh berupa kata generik seperti "gambar" atau "foto". Mohon deskripsikan isi visual materi untuk peserta didik tunanetra.',
          },
          { status: 400 }
        );
      }
    }

    const instructorId = (session.user as any).id;

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category || 'Pendidikan Luar Biasa & Pedagogi',
        difficulty: difficulty || 'Semua Tingkatan',
        coverImageUrl: coverImageUrl || null,
        coverImageAlt: coverImageAlt ? coverImageAlt.trim() : 'Ilustrasi materi pembelajaran',
        instructorId,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Gagal membuat kursus baru' }, { status: 500 });
  }
}
