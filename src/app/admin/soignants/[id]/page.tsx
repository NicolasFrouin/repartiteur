import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const caregiver = await prisma.caregiver.findUnique({ where: { id }, include: { branch: true } });

  if (!caregiver) {
    return notFound();
  }

  return (
    <div>
      <h1>{[caregiver.firstname, caregiver.lastname].join(' ')}</h1>
    </div>
  );
}
