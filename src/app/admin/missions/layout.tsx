import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Gestion des missions' };

export default function Layout({ children }: PropsWithChildren) {
  return children;
}
