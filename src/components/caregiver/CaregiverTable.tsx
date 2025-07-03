'use client';

import { fetchCaregiver } from '@/actions/common';
import { Role } from '@/generated/client';
import { canAccess } from '@/lib/utils';
import { FullCaregiver } from '@/types/utils';
import {
  ActionIcon,
  Anchor,
  Box,
  Flex,
  Group,
  LoadingOverlay,
  Pagination,
  ScrollArea,
  Table,
  Text,
} from '@mantine/core';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaUserPen } from 'react-icons/fa6';
import ColorCell from '../common/table/ColorCell';

type Data = {
  branch: { name: string };
  assignedSectors: { sector: { name: string } }[];
} & FullCaregiver;

export default function CaregiverTable() {
  const { data: session } = useSession();

  const hasAccess = canAccess(session?.user.role, Role.SUPERADMIN);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Data[]>([]);

  const tableHeaders: React.ReactNode[] = [
    'Nom',
    'État',
    'Branche',
    'Secteurs',
    'Couleur',
    'Actions',
  ];
  if (hasAccess) {
    tableHeaders.splice(-1, 0, 'Modifié par', 'Modifié le');
  }

  const tableBody = data.map((c) => {
    return [
      <Anchor key={`${c.id}-name`} component={Link} href={`/admin/soignants/${c.id}`}>
        {[c.firstname, c.lastname].join(' ')}
      </Anchor>,
      <Text key={`${c.id}-status`}>{c.active ? 'Actif' : 'Inactif'}</Text>,
      <Anchor key={`${c.id}-branch`} component={Link} href={`/admin/branches/${c.branchId}`}>
        {c.branch.name}
      </Anchor>,
      <Text key={`${c.id}-sectors`} size='sm'>
        {c.assignedSectors.map((s) => s.sector.name).join(', ') || '-'}
      </Text>,
      <ColorCell key={`${c.id}-color`} color={c.color} />,
      ...(hasAccess
        ? [
            <Text key={`${c.id}-updatedBy`}>{c.updatedBy?.name || '-'}</Text>,
            <Text key={`${c.id}-updatedAt`}>
              {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '-'}
            </Text>,
          ]
        : []),
      <ActionIcon
        key={`${c.id}-action`}
        variant='subtle'
        color='blue'
        href={`/admin/soignants/${c.id}`}
        component={Link}
      >
        <FaUserPen size={20} />
      </ActionIcon>,
    ];
  });

  const tableData = { body: tableBody, head: tableHeaders };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const caregiverTotal = await fetchCaregiver('count');

      const caregivers = await fetchCaregiver('findMany', [
        {
          include: {
            branch: { select: { name: true } },
            updatedBy: hasAccess,
            assignedSectors: { select: { sector: { select: { name: true } } } },
          },
          take: pageSize,
          skip: (page - 1) * pageSize,
          orderBy: [{ lastname: 'asc' }, { firstname: 'asc' }],
        },
      ]);

      setTotal(caregiverTotal);
      setData(caregivers);
      setLoading(false);
    }

    fetchData();
  }, [page, pageSize, hasAccess]);

  return (
    <Flex direction={'column'} gap={'md'}>
      <Box pos={'relative'}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <ScrollArea type={'auto'}>
          <Table highlightOnHover data={tableData} />
        </ScrollArea>
      </Box>
      <Group justify={'center'} mt={'md'}>
        <Pagination
          total={Math.ceil(total / pageSize)}
          value={page}
          onChange={setPage}
          siblings={2}
        />
      </Group>
    </Flex>
  );
}
