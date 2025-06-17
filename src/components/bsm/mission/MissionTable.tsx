'use client';

import { fetchMission } from '@/actions/common';
import BSMTableCommon from '@/components/common/bsm/BSMTableCommon';
import ColorCell from '@/components/common/table/ColorCell';
import { Role } from '@/generated/client';
import { canAccess } from '@/lib/utils';
import { FullMission } from '@/types/utils';
import { ActionIcon, Anchor, Text } from '@mantine/core';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { FaPencil } from 'react-icons/fa6';

export default function MissionTable() {
  const { data: session } = useSession();

  const hasAccess = canAccess(session?.user.role, Role.SUPERADMIN);

  const [data, setData] = useState<FullMission[]>([]);
  const [total, setTotal] = useState(0);

  async function fetcher(page: number, pageSize: number) {
    const missionsTotal = await fetchMission('count');
    const missionsData = await fetchMission('findMany', [
      {
        include: { sector: { include: { branch: true } }, updatedBy: hasAccess },
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
  if (hasAccess) {
    tableHeaders.splice(-1, 0, 'Modifié par', 'Modifié le');
  }

  const tableBody: React.ReactNode[][] = data.map((m) => {
    return [
      <Anchor
        key={`${m.id}-name`}
        component={Link}
        href={`/admin/missions/${m.id}`}
        className='whitespace-nowrap'
      >
        {m.name}
      </Anchor>,
      <Text key={`${m.id}-active`}>{m.active ? 'Actif' : 'Inactif'}</Text>,
      <ColorCell key={`${m.id}-color`} color={m.color} />,
      <Text key={`${m.id}-branch`}>{m.sector.branch.name}</Text>,
      <Text key={`${m.id}-sector`}>{m.sector.name}</Text>,
      ...(hasAccess
        ? [
            <Text key={`${m.id}-updatedBy`}>{m.updatedBy?.name || '-'}</Text>,
            <Text key={`${m.id}-updatedAt`}>
              {m.updatedAt ? new Date(m.updatedAt).toLocaleString() : '-'}
            </Text>,
          ]
        : []),
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
