import NotFound from '@/components/error/NotFound';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: "La page que vous recherchez n'existe pas ou a été déplacée.",
};

export default function NotFoundPage() {
  return <NotFound />;
}
