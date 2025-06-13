import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Planificateur' };

export default function Layout({ children }: React.PropsWithChildren) {
  return children;
}
