import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Hak Akses Ditolak: Hanya akun Instruktur yang diizinkan menambahkan modul pelajaran.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, summary, content, videoUrl, captionsUrl, audioUrl, hasTranscript, transcript, quiz } = body;

    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { error: 'Judul pelajaran harus minimal 3 karakter.' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Catatan instruksional materi pelajaran wajib diisi.' },
        { status: 400 }
      );
    }

    // Tentukan urutan pelajaran
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId: params.id },
      orderBy: { order: 'desc' },
    });
    const order = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await prisma.lesson.create({
      data: {
        courseId: params.id,
        order,
        title: title.trim(),
        summary: summary ? summary.trim() : null,
        content: content.trim(),
        videoUrl: videoUrl ? videoUrl.trim() : null,
        captionsUrl: captionsUrl ? captionsUrl.trim() : null,
        audioUrl: audioUrl ? audioUrl.trim() : null,
        hasTranscript: hasTranscript !== undefined ? hasTranscript : true,
        transcript: transcript ? transcript.trim() : null,
        ...(quiz && quiz.questions && quiz.questions.length > 0
          ? {
              quizzes: {
                create: [
                  {
                    title: quiz.title || `Kuis Pemahaman ${title}`,
                    description: quiz.description || 'Asesmen pemahaman materi inklusif',
                    baseTimeLimit: quiz.baseTimeLimit || 300,
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
