import SectorTable from '@/components/bsm/sector/SectorTable';
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
          <Text>Secteurs</Text>
        </Breadcrumbs>
        <Button component={Link} href={'/admin/secteurs/nouveau'} variant='outline' color='blue'>
          Créer un secteur
        </Button>
      </Group>
      <SectorTable />
    </Box>
  );
}
