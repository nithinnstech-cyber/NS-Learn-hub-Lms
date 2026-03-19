import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// POST /api/enrollments - enroll in a course
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId: session.userId, courseId },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 });
  }
}

// GET /api/enrollments - get user's enrolled courses
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.userId },
      include: {
        course: {
          include: {
            instructor: { select: { name: true, avatar: true } },
            sections: {
              include: { _count: { select: { lessons: true } } },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        const totalLessons = e.course.sections.reduce((acc, s) => acc + s._count.lessons, 0);
        const completedCount = await prisma.progress.count({
          where: { userId: session.userId, courseId: e.courseId },
        });
        return {
          ...e,
          course: { ...e.course, totalLessons },
          completedLessons: completedCount,
          progress: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
        };
      })
    );

    return NextResponse.json({ enrollments: enriched });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}
