import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import Navbar from '@/components/Navbar';
import InstructorClient from './InstructorClient';

export const metadata = {
  title: 'Instructor Panel – LearnHub',
};

export default async function InstructorPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role === 'STUDENT') redirect('/dashboard');

  return (
    <>
      <Navbar user={{ name: session.name, email: session.email, role: session.role }} />
      <InstructorClient />
    </>
  );
}
