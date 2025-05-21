'use server';

import { Caregiver, Sector } from '@/generated/client';
import prisma from '@/lib/prisma';
import { getFirstDayOfWeek, getWeekDays, getWeekNumber } from '@/lib/utils';

export async function generateWeekCalendar(
  forbiddenSectors: Record<Caregiver['id'], Sector['id'][]>,
  weekNumber: number = getWeekNumber(),
  year: number = new Date().getFullYear(),
) {
  const weekDays = getWeekDays(getFirstDayOfWeek(weekNumber, year));

  const res = prisma.$transaction([
    prisma.assignment.findMany({ where: { date: { in: weekDays } } }),
  ]);
  return res;
}
