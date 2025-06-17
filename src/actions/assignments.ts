'use server';

import { Caregiver, CaregiverBigWeekType, Sector } from '@/generated/client';
import { getDate, getWeekDays, getWeekNumber, isBigWeek, rand } from '@/lib/utils';
import { FullAssignment, TCalendarOptions } from '@/types/utils';
import { getBranchesToMissions } from './data';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'node:fs';

const DEV = process.env.NODE_ENV === 'development';

const logger = {
  file: './calendar-generation.log',
  content: '',
  indent: '\t',
  write() {
    if (!DEV) return;
    writeFile(this.file, this.content, { flag: 'w' }, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });
  },
  log(level: number = 0, ...args: unknown[]) {
    this.content += `${this.indent.repeat(level)}${args.join(' ').trim()}\n`;
  },
  reset() {
    this.content = '';
    this.write();
  },
};

const l = DEV
  ? (level: number, ...args: unknown[]) => {
      logger.log(level, ...args);
    }
  : () => {};

export async function generateWeekCalendar(
  forbiddenSectors: Record<Caregiver['id'], Sector['id'][]>,
  calendarOptions: TCalendarOptions = { date: new Date().toISOString(), recurence: false },
  regenerate = false,
  userId: string,
): Promise<FullAssignment[]> {
  logger.reset();

  const weekDays = getWeekDays(new Date(calendarOptions.date)).map(getDate);
  const bsm = await getBranchesToMissions();

  const assignmentsResult: FullAssignment[] = [];

  const bigWeekType =
    getWeekNumber(new Date(calendarOptions.date)) % 2 === 0
      ? CaregiverBigWeekType.EVEN
      : CaregiverBigWeekType.ODD;

  for (const day of weekDays) {
    l(0, `DAY : ${day.toLocaleDateString('fr-FR')}`);
    if (regenerate) {
      await prisma.assignment.deleteMany({
        where: { date: getDate(day), OR: [{ archived: true }, { archived: false }] },
      });
    }

    const bigWeek = isBigWeek(day);

    for (const branch of bsm) {
      l(1, `Branch : ${branch.name}`);
      const branchCaregivers = await prisma.caregiver.findMany({
        where: {
          active: true,
          branchId: branch.id,
          bigWeekType: bigWeek ? bigWeekType : { not: bigWeekType },
        },
      });

      const caregiversToAssign = [...branchCaregivers];

      /* Mandatory Missions */
      l(2, `Mandatory missions`);
      for (const sector of branch.sectors) {
        const mandatoryMissions = sector.missions.filter((m) => m.min > 0);
        l(3, `Sector : ${sector.name} (${mandatoryMissions.length} missions)`);
        for (const mission of mandatoryMissions) {
          l(4, `Mission : ${mission.name} (min: ${mission.min})`);

          l(5, 'Caregivers to assign:', caregiversToAssign.length);
          const eligibleCaregivers = caregiversToAssign.filter(
            (c) => !forbiddenSectors[c.id]?.includes(sector.id),
          );

          const assignedCaregivers = eligibleCaregivers.splice(
            rand(0, eligibleCaregivers.length - mission.min),
            mission.min,
          );

          for (const assigned of assignedCaregivers) {
            const index = caregiversToAssign.findIndex((c) => c.id === assigned.id);
            if (index !== -1) {
              caregiversToAssign.splice(index, 1);
            }
          }

          for (const caregiver of assignedCaregivers) {
            l(
              5,
              `✅ Assigned ${[caregiver.firstname, caregiver.lastname].join(' ')} to ${mission.name}`,
            );

            const assignment = await prisma.assignment.create({
              data: {
                caregiverId: caregiver.id,
                missionId: mission.id,
                date: getDate(day),
                createdById: userId,
                updatedById: userId,
              },
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

      /* Optional Missions */
      l(2, `Optional missions`);
      for (const sector of branch.sectors) {
        const optionalMissions = sector.missions.filter((m) => m.min <= 0);
        l(3, `Sector : ${sector.name} (${optionalMissions.length} missions)`);
        for (const mission of optionalMissions) {
          l(4, `Mission : ${mission.name} (max: ${mission.max})`);

          l(5, 'Caregivers to assign:', caregiversToAssign.length);
          const eligibleCaregivers = caregiversToAssign.filter(
            (c) => !forbiddenSectors[c.id]?.includes(sector.id),
          );

          const assignedCaregivers = eligibleCaregivers.splice(
            rand(0, eligibleCaregivers.length - mission.max),
            mission.max,
          );

          for (const assigned of assignedCaregivers) {
            const index = caregiversToAssign.findIndex((c) => c.id === assigned.id);
            if (index !== -1) {
              caregiversToAssign.splice(index, 1);
            }
          }

          for (const caregiver of assignedCaregivers) {
            l(
              5,
              `✅ Assigned ${[caregiver.firstname, caregiver.lastname].join(' ')} to ${mission.name}`,
            );

            const assignment = await prisma.assignment.create({
              data: {
                caregiverId: caregiver.id,
                missionId: mission.id,
                date: getDate(day),
                createdById: userId,
                updatedById: userId,
              },
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

  logger.write();

  revalidatePath('/');
  return assignmentsResult;
}
