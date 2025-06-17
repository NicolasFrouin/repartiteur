'use client';

import { fetchUser } from '@/actions/common';
import { User } from '@/generated/client';
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
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaUserPen } from 'react-icons/fa6';
import ArchivedIndicator from '../common/table/ArchivedIndicator';
import { getRoleLabel } from '@/lib/utils/text';

type Data = User & { updatedBy?: User };

export default function UserTable() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Data[]>([]);

  const tableHeaders: React.ReactNode[] = [
    'Nom',
    'Rôle',
    'État',
    'Modifié par',
    'Modifié le',
    'Actions',
  ];
  const tableBody = data.map((u) => {
    return [
      <Anchor key={`${u.id}-name`} component={Link} href={`/admin/utilisateurs/${u.id}`}>
        {u.name}
        <ArchivedIndicator
          archived={u.archived}
          content={
            <Text>
              L&apos;utilisateur{' '}
              <Text component='i' fs={'italic'}>
                {u.name}
              </Text>{' '}
              est archivé.
            </Text>
          }
        />
      </Anchor>,
      <Text key={`${u.id}-role`}>{getRoleLabel(u.role)}</Text>,
      <Text key={`${u.id}-status`}>{u.active ? 'Actif' : 'Inactif'}</Text>,
      <Text key={`${u.id}-updatedBy`}>{u.updatedBy ? u.updatedBy.name : '-'}</Text>,
      <Text key={`${u.id}-updatedAt`}>
        {u.updatedAt ? new Date(u.updatedAt).toLocaleString('fr-FR') : '-'}
      </Text>,
      <ActionIcon
        key={`${u.id}-action`}
        variant='subtle'
        color='blue'
        href={`/admin/utilisateurs/${u.id}`}
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
      const userTotal = await fetchUser('count');

      const users = await fetchUser('findMany', [
        {
          include: { updatedBy: true },
          where: { OR: [{ archived: true }, { archived: false }] },
          take: pageSize,
          skip: (page - 1) * pageSize,
          orderBy: [{ name: 'asc' }],
        },
      ]);

      setTotal(userTotal);
      setData(users);
      setLoading(false);
    }

    fetchData();
  }, [page, pageSize]);

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
