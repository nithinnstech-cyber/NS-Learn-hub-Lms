import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchYouTubeVideos } from '@/lib/youtube';

const CATEGORIES = ['JavaScript', 'Python', 'React', 'Java', 'Machine Learning', 'Data Science', 'CSS', 'Node.js', 'TypeScript'];

export async function GET() {
  try {
    let instructor = await prisma.user.findFirst({ where: { role: 'INSTRUCTOR' } });
    if (!instructor) {
      instructor = await prisma.user.create({
        data: {
          name: 'Glossy Master',
          email: 'instructor@glossy.com',
          password: 'hashedpassword',
          role: 'INSTRUCTOR',
        }
      });
    }

    const added = [];

    // Check existing courses to avoid fetching things we already have
    for (const cat of CATEGORIES) {
      const count = await prisma.course.count({ where: { category: cat } });
      
      if (count === 0) {
        // Fetch 2 real courses from YouTube API per missing category
        const videos = await searchYouTubeVideos(`${cat} full course tutorial`, 2);
        
        for (const video of videos) {
          const existing = await prisma.course.findFirst({ where: { title: video.title } });
          if (!existing) {
            await prisma.course.create({
              data: {
                title: video.title,
                description: video.description || `An amazing ${cat} course fetched from YouTube.`,
                thumbnail: video.thumbnail,
                category: cat,
                level: 'INTERMEDIATE',
                isPublished: true,
                instructorId: instructor.id,
              }
            });
            added.push(video.title);
          }
        }
      }
    }

    if (added.length > 0) {
      return NextResponse.json({ message: `Seed successful! Added ${added.length} YouTube courses across missing categories.`, courses: added });
    }

    return NextResponse.json({ message: 'Database already has courses for all categories.' });
  } catch (error) {
    return NextResponse.json({ error: 'Seed failed', details: error }, { status: 500 });
  }
}


