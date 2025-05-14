'use client';

import { fetchCaregiver } from '@/actions/common';
import { Caregiver } from '@/generated/client';
import {
  ActionIcon,
  Badge,
  Box,
  Flex,
  Group,
  LoadingOverlay,
  Pagination,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaUserPen } from 'react-icons/fa6';

type Data = Caregiver & { branch: { name: string } };

export default function CaregiverTable() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Data[]>([]);

  const tableHeaders: React.ReactNode[] = ['Nom', 'État', 'Branche', 'Couleur', 'Actions'];
  const tableBody = data.map((c) => {
    return [
      <Text key={`${c.id}-name`}>{[c.firstname, c.lastname].join(' ')}</Text>,
      <Text key={`${c.id}-status`}>{c.active ? 'Actif' : 'Inactif'}</Text>,
      <Link key={`${c.id}-branch`} href={`/admin/branches/${c.branchId}`}>
        {c.branch.name}
      </Link>,
      <Tooltip label={c.color} key={`${c.id}-color`} withArrow disabled={!Boolean(c.color)}>
        <Badge
          key={`${c.id}-badge`}
          variant='filled'
          w={24}
          h={24}
          color={c.color || 'transparent'}
        />
      </Tooltip>,
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
          where: { active: true },
          include: {
            branch: true,
            _count: {
              select: {
                assignments: {
                  where: {
                    date: {
                      gte: dayjs().startOf('week').toDate(),
                      lte: dayjs().endOf('week').toDate(),
                    },
                  },
                },
              },
            },
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
  }, [page, pageSize]);

  return (
    <div>
      <Flex direction={'column'} gap={'md'}>
        <Box pos={'relative'}>
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />
          <Table data={tableData}></Table>
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
    </div>
  );
}
