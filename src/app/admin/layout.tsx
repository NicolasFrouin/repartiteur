import { auth } from '@/auth';
import NotAuthorized from '@/components/error/NotAuthorized';
import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Administration' };

export default async function Layout({ children }: PropsWithChildren) {
  const session = await auth();

  if (!session || !session.user) {
    return <NotAuthorized />;
  }

  return children;
}
