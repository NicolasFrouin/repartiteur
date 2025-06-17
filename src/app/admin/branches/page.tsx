import BranchTable from '@/components/bsm/branch/BranchTable';
import { Anchor, Box, Breadcrumbs, Group, Text } from '@mantine/core';
import Link from 'next/link';

export default function Page() {
  return (
    <Box>
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Text>Branches</Text>
        </Breadcrumbs>
        {/* <Button
          component={Link}
          href={'/admin/branches/nouveau'}
          variant='outline'
          color='blue'
        >
          Créer une branche
        </Button> */}
      </Group>
      <BranchTable />
    </Box>
  );
}
