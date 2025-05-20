import MissionDetails from '@/components/bsm/mission/MissionDetails';
import prisma from '@/lib/prisma';
import { FullMission } from '@/types/utils';
import { Box } from '@mantine/core';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const mission: FullMission | null = await prisma.mission.findUnique({
    where: { id },
    include: { sector: { include: { branch: true } } },
  });

  if (!mission) {
    return notFound();
  }

  return (
    <Box className='md:px-[20%]'>
      <MissionDetails mission={mission} />
    </Box>
  );
}
