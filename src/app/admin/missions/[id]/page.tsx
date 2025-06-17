import { auth } from '@/auth';
import MissionDetails from '@/components/bsm/mission/MissionDetails';
import { Role } from '@/generated/client';
import prisma from '@/lib/prisma';
import { canAccess } from '@/lib/utils/auth';
import { FullMission } from '@/types/utils';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const session = await auth();

  if (!canAccess(session?.user?.role, Role.ADMIN)) {
    return notFound();
  }

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
