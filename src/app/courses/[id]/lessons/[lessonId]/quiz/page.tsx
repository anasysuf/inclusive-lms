import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AccessibleQuizRunner } from '@/components/quiz/AccessibleQuizRunner';

export const dynamic = 'force-dynamic';

export default async function LessonQuizPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      quizzes: {
        take: 1,
      },
    },
  });

  if (!lesson || lesson.quizzes.length === 0) {
    notFound();
  }

  const quiz = lesson.quizzes[0];

  return (
    <AccessibleQuizRunner
      quiz={quiz}
      lessonId={params.lessonId}
      courseId={params.id}
    />
  );
}
