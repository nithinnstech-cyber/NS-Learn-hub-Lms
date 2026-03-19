import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import Navbar from '@/components/Navbar';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Dashboard – LearnHub',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <>
      <Navbar user={{ name: session.name, email: session.email, role: session.role }} />
      <DashboardClient session={{ name: session.name, role: session.role }} />
    </>
  );
}
