import CaregiverDetails from '@/components/caregiver/CaregiverDetails';
import { Anchor, Box, Breadcrumbs, Group } from '@mantine/core';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nouveau soignant',
  description: 'Créer un nouveau soignant',
};

export default function Page() {
  return (
    <Box>
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Anchor component={Link} href={'/admin/soignants'}>
            Soignants
          </Anchor>
          <Anchor component={Link} href={'/admin/soignants/nouveau'}>
            Nouveau soignant
          </Anchor>
        </Breadcrumbs>
      </Group>
      <Box className='md:px-[20%]'>
        <CaregiverDetails />
      </Box>
    </Box>
  );
}
