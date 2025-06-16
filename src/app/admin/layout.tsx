import { auth } from '@/auth';
import NotAuthorized from '@/components/error/NotAuthorized';
import { Role } from '@/generated/client';
import { canAccess } from '@/lib/utils/auth';
import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Administration' };

export default async function Layout({ children }: PropsWithChildren) {
  const session = await auth();

  if (!canAccess(session?.user?.role, Role.ADMIN)) {
    return <NotAuthorized />;
  }

  return children;
}
