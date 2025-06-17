import { auth } from '@/auth';
import { Role } from '@/generated/client';
import { canAccess } from '@/lib/utils/auth';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = { title: 'Planificateur' };

export default async function Layout({ children }: React.PropsWithChildren) {
  const session = await auth();

  if (!canAccess(session?.user?.role, Role.ADMIN)) {
    return notFound();
  }

  return children;
}
