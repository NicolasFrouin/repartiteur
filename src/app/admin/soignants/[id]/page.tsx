import CaregiverDetails from '@/components/caregiver/CaregiverDetails';
import prisma from '@/lib/prisma';
import { Box } from '@mantine/core';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const caregiver = await prisma.caregiver.findUnique({ where: { id } });

  if (!caregiver) {
    return {
      title: 'Soignant introuvable',
      description: 'Aucun soignant trouvé avec cet identifiant.',
    };
  }

  return {
    title: `Détails du soignant - ${[caregiver.firstname, caregiver.lastname].join(' ')}`,
    description: `Informations sur le soignant ${[caregiver.firstname, caregiver.lastname].join(' ')}`,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const caregiver = await prisma.caregiver.findUnique({ where: { id }, include: { branch: true } });

  if (!caregiver) {
    return notFound();
  }

  return (
    <Box className='md:px-[20%]'>
      <CaregiverDetails caregiver={caregiver} />
    </Box>
  );
}
