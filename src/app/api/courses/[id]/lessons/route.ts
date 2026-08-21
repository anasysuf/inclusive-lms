import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeHtml, sanitizePlainText } from '@/lib/sanitize';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (!session || (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Hak Akses Ditolak: Hanya akun Instruktur yang diizinkan menambahkan modul pelajaran.' },
        { status: 403 }
      );
    }

    // Cek apakah kursus ada dan verifikasi kepemilikan kursus
    const course = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!course) {
      return NextResponse.json({ error: 'Kursus tidak ditemukan' }, { status: 404 });
    }

    if (userRole !== 'ADMIN' && course.instructorId !== userId) {
      return NextResponse.json(
        { error: 'Hak Akses Ditolak: Anda hanya dapat menambahkan pelajaran pada kursus yang Anda ampu.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, summary, content, videoUrl, captionsUrl, audioUrl, hasTranscript, transcript, quiz } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json(
        { error: 'Judul pelajaran harus berupa teks valid minimal 3 karakter.' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Catatan instruksional materi pelajaran wajib diisi (minimal 10 karakter).' },
        { status: 400 }
      );
    }

    // Sanitasi konten pelajaran untuk mencegah XSS
    const cleanContent = sanitizeHtml(content);
    const cleanTranscript = transcript ? sanitizePlainText(transcript) : null;
    const cleanTitle = sanitizePlainText(title);
    const cleanSummary = summary ? sanitizePlainText(summary) : null;

    // Tentukan urutan pelajaran
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId: params.id },
      orderBy: { order: 'desc' },
    });
    const order = lastLesson ? lastLesson.order + 1 : 1;

    // Sanitasi URL media jika ada
    const safeVideoUrl = videoUrl && typeof videoUrl === 'string' && (videoUrl.startsWith('http://') || videoUrl.startsWith('https://') || videoUrl.startsWith('/')) ? videoUrl.trim() : null;
    const safeCaptionsUrl = captionsUrl && typeof captionsUrl === 'string' && (captionsUrl.startsWith('http://') || captionsUrl.startsWith('https://') || captionsUrl.startsWith('/')) ? captionsUrl.trim() : null;
    const safeAudioUrl = audioUrl && typeof audioUrl === 'string' && (audioUrl.startsWith('http://') || audioUrl.startsWith('https://') || audioUrl.startsWith('/')) ? audioUrl.trim() : null;

    const lesson = await prisma.lesson.create({
      data: {
        courseId: params.id,
        order,
        title: cleanTitle,
        summary: cleanSummary,
        content: cleanContent,
        videoUrl: safeVideoUrl,
        captionsUrl: safeCaptionsUrl,
        audioUrl: safeAudioUrl,
        hasTranscript: hasTranscript !== undefined ? Boolean(hasTranscript) : true,
        transcript: cleanTranscript,
        ...(quiz && quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0
          ? {
              quizzes: {
                create: [
                  {
                    title: sanitizePlainText(quiz.title || `Kuis Pemahaman ${cleanTitle}`),
                    description: sanitizePlainText(quiz.description || 'Asesmen pemahaman materi inklusif'),
                    baseTimeLimit: typeof quiz.baseTimeLimit === 'number' && quiz.baseTimeLimit > 0 ? Math.min(quiz.baseTimeLimit, 3600) : 300,
                    questions: JSON.stringify(quiz.questions),
                  },
                ],
              },
            }
          : {}),
      },
      include: {
        quizzes: true,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Gagal membuat modul pelajaran' }, { status: 500 });
  }
}
