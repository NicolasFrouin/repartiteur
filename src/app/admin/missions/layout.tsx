import { auth } from '@/auth';
import { Role } from '@/generated/client';
import { canAccess } from '@/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Gestion des missions' };

export default async function Layout({ children }: PropsWithChildren) {
  const session = await auth();

  if (!canAccess(session?.user?.role, Role.ADMIN)) {
    return notFound();
  }

  return children;
}
