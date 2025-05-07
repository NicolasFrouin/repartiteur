import { Button } from '@mantine/core';
import Link from 'next/link';

export default function Nav() {
  return (
    <>
      <Button component={Link} href={'/admin/soignants'} variant={'light'}>
        Soignants
      </Button>
    </>
  );
}
