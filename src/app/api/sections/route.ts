import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getPlaylistItems, getYouTubeVideoDetails } from '@/lib/youtube';

// GET /api/sections?courseId=xxx  
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

    const sections = await prisma.section.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: { lessons: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

// POST /api/sections - create section with lessons
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, title, order, lessons, playlistId } = body;

    if (!courseId || !title) {
      return NextResponse.json({ error: 'courseId and title required' }, { status: 400 });
    }

    let lessonData = lessons || [];

    // If playlistId is provided, import from YouTube
    if (playlistId) {
      const playlistItems = await getPlaylistItems(playlistId);
      lessonData = await Promise.all(
        playlistItems.map(async (item, idx) => {
          const details = await getYouTubeVideoDetails(item.videoId);
          return {
            title: item.title,
            youtubeUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
            youtubeId: item.videoId,
            thumbnail: item.thumbnail,
            duration: details?.duration || '',
            order: idx + 1,
            description: item.description,
          };
        })
      );
    }

    const section = await prisma.section.create({
      data: {
        courseId,
        title,
        order: order || 1,
        lessons: { create: lessonData },
      },
      include: { lessons: true },
    });

    // Update totalLessons count on course
    const totalCount = await prisma.lesson.count({
      where: { section: { courseId } },
    });
    await prisma.course.update({
      where: { id: courseId },
      data: { totalLessons: totalCount },
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}
