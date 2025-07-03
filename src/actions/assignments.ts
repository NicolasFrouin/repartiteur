'use server';

import { Caregiver, CaregiverBigWeekType, Mission, Sector } from '@/generated/client';
import prisma from '@/lib/prisma';
import { getDate, getWeekDays, getWeekNumber, isBigWeek, rand } from '@/lib/utils';
import { FullAssignment, TCalendarOptions } from '@/types/utils';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'node:fs';
import { getBranchesToMissions } from './data';

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

export async function swapAssignmentCaregiver(
  data: {
    baseCaregiverId: Caregiver['id'] | null;
    selectedCaregiverId: Caregiver['id'] | null;
    date: Date;
    missionId: Mission['id'];
    color?: string;
  },
  userId: Caregiver['id'],
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = { success: false, message: '', details: null as any, data: null as any };

  try {
    const baseAssignmentData = data.baseCaregiverId
      ? await prisma.assignment.findUnique({
          where: {
            date_caregiverId_missionId: {
              date: data.date,
              caregiverId: data.baseCaregiverId,
              missionId: data.missionId,
            },
          },
        })
      : null;
    if (data.baseCaregiverId && !baseAssignmentData) {
      result.message = 'ERR_ASSIGNMENT_NOT_FOUND';
      return result;
    }

    if (baseAssignmentData?.caregiverId === data.selectedCaregiverId && data.color) {
      result.data = await prisma.assignment.update({
        where: {
          date_caregiverId_missionId: {
            date: baseAssignmentData.date,
            caregiverId: baseAssignmentData.caregiverId,
            missionId: baseAssignmentData.missionId,
          },
        },
        data: { color: data.color, updatedById: userId },
      });
    } else if (data.selectedCaregiverId && !data.baseCaregiverId) {
      result.data = {};
      result.data.deleteManyRes = await prisma.assignment.deleteMany({
        where: {
          date: data.date,
          OR: [{ caregiverId: data.selectedCaregiverId }],
          // @ts-expect-error - forceDelete is custom
          forceDelete: true,
        },
      });
      result.data.createRes = await prisma.assignment.create({
        data: {
          caregiverId: data.selectedCaregiverId,
          date: new Date(data.date),
          missionId: data.missionId,
          color: data.color || null,
          createdById: userId,
          updatedById: userId,
        },
      });
    } else if (!data.selectedCaregiverId && data.baseCaregiverId) {
      result.data = await prisma.assignment.delete({
        where: {
          date_caregiverId_missionId: {
            date: data.date,
            caregiverId: data.baseCaregiverId,
            missionId: data.missionId,
          },
          OR: [{ archived: true }, { archived: false }],
        },
      });
    } else if (data.selectedCaregiverId && data.baseCaregiverId) {
      result.data = {};
      result.data.deleteManyRes = await prisma.assignment.deleteMany({
        where: {
          date: data.date,
          OR: [{ caregiverId: data.selectedCaregiverId }, { caregiverId: data.baseCaregiverId }],
          // @ts-expect-error - forceDelete is custom
          forceDelete: true,
        },
      });
      result.data.createRes = await prisma.assignment.create({
        data: {
          caregiverId: data.selectedCaregiverId,
          date: data.date,
          missionId: data.missionId,
          color: data.color || data.color,
          createdById: userId,
          updatedById: userId,
        },
      });
    } else {
      result.message = 'ERR_ASSIGNMENT_NO_CAREGIVER';
      return result;
    }
    result.success = true;
  } catch (error) {
    result.message = 'ERR_ASSIGNMENT_SWAP_FAILED';
    result.details = error;
  }

  return result;
}

export async function generateWeekCalendar(
  forbiddenSectors: Record<Caregiver['id'], Sector['id'][]>,
  calendarOptions: TCalendarOptions = { date: new Date().toISOString(), recurrence: false },
  regenerate = false,
  userId: string,
): Promise<FullAssignment[] | false> {
  try {
    l(0, 'Starting calendar generation');

    const assignments = await calendarGenerator(
      forbiddenSectors,
      calendarOptions,
      regenerate,
      userId,
    );

    l(0, 'Calendar generation completed successfully');
    return assignments;
  } catch (error) {
    l(0, 'Error during calendar generation:', error);
    console.error('Error during calendar generation:', error);
    return false;
  }
}

async function calendarGenerator(
  forbiddenSectors: Record<Caregiver['id'], Sector['id'][]>,
  calendarOptions: TCalendarOptions = { date: new Date().toISOString(), recurrence: false },
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
      const lastWeekDay = new Date(day);
      lastWeekDay.setDate(lastWeekDay.getDate() - 7);
      const branchCaregivers = await prisma.caregiver.findMany({
        include: {
          assignedSectors: true,
          assignments: {
            where: { date: getDate(lastWeekDay) },
            include: { mission: { select: { sector: { select: { id: true } } } } },
          },
        },
        where: {
          active: true,
          branchId: branch.id,
          bigWeekType: bigWeek ? bigWeekType : { not: bigWeekType },
        },
      });

      const caregiversToAssign = [...branchCaregivers].sort(() => Math.random() - 0.5);

      /* Mandatory Missions */
      l(2, `Mandatory missions`);
      for (const sector of branch.sectors) {
        const mandatoryMissions = sector.missions.filter((m) => m.min > 0);

        const eligibleCaregivers = caregiversToAssign.reduce(
          (acc, c) => {
            const caregiverCurrentSector = c.assignedSectors.find(
              (s) => s.sectorId === sector.id && !forbiddenSectors[c.id]?.includes(s.sectorId),
            );

            if (
              caregiverCurrentSector /* &&
              (calendarOptions.recurrence || c.assignedSectors.length === 1) */
            ) {
              acc.push(c);
            }
            return acc;
          },
          [] as typeof branchCaregivers,
        );

        l(3, `Sector : ${sector.name} (${mandatoryMissions.length} missions)`);
        for (const mission of mandatoryMissions) {
          l(4, `Mission : ${mission.name} (min: ${mission.min})`);

          l(5, 'Caregivers to assign:', caregiversToAssign.length);

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

        const eligibleCaregivers = caregiversToAssign.reduce(
          (acc, c) => {
            const caregiverCurrentSector = c.assignedSectors.find(
              (s) => s.sectorId === sector.id && !forbiddenSectors[c.id]?.includes(s.sectorId),
            );

            if (
              caregiverCurrentSector /* &&
              (!calendarOptions.recurrence || c.assignedSectors.length === 1) */
            ) {
              acc.push(c);
            }
            return acc;
          },
          [] as typeof branchCaregivers,
        );

        l(3, `Sector : ${sector.name} (${optionalMissions.length} missions)`);
        for (const mission of optionalMissions) {
          l(4, `Mission : ${mission.name} (max: ${mission.max})`);

          l(5, 'Caregivers to assign:', caregiversToAssign.length);

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
