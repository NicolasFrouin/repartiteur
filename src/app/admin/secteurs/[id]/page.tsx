import { auth } from '@/auth';
import SectorDetails from '@/components/bsm/sector/SectorDetails';
import prisma from '@/lib/prisma';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const sector = await prisma.sector.findUnique({ where: { id } });

  if (!sector) {
    return {
      title: 'Secteur introuvable',
      description: 'Aucun secteur trouvé avec cet identifiant.',
    };
  }

  return {
    title: `Détails du secteur - ${sector.name}`,
    description: `Informations sur le secteur ${sector.name}`,
  };
}

export default async function Page({ params }: Props) {
  const session = await auth();

  const { id } = await params;
  const sector = await prisma.sector.findUnique({
    where: { id },
    include: { missions: true, branch: true },
  });

  if (!sector) {
    return notFound();
  }

  return (
    <Box>
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Anchor component={Link} href={'/admin/secteurs'}>
            Secteurs
          </Anchor>
          <Text>Détails du secteur</Text>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <SectorDetails sector={sector} userId={session!.user.id} />
      </Box>
    </Box>
  );
}
