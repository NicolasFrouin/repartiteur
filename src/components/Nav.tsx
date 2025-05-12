import { Button, Flex } from '@mantine/core';
import Link from 'next/link';

export default function Nav() {
  return (
    <Flex className={'flex-col gap-4 px-4 md:flex-row'}>
      <Button component={Link} href={'/planificateur'} variant={'light'}>
        Planificateur
      </Button>
      <Button component={Link} href={'/admin/soignants'} variant={'light'}>
        Soignants
      </Button>
    </Flex>
  );
}
