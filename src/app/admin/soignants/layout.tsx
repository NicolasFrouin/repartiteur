import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Gestion des soignants' };

export default function Layout({ children }: PropsWithChildren) {
  return children;
}
