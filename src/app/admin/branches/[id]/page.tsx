import BranchDetails from '@/components/bsm/branch/BranchDetails';
import prisma from '@/lib/prisma';
import { Box } from '@mantine/core';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const branch = await prisma.branch.findUnique({ where: { id }, include: { sectors: true } });

  if (!branch) {
    return notFound();
  }

  return (
    <Box className='md:px-[20%]'>
      <BranchDetails branch={branch} />
    </Box>
  );
}
