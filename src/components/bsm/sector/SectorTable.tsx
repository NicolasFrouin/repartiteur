'use client';

import { fetchSector } from '@/actions/common';
import BSMTableCommon from '@/components/common/bsm/BSMTableCommon';
import ColorCell from '@/components/common/table/ColorCell';
import { FullSector } from '@/types/utils';
import { ActionIcon, Anchor } from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';
import { FaPencil } from 'react-icons/fa6';

export default function SectorTable() {
  const [data, setData] = useState<(FullSector & { _count: { missions: number } })[]>([]);
  const [total, setTotal] = useState(0);

  async function fetcher(page: number, pageSize: number) {
    const sectorsTotal = await fetchSector('count');
    const sectorsData = await fetchSector('findMany', [
      {
        include: { _count: { select: { missions: true } }, branch: true },
        take: pageSize,
        skip: (page - 1) * pageSize,
      },
    ]);

    setTotal(sectorsTotal);
    setData(sectorsData);
  }

  const tableHeaders: React.ReactNode[] = [
    'Nom',
    'État',
    'Couleur',
    'Secteur',
    'Missions',
    'Actions',
  ];
  const tableBody: React.ReactNode[][] = data.map((s) => {
    return [
      <Anchor key={`${s.id}-name`} component={Link} href={`/admin/secteurs/${s.id}`}>
        {s.name}
      </Anchor>,
      s.active ? 'Actif' : 'Inactif',
      <ColorCell key={`${s.id}-color`} color={s.color} />,
      s.branch.name,
      s._count.missions,
      <ActionIcon
        key={`${s.id}-action`}
        variant='subtle'
        color='blue'
        href={`/admin/secteurs/${s.id}`}
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
