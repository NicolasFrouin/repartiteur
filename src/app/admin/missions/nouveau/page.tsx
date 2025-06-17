import { auth } from '@/auth';
import MissionDetails from '@/components/bsm/mission/MissionDetails';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nouvelle mission',
  description: 'Créer une nouvelle mission',
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
          <Anchor component={Link} href={'/admin/missions'}>
            Missions
          </Anchor>
          <Text>Nouvelle mission</Text>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <MissionDetails userId={session!.user.id} />
      </Box>
    </Box>
  );
}
