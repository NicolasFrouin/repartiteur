import CaregiverTable from '@/components/caregiver/CaregiverTable';
import { Anchor, Box, Breadcrumbs, Button, Group, Text } from '@mantine/core';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Liste des soignants',
  description: 'Liste des soignants',
};

export default function Page() {
  return (
    <Box>
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Text>Soignants</Text>
        </Breadcrumbs>
        <Button component={Link} href={'/admin/soignants/nouveau'} variant='outline' color='blue'>
          Créer un soignant
        </Button>
      </Group>
      <CaregiverTable />
    </Box>
  );
}
