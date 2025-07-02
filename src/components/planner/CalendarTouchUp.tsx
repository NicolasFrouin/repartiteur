/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { generateWeekCalendar } from '@/actions/assignments';
import { fetchAssignment } from '@/actions/common';
import { getBranchesToMissions } from '@/actions/data';
import { Caregiver, Sector } from '@/generated/client';
import { DEFAULT_CALENDAR_OPTIONS, getDate, getWeekDays, getWeekNumber } from '@/lib/utils';
import { BSM, FullAssignment, TCalendarOptions } from '@/types/utils';
import { Box, Button, LoadingOverlay, Stack, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Metadata } from 'next';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import CaregiversPlanning from '../caregiver/CaregiversPlanning';
import NotAuthorized from '../error/NotAuthorized';

export const metadata: Metadata & { title: string } = { title: 'Planificateur - Calendrier' };

interface Props {
  calendarOptions?: TCalendarOptions;
  branchesData?: BSM[] | null;
  forbiddenSectors?: Record<Caregiver['id'], Sector['id'][]>;
  weekCalendar?: FullAssignment[] | null;
  setWeekCalendar?: React.Dispatch<React.SetStateAction<FullAssignment[] | null>>;
}

export default function CalendarTouchUp({
  calendarOptions = DEFAULT_CALENDAR_OPTIONS,
  forbiddenSectors = {},
  branchesData = null,
  weekCalendar = null,
  setWeekCalendar = () => {},
}: Props) {
  const { data: session, status } = useSession();

  if (status !== 'authenticated' || !session?.user) {
    return <NotAuthorized />;
  }

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BSM[]>(branchesData || []);
  const [generated, setGenerated] = useState(weekCalendar !== null);

  async function handleGenerateCalendar(regenerate = false) {
    setLoading(true);
    const res = await generateWeekCalendar(
      forbiddenSectors,
      calendarOptions,
      regenerate,
      session!.user.id,
    );
    if (res === false) {
      notifications.show({
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la génération du calendrier.',
        color: 'red',
        position: 'top-right',
      });
    } else {
      setGenerated(true);
      setWeekCalendar?.(res);
    }
    setLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      if (branchesData === null) {
        const branchesData = await getBranchesToMissions();
        setData(branchesData);
      }

      if (weekCalendar === null) {
        const existingWeekCalendar: FullAssignment[] = await fetchAssignment('findMany', [
          {
            where: { date: { in: getWeekDays(new Date(calendarOptions.date)).map(getDate) } },
            include: { caregiver: true, mission: true, updatedBy: true },
          },
        ]).catch(() => []);
        console.log('existingWeekCalendar', existingWeekCalendar);
        if (existingWeekCalendar.length > 0) {
          setWeekCalendar(existingWeekCalendar);
          setGenerated(true);
        } else {
          setGenerated(false);
        }
      }

      setLoading(false);
    }
    fetchData();
  }, [branchesData, calendarOptions.date, setWeekCalendar, weekCalendar]);

  const renderLoaderProps = () =>
    generated
      ? undefined
      : {
          children: (
            <Button onClick={handleGenerateCalendar.bind(null, true)} loading={loading}>
              Générer le calendrier
            </Button>
          ),
        };

  useEffect(() => {
    const oldTitle = document.title;
    document.title = metadata.title;

    return () => {
      document.title = oldTitle;
    };
  }, []);

  return (
    <Box>
      <Box pos={'relative'}>
        <LoadingOverlay
          visible={loading || !generated}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={renderLoaderProps()}
        />
        <CaregiversPlanning
          weekNumber={getWeekNumber(new Date(calendarOptions.date))}
          branchesData={data}
          assignmentsData={weekCalendar ?? undefined}
          options={{ ScrollArea: { className: 'h-[65vh]' } }}
        />
      </Box>
      {generated && (
        <Box className='flex items-center justify-center'>
          <Tooltip
            label={
              <Stack gap={0}>
                <Text ta={'center'}>Si le calendrier actuel ne vous satisfait pas,</Text>
                <Text ta={'center'}>
                  vous pouvez le régénérer autant de fois que vous le souhaitez.
                </Text>
              </Stack>
            }
            withArrow
          >
            <Button onClick={handleGenerateCalendar.bind(null, true)} loading={loading} mt={8}>
              Régénérer le calendrier
            </Button>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}
