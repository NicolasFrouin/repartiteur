'use client';

import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Nav from './Nav';
import { HEADER_HEIGHT } from '@/utils/constants';
import Link from 'next/link';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props extends React.PropsWithChildren {}

export default function Shell({ children }: Props) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
      navbar={{ width: 2, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
      padding={'md'}
      styles={{ root: { '--header-height': `${HEADER_HEIGHT}px` } }}
    >
      <AppShell.Header>
        <Group
          h={'100%'}
          px={'md'}
        >
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom={'sm'}
            size={'sm'}
          />
          <Group
            justify={'space-between'}
            align={'center'}
            style={{ flex: 1 }}
          >
            <Link href={'/'}>
              <div>Logo</div>
            </Link>
            <Group
              ml={'xl'}
              gap={0}
              visibleFrom={'sm'}
            >
              <Nav />
            </Group>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar
        py={'md'}
        px={4}
        w={'100vw'}
        hiddenFrom={'sm'}
      >
        <Nav />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
