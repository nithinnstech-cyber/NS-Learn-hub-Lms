import { getSession } from '@/lib/session';
import Navbar from '@/components/Navbar';

export default async function CoursesLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session ? { name: session.name, email: session.email, role: session.role } : null;

  return (
    <>
      <Navbar user={user} />
      {children}
    </>
  );
}
