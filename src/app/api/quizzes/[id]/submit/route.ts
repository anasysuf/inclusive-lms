import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { answers, timeSpent, extendedTimeUsed, userId } = body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { lesson: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const questions = JSON.parse(quiz.questions);
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
        userAnswerText: q.options[userAnswerIndex] ?? 'No answer selected',
        correctAnswerIndex: q.correctIndex,
        correctAnswerText: q.options[q.correctIndex],
        isCorrect,
        explanation: q.explanation || 'Review the lesson materials for further context.',
      });
    }

    // Resolve or find demo user
    let userToUseId = userId;
    if (!userToUseId) {
      const demoStudent = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
      });
      userToUseId = demoStudent?.id;
    }

    let submissionRecord = null;
    if (userToUseId) {
      submissionRecord = await prisma.quizSubmission.create({
        data: {
          quizId: quiz.id,
          userId: userToUseId,
          score: correctCount,
          totalQuestions: questions.length,
          timeSpent: timeSpent || 0,
          extendedTimeUsed: Boolean(extendedTimeUsed),
          answersJson: JSON.stringify(answers),
        },
      });
    }

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    return NextResponse.json({
      success: true,
      score: correctCount,
      totalQuestions: questions.length,
      percentage: scorePercentage,
      passed: scorePercentage >= 60,
      timeSpent,
      extendedTimeUsed,
      feedbackDetails,
      submissionId: submissionRecord?.id,
    });
  } catch (error) {
    console.error('Error grading quiz submission:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
