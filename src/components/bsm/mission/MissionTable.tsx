'use client';

import { fetchMission } from '@/actions/common';
import BSMTableCommon from '@/components/common/bsm/BSMTableCommon';
import ColorCell from '@/components/common/table/ColorCell';
import { FullMission } from '@/types/utils';
import { ActionIcon, Anchor } from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';
import { FaPencil } from 'react-icons/fa6';

export default function MissionTable() {
  const [data, setData] = useState<FullMission[]>([]);
  const [total, setTotal] = useState(0);

  async function fetcher(page: number, pageSize: number) {
    const missionsTotal = await fetchMission('count');
    const missionsData = await fetchMission('findMany', [
      {
        include: { sector: { include: { branch: true } } },
        take: pageSize,
        skip: (page - 1) * pageSize,
      },
    ]);

    setTotal(missionsTotal);
    setData(missionsData);
  }

  const tableHeaders: React.ReactNode[] = [
    'Nom',
    'État',
    'Couleur',
    'Branche',
    'Secteur',
    'Actions',
  ];
  const tableBody: React.ReactNode[][] = data.map((m) => {
    return [
      <Anchor key={`${m.id}-name`} component={Link} href={`/admin/missions/${m.id}`}>
        {m.name}
      </Anchor>,
      m.active ? 'Actif' : 'Inactif',
      <ColorCell key={`${m.id}-color`} color={m.color} />,
      m.sector.branch.name,
      m.sector.name,
      <ActionIcon
        key={`${m.id}-action`}
        variant='subtle'
        color='blue'
        href={`/admin/missions/${m.id}`}
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
