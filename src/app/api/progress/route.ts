import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// POST /api/progress - mark lesson as completed
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId, courseId } = await req.json();
    if (!lessonId || !courseId) {
      return NextResponse.json({ error: 'lessonId and courseId required' }, { status: 400 });
    }

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId: session.userId, lessonId } },
      create: { userId: session.userId, lessonId, courseId },
      update: { completedAt: new Date() },
    });

    // Calculate new course completion %
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId } },
    });
    const completedLessons = await prisma.progress.count({
      where: { userId: session.userId, courseId },
    });
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return NextResponse.json({ progress, percentage, completedLessons, totalLessons });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}

// GET /api/progress?courseId=xxx - get progress for a course
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 });
    }

    const completedLessons = await prisma.progress.findMany({
      where: { userId: session.userId, courseId },
    });
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId } },
    });

    const percentage = totalLessons > 0
      ? Math.round((completedLessons.length / totalLessons) * 100)
      : 0;

    return NextResponse.json({
      completedLessonIds:    completedLessons.map((p: { lessonId: string }) => p.lessonId),
      completedCount: completedLessons.length,
      totalLessons,
      percentage,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
