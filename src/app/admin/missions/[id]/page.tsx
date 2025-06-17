import { auth } from '@/auth';
import MissionDetails from '@/components/bsm/mission/MissionDetails';
import prisma from '@/lib/prisma';
import { FullMission } from '@/types/utils';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const mission = await prisma.mission.findUnique({ where: { id } });

  if (!mission) {
    return {
      title: 'Mission introuvable',
      description: 'Aucune mission trouvée avec cet identifiant.',
    };
  }

  return {
    title: `Détails de la mission - ${mission.name}`,
    description: `Informations sur la mission ${mission.name}`,
  };
}

export default async function Page({ params }: Props) {
  const session = await auth();

  const { id } = await params;
  const mission: FullMission | null = await prisma.mission.findUnique({
    where: { id },
    include: { sector: { include: { branch: true } } },
  });

  if (!mission) {
    return notFound();
  }

  return (
    <Box>
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Anchor component={Link} href={'/admin/missions'}>
            Missions
          </Anchor>
          <Text>Détails de la mission</Text>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <MissionDetails mission={mission} userId={session!.user.id} />
      </Box>
    </Box>
  );
}
