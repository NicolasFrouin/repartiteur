'use client';

import { Anchor, Box, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotAuthorized() {
  const pathname = usePathname();

  return (
    <Box className='flex flex-1 flex-col items-center justify-center text-center text-gray-800'>
      <Title size={60}>403</Title>
      <Title order={2} mt={16}>
        Accès refusé
      </Title>
      <Text mt={8} mb={24} size={'lg'}>
        Désolé, vous n&apos;avez pas l&apos;autorisation d&apos;accéder à cette page.
      </Text>
      <Anchor
        component={Link}
        href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
        className='rounded bg-blue-500 px-6 py-3 text-white transition hover:bg-blue-600'
      >
        Aller à la page de connexion
      </Anchor>
    </Box>
  );
}
