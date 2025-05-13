import prisma from '@/prisma';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const branch = await prisma.branch.findUnique({ where: { id } });

  if (!branch) {
    return notFound();
  }

  return (
    <div>
      <h1>{branch.name}</h1>
    </div>
  );
}
