'use server';

import prisma from '@/prisma';
import { BSM } from '@/types/utils';
import { getDate, getWeekDays } from '@/utils/date';

export async function getBranchesToMissions(): Promise<BSM[]> {
  return await prisma.branch.findMany({
    include: {
      sectors: { include: { missions: { where: { active: true } } }, where: { active: true } },
    },
    where: { active: true },
  });
}

export async function getWeekAssignmentsData(date: Date = new Date()) {
  const days = getWeekDays(date);

  return await prisma.assignment.findMany({
    where: { date: { in: days.map(getDate) } },
    include: { caregiver: true, mission: true },
  });
}
