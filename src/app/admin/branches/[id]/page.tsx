import { auth } from '@/auth';
import BranchDetails from '@/components/bsm/branch/BranchDetails';
import { Role } from '@/generated/client';
import prisma from '@/lib/prisma';
import { canAccess } from '@/lib/utils/auth';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const branch = await prisma.branch.findUnique({ where: { id } });

  if (!branch) {
    return {
      title: 'Branche introuvable',
      description: 'Aucune branche trouvée avec cet identifiant.',
    };
  }

  return {
    title: `Détails de la branche - ${branch.name}`,
    description: `Informations sur la branche ${branch.name}`,
  };
}

export default async function Page({ params }: Props) {
  const session = await auth();

  if (!canAccess(session?.user?.role, Role.ADMIN)) {
    return notFound();
  }

  const { id } = await params;
  const branch = await prisma.branch.findUnique({ where: { id }, include: { sectors: true } });

  if (!branch) {
    return notFound();
  }

  return (
    <Box>
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Anchor component={Link} href={'/admin/branches'}>
            Branches
          </Anchor>
          <Text>Détails de la branche</Text>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <BranchDetails branch={branch} userId={session!.user.id} />
      </Box>
    </Box>
  );
}
