'use client';

import { HEADER_HEIGHT } from '@/lib/utils';
import {
  ActionIcon,
  Affix,
  AppShell,
  AspectRatio,
  Burger,
  Group,
  Transition,
  VisuallyHidden,
} from '@mantine/core';
import { useDisclosure, useWindowScroll } from '@mantine/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowUp } from 'react-icons/fa6';
import Nav from './Nav';
import { Session } from 'next-auth';

interface Props extends React.PropsWithChildren {
  session: Session | null;
}

export default function Shell({ session, children }: Props) {
  const [opened, { toggle, close }] = useDisclosure();
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
      navbar={{ width: 2, breakpoint: 'md', collapsed: { desktop: true, mobile: !opened } }}
      padding={'md'}
      styles={{ root: { '--header-height': `${HEADER_HEIGHT}px` } }}
    >
      <AppShell.Header>
        <Group h={'100%'} px={'md'}>
          <Burger opened={opened} onClick={toggle} hiddenFrom={'md'} size={'sm'} />
          <Group
            align={'center'}
            style={{ flex: 1 }}
            className={'!justify-center lg:!justify-between'}
          >
            <Link href={'/'} className={'flex items-center'}>
              <AspectRatio ratio={815 / 161}>
                <Image
                  src={'/logo/logo_aphp.png'}
                  alt={'Logo APHP'}
                  width={815}
                  height={161}
                  className='h-12'
                  priority
                />
              </AspectRatio>
            </Link>
            <Group ml={'xl'} gap={0} visibleFrom={'md'}>
              <Nav session={session} close={close} />
            </Group>
          </Group>
          <div className='w-7 lg:hidden' />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar py={'md'} px={4} w={'100vw'} hiddenFrom={'md'}>
        <Nav session={session} close={close} mobile />
      </AppShell.Navbar>
      <AppShell.Main className='flex flex-col'>
        {children}
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition='slide-up' mounted={scroll.y > 0}>
            {(transitionStyles) => (
              <ActionIcon
                style={transitionStyles}
                onClick={() => scrollTo({ y: 0 })}
                className={'!rounded-full'}
                size={48}
              >
                <VisuallyHidden>Retour en haut</VisuallyHidden>
                <FaArrowUp size={24} />
              </ActionIcon>
            )}
          </Transition>
        </Affix>
      </AppShell.Main>
    </AppShell>
  );
}
