'use client';

import { fetchCaregiver } from '@/actions/common';
import prisma from '@/prisma';
import { Caregiver } from '@/prisma/generated/client';
import { ActionIcon, Badge, Group, Pagination, Table, Tooltip } from '@mantine/core';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaUserPen } from 'react-icons/fa6';

interface Data extends Caregiver {
  branch: { name: string };
}

export default function CaregiverTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Data[]>([]);

  const fetchData = async () => {
    const caregivers = await fetchCaregiver('findMany', [
      {
        where: { active: true },
        include: { branch: true, _count: true },
        limit: pageSize,
        skip: (page - 1) * pageSize,
      },
    ]);
    // setTotal(count);
    setData(caregivers);
  };

  const tableHeaders: React.ReactNode[] = ['Nom', 'État', 'Branche', 'Couleur', 'Actions'];
  const tableBody = data.map((c) => {
    return [
      <Link key={c.id} href={`/admin/soignants/${c.id}`}>
        {[c.firstname, c.lastname].join(' ')}
      </Link>,
      c.active ? 'Actif' : 'Inactif',
      <Link key={c.id} href={`/admin/branches/${c.branchId}`}>
        {c.branch.name}
      </Link>,
      <Tooltip label={c.color} key={c.id + 'color'} withArrow disabled={!Boolean(c.color)}>
        <Badge
          key={c.id + 'badge'}
          variant='filled'
          w={24}
          h={24}
          color={c.color || 'transparent'}
        />
      </Tooltip>,
      <ActionIcon key={c.id} variant='subtle' color='blue'>
        <FaUserPen size={20} />
      </ActionIcon>,
    ];
  });

  const tableData = { body: tableBody, head: tableHeaders };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Table data={tableData}></Table>
      <Group justify='center' mt='md'>
        <Pagination total={total} value={page} onChange={setPage} />
      </Group>
    </div>
  );
}
