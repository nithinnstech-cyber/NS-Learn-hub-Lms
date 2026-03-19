require('dotenv').config({ path: '.env.local' });
require('@swc/register'); // or similar? wait, it's a TS file... Let me just create it via Next.js directly. Actually, I won't use seed-dummy.js since Next/TS requires compilation.

async function seed() {
  try {
    // Check if we have an artificial instructor
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

    // Check if courses exist
    const count = await prisma.course.count();
    if (count === 0) {
      await prisma.course.create({
        data: {
          title: 'Advanced Glassmorphism UI/UX',
          description: 'Learn how to build stunning, futuristic, and highly polished glossy interfaces.',
          category: 'CSS',
          level: 'ADVANCED',
          isPublished: true,
          instructorId: instructor.id,
        }
      });

      await prisma.course.create({
        data: {
          title: 'Next.js 16 Mastery',
          description: 'Master the latest features of Next.js, including Turbopack, App Router, and dynamic routing.',
          category: 'React',
          level: 'INTERMEDIATE',
          isPublished: true,
          instructorId: instructor.id,
        }
      });
      console.log('Seed successful! Added 2 mock courses to the database.');
    } else {
      console.log('Database already has courses.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
