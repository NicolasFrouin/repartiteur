'use client';

import { fetchBranch } from '@/actions/common';
import BSMTableCommon from '@/components/common/bsm/BSMTableCommon';
import ArchivedIndicator from '@/components/common/table/ArchivedIndicator';
import ColorCell from '@/components/common/table/ColorCell';
import { Role } from '@/generated/client';
import { canAccess } from '@/lib/utils';
import { FullBranch } from '@/types/utils';
import { ActionIcon, Anchor, Text } from '@mantine/core';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { FaPencil } from 'react-icons/fa6';

export default function BranchTable() {
  const { data: session } = useSession();

  const hasAccess = canAccess(session?.user.role, Role.SUPERADMIN);

  const [data, setData] = useState<(FullBranch & { _count: { sectors: number } })[]>([]);
  const [total, setTotal] = useState(0);

  async function fetcher(page: number, pageSize: number) {
    const branchesTotal = await fetchBranch('count');
    const branchesData = await fetchBranch('findMany', [
      {
        where: hasAccess ? { OR: [{ archived: false }, { archived: true }] } : {},
        orderBy: { name: 'asc' },
        include: { _count: { select: { sectors: true } }, updatedBy: hasAccess },
        take: pageSize,
        skip: (page - 1) * pageSize,
      },
    ]);

    setTotal(branchesTotal);
    setData(branchesData);
  }

  const tableHeaders: React.ReactNode[] = ['Nom', 'État', 'Couleur', '# Secteurs', 'Actions'];
  if (hasAccess) {
    tableHeaders.splice(-1, 0, 'Modifié par', 'Modifié le');
  }

  const tableBody: React.ReactNode[][] = data.map((b) => {
    return [
      <Anchor
        key={`${b.id}-name`}
        component={Link}
        href={`/admin/branches/${b.id}`}
        className='whitespace-nowrap'
      >
        {b.name}
        {hasAccess && <ArchivedIndicator archived={b.archived} />}
      </Anchor>,
      <Text key={`${b.id}-active`}>{b.active ? 'Actif' : 'Inactif'}</Text>,
      <ColorCell key={`${b.id}-color`} color={b.color} />,
      <Text key={`${b.id}-sector`}>{b._count.sectors}</Text>,
      ...(hasAccess
        ? [
            <Text key={`${b.id}-updatedBy`}>{b.updatedBy?.name || '-'}</Text>,
            <Text key={`${b.id}-updatedAt`}>
              {b.updatedAt ? new Date(b.updatedAt).toLocaleString() : '-'}
            </Text>,
          ]
        : []),
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
