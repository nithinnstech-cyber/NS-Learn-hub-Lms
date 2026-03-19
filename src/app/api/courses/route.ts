import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET /api/courses - list all published courses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: { category?: string; title?: { contains: string } } = {};
    if (category && category !== 'all') where.category = category;
    if (search) where.title = { contains: search };

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, avatar: true } },
        _count: { select: { enrollments: true } },
        sections: {
          include: { _count: { select: { lessons: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = courses.map((c: any) => ({
      ...c,
      totalLessons: (c.sections as any[]).reduce((acc: number, s: any) => acc + (s._count?.lessons || 0), 0),
      enrolledCount: c._count?.enrollments || 0,
    }));

    return NextResponse.json({ courses: enriched });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST /api/courses - create a course (instructor only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, thumbnail, category, level } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        category,
        level: level || 'BEGINNER',
        instructorId: session.userId,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
