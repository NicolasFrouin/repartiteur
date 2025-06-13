import { Anchor, Box, Text, Title } from '@mantine/core';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box className='flex flex-1 flex-col items-center justify-center text-center text-gray-800'>
      <Title size={60}>404</Title>
      <Title order={2} mt={16}>
        Page introuvable
      </Title>
      <Text mt={8} mb={24} size={'lg'}>
        Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
      </Text>
      <Anchor
        component={Link}
        href='/'
        className='rounded bg-blue-500 px-6 py-3 text-white transition hover:bg-blue-600'
      >
        Retour à l&apos;accueil
      </Anchor>
    </Box>
  );
}
