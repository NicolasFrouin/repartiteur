'use client';

import { useEffect, useState } from 'react';
import CaregiversPlanning from '../caregiver/CaregiversPlanning';
import { BSM } from '@/types/utils';
import { getBranchesToMissions } from '@/actions/data';
import { Box, LoadingOverlay } from '@mantine/core';
import { Caregiver, Sector } from '@/generated/client';
import { getWeekNumber } from '@/lib/utils';

interface Props {
  // assignmentsData?: FullAssignment[];
  branchesData?: BSM[] | null;
  forbiddenSectors?: Record<Caregiver['id'], Sector['id'][]>;
}

export default function CalendarTouchUp({ branchesData = null }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BSM[]>(branchesData || []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      if (branchesData === null) {
        const branchesData = await getBranchesToMissions();
        setData(branchesData);
      }

      setLoading(false);
    }
    fetchData();
  }, [branchesData]);

  return (
    <div>
      <Box pos={'relative'}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <CaregiversPlanning
          weekNumber={getWeekNumber() + 1}
          branchesData={data}
          options={{ ScrollArea: { className: 'h-[65vh]' } }}
        />
      </Box>
    </div>
  );
}
