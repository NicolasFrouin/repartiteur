import UserTable from '@/components/user/UserTable';
import { Anchor, Box, Breadcrumbs, Button, Group, Text } from '@mantine/core';
import Link from 'next/link';

export default function Page() {
  return (
    <Box>
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Text>Utilisateurs</Text>
        </Breadcrumbs>
        <Button
          component={Link}
          href={'/admin/utilisateurs/nouveau'}
          variant='outline'
          color='blue'
        >
          Créer un utilisateur
        </Button>
      </Group>
      <UserTable />
    </Box>
  );
}
