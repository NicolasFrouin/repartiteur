import MissionTable from '@/components/bsm/mission/MissionTable';
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
          <Text>Missions</Text>
        </Breadcrumbs>
        <Button component={Link} href={'/admin/missions/nouveau'} variant='outline' color='blue'>
          Créer une mission
        </Button>
      </Group>
      <MissionTable />
    </Box>
  );
}
