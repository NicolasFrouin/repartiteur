'use server';

import { Caregiver, CaregiverBigWeekType, Sector } from '@/generated/client';
import { getDate, getWeekDays, getWeekNumber, isBigWeek, rand } from '@/lib/utils';
import { FullAssignment, TCalendarOptions } from '@/types/utils';
import { getBranchesToMissions } from './data';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DEV = process.env.NODE_ENV === 'development';

export async function generateWeekCalendar(
  forbiddenSectors: Record<Caregiver['id'], Sector['id'][]>,
  calendarOptions: TCalendarOptions = { date: new Date().toISOString(), recurence: false },
  regenerate = false,
): Promise<FullAssignment[]> {
  if (DEV) {
    console.group(`generateWeekCalendar ${regenerate ? 'REGENERATE' : ''}`);
  }
  const weekDays = getWeekDays(new Date(calendarOptions.date)).map(getDate);
  const bsm = await getBranchesToMissions();

  const assignmentsResult: FullAssignment[] = [];

  const bigWeekType =
    getWeekNumber(new Date(calendarOptions.date)) % 2 === 0
      ? CaregiverBigWeekType.EVEN
      : CaregiverBigWeekType.ODD;

  for (const day of weekDays) {
    if (regenerate) {
      await prisma.assignment.deleteMany({
        where: { date: getDate(day), OR: [{ archived: true }, { archived: false }] },
      });
    }

    const bigWeek = isBigWeek(day);

    for (const branch of bsm) {
      const branchCaregivers = await prisma.caregiver.findMany({
        where: {
          active: true,
          branchId: branch.id,
          bigWeekType: bigWeek ? bigWeekType : { not: bigWeekType },
        },
      });

      const caregiversToAssign = [...branchCaregivers];

      /*  */
      for (const sector of branch.sectors) {
        const missions = sector.missions.filter((m) => m.min > 0);

        for (const mission of missions) {
          const assignedCaregivers = caregiversToAssign
            .filter((c) => !forbiddenSectors[c.id]?.includes(sector.id))
            .splice(rand(0, caregiversToAssign.length - mission.min), mission.min);

          for (const caregiver of assignedCaregivers) {
            if (DEV) {
              console.log(
                `✅ Assigned ${[caregiver.firstname, caregiver.lastname].join(' ')} to ${mission.name}`,
              );
            }
            const assignment = await prisma.assignment.create({
              data: { caregiverId: caregiver.id, missionId: mission.id, date: getDate(day) },
            });
            const fullAssignmentData = await prisma.assignment.findUnique({
              where: {
                date_caregiverId_missionId: {
                  caregiverId: assignment.caregiverId,
                  date: assignment.date,
                  missionId: assignment.missionId,
                },
              },
              include: { caregiver: true, mission: true },
            });
            if (!fullAssignmentData) {
              throw new Error('Assignment not found');
            }
            assignmentsResult.push(fullAssignmentData);
          }
        }
      }
    }
  }

  if (DEV) {
    console.groupEnd();
  }

  revalidatePath('/');
  return assignmentsResult;
}
