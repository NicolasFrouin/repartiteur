import { cn } from '@/lib/utils';
import { Anchor, Flex, NavLink } from '@mantine/core';
import Link from 'next/link';

interface CommonNavLinkProps extends React.PropsWithChildren {
  label: string;
  href: string;
}

interface Props {
  close?: () => void;
}

export default function Nav({ close }: Props) {
  function CommonNavLink({ label, href, children }: CommonNavLinkProps): React.ReactElement {
    return (
      <NavLink
        onClick={close}
        renderRoot={(props) => (
          <Anchor
            {...props}
            component={Link}
            href={href}
            className={cn(props.className, '!font-bold')}
          >
            {label}
          </Anchor>
        )}
      >
        {children}
      </NavLink>
    );
  }

  return (
    <>
      <Flex className={'flex-col gap-4 px-4 md:flex-row'}>
        <CommonNavLink href={'/planificateur'} label={'Planificateur'} />
        <CommonNavLink href={'/admin/soignants'} label={'Soignants'} />
        <CommonNavLink href={'/admin/branches'} label={'Branches'} />
        <CommonNavLink href={'/admin/secteurs'} label={'Secteurs'} />
        <CommonNavLink href={'/admin/missions'} label={'Missions'} />
      </Flex>
    </>
  );
}
