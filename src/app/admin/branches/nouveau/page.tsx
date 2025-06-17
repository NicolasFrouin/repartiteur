import { auth } from '@/auth';
import BranchDetails from '@/components/bsm/branch/BranchDetails';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nouvelle branche',
  description: 'Créer une nouvelle branche',
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
          <Anchor component={Link} href={'/admin/branches'}>
            Branches
          </Anchor>
          <Text>Nouvelle branche</Text>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <BranchDetails userId={session!.user.id} />
      </Box>
    </Box>
  );
}
