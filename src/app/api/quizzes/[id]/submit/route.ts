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
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Akses Ditolak: Anda wajib masuk untuk mengirimkan jawaban kuis.' },
        { status: 401 }
      );
    }

    const currentUserId = (session.user as any)?.id;
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Identitas sesi pengguna tidak valid.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { answers, timeSpent, extendedTimeUsed } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Format jawaban kuis tidak valid.' },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { lesson: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan' }, { status: 404 });
    }

    let questions: any[] = [];
    try {
      questions = JSON.parse(quiz.questions);
    } catch {
      return NextResponse.json({ error: 'Format soal kuis pada sistem rusak' }, { status: 500 });
    }

    let correctCount = 0;
    const feedbackDetails = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const userAnswerIndex = answers[q.id];
      const isCorrect = userAnswerIndex === q.correctIndex;
      if (isCorrect) correctCount++;

      feedbackDetails.push({
        questionId: q.id,
        question: q.question,
        userAnswerIndex,
        userAnswerText: q.options[userAnswerIndex] ?? 'Tidak ada jawaban dipilih',
        correctAnswerIndex: q.correctIndex,
        correctAnswerText: q.options[q.correctIndex],
        isCorrect,
        explanation: q.explanation || 'Tinjau kembali materi pelajaran untuk pemahaman lebih lanjut.',
      });
    }

    // Rekam penyerahan kuis dengan identitas pengguna terautentikasi (mencegah impersonasi)
    const submissionRecord = await prisma.quizSubmission.create({
      data: {
        quizId: quiz.id,
        userId: currentUserId,
        score: correctCount,
        totalQuestions: questions.length,
        timeSpent: typeof timeSpent === 'number' && timeSpent >= 0 ? Math.floor(timeSpent) : 0,
        extendedTimeUsed: Boolean(extendedTimeUsed),
        answersJson: JSON.stringify(answers),
      },
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    return NextResponse.json({
      success: true,
      score: correctCount,
      totalQuestions: questions.length,
      percentage: scorePercentage,
      passed: scorePercentage >= 60,
      timeSpent: submissionRecord.timeSpent,
      extendedTimeUsed: submissionRecord.extendedTimeUsed,
      feedbackDetails,
      submissionId: submissionRecord.id,
    });
  } catch (error) {
    console.error('Error grading quiz submission:', error);
    return NextResponse.json({ error: 'Gagal memproses penyerahan kuis' }, { status: 500 });
  }
}
