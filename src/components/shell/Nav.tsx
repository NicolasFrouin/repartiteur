'use client';
/* eslint-disable react-hooks/rules-of-hooks */

import { Role } from '@/generated/client';
import { canAccess, cn } from '@/lib/utils';
import {
  Box,
  Collapse,
  Divider,
  Flex,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaChevronDown,
  FaHome,
  FaMapMarkerAlt,
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
  FaUsersCog,
} from 'react-icons/fa';
import classes from './Nav.module.css';

interface ILink {
  link: string;
  label: string;
  type: 'link' | 'dropdown' | 'logout';
  links?: ILink[];
  icon: React.ComponentType<{ size?: number; color?: string }>;
  divide?: boolean;
  role?: Role;
}

const connectedLinks: ILink[] = [
  { link: '/', label: 'Accueil', type: 'link', icon: FaHome },
  {
    link: '/admin/planificateur',
    label: 'Planificateur',
    type: 'link',
    icon: FaCalendarAlt,
    role: Role.ADMIN,
  },
  {
    link: '/admin',
    label: 'Administration',
    type: 'dropdown',
    icon: FaUsersCog,
    role: Role.ADMIN,
    links: [
      { link: '/admin/soignants', label: 'Soignants', type: 'link', icon: FaUsersCog },
      { link: '/admin/branches', label: 'Branches', type: 'link', icon: FaBuilding },
      { link: '/admin/secteurs', label: 'Secteurs', type: 'link', icon: FaMapMarkerAlt },
      { link: '/admin/missions', label: 'Missions', type: 'link', icon: FaBriefcase },
      {
        link: '/admin/utilisateurs',
        label: 'Utilisateurs',
        type: 'link',
        icon: FaUser,
        role: Role.SUPERADMIN,
      },
    ],
  },
  { link: '#', label: 'Déconnexion', type: 'logout', divide: true, icon: FaSignOutAlt },
];

const disconnectedLinks: ILink[] = [
  { link: '/', label: 'Accueil', type: 'link', icon: FaHome },
  { link: '/login', label: 'Connexion', type: 'link', divide: true, icon: FaSignInAlt },
];

interface NavbarLinksGroupProps {
  link: ILink;
  close: () => void;
  role: Role | null | undefined;
}

function MobileLinksGroup({ link, close, role }: NavbarLinksGroupProps) {
  if (link.role && !canAccess(role, link.role)) return null;

  const hasLinks = Array.isArray(link.links) && link.links.length > 0;
  const [opened, setOpened] = useState(false);
  const Icon = link.icon;
  const pathname = usePathname();
  const isActive = pathname === link.link;

  const handleClick = async () => {
    if (link.type === 'logout') {
      close();
      await signOut({ redirect: true, redirectTo: '/' });
    } else if (link.type === 'dropdown') {
      setOpened((o) => !o);
    } else {
      close();
    }
  };

  const items = (hasLinks && link.links ? link.links : []).reduce<React.JSX.Element[]>(
    (acc, nestedLink) => {
      if (nestedLink.role && !canAccess(role, nestedLink.role)) return acc;
      acc.push(
        <Link
          href={nestedLink.link}
          key={nestedLink.label}
          onClick={close}
          className={`${classes.link} ${nestedLink.link === pathname ? classes.active : ''}`}
        >
          {nestedLink.label}
        </Link>,
      );
      return acc;
    },
    [],
  );

  useEffect(() => {
    if (hasLinks && items.length > 0) {
      const active = items.some((item) => item.props.className.includes(classes.active));
      setOpened(active);
    } else {
      setOpened(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <UnstyledButton
        // @ts-expect-error ---
        component={link.type === 'link' ? Link : 'button'}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        href={link.type === 'link' ? link.link : null}
        onClick={handleClick}
        className={`${classes.control} ${isActive && !hasLinks ? classes.active : ''}`}
      >
        <Group justify='space-between' gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant='light' size={30} color='blue'>
              <Icon size={18} />
            </ThemeIcon>
            <Box ml='md'>{link.label}</Box>
          </Box>
          {hasLinks && (
            <FaChevronDown
              className={cn('transition-all duration-200', { 'rotate-180': opened })}
              size={14}
              // style={{ transform: opened ? 'rotate(180deg)' : 'none' }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}

function DesktopLinksGroup({ link, close, role }: NavbarLinksGroupProps) {
  if (link.role && !canAccess(role, link.role)) return null;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const hasLinks = Array.isArray(link.links) && link.links.length > 0;
  const Icon = link.icon;
  const pathname = usePathname();

  const handleClick = async () => {
    if (link.type === 'logout') {
      await signOut({ redirect: true, redirectTo: '/' });
    } else if (link.type !== 'dropdown') {
      close();
    }
  };

  if (hasLinks) {
    return (
      <Box
        className='relative'
        onMouseEnter={() => setDropdownOpen(true)}
        onMouseLeave={() => setDropdownOpen(false)}
      >
        <Group className={classes.desktopLink} style={{ cursor: 'pointer' }}>
          <Icon size={16} color='var(--mantine-color-blue-6)' />
          <Text>{link.label}</Text>
          <FaChevronDown
            size={12}
            className={cn('transition-transform duration-200', { 'rotate-180': dropdownOpen })}
          />
        </Group>

        {dropdownOpen && link.links && (
          <Box className={classes.desktopDropdownContent}>
            {link.links.reduce<React.JSX.Element[]>((acc, item) => {
              if (item.role && !canAccess(role, item.role)) return acc;
              acc.push(
                <Link
                  href={item.link}
                  key={item.label}
                  className={`${classes.desktopLink} ${pathname === item.link ? classes.active : ''}`}
                  onClick={close}
                >
                  {item.label}
                </Link>,
              );
              return acc;
            }, [])}
          </Box>
        )}
      </Box>
    );
  }

  if (link.type === 'logout') {
    return (
      <Group className={classes.desktopLink} onClick={handleClick} style={{ cursor: 'pointer' }}>
        <Icon size={16} color='var(--mantine-color-blue-6)' />
        <Text>{link.label}</Text>
      </Group>
    );
  }

  return (
    <Link href={link.link} onClick={handleClick} className={classes.desktopLink}>
      <Group>
        <Icon size={16} color='var(--mantine-color-blue-6)' />
        <Text>{link.label}</Text>
      </Group>
    </Link>
  );
}

interface Props {
  session: Session | null;
  close: () => void;
  mobile?: boolean;
}

export default function Nav({ session, close, mobile = false }: Props) {
  const links = session ? connectedLinks : disconnectedLinks;

  if (mobile) {
    return (
      <Box className={cn(classes.mobileNavContainer)}>
        {links.reduce((acc, link) => {
          if (link.divide) {
            acc.push(<Divider key='divider' my='sm' color='gray.3' />);
          }
          acc.push(
            <MobileLinksGroup
              key={link.label}
              link={link}
              close={close}
              role={session?.user.role}
            />,
          );
          return acc;
        }, [] as React.ReactNode[])}
      </Box>
    );
  }

  return (
    <Flex className={cn(classes.desktopNav)} gap='md'>
      {links.reduce((acc, link) => {
        if (link.divide) {
          acc.push(<Divider key='divider' my='xs' orientation='vertical' color='gray.3' />);
        }
        acc.push(
          <DesktopLinksGroup
            key={link.label}
            link={link}
            close={close}
            role={session?.user.role}
          />,
        );
        return acc;
      }, [] as React.ReactNode[])}
    </Flex>
  );
}
