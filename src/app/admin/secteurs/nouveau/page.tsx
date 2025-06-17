import { auth } from '@/auth';
import SectorDetails from '@/components/bsm/sector/SectorDetails';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nouveau secteur',
  description: 'Créer un nouveau secteur',
};

export default async function Page() {
  const session = await auth();

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
          <Text>Nouveau secteur</Text>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <SectorDetails userId={session!.user.id} />
      </Box>
    </Box>
  );
}
