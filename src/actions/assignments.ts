'use server';

import { Caregiver, Sector } from '@/generated/client';
import { getDate, getWeekDays } from '@/lib/utils';
import { FullAssignment, TCalendarOptions } from '@/types/utils';
import { getBranchesToMissions } from './data';

export async function generateWeekCalendar(
  forbiddenSectors: Record<Caregiver['id'], Sector['id'][]>,
  calendarOptions: TCalendarOptions = { date: new Date().toISOString(), recurence: false },
): Promise<FullAssignment[]> {
  console.group('generateWeekCalendar');
  const weekDays = getWeekDays(new Date(calendarOptions.date)).map(getDate);
  const bsm = await getBranchesToMissions();

  console.log({ forbiddenSectors, calendarOptions });
  console.log({ weekDays, bsm });

  console.groupEnd();
  return [{ date: new Date(), caregiverId: '', missionId: '' }] as FullAssignment[];
}
