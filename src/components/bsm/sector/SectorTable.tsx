'use client';

import { fetchSector } from '@/actions/common';
import BSMTableCommon from '@/components/common/bsm/BSMTableCommon';
import ColorCell from '@/components/common/table/ColorCell';
import { Role } from '@/generated/client';
import { canAccess } from '@/lib/utils';
import { FullSector } from '@/types/utils';
import { ActionIcon, Anchor, Text } from '@mantine/core';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { FaPencil } from 'react-icons/fa6';

export default function SectorTable() {
  const { data: session } = useSession();

  const hasAccess = canAccess(session?.user.role, Role.SUPERADMIN);

  const [data, setData] = useState<(FullSector & { _count: { missions: number } })[]>([]);
  const [total, setTotal] = useState(0);

  async function fetcher(page: number, pageSize: number) {
    const sectorsTotal = await fetchSector('count');
    const sectorsData = await fetchSector('findMany', [
      {
        include: { _count: { select: { missions: true } }, branch: true, updatedBy: hasAccess },
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
    '# Missions',
    'Actions',
  ];
  if (hasAccess) {
    tableHeaders.splice(-1, 0, 'Modifié par', 'Modifié le');
  }

  const tableBody: React.ReactNode[][] = data.map((s) => {
    return [
      <Anchor
        key={`${s.id}-name`}
        component={Link}
        href={`/admin/secteurs/${s.id}`}
        className='whitespace-nowrap'
      >
        {s.name}
      </Anchor>,
      <Text key={`${s.id}-active`}>{s.active ? 'Actif' : 'Inactif'}</Text>,
      <ColorCell key={`${s.id}-color`} color={s.color} />,
      <Text key={`${s.id}-branch`}>{s.branch.name}</Text>,
      <Text key={`${s.id}-missions`}>{s._count.missions}</Text>,
      ...(hasAccess
        ? [
            <Text key={`${s.id}-updatedBy`}>{s.updatedBy?.name || '-'}</Text>,
            <Text key={`${s.id}-updatedAt`}>
              {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '-'}
            </Text>,
          ]
        : []),
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
