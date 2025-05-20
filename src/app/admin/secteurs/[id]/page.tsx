import SectorDetails from '@/components/bsm/sector/SectorDetails';
import prisma from '@/lib/prisma';
import { Box } from '@mantine/core';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const sector = await prisma.sector.findUnique({
    where: { id },
    include: { missions: true, branch: true },
  });

  if (!sector) {
    return notFound();
  }

  return (
    <Box className='md:px-[20%]'>
      <SectorDetails sector={sector} />
    </Box>
  );
}
