'use client';

import { fetchCaregiver } from '@/actions/common';
import { getBranchesToMissions } from '@/actions/data';
import { Branch, Caregiver, Sector } from '@/generated/client';
import { BSM } from '@/types/utils';
import {
  Anchor,
  Box,
  Chip,
  Flex,
  Group,
  LoadingOverlay,
  Pagination,
  Table,
  Text,
} from '@mantine/core';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

type CaregiversAndBranch = Caregiver & { branch: Branch };

interface Props {
  forbiddenSectors: Record<Caregiver['id'], Sector['id'][]>;
  setForbiddenSectors: React.Dispatch<
    React.SetStateAction<Record<Caregiver['id'], Sector['id'][]>>
  >;
}

export default function CaregiverOptions({ forbiddenSectors, setForbiddenSectors }: Props) {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [caregivers, setCaregivers] = useState<CaregiversAndBranch[]>([]);
  const [data, setData] = useState<BSM[]>([]);

  const tableHeaders: React.ReactNode[] = [
    <Text key={'h-name'} fw={'bold'}>
      Nom
    </Text>,
    <Text key={'h-branch'} fw={'bold'}>
      Branche
    </Text>,
    <Text key={'h-sectors'} ta={'center'} fw={'bold'}>
      Secteurs à ne pas attribuer
    </Text>,
  ];
  const tableBody: React.ReactNode[][] = caregivers.map((c) => {
    const branch = data.find((b) => b.id === c.branchId);
    return [
      <Anchor key={`${c.id}-name`} component={Link} href={`/admin/soignants/${c.id}`}>
        {[c.firstname, c.lastname].join(' ')}
      </Anchor>,
      <Anchor key={`${c.id}-branch`} component={Link} href={`/admin/branches/${c.branchId}`}>
        {branch ? branch.name : 'Aucune branche'}
      </Anchor>,
      branch ? (
        <Chip.Group
          key={`${c.id}-sectors`}
          multiple
          value={forbiddenSectors[c.id]}
          onChange={(value) => {
            setForbiddenSectors((prev) => ({ ...prev, [c.id]: value }));
          }}
        >
          <Flex
            justify={'center'}
            align={'center'}
            gap={'xs'}
            className={'flex-col md:flex-row md:flex-wrap md:[td:has(&)]:max-w-xs'}
          >
            {branch.sectors.map((s) => (
              <Chip
                key={`${c.id}-${s.id}`}
                value={s.id}
                color={'red'}
                icon={<FaTimes />}
                styles={{ label: { border: `2px solid ${s.color || '#ddd'}` } }}
              >
                {s.name}
              </Chip>
            ))}
          </Flex>
        </Chip.Group>
      ) : (
        <Text key={`${c.id}-no-branch`}>
          Ce soignant est affecté à une branche introuvable ou inactive.
        </Text>
      ),
    ];
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const totalData = await fetchCaregiver('count', [{ where: { active: true } }]);
      const caregiversData = await fetchCaregiver('findMany', [
        {
          where: { active: true },
          include: { branch: true },
          take: pageSize,
          skip: (page - 1) * pageSize,
          orderBy: [{ lastname: 'asc' }, { firstname: 'asc' }],
        },
      ]);
      const allData = await getBranchesToMissions();

      setTotal(totalData);
      setCaregivers(caregiversData);
      setData(allData);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <Table data={{ head: tableHeaders, body: tableBody }} highlightOnHover />
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
