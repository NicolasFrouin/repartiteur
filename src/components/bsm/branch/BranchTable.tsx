'use client';

import { fetchBranch } from '@/actions/common';
import BSMTableCommon from '@/components/common/bsm/BSMTableCommon';
import ColorCell from '@/components/common/table/ColorCell';
import { FullBranch } from '@/types/utils';
import { ActionIcon, Anchor } from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';
import { FaPencil } from 'react-icons/fa6';

export default function BranchTable() {
  const [data, setData] = useState<(FullBranch & { _count: { sectors: number } })[]>([]);
  const [total, setTotal] = useState(0);

  async function fetcher(page: number, pageSize: number) {
    const branchesTotal = await fetchBranch('count');
    const branchesData = await fetchBranch('findMany', [
      {
        include: { _count: { select: { sectors: true } } },
        take: pageSize,
        skip: (page - 1) * pageSize,
      },
    ]);

    setTotal(branchesTotal);
    setData(branchesData);
  }

  const tableHeaders: React.ReactNode[] = ['Nom', 'État', 'Couleur', 'Secteurs', 'Actions'];
  const tableBody: React.ReactNode[][] = data.map((b) => {
    return [
      <Anchor key={`${b.id}-name`} component={Link} href={`/admin/branches/${b.id}`}>
        {b.name}
      </Anchor>,
      b.active ? 'Actif' : 'Inactif',
      <ColorCell key={`${b.id}-color`} color={b.color} />,
      b._count.sectors,
      <ActionIcon
        key={`${b.id}-action`}
        variant='subtle'
        color='blue'
        href={`/admin/branches/${b.id}`}
        component={Link}
      >
        <FaPencil size={20} />
      </ActionIcon>,
    ];
  });

  return (
    <BSMTableCommon
      tableData={{ body: tableBody, head: tableHeaders }}
      fetcher={fetcher}
      total={total}
    />
  );
}
