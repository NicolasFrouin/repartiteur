'use server';

import { getDate, getWeekDays } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { BSM, FullAssignment } from '@/types/utils';

export async function getBranchesToMissions(): Promise<BSM[]> {
  return await prisma.branch.findMany({
    include: {
      sectors: { include: { missions: { where: { active: true } } }, where: { active: true } },
    },
    where: { active: true },
  });
}

export async function getWeekAssignmentsData(date: Date = new Date()): Promise<FullAssignment[]> {
  const days = getWeekDays(date);

  return await prisma.assignment.findMany({
    where: { date: { in: days.map(getDate) } },
    include: { caregiver: true, mission: true },
  });
}
