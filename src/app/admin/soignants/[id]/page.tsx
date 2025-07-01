import { auth } from '@/auth';
import CaregiverDetails from '@/components/caregiver/CaregiverDetails';
import prisma from '@/lib/prisma';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import Link from 'next/link';
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
  const session = await auth();

  const { id } = await params;
  const caregiver = await prisma.caregiver.findUnique({
    where: { id },
    include: { branch: true, assignedSectors: true },
  });

  if (!caregiver) {
    return notFound();
  }

  return (
    <Box>
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Anchor component={Link} href={'/admin/soignants'}>
            Soignants
          </Anchor>
          <Text>Détails du soignant</Text>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <CaregiverDetails caregiver={caregiver} userId={session!.user.id} />
      </Box>
    </Box>
  );
}
