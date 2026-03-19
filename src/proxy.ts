import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

const publicRoutes = ['/login', '/register'];
const authRoutes = ['/login', '/register'];
const instructorRoutes = ['/instructor'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isPublic = publicRoutes.some((r) => path === r);
  const isAuth = authRoutes.includes(path);
  const isInstructor = instructorRoutes.some((r) => path.startsWith(r));

  const sessionCookie = req.cookies.get('session')?.value;
  const session = await decrypt(sessionCookie);

  // Redirect authenticated users away from auth/landing pages
  if ((isAuth || path === '/') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Protect non-public routes
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL(`/login?redirect=${path}`, req.url));
  }

  // Instructor-only routes
  if (isInstructor && session && session.role === 'STUDENT') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
