import { auth } from '@/auth';
import UserDetails from '@/components/user/UserDetails';
import { Role } from '@/generated/client';
import { canAccess } from '@/lib/utils/auth';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Nouvel utilisateur',
  description: 'Créer un nouvel utilisateur',
};

export default async function Page() {
  const session = await auth();

  if (!canAccess(session?.user?.role, Role.SUPERADMIN)) {
    return notFound();
  }

  return (
    <Box>
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Anchor component={Link} href={'/admin/utilisateurs'}>
            Utilisateurs
          </Anchor>
          <Text>Nouvel utilisateur</Text>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <UserDetails userId={session!.user.id} />
      </Box>
    </Box>
  );
}
