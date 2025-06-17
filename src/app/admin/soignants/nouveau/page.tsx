import { auth } from '@/auth';
import CaregiverDetails from '@/components/caregiver/CaregiverDetails';
import { Role } from '@/generated/client';
import { canAccess } from '@/lib/utils/auth';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Nouveau soignant',
  description: 'Créer un nouveau soignant',
};

export default async function Page() {
  const session = await auth();

  if (!canAccess(session?.user?.role, Role.ADMIN)) {
    return notFound();
  }

  return (
    <Box>
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Anchor component={Link} href={'/admin/soignants'}>
            Soignants
          </Anchor>
          <Text>Nouveau soignant</Text>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <CaregiverDetails userId={session!.user.id} />
      </Box>
    </Box>
  );
}
