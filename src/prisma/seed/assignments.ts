import { getDate, getWeekDays, getWeekNumber, isBigWeek } from '@/utils/date';
import { rand } from '@/utils/number';
import { CaregiverBigWeekType, PrismaClient } from '@/generated/client';
import { randomColor } from '@/utils/color';

export async function seedAssignments(prisma: PrismaClient = new PrismaClient()) {
  const refDay = getDate();

  const days = getWeekDays(refDay);

  // const caregivers = await prisma.caregiver.findMany({
  //   where: { active: true },
  //   include: { branch: { include: { sectors: { include: { missions: true } } } } },
  // });
  const branches = await prisma.branch.findMany({
    include: {
      caregivers: { where: { active: true } },
      sectors: { include: { missions: { where: { active: true } } }, where: { active: true } },
    },
    where: { active: true },
  });
  // const missions = await prisma.mission.findMany({ where: { active: true } });

  const bigWeekType =
    getWeekNumber(refDay) % 2 === 0 ? CaregiverBigWeekType.EVEN : CaregiverBigWeekType.ODD;
  for (const day of days) {
    for (const branch of branches) {
      console.group(`Seeding assignments for ${day.toLocaleDateString('fr-FR')}`);
      const bigWeek = isBigWeek(day);

      const workingCaregivers = branch.caregivers.filter((c) =>
        bigWeek ? c.bigWeekType === bigWeekType : c.bigWeekType !== bigWeekType,
      );

      console.log('Available caregivers:', workingCaregivers.length);

      const caregiversToAssign = [...workingCaregivers];

      for (const mission of branch.sectors.flatMap((s) => s.missions)) {
        if (mission.min < 1) continue;

        const assignedCaregivers = caregiversToAssign.splice(
          rand(0, caregiversToAssign.length - mission.min),
          mission.min,
        );
        for (const caregiver of assignedCaregivers) {
          console.log(
            `✅ Assigned ${[caregiver.firstname, caregiver.lastname].join(' ')} to ${mission.name}`,
          );
          await prisma.assignment.create({
            data: {
              caregiverId: caregiver.id,
              missionId: mission.id,
              date: getDate(day),
              color: randomColor(),
            },
          });
        }
      }
      console.log('Leftover caregivers:', caregiversToAssign.length);
      console.groupEnd();
    }
  }
}
