import { auth } from '@/auth';
import UserDetails from '@/components/user/UserDetails';
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
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return {
      title: 'Soignant introuvable',
      description: 'Aucun soignant trouvé avec cet identifiant.',
    };
  }

  return {
    title: `Détails du soignant - ${user.name}`,
    description: `Informations sur le soignant ${user.name}`,
  };
}

export default async function Page({ params }: Props) {
  const session = await auth();

  if (!canAccess(session?.user.role, Role.SUPERADMIN)) {
    return notFound();
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
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
          <Text>Détails de l&apos;utilisateur</Text>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <UserDetails user={user} userId={session!.user.id} />
      </Box>
    </Box>
  );
}
