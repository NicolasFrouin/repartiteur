import { auth } from '@/auth';
import { Anchor, Box, Text, Title } from '@mantine/core';
import Link from 'next/link';

export default async function Page() {
  const session = await auth();

  const adminContactEmail = process.env.NEXT_PUBLIC_ADMIN_CONTACT_EMAIL;

  return (
    <Box>
      <Title size={24}>Bonjour {session?.user.name}</Title>
      <Text>Pour le moment, cette page est vide.</Text>
      <Text>
        Si vous souhaitez ajouter du contenu, n&apos;hésitez pas{' '}
        <Anchor component={Link} target='_blank' href={`mailto:${adminContactEmail}`}>
          à le demander à un administrateur
        </Anchor>
        .
      </Text>
    </Box>
  );
}
